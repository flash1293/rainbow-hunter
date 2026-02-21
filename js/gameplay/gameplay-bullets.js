/**
 * Bullet System - Shooting and bullet collision handling
 * 
 * Extracted from main-gameplay.js for modularity.
 * Contains: shootBullet, createRemoteBullet, shootBulletForPlayer, updateBullets
 * 
 * Dependencies:
 * - THREE.js
 * - G (global game state)
 * - GAME_CONFIG, MOUNTAINS
 * - Audio system
 * - multiplayerManager
 * - getTerrainHeight
 * - createExplosion, createDragonExplosion (from gameplay-effects.js)
 * - spawnDragonCandyDrops (from gameplay-spawns.js)
 */

(function() {
    'use strict';

    // Shoot bullet from player
    function shootBullet() {
        if (gameWon) return;
        
        // Shrunk players can't shoot
        if (G.playerShrunk) {
            Audio.playEmptyGunSound();
            return;
        }
        
        if (G.ammo <= 0 && !godMode) {
            Audio.playEmptyGunSound();
            return;
        }
        
        Audio.playShootSound();
        
        // Giant bullets are bigger and more powerful
        const isGiantBullet = G.playerGiant;
        const bulletSize = isGiantBullet ? 0.6 : 0.2;
        const bulletGeometry = new THREE.SphereGeometry(bulletSize, 8, 8);
        const bulletColor = isGiantBullet ? 0xFF4500 : (G.isHost ? 0xFF69B4 : 0x4169E1); // Orange-red for giant, else Pink/Blue
        const bulletMaterial = new THREE.MeshLambertMaterial({ color: bulletColor });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bulletMesh.position.copy(G.playerGroup.position);
        bulletMesh.position.y = isGiantBullet ? 2 : 1;
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
            radius: bulletSize,
            startPos: { x: G.playerGroup.position.x, z: G.playerGroup.position.z },
            isGiant: isGiantBullet,
            damage: isGiantBullet ? 3 : 1 // Giant bullets deal 3x damage
        };
        G.bullets.push(bullet);
        if (!godMode && !G.playerInfiniteAmmo) G.ammo--;
        
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
        const remoteBulletColor = G.isHost ? 0x4169E1 : 0xFF69B4; // Blue for boy's bullets, Pink for girl's bullets
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

    // Shoot bullet from specific player (for splitscreen)
    function shootBulletForPlayer(playerNum) {
        if (playerNum === 1) {
            shootBullet();
        } else if (playerNum === 2 && isNativeSplitscreen) {
            // Shrunk player 2 can't shoot
            if (G.player2Shrunk) {
                Audio.playEmptyGunSound();
                return;
            }
            
            if (G.player2Ammo <= 0 && !G.player2InfiniteAmmo) return;
            
            if (!G.player2InfiniteAmmo) G.player2Ammo--;
            Audio.playShootSound();
            
            // Giant bullets are bigger and more powerful
            const isGiantBullet = G.player2Giant;
            const bulletSize = isGiantBullet ? 0.6 : 0.15;
            const bulletGeometry = new THREE.SphereGeometry(bulletSize, 8, 8);
            const bulletColor = isGiantBullet ? 0xFF4500 : 0x4488FF; // Orange-red for giant, else blue
            const bulletMaterial = new THREE.MeshLambertMaterial({ color: bulletColor });
            const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
            
            bulletMesh.position.set(
                G.player2Group.position.x + Math.sin(G.player2.rotation) * 1.2,
                G.player2Group.position.y + (isGiantBullet ? 2 : 1),
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
                radius: bulletSize,
                isGiant: isGiantBullet,
                damage: isGiantBullet ? 3 : 1 // Giant bullets deal 3x damage
            });
        }
    }

    // Update all bullets - movement and collision detection
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
                        // Giant bullets create bigger explosions
                        if (bullet.isGiant) {
                            createDragonExplosion(gob.mesh.position.x, gob.mesh.position.y + 1, gob.mesh.position.z);
                        } else {
                            createExplosion(gob.mesh.position.x, gob.mesh.position.y + 1, gob.mesh.position.z);
                        }
                        
                        // Only host applies actual damage
                        if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                            // Apply crystal gem damage boost if active
                            const damageBoost = (bullet.isPlayer2 ? G.player2DamageBoost : G.playerDamageBoost) || 1;
                            const damage = (bullet.damage || 1) * damageBoost;
                            gob.health -= damage;
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
                    // Visual feedback - bigger explosion for giant bullets
                    if (bullet.isGiant) {
                        createDragonExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                    } else {
                        createExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                    }
                    
                    // Only host applies damage
                    if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                        // Apply crystal gem damage boost if active
                        const damageBoost = (bullet.isPlayer2 ? G.player2DamageBoost : G.playerDamageBoost) || 1;
                        const damage = (bullet.damage || 1) * damageBoost;
                        G.dragon.health -= damage;
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
                        // Visual feedback - bigger explosion for giant bullets
                        if (bullet.isGiant) {
                            createDragonExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                        } else {
                            createExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                        }
                        
                        // Only host applies damage
                        if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                            // Apply crystal gem damage boost if active
                            const damageBoost = (bullet.isPlayer2 ? G.player2DamageBoost : G.playerDamageBoost) || 1;
                            const damage = (bullet.damage || 1) * damageBoost;
                            extraDragon.health -= damage;
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

    // Export functions
    window.shootBullet = shootBullet;
    window.createRemoteBullet = createRemoteBullet;
    window.shootBulletForPlayer = shootBulletForPlayer;
    window.updateBullets = updateBullets;

})();
