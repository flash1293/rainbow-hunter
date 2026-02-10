/**
 * Boss Update Systems - Dragon and Reaper boss behavior and visuals
 * 
 * Extracted from main-gameplay.js for modularity.
 * Contains: updateDragonVisuals, updateDragon
 * 
 * Dependencies:
 * - THREE.js
 * - G (global game state)
 * - GAME_CONFIG
 * - Audio system
 * - multiplayerManager
 * - getTerrainHeight, getNearestPlayerTarget
 * - createDragonFireball, createScytheWave (from gameplay-projectiles.js)
 */

(function() {
    'use strict';

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
            
            // Check network multiplayer player
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
            
            // Check native splitscreen player 2
            if (isNativeSplitscreen && G.player2Group && G.player2Group.visible) {
                const distToP2 = Math.sqrt(
                    (G.player2Group.position.x - d.mesh.position.x) ** 2 +
                    (G.player2Group.position.z - d.mesh.position.z) ** 2
                );
                if (distToP2 < targetDist) {
                    targetPlayer = G.player2Group;
                    targetDist = distToP2;
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
            
            // Check collision damage with native splitscreen player 2
            if (isNativeSplitscreen && G.player2Group && !godMode) {
                const distToP2 = Math.sqrt(
                    (G.player2Group.position.x - d.mesh.position.x) ** 2 +
                    (G.player2Group.position.z - d.mesh.position.z) ** 2
                );
                
                if (distToP2 < collisionRadius) {
                    if (!d.lastP2DamageTime) d.lastP2DamageTime = 0;
                    
                    if (now - d.lastP2DamageTime > G.damageCooldown) {
                        G.player2Health--;
                        d.lastP2DamageTime = now;
                        G.damageFlashTime2 = now;
                        Audio.playStuckSound();
                        
                        if (G.player2Health <= 0) {
                            if (!gameDead) {
                                gameDead = true;
                                Audio.stopBackgroundMusic();
                                Audio.playDeathSound();
                            }
                        }
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
                
                // Update Y position based on terrain (when not flying)
                if (!d.isFlying) {
                    const terrainY = getTerrainHeight(d.mesh.position.x, d.mesh.position.z);
                    const targetY = terrainY + 3 * (d.scale || 1);
                    // Smooth transition to avoid jarring movement
                    d.mesh.position.y += (targetY - d.mesh.position.y) * 0.1;
                }
                
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
                
                // Check network multiplayer player
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
                
                // Check native splitscreen player 2
                if (isNativeSplitscreen && G.player2Group && G.player2Group.visible) {
                    const distToP2 = Math.sqrt(
                        (G.player2Group.position.x - d.mesh.position.x) ** 2 +
                        (G.player2Group.position.z - d.mesh.position.z) ** 2
                    );
                    if (distToP2 < fireTargetDist) {
                        fireTargetPlayer = G.player2Group;
                        fireTargetDist = distToP2;
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

    // Projectile systems moved to js/gameplay/gameplay-projectiles.js:
    // createDragonFireball, createScytheWave, createWizardFireball, createLavaMonsterFireball,
    // createLavaTrail, createMummyTornado, spawnWildTornado, checkAndSpawnWildTornados,
    // updateMummyTornados, updateLavaTrails, updateFireballs
    

    // Export functions
    window.updateDragonVisuals = updateDragonVisuals;
    window.updateDragon = updateDragon;

})();
