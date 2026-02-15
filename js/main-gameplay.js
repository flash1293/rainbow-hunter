// main-gameplay.js - Combat, updates, and collisions

    // Player systems moved to js/gameplay/gameplay-player.js:
    // getNearestPlayerTarget, createFreezeEffect, activateIcePower,
    // updatePlayer, updatePlayer2, checkPlayer2Damage, checkIfOnLava, activateIcePowerForPlayer

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

    // updateBullets moved to js/gameplay/gameplay-bullets.js

    // Spawn systems moved to js/gameplay/gameplay-spawns.js:
    // createSpawnedZombie, updateZombieSpawns, createSpawnedGingerbread, createSmokeParticle, updateOvenSpawns

    // Enemy systems moved to js/gameplay/gameplay-enemies.js:
    // updateGoblins, updateGuardianArrows, updateBirds, updateBombs, updatePirateShips

    // Boss systems moved to js/gameplay/gameplay-boss.js:
    // updateDragonVisuals, updateDragon

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
                    // For graveyard, ruins, computer, enchanted, and easter theme walls, use rectangular (box) collision
                    if (G.graveyardTheme || G.ruinsTheme || G.computerTheme || G.enchantedTheme || G.easterTheme) {
                        const wallWidth = mtn.width;
                        // Use fixed depth of 2 for computer theme (matches visual), variable for others
                        const wallDepth = G.computerTheme ? 2 : Math.min(mtn.width * 0.15, 8);
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
            if (gob.isGiant && gob.isAttacking && !gob.frozen && gob.mesh.leftArm && gob.mesh.rightArm) {
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
                // Check player 2 collection in native splitscreen
                if (!material.collected && isNativeSplitscreen && G.player2Group) {
                    const dist2 = G.player2Group.position.distanceTo(material.mesh.position);
                    if (dist2 < material.radius) {
                        material.collected = true;
                        material.mesh.visible = false;
                        G.materialsCollected++;
                        Audio.playCollectSound();
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
        
        // Collect size potions (enchanted theme)
        if (G.sizePotions) {
            G.sizePotions.forEach((pickup, idx) => {
                if (!pickup.collected) {
                    const dist = G.playerGroup.position.distanceTo(pickup.mesh.position);
                    if (dist < pickup.radius) {
                        pickup.collected = true;
                        pickup.mesh.visible = false;
                        Audio.playCollectSound();
                        
                        // Size potion effect
                        if (G.playerShrunk) {
                            // Restore to normal size
                            G.playerShrunk = false;
                            G.playerScale = 1.0;
                            G.playerGroup.scale.set(1.0, 1.0, 1.0);
                        } else if (!G.playerGiant) {
                            // Become giant temporarily
                            G.playerGiant = true;
                            G.playerScale = G.giantScale;
                            G.giantEndTime = Date.now() + G.giantDuration;
                            G.playerGroup.scale.set(G.giantScale, G.giantScale, G.giantScale);
                        }
                        
                        // Notify other player in multiplayer
                        if (multiplayerManager && multiplayerManager.isConnected()) {
                            multiplayerManager.sendGameEvent('itemCollected', { type: 'sizePotion', index: idx });
                        }
                    }
                    // Check player 2 collection in native splitscreen
                    if (!pickup.collected && isNativeSplitscreen && G.player2Group) {
                        const dist2 = G.player2Group.position.distanceTo(pickup.mesh.position);
                        if (dist2 < pickup.radius) {
                            pickup.collected = true;
                            pickup.mesh.visible = false;
                            Audio.playCollectSound();
                            
                            // Size potion effect for player 2
                            if (G.player2Shrunk) {
                                // Restore to normal size
                                G.player2Shrunk = false;
                                G.player2Scale = 1.0;
                                G.player2Group.scale.set(1.0, 1.0, 1.0);
                            } else if (!G.player2Giant) {
                                // Become giant temporarily
                                G.player2Giant = true;
                                G.player2Scale = G.giantScale;
                                G.giant2EndTime = Date.now() + G.giantDuration;
                                G.player2Group.scale.set(G.giantScale, G.giantScale, G.giantScale);
                            }
                        }
                    }
                }
            });
        }
        
        // Update giant mode timer
        if (G.playerGiant && Date.now() > G.giantEndTime) {
            G.playerGiant = false;
            G.playerScale = 1.0;
            G.playerGroup.scale.set(1.0, 1.0, 1.0);
        }
        
        // Update player 2 giant mode timer
        if (G.player2Giant && Date.now() > G.giant2EndTime) {
            G.player2Giant = false;
            G.player2Scale = 1.0;
            if (G.player2Group) G.player2Group.scale.set(1.0, 1.0, 1.0);
        }
        
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

