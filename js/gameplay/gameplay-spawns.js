/**
 * Spawn Systems
 * Handles enemy spawning: zombie graveyard spawns, candy oven spawns,
 * dragon candy drops, and associated visual effects.
 */

(function() {
    'use strict';

    // Spawn candy drops from dragon death (candy theme only)
    // Uses seeded random for multiplayer sync - both host and client generate same positions
    function spawnDragonCandyDrops(x, y, z) {
        // Simple seeded random based on dragon position for deterministic generation
        let seed = Math.floor(Math.abs(x * 1000 + z * 7919 + y * 104729)) % 2147483647;
        const seededRandom = () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };
        
        const candyCount = 8 + Math.floor(seededRandom() * 5); // 8-12 pieces
        const candyColors = [0xFF69B4, 0x00FF00, 0xFF4500, 0xFFD700, 0x9400D3, 0x00CED1, 0xFF0000, 0x87CEEB];
        
        for (let i = 0; i < candyCount; i++) {
            const candyGroup = new THREE.Group();
            
            // Seeded random candy type
            const candyType = Math.floor(seededRandom() * 4);
            const candyColor = candyColors[Math.floor(seededRandom() * candyColors.length)];
            
            if (candyType === 0) {
                // Wrapped candy
                const bodyGeometry = new THREE.SphereGeometry(0.4, 8, 8);
                const bodyMaterial = new THREE.MeshPhongMaterial({
                    color: candyColor,
                    emissive: candyColor,
                    emissiveIntensity: 0.2,
                    shininess: 100
                });
                const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                candyGroup.add(body);
                
                // Wrapper ends
                const wrapperGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
                const wrapperMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 80 });
                const wrapper1 = new THREE.Mesh(wrapperGeometry, wrapperMaterial);
                wrapper1.position.set(-0.5, 0, 0);
                wrapper1.rotation.z = Math.PI / 2;
                const wrapper2 = new THREE.Mesh(wrapperGeometry, wrapperMaterial);
                wrapper2.position.set(0.5, 0, 0);
                wrapper2.rotation.z = -Math.PI / 2;
                candyGroup.add(wrapper1);
                candyGroup.add(wrapper2);
            } else if (candyType === 1) {
                // Lollipop
                const candyGeometry = new THREE.SphereGeometry(0.35, 8, 8);
                const candyMaterial = new THREE.MeshPhongMaterial({
                    color: candyColor,
                    emissive: candyColor,
                    emissiveIntensity: 0.2,
                    shininess: 100
                });
                const candy = new THREE.Mesh(candyGeometry, candyMaterial);
                candy.position.y = 0.3;
                candyGroup.add(candy);
                
                const stickGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
                const stickMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
                const stick = new THREE.Mesh(stickGeometry, stickMaterial);
                candyGroup.add(stick);
            } else if (candyType === 2) {
                // Gumdrop
                const gumdropGeometry = new THREE.SphereGeometry(0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
                const gumdropMaterial = new THREE.MeshPhongMaterial({
                    color: candyColor,
                    emissive: candyColor,
                    emissiveIntensity: 0.2,
                    shininess: 80
                });
                const gumdrop = new THREE.Mesh(gumdropGeometry, gumdropMaterial);
                candyGroup.add(gumdrop);
            } else {
                // Candy heart
                const heartShape = new THREE.Shape();
                heartShape.moveTo(0, 0.2);
                heartShape.bezierCurveTo(0, 0.35, -0.2, 0.35, -0.2, 0.2);
                heartShape.bezierCurveTo(-0.2, 0.05, 0, -0.1, 0, -0.25);
                heartShape.bezierCurveTo(0, -0.1, 0.2, 0.05, 0.2, 0.2);
                heartShape.bezierCurveTo(0.2, 0.35, 0, 0.35, 0, 0.2);
                
                const heartGeometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.15, bevelEnabled: false });
                const heartMaterial = new THREE.MeshPhongMaterial({
                    color: candyColor,
                    emissive: candyColor,
                    emissiveIntensity: 0.2,
                    shininess: 100
                });
                const heart = new THREE.Mesh(heartGeometry, heartMaterial);
                heart.scale.setScalar(1.5);
                candyGroup.add(heart);
            }
            
            // Glowing aura
            const auraGeometry = new THREE.RingGeometry(0.5, 0.8, 16);
            const auraMaterial = new THREE.MeshBasicMaterial({
                color: candyColor,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const aura = new THREE.Mesh(auraGeometry, auraMaterial);
            aura.rotation.x = -Math.PI / 2;
            aura.position.y = 0.1;
            candyGroup.add(aura);
            candyGroup.aura = aura;
            
            // Scatter around dragon death position (using seeded random)
            const angle = (i / candyCount) * Math.PI * 2 + seededRandom() * 0.5;
            const radius = 3 + seededRandom() * 8;
            const candyX = x + Math.cos(angle) * radius;
            const candyZ = z + Math.sin(angle) * radius;
            const terrainHeight = getTerrainHeight(candyX, candyZ);
            
            candyGroup.position.set(candyX, terrainHeight + 0.5, candyZ);
            G.scene.add(candyGroup);
            
            G.candyPickups.push({
                mesh: candyGroup,
                collected: false,
                x: candyX,
                z: candyZ,
                bobPhase: i * 0.5
            });
            // Note: G.totalCandy is pre-calculated at level start for candy theme
            // Don't increment here to keep consistent HUD display
        }
    }

    // Zombie ground spawn system for graveyard theme
    function createSpawnedZombie(x, z) {
        const zombieGrp = new THREE.Group();
        
        // ZOMBIE - rotting undead creature rising from ground
        const zombieGreen = 0x4a6040;
        const zombieDark = 0x2a3020;
        const rotColor = 0x3a4030;

        // Zombie body - hunched torso
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: zombieGreen });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.rotation.x = 0.2;
        body.castShadow = true;
        zombieGrp.add(body);

        // Zombie head
        const headGeometry = new THREE.SphereGeometry(0.38, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: zombieGreen });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.05, 1.45, 0.1);
        head.rotation.z = 0.15;
        head.castShadow = true;
        zombieGrp.add(head);

        // Glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.8
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.12, 1.48, 0.32);
        zombieGrp.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.45, 0.32);
        zombieGrp.add(eye2);

        // Gaping mouth
        const mouthGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.1);
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1010 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0.02, 1.32, 0.35);
        zombieGrp.add(mouth);

        // Exposed ribs
        const ribMaterial = new THREE.MeshLambertMaterial({ color: 0xd0c8b0 });
        for (let i = 0; i < 3; i++) {
            const ribGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6);
            const rib = new THREE.Mesh(ribGeometry, ribMaterial);
            rib.position.set(0, 0.6 + i * 0.12, 0.22);
            rib.rotation.z = Math.PI / 2;
            zombieGrp.add(rib);
        }

        // Arms reaching up
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.6, 6);
        const armMaterial = new THREE.MeshLambertMaterial({ color: rotColor });
        const arm1 = new THREE.Mesh(armGeometry, armMaterial);
        arm1.position.set(-0.4, 0.6, 0.15);
        arm1.rotation.z = 0.8;
        arm1.rotation.x = -0.3;
        zombieGrp.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(0.4, 0.55, 0.15);
        arm2.rotation.z = -0.6;
        arm2.rotation.x = -0.4;
        zombieGrp.add(arm2);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 6);
        const leg1 = new THREE.Mesh(legGeometry, armMaterial);
        leg1.position.set(-0.15, 0.25, 0);
        zombieGrp.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, armMaterial);
        leg2.position.set(0.15, 0.25, 0);
        leg2.rotation.x = 0.1;
        zombieGrp.add(leg2);

        // Add dirt particles around the zombie
        const dirtMaterial = new THREE.MeshLambertMaterial({ color: 0x3a3025 });
        for (let i = 0; i < 8; i++) {
            const dirtGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.15);
            const dirt = new THREE.Mesh(dirtGeometry, dirtMaterial);
            const angle = (i / 8) * Math.PI * 2;
            dirt.position.set(
                Math.cos(angle) * 0.8,
                0.05,
                Math.sin(angle) * 0.8
            );
            dirt.rotation.y = Math.random() * Math.PI;
            zombieGrp.add(dirt);
        }

        const terrainHeight = getTerrainHeight(x, z);
        // Spawn zombie directly at terrain height
        zombieGrp.position.set(x, terrainHeight, z);
        G.scene.add(zombieGrp);

        const patrolRange = 5;
        
        return {
            mesh: zombieGrp,
            speed: 0.02 + Math.random() * 0.01, // Slow shambling zombies (0.02-0.03)
            direction: 1,
            patrolLeft: x - patrolRange,
            patrolRight: x + patrolRange,
            alive: true,
            radius: 1.5,
            health: 2,
            maxHealth: 2,
            isChasing: true, // Spawned zombies immediately chase
            initialX: x,
            initialZ: z,
            initialPatrolLeft: x - patrolRange,
            initialPatrolRight: x + patrolRange,
            velocity: { x: 0, z: 0 },
            spawnTime: Date.now()
        };
    }

    function updateZombieSpawns() {
        if (!G.graveyardTheme) return;
        
        // Initialize spawn state if not present
        if (!G.zombieSpawnState) {
            G.zombieSpawnState = {
                lastSpawnTime: Date.now(),
                spawnInterval: 8000, // 8 seconds between spawns
                maxSpawnedZombies: 15, // Max additional zombies
                spawnedCount: 0,
                pendingSpawns: [] // Warning lights before spawns
            };
        }
        
        const state = G.zombieSpawnState;
        const now = Date.now();
        
        // Update pending spawn warning lights (pulsating red glow)
        for (let i = state.pendingSpawns.length - 1; i >= 0; i--) {
            const pending = state.pendingSpawns[i];
            const elapsed = now - pending.startTime;
            
            // Pulsate the light - faster and more intense
            const pulse = Math.sin(elapsed * 0.02) * 0.5 + 0.5; // 0-1 pulsation (faster)
            pending.light.intensity = 3.0 + pulse * 3.0; // 3.0 to 6.0 intensity
            pending.glow.scale.setScalar(1.5 + pulse * 0.8); // Pulsate glow size larger
            pending.glow.material.opacity = 0.5 + pulse * 0.4;
            if (pending.beam) {
                pending.beam.scale.y = 0.8 + pulse * 0.4;
                pending.beam.material.opacity = 0.3 + pulse * 0.3;
            }
            
            // After warning period, spawn the zombie
            if (elapsed >= pending.warningDuration) {
                // Remove warning light and effects
                G.scene.remove(pending.light);
                G.scene.remove(pending.glow);
                pending.glow.geometry.dispose();
                pending.glow.material.dispose();
                if (pending.beam) {
                    G.scene.remove(pending.beam);
                    pending.beam.geometry.dispose();
                    pending.beam.material.dispose();
                }
                
                // Actually spawn the zombie
                const zombie = createSpawnedZombie(pending.x, pending.z);
                zombie.spawnId = pending.spawnId;
                G.goblins.push(zombie);
                
                state.pendingSpawns.splice(i, 1);
            }
        }
        
        // Only host spawns new zombies - client receives them via events
        if (multiplayerManager && multiplayerManager.isConnected() && !multiplayerManager.isHost) {
            return;
        }
        
        // Check if enough time has passed for new spawn
        if (now - state.lastSpawnTime < state.spawnInterval) return;
        if (state.spawnedCount >= state.maxSpawnedZombies) return;
        
        // Find a spawn position near a player
        const player = G.playerGroup;
        const spawnDistance = 15 + Math.random() * 10; // 15-25 units away
        const angle = Math.random() * Math.PI * 2;
        
        let spawnX = player.position.x + Math.cos(angle) * spawnDistance;
        let spawnZ = player.position.z + Math.sin(angle) * spawnDistance;
        
        // Keep within level bounds
        const bounds = G.levelConfig.safeZoneBounds || { minX: -100, maxX: 100, minZ: -200, maxZ: 200 };
        spawnX = Math.max(bounds.minX + 10, Math.min(bounds.maxX - 10, spawnX));
        spawnZ = Math.max(bounds.minZ + 10, Math.min(bounds.maxZ - 10, spawnZ));
        
        // Create warning light first, then spawn zombie after delay
        const spawnId = Date.now() + '_' + Math.random();
        const terrainHeight = getTerrainHeight(spawnX, spawnZ);
        
        // Create pulsating red warning light - bright and high for visibility
        const warningLight = new THREE.PointLight(0xff0000, 4.0, 20);
        warningLight.position.set(spawnX, terrainHeight + 4, spawnZ);
        G.scene.add(warningLight);
        
        // Create glowing ground circle effect - larger and brighter
        const glowGeometry = new THREE.CircleGeometry(2.0, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.set(spawnX, terrainHeight + 0.05, spawnZ);
        glowMesh.rotation.x = -Math.PI / 2;
        G.scene.add(glowMesh);
        
        // Create vertical beam for visibility from distance
        const beamGeometry = new THREE.CylinderGeometry(0.3, 0.8, 6, 8);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.4
        });
        const beamMesh = new THREE.Mesh(beamGeometry, beamMaterial);
        beamMesh.position.set(spawnX, terrainHeight + 3, spawnZ);
        G.scene.add(beamMesh);
        
        state.pendingSpawns.push({
            x: spawnX,
            z: spawnZ,
            spawnId: spawnId,
            light: warningLight,
            glow: glowMesh,
            beam: beamMesh,
            startTime: now,
            warningDuration: 1200 // 1.2 second warning
        });
        
        state.spawnedCount++;
        state.lastSpawnTime = now;
        
        // Send spawn event to client (with warning delay info)
        if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost) {
            multiplayerManager.sendGameEvent('zombieSpawned', {
                x: spawnX,
                z: spawnZ,
                spawnId: spawnId,
                warningDuration: 1200
            });
        }
        
        // Decrease spawn interval slightly for more pressure (min 4 seconds)
        state.spawnInterval = Math.max(4000, state.spawnInterval - 200);
    }

    // Gingerbread oven spawn system for candy theme
    // Note: createOvenEntity is in main-entities.js
    
    function createSpawnedGingerbread(x, z) {
        const gingerbreadGrp = new THREE.Group();
        
        const cookieColor = 0xB5651D;
        const icingWhite = 0xFFFFFF;
        const icingPink = 0xFF69B4;

        // Gingerbread body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.25, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: cookieColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        body.position.y = 1.0;
        body.castShadow = true;
        gingerbreadGrp.add(body);

        // Gingerbread head
        const headGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.rotation.x = Math.PI / 2;
        head.position.y = 1.6;
        head.castShadow = true;
        gingerbreadGrp.add(head);

        // Icing buttons
        const buttonGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8);
        const icingMaterial = new THREE.MeshBasicMaterial({ color: icingWhite });
        for (let i = 0; i < 2; i++) {
            const button = new THREE.Mesh(buttonGeometry, icingMaterial);
            button.rotation.x = Math.PI / 2;
            button.position.set(0, 0.85 + i * 0.2, 0.14);
            gingerbreadGrp.add(button);
        }

        // Icing smile
        const smileGeometry = new THREE.TorusGeometry(0.1, 0.02, 8, 12, Math.PI);
        const smileMaterial = new THREE.MeshBasicMaterial({ color: icingPink });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.5, 0.12);
        smile.rotation.x = -0.2;
        gingerbreadGrp.add(smile);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.1, 1.65, 0.15);
        gingerbreadGrp.add(eye1);
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.1, 1.65, 0.15);
        gingerbreadGrp.add(eye2);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.5, 6);
        const arm1 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm1.position.set(-0.45, 1.1, 0);
        arm1.rotation.z = 0.6;
        gingerbreadGrp.add(arm1);
        const arm2 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm2.position.set(0.45, 1.1, 0);
        arm2.rotation.z = -0.6;
        gingerbreadGrp.add(arm2);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.6, 6);
        const leg1 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg1.position.set(-0.18, 0.4, 0);
        gingerbreadGrp.add(leg1);
        const leg2 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg2.position.set(0.18, 0.4, 0);
        gingerbreadGrp.add(leg2);

        const terrainH = getTerrainHeight(x, z);
        const startY = terrainH - 1.5; // Start below ground
        gingerbreadGrp.position.set(x, startY, z);
        G.scene.add(gingerbreadGrp);

        // Random patrol area
        const patrolW = 8 + Math.random() * 4;
        
        return {
            mesh: gingerbreadGrp,
            speed: (0.012 + Math.random() * 0.004) * speedMultiplier,
            direction: Math.random() > 0.5 ? 1 : -1,
            patrolLeft: x - patrolW,
            patrolRight: x + patrolW,
            alive: true,
            radius: 1.2,
            health: 3,
            maxHealth: 3,
            isGoblin: true,
            isChasing: true,  // Immediately chase player when spawned from oven
            initialX: x,
            initialZ: z,
            initialPatrolLeft: x - patrolW,
            initialPatrolRight: x + patrolW,
            // Rising animation
            isRising: true,
            targetY: terrainH,
            riseSpeed: 0.04,
            spawnTime: Date.now(),
            isOvenSpawned: true,
            // Guardian properties for shooting arrows
            isGuardian: true,
            lastFireTime: Date.now() - Math.random() * 4000
        };
    }
    
    function createSmokeParticle(oven) {
        const smokeGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 8, 8);
        const smokeMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.6
        });
        const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
        
        // Start at chimney top with slight random offset
        smoke.position.set(
            oven.x + (Math.random() - 0.5) * 0.3,
            getTerrainHeight(oven.x, oven.z) + 5.2,
            oven.z - 0.5 + (Math.random() - 0.5) * 0.3
        );
        
        G.scene.add(smoke);
        
        return {
            mesh: smoke,
            velocity: {
                x: (Math.random() - 0.5) * 0.02,
                y: 0.03 + Math.random() * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            life: 1.0, // Starts at full life
            decay: 0.008 + Math.random() * 0.005
        };
    }
    
    function updateOvenSpawns() {
        if (!G.candyTheme) return;
        if (!G.ovens) return;
        
        // Initialize spawn state if not present
        if (!G.ovenSpawnState) {
            G.ovenSpawnState = {
                spawnInterval: 12000, // 12 seconds between spawns per oven
                maxSpawnedGingerbreads: 10,
                spawnedCount: 0,
                risingGingerbreads: []
            };
        }
        
        const state = G.ovenSpawnState;
        const now = Date.now();
        
        // Update rising gingerbreads
        for (let i = state.risingGingerbreads.length - 1; i >= 0; i--) {
            const gb = state.risingGingerbreads[i];
            if (gb.isRising) {
                gb.mesh.position.y += gb.riseSpeed;
                // Wobble as it rises (like coming out of oven)
                gb.mesh.rotation.y = Math.sin(now * 0.01) * 0.2;
                
                if (gb.mesh.position.y >= gb.targetY) {
                    gb.mesh.position.y = gb.targetY;
                    gb.mesh.rotation.y = 0;
                    gb.isRising = false;
                    state.risingGingerbreads.splice(i, 1);
                }
            }
        }
        
        // Update smoke particles for all ovens
        G.ovens.forEach(oven => {
            // Spawn new smoke particles regularly
            if (now - oven.lastSmokeTime > 200) { // Every 200ms
                const particle = createSmokeParticle(oven);
                oven.smokeParticles.push(particle);
                oven.lastSmokeTime = now;
            }
            
            // Update smoke particles
            for (let i = oven.smokeParticles.length - 1; i >= 0; i--) {
                const particle = oven.smokeParticles[i];
                
                // Move particle
                particle.mesh.position.x += particle.velocity.x;
                particle.mesh.position.y += particle.velocity.y;
                particle.mesh.position.z += particle.velocity.z;
                
                // Fade out
                particle.life -= particle.decay;
                particle.mesh.material.opacity = particle.life * 0.6;
                particle.mesh.scale.setScalar(1 + (1 - particle.life) * 0.5); // Grow as it rises
                
                // Remove dead particles
                if (particle.life <= 0) {
                    G.scene.remove(particle.mesh);
                    particle.mesh.geometry.dispose();
                    particle.mesh.material.dispose();
                    oven.smokeParticles.splice(i, 1);
                }
            }
            
            // Animate fire glow
            if (oven.fireLight) {
                oven.fireLight.intensity = 0.6 + Math.sin(now * 0.005) * 0.3;
            }
        });
        
        // Only host spawns new gingerbreads
        if (multiplayerManager && multiplayerManager.isConnected() && !multiplayerManager.isHost) {
            return;
        }
        
        // Check each oven for spawning
        G.ovens.forEach(oven => {
            if (now - oven.lastSpawnTime < state.spawnInterval) return;
            if (state.spawnedCount >= state.maxSpawnedGingerbreads) return;
            
            // Spawn in front of the oven
            const spawnX = oven.x + (Math.random() - 0.5) * 2;
            const spawnZ = oven.z + 3 + Math.random() * 2;
            
            const gingerbread = createSpawnedGingerbread(spawnX, spawnZ);
            gingerbread.spawnId = Date.now() + '_' + Math.random();
            G.goblins.push(gingerbread);
            state.risingGingerbreads.push(gingerbread);
            state.spawnedCount++;
            oven.lastSpawnTime = now;
            
            // Send spawn event to client
            if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost) {
                multiplayerManager.sendGameEvent('gingerbreadSpawned', {
                    x: spawnX,
                    z: spawnZ,
                    spawnId: gingerbread.spawnId,
                    speed: gingerbread.speed,
                    targetY: gingerbread.targetY
                });
            }
        });
        
        // Gradually decrease spawn interval (min 6 seconds)
        state.spawnInterval = Math.max(6000, state.spawnInterval - 100);
    }

    // Export functions to global scope
    window.spawnDragonCandyDrops = spawnDragonCandyDrops;
    window.createSpawnedZombie = createSpawnedZombie;
    window.updateZombieSpawns = updateZombieSpawns;
    window.createSpawnedGingerbread = createSpawnedGingerbread;
    window.createSmokeParticle = createSmokeParticle;
    window.updateOvenSpawns = updateOvenSpawns;
})();
