/**
 * Gameplay Items - Player-placed items (bananas, bombs, herzmen)
 * Handles placement and creation of player-used traps and allies
 */
(function() {
    'use strict';

    // Place a banana trap in front of player
    function placeBanana() {
        if (G.bananaInventory <= 0) return;
        
        G.bananaInventory--;
        
        // Create banana mesh
        const bananaGroup = new THREE.Group();
        
        // Banana body (curved cylinder)
        const bananaGeometry = getGeometry('cylinder', 0.3, 0.3, 1.5, 8);
        const bananaMaterial = getMaterial('lambert', { 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.3
        });
        const bananaMesh = new THREE.Mesh(bananaGeometry, bananaMaterial);
        bananaMesh.rotation.z = Math.PI / 6; // Slight curve
        bananaMesh.castShadow = true;
        bananaGroup.add(bananaMesh);
        
        // Banana ends (darker)
        const endMaterial = getMaterial('lambert', { color: 0x8B7500 });
        const endGeometry = getGeometry('sphere', 0.35, 8, 8);
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
    
    // Place a timed bomb with throw animation
    function placeBomb() {
        if (G.bombInventory <= 0) return;
        
        const bombId = Date.now() + Math.random();
        G.bombInventory--;
        
        // Create bomb mesh
        const bombGroup = new THREE.Group();
        
        // Main sphere (black bomb)
        const sphereGeometry = getGeometry('sphere', 0.4, 16, 16);
        const sphereMaterial = getMaterial('lambert', { color: 0x1a1a1a });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        bombGroup.add(sphere);
        
        // Fuse
        const fuseGeometry = getGeometry('cylinder', 0.05, 0.05, 0.3, 8);
        const fuseMaterial = getMaterial('lambert', { color: 0x8B4513 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.4;
        bombGroup.add(fuse);
        
        // Animated spark
        const sparkGeometry = getGeometry('sphere', 0.1, 8, 8);
        const sparkMaterial = getMaterial('basic', { 
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
        
        const bananaGeometry = getGeometry('cylinder', 0.3, 0.3, 1.5, 8);
        const bananaMaterial = getMaterial('lambert', { 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.3
        });
        const bananaMesh = new THREE.Mesh(bananaGeometry, bananaMaterial);
        bananaMesh.rotation.z = Math.PI / 6;
        bananaMesh.castShadow = true;
        bananaGroup.add(bananaMesh);
        
        const endMaterial = getMaterial('lambert', { color: 0x8B7500 });
        const endGeometry = getGeometry('sphere', 0.35, 8, 8);
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
        
        const sphereGeometry = getGeometry('sphere', 0.4, 16, 16);
        const sphereMaterial = getMaterial('lambert', { color: 0x1a1a1a });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        bombGroup.add(sphere);
        
        const fuseGeometry = getGeometry('cylinder', 0.05, 0.05, 0.3, 8);
        const fuseMaterial = getMaterial('lambert', { color: 0x8B4513 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.4;
        bombGroup.add(fuse);
        
        const sparkGeometry = getGeometry('sphere', 0.1, 8, 8);
        const sparkMaterial = getMaterial('basic', { 
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
    
    // Splitscreen player dispatch functions
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

    // Export to window for global access
    window.placeBanana = placeBanana;
    window.placeBomb = placeBomb;
    window.placeHerzman = placeHerzman;
    window.placeBananaAt = placeBananaAt;
    window.placeBombAt = placeBombAt;
    window.placeHerzmanAt = placeHerzmanAt;
    window.placeBananaForPlayer = placeBananaForPlayer;
    window.placeBombForPlayer = placeBombForPlayer;
    window.placeHerzmanForPlayer = placeHerzmanForPlayer;
})();
