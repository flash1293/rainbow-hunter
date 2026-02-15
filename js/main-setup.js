// main-setup.js - Player, environment objects, and input setup

function initSetup() {
    G.hasRiver = G.levelConfig.hasRiver !== false; // Default true for backward compat
    G.riverObj = null;
    G.bridgeObj = null;
    G.brokenBridgeGroup = null;
    if (G.hasRiver) {
        G.riverObj = createRiver(G.scene, THREE);
        G.bridgeObj = createBridge(G.scene, THREE);
        G.brokenBridgeGroup = createBrokenBridge(G.scene, THREE);
    }
    
    // Create 3D clouds
    G.clouds = [];
    function createCloud(x, y, z) {
        const cloudGroup = new THREE.Group();
        
        // Create fluffy cloud from multiple spheres
        const cloudMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.85
        });
        
        // Main cloud body - randomized cluster of spheres
        const numPuffs = 8 + Math.floor(Math.random() * 6);
        for (let i = 0; i < numPuffs; i++) {
            const puffSize = 3 + Math.random() * 5;
            const puffGeometry = new THREE.SphereGeometry(puffSize, 8, 8);
            const puff = new THREE.Mesh(puffGeometry, cloudMaterial);
            
            // Position puffs in a cloud-like cluster
            puff.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 8
            );
            
            // Scale some puffs differently for variety
            const scaleVar = 0.7 + Math.random() * 0.6;
            puff.scale.set(scaleVar, scaleVar * 0.7, scaleVar);
            
            cloudGroup.add(puff);
        }
        
        cloudGroup.position.set(x, y, z);
        
        // Random speed for each cloud
        const speed = 0.02 + Math.random() * 0.03;
        
        G.scene.add(cloudGroup);
        return { mesh: cloudGroup, speed: speed, startX: x };
    }
    
    // Create clouds in a grid pattern for even distribution
    G.cloudGridX = 8;  // Number of G.clouds across X axis
    G.cloudGridZ = 6;  // Number of G.clouds across Z axis
    G.cloudSpacingX = 500 / G.cloudGridX;  // Total X range divided by count
    G.cloudSpacingZ = 300 / G.cloudGridZ;  // Total Z range divided by count
    
    for (let xi = 0; xi < G.cloudGridX; xi++) {
        for (let zi = 0; zi < G.cloudGridZ; zi++) {
            // Base position from grid, with small random offset for natural look
            const x = -250 + xi * G.cloudSpacingX + (Math.random() - 0.5) * 30;
            const y = 50 + Math.random() * 35;
            const z = -280 + zi * G.cloudSpacingZ + (Math.random() - 0.5) * 25;
            G.clouds.push(createCloud(x, y, z));
        }
    }
    
    // Function to update clouds
    function updateClouds() {
        G.clouds.forEach(cloud => {
            cloud.mesh.position.x += cloud.speed;
            
            // Wrap around when cloud goes too far
            if (cloud.mesh.position.x > 250) {
                cloud.mesh.position.x = -250;
            }
        });
    }
   
    // Game state variables
    G.bridgeRepaired = false;
    // Use persistent inventory if available, otherwise use defaults
    G.ammo = persistentInventory.ammo !== null ? persistentInventory.ammo : GAME_CONFIG.STARTING_AMMO;
    G.maxAmmo = GAME_CONFIG.MAX_AMMO;
    G.materialsCollected = 0;
    G.materialsNeeded = GAME_CONFIG.MATERIALS_NEEDED;
    G.playerHealth = persistentInventory.health !== null ? persistentInventory.health : 1;
    G.otherPlayerHealth = 1;
    G.maxPlayerHealth = 4;
    G.lastDamageTime = 0;
    G.damageCooldown = 2500; // ms between damage from G.goblins
    G.damageFlashTime = 0;
    
    // Shrink/Grow mechanic for enchanted level
    G.playerScale = 1.0;           // Current player scale (1.0 = normal)
    G.playerShrunk = false;        // Is player currently shrunk?
    G.playerGiant = false;         // Is player currently giant?
    G.giantEndTime = 0;            // When does giant mode expire?
    G.shrinkScale = 0.4;           // Scale when shrunk
    G.giantScale = 1.8;            // Scale when giant
    G.giantDuration = 8000;        // How long giant mode lasts (ms)
    
    // Player 2 shrink/grow (splitscreen)
    G.player2Scale = 1.0;
    G.player2Shrunk = false;
    G.player2Giant = false;
    G.giant2EndTime = 0;
    
    G.tornadoSpinActive = false;
    G.tornadoSpinStartTime = 0;
    G.tornadoSpinActive2 = false;
    G.tornadoSpinStartTime2 = 0;
    G.tornadoSpinDuration = 800; // ms for the spin effect
    G.tornadoSpinRotations = 3; // number of full rotations
    G.tornadoSpinLiftHeight = 2.5; // how high to lift the G.player
    G.lastClientStateSend = 0;
    G.clientStateSendInterval = 50; // Send client state at 20Hz to match host sync
    
    // Get textures for player
    G.playerTextures = getTerrainTextures(THREE);
    
    // Create player
    G.playerGroup = new THREE.Group();

    if (G.waterTheme) {
        // Boat hull
        const hullGeometry = new THREE.BoxGeometry(1.2, 0.4, 2.5);
        const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 0.2;
        hull.castShadow = true;
        G.playerGroup.add(hull);
        
        // Boat deck
        const deckGeometry = new THREE.BoxGeometry(1.0, 0.1, 2.3);
        const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 0.45;
        deck.castShadow = true;
        G.playerGroup.add(deck);
        
        // Mast
        const mastGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
        const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.set(0, 1.75, 0);
        mast.castShadow = true;
        G.playerGroup.add(mast);
        
        // Sail
        const sailGeometry = new THREE.BufferGeometry();
        const sailVertices = new Float32Array([
            0, 0, 0,
            0.7, 0.6, 0,
            0, 1.2, 0
        ]);
        sailGeometry.setAttribute('position', new THREE.BufferAttribute(sailVertices, 3));
        sailGeometry.computeVertexNormals();
        const sailMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.set(0, 0.9, 0);
        sail.castShadow = true;
        G.playerGroup.add(sail);
        
        // Rudder
        const rudderGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.3);
        const rudder = new THREE.Mesh(rudderGeometry, hullMaterial);
        rudder.position.set(0, 0.2, 1.3);
        rudder.castShadow = true;
        G.playerGroup.add(rudder);
    } else {
        // Bicycle wheels
        const wheelGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

        const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        frontWheel.rotation.y = Math.PI / 2;
        frontWheel.position.set(0, 0.3, -0.7);
        frontWheel.castShadow = true;
        G.playerGroup.add(frontWheel);

        const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        backWheel.rotation.y = Math.PI / 2;
        backWheel.position.set(0, 0.3, 0.5);
        backWheel.castShadow = true;
        G.playerGroup.add(backWheel);

    // Bicycle frame
    const frameGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B9D });
    const frame1 = new THREE.Mesh(frameGeometry, frameMaterial);
    frame1.rotation.x = Math.PI / 2;
    frame1.position.set(0, 0.5, -0.1);
    frame1.castShadow = true;
    G.playerGroup.add(frame1);

        // Seat post
        const seatPostGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const seatPost = new THREE.Mesh(seatPostGeometry, frameMaterial);
        seatPost.position.set(0, 0.75, 0.2);
        seatPost.castShadow = true;
        G.playerGroup.add(seatPost);

        // Handlebar post
        const handlebarPostGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
        const handlebarPost = new THREE.Mesh(handlebarPostGeometry, frameMaterial);
        handlebarPost.position.set(0, 0.7, -0.5);
        handlebarPost.castShadow = true;
        G.playerGroup.add(handlebarPost);

        // Handlebar
        const handlebarGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
        const handlebar = new THREE.Mesh(handlebarGeometry, frameMaterial);
        handlebar.rotation.z = Math.PI / 2;
        handlebar.position.set(0, 0.9, -0.5);
        handlebar.castShadow = true;
        G.playerGroup.add(handlebar);
    }

    // Player body - Girl for host, Boy for client
    G.isHost = !multiplayerManager || multiplayerManager.isHost;
    
    const bodyGeometry = new THREE.BoxGeometry(0.35, 0.6, 0.25);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        map: G.isHost ? G.playerTextures.playerClothingPink : G.playerTextures.playerClothingBlue 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.3, 0.1);
    body.castShadow = true;
    G.playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ map: G.playerTextures.playerSkin });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.85, 0);
    head.castShadow = true;
    G.playerGroup.add(head);

    // Hair
    const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMaterial = new THREE.MeshLambertMaterial({ 
        map: G.isHost ? G.playerTextures.hairBrown : G.playerTextures.hairBlack 
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.set(0, 1.95, 0);
    hair.castShadow = true;
    G.playerGroup.add(hair);

    // Bicycle helmet
    const helmetGroup = new THREE.Group();
    
    // Main helmet shell (elongated dome) with texture
    const helmetShellGeometry = new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const helmetTexture = G.isHost ? G.playerTextures.helmetPink.clone() : G.playerTextures.helmetBlue.clone();
    helmetTexture.offset.x = 0.5; // Rotate texture so vents are at back
    helmetTexture.needsUpdate = true;
    const helmetMaterial = new THREE.MeshLambertMaterial({ map: helmetTexture });
    const helmetShell = new THREE.Mesh(helmetShellGeometry, helmetMaterial);
    helmetShell.scale.set(1, 0.85, 1.15); // Flatten and elongate
    helmetShell.position.y = 0;
    helmetShell.castShadow = true;
    helmetGroup.add(helmetShell);
    
    // Helmet visor/brim
    const visorGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.15);
    const visorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, 0.05, 0.28);
    visor.rotation.x = -0.3;
    visor.castShadow = true;
    helmetGroup.add(visor);
    
    // Helmet straps (simple lines under chin)
    const strapMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const leftStrap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6),
        strapMaterial
    );
    leftStrap.position.set(-0.22, -0.1, 0.1);
    leftStrap.rotation.z = 0.4;
    helmetGroup.add(leftStrap);
    
    const rightStrap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6),
        strapMaterial
    );
    rightStrap.position.set(0.22, -0.1, 0.1);
    rightStrap.rotation.z = -0.4;
    helmetGroup.add(rightStrap);
    
    helmetGroup.position.set(0, 1.95, 0);
    G.playerGroup.add(helmetGroup);

    // Direction indicator
    const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const coneMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
    const directionCone = new THREE.Mesh(coneGeometry, coneMaterial);
    directionCone.rotation.x = Math.PI / 2;
    directionCone.position.set(0, 0.5, -1.0);
    directionCone.castShadow = true;
    G.playerGroup.add(directionCone);

    // Kite - proper flat diamond shape
    const kiteTextures = getTerrainTextures(THREE);
    G.kiteGroup = new THREE.Group();
    
    // Create diamond shape using BufferGeometry
    const kiteShape = new THREE.BufferGeometry();
    const kiteVertices = new Float32Array([
        // Diamond shape: top, right, bottom, left (in X-Y plane)
        0, 0.8, 0,      // top
        0.6, 0, 0,      // right
        0, -0.5, 0,     // bottom
        -0.6, 0, 0      // left
    ]);
    const kiteIndices = [
        0, 1, 2,  // top-right triangle
        0, 2, 3   // top-left triangle
    ];
    const kiteUVs = new Float32Array([
        0.5, 1,   // top
        1, 0.5,   // right
        0.5, 0,   // bottom
        0, 0.5    // left
    ]);
    kiteShape.setAttribute('position', new THREE.BufferAttribute(kiteVertices, 3));
    kiteShape.setAttribute('uv', new THREE.BufferAttribute(kiteUVs, 2));
    kiteShape.setIndex(kiteIndices);
    kiteShape.computeVertexNormals();
    
    // Use pink for host (girl), blue for client (boy)
    const kiteMaterial = new THREE.MeshLambertMaterial({ 
        map: G.isHost ? kiteTextures.kitePink : kiteTextures.kiteBlue,
        side: THREE.DoubleSide
    });
    const kite = new THREE.Mesh(kiteShape, kiteMaterial);
    kite.castShadow = true;
    G.kiteGroup.add(kite);
    
    // Kite cross-sticks
    const stickMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const vertStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.3, 4),
        stickMaterial
    );
    vertStick.position.y = 0.15;
    G.kiteGroup.add(vertStick);
    
    const horizStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4),
        stickMaterial
    );
    horizStick.rotation.z = Math.PI / 2;
    G.kiteGroup.add(horizStick);
    
    // Kite tail with ribbons
    const tailGroup = new THREE.Group();
    const tailStringGeometry = new THREE.CylinderGeometry(0.01, 0.01, 2, 4);
    const tailStringMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const tailString = new THREE.Mesh(tailStringGeometry, tailStringMaterial);
    tailString.position.y = -1.5;
    tailGroup.add(tailString);
    
    // Colorful ribbons on tail
    const ribbonColors = [0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF];
    for (let i = 0; i < 4; i++) {
        const ribbon = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.25, 0.02),
            new THREE.MeshLambertMaterial({ color: ribbonColors[i] })
        );
        ribbon.position.y = -0.8 - i * 0.5;
        ribbon.position.x = (Math.random() - 0.5) * 0.2;
        tailGroup.add(ribbon);
    }
    tailGroup.position.y = -0.5;
    G.kiteGroup.add(tailGroup);
    
    // Rotate kite to stand upright (vertical, facing player) with nose tilted up
    G.kiteGroup.rotation.x = -Math.PI / 2 + 0.3;  // 90 degrees upright + nose tilted up
    G.kiteGroup.rotation.y = Math.PI;  // 180 degrees for more realistic look
    
    G.kiteGroup.position.set(0, 3.5, -3);  // Behind G.player
    G.kiteGroup.visible = false;
    G.playerGroup.add(G.kiteGroup);

    // Different starting positions for host and client
    const startX = G.isHost ? G.levelConfig.playerStart.x - 2 : G.levelConfig.playerStart.x + 2;
    const startZ = G.levelConfig.playerStart.z;
    G.playerGroup.position.set(startX, 0, startZ);
    G.playerGroup.rotation.y = Math.PI;
    G.scene.add(G.playerGroup);

    // Create other player mesh (for multiplayer)
    function createOtherPlayerMesh() {
        const otherPlayerGroup = new THREE.Group();
        
        // Opposite gender of main player
        const otherIsGirl = !G.isHost; // If we're host (girl), other is boy. If we're client (boy), other is girl.
        
        if (G.waterTheme) {
            // Boat hull
            const hullGeometry = new THREE.BoxGeometry(1.2, 0.4, 2.5);
            const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const hull = new THREE.Mesh(hullGeometry, hullMaterial);
            hull.position.y = 0.2;
            hull.castShadow = true;
            otherPlayerGroup.add(hull);
            
            // Boat deck
            const deckGeometry = new THREE.BoxGeometry(1.0, 0.1, 2.3);
            const deckMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const deck = new THREE.Mesh(deckGeometry, deckMaterial);
            deck.position.y = 0.45;
            deck.castShadow = true;
            otherPlayerGroup.add(deck);
            
            // Mast
            const mastGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
            const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
            const mast = new THREE.Mesh(mastGeometry, mastMaterial);
            mast.position.set(0, 1.75, 0);
            mast.castShadow = true;
            otherPlayerGroup.add(mast);
            
            // Sail
            const sailGeometry = new THREE.BufferGeometry();
            const sailVertices = new Float32Array([
                0, 0, 0,
                0.8, 0.8, 0,
                0, 1.6, 0
            ]);
            sailGeometry.setAttribute('position', new THREE.BufferAttribute(sailVertices, 3));
            sailGeometry.computeVertexNormals();
            const sailMaterial = new THREE.MeshLambertMaterial({ 
                color: otherIsGirl ? 0xFFB6C1 : 0x87CEEB,
                side: THREE.DoubleSide
            });
            const sail = new THREE.Mesh(sailGeometry, sailMaterial);
            sail.position.set(0, 0.9, 0);
            sail.castShadow = true;
            otherPlayerGroup.add(sail);
        } else {
            // Bicycle wheels (same as main player but different color)
            const wheelGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
            const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

            const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            frontWheel.rotation.y = Math.PI / 2;
            frontWheel.position.set(0, 0.3, -0.7);
            frontWheel.castShadow = true;
            otherPlayerGroup.add(frontWheel);

            const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            backWheel.rotation.y = Math.PI / 2;
            backWheel.position.set(0, 0.3, 0.5);
            backWheel.castShadow = true;
            otherPlayerGroup.add(backWheel);

            // Frame (different color)
            const frameGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8);
            const frameMaterial = new THREE.MeshLambertMaterial({ color: otherIsGirl ? 0xFF6B9D : 0x4169E1 });
            const frame1 = new THREE.Mesh(frameGeometry, frameMaterial);
            frame1.rotation.x = Math.PI / 2;
            frame1.position.set(0, 0.5, -0.1);
            frame1.castShadow = true;
            otherPlayerGroup.add(frame1);

            const seatPostGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
            const seatPost = new THREE.Mesh(seatPostGeometry, frameMaterial);
            seatPost.position.set(0, 0.75, 0.2);
            seatPost.castShadow = true;
            otherPlayerGroup.add(seatPost);

            const handlebarPostGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
            const handlebarPost = new THREE.Mesh(handlebarPostGeometry, frameMaterial);
            handlebarPost.position.set(0, 0.7, -0.5);
            handlebarPost.castShadow = true;
            otherPlayerGroup.add(handlebarPost);

            const handlebarGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
            const handlebar = new THREE.Mesh(handlebarGeometry, frameMaterial);
            handlebar.rotation.z = Math.PI / 2;
            handlebar.position.set(0, 0.9, -0.5);
            handlebar.castShadow = true;
            otherPlayerGroup.add(handlebar);
        }

        // Body (opposite gender color) with texture
        const bodyGeometry = new THREE.BoxGeometry(0.35, 0.6, 0.25);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            map: otherIsGirl ? G.playerTextures.playerClothingPink : G.playerTextures.playerClothingBlue 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1.3, 0.1);
        body.castShadow = true;
        otherPlayerGroup.add(body);

        // Head with skin texture
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ map: G.playerTextures.playerSkin });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.85, 0);
        head.castShadow = true;
        otherPlayerGroup.add(head);

        // Hair (opposite gender) with texture
        const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMaterial = new THREE.MeshLambertMaterial({ 
            map: otherIsGirl ? G.playerTextures.hairBrown : G.playerTextures.hairBlack 
        });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.95, 0);
        hair.castShadow = true;
        otherPlayerGroup.add(hair);

        // Bicycle helmet for other player
        const otherHelmetGroup = new THREE.Group();
        
        // Main helmet shell (elongated dome) with texture
        const otherHelmetShellGeometry = new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const otherHelmetTexture = otherIsGirl ? G.playerTextures.helmetPink.clone() : G.playerTextures.helmetBlue.clone();
        otherHelmetTexture.offset.x = 0.5; // Rotate texture so vents are at back
        otherHelmetTexture.needsUpdate = true;
        const otherHelmetMaterial = new THREE.MeshLambertMaterial({ map: otherHelmetTexture });
        const otherHelmetShell = new THREE.Mesh(otherHelmetShellGeometry, otherHelmetMaterial);
        otherHelmetShell.scale.set(1, 0.85, 1.15); // Flatten and elongate
        otherHelmetShell.position.y = 0;
        otherHelmetShell.castShadow = true;
        otherHelmetGroup.add(otherHelmetShell);
        
        // Helmet visor/brim
        const otherVisorGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.15);
        const otherVisorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const otherVisor = new THREE.Mesh(otherVisorGeometry, otherVisorMaterial);
        otherVisor.position.set(0, 0.05, 0.28);
        otherVisor.rotation.x = -0.3;
        otherVisor.castShadow = true;
        otherHelmetGroup.add(otherVisor);
        
        // Helmet straps (simple lines under chin)
        const otherStrapMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const otherLeftStrap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6),
            otherStrapMaterial
        );
        otherLeftStrap.position.set(-0.22, -0.1, 0.1);
        otherLeftStrap.rotation.z = 0.4;
        otherHelmetGroup.add(otherLeftStrap);
        
        const otherRightStrap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6),
            otherStrapMaterial
        );
        otherRightStrap.position.set(0.22, -0.1, 0.1);
        otherRightStrap.rotation.z = -0.4;
        otherHelmetGroup.add(otherRightStrap);
        
        otherHelmetGroup.position.set(0, 1.95, 0);
        otherPlayerGroup.add(otherHelmetGroup);

        // Direction indicator
        const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
        const coneMaterial = new THREE.MeshLambertMaterial({ color: otherIsGirl ? 0xFFFF00 : 0x00FFFF });
        const directionCone = new THREE.Mesh(coneGeometry, coneMaterial);
        directionCone.rotation.x = Math.PI / 2;
        directionCone.position.set(0, 0.5, -1.0);
        directionCone.castShadow = true;
        otherPlayerGroup.add(directionCone);

        // Kite for other player - proper flat diamond shape
        const otherKiteTextures = getTerrainTextures(THREE);
        const otherKiteGroup = new THREE.Group();
        
        // Create diamond shape using BufferGeometry
        const otherKiteShape = new THREE.BufferGeometry();
        const otherKiteVertices = new Float32Array([
            0, 0.8, 0,      // top
            0.6, 0, 0,      // right
            0, -0.5, 0,     // bottom
            -0.6, 0, 0      // left
        ]);
        const otherKiteIndices = [0, 1, 2, 0, 2, 3];
        const otherKiteUVs = new Float32Array([0.5, 1, 1, 0.5, 0.5, 0, 0, 0.5]);
        otherKiteShape.setAttribute('position', new THREE.BufferAttribute(otherKiteVertices, 3));
        otherKiteShape.setAttribute('uv', new THREE.BufferAttribute(otherKiteUVs, 2));
        otherKiteShape.setIndex(otherKiteIndices);
        otherKiteShape.computeVertexNormals();
        
        const otherKiteMaterial = new THREE.MeshLambertMaterial({ 
            map: otherIsGirl ? otherKiteTextures.kitePink : otherKiteTextures.kiteBlue,
            side: THREE.DoubleSide
        });
        const otherKite = new THREE.Mesh(otherKiteShape, otherKiteMaterial);
        otherKite.castShadow = true;
        otherKiteGroup.add(otherKite);
        
        // Kite cross-sticks
        const otherStickMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const otherVertStick = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 1.3, 4),
            otherStickMaterial
        );
        otherVertStick.position.y = 0.15;
        otherKiteGroup.add(otherVertStick);
        
        const otherHorizStick = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4),
            otherStickMaterial
        );
        otherHorizStick.rotation.z = Math.PI / 2;
        otherKiteGroup.add(otherHorizStick);
        
        // Kite tail with ribbons
        const otherTailGroup = new THREE.Group();
        const otherTailString = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.01, 2, 4),
            new THREE.MeshLambertMaterial({ color: 0x333333 })
        );
        otherTailString.position.y = -1.5;
        otherTailGroup.add(otherTailString);
        
        const otherRibbonColors = [0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF];
        for (let i = 0; i < 4; i++) {
            const ribbon = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.25, 0.02),
                new THREE.MeshLambertMaterial({ color: otherRibbonColors[i] })
            );
            ribbon.position.y = -0.8 - i * 0.5;
            ribbon.position.x = (Math.random() - 0.5) * 0.2;
            otherTailGroup.add(ribbon);
        }
        otherTailGroup.position.y = -0.5;
        otherKiteGroup.add(otherTailGroup);
        
        // Rotate kite to stand upright (vertical, facing player)
        otherKiteGroup.rotation.x = -Math.PI / 2 + 0.3;  // 90 degrees upright + nose tilted up
        otherKiteGroup.rotation.y = Math.PI;  // 180 degrees for more realistic look
        
        otherKiteGroup.position.set(0, 3.5, -3);  // Behind G.player
        otherKiteGroup.visible = false;
        otherPlayerGroup.add(otherKiteGroup);
        otherPlayerGroup.kiteGroup = otherKiteGroup; // Store reference

        otherPlayerGroup.visible = false;
        G.scene.add(otherPlayerGroup);
        return otherPlayerGroup;
    }
    
    otherPlayerMesh = createOtherPlayerMesh();
    
    // Setup multiplayer callbacks
    if (multiplayerManager) {
        multiplayerManager.onUpdate((type, data) => {
            if (type === 'fullSync') {
                // Client receives full game state from host
                if (!multiplayerManager.isHost) {
                    applyFullGameSync(data);
                }
            } else if (type === 'playerState') {
                // Host receives client player position (client to host)
                if (multiplayerManager.isHost) {
                    // Calculate velocity for optimistic updates
                    otherPlayerVelocity.x = data.position.x - otherPlayerLastPos.x;
                    otherPlayerVelocity.z = data.position.z - otherPlayerLastPos.z;
                    otherPlayerLastPos.x = data.position.x;
                    otherPlayerLastPos.z = data.position.z;
                    
                    // Store gliding state for optimistic updates (explicitly handle false)
                    otherPlayerIsGliding = (data.isGliding === true);
                    otherPlayerGlideLiftProgress = data.glideLiftProgress || 0;
                    
                    // Update client health and check for death
                    if (data.health !== undefined) {
                        G.otherPlayerHealth = data.health;
                        // If client died, trigger game death for both players
                        if (G.otherPlayerHealth <= 0 && !gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    }
                    
                    otherPlayerMesh.position.set(data.position.x, data.position.y, data.position.z);
                    otherPlayerMesh.rotation.y = data.rotation;
                    otherPlayerMesh.visible = true;
                    // Update kite visibility based on gliding state
                    if (otherPlayerMesh.kiteGroup) {
                        otherPlayerMesh.kiteGroup.visible = data.isGliding === true;
                    }
                }
            } else if (type === 'bullet') {
                // Create bullet from other player
                createRemoteBullet(data);
            } else if (type === 'gameEvent') {
                // Handle game events from other player
                handleRemoteGameEvent(data);
            }
        });
        
        // If we're host and connected, start syncing game state
        if (multiplayerManager.isHost && multiplayerManager.isConnected()) {
            multiplayerManager.startHostSync(() => getFullGameSyncData());
        }
    }
    
    // Function to gather all game state for host to send
    function getFullGameSyncData() {
        return {
            hostPlayer: {
                x: G.playerGroup.position.x,
                y: G.playerGroup.position.y,
                z: G.playerGroup.position.z,
                rotation: G.player.rotation,
                isGliding: G.player.isGliding,
                glideLiftProgress: G.player.glideLiftProgress,
                glideCharge: G.player.glideCharge,
                hasKite: G.player.hasKite
            },
            goblins: G.goblins.map(g => ({
                x: g.mesh.position.x,
                y: g.mesh.position.y,
                z: g.mesh.position.z,
                rotation: g.mesh.rotation.y,
                alive: g.alive,
                health: g.health,
                isChasing: g.isChasing,
                vx: g.velocity ? g.velocity.x : 0,
                vz: g.velocity ? g.velocity.z : 0,
                frozen: g.frozen || false,
                frozenUntil: g.frozenUntil || 0
            })),
            guardianArrows: G.guardianArrows.map(a => ({
                x: a.mesh.position.x,
                y: a.mesh.position.y,
                z: a.mesh.position.z,
                rotationZ: a.mesh.rotation.z,
                vx: a.velocity.x,
                vy: a.velocity.y,
                vz: a.velocity.z
            })),
            birds: G.birds.map(b => ({
                x: b.mesh.position.x,
                y: b.mesh.position.y,
                z: b.mesh.position.z,
                rotation: b.mesh.rotation.y,
                angle: b.angle
            })),
            bombs: G.bombs.map(b => ({
                x: b.mesh.position.x,
                y: b.mesh.position.y,
                z: b.mesh.position.z,
                vy: b.velocity.y
            })),
            bullets: G.bullets.filter(b => !b.isRemote).map(b => ({
                x: b.mesh.position.x,
                y: b.mesh.position.y,
                z: b.mesh.position.z,
                vx: b.velocity.x,
                vy: b.velocity.y,
                vz: b.velocity.z
            })),
            dragon: G.dragon ? {
                x: G.dragon.mesh.position.x,
                y: G.dragon.mesh.position.y,
                z: G.dragon.mesh.position.z,
                rotation: G.dragon.mesh.rotation.y,
                rotationX: G.dragon.mesh.rotation.x,
                rotationZ: G.dragon.mesh.rotation.z,
                alive: G.dragon.alive,
                health: G.dragon.health,
                isFlying: G.dragon.isFlying
            } : null,
            extraDragons: G.extraDragons.map(d => ({
                x: d.mesh.position.x,
                y: d.mesh.position.y,
                z: d.mesh.position.z,
                rotation: d.mesh.rotation.y,
                rotationX: d.mesh.rotation.x,
                rotationZ: d.mesh.rotation.z,
                alive: d.alive,
                health: d.health,
                isFlying: d.isFlying,
                frozen: d.frozen,
                frozenUntil: d.frozenUntil
            })),
            fireballs: G.fireballs.map(f => ({
                x: f.mesh.position.x,
                y: f.mesh.position.y,
                z: f.mesh.position.z,
                vx: f.velocity.x,
                vy: f.velocity.y,
                vz: f.velocity.z
            })),
            tornados: G.mummyTornados.map(t => ({
                x: t.mesh.position.x,
                y: t.mesh.position.y,
                z: t.mesh.position.z,
                vx: t.velocity.x,
                vz: t.velocity.z,
                spinPhase: t.spinPhase
            })),
            lavaTrails: G.lavaTrails.map(lt => ({
                id: lt.id,
                x: lt.x,
                z: lt.z,
                createdAt: lt.createdAt,
                creatorId: lt.creatorId
            })),
            herzmen: G.placedHerzmen.map(h => ({
                id: h.id,
                x: h.x,
                z: h.z,
                rotation: h.mesh.rotation.y
            })),
            heartBombs: G.heartBombs.filter(hb => !hb.isRemote).map(hb => ({
                x: hb.mesh.position.x,
                y: hb.mesh.position.y,
                z: hb.mesh.position.z,
                vx: hb.velocity.x,
                vz: hb.velocity.z
            })),
            items: {
                materials: G.materials.map(m => m.collected),
                ammoPickups: G.ammoPickups.map(a => a.collected),
                healthPickups: G.healthPickups.map(h => h.collected),
                scarabs: G.scarabPickups.map(s => s.collected),
                candy: G.candyPickups ? G.candyPickups.map(c => c.collected) : [],
                kiteCollected: G.worldKiteCollected,
                icePowerCollected: G.icePowerCollected
            },
            gameState: {
                bridgeRepaired: G.bridgeRepaired,
                materialsCollected: G.materialsCollected,
                scarabsCollected: G.scarabsCollected,
                candyCollected: G.candyCollected || 0,
                totalCandy: G.totalCandy || 0,
                gameWon: gameWon,
                gameDead: gameDead,
                currentLevel: currentLevel
            }
        };
    }
    
    // Function for client to apply full game state from host
    function applyFullGameSync(data) {
        // Check if host is on a different level - if so, switch to it
        if (data.gameState && data.gameState.currentLevel && data.gameState.currentLevel !== currentLevel) {
            console.log(`Host is on level ${data.gameState.currentLevel}, switching...`);
            switchLevel(data.gameState.currentLevel);
            return; // Don't apply the rest of the sync - we're switching levels
        }
        
        // Update host player (shown as other player for client)
        if (data.hostPlayer) {
            // Calculate velocity for optimistic updates
            otherPlayerVelocity.x = data.hostPlayer.x - otherPlayerLastPos.x;
            otherPlayerVelocity.z = data.hostPlayer.z - otherPlayerLastPos.z;
            otherPlayerLastPos.x = data.hostPlayer.x;
            otherPlayerLastPos.z = data.hostPlayer.z;
            
            // Store gliding state for optimistic updates (explicitly handle false)
            otherPlayerIsGliding = (data.hostPlayer.isGliding === true);
            otherPlayerGlideLiftProgress = data.hostPlayer.glideLiftProgress || 0;
            
            otherPlayerMesh.position.set(data.hostPlayer.x, data.hostPlayer.y, data.hostPlayer.z);
            otherPlayerMesh.rotation.y = data.hostPlayer.rotation;
            otherPlayerMesh.visible = true;
            // Update other player's health
            if (data.hostPlayer.health !== undefined) {
                G.otherPlayerHealth = data.hostPlayer.health;
            }
            // Update kite visibility based on gliding state
            if (otherPlayerMesh.kiteGroup) {
                otherPlayerMesh.kiteGroup.visible = data.hostPlayer.isGliding === true;
            }
        }
        
        // Update goblins (sync up to the number available from host)
        // Client may have extra spawned zombies that were created via events
        if (data.goblins && G.goblins) {
            const syncCount = Math.min(data.goblins.length, G.goblins.length);
            for (let i = 0; i < syncCount; i++) {
                const gobData = data.goblins[i];
                const gob = G.goblins[i];
                gob.mesh.position.set(gobData.x, gobData.y, gobData.z);
                gob.mesh.rotation.y = gobData.rotation;
                gob.alive = gobData.alive;
                gob.health = gobData.health;
                gob.isChasing = gobData.isChasing;
                
                // Store velocity for optimistic updates
                if (!gob.velocity) {
                    gob.velocity = { x: 0, z: 0 };
                }
                gob.velocity.x = gobData.vx || 0;
                gob.velocity.z = gobData.vz || 0;
                
                // Sync frozen state
                const wasFrozen = gob.frozen;
                gob.frozen = gobData.frozen || false;
                gob.frozenUntil = gobData.frozenUntil || 0;
                
                // Apply or remove frozen visual effect
                if (gob.frozen && !wasFrozen) {
                    gob.mesh.children.forEach(child => {
                        if (child.material && child.material.emissive !== undefined) {
                            child.material.emissive = new THREE.Color(0x0088FF);
                            child.material.emissiveIntensity = 0.5;
                        }
                    });
                } else if (!gob.frozen && wasFrozen) {
                    gob.mesh.children.forEach(child => {
                        if (child.material && child.material.emissive !== undefined) {
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                        }
                    });
                }
                
                if (!gobData.alive && gob.mesh.rotation.z !== Math.PI / 2) {
                    gob.mesh.rotation.z = Math.PI / 2;
                }
            }
        }
        
        // Update guardian arrows
        if (data.guardianArrows && G.guardianArrows) {
            // Remove old arrows that don't exist anymore
            while (G.guardianArrows.length > data.guardianArrows.length) {
                const arrow = G.guardianArrows.pop();
                G.scene.remove(arrow.mesh);
            }
            
            // Update existing arrows and create new ones
            data.guardianArrows.forEach((arrowData, i) => {
                if (i < G.guardianArrows.length) {
                    G.guardianArrows[i].mesh.position.set(arrowData.x, arrowData.y, arrowData.z);
                    if (arrowData.rotationZ !== undefined) {
                        G.guardianArrows[i].mesh.rotation.z = arrowData.rotationZ;
                    }
                    // Store velocity for optimistic updates
                    if (arrowData.vx !== undefined) {
                        G.guardianArrows[i].velocity.set(arrowData.vx, arrowData.vy, arrowData.vz);
                    }
                } else {
                    // Create new arrow on client (themed by level)
                    let arrowMesh;
                    if (G.computerTheme) {
                        // Data packet for Firewall Sentry
                        const packetGroup = new THREE.Group();
                        const cubeGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);
                        const cubeMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0xFF0066,
                            transparent: true,
                            opacity: 0.9
                        });
                        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                        packetGroup.add(cube);
                        const wireGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
                        const wireMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0x00FFFF,
                            wireframe: true,
                            transparent: true,
                            opacity: 0.8
                        });
                        packetGroup.add(new THREE.Mesh(wireGeometry, wireMaterial));
                        packetGroup.position.set(arrowData.x, arrowData.y, arrowData.z);
                        G.scene.add(packetGroup);
                        arrowMesh = packetGroup;
                    } else if (G.waterTheme) {
                        // Ink ball for octopus guardians
                        const inkGeometry = new THREE.SphereGeometry(0.3, 12, 12);
                        const inkMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
                        arrowMesh = new THREE.Mesh(inkGeometry, inkMaterial);
                        arrowMesh.castShadow = true;
                        arrowMesh.position.set(arrowData.x, arrowData.y, arrowData.z);
                        G.scene.add(arrowMesh);
                    } else {
                        // Regular arrow
                        const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
                        const arrowMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                        arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
                        arrowMesh.castShadow = true;
                        arrowMesh.position.set(arrowData.x, arrowData.y, arrowData.z);
                        G.scene.add(arrowMesh);

                        const tipGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
                        const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
                        const tipMesh = new THREE.Mesh(tipGeometry, tipMaterial);
                        tipMesh.position.y = 0.5;
                        arrowMesh.add(tipMesh);

                        arrowMesh.rotation.x = Math.PI / 2;
                        if (arrowData.rotationZ !== undefined) {
                            arrowMesh.rotation.z = arrowData.rotationZ;
                        }
                    }

                    G.guardianArrows.push({
                        mesh: arrowMesh,
                        velocity: new THREE.Vector3(0, 0, 0),
                        radius: 0.3
                    });
                }
            });
        }
        
        // Update birds
        if (data.birds) {
            data.birds.forEach((birdData, i) => {
                if (i < G.birds.length) {
                    G.birds[i].mesh.position.x = birdData.x;
                    G.birds[i].mesh.position.y = birdData.y;
                    G.birds[i].mesh.position.z = birdData.z;
                    G.birds[i].mesh.rotation.y = birdData.rotation;
                    G.birds[i].angle = birdData.angle;
                }
            });
        }
        
        // Update bombs
        if (data.bombs) {
            // Remove excess bombs
            while (G.bombs.length > data.bombs.length) {
                const removed = G.bombs.pop();
                G.scene.remove(removed.mesh);
            }
            
            // Update or create bombs
            data.bombs.forEach((bombData, i) => {
                if (i < G.bombs.length) {
                    // Update existing bomb
                    G.bombs[i].mesh.position.x = bombData.x;
                    G.bombs[i].mesh.position.y = bombData.y;
                    G.bombs[i].mesh.position.z = bombData.z;
                    G.bombs[i].velocity.y = bombData.vy;
                } else {
                    // Create new bomb
                    const bombGeometry = new THREE.SphereGeometry(0.3, 8, 8);
                    const bombMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
                    const bombMesh = new THREE.Mesh(bombGeometry, bombMaterial);
                    bombMesh.position.set(bombData.x, bombData.y, bombData.z);
                    bombMesh.castShadow = true;
                    G.scene.add(bombMesh);
                    
                    G.bombs.push({
                        mesh: bombMesh,
                        velocity: new THREE.Vector3(0, bombData.vy, 0),
                        radius: 5
                    });
                }
            });
        }
        
        // Update game state
        if (data.gameState) {
            gameWon = data.gameState.gameWon;
            gameDead = data.gameState.gameDead;
            G.bridgeRepaired = data.gameState.bridgeRepaired;
            G.materialsCollected = data.gameState.materialsCollected;
            
            // Update bridge visibility
            if (G.bridgeRepaired) {
                G.brokenBridgeGroup.visible = false;
                G.bridgeObj.mesh.visible = true;
            }
        }
        
        // Update dragon state
        if (data.dragon) {
            if (!G.dragon && currentDifficulty === 'hard') {
                // Create dragon/reaper if it doesn't exist yet
                if (G.graveyardTheme || G.levelConfig.useReaper) {
                    G.dragon = createReaper();
                } else {
                    G.dragon = createDragon();
                }
                G.scene.add(G.dragon.mesh);
            }
            if (G.dragon) {
                G.dragon.mesh.position.set(data.dragon.x, data.dragon.y, data.dragon.z);
                G.dragon.mesh.rotation.y = data.dragon.rotation;
                G.dragon.mesh.rotation.x = data.dragon.rotationX || 0;
                G.dragon.mesh.rotation.z = data.dragon.rotationZ || 0;
                
                // Handle dragon death on client
                const wasAlive = G.dragon.alive;
                G.dragon.alive = data.dragon.alive;
                G.dragon.health = data.dragon.health;
                G.dragon.isFlying = data.dragon.isFlying || false;
                
                // If dragon just died, trigger death effects on client
                if (wasAlive && !G.dragon.alive && !G.dragon.deathTime) {
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
                    
                    // Spawn candy drops in candy theme (client side)
                    if (G.candyTheme && typeof spawnDragonCandyDrops === 'function') {
                        spawnDragonCandyDrops(deathX, deathY, deathZ);
                    }
                }
            }
        }
        
        // Update extra dragons state
        if (data.extraDragons && G.extraDragons.length > 0) {
            data.extraDragons.forEach((dragonData, i) => {
                if (i >= G.extraDragons.length) return;
                const extraDragon = G.extraDragons[i];
                
                extraDragon.mesh.position.set(dragonData.x, dragonData.y, dragonData.z);
                extraDragon.mesh.rotation.y = dragonData.rotation;
                extraDragon.mesh.rotation.x = dragonData.rotationX || 0;
                extraDragon.mesh.rotation.z = dragonData.rotationZ || 0;
                
                // Handle dragon death on client
                const wasAlive = extraDragon.alive;
                extraDragon.alive = dragonData.alive;
                extraDragon.health = dragonData.health;
                extraDragon.isFlying = dragonData.isFlying || false;
                extraDragon.frozen = dragonData.frozen || false;
                extraDragon.frozenUntil = dragonData.frozenUntil || 0;
                
                // If extra dragon just died, trigger death effects on client
                if (wasAlive && !extraDragon.alive && !extraDragon.deathTime) {
                    extraDragon.deathTime = Date.now();
                    Audio.playGoblinDeathSound();
                    
                    // Smaller camera shake for extra dragons
                    dragonDeathShakeUntil = Date.now() + 600;
                    dragonDeathShakeIntensity = 0.5;
                    
                    // Capture position before hiding mesh
                    const deathX = extraDragon.mesh.position.x;
                    const deathY = extraDragon.mesh.position.y;
                    const deathZ = extraDragon.mesh.position.z;
                    
                    // Create smaller explosions
                    for (let j = 0; j < 4; j++) {
                        const offsetX = (Math.random() - 0.5) * 8;
                        const offsetY = Math.random() * 6;
                        const offsetZ = (Math.random() - 0.5) * 8;
                        setTimeout(() => {
                            createDragonExplosion(
                                deathX + offsetX,
                                deathY + offsetY + 1,
                                deathZ + offsetZ
                            );
                        }, j * 100);
                    }
                    
                    // Hide dragon mesh immediately
                    extraDragon.mesh.visible = false;
                    
                    // Spawn candy drops in candy theme (client side)
                    if (G.candyTheme && typeof spawnDragonCandyDrops === 'function') {
                        spawnDragonCandyDrops(deathX, deathY, deathZ);
                    }
                }
            });
        }
        
        // Update fireballs
        if (data.fireballs) {
            // Remove old fireballs
            while (G.fireballs.length > data.fireballs.length) {
                const fb = G.fireballs.pop();
                G.scene.remove(fb.mesh);
            }
            // Update existing and create new fireballs
            data.fireballs.forEach((fbData, i) => {
                if (i < G.fireballs.length) {
                    G.fireballs[i].mesh.position.set(fbData.x, fbData.y, fbData.z);
                    G.fireballs[i].velocity.set(fbData.vx, fbData.vy, fbData.vz);
                } else {
                    const fbTextures = getTerrainTextures(THREE);
                    
                    // Use ice-themed textures for winter level
                    const fireballTexture = G.iceTheme ? fbTextures.fireballIce : fbTextures.fireball;
                    const explosionTexture = G.iceTheme ? fbTextures.explosionIce : fbTextures.explosion;
                    
                    // Create fireball group with core, glow, and flames
                    const fireballGroup = new THREE.Group();
                    
                    // Core sphere
                    G.coreGeometry = new THREE.SphereGeometry(0.6, 12, 12);
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
                    glow.scale.set(3, 3, 1);
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
                    innerGlow.scale.set(1.8, 1.8, 1);
                    fireballGroup.add(innerGlow);
                    
                    fireballGroup.position.set(fbData.x, fbData.y, fbData.z);
                    G.scene.add(fireballGroup);
                    G.fireballs.push({
                        mesh: fireballGroup,
                        velocity: new THREE.Vector3(fbData.vx, fbData.vy, fbData.vz),
                        radius: 1.5,
                        damage: 1,
                        trail: [],
                        lastTrailTime: 0
                    });
                }
            });
        }
        
        // Update tornados (mummy projectiles)
        if (data.tornados) {
            // Remove old tornados
            while (G.mummyTornados.length > data.tornados.length) {
                const t = G.mummyTornados.pop();
                G.scene.remove(t.mesh);
            }
            // Update existing and create new tornados
            data.tornados.forEach((tData, i) => {
                if (i < G.mummyTornados.length) {
                    G.mummyTornados[i].mesh.position.set(tData.x, tData.y, tData.z);
                    G.mummyTornados[i].velocity.set(tData.vx, 0, tData.vz);
                    G.mummyTornados[i].spinPhase = tData.spinPhase;
                } else {
                    // Create new tornado visually for client
                    const tornadoGroup = new THREE.Group();
                    
                    const coneGeometry = new THREE.ConeGeometry(0.8, 3.0, 12, 4, true);
                    const coneMaterial = new THREE.MeshBasicMaterial({ 
                        color: 0xc4a14a,
                        transparent: true,
                        opacity: 0.7,
                        side: THREE.DoubleSide
                    });
                    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
                    cone.rotation.x = Math.PI;
                    cone.position.y = 1.5;
                    tornadoGroup.add(cone);
                    
                    const innerConeGeometry = new THREE.ConeGeometry(0.5, 2.5, 12, 4, true);
                    const innerConeMaterial = new THREE.MeshBasicMaterial({ 
                        color: 0xe8c36a,
                        transparent: true,
                        opacity: 0.8,
                        side: THREE.DoubleSide
                    });
                    const innerCone = new THREE.Mesh(innerConeGeometry, innerConeMaterial);
                    innerCone.rotation.x = Math.PI;
                    innerCone.position.y = 1.25;
                    tornadoGroup.add(innerCone);
                    
                    const dustGroup = new THREE.Group();
                    for (let d = 0; d < 25; d++) {
                        const dustGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 4, 4);
                        const dustMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0xc4a14a,
                            transparent: true,
                            opacity: 0.6 + Math.random() * 0.3
                        });
                        const dust = new THREE.Mesh(dustGeometry, dustMaterial);
                        const angle = Math.random() * Math.PI * 2;
                        const height = Math.random() * 3.0;
                        const radius = 0.2 + (height / 3.0) * 0.7;
                        dust.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
                        dustGroup.add(dust);
                    }
                    tornadoGroup.add(dustGroup);
                    tornadoGroup.dustGroup = dustGroup;
                    tornadoGroup.innerCone = innerCone;
                    tornadoGroup.outerCone = cone;
                    
                    tornadoGroup.position.set(tData.x, tData.y, tData.z);
                    G.scene.add(tornadoGroup);
                    
                    G.mummyTornados.push({
                        mesh: tornadoGroup,
                        velocity: new THREE.Vector3(tData.vx, 0, tData.vz),
                        radius: 1.0,
                        damage: 1,
                        spinPhase: tData.spinPhase || 0
                    });
                }
            });
        }
        
        // Update lava trails
        if (data.lavaTrails) {
            // Get existing trail IDs
            const existingIds = new Set(G.lavaTrails.map(lt => lt.id));
            const newIds = new Set(data.lavaTrails.map(lt => lt.id));
            
            // Remove trails that no longer exist
            for (let i = G.lavaTrails.length - 1; i >= 0; i--) {
                if (!newIds.has(G.lavaTrails[i].id)) {
                    G.scene.remove(G.lavaTrails[i].mesh);
                    G.lavaTrails.splice(i, 1);
                }
            }
            
            // Add new trails that don't exist yet
            data.lavaTrails.forEach(ltData => {
                if (!existingIds.has(ltData.id)) {
                    // Create lava trail visually for client
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
                    
                    const terrainHeight = getTerrainHeight(ltData.x, ltData.z);
                    trailGroup.position.set(ltData.x, terrainHeight, ltData.z);
                    G.scene.add(trailGroup);
                    
                    G.lavaTrails.push({
                        id: ltData.id,
                        mesh: trailGroup,
                        x: ltData.x,
                        z: ltData.z,
                        radius: GAME_CONFIG.LAVA_TRAIL_RADIUS,
                        createdAt: ltData.createdAt || Date.now(),
                        duration: GAME_CONFIG.LAVA_TRAIL_DURATION,
                        pool: pool,
                        crust: crust,
                        creatorId: ltData.creatorId
                    });
                }
            });
        }
        
        // Update Herz-Men positions and rotations
        if (data.herzmen && G.placedHerzmen) {
            data.herzmen.forEach((hData, i) => {
                if (i < G.placedHerzmen.length) {
                    // Update existing herzman rotation
                    G.placedHerzmen[i].mesh.rotation.y = hData.rotation;
                }
            });
        }
        
        // Update item collection states
        if (data.items) {
            if (data.items.materials) {
                data.items.materials.forEach((collected, i) => {
                    if (G.materials[i] && collected && !G.materials[i].collected) {
                        G.materials[i].collected = true;
                        G.materials[i].mesh.visible = false;
                    }
                });
            }
            if (data.items.ammoPickups) {
                data.items.ammoPickups.forEach((collected, i) => {
                    if (G.ammoPickups[i] && collected && !G.ammoPickups[i].collected) {
                        G.ammoPickups[i].collected = true;
                        G.ammoPickups[i].mesh.visible = false;
                    }
                });
            }
            if (data.items.healthPickups) {
                data.items.healthPickups.forEach((collected, i) => {
                    if (G.healthPickups[i] && collected && !G.healthPickups[i].collected) {
                        G.healthPickups[i].collected = true;
                        G.healthPickups[i].mesh.visible = false;
                    }
                });
            }
            
            // Update kite state
            if (data.items.kiteCollected && !G.worldKiteCollected) {
                G.worldKiteCollected = true;
                G.player.hasKite = true;
                G.player.glideCharge = G.player.maxGlideCharge; // Full charge immediately for other G.player too
                G.scene.remove(G.worldKiteGroup);
            }
            
            // Update ice power state
            if (data.items.icePowerCollected !== undefined) {
                if (data.items.icePowerCollected && !G.icePowerCollected) {
                    G.icePowerCollected = true;
                    G.hasIcePower = true;
                }
            }
            
            // Update scarab collection state
            if (data.items.scarabs) {
                data.items.scarabs.forEach((collected, i) => {
                    if (G.scarabPickups[i] && collected && !G.scarabPickups[i].collected) {
                        G.scarabPickups[i].collected = true;
                        G.scene.remove(G.scarabPickups[i].mesh);
                    }
                });
            }
            
            // Update candy collection state
            if (data.items.candy && G.candyPickups) {
                data.items.candy.forEach((collected, i) => {
                    if (G.candyPickups[i] && collected && !G.candyPickups[i].collected) {
                        G.candyPickups[i].collected = true;
                        G.scene.remove(G.candyPickups[i].mesh);
                    }
                });
            }
        }
        
        // Update scarab count from game state
        if (data.gameState && data.gameState.scarabsCollected !== undefined) {
            G.scarabsCollected = data.gameState.scarabsCollected;
        }
        
        // Update candy count from game state
        if (data.gameState) {
            if (data.gameState.candyCollected !== undefined) {
                G.candyCollected = data.gameState.candyCollected;
            }
            if (data.gameState.totalCandy !== undefined) {
                G.totalCandy = data.gameState.totalCandy;
            }
        }
    }

    G.player = {
        mesh: G.playerGroup,
        speed: 0.12 * (difficulty === 'hard' ? 1.3 : 1),
        rotation: Math.PI,
        rotationSpeed: 0.04 * (difficulty === 'hard' ? 1.3 : 1),
        isGliding: false,
        glideCharge: 100,
        maxGlideCharge: 100,
        glideSpeed: 0.2 * (difficulty === 'hard' ? 1.3 : 1),
        glideHeight: 1.2,
        glideState: 'none',
        glideLiftProgress: 0,
        hasKite: false,
        gamepadMoveScale: 0
    };

    // Keyboard input
    G.keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        s: false,
        a: false,
        d: false,
        q: false,
        e: false
    };

    // Gamepad support
    G.gamepad = null;
    G.lastShootTime = 0;
    G.lastKiteActivationTime = 0;
    G.lastIcePowerTime = 0;
    G.shootCooldown = 200; // ms between shots
    G.kiteActivationCooldown = 300; // ms between kite activations
    G.icePowerCooldown = 10000; // 10 seconds between ice power uses

    window.addEventListener('gamepadconnected', (e) => {
        // In splitscreen mode, only use the assigned controller
        if (isSplitscreen) {
            if (e.gamepad.index === controllerIndex) {
                G.gamepad = e.gamepad;
            }
        } else {
            G.gamepad = e.gamepad;
        }
    }, { signal: G.eventSignal });

    window.addEventListener('gamepaddisconnected', (e) => {
        if (!isSplitscreen || e.gamepad.index === controllerIndex) {
            G.gamepad = null;
        }
    }, { signal: G.eventSignal });

    function updateGamepad() {
        // In splitscreen mode, use specific controller index
        const gamepads = navigator.getGamepads();
        if (isSplitscreen) {
            G.gamepad = gamepads[controllerIndex];
        } else if (G.gamepad) {
            G.gamepad = gamepads[G.gamepad.index];
        } else {
            // In single player, poll for any connected gamepad if we don't have one
            // This handles the case where the game reinitializes (level change) after gamepad was connected
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    G.gamepad = gamepads[i];
                    break;
                }
            }
        }
        
        if (!G.gamepad) return;
        
        const now = Date.now();
        
        // Left stick for rotation and movement (axes 0 and 1)
        const leftStickX = G.gamepad.axes[0];
        const leftStickY = G.gamepad.axes[1];
        const deadzone = 0.15;
        
        // Horizontal rotation
        if (Math.abs(leftStickX) > deadzone) {
            G.player.rotation -= leftStickX * 0.03;
        }
        
        // Vertical movement with analog scaling
        if (Math.abs(leftStickY) > deadzone) {
            if (leftStickY < 0) {
                // Forward
                G.keys.w = true;
                G.keys.s = false;
                G.player.gamepadMoveScale = Math.abs(leftStickY);
            } else {
                // Backward
                G.keys.w = false;
                G.keys.s = true;
                G.player.gamepadMoveScale = Math.abs(leftStickY);
            }
        } else {
            // R2 (button 7) for forward, L2 (button 6) for backward
            const r2Value = G.gamepad.buttons[7]?.value || 0;
            const l2Value = G.gamepad.buttons[6]?.value || 0;
            
            G.keys.w = r2Value > 0.1;
            G.keys.s = l2Value > 0.1;
            G.player.gamepadMoveScale = Math.max(r2Value, l2Value);
        }
        
        G.keys.a = false;
        G.keys.d = false;
        
        // X (button 0) for shooting
        if (G.gamepad.buttons[0]?.pressed && now - G.lastShootTime > G.shootCooldown) {
            shootBullet();
            G.lastShootTime = now;
        }
        
        // Triangle (button 2) for kite
        // Check if either player has collected the kite
        const anyoneHasKite = G.player.hasKite || G.worldKiteCollected;
        if (G.gamepad.buttons[2]?.pressed && anyoneHasKite && !gameWon && !gameDead && now - G.lastKiteActivationTime > G.kiteActivationCooldown) {
            if (!G.player.isGliding && G.player.glideCharge >= 20) {
                // Start gliding
                G.player.isGliding = true;
                G.player.glideState = 'takeoff';
                G.player.glideLiftProgress = 0;
                G.kiteGroup.visible = true;
                G.lastKiteActivationTime = now;
            } else if (G.player.isGliding && G.player.glideState === 'flying') {
                // Exit gliding
                G.player.glideState = 'landing';
                G.lastKiteActivationTime = now;
            }
        }
        
        // Y button (button 3) for ice power
        if (G.gamepad.buttons[3]?.pressed && G.hasIcePower && !gameWon && !gameDead && now - G.lastIcePowerTime >= G.icePowerCooldown) {
            activateIcePower();
        }
        
        // Circle button (button 1) for banana placement
        if (!bananaButtonWasPressed && G.gamepad.buttons[1]?.pressed && G.hasBananaPower && G.bananaInventory > 0 && !gameWon && !gameDead) {
            placeBanana();
            bananaButtonWasPressed = true;
        } else if (!G.gamepad.buttons[1]?.pressed) {
            bananaButtonWasPressed = false;
        }
        
        // R1/Right Bumper (button 5) for bomb placement
        if (!bombButtonWasPressed && G.gamepad.buttons[5]?.pressed && G.bombInventory > 0 && !gameWon && !gameDead) {
            placeBomb();
            bombButtonWasPressed = true;
        } else if (!G.gamepad.buttons[5]?.pressed) {
            bombButtonWasPressed = false;
        }
        
        // L1/Left Bumper (button 4) for Herz-Man placement
        if (!herzmanButtonWasPressed && G.gamepad.buttons[4]?.pressed && G.herzmanInventory > 0 && !gameWon && !gameDead) {
            placeHerzman();
            herzmanButtonWasPressed = true;
        } else if (!G.gamepad.buttons[4]?.pressed) {
            herzmanButtonWasPressed = false;
        }
        
        // Options (button 9) for restart
        if (G.gamepad.buttons[9]?.pressed && (gameWon || gameDead)) {
            resetGame();
        }
    }
    
    // Native splitscreen: Update player 2's gamepad input
    function updateGamepad2() {
        if (!isNativeSplitscreen) return;
        
        const gamepads = navigator.getGamepads();
        G.gamepad2 = gamepads[1]; // Player 2 always uses controller index 1
        
        if (!G.gamepad2) return;
        
        const now = Date.now();
        
        // Left stick for rotation and movement (axes 0 and 1)
        const leftStickX = G.gamepad2.axes[0];
        const leftStickY = G.gamepad2.axes[1];
        const deadzone = 0.15;
        
        // Horizontal rotation
        if (Math.abs(leftStickX) > deadzone) {
            G.player2.rotation -= leftStickX * 0.03;
        }
        
        // Vertical movement with analog scaling
        if (Math.abs(leftStickY) > deadzone) {
            if (leftStickY < 0) {
                // Forward
                G.keys2.w = true;
                G.keys2.s = false;
                G.player2.gamepadMoveScale = Math.abs(leftStickY);
            } else {
                // Backward
                G.keys2.w = false;
                G.keys2.s = true;
                G.player2.gamepadMoveScale = Math.abs(leftStickY);
            }
        } else {
            // R2 (button 7) for forward, L2 (button 6) for backward
            const r2Value = G.gamepad2.buttons[7]?.value || 0;
            const l2Value = G.gamepad2.buttons[6]?.value || 0;
            
            G.keys2.w = r2Value > 0.1;
            G.keys2.s = l2Value > 0.1;
            G.player2.gamepadMoveScale = Math.max(r2Value, l2Value);
        }
        
        G.keys2.a = false;
        G.keys2.d = false;
        
        // X (button 0) for shooting
        if (G.gamepad2.buttons[0]?.pressed && now - G.lastShootTime2 > G.shootCooldown) {
            shootBulletForPlayer(2);
            G.lastShootTime2 = now;
        }
        
        // Triangle (button 2) for kite - both players share kite access
        const anyoneHasKite = G.player.hasKite || G.player2.hasKite || G.worldKiteCollected;
        if (G.gamepad2.buttons[2]?.pressed && anyoneHasKite && !gameWon && !gameDead && now - G.lastKiteActivationTime2 > G.kiteActivationCooldown) {
            if (!G.player2.isGliding && G.player2.glideCharge >= 20) {
                // Start gliding
                G.player2.isGliding = true;
                G.player2.glideState = 'takeoff';
                G.player2.glideLiftProgress = 0;
                if (G.player2Group.kiteGroup) {
                    G.player2Group.kiteGroup.visible = true;
                }
                G.lastKiteActivationTime2 = now;
            } else if (G.player2.isGliding && G.player2.glideState === 'flying') {
                // Exit gliding
                G.player2.glideState = 'landing';
                G.lastKiteActivationTime2 = now;
            }
        }
        
        // Y button (button 3) for ice power
        if (G.gamepad2.buttons[3]?.pressed && G.hasIcePower && !gameWon && !gameDead && now - G.lastIcePowerTime >= G.icePowerCooldown) {
            activateIcePowerForPlayer(2);
        }
        
        // Circle button (button 1) for banana placement
        if (!G.bananaButtonWasPressed2 && G.gamepad2.buttons[1]?.pressed && G.hasBananaPower && G.player2BananaInventory > 0 && !gameWon && !gameDead) {
            placeBananaForPlayer(2);
            G.bananaButtonWasPressed2 = true;
        } else if (!G.gamepad2.buttons[1]?.pressed) {
            G.bananaButtonWasPressed2 = false;
        }
        
        // R1/Right Bumper (button 5) for bomb placement
        if (!G.bombButtonWasPressed2 && G.gamepad2.buttons[5]?.pressed && G.player2BombInventory > 0 && !gameWon && !gameDead) {
            placeBombForPlayer(2);
            G.bombButtonWasPressed2 = true;
        } else if (!G.gamepad2.buttons[5]?.pressed) {
            G.bombButtonWasPressed2 = false;
        }
        
        // L1/Left Bumper (button 4) for Herz-Man placement
        if (!G.herzmanButtonWasPressed2 && G.gamepad2.buttons[4]?.pressed && G.player2HerzmanInventory > 0 && !gameWon && !gameDead) {
            placeHerzmanForPlayer(2);
            G.herzmanButtonWasPressed2 = true;
        } else if (!G.gamepad2.buttons[4]?.pressed) {
            G.herzmanButtonWasPressed2 = false;
        }
        
        // Options (button 9) for restart - either player can restart
        if (G.gamepad2.buttons[9]?.pressed && (gameWon || gameDead)) {
            resetGame();
        }
    }

    document.addEventListener('keyup', (e) => {
        if (G.keys.hasOwnProperty(e.key)) {
            G.keys[e.key] = false;
        }
        // Reset banana key debounce
        if (e.key === 'b' || e.key === 'B') {
            G.keys.bananaKeyPressed = false;
        }
        // Reset bomb key debounce
        if (e.key === 'x' || e.key === 'X') {
            G.keys.bombKeyPressed = false;
        }
        // Reset Herz-Man key debounce
        if (e.key === 'h' || e.key === 'H') {
            G.keys.herzmanKeyPressed = false;
        }
    }, { signal: G.eventSignal });

    document.addEventListener('keydown', (e) => {
        if (G.keys.hasOwnProperty(e.key)) {
            G.keys[e.key] = true;
            e.preventDefault();
        }
        if (e.key === ' ' || e.key === 'Space') {
            shootBullet();
            e.preventDefault();
        }
        if ((e.key === 'r' || e.key === 'R') && (gameWon || gameDead)) {
            e.preventDefault();
            // Only host can restart in multiplayer
            if (multiplayerManager && multiplayerManager.isHost) {
                resetGame();
                // Notify client to restart
                if (multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('gameRestart', {});
                }
            } else if (!multiplayerManager || !multiplayerManager.isConnected()) {
                // Single player mode - allow restart
                resetGame();
            }
            // Client in multiplayer: ignore R key, wait for host
        }
        // Check if either player has collected the kite
        const anyoneHasKite = G.player.hasKite || G.worldKiteCollected;
        if ((e.key === 'f' || e.key === 'F') && anyoneHasKite && !gameWon && !gameDead) {
            if (!G.player.isGliding && G.player.glideCharge >= 20) {
                // Start gliding
                G.player.isGliding = true;
                G.player.glideState = 'takeoff';
                G.player.glideLiftProgress = 0;
                G.kiteGroup.visible = true;
            } else if (G.player.isGliding && G.player.glideState === 'flying') {
                // Exit gliding
                G.player.glideState = 'landing';
            }
        }
        // Ice power activation
        if ((e.key === 'e' || e.key === 'E') && G.hasIcePower && !gameWon && !gameDead) {
            activateIcePower();
            e.preventDefault();
        }
        // Banana placement (debounced)
        if ((e.key === 'b' || e.key === 'B') && G.hasBananaPower && G.bananaInventory > 0 && !gameWon && !gameDead) {
            if (!G.keys.bananaKeyPressed) {
                placeBanana();
                G.keys.bananaKeyPressed = true;
            }
            e.preventDefault();
        }
        // Bomb placement (debounced)
        if ((e.key === 'x' || e.key === 'X') && G.bombInventory > 0 && !gameWon && !gameDead) {
            if (!G.keys.bombKeyPressed) {
                placeBomb();
                G.keys.bombKeyPressed = true;
            }
            e.preventDefault();
        }
        // Herz-Man placement (debounced)
        if ((e.key === 'h' || e.key === 'H') && G.herzmanInventory > 0 && !gameWon && !gameDead) {
            if (!G.keys.herzmanKeyPressed) {
                placeHerzman();
                G.keys.herzmanKeyPressed = true;
            }
            e.preventDefault();
        }
        // God mode toggle
        if (e.key === 'g' || e.key === 'G') {
            godMode = !godMode;
            const statusEl = document.getElementById('status-message');
            if (statusEl) {
                statusEl.textContent = godMode ? 'GOD MODE: ON (Q/E up/down)' : '';
                statusEl.style.display = godMode ? 'block' : 'none';
            }
            e.preventDefault();
        }
    }, { signal: G.eventSignal });

    document.addEventListener('keyup', (e) => {
        if (G.keys.hasOwnProperty(e.key)) {
            G.keys[e.key] = false;
            e.preventDefault();
        }
    }, { signal: G.eventSignal });

    // Mouse controls for rotation
    G.isPointerLocked = false;

    G.container.addEventListener('click', () => {
        if (!G.isPointerLocked) {
            G.container.requestPointerLock = G.container.requestPointerLock || 
                                           G.container.mozRequestPointerLock || 
                                           G.container.webkitRequestPointerLock;
            G.container.requestPointerLock();
        }
    }, { signal: G.eventSignal });

    document.addEventListener('pointerlockchange', () => {
        G.isPointerLocked = document.pointerLockElement === G.container;
    }, { signal: G.eventSignal });

    document.addEventListener('mousemove', (e) => {
        if (G.isPointerLocked) {
            const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            G.player.rotation -= deltaX * 0.003;
        }
    }, { signal: G.eventSignal });

    // Trees - use level config if available, otherwise use default positions
    G.trees = [];
    G.treePositions = G.levelConfig.treePositions || [
        { x: -10, z: -15 }, { x: 10, z: -16 }, { x: 0, z: -18 },
        { x: -25, z: -30 }, { x: 20, z: -35 }, { x: -15, z: -45 },
        { x: 30, z: -25 }, { x: -35, z: 15 }, { x: 40, z: 20 },
        { x: -45, z: 25 }, { x: 50, z: 30 }, { x: -20, z: 40 },
        { x: 35, z: 45 }, { x: -50, z: -20 }, { x: 55, z: -25 }
    ];

    G.treePositions.forEach(pos => {
        const treeGroup = new THREE.Group();
        
        // Get cached textures from terrain.js
        const textures = getTerrainTextures(THREE);
        
        const treeType = pos.type || 'tree';
        
        if (G.computerTheme) {
            // Server tower / antenna array
            const towerColors = [0x00FFFF, 0xFF00FF, 0x00FF00];
            const accentColor = towerColors[Math.floor(Math.random() * towerColors.length)];
            
            // Main tower body - dark metallic
            const towerGeometry = new THREE.BoxGeometry(0.6, 3.5, 0.6);
            const towerMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x0A0A15,
                emissive: 0x001122,
                emissiveIntensity: 0.3,
                shininess: 80
            });
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.y = 1.75;
            tower.castShadow = true;
            treeGroup.add(tower);
            
            // LED strips on sides
            const stripGeometry = new THREE.BoxGeometry(0.08, 3.2, 0.08);
            const stripMaterial = new THREE.MeshBasicMaterial({ 
                color: accentColor,
                transparent: true,
                opacity: 0.9
            });
            const strip1 = new THREE.Mesh(stripGeometry, stripMaterial);
            strip1.position.set(0.35, 1.75, 0.35);
            treeGroup.add(strip1);
            const strip2 = new THREE.Mesh(stripGeometry, stripMaterial);
            strip2.position.set(-0.35, 1.75, -0.35);
            treeGroup.add(strip2);
            
            // Antenna dish on top
            const dishGeometry = new THREE.ConeGeometry(0.4, 0.3, 16);
            const dishMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x333344,
                shininess: 60
            });
            const dish = new THREE.Mesh(dishGeometry, dishMaterial);
            dish.position.y = 3.6;
            dish.rotation.x = Math.PI;
            treeGroup.add(dish);
            
            // Antenna spike
            const spikeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6);
            const spikeMaterial = new THREE.MeshBasicMaterial({ color: accentColor });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.y = 4.1;
            treeGroup.add(spike);
            
            // Blinking status lights
            const lightGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            for (let i = 0; i < 4; i++) {
                const lightColor = [0xFF0000, 0x00FF00, 0xFFFF00, 0x00FFFF][i];
                const lightMaterial = new THREE.MeshBasicMaterial({ 
                    color: lightColor,
                    transparent: true,
                    opacity: 0.9
                });
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.position.set(0.35, 0.5 + i * 0.8, 0);
                treeGroup.add(light);
            }
            
            // Data cable at base
            const cableGeometry = new THREE.TorusGeometry(0.5, 0.04, 8, 16);
            const cableMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x222233
            });
            const cable = new THREE.Mesh(cableGeometry, cableMaterial);
            cable.position.y = 0.1;
            cable.rotation.x = Math.PI / 2;
            treeGroup.add(cable);
            
        } else if (treeType === 'cactus') {
            // Desert cactus
            const cactusColor = 0x2d5a27;
            
            // Main cactus body
            const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 2.5, 8);
            const cactusMaterial = new THREE.MeshLambertMaterial({ color: cactusColor });
            const body = new THREE.Mesh(bodyGeometry, cactusMaterial);
            body.position.y = 1.25;
            body.castShadow = true;
            treeGroup.add(body);
            
            // Left arm
            const armGeometry = new THREE.CylinderGeometry(0.15, 0.18, 1.2, 6);
            const leftArm = new THREE.Mesh(armGeometry, cactusMaterial);
            leftArm.position.set(-0.5, 1.8, 0);
            leftArm.rotation.z = Math.PI / 3;
            leftArm.castShadow = true;
            treeGroup.add(leftArm);
            
            // Right arm
            const rightArm = new THREE.Mesh(armGeometry, cactusMaterial);
            rightArm.position.set(0.5, 1.4, 0);
            rightArm.rotation.z = -Math.PI / 3;
            rightArm.castShadow = true;
            treeGroup.add(rightArm);
            
        } else if (treeType === 'palm') {
            // Palm tree
            const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.25, 3.5, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B5A2B });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1.75;
            trunk.rotation.z = 0.1; // Slight lean
            trunk.castShadow = true;
            treeGroup.add(trunk);
            
            // Palm fronds
            const frondMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            for (let i = 0; i < 7; i++) {
                const frondGeometry = new THREE.ConeGeometry(0.15, 2, 4);
                const frond = new THREE.Mesh(frondGeometry, frondMaterial);
                const angle = (i / 7) * Math.PI * 2;
                frond.position.set(
                    Math.cos(angle) * 0.8,
                    3.8,
                    Math.sin(angle) * 0.8
                );
                frond.rotation.x = Math.PI / 2 + 0.3;
                frond.rotation.z = angle;
                frond.castShadow = true;
                treeGroup.add(frond);
            }
            
            // Add coconuts
            const coconutMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            for (let i = 0; i < 3; i++) {
                const coconut = new THREE.Mesh(
                    new THREE.SphereGeometry(0.12, 6, 6),
                    coconutMaterial
                );
                const angle = (i / 3) * Math.PI * 2;
                coconut.position.set(
                    Math.cos(angle) * 0.2,
                    3.4,
                    Math.sin(angle) * 0.2
                );
                coconut.castShadow = true;
                treeGroup.add(coconut);
            }
            
        } else if (treeType === 'lollipop') {
            // Giant lollipop
            const stickGeometry = new THREE.CylinderGeometry(0.15, 0.15, 3.5, 8);
            const stickMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const stick = new THREE.Mesh(stickGeometry, stickMaterial);
            stick.position.y = 1.75;
            stick.castShadow = true;
            treeGroup.add(stick);
            
            // Swirly candy top
            const candyColors = [0xFF69B4, 0x87CEEB, 0xFFD700, 0x98FB98, 0xFF6347, 0xDDA0DD];
            const candyColor = candyColors[Math.floor(Math.random() * candyColors.length)];
            const candyGeometry = new THREE.SphereGeometry(1.2, 16, 16);
            const candyMaterial = new THREE.MeshPhongMaterial({ 
                color: candyColor,
                shininess: 80
            });
            const candy = new THREE.Mesh(candyGeometry, candyMaterial);
            candy.position.y = 4.0;
            candy.castShadow = true;
            treeGroup.add(candy);
            
            // Add swirl pattern
            const swirlGeometry = new THREE.TorusGeometry(0.8, 0.15, 8, 32, Math.PI * 4);
            const swirlMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 80 });
            const swirl = new THREE.Mesh(swirlGeometry, swirlMaterial);
            swirl.position.y = 4.0;
            swirl.rotation.x = Math.PI / 2;
            treeGroup.add(swirl);
            
        } else if (treeType === 'candycane') {
            // Candy cane tree
            const caneRadius = 0.2;
            const caneHeight = 4;
            
            // Main candy cane body (white with red stripes effect via material)
            const caneGeometry = new THREE.CylinderGeometry(caneRadius, caneRadius, caneHeight, 12);
            const caneMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 60 });
            const cane = new THREE.Mesh(caneGeometry, caneMaterial);
            cane.position.y = caneHeight / 2;
            cane.castShadow = true;
            treeGroup.add(cane);
            
            // Red stripes wrapped around
            for (let i = 0; i < 8; i++) {
                const stripeGeometry = new THREE.TorusGeometry(caneRadius + 0.02, 0.08, 8, 16);
                const stripeMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000, shininess: 60 });
                const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripe.position.y = 0.3 + i * 0.5;
                stripe.rotation.x = Math.PI / 2;
                stripe.rotation.z = i * 0.3;
                treeGroup.add(stripe);
            }
            
            // Curved top (hook)
            const hookGeometry = new THREE.TorusGeometry(0.5, caneRadius, 12, 16, Math.PI);
            const hookMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 60 });
            const hook = new THREE.Mesh(hookGeometry, hookMaterial);
            hook.position.set(0.5, caneHeight, 0);
            hook.rotation.z = Math.PI / 2;
            hook.castShadow = true;
            treeGroup.add(hook);
            
            // Red stripe on hook
            const hookStripeGeometry = new THREE.TorusGeometry(0.5, caneRadius * 0.6, 8, 16, Math.PI * 0.5);
            const hookStripeMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000, shininess: 60 });
            const hookStripe = new THREE.Mesh(hookStripeGeometry, hookStripeMaterial);
            hookStripe.position.set(0.5, caneHeight, 0);
            hookStripe.rotation.z = Math.PI / 2;
            treeGroup.add(hookStripe);
            
        } else if (treeType === 'snow-pine') {
            // Snow-covered pine tree for Christmas theme
            const pineGreen = pos.color || 0x1e5631;
            const snowWhite = 0xffffff;
            
            // Pine trunk - brown
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 0.75;
            trunk.castShadow = true;
            treeGroup.add(trunk);
            
            // Layered pine branches (3 tiers)
            for (let i = 0; i < 3; i++) {
                const tierRadius = 1.2 - i * 0.3;
                const tierHeight = 1.5;
                const tierY = 1.5 + i * 1.0;
                
                // Green pine layer
                const pineGeometry = new THREE.ConeGeometry(tierRadius, tierHeight, 8);
                const pineMaterial = new THREE.MeshLambertMaterial({ color: pineGreen });
                const pineTier = new THREE.Mesh(pineGeometry, pineMaterial);
                pineTier.position.y = tierY;
                pineTier.castShadow = true;
                treeGroup.add(pineTier);
                
                // Snow on top of each tier
                const snowGeometry = new THREE.ConeGeometry(tierRadius * 0.95, tierHeight * 0.3, 8);
                const snowMaterial = new THREE.MeshLambertMaterial({ color: snowWhite });
                const snowCap = new THREE.Mesh(snowGeometry, snowMaterial);
                snowCap.position.y = tierY + tierHeight * 0.4;
                snowCap.castShadow = true;
                treeGroup.add(snowCap);
            }
            
            // Star on top
            const starGeometry = new THREE.SphereGeometry(0.15, 6, 6);
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.y = 4.5;
            treeGroup.add(star);
            
        } else if (treeType === 'tombstone') {
            // Graveyard tombstone
            const stoneColor = 0x5a5a5a;
            const mossColor = 0x2a3a2a;
            
            // Main tombstone slab
            const slabGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.2);
            const slabMaterial = new THREE.MeshLambertMaterial({ color: stoneColor });
            const slab = new THREE.Mesh(slabGeometry, slabMaterial);
            slab.position.y = 0.75;
            slab.castShadow = true;
            treeGroup.add(slab);
            
            // Rounded top
            const topGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16, 1, false, 0, Math.PI);
            const top = new THREE.Mesh(topGeometry, slabMaterial);
            top.position.set(0, 1.5, 0);
            top.rotation.z = Math.PI / 2;
            top.rotation.y = Math.PI / 2;
            top.castShadow = true;
            treeGroup.add(top);
            
            // Base
            const baseGeometry = new THREE.BoxGeometry(1.0, 0.2, 0.3);
            const base = new THREE.Mesh(baseGeometry, slabMaterial);
            base.position.y = 0.1;
            treeGroup.add(base);
            
            // Moss patches
            const mossMaterial = new THREE.MeshLambertMaterial({ color: mossColor });
            for (let i = 0; i < 3; i++) {
                const mossGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 6);
                const moss = new THREE.Mesh(mossGeometry, mossMaterial);
                moss.position.set(
                    (Math.random() - 0.5) * 0.6,
                    Math.random() * 1.2,
                    0.12
                );
                moss.scale.z = 0.3;
                treeGroup.add(moss);
            }
            
            // Random tilt for aged look
            treeGroup.rotation.x = (Math.random() - 0.5) * 0.15;
            treeGroup.rotation.z = (Math.random() - 0.5) * 0.1;
            
        } else if (treeType === 'deadtree') {
            // Dead/bare tree for graveyard
            const deadWoodColor = 0x2a2018;
            const deadMaterial = new THREE.MeshLambertMaterial({ color: deadWoodColor });
            
            // Gnarled trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 3, 8);
            const trunk = new THREE.Mesh(trunkGeometry, deadMaterial);
            trunk.position.y = 1.5;
            trunk.rotation.z = (Math.random() - 0.5) * 0.2;
            trunk.castShadow = true;
            treeGroup.add(trunk);
            
            // Dead branches
            for (let i = 0; i < 5; i++) {
                const branchLength = 0.8 + Math.random() * 1.2;
                const branchGeometry = new THREE.CylinderGeometry(0.03, 0.08, branchLength, 6);
                const branch = new THREE.Mesh(branchGeometry, deadMaterial);
                const height = 1.5 + Math.random() * 1.5;
                const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.5;
                branch.position.set(
                    Math.cos(angle) * 0.3,
                    height,
                    Math.sin(angle) * 0.3
                );
                branch.rotation.x = Math.PI / 4 + Math.random() * 0.5;
                branch.rotation.z = angle + Math.PI / 2;
                branch.castShadow = true;
                treeGroup.add(branch);
            }
            
            // Twisted top
            const topGeometry = new THREE.ConeGeometry(0.15, 1, 6);
            const topBranch = new THREE.Mesh(topGeometry, deadMaterial);
            topBranch.position.y = 3.2;
            topBranch.rotation.z = (Math.random() - 0.5) * 0.4;
            topBranch.castShadow = true;
            treeGroup.add(topBranch);
            
        } else if (treeType === 'jackolantern') {
            // Halloween Jack-o-lantern pumpkin
            const pumpkinOrange = 0xFF6600;
            const pumpkinDark = 0xCC4400;
            const stemBrown = 0x4a3020;
            const glowYellow = 0xFFDD00;
            
            // Main pumpkin body - slightly squashed sphere with ridges
            const pumpkinGeometry = new THREE.SphereGeometry(0.6, 12, 12);
            const pumpkinMaterial = new THREE.MeshLambertMaterial({ color: pumpkinOrange });
            const pumpkin = new THREE.Mesh(pumpkinGeometry, pumpkinMaterial);
            pumpkin.scale.set(1, 0.8, 1);
            pumpkin.position.y = 0.5;
            pumpkin.castShadow = true;
            treeGroup.add(pumpkin);
            
            // Pumpkin ridges (vertical darker segments)
            for (let i = 0; i < 8; i++) {
                const ridgeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6);
                const ridgeMaterial = new THREE.MeshLambertMaterial({ color: pumpkinDark });
                const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
                const angle = (i / 8) * Math.PI * 2;
                ridge.position.set(
                    Math.cos(angle) * 0.55,
                    0.5,
                    Math.sin(angle) * 0.55
                );
                ridge.scale.y = 0.8;
                treeGroup.add(ridge);
            }
            
            // Stem on top
            const stemGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.3, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: stemBrown });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.set(0, 1.0, 0);
            stem.rotation.z = (Math.random() - 0.5) * 0.3;
            stem.castShadow = true;
            treeGroup.add(stem);
            
            // Glowing face - triangular eyes
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: glowYellow,
                transparent: true,
                opacity: 0.95
            });
            
            // Left eye (triangle)
            const eyeGeometry = new THREE.ConeGeometry(0.12, 0.15, 3);
            const leftEye = new THREE.Mesh(eyeGeometry, glowMaterial);
            leftEye.position.set(-0.2, 0.6, 0.5);
            leftEye.rotation.x = Math.PI;
            treeGroup.add(leftEye);
            
            // Right eye (triangle)
            const rightEye = new THREE.Mesh(eyeGeometry, glowMaterial);
            rightEye.position.set(0.2, 0.6, 0.5);
            rightEye.rotation.x = Math.PI;
            treeGroup.add(rightEye);
            
            // Nose (small triangle)
            const noseGeometry = new THREE.ConeGeometry(0.08, 0.1, 3);
            const nose = new THREE.Mesh(noseGeometry, glowMaterial);
            nose.position.set(0, 0.45, 0.52);
            nose.rotation.x = Math.PI;
            treeGroup.add(nose);
            
            // Mouth - jagged smile
            const mouthGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.15);
            const mouth = new THREE.Mesh(mouthGeometry, glowMaterial);
            mouth.position.set(0, 0.3, 0.48);
            treeGroup.add(mouth);
            
            // Teeth gaps in mouth
            const toothGapMaterial = new THREE.MeshLambertMaterial({ color: pumpkinOrange });
            for (let i = 0; i < 3; i++) {
                const toothGap = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, 0.12, 0.16),
                    toothGapMaterial
                );
                toothGap.position.set(-0.12 + i * 0.12, 0.3, 0.48);
                treeGroup.add(toothGap);
            }
            
            // Inner glow light
            const glowLight = new THREE.PointLight(0xFFAA00, 0.8, 5);
            glowLight.position.set(0, 0.5, 0);
            treeGroup.add(glowLight);
            
            // Random rotation for variety
            treeGroup.rotation.y = Math.random() * Math.PI * 2;
            
        } else if (treeType === 'brokencolumn') {
            // Broken stone column for ruins
            const stoneColor = 0x8B8378;
            const stoneDark = 0x6B635B;
            const stoneMaterial = new THREE.MeshLambertMaterial({ color: stoneColor });
            
            // Column base (wider)
            const baseGeometry = new THREE.CylinderGeometry(0.7, 0.8, 0.4, 12);
            const baseMaterial = new THREE.MeshLambertMaterial({ color: stoneDark });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = 0.2;
            base.castShadow = true;
            treeGroup.add(base);
            
            // Main column shaft (broken at random height)
            const columnHeight = 1.5 + Math.random() * 2;
            const columnGeometry = new THREE.CylinderGeometry(0.5, 0.55, columnHeight, 12);
            const column = new THREE.Mesh(columnGeometry, stoneMaterial);
            column.position.y = 0.4 + columnHeight / 2;
            column.castShadow = true;
            treeGroup.add(column);
            
            // Broken top (jagged)
            const brokenTopGeometry = new THREE.ConeGeometry(0.5, 0.4, 6);
            const brokenTop = new THREE.Mesh(brokenTopGeometry, stoneMaterial);
            brokenTop.position.y = 0.4 + columnHeight + 0.1;
            brokenTop.rotation.x = Math.PI;
            brokenTop.rotation.y = Math.random() * Math.PI;
            treeGroup.add(brokenTop);
            
            // Fallen chunk nearby
            if (Math.random() > 0.4) {
                const chunkGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.3, 0);
                const chunk = new THREE.Mesh(chunkGeometry, baseMaterial);
                chunk.position.set(
                    (Math.random() - 0.5) * 2,
                    0.2,
                    (Math.random() - 0.5) * 2
                );
                chunk.rotation.set(Math.random(), Math.random(), Math.random());
                chunk.castShadow = true;
                treeGroup.add(chunk);
            }
            
            // Ivy climbing column
            if (Math.random() > 0.5) {
                const ivyMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x3A5F3A,
                    transparent: true,
                    opacity: 0.7
                });
                const ivyGeometry = new THREE.PlaneGeometry(0.8, columnHeight * 0.5);
                const ivy = new THREE.Mesh(ivyGeometry, ivyMaterial);
                ivy.position.set(0.52, columnHeight * 0.4, 0);
                ivy.rotation.y = Math.PI / 2;
                treeGroup.add(ivy);
            }
            
        } else if (treeType === 'stonearch') {
            // Stone archway for ruins
            const stoneColor = 0x7A7268;
            const stoneMaterial = new THREE.MeshLambertMaterial({ color: stoneColor });
            
            // Left pillar
            const pillarGeometry = new THREE.BoxGeometry(0.6, 2.5, 0.6);
            const leftPillar = new THREE.Mesh(pillarGeometry, stoneMaterial);
            leftPillar.position.set(-1, 1.25, 0);
            leftPillar.castShadow = true;
            treeGroup.add(leftPillar);
            
            // Right pillar
            const rightPillar = new THREE.Mesh(pillarGeometry, stoneMaterial);
            rightPillar.position.set(1, 1.25, 0);
            rightPillar.castShadow = true;
            treeGroup.add(rightPillar);
            
            // Arch top (if not broken)
            if (Math.random() > 0.3) {
                const archGeometry = new THREE.BoxGeometry(2.6, 0.5, 0.6);
                const arch = new THREE.Mesh(archGeometry, stoneMaterial);
                arch.position.y = 2.75;
                arch.rotation.z = (Math.random() - 0.5) * 0.1; // Slight tilt
                arch.castShadow = true;
                treeGroup.add(arch);
            }
            
            // Fallen stones at base
            for (let i = 0; i < 2; i++) {
                const rubbleGeometry = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.2, 0);
                const rubble = new THREE.Mesh(rubbleGeometry, stoneMaterial);
                rubble.position.set(
                    (Math.random() - 0.5) * 3,
                    0.15,
                    (Math.random() - 0.5) * 1.5
                );
                rubble.rotation.set(Math.random(), Math.random(), Math.random());
                rubble.castShadow = true;
                treeGroup.add(rubble);
            }
            
            treeGroup.rotation.y = Math.random() * Math.PI * 2;
            
        } else if (treeType === 'rubble') {
            // Pile of rubble/debris for ruins
            const stoneColors = [0x8B8378, 0x7A7268, 0x6B635B, 0x9A9488];
            
            // Create pile of random stone chunks
            const chunkCount = 5 + Math.floor(Math.random() * 5);
            for (let i = 0; i < chunkCount; i++) {
                const size = 0.2 + Math.random() * 0.4;
                const chunkGeometry = new THREE.DodecahedronGeometry(size, 0);
                const chunkColor = stoneColors[Math.floor(Math.random() * stoneColors.length)];
                const chunkMaterial = new THREE.MeshLambertMaterial({ color: chunkColor });
                const chunk = new THREE.Mesh(chunkGeometry, chunkMaterial);
                
                // Stack chunks in a rough pile shape
                const radius = 0.8 * Math.random();
                const angle = Math.random() * Math.PI * 2;
                chunk.position.set(
                    Math.cos(angle) * radius,
                    size * 0.5 + Math.random() * 0.3,
                    Math.sin(angle) * radius
                );
                chunk.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                chunk.castShadow = true;
                treeGroup.add(chunk);
            }
            
            // Occasional larger slab
            if (Math.random() > 0.5) {
                const slabGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.5);
                const slabMaterial = new THREE.MeshLambertMaterial({ color: 0x7A7268 });
                const slab = new THREE.Mesh(slabGeometry, slabMaterial);
                slab.position.set(
                    (Math.random() - 0.5) * 0.5,
                    0.1,
                    (Math.random() - 0.5) * 0.5
                );
                slab.rotation.set(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * Math.PI,
                    (Math.random() - 0.5) * 0.2
                );
                slab.castShadow = true;
                treeGroup.add(slab);
            }
            
        } else if (treeType === 'knightstatue') {
            // Stone knight statue for ruins
            const stoneColor = 0x6B6B6B;
            const stoneDark = 0x4A4A4A;
            const stoneMaterial = new THREE.MeshLambertMaterial({ color: stoneColor });
            const darkMaterial = new THREE.MeshLambertMaterial({ color: stoneDark });
            
            // Pedestal base
            const pedestalGeometry = new THREE.BoxGeometry(1.2, 0.4, 1.2);
            const pedestal = new THREE.Mesh(pedestalGeometry, darkMaterial);
            pedestal.position.y = 0.2;
            pedestal.castShadow = true;
            treeGroup.add(pedestal);
            
            // Body (simplified knight shape)
            const bodyGeometry = new THREE.CylinderGeometry(0.35, 0.45, 1.5, 8);
            const body = new THREE.Mesh(bodyGeometry, stoneMaterial);
            body.position.y = 1.15;
            body.castShadow = true;
            treeGroup.add(body);
            
            // Head (helmet)
            const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const head = new THREE.Mesh(headGeometry, stoneMaterial);
            head.position.y = 2.1;
            head.scale.y = 1.2;
            head.castShadow = true;
            treeGroup.add(head);
            
            // Helmet visor/slit
            const visorGeometry = new THREE.BoxGeometry(0.25, 0.05, 0.35);
            const visor = new THREE.Mesh(visorGeometry, darkMaterial);
            visor.position.set(0, 2.1, 0.25);
            treeGroup.add(visor);
            
            // Shield (on side)
            const shieldGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.4);
            const shield = new THREE.Mesh(shieldGeometry, stoneMaterial);
            shield.position.set(-0.45, 1.2, 0);
            shield.rotation.z = 0.2;
            shield.castShadow = true;
            treeGroup.add(shield);
            
            // Sword (in front)
            const swordGeometry = new THREE.BoxGeometry(0.08, 1.2, 0.08);
            const sword = new THREE.Mesh(swordGeometry, darkMaterial);
            sword.position.set(0.3, 0.8, 0.2);
            sword.castShadow = true;
            treeGroup.add(sword);
            
            // Sword guard
            const guardGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.08);
            const guard = new THREE.Mesh(guardGeometry, darkMaterial);
            guard.position.set(0.3, 1.4, 0.2);
            treeGroup.add(guard);
            
            // Weather damage - missing parts
            if (Math.random() > 0.6) {
                // Chipped/damaged look - asymmetric
                body.scale.x = 0.9;
            }
            
            // Moss on base
            const mossMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x3A5F3A,
                transparent: true,
                opacity: 0.6
            });
            for (let i = 0; i < 2; i++) {
                const mossGeometry = new THREE.SphereGeometry(0.15, 6, 6);
                const moss = new THREE.Mesh(mossGeometry, mossMaterial);
                moss.position.set(
                    (Math.random() - 0.5) * 0.8,
                    0.35,
                    (Math.random() - 0.5) * 0.8
                );
                moss.scale.y = 0.3;
                treeGroup.add(moss);
            }
            
            treeGroup.rotation.y = Math.random() * Math.PI * 2;
            
        } else {
            // Regular tree
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ 
                map: textures.bark,
                color: G.iceTheme ? 0x889999 : 0xccbbaa
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;
            trunk.castShadow = true;
            treeGroup.add(trunk);
            
            const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
            const foliageMaterial = new THREE.MeshLambertMaterial({ 
                map: G.iceTheme ? textures.foliageIce : textures.foliage,
                color: G.treeColor
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 2.5;
            foliage.castShadow = true;
            treeGroup.add(foliage);
        }
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        treeGroup.position.set(pos.x, terrainHeight, pos.z);
        G.scene.add(treeGroup);
        // Different collision radii for different tree types
        let treeRadius = 1.5;
        if (treeType === 'cactus') treeRadius = 0.5;
        else if (treeType === 'tombstone') treeRadius = 0.5;
        else if (treeType === 'deadtree') treeRadius = 0.4;
        else if (treeType === 'jackolantern') treeRadius = 0.6;
        else if (treeType === 'snow-pine') treeRadius = 1.2;
        G.trees.push({ mesh: treeGroup, type: treeType, radius: treeRadius });
    });

    // Giant Trees - massive ancient trees for enchanted theme
    G.giantTrees = [];
    if (G.levelConfig.giantTrees) {
        const giantTreeTextures = getTerrainTextures(THREE);
        G.levelConfig.giantTrees.forEach(treeConfig => {
            const giantTreeGroup = new THREE.Group();
            const scale = treeConfig.scale || 1.0;
            
            // Tall trunk - dark brown ancient bark (reduced from 12 to 6 for better proportions)
            const trunkGeometry = new THREE.CylinderGeometry(0.8 * scale, 1.2 * scale, 6 * scale, 12);
            const trunkMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x3D2817,  // Dark ancient wood
                map: giantTreeTextures.bark
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 3 * scale;
            trunk.castShadow = true;
            giantTreeGroup.add(trunk);
            
            // Root bulge at base
            const rootGeometry = new THREE.SphereGeometry(1.5 * scale, 8, 6);
            const root = new THREE.Mesh(rootGeometry, trunkMaterial);
            root.position.y = 0.3 * scale;
            root.scale.y = 0.4;
            root.castShadow = true;
            giantTreeGroup.add(root);
            
            // Spreading roots
            for (let i = 0; i < 4; i++) {
                const rootArmGeometry = new THREE.CylinderGeometry(0.1 * scale, 0.3 * scale, 1.5 * scale, 6);
                const rootArm = new THREE.Mesh(rootArmGeometry, trunkMaterial);
                const angle = (i / 4) * Math.PI * 2;
                rootArm.position.set(
                    Math.cos(angle) * 1.2 * scale,
                    0,
                    Math.sin(angle) * 1.2 * scale
                );
                rootArm.rotation.z = Math.PI / 3;
                rootArm.rotation.y = -angle;
                rootArm.castShadow = true;
                giantTreeGroup.add(rootArm);
            }
            
            // Canopy - layered spheres
            const foliageMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x2D5A27,  // Deep forest green
                map: giantTreeTextures.foliage
            });
            
            // Main canopy
            const mainCanopyGeometry = new THREE.SphereGeometry(2.5 * scale, 12, 10);
            const mainCanopy = new THREE.Mesh(mainCanopyGeometry, foliageMaterial);
            mainCanopy.position.y = 7 * scale;
            mainCanopy.scale.y = 0.6;
            mainCanopy.castShadow = true;
            giantTreeGroup.add(mainCanopy);
            
            // Secondary canopy clusters
            for (let i = 0; i < 5; i++) {
                const clusterGeometry = new THREE.SphereGeometry(1.2 * scale, 8, 8);
                const cluster = new THREE.Mesh(clusterGeometry, foliageMaterial);
                const angle = (i / 5) * Math.PI * 2;
                cluster.position.set(
                    Math.cos(angle) * 1.8 * scale,
                    6 * scale + Math.random() * 1 * scale,
                    Math.sin(angle) * 1.8 * scale
                );
                cluster.castShadow = true;
                giantTreeGroup.add(cluster);
            }
            
            // Glowing fairy lights in canopy (enchanted effect)
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFF88,
                transparent: true,
                opacity: 0.8
            });
            for (let i = 0; i < 6; i++) {
                const lightGeometry = new THREE.SphereGeometry(0.1 * scale, 6, 6);
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                const angle = Math.random() * Math.PI * 2;
                const dist = 1 + Math.random() * 1.5;
                light.position.set(
                    Math.cos(angle) * dist * scale,
                    5 * scale + Math.random() * 3 * scale,
                    Math.sin(angle) * dist * scale
                );
                giantTreeGroup.add(light);
            }
            
            // Hanging vines/moss
            const vineMaterial = new THREE.MeshLambertMaterial({ color: 0x4A7A42 });
            for (let i = 0; i < 3; i++) {
                const vineGeometry = new THREE.CylinderGeometry(0.03 * scale, 0.05 * scale, 2 * scale, 4);
                const vine = new THREE.Mesh(vineGeometry, vineMaterial);
                const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
                vine.position.set(
                    Math.cos(angle) * 1.5 * scale,
                    5 * scale,
                    Math.sin(angle) * 1.5 * scale
                );
                giantTreeGroup.add(vine);
            }
            
            const terrainHeight = getTerrainHeight(treeConfig.x, treeConfig.z);
            giantTreeGroup.position.set(treeConfig.x, terrainHeight, treeConfig.z);
            G.scene.add(giantTreeGroup);
            
            // Collision radius - just the trunk width
            G.giantTrees.push({ 
                mesh: giantTreeGroup, 
                radius: 1.0 * scale,
                x: treeConfig.x,
                z: treeConfig.z
            });
            // Also add to regular trees array for collision detection
            G.trees.push({ mesh: giantTreeGroup, type: 'giantTree', radius: 1.0 * scale });
        });
    }

    // Fairy Rings - magical mushroom circles for enchanted theme
    G.fairyRings = [];
    if (G.levelConfig.fairyRings) {
        G.levelConfig.fairyRings.forEach(ringConfig => {
            const ringGroup = new THREE.Group();
            const ringRadius = ringConfig.radius || 6;
            const mushroomCount = Math.floor(ringRadius * 1.5);
            
            // Ring of small red-white mushrooms
            for (let i = 0; i < mushroomCount; i++) {
                const angle = (i / mushroomCount) * Math.PI * 2;
                const x = Math.cos(angle) * ringRadius;
                const z = Math.sin(angle) * ringRadius;
                
                // Mushroom cap - red with white spots
                const capGeometry = new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
                const capMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4444 });
                const cap = new THREE.Mesh(capGeometry, capMaterial);
                cap.position.set(x, 0.4, z);
                cap.castShadow = true;
                ringGroup.add(cap);
                
                // Stem
                const stemGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.35, 6);
                const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xFFF8DC });
                const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                stem.position.set(x, 0.18, z);
                stem.castShadow = true;
                ringGroup.add(stem);
                
                // White spots on cap
                for (let j = 0; j < 3; j++) {
                    const spotGeometry = new THREE.SphereGeometry(0.06, 6, 6);
                    const spotMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
                    const spot = new THREE.Mesh(spotGeometry, spotMaterial);
                    const spotAngle = (j / 3) * Math.PI * 2 + Math.random();
                    spot.position.set(
                        x + Math.cos(spotAngle) * 0.15,
                        0.45,
                        z + Math.sin(spotAngle) * 0.15
                    );
                    ringGroup.add(spot);
                }
            }
            
            // Glowing green center circle
            const glowGeometry = new THREE.CircleGeometry(ringRadius * 0.8, 24);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x98FB98, 
                transparent: true, 
                opacity: 0.25,
                side: THREE.DoubleSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.y = 0.05;
            glow.rotation.x = -Math.PI / 2;
            ringGroup.add(glow);
            
            // Floating sparkles in center
            for (let i = 0; i < 8; i++) {
                const sparkleGeometry = new THREE.SphereGeometry(0.08, 6, 6);
                const sparkleColors = [0xFFD700, 0xFFFFFF, 0xFF69B4, 0x98FB98];
                const sparkleMaterial = new THREE.MeshBasicMaterial({ 
                    color: sparkleColors[i % sparkleColors.length],
                    transparent: true,
                    opacity: 0.8
                });
                const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
                const sparkleAngle = Math.random() * Math.PI * 2;
                const sparkleDist = Math.random() * ringRadius * 0.6;
                sparkle.position.set(
                    Math.cos(sparkleAngle) * sparkleDist,
                    0.5 + Math.random() * 1.5,
                    Math.sin(sparkleAngle) * sparkleDist
                );
                sparkle.userData.phase = Math.random() * Math.PI * 2;
                ringGroup.add(sparkle);
            }
            
            const terrainHeight = getTerrainHeight(ringConfig.x, ringConfig.z);
            ringGroup.position.set(ringConfig.x, terrainHeight, ringConfig.z);
            G.scene.add(ringGroup);
            
            G.fairyRings.push({ 
                mesh: ringGroup, 
                x: ringConfig.x, 
                z: ringConfig.z, 
                radius: ringRadius 
            });
        });
    }

    // Enchanted Mushrooms - large glowing mushrooms
    G.enchantedMushrooms = [];
    if (G.levelConfig.enchantedMushrooms) {
        G.levelConfig.enchantedMushrooms.forEach(mushroomConfig => {
            const mushroomGroup = new THREE.Group();
            const scale = mushroomConfig.scale || 1.0;
            
            // Large stem
            const stemGeometry = new THREE.CylinderGeometry(0.4 * scale, 0.6 * scale, 2 * scale, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xFFF8DC });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 1 * scale;
            stem.castShadow = true;
            mushroomGroup.add(stem);
            
            // Big pink dome cap
            const capGeometry = new THREE.SphereGeometry(1.2 * scale, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
            const capMaterial = new THREE.MeshLambertMaterial({ color: 0xFF1493 });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 2 * scale;
            cap.castShadow = true;
            mushroomGroup.add(cap);
            
            // White spots on cap
            for (let i = 0; i < 8; i++) {
                const spotGeometry = new THREE.SphereGeometry(0.15 * scale + Math.random() * 0.1 * scale, 8, 8);
                const spotMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
                const spot = new THREE.Mesh(spotGeometry, spotMaterial);
                const angle = (i / 8) * Math.PI * 2;
                const r = 0.6 * scale + Math.random() * 0.4 * scale;
                spot.position.set(
                    Math.cos(angle) * r,
                    2.2 * scale + Math.random() * 0.3 * scale,
                    Math.sin(angle) * r
                );
                spot.scale.y = 0.3;
                mushroomGroup.add(spot);
            }
            
            // Turquoise glow underneath cap
            const glowGeometry = new THREE.CircleGeometry(1.0 * scale, 12);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00FFAA, 
                transparent: true, 
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.y = 1.9 * scale;
            glow.rotation.x = Math.PI / 2;
            mushroomGroup.add(glow);
            
            const terrainHeight = getTerrainHeight(mushroomConfig.x, mushroomConfig.z);
            mushroomGroup.position.set(mushroomConfig.x, terrainHeight, mushroomConfig.z);
            G.scene.add(mushroomGroup);
            
            G.enchantedMushrooms.push({ 
                mesh: mushroomGroup, 
                x: mushroomConfig.x, 
                z: mushroomConfig.z, 
                radius: 0.8 * scale 
            });
            // Add to trees for collision
            G.trees.push({ mesh: mushroomGroup, type: 'enchantedMushroom', radius: 0.6 * scale });
        });
    }

    // Crystal Flowers - magical rainbow flowers
    G.crystalFlowers = [];
    if (G.levelConfig.crystalFlowers) {
        const petalColors = [0xFF69B4, 0x9370DB, 0x00CED1, 0xFFD700, 0xFF6B6B, 0x98FB98];
        G.levelConfig.crystalFlowers.forEach(flowerConfig => {
            const flowerGroup = new THREE.Group();
            
            // Green stem
            const stemGeometry = new THREE.CylinderGeometry(0.06, 0.1, 1.2, 6);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.6;
            stem.castShadow = true;
            flowerGroup.add(stem);
            
            // Crystal petals as elongated octahedrons
            for (let i = 0; i < 6; i++) {
                const petalGeometry = new THREE.OctahedronGeometry(0.25, 0);
                const petalMaterial = new THREE.MeshBasicMaterial({ 
                    color: petalColors[i],
                    transparent: true,
                    opacity: 0.75
                });
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                const angle = (i / 6) * Math.PI * 2;
                petal.position.set(
                    Math.cos(angle) * 0.3,
                    1.3,
                    Math.sin(angle) * 0.3
                );
                petal.rotation.z = Math.PI / 4;
                petal.scale.set(0.5, 1.5, 0.5);
                flowerGroup.add(petal);
            }
            
            // Center glowing gem
            const centerGeometry = new THREE.IcosahedronGeometry(0.18, 0);
            const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.y = 1.35;
            flowerGroup.add(center);
            
            // Small leaves
            const leafGeometry = new THREE.PlaneGeometry(0.25, 0.4);
            const leafMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x228B22, 
                side: THREE.DoubleSide 
            });
            [-0.12, 0.12].forEach((x, idx) => {
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                leaf.position.set(x, 0.5, 0);
                leaf.rotation.y = idx === 0 ? 0.5 : -0.5;
                leaf.rotation.z = idx === 0 ? 0.3 : -0.3;
                flowerGroup.add(leaf);
            });
            
            const terrainHeight = getTerrainHeight(flowerConfig.x, flowerConfig.z);
            flowerGroup.position.set(flowerConfig.x, terrainHeight, flowerConfig.z);
            G.scene.add(flowerGroup);
            
            G.crystalFlowers.push({ 
                mesh: flowerGroup, 
                x: flowerConfig.x, 
                z: flowerConfig.z 
            });
        });
    }

    // Rainbow Arcs - small floating rainbows
    G.rainbowArcs = [];
    if (G.levelConfig.rainbowArcs) {
        const rainbowColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
        G.levelConfig.rainbowArcs.forEach(arcConfig => {
            const arcGroup = new THREE.Group();
            const height = arcConfig.height || 8;
            
            // Rainbow bands
            rainbowColors.forEach((color, i) => {
                const arcGeometry = new THREE.TorusGeometry(2.5 - i * 0.15, 0.1, 8, 32, Math.PI);
                const arcMaterial = new THREE.MeshBasicMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: 0.7
                });
                const arc = new THREE.Mesh(arcGeometry, arcMaterial);
                arc.rotation.x = Math.PI / 2;
                arcGroup.add(arc);
            });
            
            // Golden/white sparkles along the arc
            for (let i = 0; i < 5; i++) {
                const sparkleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
                const sparkleMaterial = new THREE.MeshBasicMaterial({ 
                    color: i % 2 === 0 ? 0xFFD700 : 0xFFFFFF 
                });
                const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
                const sparkleAngle = (i / 5) * Math.PI;
                sparkle.position.set(
                    Math.cos(sparkleAngle) * 2.2,
                    Math.sin(sparkleAngle) * 2.2,
                    0
                );
                arcGroup.add(sparkle);
            }
            
            const terrainHeight = getTerrainHeight(arcConfig.x, arcConfig.z);
            arcGroup.position.set(arcConfig.x, terrainHeight + height, arcConfig.z);
            G.scene.add(arcGroup);
            
            G.rainbowArcs.push({ 
                mesh: arcGroup, 
                x: arcConfig.x, 
                z: arcConfig.z,
                height: height
            });
        });
    }

    // ====================================
    // EASTER THEME DECORATIONS
    // ====================================
    
    // Blossom Trees - pink flowering trees for Easter
    G.blossomTrees = [];
    if (G.levelConfig.blossomTrees) {
        G.levelConfig.blossomTrees.forEach(treeConfig => {
            const blossomGroup = new THREE.Group();
            const scale = treeConfig.scale || 1.0;
            
            // Tree trunk - brown bark
            const trunkGeometry = new THREE.CylinderGeometry(0.2 * scale, 0.35 * scale, 2.5 * scale, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1.25 * scale;
            trunk.castShadow = true;
            blossomGroup.add(trunk);
            
            // Pink blossom canopy - multiple spheres
            const blossomColors = [0xFFB6C1, 0xFF69B4, 0xFFC0CB]; // Various pinks
            for (let i = 0; i < 5; i++) {
                const canopyGeometry = new THREE.SphereGeometry(0.8 * scale + Math.random() * 0.3 * scale, 8, 8);
                const canopyMaterial = new THREE.MeshLambertMaterial({ 
                    color: blossomColors[i % blossomColors.length] 
                });
                const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
                const angle = (i / 5) * Math.PI * 2;
                canopy.position.set(
                    Math.cos(angle) * 0.5 * scale,
                    3 * scale + Math.random() * 0.5 * scale,
                    Math.sin(angle) * 0.5 * scale
                );
                canopy.castShadow = true;
                blossomGroup.add(canopy);
            }
            
            // Center canopy
            const centerCanopyGeometry = new THREE.SphereGeometry(1.0 * scale, 8, 8);
            const centerCanopyMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB6C1 });
            const centerCanopy = new THREE.Mesh(centerCanopyGeometry, centerCanopyMaterial);
            centerCanopy.position.y = 3.2 * scale;
            centerCanopy.castShadow = true;
            blossomGroup.add(centerCanopy);
            
            // Falling petals (small spheres)
            for (let i = 0; i < 8; i++) {
                const petalGeometry = new THREE.SphereGeometry(0.08 * scale, 6, 6);
                const petalMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0xFFB6C1, 
                    transparent: true, 
                    opacity: 0.8 
                });
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                petal.position.set(
                    (Math.random() - 0.5) * 2 * scale,
                    1 + Math.random() * 2 * scale,
                    (Math.random() - 0.5) * 2 * scale
                );
                petal.userData.fallSpeed = 0.005 + Math.random() * 0.01;
                petal.userData.swayPhase = Math.random() * Math.PI * 2;
                blossomGroup.add(petal);
            }
            
            const terrainHeight = getTerrainHeight(treeConfig.x, treeConfig.z);
            blossomGroup.position.set(treeConfig.x, terrainHeight, treeConfig.z);
            G.scene.add(blossomGroup);
            
            G.blossomTrees.push({ 
                mesh: blossomGroup, 
                x: treeConfig.x, 
                z: treeConfig.z, 
                scale: scale 
            });
            // Add to trees for collision
            G.trees.push({ mesh: blossomGroup, type: 'blossomTree', radius: 0.4 * scale });
        });
    }
    
    // Easter Baskets - decorative baskets with eggs
    G.easterBaskets = [];
    if (G.levelConfig.easterBaskets) {
        const basketEggColors = [0xFF69B4, 0x98FB98, 0x87CEEB, 0xFFD700, 0xE6E6FA];
        G.levelConfig.easterBaskets.forEach(basketConfig => {
            const basketGroup = new THREE.Group();
            const scale = basketConfig.scale || 1.0;
            
            // Basket body - woven look
            const basketGeometry = new THREE.CylinderGeometry(0.5 * scale, 0.3 * scale, 0.4 * scale, 12);
            const basketMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
            const basket = new THREE.Mesh(basketGeometry, basketMaterial);
            basket.position.y = 0.2 * scale;
            basket.castShadow = true;
            basketGroup.add(basket);
            
            // Basket rim
            const rimGeometry = new THREE.TorusGeometry(0.5 * scale, 0.05 * scale, 8, 16);
            const rimMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.position.y = 0.4 * scale;
            rim.rotation.x = Math.PI / 2;
            basketGroup.add(rim);
            
            // Basket handle
            const handleGeometry = new THREE.TorusGeometry(0.4 * scale, 0.04 * scale, 8, 16, Math.PI);
            const handle = new THREE.Mesh(handleGeometry, rimMaterial);
            handle.position.y = 0.6 * scale;
            basketGroup.add(handle);
            
            // Grass/straw in basket
            const strawGeometry = new THREE.BoxGeometry(0.8 * scale, 0.15 * scale, 0.8 * scale);
            const strawMaterial = new THREE.MeshLambertMaterial({ color: 0x9ACD32 });
            const straw = new THREE.Mesh(strawGeometry, strawMaterial);
            straw.position.y = 0.35 * scale;
            basketGroup.add(straw);
            
            // Eggs in basket
            for (let i = 0; i < 5; i++) {
                const eggGeometry = new THREE.SphereGeometry(0.12 * scale, 8, 8);
                const eggMaterial = new THREE.MeshPhongMaterial({ 
                    color: basketEggColors[i],
                    shininess: 60
                });
                const egg = new THREE.Mesh(eggGeometry, eggMaterial);
                egg.scale.set(0.7, 1, 0.7);
                const angle = (i / 5) * Math.PI * 2;
                egg.position.set(
                    Math.cos(angle) * 0.25 * scale,
                    0.5 * scale,
                    Math.sin(angle) * 0.25 * scale
                );
                egg.rotation.x = Math.random() * 0.3;
                basketGroup.add(egg);
            }
            
            // Pink ribbon bow
            const ribbonGeometry = new THREE.SphereGeometry(0.1 * scale, 6, 6);
            const ribbonMaterial = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
            const bow = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
            bow.position.set(0, 0.6 * scale, 0.4 * scale);
            bow.scale.set(1.5, 0.5, 1);
            basketGroup.add(bow);
            
            const terrainHeight = getTerrainHeight(basketConfig.x, basketConfig.z);
            basketGroup.position.set(basketConfig.x, terrainHeight, basketConfig.z);
            G.scene.add(basketGroup);
            
            G.easterBaskets.push({ 
                mesh: basketGroup, 
                x: basketConfig.x, 
                z: basketConfig.z 
            });
        });
    }
    
    // Flower Patches - spring flower decorations
    G.flowerPatches = [];
    if (G.levelConfig.flowerPatches) {
        const flowerColors = [0xFF69B4, 0xFFFF00, 0xFF6347, 0xFFB6C1, 0xFFA500, 0x9370DB];
        G.levelConfig.flowerPatches.forEach(patchConfig => {
            const patchGroup = new THREE.Group();
            const radius = patchConfig.radius || 5;
            const flowerCount = Math.floor(radius * 3);
            
            for (let i = 0; i < flowerCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * radius;
                const flowerX = Math.cos(angle) * dist;
                const flowerZ = Math.sin(angle) * dist;
                
                const flowerGroup = new THREE.Group();
                
                // Stem
                const stemGeometry = new THREE.CylinderGeometry(0.02, 0.03, 0.3 + Math.random() * 0.2, 4);
                const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
                const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                stem.position.y = 0.15;
                flowerGroup.add(stem);
                
                // Flower head - petals
                const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                for (let p = 0; p < 5; p++) {
                    const petalGeometry = new THREE.SphereGeometry(0.08, 6, 6);
                    const petalMaterial = new THREE.MeshLambertMaterial({ color: flowerColor });
                    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                    const petalAngle = (p / 5) * Math.PI * 2;
                    petal.position.set(
                        Math.cos(petalAngle) * 0.08,
                        0.35,
                        Math.sin(petalAngle) * 0.08
                    );
                    petal.scale.set(1, 0.5, 1);
                    flowerGroup.add(petal);
                }
                
                // Yellow center
                const centerGeometry = new THREE.SphereGeometry(0.05, 6, 6);
                const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
                const center = new THREE.Mesh(centerGeometry, centerMaterial);
                center.position.y = 0.35;
                flowerGroup.add(center);
                
                flowerGroup.position.set(flowerX, 0, flowerZ);
                patchGroup.add(flowerGroup);
            }
            
            const terrainHeight = getTerrainHeight(patchConfig.x, patchConfig.z);
            patchGroup.position.set(patchConfig.x, terrainHeight, patchConfig.z);
            G.scene.add(patchGroup);
            
            G.flowerPatches.push({ 
                mesh: patchGroup, 
                x: patchConfig.x, 
                z: patchConfig.z, 
                radius: radius 
            });
        });
    }
    
    // Decorative Easter Eggs scattered around
    G.decorativeEggs = [];
    if (G.easterTheme) {
        const decorEggColors = [0xFF69B4, 0x98FB98, 0x87CEEB, 0xFFD700, 0xE6E6FA, 0xFFA500];
        // Generate random decorative eggs across the map
        for (let i = 0; i < 50; i++) {
            const eggGroup = new THREE.Group();
            const eggColor = decorEggColors[i % decorEggColors.length];
            
            // Egg shape
            const eggGeometry = new THREE.SphereGeometry(0.25, 8, 8);
            const eggMaterial = new THREE.MeshPhongMaterial({ 
                color: eggColor,
                shininess: 60
            });
            const egg = new THREE.Mesh(eggGeometry, eggMaterial);
            egg.scale.set(0.7, 1.0, 0.7);
            egg.position.y = 0.25;
            eggGroup.add(egg);
            
            // Random stripe
            if (Math.random() > 0.5) {
                const stripeGeometry = new THREE.TorusGeometry(0.18, 0.03, 6, 12);
                const stripeColor = decorEggColors[(i + 2) % decorEggColors.length];
                const stripeMaterial = new THREE.MeshLambertMaterial({ color: stripeColor });
                const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripe.position.y = 0.25;
                stripe.rotation.x = Math.PI / 2;
                stripe.scale.set(0.7, 1, 0.7);
                eggGroup.add(stripe);
            }
            
            // Random position across the map
            const eggX = (Math.random() - 0.5) * 180;
            const eggZ = 170 - Math.random() * 340; // From spawn to boss area
            
            const terrainHeight = getTerrainHeight(eggX, eggZ);
            eggGroup.position.set(eggX, terrainHeight, eggZ);
            G.scene.add(eggGroup);
            
            G.decorativeEggs.push({ 
                mesh: eggGroup, 
                x: eggX, 
                z: eggZ 
            });
        }
        
        // Add egg piles - clusters of eggs in nests
        const eggPilePositions = [
            { x: -60, z: 150 }, { x: 50, z: 120 }, { x: -40, z: 60 },
            { x: 70, z: 30 }, { x: -70, z: -20 }, { x: 30, z: -60 },
            { x: -50, z: -100 }, { x: 60, z: -130 }, { x: -30, z: -170 },
            { x: 80, z: 80 }, { x: -80, z: 100 }, { x: 40, z: 160 }
        ];
        
        eggPilePositions.forEach((pos, idx) => {
            const pileGroup = new THREE.Group();
            
            // Nest base - straw/grass circle
            const nestGeometry = new THREE.CylinderGeometry(1.5, 2, 0.4, 16);
            const nestMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 }); // Tan straw
            const nest = new THREE.Mesh(nestGeometry, nestMaterial);
            nest.position.y = 0.2;
            pileGroup.add(nest);
            
            // Straw rim
            const rimGeometry = new THREE.TorusGeometry(1.7, 0.2, 8, 16);
            const rim = new THREE.Mesh(rimGeometry, nestMaterial);
            rim.position.y = 0.35;
            rim.rotation.x = Math.PI / 2;
            pileGroup.add(rim);
            
            // 5-8 eggs per pile
            const numEggs = 5 + Math.floor(Math.random() * 4);
            for (let i = 0; i < numEggs; i++) {
                const eggGeometry = new THREE.SphereGeometry(0.35, 8, 8);
                const eggColor = decorEggColors[Math.floor(Math.random() * decorEggColors.length)];
                const eggMaterial = new THREE.MeshPhongMaterial({ 
                    color: eggColor,
                    shininess: 80
                });
                const egg = new THREE.Mesh(eggGeometry, eggMaterial);
                egg.scale.set(0.7, 1.0, 0.7);
                
                // Position eggs in pile
                const angle = (i / numEggs) * Math.PI * 2;
                const radius = 0.6 + Math.random() * 0.4;
                egg.position.set(
                    Math.cos(angle) * radius,
                    0.5 + Math.random() * 0.3,
                    Math.sin(angle) * radius
                );
                egg.rotation.z = (Math.random() - 0.5) * 0.3;
                pileGroup.add(egg);
            }
            
            const terrainHeight = getTerrainHeight(pos.x, pos.z);
            pileGroup.position.set(pos.x, terrainHeight, pos.z);
            G.scene.add(pileGroup);
        });
        
        // Add giant decorative Easter eggs
        const giantEggPositions = [
            { x: -90, z: 130 }, { x: 95, z: 145 }, { x: -85, z: -80 },
            { x: 90, z: -65 }, { x: 0, z: -140 }, { x: -100, z: 30 }
        ];
        
        giantEggPositions.forEach((pos, idx) => {
            const eggGroup = new THREE.Group();
            const eggColor = decorEggColors[idx % decorEggColors.length];
            
            // Giant egg shape
            const eggGeometry = new THREE.SphereGeometry(2.5, 16, 16);
            const eggMaterial = new THREE.MeshPhongMaterial({ 
                color: eggColor,
                shininess: 100,
                emissive: eggColor,
                emissiveIntensity: 0.1
            });
            const egg = new THREE.Mesh(eggGeometry, eggMaterial);
            egg.scale.set(0.7, 1.0, 0.7);
            egg.position.y = 2.5;
            eggGroup.add(egg);
            
            // Multiple decorative stripes
            for (let s = 0; s < 3; s++) {
                const stripeGeometry = new THREE.TorusGeometry(1.8 - s * 0.3, 0.15, 8, 24);
                const stripeColor = decorEggColors[(idx + s + 1) % decorEggColors.length];
                const stripeMaterial = new THREE.MeshPhongMaterial({ 
                    color: stripeColor,
                    shininess: 80
                });
                const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripe.position.y = 2.0 + s * 0.8;
                stripe.rotation.x = Math.PI / 2;
                stripe.scale.set(0.7, 1, 0.7);
                eggGroup.add(stripe);
            }
            
            // Star pattern on egg
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            for (let i = 0; i < 5; i++) {
                const starGeometry = new THREE.CircleGeometry(0.2, 5);
                const star = new THREE.Mesh(starGeometry, starMaterial);
                const angle = (i / 5) * Math.PI * 2;
                star.position.set(
                    Math.cos(angle) * 1.2,
                    2.5 + Math.sin(angle * 2) * 0.5,
                    Math.sin(angle) * 1.2 + 0.8
                );
                star.rotation.y = angle;
                eggGroup.add(star);
            }
            
            const terrainHeight = getTerrainHeight(pos.x, pos.z);
            eggGroup.position.set(pos.x, terrainHeight, pos.z);
            G.scene.add(eggGroup);
        });
        
        // Add Easter bunny statues
        const bunnyStatuePositions = [
            { x: -40, z: 180 }, { x: 40, z: 185 }, { x: 0, z: -200 }
        ];
        
        bunnyStatuePositions.forEach((pos) => {
            const statueGroup = new THREE.Group();
            const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0xD4C4B0 }); // Cream stone
            
            // Body
            const bodyGeometry = new THREE.SphereGeometry(1.5, 12, 12);
            const body = new THREE.Mesh(bodyGeometry, stoneMaterial);
            body.scale.y = 1.1;
            body.position.y = 2;
            statueGroup.add(body);
            
            // Head  
            const headGeometry = new THREE.SphereGeometry(1, 12, 12);
            const head = new THREE.Mesh(headGeometry, stoneMaterial);
            head.position.y = 4;
            statueGroup.add(head);
            
            // Ears
            for (let side = -1; side <= 1; side += 2) {
                const earGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
                const ear = new THREE.Mesh(earGeometry, stoneMaterial);
                ear.position.set(side * 0.5, 5.5, 0);
                ear.rotation.z = side * 0.15;
                statueGroup.add(ear);
            }
            
            // Pedestal
            const pedestalGeometry = new THREE.CylinderGeometry(1.8, 2, 1, 12);
            const pedestal = new THREE.Mesh(pedestalGeometry, stoneMaterial);
            pedestal.position.y = 0.5;
            statueGroup.add(pedestal);
            
            const terrainHeight = getTerrainHeight(pos.x, pos.z);
            statueGroup.position.set(pos.x, terrainHeight, pos.z);
            G.scene.add(statueGroup);
        });
    }
    
    // Christmas Decorations scattered around
    G.christmasDecorations = [];
    if (G.christmasTheme) {
        // Snowmen scattered around the map
        for (let i = 0; i < 15; i++) {
            const snowmanGroup = new THREE.Group();
            
            // Bottom snowball
            const bottomGeometry = new THREE.SphereGeometry(0.6, 12, 12);
            const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const bottom = new THREE.Mesh(bottomGeometry, snowMaterial);
            bottom.position.y = 0.6;
            bottom.castShadow = true;
            snowmanGroup.add(bottom);
            
            // Middle snowball
            const middleGeometry = new THREE.SphereGeometry(0.45, 10, 10);
            const middle = new THREE.Mesh(middleGeometry, snowMaterial);
            middle.position.y = 1.4;
            middle.castShadow = true;
            snowmanGroup.add(middle);
            
            // Top snowball (head)
            const headGeometry = new THREE.SphereGeometry(0.3, 10, 10);
            const head = new THREE.Mesh(headGeometry, snowMaterial);
            head.position.y = 2.05;
            head.castShadow = true;
            snowmanGroup.add(head);
            
            // Carrot nose
            const noseGeometry = new THREE.ConeGeometry(0.05, 0.25, 8);
            const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xff8800 });
            const nose = new THREE.Mesh(noseGeometry, noseMaterial);
            nose.position.set(0, 2.05, 0.3);
            nose.rotation.x = Math.PI / 2;
            snowmanGroup.add(nose);
            
            // Coal eyes
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            for (let side = -1; side <= 1; side += 2) {
                const eyeGeometry = new THREE.SphereGeometry(0.05, 6, 6);
                const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                eye.position.set(side * 0.1, 2.15, 0.25);
                snowmanGroup.add(eye);
            }
            
            // Coal buttons
            for (let b = 0; b < 3; b++) {
                const buttonGeometry = new THREE.SphereGeometry(0.06, 6, 6);
                const button = new THREE.Mesh(buttonGeometry, eyeMaterial);
                button.position.set(0, 1.6 - b * 0.2, 0.42);
                snowmanGroup.add(button);
            }
            
            // Random position
            const snowmanX = (Math.random() - 0.5) * 180;
            const snowmanZ = 170 - Math.random() * 340;
            
            const terrainHeight = getTerrainHeight(snowmanX, snowmanZ);
            snowmanGroup.position.set(snowmanX, terrainHeight, snowmanZ);
            G.scene.add(snowmanGroup);
            
            G.christmasDecorations.push({ 
                mesh: snowmanGroup, 
                type: 'snowman',
                x: snowmanX, 
                z: snowmanZ 
            });
        }
        
        // Candy canes scattered around
        for (let i = 0; i < 25; i++) {
            const candyCaneGroup = new THREE.Group();
            
            // Main cane stick
            const stickGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
            const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 60 });
            const stick = new THREE.Mesh(stickGeometry, whiteMaterial);
            stick.position.y = 0.75;
            stick.castShadow = true;
            candyCaneGroup.add(stick);
            
            // Red stripes
            for (let s = 0; s < 5; s++) {
                const stripeGeometry = new THREE.TorusGeometry(0.085, 0.03, 6, 12);
                const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 60 });
                const stripe = new THREE.Mesh(stripeGeometry, redMaterial);
                stripe.position.y = 0.2 + s * 0.3;
                stripe.rotation.x = Math.PI / 2;
                candyCaneGroup.add(stripe);
            }
            
            // Curved hook
            const hookGeometry = new THREE.TorusGeometry(0.25, 0.08, 8, 12, Math.PI);
            const hook = new THREE.Mesh(hookGeometry, whiteMaterial);
            hook.position.set(0.25, 1.5, 0);
            hook.rotation.z = Math.PI / 2;
            hook.castShadow = true;
            candyCaneGroup.add(hook);
            
            // Random position
            const caneX = (Math.random() - 0.5) * 180;
            const caneZ = 170 - Math.random() * 340;
            
            const terrainHeight = getTerrainHeight(caneX, caneZ);
            candyCaneGroup.position.set(caneX, terrainHeight, caneZ);
            G.scene.add(candyCaneGroup);
            
            G.christmasDecorations.push({ 
                mesh: candyCaneGroup, 
                type: 'candycane',
                x: caneX, 
                z: caneZ 
            });
        }
        
        // Decorated Christmas trees (smaller ornamental ones)
        for (let i = 0; i < 18; i++) {
            const treeGroup = new THREE.Group();
            
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.5, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 0.25;
            trunk.castShadow = true;
            treeGroup.add(trunk);
            
            // Pine layers
            const pineGreen = 0x1e5631;
            const pineMaterial = new THREE.MeshLambertMaterial({ color: pineGreen });
            for (let layer = 0; layer < 3; layer++) {
                const layerRadius = 0.8 - layer * 0.2;
                const layerGeometry = new THREE.ConeGeometry(layerRadius, 1.0, 8);
                const layerMesh = new THREE.Mesh(layerGeometry, pineMaterial);
                layerMesh.position.y = 0.5 + layer * 0.7;
                layerMesh.castShadow = true;
                treeGroup.add(layerMesh);
            }
            
            // Ornaments - colorful baubles
            const ornamentColors = [0xff0000, 0xffd700, 0x0000ff, 0xff00ff];
            for (let o = 0; o < 6; o++) {
                const ornamentGeometry = new THREE.SphereGeometry(0.08, 6, 6);
                const ornamentColor = ornamentColors[o % ornamentColors.length];
                const ornamentMaterial = new THREE.MeshPhongMaterial({ 
                    color: ornamentColor,
                    shininess: 100
                });
                const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
                const angle = (o / 6) * Math.PI * 2;
                const radius = 0.4 - (o % 3) * 0.1;
                const height = 1.0 + (o % 3) * 0.6;
                ornament.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );
                treeGroup.add(ornament);
            }
            
            // Star on top
            const starGeometry = new THREE.SphereGeometry(0.12, 5, 5);
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.y = 2.6;
            treeGroup.add(star);
            
            // Random position
            const christmasTreeX = (Math.random() - 0.5) * 150;
            const christmasTreeZ = 150 - Math.random() * 300;
            
            const terrainHeight = getTerrainHeight(christmasTreeX, christmasTreeZ);
            treeGroup.position.set(christmasTreeX, terrainHeight, christmasTreeZ);
            G.scene.add(treeGroup);
            
            G.christmasDecorations.push({ 
                mesh: treeGroup, 
                type: 'christmas-tree',
                x: christmasTreeX, 
                z: christmasTreeZ 
            });
        }
        
        // Lampposts with light
        for (let i = 0; i < 12; i++) {
            const lamppostGroup = new THREE.Group();
            
            // Post
            const postGeometry = new THREE.CylinderGeometry(0.08, 0.1, 3.5, 8);
            const postMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.y = 1.75;
            post.castShadow = true;
            lamppostGroup.add(post);
            
            // Lamp housing
            const lampGeometry = new THREE.CylinderGeometry(0.35, 0.25, 0.6, 8);
            const lampMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
            lamp.position.y = 3.7;
            lamp.castShadow = true;
            lamppostGroup.add(lamp);
            
            // Glowing light
            const lightGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xffffaa,
                transparent: true,
                opacity: 0.9
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.y = 3.7;
            lamppostGroup.add(light);
            
            // Random position
            const lampX = (Math.random() - 0.5) * 160;
            const lampZ = 160 - Math.random() * 320;
            
            const terrainHeight = getTerrainHeight(lampX, lampZ);
            lamppostGroup.position.set(lampX, terrainHeight, lampZ);
            G.scene.add(lamppostGroup);
            
            G.christmasDecorations.push({ 
                mesh: lamppostGroup, 
                type: 'lamppost',
                x: lampX, 
                z: lampZ 
            });
        }
        
        // Wreaths on the ground
        for (let i = 0; i < 4; i++) {
            const wreathGroup = new THREE.Group();
            
            // Wreath ring
            const wreathGeometry = new THREE.TorusGeometry(0.5, 0.15, 12, 16);
            const wreathMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
            const wreath = new THREE.Mesh(wreathGeometry, wreathMaterial);
            wreath.rotation.x = Math.PI / 2;
            wreath.position.y = 0.15;
            wreath.castShadow = true;
            wreathGroup.add(wreath);
            
            // Red bow
            const bowGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.1);
            const bowMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            const bow = new THREE.Mesh(bowGeometry, bowMaterial);
            bow.position.set(0, 0.15, 0.5);
            wreathGroup.add(bow);
            
            // Berries
            const berryMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            for (let b = 0; b < 6; b++) {
                const berryGeometry = new THREE.SphereGeometry(0.05, 6, 6);
                const berry = new THREE.Mesh(berryGeometry, berryMaterial);
                const angle = (b / 6) * Math.PI * 2;
                berry.position.set(
                    Math.cos(angle) * 0.45,
                    0.15,
                    Math.sin(angle) * 0.45
                );
                wreathGroup.add(berry);
            }
            
            // Random position
            const wreathX = (Math.random() - 0.5) * 140;
            const wreathZ = 140 - Math.random() * 280;
            
            const terrainHeight = getTerrainHeight(wreathX, wreathZ);
            wreathGroup.position.set(wreathX, terrainHeight, wreathZ);
            G.scene.add(wreathGroup);
            
            G.christmasDecorations.push({ 
                mesh: wreathGroup, 
                type: 'wreath',
                x: wreathX, 
                z: wreathZ 
            });
        }
        
        // Gingerbread houses
        for (let i = 0; i < 2; i++) {
            const houseGroup = new THREE.Group();
            
            // House walls
            const wallGeometry = new THREE.BoxGeometry(3, 2, 2.5);
            const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const walls = new THREE.Mesh(wallGeometry, wallMaterial);
            walls.position.y = 1;
            walls.castShadow = true;
            houseGroup.add(walls);
            
            // Roof
            const roofGeometry = new THREE.ConeGeometry(2.2, 1.5, 4);
            const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = 2.75;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            houseGroup.add(roof);
            
            // Door
            const doorGeometry = new THREE.BoxGeometry(0.6, 1, 0.1);
            const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(0, 0.5, 1.3);
            houseGroup.add(door);
            
            // Windows
            const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa });
            for (let side = -1; side <= 1; side += 2) {
                const windowGeometry = new THREE.PlaneGeometry(0.4, 0.4);
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.set(side * 0.8, 1.2, 1.26);
                houseGroup.add(window);
            }
            
            // Candy decorations on walls
            for (let c = 0; c < 8; c++) {
                const candyGeometry = new THREE.SphereGeometry(0.08, 6, 6);
                const candyColors = [0xff0000, 0x00ff00, 0xffffff];
                const candyColor = candyColors[c % candyColors.length];
                const candyMaterial = new THREE.MeshBasicMaterial({ color: candyColor });
                const candy = new THREE.Mesh(candyGeometry, candyMaterial);
                candy.position.set(
                    (Math.random() - 0.5) * 2.5,
                    0.5 + Math.random() * 1.5,
                    1.3
                );
                houseGroup.add(candy);
            }
            
            // Random position
            const houseX = (i === 0 ? -1 : 1) * (80 + Math.random() * 30);
            const houseZ = 100 - Math.random() * 200;
            
            const terrainHeight = getTerrainHeight(houseX, houseZ);
            houseGroup.position.set(houseX, terrainHeight, houseZ);
            G.scene.add(houseGroup);
            
            G.christmasDecorations.push({ 
                mesh: houseGroup, 
                type: 'gingerbread-house',
                x: houseX, 
                z: houseZ 
            });
        }
        
        // LOTS of tall pine trees scattered around the snowy landscape
        for (let i = 0; i < 35; i++) {
            const pineGroup = new THREE.Group();
            const treeScale = 1.5 + Math.random() * 2.5; // Varied sizes
            
            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.15 * treeScale, 0.25 * treeScale, 1.2 * treeScale, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x3d2914 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 0.6 * treeScale;
            trunk.castShadow = true;
            pineGroup.add(trunk);
            
            // Multiple layers of pine branches
            const pineGreen = 0x1e5631;
            const pineMaterial = new THREE.MeshLambertMaterial({ color: pineGreen });
            for (let layer = 0; layer < 4; layer++) {
                const layerRadius = (1.0 - layer * 0.2) * treeScale;
                const layerHeight = 1.2 * treeScale;
                const layerGeometry = new THREE.ConeGeometry(layerRadius, layerHeight, 8);
                const layerMesh = new THREE.Mesh(layerGeometry, pineMaterial);
                layerMesh.position.y = (1.2 + layer * 0.9) * treeScale;
                layerMesh.castShadow = true;
                pineGroup.add(layerMesh);
            }
            
            // Snow on branches
            const snowCapMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            for (let layer = 0; layer < 3; layer++) {
                const snowRadius = (0.6 - layer * 0.15) * treeScale;
                const snowGeometry = new THREE.ConeGeometry(snowRadius, 0.2 * treeScale, 8);
                const snow = new THREE.Mesh(snowGeometry, snowCapMaterial);
                snow.position.y = (1.8 + layer * 0.9) * treeScale;
                pineGroup.add(snow);
            }
            
            // Random position - spread across entire map
            const pineX = (Math.random() - 0.5) * 200;
            const pineZ = 190 - Math.random() * 420;
            
            const terrainHeight = getTerrainHeight(pineX, pineZ);
            pineGroup.position.set(pineX, terrainHeight, pineZ);
            G.scene.add(pineGroup);
            
            G.christmasDecorations.push({ 
                mesh: pineGroup, 
                type: 'pine-tree',
                x: pineX, 
                z: pineZ 
            });
        }
        
        // Natural snow drifts (Schneewehen) scattered everywhere
        for (let i = 0; i < 50; i++) {
            const driftGroup = new THREE.Group();
            const driftScale = 1 + Math.random() * 2;
            
            // Main drift body - elongated sphere
            const driftGeometry = new THREE.SphereGeometry(1, 10, 8);
            const driftMaterial = new THREE.MeshLambertMaterial({ color: 0xFAFAFA });
            const drift = new THREE.Mesh(driftGeometry, driftMaterial);
            drift.scale.set(driftScale * 1.5, driftScale * 0.4, driftScale);
            drift.position.y = driftScale * 0.2;
            drift.rotation.y = Math.random() * Math.PI;
            drift.castShadow = true;
            drift.receiveShadow = true;
            driftGroup.add(drift);
            
            // Additional smaller mounds for natural look
            for (let m = 0; m < 2; m++) {
                const moundGeometry = new THREE.SphereGeometry(0.6, 8, 6);
                const mound = new THREE.Mesh(moundGeometry, driftMaterial);
                const offset = (Math.random() - 0.5) * driftScale;
                mound.scale.set(driftScale * 0.8, driftScale * 0.3, driftScale * 0.6);
                mound.position.set(offset, driftScale * 0.15, (Math.random() - 0.5) * driftScale * 0.5);
                mound.receiveShadow = true;
                driftGroup.add(mound);
            }
            
            // Random position
            const driftX = (Math.random() - 0.5) * 200;
            const driftZ = 190 - Math.random() * 420;
            
            const terrainHeight = getTerrainHeight(driftX, driftZ);
            driftGroup.position.set(driftX, terrainHeight, driftZ);
            G.scene.add(driftGroup);
            
            G.christmasDecorations.push({ 
                mesh: driftGroup, 
                type: 'snowdrift',
                x: driftX, 
                z: driftZ 
            });
        }
        
        // Christmas Present Pickups (good presents that spawn items)
        G.christmasPresents = [];
        for (let i = 0; i < 12; i++) {
            const presentGroup = new THREE.Group();
            
            // Present box
            const wrapColors = [0xFF0000, 0x00AA00, 0x0066FF, 0xFFD700, 0xFF00FF, 0x00FFFF];
            const wrapColor = wrapColors[Math.floor(Math.random() * wrapColors.length)];
            const boxSize = 1.5 + Math.random() * 0.5;
            
            const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
            const boxMaterial = new THREE.MeshLambertMaterial({ color: wrapColor });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.y = boxSize / 2;
            box.castShadow = true;
            presentGroup.add(box);
            
            // Golden ribbon
            const ribbonMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFD700,
                emissive: 0xFFAA00,
                emissiveIntensity: 0.3
            });
            const ribbonH = new THREE.Mesh(
                new THREE.BoxGeometry(boxSize + 0.05, 0.08, 0.12),
                ribbonMaterial
            );
            ribbonH.position.y = boxSize / 2;
            presentGroup.add(ribbonH);
            
            const ribbonV = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.08, boxSize + 0.05),
                ribbonMaterial
            );
            ribbonV.position.y = boxSize / 2;
            presentGroup.add(ribbonV);
            
            // Bow on top
            const bowGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const bow = new THREE.Mesh(bowGeometry, ribbonMaterial);
            bow.position.y = boxSize + 0.1;
            bow.scale.set(1.5, 0.7, 1.5);
            presentGroup.add(bow);
            
            // Sparkle glow effect
            const glowGeometry = new THREE.SphereGeometry(boxSize * 0.8, 8, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFAA, 
                transparent: true, 
                opacity: 0.2 
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.y = boxSize / 2;
            presentGroup.add(glow);
            
            // Random position
            const presentX = (Math.random() - 0.5) * 180;
            const presentZ = 170 - Math.random() * 360;
            
            const terrainHeight = getTerrainHeight(presentX, presentZ);
            presentGroup.position.set(presentX, terrainHeight, presentZ);
            G.scene.add(presentGroup);
            
            // Determine reward type
            const rewards = ['ammo', 'health', 'bomb', 'banana', 'herzman'];
            const rewardType = rewards[Math.floor(Math.random() * rewards.length)];
            
            G.christmasPresents.push({ 
                mesh: presentGroup, 
                collected: false, 
                radius: 1.5,
                x: presentX,
                z: presentZ,
                rewardType: rewardType
            });
        }
        
        // Decoy Presents (evil exploding presents - look identical to good presents!)
        G.decoyPresents = [];
        for (let i = 0; i < 8; i++) {
            const decoyGroup = new THREE.Group();
            
            // Same colors as good presents - indistinguishable!
            const wrapColors = [0xFF0000, 0x00AA00, 0x0066FF, 0xFFD700, 0xFF00FF, 0x00FFFF];
            const wrapColor = wrapColors[Math.floor(Math.random() * wrapColors.length)];
            const boxSize = 1.5 + Math.random() * 0.5;
            
            const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
            const boxMaterial = new THREE.MeshLambertMaterial({ color: wrapColor });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.y = boxSize / 2;
            box.castShadow = true;
            decoyGroup.add(box);
            
            // Golden ribbon (same as good presents)
            const ribbonMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFD700,
                emissive: 0xFFAA00,
                emissiveIntensity: 0.3
            });
            const ribbonH = new THREE.Mesh(
                new THREE.BoxGeometry(boxSize + 0.05, 0.08, 0.12),
                ribbonMaterial
            );
            ribbonH.position.y = boxSize / 2;
            decoyGroup.add(ribbonH);
            
            const ribbonV = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.08, boxSize + 0.05),
                ribbonMaterial
            );
            ribbonV.position.y = boxSize / 2;
            decoyGroup.add(ribbonV);
            
            // Bow on top (same as good presents)
            const bowGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const bow = new THREE.Mesh(bowGeometry, ribbonMaterial);
            bow.position.y = boxSize + 0.1;
            bow.scale.set(1.5, 0.7, 1.5);
            decoyGroup.add(bow);
            
            // Sparkle glow effect (same as good presents)
            const glowGeometry = new THREE.SphereGeometry(boxSize * 0.8, 8, 8);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFAA, 
                transparent: true, 
                opacity: 0.2 
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.y = boxSize / 2;
            decoyGroup.add(glow);
            
            // Random position
            const decoyX = (Math.random() - 0.5) * 180;
            const decoyZ = 170 - Math.random() * 360;
            
            const terrainHeight = getTerrainHeight(decoyX, decoyZ);
            decoyGroup.position.set(decoyX, terrainHeight, decoyZ);
            G.scene.add(decoyGroup);
            
            G.decoyPresents.push({ 
                mesh: decoyGroup, 
                collected: false, 
                radius: 1.5,
                x: decoyX,
                z: decoyZ,
                explosionDamage: 1
            });
        }
    }

    // Rocks - use level config if available, otherwise use default positions
    G.rocks = [];
    G.rockPositions = G.levelConfig.rockPositions || [
        { x: -8, z: 8 }, { x: -3, z: 7 }, { x: 5, z: 8 }, { x: 10, z: 7 },
        { x: -20, z: 25 }, { x: 15, z: 30 }, { x: -10, z: 35 },
        { x: -18, z: 5 }, { x: 22, z: 10 }, { x: -25, z: -5 }, { x: 30, z: -2 }
    ];

    G.rockPositions.forEach(pos => {
        let rockMesh;
        
        if (G.computerTheme) {
            // Data crystal / corrupted data block
            const crystalGroup = new THREE.Group();
            const crystalColors = [0x00FFFF, 0xFF00FF, 0x00FF00, 0xFFFF00];
            const mainColor = crystalColors[Math.floor(Math.random() * crystalColors.length)];
            
            // Main crystal - elongated octahedron
            const crystalGeometry = new THREE.OctahedronGeometry(0.5, 0);
            const crystalMaterial = new THREE.MeshBasicMaterial({ 
                color: mainColor,
                transparent: true,
                opacity: 0.85
            });
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.scale.y = 1.5;
            crystal.rotation.y = Math.random() * Math.PI;
            crystalGroup.add(crystal);
            
            // Wireframe shell
            const wireGeometry = new THREE.OctahedronGeometry(0.55, 0);
            const wireMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFFF,
                wireframe: true,
                transparent: true,
                opacity: 0.5
            });
            const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
            wireframe.scale.y = 1.5;
            wireframe.rotation.y = crystal.rotation.y;
            crystalGroup.add(wireframe);
            
            // Smaller orbiting data fragments
            for (let i = 0; i < 3; i++) {
                const fragGeometry = new THREE.OctahedronGeometry(0.15, 0);
                const fragMaterial = new THREE.MeshBasicMaterial({ 
                    color: crystalColors[(Math.floor(Math.random() * crystalColors.length))],
                    transparent: true,
                    opacity: 0.7
                });
                const frag = new THREE.Mesh(fragGeometry, fragMaterial);
                const angle = (i / 3) * Math.PI * 2;
                frag.position.set(Math.cos(angle) * 0.8, 0.3 + i * 0.3, Math.sin(angle) * 0.8);
                crystalGroup.add(frag);
            }
            
            const terrainHeight = getTerrainHeight(pos.x, pos.z);
            crystalGroup.position.set(pos.x, terrainHeight + 0.8, pos.z);
            G.scene.add(crystalGroup);
            rockMesh = crystalGroup;
        } else {
            const rockGeometry = new THREE.DodecahedronGeometry(0.6, 0);
            // Theme-appropriate rock colors
            let rockColor;
            if (G.christmasTheme) {
                // Snowrocks - white/gray icy rocks
                rockColor = 0xd3d3d3; // Light gray
            } else if (G.candyTheme) {
                // Candy rocks - colorful like hard candy
                const candyRockColors = [0xFF69B4, 0x87CEEB, 0xFFD700, 0x98FB98, 0xFF6347, 0xDDA0DD];
                rockColor = candyRockColors[Math.floor(Math.random() * candyRockColors.length)];
            } else if (G.desertTheme) {
                rockColor = 0xa08060; // Sandstone
            } else {
                rockColor = 0x808080; // Gray
            }
            const rockMaterial = new THREE.MeshPhongMaterial({ 
                color: rockColor,
                shininess: G.candyTheme ? 80 : 10
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            const terrainHeight = getTerrainHeight(pos.x, pos.z);
            rock.position.set(pos.x, terrainHeight + 0.6, pos.z);
            rock.castShadow = true;
            rock.receiveShadow = true;
            G.scene.add(rock);
            rockMesh = rock;
        }
        G.rocks.push({ mesh: rockMesh, type: 'rock', radius: 0.8 });
    });
    
    // Boulders - large rocks for desert level
    G.boulders = [];
    G.boulderPositions = G.levelConfig.boulderPositions || [];
    
    G.boulderPositions.forEach(pos => {
        const boulderGroup = new THREE.Group();
        
        // Main boulder - large irregular rock
        const mainBoulderGeometry = new THREE.DodecahedronGeometry(2.5, 1);
        const boulderColor = 0xb08050; // Sandy brown
        const boulderMaterial = new THREE.MeshLambertMaterial({ color: boulderColor });
        const mainBoulder = new THREE.Mesh(mainBoulderGeometry, boulderMaterial);
        mainBoulder.scale.set(1, 0.7, 1.2); // Flatten and stretch
        mainBoulder.rotation.y = Math.random() * Math.PI;
        mainBoulder.castShadow = true;
        mainBoulder.receiveShadow = true;
        boulderGroup.add(mainBoulder);
        
        // Smaller rocks around base
        for (let i = 0; i < 4; i++) {
            const smallRockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.3, 0);
            const smallRock = new THREE.Mesh(smallRockGeometry, boulderMaterial);
            const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.5;
            smallRock.position.set(
                Math.cos(angle) * 2,
                0,
                Math.sin(angle) * 2
            );
            smallRock.rotation.set(Math.random(), Math.random(), Math.random());
            smallRock.castShadow = true;
            boulderGroup.add(smallRock);
        }
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        boulderGroup.position.set(pos.x, terrainHeight + 1.5, pos.z);
        G.scene.add(boulderGroup);
        G.boulders.push({ mesh: boulderGroup, type: 'boulder', radius: 3.0 });
    });

    // Pyramids for desert atmosphere
    G.pyramidPositions = G.levelConfig.pyramids || [];
    G.pyramidPositions.forEach(pyramid => {
        const pyramidGroup = new THREE.Group();
        
        // Generate sandy stone texture for pyramids
        const pyramidCanvas = document.createElement('canvas');
        pyramidCanvas.width = 128;
        pyramidCanvas.height = 128;
        const pyramidCtx = pyramidCanvas.getContext('2d');
        
        // Base sandstone color
        pyramidCtx.fillStyle = '#d4a84b';
        pyramidCtx.fillRect(0, 0, 128, 128);
        
        // Add stone block pattern
        pyramidCtx.strokeStyle = 'rgba(100, 70, 30, 0.4)';
        pyramidCtx.lineWidth = 2;
        for (let y = 0; y < 128; y += 16) {
            pyramidCtx.beginPath();
            pyramidCtx.moveTo(0, y);
            pyramidCtx.lineTo(128, y);
            pyramidCtx.stroke();
        }
        for (let x = 0; x < 128; x += 24) {
            for (let y = 0; y < 128; y += 16) {
                const offsetX = (Math.floor(y / 16) % 2) * 12;
                pyramidCtx.beginPath();
                pyramidCtx.moveTo(x + offsetX, y);
                pyramidCtx.lineTo(x + offsetX, y + 16);
                pyramidCtx.stroke();
            }
        }
        
        // Add weathering and variation
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const size = 3 + Math.random() * 8;
            pyramidCtx.fillStyle = `rgba(${100 + Math.random() * 50}, ${70 + Math.random() * 40}, ${30 + Math.random() * 30}, 0.3)`;
            pyramidCtx.beginPath();
            pyramidCtx.arc(x, y, size, 0, Math.PI * 2);
            pyramidCtx.fill();
        }
        
        const pyramidTexture = new THREE.CanvasTexture(pyramidCanvas);
        pyramidTexture.wrapS = THREE.RepeatWrapping;
        pyramidTexture.wrapT = THREE.RepeatWrapping;
        
        const size = pyramid.size || 20;
        const height = pyramid.height || 30;
        
        // Main pyramid body
        const pyramidGeometry = new THREE.ConeGeometry(size * 0.7, height, 4);
        const pyramidMaterial = new THREE.MeshLambertMaterial({ 
            map: pyramidTexture,
            color: 0xd4a84b
        });
        const pyramidMesh = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        pyramidMesh.rotation.y = Math.PI / 4; // Rotate so sides face cardinal directions
        pyramidMesh.position.y = height / 2;
        pyramidMesh.castShadow = true;
        pyramidMesh.receiveShadow = true;
        pyramidGroup.add(pyramidMesh);
        
        // Add some fallen stones at base
        for (let i = 0; i < 8; i++) {
            const stoneGeometry = new THREE.DodecahedronGeometry(1 + Math.random() * 2, 0);
            const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0xc49a3b });
            const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
            const dist = size * 0.7 + Math.random() * 3;
            stone.position.set(Math.cos(angle) * dist, 0.5, Math.sin(angle) * dist);
            stone.rotation.set(Math.random(), Math.random(), Math.random());
            stone.castShadow = true;
            pyramidGroup.add(stone);
        }
        
        const terrainHeight = getTerrainHeight(pyramid.x, pyramid.z);
        pyramidGroup.position.set(pyramid.x, terrainHeight, pyramid.z);
        G.scene.add(pyramidGroup);
    });

    // Scarab and canyon wall tracking
    G.scarabPickups = [];
    G.canyonWalls = [];
    G.scarabsCollected = 0;
    G.totalScarabs = 0;

    // Candy pickup tracking (for candy theme dragon drops)
    G.candyPickups = [];
    G.candyCollected = 0;
    G.totalCandy = 0;
    
    // Calculate expected total candy for candy theme levels (from dragon kills)
    if (G.candyTheme) {
        const dragonCount = 1 + (G.levelConfig.extraDragons ? G.levelConfig.extraDragons.length : 0);
        // Each dragon drops ~10 candies (8-12 range), use 10 as expected average
        G.totalCandy = dragonCount * 10;
    }

    // Canyon walls - create impassable rock walls for chokepoints
    G.canyonWallPositions = G.levelConfig.canyonWalls || [];
    G.canyonWallPositions.forEach(wall => {
        const wallGroup = new THREE.Group();
        
        // Main wall - rocky cliff face
        const wallWidth = wall.width || 40;
        const wallDepth = wall.depth || 8;
        const wallHeight = wall.height || 12;
        
        // Generate a procedural texture for canyon walls
        const rockCanvas = document.createElement('canvas');
        rockCanvas.width = 128;
        rockCanvas.height = 128;
        const rockCtx = rockCanvas.getContext('2d');
        
        if (G.candyTheme) {
            // Candy theme - striped candy cane / wafer cookie wall
            const candyColors = ['#FF69B4', '#FFB6C1', '#FF1493', '#FFFFFF', '#87CEEB', '#DDA0DD'];
            const stripeHeight = 12;
            for (let y = 0; y < 128; y += stripeHeight) {
                const colorIndex = Math.floor(y / stripeHeight) % candyColors.length;
                rockCtx.fillStyle = candyColors[colorIndex];
                rockCtx.fillRect(0, y, 128, stripeHeight);
            }
            
            // Add wafer texture pattern
            rockCtx.strokeStyle = 'rgba(255, 200, 200, 0.5)';
            rockCtx.lineWidth = 1;
            for (let i = 0; i < 16; i++) {
                rockCtx.beginPath();
                rockCtx.moveTo(i * 8, 0);
                rockCtx.lineTo(i * 8, 128);
                rockCtx.stroke();
            }
            
            // Add sprinkles
            for (let i = 0; i < 40; i++) {
                const sprinkleColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
                rockCtx.fillStyle = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
                const x = Math.random() * 128;
                const y = Math.random() * 128;
                rockCtx.fillRect(x, y, 3, 1);
            }
        } else if (G.graveyardTheme) {
            // Graveyard theme - dark weathered brick wall texture
            rockCtx.fillStyle = '#2a2520';
            rockCtx.fillRect(0, 0, 128, 128);
            
            // Draw brick pattern
            const brickHeight = 8;
            const brickWidth = 20;
            for (let row = 0; row < 16; row++) {
                const offset = (row % 2) * (brickWidth / 2);
                for (let col = -1; col < 8; col++) {
                    const x = col * brickWidth + offset;
                    const y = row * brickHeight;
                    // Randomize brick color (dark grays/browns)
                    const shade = 0.7 + Math.random() * 0.3;
                    const r = Math.floor(50 * shade);
                    const g = Math.floor(45 * shade);
                    const b = Math.floor(40 * shade);
                    rockCtx.fillStyle = `rgb(${r},${g},${b})`;
                    rockCtx.fillRect(x + 1, y + 1, brickWidth - 2, brickHeight - 2);
                }
            }
            
            // Mortar lines
            rockCtx.strokeStyle = '#1a1515';
            rockCtx.lineWidth = 1;
            for (let row = 0; row <= 16; row++) {
                rockCtx.beginPath();
                rockCtx.moveTo(0, row * brickHeight);
                rockCtx.lineTo(128, row * brickHeight);
                rockCtx.stroke();
            }
            
            // Add weathering and moss
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * 128;
                const y = Math.random() * 128;
                rockCtx.fillStyle = `rgba(20, 40, 20, ${0.2 + Math.random() * 0.3})`;
                rockCtx.beginPath();
                rockCtx.arc(x, y, 3 + Math.random() * 5, 0, Math.PI * 2);
                rockCtx.fill();
            }
        } else if (G.ruinsTheme) {
            // Ruins theme - warm cream/sandstone block wall texture (lighter, friendly)
            rockCtx.fillStyle = '#C8BEA8';
            rockCtx.fillRect(0, 0, 128, 128);
            
            // Draw irregular stone block pattern
            const blockHeight = 16;
            const blockWidth = 24;
            for (let row = 0; row < 8; row++) {
                const offset = (row % 2) * (blockWidth / 2);
                for (let col = -1; col < 6; col++) {
                    const x = col * blockWidth + offset + (Math.random() - 0.5) * 4;
                    const y = row * blockHeight + (Math.random() - 0.5) * 2;
                    // Randomize stone color (warm cream/sandstone)
                    const shade = 0.85 + Math.random() * 0.15;
                    const r = Math.floor(195 * shade);
                    const g = Math.floor(185 * shade);
                    const b = Math.floor(165 * shade);
                    rockCtx.fillStyle = `rgb(${r},${g},${b})`;
                    rockCtx.fillRect(x + 2, y + 2, blockWidth - 4 + Math.random() * 4, blockHeight - 4);
                }
            }
            
            // Mortar lines (irregular, aged but visible)
            rockCtx.strokeStyle = '#7A7268';
            rockCtx.lineWidth = 2;
            for (let row = 0; row <= 8; row++) {
                rockCtx.beginPath();
                rockCtx.moveTo(0, row * blockHeight + (Math.random() - 0.5) * 3);
                for (let x = 0; x <= 128; x += 10) {
                    rockCtx.lineTo(x, row * blockHeight + (Math.random() - 0.5) * 3);
                }
                rockCtx.stroke();
            }
            
            // Add subtle weathering (lighter)
            rockCtx.strokeStyle = 'rgba(100, 90, 80, 0.3)';
            rockCtx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                rockCtx.beginPath();
                rockCtx.moveTo(Math.random() * 128, Math.random() * 128);
                rockCtx.lineTo(Math.random() * 128, Math.random() * 128);
                rockCtx.stroke();
            }
            
            // Add moss/ivy patches (friendly green)
            for (let i = 0; i < 12; i++) {
                const x = Math.random() * 128;
                const y = Math.random() * 128;
                rockCtx.fillStyle = `rgba(80, 130, 70, ${0.15 + Math.random() * 0.2})`;
                rockCtx.beginPath();
                rockCtx.arc(x, y, 4 + Math.random() * 8, 0, Math.PI * 2);
                rockCtx.fill();
            }
        } else {
            // Base sandy rock color
            rockCtx.fillStyle = '#a08060';
            rockCtx.fillRect(0, 0, 128, 128);
            
            // Add layered striations (like real canyon walls)
            for (let y = 0; y < 128; y += 4) {
                const shade = 0.85 + Math.random() * 0.3;
                const r = Math.floor(160 * shade);
                const g = Math.floor(128 * shade);
                const b = Math.floor(96 * shade);
                rockCtx.fillStyle = `rgb(${r},${g},${b})`;
                rockCtx.fillRect(0, y, 128, 2 + Math.random() * 3);
            }
            
            // Add cracks and texture
            rockCtx.strokeStyle = 'rgba(80, 60, 40, 0.4)';
            rockCtx.lineWidth = 1;
            for (let i = 0; i < 15; i++) {
                rockCtx.beginPath();
                rockCtx.moveTo(Math.random() * 128, Math.random() * 128);
                rockCtx.lineTo(Math.random() * 128, Math.random() * 128);
                rockCtx.stroke();
            }
            
            // Add some darker spots
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * 128;
                const y = Math.random() * 128;
                const size = 2 + Math.random() * 6;
                rockCtx.fillStyle = `rgba(80, 60, 40, ${0.2 + Math.random() * 0.3})`;
                rockCtx.beginPath();
                rockCtx.arc(x, y, size, 0, Math.PI * 2);
                rockCtx.fill();
            }
        }
        
        const rockTexture = new THREE.CanvasTexture(rockCanvas);
        rockTexture.wrapS = THREE.RepeatWrapping;
        rockTexture.wrapT = THREE.RepeatWrapping;
        rockTexture.repeat.set(2, 2);
        
        // Create wall segments
        const segmentCount = Math.floor(wallWidth / 3);
        
        if (G.graveyardTheme) {
            // Graveyard - solid brick wall with iron fence on top
            // Main brick wall body
            const mainWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight * 0.7, wallDepth);
            const mainWallMaterial = new THREE.MeshLambertMaterial({
                map: rockTexture,
                color: 0x3a3530
            });
            const mainWall = new THREE.Mesh(mainWallGeometry, mainWallMaterial);
            mainWall.position.y = wallHeight * 0.35;
            mainWall.castShadow = true;
            mainWall.receiveShadow = true;
            wallGroup.add(mainWall);
            
            // Iron fence on top
            const fenceSpacing = 1.5;
            const fenceCount = Math.floor(wallWidth / fenceSpacing);
            for (let f = 0; f < fenceCount; f++) {
                // Vertical bar
                const barGeometry = new THREE.CylinderGeometry(0.08, 0.08, wallHeight * 0.4, 6);
                const barMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
                const bar = new THREE.Mesh(barGeometry, barMaterial);
                bar.position.set(
                    (f - fenceCount / 2) * fenceSpacing,
                    wallHeight * 0.7 + wallHeight * 0.2,
                    0
                );
                bar.castShadow = true;
                wallGroup.add(bar);
                
                // Spear point on top
                const pointGeometry = new THREE.ConeGeometry(0.12, 0.3, 6);
                const pointMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
                const point = new THREE.Mesh(pointGeometry, pointMaterial);
                point.position.set(
                    (f - fenceCount / 2) * fenceSpacing,
                    wallHeight * 0.7 + wallHeight * 0.4 + 0.15,
                    0
                );
                wallGroup.add(point);
            }
            
            // Horizontal fence rails
            const railGeometry = new THREE.BoxGeometry(wallWidth, 0.1, 0.1);
            const railMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const topRail = new THREE.Mesh(railGeometry, railMaterial);
            topRail.position.y = wallHeight * 0.7 + wallHeight * 0.35;
            wallGroup.add(topRail);
            const bottomRail = new THREE.Mesh(railGeometry.clone(), railMaterial);
            bottomRail.position.y = wallHeight * 0.7 + wallHeight * 0.1;
            wallGroup.add(bottomRail);
        } else if (G.ruinsTheme) {
            // Ruins - detailed warm sandstone castle walls
            // Main stone wall body
            const mainWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight * 0.75, wallDepth);
            const mainWallMaterial = new THREE.MeshLambertMaterial({
                map: rockTexture,
                color: 0xC8BEA8  // Light warm sandstone
            });
            const mainWall = new THREE.Mesh(mainWallGeometry, mainWallMaterial);
            mainWall.position.y = wallHeight * 0.375;
            mainWall.castShadow = true;
            mainWall.receiveShadow = true;
            wallGroup.add(mainWall);
            
            // Stone base/foundation (darker, weathered)
            const baseGeometry = new THREE.BoxGeometry(wallWidth + 0.4, wallHeight * 0.15, wallDepth + 0.3);
            const baseMaterial = new THREE.MeshLambertMaterial({
                map: rockTexture,
                color: 0x9A9080
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = wallHeight * 0.075;
            base.castShadow = true;
            wallGroup.add(base);
            
            // Decorative horizontal band/cornice
            const bandGeometry = new THREE.BoxGeometry(wallWidth + 0.2, wallHeight * 0.08, wallDepth + 0.15);
            const bandMaterial = new THREE.MeshLambertMaterial({
                color: 0xD5CAB8
            });
            const band = new THREE.Mesh(bandGeometry, bandMaterial);
            band.position.y = wallHeight * 0.55;
            wallGroup.add(band);
            
            // Add battlements/crenellations on top (heavily decayed ruins)
            const merlonCount = Math.floor(wallWidth / 3);
            for (let m = 0; m < merlonCount; m++) {
                if (Math.random() > 0.55) { // Only ~45% of merlons remain (ruined look)
                    const merlonHeight = wallHeight * (0.15 + Math.random() * 0.12);
                    const merlonWidth = 1.0 + Math.random() * 0.6;
                    const merlonGeometry = new THREE.BoxGeometry(merlonWidth, merlonHeight, wallDepth);
                    const merlonMaterial = new THREE.MeshLambertMaterial({
                        map: rockTexture,
                        color: 0xBFB5A0
                    });
                    const merlon = new THREE.Mesh(merlonGeometry, merlonMaterial);
                    merlon.position.set(
                        (m - merlonCount / 2) * 3 + (Math.random() - 0.5) * 1.2,
                        wallHeight * 0.75 + merlonHeight / 2,
                        0
                    );
                    merlon.rotation.z = (Math.random() - 0.5) * 0.15; // Noticeable tilt from decay
                    merlon.castShadow = true;
                    wallGroup.add(merlon);
                    
                    // Add small cap on top of each merlon
                    const capGeometry = new THREE.BoxGeometry(merlonWidth + 0.2, 0.15, wallDepth + 0.1);
                    const cap = new THREE.Mesh(capGeometry, bandMaterial);
                    cap.position.set(merlon.position.x, merlon.position.y + merlonHeight / 2 + 0.075, 0);
                    wallGroup.add(cap);
                }
            }
            
            // Decorative arrow slits
            const slitCount = Math.floor(wallWidth / 8);
            for (let s = 0; s < slitCount; s++) {
                const slitGeometry = new THREE.BoxGeometry(0.15, wallHeight * 0.25, wallDepth + 0.1);
                const slitMaterial = new THREE.MeshBasicMaterial({ color: 0x2A2520 });
                const slit = new THREE.Mesh(slitGeometry, slitMaterial);
                slit.position.set(
                    (s - slitCount / 2) * 8 + (Math.random() - 0.5) * 2,
                    wallHeight * 0.4,
                    0
                );
                wallGroup.add(slit);
            }
            
            // Heavy rubble at base (ruins are crumbling)
            for (let r = 0; r < wallWidth / 4; r++) {
                const rubbleGeometry = new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.6, 0);
                const rubbleMaterial = new THREE.MeshLambertMaterial({
                    color: 0xA09888
                });
                const rubble = new THREE.Mesh(rubbleGeometry, rubbleMaterial);
                rubble.position.set(
                    (r - wallWidth / 8) * 4 + (Math.random() - 0.5) * 3,
                    0.2 + Math.random() * 0.4,
                    wallDepth / 2 + 0.3 + Math.random() * 2.5
                );
                rubble.rotation.set(Math.random(), Math.random(), Math.random());
                rubble.castShadow = true;
                wallGroup.add(rubble);
            }
            
            // Additional rubble on the other side too
            for (let r = 0; r < wallWidth / 6; r++) {
                const rubbleGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.5, 0);
                const rubbleMaterial = new THREE.MeshLambertMaterial({
                    color: 0x9A9080
                });
                const rubble = new THREE.Mesh(rubbleGeometry, rubbleMaterial);
                rubble.position.set(
                    (r - wallWidth / 12) * 6 + (Math.random() - 0.5) * 4,
                    0.15 + Math.random() * 0.3,
                    -(wallDepth / 2 + 0.3 + Math.random() * 2)
                );
                rubble.rotation.set(Math.random(), Math.random(), Math.random());
                rubble.castShadow = true;
                wallGroup.add(rubble);
            }
            
            // Ivy patches on wall (friendly green touch)
            if (Math.random() > 0.3) {
                const ivyGeometry = new THREE.PlaneGeometry(wallWidth * 0.15, wallHeight * 0.25);
                const ivyMaterial = new THREE.MeshLambertMaterial({
                    color: 0x5A8F5A,
                    transparent: true,
                    opacity: 0.65,
                    side: THREE.DoubleSide
                });
                const ivy = new THREE.Mesh(ivyGeometry, ivyMaterial);
                ivy.position.set(
                    (Math.random() - 0.5) * wallWidth * 0.6,
                    wallHeight * 0.35,
                    wallDepth / 2 + 0.05
                );
                wallGroup.add(ivy);
            }
            
            // Add occasional torch bracket (decorative)
            if (wallWidth > 15 && Math.random() > 0.5) {
                const bracketGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.3);
                const bracketMaterial = new THREE.MeshLambertMaterial({ color: 0x3A3025 });
                const bracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
                bracket.position.set(
                    (Math.random() - 0.5) * wallWidth * 0.4,
                    wallHeight * 0.5,
                    wallDepth / 2 + 0.15
                );
                wallGroup.add(bracket);
            }
        } else {
            // Original rocky/candy wall segments
            for (let s = 0; s < segmentCount; s++) {
                const segWidth = 3 + Math.random() * 2;
                const segHeight = wallHeight * (0.6 + Math.random() * 0.5);
                const segDepth = wallDepth * (0.5 + Math.random() * 0.5);
                
                // Use irregular dodecahedron for more rugged look (or smooth spheres for candy)
                const segGeometry = s % 3 === 0 
                    ? (G.candyTheme ? new THREE.SphereGeometry(segWidth * 0.8, 8, 8) : new THREE.DodecahedronGeometry(segWidth * 0.8, 0))
                    : new THREE.BoxGeometry(segWidth, segHeight, segDepth);
            
            const segMaterial = new THREE.MeshLambertMaterial({ 
                map: rockTexture,
                color: G.candyTheme ? 0xFFB6C1 : 0xc0a080  // Pink for candy, sandy for regular
            });
            const segment = new THREE.Mesh(segGeometry, segMaterial);
            
            segment.position.x = (s - segmentCount / 2) * 3 + (Math.random() - 0.5) * 2;
            segment.position.y = s % 3 === 0 ? segWidth * 0.8 : segHeight / 2;
            segment.position.z = (Math.random() - 0.5) * 2;
            segment.rotation.y = (Math.random() - 0.5) * 0.4;
            segment.rotation.z = (Math.random() - 0.5) * 0.15;
            segment.scale.y = s % 3 === 0 ? segHeight / (segWidth * 1.6) : 1;
            segment.castShadow = true;
            segment.receiveShadow = true;
            wallGroup.add(segment);
            }
        }
        
        if (G.candyTheme) {
            // Add candy decorations on top (lollipops, gumdrops, candy canes)
            for (let t = 0; t < wallWidth / 5; t++) {
                const decorType = Math.floor(Math.random() * 3);
                let topDecor;
                
                if (decorType === 0) {
                    // Gumdrop
                    const gumdropGeometry = new THREE.SphereGeometry(1 + Math.random() * 0.8, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
                    const gumdropColors = [0xFF69B4, 0x00FF00, 0xFF4500, 0xFFD700, 0x9400D3, 0x00CED1];
                    const gumdropMaterial = new THREE.MeshLambertMaterial({ 
                        color: gumdropColors[Math.floor(Math.random() * gumdropColors.length)]
                    });
                    topDecor = new THREE.Mesh(gumdropGeometry, gumdropMaterial);
                } else if (decorType === 1) {
                    // Mini lollipop
                    const lollipopGroup = new THREE.Group();
                    const candyGeometry = new THREE.SphereGeometry(0.8, 8, 8);
                    const candyMaterial = new THREE.MeshLambertMaterial({ color: Math.random() > 0.5 ? 0xFF69B4 : 0x00FF00 });
                    const candy = new THREE.Mesh(candyGeometry, candyMaterial);
                    candy.position.y = 1.5;
                    const stickGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
                    const stickMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
                    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
                    stick.position.y = 0.75;
                    lollipopGroup.add(stick);
                    lollipopGroup.add(candy);
                    topDecor = lollipopGroup;
                } else {
                    // Frosting swirl
                    const frostingGeometry = new THREE.ConeGeometry(0.8 + Math.random() * 0.5, 1.5 + Math.random() * 1, 8);
                    const frostingMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
                    topDecor = new THREE.Mesh(frostingGeometry, frostingMaterial);
                }
                
                topDecor.position.set(
                    (t - wallWidth / 10) * 5 + (Math.random() - 0.5) * 3,
                    wallHeight * (0.8 + Math.random() * 0.3),
                    (Math.random() - 0.5) * 3
                );
                topDecor.rotation.set(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * Math.PI,
                    (Math.random() - 0.5) * 0.3
                );
                topDecor.castShadow = true;
                wallGroup.add(topDecor);
            }
            
            // Add candy pieces at the base (gummy bears, candy buttons)
            for (let r = 0; r < wallWidth / 4; r++) {
                const candyGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.6, 6, 6);
                const candyColors = [0xFF69B4, 0x00FF00, 0xFF4500, 0xFFD700, 0x9400D3, 0x00CED1, 0xFF0000];
                const candyMaterial = new THREE.MeshLambertMaterial({ 
                    color: candyColors[Math.floor(Math.random() * candyColors.length)]
                });
                const candyPiece = new THREE.Mesh(candyGeometry, candyMaterial);
                candyPiece.position.set(
                    (r - wallWidth / 8) * 4 + (Math.random() - 0.5) * 3,
                    0.3 + Math.random() * 0.3,
                    wallDepth / 2 + Math.random() * 2
                );
                candyPiece.rotation.set(Math.random(), Math.random(), Math.random());
                candyPiece.castShadow = true;
                wallGroup.add(candyPiece);
            }
        } else if (!G.graveyardTheme && !G.ruinsTheme) {
            // Add jagged rocks on top for rugged silhouette (not for graveyard/ruins - they have their own tops)
            for (let t = 0; t < wallWidth / 5; t++) {
                const topRockGeometry = new THREE.ConeGeometry(1 + Math.random() * 1.5, 2 + Math.random() * 3, 5);
                const topRockMaterial = new THREE.MeshLambertMaterial({ 
                    map: rockTexture,
                    color: 0xb09070
                });
                const topRock = new THREE.Mesh(topRockGeometry, topRockMaterial);
                topRock.position.set(
                    (t - wallWidth / 10) * 5 + (Math.random() - 0.5) * 3,
                    wallHeight * (0.8 + Math.random() * 0.3),
                    (Math.random() - 0.5) * 3
                );
                topRock.rotation.set(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * Math.PI,
                    (Math.random() - 0.5) * 0.3
                );
                topRock.castShadow = true;
                wallGroup.add(topRock);
            }
            
            // Add fallen rocks at the base
            for (let r = 0; r < wallWidth / 4; r++) {
                const rockGeometry = new THREE.DodecahedronGeometry(0.8 + Math.random() * 1.2, 0);
                const rockMaterial = new THREE.MeshLambertMaterial({ 
                    map: rockTexture,
                    color: 0xa08060
                });
                const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                rock.position.set(
                    (r - wallWidth / 8) * 4 + (Math.random() - 0.5) * 3,
                    0.4 + Math.random() * 0.4,
                    wallDepth / 2 + Math.random() * 2  // In front of wall
                );
                rock.rotation.set(Math.random(), Math.random(), Math.random());
                rock.castShadow = true;
                wallGroup.add(rock);
            }
        }
        
        const terrainHeight = getTerrainHeight(wall.x, wall.z);
        wallGroup.position.set(wall.x, terrainHeight, wall.z);
        wallGroup.rotation.y = wall.rotation || 0;
        G.scene.add(wallGroup);
        
        // Store for collision - approximate as box
        G.canyonWalls.push({
            mesh: wallGroup,
            x: wall.x,
            z: wall.z,
            width: wallWidth,
            depth: wallDepth,
            height: wallHeight,
            rotation: wall.rotation || 0
        });
    });
    
    // Scarab/Easter Egg collectibles - needed to unlock treasure
    G.scarabPositions = G.levelConfig.scarabs || [];
    G.totalScarabs = G.scarabPositions.length;
    G.scarabsCollected = 0;
    
    // Easter egg colors for Easter theme
    const easterEggColors = [0xFF69B4, 0x98FB98, 0x87CEEB, 0xFFD700, 0xE6E6FA]; // Pink, Green, Blue, Gold, Lavender
    
    G.scarabPositions.forEach((pos, idx) => {
        const collectibleGroup = new THREE.Group();
        
        if (G.easterTheme) {
            // EASTER EGG rendering - large collectible eggs
            const eggColor = easterEggColors[idx % easterEggColors.length];
            const stripeColors = [0xFF69B4, 0x98FB98, 0x87CEEB]; // Pink, Green, Blue stripes
            
            // Main egg shape - much bigger
            const eggGeometry = new THREE.SphereGeometry(1.5, 16, 16);
            const eggMaterial = new THREE.MeshPhongMaterial({
                color: eggColor,
                emissive: eggColor,
                emissiveIntensity: 0.2,
                shininess: 80,
                specular: 0xffffff
            });
            const egg = new THREE.Mesh(eggGeometry, eggMaterial);
            egg.scale.set(0.7, 1.0, 0.7);
            egg.position.y = 1.5;
            collectibleGroup.add(egg);
            
            // Decorative stripes
            stripeColors.forEach((color, i) => {
                const stripeGeometry = new THREE.TorusGeometry(1.0, 0.1, 8, 16);
                const stripeMaterial = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.3,
                    shininess: 100
                });
                const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripe.position.y = 1.0 + i * 0.5;
                stripe.rotation.x = Math.PI / 2;
                stripe.scale.set(0.7, 1, 0.7);
                collectibleGroup.add(stripe);
            });
            
            // Golden sparkle dots
            for (let i = 0; i < 6; i++) {
                const dotGeometry = new THREE.SphereGeometry(0.12, 6, 6);
                const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                const angle = (i / 6) * Math.PI * 2;
                dot.position.set(
                    Math.cos(angle) * 0.8,
                    1.5,
                    Math.sin(angle) * 0.8
                );
                collectibleGroup.add(dot);
            }
            
            // Glowing aura (Easter colored) - larger
            const auraGeometry = new THREE.RingGeometry(2.0, 2.8, 16);
            const auraMaterial = new THREE.MeshBasicMaterial({
                color: eggColor,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const aura = new THREE.Mesh(auraGeometry, auraMaterial);
            aura.rotation.x = -Math.PI / 2;
            aura.position.y = 0.1;
            collectibleGroup.add(aura);
            collectibleGroup.aura = aura;
        } else {
            // SCARAB rendering (original)
            const bodyGeometry = new THREE.SphereGeometry(0.5, 8, 6);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0x00cc88,
                emissive: 0x004422,
                shininess: 100,
                specular: 0xffffff
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.scale.set(1, 0.5, 1.3);
            body.position.y = 0.3;
            collectibleGroup.add(body);
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.25, 6, 6);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.3, 0.6);
            collectibleGroup.add(head);
            
            // Wings (shell)
            const wingGeometry = new THREE.SphereGeometry(0.45, 8, 6);
            const wingMaterial = new THREE.MeshPhongMaterial({
                color: 0x00ffaa,
                emissive: 0x005533,
                shininess: 150,
                specular: 0xffffff,
                transparent: true,
                opacity: 0.9
            });
            const wings = new THREE.Mesh(wingGeometry, wingMaterial);
            wings.scale.set(1.1, 0.3, 1.2);
            wings.position.y = 0.5;
            collectibleGroup.add(wings);
            
            // Glowing aura
            const auraGeometry = new THREE.RingGeometry(0.8, 1.2, 16);
            const auraMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffcc,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const aura = new THREE.Mesh(auraGeometry, auraMaterial);
            aura.rotation.x = -Math.PI / 2;
            aura.position.y = 0.1;
            collectibleGroup.add(aura);
            collectibleGroup.aura = aura;
        }
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        collectibleGroup.position.set(pos.x, terrainHeight + 0.5, pos.z);
        G.scene.add(collectibleGroup);
        
        G.scarabPickups.push({
            mesh: collectibleGroup,
            collected: false,
            x: pos.x,
            z: pos.z,
            bobPhase: idx * 0.5 // Different phase for each
        });
    });

    // Grass bushels (fewer or none in desert, none in water/computer)
    G.grassBushels = [];
    G.grassCount = (G.waterTheme || G.computerTheme) ? 0 : (G.desertTheme ? 50 : 400); // No grass in water/computer, sparse in desert
    for (let i = 0; i < G.grassCount; i++) {
        const x = (Math.random() - 0.5) * 280;
        const z = (Math.random() - 0.5) * 280;
        
        // Skip if too close to river
        if (Math.abs(z) < 4) continue;
        
        const grassGroup = new THREE.Group();
        
        // Create 5-8 grass blades per bushel (smaller in desert)
        const bladeCount = G.desertTheme ? 2 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 4);
        for (let j = 0; j < bladeCount; j++) {
            const bladeHeight = G.desertTheme ? 0.2 + Math.random() * 0.15 : 0.4 + Math.random() * 0.3;
            const bladeGeometry = new THREE.ConeGeometry(0.05, bladeHeight, 3);
            const bladeMaterial = new THREE.MeshLambertMaterial({ 
                color: G.desertTheme ? 0x8B7355 : G.grassColor // Brown-ish dead grass in desert
            });
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.x = (Math.random() - 0.5) * 0.2;
            blade.position.z = (Math.random() - 0.5) * 0.2;
            blade.position.y = bladeHeight / 2;
            blade.rotation.z = (Math.random() - 0.5) * 0.3;
            blade.castShadow = true;
            grassGroup.add(blade);
        }
        
        const terrainHeight = getTerrainHeight(x, z);
        grassGroup.position.set(x, terrainHeight, z);
        G.scene.add(grassGroup);
        G.grassBushels.push({
            mesh: grassGroup,
            baseHeight: terrainHeight,
            phase: Math.random() * Math.PI * 2
        });
    }
    
    // Extra grass in dragon boss area (skip for desert and water)
    if (!G.desertTheme && !G.waterTheme) {
        for (let i = 0; i < 150; i++) {
            const x = (Math.random() - 0.5) * 80; // x: -40 to 40
            const z = -210 - Math.random() * 55; // z: -210 to -265
            
            const grassGroup = new THREE.Group();
            const bladeCount = 5 + Math.floor(Math.random() * 4);
            for (let j = 0; j < bladeCount; j++) {
                const bladeGeometry = new THREE.ConeGeometry(0.05, 0.4 + Math.random() * 0.3, 3);
                const bladeMaterial = new THREE.MeshLambertMaterial({ 
                    color: G.grassColor
                });
                const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
                blade.position.x = (Math.random() - 0.5) * 0.2;
                blade.position.z = (Math.random() - 0.5) * 0.2;
                blade.rotation.x = (Math.random() - 0.5) * 0.3;
                blade.rotation.z = (Math.random() - 0.5) * 0.3;
                grassGroup.add(blade);
            }
            
            const terrainHeight = getTerrainHeight(x, z);
            grassGroup.position.set(x, terrainHeight, z);
            G.scene.add(grassGroup);
            G.grassBushels.push({
                mesh: grassGroup,
                baseHeight: terrainHeight,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    // Ammo pickups
    G.ammoPickups = [];
    G.ammoPositions = G.levelConfig.ammoPositions;

    G.ammoPositions.forEach(pos => {
        const ammoGroup = new THREE.Group();
        
        const boxGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
        const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const ammoBox = new THREE.Mesh(boxGeometry, boxMaterial);
        ammoBox.position.y = 0.3;
        ammoBox.castShadow = true;
        ammoGroup.add(ammoBox);
        
        const markGeometry = new THREE.BoxGeometry(0.61, 0.15, 0.41);
        const markMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFF00,
            emissive: 0xFFAA00
        });
        const mark = new THREE.Mesh(markGeometry, markMaterial);
        mark.position.y = 0.3;
        ammoGroup.add(mark);
        
        const glowGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF00, 
            transparent: true, 
            opacity: 0.25 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.3;
        ammoGroup.add(glow);
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        ammoGroup.position.set(pos.x, terrainHeight, pos.z);
        G.scene.add(ammoGroup);
        G.ammoPickups.push({ mesh: ammoGroup, collected: false, radius: 1.2, amount: 15 });
    });

    // Bomb pickups
    G.bombPickups = [];
    G.bombPositions = G.levelConfig.bombPositions;

    G.bombPositions.forEach(pos => {
        const bombGroup = new THREE.Group();
        
        // Main sphere (black bomb)
        const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.y = 0.5;
        sphere.castShadow = true;
        bombGroup.add(sphere);
        
        // Fuse (small cylinder on top)
        const fuseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
        const fuseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.85;
        bombGroup.add(fuse);
        
        // Spark at top of fuse
        const sparkGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500
        });
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.y = 1.0;
        bombGroup.add(spark);
        
        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500, 
            transparent: true, 
            opacity: 0.3 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.5;
        bombGroup.add(glow);
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        bombGroup.position.set(pos.x, terrainHeight, pos.z);
        G.scene.add(bombGroup);
        G.bombPickups.push({ mesh: bombGroup, collected: false, radius: 1.5 });
    });

    // Health pickups (hearts)
    G.healthPickups = [];
    G.heartPositions = G.levelConfig.healthPositions;

    G.heartPositions.forEach(pos => {
        const heartGroup = new THREE.Group();
        
        // Create heart shape using two spheres and a rotated box
        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const heartMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000
        });
        
        const leftSphere = new THREE.Mesh(sphereGeometry, heartMaterial);
        leftSphere.position.set(-0.15, 0.5, 0);
        leftSphere.scale.set(0.7, 0.9, 0.8);
        leftSphere.castShadow = true;
        heartGroup.add(leftSphere);
        
        const rightSphere = new THREE.Mesh(sphereGeometry, heartMaterial);
        rightSphere.position.set(0.15, 0.5, 0);
        rightSphere.scale.set(0.7, 0.9, 0.8);
        rightSphere.castShadow = true;
        heartGroup.add(rightSphere);
        
        const bottomGeometry = new THREE.BoxGeometry(0.42, 0.42, 0.48);
        const bottom = new THREE.Mesh(bottomGeometry, heartMaterial);
        bottom.position.set(0, 0.28, 0);
        bottom.rotation.z = Math.PI / 4;
        bottom.castShadow = true;
        heartGroup.add(bottom);
        
        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF6666, 
            transparent: true, 
            opacity: 0.3 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.4;
        heartGroup.add(glow);
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        heartGroup.position.set(pos.x, terrainHeight, pos.z);
        G.scene.add(heartGroup);
        G.healthPickups.push({ mesh: heartGroup, collected: false, radius: 1.2 });
    });

    // Herz-Man pickups (presents with ribbon/bow)
    G.herzmanPickups = [];
    const herzmanPositions = G.levelConfig.herzmanPositions || [];

    herzmanPositions.forEach(pos => {
        const presentGroup = new THREE.Group();
        
        // Present box (gift box base)
        const boxGeometry = new THREE.BoxGeometry(0.8, 0.7, 0.8);
        const boxMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF69B4, // Hot pink
            emissive: 0xFF1493
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 0.4;
        box.castShadow = true;
        presentGroup.add(box);
        
        // Ribbon horizontal strips (Schleife bands)
        const ribbonMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFD700, // Gold
            emissive: 0xFFD700
        });
        
        // Vertical ribbon
        const ribbonVGeometry = new THREE.BoxGeometry(0.15, 0.72, 0.82);
        const ribbonV = new THREE.Mesh(ribbonVGeometry, ribbonMaterial);
        ribbonV.position.y = 0.4;
        presentGroup.add(ribbonV);
        
        // Horizontal ribbon
        const ribbonHGeometry = new THREE.BoxGeometry(0.82, 0.72, 0.15);
        const ribbonH = new THREE.Mesh(ribbonHGeometry, ribbonMaterial);
        ribbonH.position.y = 0.4;
        presentGroup.add(ribbonH);
        
        // Bow on top (Schleife) - two loops
        const bowLoopGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16);
        
        // Left bow loop
        const bowLeft = new THREE.Mesh(bowLoopGeometry, ribbonMaterial);
        bowLeft.position.set(-0.15, 0.85, 0);
        bowLeft.rotation.y = Math.PI / 2;
        bowLeft.rotation.x = Math.PI / 6;
        presentGroup.add(bowLeft);
        
        // Right bow loop
        const bowRight = new THREE.Mesh(bowLoopGeometry, ribbonMaterial);
        bowRight.position.set(0.15, 0.85, 0);
        bowRight.rotation.y = Math.PI / 2;
        bowRight.rotation.x = -Math.PI / 6;
        presentGroup.add(bowRight);
        
        // Center knot of bow
        const knotGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const knot = new THREE.Mesh(knotGeometry, ribbonMaterial);
        knot.position.set(0, 0.82, 0);
        presentGroup.add(knot);
        
        // Bow tails (hanging ribbons)
        const tailGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.02);
        const tailLeft = new THREE.Mesh(tailGeometry, ribbonMaterial);
        tailLeft.position.set(-0.08, 0.65, 0.1);
        tailLeft.rotation.z = -0.3;
        presentGroup.add(tailLeft);
        
        const tailRight = new THREE.Mesh(tailGeometry, ribbonMaterial);
        tailRight.position.set(0.08, 0.65, 0.1);
        tailRight.rotation.z = 0.3;
        presentGroup.add(tailRight);
        
        // Small heart decoration on front
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.1);
        heartShape.bezierCurveTo(0, 0.12, -0.02, 0.15, -0.08, 0.15);
        heartShape.bezierCurveTo(-0.12, 0.15, -0.12, 0.08, -0.12, 0.08);
        heartShape.bezierCurveTo(-0.12, 0.02, -0.08, -0.02, 0, -0.08);
        heartShape.bezierCurveTo(0.08, -0.02, 0.12, 0.02, 0.12, 0.08);
        heartShape.bezierCurveTo(0.12, 0.08, 0.12, 0.15, 0.08, 0.15);
        heartShape.bezierCurveTo(0.02, 0.15, 0, 0.12, 0, 0.1);
        
        const heartExtrudeSettings = { depth: 0.02, bevelEnabled: false };
        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, heartExtrudeSettings);
        const heartMaterial = new THREE.MeshBasicMaterial({ color: 0xFF1493 });
        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        heart.position.set(0.25, 0.35, 0.42);
        heart.rotation.y = 0.3;
        heart.scale.set(1.5, 1.5, 1);
        presentGroup.add(heart);
        
        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(0.7, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF69B4, 
            transparent: true, 
            opacity: 0.25 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.5;
        presentGroup.add(glow);
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        presentGroup.position.set(pos.x, terrainHeight, pos.z);
        G.scene.add(presentGroup);
        G.herzmanPickups.push({ mesh: presentGroup, collected: false, radius: 1.5 });
    });

    // Size Potions - for enchanted theme shrink/grow mechanic
    G.sizePotions = [];
    const sizePotionPositions = G.levelConfig.sizePotionPositions || [];

    sizePotionPositions.forEach(pos => {
        const potionGroup = new THREE.Group();
        
        // Potion bottle body
        const bottleGeometry = new THREE.CylinderGeometry(0.25, 0.35, 0.7, 12);
        const bottleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF69B4, // Hot pink
            transparent: true,
            opacity: 0.7,
            shininess: 100
        });
        const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
        bottle.position.y = 0.5;
        bottle.castShadow = true;
        potionGroup.add(bottle);
        
        // Bottle neck
        const neckGeometry = new THREE.CylinderGeometry(0.12, 0.18, 0.25, 10);
        const neck = new THREE.Mesh(neckGeometry, bottleMaterial);
        neck.position.y = 0.95;
        potionGroup.add(neck);
        
        // Cork stopper
        const corkGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 8);
        const corkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Brown
        const cork = new THREE.Mesh(corkGeometry, corkMaterial);
        cork.position.y = 1.15;
        potionGroup.add(cork);
        
        // Glowing potion liquid inside
        const liquidGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.55, 10);
        const liquidMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF1493, // Deep pink glow
            transparent: true,
            opacity: 0.8
        });
        const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquid.position.y = 0.45;
        potionGroup.add(liquid);
        
        // Sparkle particles inside
        for (let i = 0; i < 5; i++) {
            const sparkleGeometry = new THREE.SphereGeometry(0.03, 6, 6);
            const sparkleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            });
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
            sparkle.position.set(
                (Math.random() - 0.5) * 0.3,
                0.3 + Math.random() * 0.3,
                (Math.random() - 0.5) * 0.3
            );
            sparkle.userData.floatOffset = Math.random() * Math.PI * 2;
            potionGroup.add(sparkle);
        }
        
        // Outer glow effect
        const glowGeometry = new THREE.SphereGeometry(0.6, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF69B4, 
            transparent: true, 
            opacity: 0.3 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.6;
        potionGroup.add(glow);
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        potionGroup.position.set(pos.x, terrainHeight, pos.z);
        G.scene.add(potionGroup);
        G.sizePotions.push({ mesh: potionGroup, collected: false, radius: 1.5 });
    });

    // Materials for bridge repair - only if level has materials
    G.materials = [];
    G.materialConfigs = G.levelConfig.materials || [];
    G.hasMaterials = G.levelConfig.hasMaterials !== false && G.materialConfigs.length > 0;

    if (G.hasMaterials) {
        G.materialConfigs.forEach(config => {
            const materialGroup = new THREE.Group();
            
            let materialMesh;
            
            if (config.type === 'wood') {
                const plankGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.5);
                const plankMaterial = new THREE.MeshLambertMaterial({ color: config.color });
                materialMesh = new THREE.Mesh(plankGeometry, plankMaterial);
            } else if (config.type === 'glass') {
                const glassGeometry = new THREE.BoxGeometry(0.9, 0.9, 0.15);
                const glassMaterial = new THREE.MeshLambertMaterial({ 
                    color: config.color,
                    transparent: true,
                    opacity: 0.6,
                    emissive: 0x4488FF
            });
            materialMesh = new THREE.Mesh(glassGeometry, glassMaterial);
        } else if (config.type === 'metal') {
            const metalGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
            const metalMaterial = new THREE.MeshLambertMaterial({ 
                color: config.color,
                emissive: 0x444444
            });
            materialMesh = new THREE.Mesh(metalGeometry, metalMaterial);
            materialMesh.rotation.z = Math.PI / 2;
        }
        
        materialMesh.position.y = 0.3;
        materialMesh.castShadow = true;
        materialGroup.add(materialMesh);
        
        const glowGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: config.glowColor, 
            transparent: true, 
            opacity: 0.3 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.3;
        materialGroup.add(glow);
        
        const terrainHeight = getTerrainHeight(config.x, config.z);
        materialGroup.position.set(config.x, terrainHeight, config.z);
        G.scene.add(materialGroup);
        G.materials.push({ mesh: materialGroup, collected: false, radius: 1.5, type: config.type });
        });
    }

    // ===== NATIVE SPLITSCREEN SETUP =====
    if (isNativeSplitscreen) {
        // Create player 2 mesh (boy character) - similar to createOtherPlayerMesh but with direct control
        function createPlayer2Mesh() {
            const player2Group = new THREE.Group();
            
            if (G.waterTheme) {
                // Boat hull
                const hullGeometry = new THREE.BoxGeometry(1.2, 0.4, 2.5);
                const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
                const hull = new THREE.Mesh(hullGeometry, hullMaterial);
                hull.position.y = 0.2;
                hull.castShadow = true;
                player2Group.add(hull);
                
                // Boat deck
                const deckGeometry = new THREE.BoxGeometry(1.0, 0.1, 2.3);
                const deckMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const deck = new THREE.Mesh(deckGeometry, deckMaterial);
                deck.position.y = 0.45;
                deck.castShadow = true;
                player2Group.add(deck);
                
                // Mast
                const mastGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
                const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
                const mast = new THREE.Mesh(mastGeometry, mastMaterial);
                mast.position.set(0, 1.75, 0);
                mast.castShadow = true;
                player2Group.add(mast);
                
                // Sail
                const sailGeometry = new THREE.BufferGeometry();
                const sailVertices = new Float32Array([
                    0, 0, 0,
                    0.8, 0.8, 0,
                    0, 1.6, 0
                ]);
                sailGeometry.setAttribute('position', new THREE.BufferAttribute(sailVertices, 3));
                sailGeometry.computeVertexNormals();
                const sailMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x87CEEB,
                    side: THREE.DoubleSide
                });
                const sail = new THREE.Mesh(sailGeometry, sailMaterial);
                sail.position.set(0, 0.9, 0);
                sail.castShadow = true;
                player2Group.add(sail);
            } else {
                // Bicycle wheels
                const wheelGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
                const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

                const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                frontWheel.rotation.y = Math.PI / 2;
                frontWheel.position.set(0, 0.3, -0.7);
                frontWheel.castShadow = true;
                player2Group.add(frontWheel);

                const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
                backWheel.rotation.y = Math.PI / 2;
                backWheel.position.set(0, 0.3, 0.5);
                backWheel.castShadow = true;
                player2Group.add(backWheel);

                // Frame (blue for player 2)
                const frameGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8);
                const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x4488FF });
                const frame1 = new THREE.Mesh(frameGeometry, frameMaterial);
                frame1.rotation.x = Math.PI / 2;
                frame1.position.set(0, 0.5, -0.1);
                frame1.castShadow = true;
                player2Group.add(frame1);

                // Seat post
                const seatPostGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
                const seatPost = new THREE.Mesh(seatPostGeometry, frameMaterial);
                seatPost.position.set(0, 0.75, 0.2);
                seatPost.castShadow = true;
                player2Group.add(seatPost);

                // Handlebar post
                const handlebarPostGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
                const handlebarPost = new THREE.Mesh(handlebarPostGeometry, frameMaterial);
                handlebarPost.position.set(0, 0.7, -0.5);
                handlebarPost.castShadow = true;
                player2Group.add(handlebarPost);

                // Handlebar
                const handlebarGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
                const handlebar = new THREE.Mesh(handlebarGeometry, frameMaterial);
                handlebar.rotation.z = Math.PI / 2;
                handlebar.position.set(0, 0.9, -0.5);
                handlebar.castShadow = true;
                player2Group.add(handlebar);
            }

            // Player body - Boy (blue)
            const bodyGeometry = new THREE.BoxGeometry(0.35, 0.6, 0.25);
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
                map: G.playerTextures.playerClothingBlue 
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.set(0, 1.3, 0.1);
            body.castShadow = true;
            player2Group.add(body);

            // Head
            const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const headMaterial = new THREE.MeshLambertMaterial({ map: G.playerTextures.playerSkin });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0, 1.85, 0);
            head.castShadow = true;
            player2Group.add(head);

            // Hair (black for boy)
            const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const hairMaterial = new THREE.MeshLambertMaterial({ 
                map: G.playerTextures.hairBlack 
            });
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.set(0, 1.95, 0);
            hair.castShadow = true;
            player2Group.add(hair);

            // Bicycle helmet (blue)
            const helmetGroup = new THREE.Group();
            const helmetShellGeometry = new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
            const helmetTexture = G.playerTextures.helmetBlue.clone();
            helmetTexture.offset.x = 0.5;
            helmetTexture.needsUpdate = true;
            const helmetMaterial = new THREE.MeshLambertMaterial({ map: helmetTexture });
            const helmetShell = new THREE.Mesh(helmetShellGeometry, helmetMaterial);
            helmetShell.scale.set(1, 0.85, 1.15);
            helmetShell.position.y = 0;
            helmetShell.castShadow = true;
            helmetGroup.add(helmetShell);
            
            const visorGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.15);
            const visorMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const visor = new THREE.Mesh(visorGeometry, visorMaterial);
            visor.position.set(0, 0.05, 0.28);
            visor.rotation.x = -0.3;
            visor.castShadow = true;
            helmetGroup.add(visor);
            
            helmetGroup.position.set(0, 1.95, 0);
            player2Group.add(helmetGroup);

            // Direction indicator
            const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
            const coneMaterial = new THREE.MeshLambertMaterial({ color: 0x00FFFF });
            const directionCone = new THREE.Mesh(coneGeometry, coneMaterial);
            directionCone.rotation.x = Math.PI / 2;
            directionCone.position.set(0, 0.5, -1.0);
            directionCone.castShadow = true;
            player2Group.add(directionCone);

            // Kite for player 2 (blue)
            const kite2Group = new THREE.Group();
            const kiteTextures = getTerrainTextures(THREE);
            
            const kiteShape = new THREE.BufferGeometry();
            const kiteVertices = new Float32Array([
                0, 0.8, 0, 0.6, 0, 0, 0, -0.5, 0, -0.6, 0, 0
            ]);
            const kiteIndices = [0, 1, 2, 0, 2, 3];
            const kiteUVs = new Float32Array([0.5, 1, 1, 0.5, 0.5, 0, 0, 0.5]);
            kiteShape.setAttribute('position', new THREE.BufferAttribute(kiteVertices, 3));
            kiteShape.setAttribute('uv', new THREE.BufferAttribute(kiteUVs, 2));
            kiteShape.setIndex(kiteIndices);
            kiteShape.computeVertexNormals();
            
            const kiteMaterial = new THREE.MeshLambertMaterial({ 
                map: kiteTextures.kiteBlue,
                side: THREE.DoubleSide
            });
            const kite = new THREE.Mesh(kiteShape, kiteMaterial);
            kite.castShadow = true;
            kite2Group.add(kite);
            
            // Kite sticks
            const stickMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const vertStick = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 1.3, 4),
                stickMaterial
            );
            vertStick.position.y = 0.15;
            kite2Group.add(vertStick);
            
            const horizStick = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4),
                stickMaterial
            );
            horizStick.rotation.z = Math.PI / 2;
            kite2Group.add(horizStick);
            
            // Kite tail
            const tailGroup = new THREE.Group();
            const tailString = new THREE.Mesh(
                new THREE.CylinderGeometry(0.01, 0.01, 2, 4),
                new THREE.MeshLambertMaterial({ color: 0x333333 })
            );
            tailString.position.y = -1.5;
            tailGroup.add(tailString);
            
            const ribbonColors = [0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF];
            for (let i = 0; i < 4; i++) {
                const ribbon = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.25, 0.02),
                    new THREE.MeshLambertMaterial({ color: ribbonColors[i] })
                );
                ribbon.position.y = -0.8 - i * 0.5;
                ribbon.position.x = (Math.random() - 0.5) * 0.2;
                tailGroup.add(ribbon);
            }
            tailGroup.position.y = -0.5;
            kite2Group.add(tailGroup);
            
            kite2Group.rotation.x = -Math.PI / 2 + 0.3;
            kite2Group.rotation.y = Math.PI;
            kite2Group.position.set(0, 3.5, -3);
            kite2Group.visible = false;
            player2Group.add(kite2Group);
            player2Group.kiteGroup = kite2Group;

            return player2Group;
        }
        
        // Create player 2 mesh
        G.player2Group = createPlayer2Mesh();
        
        // Position player 2 to the right of player 1
        const p2StartX = G.levelConfig.playerStart.x + 2;
        const p2StartZ = G.levelConfig.playerStart.z;
        G.player2Group.position.set(p2StartX, getTerrainHeight(p2StartX, p2StartZ), p2StartZ);
        G.player2Group.rotation.y = Math.PI;
        G.scene.add(G.player2Group);
        
        // Create player 2 state object
        G.player2 = {
            mesh: G.player2Group,
            speed: 0.12 * (difficulty === 'hard' ? 1.3 : 1),
            rotation: Math.PI,
            rotationSpeed: 0.04 * (difficulty === 'hard' ? 1.3 : 1),
            isGliding: false,
            glideCharge: 100,
            maxGlideCharge: 100,
            glideSpeed: 0.2 * (difficulty === 'hard' ? 1.3 : 1),
            glideHeight: 1.2,
            glideState: 'none',
            glideLiftProgress: 0,
            hasKite: false,
            gamepadMoveScale: 0
        };
        
        // Player 2 keys (separate from player 1)
        G.keys2 = {
            w: false, s: false, a: false, d: false
        };
        
        // Store player 2 gamepad state
        G.gamepad2 = null;
        G.lastShootTime2 = 0;
        G.lastKiteActivationTime2 = 0;
        
        // Player 2 specific state - restore from persistent inventory if available
        G.player2Health = persistentInventory.health2 !== null && persistentInventory.health2 !== undefined ? persistentInventory.health2 : 1;
        G.player2Ammo = persistentInventory.ammo2 !== null && persistentInventory.ammo2 !== undefined ? persistentInventory.ammo2 : GAME_CONFIG.STARTING_AMMO;
        G.player2BananaInventory = persistentInventory.bananas2 || 0;
        G.player2BombInventory = persistentInventory.bombs2 || 0;
        G.player2HerzmanInventory = persistentInventory.herzmen2 !== null && persistentInventory.herzmen2 !== undefined ? persistentInventory.herzmen2 : GAME_CONFIG.HERZMAN_STARTING_COUNT;
        G.damageFlashTime2 = 0;
        
        // Button state for player 2
        G.bananaButtonWasPressed2 = false;
        G.bombButtonWasPressed2 = false;
        G.herzmanButtonWasPressed2 = false;
        
        // Initialize splitscreenPlayers array
        splitscreenPlayers = [
            {
                index: 0,
                group: G.playerGroup,
                kiteGroup: G.kiteGroup,
                player: G.player,
                keys: G.keys,
                camera: G.camera,
                health: G.playerHealth,
                ammo: G.ammo,
                label: 'Spieler 1',
                color: '#FF6B9D'
            },
            {
                index: 1,
                group: G.player2Group,
                kiteGroup: G.player2Group.kiteGroup,
                player: G.player2,
                keys: G.keys2,
                camera: G.camera2,
                health: G.player2Health,
                ammo: G.player2Ammo,
                label: 'Spieler 2',
                color: '#4488FF'
            }
        ];
        
        // Make player 2 visible (since it's local, not network dependent)
        G.player2Group.visible = true;
        
        // Hide the network multiplayer "other player" mesh
        if (otherPlayerMesh) {
            otherPlayerMesh.visible = false;
        }
    }
    // ===== END NATIVE SPLITSCREEN SETUP =====

    // Export functions needed by other files
    window.updateClouds = updateClouds;
    window.updateGamepad = updateGamepad;
    window.updateGamepad2 = isNativeSplitscreen ? updateGamepad2 : () => {};
}

