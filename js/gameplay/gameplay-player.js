/**
 * Player System - Player movement, updates, powers, and targeting
 * 
 * Extracted from main-gameplay.js for modularity.
 * Contains: getNearestPlayerTarget, createFreezeEffect, activateIcePower,
 *           updatePlayer, updatePlayer2, checkPlayer2Damage, checkIfOnLava,
 *           activateIcePowerForPlayer
 * 
 * Dependencies:
 * - THREE.js
 * - G (global game state)
 * - GAME_CONFIG, MOUNTAINS
 * - Audio system
 * - multiplayerManager
 * - getTerrainHeight
 */

(function() {
    'use strict';

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

    // Effect functions moved to js/gameplay/gameplay-effects.js:
    // createExplosion, createFireballExplosion, createBombExplosion, createDragonExplosion
    // createSmokeCloud, createScorchMark, updateSmoke, updateScorchMarks, updateExplosions

    // spawnDragonCandyDrops moved to js/gameplay/gameplay-spawns.js

    // Bullet functions moved to js/gameplay/gameplay-bullets.js:
    // shootBullet, createRemoteBullet, shootBulletForPlayer, updateBullets
    
    // Create freeze particle effect on an NPC
    function createFreezeEffect(x, y, z) {
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = getGeometry('sphere', 0.1, 4, 4);
            const material = getMaterial('basic', {
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
    
    // Ice power activation - posOverride allows using P2's position for native splitscreen
    function activateIcePower(posOverride = null) {
        if (gameWon || gameDead || !G.hasIcePower) return;
        
        const now = Date.now();
        if (now - G.lastIcePowerTime < G.icePowerCooldown) return; // Cooldown not ready
        
        G.lastIcePowerTime = now;
        
        console.log('Activating ice power, isHost:', multiplayerManager ? multiplayerManager.isHost : 'no multiplayer');
        
        Audio.playIcePowerSound();
        
        const freezeRadius = 20;
        const playerPos = posOverride || G.playerGroup.position;
        
        // Create visual effect - expanding blue circle
        const circleGeometry = new THREE.RingGeometry(0.1, freezeRadius, 32);
        const circleMaterial = getMaterial('basic', {
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

    // Item placement functions moved to js/gameplay/gameplay-items.js:
    // placeBanana, placeBomb, placeHerzman, placeBananaAt, placeBombAt, placeHerzmanAt

    // Herz-Man system moved to js/gameplay/gameplay-herzmen.js:
    // createHerzmanMesh, createHeartBomb, createHeartExplosion, createSorryNote,
    // updateHerzmenVisuals, updateHerzmen, updateHeartBombs, updateHeartBombVisuals
    
    // Handle game events from remote player

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
            // Apply lag slowdown for computer level
            const lagFactor = (typeof getLagSlowdownFactor === 'function') ? getLagSlowdownFactor() : 1;
            // Apply crystal gem speed boost
            const speedBoost = G.playerSpeedBoost || 1;
            const effectiveSpeed = G.player.speed * moveScale * lagFactor * speedBoost;
            if (G.keys.ArrowUp || G.keys.w) {
                G.playerGroup.position.x += Math.sin(G.player.rotation) * effectiveSpeed;
                G.playerGroup.position.z += Math.cos(G.player.rotation) * effectiveSpeed;
            }
            if (G.keys.ArrowDown || G.keys.s) {
                G.playerGroup.position.x -= Math.sin(G.player.rotation) * effectiveSpeed;
                G.playerGroup.position.z -= Math.cos(G.player.rotation) * effectiveSpeed;
            }
            
            // Apply data stream push (computer level)
            if (G.computerTheme && typeof getDataStreamPush === 'function') {
                const push = getDataStreamPush(G.playerGroup.position.x, G.playerGroup.position.z);
                G.playerGroup.position.x += push.x;
                G.playerGroup.position.z += push.z;
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
        
        // Tornado spin visual effect for Player 2
        if (G.tornadoSpinActive2 && isNativeSplitscreen && G.player2Group) {
            const elapsed = Date.now() - G.tornadoSpinStartTime2;
            const progress = Math.min(elapsed / G.tornadoSpinDuration, 1);
            
            if (progress < 1) {
                // Spin rotation - ease out
                const spinProgress = 1 - Math.pow(1 - progress, 2);
                const extraRotation = spinProgress * G.tornadoSpinRotations * Math.PI * 2;
                G.player2Group.rotation.y = G.player2.rotation + extraRotation;
                
                // Lift up and down - parabolic arc
                const liftProgress = Math.sin(progress * Math.PI);
                G.player2Group.position.y += liftProgress * G.tornadoSpinLiftHeight;
                
                // Slight wobble
                G.player2Group.rotation.x = Math.sin(elapsed * 0.02) * 0.2 * (1 - progress);
                G.player2Group.rotation.z = Math.cos(elapsed * 0.025) * 0.15 * (1 - progress);
            } else {
                // Effect finished, reset
                G.tornadoSpinActive2 = false;
                G.player2Group.rotation.x = 0;
                G.player2Group.rotation.z = 0;
            }
        }
        
        const isStuck = godMode ? false : checkCollisions(prevPos);
        
        if (isMoving && !isStuck) {
            Audio.startBikeSound();
        } else {
            Audio.stopBikeSound();
        }
        
        // Skip terrain height adjustment if player is being lifted by or at top of rapunzel tower
        if (!godMode && !G.rapunzelTowerLift) {
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
        
        // Apply screen shake for lag effect (computer theme)
        const shakeX = G.lagShakeOffset ? G.lagShakeOffset.x : 0;
        const shakeY = G.lagShakeOffset ? G.lagShakeOffset.y : 0;
        const shakeZ = G.lagShakeOffset ? G.lagShakeOffset.z : 0;
        
        G.camera.position.x = G.playerGroup.position.x + cameraOffsetX + shakeX;
        G.camera.position.y = G.playerGroup.position.y + cameraHeight + shakeY;
        G.camera.position.z = G.playerGroup.position.z + cameraOffsetZ + shakeZ;
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
                    if (G.graveyardTheme || G.ruinsTheme || G.computerTheme || G.enchantedTheme || G.easterTheme || G.christmasTheme || G.crystalTheme || G.rapunzelTheme) {
                        // Box collision for graveyard, ruins, computer, enchanted, easter, christmas, crystal, and rapunzel walls
                        const wallWidth = mtn.width;
                        // Match wall depth to visual rendering for each theme
                        let wallDepth;
                        if (G.computerTheme) {
                            wallDepth = 2;
                        } else if (G.rapunzelTheme) {
                            wallDepth = Math.min(mtn.width * 0.03, 1.5); // Thin walls
                        } else {
                            wallDepth = Math.min(mtn.width * 0.15, 8);
                        }
                        const halfW = wallWidth / 2 + 1.5;
                        const halfD = wallDepth / 2 + 1.5;
                        let dx = newX - mtn.x;
                        let dz = newZ - mtn.z;
                        if (mtn.rotation) {
                            const cos = Math.cos(-mtn.rotation);
                            const sin = Math.sin(-mtn.rotation);
                            const lx = dx * cos - dz * sin;
                            const lz = dx * sin + dz * cos;
                            dx = lx;
                            dz = lz;
                        }
                        if (Math.abs(dx) < halfW && Math.abs(dz) < halfD) {
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
    
    // shootBulletForPlayer moved to js/gameplay/gameplay-bullets.js

    // Placeholder functions for player 2 actions (simplified for now)
    function activateIcePowerForPlayer(playerNum) {
        if (playerNum === 1) {
            activateIcePower();
        } else if (playerNum === 2 && isNativeSplitscreen && G.player2Group) {
            // Player 2 shares ice power cooldown, but uses P2's position
            activateIcePower(G.player2Group.position);
        } else {
            // Fallback to player 1's position
            activateIcePower();
        }
    }
    
    // Export splitscreen functions
    window.updatePlayer2 = updatePlayer2;
    // shootBulletForPlayer exported from gameplay-bullets.js
    window.activateIcePowerForPlayer = activateIcePowerForPlayer;
    // placeBananaForPlayer, placeBombForPlayer, placeHerzmanForPlayer moved to gameplay-items.js

    // Export functions
    window.getNearestPlayerTarget = getNearestPlayerTarget;
    window.createFreezeEffect = createFreezeEffect;
    window.activateIcePower = activateIcePower;
    window.updatePlayer = updatePlayer;
    // updatePlayer2 already exported above
    window.checkPlayer2Damage = checkPlayer2Damage;
    window.checkIfOnLava = checkIfOnLava;
    // activateIcePowerForPlayer already exported above

})();
