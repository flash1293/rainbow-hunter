// main-loop.js - Game reset, HUD, and main game loop

function initLoop() {
    function resetGame() {
        gameDead = false;
        gameWon = false;
        
        Audio.startBackgroundMusic();
        
        const startX = (!multiplayerManager || multiplayerManager.isHost) ? G.levelConfig.playerStart.x - 2 : G.levelConfig.playerStart.x + 2;
        const startZ = G.levelConfig.playerStart.z;
        G.playerGroup.position.set(startX, getTerrainHeight(startX, startZ), startZ);
        G.player.rotation = Math.PI;
        G.playerGroup.rotation.y = Math.PI;
        G.playerGroup.rotation.x = 0;
        G.playerGroup.rotation.z = 0;
        G.player.isGliding = false;
        G.player.glideCharge = 100;
        G.player.glideState = 'none';
        G.player.glideLiftProgress = 0;
        G.player.hasKite = false;
        G.kiteGroup.visible = false;
        
        // Reset tornado spin effect
        G.tornadoSpinActive = false;
        
        // Reset other player gliding state
        otherPlayerIsGliding = false;
        otherPlayerGlideLiftProgress = 0;
        if (otherPlayerMesh.kiteGroup) {
            otherPlayerMesh.kiteGroup.visible = false;
        }
        
        // Reset other player position and health
        const otherStartX = (!multiplayerManager || multiplayerManager.isHost) ? 2 : -2;
        otherPlayerMesh.position.set(otherStartX, getTerrainHeight(otherStartX, 40), 40);
        otherPlayerMesh.rotation.y = Math.PI;
        G.otherPlayerHealth = 1;
        otherPlayerVelocity.x = 0;
        otherPlayerVelocity.z = 0;
        otherPlayerLastPos.x = otherStartX;
        otherPlayerLastPos.z = 40;
        
        // Reset world kite
        if (G.worldKiteCollected) {
            G.worldKiteCollected = false;
            G.scene.add(G.worldKiteGroup);
        }
        
        G.goblins.forEach(gob => {
            gob.alive = true;
            gob.mesh.visible = true;
            gob.mesh.rotation.z = 0;
            gob.health = gob.maxHealth;
            gob.direction = 1;
            gob.isChasing = false;
            gob.patrolLeft = gob.initialPatrolLeft;
            gob.patrolRight = gob.initialPatrolRight;
            const terrainH = getTerrainHeight(gob.initialX, gob.initialZ);
            gob.mesh.position.set(gob.initialX, terrainH, gob.initialZ);
            if (gob.isGuardian) {
                gob.lastFireTime = Date.now() - Math.random() * 4000;
            }
        });
        
        G.bullets.forEach(b => G.scene.remove(b.mesh));
        G.bullets.length = 0;
        
        G.explosions.forEach(exp => G.scene.remove(exp.mesh));
        G.explosions.length = 0;
        
        G.guardianArrows.forEach(arrow => G.scene.remove(arrow.mesh));
        G.guardianArrows.length = 0;
        
        G.bombs.forEach(bomb => G.scene.remove(bomb.mesh));
        G.bombs.length = 0;
        
        // Reset birds
        G.birds.forEach(bird => {
            bird.lastBombTime = Date.now();
        });
        
        G.ammo = GAME_CONFIG.STARTING_AMMO;
        G.playerHealth = 1;
        G.lastDamageTime = 0;
        G.bridgeRepaired = false;
        G.materialsCollected = 0;
        G.hasIcePower = false;
        G.icePowerCollected = false;
        G.hasBananaPower = false;
        G.worldBananaPowerCollected = false;
        G.bananaInventory = 0;
        G.bombInventory = 0;
        G.herzmanInventory = GAME_CONFIG.HERZMAN_STARTING_COUNT;
        if (G.bridgeObj) {
            G.bridgeObj.mesh.visible = false;
        }
        if (G.brokenBridgeGroup) {
            G.brokenBridgeGroup.visible = true;
        }
        
        // Remove all placed bananas
        G.placedBananas.forEach(banana => G.scene.remove(banana.mesh));
        G.placedBananas.length = 0;
        
        // Remove all placed bombs
        G.placedBombs.forEach(bomb => G.scene.remove(bomb.mesh));
        G.placedBombs.length = 0;
        
        // Remove all placed Herz-Men
        G.placedHerzmen.forEach(herzman => G.scene.remove(herzman.mesh));
        G.placedHerzmen.length = 0;
        
        // Remove all heart bombs
        G.heartBombs.forEach(hb => G.scene.remove(hb.mesh));
        G.heartBombs.length = 0;
        
        // Remove all lava trails
        G.lavaTrails.forEach(trail => G.scene.remove(trail.mesh));
        G.lavaTrails.length = 0;
        
        // Remove all mummy tornados
        G.mummyTornados.forEach(tornado => G.scene.remove(tornado.mesh));
        G.mummyTornados.length = 0;
        
        // Remove all fireballs
        G.fireballs.forEach(fb => {
            if (fb.trail) {
                fb.trail.forEach(t => G.scene.remove(t.sprite));
            }
            G.scene.remove(fb.mesh);
        });
        G.fireballs.length = 0;
        
        G.materials.forEach(material => {
            material.collected = false;
            material.mesh.visible = true;
        });
        
        G.ammoPickups.forEach(pickup => {
            pickup.collected = false;
            pickup.mesh.visible = true;
        });
        
        G.healthPickups.forEach(pickup => {
            pickup.collected = false;
            pickup.mesh.visible = true;
        });
        
        G.bombPickups.forEach(pickup => {
            pickup.collected = false;
            pickup.mesh.visible = true;
        });
    }

    // HUD
    G.hudCanvas = document.createElement('canvas');
    G.hudCanvas.width = window.innerWidth;
    G.hudCanvas.height = window.innerHeight;
    G.hudCanvas.style.position = 'absolute';
    G.hudCanvas.style.top = '0';
    G.hudCanvas.style.left = '0';
    G.hudCanvas.style.width = '100%';
    G.hudCanvas.style.height = '100%';
    G.hudCanvas.style.pointerEvents = 'none';
    G.container.appendChild(G.hudCanvas);
    G.hudCtx = G.hudCanvas.getContext('2d');

    window.addEventListener('resize', () => {
        G.hudCanvas.width = window.innerWidth;
        G.hudCanvas.height = window.innerHeight;
    }, { signal: G.eventSignal });

    function drawHUD() {
        G.hudCtx.clearRect(0, 0, G.hudCanvas.width, G.hudCanvas.height);
        
        // Level indicator (top right)
        G.hudCtx.fillStyle = '#6600cc';
        G.hudCtx.font = 'bold 24px Arial';
        const levelText = `Level ${currentLevel}`;
        const levelTextWidth = G.hudCtx.measureText(levelText).width;
        G.hudCtx.fillText(levelText, G.hudCanvas.width - levelTextWidth - 20, 30);
        
        // Portal proximity indicator
        if (G.portal) {
            const distToPortal = Math.sqrt(
                Math.pow(G.playerGroup.position.x - G.portal.x, 2) +
                Math.pow(G.playerGroup.position.z - G.portal.z, 2)
            );
            if (distToPortal < 8) {
                G.hudCtx.fillStyle = '#00ffff';
                G.hudCtx.font = 'bold 28px Arial';
                const portalText = `Betrete das Portal zu Level ${G.portal.destinationLevel}!`;
                const portalTextWidth = G.hudCtx.measureText(portalText).width;
                G.hudCtx.fillText(portalText, (G.hudCanvas.width - portalTextWidth) / 2, G.hudCanvas.height - 60);
            }
        }
        
        G.hudCtx.fillStyle = '#000';
        G.hudCtx.font = 'bold 18px Arial';
        G.hudCtx.fillText(`Schüsse: ${G.ammo}/${G.maxAmmo}`, 10, 25);
        
        const aliveGoblins = G.goblins.filter(g => g.alive).length;
        G.hudCtx.fillText(`Kobolde: ${aliveGoblins}`, 10, 50);
        
        G.hudCtx.fillText(`Material: ${G.materialsCollected}/${G.materialsNeeded}`, 10, 75);
        
        // Scarab display (only if level has scarabs)
        let nextYPos = 100;
        if (G.totalScarabs > 0) {
            G.hudCtx.fillStyle = G.scarabsCollected >= G.totalScarabs ? '#00ff88' : '#00ccaa';
            G.hudCtx.fillText(`Scarabs: ${G.scarabsCollected}/${G.totalScarabs}`, 10, nextYPos);
            G.hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Candy display (only if candy theme with candy to collect)
        if (G.candyTheme && G.totalCandy > 0) {
            G.hudCtx.fillStyle = G.candyCollected >= G.totalCandy ? '#FF69B4' : '#FFB6C1';
            G.hudCtx.fillText(`Süßigkeiten: ${G.candyCollected}/${G.totalCandy}`, 10, nextYPos);
            G.hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Health display
        G.hudCtx.fillText(`Leben: ${G.playerHealth}/${G.maxPlayerHealth}`, 10, nextYPos);
        nextYPos += 25;
        
        // Damage flash effect
        const now = Date.now();
        if (now - G.damageFlashTime < 300) {
            const flashOpacity = 0.4 * (1 - (now - G.damageFlashTime) / 300);
            G.hudCtx.fillStyle = `rgba(255, 0, 0, ${flashOpacity})`;
            G.hudCtx.fillRect(0, 0, G.hudCanvas.width, G.hudCanvas.height);
        }
        
        // Kite charge bar or collection status
        if (G.player.hasKite) {
            G.hudCtx.fillText(`Drachen: ${Math.floor(G.player.glideCharge)}%`, 10, nextYPos);
            G.hudCtx.fillStyle = G.player.glideCharge >= 20 ? '#00FF00' : '#FF0000';
            G.hudCtx.fillRect(10, nextYPos + 5, G.player.glideCharge * 2, 10);
            G.hudCtx.strokeStyle = '#000';
            G.hudCtx.strokeRect(10, nextYPos + 5, 200, 10);
            G.hudCtx.fillStyle = '#000';
            nextYPos += 25;
        } else {
            G.hudCtx.fillStyle = '#FFD700';
            G.hudCtx.fillText('Finde den Drachen auf der anderen Seite!', 10, nextYPos);
            G.hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Ice power status
        if (G.hasIcePower) {
            const cooldownRemaining = Math.max(0, G.icePowerCooldown - (now - G.lastIcePowerTime));
            if (cooldownRemaining > 0) {
                G.hudCtx.fillStyle = '#666';
                G.hudCtx.fillText('Eis-Kraft: ' + Math.ceil(cooldownRemaining / 1000) + 's', 10, nextYPos);
            } else {
                G.hudCtx.fillStyle = '#00BFFF';
                G.hudCtx.fillText('Eis-Kraft: Drücke E zum Einfrieren!', 10, nextYPos);
            }
            G.hudCtx.fillStyle = '#000';
            nextYPos += 25;
        } else if (!G.icePowerCollected) {
            G.hudCtx.fillStyle = '#87CEEB';
            G.hudCtx.fillText('Finde den Eisberg für Eis-Kraft!', 10, nextYPos);
            G.hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Banana power status
        if (G.hasBananaPower) {
            G.hudCtx.fillStyle = '#FFD700';
            G.hudCtx.fillText(`🍌 Bananen: ${G.bananaInventory}/${G.maxBananas} (Drücke B)`, 10, nextYPos);
            G.hudCtx.fillStyle = '#000';
            nextYPos += 25;
        } else if (!G.worldBananaPowerCollected) {
            G.hudCtx.fillStyle = '#FFFF99';
            G.hudCtx.fillText('Finde den Bananen-Eisberg!', 10, nextYPos);
            G.hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Bomb inventory
        G.hudCtx.fillStyle = '#FF4500';
        G.hudCtx.fillText(`💣 Bomben: ${G.bombInventory}/${G.maxBombs} (Drücke X)`, 10, nextYPos);
        G.hudCtx.fillStyle = '#000';
        nextYPos += 25;
        
        // Herz-Man inventory - show inventory count
        G.hudCtx.fillStyle = '#FF69B4';
        const placedCount = G.placedHerzmen ? G.placedHerzmen.length : 0;
        G.hudCtx.fillText(`💕 Herz-Man: ${G.herzmanInventory} bereit, ${placedCount} aktiv (H/L1)`, 10, nextYPos);
        G.hudCtx.fillStyle = '#000';
        
        if (!G.bridgeRepaired && G.materialsCollected >= G.materialsNeeded) {
            G.hudCtx.fillStyle = '#FFD700';
            G.hudCtx.fillText('Gehe zur Brücke um sie zu reparieren!', 10, 185);
            G.hudCtx.fillStyle = '#000';
        } else if (G.bridgeRepaired) {
            G.hudCtx.fillStyle = '#00FF00';
            G.hudCtx.fillText('Brücke repariert!', 10, 185);
            G.hudCtx.fillStyle = '#000';
        }
        
        if (gameWon) {
            G.hudCtx.fillStyle = 'rgba(255, 215, 0, 0.9)';
            G.hudCtx.fillRect(G.hudCanvas.width / 2 - 150, G.hudCanvas.height / 2 - 100, 300, 200);
            
            G.hudCtx.fillStyle = '#000';
            G.hudCtx.font = 'bold 36px Arial';
            G.hudCtx.textAlign = 'center';
            G.hudCtx.fillText('GEWONNEN!', G.hudCanvas.width / 2, G.hudCanvas.height / 2);
            G.hudCtx.font = '20px Arial';
            // Show different message for host vs client
            if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                G.hudCtx.fillText('Drücke R zum Neustart', G.hudCanvas.width / 2, G.hudCanvas.height / 2 + 60);
            } else {
                G.hudCtx.fillText('Warte auf Host für Neustart...', G.hudCanvas.width / 2, G.hudCanvas.height / 2 + 60);
            }
            G.hudCtx.textAlign = 'left';
        }
        
        if (gameDead) {
            G.hudCtx.fillStyle = 'rgba(200, 0, 0, 0.6)';
            G.hudCtx.fillRect(0, 0, G.hudCanvas.width, G.hudCanvas.height);
            
            G.hudCtx.fillStyle = '#FFF';
            G.hudCtx.font = 'bold 48px Arial';
            G.hudCtx.textAlign = 'center';
            G.hudCtx.fillText('GESTORBEN', G.hudCanvas.width / 2, G.hudCanvas.height / 2 - 30);
            G.hudCtx.font = '24px Arial';
            // Show different message for host vs client
            if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                G.hudCtx.fillText('Drücke R zum Neustart', G.hudCanvas.width / 2, G.hudCanvas.height / 2 + 30);
            } else {
                G.hudCtx.fillText('Warte auf Host für Neustart...', G.hudCanvas.width / 2, G.hudCanvas.height / 2 + 30);
            }
            G.hudCtx.textAlign = 'left';
        }
        
        // Math exercise display
        if (mathExerciseActive && mathExercises.length > 0) {
            // Semi-transparent overlay
            G.hudCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            G.hudCtx.fillRect(0, 0, G.hudCanvas.width, G.hudCanvas.height);
            
            // Exercise text
            G.hudCtx.fillStyle = 'white';
            G.hudCtx.font = 'bold 48px Arial';
            G.hudCtx.textAlign = 'center';
            G.hudCtx.fillText('Löse die Aufgabe!', G.hudCanvas.width / 2, 150);
            
            G.hudCtx.font = 'bold 64px Arial';
            G.hudCtx.fillText(mathExercises[0].question + ' = ?', G.hudCanvas.width / 2, 250);
            
            G.hudCtx.font = 'bold 56px Arial';
            G.hudCtx.fillStyle = '#4CAF50';
            G.hudCtx.fillText(currentMathAnswer || '_', G.hudCanvas.width / 2, 350);
            
            // Show remaining exercises
            if (mathExercises.length > 1) {
                G.hudCtx.font = '24px Arial';
                G.hudCtx.fillStyle = 'white';
                G.hudCtx.fillText(`Noch ${mathExercises.length} Aufgaben`, G.hudCanvas.width / 2, 420);
            }
            
            G.hudCtx.font = '20px Arial';
            G.hudCtx.fillStyle = '#AAA';
            G.hudCtx.fillText('Gib deine Antwort ein und drücke ENTER', G.hudCanvas.width / 2, 480);
            G.hudCtx.textAlign = 'left';
        }
        
        // Other player marker/indicator
        if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh && otherPlayerMesh.visible) {
            // Project other player's 3D position to 2D screen coordinates
            const otherPos = otherPlayerMesh.position.clone();
            otherPos.y += 2; // Slightly above head
            otherPos.project(G.camera);
            
            // Convert from normalized device coordinates (-1 to 1) to screen pixels
            const screenX = (otherPos.x * 0.5 + 0.5) * G.hudCanvas.width;
            const screenY = (-otherPos.y * 0.5 + 0.5) * G.hudCanvas.height;
            
            // Check if behind camera (z > 1 means behind)
            const isBehindCamera = otherPos.z > 1;
            
            // Check if on screen (with margin)
            const margin = 60;
            const isOnScreen = !isBehindCamera && 
                               screenX >= margin && screenX <= G.hudCanvas.width - margin &&
                               screenY >= margin && screenY <= G.hudCanvas.height - margin;
            
            // Player label
            const playerLabel = multiplayerManager.isHost ? "Spieler 2" : "Spieler 1";
            const markerColor = multiplayerManager.isHost ? '#4488FF' : '#FF6B9D';
            
            if (isOnScreen) {
                // Draw marker above player when visible
                G.hudCtx.fillStyle = markerColor;
                G.hudCtx.beginPath();
                G.hudCtx.moveTo(screenX, screenY - 25);
                G.hudCtx.lineTo(screenX - 10, screenY - 40);
                G.hudCtx.lineTo(screenX + 10, screenY - 40);
                G.hudCtx.closePath();
                G.hudCtx.fill();
                
                // Draw label
                G.hudCtx.font = 'bold 14px Arial';
                G.hudCtx.textAlign = 'center';
                G.hudCtx.fillStyle = '#FFF';
                G.hudCtx.strokeStyle = '#000';
                G.hudCtx.lineWidth = 3;
                G.hudCtx.strokeText(playerLabel, screenX, screenY - 45);
                G.hudCtx.fillText(playerLabel, screenX, screenY - 45);
                G.hudCtx.textAlign = 'left';
            } else {
                // Draw arrow at edge of screen pointing to other player
                let edgeX = screenX;
                let edgeY = screenY;
                
                // If behind camera, flip the direction
                if (isBehindCamera) {
                    edgeX = G.hudCanvas.width - screenX;
                    edgeY = G.hudCanvas.height - screenY;
                }
                
                // Clamp to screen edges with margin
                edgeX = Math.max(margin, Math.min(G.hudCanvas.width - margin, edgeX));
                edgeY = Math.max(margin, Math.min(G.hudCanvas.height - margin, edgeY));
                
                // Calculate direction from center to clamped position for arrow rotation
                const centerX = G.hudCanvas.width / 2;
                const centerY = G.hudCanvas.height / 2;
                const dirX = isBehindCamera ? (G.hudCanvas.width - screenX) - centerX : screenX - centerX;
                const dirY = isBehindCamera ? (G.hudCanvas.height - screenY) - centerY : screenY - centerY;
                const angle = Math.atan2(dirY, dirX);
                
                // Draw arrow indicator at edge
                G.hudCtx.save();
                G.hudCtx.translate(edgeX, edgeY);
                G.hudCtx.rotate(angle);
                
                // Arrow shape pointing right (will be rotated)
                G.hudCtx.fillStyle = markerColor;
                G.hudCtx.strokeStyle = '#000';
                G.hudCtx.lineWidth = 2;
                G.hudCtx.beginPath();
                G.hudCtx.moveTo(20, 0);         // Tip
                G.hudCtx.lineTo(-10, -12);      // Top back
                G.hudCtx.lineTo(-5, 0);         // Notch
                G.hudCtx.lineTo(-10, 12);       // Bottom back
                G.hudCtx.closePath();
                G.hudCtx.fill();
                G.hudCtx.stroke();
                
                G.hudCtx.restore();
                
                // Draw label near arrow
                G.hudCtx.font = 'bold 12px Arial';
                G.hudCtx.textAlign = 'center';
                G.hudCtx.fillStyle = '#FFF';
                G.hudCtx.strokeStyle = '#000';
                G.hudCtx.lineWidth = 3;
                const labelOffsetX = Math.cos(angle + Math.PI) * 35;
                const labelOffsetY = Math.sin(angle + Math.PI) * 35;
                G.hudCtx.strokeText(playerLabel, edgeX + labelOffsetX, edgeY + labelOffsetY);
                G.hudCtx.fillText(playerLabel, edgeX + labelOffsetX, edgeY + labelOffsetY);
                G.hudCtx.textAlign = 'left';
            }
        }
    }

    // Start background music
    Audio.startBackgroundMusic();

    // Game loop with delta time
    G.lastTime = performance.now();
    G.targetFPS = 60;
    G.targetFrameTime = 1000 / G.targetFPS;
    G.accumulator = 0;
    
    function animate(currentTime) {
        currentAnimationId = requestAnimationFrame(animate);
        
        const deltaTime = currentTime - G.lastTime;
        G.lastTime = currentTime;
        G.accumulator += deltaTime;
        
        const time = currentTime * 0.001;
        
        // Animate water waves in water theme
        if (G.waterTheme && G.scene.userData.water) {
            const water = G.scene.userData.water;
            const waveData = water.userData.waveData;
            const vertices = water.userData.vertices;
            
            for (let i = 0; i < vertices.count; i++) {
                const data = waveData[i];
                const waveHeight = Math.sin(data.x * 0.15 + time) * 0.25 + 
                                  Math.sin(data.z * 0.2 + time * 1.5 + data.randomPhase) * 0.2 +
                                  Math.sin(data.x * 0.3 + data.z * 0.25 + time * 0.8) * 0.1;
                vertices.setZ(i, waveHeight); // Set Z (height) after plane rotation
            }
            vertices.needsUpdate = true;
            water.geometry.computeVertexNormals();
        }
        
        // Animate river water (visual only, runs every frame) - only if river exists
        if (G.riverObj) {
            const riverGeometry = G.riverObj.mesh.geometry;
            const positions = riverGeometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const wave = Math.sin(x * 0.5 + time * 2) * Math.cos(y * 0.5 + time * 1.5) * 0.05;
                positions.setZ(i, wave);
            }
            positions.needsUpdate = true;
        }
        
        // Rotate world kite (visual only)
        if (!G.worldKiteCollected) {
            G.worldKiteGroup.rotation.y = time;
        }
        
        // Animate grass bushels (visual only)
        G.grassBushels.forEach(grass => {
            const sway = Math.sin(time * 2 + grass.phase) * 0.1;
            grass.mesh.rotation.z = sway;
        });
        
        // Animate player kites with natural sway movement
        if (G.kiteGroup.visible) {
            // Subtle random-looking movement using multiple sine waves
            const kiteSwayX = Math.sin(time * 1.5) * 0.15 + Math.sin(time * 2.3) * 0.1;
            const kiteSwayY = Math.sin(time * 1.8 + 1) * 0.1 + Math.cos(time * 2.1) * 0.08;
            const kiteSwayZ = Math.sin(time * 1.2 + 2) * 0.12;
            // Tilt forward/back from upright position with nose up - subtle rotation
            G.kiteGroup.rotation.x = -Math.PI / 2 + 0.3 + Math.sin(time * 1.5) * 0.05;
            G.kiteGroup.rotation.z = kiteSwayY * 0.05;
            G.kiteGroup.position.x = kiteSwayZ * 0.5;
            G.kiteGroup.position.y = 3.5 + Math.sin(time * 0.8) * 0.3;  // Gentle bobbing
        }
        if (otherPlayerMesh.kiteGroup && otherPlayerMesh.kiteGroup.visible) {
            const otherKiteSwayX = Math.sin(time * 1.6 + 0.5) * 0.15 + Math.sin(time * 2.4 + 1) * 0.1;
            const otherKiteSwayY = Math.sin(time * 1.9 + 1.5) * 0.1 + Math.cos(time * 2.2 + 0.5) * 0.08;
            const otherKiteSwayZ = Math.sin(time * 1.3 + 2.5) * 0.12;
            // Tilt forward/back from upright position with nose up - subtle rotation
            otherPlayerMesh.kiteGroup.rotation.x = -Math.PI / 2 + 0.3 + Math.sin(time * 1.6 + 0.5) * 0.05;
            otherPlayerMesh.kiteGroup.rotation.z = otherKiteSwayY * 0.05;
            otherPlayerMesh.kiteGroup.position.x = otherKiteSwayZ * 0.5;
            otherPlayerMesh.kiteGroup.position.y = 3.5 + Math.sin(time * 0.9 + 1) * 0.3;
        }
        
        // Animate clouds (visual only)
        updateClouds();
        
        // Animate health pickups (visual only)
        G.healthPickups.forEach(pickup => {
            if (!pickup.collected) {
                pickup.mesh.rotation.y = time * 2;
                pickup.mesh.position.y = getTerrainHeight(pickup.mesh.position.x, pickup.mesh.position.z) + 0.3 + Math.sin(time * 3) * 0.15;
            }
        });
        
        // Animate portal (visual effects)
        animatePortal();

        // Animate rainbow glow sprites and disco ball - PARTY TIME!
        const rainbowTime = Date.now() * 0.001;
        G.rainbowGlowSprites.forEach(sprite => {
            // More dynamic floating animation with orbiting
            const orbitAngle = rainbowTime * sprite.userData.orbitSpeed + sprite.userData.phase;
            sprite.position.y = sprite.userData.baseY + Math.sin(rainbowTime * sprite.userData.speed + sprite.userData.phase) * 0.5;
            sprite.position.x = sprite.userData.baseX + Math.cos(rainbowTime * sprite.userData.speed * 0.5 + sprite.userData.phase) * 0.4;
            sprite.position.z = sprite.userData.baseZ + Math.sin(orbitAngle) * 0.3;
            // Pulsing opacity - more dramatic
            const pulse = 0.5 + 0.5 * Math.sin(rainbowTime * sprite.userData.pulseSpeed + sprite.userData.phase);
            sprite.material.opacity = 0.5 + pulse * 0.5;
            // Scale pulsing
            const scalePulse = 1 + 0.3 * Math.sin(rainbowTime * sprite.userData.pulseSpeed * 0.5 + sprite.userData.phase);
            sprite.scale.setScalar(sprite.scale.x * 0.95 + (0.5 + Math.random() * 0.3) * scalePulse * 0.05);
        });

        // Animate disco ball - faster spinning!
        G.discoBallGroup.rotation.y += 0.04;
        // Animate mirror colors cycling through rainbow - faster and brighter
        G.discoMirrors.forEach((mirror, i) => {
            const colorIndex = Math.floor((rainbowTime * 4 + mirror.userData.phase + i * 0.05) % G.rainbowColors.length);
            const brightness = 0.8 + 0.2 * Math.sin(rainbowTime * 5 + mirror.userData.phase);
            const color = new THREE.Color(G.rainbowColors[colorIndex]);
            color.multiplyScalar(brightness);
            mirror.material.color.copy(color);
        });
        // Animate disco ball light color - strobe effect
        const lightColorIndex = Math.floor(rainbowTime * 5) % G.rainbowColors.length;
        G.discoBallLight.color.set(G.rainbowColors[lightColorIndex]);
        G.discoBallLight.intensity = 2 + Math.sin(rainbowTime * 8) * 1.5;

        // Animate light beams shooting from disco ball
        G.discoLightBeams.forEach((beamPivot, i) => {
            // Rotate beams
            beamPivot.rotation.z = beamPivot.userData.baseAngle + rainbowTime * 0.5;
            beamPivot.rotation.x = Math.sin(rainbowTime * 2 + i) * 0.3;
            // Color the beams
            const beam = beamPivot.children[0];
            if (beam && beam.material) {
                const beamColorIndex = Math.floor((rainbowTime * 3 + i * 0.5) % G.rainbowColors.length);
                beam.material.color = new THREE.Color(G.rainbowColors[beamColorIndex]);
                beam.material.opacity = 0.4 + 0.3 * Math.sin(rainbowTime * 4 + i);
            }
        });

        // Check player proximity to rainbow for techno music
        const rainbowDist = Math.sqrt(
            (G.playerGroup.position.x - G.levelConfig.rainbow.x) ** 2 +
            (G.playerGroup.position.z - (G.levelConfig.rainbow.z + 5)) ** 2
        );
        const technoRange = 25;
        if (rainbowDist < technoRange && !G.technoMusicPlaying && !gameDead) {
            G.technoMusicPlaying = true;
            Audio.stopBackgroundMusic();
            Audio.startTechnoMusic();
        } else if ((rainbowDist >= technoRange || gameDead) && G.technoMusicPlaying) {
            G.technoMusicPlaying = false;
            Audio.stopTechnoMusic();
            if (!gameDead) {
                Audio.startBackgroundMusic();
            }
        }

        // Animate lava pools (pulsing glow effect)
        G.lavaPools.forEach(pool => {
            pool.pulsePhase += 0.05;
            const pulse = 0.8 + Math.sin(pool.pulsePhase) * 0.15;
            // Pulse the light intensity
            if (pool.mesh.children[3]) { // The point light
                pool.mesh.children[3].intensity = pulse;
            }
            // Slight color shift on inner core
            if (pool.mesh.children[1]) {
                const coreHue = 0.08 + Math.sin(pool.pulsePhase * 0.5) * 0.02;
                pool.mesh.children[1].material.color.setHSL(coreHue, 1, 0.5);
            }
        });

        // Animate mist pools (rising mist particles)
        if (G.mistPools) {
            G.mistPools.forEach(pool => {
                pool.phase += 0.02;
                // Animate mist particles rising and fading
                if (pool.mesh.userData.mistParticles) {
                    pool.mesh.userData.mistParticles.children.forEach((particle, idx) => {
                        particle.userData.phase += 0.02 + idx * 0.003;
                        particle.position.y = particle.userData.baseY + Math.sin(particle.userData.phase) * 0.5;
                        particle.material.opacity = 0.2 + Math.sin(particle.userData.phase * 0.7) * 0.15;
                        particle.scale.setScalar(1 + Math.sin(particle.userData.phase * 0.5) * 0.2);
                    });
                }
                // Pulse the mist layer
                const mistMesh = pool.mesh.children[1];
                if (mistMesh && mistMesh.material) {
                    mistMesh.material.opacity = 0.3 + Math.sin(pool.phase) * 0.15;
                }
            });
        }

        // Animate whirlpool traps (spinning effect)
        G.traps.forEach(trap => {
            if (trap.type === 'whirlpool') {
                trap.spinPhase += 0.08;
                if (trap.outerRing) trap.outerRing.rotation.z = trap.spinPhase;
                if (trap.midRing) trap.midRing.rotation.z = -trap.spinPhase * 1.5;
            }
        });

        // Animate and move moving waterspouts
        const now = Date.now();
        G.movingTraps.forEach(trap => {
            // Spin animation - rotate the cones and particles
            trap.spinPhase += 0.08;
            if (trap.outerCone) trap.outerCone.rotation.y = trap.spinPhase;
            if (trap.innerCone) trap.innerCone.rotation.y = -trap.spinPhase * 1.3;
            if (trap.coreCone) trap.coreCone.rotation.y = trap.spinPhase * 1.8;
            if (trap.dustGroup) trap.dustGroup.rotation.y = trap.spinPhase * 0.5;
            if (trap.baseRing) trap.baseRing.rotation.z = trap.spinPhase * 2;
            // Spin debris
            if (trap.debrisGroup) {
                trap.debrisGroup.rotation.y = trap.spinPhase * 0.7;
                trap.debrisGroup.children.forEach(debris => {
                    debris.rotation.x += 0.05;
                    debris.rotation.z += 0.03;
                });
            }

            // Movement - drift around base position
            trap.phase += trap.speed;
            const newX = trap.baseX + Math.sin(trap.phase) * trap.rangeX;
            const newZ = trap.baseZ + Math.cos(trap.phase * 0.7) * trap.rangeZ;
            trap.mesh.position.x = newX;
            trap.mesh.position.z = newZ;

            // Check collision with player (unless gliding)
            if (!gameDead && !G.player.isGliding && !godMode) {
                const dist = Math.sqrt(
                    (G.playerGroup.position.x - newX) ** 2 +
                    (G.playerGroup.position.z - newZ) ** 2
                );
                if (dist < trap.radius) {
                    G.playerHealth = 0;
                    gameDead = true;
                    Audio.stopBackgroundMusic();
                    Audio.playDeathSound();
                }
            }

            // Check collision with other player
            if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost && otherPlayerMesh.visible && !otherPlayerIsGliding) {
                const otherDist = Math.sqrt(
                    (otherPlayerMesh.position.x - newX) ** 2 +
                    (otherPlayerMesh.position.z - newZ) ** 2
                );
                if (otherDist < trap.radius) {
                    multiplayerManager.sendGameEvent('whirlpoolDeath', {});
                }
            }
        });

        // Fixed timestep game logic updates
        while (G.accumulator >= G.targetFrameTime) {
            // Update gamepad input
            updateGamepad();
            
            if (!gameDead && !mathExerciseActive) {
                updatePlayer();
                
                // Camera shake when close to giant (runs every frame)
                const now = Date.now();
                
                // Dragon death shake (overrides giant shake)
                if (now < dragonDeathShakeUntil) {
                    const progress = (dragonDeathShakeUntil - now) / 1200; // 0 to 1
                    const shakeIntensity = dragonDeathShakeIntensity * progress;
                    const shakeSpeed = now * 0.03; // Fast shake
                    G.camera.position.x += Math.sin(shakeSpeed * 5.7) * shakeIntensity;
                    G.camera.position.y += Math.sin(shakeSpeed * 6.3) * shakeIntensity;
                    G.camera.position.z += Math.sin(shakeSpeed * 4.9) * shakeIntensity;
                } else {
                    // Regular giant shake
                    let closestGiantDist = Infinity;
                    G.goblins.forEach(gob => {
                        if (!gob.alive || !gob.isGiant || gob.frozen) return;
                        const distToGiant = new THREE.Vector2(
                            G.playerGroup.position.x - gob.mesh.position.x,
                            G.playerGroup.position.z - gob.mesh.position.z
                        ).length();
                        
                        closestGiantDist = Math.min(closestGiantDist, distToGiant);
                        
                        if (distToGiant < 50) {
                            const shakeIntensity = (1 - distToGiant / 50) * 0.3;
                            const shakeSpeed = now * 0.015;
                            G.camera.position.x += Math.sin(shakeSpeed * 3.7) * shakeIntensity;
                            G.camera.position.y += Math.sin(shakeSpeed * 4.3) * shakeIntensity;
                            G.camera.position.z += Math.sin(shakeSpeed * 3.1) * shakeIntensity;
                        }
                    });
                    
                    // Controller rumble when close to giant
                    if (G.gamepad && closestGiantDist < 50) {
                        const rumbleIntensity = (1 - closestGiantDist / 50) * 0.8;
                        if (G.gamepad.vibrationActuator) {
                            G.gamepad.vibrationActuator.playEffect('dual-rumble', {
                                duration: 100,
                                weakMagnitude: rumbleIntensity * 0.5,
                                strongMagnitude: rumbleIntensity
                            });
                        }
                    }
                }
                
                // Optimistic update for other player position (interpolation between syncs)
                if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                    // Only apply optimistic updates if velocity is significant
                    const velocityMag = Math.sqrt(otherPlayerVelocity.x * otherPlayerVelocity.x + otherPlayerVelocity.z * otherPlayerVelocity.z);
                    if (velocityMag > 0.001) {
                        // Very light dampening for smoother prediction
                        const dampening = 0.08;
                        otherPlayerMesh.position.x += otherPlayerVelocity.x * dampening;
                        otherPlayerMesh.position.z += otherPlayerVelocity.z * dampening;
                    }
                    // Update Y position respecting gliding state
                    const terrainHeight = getTerrainHeight(otherPlayerMesh.position.x, otherPlayerMesh.position.z);
                    if (otherPlayerIsGliding) {
                        // Calculate gliding height
                        const groundHeight = 0.1;
                        const glideHeight = 1.2;
                        const currentHeight = groundHeight + (glideHeight - groundHeight) * otherPlayerGlideLiftProgress;
                        otherPlayerMesh.position.y = terrainHeight + currentHeight;
                    } else {
                        otherPlayerMesh.position.y = terrainHeight + 0.1;
                    }
                }
                
                // Both host and client run bullets and explosions for responsiveness (but not during math)
                if (!mathExerciseActive) {
                    updateBullets();
                    updateExplosions();
                    updateSmoke();
                    updateScorchMarks();
                    updateFireballs();
                }
                
                // Only host runs game logic (goblins, arrows, etc.)
                if (!multiplayerManager || multiplayerManager.isHost) {
                    // Update placed bombs
                    const now = Date.now();
                    for (let i = G.placedBombs.length - 1; i >= 0; i--) {
                        const bomb = G.placedBombs[i];
                        
                        // Animate spark
                        if (bomb.spark) {
                            const timeLeft = bomb.explodeAt - now;
                            const blinkSpeed = Math.max(50, timeLeft / 3);
                            bomb.spark.visible = (now % (blinkSpeed * 2)) < blinkSpeed;
                        }
                        
                        // Check if bomb should explode
                        if (now >= bomb.explodeAt) {
                            // Create explosion
                            createBombExplosion(bomb.x, 0.4, bomb.z);
                            
                            // Damage goblins
                            G.goblins.forEach(gob => {
                                if (gob.alive) {
                                    const distToGob = Math.sqrt(
                                        (gob.mesh.position.x - bomb.x) ** 2 +
                                        (gob.mesh.position.z - bomb.z) ** 2
                                    );
                                    if (distToGob < bomb.radius) {
                                        gob.health -= 5;
                                        if (gob.health <= 0) {
                                            gob.alive = false;
                                            Audio.playGoblinDeathSound();
                                            gob.mesh.rotation.z = Math.PI / 2;
                                            const terrainH = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
                                            gob.mesh.position.y = terrainH + 0.5;
                                            createExplosion(gob.mesh.position.x, 1, gob.mesh.position.z);
                                        }
                                    }
                                }
                            });
                            
                            // Damage player
                            const distToPlayer = Math.sqrt(
                                (G.playerGroup.position.x - bomb.x) ** 2 +
                                (G.playerGroup.position.z - bomb.z) ** 2
                            );
                            if (distToPlayer < bomb.radius && !godMode) {
                                G.playerHealth -= 5;
                                G.damageFlashTime = now;
                                if (G.playerHealth <= 0 && !gameDead) {
                                    gameDead = true;
                                    Audio.stopBackgroundMusic();
                                    Audio.playDeathSound();
                                } else if (G.playerHealth > 0) {
                                    Audio.playStuckSound();
                                }
                            }
                            
                            // Damage dragon if present
                            if (G.dragon && G.dragon.alive) {
                                const distToDragon = Math.sqrt(
                                    (G.dragon.mesh.position.x - bomb.x) ** 2 +
                                    (G.dragon.mesh.position.z - bomb.z) ** 2
                                );
                                if (distToDragon < bomb.radius + 10) {
                                    G.dragon.health -= 5;
                                    if (G.dragon.health <= 0) {
                                        G.dragon.alive = false;
                                        G.dragon.mesh.visible = false;
                                    }
                                }
                            }
                            
                            // Remove bomb mesh
                            G.scene.remove(bomb.mesh);
                            G.placedBombs.splice(i, 1);
                            
                            // Notify other player
                            if (multiplayerManager && multiplayerManager.isConnected()) {
                                multiplayerManager.sendGameEvent('bombExploded', {
                                    id: bomb.id,
                                    x: bomb.x,
                                    y: 0.4,
                                    z: bomb.z
                                });
                            }
                        }
                    }
                    
                    updateGoblins();
                    updateZombieSpawns();
                    updateOvenSpawns();
                    updateGuardianArrows();
                    updateMummyTornados();
                    updateLavaTrails();
                    checkAndSpawnWildTornados();
                    updateBirds();
                    updateBombs();
                    updatePirateShips();
                    updateDragon();
                    updateHerzmen();
                    updateHeartBombs();
                }
                
                // Dragon visuals run on both host and client
                updateDragonVisuals();
                
                // Herz-Men visuals run on both host and client
                updateHerzmenVisuals();
                
                // Heart bomb visuals run on both host and client
                updateHeartBombVisuals();
                
                // Client does optimistic updates
                if (multiplayerManager && !multiplayerManager.isHost) {
                    // Client does optimistic goblin position updates
                    G.goblins.forEach(gob => {
                        if (gob.alive && gob.velocity) {
                            const dampening = 0.5; // Smooth interpolation
                            gob.mesh.position.x += gob.velocity.x * dampening;
                            gob.mesh.position.z += gob.velocity.z * dampening;
                            const terrainHeight = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
                            gob.mesh.position.y = terrainHeight + 0.1;
                        }
                    });
                    
                    // Client does optimistic arrow position updates
                    G.guardianArrows.forEach(arrow => {
                        if (arrow.velocity) {
                            const dampening = 0.6; // Smooth interpolation for arrows
                            arrow.mesh.position.x += arrow.velocity.x * dampening;
                            arrow.mesh.position.y += arrow.velocity.y * dampening;
                            arrow.mesh.position.z += arrow.velocity.z * dampening;
                        }
                    });
                }
                
                // Both update audio based on their position
                Audio.updateGoblinProximitySound(G.playerGroup.position, G.goblins);
                Audio.updateGiantProximitySound(G.playerGroup.position, G.goblins);
            }
            
            G.accumulator -= G.targetFrameTime;
        }
        
        drawHUD();
        G.renderer.render(G.scene, G.camera);
    }

    currentAnimationId = requestAnimationFrame(animate);

    // Export functions needed by other files
    window.resetGame = resetGame;
}
