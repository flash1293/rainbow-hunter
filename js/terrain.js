// Terrain and environment utilities

// Function to get terrain height at position
function getTerrainHeight(x, z) {
    let y = 0;
    
    // Check each hill
    HILLS.forEach(hill => {
        const dist = Math.sqrt(
            Math.pow(x - hill.x, 2) + Math.pow(z - hill.z, 2)
        );
        
        if (dist < hill.radius) {
            const normalizedDist = dist / hill.radius;
            const heightMultiplier = Math.cos(normalizedDist * Math.PI / 2);
            y = Math.max(y, hill.height * heightMultiplier);
        }
    });
    
    return y;
}

// Create visual hill meshes
function createHills(scene, THREE) {
    HILLS.forEach(hill => {
        const hillGeometry = new THREE.ConeGeometry(hill.radius, hill.height, 32);
        const hillMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const hillMesh = new THREE.Mesh(hillGeometry, hillMaterial);
        hillMesh.position.set(hill.x, hill.height / 2, hill.z);
        hillMesh.castShadow = true;
        hillMesh.receiveShadow = true;
        scene.add(hillMesh);
    });
}

// Create mountains (world boundaries)
function createMountains(scene, THREE, mountainPositions) {
    mountainPositions.forEach(mtn => {
        const mountainGeometry = new THREE.ConeGeometry(mtn.width/2, mtn.height, 6);
        const mountainMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(mtn.x, mtn.height/2, mtn.z);
        scene.add(mountain);
        
        // Snow cap on top
        const snowGeometry = new THREE.ConeGeometry(mtn.width/4, mtn.height/3, 6);
        const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.position.set(mtn.x, mtn.height * 0.75, mtn.z);
        scene.add(snow);
    });
}

// Create ground plane
function createGround(scene, THREE) {
    const groundGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

// Create river
function createRiver(scene, THREE) {
    const riverGeometry = new THREE.PlaneGeometry(300, 4, 60, 8);
    const riverMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4682B4,
        transparent: true,
        opacity: 0.8
    });
    const river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.rotation.x = -Math.PI / 2;
    river.position.y = 0.05;
    river.receiveShadow = true;
    scene.add(river);
    
    return {
        mesh: river,
        minZ: -2,
        maxZ: 2
    };
}

// Create bridge
function createBridge(scene, THREE) {
    const bridgeGroup = new THREE.Group();

    // Bridge deck
    const deckGeometry = new THREE.BoxGeometry(5, 0.3, 5);
    const deckMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 0.5;
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Add visible wood planks on bridge (like the material)
    for (let i = 0; i < 3; i++) {
        const woodPlank = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.15, 4.5),
            new THREE.MeshLambertMaterial({ color: 0x8B4513 })
        );
        woodPlank.position.set(-1.5 + i * 1.5, 0.73, 0);
        woodPlank.castShadow = true;
        bridgeGroup.add(woodPlank);
    }

    // Add glass panels on sides (like the material)
    for (let i = 0; i < 2; i++) {
        const glassPanel = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.6, 4.5),
            new THREE.MeshLambertMaterial({ 
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.4,
                emissive: 0x4488FF,
                emissiveIntensity: 0.2
            })
        );
        glassPanel.position.set(i === 0 ? -2.2 : 2.2, 0.9, 0);
        glassPanel.castShadow = true;
        bridgeGroup.add(glassPanel);
    }

    // Add metal support beams (like the material)
    for (let i = 0; i < 4; i++) {
        const metalBeam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
            new THREE.MeshLambertMaterial({ 
                color: 0xC0C0C0,
                emissive: 0x444444,
                emissiveIntensity: 0.2
            })
        );
        metalBeam.position.set(0, 0.1, -2 + i * 1.3);
        metalBeam.rotation.x = Math.PI / 2;
        metalBeam.castShadow = true;
        bridgeGroup.add(metalBeam);
    }

    // Bridge railings
    const railGeometry = new THREE.BoxGeometry(0.1, 0.5, 5);
    const railMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const rail1 = new THREE.Mesh(railGeometry, railMaterial);
    rail1.position.set(2.5, 0.9, 0);
    rail1.castShadow = true;
    bridgeGroup.add(rail1);

    const rail2 = new THREE.Mesh(railGeometry, railMaterial);
    rail2.position.set(-2.5, 0.9, 0);
    rail2.castShadow = true;
    bridgeGroup.add(rail2);

    bridgeGroup.position.set(0, 0, 0);
    bridgeGroup.visible = false;
    scene.add(bridgeGroup);
    
    return {
        mesh: bridgeGroup,
        minX: -2.5,
        maxX: 2.5,
        minZ: -2.5,
        maxZ: 2.5
    };
}

// Create broken bridge
function createBrokenBridge(scene, THREE) {
    const brokenBridgeGroup = new THREE.Group();
    
    const plankGeometry = new THREE.BoxGeometry(5, 0.2, 1);
    const plankMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    for (let i = 0; i < 3; i++) {
        const plank = new THREE.Mesh(plankGeometry, plankMaterial);
        plank.position.set(0, 0.1, -4.5 + i);
        plank.rotation.z = (Math.random() - 0.5) * 0.3;
        plank.castShadow = true;
        brokenBridgeGroup.add(plank);
    }
    
    for (let i = 7; i < 10; i++) {
        const plank = new THREE.Mesh(plankGeometry, plankMaterial);
        plank.position.set(0, 0.1, -4.5 + i);
        plank.rotation.z = (Math.random() - 0.5) * 0.3;
        plank.castShadow = true;
        brokenBridgeGroup.add(plank);
    }
    
    brokenBridgeGroup.position.y = 0;
    scene.add(brokenBridgeGroup);
    
    return brokenBridgeGroup;
}
