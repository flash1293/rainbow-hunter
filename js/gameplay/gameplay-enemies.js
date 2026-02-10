/**
 * Enemy Update Systems - Goblin, Bird, Pirate Ship, and projectile updates
 * 
 * Extracted from main-gameplay.js for modularity.
 * Contains: updateGoblins, updateGuardianArrows, updateBirds, updateBombs, updatePirateShips
 * 
 * Dependencies:
 * - THREE.js
 * - G (global game state)
 * - GAME_CONFIG, MOUNTAINS
 * - Audio system
 * - multiplayerManager
 * - getTerrainHeight, getNearestPlayerTarget
 * - createExplosion, createBombExplosion (from gameplay-effects.js)
 * - createWizardFireball, createMummyTornado, createLavaMonsterFireball, createLavaTrail (from gameplay-projectiles.js)
 */

(function() {
    'use strict';

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


    // Export functions
    window.updateGoblins = updateGoblins;
    window.updateGuardianArrows = updateGuardianArrows;
    window.updateBirds = updateBirds;
    window.updateBombs = updateBombs;
    window.updatePirateShips = updatePirateShips;

})();
