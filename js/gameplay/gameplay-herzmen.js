/**
 * Herz-Man System
 * Handles the Herz-Man turret entities: mesh creation, heart bomb projectiles,
 * targeting, firing logic, and visual updates.
 */

(function() {
    'use strict';

    // Create Herz-Man mesh (big heart with arms, legs, and face)
    function createHerzmanMesh() {
        const herzmanGroup = new THREE.Group();
        
        // Base platform (cute pink pedestal)
        const baseGeometry = getGeometry('cylinder', 0.5, 0.7, 0.2, 16);
        const baseMaterial = getMaterial('lambert', { color: 0xFFB6C1 });
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
        const heartMaterial = getMaterial('lambert', { 
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
        const eyeGeometry = getGeometry('sphere', 0.12, 12, 12);
        const eyeWhiteMaterial = getMaterial('basic', { color: 0xFFFFFF });
        const eyeLeft = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        eyeLeft.position.set(-0.25, 1.35, 0.65);
        herzmanGroup.add(eyeLeft);
        
        const eyeRight = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        eyeRight.position.set(0.25, 1.35, 0.65);
        herzmanGroup.add(eyeRight);
        
        // Pupils
        const pupilGeometry = getGeometry('sphere', 0.06, 8, 8);
        const pupilMaterial = getMaterial('basic', { color: 0x000000 });
        const pupilLeft = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupilLeft.position.set(-0.25, 1.35, 0.76);
        herzmanGroup.add(pupilLeft);
        
        const pupilRight = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupilRight.position.set(0.25, 1.35, 0.76);
        herzmanGroup.add(pupilRight);
        
        // Eye sparkles
        const sparkleGeometry = getGeometry('sphere', 0.03, 4, 4);
        const sparkleMaterial = getMaterial('basic', { color: 0xFFFFFF });
        const sparkle1 = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        sparkle1.position.set(-0.22, 1.4, 0.8);
        herzmanGroup.add(sparkle1);
        const sparkle2 = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        sparkle2.position.set(0.28, 1.4, 0.8);
        herzmanGroup.add(sparkle2);
        
        // Cute blush cheeks
        const blushGeometry = getGeometry('circle', 0.1, 12);
        const blushMaterial = getMaterial('basic', { 
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
        const smileGeometry = getGeometry('torus', 0.15, 0.03, 8, 16, Math.PI);
        const smileMaterial = getMaterial('basic', { color: 0x8B0000 });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.05, 0.7);
        smile.rotation.x = Math.PI;
        herzmanGroup.add(smile);
        
        // Arms (stubby cute arms) - using cylinder with spheres at ends
        const armMaterial = getMaterial('lambert', { color: 0xFF69B4 });
        
        // Left arm (cylinder + sphere ends)
        const leftArmGroup = new THREE.Group();
        const leftArmCyl = new THREE.Mesh(getGeometry('cylinder', 0.08, 0.08, 0.3, 8), armMaterial);
        leftArmCyl.rotation.z = Math.PI / 2;
        leftArmGroup.add(leftArmCyl);
        const leftArmEnd1 = new THREE.Mesh(getGeometry('sphere', 0.08, 8, 8), armMaterial);
        leftArmEnd1.position.x = -0.15;
        leftArmGroup.add(leftArmEnd1);
        const leftArmEnd2 = new THREE.Mesh(getGeometry('sphere', 0.08, 8, 8), armMaterial);
        leftArmEnd2.position.x = 0.15;
        leftArmGroup.add(leftArmEnd2);
        leftArmGroup.position.set(-0.7, 1.0, 0);
        leftArmGroup.rotation.z = Math.PI / 4;
        leftArmGroup.castShadow = true;
        herzmanGroup.add(leftArmGroup);
        
        // Right arm (cylinder + sphere ends)
        const rightArmGroup = new THREE.Group();
        const rightArmCyl = new THREE.Mesh(getGeometry('cylinder', 0.08, 0.08, 0.3, 8), armMaterial);
        rightArmCyl.rotation.z = Math.PI / 2;
        rightArmGroup.add(rightArmCyl);
        const rightArmEnd1 = new THREE.Mesh(getGeometry('sphere', 0.08, 8, 8), armMaterial);
        rightArmEnd1.position.x = -0.15;
        rightArmGroup.add(rightArmEnd1);
        const rightArmEnd2 = new THREE.Mesh(getGeometry('sphere', 0.08, 8, 8), armMaterial);
        rightArmEnd2.position.x = 0.15;
        rightArmGroup.add(rightArmEnd2);
        rightArmGroup.position.set(0.7, 1.0, 0);
        rightArmGroup.rotation.z = -Math.PI / 4;
        rightArmGroup.castShadow = true;
        herzmanGroup.add(rightArmGroup);
        
        // Little hands (spheres)
        const handGeometry = getGeometry('sphere', 0.1, 8, 8);
        const handMaterial = getMaterial('lambert', { color: 0xFFDAB9 });
        
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.9, 0.8, 0);
        herzmanGroup.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.9, 0.8, 0);
        herzmanGroup.add(rightHand);
        
        // Legs (short stubby legs) - using cylinder with sphere ends
        const legMaterial = getMaterial('lambert', { color: 0xFF69B4 });
        
        // Left leg (cylinder + sphere ends)
        const leftLegGroup = new THREE.Group();
        const leftLegCyl = new THREE.Mesh(getGeometry('cylinder', 0.08, 0.08, 0.25, 8), legMaterial);
        leftLegGroup.add(leftLegCyl);
        const leftLegTop = new THREE.Mesh(getGeometry('sphere', 0.08, 8, 8), legMaterial);
        leftLegTop.position.y = 0.125;
        leftLegGroup.add(leftLegTop);
        const leftLegBot = new THREE.Mesh(getGeometry('sphere', 0.08, 8, 8), legMaterial);
        leftLegBot.position.y = -0.125;
        leftLegGroup.add(leftLegBot);
        leftLegGroup.position.set(-0.25, 0.35, 0);
        leftLegGroup.castShadow = true;
        herzmanGroup.add(leftLegGroup);
        
        // Right leg (cylinder + sphere ends)
        const rightLegGroup = new THREE.Group();
        const rightLegCyl = new THREE.Mesh(getGeometry('cylinder', 0.08, 0.08, 0.25, 8), legMaterial);
        rightLegGroup.add(rightLegCyl);
        const rightLegTop = new THREE.Mesh(getGeometry('sphere', 0.08, 8, 8), legMaterial);
        rightLegTop.position.y = 0.125;
        rightLegGroup.add(rightLegTop);
        const rightLegBot = new THREE.Mesh(getGeometry('sphere', 0.08, 8, 8), legMaterial);
        rightLegBot.position.y = -0.125;
        rightLegGroup.add(rightLegBot);
        rightLegGroup.position.set(0.25, 0.35, 0);
        rightLegGroup.castShadow = true;
        herzmanGroup.add(rightLegGroup);
        
        // Little feet (oval spheres)
        const footGeometry = getGeometry('sphere', 0.12, 8, 8);
        const footMaterial = getMaterial('lambert', { color: 0xFF1493 });
        
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
        const heartMaterial = getMaterial('lambert', { 
            color: 0xFF69B4,
            emissive: 0xFF1493,
            emissiveIntensity: 0.6
        });
        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        heart.scale.set(1.5, 1.5, 1.5);
        heartBombGroup.add(heart);
        
        // Trailing sparkles glow
        const glowGeometry = getGeometry('sphere', 0.15, 8, 8);
        const glowMaterial = getMaterial('basic', {
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
        const noteGeometry = getGeometry('plane', 2, 1.5);
        const noteMaterial = getMaterial('basic', {
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
                    if (G.dragon.health <= 0 && G.dragon.alive) {
                        G.dragon.alive = false;
                        G.dragon.deathTime = Date.now();
                        Audio.playGoblinDeathSound();
                        
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
                        
                        // Hide dragon mesh
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
                    if (dragon.health <= 0 && dragon.alive) {
                        dragon.alive = false;
                        dragon.deathTime = Date.now();
                        Audio.playGoblinDeathSound();
                        
                        // Capture position before hiding mesh
                        const deathX = dragon.mesh.position.x;
                        const deathY = dragon.mesh.position.y;
                        const deathZ = dragon.mesh.position.z;
                        
                        // Create smaller explosions
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
                        
                        // Hide dragon mesh
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

    // Export functions to global scope
    window.createHerzmanMesh = createHerzmanMesh;
    window.createHeartBomb = createHeartBomb;
    window.createHeartExplosion = createHeartExplosion;
    window.createSorryNote = createSorryNote;
    window.updateHerzmenVisuals = updateHerzmenVisuals;
    window.updateHerzmen = updateHerzmen;
    window.updateHeartBombs = updateHeartBombs;
    window.updateHeartBombVisuals = updateHeartBombVisuals;
})();
