// main-gameplay.js - Combat, updates, and collisions

    // Helper function to get the nearest player target for enemies (works with both network multiplayer and native splitscreen)
    function getNearestPlayerTarget(fromX, fromZ) {
        let targetPlayer = G.playerGroup;
        let closestDist = Math.sqrt(
            Math.pow(G.playerGroup.position.x - fromX, 2) +
            Math.pow(G.playerGroup.position.z - fromZ, 2)
        );
        let targetInIceBerg = G.iceBerg ? Math.sqrt(
            Math.pow(G.playerGroup.position.x - G.iceBerg.position.x, 2) +
            Math.pow(G.playerGroup.position.z - G.iceBerg.position.z, 2)
        ) < G.iceBerg.radius : false;
        
        // Check native splitscreen player 2
        if (isNativeSplitscreen && G.player2Group) {
            const distToP2 = Math.sqrt(
                Math.pow(G.player2Group.position.x - fromX, 2) +
                Math.pow(G.player2Group.position.z - fromZ, 2)
            );
            const p2InIceBerg = G.iceBerg ? Math.sqrt(
                Math.pow(G.player2Group.position.x - G.iceBerg.position.x, 2) +
                Math.pow(G.player2Group.position.z - G.iceBerg.position.z, 2)
            ) < G.iceBerg.radius : false;
            
            // Choose closer player not in ice berg
            if (!p2InIceBerg && (targetInIceBerg || distToP2 < closestDist)) {
                targetPlayer = G.player2Group;
                closestDist = distToP2;
                targetInIceBerg = p2InIceBerg;
            }
        }
        
        // Check network multiplayer other player
        if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh && otherPlayerMesh.visible) {
            const distToOther = Math.sqrt(
                Math.pow(otherPlayerMesh.position.x - fromX, 2) +
                Math.pow(otherPlayerMesh.position.z - fromZ, 2)
            );
            const otherInIceBerg = G.iceBerg ? Math.sqrt(
                Math.pow(otherPlayerMesh.position.x - G.iceBerg.position.x, 2) +
                Math.pow(otherPlayerMesh.position.z - G.iceBerg.position.z, 2)
            ) < G.iceBerg.radius : false;
            
            if (!otherInIceBerg && (targetInIceBerg || distToOther < closestDist)) {
                targetPlayer = otherPlayerMesh;
                closestDist = distToOther;
                targetInIceBerg = otherInIceBerg;
            }
        }
        
        return { target: targetPlayer, distance: closestDist, inIceBerg: targetInIceBerg };
    }

    function createExplosion(x, y, z) {
        Audio.playExplosionSound();
        
        const particles = [];
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            // Clone pre-cached material to avoid texture loading glitches
            const spriteMaterial = G.explosionBaseMaterial.clone();
            const particle = new THREE.Sprite(spriteMaterial);
            const size = 0.2 + Math.random() * 0.25;
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            
            G.scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 30, initialScale: size });
        }
        
        G.explosions.push(...particles);
    }

    // Fireball impact explosion (medium size with smoke and scorch)
    function createFireballExplosion(x, y, z) {
        Audio.playExplosionSound();
        
        const particles = [];
        const particleCount = 40;
        
        for (let i = 0; i < particleCount; i++) {
            const size = 0.5 + Math.random() * 0.8;
            // Clone pre-cached material to avoid texture loading glitches
            const spriteMaterial = G.explosionBaseMaterial.clone();
            const particle = new THREE.Sprite(spriteMaterial);
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const speed = 0.2 + Math.random() * 0.5;
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed * 0.6,
                (Math.random() - 0.5) * speed
            );
            
            G.scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 35, initialScale: size });
        }
        
        G.explosions.push(...particles);
        
        // Add smoke and scorch
        createSmokeCloud(x, y + 0.5, z, 0.8);
        createScorchMark(x, z, 2.5);
    }

    // Big bomb explosion helper
    function createBombExplosion(x, y, z) {
        Audio.playBombExplosionSound();
        
        const particles = [];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const size = 1.0 + Math.random() * 1.5;
            
            // Mix of fire glow and smoke - clone pre-cached materials
            let useSmokeColor = Math.random() < 0.12;
            const spriteMaterial = useSmokeColor 
                ? G.smokeBaseMaterial.clone()
                : G.explosionBaseMaterial.clone();
            const particle = new THREE.Sprite(spriteMaterial);
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const speed = 0.3 + Math.random() * 0.8;
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed * 0.8,
                (Math.random() - 0.5) * speed
            );
            
            G.scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 45, initialScale: size });
        }
        
        G.explosions.push(...particles);
        
        // Add lingering smoke cloud
        createSmokeCloud(x, y + 1, z, 1.5);
        
        // Add scorch mark on ground
        createScorchMark(x, z, 5);
    }

    // Massive dragon death explosion
    function createDragonExplosion(x, y, z) {
        Audio.playBombExplosionSound();
        
        const particles = [];
        const particleCount = 180; // Way more particles
        
        for (let i = 0; i < particleCount; i++) {
            const size = 1.5 + Math.random() * 2.5; // Much bigger glowing sprites
            
            // Clone pre-cached material to avoid texture loading glitches
            const spriteMaterial = G.explosionBaseMaterial.clone();
            const particle = new THREE.Sprite(spriteMaterial);
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const speed = 0.5 + Math.random() * 1.2; // Much faster
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed,
                (Math.random() - 0.5) * speed
            );
            
            G.scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 60, initialScale: size }); // Longer life
        }
        
        G.explosions.push(...particles);
    }

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
            G.totalCandy++;
        }
    }

    // Create lingering smoke cloud
    function createSmokeCloud(x, y, z, intensity = 1.0) {
        const smokeCount = Math.floor(8 * intensity);
        
        for (let i = 0; i < smokeCount; i++) {
            // Clone pre-cached material and adjust opacity
            const smokeMaterial = G.smokeBaseMaterial.clone();
            smokeMaterial.opacity = 0.5 + Math.random() * 0.3;
            const smoke = new THREE.Sprite(smokeMaterial);
            const size = (1.5 + Math.random() * 2.0) * intensity;
            smoke.scale.set(size, size, 1);
            
            // Position with some spread
            smoke.position.set(
                x + (Math.random() - 0.5) * 2 * intensity,
                y + Math.random() * 1.5,
                z + (Math.random() - 0.5) * 2 * intensity
            );
            
            G.scene.add(smoke);
            G.smokeParticles.push({
                mesh: smoke,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    0.01 + Math.random() * 0.02,  // Slowly rise
                    (Math.random() - 0.5) * 0.02
                ),
                life: 150 + Math.random() * 100,  // Long life (2.5-4 seconds)
                initialOpacity: smoke.material.opacity,
                initialScale: size
            });
        }
    }

    // Create scorch mark on the ground
    function createScorchMark(x, z, size = 3) {
        const textures = getTerrainTextures(THREE);
        const terrainHeight = getTerrainHeight(x, z);
        
        const scorchGeometry = new THREE.PlaneGeometry(size, size);
        const scorchMaterial = new THREE.MeshBasicMaterial({
            map: textures.scorch,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });
        const scorch = new THREE.Mesh(scorchGeometry, scorchMaterial);
        scorch.rotation.x = -Math.PI / 2;  // Lay flat on ground
        scorch.rotation.z = Math.random() * Math.PI * 2;  // Random rotation
        scorch.position.set(x, terrainHeight + 0.02, z);  // Slightly above ground
        
        G.scene.add(scorch);
        G.scorchMarks.push({
            mesh: scorch,
            life: 600 + Math.random() * 300,  // 10-15 seconds
            initialOpacity: 0.8
        });
    }

    // Update smoke particles
    function updateSmoke() {
        for (let i = G.smokeParticles.length - 1; i >= 0; i--) {
            const smoke = G.smokeParticles[i];
            smoke.mesh.position.add(smoke.velocity);
            smoke.life--;
            
            // Fade out and expand
            const lifeRatio = smoke.life / 200;
            smoke.mesh.material.opacity = smoke.initialOpacity * Math.min(1, lifeRatio * 1.5);
            // Expand slightly as it rises
            const expandFactor = 1 + (1 - lifeRatio) * 0.5;
            smoke.mesh.scale.set(
                smoke.initialScale * expandFactor,
                smoke.initialScale * expandFactor,
                1
            );
            
            if (smoke.life <= 0) {
                G.scene.remove(smoke.mesh);
                G.smokeParticles.splice(i, 1);
            }
        }
    }

    // Update scorch marks (fade over time)
    function updateScorchMarks() {
        for (let i = G.scorchMarks.length - 1; i >= 0; i--) {
            const scorch = G.scorchMarks[i];
            scorch.life--;
            
            // Start fading in the last 200 frames
            if (scorch.life < 200) {
                scorch.mesh.material.opacity = scorch.initialOpacity * (scorch.life / 200);
            }
            
            if (scorch.life <= 0) {
                G.scene.remove(scorch.mesh);
                G.scorchMarks.splice(i, 1);
            }
        }
    }

    // Shoot bullet
    function shootBullet() {
        if (gameWon) return;
        
        if (G.ammo <= 0 && !godMode) {
            Audio.playEmptyGunSound();
            return;
        }
        
        Audio.playShootSound();
        
        const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const bulletColor = G.isHost ? 0xFF69B4 : 0x4169E1; // Pink for girl, Blue for boy
        const bulletMaterial = new THREE.MeshLambertMaterial({ color: bulletColor });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bulletMesh.position.copy(G.playerGroup.position);
        bulletMesh.position.y = 1;
        bulletMesh.castShadow = true;
        G.scene.add(bulletMesh);
        
        const direction = new THREE.Vector3(
            Math.sin(G.player.rotation),
            0,
            Math.cos(G.player.rotation)
        );
        
        const bullet = {
            mesh: bulletMesh,
            velocity: direction.multiplyScalar(0.5),
            radius: 0.2,
            startPos: { x: G.playerGroup.position.x, z: G.playerGroup.position.z }
        };
        G.bullets.push(bullet);
        if (!godMode) G.ammo--;
        
        // Sync bullet to other player
        if (multiplayerManager && multiplayerManager.isConnected()) {
            multiplayerManager.sendBullet({
                position: { x: bulletMesh.position.x, y: bulletMesh.position.y, z: bulletMesh.position.z },
                velocity: { x: bullet.velocity.x, y: bullet.velocity.y, z: bullet.velocity.z },
                startPos: bullet.startPos
            });
        }
    }

    // Create bullet from remote player
    function createRemoteBullet(bulletData) {
        // Play shooting sound
        Audio.playShootSound();
        
        const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const remoteBulletColor = G.isHost ? 0x4169E1 : 0xFF69B4; // Blue for boy's G.bullets, Pink for girl's G.bullets
        const bulletMaterial = new THREE.MeshLambertMaterial({ color: remoteBulletColor });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bulletMesh.position.set(bulletData.position.x, bulletData.position.y, bulletData.position.z);
        bulletMesh.castShadow = true;
        G.scene.add(bulletMesh);
        
        const bullet = {
            mesh: bulletMesh,
            velocity: new THREE.Vector3(bulletData.velocity.x, bulletData.velocity.y, bulletData.velocity.z),
            radius: 0.2,
            startPos: bulletData.startPos,
            isRemote: true // Mark as remote to differentiate
        };
        G.bullets.push(bullet);
    }
    
    // Create freeze particle effect on an NPC
    function createFreezeEffect(x, y, z) {
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: 0xAAFFFF,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geometry, material);
            
            // Random position around the NPC
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.5 + Math.random() * 0.5;
            particle.position.set(
                x + Math.cos(angle) * radius,
                y + 0.5 + Math.random() * 1.5,
                z + Math.sin(angle) * radius
            );
            
            G.scene.add(particle);
            particles.push({
                mesh: particle,
                life: 30,
                velocity: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: Math.random() * 0.05,
                    z: (Math.random() - 0.5) * 0.02
                }
            });
        }
        
        // Animate particles
        let frame = 0;
        const animateInterval = setInterval(() => {
            frame++;
            particles.forEach(p => {
                p.mesh.position.x += p.velocity.x;
                p.mesh.position.y += p.velocity.y;
                p.mesh.position.z += p.velocity.z;
                p.mesh.material.opacity = 0.8 * (1 - frame / p.life);
            });
            
            if (frame >= 30) {
                clearInterval(animateInterval);
                particles.forEach(p => G.scene.remove(p.mesh));
            }
        }, 16);
    }
    
    // Ice power activation
    function activateIcePower() {
        if (gameWon || gameDead || !G.hasIcePower) return;
        
        const now = Date.now();
        if (now - G.lastIcePowerTime < G.icePowerCooldown) return; // Cooldown not ready
        
        G.lastIcePowerTime = now;
        
        console.log('Activating ice power, isHost:', multiplayerManager ? multiplayerManager.isHost : 'no multiplayer');
        
        Audio.playIcePowerSound();
        
        const freezeRadius = 20;
        const playerPos = G.playerGroup.position;
        
        // Create visual effect - expanding blue circle
        const circleGeometry = new THREE.RingGeometry(0.1, freezeRadius, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00BFFF,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.rotation.x = -Math.PI / 2;
        circle.position.set(playerPos.x, 2.0, playerPos.z);
        G.scene.add(circle);
        
        // Animate circle expansion and fade
        let expansion = 0;
        const expandInterval = setInterval(() => {
            expansion += 0.05;
            circle.scale.set(expansion, expansion, 1);
            circle.material.opacity = 0.6 * (1 - expansion);
            
            if (expansion >= 1) {
                clearInterval(expandInterval);
                G.scene.remove(circle);
            }
        }, 16);
        
        // Freeze all NPCs in radius
        const freezeDuration = 5000; // 5 seconds
        
        // Freeze goblins
        G.goblins.forEach(gob => {
            if (gob.alive) {
                const dist = Math.sqrt(
                    (gob.mesh.position.x - playerPos.x) ** 2 +
                    (gob.mesh.position.z - playerPos.z) ** 2
                );
                if (dist <= freezeRadius) {
                    gob.frozen = true;
                    gob.frozenUntil = now + freezeDuration;
                    // Apply blue tint
                    gob.mesh.children.forEach(child => {
                        if (child.material && child.material.emissive !== undefined) {
                            child.material.emissive = new THREE.Color(0x0088FF);
                            child.material.emissiveIntensity = 0.5;
                        }
                    });
                    // Create freeze particle effect
                    createFreezeEffect(gob.mesh.position.x, gob.mesh.position.y, gob.mesh.position.z);
                }
            }
        });
        
        // Freeze birds
        G.birds.forEach(bird => {
            const birdDist = Math.sqrt(
                (bird.mesh.position.x - playerPos.x) ** 2 +
                (bird.mesh.position.z - playerPos.z) ** 2
            );
            if (birdDist <= freezeRadius) {
                bird.frozen = true;
                bird.frozenUntil = now + freezeDuration;
                // Apply blue tint to bird
                bird.mesh.children.forEach(child => {
                    if (child.material && child.material.emissive !== undefined) {
                        child.material.emissive = new THREE.Color(0x0088FF);
                        child.material.emissiveIntensity = 0.5;
                    }
                });
                // Create freeze particle effect
                createFreezeEffect(bird.mesh.position.x, bird.mesh.position.y, bird.mesh.position.z);
            }
        });
        
        // Freeze dragon (can still move and damage, just can't fire)
        // Use larger radius for dragon since it's a big boss
        if (G.dragon && G.dragon.alive) {
            const dist = Math.sqrt(
                (G.dragon.mesh.position.x - playerPos.x) ** 2 +
                (G.dragon.mesh.position.z - playerPos.z) ** 2
            );
            if (dist <= freezeRadius + 15) { // Extra 15 units for G.dragon's size
                G.dragon.frozen = true;
                G.dragon.frozenUntil = now + freezeDuration;
                // Apply blue tint to dragon
                G.dragon.mesh.children.forEach(child => {
                    if (child.material && child.material.emissive !== undefined) {
                        child.material.emissive = new THREE.Color(0x0088FF);
                        child.material.emissiveIntensity = 0.5;
                    }
                });
                createFreezeEffect(G.dragon.mesh.position.x, G.dragon.mesh.position.y + 5, G.dragon.mesh.position.z);
            }
        }
        
        // Freeze extra dragons
        G.extraDragons.forEach(extraDragon => {
            if (!extraDragon.alive) return;
            const dist = Math.sqrt(
                (extraDragon.mesh.position.x - playerPos.x) ** 2 +
                (extraDragon.mesh.position.z - playerPos.z) ** 2
            );
            const extraRadius = freezeRadius + 10 * (extraDragon.scale || 1); // Smaller bonus for smaller dragons
            if (dist <= extraRadius) {
                extraDragon.frozen = true;
                extraDragon.frozenUntil = now + freezeDuration;
                // Apply blue tint
                extraDragon.mesh.children.forEach(child => {
                    if (child.material && child.material.emissive !== undefined) {
                        child.material.emissive = new THREE.Color(0x0088FF);
                        child.material.emissiveIntensity = 0.5;
                    }
                });
                createFreezeEffect(extraDragon.mesh.position.x, extraDragon.mesh.position.y + 3, extraDragon.mesh.position.z);
            }
        });
        
        // Send ice power activation to other player in multiplayer
        if (multiplayerManager && multiplayerManager.isConnected()) {
            multiplayerManager.sendGameEvent('icePowerActivated', {
                x: playerPos.x,
                y: playerPos.y,
                z: playerPos.z,
                isHost: multiplayerManager.isHost
            });
        }
    }

    // Place banana trap
    function placeBanana() {
        if (G.bananaInventory <= 0) return;
        
        G.bananaInventory--;
        
        // Create banana mesh
        const bananaGroup = new THREE.Group();
        
        // Banana body (curved cylinder)
        const bananaGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
        const bananaMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.3
        });
        const bananaMesh = new THREE.Mesh(bananaGeometry, bananaMaterial);
        bananaMesh.rotation.z = Math.PI / 6; // Slight curve
        bananaMesh.castShadow = true;
        bananaGroup.add(bananaMesh);
        
        // Banana ends (darker)
        const endMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7500 });
        const endGeometry = new THREE.SphereGeometry(0.35, 8, 8);
        const end1 = new THREE.Mesh(endGeometry, endMaterial);
        end1.position.y = 0.7;
        end1.scale.set(0.8, 1, 0.8);
        bananaGroup.add(end1);
        
        const end2 = new THREE.Mesh(endGeometry, endMaterial);
        end2.position.y = -0.7;
        end2.scale.set(0.8, 1, 0.8);
        bananaGroup.add(end2);
        
        // Position 3 units in front of the player based on their rotation
        const placeDistance = 3;
        const bananaX = G.playerGroup.position.x + Math.sin(G.player.rotation) * placeDistance;
        const bananaZ = G.playerGroup.position.z + Math.cos(G.player.rotation) * placeDistance;
        const terrainHeight = getTerrainHeight(bananaX, bananaZ);
        bananaGroup.position.set(bananaX, terrainHeight + 0.5, bananaZ);
        G.scene.add(bananaGroup);
        
        const bananaId = Date.now() + Math.random(); // Unique ID
        G.placedBananas.push({
            id: bananaId,
            mesh: bananaGroup,
            x: bananaX,
            z: bananaZ,
            radius: 1.2
        });
        
        Audio.playCollectSound();
        
        // Notify other player in multiplayer
        if (multiplayerManager && multiplayerManager.isConnected()) {
            multiplayerManager.sendGameEvent('bananaPlaced', {
                id: bananaId,
                x: bananaX,
                z: bananaZ
            });
        }
    }
    
    function placeBomb() {
        if (G.bombInventory <= 0) return;
        
        const bombId = Date.now() + Math.random();
        G.bombInventory--;
        
        // Create bomb mesh
        const bombGroup = new THREE.Group();
        
        // Main sphere (black bomb)
        const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        bombGroup.add(sphere);
        
        // Fuse
        const fuseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
        const fuseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.4;
        bombGroup.add(fuse);
        
        // Animated spark
        const sparkGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 1.0
        });
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.y = 0.55;
        bombGroup.add(spark);
        
        // Start position at player, throw to 6 units in front
        const throwDistance = 6;
        const targetX = G.playerGroup.position.x + Math.sin(G.player.rotation) * throwDistance;
        const targetZ = G.playerGroup.position.z + Math.cos(G.player.rotation) * throwDistance;
        const targetTerrainHeight = getTerrainHeight(targetX, targetZ);
        
        // Start at player position
        bombGroup.position.set(
            G.playerGroup.position.x,
            G.playerGroup.position.y + 1.5, // Start at chest height
            G.playerGroup.position.z
        );
        G.scene.add(bombGroup);
        
        // Animate throw (arc motion)
        const throwDuration = 400; // 400ms throw animation
        const startTime = Date.now();
        const startY = bombGroup.position.y;
        const throwHeight = 3; // Arc height
        
        const throwInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / throwDuration, 1);
            
            if (progress >= 1) {
                clearInterval(throwInterval);
                bombGroup.position.set(targetX, targetTerrainHeight + 0.4, targetZ);
            } else {
                // Linear horizontal movement
                bombGroup.position.x = G.playerGroup.position.x + (targetX - G.playerGroup.position.x) * progress;
                bombGroup.position.z = G.playerGroup.position.z + (targetZ - G.playerGroup.position.z) * progress;
                
                // Parabolic arc for vertical movement
                const arcProgress = Math.sin(progress * Math.PI);
                bombGroup.position.y = startY + arcProgress * throwHeight - (progress * (startY - targetTerrainHeight - 0.4));
            }
        }, 16);
        
        const explodeAt = Date.now() + 3000; // 3 seconds
        G.placedBombs.push({
            id: bombId,
            mesh: bombGroup,
            x: targetX,
            z: targetZ,
            radius: 12, // Explosion radius
            explodeAt: explodeAt,
            spark: spark // For animation
        });
        
        Audio.playCollectSound();
        
        // Notify other player in multiplayer
        if (multiplayerManager && multiplayerManager.isConnected()) {
            multiplayerManager.sendGameEvent('bombPlaced', {
                id: bombId,
                x: targetX,
                z: targetZ,
                explodeAt: explodeAt
            });
        }
    }
    
    // Place Herz-Man turret
    let lastHerzmanPlaceTime = 0;
    const HERZMAN_PLACE_COOLDOWN = 500; // 500ms debounce
    
    function placeHerzman() {
        const now = Date.now();
        if (now - lastHerzmanPlaceTime < HERZMAN_PLACE_COOLDOWN) return;
        if (G.herzmanInventory <= 0) return;
        
        lastHerzmanPlaceTime = now;
        
        G.herzmanInventory--;
        
        const herzmanId = Date.now() + Math.random();
        const herzmanGroup = createHerzmanMesh();
        
        // Position 4 units in front of the player
        const placeDistance = 4;
        const herzmanX = G.playerGroup.position.x + Math.sin(G.player.rotation) * placeDistance;
        const herzmanZ = G.playerGroup.position.z + Math.cos(G.player.rotation) * placeDistance;
        const terrainHeight = getTerrainHeight(herzmanX, herzmanZ);
        herzmanGroup.position.set(herzmanX, terrainHeight, herzmanZ);
        G.scene.add(herzmanGroup);
        
        G.placedHerzmen.push({
            id: herzmanId,
            mesh: herzmanGroup,
            x: herzmanX,
            z: herzmanZ,
            lastFireTime: 0,
            targetAngle: 0, // For smooth rotation towards target
            placedAt: Date.now() // Track when placed for lifetime
        });
        
        Audio.playCollectSound();
        
        // Notify other player in multiplayer
        if (multiplayerManager && multiplayerManager.isConnected()) {
            multiplayerManager.sendGameEvent('herzmanPlaced', {
                id: herzmanId,
                x: herzmanX,
                z: herzmanZ
            });
        }
    }
    
    // Helper function to place banana at specific coordinates (for splitscreen player 2)
    function placeBananaAt(bananaX, bananaZ) {
        const bananaGroup = new THREE.Group();
        
        const bananaGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
        const bananaMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.3
        });
        const bananaMesh = new THREE.Mesh(bananaGeometry, bananaMaterial);
        bananaMesh.rotation.z = Math.PI / 6;
        bananaMesh.castShadow = true;
        bananaGroup.add(bananaMesh);
        
        const endMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7500 });
        const endGeometry = new THREE.SphereGeometry(0.35, 8, 8);
        const end1 = new THREE.Mesh(endGeometry, endMaterial);
        end1.position.y = 0.7;
        end1.scale.set(0.8, 1, 0.8);
        bananaGroup.add(end1);
        
        const end2 = new THREE.Mesh(endGeometry, endMaterial);
        end2.position.y = -0.7;
        end2.scale.set(0.8, 1, 0.8);
        bananaGroup.add(end2);
        
        const terrainHeight = getTerrainHeight(bananaX, bananaZ);
        bananaGroup.position.set(bananaX, terrainHeight + 0.5, bananaZ);
        G.scene.add(bananaGroup);
        
        const bananaId = Date.now() + Math.random();
        G.placedBananas.push({
            id: bananaId,
            mesh: bananaGroup,
            x: bananaX,
            z: bananaZ,
            radius: 1.2
        });
        
        Audio.playCollectSound();
    }
    
    // Helper function to place bomb at specific coordinates (for splitscreen player 2)
    function placeBombAt(targetX, targetZ) {
        const bombId = Date.now() + Math.random();
        
        const bombGroup = new THREE.Group();
        
        const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        bombGroup.add(sphere);
        
        const fuseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
        const fuseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.4;
        bombGroup.add(fuse);
        
        const sparkGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 1.0
        });
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.y = 0.55;
        bombGroup.add(spark);
        
        const targetTerrainHeight = getTerrainHeight(targetX, targetZ);
        bombGroup.position.set(targetX, targetTerrainHeight + 0.4, targetZ);
        G.scene.add(bombGroup);
        
        const explodeAt = Date.now() + 3000;
        G.placedBombs.push({
            id: bombId,
            mesh: bombGroup,
            x: targetX,
            z: targetZ,
            radius: 12,
            explodeAt: explodeAt,
            spark: spark
        });
        
        Audio.playCollectSound();
    }
    
    // Helper function to place Herz-Man at specific coordinates (for splitscreen player 2)
    function placeHerzmanAt(herzmanX, herzmanZ) {
        const herzmanId = Date.now() + Math.random();
        const herzmanGroup = createHerzmanMesh();
        
        const terrainHeight = getTerrainHeight(herzmanX, herzmanZ);
        herzmanGroup.position.set(herzmanX, terrainHeight, herzmanZ);
        G.scene.add(herzmanGroup);
        
        G.placedHerzmen.push({
            id: herzmanId,
            mesh: herzmanGroup,
            x: herzmanX,
            z: herzmanZ,
            lastFireTime: 0,
            targetAngle: 0,
            placedAt: Date.now()
        });
        
        Audio.playCollectSound();
    }
    
    // Create Herz-Man mesh (big heart with arms, legs, and face)
    function createHerzmanMesh() {
        const herzmanGroup = new THREE.Group();
        
        // Base platform (cute pink pedestal)
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.2, 16);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.1;
        base.castShadow = true;
        herzmanGroup.add(base);
        
        // Main heart body using 3D shape
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.4);
        heartShape.bezierCurveTo(0, 0.5, -0.1, 0.6, -0.3, 0.6);
        heartShape.bezierCurveTo(-0.5, 0.6, -0.5, 0.3, -0.5, 0.3);
        heartShape.bezierCurveTo(-0.5, 0.1, -0.3, -0.1, 0, -0.3);
        heartShape.bezierCurveTo(0.3, -0.1, 0.5, 0.1, 0.5, 0.3);
        heartShape.bezierCurveTo(0.5, 0.3, 0.5, 0.6, 0.3, 0.6);
        heartShape.bezierCurveTo(0.1, 0.6, 0, 0.5, 0, 0.4);
        
        const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.08, bevelThickness: 0.08 };
        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        const heartMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF1493, // Deep pink
            emissive: 0xFF1493,
            emissiveIntensity: 0.2
        });
        const heartBody = new THREE.Mesh(heartGeometry, heartMaterial);
        heartBody.position.set(0, 1.0, -0.2);
        heartBody.scale.set(1.8, 1.8, 1.8);
        heartBody.castShadow = true;
        herzmanGroup.add(heartBody);
        herzmanGroup.heartMesh = heartBody; // Store reference for animation
        
        // Face on the heart - positioned in front of the heart body
        // Eyes (cute round eyes)
        const eyeGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const eyeLeft = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        eyeLeft.position.set(-0.25, 1.35, 0.65);
        herzmanGroup.add(eyeLeft);
        
        const eyeRight = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        eyeRight.position.set(0.25, 1.35, 0.65);
        herzmanGroup.add(eyeRight);
        
        // Pupils
        const pupilGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const pupilLeft = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupilLeft.position.set(-0.25, 1.35, 0.76);
        herzmanGroup.add(pupilLeft);
        
        const pupilRight = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupilRight.position.set(0.25, 1.35, 0.76);
        herzmanGroup.add(pupilRight);
        
        // Eye sparkles
        const sparkleGeometry = new THREE.SphereGeometry(0.03, 4, 4);
        const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const sparkle1 = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        sparkle1.position.set(-0.22, 1.4, 0.8);
        herzmanGroup.add(sparkle1);
        const sparkle2 = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        sparkle2.position.set(0.28, 1.4, 0.8);
        herzmanGroup.add(sparkle2);
        
        // Cute blush cheeks
        const blushGeometry = new THREE.CircleGeometry(0.1, 12);
        const blushMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF6B6B, 
            transparent: true, 
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const blush1 = new THREE.Mesh(blushGeometry, blushMaterial);
        blush1.position.set(-0.45, 1.15, 0.6);
        blush1.rotation.y = -0.3;
        herzmanGroup.add(blush1);
        
        const blush2 = new THREE.Mesh(blushGeometry, blushMaterial);
        blush2.position.set(0.45, 1.15, 0.6);
        blush2.rotation.y = 0.3;
        herzmanGroup.add(blush2);
        
        // Happy smile (wider arc)
        const smileGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI);
        const smileMaterial = new THREE.MeshBasicMaterial({ color: 0x8B0000 });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.05, 0.7);
        smile.rotation.x = Math.PI;
        herzmanGroup.add(smile);
        
        // Arms (stubby cute arms) - using cylinder with spheres at ends
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
        
        // Left arm (cylinder + sphere ends)
        const leftArmGroup = new THREE.Group();
        const leftArmCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8), armMaterial);
        leftArmCyl.rotation.z = Math.PI / 2;
        leftArmGroup.add(leftArmCyl);
        const leftArmEnd1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), armMaterial);
        leftArmEnd1.position.x = -0.15;
        leftArmGroup.add(leftArmEnd1);
        const leftArmEnd2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), armMaterial);
        leftArmEnd2.position.x = 0.15;
        leftArmGroup.add(leftArmEnd2);
        leftArmGroup.position.set(-0.7, 1.0, 0);
        leftArmGroup.rotation.z = Math.PI / 4;
        leftArmGroup.castShadow = true;
        herzmanGroup.add(leftArmGroup);
        
        // Right arm (cylinder + sphere ends)
        const rightArmGroup = new THREE.Group();
        const rightArmCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8), armMaterial);
        rightArmCyl.rotation.z = Math.PI / 2;
        rightArmGroup.add(rightArmCyl);
        const rightArmEnd1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), armMaterial);
        rightArmEnd1.position.x = -0.15;
        rightArmGroup.add(rightArmEnd1);
        const rightArmEnd2 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), armMaterial);
        rightArmEnd2.position.x = 0.15;
        rightArmGroup.add(rightArmEnd2);
        rightArmGroup.position.set(0.7, 1.0, 0);
        rightArmGroup.rotation.z = -Math.PI / 4;
        rightArmGroup.castShadow = true;
        herzmanGroup.add(rightArmGroup);
        
        // Little hands (spheres)
        const handGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const handMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDAB9 });
        
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.9, 0.8, 0);
        herzmanGroup.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.9, 0.8, 0);
        herzmanGroup.add(rightHand);
        
        // Legs (short stubby legs) - using cylinder with sphere ends
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
        
        // Left leg (cylinder + sphere ends)
        const leftLegGroup = new THREE.Group();
        const leftLegCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8), legMaterial);
        leftLegGroup.add(leftLegCyl);
        const leftLegTop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), legMaterial);
        leftLegTop.position.y = 0.125;
        leftLegGroup.add(leftLegTop);
        const leftLegBot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), legMaterial);
        leftLegBot.position.y = -0.125;
        leftLegGroup.add(leftLegBot);
        leftLegGroup.position.set(-0.25, 0.35, 0);
        leftLegGroup.castShadow = true;
        herzmanGroup.add(leftLegGroup);
        
        // Right leg (cylinder + sphere ends)
        const rightLegGroup = new THREE.Group();
        const rightLegCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8), legMaterial);
        rightLegGroup.add(rightLegCyl);
        const rightLegTop = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), legMaterial);
        rightLegTop.position.y = 0.125;
        rightLegGroup.add(rightLegTop);
        const rightLegBot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), legMaterial);
        rightLegBot.position.y = -0.125;
        rightLegGroup.add(rightLegBot);
        rightLegGroup.position.set(0.25, 0.35, 0);
        rightLegGroup.castShadow = true;
        herzmanGroup.add(rightLegGroup);
        
        // Little feet (oval spheres)
        const footGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const footMaterial = new THREE.MeshLambertMaterial({ color: 0xFF1493 });
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.25, 0.12, 0.05);
        leftFoot.scale.set(1, 0.6, 1.3);
        herzmanGroup.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(0.25, 0.12, 0.05);
        rightFoot.scale.set(1, 0.6, 1.3);
        herzmanGroup.add(rightFoot);
        
        return herzmanGroup;
    }
    
    // Create heart bomb projectile
    function createHeartBomb(fromX, fromY, fromZ, targetX, targetZ, isRemote = false) {
        const heartBombGroup = new THREE.Group();
        
        // Pink glowing heart
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.15);
        heartShape.bezierCurveTo(0, 0.2, -0.04, 0.25, -0.12, 0.25);
        heartShape.bezierCurveTo(-0.2, 0.25, -0.2, 0.1, -0.2, 0.1);
        heartShape.bezierCurveTo(-0.2, 0.02, -0.12, -0.05, 0, -0.12);
        heartShape.bezierCurveTo(0.12, -0.05, 0.2, 0.02, 0.2, 0.1);
        heartShape.bezierCurveTo(0.2, 0.1, 0.2, 0.25, 0.12, 0.25);
        heartShape.bezierCurveTo(0.04, 0.25, 0, 0.2, 0, 0.15);
        
        const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.02, bevelThickness: 0.02 };
        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        const heartMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF69B4,
            emissive: 0xFF1493,
            emissiveIntensity: 0.6
        });
        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        heart.scale.set(1.5, 1.5, 1.5);
        heartBombGroup.add(heart);
        
        // Trailing sparkles glow
        const glowGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFB6C1,
            transparent: true,
            opacity: 0.5
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        heartBombGroup.add(glow);
        
        heartBombGroup.position.set(fromX, fromY, fromZ);
        G.scene.add(heartBombGroup);
        
        // Calculate direction
        const dx = targetX - fromX;
        const dz = targetZ - fromZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const vx = (dx / dist) * GAME_CONFIG.HERZMAN_HEART_SPEED;
        const vz = (dz / dist) * GAME_CONFIG.HERZMAN_HEART_SPEED;
        
        G.heartBombs.push({
            mesh: heartBombGroup,
            velocity: { x: vx, y: 0, z: vz },
            startPos: { x: fromX, z: fromZ },
            isRemote: isRemote
        });
    }
    
    // Create heart bomb explosion with "sorry you died" sticky note
    function createHeartExplosion(x, y, z) {
        Audio.playExplosionSound();
        
        // Pink heart-shaped particles
        const particles = [];
        const particleCount = 25;
        
        for (let i = 0; i < particleCount; i++) {
            const size = 0.3 + Math.random() * 0.4;
            
            // Create heart-shaped sprite or use pink sphere
            const spriteMaterial = new THREE.SpriteMaterial({
                color: Math.random() > 0.5 ? 0xFF69B4 : 0xFF1493,
                transparent: true,
                opacity: 0.9
            });
            const particle = new THREE.Sprite(spriteMaterial);
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const speed = 0.15 + Math.random() * 0.3;
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed * 0.8,
                (Math.random() - 0.5) * speed
            );
            
            G.scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 40, initialScale: size });
        }
        
        G.explosions.push(...particles);
        
        // Create "sorry you died" sticky note that floats up
        createSorryNote(x, y + 1, z);
    }
    
    // Create floating "sorry you died" sticky note
    function createSorryNote(x, y, z) {
        const noteGroup = new THREE.Group();
        
        // Sticky note background (yellow square)
        const noteGeometry = new THREE.PlaneGeometry(2, 1.5);
        const noteMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF88,
            side: THREE.DoubleSide
        });
        const note = new THREE.Mesh(noteGeometry, noteMaterial);
        noteGroup.add(note);
        
        // Create canvas for text
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 192;
        const ctx = canvas.getContext('2d');
        
        // Yellow background
        ctx.fillStyle = '#FFFF88';
        ctx.fillRect(0, 0, 256, 192);
        
        // Add cute border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 184);
        
        // Draw sad face
        ctx.fillStyle = '#FF6B6B';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💔', 128, 60);
        
        // Draw "sorry you died" text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 28px Comic Sans MS, cursive';
        ctx.fillText('sorry you', 128, 110);
        ctx.fillText('died', 128, 145);
        
        // Small hearts decoration
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FF69B4';
        ctx.fillText('♥', 30, 170);
        ctx.fillText('♥', 226, 170);
        
        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        const textPlane = new THREE.Mesh(noteGeometry, textMaterial);
        textPlane.position.z = 0.01; // Slightly in front
        noteGroup.add(textPlane);
        
        noteGroup.position.set(x, y, z);
        
        // Make it face the camera (billboard effect will be in update)
        G.scene.add(noteGroup);
        
        // Animate the note floating up and fading
        let life = 120; // ~2 seconds at 60fps
        const animateNote = () => {
            if (life > 0) {
                noteGroup.position.y += 0.03;
                noteGroup.rotation.y += 0.02; // Gentle spin
                
                // Fade out in last 30 frames
                if (life < 30) {
                    const opacity = life / 30;
                    note.material.opacity = opacity;
                    textPlane.material.opacity = opacity;
                }
                
                life--;
                requestAnimationFrame(animateNote);
            } else {
                G.scene.remove(noteGroup);
            }
        };
        animateNote();
    }
    
    // Update Herz-Men visuals (runs on both host and client)
    function updateHerzmenVisuals() {
        const now = Date.now();
        
        G.placedHerzmen.forEach(herzman => {
            // Gentle pulsing/breathing animation for the whole Herz-Man
            const pulse = 1 + Math.sin(now * 0.004) * 0.05; // Gentle scale pulse
            const bob = Math.sin(now * 0.003) * 0.05; // Gentle vertical bob
            
            // Apply subtle scale pulse to simulate breathing
            herzman.mesh.scale.set(pulse, pulse, pulse);
            
            // Gentle bobbing motion
            const baseY = herzman.mesh.userData.baseY || herzman.mesh.position.y;
            if (!herzman.mesh.userData.baseY) {
                herzman.mesh.userData.baseY = herzman.mesh.position.y;
            }
            herzman.mesh.position.y = baseY + bob;
        });
    }
    
    // Update Herz-Men turrets (host only - game logic)
    function updateHerzmen() {
        const now = Date.now();
        
        // Check for expired Herz-Men and remove them
        for (let i = G.placedHerzmen.length - 1; i >= 0; i--) {
            const herzman = G.placedHerzmen[i];
            if (herzman.placedAt && now - herzman.placedAt > GAME_CONFIG.HERZMAN_LIFETIME) {
                // Despawn with a fade effect
                G.scene.remove(herzman.mesh);
                G.placedHerzmen.splice(i, 1);
                
                // Notify multiplayer
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('herzmanDespawned', { id: herzman.id });
                }
            }
        }
        
        G.placedHerzmen.forEach(herzman => {
            // Find closest enemy in range
            let closestEnemy = null;
            let closestDist = GAME_CONFIG.HERZMAN_RANGE;
            
            G.goblins.forEach(gob => {
                if (!gob.alive) return;
                const dist = Math.sqrt(
                    (gob.mesh.position.x - herzman.x) ** 2 +
                    (gob.mesh.position.z - herzman.z) ** 2
                );
                if (dist < closestDist) {
                    closestDist = dist;
                    closestEnemy = gob;
                }
            });
            
            // Check dragon
            if (G.dragon && G.dragon.alive) {
                const dist = Math.sqrt(
                    (G.dragon.mesh.position.x - herzman.x) ** 2 +
                    (G.dragon.mesh.position.z - herzman.z) ** 2
                );
                if (dist < closestDist) {
                    closestDist = dist;
                    closestEnemy = G.dragon;
                }
            }
            
            // Check extra dragons
            G.extraDragons.forEach(dragon => {
                if (!dragon.alive) return;
                const dist = Math.sqrt(
                    (dragon.mesh.position.x - herzman.x) ** 2 +
                    (dragon.mesh.position.z - herzman.z) ** 2
                );
                if (dist < closestDist) {
                    closestDist = dist;
                    closestEnemy = dragon;
                }
            });
            
            // Rotate towards enemy
            if (closestEnemy) {
                const targetAngle = Math.atan2(
                    closestEnemy.mesh.position.x - herzman.x,
                    closestEnemy.mesh.position.z - herzman.z
                );
                // Smooth rotation
                const angleDiff = targetAngle - herzman.mesh.rotation.y;
                herzman.mesh.rotation.y += angleDiff * 0.1;
                
                // Fire if cooldown is ready
                if (now - herzman.lastFireTime > GAME_CONFIG.HERZMAN_FIRE_INTERVAL) {
                    herzman.lastFireTime = now;
                    
                    const terrainHeight = getTerrainHeight(herzman.x, herzman.z);
                    createHeartBomb(
                        herzman.x,
                        terrainHeight + 1.3, // Fire from head height
                        herzman.z,
                        closestEnemy.mesh.position.x,
                        closestEnemy.mesh.position.z
                    );
                    
                    // Notify multiplayer
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('herzmanFired', {
                            id: herzman.id,
                            fromX: herzman.x,
                            fromY: terrainHeight + 1.3,
                            fromZ: herzman.z,
                            targetX: closestEnemy.mesh.position.x,
                            targetZ: closestEnemy.mesh.position.z
                        });
                    }
                }
            }
        });
    }
    
    // Update heart bombs
    function updateHeartBombs() {
        for (let i = G.heartBombs.length - 1; i >= 0; i--) {
            const bomb = G.heartBombs[i];
            
            // Move
            bomb.mesh.position.x += bomb.velocity.x;
            bomb.mesh.position.z += bomb.velocity.z;
            
            // Rotate for visual effect
            bomb.mesh.rotation.y += 0.1;
            bomb.mesh.rotation.x = Math.sin(Date.now() * 0.01) * 0.2;
            
            // Keep at consistent height above terrain
            const terrainHeight = getTerrainHeight(bomb.mesh.position.x, bomb.mesh.position.z);
            bomb.mesh.position.y = terrainHeight + 1.2;
            
            // Check collision with enemies
            let hitEnemy = false;
            
            // Check goblins
            G.goblins.forEach(gob => {
                if (!gob.alive || hitEnemy) return;
                const dist = Math.sqrt(
                    (gob.mesh.position.x - bomb.mesh.position.x) ** 2 +
                    (gob.mesh.position.z - bomb.mesh.position.z) ** 2
                );
                if (dist < 1.5) {
                    hitEnemy = true;
                    gob.health -= GAME_CONFIG.HERZMAN_HEART_DAMAGE;
                    if (gob.health <= 0) {
                        gob.alive = false;
                        Audio.playGoblinDeathSound();
                        gob.mesh.rotation.z = Math.PI / 2;
                        const terrH = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
                        gob.mesh.position.y = terrH + 0.5;
                    }
                    createHeartExplosion(bomb.mesh.position.x, bomb.mesh.position.y, bomb.mesh.position.z);
                    // Notify client about explosion
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('heartExplosion', {
                            x: bomb.mesh.position.x,
                            y: bomb.mesh.position.y,
                            z: bomb.mesh.position.z
                        });
                    }
                }
            });
            
            // Check dragon
            if (!hitEnemy && G.dragon && G.dragon.alive) {
                const dist = Math.sqrt(
                    (G.dragon.mesh.position.x - bomb.mesh.position.x) ** 2 +
                    (G.dragon.mesh.position.z - bomb.mesh.position.z) ** 2
                );
                if (dist < 5) { // Larger hitbox for dragon
                    hitEnemy = true;
                    G.dragon.health -= GAME_CONFIG.HERZMAN_HEART_DAMAGE;
                    if (G.dragon.health <= 0) {
                        G.dragon.alive = false;
                        G.dragon.mesh.visible = false;
                    }
                    createHeartExplosion(bomb.mesh.position.x, bomb.mesh.position.y, bomb.mesh.position.z);
                    // Notify client about explosion
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('heartExplosion', {
                            x: bomb.mesh.position.x,
                            y: bomb.mesh.position.y,
                            z: bomb.mesh.position.z
                        });
                    }
                }
            }
            
            // Check extra dragons
            G.extraDragons.forEach(dragon => {
                if (!dragon.alive || hitEnemy) return;
                const dist = Math.sqrt(
                    (dragon.mesh.position.x - bomb.mesh.position.x) ** 2 +
                    (dragon.mesh.position.z - bomb.mesh.position.z) ** 2
                );
                if (dist < 4) {
                    hitEnemy = true;
                    dragon.health -= GAME_CONFIG.HERZMAN_HEART_DAMAGE;
                    if (dragon.health <= 0) {
                        dragon.alive = false;
                        dragon.mesh.visible = false;
                    }
                    createHeartExplosion(bomb.mesh.position.x, bomb.mesh.position.y, bomb.mesh.position.z);
                    // Notify client about explosion
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('heartExplosion', {
                            x: bomb.mesh.position.x,
                            y: bomb.mesh.position.y,
                            z: bomb.mesh.position.z
                        });
                    }
                }
            });
            
            // Check travel distance (remove if too far)
            const travelDist = Math.sqrt(
                (bomb.mesh.position.x - bomb.startPos.x) ** 2 +
                (bomb.mesh.position.z - bomb.startPos.z) ** 2
            );
            
            if (hitEnemy || travelDist > GAME_CONFIG.HERZMAN_RANGE * 1.5) {
                G.scene.remove(bomb.mesh);
                G.heartBombs.splice(i, 1);
            }
        }
    }
    
    // Update heart bomb visuals (runs on both host and client)
    function updateHeartBombVisuals() {
        G.heartBombs.forEach(bomb => {
            // Rotate for visual effect
            bomb.mesh.rotation.y += 0.1;
            bomb.mesh.rotation.x = Math.sin(Date.now() * 0.01) * 0.2;
        });
        
        // Client-side movement update for remote heart bombs
        if (multiplayerManager && !multiplayerManager.isHost) {
            for (let i = G.heartBombs.length - 1; i >= 0; i--) {
                const bomb = G.heartBombs[i];
                
                // Move based on velocity
                bomb.mesh.position.x += bomb.velocity.x;
                bomb.mesh.position.z += bomb.velocity.z;
                
                // Keep at consistent height above terrain
                const terrainHeight = getTerrainHeight(bomb.mesh.position.x, bomb.mesh.position.z);
                bomb.mesh.position.y = terrainHeight + 1.2;
                
                // Check travel distance (remove if too far)
                const travelDist = Math.sqrt(
                    (bomb.mesh.position.x - bomb.startPos.x) ** 2 +
                    (bomb.mesh.position.z - bomb.startPos.z) ** 2
                );
                
                if (travelDist > GAME_CONFIG.HERZMAN_RANGE * 1.5) {
                    G.scene.remove(bomb.mesh);
                    G.heartBombs.splice(i, 1);
                }
            }
        }
    }
    
    // Handle game events from remote player
    function handleRemoteGameEvent(eventData) {
        const { eventType, data } = eventData;
        
        if (eventType === 'bombExplosion') {
            // Show explosion effect on client
            createBombExplosion(data.x, data.y, data.z);
            
            // Add camera shake
            const distToExplosion = Math.sqrt(
                (G.playerGroup.position.x - data.x) ** 2 +
                (G.playerGroup.position.z - data.z) ** 2
            );
            if (distToExplosion < 30) {
                const shakeIntensity = Math.max(0, 1 - distToExplosion / 30) * 0.3;
                G.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
                G.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
                G.camera.position.z += (Math.random() - 0.5) * shakeIntensity;
            }
        } else if (eventType === 'itemCollected') {
            // Other player collected an item
            if (data.type === 'material' && G.materials[data.index]) {
                G.materials[data.index].collected = true;
                G.materials[data.index].mesh.visible = false;
                G.materialsCollected++;
                Audio.playCollectSound();
            } else if (data.type === 'G.ammo' && G.ammoPickups[data.index]) {
                G.ammoPickups[data.index].collected = true;
                G.ammoPickups[data.index].mesh.visible = false;
                Audio.playCollectSound();
            } else if (data.type === 'health' && G.healthPickups[data.index]) {
                G.healthPickups[data.index].collected = true;
                G.healthPickups[data.index].mesh.visible = false;
                Audio.playCollectSound();
            } else if (data.type === 'bomb' && G.bombPickups[data.index]) {
                G.bombPickups[data.index].collected = true;
                G.bombPickups[data.index].mesh.visible = false;
                Audio.playCollectSound();
            } else if (data.type === 'herzman' && G.herzmanPickups[data.index]) {
                G.herzmanPickups[data.index].collected = true;
                G.herzmanPickups[data.index].mesh.visible = false;
                Audio.playCollectSound();
            } else if (data.type === 'scarab' && G.scarabPickups[data.index]) {
                G.scarabPickups[data.index].collected = true;
                G.scene.remove(G.scarabPickups[data.index].mesh);
                G.scarabsCollected++;
                Audio.playCollectSound();
            } else if (data.type === 'candy' && G.candyPickups && G.candyPickups[data.index]) {
                G.candyPickups[data.index].collected = true;
                G.scene.remove(G.candyPickups[data.index].mesh);
                G.candyCollected++;
                Audio.playCollectSound();
            }
        } else if (eventType === 'G.bridgeRepaired') {
            // Other player repaired the bridge
            if (!G.bridgeRepaired) {
                G.bridgeRepaired = true;
                G.bridgeObj.mesh.visible = true;
                G.brokenBridgeGroup.visible = false;
                Audio.playRepairSound();
            }
        } else if (eventType === 'G.icePowerCollected') {
            // Other player collected ice power
            if (!G.icePowerCollected) {
                G.icePowerCollected = true;
                G.hasIcePower = true;
                Audio.playCollectSound();
            }
        } else if (eventType === 'icePowerActivated') {
            // Other player activated ice power
            const playerPos = { x: data.x, y: data.y, z: data.z };
            
            // Always play sound for the receiving player
            Audio.playIcePowerSound();
            
            const freezeRadius = 20;
            const circleGeometry = new THREE.RingGeometry(0.1, freezeRadius, 32);
            const circleMaterial = new THREE.MeshBasicMaterial({
                color: 0x00BFFF,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const circle = new THREE.Mesh(circleGeometry, circleMaterial);
            circle.rotation.x = -Math.PI / 2;
            circle.position.set(playerPos.x, 2.0, playerPos.z);
            G.scene.add(circle);
            
            let expansion = 0;
            const expandInterval = setInterval(() => {
                expansion += 0.05;
                circle.scale.set(expansion, expansion, 1);
                circle.material.opacity = 0.6 * (1 - expansion);
                
                if (expansion >= 1) {
                    clearInterval(expandInterval);
                    G.scene.remove(circle);
                }
            }, 16);
            
            // If this is the host, apply freezing (client sent the event)
            if (multiplayerManager && multiplayerManager.isHost && !data.isHost) {
                console.log('Host applying freeze from client at position:', playerPos);
                const freezeDuration = 5000;
                const now = Date.now();
                
                // Freeze goblins
                console.log('Checking', G.goblins.length, 'G.goblins for freezing');
                G.goblins.forEach(gob => {
                    if (gob.alive) {
                        const dist = Math.sqrt(
                            (gob.mesh.position.x - playerPos.x) ** 2 +
                            (gob.mesh.position.z - playerPos.z) ** 2
                        );
                        if (dist <= freezeRadius) {
                            gob.frozen = true;
                            gob.frozenUntil = now + freezeDuration;
                            gob.mesh.children.forEach(child => {
                                if (child.material && child.material.emissive !== undefined) {
                                    child.material.emissive = new THREE.Color(0x0088FF);
                                    child.material.emissiveIntensity = 0.5;
                                }
                            });
                            // Create freeze particle effect
                            createFreezeEffect(gob.mesh.position.x, gob.mesh.position.y, gob.mesh.position.z);
                        }
                    }
                });
                
                // Freeze birds
                G.birds.forEach(bird => {
                    const birdDist = Math.sqrt(
                        (bird.mesh.position.x - playerPos.x) ** 2 +
                        (bird.mesh.position.z - playerPos.z) ** 2
                    );
                    if (birdDist <= freezeRadius) {
                        bird.frozen = true;
                        bird.frozenUntil = now + freezeDuration;
                        bird.mesh.children.forEach(child => {
                            if (child.material && child.material.emissive !== undefined) {
                                child.material.emissive = new THREE.Color(0x0088FF);
                                child.material.emissiveIntensity = 0.5;
                            }
                        });
                        // Create freeze particle effect
                        createFreezeEffect(bird.mesh.position.x, bird.mesh.position.y, bird.mesh.position.z);
                    }
                });
                
                // Freeze dragon (can still move and damage, just can't fire)
                if (G.dragon && G.dragon.alive) {
                    const dist = Math.sqrt(
                        (G.dragon.mesh.position.x - playerPos.x) ** 2 +
                        (G.dragon.mesh.position.z - playerPos.z) ** 2
                    );
                    if (dist <= freezeRadius + 15) { // Extra 15 units for G.dragon's size
                        G.dragon.frozen = true;
                        G.dragon.frozenUntil = now + freezeDuration;
                        // Apply blue tint to dragon
                        G.dragon.mesh.children.forEach(child => {
                            if (child.material && child.material.emissive !== undefined) {
                                child.material.emissive = new THREE.Color(0x0088FF);
                                child.material.emissiveIntensity = 0.5;
                            }
                        });
                        createFreezeEffect(G.dragon.mesh.position.x, G.dragon.mesh.position.y + 5, G.dragon.mesh.position.z);
                    }
                }
            }
        } else if (eventType === 'gameRestart') {
            // Host requested game restart
            resetGame();
        } else if (eventType === 'playerWin') {
            // Client reached treasure, host decides if game is won
            if (multiplayerManager && multiplayerManager.isHost) {
                gameWon = true;
                Audio.playWinSound();
            }
        } else if (eventType === 'playerDamage') {
            // Other player took damage (from host's guardian arrow)
            if (!godMode) {
                G.playerHealth--;
                G.damageFlashTime = Date.now();
                // Don't check for death here - client will send updated health to host
                // and host will sync gameDead status back via fullSync
                if (G.playerHealth > 0) {
                    Audio.playStuckSound();
                }
            }
        } else if (eventType === 'tornadoHit') {
            // Client was hit by a tornado (from host)
            if (!godMode) {
                G.playerHealth--;
                G.damageFlashTime = Date.now();
                
                // Trigger tornado spin visual effect
                G.tornadoSpinActive = true;
                G.tornadoSpinStartTime = Date.now();
                
                if (G.playerHealth > 0) {
                    Audio.playStuckSound();
                }
            }
        } else if (eventType === 'G.bananaPowerCollected') {
            // Other player collected banana power, both get it
            G.worldBananaPowerCollected = true;
            G.hasBananaPower = true;
            G.bananaInventory = G.maxBananas;
            Audio.playCollectSound();
        } else if (eventType === 'bananaPlaced') {
            // Other player placed a banana
            const bananaGroup = new THREE.Group();
            const bananaGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
            const bananaMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFFF00,
                emissive: 0xFFFF00,
                emissiveIntensity: 0.3
            });
            const bananaMesh = new THREE.Mesh(bananaGeometry, bananaMaterial);
            bananaMesh.rotation.z = Math.PI / 6;
            bananaMesh.castShadow = true;
            bananaGroup.add(bananaMesh);
            
            const endMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7500 });
            const endGeometry = new THREE.SphereGeometry(0.35, 8, 8);
            const end1 = new THREE.Mesh(endGeometry, endMaterial);
            end1.position.y = 0.7;
            end1.scale.set(0.8, 1, 0.8);
            bananaGroup.add(end1);
            
            const end2 = new THREE.Mesh(endGeometry, endMaterial);
            end2.position.y = -0.7;
            end2.scale.set(0.8, 1, 0.8);
            bananaGroup.add(end2);
            
            const terrainHeight = getTerrainHeight(data.x, data.z);
            bananaGroup.position.set(data.x, terrainHeight + 0.5, data.z);
            G.scene.add(bananaGroup);
            
            G.placedBananas.push({
                id: data.id,
                mesh: bananaGroup,
                x: data.x,
                z: data.z,
                radius: 1.2
            });
        } else if (eventType === 'bananaCollected') {
            // Other player collected a banana - remove it
            const index = G.placedBananas.findIndex(b => b.id === data.id);
            if (index !== -1) {
                G.scene.remove(G.placedBananas[index].mesh);
                G.placedBananas.splice(index, 1);
            }
        } else if (eventType === 'bombPlaced') {
            // Other player placed a bomb
            const bombGroup = new THREE.Group();
            
            const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.castShadow = true;
            bombGroup.add(sphere);
            
            const fuseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
            const fuseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
            fuse.position.y = 0.4;
            bombGroup.add(fuse);
            
            const sparkGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const sparkMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF4500,
                emissive: 0xFF4500,
                emissiveIntensity: 1.0
            });
            const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
            spark.position.y = 0.55;
            bombGroup.add(spark);
            
            const terrainHeight = getTerrainHeight(data.x, data.z);
            bombGroup.position.set(data.x, terrainHeight + 0.4, data.z);
            G.scene.add(bombGroup);
            
            G.placedBombs.push({
                id: data.id,
                mesh: bombGroup,
                x: data.x,
                z: data.z,
                radius: 12,
                explodeAt: data.explodeAt,
                spark: spark
            });
        } else if (eventType === 'bombExploded') {
            // Other player's bomb exploded, show visual effect only
            createBombExplosion(data.x, data.y, data.z);
            
            // Remove bomb from array
            const index = G.placedBombs.findIndex(b => b.id === data.id);
            if (index !== -1) {
                G.scene.remove(G.placedBombs[index].mesh);
                G.placedBombs.splice(index, 1);
            }
        } else if (eventType === 'herzmanPlaced') {
            // Other player placed a Herz-Man - use shared mesh creation function
            const herzmanGroup = createHerzmanMesh();
            
            const terrainHeight = getTerrainHeight(data.x, data.z);
            herzmanGroup.position.set(data.x, terrainHeight, data.z);
            G.scene.add(herzmanGroup);
            
            G.placedHerzmen.push({
                id: data.id,
                mesh: herzmanGroup,
                x: data.x,
                z: data.z,
                lastFireTime: 0,
                targetAngle: 0,
                placedAt: Date.now() // Track lifetime
            });
        } else if (eventType === 'herzmanFired') {
            // Other player's Herz-Man fired - create heart bomb
            createHeartBomb(data.fromX, data.fromY, data.fromZ, data.targetX, data.targetZ, true);
        } else if (eventType === 'herzmanDespawned') {
            // Herz-Man expired - remove it on client
            const index = G.placedHerzmen.findIndex(h => h.id === data.id);
            if (index !== -1) {
                G.scene.remove(G.placedHerzmen[index].mesh);
                G.placedHerzmen.splice(index, 1);
            }
        } else if (eventType === 'heartExplosion') {
            // Heart bomb exploded on host - show explosion effect on client
            createHeartExplosion(data.x, data.y, data.z);
        } else if (eventType === 'levelChange') {
            // Other player entered a portal - switch level together
            console.log(`Received level change to Level ${data.level}`);
            
            // Save current inventory before switching (so both players keep their inventory)
            persistentInventory.ammo = G.ammo;
            persistentInventory.bombs = G.bombInventory;
            persistentInventory.health = G.playerHealth;
            persistentInventory.hasKite = G.worldKiteCollected || G.player.hasKite;
            persistentInventory.herzmen = G.herzmanInventory;
            
            switchLevel(data.level);
        } else if (eventType === 'zombieSpawned') {
            // Host spawned a zombie, client needs to create it (with warning light)
            if (!G.graveyardTheme) return;
            
            // Initialize spawn state if not present
            if (!G.zombieSpawnState) {
                G.zombieSpawnState = {
                    lastSpawnTime: Date.now(),
                    spawnInterval: 8000,
                    maxSpawnedZombies: 15,
                    spawnedCount: 0,
                    pendingSpawns: []
                };
            }
            
            const terrainHeight = getTerrainHeight(data.x, data.z);
            
            // Create pulsating red warning light (same as host) - bright and high
            const warningLight = new THREE.PointLight(0xff0000, 4.0, 20);
            warningLight.position.set(data.x, terrainHeight + 4, data.z);
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
            glowMesh.position.set(data.x, terrainHeight + 0.05, data.z);
            glowMesh.rotation.x = -Math.PI / 2;
            G.scene.add(glowMesh);
            
            // Create vertical beam for visibility
            const beamGeometry = new THREE.CylinderGeometry(0.3, 0.8, 6, 8);
            const beamMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.4
            });
            const beamMesh = new THREE.Mesh(beamGeometry, beamMaterial);
            beamMesh.position.set(data.x, terrainHeight + 3, data.z);
            G.scene.add(beamMesh);
            
            G.zombieSpawnState.pendingSpawns.push({
                x: data.x,
                z: data.z,
                spawnId: data.spawnId,
                light: warningLight,
                glow: glowMesh,
                beam: beamMesh,
                startTime: Date.now(),
                warningDuration: data.warningDuration || 1200
            });
            G.zombieSpawnState.spawnedCount++;
            
        } else if (eventType === 'gingerbreadSpawned') {
            // Host spawned a gingerbread, client needs to create it
            if (!G.candyTheme) return;
            
            // Initialize spawn state if not present
            if (!G.ovenSpawnState) {
                G.ovenSpawnState = {
                    spawnInterval: 12000,
                    maxSpawnedGingerbreads: 10,
                    spawnedCount: 0,
                    risingGingerbreads: []
                };
            }
            
            const gingerbread = createSpawnedGingerbread(data.x, data.z);
            gingerbread.spawnId = data.spawnId;
            gingerbread.speed = data.speed;
            gingerbread.targetY = data.targetY;
            G.goblins.push(gingerbread);
            G.ovenSpawnState.risingGingerbreads.push(gingerbread);
            G.ovenSpawnState.spawnedCount++;
            
        } else if (eventType === 'lavaTrailCreate') {
            // Host created a lava trail, client needs to show it
            const trailGroup = new THREE.Group();
            
            const poolGeometry = new THREE.CircleGeometry(GAME_CONFIG.LAVA_TRAIL_RADIUS, 16);
            const poolMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff4400,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            const pool = new THREE.Mesh(poolGeometry, poolMaterial);
            pool.rotation.x = -Math.PI / 2;
            pool.position.y = 0.15;
            trailGroup.add(pool);
            
            const crustGeometry = new THREE.RingGeometry(GAME_CONFIG.LAVA_TRAIL_RADIUS * 0.7, GAME_CONFIG.LAVA_TRAIL_RADIUS, 16);
            const crustMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x4a2010,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const crust = new THREE.Mesh(crustGeometry, crustMaterial);
            crust.rotation.x = -Math.PI / 2;
            crust.position.y = 0.16;
            trailGroup.add(crust);
            
            const bubbleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const bubbleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xffaa00,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            bubble.position.y = 0.2;
            trailGroup.add(bubble);
            trailGroup.bubble = bubble;
            
            const terrainHeight = getTerrainHeight(data.x, data.z);
            trailGroup.position.set(data.x, terrainHeight, data.z);
            G.scene.add(trailGroup);
            
            G.lavaTrails.push({
                id: data.id,
                mesh: trailGroup,
                x: data.x,
                z: data.z,
                radius: GAME_CONFIG.LAVA_TRAIL_RADIUS,
                createdAt: Date.now(),
                duration: GAME_CONFIG.LAVA_TRAIL_DURATION,
                pool: pool,
                crust: crust,
                creatorId: data.creatorId
            });
        } else if (eventType === 'lavaTrailDeath') {
            // Client was killed by lava trail
            if (!gameDead) {
                G.playerHealth = 0;
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
            }
        } else if (eventType === 'lavaPoolDeath') {
            // Client was killed by lava pool
            if (!gameDead) {
                G.playerHealth = 0;
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
            }
        } else if (eventType === 'creviceDeath') {
            // Client fell into a crevice
            if (!gameDead) {
                G.playerHealth = 0;
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
            }
        } else if (eventType === 'whirlpoolDeath') {
            // Client was sucked into a whirlpool
            if (!gameDead) {
                G.playerHealth = 0;
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
            }
        } else if (eventType === 'trapDeath') {
            // Client hit a trap (quicksand, whirlpool, etc.)
            if (!gameDead) {
                G.playerHealth = 0;
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
            }
        }
    }

    // Update functions
    function updatePlayer() {
        if (gameWon) return;
        
        const prevPos = G.playerGroup.position.clone();
        
        // Handle gliding
        let isMoving = false;
        if (G.player.isGliding) {
            // Takeoff animation
            if (G.player.glideState === 'takeoff') {
                G.player.glideLiftProgress += 0.05;
                if (G.player.glideLiftProgress >= 1) {
                    G.player.glideState = 'flying';
                    G.player.glideLiftProgress = 1;
                }
            }
            // Landing animation
            else if (G.player.glideState === 'landing') {
                G.player.glideLiftProgress -= 0.05;
                if (G.player.glideLiftProgress <= 0) {
                    G.player.isGliding = false;
                    G.player.glideState = 'none';
                    G.player.glideLiftProgress = 0;
                    G.kiteGroup.visible = false;
                }
            }
            // Flying - consume charge
            else if (G.player.glideState === 'flying') {
                G.player.glideCharge -= 0.3;
                if (G.player.glideCharge <= 0) {
                    G.player.glideCharge = 0;
                    G.player.glideState = 'landing';
                }
            }
            
            // Glide forward
            G.playerGroup.position.x += Math.sin(G.player.rotation) * G.player.glideSpeed;
            G.playerGroup.position.z += Math.cos(G.player.rotation) * G.player.glideSpeed;
            isMoving = true;
        } else if (godMode) {
            // God mode flying controls
            let moveSpeed = godModeSpeed;
            
            // Forward/backward
            if (G.keys.ArrowUp || G.keys.w) {
                G.playerGroup.position.x += Math.sin(G.player.rotation) * moveSpeed;
                G.playerGroup.position.z += Math.cos(G.player.rotation) * moveSpeed;
            }
            if (G.keys.ArrowDown || G.keys.s) {
                G.playerGroup.position.x -= Math.sin(G.player.rotation) * moveSpeed;
                G.playerGroup.position.z -= Math.cos(G.player.rotation) * moveSpeed;
            }
            
            // Left/right rotation
            if (G.keys.ArrowLeft || G.keys.a) {
                G.player.rotation += G.player.rotationSpeed;
            }
            if (G.keys.ArrowRight || G.keys.d) {
                G.player.rotation -= G.player.rotationSpeed;
            }
            
            // Up/down (Q/E keys)
            if (G.keys.q) {
                G.playerGroup.position.y += moveSpeed * 0.5;
            }
            if (G.keys.e) {
                G.playerGroup.position.y -= moveSpeed * 0.5;
            }
            
            isMoving = G.keys.ArrowUp || G.keys.ArrowDown || G.keys.w || G.keys.s;
        } else {
            // Recharge glide
            if (G.player.glideCharge < G.player.maxGlideCharge) {
                G.player.glideCharge += 0.15;
            }
            
            // Normal movement
            if (G.keys.ArrowLeft || G.keys.a) {
                G.player.rotation += G.player.rotationSpeed;
            }
            if (G.keys.ArrowRight || G.keys.d) {
                G.player.rotation -= G.player.rotationSpeed;
            }
            
            isMoving = G.keys.ArrowUp || G.keys.ArrowDown || G.keys.w || G.keys.s;
            const moveScale = G.player.gamepadMoveScale > 0 ? G.player.gamepadMoveScale : 1;
            if (G.keys.ArrowUp || G.keys.w) {
                G.playerGroup.position.x += Math.sin(G.player.rotation) * G.player.speed * moveScale;
                G.playerGroup.position.z += Math.cos(G.player.rotation) * G.player.speed * moveScale;
            }
            if (G.keys.ArrowDown || G.keys.s) {
                G.playerGroup.position.x -= Math.sin(G.player.rotation) * G.player.speed * moveScale;
                G.playerGroup.position.z -= Math.cos(G.player.rotation) * G.player.speed * moveScale;
            }
            G.player.gamepadMoveScale = 0;
        }
        
        G.playerGroup.rotation.y = G.player.rotation;
        
        // Tornado spin visual effect (purely visual, doesn't affect gameplay position)
        if (G.tornadoSpinActive) {
            const elapsed = Date.now() - G.tornadoSpinStartTime;
            const progress = Math.min(elapsed / G.tornadoSpinDuration, 1);
            
            if (progress < 1) {
                // Spin rotation - ease out
                const spinProgress = 1 - Math.pow(1 - progress, 2); // ease out quad
                const extraRotation = spinProgress * G.tornadoSpinRotations * Math.PI * 2;
                G.playerGroup.rotation.y = G.player.rotation + extraRotation;
                
                // Lift up and down - parabolic arc
                const liftProgress = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
                G.playerGroup.position.y += liftProgress * G.tornadoSpinLiftHeight;
                
                // Slight wobble
                G.playerGroup.rotation.x = Math.sin(elapsed * 0.02) * 0.2 * (1 - progress);
                G.playerGroup.rotation.z = Math.cos(elapsed * 0.025) * 0.15 * (1 - progress);
            } else {
                // Effect finished, reset
                G.tornadoSpinActive = false;
                G.playerGroup.rotation.x = 0;
                G.playerGroup.rotation.z = 0;
            }
        }
        
        const isStuck = godMode ? false : checkCollisions(prevPos);
        
        if (isMoving && !isStuck) {
            Audio.startBikeSound();
        } else {
            Audio.stopBikeSound();
        }
        
        if (!godMode) {
            const terrainHeight = getTerrainHeight(G.playerGroup.position.x, G.playerGroup.position.z);
            if (G.player.isGliding) {
                const groundHeight = 0.1;
                const currentHeight = groundHeight + (G.player.glideHeight - groundHeight) * G.player.glideLiftProgress;
                G.playerGroup.position.y = terrainHeight + currentHeight;
            } else {
                G.playerGroup.position.y = terrainHeight + 0.1;
            }
        }
        
        const cameraDistance = 8;
        const cameraHeight = 4;
        
        const cameraOffsetX = -Math.sin(G.player.rotation) * cameraDistance;
        const cameraOffsetZ = -Math.cos(G.player.rotation) * cameraDistance;
        
        G.camera.position.x = G.playerGroup.position.x + cameraOffsetX;
        G.camera.position.y = G.playerGroup.position.y + cameraHeight;
        G.camera.position.z = G.playerGroup.position.z + cameraOffsetZ;
        G.camera.lookAt(G.playerGroup.position.x, G.playerGroup.position.y, G.playerGroup.position.z);
        
        // Native splitscreen: Update camera 2 to follow player 2
        if (isNativeSplitscreen && G.camera2 && G.player2 && G.player2Group) {
            const cam2OffsetX = -Math.sin(G.player2.rotation) * cameraDistance;
            const cam2OffsetZ = -Math.cos(G.player2.rotation) * cameraDistance;
            
            G.camera2.position.x = G.player2Group.position.x + cam2OffsetX;
            G.camera2.position.y = G.player2Group.position.y + cameraHeight;
            G.camera2.position.z = G.player2Group.position.z + cam2OffsetZ;
            G.camera2.lookAt(G.player2Group.position.x, G.player2Group.position.y, G.player2Group.position.z);
        }
        
        // Client syncs their player state to host (throttled to 20Hz to reduce network traffic)
        if (multiplayerManager && multiplayerManager.isClient && multiplayerManager.isConnected()) {
            const now = Date.now();
            if (now - G.lastClientStateSend >= G.clientStateSendInterval) {
                multiplayerManager.sendPlayerState({
                    position: G.playerGroup.position,
                    rotation: G.player.rotation,
                    health: G.playerHealth,
                    isGliding: G.player.isGliding,
                    glideLiftProgress: G.player.glideLiftProgress
                });
                G.lastClientStateSend = now;
            }
        }
    }
    
    // Update player 2 for native splitscreen mode
    function updatePlayer2() {
        if (!isNativeSplitscreen || !G.player2 || !G.player2Group) return;
        if (gameWon) return;
        
        const prevPos = G.player2Group.position.clone();
        
        // Handle gliding
        if (G.player2.isGliding) {
            // Takeoff animation
            if (G.player2.glideState === 'takeoff') {
                G.player2.glideLiftProgress += 0.05;
                if (G.player2.glideLiftProgress >= 1) {
                    G.player2.glideState = 'flying';
                    G.player2.glideLiftProgress = 1;
                }
            }
            // Landing animation
            else if (G.player2.glideState === 'landing') {
                G.player2.glideLiftProgress -= 0.05;
                if (G.player2.glideLiftProgress <= 0) {
                    G.player2.isGliding = false;
                    G.player2.glideState = 'none';
                    G.player2.glideLiftProgress = 0;
                    if (G.player2Group.kiteGroup) {
                        G.player2Group.kiteGroup.visible = false;
                    }
                }
            }
            // Flying - consume charge
            else if (G.player2.glideState === 'flying') {
                G.player2.glideCharge -= 0.3;
                if (G.player2.glideCharge <= 0) {
                    G.player2.glideCharge = 0;
                    G.player2.glideState = 'landing';
                }
            }
            
            // Glide forward
            G.player2Group.position.x += Math.sin(G.player2.rotation) * G.player2.glideSpeed;
            G.player2Group.position.z += Math.cos(G.player2.rotation) * G.player2.glideSpeed;
        } else {
            // Recharge glide
            if (G.player2.glideCharge < G.player2.maxGlideCharge) {
                G.player2.glideCharge += 0.15;
            }
            
            // Normal movement from gamepad keys
            const moveScale = G.player2.gamepadMoveScale > 0 ? G.player2.gamepadMoveScale : 1;
            if (G.keys2.w) {
                G.player2Group.position.x += Math.sin(G.player2.rotation) * G.player2.speed * moveScale;
                G.player2Group.position.z += Math.cos(G.player2.rotation) * G.player2.speed * moveScale;
            }
            if (G.keys2.s) {
                G.player2Group.position.x -= Math.sin(G.player2.rotation) * G.player2.speed * moveScale;
                G.player2Group.position.z -= Math.cos(G.player2.rotation) * G.player2.speed * moveScale;
            }
            G.player2.gamepadMoveScale = 0;
        }
        
        G.player2Group.rotation.y = G.player2.rotation;
        
        // NOTE: Unlike the original boundary check, player 2 (like player 1) is now
        // only blocked by walls/mountains, not by arbitrary bounds. This matches P1 behavior.
        
        // Collision with hills and impassable cliffs (when not gliding)
        if (!G.player2.isGliding || G.player2.glideState !== 'flying') {
            const newX = G.player2Group.position.x;
            const newZ = G.player2Group.position.z;
            let collided = false;
            
            // Check hill collision - ONLY on water theme levels (same as player 1)
            if (G.waterTheme && G.levelConfig.hills && G.levelConfig.hills.length > 0) {
                for (const hill of G.levelConfig.hills) {
                    const dx = newX - hill.x;
                    const dz = newZ - hill.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    
                    if (dist < hill.radius + 1.0) {
                        G.player2Group.position.copy(prevPos);
                        collided = true;
                        break;
                    }
                }
            }
            
            // Check impassable cliffs
            if (!collided) {
                for (const cliff of G.impassableCliffs || []) {
                    const dx = newX - cliff.x;
                    const dz = newZ - cliff.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < cliff.radius + 1.5) {
                        G.player2Group.position.copy(prevPos);
                        collided = true;
                        break;
                    }
                }
            }
            
            // Check mountains/walls
            if (!collided && G.levelConfig.mountains && G.levelConfig.mountains.length > 0) {
                for (const mtn of G.levelConfig.mountains) {
                    if (G.graveyardTheme) {
                        // Box collision for graveyard walls
                        const wallWidth = mtn.width;
                        const wallDepth = Math.min(mtn.width * 0.15, 8);
                        const halfW = wallWidth / 2 + 1.5;
                        const halfD = wallDepth / 2 + 1.5;
                        const dx = Math.abs(newX - mtn.x);
                        const dz = Math.abs(newZ - mtn.z);
                        if (dx < halfW && dz < halfD) {
                            G.player2Group.position.copy(prevPos);
                            collided = true;
                            break;
                        }
                    } else {
                        // Circular collision for cone mountains
                        const dist = Math.sqrt((newX - mtn.x) ** 2 + (newZ - mtn.z) ** 2);
                        if (dist < mtn.width / 2 + 1.5) {
                            G.player2Group.position.copy(prevPos);
                            collided = true;
                            break;
                        }
                    }
                }
            }
            
            // Check rocks
            if (!collided && G.rocks) {
                for (const rock of G.rocks) {
                    const dist = Math.sqrt((newX - rock.mesh.position.x) ** 2 + (newZ - rock.mesh.position.z) ** 2);
                    if (dist < rock.radius + 0.8) {
                        G.player2Group.position.copy(prevPos);
                        collided = true;
                        break;
                    }
                }
            }
            
            // Check boulders
            if (!collided && G.boulders) {
                for (const boulder of G.boulders) {
                    const dist = Math.sqrt((newX - boulder.mesh.position.x) ** 2 + (newZ - boulder.mesh.position.z) ** 2);
                    if (dist < boulder.radius + 0.8) {
                        G.player2Group.position.copy(prevPos);
                        collided = true;
                        break;
                    }
                }
            }
            
            // Check canyon walls
            if (!collided && G.canyonWalls) {
                for (const wall of G.canyonWalls) {
                    const cos = Math.cos(-wall.rotation);
                    const sin = Math.sin(-wall.rotation);
                    const dx = newX - wall.x;
                    const dz = newZ - wall.z;
                    const localX = dx * cos - dz * sin;
                    const localZ = dx * sin + dz * cos;
                    const halfWidth = wall.width / 2 + 1.0;
                    const halfDepth = wall.depth / 2 + 1.0;
                    if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth) {
                        G.player2Group.position.copy(prevPos);
                        collided = true;
                        break;
                    }
                }
            }
            
            // Check trees
            if (!collided && G.trees) {
                for (const tree of G.trees) {
                    const dist = Math.sqrt((newX - tree.mesh.position.x) ** 2 + (newZ - tree.mesh.position.z) ** 2);
                    if (dist < tree.radius + 0.8) {
                        G.player2Group.position.copy(prevPos);
                        collided = true;
                        break;
                    }
                }
            }
            
            // River collision (blocks movement if not on bridge and not gliding)
            if (!collided && G.riverObj && newZ > G.riverObj.minZ && newZ < G.riverObj.maxZ) {
                const onBridge = G.bridgeRepaired &&
                                newX > G.bridgeObj.minX && 
                                newX < G.bridgeObj.maxX &&
                                newZ > G.bridgeObj.minZ && 
                                newZ < G.bridgeObj.maxZ;
                if (!onBridge) {
                    G.player2Group.position.copy(prevPos);
                    collided = true;
                }
            }
        }
        
        // Update terrain height
        const terrainHeight = getTerrainHeight(G.player2Group.position.x, G.player2Group.position.z);
        
        if (G.player2.isGliding && G.player2.glideState !== 'none') {
            const groundHeight = 0.1;
            const currentHeight = groundHeight + (G.player2.glideHeight - groundHeight) * G.player2.glideLiftProgress;
            G.player2Group.position.y = terrainHeight + currentHeight;
        } else {
            G.player2Group.position.y = terrainHeight + 0.1;
        }
        
        // Check damage from goblins, lava, etc.
        checkPlayer2Damage();
    }
    
    // Check damage for player 2 in native splitscreen
    function checkPlayer2Damage() {
        if (!isNativeSplitscreen || godMode) return;
        
        const now = Date.now();
        
        // Goblin damage check
        G.goblins.forEach(gob => {
            if (!gob.alive) return;
            
            const dist = Math.sqrt(
                (G.player2Group.position.x - gob.mesh.position.x) ** 2 +
                (G.player2Group.position.z - gob.mesh.position.z) ** 2
            );
            
            const damageRange = gob.isGiant ? 3.5 : 1.5;
            
            if (dist < damageRange && now - (G.lastDamageTime2 || 0) > G.damageCooldown) {
                G.player2Health--;
                G.lastDamageTime2 = now;
                G.damageFlashTime2 = now;
                Audio.playStuckSound();
                
                if (G.player2Health <= 0) {
                    // Player 2 died - both players die together
                    gameDead = true;
                    Audio.stopBackgroundMusic();
                    Audio.playDeathSound();
                }
            }
        });
        
        // Lava damage check
        if (G.lavaTheme || (G.levelConfig.lavaPools && G.levelConfig.lavaPools.length > 0)) {
            const isOnLava = checkIfOnLava(G.player2Group.position.x, G.player2Group.position.z);
            if (isOnLava && !G.player2.isGliding) {
                if (now - (G.lastDamageTime2 || 0) > 500) {
                    G.player2Health--;
                    G.lastDamageTime2 = now;
                    G.damageFlashTime2 = now;
                    
                    if (G.player2Health <= 0) {
                        gameDead = true;
                        Audio.stopBackgroundMusic();
                        Audio.playDeathSound();
                    }
                }
            }
        }
    }
    
    // Helper to check if position is on lava
    function checkIfOnLava(x, z) {
        if (!G.levelConfig.lavaPools) return false;
        for (const pool of G.levelConfig.lavaPools) {
            const dist = Math.sqrt((x - pool.x) ** 2 + (z - pool.z) ** 2);
            if (dist < pool.radius) return true;
        }
        return false;
    }
    
    // Shoot bullet from specific player (for splitscreen)
    function shootBulletForPlayer(playerNum) {
        if (playerNum === 1) {
            shootBullet();
        } else if (playerNum === 2 && isNativeSplitscreen) {
            if (G.player2Ammo <= 0) return;
            
            G.player2Ammo--;
            Audio.playShootSound();
            
            const bulletGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const bulletMaterial = new THREE.MeshLambertMaterial({ color: 0x4488FF });
            const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
            
            bulletMesh.position.set(
                G.player2Group.position.x + Math.sin(G.player2.rotation) * 1.2,
                G.player2Group.position.y + 1,
                G.player2Group.position.z + Math.cos(G.player2.rotation) * 1.2
            );
            
            const speed = 0.5;
            const velocity = new THREE.Vector3(
                Math.sin(G.player2.rotation) * speed,
                0,
                Math.cos(G.player2.rotation) * speed
            );
            
            G.scene.add(bulletMesh);
            G.bullets.push({
                mesh: bulletMesh,
                velocity: velocity,
                startPos: { x: bulletMesh.position.x, z: bulletMesh.position.z },
                fromPlayer: 2,
                radius: 0.15
            });
        }
    }
    
    // Placeholder functions for player 2 actions (simplified for now)
    function activateIcePowerForPlayer(playerNum) {
        if (playerNum === 1) {
            activateIcePower();
        } else {
            // Player 2 shares ice power activation with player 1's cooldown
            activateIcePower();
        }
    }
    
    function placeBananaForPlayer(playerNum) {
        if (playerNum === 2 && isNativeSplitscreen && G.player2BananaInventory > 0) {
            G.player2BananaInventory--;
            // Place banana at player 2's position
            const bananaX = G.player2Group.position.x;
            const bananaZ = G.player2Group.position.z;
            placeBananaAt(bananaX, bananaZ);
        } else {
            placeBanana();
        }
    }
    
    function placeBombForPlayer(playerNum) {
        if (playerNum === 2 && isNativeSplitscreen && G.player2BombInventory > 0) {
            G.player2BombInventory--;
            const bombX = G.player2Group.position.x;
            const bombZ = G.player2Group.position.z;
            placeBombAt(bombX, bombZ);
        } else {
            placeBomb();
        }
    }
    
    function placeHerzmanForPlayer(playerNum) {
        if (playerNum === 2 && isNativeSplitscreen && G.player2HerzmanInventory > 0) {
            G.player2HerzmanInventory--;
            const hx = G.player2Group.position.x + Math.sin(G.player2.rotation) * 2;
            const hz = G.player2Group.position.z + Math.cos(G.player2.rotation) * 2;
            placeHerzmanAt(hx, hz);
        } else {
            placeHerzman();
        }
    }
    
    // Export splitscreen functions
    window.updatePlayer2 = updatePlayer2;
    window.shootBulletForPlayer = shootBulletForPlayer;
    window.activateIcePowerForPlayer = activateIcePowerForPlayer;
    window.placeBananaForPlayer = placeBananaForPlayer;
    window.placeBombForPlayer = placeBombForPlayer;
    window.placeHerzmanForPlayer = placeHerzmanForPlayer;

    function updateBullets() {
        for (let i = G.bullets.length - 1; i >= 0; i--) {
            const bullet = G.bullets[i];
            bullet.mesh.position.add(bullet.velocity);
            
            // Calculate distance from start position
            const distFromStart = new THREE.Vector2(
                bullet.mesh.position.x - bullet.startPos.x,
                bullet.mesh.position.z - bullet.startPos.z
            ).length();
            
            const maxDistance = difficulty === 'hard' ? 35 : GAME_CONFIG.WORLD_BOUND;
            
            if (Math.abs(bullet.mesh.position.x) > GAME_CONFIG.WORLD_BOUND || Math.abs(bullet.mesh.position.z) > GAME_CONFIG.WORLD_BOUND || distFromStart > maxDistance) {
                G.scene.remove(bullet.mesh);
                G.bullets.splice(i, 1);
                continue;
            }
            
            let bulletHit = false;
            
            // Check collision with goblins
            // Visual feedback happens on both, but only host applies damage
            for (let j = 0; j < G.goblins.length; j++) {
                const gob = G.goblins[j];
                if (gob.alive) {
                    const dist = bullet.mesh.position.distanceTo(gob.mesh.position);
                    if (dist < gob.radius + bullet.radius) {
                        // Visual feedback on both host and client
                        createExplosion(gob.mesh.position.x, gob.mesh.position.y + 1, gob.mesh.position.z);
                        
                        // Only host applies actual damage
                        if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                            gob.health--;
                            gob.isChasing = true;
                            if (gob.health <= 0) {
                                gob.alive = false;
                                Audio.playGoblinDeathSound();
                                if (G.waterTheme) {
                                    // Sharks disappear underwater
                                    G.scene.remove(gob.mesh);
                                } else {
                                    gob.mesh.rotation.z = Math.PI / 2;
                                    const terrainH = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
                                    gob.mesh.position.y = terrainH + 0.5;
                                }
                            }
                        }
                        bulletHit = true;
                        break;
                    }
                }
            }
            
            // Check collision with dragon (main dragon)
            if (!bulletHit && G.dragon && G.dragon.alive) {
                const dist = bullet.mesh.position.distanceTo(G.dragon.mesh.position);
                const hitRadius = 8 * (G.dragon.scale || 1);
                if (dist < hitRadius) {
                    // Visual feedback
                    createExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                    
                    // Only host applies damage
                    if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                        G.dragon.health--;
                        if (G.dragon.health <= 0 && G.dragon.alive) {
                            G.dragon.alive = false;
                            G.dragon.deathTime = Date.now();
                            Audio.playGoblinDeathSound();
                            
                            // Start massive camera shake
                            dragonDeathShakeUntil = Date.now() + 1200; // 1.2 seconds
                            dragonDeathShakeIntensity = 1.0;
                            
                            // Capture position before hiding mesh
                            const deathX = G.dragon.mesh.position.x;
                            const deathY = G.dragon.mesh.position.y;
                            const deathZ = G.dragon.mesh.position.z;
                            
                            // Create multiple massive explosions
                            for (let i = 0; i < 8; i++) {
                                const offsetX = (Math.random() - 0.5) * 12;
                                const offsetY = Math.random() * 10;
                                const offsetZ = (Math.random() - 0.5) * 12;
                                setTimeout(() => {
                                    createDragonExplosion(
                                        deathX + offsetX,
                                        deathY + offsetY + 2,
                                        deathZ + offsetZ
                                    );
                                }, i * 150);
                            }
                            
                            // Hide dragon mesh immediately
                            G.dragon.mesh.visible = false;
                            
                            // Spawn candy drops in candy theme
                            if (G.candyTheme) {
                                spawnDragonCandyDrops(deathX, deathY, deathZ);
                            }
                        }
                    }
                    bulletHit = true;
                }
            }
            
            // Check collision with extra dragons
            if (!bulletHit) {
                for (const extraDragon of G.extraDragons) {
                    if (!extraDragon.alive) continue;
                    const dist = bullet.mesh.position.distanceTo(extraDragon.mesh.position);
                    const hitRadius = 8 * (extraDragon.scale || 1);
                    if (dist < hitRadius) {
                        // Visual feedback
                        createExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                        
                        // Only host applies damage
                        if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                            extraDragon.health--;
                            if (extraDragon.health <= 0 && extraDragon.alive) {
                                extraDragon.alive = false;
                                extraDragon.deathTime = Date.now();
                                Audio.playGoblinDeathSound();
                                
                                // Smaller camera shake for extra dragons
                                dragonDeathShakeUntil = Date.now() + 600;
                                dragonDeathShakeIntensity = 0.5;
                                
                                // Capture position before hiding mesh
                                const deathX = extraDragon.mesh.position.x;
                                const deathY = extraDragon.mesh.position.y;
                                const deathZ = extraDragon.mesh.position.z;
                                
                                // Create smaller explosions (fewer, smaller)
                                for (let i = 0; i < 4; i++) {
                                    const offsetX = (Math.random() - 0.5) * 8;
                                    const offsetY = Math.random() * 6;
                                    const offsetZ = (Math.random() - 0.5) * 8;
                                    setTimeout(() => {
                                        createDragonExplosion(
                                            deathX + offsetX,
                                            deathY + offsetY + 1,
                                            deathZ + offsetZ
                                        );
                                    }, i * 100);
                                }
                                
                                // Hide dragon mesh immediately
                                extraDragon.mesh.visible = false;
                                
                                // Spawn candy drops in candy theme
                                if (G.candyTheme) {
                                    spawnDragonCandyDrops(deathX, deathY, deathZ);
                                }
                            }
                        }
                        bulletHit = true;
                        break;
                    }
                }
            }
            
            // Check collision with trees (visual feedback on both)
            if (!bulletHit) {
                for (let j = 0; j < G.trees.length; j++) {
                    const tree = G.trees[j];
                    const dist = new THREE.Vector2(
                        bullet.mesh.position.x - tree.mesh.position.x,
                        bullet.mesh.position.z - tree.mesh.position.z
                    ).length();
                    if (dist < tree.radius + bullet.radius) {
                        Audio.playBulletImpactSound();
                        createExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                        bulletHit = true;
                        break;
                    }
                }
            }
            
            // Check collision with hills (visual feedback on both)
            if (!bulletHit) {
                for (let j = 0; j < G.levelConfig.hills.length; j++) {
                    const hill = G.levelConfig.hills[j];
                    const dist = new THREE.Vector2(
                        bullet.mesh.position.x - hill.x,
                        bullet.mesh.position.z - hill.z
                    ).length();
                    
                    if (dist < hill.radius) {
                        const hillHeight = getTerrainHeight(bullet.mesh.position.x, bullet.mesh.position.z);
                        if (bullet.mesh.position.y <= hillHeight + 1) {
                            Audio.playBulletImpactSound();
                            createExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                            bulletHit = true;
                            break;
                        }
                    }
                }
            }
            
            if (bulletHit) {
                G.scene.remove(bullet.mesh);
                G.bullets.splice(i, 1);
            }
        }
    }

    function updateExplosions() {
        for (let i = G.explosions.length - 1; i >= 0; i--) {
            const exp = G.explosions[i];
            exp.mesh.position.add(exp.velocity);
            exp.velocity.y -= 0.02;
            exp.life--;
            
            // Fade out and shrink for star-like dissipation
            const lifeRatio = exp.life / 60; // Normalize to 0-1
            if (exp.mesh.material) {
                exp.mesh.material.opacity = Math.max(0, lifeRatio * 1.5);
            }
            // Shrink as it fades
            if (exp.initialScale) {
                const scale = exp.initialScale * (0.3 + lifeRatio * 0.7);
                exp.mesh.scale.set(scale, scale, 1);
            }
            
            if (exp.life <= 0) {
                G.scene.remove(exp.mesh);
                G.explosions.splice(i, 1);
            }
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
            isOvenSpawned: true
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

    function updateGoblins() {
        G.goblins.forEach(gob => {
            if (!gob.alive || gameWon) return;
            
            // Check if frozen
            if (gob.frozen) {
                if (Date.now() < gob.frozenUntil) {
                    return; // Skip update while frozen
                } else {
                    // Unfreeze
                    gob.frozen = false;
                    gob.frozenUntil = 0;
                    // Remove blue tint
                    gob.mesh.children.forEach(child => {
                        if (child.material && child.material.emissive !== undefined) {
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                        }
                    });
                }
            }
            
            // Initialize velocity tracking if not present
            if (!gob.velocity) {
                gob.velocity = { x: 0, z: 0 };
            }
            
            const oldX = gob.mesh.position.x;
            const oldZ = gob.mesh.position.z;
            
            // Get nearest player target (handles both native splitscreen and network multiplayer)
            const targetInfo = getNearestPlayerTarget(gob.mesh.position.x, gob.mesh.position.z);
            let targetPlayer = targetInfo.target;
            let distToTarget = targetInfo.distance;
            let targetInIceBerg = targetInfo.inIceBerg;
            
            // If all players in ice berg, don't chase
            if (targetInIceBerg) {
                return;
            }
            
            if (gob.isGuardian && distToTarget < 25 && !targetInIceBerg) {
                gob.isChasing = true;
            }
            
            if (distToTarget < 25 || (gob.isGuardian && gob.isChasing) || gob.isChasing) {
                const directionX = targetPlayer.position.x - gob.mesh.position.x;
                const directionZ = targetPlayer.position.z - gob.mesh.position.z;
                const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
                
                // Only move if not already very close (prevents oscillation and ensures collision)
                if (length > 0.5) {
                    gob.mesh.position.x += (directionX / length) * gob.speed;
                    gob.mesh.position.z += (directionZ / length) * gob.speed;
                    gob.mesh.rotation.y = Math.atan2(directionX, directionZ);
                }
            } else {
                gob.mesh.position.x += gob.speed * gob.direction;
                gob.mesh.rotation.y = gob.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
                
                if (gob.mesh.position.x <= gob.patrolLeft) {
                    gob.direction = 1;
                } else if (gob.mesh.position.x >= gob.patrolRight) {
                    gob.direction = -1;
                }
            }
            
            // Track velocity for sync
            gob.velocity.x = gob.mesh.position.x - oldX;
            gob.velocity.z = gob.mesh.position.z - oldZ;
            
            // Check mountain collision - prevent goblins from entering mountains
            for (const mtn of MOUNTAINS) {
                const distToMountain = Math.sqrt(
                    (gob.mesh.position.x - mtn.x) ** 2 +
                    (gob.mesh.position.z - mtn.z) ** 2
                );
                const mountainRadius = mtn.width / 2 - 1; // Slight buffer
                if (distToMountain < mountainRadius) {
                    // Push goblin back out of mountain
                    const pushAngle = Math.atan2(
                        gob.mesh.position.z - mtn.z,
                        gob.mesh.position.x - mtn.x
                    );
                    gob.mesh.position.x = mtn.x + Math.cos(pushAngle) * mountainRadius;
                    gob.mesh.position.z = mtn.z + Math.sin(pushAngle) * mountainRadius;
                    
                    // Reverse patrol direction if patrolling
                    if (!gob.isChasing) {
                        gob.direction *= -1;
                    }
                }
            }
            
            const terrainHeight = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
            gob.mesh.position.y = terrainHeight + 0.1;
            
            // Check trap collision
            G.traps.forEach(trap => {
                const distToTrap = new THREE.Vector2(
                    gob.mesh.position.x - trap.mesh.position.x,
                    gob.mesh.position.z - trap.mesh.position.z
                ).length();
                if (distToTrap < trap.radius) {
                    gob.alive = false;
                    gob.mesh.rotation.z = Math.PI / 2;
                    gob.mesh.position.y = terrainHeight + 0.5;
                    createExplosion(gob.mesh.position.x, gob.mesh.position.y + 1, gob.mesh.position.z);
                }
            });
            
            // Check banana trap collision
            G.placedBananas.forEach(banana => {
                const distToBanana = new THREE.Vector2(
                    gob.mesh.position.x - banana.x,
                    gob.mesh.position.z - banana.z
                ).length();
                if (distToBanana < banana.radius) {
                    gob.alive = false;
                    gob.mesh.rotation.z = Math.PI / 2;
                    gob.mesh.position.y = terrainHeight + 0.5;
                    createExplosion(gob.mesh.position.x, gob.mesh.position.y + 1, gob.mesh.position.z);
                }
            });
            
            // Check player collision - LOCAL PLAYER (deals damage with cooldown like dragon)
            const dist = G.playerGroup.position.distanceTo(gob.mesh.position);
            if (dist < 1.5 && !godMode) {
                const now = Date.now();
                if (now - G.lastDamageTime > G.damageCooldown) {
                    G.playerHealth--;
                    G.lastDamageTime = now;
                    G.damageFlashTime = now;
                    
                    if (G.playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    } else {
                        Audio.playStuckSound();
                    }
                }
            }
            
            // Check OTHER PLAYER collision in multiplayer (HOST ONLY)
            if (multiplayerManager && multiplayerManager.isHost && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = otherPlayerMesh.position.distanceTo(gob.mesh.position);
                if (distToOther < 1.5) {
                    const now = Date.now();
                    // Initialize per-goblin cooldown tracker for other player
                    if (!gob.lastOtherPlayerDamageTime) gob.lastOtherPlayerDamageTime = 0;
                    
                    if (now - gob.lastOtherPlayerDamageTime > G.damageCooldown) {
                        multiplayerManager.sendGameEvent('playerDamage', {});
                        gob.lastOtherPlayerDamageTime = now;
                    }
                }
            }
            
            // Check PLAYER 2 collision in native splitscreen
            if (isNativeSplitscreen && G.player2Group) {
                const distToP2 = G.player2Group.position.distanceTo(gob.mesh.position);
                if (distToP2 < 1.5) {
                    const now = Date.now();
                    if (!gob.lastPlayer2DamageTime) gob.lastPlayer2DamageTime = 0;
                    
                    if (now - gob.lastPlayer2DamageTime > G.damageCooldown) {
                        G.player2Health--;
                        gob.lastPlayer2DamageTime = now;
                        G.damageFlashTime2 = now;
                        
                        if (G.player2Health <= 0) {
                            // Player 2 died
                        } else {
                            Audio.playStuckSound();
                        }
                    }
                }
            }
            
            // Guardian arrows (ink balls in water theme, mini-ghosts in graveyard)
            if (gob.isGuardian && distToTarget < 25) {
                const now = Date.now();
                const fireInterval = 4000 + Math.random() * 2000;
                if (now - gob.lastFireTime > fireInterval) {
                    gob.lastFireTime = now;
                    
                    let arrowMesh;
                    if (G.waterTheme) {
                        // Ink ball for octopus guardians
                        const inkGeometry = new THREE.SphereGeometry(0.3, 12, 12);
                        const inkMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
                        arrowMesh = new THREE.Mesh(inkGeometry, inkMaterial);
                        arrowMesh.position.copy(gob.mesh.position);
                        arrowMesh.position.y += 1.2;
                        G.scene.add(arrowMesh);
                    } else if (G.graveyardTheme) {
                        // Mini-ghost projectile for ghost guardians
                        const ghostGroup = new THREE.Group();
                        
                        // Mini ghost body (inverted cone)
                        const bodyGeometry = new THREE.ConeGeometry(0.25, 0.5, 8);
                        const bodyMaterial = new THREE.MeshPhongMaterial({ 
                            color: 0x88aacc,
                            transparent: true,
                            opacity: 0.7,
                            emissive: 0x4466aa,
                            emissiveIntensity: 0.3
                        });
                        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                        body.rotation.x = Math.PI;
                        ghostGroup.add(body);
                        
                        // Mini ghost head
                        const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
                        const head = new THREE.Mesh(headGeometry, bodyMaterial);
                        head.position.y = 0.3;
                        ghostGroup.add(head);
                        
                        // Tiny eyes (black dots)
                        const eyeGeometry = new THREE.SphereGeometry(0.04, 6, 6);
                        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
                        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                        leftEye.position.set(-0.06, 0.32, 0.12);
                        ghostGroup.add(leftEye);
                        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                        rightEye.position.set(0.06, 0.32, 0.12);
                        ghostGroup.add(rightEye);
                        
                        ghostGroup.position.copy(gob.mesh.position);
                        ghostGroup.position.y += 1.5;
                        G.scene.add(ghostGroup);
                        arrowMesh = ghostGroup;
                    } else {
                        // Regular arrow
                        const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
                        const arrowMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                        arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
                        arrowMesh.position.copy(gob.mesh.position);
                        arrowMesh.position.y += 1.5;
                        G.scene.add(arrowMesh);
                        
                        const tipGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
                        const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
                        const tipMesh = new THREE.Mesh(tipGeometry, tipMaterial);
                        tipMesh.position.y = 0.5;
                        arrowMesh.add(tipMesh);
                    }
                    
                    Audio.playArrowShootSound();
                    
                    // Target the closest player (works with native splitscreen and network multiplayer)
                    const arrowTargetInfo = getNearestPlayerTarget(gob.mesh.position.x, gob.mesh.position.z);
                    const arrowTargetPlayer = arrowTargetInfo.target;
                    
                    const dirX = arrowTargetPlayer.position.x - gob.mesh.position.x;
                    const dirZ = targetPlayer.position.z - gob.mesh.position.z;
                    const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
                    
                    const direction = new THREE.Vector3(
                        dirX / length,
                        0,
                        dirZ / length
                    );
                    
                    const angle = Math.atan2(dirX, dirZ);
                    if (!G.waterTheme) {
                        arrowMesh.rotation.x = Math.PI / 2;
                        arrowMesh.rotation.z = -angle;
                    }
                    
                    const arrowSpeed = difficulty === 'hard' ? 0.15 : 0.1;
                    
                    G.guardianArrows.push({
                        mesh: arrowMesh,
                        velocity: direction.multiplyScalar(arrowSpeed * speedMultiplier),
                        radius: 0.3
                    });
                }
            }
            
            // Skeleton arrows (bone arrows from skeleton archers)
            if (gob.isSkeleton && distToTarget < 30 && !gob.frozen) {
                const now = Date.now();
                const fireInterval = 3000 + Math.random() * 1500; // Slightly faster than guardians
                if (now - gob.lastFireTime > fireInterval) {
                    gob.lastFireTime = now;
                    
                    // Bone arrow projectile
                    const arrowGroup = new THREE.Group();
                    
                    // Arrow shaft (bone color)
                    const shaftGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6);
                    const shaftMaterial = new THREE.MeshLambertMaterial({ color: 0xe8e0d0 });
                    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
                    arrowGroup.add(shaft);
                    
                    // Arrow tip (dark bone)
                    const tipGeometry = new THREE.ConeGeometry(0.08, 0.2, 6);
                    const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
                    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
                    tip.position.y = 0.45;
                    arrowGroup.add(tip);
                    
                    // Feather fletching (dark red)
                    const fletchGeometry = new THREE.BoxGeometry(0.15, 0.12, 0.02);
                    const fletchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
                    const fletch1 = new THREE.Mesh(fletchGeometry, fletchMaterial);
                    fletch1.position.set(0, -0.3, 0.05);
                    fletch1.rotation.z = 0.3;
                    arrowGroup.add(fletch1);
                    const fletch2 = new THREE.Mesh(fletchGeometry, fletchMaterial);
                    fletch2.position.set(0, -0.3, -0.05);
                    fletch2.rotation.z = -0.3;
                    arrowGroup.add(fletch2);
                    
                    arrowGroup.position.copy(gob.mesh.position);
                    arrowGroup.position.y += 1.5;
                    G.scene.add(arrowGroup);
                    
                    Audio.playArrowShootSound();
                    
                    // Target the closest player (works with native splitscreen and network multiplayer)
                    const skelTargetInfo = getNearestPlayerTarget(gob.mesh.position.x, gob.mesh.position.z);
                    const skelTargetPlayer = skelTargetInfo.target;
                    
                    const dirX = skelTargetPlayer.position.x - gob.mesh.position.x;
                    const dirZ = skelTargetPlayer.position.z - gob.mesh.position.z;
                    const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
                    
                    const direction = new THREE.Vector3(dirX / length, 0, dirZ / length);
                    const angle = Math.atan2(dirX, dirZ);
                    arrowGroup.rotation.x = Math.PI / 2;
                    arrowGroup.rotation.z = -angle;
                    
                    const arrowSpeed = difficulty === 'hard' ? 0.14 : 0.10;
                    
                    G.guardianArrows.push({
                        mesh: arrowGroup,
                        velocity: direction.multiplyScalar(arrowSpeed * speedMultiplier),
                        radius: 0.3
                    });
                }
            }
            
            // Wizard fireballs
            if (gob.isWizard && distToTarget < GAME_CONFIG.WIZARD_RANGE && !gob.frozen) {
                const now = Date.now();
                const fireInterval = GAME_CONFIG.WIZARD_FIRE_INTERVAL_MIN + Math.random() * (GAME_CONFIG.WIZARD_FIRE_INTERVAL_MAX - GAME_CONFIG.WIZARD_FIRE_INTERVAL_MIN);
                if (now - gob.lastFireTime > fireInterval) {
                    gob.lastFireTime = now;
                    
                    // Create wizard fireball (smaller than dragon's)
                    createWizardFireball(gob, targetPlayer);
                }
                
                // Animate staff orb glow
                gob.orbGlowPhase += 0.05;
                if (gob.mesh.staffOrb) {
                    const glowIntensity = 0.6 + 0.4 * Math.sin(gob.orbGlowPhase);
                    gob.mesh.staffOrb.material.opacity = glowIntensity;
                    gob.mesh.staffOrb.scale.setScalar(1 + 0.2 * Math.sin(gob.orbGlowPhase * 2));
                }
            }
            
            // Mummy tornados
            if (gob.isMummy && distToTarget < GAME_CONFIG.MUMMY_RANGE && !gob.frozen) {
                const now = Date.now();
                const fireInterval = GAME_CONFIG.MUMMY_FIRE_INTERVAL_MIN + Math.random() * (GAME_CONFIG.MUMMY_FIRE_INTERVAL_MAX - GAME_CONFIG.MUMMY_FIRE_INTERVAL_MIN);
                if (now - gob.lastFireTime > fireInterval) {
                    gob.lastFireTime = now;
                    
                    // Create mummy tornado
                    createMummyTornado(gob, targetPlayer);
                }
                
                // Animate sand particles floating around mummy
                gob.sandPhase += 0.03;
                if (gob.mesh.sandParticles) {
                    gob.mesh.sandParticles.children.forEach((sand, idx) => {
                        const baseAngle = (idx / 8) * Math.PI * 2;
                        const angle = baseAngle + gob.sandPhase;
                        sand.position.x = Math.cos(angle) * 0.8;
                        sand.position.z = Math.sin(angle) * 0.8;
                        sand.position.y = 1.5 + Math.sin(gob.sandPhase + idx) * 0.3;
                    });
                }
            }
            
            // Lava monster fireballs and lava trails
            if (gob.isLavaMonster && !gob.frozen) {
                const now = Date.now();
                
                // Shoot fireballs at player in range
                if (distToTarget < GAME_CONFIG.LAVA_MONSTER_RANGE) {
                    const fireInterval = GAME_CONFIG.LAVA_MONSTER_FIRE_INTERVAL_MIN + Math.random() * (GAME_CONFIG.LAVA_MONSTER_FIRE_INTERVAL_MAX - GAME_CONFIG.LAVA_MONSTER_FIRE_INTERVAL_MIN);
                    if (now - gob.lastFireTime > fireInterval) {
                        gob.lastFireTime = now;
                        createLavaMonsterFireball(gob, targetPlayer);
                    }
                }
                
                // Leave lava trails while moving
                if (now - gob.lastTrailTime > GAME_CONFIG.LAVA_MONSTER_TRAIL_INTERVAL) {
                    gob.lastTrailTime = now;
                    const trailX = gob.mesh.position.x + (Math.random() - 0.5) * 1.5;
                    const trailZ = gob.mesh.position.z + (Math.random() - 0.5) * 1.5;
                    createLavaTrail(trailX, trailZ, gob.initialX + '_' + gob.initialZ);
                }
                
                // Animate ember particles
                gob.emberPhase += 0.04;
                if (gob.mesh.emberParticles) {
                    gob.mesh.emberParticles.children.forEach((ember, idx) => {
                        const baseAngle = (idx / 16) * Math.PI * 2;
                        const angle = baseAngle + gob.emberPhase;
                        ember.position.x = Math.cos(angle) * (1.5 + Math.sin(gob.emberPhase * 0.5 + idx) * 0.3);
                        ember.position.z = Math.sin(angle) * (1.5 + Math.sin(gob.emberPhase * 0.5 + idx) * 0.3);
                        ember.position.y = 1.5 + Math.sin(gob.emberPhase * 2 + idx) * 1.0 + 1.0;
                    });
                }
                
                // Pulse the inner body glow
                gob.pulsePhase += 0.05;
                if (gob.mesh.innerBody) {
                    const pulse = 0.7 + Math.sin(gob.pulsePhase) * 0.3;
                    gob.mesh.innerBody.material.opacity = pulse;
                }
                
                // Animate head glow
                if (gob.mesh.headGlow) {
                    gob.mesh.headGlow.material.opacity = 0.4 + Math.sin(gob.pulsePhase * 1.5) * 0.2;
                }
                
                // Animate arms - menacing swinging motion
                const armSwing = Math.sin(gob.emberPhase * 2) * 0.3;
                if (gob.mesh.leftArm) {
                    gob.mesh.leftArm.rotation.x = armSwing;
                    gob.mesh.leftArm.rotation.z = 0.1 + Math.sin(gob.pulsePhase) * 0.1;
                }
                if (gob.mesh.rightArm) {
                    gob.mesh.rightArm.rotation.x = -armSwing;
                    gob.mesh.rightArm.rotation.z = -0.1 - Math.sin(gob.pulsePhase) * 0.1;
                }
                
                // Animate legs - walking motion
                const legSwing = Math.sin(gob.emberPhase * 2.5) * 0.25;
                if (gob.mesh.leftLeg) {
                    gob.mesh.leftLeg.rotation.x = legSwing;
                }
                if (gob.mesh.rightLeg) {
                    gob.mesh.rightLeg.rotation.x = -legSwing;
                }
            }
        });
    }

    function updateGuardianArrows() {
        for (let i = G.guardianArrows.length - 1; i >= 0; i--) {
            const arrow = G.guardianArrows[i];
            arrow.mesh.position.x += arrow.velocity.x;
            arrow.mesh.position.z += arrow.velocity.z;
            
            // Check collision with local player
            const dist = new THREE.Vector2(
                G.playerGroup.position.x - arrow.mesh.position.x,
                G.playerGroup.position.z - arrow.mesh.position.z
            ).length();
            
            let hitPlayer = false;
            if (dist < 1.0) {
                if (!godMode) {
                    G.playerHealth--;
                    G.damageFlashTime = Date.now();
                    if (G.playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    } else {
                        // Play hurt sound or use existing sound
                        Audio.playStuckSound();
                    }
                }
                hitPlayer = true;
            }
            
            // Check collision with other player (in multiplayer)
            if (!hitPlayer && multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = new THREE.Vector2(
                    otherPlayerMesh.position.x - arrow.mesh.position.x,
                    otherPlayerMesh.position.z - arrow.mesh.position.z
                ).length();
                
                if (distToOther < 1.0) {
                    // Arrow hit other player - send damage event to them
                    // Note: Don't modify otherPlayerHealth here, it will be updated via sync
                    multiplayerManager.sendGameEvent('playerDamage', {});
                    hitPlayer = true;
                }
            }
            
            // Check collision with player 2 (in native splitscreen)
            if (!hitPlayer && isNativeSplitscreen && G.player2Group) {
                const distToP2 = new THREE.Vector2(
                    G.player2Group.position.x - arrow.mesh.position.x,
                    G.player2Group.position.z - arrow.mesh.position.z
                ).length();
                
                if (distToP2 < 1.0) {
                    G.player2Health--;
                    G.damageFlashTime2 = Date.now();
                    if (G.player2Health <= 0) {
                        // Player 2 died - TODO: handle player 2 death
                    } else {
                        Audio.playStuckSound();
                    }
                    hitPlayer = true;
                }
            }
            
            if (hitPlayer) {
                G.scene.remove(arrow.mesh);
                G.guardianArrows.splice(i, 1);
                continue;
            }
            
            let hitObstacle = false;
            G.trees.forEach(tree => {
                const distToTree = new THREE.Vector2(
                    arrow.mesh.position.x - tree.mesh.position.x,
                    arrow.mesh.position.z - tree.mesh.position.z
                ).length();
                if (distToTree < tree.radius) {
                    hitObstacle = true;
                }
            });
            
            G.levelConfig.hills.forEach(hill => {
                const distToHill = new THREE.Vector2(
                    arrow.mesh.position.x - hill.x,
                    arrow.mesh.position.z - hill.z
                ).length();
                if (distToHill < hill.radius) {
                    hitObstacle = true;
                }
            });
            
            if (hitObstacle) {
                G.scene.remove(arrow.mesh);
                G.guardianArrows.splice(i, 1);
                continue;
            }
            
            // Remove arrows that travel too far
            const distFromOrigin = Math.sqrt(
                arrow.mesh.position.x * arrow.mesh.position.x +
                arrow.mesh.position.z * arrow.mesh.position.z
            );
            if (distFromOrigin > GAME_CONFIG.WORLD_BOUND) {
                G.scene.remove(arrow.mesh);
                G.guardianArrows.splice(i, 1);
            }
        }
    }

    function updateBirds() {
        const now = Date.now();
        
        G.birds.forEach(bird => {
            // Check if frozen
            if (bird.frozen) {
                if (Date.now() < bird.frozenUntil) {
                    return; // Skip update while frozen
                } else {
                    // Unfreeze
                    bird.frozen = false;
                    bird.frozenUntil = 0;
                    // Remove blue tint
                    bird.mesh.children.forEach(child => {
                        if (child.material && child.material.emissive !== undefined) {
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                        }
                    });
                }
            }
            
            // Circle around center point
            bird.angle += bird.speed;
            bird.mesh.position.x = bird.centerX + Math.cos(bird.angle) * bird.radius;
            bird.mesh.position.z = bird.centerZ + Math.sin(bird.angle) * bird.radius;
            
            // Slight bobbing motion
            bird.mesh.position.y = bird.height + Math.sin(now * 0.003) * 0.5;
            
            // Calculate tangent direction (perpendicular to radius) and flip to face forward
            const dx = -Math.sin(bird.angle);
            const dz = Math.cos(bird.angle);
            bird.mesh.rotation.y = Math.atan2(-dx, -dz);
            
            // Wing flapping animation
            bird.wingFlapPhase += 0.2;
            const flapAngle = Math.sin(bird.wingFlapPhase) * 0.4;
            bird.leftWing.rotation.z = flapAngle;
            bird.rightWing.rotation.z = -flapAngle;
            
            // Check if players are in ice berg (safe zone) - only if iceBerg exists
            const playerInIceBerg = G.iceBerg ? Math.sqrt(
                Math.pow(G.playerGroup.position.x - G.iceBerg.position.x, 2) +
                Math.pow(G.playerGroup.position.z - G.iceBerg.position.z, 2)
            ) < G.iceBerg.radius : false;
            
            // Drop bomb if player is close (and not in ice berg)
            const distToPlayer = new THREE.Vector2(
                G.playerGroup.position.x - bird.mesh.position.x,
                G.playerGroup.position.z - bird.mesh.position.z
            ).length();
            
            // Also check distance to other player in multiplayer
            let distToOtherPlayer = Infinity;
            let otherInIceBerg = true;
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                otherInIceBerg = G.iceBerg ? Math.sqrt(
                    Math.pow(otherPlayerMesh.position.x - G.iceBerg.position.x, 2) +
                    Math.pow(otherPlayerMesh.position.z - G.iceBerg.position.z, 2)
                ) < G.iceBerg.radius : false;
                
                distToOtherPlayer = new THREE.Vector2(
                    otherPlayerMesh.position.x - bird.mesh.position.x,
                    otherPlayerMesh.position.z - bird.mesh.position.z
                ).length();
            }
            
            const closestPlayerDist = Math.min(distToPlayer, distToOtherPlayer);
            const anyPlayerInRange = (!playerInIceBerg && distToPlayer < 20) || (!otherInIceBerg && distToOtherPlayer < 20);
            
            if (anyPlayerInRange && now - bird.lastBombTime > 2500) {
                // Drop bomb
                const bombGeometry = new THREE.SphereGeometry(0.3, 8, 8);
                const bombMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
                const bombMesh = new THREE.Mesh(bombGeometry, bombMaterial);
                bombMesh.position.copy(bird.mesh.position);
                bombMesh.castShadow = true;
                G.scene.add(bombMesh);
                
                G.bombs.push({
                    mesh: bombMesh,
                    velocity: new THREE.Vector3(0, -0.2, 0),
                    radius: 7 // Explosion radius
                });
                
                bird.lastBombTime = now;
            }
        });
    }
    
    function updateBombs() {
        for (let i = G.bombs.length - 1; i >= 0; i--) {
            const bomb = G.bombs[i];
            
            // Apply gravity
            bomb.velocity.y -= 0.01;
            bomb.mesh.position.add(bomb.velocity);
            
            // Check if bomb hit ground
            const terrainHeight = getTerrainHeight(bomb.mesh.position.x, bomb.mesh.position.z);
            if (bomb.mesh.position.y <= terrainHeight) {
                // Explode
                const explosionX = bomb.mesh.position.x;
                const explosionZ = bomb.mesh.position.z;
                createBombExplosion(explosionX, terrainHeight + 0.5, explosionZ);
                
                // Add camera shake for bomb explosion
                const distToExplosion = Math.sqrt(
                    (G.playerGroup.position.x - explosionX) ** 2 +
                    (G.playerGroup.position.z - explosionZ) ** 2
                );
                if (distToExplosion < 30) {
                    const shakeIntensity = Math.max(0, 1 - distToExplosion / 30) * 0.3;
                    G.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
                    G.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
                    G.camera.position.z += (Math.random() - 0.5) * shakeIntensity;
                }
                
                // Send explosion event to client
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('bombExplosion', {
                        x: explosionX,
                        y: terrainHeight + 0.5,
                        z: explosionZ
                    });
                }
                
                // Check if player is in blast radius
                const distToPlayer = new THREE.Vector2(
                    G.playerGroup.position.x - bomb.mesh.position.x,
                    G.playerGroup.position.z - bomb.mesh.position.z
                ).length();
                
                if (distToPlayer < bomb.radius && !godMode) {
                    G.playerHealth--;
                    G.damageFlashTime = Date.now();
                    if (G.playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    } else {
                        Audio.playStuckSound();
                    }
                }
                
                // Check if other player is in blast radius (multiplayer)
                if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                    const distToOther = new THREE.Vector2(
                        otherPlayerMesh.position.x - bomb.mesh.position.x,
                        otherPlayerMesh.position.z - bomb.mesh.position.z
                    ).length();
                    
                    if (distToOther < bomb.radius) {
                        // Bomb hit other player - send damage event to them
                        multiplayerManager.sendGameEvent('playerDamage', {});
                    }
                }
                
                // Check if player 2 is in blast radius (native splitscreen)
                if (G.isNativeSplitscreen && G.player2Group && !godMode) {
                    const distToPlayer2 = new THREE.Vector2(
                        G.player2Group.position.x - bomb.mesh.position.x,
                        G.player2Group.position.z - bomb.mesh.position.z
                    ).length();
                    
                    if (distToPlayer2 < bomb.radius) {
                        G.player2Health--;
                        G.damageFlashTime2 = Date.now();
                        if (G.player2Health <= 0) {
                            if (!gameDead) {
                                gameDead = true;
                                Audio.stopBackgroundMusic();
                                Audio.playDeathSound();
                            }
                        } else {
                            Audio.playStuckSound();
                        }
                    }
                }
                
                G.scene.remove(bomb.mesh);
                G.bombs.splice(i, 1);
            }
        }
    }

    // Update pirate ships and cannonballs
    function updatePirateShips() {
        const now = Date.now();

        // Update ships
        G.pirateShips.forEach(ship => {
            // Patrol movement (up and down z-axis)
            ship.z += ship.speed * ship.direction;
            if (ship.z >= ship.patrolZ2) {
                ship.direction = -1;
            } else if (ship.z <= ship.patrolZ1) {
                ship.direction = 1;
            }
            ship.mesh.position.z = ship.z;

            // Bobbing motion
            ship.mesh.position.y = 0.5 + Math.sin(now * 0.002) * 0.3;

            // Check if player is in range before firing
            const distToPlayer = Math.sqrt(
                (G.playerGroup.position.x - ship.x) ** 2 +
                (G.playerGroup.position.z - ship.z) ** 2
            );
            const firingRange = 90;  // Fire when G.player is within 90 units

            // Fire cannonballs at player - rapid fire when in range
            if (now - ship.lastFireTime > ship.fireInterval && distToPlayer < firingRange) {
                ship.lastFireTime = now;
                ship.fireInterval = 800 + Math.random() * 700;  // Fast firing rate (0.8-1.5s)

                // Create cannonball aimed at player
                const cannonballGeometry = new THREE.SphereGeometry(0.5, 8, 8);
                const cannonballMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
                const cannonball = new THREE.Mesh(cannonballGeometry, cannonballMaterial);

                // Fire from the side facing the player
                const dirToPlayer = G.playerGroup.position.x - ship.x;
                const sideX = dirToPlayer > 0 ? ship.x + 5 : ship.x - 5;
                cannonball.position.set(sideX, 3, ship.z);
                cannonball.castShadow = true;
                G.scene.add(cannonball);

                // Calculate shot toward player with lead prediction
                const dx = G.playerGroup.position.x - sideX;
                const dz = G.playerGroup.position.z - ship.z;
                const horizontalDist = Math.sqrt(dx * dx + dz * dz);

                // Predict player movement for better accuracy
                const speed = 0.6;  // Cannonball speed
                const flightTime = horizontalDist / (speed * 60);  // Approximate flight time
                const predictX = dx + (G.player.velocity?.x || 0) * flightTime * 30;
                const predictZ = dz + (G.player.velocity?.z || 0) * flightTime * 30;
                const predictDist = Math.sqrt(predictX * predictX + predictZ * predictZ);

                // Normalize direction toward predicted position
                const dirX = predictX / predictDist;
                const dirZ = predictZ / predictDist;

                // Arc scales with distance - flat trajectory
                const arcHeight = Math.max(0.03, horizontalDist * 0.002);

                G.cannonballs.push({
                    mesh: cannonball,
                    velocity: new THREE.Vector3(dirX * speed, arcHeight, dirZ * speed),
                    startTime: now
                });

                Audio.playExplosionSound();
            }
        });

        // Update cannonballs
        for (let i = G.cannonballs.length - 1; i >= 0; i--) {
            const ball = G.cannonballs[i];

            // Apply gravity and movement - low gravity for flat shots
            ball.velocity.y -= 0.003;
            ball.mesh.position.add(ball.velocity);

            // Check if hit ground or timed out
            const terrainHeight = getTerrainHeight(ball.mesh.position.x, ball.mesh.position.z);
            const age = now - ball.startTime;

            // Check if hit impassable cliff
            let hitCliff = false;
            for (const cliff of G.impassableCliffs) {
                const distToCliff = Math.sqrt(
                    (ball.mesh.position.x - cliff.x) ** 2 +
                    (ball.mesh.position.z - cliff.z) ** 2
                );
                if (distToCliff < cliff.radius && ball.mesh.position.y < cliff.height) {
                    hitCliff = true;
                    break;
                }
            }

            // Check if hit mountain
            let hitMountain = false;
            if (G.levelConfig.mountains) {
                for (const mtn of G.levelConfig.mountains) {
                    const distToMtn = Math.sqrt(
                        (ball.mesh.position.x - mtn.x) ** 2 +
                        (ball.mesh.position.z - mtn.z) ** 2
                    );
                    if (distToMtn < (mtn.radius || mtn.width / 2) && ball.mesh.position.y < (mtn.height || 10)) {
                        hitMountain = true;
                        break;
                    }
                }
            }

            if (ball.mesh.position.y <= terrainHeight || age > 12000 || hitCliff || hitMountain) {
                // Create splash/explosion effect
                createBombExplosion(ball.mesh.position.x, terrainHeight + 0.5, ball.mesh.position.z);

                // Check if hit player - larger blast radius for more hits
                const distToPlayer = Math.sqrt(
                    (ball.mesh.position.x - G.playerGroup.position.x) ** 2 +
                    (ball.mesh.position.z - G.playerGroup.position.z) ** 2
                );
                if (distToPlayer < 6 && !godMode) {  // Bigger hit radius
                    G.playerHealth -= 2;
                    G.damageFlashTime = Date.now();
                    Audio.playDeathSound();
                    if (G.playerHealth <= 0) {
                        gameDead = true;
                        Audio.stopBackgroundMusic();
                    }
                }

                // Check hit on other player
                if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost && otherPlayerMesh.visible) {
                    const distToOther = Math.sqrt(
                        (ball.mesh.position.x - otherPlayerMesh.position.x) ** 2 +
                        (ball.mesh.position.z - otherPlayerMesh.position.z) ** 2
                    );
                    if (distToOther < 6) {  // Bigger hit radius
                        multiplayerManager.sendGameEvent('playerDamage', {});
                    }
                }
                
                // Check hit on player 2 (native splitscreen)
                if (G.isNativeSplitscreen && G.player2Group && !godMode) {
                    const distToP2 = Math.sqrt(
                        (ball.mesh.position.x - G.player2Group.position.x) ** 2 +
                        (ball.mesh.position.z - G.player2Group.position.z) ** 2
                    );
                    if (distToP2 < 6) {
                        G.player2Health -= 2;
                        G.damageFlashTime2 = Date.now();
                        Audio.playDeathSound();
                        if (G.player2Health <= 0) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                        }
                    }
                }

                G.scene.remove(ball.mesh);
                G.cannonballs.splice(i, 1);
            }
        }
    }

    function updateDragonVisuals() {
        if (!G.dragon) return;
        
        const now = Date.now();
        
        // Helper function to update visuals for a single dragon
        function updateSingleDragonVisuals(d) {
            if (!d || !d.alive) return;
            
            // Check if freeze effect should end
            if (d.frozen && now >= d.frozenUntil) {
                d.frozen = false;
                // Remove blue tint
                d.mesh.children.forEach(child => {
                    if (child.material && child.material.emissive !== undefined) {
                        child.material.emissive = new THREE.Color(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                });
            }
            
            // Skip dragon-specific animations for Reapers
            if (d.isReaper) {
                // Reaper hover animation - subtle bobbing near ground
                d.hoverPhase = (d.hoverPhase || 0) + 0.03;
                const hoverOffset = Math.sin(d.hoverPhase) * 0.3; // Smaller bob
                // Fix: use !== undefined to properly handle groundY of 0
                const baseY = d.groundY !== undefined ? d.groundY : 0;
                d.mesh.position.y = baseY + hoverOffset + 0.5; // Just above ground
                
                // Subtle swaying
                d.mesh.rotation.y += 0.002;
                
                // Eye glow pulse
                if (d.leftEye && d.rightEye) {
                    const glowIntensity = 0.7 + Math.sin(now * 0.005) * 0.3;
                    if (d.leftEye.material) d.leftEye.material.opacity = glowIntensity;
                    if (d.rightEye.material) d.rightEye.material.opacity = glowIntensity;
                }
                return;
            }
            
            // Wing flap animation (dragons only)
            d.wingFlapPhase += 0.15;
            const flapAngle = Math.sin(d.wingFlapPhase) * 0.5;
            d.leftWing.rotation.x = flapAngle;
            d.rightWing.rotation.x = -flapAngle;
            d.leftWing.rotation.z = 0.3 + flapAngle * 0.3;
            d.rightWing.rotation.z = -0.3 - flapAngle * 0.3;
            
            // Tail sway
            if (d.tailSegments) {
                d.tailSegments.forEach((segment, i) => {
                    const sway = Math.sin(now * 0.003 + i * 0.5) * (0.15 + i * 0.05);
                    segment.rotation.y = sway;
                });
            }
        }
        
        // Update main dragon
        updateSingleDragonVisuals(G.dragon);
        
        // Update extra dragons
        G.extraDragons.forEach(d => updateSingleDragonVisuals(d));
    }

    function updateDragon() {
        if (!G.dragon && G.extraDragons.length === 0) return;
        
        const now = Date.now();
        
        // Helper function to update a single dragon
        function updateSingleDragon(d) {
            if (!d || !d.alive) return;
            
            // Find closest player for targeting
            const distToPlayer = Math.sqrt(
                (G.playerGroup.position.x - d.mesh.position.x) ** 2 +
                (G.playerGroup.position.z - d.mesh.position.z) ** 2
            );
            
            let targetPlayer = G.playerGroup;
            let targetDist = distToPlayer;
            
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = Math.sqrt(
                    (otherPlayerMesh.position.x - d.mesh.position.x) ** 2 +
                    (otherPlayerMesh.position.z - d.mesh.position.z) ** 2
                );
                if (distToOther < targetDist) {
                    targetPlayer = otherPlayerMesh;
                    targetDist = distToOther;
                }
            }
            
            // Look at the closest player (add Math.PI/2 offset to fix 90-degree rotation)
            const angleToPlayer = Math.atan2(
                targetPlayer.position.x - d.mesh.position.x,
                targetPlayer.position.z - d.mesh.position.z
            );
            d.mesh.rotation.y = angleToPlayer - Math.PI / 2;
            
            // Make eye glows pulse menacingly
            const eyePulse = 0.4 + Math.sin(now * 0.005) * 0.2;
            if (d.leftEyeGlow) d.leftEyeGlow.material.opacity = eyePulse;
            if (d.rightEyeGlow) d.rightEyeGlow.material.opacity = eyePulse;
            
            // Check collision damage with host player (host only handles damage)
            const collisionRadius = 5 * (d.scale || 1);
            if (distToPlayer < collisionRadius && !godMode) {
                if (now - G.lastDamageTime > G.damageCooldown) {
                    G.playerHealth--;
                    G.lastDamageTime = now;
                    G.damageFlashTime = now;
                    Audio.playStuckSound();
                    
                    if (G.playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    }
                }
            }
            
            // Check collision damage with other player (multiplayer) - HOST ONLY
            if (multiplayerManager && multiplayerManager.isHost && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = Math.sqrt(
                    (otherPlayerMesh.position.x - d.mesh.position.x) ** 2 +
                    (otherPlayerMesh.position.z - d.mesh.position.z) ** 2
                );
                
                if (distToOther < collisionRadius) {
                    // Initialize cooldown tracker if needed
                    if (!d.lastOtherPlayerDamageTime) d.lastOtherPlayerDamageTime = 0;
                    
                    if (now - d.lastOtherPlayerDamageTime > G.damageCooldown) {
                        multiplayerManager.sendGameEvent('playerDamage', {});
                        d.lastOtherPlayerDamageTime = now;
                    }
                }
            }
            
            // Flying behavior - randomly fly up sometimes (dragons only, not reapers)
            if (!d.isReaper) {
                const flyHeight = (d.scale || 1) * 15;
                if (!d.isFlying && Math.random() < 0.0005) {
                    d.isFlying = true;
                    d.flyStartTime = now;
                    d.flyDuration = 3000 + Math.random() * 2000;
                    d.groundY = d.mesh.position.y;
                    d.flyTargetY = d.groundY + flyHeight + Math.random() * 10;
                }
                
                // Handle flying state
                if (d.isFlying) {
                    const flyElapsed = now - d.flyStartTime;
                    const flyProgress = flyElapsed / d.flyDuration;
                    
                    if (flyProgress < 0.3) {
                        const ascendProgress = flyProgress / 0.3;
                        d.mesh.position.y = d.groundY + (d.flyTargetY - d.groundY) * ascendProgress;
                    } else if (flyProgress < 0.7) {
                        d.mesh.position.y = d.flyTargetY;
                    } else if (flyProgress < 1.0) {
                        const descendProgress = (flyProgress - 0.7) / 0.3;
                        d.mesh.position.y = d.flyTargetY - (d.flyTargetY - d.groundY) * descendProgress;
                    } else {
                        d.mesh.position.y = d.groundY;
                        d.isFlying = false;
                    }
                }
            }
            
            // Patrol movement - Reapers chase player within range, dragons patrol
            if (d.isReaper) {
                // Reaper only chases if player is within chase range
                const chaseRange = d.chaseRange || 40;
                const distToTarget = Math.sqrt(
                    Math.pow(targetPlayer.position.x - d.mesh.position.x, 2) +
                    Math.pow(targetPlayer.position.z - d.mesh.position.z, 2)
                );
                
                if (distToTarget < chaseRange) {
                    // Chase the player
                    const chaseSpeed = d.speed;
                    const dirToPlayer = new THREE.Vector3(
                        targetPlayer.position.x - d.mesh.position.x,
                        0,
                        targetPlayer.position.z - d.mesh.position.z
                    ).normalize();
                    
                    d.mesh.position.x += dirToPlayer.x * chaseSpeed;
                    d.mesh.position.z += dirToPlayer.z * chaseSpeed;
                    d.mesh.rotation.y = Math.atan2(dirToPlayer.x, dirToPlayer.z);
                } else {
                    // Slowly drift back toward home position
                    const homeX = d.homeX || d.mesh.position.x;
                    const homeZ = d.homeZ || d.mesh.position.z;
                    const distToHome = Math.sqrt(
                        Math.pow(homeX - d.mesh.position.x, 2) +
                        Math.pow(homeZ - d.mesh.position.z, 2)
                    );
                    
                    if (distToHome > 2) {
                        const dirToHome = new THREE.Vector3(
                            homeX - d.mesh.position.x,
                            0,
                            homeZ - d.mesh.position.z
                        ).normalize();
                        d.mesh.position.x += dirToHome.x * d.speed * 0.5;
                        d.mesh.position.z += dirToHome.z * d.speed * 0.5;
                    }
                }
            } else {
                // Dragons patrol back and forth
                d.mesh.position.x += d.speed * d.direction;
                
                if (d.mesh.position.x <= d.patrolLeft) {
                    d.direction = 1;
                } else if (d.mesh.position.x >= d.patrolRight) {
                    d.direction = -1;
                }
            }
            
            // Fire fireballs at players (not when frozen)
            if (!d.frozen && now - d.lastFireTime > d.fireInterval) {
                let fireTargetPlayer = G.playerGroup;
                let fireTargetDist = distToPlayer;
                
                if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                    const distToOther = Math.sqrt(
                        (otherPlayerMesh.position.x - d.mesh.position.x) ** 2 +
                        (otherPlayerMesh.position.z - d.mesh.position.z) ** 2
                    );
                    if (distToOther < fireTargetDist) {
                        fireTargetPlayer = otherPlayerMesh;
                        fireTargetDist = distToOther;
                    }
                }
                
                // Only fire if player is in range
                // Reapers have shorter range (melee scythe), dragons have longer range
                const fireRange = d.isReaper ? 35 : 100;
                if (fireTargetDist < fireRange) {
                    // Reapers use scythe wave attack, dragons use fireballs
                    if (d.isReaper) {
                        createScytheWave(d, fireTargetPlayer);
                    } else {
                        createDragonFireball(d, fireTargetPlayer);
                    }
                    d.lastFireTime = now;
                    Audio.playExplosionSound();
                }
            }
        }
        
        // Update main dragon
        if (G.dragon && G.dragon.alive) {
            updateSingleDragon(G.dragon);
        }
        
        // Update extra dragons
        G.extraDragons.forEach(d => updateSingleDragon(d));
    }
    
    // Helper function to create a fireball from a dragon
    function createDragonFireball(d, targetPlayer) {
        const fbTextures = getTerrainTextures(THREE);
        
        // Use ice-themed textures for winter level
        const fireballTexture = G.iceTheme ? fbTextures.fireballIce : fbTextures.fireball;
        const explosionTexture = G.iceTheme ? fbTextures.explosionIce : fbTextures.explosion;
        
        // Create fireball group with core, glow, and flames
        const fireballGroup = new THREE.Group();
        
        // Scale fireball based on dragon size
        const fbScale = d.scale || 1;
        
        // Core sphere
        G.coreGeometry = new THREE.SphereGeometry(0.6 * fbScale, 12, 12);
        G.coreMaterial = new THREE.MeshBasicMaterial({ 
            map: fireballTexture,
            transparent: true
        });
        G.core = new THREE.Mesh(G.coreGeometry, G.coreMaterial);
        fireballGroup.add(G.core);
        
        // Outer glow sprite
        const glowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.7
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(3 * fbScale, 3 * fbScale, 1);
        fireballGroup.add(glow);
        
        // Inner bright glow
        const innerGlowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.9
        });
        const innerGlow = new THREE.Sprite(innerGlowMaterial);
        innerGlow.scale.set(1.8 * fbScale, 1.8 * fbScale, 1);
        fireballGroup.add(innerGlow);
        
        fireballGroup.position.copy(d.mesh.position);
        fireballGroup.position.x += d.direction > 0 ? 14 * fbScale : -14 * fbScale;
        fireballGroup.position.y += 1;
        G.scene.add(fireballGroup);
        
        // Calculate direction to target (including Y axis)
        const dirX = targetPlayer.position.x - fireballGroup.position.x;
        const dirY = targetPlayer.position.y - fireballGroup.position.y;
        const dirZ = targetPlayer.position.z - fireballGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        
        G.fireballs.push({
            mesh: fireballGroup,
            velocity: new THREE.Vector3(dirX / length * 0.4, dirY / length * 0.4, dirZ / length * 0.4),
            radius: 1.5 * fbScale,
            damage: 1,
            trail: [],
            lastTrailTime: 0
        });
    }

    // Helper function to create a scythe wave attack from a Reaper
    function createScytheWave(reaper, targetPlayer) {
        const waveGroup = new THREE.Group();
        const scale = reaper.scale || 0.5;
        
        // Create a crescent-shaped wave of dark energy
        const waveShape = new THREE.Shape();
        waveShape.moveTo(0, 0);
        waveShape.quadraticCurveTo(2, 1.5, 4, 0);
        waveShape.quadraticCurveTo(2, -0.5, 0, 0);
        
        const extrudeSettings = {
            steps: 1,
            depth: 0.3,
            bevelEnabled: false
        };
        
        const waveGeometry = new THREE.ExtrudeGeometry(waveShape, extrudeSettings);
        const waveMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FF44, // Ghostly green
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const wave = new THREE.Mesh(waveGeometry, waveMaterial);
        wave.scale.set(scale * 2, scale * 2, scale * 2);
        waveGroup.add(wave);
        
        // Add glowing edge
        const edgeGeometry = new THREE.TorusGeometry(2 * scale, 0.1 * scale, 8, 32, Math.PI);
        const edgeMaterial = new THREE.MeshBasicMaterial({
            color: 0x88FF88,
            transparent: true,
            opacity: 0.9
        });
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.rotation.x = Math.PI / 2;
        waveGroup.add(edge);
        
        // Add particle trail effect
        for (let i = 0; i < 5; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.2 * scale, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x00FF44,
                transparent: true,
                opacity: 0.6
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 3 * scale,
                (Math.random() - 0.5) * 2 * scale,
                0
            );
            waveGroup.add(particle);
        }
        
        // Position at Reaper's position, at player height level for better collision
        waveGroup.position.copy(reaper.mesh.position);
        waveGroup.position.y = 1.5; // At player chest height for reliable hit
        
        // Calculate direction to target (2D, same height)
        const dirX = targetPlayer.position.x - waveGroup.position.x;
        const dirZ = targetPlayer.position.z - waveGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
        
        // Rotate wave to face target
        waveGroup.lookAt(new THREE.Vector3(targetPlayer.position.x, waveGroup.position.y, targetPlayer.position.z));
        
        G.scene.add(waveGroup);
        
        // Speed for scythe wave - slower, menacing crawl
        const speed = 0.18;
        
        G.fireballs.push({
            mesh: waveGroup,
            velocity: new THREE.Vector3(dirX / length * speed, 0, dirZ / length * speed), // No Y velocity - travels at constant height
            radius: 3.5, // Large hit area for melee wave attack
            damage: 1,
            trail: [],
            lastTrailTime: 0,
            isScytheWave: true,
            spawnTime: Date.now(),
            maxLifetime: 5000 // 5 seconds before fading
        });
    }

    // Helper function to create a fireball from a wizard goblin
    function createWizardFireball(wizard, targetPlayer) {
        const fbTextures = getTerrainTextures(THREE);
        
        // Use ice-themed textures for winter level
        const fireballTexture = G.iceTheme ? fbTextures.fireballIce : fbTextures.fireball;
        const explosionTexture = G.iceTheme ? fbTextures.explosionIce : fbTextures.explosion;
        
        // Create smaller fireball group (60% size of dragon's)
        const fireballGroup = new THREE.Group();
        const fbScale = 0.4;
        
        // Core sphere - purple/magenta tint for wizard magic
        G.coreGeometry = new THREE.SphereGeometry(0.6 * fbScale, 12, 12);
        G.coreMaterial = new THREE.MeshBasicMaterial({ 
            map: fireballTexture,
            transparent: true,
            color: G.iceTheme ? 0x00FFFF : 0xFF00FF // Magenta or cyan tint
        });
        G.core = new THREE.Mesh(G.coreGeometry, G.coreMaterial);
        fireballGroup.add(G.core);
        
        // Outer glow sprite
        const glowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.7,
            color: G.iceTheme ? 0x00FFFF : 0xFF00FF
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(2 * fbScale, 2 * fbScale, 1);
        fireballGroup.add(glow);
        
        // Inner bright glow
        const innerGlowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.9,
            color: G.iceTheme ? 0x88FFFF : 0xFF88FF
        });
        const innerGlow = new THREE.Sprite(innerGlowMaterial);
        innerGlow.scale.set(1.2 * fbScale, 1.2 * fbScale, 1);
        fireballGroup.add(innerGlow);
        
        // Position fireball at wizard's staff/orb position
        fireballGroup.position.copy(wizard.mesh.position);
        if (G.graveyardTheme) {
            // Witch's magic orb is in her left hand - spawn at safe height above terrain
            fireballGroup.position.x -= 0.5;
            fireballGroup.position.z += 0.5;
            // Ensure fireball is at least 2 units above local terrain
            const localTerrain = getTerrainHeight(fireballGroup.position.x, fireballGroup.position.z);
            fireballGroup.position.y = Math.max(wizard.mesh.position.y + 2.4, localTerrain + 2);
        } else {
            // Regular wizard's staff position
            fireballGroup.position.x += 0.9;
            fireballGroup.position.y += 3.2;
            fireballGroup.position.z += 0.3;
        }
        G.scene.add(fireballGroup);
        
        // Calculate direction to target (including Y axis)
        const dirX = targetPlayer.position.x - fireballGroup.position.x;
        const dirY = (targetPlayer.position.y + 1) - fireballGroup.position.y; // Aim at G.player center
        const dirZ = targetPlayer.position.z - fireballGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        
        // Wizard fireballs are slower but still dangerous
        const speed = 0.25;
        
        G.fireballs.push({
            mesh: fireballGroup,
            velocity: new THREE.Vector3(dirX / length * speed, dirY / length * speed, dirZ / length * speed),
            radius: 0.8,
            damage: 1,
            trail: [],
            lastTrailTime: 0,
            isWizardFireball: true,
            spawnTime: Date.now() // Track when spawned to prevent early terrain collision
        });
        
        // Play a sound effect
        Audio.playExplosionSound();
    }

    // Helper function to create a fireball from a lava monster
    function createLavaMonsterFireball(monster, targetPlayer) {
        const fbTextures = getTerrainTextures(THREE);
        const fireballTexture = fbTextures.fireball;
        const explosionTexture = fbTextures.explosion;
        
        const fireballGroup = new THREE.Group();
        const fbScale = 0.5;
        
        // Core sphere - bright orange/yellow lava
        G.coreGeometry = new THREE.SphereGeometry(0.6 * fbScale, 12, 12);
        G.coreMaterial = new THREE.MeshBasicMaterial({ 
            map: fireballTexture,
            transparent: true,
            color: 0xff6600
        });
        G.core = new THREE.Mesh(G.coreGeometry, G.coreMaterial);
        fireballGroup.add(G.core);
        
        // Outer glow sprite - orange
        const glowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.8,
            color: 0xff4400
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(2.5 * fbScale, 2.5 * fbScale, 1);
        fireballGroup.add(glow);
        
        // Inner bright glow - yellow
        const innerGlowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.95,
            color: 0xffaa00
        });
        const innerGlow = new THREE.Sprite(innerGlowMaterial);
        innerGlow.scale.set(1.5 * fbScale, 1.5 * fbScale, 1);
        fireballGroup.add(innerGlow);
        
        // Position fireball at monster's center
        fireballGroup.position.copy(monster.mesh.position);
        fireballGroup.position.y += 1.5;
        G.scene.add(fireballGroup);
        
        // Calculate direction to target
        const dirX = targetPlayer.position.x - fireballGroup.position.x;
        const dirY = (targetPlayer.position.y + 1) - fireballGroup.position.y;
        const dirZ = targetPlayer.position.z - fireballGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        
        const speed = 0.28;
        
        G.fireballs.push({
            mesh: fireballGroup,
            velocity: new THREE.Vector3(dirX / length * speed, dirY / length * speed, dirZ / length * speed),
            radius: 1.0,
            damage: 1,
            trail: [],
            lastTrailTime: 0,
            isLavaMonsterFireball: true
        });
        
        Audio.playExplosionSound();
    }

    // Helper function to create a lava trail (small temporary lava pool)
    function createLavaTrail(x, z, creatorId) {
        const trailGroup = new THREE.Group();
        
        // Glowing lava pool
        const poolGeometry = new THREE.CircleGeometry(GAME_CONFIG.LAVA_TRAIL_RADIUS, 16);
        const poolMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4400,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        pool.rotation.x = -Math.PI / 2;
        pool.position.y = 0.15;
        trailGroup.add(pool);
        
        // Darker crust ring
        const crustGeometry = new THREE.RingGeometry(GAME_CONFIG.LAVA_TRAIL_RADIUS * 0.7, GAME_CONFIG.LAVA_TRAIL_RADIUS, 16);
        const crustMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x4a2010,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const crust = new THREE.Mesh(crustGeometry, crustMaterial);
        crust.rotation.x = -Math.PI / 2;
        crust.position.y = 0.16;
        trailGroup.add(crust);
        
        // Small bubbling particle
        const bubbleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const bubbleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        bubble.position.y = 0.2;
        trailGroup.add(bubble);
        trailGroup.bubble = bubble;
        
        const terrainHeight = getTerrainHeight(x, z);
        trailGroup.position.set(x, terrainHeight, z);
        G.scene.add(trailGroup);
        
        const trail = {
            id: Date.now() + Math.random(),
            mesh: trailGroup,
            x: x,
            z: z,
            radius: GAME_CONFIG.LAVA_TRAIL_RADIUS,
            createdAt: Date.now(),
            duration: GAME_CONFIG.LAVA_TRAIL_DURATION,
            pool: pool,
            crust: crust,
            creatorId: creatorId
        };
        
        G.lavaTrails.push(trail);
        
        // Sync to other player in multiplayer
        if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost) {
            multiplayerManager.sendGameEvent('lavaTrailCreate', {
                id: trail.id,
                x: x,
                z: z,
                creatorId: creatorId
            });
        }
        
        return trail;
    }

    // Helper function to create a tornado from a mummy (or waterspout in water level)
    function createMummyTornado(mummy, targetPlayer) {
        const tornadoGroup = new THREE.Group();

        // Use water colors for waterspout in water theme
        const outerColor = G.waterTheme ? 0x1E90FF : 0xc4a14a;  // Dodger blue or sandy
        const innerColor = G.waterTheme ? 0x87CEEB : 0xe8c36a;  // Sky blue or light sand
        const particleColor = G.waterTheme ? 0xB0E0E6 : 0xc4a14a; // Powder blue or sandy

        // Create tornado/waterspout cone shape - moderate size for water level
        const coneRadius = G.waterTheme ? 1.5 : 0.8;
        const coneHeight = G.waterTheme ? 8.0 : 3.0;
        const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 12, 4, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: outerColor,
            transparent: true,
            opacity: G.waterTheme ? 0.45 : 0.7,
            side: THREE.DoubleSide
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.rotation.x = Math.PI; // Point up
        cone.position.y = G.waterTheme ? coneHeight / 2 : 1.5;
        tornadoGroup.add(cone);

        // Inner spinning cone
        const innerRadius = G.waterTheme ? 0.9 : 0.5;
        const innerHeight = G.waterTheme ? 6.5 : 2.5;
        const innerConeGeometry = new THREE.ConeGeometry(innerRadius, innerHeight, 12, 4, true);
        const innerConeMaterial = new THREE.MeshBasicMaterial({
            color: innerColor,
            transparent: true,
            opacity: G.waterTheme ? 0.55 : 0.8,
            side: THREE.DoubleSide
        });
        const innerCone = new THREE.Mesh(innerConeGeometry, innerConeMaterial);
        innerCone.rotation.x = Math.PI;
        innerCone.position.y = G.waterTheme ? innerHeight / 2 : 1.25;
        tornadoGroup.add(innerCone);

        // Add dust/water particles
        const dustGroup = new THREE.Group();
        const numParticles = G.waterTheme ? 30 : 25;
        const particleScale = G.waterTheme ? 1.5 : 1;
        for (let i = 0; i < numParticles; i++) {
            const dustGeometry = new THREE.SphereGeometry((0.1 + Math.random() * 0.1) * particleScale, 4, 4);
            const dustMaterial = new THREE.MeshBasicMaterial({
                color: particleColor,
                transparent: true,
                opacity: 0.5 + Math.random() * 0.3
            });
            const dust = new THREE.Mesh(dustGeometry, dustMaterial);
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * coneHeight;
            const radius = (0.2 + (height / coneHeight) * coneRadius) * particleScale;
            dust.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
            dustGroup.add(dust);
        }
        tornadoGroup.add(dustGroup);
        tornadoGroup.dustGroup = dustGroup;
        tornadoGroup.innerCone = innerCone;
        tornadoGroup.outerCone = cone;

        // Position at mummy
        tornadoGroup.position.copy(mummy.mesh.position);
        tornadoGroup.position.y += 0.5;
        G.scene.add(tornadoGroup);
        
        // Calculate direction to target
        const dirX = targetPlayer.position.x - tornadoGroup.position.x;
        const dirZ = targetPlayer.position.z - tornadoGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
        
        const speed = 0.18;
        
        G.mummyTornados.push({
            mesh: tornadoGroup,
            velocity: new THREE.Vector3(dirX / length * speed, 0, dirZ / length * speed),
            radius: G.waterTheme ? 1.5 : 1.0,  // Moderate collision for waterspouts
            damage: 1,
            spinPhase: 0
        });

        // Play a whoosh sound
        Audio.playExplosionSound();
    }

    // Wild tornado spawning for out-of-bounds players
    function spawnWildTornado(targetX, targetZ) {
        // Spawn tornado from a random direction outside the visible area
        const angle = Math.random() * Math.PI * 2;
        const spawnDistance = 40 + Math.random() * 20;
        const spawnX = targetX + Math.cos(angle) * spawnDistance;
        const spawnZ = targetZ + Math.sin(angle) * spawnDistance;

        // Use water colors for waterspout in water theme
        const outerColor = G.waterTheme ? 0x1E90FF : 0xc4a14a;
        const innerColor = G.waterTheme ? 0x87CEEB : 0xe8c36a;
        const particleColor = G.waterTheme ? 0xB0E0E6 : 0xc4a14a;

        const tornadoGroup = new THREE.Group();

        // Create tornado/waterspout cone shape - moderate size for water level
        const coneRadius = G.waterTheme ? 1.5 : 0.8;
        const coneHeight = G.waterTheme ? 8.0 : 3.0;
        const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 12, 4, true);
        const coneMaterial = new THREE.MeshBasicMaterial({
            color: outerColor,
            transparent: true,
            opacity: G.waterTheme ? 0.45 : 0.7,
            side: THREE.DoubleSide
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.rotation.x = Math.PI;
        cone.position.y = G.waterTheme ? coneHeight / 2 : 1.5;
        tornadoGroup.add(cone);

        // Inner spinning cone
        const innerRadius = G.waterTheme ? 0.9 : 0.5;
        const innerHeight = G.waterTheme ? 6.5 : 2.5;
        const innerConeGeometry = new THREE.ConeGeometry(innerRadius, innerHeight, 12, 4, true);
        const innerConeMaterial = new THREE.MeshBasicMaterial({
            color: innerColor,
            transparent: true,
            opacity: G.waterTheme ? 0.55 : 0.8,
            side: THREE.DoubleSide
        });
        const innerCone = new THREE.Mesh(innerConeGeometry, innerConeMaterial);
        innerCone.rotation.x = Math.PI;
        innerCone.position.y = G.waterTheme ? innerHeight / 2 : 1.25;
        tornadoGroup.add(innerCone);

        // Add dust/water particles
        const dustGroup = new THREE.Group();
        const numParticles = G.waterTheme ? 30 : 25;
        const particleScale = G.waterTheme ? 1.5 : 1;
        for (let i = 0; i < numParticles; i++) {
            const dustGeometry = new THREE.SphereGeometry((0.1 + Math.random() * 0.1) * particleScale, 4, 4);
            const dustMaterial = new THREE.MeshBasicMaterial({
                color: particleColor,
                transparent: true,
                opacity: 0.5 + Math.random() * 0.3
            });
            const dust = new THREE.Mesh(dustGeometry, dustMaterial);
            const dustAngle = Math.random() * Math.PI * 2;
            const height = Math.random() * coneHeight;
            const radius = (0.2 + (height / coneHeight) * coneRadius) * particleScale;
            dust.position.set(Math.cos(dustAngle) * radius, height, Math.sin(dustAngle) * radius);
            dustGroup.add(dust);
        }
        tornadoGroup.add(dustGroup);
        tornadoGroup.dustGroup = dustGroup;
        tornadoGroup.innerCone = innerCone;
        tornadoGroup.outerCone = cone;

        const terrainHeight = getTerrainHeight(spawnX, spawnZ);
        tornadoGroup.position.set(spawnX, terrainHeight + 0.5, spawnZ);
        G.scene.add(tornadoGroup);
        
        // Calculate direction to target player
        const dirX = targetX - spawnX;
        const dirZ = targetZ - spawnZ;
        const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
        
        const speed = 0.22; // Slightly faster than mummy tornados
        
        G.mummyTornados.push({
            mesh: tornadoGroup,
            velocity: new THREE.Vector3(dirX / length * speed, 0, dirZ / length * speed),
            radius: G.waterTheme ? 1.5 : 1.0,  // Moderate collision for waterspouts
            damage: 1,
            spinPhase: 0,
            isWild: true // Mark as wild tornado
        });
    }
    
    function checkAndSpawnWildTornados() {
        if (!G.levelConfig.safeZoneBounds) return;
        
        const bounds = G.levelConfig.safeZoneBounds;
        const px = G.playerGroup.position.x;
        const pz = G.playerGroup.position.z;
        
        // Check if player is outside safe zone
        const outsideX = px < bounds.minX ? bounds.minX - px : (px > bounds.maxX ? px - bounds.maxX : 0);
        const outsideZ = pz < bounds.minZ ? bounds.minZ - pz : (pz > bounds.maxZ ? pz - bounds.maxZ : 0);
        const distanceOutside = Math.sqrt(outsideX * outsideX + outsideZ * outsideZ);
        
        if (distanceOutside > 0) {
            const now = Date.now();
            // Spawn rate increases the further out you are
            // At 10 units out: every 2 seconds, at 50 units out: every 0.4 seconds
            const spawnInterval = Math.max(400, G.wildTornadoBaseInterval - distanceOutside * 40);
            
            if (now - G.lastWildTornadoSpawn > spawnInterval) {
                // Spawn 1-3 tornados based on distance
                const tornadoCount = Math.min(3, 1 + Math.floor(distanceOutside / 20));
                for (let i = 0; i < tornadoCount; i++) {
                    spawnWildTornado(px, pz);
                }
                G.lastWildTornadoSpawn = now;
            }
        }
    }

    // Update tornados
    function updateMummyTornados() {
        for (let i = G.mummyTornados.length - 1; i >= 0; i--) {
            const tornado = G.mummyTornados[i];
            tornado.mesh.position.add(tornado.velocity);
            
            // Spin the tornado continuously
            tornado.spinPhase += 0.35;
            tornado.mesh.outerCone.rotation.y = tornado.spinPhase;
            if (tornado.mesh.innerCone) {
                tornado.mesh.innerCone.rotation.y = -tornado.spinPhase * 1.8;
            }
            
            // Animate dust particles
            if (tornado.mesh.dustGroup) {
                tornado.mesh.dustGroup.children.forEach((dust, idx) => {
                    const baseAngle = (idx / 25) * Math.PI * 2;
                    const angle = baseAngle + tornado.spinPhase;
                    const height = dust.position.y;
                    const radius = 0.25 + (height / 3.0) * 0.8;
                    dust.position.x = Math.cos(angle) * radius;
                    dust.position.z = Math.sin(angle) * radius;
                });
            }
            
            // Check collision with player
            const px = G.playerGroup.position.x;
            const pz = G.playerGroup.position.z;
            const dist = Math.sqrt(
                (tornado.mesh.position.x - px) ** 2 +
                (tornado.mesh.position.z - pz) ** 2
            );
            
            if (dist < tornado.radius + 0.8) {
                // Player hit by tornado
                if (!godMode) {
                    G.playerHealth -= tornado.damage;
                    G.damageFlashTime = Date.now();
                    
                    // Start tornado spin visual effect
                    G.tornadoSpinActive = true;
                    G.tornadoSpinStartTime = Date.now();
                    
                    if (G.playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    }
                }
                G.scene.remove(tornado.mesh);
                G.mummyTornados.splice(i, 1);
                continue;
            }
            
            // Check collision with other player in multiplayer
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh && otherPlayerMesh.visible) {
                const otherDist = Math.sqrt(
                    (tornado.mesh.position.x - otherPlayerMesh.position.x) ** 2 +
                    (tornado.mesh.position.z - otherPlayerMesh.position.z) ** 2
                );
                if (otherDist < tornado.radius + 0.8) {
                    // Host notifies client of tornado hit damage
                    if (multiplayerManager.isHost) {
                        multiplayerManager.sendGameEvent('tornadoHit', {});
                    }
                    G.scene.remove(tornado.mesh);
                    G.mummyTornados.splice(i, 1);
                    continue;
                }
            }
            
            // Check collision with player 2 in native splitscreen
            if (isNativeSplitscreen && G.player2Group) {
                const p2Dist = Math.sqrt(
                    (tornado.mesh.position.x - G.player2Group.position.x) ** 2 +
                    (tornado.mesh.position.z - G.player2Group.position.z) ** 2
                );
                if (p2Dist < tornado.radius + 0.8) {
                    G.player2Health -= tornado.damage;
                    G.damageFlashTime2 = Date.now();
                    if (G.player2Health <= 0) {
                        // Player 2 died
                    }
                    G.scene.remove(tornado.mesh);
                    G.mummyTornados.splice(i, 1);
                    continue;
                }
            }
            
            // Check collision with canyon walls
            let hitCanyonWall = false;
            for (const wall of G.canyonWalls) {
                const cos = Math.cos(-wall.rotation);
                const sin = Math.sin(-wall.rotation);
                const dx = tornado.mesh.position.x - wall.x;
                const dz = tornado.mesh.position.z - wall.z;
                const localX = dx * cos - dz * sin;
                const localZ = dx * sin + dz * cos;
                
                const halfWidth = wall.width / 2;
                const halfDepth = wall.depth / 2;
                
                if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth) {
                    hitCanyonWall = true;
                    break;
                }
            }
            
            if (hitCanyonWall) {
                G.scene.remove(tornado.mesh);
                G.mummyTornados.splice(i, 1);
                continue;
            }
            
            // Remove if out of bounds or too far
            const tornadoDistFromOrigin = Math.sqrt(
                tornado.mesh.position.x ** 2 + tornado.mesh.position.z ** 2
            );
            if (tornadoDistFromOrigin > 300) {
                G.scene.remove(tornado.mesh);
                G.mummyTornados.splice(i, 1);
            }
        }
    }

    // Update lava trails (fade and check collision)
    function updateLavaTrails() {
        const now = Date.now();
        const px = G.playerGroup.position.x;
        const pz = G.playerGroup.position.z;
        
        for (let i = G.lavaTrails.length - 1; i >= 0; i--) {
            const trail = G.lavaTrails[i];
            const elapsed = now - trail.createdAt;
            const progress = elapsed / trail.duration;
            
            // Fade out over time
            if (progress < 1) {
                const opacity = 1 - progress;
                const fadeMultiplier = Math.pow(opacity, 0.5); // Slower initial fade
                
                if (trail.pool) {
                    trail.pool.material.opacity = 0.9 * fadeMultiplier;
                }
                if (trail.crust) {
                    trail.crust.material.opacity = 0.6 * fadeMultiplier;
                }
                
                // Bubble animation
                if (trail.mesh.bubble) {
                    trail.mesh.bubble.position.y = 0.2 + Math.sin(now * 0.01 + i) * 0.15;
                    trail.mesh.bubble.material.opacity = 0.8 * fadeMultiplier;
                }
                
                // Shrink slightly as it fades
                const scale = 0.7 + 0.3 * fadeMultiplier;
                trail.mesh.scale.setScalar(scale);
                
                // Check collision with local player (unless gliding)
                const dist = Math.sqrt((px - trail.x) ** 2 + (pz - trail.z) ** 2);
                if (dist < trail.radius * scale - 0.3 && !godMode && !G.player.isGliding) {
                    // Player stepped in lava trail - instant death
                    if (!gameDead) {
                        G.playerHealth = 0;
                        gameDead = true;
                        Audio.stopBackgroundMusic();
                        Audio.playDeathSound();
                    }
                }

                // Check collision with other player in multiplayer (host only, unless they're gliding)
                if (multiplayerManager && multiplayerManager.isHost && multiplayerManager.isConnected() && otherPlayerMesh && otherPlayerMesh.visible) {
                    const otherDist = Math.sqrt(
                        (otherPlayerMesh.position.x - trail.x) ** 2 +
                        (otherPlayerMesh.position.z - trail.z) ** 2
                    );
                    if (otherDist < trail.radius * scale - 0.3 && !otherPlayerIsGliding) {
                        // Notify client of lava trail death
                        multiplayerManager.sendGameEvent('lavaTrailDeath', {});
                    }
                }
                
                // Check collision with player 2 in native splitscreen (unless gliding)
                if (isNativeSplitscreen && G.player2Group && G.player2 && !G.player2.isGliding) {
                    const p2Dist = Math.sqrt(
                        (G.player2Group.position.x - trail.x) ** 2 +
                        (G.player2Group.position.z - trail.z) ** 2
                    );
                    if (p2Dist < trail.radius * scale - 0.3) {
                        G.player2Health = 0;
                        G.damageFlashTime2 = Date.now();
                    }
                }
            } else {
                // Trail expired, remove it
                G.scene.remove(trail.mesh);
                G.lavaTrails.splice(i, 1);
            }
        }
    }

    function updateFireballs() {
        const now = Date.now();
        
        // Update fireballs
        for (let i = G.fireballs.length - 1; i >= 0; i--) {
            const fireball = G.fireballs[i];
            fireball.mesh.position.add(fireball.velocity);
            
            // Add flame trail particles
            if (fireball.trail && now - fireball.lastTrailTime > 30) {
                // Clone pre-cached material for trail
                const trailMaterial = G.explosionBaseMaterial.clone();
                trailMaterial.opacity = 0.8;
                const trailSprite = new THREE.Sprite(trailMaterial);
                const trailSize = 0.8 + Math.random() * 0.5;
                trailSprite.scale.set(trailSize, trailSize, 1);
                trailSprite.position.copy(fireball.mesh.position);
                // Offset slightly behind the fireball
                trailSprite.position.x -= fireball.velocity.x * 2;
                trailSprite.position.y -= fireball.velocity.y * 2;
                trailSprite.position.z -= fireball.velocity.z * 2;
                G.scene.add(trailSprite);
                fireball.trail.push({ sprite: trailSprite, life: 15, initialSize: trailSize });
                fireball.lastTrailTime = now;
            }
            
            // Update trail particles
            if (fireball.trail) {
                for (let t = fireball.trail.length - 1; t >= 0; t--) {
                    const trail = fireball.trail[t];
                    trail.life--;
                    const lifeRatio = trail.life / 15;
                    trail.sprite.material.opacity = lifeRatio * 0.8;
                    const scale = trail.initialSize * (0.3 + lifeRatio * 0.7);
                    trail.sprite.scale.set(scale, scale, 1);
                    if (trail.life <= 0) {
                        G.scene.remove(trail.sprite);
                        fireball.trail.splice(t, 1);
                    }
                }
            }
            
            // Pulse the glow effects
            if (fireball.mesh.children && fireball.mesh.children.length > 1) {
                const pulseScale = 1 + Math.sin(now * 0.02) * 0.15;
                fireball.mesh.children[1].scale.set(3 * pulseScale, 3 * pulseScale, 1);
                fireball.mesh.children[2].scale.set(1.8 * pulseScale, 1.8 * pulseScale, 1);
            }
            
            // Check collision with player (only host applies damage)
            const distToPlayer = new THREE.Vector2(
                G.playerGroup.position.x - fireball.mesh.position.x,
                G.playerGroup.position.z - fireball.mesh.position.z
            ).length();
            
            if (distToPlayer < fireball.radius) {
                // Only host applies damage to host player
                if (!godMode && (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost)) {
                    G.playerHealth -= fireball.damage;
                    G.damageFlashTime = Date.now();
                    if (G.playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    } else {
                        Audio.playStuckSound();
                    }
                }
                
                createFireballExplosion(fireball.mesh.position.x, fireball.mesh.position.y, fireball.mesh.position.z);
                // Clean up trail particles
                if (fireball.trail) {
                    fireball.trail.forEach(t => G.scene.remove(t.sprite));
                }
                G.scene.remove(fireball.mesh);
                G.fireballs.splice(i, 1);
                continue;
            }
            
            // Check collision with other player (multiplayer)
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = new THREE.Vector2(
                    otherPlayerMesh.position.x - fireball.mesh.position.x,
                    otherPlayerMesh.position.z - fireball.mesh.position.z
                ).length();
                
                if (distToOther < fireball.radius) {
                    // Let host handle damage
                    if (multiplayerManager.isHost) {
                        // Notify client of damage
                        multiplayerManager.sendGameEvent('playerDamage', {});
                    }
                    createFireballExplosion(fireball.mesh.position.x, fireball.mesh.position.y, fireball.mesh.position.z);
                    // Clean up trail particles
                    if (fireball.trail) {
                        fireball.trail.forEach(t => G.scene.remove(t.sprite));
                    }
                    G.scene.remove(fireball.mesh);
                    G.fireballs.splice(i, 1);
                    continue;
                }
            }
            
            // Check collision with player 2 (native splitscreen)
            if (isNativeSplitscreen && G.player2Group) {
                const distToP2 = new THREE.Vector2(
                    G.player2Group.position.x - fireball.mesh.position.x,
                    G.player2Group.position.z - fireball.mesh.position.z
                ).length();
                
                if (distToP2 < fireball.radius) {
                    G.player2Health -= fireball.damage;
                    G.damageFlashTime2 = Date.now();
                    if (G.player2Health <= 0) {
                        // Player 2 died
                    } else {
                        Audio.playStuckSound();
                    }
                    createFireballExplosion(fireball.mesh.position.x, fireball.mesh.position.y, fireball.mesh.position.z);
                    if (fireball.trail) {
                        fireball.trail.forEach(t => G.scene.remove(t.sprite));
                    }
                    G.scene.remove(fireball.mesh);
                    G.fireballs.splice(i, 1);
                    continue;
                }
            }
            
            // Remove if out of bounds or hit ground
            const terrainHeight = getTerrainHeight(fireball.mesh.position.x, fireball.mesh.position.z);
            
            // Check scythe wave lifetime - remove after max lifetime
            if (fireball.isScytheWave && fireball.maxLifetime) {
                const lifeElapsed = Date.now() - (fireball.spawnTime || 0);
                if (lifeElapsed > fireball.maxLifetime) {
                    // Fade out and remove
                    if (fireball.trail) {
                        fireball.trail.forEach(t => G.scene.remove(t.sprite));
                    }
                    G.scene.remove(fireball.mesh);
                    G.fireballs.splice(i, 1);
                    continue;
                }
            }
            
            // Grace period for wizard/witch fireballs - skip terrain collision entirely during grace
            const graceTime = fireball.isWizardFireball || fireball.isScytheWave ? 800 : 0;
            const elapsed = Date.now() - (fireball.spawnTime || 0);
            const inGracePeriod = elapsed < graceTime;
            
            // Check collision with mountains (if level has them) - skip during grace period
            // Also skip for wizard fireballs and scythe waves - magical projectiles pass through walls
            let hitMountain = false;
            if (!inGracePeriod && !fireball.isWizardFireball && !fireball.isScytheWave && G.levelConfig.mountains && G.levelConfig.mountains.length > 0) {
                for (const mtn of G.levelConfig.mountains) {
                    const distToMountain = Math.sqrt(
                        (fireball.mesh.position.x - mtn.x) ** 2 +
                        (fireball.mesh.position.z - mtn.z) ** 2
                    );
                    // Mountain collision: within radius AND below mountain height
                    const mtnHeight = mtn.height || 15;
                    if (distToMountain < mtn.width / 2 && fireball.mesh.position.y < mtnHeight) {
                        hitMountain = true;
                        break;
                    }
                }
            }
            
            // Check collision with canyon walls - skip during grace period
            // Also skip for wizard fireballs and scythe waves - magical projectiles pass through walls
            let hitCanyonWall = false;
            if (!inGracePeriod && !fireball.isWizardFireball && !fireball.isScytheWave) {
                for (const wall of G.canyonWalls) {
                    // Transform fireball position into wall's local space
                    const cos = Math.cos(-wall.rotation);
                    const sin = Math.sin(-wall.rotation);
                    const dx = fireball.mesh.position.x - wall.x;
                    const dz = fireball.mesh.position.z - wall.z;
                    const localX = dx * cos - dz * sin;
                    const localZ = dx * sin + dz * cos;

                    // Check if inside wall bounds
                    const halfWidth = wall.width / 2;
                    const halfDepth = wall.depth / 2;

                    if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth && fireball.mesh.position.y < wall.height) {
                        hitCanyonWall = true;
                        break;
                    }
                }
            }

            // Check collision with impassable cliffs - skip during grace period
            // Also skip for wizard fireballs and scythe waves - magical projectiles pass through obstacles
            let hitCliff = false;
            if (!inGracePeriod && !fireball.isWizardFireball && !fireball.isScytheWave) {
                for (const cliff of G.impassableCliffs) {
                    const distToCliff = Math.sqrt(
                        (fireball.mesh.position.x - cliff.x) ** 2 +
                        (fireball.mesh.position.z - cliff.z) ** 2
                    );
                    if (distToCliff < cliff.radius && fireball.mesh.position.y < cliff.height) {
                        hitCliff = true;
                        break;
                    }
                }
            }

            // Check terrain collision - skip during grace period and for scythe waves
            const hitTerrain = !inGracePeriod && !fireball.isScytheWave && fireball.mesh.position.y < terrainHeight;
            
            if (hitTerrain || hitMountain || hitCanyonWall || hitCliff ||
                Math.abs(fireball.mesh.position.x) > GAME_CONFIG.WORLD_BOUND ||
                Math.abs(fireball.mesh.position.z) > GAME_CONFIG.WORLD_BOUND) {
                createFireballExplosion(fireball.mesh.position.x, terrainHeight, fireball.mesh.position.z);
                // Clean up trail particles
                if (fireball.trail) {
                    fireball.trail.forEach(t => G.scene.remove(t.sprite));
                }
                G.scene.remove(fireball.mesh);
                G.fireballs.splice(i, 1);
            }
        }
    }

    function checkCollisions(prevPos) {
        let isStuck = false;
        const px = G.playerGroup.position.x;
        const pz = G.playerGroup.position.z;
        
        // Lava pool collision - instant death (unless gliding over)
        G.lavaPools.forEach(pool => {
            const dist = Math.sqrt(
                (px - pool.x) ** 2 +
                (pz - pool.z) ** 2
            );
            // Player can fly over lava if gliding
            if (dist < pool.radius - 0.5 && !godMode && !G.player.isGliding) {
                // Player fell into lava - instant death
                if (!gameDead) {
                    G.playerHealth = 0;
                    gameDead = true;
                    Audio.stopBackgroundMusic();
                    Audio.playDeathSound();
                }
            }

            // Check if other player (client) is in lava pool (unless they're gliding)
            if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost && otherPlayerMesh.visible) {
                const otherDist = Math.sqrt(
                    (otherPlayerMesh.position.x - pool.x) ** 2 +
                    (otherPlayerMesh.position.z - pool.z) ** 2
                );
                if (otherDist < pool.radius - 0.5 && !otherPlayerIsGliding) {
                    // Notify client of lava pool death
                    multiplayerManager.sendGameEvent('lavaPoolDeath', {});
                }
            }
            
            // Check player 2 in native splitscreen
            if (isNativeSplitscreen && G.player2Group && G.player2 && !G.player2.isGliding) {
                const p2Dist = Math.sqrt(
                    (G.player2Group.position.x - pool.x) ** 2 +
                    (G.player2Group.position.z - pool.z) ** 2
                );
                if (p2Dist < pool.radius - 0.5) {
                    G.player2Health = 0;
                    G.damageFlashTime2 = Date.now();
                }
            }
        });

        // Crevice collision - falling into deep pits (unless gliding)
        G.crevices.forEach(crevice => {
            // Transform player position into crevice's local space (to handle rotation)
            const cos = Math.cos(-crevice.rotation);
            const sin = Math.sin(-crevice.rotation);
            const dx = px - crevice.x;
            const dz = pz - crevice.z;
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;

            // Check if inside crevice bounds
            const halfWidth = crevice.width / 2;
            const halfLength = crevice.length / 2;

            if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfLength && !godMode && !G.player.isGliding) {
                // Player fell into crevice - instant death
                if (!gameDead) {
                    G.playerHealth = 0;
                    gameDead = true;
                    Audio.stopBackgroundMusic();
                    Audio.playDeathSound();
                }
            }

            // Check if other player (client) fell into crevice (unless they're gliding)
            if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost && otherPlayerMesh.visible) {
                const otherDx = otherPlayerMesh.position.x - crevice.x;
                const otherDz = otherPlayerMesh.position.z - crevice.z;
                const otherLocalX = otherDx * cos - otherDz * sin;
                const otherLocalZ = otherDx * sin + otherDz * cos;

                if (Math.abs(otherLocalX) < halfWidth && Math.abs(otherLocalZ) < halfLength && !otherPlayerIsGliding) {
                    // Notify client of crevice death
                    multiplayerManager.sendGameEvent('creviceDeath', {});
                }
            }
            
            // Check player 2 in native splitscreen
            if (isNativeSplitscreen && G.player2Group && G.player2 && !G.player2.isGliding) {
                const p2Dx = G.player2Group.position.x - crevice.x;
                const p2Dz = G.player2Group.position.z - crevice.z;
                const p2LocalX = p2Dx * cos - p2Dz * sin;
                const p2LocalZ = p2Dx * sin + p2Dz * cos;
                
                if (Math.abs(p2LocalX) < halfWidth && Math.abs(p2LocalZ) < halfLength) {
                    G.player2Health = 0;
                    G.damageFlashTime2 = Date.now();
                }
            }
        });

        // Mountains (only if level has them) - in water level, can glide over them
        if (G.levelConfig.mountains && G.levelConfig.mountains.length > 0) {
            const canPassMountains = G.waterTheme && G.player.isGliding;
            if (!canPassMountains) {
                G.levelConfig.mountains.forEach(mtn => {
                    // For graveyard theme walls, use rectangular (box) collision
                    if (G.graveyardTheme) {
                        const wallWidth = mtn.width;
                        const wallDepth = Math.min(mtn.width * 0.15, 8);
                        const halfW = wallWidth / 2 + 1.5;
                        const halfD = wallDepth / 2 + 1.5;
                        const dx = Math.abs(G.playerGroup.position.x - mtn.x);
                        const dz = Math.abs(G.playerGroup.position.z - mtn.z);
                        if (dx < halfW && dz < halfD) {
                            G.playerGroup.position.copy(prevPos);
                            isStuck = true;
                        }
                    } else {
                        // Circular collision for regular cone mountains
                        const dist = new THREE.Vector2(
                            G.playerGroup.position.x - mtn.x,
                            G.playerGroup.position.z - mtn.z
                        ).length();
                        if (dist < mtn.width/2 + 1.5) {
                            G.playerGroup.position.copy(prevPos);
                            isStuck = true;
                        }
                    }
                });
            }
        }

        // Impassable cliffs - ALWAYS block, even when gliding
        G.impassableCliffs.forEach(cliff => {
            const dist = new THREE.Vector2(
                G.playerGroup.position.x - cliff.x,
                G.playerGroup.position.z - cliff.z
            ).length();
            if (dist < cliff.radius + 1.5) {
                G.playerGroup.position.copy(prevPos);
                isStuck = true;
            }
        });

        // Hills - in water level, player is on a boat and can't go on islands (unless gliding)
        if (G.waterTheme && !G.player.isGliding && G.levelConfig.hills && G.levelConfig.hills.length > 0) {
            G.levelConfig.hills.forEach(hill => {
                const dist = new THREE.Vector2(
                    G.playerGroup.position.x - hill.x,
                    G.playerGroup.position.z - hill.z
                ).length();
                if (dist < hill.radius + 1.0) {
                    G.playerGroup.position.copy(prevPos);
                    isStuck = true;
                }
            });
        }

        // Rocks
        G.rocks.forEach(rock => {
            const dist = new THREE.Vector2(
                G.playerGroup.position.x - rock.mesh.position.x,
                G.playerGroup.position.z - rock.mesh.position.z
            ).length();
            if (dist < rock.radius + 0.8) {
                G.playerGroup.position.copy(prevPos);
                isStuck = true;
            }
        });
        
        // Boulders
        G.boulders.forEach(boulder => {
            const dist = new THREE.Vector2(
                G.playerGroup.position.x - boulder.mesh.position.x,
                G.playerGroup.position.z - boulder.mesh.position.z
            ).length();
            if (dist < boulder.radius + 0.8) {
                G.playerGroup.position.copy(prevPos);
                isStuck = true;
            }
        });
        
        // Canyon walls - box collision
        G.canyonWalls.forEach(wall => {
            // Transform player position into wall's local space (accounting for rotation)
            const cos = Math.cos(-wall.rotation);
            const sin = Math.sin(-wall.rotation);
            const dx = G.playerGroup.position.x - wall.x;
            const dz = G.playerGroup.position.z - wall.z;
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;
            
            // Check if inside wall bounds (with player radius buffer)
            const halfWidth = wall.width / 2 + 1.0;
            const halfDepth = wall.depth / 2 + 1.0;
            
            if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth) {
                G.playerGroup.position.copy(prevPos);
                isStuck = true;
            }
        });
        
        // Trees
        G.trees.forEach(tree => {
            const dist = new THREE.Vector2(
                G.playerGroup.position.x - tree.mesh.position.x,
                G.playerGroup.position.z - tree.mesh.position.z
            ).length();
            if (dist < tree.radius + 0.8) {
                G.playerGroup.position.copy(prevPos);
                isStuck = true;
            }
        });
        
        // Play stuck sound
        if (isStuck) {
            const now = Date.now();
            if (!checkCollisions.lastStuckSound || now - checkCollisions.lastStuckSound > 1000) {
                Audio.playStuckSound();
                checkCollisions.lastStuckSound = now;
            }
        }
        
        // Goblin collision damage
        const now = Date.now();
        G.goblins.forEach(gob => {
            if (!gob.alive) return;
            
            // Check if frozen
            if (gob.frozen && Date.now() < gob.frozenUntil) {
                return; // Skip damage while frozen
            }
            
            const distToGob = new THREE.Vector2(
                G.playerGroup.position.x - gob.mesh.position.x,
                G.playerGroup.position.z - gob.mesh.position.z
            ).length();
            
            // Check if player is in ice berg (safe zone) - only if iceBerg exists
            const playerInIceBerg = G.iceBerg ? Math.sqrt(
                Math.pow(G.playerGroup.position.x - G.iceBerg.position.x, 2) +
                Math.pow(G.playerGroup.position.z - G.iceBerg.position.z, 2)
            ) < G.iceBerg.radius : false;
            
            if (playerInIceBerg) {
                return; // Don't damage G.player in ice berg
            }
            
            if (distToGob < gob.radius + 1) {
                if (!godMode && now - G.lastDamageTime > G.damageCooldown) {
                    // Trigger giant attack animation and sound BEFORE damage
                    if (gob.isGiant) {
                        gob.isAttacking = true;
                        gob.attackAnimationProgress = 0;
                        Audio.playGiantAttackSound();
                    }
                    
                    G.playerHealth--;
                    G.lastDamageTime = now;
                    G.damageFlashTime = now;
                    
                    if (G.playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    } else {
                        // Play danger sound
                        Audio.playStuckSound();
                    }
                }
            }
            
            // Animate octopus tentacles in water theme
            if (G.waterTheme && gob.isGuardian && gob.mesh.tentacles) {
                const wavePhase = Date.now() * 0.003;
                gob.mesh.tentacles.forEach((tentacleData, idx) => {
                    const wave = Math.sin(wavePhase + idx * 0.5) * 0.4;
                    tentacleData.mesh.rotation.z = tentacleData.baseZ + wave;
                    tentacleData.mesh.rotation.x = tentacleData.baseX + wave * 0.5;
                });
            }
            
            // Update giant attack animation
            if (gob.isGiant && gob.isAttacking && !gob.frozen) {
                gob.attackAnimationProgress += 0.12;
                
                // Extra camera shake during attack
                const distToPlayer = new THREE.Vector2(
                    G.playerGroup.position.x - gob.mesh.position.x,
                    G.playerGroup.position.z - gob.mesh.position.z
                ).length();
                if (distToPlayer < 30) {
                    const attackShake = (1 - distToPlayer / 30) * 5;
                    G.camera.position.x += (Math.random() - 0.5) * attackShake;
                    G.camera.position.y += (Math.random() - 0.5) * attackShake;
                    G.camera.position.z += (Math.random() - 0.5) * attackShake;
                }
                
                // Dramatic slam animation - wind up, slam down, shake
                if (gob.attackAnimationProgress < 1.0) {
                    const t = gob.attackAnimationProgress;
                    
                    if (t < 0.35) {
                        // Wind up - raise arms high and lean back
                        const windUp = t / 0.35;
                        const easeOut = 1 - Math.pow(1 - windUp, 3);
                        gob.mesh.leftArm.rotation.x = -easeOut * 1.4;
                        gob.mesh.rightArm.rotation.x = -easeOut * 1.4;
                        gob.mesh.leftArm.rotation.z = 0.3 + easeOut * 0.4;
                        gob.mesh.rightArm.rotation.z = -0.3 - easeOut * 0.4;
                        gob.mesh.leftFist.position.y = 1.8 + easeOut * 4.0;
                        gob.mesh.rightFist.position.y = 1.8 + easeOut * 4.0;
                        gob.mesh.position.y = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z) - easeOut * 0.3;
                    } else if (t < 0.5) {
                        // Slam down - fast downward motion
                        const slam = (t - 0.35) / 0.15;
                        const easeIn = Math.pow(slam, 2.5);
                        const armAngle = -1.4 + easeIn * 2.2;
                        gob.mesh.leftArm.rotation.x = armAngle;
                        gob.mesh.rightArm.rotation.x = armAngle;
                        gob.mesh.leftArm.rotation.z = 0.7 - easeIn * 0.9;
                        gob.mesh.rightArm.rotation.z = -0.7 + easeIn * 0.9;
                        gob.mesh.leftFist.position.y = 5.8 - easeIn * 5.0;
                        gob.mesh.rightFist.position.y = 5.8 - easeIn * 5.0;
                        gob.mesh.leftFist.position.z = easeIn * 1.2;
                        gob.mesh.rightFist.position.z = easeIn * 1.2;
                        gob.mesh.position.y = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z) - 0.3 + easeIn * 0.5;
                    } else {
                        // Recovery and shake
                        const recover = (t - 0.5) / 0.5;
                        const shake = Math.sin(recover * Math.PI * 4) * (1 - recover) * 0.15;
                        const easeBack = 1 - Math.pow(1 - recover, 2);
                        gob.mesh.leftArm.rotation.x = 0.8 - easeBack * 0.8;
                        gob.mesh.rightArm.rotation.x = 0.8 - easeBack * 0.8;
                        gob.mesh.leftArm.rotation.z = -0.2 + easeBack * 0.5;
                        gob.mesh.rightArm.rotation.z = 0.2 - easeBack * 0.5;
                        gob.mesh.leftFist.position.y = 0.8 + easeBack * 1.0;
                        gob.mesh.rightFist.position.y = 0.8 + easeBack * 1.0;
                        gob.mesh.leftFist.position.z = 1.2 - easeBack * 1.2;
                        gob.mesh.rightFist.position.z = 1.2 - easeBack * 1.2;
                        gob.mesh.position.y = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z) + 0.2 - easeBack * 0.2 + shake;
                        gob.mesh.rotation.y += shake * 0.3;
                    }
                } else {
                    // Reset to idle position
                    gob.mesh.leftArm.rotation.x = 0;
                    gob.mesh.rightArm.rotation.x = 0;
                    gob.mesh.leftArm.rotation.z = 0.3;
                    gob.mesh.rightArm.rotation.z = -0.3;
                    gob.mesh.leftFist.position.y = 1.8;
                    gob.mesh.rightFist.position.y = 1.8;
                    gob.mesh.leftFist.position.z = 0;
                    gob.mesh.rightFist.position.z = 0;
                    gob.mesh.position.y = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
                    gob.isAttacking = false;
                    gob.attackAnimationProgress = 0;
                }
            }
        });
        
        // Collect materials
        G.materials.forEach((material, idx) => {
            if (!material.collected) {
                const dist = G.playerGroup.position.distanceTo(material.mesh.position);
                if (dist < material.radius) {
                    material.collected = true;
                    material.mesh.visible = false;
                    G.materialsCollected++;
                    Audio.playCollectSound();
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', { type: 'material', index: idx });
                    }
                }
            }
        });
        
        // Collect ammo
        G.ammoPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const dist = G.playerGroup.position.distanceTo(pickup.mesh.position);
                if (dist < pickup.radius) {
                    pickup.collected = true;
                    pickup.mesh.visible = false;
                    G.ammo = Math.min(G.ammo + pickup.amount, G.maxAmmo);
                    Audio.playCollectSound();
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', { type: 'G.ammo', index: idx });
                    }
                }
                // Check player 2 collection in native splitscreen
                if (!pickup.collected && isNativeSplitscreen && G.player2Group) {
                    const dist2 = G.player2Group.position.distanceTo(pickup.mesh.position);
                    if (dist2 < pickup.radius) {
                        pickup.collected = true;
                        pickup.mesh.visible = false;
                        G.player2Ammo = Math.min(G.player2Ammo + pickup.amount, G.maxAmmo);
                        Audio.playCollectSound();
                    }
                }
            }
        });
        
        // Collect health
        G.healthPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const dist = G.playerGroup.position.distanceTo(pickup.mesh.position);
                if (dist < pickup.radius) {
                    pickup.collected = true;
                    pickup.mesh.visible = false;
                    G.playerHealth = Math.min(G.playerHealth + 1, G.maxPlayerHealth);
                    Audio.playCollectSound();
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', { type: 'health', index: idx });
                    }
                }
                // Check player 2 collection in native splitscreen
                if (!pickup.collected && isNativeSplitscreen && G.player2Group) {
                    const dist2 = G.player2Group.position.distanceTo(pickup.mesh.position);
                    if (dist2 < pickup.radius) {
                        pickup.collected = true;
                        pickup.mesh.visible = false;
                        G.player2Health = Math.min(G.player2Health + 1, G.maxPlayerHealth);
                        Audio.playCollectSound();
                    }
                }
            }
        });
        
        // Collect scarabs
        G.scarabPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const dist = Math.sqrt(
                    Math.pow(G.playerGroup.position.x - pickup.x, 2) +
                    Math.pow(G.playerGroup.position.z - pickup.z, 2)
                );
                let collected = dist < 1.5;
                
                // Check player 2 in native splitscreen
                if (!collected && isNativeSplitscreen && G.player2Group) {
                    const dist2 = Math.sqrt(
                        Math.pow(G.player2Group.position.x - pickup.x, 2) +
                        Math.pow(G.player2Group.position.z - pickup.z, 2)
                    );
                    collected = dist2 < 1.5;
                }
                
                if (collected) {
                    pickup.collected = true;
                    G.scene.remove(pickup.mesh);
                    G.scarabsCollected++;
                    Audio.playCollectSound();
                    
                    // Show collection message
                    if (G.totalScarabs > 0) {
                        const remaining = G.totalScarabs - G.scarabsCollected;
                        if (remaining > 0) {
                            console.log(`Scarab collected! ${remaining} more to find.`);
                        } else {
                            console.log('All scarabs collected! The G.treasure is now accessible!');
                        }
                    }
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', { type: 'scarab', index: idx });
                    }
                }
            }
        });
        
        // Animate uncollected scarabs (bob and rotate)
        G.scarabPickups.forEach((pickup) => {
            if (!pickup.collected && pickup.mesh) {
                pickup.bobPhase += 0.05;
                const baseHeight = getTerrainHeight(pickup.x, pickup.z) + 0.5;
                pickup.mesh.position.y = baseHeight + Math.sin(pickup.bobPhase) * 0.2;
                pickup.mesh.rotation.y += 0.02;
                
                // Pulse the aura
                if (pickup.mesh.aura) {
                    pickup.mesh.aura.material.opacity = 0.3 + Math.sin(pickup.bobPhase * 2) * 0.2;
                    pickup.mesh.aura.scale.setScalar(1 + Math.sin(pickup.bobPhase) * 0.1);
                }
            }
        });
        
        // Collect candy drops (candy theme)
        if (G.candyTheme && G.candyPickups) {
            G.candyPickups.forEach((pickup, idx) => {
                if (!pickup.collected) {
                    const dist = Math.sqrt(
                        Math.pow(G.playerGroup.position.x - pickup.x, 2) +
                        Math.pow(G.playerGroup.position.z - pickup.z, 2)
                    );
                    let collected = dist < 1.5;
                    
                    // Check player 2 in native splitscreen
                    if (!collected && isNativeSplitscreen && G.player2Group) {
                        const dist2 = Math.sqrt(
                            Math.pow(G.player2Group.position.x - pickup.x, 2) +
                            Math.pow(G.player2Group.position.z - pickup.z, 2)
                        );
                        collected = dist2 < 1.5;
                    }
                    
                    if (collected) {
                        pickup.collected = true;
                        G.scene.remove(pickup.mesh);
                        G.candyCollected++;
                        Audio.playCollectSound();
                        
                        // Show collection message
                        if (G.totalCandy > 0) {
                            const remaining = G.totalCandy - G.candyCollected;
                            if (remaining > 0) {
                                console.log(`Candy collected! ${remaining} more to find.`);
                            } else {
                                console.log('All candy collected! The treasure is now accessible!');
                            }
                        }
                        
                        // Notify other player
                        if (multiplayerManager && multiplayerManager.isConnected()) {
                            multiplayerManager.sendGameEvent('itemCollected', { type: 'candy', index: idx });
                        }
                    }
                }
            });
            
            // Animate uncollected candy (bob and rotate)
            G.candyPickups.forEach((pickup) => {
                if (!pickup.collected && pickup.mesh) {
                    pickup.bobPhase += 0.06;
                    const baseHeight = getTerrainHeight(pickup.x, pickup.z) + 0.5;
                    pickup.mesh.position.y = baseHeight + Math.sin(pickup.bobPhase) * 0.25;
                    pickup.mesh.rotation.y += 0.03;
                    
                    // Pulse the aura
                    if (pickup.mesh.aura) {
                        pickup.mesh.aura.material.opacity = 0.3 + Math.sin(pickup.bobPhase * 2) * 0.2;
                        pickup.mesh.aura.scale.setScalar(1 + Math.sin(pickup.bobPhase) * 0.1);
                    }
                }
            });
        }
        
        // Portal collision - level switching (only if portal exists)
        if (G.portal && G.portalCooldown <= 0) {
            const distToPortal = Math.sqrt(
                Math.pow(G.playerGroup.position.x - G.portal.x, 2) +
                Math.pow(G.playerGroup.position.z - G.portal.z, 2)
            );
            
            // Also check player 2 distance in native splitscreen
            let distToPortal2 = Infinity;
            if (isNativeSplitscreen && G.player2Group) {
                distToPortal2 = Math.sqrt(
                    Math.pow(G.player2Group.position.x - G.portal.x, 2) +
                    Math.pow(G.player2Group.position.z - G.portal.z, 2)
                );
            }
            
            if (distToPortal < G.portal.radius || distToPortal2 < G.portal.radius) {
                // Switch to destination level
                const destinationLevel = G.portal.destinationLevel;
                console.log(`Entering G.portal to Level ${destinationLevel}!`);
                
                // Save inventory for next level
                persistentInventory.ammo = G.ammo;
                persistentInventory.bombs = G.bombInventory;
                persistentInventory.health = G.playerHealth;
                persistentInventory.hasKite = G.worldKiteCollected || G.player.hasKite;
                persistentInventory.herzmen = G.herzmanInventory;
                
                // Save player 2 inventory in native splitscreen
                if (isNativeSplitscreen) {
                    persistentInventory.ammo2 = G.player2Ammo;
                    persistentInventory.bombs2 = G.player2BombInventory;
                    persistentInventory.health2 = G.player2Health;
                    persistentInventory.hasKite2 = G.player2.hasKite;
                    persistentInventory.herzmen2 = G.player2HerzmanInventory;
                    persistentInventory.bananas2 = G.player2BananaInventory;
                }
                
                // Notify multiplayer if connected
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('levelChange', { level: destinationLevel });
                }
                
                // Switch level
                switchLevel(destinationLevel);
                return; // Exit current game loop
            }
        }
        
        // Trap collision (only when not gliding)
        if (!G.player.isGliding) {
            G.traps.forEach(trap => {
                const distToTrap = new THREE.Vector2(
                    G.playerGroup.position.x - trap.mesh.position.x,
                    G.playerGroup.position.z - trap.mesh.position.z
                ).length();
                if (distToTrap < trap.radius && !godMode) {
                    gameDead = true;
                    Audio.stopBackgroundMusic();
                    Audio.playDeathSound();

                    // Notify other player of death
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('playerDeath', {});
                    }
                }
            });
        }

        // Check if other player (client) hit a trap (HOST ONLY)
        if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost && otherPlayerMesh.visible && !otherPlayerIsGliding) {
            G.traps.forEach(trap => {
                const distToTrap = new THREE.Vector2(
                    otherPlayerMesh.position.x - trap.mesh.position.x,
                    otherPlayerMesh.position.z - trap.mesh.position.z
                ).length();
                if (distToTrap < trap.radius) {
                    // Notify client of trap death
                    multiplayerManager.sendGameEvent('trapDeath', {});
                }
            });
        }
        
        // Check if player 2 hit a trap (native splitscreen)
        if (isNativeSplitscreen && G.player2Group && !G.player2.isGliding && !godMode) {
            G.traps.forEach(trap => {
                const distToTrap = new THREE.Vector2(
                    G.player2Group.position.x - trap.mesh.position.x,
                    G.player2Group.position.z - trap.mesh.position.z
                ).length();
                if (distToTrap < trap.radius) {
                    gameDead = true;
                    Audio.stopBackgroundMusic();
                    Audio.playDeathSound();
                }
            });
        }

        // Bridge repair - only if level has river/bridge
        if (G.bridgeObj && !G.bridgeRepaired && G.materialsCollected >= G.materialsNeeded) {
            const distToBridge = new THREE.Vector2(
                G.playerGroup.position.x,
                G.playerGroup.position.z
            ).length();
            if (distToBridge < 5) {
                G.bridgeRepaired = true;
                G.bridgeObj.mesh.visible = true;
                G.brokenBridgeGroup.visible = false;
                Audio.playRepairSound();
                
                // Notify other player in multiplayer
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('G.bridgeRepaired', {});
                }
            }
        }
        
        // River and bridge collision (can fly over when gliding) - only if river exists
        if (G.riverObj && !G.player.isGliding && G.playerGroup.position.z > G.riverObj.minZ && G.playerGroup.position.z < G.riverObj.maxZ) {
            const onBridge = G.bridgeRepaired &&
                            G.playerGroup.position.x > G.bridgeObj.minX && 
                            G.playerGroup.position.x < G.bridgeObj.maxX &&
                            G.playerGroup.position.z > G.bridgeObj.minZ && 
                            G.playerGroup.position.z < G.bridgeObj.maxZ;
            if (!onBridge) {
                G.playerGroup.position.copy(prevPos);
            }
        }
        
        // Treasure collection - only if this level has treasure
        if (G.treasure) {
            const dist = G.playerGroup.position.distanceTo(G.treasureGroup.position);
            if (dist < G.treasure.radius + 0.8) {
                // Check if scarabs are required and collected
                const scarabsRequired = G.totalScarabs > 0;
                const allScarabsCollected = G.scarabsCollected >= G.totalScarabs;
                
                // Check if candy is required and collected (candy theme)
                const candyRequired = G.candyTheme && G.totalCandy > 0;
                const allCandyCollected = !candyRequired || (G.candyCollected >= G.totalCandy);
                
                if (scarabsRequired && !allScarabsCollected) {
                    // Can't collect treasure yet - need more scarabs
                    // Only show message occasionally to avoid spam
                    if (!G.treasure.lastWarningTime || Date.now() - G.treasure.lastWarningTime > 2000) {
                        G.treasure.lastWarningTime = Date.now();
                        const remaining = G.totalScarabs - G.scarabsCollected;
                        console.log(`Collect ${remaining} more Ancient Scarab${remaining > 1 ? 's' : ''} to unlock the G.treasure!`);
                    }
                } else if (candyRequired && !allCandyCollected) {
                    // Can't collect treasure yet - need more candy
                    if (!G.treasure.lastWarningTime || Date.now() - G.treasure.lastWarningTime > 2000) {
                        G.treasure.lastWarningTime = Date.now();
                        const remaining = G.totalCandy - G.candyCollected;
                        console.log(`Sammle noch ${remaining} Süßigkeit${remaining > 1 ? 'en' : ''} um den Schatz freizuschalten!`);
                    }
                } else {
                    // Only host decides win state
                    if (!multiplayerManager || multiplayerManager.isHost) {
                        gameWon = true;
                        Audio.playWinSound();
                    } else {
                        // Client notifies host they reached treasure
                        if (multiplayerManager && multiplayerManager.isConnected()) {
                            multiplayerManager.sendGameEvent('playerWin', {});
                        }
                    }
                }
            }
            
            // Native splitscreen: Check player 2 treasure collection (either player can win)
            if (isNativeSplitscreen && G.player2Group) {
                const dist2 = G.player2Group.position.distanceTo(G.treasureGroup.position);
                if (dist2 < G.treasure.radius + 0.8) {
                    // Same requirements as player 1
                    const scarabsRequired = G.totalScarabs > 0;
                    const allScarabsCollected = G.scarabsCollected >= G.totalScarabs;
                    const candyRequired = G.candyTheme && G.totalCandy > 0;
                    const allCandyCollected = !candyRequired || (G.candyCollected >= G.totalCandy);
                    
                    if (!scarabsRequired || allScarabsCollected) {
                        if (!candyRequired || allCandyCollected) {
                            gameWon = true;
                            Audio.playWinSound();
                        }
                    }
                }
            }
        }
        
        // Ice power collection - only if iceBerg exists
        if (G.iceBerg && !G.icePowerCollected) {
            const iceDist = Math.sqrt(
                (px - G.iceBerg.position.x) ** 2 +
                (pz - G.iceBerg.position.z) ** 2
            );
            // Check player 2 distance in native splitscreen
            let iceDistP2 = Infinity;
            if (isNativeSplitscreen && G.player2Group) {
                iceDistP2 = Math.sqrt(
                    (G.player2Group.position.x - G.iceBerg.position.x) ** 2 +
                    (G.player2Group.position.z - G.iceBerg.position.z) ** 2
                );
            }
            if (iceDist < G.iceBerg.powerRadius || iceDistP2 < G.iceBerg.powerRadius) {
                G.icePowerCollected = true;
                G.hasIcePower = true;
                Audio.playCollectSound();
                
                // Notify other player in multiplayer
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('G.icePowerCollected', {});
                }
            }
        }
        
        // Banana power collection and refill
        const bananaDist = Math.sqrt(
            (px - G.bananaIceBerg.position.x) ** 2 +
            (pz - G.bananaIceBerg.position.z) ** 2
        );
        // Also check player 2 distance in native splitscreen
        let bananaDistP2 = Infinity;
        if (isNativeSplitscreen && G.player2Group) {
            bananaDistP2 = Math.sqrt(
                (G.player2Group.position.x - G.bananaIceBerg.position.x) ** 2 +
                (G.player2Group.position.z - G.bananaIceBerg.position.z) ** 2
            );
        }
        const anyPlayerNearBanana = bananaDist < G.bananaIceBerg.powerRadius || bananaDistP2 < G.bananaIceBerg.powerRadius;
        
        if (anyPlayerNearBanana) {
            if (!G.worldBananaPowerCollected) {
                G.worldBananaPowerCollected = true;
                G.hasBananaPower = true;
                G.bananaInventory = G.maxBananas;
                if (isNativeSplitscreen) {
                    G.player2BananaInventory = G.maxBananas;
                }
                Audio.playCollectSound();
                
                // Notify other player in multiplayer - both get the power
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('G.bananaPowerCollected', {});
                }
            } else if (G.hasBananaPower) {
                // Refill bananas when returning to ice berg
                if (bananaDist < G.bananaIceBerg.powerRadius && G.bananaInventory < G.maxBananas) {
                    G.bananaInventory = G.maxBananas;
                    Audio.playCollectSound();
                }
                if (bananaDistP2 < G.bananaIceBerg.powerRadius && isNativeSplitscreen && G.player2BananaInventory < G.maxBananas) {
                    G.player2BananaInventory = G.maxBananas;
                    Audio.playCollectSound();
                }
            }
        }
        
        // Collect placed bananas
        for (let i = G.placedBananas.length - 1; i >= 0; i--) {
            const banana = G.placedBananas[i];
            const distToBanana = Math.sqrt(
                (px - banana.x) ** 2 +
                (pz - banana.z) ** 2
            );
            if (distToBanana < banana.radius) {
                // Pick up the banana
                G.bananaInventory = Math.min(G.bananaInventory + 1, G.maxBananas);
                G.scene.remove(banana.mesh);
                G.placedBananas.splice(i, 1);
                Audio.playCollectSound();
                
                // Notify other player
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('bananaCollected', { id: banana.id });
                }
                continue;
            }
            // Check player 2 collection in native splitscreen
            if (isNativeSplitscreen && G.player2Group) {
                const distToBanana2 = Math.sqrt(
                    (G.player2Group.position.x - banana.x) ** 2 +
                    (G.player2Group.position.z - banana.z) ** 2
                );
                if (distToBanana2 < banana.radius) {
                    G.player2BananaInventory = Math.min(G.player2BananaInventory + 1, G.maxBananas);
                    G.scene.remove(banana.mesh);
                    G.placedBananas.splice(i, 1);
                    Audio.playCollectSound();
                }
            }
        }
        
        // Bomb pickups
        G.bombPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const distToPickup = Math.sqrt(
                    (px - pickup.mesh.position.x) ** 2 +
                    (pz - pickup.mesh.position.z) ** 2
                );
                if (distToPickup < pickup.radius && G.bombInventory < G.maxBombs) {
                    G.bombInventory++;
                    pickup.collected = true;
                    pickup.mesh.visible = false;
                    Audio.playCollectSound();
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', {
                            type: 'bomb',
                            index: idx
                        });
                    }
                }
                // Check player 2 collection in native splitscreen
                if (!pickup.collected && isNativeSplitscreen && G.player2Group && G.player2BombInventory < G.maxBombs) {
                    const distToPickup2 = Math.sqrt(
                        (G.player2Group.position.x - pickup.mesh.position.x) ** 2 +
                        (G.player2Group.position.z - pickup.mesh.position.z) ** 2
                    );
                    if (distToPickup2 < pickup.radius) {
                        G.player2BombInventory++;
                        pickup.collected = true;
                        pickup.mesh.visible = false;
                        Audio.playCollectSound();
                    }
                }
            }
        });
        
        // Herz-Man pickups (presents)
        G.herzmanPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const distToPickup = Math.sqrt(
                    (px - pickup.mesh.position.x) ** 2 +
                    (pz - pickup.mesh.position.z) ** 2
                );
                if (distToPickup < pickup.radius) {
                    G.herzmanInventory++;
                    pickup.collected = true;
                    pickup.mesh.visible = false;
                    Audio.playCollectSound();
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', {
                            type: 'herzman',
                            index: idx
                        });
                    }
                }
                // Check player 2 collection in native splitscreen
                if (!pickup.collected && isNativeSplitscreen && G.player2Group) {
                    const distToPickup2 = Math.sqrt(
                        (G.player2Group.position.x - pickup.mesh.position.x) ** 2 +
                        (G.player2Group.position.z - pickup.mesh.position.z) ** 2
                    );
                    if (distToPickup2 < pickup.radius) {
                        G.player2HerzmanInventory++;
                        pickup.collected = true;
                        pickup.mesh.visible = false;
                        Audio.playCollectSound();
                    }
                }
            }
        });
        
        // Check world kite collection
        if (!G.worldKiteCollected) {
            const kiteDistSq = (px - G.worldKiteGroup.position.x) ** 2 + (pz - G.worldKiteGroup.position.z) ** 2;
            if (kiteDistSq < 4) {
                G.worldKiteCollected = true;
                G.player.hasKite = true;
                G.player.glideCharge = G.player.maxGlideCharge; // Full charge immediately
                G.scene.remove(G.worldKiteGroup);
                Audio.playCollectSound();
                // Note: Kite state is synced via fullSync, not individual events
            }
            // Check player 2 collection in native splitscreen
            if (!G.worldKiteCollected && isNativeSplitscreen && G.player2Group) {
                const kiteDistSqP2 = (G.player2Group.position.x - G.worldKiteGroup.position.x) ** 2 + (G.player2Group.position.z - G.worldKiteGroup.position.z) ** 2;
                if (kiteDistSqP2 < 4) {
                    G.worldKiteCollected = true;
                    G.player2.hasKite = true;
                    G.player2.glideCharge = G.player2.maxGlideCharge || 100;
                    G.scene.remove(G.worldKiteGroup);
                    Audio.playCollectSound();
                }
            }
        }
        
        return isStuck;
    }

