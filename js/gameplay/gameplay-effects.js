/**
 * Gameplay Effects - Explosions, smoke, and scorch marks
 * Visual effects for combat and destruction
 */
(function() {
    'use strict';

    // Basic explosion particles (goblin death, small impacts)
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

    // Update explosion particles
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

    // Export to window for global access
    window.createExplosion = createExplosion;
    window.createFireballExplosion = createFireballExplosion;
    window.createBombExplosion = createBombExplosion;
    window.createDragonExplosion = createDragonExplosion;
    window.createSmokeCloud = createSmokeCloud;
    window.createScorchMark = createScorchMark;
    window.updateSmoke = updateSmoke;
    window.updateScorchMarks = updateScorchMarks;
    window.updateExplosions = updateExplosions;
})();
