/**
 * Projectile Systems
 * Handles all projectile types: dragon fireballs, scythe waves, wizard fireballs,
 * lava monster fireballs, lava trails, tornados, and their updates.
 */

(function() {
    'use strict';

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
        
        if (G.computerTheme) {
            // Trojan Dragon shoots massive corrupted data bombs
            // Main virus core - dodecahedron for complex digital appearance
            const virusGeometry = new THREE.DodecahedronGeometry(0.8 * fbScale, 0);
            const virusMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF0000,
                transparent: true,
                opacity: 0.9
            });
            const virus = new THREE.Mesh(virusGeometry, virusMaterial);
            fireballGroup.add(virus);
            
            // Inner rotating cube (malware core)
            const malwareGeometry = new THREE.BoxGeometry(0.6 * fbScale, 0.6 * fbScale, 0.6 * fbScale);
            const malwareMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.8
            });
            const malware = new THREE.Mesh(malwareGeometry, malwareMaterial);
            fireballGroup.add(malware);
            
            // Wireframe shell 1
            const shell1Geometry = new THREE.IcosahedronGeometry(1.0 * fbScale, 1);
            const shell1Material = new THREE.MeshBasicMaterial({ 
                color: 0x00FF00,
                wireframe: true,
                transparent: true,
                opacity: 0.7
            });
            const shell1 = new THREE.Mesh(shell1Geometry, shell1Material);
            fireballGroup.add(shell1);
            
            // Wireframe shell 2 (counter-rotating)
            const shell2Geometry = new THREE.IcosahedronGeometry(1.2 * fbScale, 0);
            const shell2Material = new THREE.MeshBasicMaterial({ 
                color: 0x00FFFF,
                wireframe: true,
                transparent: true,
                opacity: 0.6
            });
            const shell2 = new THREE.Mesh(shell2Geometry, shell2Material);
            fireballGroup.add(shell2);
            
            // Glowing data rings
            const ringGeometry = new THREE.TorusGeometry(0.9 * fbScale, 0.08, 8, 24);
            const ringMaterial1 = new THREE.MeshBasicMaterial({ 
                color: 0xFF00FF,
                transparent: true,
                opacity: 0.8
            });
            const ring1 = new THREE.Mesh(ringGeometry, ringMaterial1);
            ring1.rotation.x = Math.PI / 2;
            fireballGroup.add(ring1);
            
            const ringMaterial2 = new THREE.MeshBasicMaterial({ 
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.8
            });
            const ring2 = new THREE.Mesh(ringGeometry, ringMaterial2);
            ring2.rotation.y = Math.PI / 2;
            fireballGroup.add(ring2);
            
            // Outer threatening glow
            const glowGeometry = new THREE.SphereGeometry(1.5 * fbScale, 16, 16);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF0066,
                transparent: true,
                opacity: 0.2
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            fireballGroup.add(glow);
        } else {
            // Original fireball for other themes
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
        }
        
        fireballGroup.position.copy(d.mesh.position);
        fireballGroup.position.x += d.direction > 0 ? 14 * fbScale : -14 * fbScale;
        fireballGroup.position.y += 1;
        G.scene.add(fireballGroup);
        
        // Calculate direction to target (aim at player center, y+1)
        const dirX = targetPlayer.position.x - fireballGroup.position.x;
        const dirY = (targetPlayer.position.y + 1) - fireballGroup.position.y;
        const dirZ = targetPlayer.position.z - fireballGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        
        G.fireballs.push({
            mesh: fireballGroup,
            velocity: new THREE.Vector3(dirX / length * 0.4, dirY / length * 0.4, dirZ / length * 0.4),
            radius: 1.5 * fbScale,
            damage: 1,
            trail: [],
            lastTrailTime: 0,
            isDragonFireball: true,
            spawnTime: Date.now()
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
        
        if (G.computerTheme) {
            // Computer theme: Malware virus orb / corrupted data sphere
            // Core virus geometry - icosahedron for digital look
            const virusCore = new THREE.IcosahedronGeometry(0.5 * fbScale, 1);
            const virusMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF0000,
                transparent: true,
                opacity: 0.9
            });
            const virus = new THREE.Mesh(virusCore, virusMaterial);
            fireballGroup.add(virus);
            
            // Wireframe shell
            const shellGeometry = new THREE.IcosahedronGeometry(0.65 * fbScale, 1);
            const shellMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00FF00,
                wireframe: true,
                transparent: true,
                opacity: 0.8
            });
            const shell = new THREE.Mesh(shellGeometry, shellMaterial);
            fireballGroup.add(shell);
            
            // Outer digital glow ring
            const ringGeometry = new THREE.TorusGeometry(0.4 * fbScale, 0.05, 8, 16);
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.7
            });
            const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
            ring1.rotation.x = Math.PI / 2;
            fireballGroup.add(ring1);
            
            const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
            ring2.material.color.setHex(0xFF00FF);
            ring2.rotation.y = Math.PI / 2;
            fireballGroup.add(ring2);
            
            // Outer glow sphere
            const glowGeometry = new THREE.SphereGeometry(0.8 * fbScale, 12, 12);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFF0066,
                transparent: true,
                opacity: 0.25
            });
            const outerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
            fireballGroup.add(outerGlow);
        } else {
            // Original fireball code for other themes
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
        }
        
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
                    
                    // Start tornado spin visual effect for player 2
                    G.tornadoSpinActive2 = true;
                    G.tornadoSpinStartTime2 = Date.now();
                    
                    if (G.player2Health <= 0) {
                        // Player 2 died - both players die together
                        gameDead = true;
                        Audio.stopBackgroundMusic();
                        Audio.playDeathSound();
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
                        // Player 2 died - both players die together
                        gameDead = true;
                        Audio.stopBackgroundMusic();
                        Audio.playDeathSound();
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
            
            // Grace period for wizard/witch/dragon fireballs - skip terrain collision entirely during grace
            const graceTime = fireball.isWizardFireball || fireball.isScytheWave || fireball.isDragonFireball ? 800 : 0;
            const elapsed = Date.now() - (fireball.spawnTime || 0);
            const inGracePeriod = elapsed < graceTime;
            
            // Check collision with mountains (if level has them) - skip during grace period
            // Also skip for wizard fireballs, scythe waves, and dragon fireballs - they pass through walls
            let hitMountain = false;
            if (!inGracePeriod && !fireball.isWizardFireball && !fireball.isScytheWave && !fireball.isDragonFireball && G.levelConfig.mountains && G.levelConfig.mountains.length > 0) {
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
            // Also skip for wizard fireballs, scythe waves, and dragon fireballs
            let hitCanyonWall = false;
            if (!inGracePeriod && !fireball.isWizardFireball && !fireball.isScytheWave && !fireball.isDragonFireball) {
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
            // Also skip for wizard fireballs, scythe waves, and dragon fireballs
            let hitCliff = false;
            if (!inGracePeriod && !fireball.isWizardFireball && !fireball.isScytheWave && !fireball.isDragonFireball) {
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

    // Export functions to global scope
    window.createDragonFireball = createDragonFireball;
    window.createScytheWave = createScytheWave;
    window.createWizardFireball = createWizardFireball;
    window.createLavaMonsterFireball = createLavaMonsterFireball;
    window.createLavaTrail = createLavaTrail;
    window.createMummyTornado = createMummyTornado;
    window.spawnWildTornado = spawnWildTornado;
    window.checkAndSpawnWildTornados = checkAndSpawnWildTornados;
    window.updateMummyTornados = updateMummyTornados;
    window.updateLavaTrails = updateLavaTrails;
    window.updateFireballs = updateFireballs;
})();
