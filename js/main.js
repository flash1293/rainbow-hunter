// Main game file - orchestrates all game systems

// Game state
let difficulty = null;
let speedMultiplier = 1;
let gameDead = false;
let gameWon = false;

// Difficulty selection
document.getElementById('easy-btn').addEventListener('click', () => startGame('easy'));
document.getElementById('hard-btn').addEventListener('click', () => startGame('hard'));

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    speedMultiplier = difficulty === 'hard' ? GAME_CONFIG.HARD_SPEED_MULTIPLIER : GAME_CONFIG.EASY_SPEED_MULTIPLIER;
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    initGame();
}

function initGame() {
    // Three.js setup
    const container = document.getElementById('gameCanvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    const camera = new THREE.PerspectiveCamera(
        GAME_CONFIG.CAMERA_FOV, 
        window.innerWidth / window.innerHeight, 
        GAME_CONFIG.CAMERA_NEAR, 
        GAME_CONFIG.CAMERA_FAR
    );
    camera.position.set(0, GAME_CONFIG.CAMERA_Y, GAME_CONFIG.CAMERA_Z);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'block';

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create terrain
    createGround(scene, THREE);
    createHills(scene, THREE);
    createMountains(scene, THREE, MOUNTAINS);
    const riverObj = createRiver(scene, THREE);
    const bridgeObj = createBridge(scene, THREE);
    const brokenBridgeGroup = createBrokenBridge(scene, THREE);
   
    // Game state variables
    let bridgeRepaired = false;
    let ammo = GAME_CONFIG.STARTING_AMMO;
    const maxAmmo = GAME_CONFIG.MAX_AMMO;
    let materialsCollected = 0;
    const materialsNeeded = GAME_CONFIG.MATERIALS_NEEDED;
    
    // Create player
    const playerGroup = new THREE.Group();

    // Bicycle wheels
    const wheelGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
    const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.rotation.y = Math.PI / 2;
    frontWheel.position.set(0, 0.3, -0.7);
    frontWheel.castShadow = true;
    playerGroup.add(frontWheel);

    const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backWheel.rotation.y = Math.PI / 2;
    backWheel.position.set(0, 0.3, 0.5);
    backWheel.castShadow = true;
    playerGroup.add(backWheel);

    // Bicycle frame
    const frameGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B9D });
    const frame1 = new THREE.Mesh(frameGeometry, frameMaterial);
    frame1.rotation.x = Math.PI / 2;
    frame1.position.set(0, 0.5, -0.1);
    frame1.castShadow = true;
    playerGroup.add(frame1);

    // Seat post
    const seatPostGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
    const seatPost = new THREE.Mesh(seatPostGeometry, frameMaterial);
    seatPost.position.set(0, 0.75, 0.2);
    seatPost.castShadow = true;
    playerGroup.add(seatPost);

    // Handlebar post
    const handlebarPostGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
    const handlebarPost = new THREE.Mesh(handlebarPostGeometry, frameMaterial);
    handlebarPost.position.set(0, 0.7, -0.5);
    handlebarPost.castShadow = true;
    playerGroup.add(handlebarPost);

    // Handlebar
    const handlebarGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const handlebar = new THREE.Mesh(handlebarGeometry, frameMaterial);
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 0.9, -0.5);
    handlebar.castShadow = true;
    playerGroup.add(handlebar);

    // Girl body
    const bodyGeometry = new THREE.BoxGeometry(0.35, 0.6, 0.25);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.3, 0.1);
    body.castShadow = true;
    playerGroup.add(body);

    // Girl head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.85, 0);
    head.castShadow = true;
    playerGroup.add(head);

    // Hair
    const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.set(0, 1.95, 0);
    hair.castShadow = true;
    playerGroup.add(hair);

    // Direction indicator
    const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const coneMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
    const directionCone = new THREE.Mesh(coneGeometry, coneMaterial);
    directionCone.rotation.x = Math.PI / 2;
    directionCone.position.set(0, 0.5, -1.0);
    directionCone.castShadow = true;
    playerGroup.add(directionCone);

    // Kite
    const kiteGroup = new THREE.Group();
    const kiteGeometry = new THREE.ConeGeometry(0.8, 1.2, 4);
    const kiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFF1493 });
    const kite = new THREE.Mesh(kiteGeometry, kiteMaterial);
    kite.rotation.x = Math.PI;
    kite.castShadow = true;
    kiteGroup.add(kite);
    
    // Kite tail
    const tailGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4);
    const tailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.y = -1.2;
    kiteGroup.add(tail);
    
    kiteGroup.position.set(0, 3, 0.5);
    kiteGroup.visible = false;
    playerGroup.add(kiteGroup);

    playerGroup.position.set(0, 0, 40);
    playerGroup.rotation.y = Math.PI;
    scene.add(playerGroup);

    const player = {
        mesh: playerGroup,
        speed: 0.08,
        rotation: Math.PI,
        rotationSpeed: 0.025,
        isGliding: false,
        glideCharge: 100,
        maxGlideCharge: 100,
        glideSpeed: 0.15,
        glideHeight: 1.2,
        glideState: 'none',
        glideLiftProgress: 0,
        hasKite: false
    };

    // Keyboard input
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        s: false,
        a: false,
        d: false
    };

    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
            e.preventDefault();
        }
        if (e.key === ' ' || e.key === 'Space') {
            shootBullet();
            e.preventDefault();
        }
        if ((e.key === 'r' || e.key === 'R') && (gameWon || gameDead)) {
            resetGame();
        }
        if ((e.key === 'f' || e.key === 'F') && player.hasKite && !player.isGliding && player.glideCharge >= 20 && !gameWon && !gameDead) {
            player.isGliding = true;
            player.glideState = 'takeoff';
            player.glideLiftProgress = 0;
            kiteGroup.visible = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
            e.preventDefault();
        }
    });

    // Mouse controls for rotation
    let isPointerLocked = false;

    container.addEventListener('click', () => {
        if (!isPointerLocked) {
            container.requestPointerLock = container.requestPointerLock || 
                                           container.mozRequestPointerLock || 
                                           container.webkitRequestPointerLock;
            container.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === container;
    });

    document.addEventListener('mousemove', (e) => {
        if (isPointerLocked) {
            const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            player.rotation -= deltaX * 0.003;
        }
    });

    // Trees
    const trees = [];
    const treePositions = [
        { x: -10, z: -15 }, { x: 10, z: -16 }, { x: 0, z: -18 },
        { x: -25, z: -30 }, { x: 20, z: -35 }, { x: -15, z: -45 },
        { x: 30, z: -25 }, { x: -35, z: 15 }, { x: 40, z: 20 },
        { x: -45, z: 25 }, { x: 50, z: 30 }, { x: -20, z: 40 },
        { x: 35, z: 45 }, { x: -50, z: -20 }, { x: 55, z: -25 },
        { x: -30, z: -50 }, { x: 25, z: -55 }, { x: -60, z: 10 },
        { x: 65, z: 5 }, { x: 15, z: 55 }, { x: -40, z: 60 },
        { x: 45, z: -60 }, { x: -55, z: -55 }, { x: 60, z: 60 },
        { x: 5, z: -65 }, { x: -65, z: 35 }
    ];

    treePositions.forEach(pos => {
        const treeGroup = new THREE.Group();
        
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 2.5;
        foliage.castShadow = true;
        treeGroup.add(foliage);
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        treeGroup.position.set(pos.x, terrainHeight, pos.z);
        scene.add(treeGroup);
        trees.push({ mesh: treeGroup, type: 'tree', radius: 1.5 });
    });

    // Rocks
    const rocks = [];
    const rockPositions = [
        { x: -8, z: 8 }, { x: -3, z: 7 }, { x: 5, z: 8 }, { x: 10, z: 7 },
        { x: -20, z: 25 }, { x: 15, z: 30 }, { x: -10, z: 35 },
        { x: -18, z: 5 }, { x: 22, z: 10 }, { x: -25, z: -5 }, { x: 30, z: -2 },
        { x: -12, z: -8 }, { x: -6, z: -9 }, { x: 7, z: -8 }, { x: 12, z: -9 },
        { x: -30, z: -20 }, { x: 35, z: -25 }, { x: -20, z: -35 }, { x: 25, z: -40 },
        { x: -40, z: 15 }, { x: 42, z: 12 }, { x: -15, z: 45 }, { x: 18, z: 48 },
        { x: -50, z: -10 }, { x: 52, z: -15 }, { x: -35, z: -45 }, { x: 38, z: -48 },
        { x: -45, z: 50 }, { x: 48, z: 55 }, { x: -55, z: -30 }, { x: 58, z: -35 },
        { x: 8, z: 60 }, { x: -12, z: 65 }, { x: 15, z: -60 }, { x: -18, z: -65 },
        { x: -60, z: 20 }, { x: 62, z: 25 }, { x: -28, z: 70 }, { x: 32, z: 72 },
        { x: -65, z: -50 }, { x: 68, z: -55 }, { x: 25, z: 75 },
        { x: 0, z: 30 }
    ];

    rockPositions.forEach(pos => {
        const rockGeometry = new THREE.DodecahedronGeometry(0.6, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        rock.position.set(pos.x, terrainHeight + 0.6, pos.z);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
        rocks.push({ mesh: rock, type: 'rock', radius: 0.8 });
    });

    // Grass bushels
    const grassBushels = [];
    for (let i = 0; i < 400; i++) {
        const x = (Math.random() - 0.5) * 280;
        const z = (Math.random() - 0.5) * 280;
        
        // Skip if too close to river
        if (Math.abs(z) < 4) continue;
        
        const grassGroup = new THREE.Group();
        
        // Create 5-8 grass blades per bushel
        const bladeCount = 5 + Math.floor(Math.random() * 4);
        for (let j = 0; j < bladeCount; j++) {
            const bladeGeometry = new THREE.ConeGeometry(0.05, 0.4 + Math.random() * 0.3, 3);
            const bladeMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x228B22,
                flatShading: true
            });
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.x = (Math.random() - 0.5) * 0.2;
            blade.position.z = (Math.random() - 0.5) * 0.2;
            blade.position.y = 0.25;
            blade.rotation.z = (Math.random() - 0.5) * 0.3;
            blade.castShadow = true;
            grassGroup.add(blade);
        }
        
        const terrainHeight = getTerrainHeight(x, z);
        grassGroup.position.set(x, terrainHeight, z);
        scene.add(grassGroup);
        grassBushels.push({
            mesh: grassGroup,
            baseHeight: terrainHeight,
            phase: Math.random() * Math.PI * 2
        });
    }

    // Ammo pickups
    const ammoPickups = [];
    const ammoPositions = [
        { x: -15, z: 20 }, { x: 35, z: 15 }, { x: -25, z: -10 },
        { x: 15, z: -25 }, { x: -40, z: 40 }, { x: 45, z: -35 },
        { x: 5, z: 25 }, { x: -30, z: -30 }, { x: 20, z: -15 },
        { x: -10, z: -40 }, { x: 40, z: 35 }, { x: -35, z: 5 }
    ];

    ammoPositions.forEach(pos => {
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
            emissive: 0xFFAA00,
            emissiveIntensity: 0.3
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
        scene.add(ammoGroup);
        ammoPickups.push({ mesh: ammoGroup, collected: false, radius: 1.2, amount: 15 });
    });

    // Materials for bridge repair
    const materials = [];
    const materialConfigs = [
        { x: -20, z: 35, type: 'wood', color: 0x8B4513, glowColor: 0xFFAA00 },
        { x: 25, z: 30, type: 'glass', color: 0x87CEEB, glowColor: 0x00FFFF },
        { x: 10, z: 15, type: 'metal', color: 0xC0C0C0, glowColor: 0xFFFFFF }
    ];

    materialConfigs.forEach(config => {
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
                emissive: 0x4488FF,
                emissiveIntensity: 0.3
            });
            materialMesh = new THREE.Mesh(glassGeometry, glassMaterial);
        } else if (config.type === 'metal') {
            const metalGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
            const metalMaterial = new THREE.MeshLambertMaterial({ 
                color: config.color,
                emissive: 0x444444,
                emissiveIntensity: 0.2
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
        scene.add(materialGroup);
        materials.push({ mesh: materialGroup, collected: false, radius: 1.5, type: config.type });
    });

    // Traps
    const traps = [];
    const trapPositions = [
        { x: -5, z: 12 }, { x: 12, z: 11 }, { x: -15, z: 9 },
        { x: -8, z: -5 }, { x: 10, z: -6 }, { x: -2, z: -20 },
        { x: 25, z: 15 }, { x: -30, z: 20 }, { x: 18, z: -15 },
        { x: -22, z: -25 }, { x: 35, z: -10 }, { x: -28, z: -40 },
        { x: -38, z: 28 }, { x: 40, z: 32 }, { x: -12, z: 50 },
        { x: 15, z: 52 }, { x: -48, z: -18 }, { x: 50, z: -22 },
        { x: -25, z: -50 }, { x: 28, z: -52 }, { x: -55, z: 40 },
        { x: 58, z: 42 }, { x: 5, z: -55 }, { x: -8, z: -58 },
        { x: -42, z: 55 }
    ];

    trapPositions.forEach(pos => {
        const trapGeometry = new THREE.PlaneGeometry(2, 2);
        const trapMaterial = new THREE.MeshLambertMaterial({ color: 0x6a8a6a });
        const trap = new THREE.Mesh(trapGeometry, trapMaterial);
        trap.rotation.x = -Math.PI / 2;
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        trap.position.set(pos.x, terrainHeight + 0.02, pos.z);
        trap.receiveShadow = true;
        scene.add(trap);
        traps.push({ mesh: trap, type: 'trap', radius: 1 });
    });

    // Goblin helper function
    function createGoblin(x, z, patrolLeft, patrolRight, speed = 0.013) {
        const goblinGrp = new THREE.Group();
        
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const goblinBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        goblinBody.position.y = 0.8;
        goblinBody.castShadow = true;
        goblinGrp.add(goblinBody);
        
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x3d5c3d });
        const goblinHead = new THREE.Mesh(headGeometry, headMaterial);
        goblinHead.position.y = 1.5;
        goblinHead.castShadow = true;
        goblinGrp.add(goblinHead);
        
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.15, 1.5, 0.35);
        goblinGrp.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.5, 0.35);
        goblinGrp.add(eye2);
        
        const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x3d5c3d });
        const ear1 = new THREE.Mesh(earGeometry, earMaterial);
        ear1.rotation.z = Math.PI / 2;
        ear1.position.set(-0.5, 1.5, 0);
        ear1.castShadow = true;
        goblinGrp.add(ear1);
        
        const ear2 = new THREE.Mesh(earGeometry, earMaterial);
        ear2.rotation.z = -Math.PI / 2;
        ear2.position.set(0.5, 1.5, 0);
        ear2.castShadow = true;
        goblinGrp.add(ear2);
        
        goblinGrp.position.set(x, getTerrainHeight(x, z), z);
        scene.add(goblinGrp);
        
        const health = Math.random() < 0.4 ? 3 : 1;
        
        return {
            mesh: goblinGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 1.5,
            health: health,
            maxHealth: health,
            isChasing: false
        };
    }

    // Guardian goblin helper
    function createGuardianGoblin(x, z, patrolLeft, patrolRight, speed = 0.014) {
        const goblinGrp = new THREE.Group();
        
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        goblinGrp.add(body);
        
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x1a2a1a });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        goblinGrp.add(head);
        
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.18, 1.8, 0.42);
        goblinGrp.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.18, 1.8, 0.42);
        goblinGrp.add(e2);
        
        const earGeometry = new THREE.ConeGeometry(0.18, 0.5, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: 0x1a2a1a });
        const er1 = new THREE.Mesh(earGeometry, earMaterial);
        er1.rotation.z = Math.PI / 2;
        er1.position.set(-0.6, 1.8, 0);
        er1.castShadow = true;
        goblinGrp.add(er1);
        
        const er2 = new THREE.Mesh(earGeometry, earMaterial);
        er2.rotation.z = -Math.PI / 2;
        er2.position.set(0.6, 1.8, 0);
        er2.castShadow = true;
        goblinGrp.add(er2);
        
        goblinGrp.position.set(x, getTerrainHeight(x, z), z);
        scene.add(goblinGrp);
        
        const health = 5;
        
        return {
            mesh: goblinGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 1.8,
            health: health,
            maxHealth: health,
            isGuardian: true,
            lastFireTime: Date.now() - Math.random() * 4000,
            isChasing: false
        };
    }

    // Create goblins
    const goblins = [];
    const maxGoblins = difficulty === 'easy' ? GAME_CONFIG.EASY_GOBLIN_COUNT : GAME_CONFIG.HARD_GOBLIN_COUNT;
    
    for (let i = 0; i < maxGoblins; i++) {
        const pos = GOBLIN_POSITIONS[i];
        goblins.push(createGoblin(pos[0], pos[1], pos[2], pos[3], pos[4]));
    }
    
    // Create guardian goblins on hard
    if (difficulty === 'hard') {
        for (let i = 0; i < GAME_CONFIG.HARD_GUARDIAN_COUNT; i++) {
            const angle = (i / GAME_CONFIG.HARD_GUARDIAN_COUNT) * Math.PI * 2;
            const x = GAME_CONFIG.TREASURE_X + Math.cos(angle) * 8;
            const z = GAME_CONFIG.TREASURE_Z + Math.sin(angle) * 8;
            goblins.push(createGuardianGoblin(x, z, x - 3, x + 3, 0.014));
        }
    }

    // Rainbow
    const rainbowGroup = new THREE.Group();
    const rainbowColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
    rainbowColors.forEach((color, i) => {
        const radius = 5 - (i * 0.3);
        const arcGeometry = new THREE.TorusGeometry(radius, 0.3, 8, 32, Math.PI);
        const arcMaterial = new THREE.MeshLambertMaterial({ color: color });
        const arc = new THREE.Mesh(arcGeometry, arcMaterial);
        rainbowGroup.add(arc);
    });
    rainbowGroup.position.set(30, 5, -55);
    scene.add(rainbowGroup);

    // Treasure
    const treasureGroup = new THREE.Group();

    // World Kite (collectible)
    const worldKiteGroup = new THREE.Group();
    const worldKiteGeometry = new THREE.ConeGeometry(0.8, 1.2, 4);
    const worldKiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFF1493 });
    const worldKite = new THREE.Mesh(worldKiteGeometry, worldKiteMaterial);
    worldKite.rotation.x = Math.PI;
    worldKite.castShadow = true;
    worldKiteGroup.add(worldKite);
    
    const worldTailGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4);
    const worldTailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
    const worldTail = new THREE.Mesh(worldTailGeometry, worldTailMaterial);
    worldTail.position.y = -1.2;
    worldKiteGroup.add(worldTail);
    
    worldKiteGroup.position.set(0, getTerrainHeight(0, -10) + 1.5, -10);
    scene.add(worldKiteGroup);
    
    let worldKiteCollected = false;

    const chestBottomGeometry = new THREE.BoxGeometry(1, 0.6, 0.8);
    const chestMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const chestBottom = new THREE.Mesh(chestBottomGeometry, chestMaterial);
    chestBottom.position.y = 0.3;
    chestBottom.castShadow = true;
    treasureGroup.add(chestBottom);

    const chestLidGeometry = new THREE.BoxGeometry(1, 0.4, 0.8);
    const chestLid = new THREE.Mesh(chestLidGeometry, chestMaterial);
    chestLid.position.y = 0.8;
    chestLid.position.z = -0.3;
    chestLid.rotation.x = -Math.PI / 3;
    chestLid.castShadow = true;
    treasureGroup.add(chestLid);

    const goldMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFD700, 
        emissive: 0xFFAA00,
        emissiveIntensity: 0.5
    });

    const goldPileGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const goldPile = new THREE.Mesh(goldPileGeometry, goldMaterial);
    goldPile.position.y = 0.7;
    goldPile.castShadow = true;
    treasureGroup.add(goldPile);

    for (let i = 0; i < 12; i++) {
        const goldGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8);
        const goldCoin = new THREE.Mesh(goldGeometry, goldMaterial);
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.4 + (i % 2) * 0.1;
        goldCoin.position.x = Math.cos(angle) * radius;
        goldCoin.position.y = 0.6 + Math.random() * 0.2;
        goldCoin.position.z = Math.sin(angle) * radius;
        goldCoin.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        goldCoin.rotation.z = Math.random() * Math.PI;
        goldCoin.castShadow = true;
        treasureGroup.add(goldCoin);
    }

    treasureGroup.position.set(30, 0, -57);
    scene.add(treasureGroup);

    const treasure = { mesh: treasureGroup, radius: 1 };

    // Game arrays
    const bullets = [];
    const explosions = [];
    const guardianArrows = [];

    // Explosion helper
    function createExplosion(x, y, z) {
        Audio.playExplosionSound();
        
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 3, 3);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xFF4500 : 0xFFFF00 
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(x, y, z);
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            
            scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 30 });
        }
        
        explosions.push(...particles);
    }

    // Shoot bullet
    function shootBullet() {
        if (gameWon) return;
        
        if (ammo <= 0) {
            Audio.playEmptyGunSound();
            return;
        }
        
        Audio.playShootSound();
        
        const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const bulletMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bulletMesh.position.copy(playerGroup.position);
        bulletMesh.position.y = 1;
        bulletMesh.castShadow = true;
        scene.add(bulletMesh);
        
        const direction = new THREE.Vector3(
            Math.sin(player.rotation),
            0,
            Math.cos(player.rotation)
        );
        
        const bullet = {
            mesh: bulletMesh,
            velocity: direction.multiplyScalar(0.5),
            radius: 0.2
        };
        bullets.push(bullet);
        ammo--;
    }

    // Update functions
    function updatePlayer() {
        if (gameWon) return;
        
        const prevPos = playerGroup.position.clone();
        
        // Handle gliding
        let isMoving = false;
        if (player.isGliding) {
            // Takeoff animation
            if (player.glideState === 'takeoff') {
                player.glideLiftProgress += 0.05;
                if (player.glideLiftProgress >= 1) {
                    player.glideState = 'flying';
                    player.glideLiftProgress = 1;
                }
            }
            // Landing animation
            else if (player.glideState === 'landing') {
                player.glideLiftProgress -= 0.05;
                if (player.glideLiftProgress <= 0) {
                    player.isGliding = false;
                    player.glideState = 'none';
                    player.glideLiftProgress = 0;
                    kiteGroup.visible = false;
                }
            }
            // Flying - consume charge
            else if (player.glideState === 'flying') {
                player.glideCharge -= 0.3;
                if (player.glideCharge <= 0) {
                    player.glideCharge = 0;
                    player.glideState = 'landing';
                }
            }
            
            // Glide forward
            playerGroup.position.x += Math.sin(player.rotation) * player.glideSpeed;
            playerGroup.position.z += Math.cos(player.rotation) * player.glideSpeed;
            isMoving = true;
        } else {
            // Recharge glide
            if (player.glideCharge < player.maxGlideCharge) {
                player.glideCharge += 0.15;
            }
            
            // Normal movement
            if (keys.ArrowLeft || keys.a) {
                player.rotation += player.rotationSpeed;
            }
            if (keys.ArrowRight || keys.d) {
                player.rotation -= player.rotationSpeed;
            }
            
            isMoving = keys.ArrowUp || keys.ArrowDown || keys.w || keys.s;
            if (keys.ArrowUp || keys.w) {
                playerGroup.position.x += Math.sin(player.rotation) * player.speed;
                playerGroup.position.z += Math.cos(player.rotation) * player.speed;
            }
            if (keys.ArrowDown || keys.s) {
                playerGroup.position.x -= Math.sin(player.rotation) * player.speed;
                playerGroup.position.z -= Math.cos(player.rotation) * player.speed;
            }
        }
        
        playerGroup.rotation.y = player.rotation;
        
        const isStuck = checkCollisions(prevPos);
        
        if (isMoving && !isStuck) {
            Audio.startBikeSound();
        } else {
            Audio.stopBikeSound();
        }
        
        const terrainHeight = getTerrainHeight(playerGroup.position.x, playerGroup.position.z);
        if (player.isGliding) {
            const groundHeight = 0.1;
            const currentHeight = groundHeight + (player.glideHeight - groundHeight) * player.glideLiftProgress;
            playerGroup.position.y = terrainHeight + currentHeight;
        } else {
            playerGroup.position.y = terrainHeight + 0.1;
        }
        
        const cameraDistance = 8;
        const cameraHeight = 4;
        
        const cameraOffsetX = -Math.sin(player.rotation) * cameraDistance;
        const cameraOffsetZ = -Math.cos(player.rotation) * cameraDistance;
        
        camera.position.x = playerGroup.position.x + cameraOffsetX;
        camera.position.y = playerGroup.position.y + cameraHeight;
        camera.position.z = playerGroup.position.z + cameraOffsetZ;
        camera.lookAt(playerGroup.position.x, playerGroup.position.y, playerGroup.position.z);
    }

    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.mesh.position.add(bullet.velocity);
            
            if (Math.abs(bullet.mesh.position.x) > 150 || Math.abs(bullet.mesh.position.z) > 150) {
                scene.remove(bullet.mesh);
                bullets.splice(i, 1);
                continue;
            }
            
            let bulletHit = false;
            
            // Check collision with goblins
            for (let j = 0; j < goblins.length; j++) {
                const gob = goblins[j];
                if (gob.alive) {
                    const dist = bullet.mesh.position.distanceTo(gob.mesh.position);
                    if (dist < gob.radius + bullet.radius) {
                        gob.health--;
                        gob.isChasing = true;
                        createExplosion(gob.mesh.position.x, gob.mesh.position.y + 1, gob.mesh.position.z);
                        if (gob.health <= 0) {
                            gob.alive = false;
                            Audio.playGoblinDeathSound();
                            gob.mesh.rotation.z = Math.PI / 2;
                            const terrainH = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
                            gob.mesh.position.y = terrainH + 0.5;
                        }
                        bulletHit = true;
                        break;
                    }
                }
            }
            
            // Check collision with trees
            if (!bulletHit) {
                for (let j = 0; j < trees.length; j++) {
                    const tree = trees[j];
                    const dist = new THREE.Vector2(
                        bullet.mesh.position.x - tree.mesh.position.x,
                        bullet.mesh.position.z - tree.mesh.position.z
                    ).length();
                    if (dist < tree.radius + bullet.radius) {
                        Audio.playBulletImpactSound();
                        bulletHit = true;
                        break;
                    }
                }
            }
            
            // Check collision with hills
            if (!bulletHit) {
                for (let j = 0; j < HILLS.length; j++) {
                    const hill = HILLS[j];
                    const dist = new THREE.Vector2(
                        bullet.mesh.position.x - hill.x,
                        bullet.mesh.position.z - hill.z
                    ).length();
                    
                    if (dist < hill.radius) {
                        const hillHeight = getTerrainHeight(bullet.mesh.position.x, bullet.mesh.position.z);
                        if (bullet.mesh.position.y <= hillHeight + 1) {
                            Audio.playBulletImpactSound();
                            bulletHit = true;
                            break;
                        }
                    }
                }
            }
            
            if (bulletHit) {
                scene.remove(bullet.mesh);
                bullets.splice(i, 1);
            }
        }
    }

    function updateExplosions() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            const exp = explosions[i];
            exp.mesh.position.add(exp.velocity);
            exp.velocity.y -= 0.02;
            exp.life--;
            
            if (exp.life <= 0) {
                scene.remove(exp.mesh);
                explosions.splice(i, 1);
            }
        }
    }

    function updateGoblins() {
        goblins.forEach(gob => {
            if (!gob.alive || gameWon) return;
            
            const distToPlayer = Math.sqrt(
                Math.pow(playerGroup.position.x - gob.mesh.position.x, 2) + 
                Math.pow(playerGroup.position.z - gob.mesh.position.z, 2)
            );
            
            if (gob.isGuardian && distToPlayer < 25) {
                gob.isChasing = true;
            }
            
            if (distToPlayer < 25 || (gob.isGuardian && gob.isChasing) || gob.isChasing) {
                const directionX = playerGroup.position.x - gob.mesh.position.x;
                const directionZ = playerGroup.position.z - gob.mesh.position.z;
                const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
                
                if (length > 0) {
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
            
            const terrainHeight = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
            gob.mesh.position.y = terrainHeight + 0.1;
            
            // Check trap collision
            traps.forEach(trap => {
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
            
            // Check player collision
            const dist = playerGroup.position.distanceTo(gob.mesh.position);
            if (dist < 1.5) {
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
            }
            
            // Guardian arrows
            if (gob.isGuardian && distToPlayer < 25) {
                const now = Date.now();
                const fireInterval = 4000 + Math.random() * 2000;
                if (now - gob.lastFireTime > fireInterval) {
                    gob.lastFireTime = now;
                    
                    const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
                    const arrowMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                    const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
                    arrowMesh.position.copy(gob.mesh.position);
                    arrowMesh.position.y += 1.5;
                    scene.add(arrowMesh);
                    
                    const tipGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
                    const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
                    const tipMesh = new THREE.Mesh(tipGeometry, tipMaterial);
                    tipMesh.position.y = 0.5;
                    arrowMesh.add(tipMesh);
                    
                    const dirX = playerGroup.position.x - gob.mesh.position.x;
                    const dirZ = playerGroup.position.z - gob.mesh.position.z;
                    const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
                    
                    const direction = new THREE.Vector3(
                        dirX / length,
                        0,
                        dirZ / length
                    );
                    
                    const angle = Math.atan2(dirX, dirZ);
                    arrowMesh.rotation.x = Math.PI / 2;
                    arrowMesh.rotation.z = -angle;
                    
                    guardianArrows.push({
                        mesh: arrowMesh,
                        velocity: direction.multiplyScalar(0.1 * speedMultiplier),
                        radius: 0.3
                    });
                }
            }
        });
    }

    function updateGuardianArrows() {
        for (let i = guardianArrows.length - 1; i >= 0; i--) {
            const arrow = guardianArrows[i];
            arrow.mesh.position.x += arrow.velocity.x;
            arrow.mesh.position.z += arrow.velocity.z;
            
            const dist = new THREE.Vector2(
                playerGroup.position.x - arrow.mesh.position.x,
                playerGroup.position.z - arrow.mesh.position.z
            ).length();
            
            if (dist < 1.0) {
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
                scene.remove(arrow.mesh);
                guardianArrows.splice(i, 1);
                continue;
            }
            
            let hitObstacle = false;
            trees.forEach(tree => {
                const distToTree = new THREE.Vector2(
                    arrow.mesh.position.x - tree.mesh.position.x,
                    arrow.mesh.position.z - tree.mesh.position.z
                ).length();
                if (distToTree < tree.radius) {
                    hitObstacle = true;
                }
            });
            
            HILLS.forEach(hill => {
                const distToHill = new THREE.Vector2(
                    arrow.mesh.position.x - hill.x,
                    arrow.mesh.position.z - hill.z
                ).length();
                if (distToHill < hill.radius) {
                    hitObstacle = true;
                }
            });
            
            if (hitObstacle) {
                scene.remove(arrow.mesh);
                guardianArrows.splice(i, 1);
                continue;
            }
            
            // Remove arrows that travel too far (150 units to match world bounds)
            const distFromOrigin = Math.sqrt(
                arrow.mesh.position.x * arrow.mesh.position.x +
                arrow.mesh.position.z * arrow.mesh.position.z
            );
            if (distFromOrigin > 150) {
                scene.remove(arrow.mesh);
                guardianArrows.splice(i, 1);
            }
        }
    }

    function checkCollisions(prevPos) {
        let isStuck = false;
        const px = playerGroup.position.x;
        const pz = playerGroup.position.z;
        
        // Mountains
        MOUNTAINS.forEach(mtn => {
            const dist = new THREE.Vector2(
                playerGroup.position.x - mtn.x,
                playerGroup.position.z - mtn.z
            ).length();
            if (dist < mtn.width/2 + 1.5) {
                playerGroup.position.copy(prevPos);
                isStuck = true;
            }
        });
        
        // Rocks
        rocks.forEach(rock => {
            const dist = new THREE.Vector2(
                playerGroup.position.x - rock.mesh.position.x,
                playerGroup.position.z - rock.mesh.position.z
            ).length();
            if (dist < rock.radius + 0.8) {
                playerGroup.position.copy(prevPos);
                isStuck = true;
            }
        });
        
        // Trees
        trees.forEach(tree => {
            const dist = new THREE.Vector2(
                playerGroup.position.x - tree.mesh.position.x,
                playerGroup.position.z - tree.mesh.position.z
            ).length();
            if (dist < tree.radius + 0.8) {
                playerGroup.position.copy(prevPos);
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
        
        // Collect materials
        materials.forEach(material => {
            if (!material.collected) {
                const dist = playerGroup.position.distanceTo(material.mesh.position);
                if (dist < material.radius) {
                    material.collected = true;
                    material.mesh.visible = false;
                    materialsCollected++;
                    Audio.playCollectSound();
                }
            }
        });
        
        // Collect ammo
        ammoPickups.forEach(pickup => {
            if (!pickup.collected) {
                const dist = playerGroup.position.distanceTo(pickup.mesh.position);
                if (dist < pickup.radius) {
                    pickup.collected = true;
                    pickup.mesh.visible = false;
                    ammo = Math.min(ammo + pickup.amount, maxAmmo);
                    Audio.playCollectSound();
                }
            }
        });
        
        // Trap collision
        traps.forEach(trap => {
            const distToTrap = new THREE.Vector2(
                playerGroup.position.x - trap.mesh.position.x,
                playerGroup.position.z - trap.mesh.position.z
            ).length();
            if (distToTrap < trap.radius) {
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
            }
        });
        
        // Bridge repair
        if (!bridgeRepaired && materialsCollected >= materialsNeeded) {
            const distToBridge = new THREE.Vector2(
                playerGroup.position.x,
                playerGroup.position.z
            ).length();
            if (distToBridge < 5) {
                bridgeRepaired = true;
                bridgeObj.mesh.visible = true;
                brokenBridgeGroup.visible = false;
                Audio.playRepairSound();
            }
        }
        
        // River and bridge collision
        if (playerGroup.position.z > riverObj.minZ && playerGroup.position.z < riverObj.maxZ) {
            const onBridge = bridgeRepaired &&
                            playerGroup.position.x > bridgeObj.minX && 
                            playerGroup.position.x < bridgeObj.maxX &&
                            playerGroup.position.z > bridgeObj.minZ && 
                            playerGroup.position.z < bridgeObj.maxZ;
            if (!onBridge) {
                playerGroup.position.copy(prevPos);
            }
        }
        
        // Treasure collection
        const dist = playerGroup.position.distanceTo(treasureGroup.position);
        if (dist < treasure.radius + 0.8) {
            gameWon = true;
            Audio.playWinSound();
        }
        
        // Check world kite collection
        if (!worldKiteCollected) {
            const kiteDistSq = (px - worldKiteGroup.position.x) ** 2 + (pz - worldKiteGroup.position.z) ** 2;
            if (kiteDistSq < 4) {
                worldKiteCollected = true;
                player.hasKite = true;
                scene.remove(worldKiteGroup);
                Audio.playCollectSound();
            }
        }
        
        return isStuck;
    }

    function resetGame() {
        gameDead = false;
        gameWon = false;
        
        Audio.startBackgroundMusic();
        
        playerGroup.position.set(0, getTerrainHeight(0, 40), 40);
        player.rotation = Math.PI;
        playerGroup.rotation.y = Math.PI;
        player.isGliding = false;
        player.glideCharge = 100;
        player.glideState = 'none';
        player.glideLiftProgress = 0;
        player.hasKite = false;
        kiteGroup.visible = false;
        
        // Reset world kite
        if (worldKiteCollected) {
            worldKiteCollected = false;
            scene.add(worldKiteGroup);
        }
        
        goblins.forEach(gob => {
            gob.alive = true;
            gob.mesh.visible = true;
            gob.mesh.rotation.z = 0;
            gob.health = gob.maxHealth;
            gob.direction = 1;
            gob.isChasing = false;
            const terrainH = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
            gob.mesh.position.y = terrainH;
        });
        
        bullets.forEach(b => scene.remove(b.mesh));
        bullets.length = 0;
        
        explosions.forEach(exp => scene.remove(exp.mesh));
        explosions.length = 0;
        
        guardianArrows.forEach(arrow => scene.remove(arrow.mesh));
        guardianArrows.length = 0;
        
        ammo = maxAmmo;
        bridgeRepaired = false;
        materialsCollected = 0;
        bridgeObj.mesh.visible = false;
        brokenBridgeGroup.visible = true;
        
        materials.forEach(material => {
            material.collected = false;
            material.mesh.visible = true;
        });
        
        ammoPickups.forEach(pickup => {
            pickup.collected = false;
            pickup.mesh.visible = true;
        });
    }

    // HUD
    const hudCanvas = document.createElement('canvas');
    hudCanvas.width = window.innerWidth;
    hudCanvas.height = window.innerHeight;
    hudCanvas.style.position = 'absolute';
    hudCanvas.style.top = '0';
    hudCanvas.style.left = '0';
    hudCanvas.style.width = '100%';
    hudCanvas.style.height = '100%';
    hudCanvas.style.pointerEvents = 'none';
    container.appendChild(hudCanvas);
    const hudCtx = hudCanvas.getContext('2d');

    window.addEventListener('resize', () => {
        hudCanvas.width = window.innerWidth;
        hudCanvas.height = window.innerHeight;
    });

    function drawHUD() {
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
        
        hudCtx.fillStyle = '#000';
        hudCtx.font = 'bold 18px Arial';
        hudCtx.fillText(`Schüsse: ${ammo}/${maxAmmo}`, 10, 25);
        
        const aliveGoblins = goblins.filter(g => g.alive).length;
        hudCtx.fillText(`Kobolde: ${aliveGoblins}`, 10, 50);
        
        hudCtx.fillText(`Material: ${materialsCollected}/${materialsNeeded}`, 10, 75);
        
        // Kite charge bar or collection status
        if (player.hasKite) {
            hudCtx.fillText(`Drachen: ${Math.floor(player.glideCharge)}%`, 10, 100);
            hudCtx.fillStyle = player.glideCharge >= 20 ? '#00FF00' : '#FF0000';
            hudCtx.fillRect(10, 105, player.glideCharge * 2, 10);
            hudCtx.strokeStyle = '#000';
            hudCtx.strokeRect(10, 105, 200, 10);
            hudCtx.fillStyle = '#000';
        } else {
            hudCtx.fillStyle = '#FFD700';
            hudCtx.fillText('Finde den Drachen auf der anderen Seite!', 10, 100);
            hudCtx.fillStyle = '#000';
        }
        
        if (!bridgeRepaired && materialsCollected >= materialsNeeded) {
            hudCtx.fillStyle = '#FFD700';
            hudCtx.fillText('Gehe zur Brücke um sie zu reparieren!', 10, 130);
            hudCtx.fillStyle = '#000';
        } else if (bridgeRepaired) {
            hudCtx.fillStyle = '#00FF00';
            hudCtx.fillText('Brücke repariert!', 10, 130);
            hudCtx.fillStyle = '#000';
        }
        
        if (gameWon) {
            hudCtx.fillStyle = 'rgba(255, 215, 0, 0.9)';
            hudCtx.fillRect(hudCanvas.width / 2 - 150, hudCanvas.height / 2 - 100, 300, 200);
            
            hudCtx.fillStyle = '#000';
            hudCtx.font = 'bold 36px Arial';
            hudCtx.textAlign = 'center';
            hudCtx.fillText('GEWONNEN!', hudCanvas.width / 2, hudCanvas.height / 2);
            hudCtx.font = '20px Arial';
            hudCtx.fillText('Drücke R zum Neustart', hudCanvas.width / 2, hudCanvas.height / 2 + 60);
            hudCtx.textAlign = 'left';
        }
        
        if (gameDead) {
            hudCtx.fillStyle = 'rgba(200, 0, 0, 0.6)';
            hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);
            
            hudCtx.fillStyle = '#FFF';
            hudCtx.font = 'bold 48px Arial';
            hudCtx.textAlign = 'center';
            hudCtx.fillText('GESTORBEN', hudCanvas.width / 2, hudCanvas.height / 2 - 30);
            hudCtx.font = '24px Arial';
            hudCtx.fillText('Drücke R zum Neustart', hudCanvas.width / 2, hudCanvas.height / 2 + 30);
            hudCtx.textAlign = 'left';
        }
    }

    // Start background music
    Audio.startBackgroundMusic();

    // Game loop
    function animate() {
        requestAnimationFrame(animate);
        
        const time = Date.now() * 0.001;
        
        // Animate river water
        const riverGeometry = riverObj.mesh.geometry;
        const positions = riverGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const wave = Math.sin(x * 0.5 + time * 2) * Math.cos(y * 0.5 + time * 1.5) * 0.05;
            positions.setZ(i, wave);
        }
        positions.needsUpdate = true;
        
        // Rotate world kite
        if (!worldKiteCollected) {
            worldKiteGroup.rotation.y = time;
        }
        
        // Animate grass bushels
        grassBushels.forEach(grass => {
            const sway = Math.sin(time * 2 + grass.phase) * 0.1;
            grass.mesh.rotation.z = sway;
        });
        
        if (!gameDead) {
            updatePlayer();
            updateBullets();
            updateExplosions();
            updateGoblins();
            updateGuardianArrows();
            Audio.updateGoblinProximitySound(playerGroup.position, goblins);
        }
        
        drawHUD();
        renderer.render(scene, camera);
    }

    animate();
}
