// Main game file - orchestrates all game systems

// Game state
let difficulty = null;
let speedMultiplier = 1;
let gameDead = false;
let gameWon = false;

// Dragon death shake
let dragonDeathShakeUntil = 0;
let dragonDeathShakeIntensity = 0;

// God mode for debugging
let godMode = false;
let godModeSpeed = 2.0;

// Controller state
let bananaButtonWasPressed = false;
let bombButtonWasPressed = false;

// Persistent inventory across levels
let persistentInventory = {
    ammo: null,        // null means use default, number means carry over
    bombs: null,
    health: null,
    hasKite: false
};

// Multiplayer
let multiplayerManager = null;
let otherPlayerMesh = null;
let otherPlayerVelocity = { x: 0, z: 0 }; // For optimistic position updates
let otherPlayerLastPos = { x: 0, z: 0 };
let otherPlayerIsGliding = false;
let otherPlayerGlideLiftProgress = 0;

// Math exercise state
let mathExerciseActive = false;
let mathExercises = [];
let currentMathAnswer = '';
let mathCorrectAnswer = 0;

// Splitscreen support
const urlParams = new URLSearchParams(window.location.search);
const isSplitscreen = urlParams.get('splitscreen');
const splitscreenRoom = urlParams.get('room');
const controllerIndex = parseInt(urlParams.get('controller')) || 0;

// Initialize multiplayer on page load
window.addEventListener('DOMContentLoaded', () => {
    // Hide multiplayer UI in splitscreen mode
    if (isSplitscreen) {
        const multiplayerSetup = document.getElementById('multiplayer-setup');
        if (multiplayerSetup) multiplayerSetup.style.display = 'none';
    }
    
    multiplayerManager = new MultiplayerManager(isSplitscreen ? splitscreenRoom : null);
    
    // Setup join button only if not in splitscreen mode
    if (!isSplitscreen) {
        const joinBtn = document.getElementById('join-btn');
        const joinInput = document.getElementById('join-room-code');
        
        if (joinBtn && joinInput) {
            joinBtn.addEventListener('click', () => {
                const roomCode = joinInput.value.trim();
                multiplayerManager.joinRoom(roomCode);
            });
            
            // Allow Enter key in input
            joinInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const roomCode = joinInput.value.trim();
                    multiplayerManager.joinRoom(roomCode);
                }
            });
        }
    }
    
    // Handle multiplayer callbacks
    multiplayerManager.onUpdate((type, data) => {
        if (type === 'gameStart') {
            // Client receives game start from host with level
            startGame(data.difficulty, data.level || 1);
        }
    });
    
    // Auto-join for splitscreen client
    if (isSplitscreen === 'client' && splitscreenRoom) {
        // Hide all difficulty menu content for client
        const difficultyMenu = document.getElementById('difficulty-menu');
        if (difficultyMenu) {
            const title = difficultyMenu.querySelector('h1');
            const h2 = difficultyMenu.querySelector('h2');
            const buttons = difficultyMenu.querySelectorAll('.difficulty-btn');
            
            if (title) title.textContent = 'Spieler 2';
            if (h2) h2.textContent = 'Warte auf Spieler 1...';
            buttons.forEach(btn => btn.style.display = 'none');
        }
        
        // Wait a moment for host to be ready, then join
        setTimeout(() => {
            multiplayerManager.joinRoom(splitscreenRoom);
        }, 1500);
    }
});

// Difficulty selection - only for host or non-splitscreen
if (!isSplitscreen || isSplitscreen === 'host') {
    document.getElementById('easy-btn').addEventListener('click', () => startGame('easy'));
    document.getElementById('hard-btn').addEventListener('click', () => startGame('hard'));
}

function startGame(selectedDifficulty, startLevel = null) {
    difficulty = selectedDifficulty;
    speedMultiplier = difficulty === 'hard' ? GAME_CONFIG.HARD_SPEED_MULTIPLIER : GAME_CONFIG.EASY_SPEED_MULTIPLIER;
    
    // Reset persistent inventory for new game
    persistentInventory = {
        ammo: null,
        bombs: null,
        health: null,
        hasKite: false
    };
    
    // Get selected level from dropdown or use provided startLevel
    if (startLevel !== null) {
        currentLevel = startLevel;
    } else {
        const levelSelect = document.getElementById('start-level');
        currentLevel = levelSelect ? parseInt(levelSelect.value) : 1;
    }
    
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Host sends game start to client with level info
    if (multiplayerManager && multiplayerManager.isHost && multiplayerManager.isConnected()) {
        multiplayerManager.sendGameStart(selectedDifficulty, currentLevel);
    }
    
    initGame();
}

// Math exercise system
function generateMathExercise() {
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    const operation = Math.random() < 0.5 ? '+' : '-';
    
    let question, answer;
    if (operation === '+') {
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
    } else {
        // Make sure result is positive
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        question = `${larger} - ${smaller}`;
        answer = larger - smaller;
    }
    
    return { question, answer };
}

function showMathExercise(count = 1) {
    mathExercises = [];
    for (let i = 0; i < count; i++) {
        mathExercises.push(generateMathExercise());
    }
    mathExerciseActive = true;
    currentMathAnswer = '';
    mathCorrectAnswer = mathExercises[0].answer;
}

function checkMathAnswer() {
    const userAnswer = parseInt(currentMathAnswer);
    if (userAnswer === mathCorrectAnswer) {
        // Correct answer - move to next exercise or resume game
        mathExercises.shift();
        if (mathExercises.length > 0) {
            currentMathAnswer = '';
            mathCorrectAnswer = mathExercises[0].answer;
        } else {
            mathExerciseActive = false;
            currentMathAnswer = '';
        }
    } else {
        // Wrong answer - reset input
        currentMathAnswer = '';
    }
}

// Keyboard input for math exercises
window.addEventListener('keydown', (e) => {
    if (!mathExerciseActive) return;
    
    if (e.key >= '0' && e.key <= '9') {
        currentMathAnswer += e.key;
    } else if (e.key === 'Backspace') {
        currentMathAnswer = currentMathAnswer.slice(0, -1);
    } else if (e.key === 'Enter') {
        checkMathAnswer();
    }
});

// Current level (can be changed for multi-level support)
let currentLevel = 1;
let currentAnimationId = null;
let currentScene = null;
let currentRenderer = null;
let currentEventAbortController = null;

// Switch to a different level
function switchLevel(newLevel) {
    console.log(`Switching to Level ${newLevel}...`);
    currentLevel = newLevel;
    
    // Cancel current animation loop
    if (currentAnimationId) {
        cancelAnimationFrame(currentAnimationId);
        currentAnimationId = null;
    }
    
    // Stop multiplayer sync and clear callbacks before reinitializing
    if (multiplayerManager) {
        multiplayerManager.stopHostSync();
        multiplayerManager.clearCallbacks();
    }
    
    // Properly dispose Three.js resources
    if (currentScene) {
        // Recursively dispose all objects in scene
        currentScene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => mat.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        currentScene.clear();
        currentScene = null;
    }
    
    // Dispose renderer
    if (currentRenderer) {
        currentRenderer.dispose();
        currentRenderer.forceContextLoss();
        currentRenderer = null;
    }
    
    // Abort all event listeners from previous level
    if (currentEventAbortController) {
        currentEventAbortController.abort();
        currentEventAbortController = null;
    }
    
    // Clear global mesh references
    otherPlayerMesh = null;
    
    // Clear container
    const container = document.getElementById('gameCanvas');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Stop any audio
    if (typeof Audio !== 'undefined' && Audio.stopBackgroundMusic) {
        Audio.stopBackgroundMusic();
    }
    
    // Small delay to let things clean up, then restart
    setTimeout(() => {
        initGame();
    }, 100);
}

// Expose switchLevel globally for multiplayer sync
window.switchLevel = switchLevel;

function initGame() {
    // Create AbortController for managing event listeners
    currentEventAbortController = new AbortController();
    const eventSignal = currentEventAbortController.signal;
    
    // Get level configuration
    const levelConfig = getLevelConfig(currentLevel);
    
    // Check if this is an ice-themed level (used for dragon/fireball textures)
    const iceTheme = levelConfig.iceTheme || false;
    
    // Check if this is a desert-themed level
    const desertTheme = levelConfig.desertTheme || false;
    
    // Check if this is a lava-themed level
    const lavaTheme = levelConfig.lavaTheme || false;
    
    // Check if this is a water-themed level
    const waterTheme = levelConfig.waterTheme || false;
    
    // Three.js setup
    const container = document.getElementById('gameCanvas');
    const scene = new THREE.Scene();
    currentScene = scene; // Store for cleanup

    
    // Use sky texture as background (only for non-themed levels)
    const skyTextures = getTerrainTextures(THREE);
    if (levelConfig.skyColor) {
        // For themed levels, use solid color background
        scene.background = new THREE.Color(levelConfig.skyColor);
    } else {
        scene.background = skyTextures.sky;
    }
    
    // Pre-cache explosion and smoke materials to avoid texture loading glitches
    const explosionTextureCached = iceTheme ? skyTextures.explosionIce : skyTextures.explosion;
    const explosionBaseMaterial = new THREE.SpriteMaterial({
        map: explosionTextureCached,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true
    });
    const smokeBaseMaterial = new THREE.SpriteMaterial({
        map: skyTextures.smoke,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
    });

    const camera = new THREE.PerspectiveCamera(
        GAME_CONFIG.CAMERA_FOV, 
        window.innerWidth / window.innerHeight, 
        GAME_CONFIG.CAMERA_NEAR, 
        GAME_CONFIG.CAMERA_FAR
    );
    camera.position.set(0, GAME_CONFIG.CAMERA_Y, GAME_CONFIG.CAMERA_Z);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    currentRenderer = renderer; // Store for cleanup
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
    }, { signal: eventSignal });

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

    // Set current level hills for terrain height calculation
    setCurrentLevelHills(levelConfig.hills);
    
    // Get theme colors (default to green if not specified)
    const hillColor = levelConfig.hillColor || 0x228B22;
    const treeColor = levelConfig.treeColor || 0x228B22;
    const grassColor = levelConfig.grassColor || 0x228B22;

    // Create terrain (use level-specific ground color and theme)
    createGround(scene, THREE, levelConfig.groundColor, iceTheme, desertTheme, lavaTheme, waterTheme);
    createHills(scene, THREE, levelConfig.hills, hillColor, iceTheme, desertTheme, lavaTheme, waterTheme);
    
    // Mountains are optional (disabled in desert)
    if (levelConfig.hasMountains !== false && levelConfig.mountains && levelConfig.mountains.length > 0) {
        createMountains(scene, THREE, levelConfig.mountains);
    }
    
    // River and bridge are optional per level
    const hasRiver = levelConfig.hasRiver !== false; // Default true for backward compat
    let riverObj = null;
    let bridgeObj = null;
    let brokenBridgeGroup = null;
    if (hasRiver) {
        riverObj = createRiver(scene, THREE);
        bridgeObj = createBridge(scene, THREE);
        brokenBridgeGroup = createBrokenBridge(scene, THREE);
    }
    
    // Create 3D clouds
    const clouds = [];
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
        
        scene.add(cloudGroup);
        return { mesh: cloudGroup, speed: speed, startX: x };
    }
    
    // Create clouds in a grid pattern for even distribution
    const cloudGridX = 8;  // Number of clouds across X axis
    const cloudGridZ = 6;  // Number of clouds across Z axis
    const cloudSpacingX = 500 / cloudGridX;  // Total X range divided by count
    const cloudSpacingZ = 300 / cloudGridZ;  // Total Z range divided by count
    
    for (let xi = 0; xi < cloudGridX; xi++) {
        for (let zi = 0; zi < cloudGridZ; zi++) {
            // Base position from grid, with small random offset for natural look
            const x = -250 + xi * cloudSpacingX + (Math.random() - 0.5) * 30;
            const y = 50 + Math.random() * 35;
            const z = -280 + zi * cloudSpacingZ + (Math.random() - 0.5) * 25;
            clouds.push(createCloud(x, y, z));
        }
    }
    
    // Function to update clouds
    function updateClouds() {
        clouds.forEach(cloud => {
            cloud.mesh.position.x += cloud.speed;
            
            // Wrap around when cloud goes too far
            if (cloud.mesh.position.x > 250) {
                cloud.mesh.position.x = -250;
            }
        });
    }
   
    // Game state variables
    let bridgeRepaired = false;
    // Use persistent inventory if available, otherwise use defaults
    let ammo = persistentInventory.ammo !== null ? persistentInventory.ammo : GAME_CONFIG.STARTING_AMMO;
    const maxAmmo = GAME_CONFIG.MAX_AMMO;
    let materialsCollected = 0;
    const materialsNeeded = GAME_CONFIG.MATERIALS_NEEDED;
    let playerHealth = persistentInventory.health !== null ? persistentInventory.health : 1;
    let otherPlayerHealth = 1;
    const maxPlayerHealth = 4;
    let lastDamageTime = 0;
    const damageCooldown = 2500; // ms between damage from goblins
    let damageFlashTime = 0;
    let tornadoSpinActive = false;
    let tornadoSpinStartTime = 0;
    let tornadoSpinDuration = 800; // ms for the spin effect
    let tornadoSpinRotations = 3; // number of full rotations
    let tornadoSpinLiftHeight = 2.5; // how high to lift the player
    let lastClientStateSend = 0;
    const clientStateSendInterval = 50; // Send client state at 20Hz to match host sync
    
    // Get textures for player
    const playerTextures = getTerrainTextures(THREE);
    
    // Create player
    const playerGroup = new THREE.Group();

    if (waterTheme) {
        // Boat hull
        const hullGeometry = new THREE.BoxGeometry(1.2, 0.4, 2.5);
        const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 0.2;
        hull.castShadow = true;
        playerGroup.add(hull);
        
        // Boat deck
        const deckGeometry = new THREE.BoxGeometry(1.0, 0.1, 2.3);
        const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 0.45;
        deck.castShadow = true;
        playerGroup.add(deck);
        
        // Mast
        const mastGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);
        const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.set(0, 1.75, 0);
        mast.castShadow = true;
        playerGroup.add(mast);
        
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
        playerGroup.add(sail);
        
        // Rudder
        const rudderGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.3);
        const rudder = new THREE.Mesh(rudderGeometry, hullMaterial);
        rudder.position.set(0, 0.2, 1.3);
        rudder.castShadow = true;
        playerGroup.add(rudder);
    } else {
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
    }

    // Player body - Girl for host, Boy for client
    const isHost = !multiplayerManager || multiplayerManager.isHost;
    
    const bodyGeometry = new THREE.BoxGeometry(0.35, 0.6, 0.25);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
        map: isHost ? playerTextures.playerClothingPink : playerTextures.playerClothingBlue 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.3, 0.1);
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ map: playerTextures.playerSkin });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.85, 0);
    head.castShadow = true;
    playerGroup.add(head);

    // Hair
    const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMaterial = new THREE.MeshLambertMaterial({ 
        map: isHost ? playerTextures.hairBrown : playerTextures.hairBlack 
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.set(0, 1.95, 0);
    hair.castShadow = true;
    playerGroup.add(hair);

    // Bicycle helmet
    const helmetGroup = new THREE.Group();
    
    // Main helmet shell (elongated dome) with texture
    const helmetShellGeometry = new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const helmetTexture = isHost ? playerTextures.helmetPink.clone() : playerTextures.helmetBlue.clone();
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
    playerGroup.add(helmetGroup);

    // Direction indicator
    const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const coneMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
    const directionCone = new THREE.Mesh(coneGeometry, coneMaterial);
    directionCone.rotation.x = Math.PI / 2;
    directionCone.position.set(0, 0.5, -1.0);
    directionCone.castShadow = true;
    playerGroup.add(directionCone);

    // Kite - proper flat diamond shape
    const kiteTextures = getTerrainTextures(THREE);
    const kiteGroup = new THREE.Group();
    
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
        map: isHost ? kiteTextures.kitePink : kiteTextures.kiteBlue,
        side: THREE.DoubleSide
    });
    const kite = new THREE.Mesh(kiteShape, kiteMaterial);
    kite.castShadow = true;
    kiteGroup.add(kite);
    
    // Kite cross-sticks
    const stickMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const vertStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.3, 4),
        stickMaterial
    );
    vertStick.position.y = 0.15;
    kiteGroup.add(vertStick);
    
    const horizStick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4),
        stickMaterial
    );
    horizStick.rotation.z = Math.PI / 2;
    kiteGroup.add(horizStick);
    
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
    kiteGroup.add(tailGroup);
    
    // Rotate kite to stand upright (vertical, facing player) with nose tilted up
    kiteGroup.rotation.x = -Math.PI / 2 + 0.3;  // 90 degrees upright + nose tilted up
    kiteGroup.rotation.y = Math.PI;  // 180 degrees for more realistic look
    
    kiteGroup.position.set(0, 3.5, -3);  // Behind player
    kiteGroup.visible = false;
    playerGroup.add(kiteGroup);

    // Different starting positions for host and client
    const startX = isHost ? levelConfig.playerStart.x - 2 : levelConfig.playerStart.x + 2;
    const startZ = levelConfig.playerStart.z;
    playerGroup.position.set(startX, 0, startZ);
    playerGroup.rotation.y = Math.PI;
    scene.add(playerGroup);

    // Create other player mesh (for multiplayer)
    function createOtherPlayerMesh() {
        const otherPlayerGroup = new THREE.Group();
        
        // Opposite gender of main player
        const otherIsGirl = !isHost; // If we're host (girl), other is boy. If we're client (boy), other is girl.
        
        if (waterTheme) {
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
            map: otherIsGirl ? playerTextures.playerClothingPink : playerTextures.playerClothingBlue 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1.3, 0.1);
        body.castShadow = true;
        otherPlayerGroup.add(body);

        // Head with skin texture
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ map: playerTextures.playerSkin });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.85, 0);
        head.castShadow = true;
        otherPlayerGroup.add(head);

        // Hair (opposite gender) with texture
        const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMaterial = new THREE.MeshLambertMaterial({ 
            map: otherIsGirl ? playerTextures.hairBrown : playerTextures.hairBlack 
        });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.95, 0);
        hair.castShadow = true;
        otherPlayerGroup.add(hair);

        // Bicycle helmet for other player
        const otherHelmetGroup = new THREE.Group();
        
        // Main helmet shell (elongated dome) with texture
        const otherHelmetShellGeometry = new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const otherHelmetTexture = otherIsGirl ? playerTextures.helmetPink.clone() : playerTextures.helmetBlue.clone();
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
        
        otherKiteGroup.position.set(0, 3.5, -3);  // Behind player
        otherKiteGroup.visible = false;
        otherPlayerGroup.add(otherKiteGroup);
        otherPlayerGroup.kiteGroup = otherKiteGroup; // Store reference

        otherPlayerGroup.visible = false;
        scene.add(otherPlayerGroup);
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
                        otherPlayerHealth = data.health;
                        // If client died, trigger game death for both players
                        if (otherPlayerHealth <= 0 && !gameDead) {
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
                x: playerGroup.position.x,
                y: playerGroup.position.y,
                z: playerGroup.position.z,
                rotation: player.rotation,
                isGliding: player.isGliding,
                glideLiftProgress: player.glideLiftProgress,
                glideCharge: player.glideCharge,
                hasKite: player.hasKite
            },
            goblins: goblins.map(g => ({
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
            guardianArrows: guardianArrows.map(a => ({
                x: a.mesh.position.x,
                y: a.mesh.position.y,
                z: a.mesh.position.z,
                rotationZ: a.mesh.rotation.z,
                vx: a.velocity.x,
                vy: a.velocity.y,
                vz: a.velocity.z
            })),
            birds: birds.map(b => ({
                x: b.mesh.position.x,
                y: b.mesh.position.y,
                z: b.mesh.position.z,
                rotation: b.mesh.rotation.y,
                angle: b.angle
            })),
            bombs: bombs.map(b => ({
                x: b.mesh.position.x,
                y: b.mesh.position.y,
                z: b.mesh.position.z,
                vy: b.velocity.y
            })),
            bullets: bullets.filter(b => !b.isRemote).map(b => ({
                x: b.mesh.position.x,
                y: b.mesh.position.y,
                z: b.mesh.position.z,
                vx: b.velocity.x,
                vy: b.velocity.y,
                vz: b.velocity.z
            })),
            dragon: dragon ? {
                x: dragon.mesh.position.x,
                y: dragon.mesh.position.y,
                z: dragon.mesh.position.z,
                rotation: dragon.mesh.rotation.y,
                rotationX: dragon.mesh.rotation.x,
                rotationZ: dragon.mesh.rotation.z,
                alive: dragon.alive,
                health: dragon.health,
                isFlying: dragon.isFlying
            } : null,
            extraDragons: extraDragons.map(d => ({
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
            fireballs: fireballs.map(f => ({
                x: f.mesh.position.x,
                y: f.mesh.position.y,
                z: f.mesh.position.z,
                vx: f.velocity.x,
                vy: f.velocity.y,
                vz: f.velocity.z
            })),
            tornados: mummyTornados.map(t => ({
                x: t.mesh.position.x,
                y: t.mesh.position.y,
                z: t.mesh.position.z,
                vx: t.velocity.x,
                vz: t.velocity.z,
                spinPhase: t.spinPhase
            })),
            lavaTrails: lavaTrails.map(lt => ({
                id: lt.id,
                x: lt.x,
                z: lt.z,
                createdAt: lt.createdAt,
                creatorId: lt.creatorId
            })),
            items: {
                materials: materials.map(m => m.collected),
                ammoPickups: ammoPickups.map(a => a.collected),
                healthPickups: healthPickups.map(h => h.collected),
                scarabs: scarabPickups.map(s => s.collected),
                kiteCollected: worldKiteCollected,
                icePowerCollected: icePowerCollected
            },
            gameState: {
                bridgeRepaired: bridgeRepaired,
                materialsCollected: materialsCollected,
                scarabsCollected: scarabsCollected,
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
                otherPlayerHealth = data.hostPlayer.health;
            }
            // Update kite visibility based on gliding state
            if (otherPlayerMesh.kiteGroup) {
                otherPlayerMesh.kiteGroup.visible = data.hostPlayer.isGliding === true;
            }
        }
        
        // Update goblins (only if array lengths match - skip during level transitions)
        if (data.goblins && data.goblins.length === goblins.length) {
            data.goblins.forEach((gobData, i) => {
                const gob = goblins[i];
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
            });
        }
        
        // Update guardian arrows
        if (data.guardianArrows && guardianArrows) {
            // Remove old arrows that don't exist anymore
            while (guardianArrows.length > data.guardianArrows.length) {
                const arrow = guardianArrows.pop();
                scene.remove(arrow.mesh);
            }
            
            // Update existing arrows and create new ones
            data.guardianArrows.forEach((arrowData, i) => {
                if (i < guardianArrows.length) {
                    guardianArrows[i].mesh.position.set(arrowData.x, arrowData.y, arrowData.z);
                    if (arrowData.rotationZ !== undefined) {
                        guardianArrows[i].mesh.rotation.z = arrowData.rotationZ;
                    }
                    // Store velocity for optimistic updates
                    if (arrowData.vx !== undefined) {
                        guardianArrows[i].velocity.set(arrowData.vx, arrowData.vy, arrowData.vz);
                    }
                } else {
                    // Create new arrow on client
                    const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
                    const arrowMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                    const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
                    arrowMesh.castShadow = true;
                    arrowMesh.position.set(arrowData.x, arrowData.y, arrowData.z);
                    scene.add(arrowMesh);
                    
                    const tipGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
                    const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
                    const tipMesh = new THREE.Mesh(tipGeometry, tipMaterial);
                    tipMesh.position.y = 0.5;
                    arrowMesh.add(tipMesh);
                    
                    arrowMesh.rotation.x = Math.PI / 2;
                    if (arrowData.rotationZ !== undefined) {
                        arrowMesh.rotation.z = arrowData.rotationZ;
                    }
                    
                    guardianArrows.push({
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
                if (i < birds.length) {
                    birds[i].mesh.position.x = birdData.x;
                    birds[i].mesh.position.y = birdData.y;
                    birds[i].mesh.position.z = birdData.z;
                    birds[i].mesh.rotation.y = birdData.rotation;
                    birds[i].angle = birdData.angle;
                }
            });
        }
        
        // Update bombs
        if (data.bombs) {
            // Remove excess bombs
            while (bombs.length > data.bombs.length) {
                const removed = bombs.pop();
                scene.remove(removed.mesh);
            }
            
            // Update or create bombs
            data.bombs.forEach((bombData, i) => {
                if (i < bombs.length) {
                    // Update existing bomb
                    bombs[i].mesh.position.x = bombData.x;
                    bombs[i].mesh.position.y = bombData.y;
                    bombs[i].mesh.position.z = bombData.z;
                    bombs[i].velocity.y = bombData.vy;
                } else {
                    // Create new bomb
                    const bombGeometry = new THREE.SphereGeometry(0.3, 8, 8);
                    const bombMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
                    const bombMesh = new THREE.Mesh(bombGeometry, bombMaterial);
                    bombMesh.position.set(bombData.x, bombData.y, bombData.z);
                    bombMesh.castShadow = true;
                    scene.add(bombMesh);
                    
                    bombs.push({
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
            bridgeRepaired = data.gameState.bridgeRepaired;
            materialsCollected = data.gameState.materialsCollected;
            
            // Update bridge visibility
            if (bridgeRepaired) {
                brokenBridgeGroup.visible = false;
                bridgeObj.mesh.visible = true;
            }
        }
        
        // Update dragon state
        if (data.dragon) {
            if (!dragon && currentDifficulty === 'hard') {
                // Create dragon if it doesn't exist yet
                dragon = createDragon();
                scene.add(dragon.mesh);
            }
            if (dragon) {
                dragon.mesh.position.set(data.dragon.x, data.dragon.y, data.dragon.z);
                dragon.mesh.rotation.y = data.dragon.rotation;
                dragon.mesh.rotation.x = data.dragon.rotationX || 0;
                dragon.mesh.rotation.z = data.dragon.rotationZ || 0;
                
                // Handle dragon death on client
                const wasAlive = dragon.alive;
                dragon.alive = data.dragon.alive;
                dragon.health = data.dragon.health;
                dragon.isFlying = data.dragon.isFlying || false;
                
                // If dragon just died, trigger death effects on client
                if (wasAlive && !dragon.alive && !dragon.deathTime) {
                    dragon.deathTime = Date.now();
                    Audio.playGoblinDeathSound();
                    
                    // Start massive camera shake
                    dragonDeathShakeUntil = Date.now() + 1200; // 1.2 seconds
                    dragonDeathShakeIntensity = 1.0;
                    
                    // Capture position before hiding mesh
                    const deathX = dragon.mesh.position.x;
                    const deathY = dragon.mesh.position.y;
                    const deathZ = dragon.mesh.position.z;
                    
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
                    dragon.mesh.visible = false;
                }
            }
        }
        
        // Update extra dragons state
        if (data.extraDragons && extraDragons.length > 0) {
            data.extraDragons.forEach((dragonData, i) => {
                if (i >= extraDragons.length) return;
                const extraDragon = extraDragons[i];
                
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
                }
            });
        }
        
        // Update fireballs
        if (data.fireballs) {
            // Remove old fireballs
            while (fireballs.length > data.fireballs.length) {
                const fb = fireballs.pop();
                scene.remove(fb.mesh);
            }
            // Update existing and create new fireballs
            data.fireballs.forEach((fbData, i) => {
                if (i < fireballs.length) {
                    fireballs[i].mesh.position.set(fbData.x, fbData.y, fbData.z);
                    fireballs[i].velocity.set(fbData.vx, fbData.vy, fbData.vz);
                } else {
                    const fbTextures = getTerrainTextures(THREE);
                    
                    // Use ice-themed textures for winter level
                    const fireballTexture = iceTheme ? fbTextures.fireballIce : fbTextures.fireball;
                    const explosionTexture = iceTheme ? fbTextures.explosionIce : fbTextures.explosion;
                    
                    // Create fireball group with core, glow, and flames
                    const fireballGroup = new THREE.Group();
                    
                    // Core sphere
                    const coreGeometry = new THREE.SphereGeometry(0.6, 12, 12);
                    const coreMaterial = new THREE.MeshBasicMaterial({ 
                        map: fireballTexture,
                        transparent: true
                    });
                    const core = new THREE.Mesh(coreGeometry, coreMaterial);
                    fireballGroup.add(core);
                    
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
                    scene.add(fireballGroup);
                    fireballs.push({
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
            while (mummyTornados.length > data.tornados.length) {
                const t = mummyTornados.pop();
                scene.remove(t.mesh);
            }
            // Update existing and create new tornados
            data.tornados.forEach((tData, i) => {
                if (i < mummyTornados.length) {
                    mummyTornados[i].mesh.position.set(tData.x, tData.y, tData.z);
                    mummyTornados[i].velocity.set(tData.vx, 0, tData.vz);
                    mummyTornados[i].spinPhase = tData.spinPhase;
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
                    scene.add(tornadoGroup);
                    
                    mummyTornados.push({
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
            const existingIds = new Set(lavaTrails.map(lt => lt.id));
            const newIds = new Set(data.lavaTrails.map(lt => lt.id));
            
            // Remove trails that no longer exist
            for (let i = lavaTrails.length - 1; i >= 0; i--) {
                if (!newIds.has(lavaTrails[i].id)) {
                    scene.remove(lavaTrails[i].mesh);
                    lavaTrails.splice(i, 1);
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
                    scene.add(trailGroup);
                    
                    lavaTrails.push({
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
        
        // Update item collection states
        if (data.items) {
            if (data.items.materials) {
                data.items.materials.forEach((collected, i) => {
                    if (materials[i] && collected && !materials[i].collected) {
                        materials[i].collected = true;
                        materials[i].mesh.visible = false;
                    }
                });
            }
            if (data.items.ammoPickups) {
                data.items.ammoPickups.forEach((collected, i) => {
                    if (ammoPickups[i] && collected && !ammoPickups[i].collected) {
                        ammoPickups[i].collected = true;
                        ammoPickups[i].mesh.visible = false;
                    }
                });
            }
            if (data.items.healthPickups) {
                data.items.healthPickups.forEach((collected, i) => {
                    if (healthPickups[i] && collected && !healthPickups[i].collected) {
                        healthPickups[i].collected = true;
                        healthPickups[i].mesh.visible = false;
                    }
                });
            }
            
            // Update kite state
            if (data.items.kiteCollected && !worldKiteCollected) {
                worldKiteCollected = true;
                player.hasKite = true;
                player.glideCharge = player.maxGlideCharge; // Full charge immediately for other player too
                scene.remove(worldKiteGroup);
            }
            
            // Update ice power state
            if (data.items.icePowerCollected !== undefined) {
                if (data.items.icePowerCollected && !icePowerCollected) {
                    icePowerCollected = true;
                    hasIcePower = true;
                }
            }
            
            // Update scarab collection state
            if (data.items.scarabs) {
                data.items.scarabs.forEach((collected, i) => {
                    if (scarabPickups[i] && collected && !scarabPickups[i].collected) {
                        scarabPickups[i].collected = true;
                        scene.remove(scarabPickups[i].mesh);
                    }
                });
            }
        }
        
        // Update scarab count from game state
        if (data.gameState && data.gameState.scarabsCollected !== undefined) {
            scarabsCollected = data.gameState.scarabsCollected;
        }
    }

    const player = {
        mesh: playerGroup,
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
    const keys = {
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
    let gamepad = null;
    let lastShootTime = 0;
    let lastKiteActivationTime = 0;
    let lastIcePowerTime = 0;
    const shootCooldown = 200; // ms between shots
    const kiteActivationCooldown = 300; // ms between kite activations
    const icePowerCooldown = 10000; // 10 seconds between ice power uses

    window.addEventListener('gamepadconnected', (e) => {
        // In splitscreen mode, only use the assigned controller
        if (isSplitscreen) {
            if (e.gamepad.index === controllerIndex) {
                gamepad = e.gamepad;
            }
        } else {
            gamepad = e.gamepad;
        }
    }, { signal: eventSignal });

    window.addEventListener('gamepaddisconnected', (e) => {
        if (!isSplitscreen || e.gamepad.index === controllerIndex) {
            gamepad = null;
        }
    }, { signal: eventSignal });

    function updateGamepad() {
        // In splitscreen mode, use specific controller index
        const gamepads = navigator.getGamepads();
        if (isSplitscreen) {
            gamepad = gamepads[controllerIndex];
        } else if (gamepad) {
            gamepad = gamepads[gamepad.index];
        } else {
            // In single player, poll for any connected gamepad if we don't have one
            // This handles the case where the game reinitializes (level change) after gamepad was connected
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    gamepad = gamepads[i];
                    break;
                }
            }
        }
        
        if (!gamepad) return;
        
        const now = Date.now();
        
        // Left stick for rotation and movement (axes 0 and 1)
        const leftStickX = gamepad.axes[0];
        const leftStickY = gamepad.axes[1];
        const deadzone = 0.15;
        
        // Horizontal rotation
        if (Math.abs(leftStickX) > deadzone) {
            player.rotation -= leftStickX * 0.03;
        }
        
        // Vertical movement with analog scaling
        if (Math.abs(leftStickY) > deadzone) {
            if (leftStickY < 0) {
                // Forward
                keys.w = true;
                keys.s = false;
                player.gamepadMoveScale = Math.abs(leftStickY);
            } else {
                // Backward
                keys.w = false;
                keys.s = true;
                player.gamepadMoveScale = Math.abs(leftStickY);
            }
        } else {
            // R2 (button 7) for forward, L2 (button 6) for backward
            const r2Value = gamepad.buttons[7]?.value || 0;
            const l2Value = gamepad.buttons[6]?.value || 0;
            
            keys.w = r2Value > 0.1;
            keys.s = l2Value > 0.1;
            player.gamepadMoveScale = Math.max(r2Value, l2Value);
        }
        
        keys.a = false;
        keys.d = false;
        
        // X (button 0) for shooting
        if (gamepad.buttons[0]?.pressed && now - lastShootTime > shootCooldown) {
            shootBullet();
            lastShootTime = now;
        }
        
        // Triangle (button 2) for kite
        // Check if either player has collected the kite
        const anyoneHasKite = player.hasKite || worldKiteCollected;
        if (gamepad.buttons[2]?.pressed && anyoneHasKite && !gameWon && !gameDead && now - lastKiteActivationTime > kiteActivationCooldown) {
            if (!player.isGliding && player.glideCharge >= 20) {
                // Start gliding
                player.isGliding = true;
                player.glideState = 'takeoff';
                player.glideLiftProgress = 0;
                kiteGroup.visible = true;
                lastKiteActivationTime = now;
            } else if (player.isGliding && player.glideState === 'flying') {
                // Exit gliding
                player.glideState = 'landing';
                lastKiteActivationTime = now;
            }
        }
        
        // Y button (button 3) for ice power
        if (gamepad.buttons[3]?.pressed && hasIcePower && !gameWon && !gameDead && now - lastIcePowerTime >= icePowerCooldown) {
            activateIcePower();
        }
        
        // Circle button (button 1) for banana placement
        if (!bananaButtonWasPressed && gamepad.buttons[1]?.pressed && hasBananaPower && bananaInventory > 0 && !gameWon && !gameDead) {
            placeBanana();
            bananaButtonWasPressed = true;
        } else if (!gamepad.buttons[1]?.pressed) {
            bananaButtonWasPressed = false;
        }
        
        // R1/Right Bumper (button 5) for bomb placement
        if (!bombButtonWasPressed && gamepad.buttons[5]?.pressed && bombInventory > 0 && !gameWon && !gameDead) {
            placeBomb();
            bombButtonWasPressed = true;
        } else if (!gamepad.buttons[5]?.pressed) {
            bombButtonWasPressed = false;
        }
        
        // Options (button 9) for restart
        if (gamepad.buttons[9]?.pressed && (gameWon || gameDead)) {
            resetGame();
        }
    }

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
        // Reset banana key debounce
        if (e.key === 'b' || e.key === 'B') {
            keys.bananaKeyPressed = false;
        }
        // Reset bomb key debounce
        if (e.key === 'x' || e.key === 'X') {
            keys.bombKeyPressed = false;
        }
    }, { signal: eventSignal });

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
        const anyoneHasKite = player.hasKite || worldKiteCollected;
        if ((e.key === 'f' || e.key === 'F') && anyoneHasKite && !gameWon && !gameDead) {
            if (!player.isGliding && player.glideCharge >= 20) {
                // Start gliding
                player.isGliding = true;
                player.glideState = 'takeoff';
                player.glideLiftProgress = 0;
                kiteGroup.visible = true;
            } else if (player.isGliding && player.glideState === 'flying') {
                // Exit gliding
                player.glideState = 'landing';
            }
        }
        // Ice power activation
        if ((e.key === 'e' || e.key === 'E') && hasIcePower && !gameWon && !gameDead) {
            activateIcePower();
            e.preventDefault();
        }
        // Banana placement (debounced)
        if ((e.key === 'b' || e.key === 'B') && hasBananaPower && bananaInventory > 0 && !gameWon && !gameDead) {
            if (!keys.bananaKeyPressed) {
                placeBanana();
                keys.bananaKeyPressed = true;
            }
            e.preventDefault();
        }
        // Bomb placement (debounced)
        if ((e.key === 'x' || e.key === 'X') && bombInventory > 0 && !gameWon && !gameDead) {
            if (!keys.bombKeyPressed) {
                placeBomb();
                keys.bombKeyPressed = true;
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
    }, { signal: eventSignal });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
            e.preventDefault();
        }
    }, { signal: eventSignal });

    // Mouse controls for rotation
    let isPointerLocked = false;

    container.addEventListener('click', () => {
        if (!isPointerLocked) {
            container.requestPointerLock = container.requestPointerLock || 
                                           container.mozRequestPointerLock || 
                                           container.webkitRequestPointerLock;
            container.requestPointerLock();
        }
    }, { signal: eventSignal });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === container;
    }, { signal: eventSignal });

    document.addEventListener('mousemove', (e) => {
        if (isPointerLocked) {
            const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            player.rotation -= deltaX * 0.003;
        }
    }, { signal: eventSignal });

    // Trees - use level config if available, otherwise use default positions
    const trees = [];
    const treePositions = levelConfig.treePositions || [
        { x: -10, z: -15 }, { x: 10, z: -16 }, { x: 0, z: -18 },
        { x: -25, z: -30 }, { x: 20, z: -35 }, { x: -15, z: -45 },
        { x: 30, z: -25 }, { x: -35, z: 15 }, { x: 40, z: 20 },
        { x: -45, z: 25 }, { x: 50, z: 30 }, { x: -20, z: 40 },
        { x: 35, z: 45 }, { x: -50, z: -20 }, { x: 55, z: -25 }
    ];

    treePositions.forEach(pos => {
        const treeGroup = new THREE.Group();
        
        // Get cached textures from terrain.js
        const textures = getTerrainTextures(THREE);
        
        const treeType = pos.type || 'tree';
        
        if (treeType === 'cactus') {
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
            
        } else {
            // Regular tree
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
            const trunkMaterial = new THREE.MeshLambertMaterial({ 
                map: textures.bark,
                color: iceTheme ? 0x889999 : 0xccbbaa
            });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;
            trunk.castShadow = true;
            treeGroup.add(trunk);
            
            const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
            const foliageMaterial = new THREE.MeshLambertMaterial({ 
                map: iceTheme ? textures.foliageIce : textures.foliage,
                color: treeColor
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 2.5;
            foliage.castShadow = true;
            treeGroup.add(foliage);
        }
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        treeGroup.position.set(pos.x, terrainHeight, pos.z);
        scene.add(treeGroup);
        trees.push({ mesh: treeGroup, type: treeType, radius: treeType === 'cactus' ? 0.5 : 1.5 });
    });

    // Rocks - use level config if available, otherwise use default positions
    const rocks = [];
    const rockPositions = levelConfig.rockPositions || [
        { x: -8, z: 8 }, { x: -3, z: 7 }, { x: 5, z: 8 }, { x: 10, z: 7 },
        { x: -20, z: 25 }, { x: 15, z: 30 }, { x: -10, z: 35 },
        { x: -18, z: 5 }, { x: 22, z: 10 }, { x: -25, z: -5 }, { x: 30, z: -2 }
    ];

    rockPositions.forEach(pos => {
        const rockGeometry = new THREE.DodecahedronGeometry(0.6, 0);
        const rockColor = desertTheme ? 0xa08060 : 0x808080; // Sandstone color for desert
        const rockMaterial = new THREE.MeshLambertMaterial({ color: rockColor });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        rock.position.set(pos.x, terrainHeight + 0.6, pos.z);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
        rocks.push({ mesh: rock, type: 'rock', radius: 0.8 });
    });
    
    // Boulders - large rocks for desert level
    const boulders = [];
    const boulderPositions = levelConfig.boulderPositions || [];
    
    boulderPositions.forEach(pos => {
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
        scene.add(boulderGroup);
        boulders.push({ mesh: boulderGroup, type: 'boulder', radius: 3.0 });
    });

    // Pyramids for desert atmosphere
    const pyramidPositions = levelConfig.pyramids || [];
    pyramidPositions.forEach(pyramid => {
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
        scene.add(pyramidGroup);
    });

    // Scarab and canyon wall tracking
    const scarabPickups = [];
    const canyonWalls = [];
    let scarabsCollected = 0;
    let totalScarabs = 0;

    // Canyon walls - create impassable rock walls for chokepoints
    const canyonWallPositions = levelConfig.canyonWalls || [];
    canyonWallPositions.forEach(wall => {
        const wallGroup = new THREE.Group();
        
        // Main wall - rocky cliff face
        const wallWidth = wall.width || 40;
        const wallDepth = wall.depth || 8;
        const wallHeight = wall.height || 12;
        
        // Generate a procedural rock texture for canyon walls
        const rockCanvas = document.createElement('canvas');
        rockCanvas.width = 128;
        rockCanvas.height = 128;
        const rockCtx = rockCanvas.getContext('2d');
        
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
        
        const rockTexture = new THREE.CanvasTexture(rockCanvas);
        rockTexture.wrapS = THREE.RepeatWrapping;
        rockTexture.wrapT = THREE.RepeatWrapping;
        rockTexture.repeat.set(2, 2);
        
        // Create irregular cliff using multiple jagged shapes
        const segmentCount = Math.floor(wallWidth / 3);
        for (let s = 0; s < segmentCount; s++) {
            const segWidth = 3 + Math.random() * 2;
            const segHeight = wallHeight * (0.6 + Math.random() * 0.5);
            const segDepth = wallDepth * (0.5 + Math.random() * 0.5);
            
            // Use irregular dodecahedron for more rugged look
            const segGeometry = s % 3 === 0 
                ? new THREE.DodecahedronGeometry(segWidth * 0.8, 0)
                : new THREE.BoxGeometry(segWidth, segHeight, segDepth);
            
            const segMaterial = new THREE.MeshLambertMaterial({ 
                map: rockTexture,
                color: 0xc0a080  // Consistent sandy color
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
        
        // Add jagged rocks on top for rugged silhouette
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
        
        const terrainHeight = getTerrainHeight(wall.x, wall.z);
        wallGroup.position.set(wall.x, terrainHeight, wall.z);
        wallGroup.rotation.y = wall.rotation || 0;
        scene.add(wallGroup);
        
        // Store for collision - approximate as box
        canyonWalls.push({
            mesh: wallGroup,
            x: wall.x,
            z: wall.z,
            width: wallWidth,
            depth: wallDepth,
            height: wallHeight,
            rotation: wall.rotation || 0
        });
    });
    
    // Scarab collectibles - ancient gems needed to unlock treasure
    const scarabPositions = levelConfig.scarabs || [];
    totalScarabs = scarabPositions.length;
    scarabsCollected = 0;
    
    scarabPositions.forEach((pos, idx) => {
        const scarabGroup = new THREE.Group();
        
        // Scarab body - beetle shape
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
        scarabGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 6, 6);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 0.3, 0.6);
        scarabGroup.add(head);
        
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
        scarabGroup.add(wings);
        
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
        scarabGroup.add(aura);
        scarabGroup.aura = aura;
        
        const terrainHeight = getTerrainHeight(pos.x, pos.z);
        scarabGroup.position.set(pos.x, terrainHeight + 0.5, pos.z);
        scene.add(scarabGroup);
        
        scarabPickups.push({
            mesh: scarabGroup,
            collected: false,
            x: pos.x,
            z: pos.z,
            bobPhase: idx * 0.5 // Different phase for each
        });
    });

    // Grass bushels (fewer or none in desert, none in water)
    const grassBushels = [];
    const grassCount = waterTheme ? 0 : (desertTheme ? 50 : 400); // No grass in water, sparse in desert
    for (let i = 0; i < grassCount; i++) {
        const x = (Math.random() - 0.5) * 280;
        const z = (Math.random() - 0.5) * 280;
        
        // Skip if too close to river
        if (Math.abs(z) < 4) continue;
        
        const grassGroup = new THREE.Group();
        
        // Create 5-8 grass blades per bushel (smaller in desert)
        const bladeCount = desertTheme ? 2 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 4);
        for (let j = 0; j < bladeCount; j++) {
            const bladeHeight = desertTheme ? 0.2 + Math.random() * 0.15 : 0.4 + Math.random() * 0.3;
            const bladeGeometry = new THREE.ConeGeometry(0.05, bladeHeight, 3);
            const bladeMaterial = new THREE.MeshLambertMaterial({ 
                color: desertTheme ? 0x8B7355 : grassColor, // Brown-ish dead grass in desert
                flatShading: true
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
        scene.add(grassGroup);
        grassBushels.push({
            mesh: grassGroup,
            baseHeight: terrainHeight,
            phase: Math.random() * Math.PI * 2
        });
    }
    
    // Extra grass in dragon boss area (skip for desert and water)
    if (!desertTheme && !waterTheme) {
        for (let i = 0; i < 150; i++) {
            const x = (Math.random() - 0.5) * 80; // x: -40 to 40
            const z = -210 - Math.random() * 55; // z: -210 to -265
            
            const grassGroup = new THREE.Group();
            const bladeCount = 5 + Math.floor(Math.random() * 4);
            for (let j = 0; j < bladeCount; j++) {
                const bladeGeometry = new THREE.ConeGeometry(0.05, 0.4 + Math.random() * 0.3, 3);
                const bladeMaterial = new THREE.MeshLambertMaterial({ 
                    color: grassColor,
                    flatShading: true
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
            scene.add(grassGroup);
            grassBushels.push({
                mesh: grassGroup,
                baseHeight: terrainHeight,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    // Ammo pickups
    const ammoPickups = [];
    const ammoPositions = levelConfig.ammoPositions;

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

    // Bomb pickups
    const bombPickups = [];
    const bombPositions = levelConfig.bombPositions;

    bombPositions.forEach(pos => {
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
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 1.0
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
        scene.add(bombGroup);
        bombPickups.push({ mesh: bombGroup, collected: false, radius: 1.5 });
    });

    // Health pickups (hearts)
    const healthPickups = [];
    const heartPositions = levelConfig.healthPositions;

    heartPositions.forEach(pos => {
        const heartGroup = new THREE.Group();
        
        // Create heart shape using two spheres and a rotated box
        const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const heartMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 0.3
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
        scene.add(heartGroup);
        healthPickups.push({ mesh: heartGroup, collected: false, radius: 1.2 });
    });

    // Materials for bridge repair - only if level has materials
    const materials = [];
    const materialConfigs = levelConfig.materials || [];
    const hasMaterials = levelConfig.hasMaterials !== false && materialConfigs.length > 0;

    if (hasMaterials) {
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
    }

    // Traps
    const traps = [];
    const trapPositions = levelConfig.trapPositions;

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
        const textures = getTerrainTextures(THREE);
        const goblinGrp = new THREE.Group();
        
        if (waterTheme) {
            // Shark fin - triangle sticking out of water
            const finGeometry = new THREE.ConeGeometry(0.5, 2.5, 3);
            const finMaterial = new THREE.MeshLambertMaterial({ color: 0x2a3a4a });
            const fin = new THREE.Mesh(finGeometry, finMaterial);
            fin.position.y = 1.0;
            fin.castShadow = true;
            goblinGrp.add(fin);
            
            // Small dorsal detail
            const detailGeometry = new THREE.ConeGeometry(0.15, 0.5, 3);
            const detail = new THREE.Mesh(detailGeometry, finMaterial);
            detail.position.set(0, 0.3, -0.4);
            goblinGrp.add(detail);
        } else {
            const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
            const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinArmor });
            const goblinBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
            goblinBody.position.y = 0.8;
            goblinBody.castShadow = true;
            goblinGrp.add(goblinBody);
        
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
        const goblinHead = new THREE.Mesh(headGeometry, headMaterial);
        goblinHead.position.y = 1.5;
        goblinHead.castShadow = true;
        goblinGrp.add(goblinHead);
        
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            map: textures.goblinEye,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.15, 1.5, 0.35);
        goblinGrp.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.5, 0.35);
        goblinGrp.add(eye2);
        
        const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
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
        }
        
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
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight
        };
    }

    // Guardian goblin helper
    function createGuardianGoblin(x, z, patrolLeft, patrolRight, speed = 0.014) {
        const textures = getTerrainTextures(THREE);
        const goblinGrp = new THREE.Group();
        
        if (waterTheme) {
            // Octopus body
            const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            bodyGeometry.scale(1, 1.2, 1);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B008B });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.2;
            body.castShadow = true;
            goblinGrp.add(body);
            
            // Eyes
            const eyeGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.3, 1.4, 0.6);
            goblinGrp.add(eye1);
            
            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.3, 1.4, 0.6);
            goblinGrp.add(eye2);
            
            const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const pupil1 = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil1.position.set(-0.3, 1.4, 0.68);
            goblinGrp.add(pupil1);
            
            const pupil2 = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil2.position.set(0.3, 1.4, 0.68);
            goblinGrp.add(pupil2);
            
            // 8 Tentacles in a circle
            const tentacleGeometry = new THREE.CylinderGeometry(0.12, 0.06, 1.5, 6);
            const tentacleMaterial = new THREE.MeshLambertMaterial({ color: 0x9932CC });
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const tentacle = new THREE.Mesh(tentacleGeometry, tentacleMaterial);
                tentacle.position.set(
                    Math.cos(angle) * 0.6,
                    0.3,
                    Math.sin(angle) * 0.6
                );
                tentacle.rotation.z = Math.cos(angle) * 0.3;
                tentacle.rotation.x = Math.sin(angle) * 0.3;
                tentacle.castShadow = true;
                goblinGrp.add(tentacle);
                
                // Store tentacle for animation
                if (!goblinGrp.tentacles) goblinGrp.tentacles = [];
                goblinGrp.tentacles.push({ mesh: tentacle, angle, baseZ: tentacle.rotation.z, baseX: tentacle.rotation.x });
            }
        } else {
            const bodyGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.5);
            const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinArmor });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.0;
            body.castShadow = true;
            goblinGrp.add(body);
        
            const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.8;
            head.castShadow = true;
            goblinGrp.add(head);
        
            const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
            const eyeMaterial = new THREE.MeshBasicMaterial({ 
                map: textures.guardianEye,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e1.position.set(-0.18, 1.8, 0.42);
            goblinGrp.add(e1);
        
            const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e2.position.set(0.18, 1.8, 0.42);
                goblinGrp.add(e2);
        
            const earGeometry = new THREE.ConeGeometry(0.18, 0.5, 4);
            const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
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
        }
        
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
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight
        };
    }

    // Giant guardian helper - huge slow enemy with lots of health
    function createGiant(x, z, patrolLeft, patrolRight, speed = 0.018) {
        const textures = getTerrainTextures(THREE);
        const giantGrp = new THREE.Group();
        
        // Use theme-appropriate textures
        const giantSkinTexture = lavaTheme ? textures.giantSkinLava : textures.giantSkin;
        const giantArmorTexture = lavaTheme ? textures.giantArmorLava : textures.giantArmor;
        const giantEyeTexture = lavaTheme ? textures.giantEyeLava : textures.giantEye;
        
        // Massive cylindrical body
        const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.8, 5.0, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ map: giantSkinTexture });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3.5;
        body.castShadow = true;
        giantGrp.add(body);
        
        // Add armor plates on body
        const plateGeometry = new THREE.BoxGeometry(2.0, 0.4, 2.2);
        const plateMaterial = new THREE.MeshLambertMaterial({ map: giantArmorTexture });
        for (let i = 0; i < 4; i++) {
            const plate = new THREE.Mesh(plateGeometry, plateMaterial);
            plate.position.y = 2.0 + (i * 1.2);
            plate.castShadow = true;
            giantGrp.add(plate);
        }
        
        // Large head with horns
        const headGeometry = new THREE.BoxGeometry(1.8, 1.5, 1.6);
        const headMaterial = new THREE.MeshLambertMaterial({ map: textures.giantSkin });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 6.5;
        head.castShadow = true;
        giantGrp.add(head);
        
        // Horns
        const hornGeometry = new THREE.ConeGeometry(0.3, 1.2, 6);
        const hornMaterial = new THREE.MeshLambertMaterial({ map: textures.giantArmor });
        
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(-0.9, 7.5, 0);
        leftHorn.rotation.z = -0.3;
        leftHorn.castShadow = true;
        giantGrp.add(leftHorn);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(0.9, 7.5, 0);
        rightHorn.rotation.z = 0.3;
        rightHorn.castShadow = true;
        giantGrp.add(rightHorn);
        
        // Glowing eyes with texture
        const eyeGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            map: giantEyeTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.5, 6.5, 0.9);
        giantGrp.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.5, 6.5, 0.9);
        giantGrp.add(e2);
        
        // Massive club-like arms
        const armGeometry = new THREE.CylinderGeometry(0.4, 0.8, 4.0, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ map: giantSkinTexture });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-2.2, 4.0, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        giantGrp.add(leftArm);
        giantGrp.leftArm = leftArm; // Store for animation
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(2.2, 4.0, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        giantGrp.add(rightArm);
        giantGrp.rightArm = rightArm; // Store for animation
        
        // Giant fists
        const fistGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const fistMaterial = new THREE.MeshLambertMaterial({ map: giantSkinTexture });
        
        const leftFist = new THREE.Mesh(fistGeometry, fistMaterial);
        leftFist.position.set(-2.8, 1.8, 0);
        leftFist.castShadow = true;
        giantGrp.add(leftFist);
        giantGrp.leftFist = leftFist; // Store for animation
        
        const rightFist = new THREE.Mesh(fistGeometry, fistMaterial);
        rightFist.position.set(2.8, 1.8, 0);
        rightFist.castShadow = true;
        giantGrp.add(rightFist);
        giantGrp.rightFist = rightFist; // Store for animation
        
        // Thick legs
        const legGeometry = new THREE.CylinderGeometry(0.7, 0.9, 3.5, 8);
        const leftLeg = new THREE.Mesh(legGeometry, armMaterial);
        leftLeg.position.set(-0.9, 1.2, 0);
        leftLeg.castShadow = true;
        giantGrp.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, armMaterial);
        rightLeg.position.set(0.9, 1.2, 0);
        rightLeg.castShadow = true;
        giantGrp.add(rightLeg);
        
        giantGrp.position.set(x, getTerrainHeight(x, z), z);
        scene.add(giantGrp);
        
        return {
            mesh: giantGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 6.0,  // Very wide damage range
            health: 20,
            maxHealth: 20,
            isGiant: true,
            isChasing: false,
            attackAnimationProgress: 0,
            isAttacking: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight
        };
    }

    // Wizard goblin helper - large magic-wielding enemy that shoots fireballs
    function createWizard(x, z, patrolLeft, patrolRight, speed = 0.008) {
        const textures = getTerrainTextures(THREE);
        const wizardGrp = new THREE.Group();
        
        // Use ice theme robe texture if in ice level
        const robeTexture = iceTheme ? textures.wizardRobeIce : textures.wizardRobe;
        
        // Tall robed body (bigger than guardians)
        const bodyGeometry = new THREE.CylinderGeometry(0.6, 1.0, 2.5, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            map: robeTexture,
            color: iceTheme ? 0x6688aa : 0x8866aa  // Tint to enhance texture
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        wizardGrp.add(body);
        
        // Robe details - glowing trim
        const trimGeometry = new THREE.TorusGeometry(0.75, 0.1, 8, 16);
        const trimMaterial = new THREE.MeshBasicMaterial({ 
            color: iceTheme ? 0x00FFFF : 0xFF00FF,
            transparent: true,
            opacity: 0.8
        });
        const bottomTrim = new THREE.Mesh(trimGeometry, trimMaterial);
        bottomTrim.rotation.x = Math.PI / 2;
        bottomTrim.position.y = 0.3;
        wizardGrp.add(bottomTrim);
        
        // Head (larger than guardian)
        const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.0;
        head.castShadow = true;
        wizardGrp.add(head);
        
        // Wizard hat with texture
        const hatGeometry = new THREE.ConeGeometry(0.7, 1.5, 8);
        const hatMaterial = new THREE.MeshLambertMaterial({ 
            map: robeTexture,
            color: iceTheme ? 0x5577aa : 0x7755aa
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 4.0;
        hat.castShadow = true;
        wizardGrp.add(hat);
        
        // Hat brim with glow
        const brimGeometry = new THREE.TorusGeometry(0.75, 0.15, 8, 16);
        const brimMaterial = new THREE.MeshLambertMaterial({ 
            map: robeTexture,
            color: iceTheme ? 0x4466aa : 0x6644aa
        });
        const brim = new THREE.Mesh(brimGeometry, brimMaterial);
        brim.rotation.x = Math.PI / 2;
        brim.position.y = 3.4;
        wizardGrp.add(brim);
        
        // Glowing purple/cyan eyes
        const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: iceTheme ? 0x00FFFF : 0xFF00FF,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.22, 3.0, 0.52);
        wizardGrp.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.22, 3.0, 0.52);
        wizardGrp.add(e2);
        
        // Pointy ears
        const earGeometry = new THREE.ConeGeometry(0.2, 0.6, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
        const er1 = new THREE.Mesh(earGeometry, earMaterial);
        er1.rotation.z = Math.PI / 2;
        er1.position.set(-0.7, 3.0, 0);
        er1.castShadow = true;
        wizardGrp.add(er1);
        
        const er2 = new THREE.Mesh(earGeometry, earMaterial);
        er2.rotation.z = -Math.PI / 2;
        er2.position.set(0.7, 3.0, 0);
        er2.castShadow = true;
        wizardGrp.add(er2);
        
        // Magic staff
        const staffGeometry = new THREE.CylinderGeometry(0.06, 0.08, 3.0, 8);
        const staffMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.8, 1.5, 0.3);
        staff.rotation.z = -0.2;
        staff.castShadow = true;
        wizardGrp.add(staff);
        
        // Glowing orb on staff
        const orbGeometry = new THREE.SphereGeometry(0.25, 12, 12);
        const orbMaterial = new THREE.MeshBasicMaterial({ 
            color: iceTheme ? 0x00FFFF : 0xFF4500,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.9, 3.2, 0.3);
        wizardGrp.add(orb);
        wizardGrp.staffOrb = orb; // Store for animation
        
        wizardGrp.position.set(x, getTerrainHeight(x, z), z);
        scene.add(wizardGrp);
        
        const health = 7;
        
        return {
            mesh: wizardGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 2.0,
            health: health,
            maxHealth: health,
            isWizard: true,
            lastFireTime: Date.now() - Math.random() * 3000,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight,
            orbGlowPhase: Math.random() * Math.PI * 2
        };
    }

    // Mummy helper - desert enemy that casts tornados
    function createMummy(x, z, patrolLeft, patrolRight, speed = 0.008) {
        const textures = getTerrainTextures(THREE);
        const mummyGrp = new THREE.Group();
        
        // Wrapped body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2.2, 12);
        const bandageMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xd4c4a0,  // Aged bandage color
            map: textures.goblinSkin
        });
        const body = new THREE.Mesh(bodyGeometry, bandageMaterial);
        body.position.y = 1.3;
        body.castShadow = true;
        mummyGrp.add(body);
        
        // Bandage strips wrapping around body
        for (let i = 0; i < 6; i++) {
            const stripGeometry = new THREE.TorusGeometry(0.55, 0.05, 4, 16);
            const stripMaterial = new THREE.MeshLambertMaterial({ color: 0xc4b490 });
            const strip = new THREE.Mesh(stripGeometry, stripMaterial);
            strip.rotation.x = Math.PI / 2;
            strip.rotation.z = (i * 0.3);
            strip.position.y = 0.5 + i * 0.35;
            mummyGrp.add(strip);
        }
        
        // Head wrapped in bandages
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd4c4a0 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.7;
        head.castShadow = true;
        mummyGrp.add(head);
        
        // Glowing eyes peeking through bandages
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF88,  // Eerie green glow
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.18, 2.75, 0.42);
        mummyGrp.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.18, 2.75, 0.42);
        mummyGrp.add(e2);
        
        // Tattered bandage arm pieces
        const armGeometry = new THREE.CylinderGeometry(0.12, 0.15, 1.2, 8);
        const arm1 = new THREE.Mesh(armGeometry, bandageMaterial);
        arm1.position.set(-0.65, 1.5, 0);
        arm1.rotation.z = 0.3;
        arm1.castShadow = true;
        mummyGrp.add(arm1);
        
        const arm2 = new THREE.Mesh(armGeometry, bandageMaterial);
        arm2.position.set(0.65, 1.5, 0);
        arm2.rotation.z = -0.3;
        arm2.castShadow = true;
        mummyGrp.add(arm2);
        
        // Floating sand particles around mummy
        const sandGroup = new THREE.Group();
        for (let i = 0; i < 8; i++) {
            const sandGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            const sandMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xc4a14a,
                transparent: true,
                opacity: 0.6
            });
            const sand = new THREE.Mesh(sandGeometry, sandMaterial);
            const angle = (i / 8) * Math.PI * 2;
            sand.position.set(Math.cos(angle) * 0.8, 1.5 + Math.random(), Math.sin(angle) * 0.8);
            sandGroup.add(sand);
        }
        mummyGrp.add(sandGroup);
        mummyGrp.sandParticles = sandGroup;
        
        mummyGrp.position.set(x, getTerrainHeight(x, z), z);
        scene.add(mummyGrp);
        
        const health = 6;
        
        return {
            mesh: mummyGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 1.9,
            health: health,
            maxHealth: health,
            isMummy: true,
            lastFireTime: Date.now() - Math.random() * 4000,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight,
            sandPhase: Math.random() * Math.PI * 2
        };
    }

    // Lava Monster helper - lava caves enemy that shoots fireballs and leaves lava trails
    function createLavaMonster(x, z, patrolLeft, patrolRight, speed = 0.009) {
        const lavaGrp = new THREE.Group();
        
        // Torso - larger, more menacing molten core
        const torsoGeometry = new THREE.SphereGeometry(1.0, 16, 12);
        torsoGeometry.scale(1.0, 1.3, 0.9); // Elongated torso
        const torsoMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff3300,
            transparent: true,
            opacity: 0.9
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 2.2;
        torso.castShadow = true;
        lavaGrp.add(torso);
        
        // Outer rocky armor shell (cracked and jagged)
        const shellGeometry = new THREE.DodecahedronGeometry(1.25, 1);
        shellGeometry.scale(1.0, 1.3, 0.9);
        const shellMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x1a0a05,
            transparent: true,
            opacity: 0.75
        });
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.position.y = 2.2;
        shell.castShadow = true;
        lavaGrp.add(shell);
        
        // Head - angular and intimidating
        const headGeometry = new THREE.DodecahedronGeometry(0.6, 0);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1208 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.5;
        head.castShadow = true;
        lavaGrp.add(head);
        
        // Glowing lava cracks on head
        const headGlowGeometry = new THREE.DodecahedronGeometry(0.55, 0);
        const headGlowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4400,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const headGlow = new THREE.Mesh(headGlowGeometry, headGlowMaterial);
        headGlow.position.y = 3.5;
        lavaGrp.add(headGlow);
        
        // Horns - demonic appearance
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x1a0805 });
        const hornGeometry = new THREE.ConeGeometry(0.15, 0.6, 6);
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(-0.35, 3.9, 0);
        leftHorn.rotation.z = 0.4;
        leftHorn.rotation.x = -0.2;
        lavaGrp.add(leftHorn);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(0.35, 3.9, 0);
        rightHorn.rotation.z = -0.4;
        rightHorn.rotation.x = -0.2;
        lavaGrp.add(rightHorn);
        
        // Eyes - menacing, slitted, glowing
        const eyeGeometry = new THREE.SphereGeometry(0.18, 12, 12);
        eyeGeometry.scale(1.3, 0.7, 1); // Slitted eyes
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.25, 3.55, 0.45);
        lavaGrp.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.25, 3.55, 0.45);
        lavaGrp.add(rightEye);
        
        // Eye glow aura
        const eyeGlowMaterial = new THREE.SpriteMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const leftEyeGlow = new THREE.Sprite(eyeGlowMaterial);
        leftEyeGlow.scale.set(0.5, 0.3, 1);
        leftEyeGlow.position.set(-0.25, 3.55, 0.5);
        lavaGrp.add(leftEyeGlow);
        
        const rightEyeGlow = new THREE.Sprite(eyeGlowMaterial.clone());
        rightEyeGlow.scale.set(0.5, 0.3, 1);
        rightEyeGlow.position.set(0.25, 3.55, 0.5);
        lavaGrp.add(rightEyeGlow);
        
        // Mouth - jagged opening with lava glow
        const mouthGeometry = new THREE.BoxGeometry(0.5, 0.15, 0.2);
        const mouthMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff2200,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 3.25, 0.5);
        lavaGrp.add(mouth);
        
        // ARMS - bulky, molten rock
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1510 });
        const armGlowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4400,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        // Left arm
        const leftArmGroup = new THREE.Group();
        const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8), armMaterial);
        leftUpperArm.position.y = -0.3;
        leftUpperArm.rotation.z = 0.5;
        leftArmGroup.add(leftUpperArm);
        
        const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.9, 8), armMaterial);
        leftForearm.position.set(-0.4, -0.9, 0);
        leftForearm.rotation.z = 0.3;
        leftArmGroup.add(leftForearm);
        
        // Left hand - claw-like
        const leftHand = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), armMaterial);
        leftHand.position.set(-0.6, -1.5, 0);
        leftArmGroup.add(leftHand);
        
        // Lava glow on arm
        const leftArmGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.6, 6), armGlowMaterial);
        leftArmGlow.position.set(-0.2, -0.6, 0);
        leftArmGlow.rotation.z = 0.4;
        leftArmGroup.add(leftArmGlow);
        
        leftArmGroup.position.set(-1.1, 2.5, 0);
        lavaGrp.add(leftArmGroup);
        lavaGrp.leftArm = leftArmGroup;
        
        // Right arm (mirrored)
        const rightArmGroup = new THREE.Group();
        const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8), armMaterial);
        rightUpperArm.position.y = -0.3;
        rightUpperArm.rotation.z = -0.5;
        rightArmGroup.add(rightUpperArm);
        
        const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.9, 8), armMaterial);
        rightForearm.position.set(0.4, -0.9, 0);
        rightForearm.rotation.z = -0.3;
        rightArmGroup.add(rightForearm);
        
        const rightHand = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), armMaterial);
        rightHand.position.set(0.6, -1.5, 0);
        rightArmGroup.add(rightHand);
        
        const rightArmGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.6, 6), armGlowMaterial);
        rightArmGlow.position.set(0.2, -0.6, 0);
        rightArmGlow.rotation.z = -0.4;
        rightArmGroup.add(rightArmGlow);
        
        rightArmGroup.position.set(1.1, 2.5, 0);
        lavaGrp.add(rightArmGroup);
        lavaGrp.rightArm = rightArmGroup;
        
        // LEGS - thick, powerful
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1510 });
        
        // Left leg
        const leftLegGroup = new THREE.Group();
        const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), legMaterial);
        leftThigh.position.y = -0.4;
        leftLegGroup.add(leftThigh);
        
        const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.8, 8), legMaterial);
        leftShin.position.y = -1.1;
        leftLegGroup.add(leftShin);
        
        const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.7), legMaterial);
        leftFoot.position.set(0, -1.6, 0.1);
        leftLegGroup.add(leftFoot);
        
        // Lava glow in leg cracks
        const leftLegGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 6), armGlowMaterial);
        leftLegGlow.position.y = -0.75;
        leftLegGroup.add(leftLegGlow);
        
        leftLegGroup.position.set(-0.5, 1.1, 0);
        lavaGrp.add(leftLegGroup);
        lavaGrp.leftLeg = leftLegGroup;
        
        // Right leg (mirrored)
        const rightLegGroup = new THREE.Group();
        const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), legMaterial);
        rightThigh.position.y = -0.4;
        rightLegGroup.add(rightThigh);
        
        const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.8, 8), legMaterial);
        rightShin.position.y = -1.1;
        rightLegGroup.add(rightShin);
        
        const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.7), legMaterial);
        rightFoot.position.set(0, -1.6, 0.1);
        rightLegGroup.add(rightFoot);
        
        const rightLegGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 6), armGlowMaterial);
        rightLegGlow.position.y = -0.75;
        rightLegGroup.add(rightLegGlow);
        
        rightLegGroup.position.set(0.5, 1.1, 0);
        lavaGrp.add(rightLegGroup);
        lavaGrp.rightLeg = rightLegGroup;
        
        // Glowing lava veins across body
        for (let i = 0; i < 10; i++) {
            const veinGeometry = new THREE.BoxGeometry(0.1, 0.6 + Math.random() * 0.5, 0.1);
            const veinMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff5500,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending
            });
            const vein = new THREE.Mesh(veinGeometry, veinMaterial);
            const angle = (i / 10) * Math.PI * 2;
            vein.position.set(
                Math.cos(angle) * 0.95,
                2.2 + (Math.random() - 0.5) * 0.8,
                Math.sin(angle) * 0.85
            );
            vein.rotation.set(Math.random() * 0.5, Math.random(), Math.random() * 0.5);
            lavaGrp.add(vein);
        }
        
        // Floating ember particles around the monster
        const emberGroup = new THREE.Group();
        for (let i = 0; i < 16; i++) {
            const emberGeometry = new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 6, 6);
            const emberMaterial = new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xff4400 : 0xff8800,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending
            });
            const ember = new THREE.Mesh(emberGeometry, emberMaterial);
            const angle = (i / 16) * Math.PI * 2;
            ember.position.set(
                Math.cos(angle) * (1.5 + Math.random() * 0.5),
                1.5 + Math.random() * 2.5,
                Math.sin(angle) * (1.5 + Math.random() * 0.5)
            );
            emberGroup.add(ember);
        }
        lavaGrp.add(emberGroup);
        lavaGrp.emberParticles = emberGroup;
        
        // Store body parts for animation
        lavaGrp.innerBody = torso;
        lavaGrp.outerShell = shell;
        lavaGrp.head = head;
        lavaGrp.headGlow = headGlow;
        
        lavaGrp.position.set(x, getTerrainHeight(x, z), z);
        scene.add(lavaGrp);
        
        const health = 7;
        
        return {
            mesh: lavaGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 2.2,
            health: health,
            maxHealth: health,
            isLavaMonster: true,
            lastFireTime: Date.now() - Math.random() * 3000,
            lastTrailTime: Date.now() - Math.random() * 500,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight,
            emberPhase: Math.random() * Math.PI * 2,
            pulsePhase: Math.random() * Math.PI * 2
        };
    }

    // Create goblins
    const goblins = [];
    const goblinPositions = levelConfig.goblins;
    const maxGoblins = difficulty === 'easy' ? GAME_CONFIG.EASY_GOBLIN_COUNT : GAME_CONFIG.HARD_GOBLIN_COUNT;
    
    for (let i = 0; i < Math.min(maxGoblins, goblinPositions.length); i++) {
        const pos = goblinPositions[i];
        goblins.push(createGoblin(pos[0], pos[1], pos[2], pos[3], pos[4]));
    }
    
    // Create guardian goblins from level config (both difficulties)
    levelConfig.guardians.forEach(guardian => {
        goblins.push(createGuardianGoblin(guardian[0], guardian[1], guardian[2], guardian[3], guardian[4]));
    });
    
    // Guardians in a ring around treasure (both difficulties, only if level has treasure)
    if (levelConfig.hasTreasure !== false) {
        const treasureGuardX = levelConfig.treasurePosition?.x ?? GAME_CONFIG.TREASURE_X;
        const treasureGuardZ = levelConfig.treasurePosition?.z ?? GAME_CONFIG.TREASURE_Z;
        for (let i = 0; i < GAME_CONFIG.HARD_GUARDIAN_COUNT; i++) {
            const angle = (i / GAME_CONFIG.HARD_GUARDIAN_COUNT) * Math.PI * 2;
            const x = treasureGuardX + Math.cos(angle) * 8;
            const z = treasureGuardZ + Math.sin(angle) * 8;
            goblins.push(createGuardianGoblin(x, z, x - 3, x + 3, 0.014));
        }
    }
    
    // Create special enemies on hard mode only
    if (difficulty === 'hard') {
        // Create giants from level config
        levelConfig.giants.forEach(giant => {
            goblins.push(createGiant(giant[0], giant[1], giant[2], giant[3]));
        });
        
        // Create wizard goblins from level config
        if (levelConfig.wizards) {
            levelConfig.wizards.forEach(wizard => {
                goblins.push(createWizard(wizard[0], wizard[1], wizard[2], wizard[3], wizard[4]));
            });
        }
        
        // Create mummies from level config (desert enemies)
        if (levelConfig.mummies) {
            levelConfig.mummies.forEach(mummy => {
                goblins.push(createMummy(mummy[0], mummy[1], mummy[2], mummy[3], mummy[4]));
            });
        }
        
        // Create lava monsters from level config (lava caves enemies)
        if (levelConfig.lavaMonsters) {
            levelConfig.lavaMonsters.forEach(monster => {
                goblins.push(createLavaMonster(monster[0], monster[1], monster[2], monster[3], monster[4]));
            });
        }
        
        // Additional regular goblins for hard mode
        levelConfig.hardModeGoblins.forEach(goblin => {
            goblins.push(createGoblin(goblin[0], goblin[1], goblin[2], goblin[3], goblin[4]));
        });
    }

    // Rainbow
    const rainbowGroup = new THREE.Group();
    const rainbowColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
    const rainbowLights = [];
    rainbowColors.forEach((color, i) => {
        const radius = 5 - (i * 0.3);
        const arcGeometry = new THREE.TorusGeometry(radius, 0.3, 8, 32, Math.PI);
        const arcMaterial = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.9
        });
        const arc = new THREE.Mesh(arcGeometry, arcMaterial);
        rainbowGroup.add(arc);
        
        // Add a point light for each rainbow color
        const light = new THREE.PointLight(color, 0.8, 25);
        // Position lights along the arc
        const angle = Math.PI * (i / (rainbowColors.length - 1)); // Spread across the arc
        light.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        );
        rainbowGroup.add(light);
        rainbowLights.push(light);
    });
    rainbowGroup.position.set(levelConfig.rainbow.x, 5, levelConfig.rainbow.z + 5);
    rainbowGroup.rotation.y = Math.PI / 2; // Rotate 90 degrees to face player
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
    
    // Only create world kite if defined for this level and not already collected
    if (levelConfig.worldKite) {
        worldKiteGroup.position.set(levelConfig.worldKite.x, getTerrainHeight(levelConfig.worldKite.x, levelConfig.worldKite.z) + 1.5, levelConfig.worldKite.z);
        scene.add(worldKiteGroup);
    }
    
    // Use persistent kite state
    let worldKiteCollected = persistentInventory.hasKite;
    if (worldKiteCollected) {
        player.hasKite = true;
        worldKiteGroup.visible = false;
    }

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

    // Use level-specific treasure position if defined, otherwise use default
    const treasureX = levelConfig.treasurePosition?.x ?? GAME_CONFIG.TREASURE_X;
    const treasureZ = levelConfig.treasurePosition?.z ?? GAME_CONFIG.TREASURE_Z;
    treasureGroup.position.set(treasureX, 0, treasureZ);
    
    // Only add treasure if level has it (default true for backwards compatibility)
    const hasTreasure = levelConfig.hasTreasure !== false;
    if (hasTreasure) {
        scene.add(treasureGroup);
    }

    const treasure = hasTreasure ? { mesh: treasureGroup, radius: 1 } : null;

    // Ice Berg - optional per level
    const iceBergGroup = new THREE.Group();
    let iceBerg = null;
    let hasIcePower = false;
    let icePowerCollected = false;
    
    if (levelConfig.iceBerg) {
        // Main ice berg structure - tall crystalline shape
        const iceBergGeometry = new THREE.ConeGeometry(8, 20, 6);
        const iceBergMaterial = new THREE.MeshPhongMaterial({
            color: 0xB0E0E6,
            transparent: true,
            opacity: 0.7,
        shininess: 100,
        specular: 0xFFFFFF
    });
    const iceBergMesh = new THREE.Mesh(iceBergGeometry, iceBergMaterial);
    iceBergMesh.position.y = 10;
    iceBergMesh.castShadow = true;
    iceBergMesh.receiveShadow = true;
    iceBergGroup.add(iceBergMesh);
    
    // Additional ice crystals around the base
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const dist = 6;
        const crystalGeometry = new THREE.ConeGeometry(2, 8, 6);
        const crystal = new THREE.Mesh(crystalGeometry, iceBergMaterial);
        crystal.position.x = Math.cos(angle) * dist;
        crystal.position.z = Math.sin(angle) * dist;
        crystal.position.y = 4;
        crystal.rotation.z = Math.random() * 0.3 - 0.15;
        iceBergGroup.add(crystal);
    }
    
        // Position ice berg on the north side of river, between river and gap
        iceBergGroup.position.set(levelConfig.iceBerg.x, getTerrainHeight(levelConfig.iceBerg.x, levelConfig.iceBerg.z), levelConfig.iceBerg.z);
        scene.add(iceBergGroup);
        
        iceBerg = {
            mesh: iceBergGroup,
            position: { x: levelConfig.iceBerg.x, z: levelConfig.iceBerg.z },
            radius: 12,
            powerRadius: 8 // Radius for collecting ice power
        };
    } // End of iceBerg if block

    // Banana Ice Berg - close to spawn for easy testing
    const bananaIceBergGroup = new THREE.Group();
    
    // Main banana ice berg structure - tall crystalline shape (yellow tinted)
    const bananaIceBergGeometry = new THREE.ConeGeometry(8, 20, 6);
    const bananaIceBergMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFF99, // Yellow tint
        transparent: true,
        opacity: 0.7,
        shininess: 100,
        specular: 0xFFFFFF
    });
    const bananaIceBergMesh = new THREE.Mesh(bananaIceBergGeometry, bananaIceBergMaterial);
    bananaIceBergMesh.position.y = 10;
    bananaIceBergMesh.castShadow = true;
    bananaIceBergMesh.receiveShadow = true;
    bananaIceBergGroup.add(bananaIceBergMesh);
    
    // Additional banana crystals around the base
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const dist = 6;
        const crystalGeometry = new THREE.ConeGeometry(2, 8, 6);
        const crystal = new THREE.Mesh(crystalGeometry, bananaIceBergMaterial);
        crystal.position.x = Math.cos(angle) * dist;
        crystal.position.z = Math.sin(angle) * dist;
        crystal.position.y = 4;
        crystal.rotation.z = Math.random() * 0.3 - 0.15;
        bananaIceBergGroup.add(crystal);
    }
    
    // Position banana ice berg in first area (before first mountain gap)
    bananaIceBergGroup.position.set(-30, getTerrainHeight(-30, -50), -50);
    scene.add(bananaIceBergGroup);
    
    const bananaIceBerg = {
        mesh: bananaIceBergGroup,
        position: { x: -30, z: -50 },
        radius: 12,
        powerRadius: 8
    };
    
    let hasBananaPower = false;
    let bananaPowerCollected = false;
    let bananaInventory = 0; // Number of bananas player has
    const maxBananas = 5;
    
    // Placed bananas array
    const placedBananas = [];
    let worldBananaPowerCollected = false; // Shared collection flag for multiplayer

    // Bomb inventory - use persistent if available
    let bombInventory = persistentInventory.bombs !== null ? persistentInventory.bombs : 0;
    const maxBombs = 3;
    const placedBombs = []; // {id, mesh, x, z, radius, explodeAt}

    // ============================================
    // PORTAL SYSTEM - For level switching
    // ============================================
    const portalGroup = new THREE.Group();
    const portalConfig = levelConfig.portal;
    let portalCooldown = 0; // Prevent immediate re-entry
    let portal = null; // Will be null if no portal for this level
    const portalParticles = [];
    
    // Only create portal if this level has one
    if (portalConfig) {
        // Create portal outer ring (spinning torus)
        const portalRingGeometry = new THREE.TorusGeometry(3, 0.3, 16, 48);
        const portalRingMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const portalRing = new THREE.Mesh(portalRingGeometry, portalRingMaterial);
        portalRing.rotation.x = Math.PI / 2;
        portalGroup.add(portalRing);
        
        // Inner spinning ring
        const portalInnerRingGeometry = new THREE.TorusGeometry(2.2, 0.2, 16, 48);
    const portalInnerRingMaterial = new THREE.MeshPhongMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.8
    });
    const portalInnerRing = new THREE.Mesh(portalInnerRingGeometry, portalInnerRingMaterial);
    portalInnerRing.rotation.x = Math.PI / 2;
    portalGroup.add(portalInnerRing);
    
    // Portal center swirl effect (animated disc)
    const portalCenterGeometry = new THREE.CircleGeometry(2, 32);
    const portalCenterMaterial = new THREE.MeshBasicMaterial({
        color: 0x8800ff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const portalCenter = new THREE.Mesh(portalCenterGeometry, portalCenterMaterial);
    portalCenter.rotation.x = Math.PI / 2;
    portalCenter.position.y = 0.1;
    portalGroup.add(portalCenter);
    
    // Portal particles (floating orbs)
    for (let i = 0; i < 12; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x00ffff : 0xff00ff,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.userData = {
            angle: (i / 12) * Math.PI * 2,
            radius: 2.5,
            speed: 0.02 + Math.random() * 0.02,
            yOffset: Math.random() * 2
        };
        portalGroup.add(particle);
        portalParticles.push(particle);
    }
    
    // Portal base glow
    const portalGlowGeometry = new THREE.CylinderGeometry(4, 4, 0.2, 32);
    const portalGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4400aa,
        transparent: true,
        opacity: 0.4
    });
    const portalGlow = new THREE.Mesh(portalGlowGeometry, portalGlowMaterial);
    portalGlow.position.y = 0.1;
    portalGroup.add(portalGlow);
    
    // Portal pillars (mystical columns on each side)
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, 5, 8);
    const pillarMaterial = new THREE.MeshPhongMaterial({
        color: 0x6600cc,
        emissive: 0x220044,
        emissiveIntensity: 0.4
    });
    
    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    leftPillar.position.set(-3.5, 2.5, 0);
    portalGroup.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    rightPillar.position.set(3.5, 2.5, 0);
    portalGroup.add(rightPillar);
    
    // Pillar top orbs
    const orbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.9
    });
    
    const leftOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    leftOrb.position.set(-3.5, 5.3, 0);
    portalGroup.add(leftOrb);
    
    const rightOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    rightOrb.position.set(3.5, 5.3, 0);
    portalGroup.add(rightOrb);
    
    // Position portal
    const portalY = getTerrainHeight(portalConfig.x, portalConfig.z);
    portalGroup.position.set(portalConfig.x, portalY, portalConfig.z);
    scene.add(portalGroup);
    
    portal = {
        mesh: portalGroup,
        x: portalConfig.x,
        z: portalConfig.z,
        radius: 3,
        destinationLevel: portalConfig.destinationLevel
    };
    } // End of portal creation if block
    
    // Portal animation function (called in game loop) - only if portal exists
    function animatePortal() {
        if (!portal) return;
        
        const time = Date.now() * 0.001;
        
        // Decrease portal cooldown
        if (portalCooldown > 0) {
            portalCooldown--;
        }
        
        // Animate the portal group children
        portalGroup.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'TorusGeometry') {
                child.rotation.z = time * (child.geometry.parameters.radius > 2.5 ? 0.5 : -0.8);
            }
        });
    }
    
    // Level 2 unique elements (ice crystals and frozen lakes)
    const iceCrystals = [];
    const frozenLakes = [];
    
    if (levelConfig.iceCrystals) {
        levelConfig.iceCrystals.forEach(crystal => {
            const crystalGroup = new THREE.Group();
            
            // Main crystal
            const mainCrystalGeometry = new THREE.ConeGeometry(0.8 * crystal.scale, 3 * crystal.scale, 6);
            const crystalMaterial = new THREE.MeshPhongMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0.7,
                shininess: 100,
                specular: 0xffffff
            });
            const mainCrystal = new THREE.Mesh(mainCrystalGeometry, crystalMaterial);
            mainCrystal.position.y = 1.5 * crystal.scale;
            crystalGroup.add(mainCrystal);
            
            // Smaller side crystals
            for (let i = 0; i < 3; i++) {
                const sideGeometry = new THREE.ConeGeometry(0.4 * crystal.scale, 1.5 * crystal.scale, 6);
                const sideCrystal = new THREE.Mesh(sideGeometry, crystalMaterial);
                const angle = (i / 3) * Math.PI * 2 + Math.random();
                sideCrystal.position.x = Math.cos(angle) * 0.8 * crystal.scale;
                sideCrystal.position.z = Math.sin(angle) * 0.8 * crystal.scale;
                sideCrystal.position.y = 0.75 * crystal.scale;
                sideCrystal.rotation.z = (Math.random() - 0.5) * 0.3;
                crystalGroup.add(sideCrystal);
            }
            
            crystalGroup.position.set(crystal.x, getTerrainHeight(crystal.x, crystal.z), crystal.z);
            scene.add(crystalGroup);
            iceCrystals.push({ mesh: crystalGroup, x: crystal.x, z: crystal.z });
        });
    }
    
    if (levelConfig.frozenLakes) {
        levelConfig.frozenLakes.forEach(lake => {
            const lakeGeometry = new THREE.CircleGeometry(lake.radius, 32);
            const lakeMaterial = new THREE.MeshPhongMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.8,
                shininess: 150,
                specular: 0xffffff
            });
            const lakeMesh = new THREE.Mesh(lakeGeometry, lakeMaterial);
            lakeMesh.rotation.x = -Math.PI / 2;
            lakeMesh.position.set(lake.x, getTerrainHeight(lake.x, lake.z) + 0.05, lake.z);
            scene.add(lakeMesh);
            frozenLakes.push({ mesh: lakeMesh, x: lake.x, z: lake.z, radius: lake.radius });
        });
    }
    
    // Level 4 unique elements - lava pools and cave ceiling
    const lavaPools = [];
    let caveCeiling = null;
    
    if (levelConfig.lavaPools) {
        levelConfig.lavaPools.forEach(pool => {
            const poolGroup = new THREE.Group();
            
            // Main lava surface - positioned above ground
            const poolGeometry = new THREE.CircleGeometry(pool.radius, 32);
            const poolMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.95
            });
            const poolMesh = new THREE.Mesh(poolGeometry, poolMaterial);
            poolMesh.rotation.x = -Math.PI / 2;
            poolMesh.position.y = 0.3;
            poolGroup.add(poolMesh);
            
            // Inner brighter core
            const coreGeometry = new THREE.CircleGeometry(pool.radius * 0.6, 32);
            const coreMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.9
            });
            const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
            coreMesh.rotation.x = -Math.PI / 2;
            coreMesh.position.y = 0.35;
            poolGroup.add(coreMesh);
            
            // Hottest center
            const centerGeometry = new THREE.CircleGeometry(pool.radius * 0.25, 32);
            const centerMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.85
            });
            const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);
            centerMesh.rotation.x = -Math.PI / 2;
            centerMesh.position.y = 0.4;
            poolGroup.add(centerMesh);
            
            // Add point light for glow - brighter
            const lavaLight = new THREE.PointLight(0xff4400, 1.5, pool.radius * 4);
            lavaLight.position.y = 3;
            poolGroup.add(lavaLight);
            
            poolGroup.position.set(pool.x, getTerrainHeight(pool.x, pool.z) + 0.1, pool.z);
            scene.add(poolGroup);
            lavaPools.push({ 
                mesh: poolGroup, 
                x: pool.x, 
                z: pool.z, 
                radius: pool.radius,
                pulsePhase: Math.random() * Math.PI * 2
            });
        });
    }
    
    // Create cave ceiling for underground level
    if (levelConfig.hasCeiling) {
        const ceilingHeight = levelConfig.ceilingHeight || 25;
        
        // Large ceiling plane
        const ceilingGeometry = new THREE.PlaneGeometry(600, 600);
        const ceilingMaterial = new THREE.MeshLambertMaterial({
            color: 0x1a0f0a,
            side: THREE.DoubleSide
        });
        caveCeiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        caveCeiling.rotation.x = Math.PI / 2;
        caveCeiling.position.y = ceilingHeight;
        scene.add(caveCeiling);
        
        // Add stalactites hanging from ceiling
        for (let i = 0; i < 100; i++) {
            const x = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 400;
            const size = 0.5 + Math.random() * 1.5;
            const height = 2 + Math.random() * 4;
            
            const stalactiteGeometry = new THREE.ConeGeometry(size, height, 6);
            const stalactiteMaterial = new THREE.MeshLambertMaterial({
                color: 0x2a1a0a
            });
            const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
            stalactite.rotation.x = Math.PI; // Point downward
            stalactite.position.set(x, ceilingHeight - height / 2, z);
            scene.add(stalactite);
        }
        
        // Adjust ambient light for cave atmosphere - balanced visibility
        scene.children.forEach(child => {
            if (child.isAmbientLight) {
                child.intensity = 0.5; // Balanced cave lighting
            }
        });
    }
    
    // Apply level-specific fog
    if (levelConfig.fogDensity) {
        const fogColor = levelConfig.fogColor || levelConfig.skyColor || 0x87CEEB;
        scene.fog = new THREE.FogExp2(fogColor, levelConfig.fogDensity);
    }

    // Create Dragon (boss enemy)
    function createDragon(posConfig, scale = 1, health = 50) {
        const textures = getTerrainTextures(THREE);
        const dragonGroup = new THREE.Group();
        
        // Use theme-appropriate textures
        let dragonScaleTexture, dragonEyeTexture;
        if (lavaTheme) {
            dragonScaleTexture = textures.dragonScaleLava;
            dragonEyeTexture = textures.dragonEyeLava;
        } else if (iceTheme) {
            dragonScaleTexture = textures.dragonScaleIce;
            dragonEyeTexture = textures.dragonEyeIce;
        } else {
            dragonScaleTexture = textures.dragonScale;
            dragonEyeTexture = textures.dragonEye;
        }
        
        // Body - long segmented shape
        const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 10, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.x = 5;
        body.castShadow = true;
        dragonGroup.add(body);
        
        // Body scales
        for (let i = 0; i < 8; i++) {
            const scaleGeometry = new THREE.ConeGeometry(0.6, 1.2, 6);
            const scaleMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
            const scale = new THREE.Mesh(scaleGeometry, scaleMaterial);
            scale.position.set(i * 1.2, 2.8, 0);
            scale.rotation.z = 0;
            scale.castShadow = true;
            dragonGroup.add(scale);
        }
        
        // Neck
        const neckGeometry = new THREE.CylinderGeometry(1.8, 2, 4, 8);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.rotation.z = Math.PI / 2;
        neck.position.x = 10;
        neck.position.y = 1;
        neck.castShadow = true;
        dragonGroup.add(neck);
        
        // Head - large diamond shape
        const headGeometry = new THREE.ConeGeometry(2.5, 5, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.rotation.z = -Math.PI / 2;
        head.position.x = 13;
        head.position.y = 1.5;
        head.castShadow = true;
        dragonGroup.add(head);
        
        // Jaw
        const jawGeometry = new THREE.BoxGeometry(2, 1.5, 2);
        const jaw = new THREE.Mesh(jawGeometry, headMaterial);
        jaw.position.set(14, 0.5, 0);
        jaw.castShadow = true;
        dragonGroup.add(jaw);
        
        // Teeth
        for (let i = 0; i < 6; i++) {
            const toothGeometry = new THREE.ConeGeometry(0.15, 0.6, 4);
            const toothMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            tooth.position.set(14 + (i % 2) * 0.5, 1.2, -1 + i * 0.4);
            tooth.rotation.z = Math.PI;
            dragonGroup.add(tooth);
        }
        
        // Eyes - glowing with texture and sprite glow
        const eyeGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            map: dragonEyeTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(13.5, 2.5, 1.2);
        dragonGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(13.5, 2.5, -1.2);
        dragonGroup.add(rightEye);
        
        // Eye glow sprites - larger and brighter
        const eyeGlowGeometry = new THREE.PlaneGeometry(2.5, 2.5);
        const eyeGlowMaterial = new THREE.MeshBasicMaterial({
            map: dragonEyeTexture,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const leftEyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        leftEyeGlow.position.set(13.8, 2.5, 1.2);
        dragonGroup.add(leftEyeGlow);
        
        const rightEyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        rightEyeGlow.position.set(13.8, 2.5, -1.2);
        dragonGroup.add(rightEyeGlow);
        
        // Wings - more detailed
        const wingGeometry = new THREE.BufferGeometry();
        const wingVertices = new Float32Array([
            0, 0, 0,
            6, 2, 0,
            8, 0, 0,
            6, -2, 0,
            4, -1, 0
        ]);
        wingGeometry.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
        wingGeometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]);
        wingGeometry.computeVertexNormals();
        
        const wingMaterial = new THREE.MeshLambertMaterial({ 
            map: dragonScaleTexture, 
            side: THREE.DoubleSide 
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(3, 3, 0);
        leftWing.rotation.y = Math.PI / 2;
        leftWing.castShadow = true;
        dragonGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(3, 3, 0);
        rightWing.rotation.y = -Math.PI / 2;
        rightWing.castShadow = true;
        dragonGroup.add(rightWing);
        
        // Tail segments
        const tailSegments = [];
        for (let i = 0; i < 3; i++) {
            const segmentGeometry = new THREE.CylinderGeometry(1.5 - i * 0.3, 1.8 - i * 0.3, 3, 8);
            const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
            segment.rotation.z = Math.PI / 2;
            segment.position.x = -3 - i * 2.5;
            segment.position.y = 0.5 - i * 0.3;
            segment.castShadow = true;
            dragonGroup.add(segment);
            tailSegments.push(segment);
        }
        
        // Tail spikes
        for (let i = 0; i < 10; i++) {
            const spikeGeometry = new THREE.ConeGeometry(0.3, 1, 6);
            const spikeMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(-i * 0.8, 2.5, 0);
            spike.rotation.z = Math.PI;
            spike.castShadow = true;
            dragonGroup.add(spike);
        }
        
        // Horns - larger and more imposing
        const hornGeometry = new THREE.ConeGeometry(0.5, 2.5, 6);
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(12.5, 4, 1.5);
        leftHorn.rotation.z = -0.4;
        leftHorn.rotation.x = 0.2;
        leftHorn.castShadow = true;
        dragonGroup.add(leftHorn);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(12.5, 4, -1.5);
        rightHorn.rotation.z = -0.4;
        rightHorn.rotation.x = -0.2;
        rightHorn.castShadow = true;
        dragonGroup.add(rightHorn);
        
        // Chest/belly - lighter color
        const bellyGeometry = new THREE.CylinderGeometry(1.8, 2.2, 8, 12);
        const bellyMaterial = new THREE.MeshLambertMaterial({ map: textures.dragonBelly });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.rotation.z = Math.PI / 2;
        belly.position.x = 5;
        belly.position.y = -1.5;
        belly.castShadow = true;
        dragonGroup.add(belly);
        
        // Position dragon from provided config or level config
        const dragonConfig = posConfig || levelConfig.dragon || { x: 0, z: -200 };
        const dragonX = dragonConfig.x;
        const dragonZ = dragonConfig.z;
        
        // Apply scale to the entire dragon
        dragonGroup.scale.set(scale, scale, scale);
        dragonGroup.position.set(dragonX, getTerrainHeight(dragonX, dragonZ) + 3 * scale, dragonZ);
        scene.add(dragonGroup);
        
        return {
            mesh: dragonGroup,
            head: head,
            leftWing: leftWing,
            rightWing: rightWing,
            tailSegments: tailSegments,
            leftEye: leftEye,
            rightEye: rightEye,
            leftEyeGlow: leftEyeGlow,
            rightEyeGlow: rightEyeGlow,
            health: health,
            maxHealth: health,
            scale: scale,
            alive: true,
            speed: 0.08 * speedMultiplier * scale,
            patrolLeft: dragonX - 30,
            patrolRight: dragonX + 30,
            patrolFront: dragonZ - 20,
            patrolBack: dragonZ + 20,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: scale < 1 ? 5000 : 4000, // Smaller dragons fire less often
            wingFlapPhase: 0,
            isFlying: false,
            flyStartTime: 0,
            flyDuration: 0,
            flyTargetY: 0,
            groundY: 0,
            frozen: false,
            frozenUntil: 0
        };
    }
    
    let dragon = null;
    let extraDragons = [];
    const fireballs = [];
    
    if (difficulty === 'hard') {
        dragon = createDragon();
        
        // Create extra dragons for Level 2
        if (levelConfig.extraDragons) {
            levelConfig.extraDragons.forEach(pos => {
                const extraDragon = createDragon(pos, 0.6, 25); // 60% size, 25 health
                extraDragons.push(extraDragon);
            });
        }
    }

    // Game arrays
    const bullets = [];
    const explosions = [];
    const smokeParticles = [];
    const scorchMarks = [];
    const guardianArrows = [];
    const mummyTornados = [];
    const lavaTrails = [];
    const birds = [];
    const bombs = [];

    // Bird helper
    function createBird(centerX, centerZ, radius, speed) {
        const birdGroup = new THREE.Group();
        
        // Bird body
        const bodyGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        birdGroup.add(body);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.4);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.6, 0, 0);
        leftWing.castShadow = true;
        birdGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.6, 0, 0);
        rightWing.castShadow = true;
        birdGroup.add(rightWing);
        
        // Beak
        const beakGeometry = new THREE.ConeGeometry(0.15, 0.3, 6);
        const beakMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.rotation.z = -Math.PI / 2;
        beak.position.set(0, 0, -0.4);
        birdGroup.add(beak);
        
        const angle = Math.random() * Math.PI * 2;
        const startX = centerX + Math.cos(angle) * radius;
        const startZ = centerZ + Math.sin(angle) * radius;
        const startY = 8 + Math.random() * 4;
        
        birdGroup.position.set(startX, startY, startZ);
        scene.add(birdGroup);
        
        return {
            mesh: birdGroup,
            centerX: centerX,
            centerZ: centerZ,
            radius: radius,
            speed: speed,
            angle: angle,
            height: startY,
            leftWing: leftWing,
            rightWing: rightWing,
            lastBombTime: Date.now(),
            wingFlapPhase: 0
        };
    }
    
    // Create birds in hard mode
    if (difficulty === 'hard') {
        // Create birds from level config
        levelConfig.birds.forEach(birdConfig => {
            birds.push(createBird(birdConfig[0], birdConfig[1], birdConfig[2], birdConfig[3]));
        });
    }

    // Explosion helper (small, for bullets hitting enemies)
    function createExplosion(x, y, z) {
        Audio.playExplosionSound();
        
        const particles = [];
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            // Clone pre-cached material to avoid texture loading glitches
            const spriteMaterial = explosionBaseMaterial.clone();
            const particle = new THREE.Sprite(spriteMaterial);
            const size = 0.2 + Math.random() * 0.25;
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            
            scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 30, initialScale: size });
        }
        
        explosions.push(...particles);
    }

    // Fireball impact explosion (medium size with smoke and scorch)
    function createFireballExplosion(x, y, z) {
        Audio.playExplosionSound();
        
        const particles = [];
        const particleCount = 40;
        
        for (let i = 0; i < particleCount; i++) {
            const size = 0.5 + Math.random() * 0.8;
            // Clone pre-cached material to avoid texture loading glitches
            const spriteMaterial = explosionBaseMaterial.clone();
            const particle = new THREE.Sprite(spriteMaterial);
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const speed = 0.2 + Math.random() * 0.5;
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed * 0.6,
                (Math.random() - 0.5) * speed
            );
            
            scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 35, initialScale: size });
        }
        
        explosions.push(...particles);
        
        // Add smoke and scorch
        createSmokeCloud(x, y + 0.5, z, 0.8);
        createScorchMark(x, z, 2.5);
    }

    // Big bomb explosion helper
    function createBombExplosion(x, y, z) {
        Audio.playBombExplosionSound();
        
        const particles = [];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const size = 1.0 + Math.random() * 1.5;
            
            // Mix of fire glow and smoke - clone pre-cached materials
            let useSmokeColor = Math.random() < 0.12;
            const spriteMaterial = useSmokeColor 
                ? smokeBaseMaterial.clone()
                : explosionBaseMaterial.clone();
            const particle = new THREE.Sprite(spriteMaterial);
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const speed = 0.3 + Math.random() * 0.8;
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed * 0.8,
                (Math.random() - 0.5) * speed
            );
            
            scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 45, initialScale: size });
        }
        
        explosions.push(...particles);
        
        // Add lingering smoke cloud
        createSmokeCloud(x, y + 1, z, 1.5);
        
        // Add scorch mark on ground
        createScorchMark(x, z, 5);
    }

    // Massive dragon death explosion
    function createDragonExplosion(x, y, z) {
        Audio.playBombExplosionSound();
        
        const particles = [];
        const particleCount = 180; // Way more particles
        
        for (let i = 0; i < particleCount; i++) {
            const size = 1.5 + Math.random() * 2.5; // Much bigger glowing sprites
            
            // Clone pre-cached material to avoid texture loading glitches
            const spriteMaterial = explosionBaseMaterial.clone();
            const particle = new THREE.Sprite(spriteMaterial);
            particle.scale.set(size, size, 1);
            particle.position.set(x, y, z);
            
            const speed = 0.5 + Math.random() * 1.2; // Much faster
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed,
                (Math.random() - 0.5) * speed
            );
            
            scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 60, initialScale: size }); // Longer life
        }
        
        explosions.push(...particles);
    }

    // Create lingering smoke cloud
    function createSmokeCloud(x, y, z, intensity = 1.0) {
        const smokeCount = Math.floor(8 * intensity);
        
        for (let i = 0; i < smokeCount; i++) {
            // Clone pre-cached material and adjust opacity
            const smokeMaterial = smokeBaseMaterial.clone();
            smokeMaterial.opacity = 0.5 + Math.random() * 0.3;
            const smoke = new THREE.Sprite(smokeMaterial);
            const size = (1.5 + Math.random() * 2.0) * intensity;
            smoke.scale.set(size, size, 1);
            
            // Position with some spread
            smoke.position.set(
                x + (Math.random() - 0.5) * 2 * intensity,
                y + Math.random() * 1.5,
                z + (Math.random() - 0.5) * 2 * intensity
            );
            
            scene.add(smoke);
            smokeParticles.push({
                mesh: smoke,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    0.01 + Math.random() * 0.02,  // Slowly rise
                    (Math.random() - 0.5) * 0.02
                ),
                life: 150 + Math.random() * 100,  // Long life (2.5-4 seconds)
                initialOpacity: smoke.material.opacity,
                initialScale: size
            });
        }
    }

    // Create scorch mark on the ground
    function createScorchMark(x, z, size = 3) {
        const textures = getTerrainTextures(THREE);
        const terrainHeight = getTerrainHeight(x, z);
        
        const scorchGeometry = new THREE.PlaneGeometry(size, size);
        const scorchMaterial = new THREE.MeshBasicMaterial({
            map: textures.scorch,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        });
        const scorch = new THREE.Mesh(scorchGeometry, scorchMaterial);
        scorch.rotation.x = -Math.PI / 2;  // Lay flat on ground
        scorch.rotation.z = Math.random() * Math.PI * 2;  // Random rotation
        scorch.position.set(x, terrainHeight + 0.02, z);  // Slightly above ground
        
        scene.add(scorch);
        scorchMarks.push({
            mesh: scorch,
            life: 600 + Math.random() * 300,  // 10-15 seconds
            initialOpacity: 0.8
        });
    }

    // Update smoke particles
    function updateSmoke() {
        for (let i = smokeParticles.length - 1; i >= 0; i--) {
            const smoke = smokeParticles[i];
            smoke.mesh.position.add(smoke.velocity);
            smoke.life--;
            
            // Fade out and expand
            const lifeRatio = smoke.life / 200;
            smoke.mesh.material.opacity = smoke.initialOpacity * Math.min(1, lifeRatio * 1.5);
            // Expand slightly as it rises
            const expandFactor = 1 + (1 - lifeRatio) * 0.5;
            smoke.mesh.scale.set(
                smoke.initialScale * expandFactor,
                smoke.initialScale * expandFactor,
                1
            );
            
            if (smoke.life <= 0) {
                scene.remove(smoke.mesh);
                smokeParticles.splice(i, 1);
            }
        }
    }

    // Update scorch marks (fade over time)
    function updateScorchMarks() {
        for (let i = scorchMarks.length - 1; i >= 0; i--) {
            const scorch = scorchMarks[i];
            scorch.life--;
            
            // Start fading in the last 200 frames
            if (scorch.life < 200) {
                scorch.mesh.material.opacity = scorch.initialOpacity * (scorch.life / 200);
            }
            
            if (scorch.life <= 0) {
                scene.remove(scorch.mesh);
                scorchMarks.splice(i, 1);
            }
        }
    }

    // Shoot bullet
    function shootBullet() {
        if (gameWon) return;
        
        if (ammo <= 0 && !godMode) {
            Audio.playEmptyGunSound();
            return;
        }
        
        Audio.playShootSound();
        
        const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const bulletColor = isHost ? 0xFF69B4 : 0x4169E1; // Pink for girl, Blue for boy
        const bulletMaterial = new THREE.MeshLambertMaterial({ color: bulletColor });
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
            radius: 0.2,
            startPos: { x: playerGroup.position.x, z: playerGroup.position.z }
        };
        bullets.push(bullet);
        if (!godMode) ammo--;
        
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
        const remoteBulletColor = isHost ? 0x4169E1 : 0xFF69B4; // Blue for boy's bullets, Pink for girl's bullets
        const bulletMaterial = new THREE.MeshLambertMaterial({ color: remoteBulletColor });
        const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
        bulletMesh.position.set(bulletData.position.x, bulletData.position.y, bulletData.position.z);
        bulletMesh.castShadow = true;
        scene.add(bulletMesh);
        
        const bullet = {
            mesh: bulletMesh,
            velocity: new THREE.Vector3(bulletData.velocity.x, bulletData.velocity.y, bulletData.velocity.z),
            radius: 0.2,
            startPos: bulletData.startPos,
            isRemote: true // Mark as remote to differentiate
        };
        bullets.push(bullet);
    }
    
    // Create freeze particle effect on an NPC
    function createFreezeEffect(x, y, z) {
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 4, 4);
            const material = new THREE.MeshBasicMaterial({
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
            
            scene.add(particle);
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
                particles.forEach(p => scene.remove(p.mesh));
            }
        }, 16);
    }
    
    // Ice power activation
    function activateIcePower() {
        if (gameWon || gameDead || !hasIcePower) return;
        
        const now = Date.now();
        if (now - lastIcePowerTime < icePowerCooldown) return; // Cooldown not ready
        
        lastIcePowerTime = now;
        
        console.log('Activating ice power, isHost:', multiplayerManager ? multiplayerManager.isHost : 'no multiplayer');
        
        Audio.playIcePowerSound();
        
        const freezeRadius = 20;
        const playerPos = playerGroup.position;
        
        // Create visual effect - expanding blue circle
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
        scene.add(circle);
        
        // Animate circle expansion and fade
        let expansion = 0;
        const expandInterval = setInterval(() => {
            expansion += 0.05;
            circle.scale.set(expansion, expansion, 1);
            circle.material.opacity = 0.6 * (1 - expansion);
            
            if (expansion >= 1) {
                clearInterval(expandInterval);
                scene.remove(circle);
            }
        }, 16);
        
        // Freeze all NPCs in radius
        const freezeDuration = 5000; // 5 seconds
        
        // Freeze goblins
        goblins.forEach(gob => {
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
        birds.forEach(bird => {
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
        if (dragon && dragon.alive) {
            const dist = Math.sqrt(
                (dragon.mesh.position.x - playerPos.x) ** 2 +
                (dragon.mesh.position.z - playerPos.z) ** 2
            );
            if (dist <= freezeRadius + 15) { // Extra 15 units for dragon's size
                dragon.frozen = true;
                dragon.frozenUntil = now + freezeDuration;
                // Apply blue tint to dragon
                dragon.mesh.children.forEach(child => {
                    if (child.material && child.material.emissive !== undefined) {
                        child.material.emissive = new THREE.Color(0x0088FF);
                        child.material.emissiveIntensity = 0.5;
                    }
                });
                createFreezeEffect(dragon.mesh.position.x, dragon.mesh.position.y + 5, dragon.mesh.position.z);
            }
        }
        
        // Freeze extra dragons
        extraDragons.forEach(extraDragon => {
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

    // Place banana trap
    function placeBanana() {
        if (bananaInventory <= 0) return;
        
        bananaInventory--;
        
        // Create banana mesh
        const bananaGroup = new THREE.Group();
        
        // Banana body (curved cylinder)
        const bananaGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
        const bananaMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.3
        });
        const bananaMesh = new THREE.Mesh(bananaGeometry, bananaMaterial);
        bananaMesh.rotation.z = Math.PI / 6; // Slight curve
        bananaMesh.castShadow = true;
        bananaGroup.add(bananaMesh);
        
        // Banana ends (darker)
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
        
        // Position 3 units in front of the player based on their rotation
        const placeDistance = 3;
        const bananaX = playerGroup.position.x + Math.sin(player.rotation) * placeDistance;
        const bananaZ = playerGroup.position.z + Math.cos(player.rotation) * placeDistance;
        const terrainHeight = getTerrainHeight(bananaX, bananaZ);
        bananaGroup.position.set(bananaX, terrainHeight + 0.5, bananaZ);
        scene.add(bananaGroup);
        
        const bananaId = Date.now() + Math.random(); // Unique ID
        placedBananas.push({
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
    
    function placeBomb() {
        if (bombInventory <= 0) return;
        
        const bombId = Date.now() + Math.random();
        bombInventory--;
        
        // Create bomb mesh
        const bombGroup = new THREE.Group();
        
        // Main sphere (black bomb)
        const sphereGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        bombGroup.add(sphere);
        
        // Fuse
        const fuseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
        const fuseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.4;
        bombGroup.add(fuse);
        
        // Animated spark
        const sparkGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const sparkMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 1.0
        });
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.y = 0.55;
        bombGroup.add(spark);
        
        // Start position at player, throw to 6 units in front
        const throwDistance = 6;
        const targetX = playerGroup.position.x + Math.sin(player.rotation) * throwDistance;
        const targetZ = playerGroup.position.z + Math.cos(player.rotation) * throwDistance;
        const targetTerrainHeight = getTerrainHeight(targetX, targetZ);
        
        // Start at player position
        bombGroup.position.set(
            playerGroup.position.x,
            playerGroup.position.y + 1.5, // Start at chest height
            playerGroup.position.z
        );
        scene.add(bombGroup);
        
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
                bombGroup.position.x = playerGroup.position.x + (targetX - playerGroup.position.x) * progress;
                bombGroup.position.z = playerGroup.position.z + (targetZ - playerGroup.position.z) * progress;
                
                // Parabolic arc for vertical movement
                const arcProgress = Math.sin(progress * Math.PI);
                bombGroup.position.y = startY + arcProgress * throwHeight - (progress * (startY - targetTerrainHeight - 0.4));
            }
        }, 16);
        
        const explodeAt = Date.now() + 3000; // 3 seconds
        placedBombs.push({
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
    
    // Handle game events from remote player
    function handleRemoteGameEvent(eventData) {
        const { eventType, data } = eventData;
        
        if (eventType === 'bombExplosion') {
            // Show explosion effect on client
            createBombExplosion(data.x, data.y, data.z);
            
            // Add camera shake
            const distToExplosion = Math.sqrt(
                (playerGroup.position.x - data.x) ** 2 +
                (playerGroup.position.z - data.z) ** 2
            );
            if (distToExplosion < 30) {
                const shakeIntensity = Math.max(0, 1 - distToExplosion / 30) * 0.3;
                camera.position.x += (Math.random() - 0.5) * shakeIntensity;
                camera.position.y += (Math.random() - 0.5) * shakeIntensity;
                camera.position.z += (Math.random() - 0.5) * shakeIntensity;
            }
        } else if (eventType === 'itemCollected') {
            // Other player collected an item
            if (data.type === 'material' && materials[data.index]) {
                materials[data.index].collected = true;
                materials[data.index].mesh.visible = false;
                materialsCollected++;
                Audio.playCollectSound();
            } else if (data.type === 'ammo' && ammoPickups[data.index]) {
                ammoPickups[data.index].collected = true;
                ammoPickups[data.index].mesh.visible = false;
                Audio.playCollectSound();
            } else if (data.type === 'health' && healthPickups[data.index]) {
                healthPickups[data.index].collected = true;
                healthPickups[data.index].mesh.visible = false;
                Audio.playCollectSound();
            } else if (data.type === 'bomb' && bombPickups[data.index]) {
                bombPickups[data.index].collected = true;
                bombPickups[data.index].mesh.visible = false;
                Audio.playCollectSound();
            } else if (data.type === 'scarab' && scarabPickups[data.index]) {
                scarabPickups[data.index].collected = true;
                scene.remove(scarabPickups[data.index].mesh);
                scarabsCollected++;
                Audio.playCollectSound();
            }
        } else if (eventType === 'bridgeRepaired') {
            // Other player repaired the bridge
            if (!bridgeRepaired) {
                bridgeRepaired = true;
                bridgeObj.mesh.visible = true;
                brokenBridgeGroup.visible = false;
                Audio.playRepairSound();
            }
        } else if (eventType === 'icePowerCollected') {
            // Other player collected ice power
            if (!icePowerCollected) {
                icePowerCollected = true;
                hasIcePower = true;
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
            scene.add(circle);
            
            let expansion = 0;
            const expandInterval = setInterval(() => {
                expansion += 0.05;
                circle.scale.set(expansion, expansion, 1);
                circle.material.opacity = 0.6 * (1 - expansion);
                
                if (expansion >= 1) {
                    clearInterval(expandInterval);
                    scene.remove(circle);
                }
            }, 16);
            
            // If this is the host, apply freezing (client sent the event)
            if (multiplayerManager && multiplayerManager.isHost && !data.isHost) {
                console.log('Host applying freeze from client at position:', playerPos);
                const freezeDuration = 5000;
                const now = Date.now();
                
                // Freeze goblins
                console.log('Checking', goblins.length, 'goblins for freezing');
                goblins.forEach(gob => {
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
                birds.forEach(bird => {
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
                if (dragon && dragon.alive) {
                    const dist = Math.sqrt(
                        (dragon.mesh.position.x - playerPos.x) ** 2 +
                        (dragon.mesh.position.z - playerPos.z) ** 2
                    );
                    if (dist <= freezeRadius + 15) { // Extra 15 units for dragon's size
                        dragon.frozen = true;
                        dragon.frozenUntil = now + freezeDuration;
                        // Apply blue tint to dragon
                        dragon.mesh.children.forEach(child => {
                            if (child.material && child.material.emissive !== undefined) {
                                child.material.emissive = new THREE.Color(0x0088FF);
                                child.material.emissiveIntensity = 0.5;
                            }
                        });
                        createFreezeEffect(dragon.mesh.position.x, dragon.mesh.position.y + 5, dragon.mesh.position.z);
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
                playerHealth--;
                damageFlashTime = Date.now();
                // Don't check for death here - client will send updated health to host
                // and host will sync gameDead status back via fullSync
                if (playerHealth > 0) {
                    Audio.playStuckSound();
                }
            }
        } else if (eventType === 'tornadoHit') {
            // Client was hit by a tornado (from host)
            if (!godMode) {
                playerHealth--;
                damageFlashTime = Date.now();
                
                // Trigger tornado spin visual effect
                tornadoSpinActive = true;
                tornadoSpinStartTime = Date.now();
                
                if (playerHealth > 0) {
                    Audio.playStuckSound();
                }
            }
        } else if (eventType === 'bananaPowerCollected') {
            // Other player collected banana power, both get it
            worldBananaPowerCollected = true;
            hasBananaPower = true;
            bananaInventory = maxBananas;
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
            scene.add(bananaGroup);
            
            placedBananas.push({
                id: data.id,
                mesh: bananaGroup,
                x: data.x,
                z: data.z,
                radius: 1.2
            });
        } else if (eventType === 'bananaCollected') {
            // Other player collected a banana - remove it
            const index = placedBananas.findIndex(b => b.id === data.id);
            if (index !== -1) {
                scene.remove(placedBananas[index].mesh);
                placedBananas.splice(index, 1);
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
            scene.add(bombGroup);
            
            placedBombs.push({
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
            const index = placedBombs.findIndex(b => b.id === data.id);
            if (index !== -1) {
                scene.remove(placedBombs[index].mesh);
                placedBombs.splice(index, 1);
            }
        } else if (eventType === 'levelChange') {
            // Other player entered a portal - switch level together
            console.log(`Received level change to Level ${data.level}`);
            
            // Save current inventory before switching (so both players keep their inventory)
            persistentInventory.ammo = ammo;
            persistentInventory.bombs = bombInventory;
            persistentInventory.health = playerHealth;
            persistentInventory.hasKite = worldKiteCollected || player.hasKite;
            
            switchLevel(data.level);
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
            scene.add(trailGroup);
            
            lavaTrails.push({
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
                playerHealth = 0;
                gameDead = true;
                Audio.stopBackgroundMusic();
                Audio.playDeathSound();
            }
        }
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
        } else if (godMode) {
            // God mode flying controls
            let moveSpeed = godModeSpeed;
            
            // Forward/backward
            if (keys.ArrowUp || keys.w) {
                playerGroup.position.x += Math.sin(player.rotation) * moveSpeed;
                playerGroup.position.z += Math.cos(player.rotation) * moveSpeed;
            }
            if (keys.ArrowDown || keys.s) {
                playerGroup.position.x -= Math.sin(player.rotation) * moveSpeed;
                playerGroup.position.z -= Math.cos(player.rotation) * moveSpeed;
            }
            
            // Left/right rotation
            if (keys.ArrowLeft || keys.a) {
                player.rotation += player.rotationSpeed;
            }
            if (keys.ArrowRight || keys.d) {
                player.rotation -= player.rotationSpeed;
            }
            
            // Up/down (Q/E keys)
            if (keys.q) {
                playerGroup.position.y += moveSpeed * 0.5;
            }
            if (keys.e) {
                playerGroup.position.y -= moveSpeed * 0.5;
            }
            
            isMoving = keys.ArrowUp || keys.ArrowDown || keys.w || keys.s;
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
            const moveScale = player.gamepadMoveScale > 0 ? player.gamepadMoveScale : 1;
            if (keys.ArrowUp || keys.w) {
                playerGroup.position.x += Math.sin(player.rotation) * player.speed * moveScale;
                playerGroup.position.z += Math.cos(player.rotation) * player.speed * moveScale;
            }
            if (keys.ArrowDown || keys.s) {
                playerGroup.position.x -= Math.sin(player.rotation) * player.speed * moveScale;
                playerGroup.position.z -= Math.cos(player.rotation) * player.speed * moveScale;
            }
            player.gamepadMoveScale = 0;
        }
        
        playerGroup.rotation.y = player.rotation;
        
        // Tornado spin visual effect (purely visual, doesn't affect gameplay position)
        if (tornadoSpinActive) {
            const elapsed = Date.now() - tornadoSpinStartTime;
            const progress = Math.min(elapsed / tornadoSpinDuration, 1);
            
            if (progress < 1) {
                // Spin rotation - ease out
                const spinProgress = 1 - Math.pow(1 - progress, 2); // ease out quad
                const extraRotation = spinProgress * tornadoSpinRotations * Math.PI * 2;
                playerGroup.rotation.y = player.rotation + extraRotation;
                
                // Lift up and down - parabolic arc
                const liftProgress = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
                playerGroup.position.y += liftProgress * tornadoSpinLiftHeight;
                
                // Slight wobble
                playerGroup.rotation.x = Math.sin(elapsed * 0.02) * 0.2 * (1 - progress);
                playerGroup.rotation.z = Math.cos(elapsed * 0.025) * 0.15 * (1 - progress);
            } else {
                // Effect finished, reset
                tornadoSpinActive = false;
                playerGroup.rotation.x = 0;
                playerGroup.rotation.z = 0;
            }
        }
        
        const isStuck = godMode ? false : checkCollisions(prevPos);
        
        if (isMoving && !isStuck) {
            Audio.startBikeSound();
        } else {
            Audio.stopBikeSound();
        }
        
        if (!godMode) {
            const terrainHeight = getTerrainHeight(playerGroup.position.x, playerGroup.position.z);
            if (player.isGliding) {
                const groundHeight = 0.1;
                const currentHeight = groundHeight + (player.glideHeight - groundHeight) * player.glideLiftProgress;
                playerGroup.position.y = terrainHeight + currentHeight;
            } else {
                playerGroup.position.y = terrainHeight + 0.1;
            }
        }
        
        const cameraDistance = 8;
        const cameraHeight = 4;
        
        const cameraOffsetX = -Math.sin(player.rotation) * cameraDistance;
        const cameraOffsetZ = -Math.cos(player.rotation) * cameraDistance;
        
        camera.position.x = playerGroup.position.x + cameraOffsetX;
        camera.position.y = playerGroup.position.y + cameraHeight;
        camera.position.z = playerGroup.position.z + cameraOffsetZ;
        camera.lookAt(playerGroup.position.x, playerGroup.position.y, playerGroup.position.z);
        
        // Client syncs their player state to host (throttled to 20Hz to reduce network traffic)
        if (multiplayerManager && multiplayerManager.isClient && multiplayerManager.isConnected()) {
            const now = Date.now();
            if (now - lastClientStateSend >= clientStateSendInterval) {
                multiplayerManager.sendPlayerState({
                    position: playerGroup.position,
                    rotation: player.rotation,
                    health: playerHealth,
                    isGliding: player.isGliding,
                    glideLiftProgress: player.glideLiftProgress
                });
                lastClientStateSend = now;
            }
        }
    }

    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.mesh.position.add(bullet.velocity);
            
            // Calculate distance from start position
            const distFromStart = new THREE.Vector2(
                bullet.mesh.position.x - bullet.startPos.x,
                bullet.mesh.position.z - bullet.startPos.z
            ).length();
            
            const maxDistance = difficulty === 'hard' ? 35 : GAME_CONFIG.WORLD_BOUND;
            
            if (Math.abs(bullet.mesh.position.x) > GAME_CONFIG.WORLD_BOUND || Math.abs(bullet.mesh.position.z) > GAME_CONFIG.WORLD_BOUND || distFromStart > maxDistance) {
                scene.remove(bullet.mesh);
                bullets.splice(i, 1);
                continue;
            }
            
            let bulletHit = false;
            
            // Check collision with goblins
            // Visual feedback happens on both, but only host applies damage
            for (let j = 0; j < goblins.length; j++) {
                const gob = goblins[j];
                if (gob.alive) {
                    const dist = bullet.mesh.position.distanceTo(gob.mesh.position);
                    if (dist < gob.radius + bullet.radius) {
                        // Visual feedback on both host and client
                        createExplosion(gob.mesh.position.x, gob.mesh.position.y + 1, gob.mesh.position.z);
                        
                        // Only host applies actual damage
                        if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                            gob.health--;
                            gob.isChasing = true;
                            if (gob.health <= 0) {
                                gob.alive = false;
                                Audio.playGoblinDeathSound();
                                if (waterTheme) {
                                    // Sharks disappear underwater
                                    scene.remove(gob.mesh);
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
            if (!bulletHit && dragon && dragon.alive) {
                const dist = bullet.mesh.position.distanceTo(dragon.mesh.position);
                const hitRadius = 8 * (dragon.scale || 1);
                if (dist < hitRadius) {
                    // Visual feedback
                    createExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                    
                    // Only host applies damage
                    if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                        dragon.health--;
                        if (dragon.health <= 0 && dragon.alive) {
                            dragon.alive = false;
                            dragon.deathTime = Date.now();
                            Audio.playGoblinDeathSound();
                            
                            // Start massive camera shake
                            dragonDeathShakeUntil = Date.now() + 1200; // 1.2 seconds
                            dragonDeathShakeIntensity = 1.0;
                            
                            // Capture position before hiding mesh
                            const deathX = dragon.mesh.position.x;
                            const deathY = dragon.mesh.position.y;
                            const deathZ = dragon.mesh.position.z;
                            
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
                            dragon.mesh.visible = false;
                        }
                    }
                    bulletHit = true;
                }
            }
            
            // Check collision with extra dragons
            if (!bulletHit) {
                for (const extraDragon of extraDragons) {
                    if (!extraDragon.alive) continue;
                    const dist = bullet.mesh.position.distanceTo(extraDragon.mesh.position);
                    const hitRadius = 8 * (extraDragon.scale || 1);
                    if (dist < hitRadius) {
                        // Visual feedback
                        createExplosion(bullet.mesh.position.x, bullet.mesh.position.y, bullet.mesh.position.z);
                        
                        // Only host applies damage
                        if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                            extraDragon.health--;
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
                            }
                        }
                        bulletHit = true;
                        break;
                    }
                }
            }
            
            // Check collision with trees (visual feedback on both)
            if (!bulletHit) {
                for (let j = 0; j < trees.length; j++) {
                    const tree = trees[j];
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
                for (let j = 0; j < levelConfig.hills.length; j++) {
                    const hill = levelConfig.hills[j];
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
            
            // Fade out and shrink for star-like dissipation
            const lifeRatio = exp.life / 60; // Normalize to 0-1
            if (exp.mesh.material) {
                exp.mesh.material.opacity = Math.max(0, lifeRatio * 1.5);
            }
            // Shrink as it fades
            if (exp.initialScale) {
                const scale = exp.initialScale * (0.3 + lifeRatio * 0.7);
                exp.mesh.scale.set(scale, scale, 1);
            }
            
            if (exp.life <= 0) {
                scene.remove(exp.mesh);
                explosions.splice(i, 1);
            }
        }
    }

    function updateGoblins() {
        goblins.forEach(gob => {
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
            
            // Check distance to both players (if multiplayer)
            const distToPlayer = Math.sqrt(
                Math.pow(playerGroup.position.x - gob.mesh.position.x, 2) + 
                Math.pow(playerGroup.position.z - gob.mesh.position.z, 2)
            );
            
            // Check if player is in ice berg (safe zone) - only if iceBerg exists
            const playerInIceBerg = iceBerg ? Math.sqrt(
                Math.pow(playerGroup.position.x - iceBerg.position.x, 2) +
                Math.pow(playerGroup.position.z - iceBerg.position.z, 2)
            ) < iceBerg.radius : false;
            
            let targetPlayer = playerGroup;
            let distToTarget = distToPlayer;
            let targetInIceBerg = playerInIceBerg;
            
            // If multiplayer and other player is visible, check distance to them too
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = Math.sqrt(
                    Math.pow(otherPlayerMesh.position.x - gob.mesh.position.x, 2) + 
                    Math.pow(otherPlayerMesh.position.z - gob.mesh.position.z, 2)
                );
                
                const otherInIceBerg = iceBerg ? Math.sqrt(
                    Math.pow(otherPlayerMesh.position.x - iceBerg.position.x, 2) +
                    Math.pow(otherPlayerMesh.position.z - iceBerg.position.z, 2)
                ) < iceBerg.radius : false;
                
                // Chase the closer player who is NOT in ice berg
                if (!playerInIceBerg && (otherInIceBerg || distToPlayer < distToOther)) {
                    targetPlayer = playerGroup;
                    distToTarget = distToPlayer;
                    targetInIceBerg = playerInIceBerg;
                } else if (!otherInIceBerg) {
                    targetPlayer = otherPlayerMesh;
                    distToTarget = distToOther;
                    targetInIceBerg = otherInIceBerg;
                } else {
                    // Both in ice berg, don't chase anyone
                    return;
                }
            } else if (playerInIceBerg) {
                // Single player in ice berg, don't chase
                return;
            }
            
            if (gob.isGuardian && distToTarget < 25 && !targetInIceBerg) {
                gob.isChasing = true;
            }
            
            if (distToTarget < 25 || (gob.isGuardian && gob.isChasing) || gob.isChasing) {
                const directionX = targetPlayer.position.x - gob.mesh.position.x;
                const directionZ = targetPlayer.position.z - gob.mesh.position.z;
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
            
            // Check banana trap collision
            placedBananas.forEach(banana => {
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
            const dist = playerGroup.position.distanceTo(gob.mesh.position);
            if (dist < 1.5 && !godMode) {
                const now = Date.now();
                if (now - lastDamageTime > damageCooldown) {
                    playerHealth--;
                    lastDamageTime = now;
                    damageFlashTime = now;
                    
                    if (playerHealth <= 0) {
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
                    
                    if (now - gob.lastOtherPlayerDamageTime > damageCooldown) {
                        multiplayerManager.sendGameEvent('playerDamage', {});
                        gob.lastOtherPlayerDamageTime = now;
                    }
                }
            }
            
            // Guardian arrows (or ink balls in water theme)
            if (gob.isGuardian && distToTarget < 25) {
                const now = Date.now();
                const fireInterval = 4000 + Math.random() * 2000;
                if (now - gob.lastFireTime > fireInterval) {
                    gob.lastFireTime = now;
                    
                    let arrowMesh;
                    if (waterTheme) {
                        // Ink ball for octopus guardians
                        const inkGeometry = new THREE.SphereGeometry(0.3, 12, 12);
                        const inkMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
                        arrowMesh = new THREE.Mesh(inkGeometry, inkMaterial);
                        arrowMesh.position.copy(gob.mesh.position);
                        arrowMesh.position.y += 1.2;
                        scene.add(arrowMesh);
                    } else {
                        // Regular arrow
                        const arrowGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
                        const arrowMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                        arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
                        arrowMesh.position.copy(gob.mesh.position);
                        arrowMesh.position.y += 1.5;
                        scene.add(arrowMesh);
                        
                        const tipGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
                        const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
                        const tipMesh = new THREE.Mesh(tipGeometry, tipMaterial);
                        tipMesh.position.y = 0.5;
                        arrowMesh.add(tipMesh);
                    }
                    
                    Audio.playArrowShootSound();
                    
                    // Target the closest player
                    let targetPlayer = playerGroup;
                    let closestDist = Math.sqrt(
                        Math.pow(playerGroup.position.x - gob.mesh.position.x, 2) +
                        Math.pow(playerGroup.position.z - gob.mesh.position.z, 2)
                    );
                    
                    // Check if other player is closer
                    if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                        const distToOther = Math.sqrt(
                            Math.pow(otherPlayerMesh.position.x - gob.mesh.position.x, 2) +
                            Math.pow(otherPlayerMesh.position.z - gob.mesh.position.z, 2)
                        );
                        if (distToOther < closestDist) {
                            targetPlayer = otherPlayerMesh;
                        }
                    }
                    
                    const dirX = targetPlayer.position.x - gob.mesh.position.x;
                    const dirZ = targetPlayer.position.z - gob.mesh.position.z;
                    const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
                    
                    const direction = new THREE.Vector3(
                        dirX / length,
                        0,
                        dirZ / length
                    );
                    
                    const angle = Math.atan2(dirX, dirZ);
                    if (!waterTheme) {
                        arrowMesh.rotation.x = Math.PI / 2;
                        arrowMesh.rotation.z = -angle;
                    }
                    
                    const arrowSpeed = difficulty === 'hard' ? 0.15 : 0.1;
                    
                    guardianArrows.push({
                        mesh: arrowMesh,
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
        for (let i = guardianArrows.length - 1; i >= 0; i--) {
            const arrow = guardianArrows[i];
            arrow.mesh.position.x += arrow.velocity.x;
            arrow.mesh.position.z += arrow.velocity.z;
            
            // Check collision with local player
            const dist = new THREE.Vector2(
                playerGroup.position.x - arrow.mesh.position.x,
                playerGroup.position.z - arrow.mesh.position.z
            ).length();
            
            let hitPlayer = false;
            if (dist < 1.0) {
                if (!godMode) {
                    playerHealth--;
                    damageFlashTime = Date.now();
                    if (playerHealth <= 0) {
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
            
            if (hitPlayer) {
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
            
            levelConfig.hills.forEach(hill => {
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
            
            // Remove arrows that travel too far
            const distFromOrigin = Math.sqrt(
                arrow.mesh.position.x * arrow.mesh.position.x +
                arrow.mesh.position.z * arrow.mesh.position.z
            );
            if (distFromOrigin > GAME_CONFIG.WORLD_BOUND) {
                scene.remove(arrow.mesh);
                guardianArrows.splice(i, 1);
            }
        }
    }

    function updateBirds() {
        const now = Date.now();
        
        birds.forEach(bird => {
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
            const playerInIceBerg = iceBerg ? Math.sqrt(
                Math.pow(playerGroup.position.x - iceBerg.position.x, 2) +
                Math.pow(playerGroup.position.z - iceBerg.position.z, 2)
            ) < iceBerg.radius : false;
            
            // Drop bomb if player is close (and not in ice berg)
            const distToPlayer = new THREE.Vector2(
                playerGroup.position.x - bird.mesh.position.x,
                playerGroup.position.z - bird.mesh.position.z
            ).length();
            
            // Also check distance to other player in multiplayer
            let distToOtherPlayer = Infinity;
            let otherInIceBerg = true;
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                otherInIceBerg = iceBerg ? Math.sqrt(
                    Math.pow(otherPlayerMesh.position.x - iceBerg.position.x, 2) +
                    Math.pow(otherPlayerMesh.position.z - iceBerg.position.z, 2)
                ) < iceBerg.radius : false;
                
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
                scene.add(bombMesh);
                
                bombs.push({
                    mesh: bombMesh,
                    velocity: new THREE.Vector3(0, -0.2, 0),
                    radius: 7 // Explosion radius
                });
                
                bird.lastBombTime = now;
            }
        });
    }
    
    function updateBombs() {
        for (let i = bombs.length - 1; i >= 0; i--) {
            const bomb = bombs[i];
            
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
                    (playerGroup.position.x - explosionX) ** 2 +
                    (playerGroup.position.z - explosionZ) ** 2
                );
                if (distToExplosion < 30) {
                    const shakeIntensity = Math.max(0, 1 - distToExplosion / 30) * 0.3;
                    camera.position.x += (Math.random() - 0.5) * shakeIntensity;
                    camera.position.y += (Math.random() - 0.5) * shakeIntensity;
                    camera.position.z += (Math.random() - 0.5) * shakeIntensity;
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
                    playerGroup.position.x - bomb.mesh.position.x,
                    playerGroup.position.z - bomb.mesh.position.z
                ).length();
                
                if (distToPlayer < bomb.radius && !godMode) {
                    playerHealth--;
                    damageFlashTime = Date.now();
                    if (playerHealth <= 0) {
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
                
                scene.remove(bomb.mesh);
                bombs.splice(i, 1);
            }
        }
    }

    function updateDragonVisuals() {
        if (!dragon) return;
        
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
            
            // Wing flap animation
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
        updateSingleDragonVisuals(dragon);
        
        // Update extra dragons
        extraDragons.forEach(d => updateSingleDragonVisuals(d));
    }

    function updateDragon() {
        if (!dragon && extraDragons.length === 0) return;
        
        const now = Date.now();
        
        // Helper function to update a single dragon
        function updateSingleDragon(d) {
            if (!d || !d.alive) return;
            
            // Find closest player for targeting
            const distToPlayer = Math.sqrt(
                (playerGroup.position.x - d.mesh.position.x) ** 2 +
                (playerGroup.position.z - d.mesh.position.z) ** 2
            );
            
            let targetPlayer = playerGroup;
            let targetDist = distToPlayer;
            
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
                if (now - lastDamageTime > damageCooldown) {
                    playerHealth--;
                    lastDamageTime = now;
                    damageFlashTime = now;
                    Audio.playStuckSound();
                    
                    if (playerHealth <= 0) {
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
                    
                    if (now - d.lastOtherPlayerDamageTime > damageCooldown) {
                        multiplayerManager.sendGameEvent('playerDamage', {});
                        d.lastOtherPlayerDamageTime = now;
                    }
                }
            }
            
            // Flying behavior - randomly fly up sometimes
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
            
            // Patrol movement
            d.mesh.position.x += d.speed * d.direction;
            
            if (d.mesh.position.x <= d.patrolLeft) {
                d.direction = 1;
            } else if (d.mesh.position.x >= d.patrolRight) {
                d.direction = -1;
            }
            
            // Fire fireballs at players (not when frozen)
            if (!d.frozen && now - d.lastFireTime > d.fireInterval) {
                let fireTargetPlayer = playerGroup;
                let fireTargetDist = distToPlayer;
                
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
                
                // Only fire if player is in range
                if (fireTargetDist < 100) {
                    createDragonFireball(d, fireTargetPlayer);
                    d.lastFireTime = now;
                    Audio.playExplosionSound();
                }
            }
        }
        
        // Update main dragon
        if (dragon && dragon.alive) {
            updateSingleDragon(dragon);
        }
        
        // Update extra dragons
        extraDragons.forEach(d => updateSingleDragon(d));
    }
    
    // Helper function to create a fireball from a dragon
    function createDragonFireball(d, targetPlayer) {
        const fbTextures = getTerrainTextures(THREE);
        
        // Use ice-themed textures for winter level
        const fireballTexture = iceTheme ? fbTextures.fireballIce : fbTextures.fireball;
        const explosionTexture = iceTheme ? fbTextures.explosionIce : fbTextures.explosion;
        
        // Create fireball group with core, glow, and flames
        const fireballGroup = new THREE.Group();
        
        // Scale fireball based on dragon size
        const fbScale = d.scale || 1;
        
        // Core sphere
        const coreGeometry = new THREE.SphereGeometry(0.6 * fbScale, 12, 12);
        const coreMaterial = new THREE.MeshBasicMaterial({ 
            map: fireballTexture,
            transparent: true
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        fireballGroup.add(core);
        
        // Outer glow sprite
        const glowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.7
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(3 * fbScale, 3 * fbScale, 1);
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
        innerGlow.scale.set(1.8 * fbScale, 1.8 * fbScale, 1);
        fireballGroup.add(innerGlow);
        
        fireballGroup.position.copy(d.mesh.position);
        fireballGroup.position.x += d.direction > 0 ? 14 * fbScale : -14 * fbScale;
        fireballGroup.position.y += 1;
        scene.add(fireballGroup);
        
        // Calculate direction to target (including Y axis)
        const dirX = targetPlayer.position.x - fireballGroup.position.x;
        const dirY = targetPlayer.position.y - fireballGroup.position.y;
        const dirZ = targetPlayer.position.z - fireballGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        
        fireballs.push({
            mesh: fireballGroup,
            velocity: new THREE.Vector3(dirX / length * 0.4, dirY / length * 0.4, dirZ / length * 0.4),
            radius: 1.5 * fbScale,
            damage: 1,
            trail: [],
            lastTrailTime: 0
        });
    }

    // Helper function to create a fireball from a wizard goblin
    function createWizardFireball(wizard, targetPlayer) {
        const fbTextures = getTerrainTextures(THREE);
        
        // Use ice-themed textures for winter level
        const fireballTexture = iceTheme ? fbTextures.fireballIce : fbTextures.fireball;
        const explosionTexture = iceTheme ? fbTextures.explosionIce : fbTextures.explosion;
        
        // Create smaller fireball group (60% size of dragon's)
        const fireballGroup = new THREE.Group();
        const fbScale = 0.4;
        
        // Core sphere - purple/magenta tint for wizard magic
        const coreGeometry = new THREE.SphereGeometry(0.6 * fbScale, 12, 12);
        const coreMaterial = new THREE.MeshBasicMaterial({ 
            map: fireballTexture,
            transparent: true,
            color: iceTheme ? 0x00FFFF : 0xFF00FF // Magenta or cyan tint
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        fireballGroup.add(core);
        
        // Outer glow sprite
        const glowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.7,
            color: iceTheme ? 0x00FFFF : 0xFF00FF
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(2 * fbScale, 2 * fbScale, 1);
        fireballGroup.add(glow);
        
        // Inner bright glow
        const innerGlowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.9,
            color: iceTheme ? 0x88FFFF : 0xFF88FF
        });
        const innerGlow = new THREE.Sprite(innerGlowMaterial);
        innerGlow.scale.set(1.2 * fbScale, 1.2 * fbScale, 1);
        fireballGroup.add(innerGlow);
        
        // Position fireball at wizard's staff position
        fireballGroup.position.copy(wizard.mesh.position);
        fireballGroup.position.x += 0.9;
        fireballGroup.position.y += 3.2;
        fireballGroup.position.z += 0.3;
        scene.add(fireballGroup);
        
        // Calculate direction to target (including Y axis)
        const dirX = targetPlayer.position.x - fireballGroup.position.x;
        const dirY = (targetPlayer.position.y + 1) - fireballGroup.position.y; // Aim at player center
        const dirZ = targetPlayer.position.z - fireballGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        
        // Wizard fireballs are slower but still dangerous
        const speed = 0.25;
        
        fireballs.push({
            mesh: fireballGroup,
            velocity: new THREE.Vector3(dirX / length * speed, dirY / length * speed, dirZ / length * speed),
            radius: 0.8,
            damage: 1,
            trail: [],
            lastTrailTime: 0,
            isWizardFireball: true
        });
        
        // Play a sound effect
        Audio.playExplosionSound();
    }

    // Helper function to create a fireball from a lava monster
    function createLavaMonsterFireball(monster, targetPlayer) {
        const fbTextures = getTerrainTextures(THREE);
        const fireballTexture = fbTextures.fireball;
        const explosionTexture = fbTextures.explosion;
        
        const fireballGroup = new THREE.Group();
        const fbScale = 0.5;
        
        // Core sphere - bright orange/yellow lava
        const coreGeometry = new THREE.SphereGeometry(0.6 * fbScale, 12, 12);
        const coreMaterial = new THREE.MeshBasicMaterial({ 
            map: fireballTexture,
            transparent: true,
            color: 0xff6600
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        fireballGroup.add(core);
        
        // Outer glow sprite - orange
        const glowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.8,
            color: 0xff4400
        });
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(2.5 * fbScale, 2.5 * fbScale, 1);
        fireballGroup.add(glow);
        
        // Inner bright glow - yellow
        const innerGlowMaterial = new THREE.SpriteMaterial({
            map: explosionTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.95,
            color: 0xffaa00
        });
        const innerGlow = new THREE.Sprite(innerGlowMaterial);
        innerGlow.scale.set(1.5 * fbScale, 1.5 * fbScale, 1);
        fireballGroup.add(innerGlow);
        
        // Position fireball at monster's center
        fireballGroup.position.copy(monster.mesh.position);
        fireballGroup.position.y += 1.5;
        scene.add(fireballGroup);
        
        // Calculate direction to target
        const dirX = targetPlayer.position.x - fireballGroup.position.x;
        const dirY = (targetPlayer.position.y + 1) - fireballGroup.position.y;
        const dirZ = targetPlayer.position.z - fireballGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        
        const speed = 0.28;
        
        fireballs.push({
            mesh: fireballGroup,
            velocity: new THREE.Vector3(dirX / length * speed, dirY / length * speed, dirZ / length * speed),
            radius: 1.0,
            damage: 1,
            trail: [],
            lastTrailTime: 0,
            isLavaMonsterFireball: true
        });
        
        Audio.playExplosionSound();
    }

    // Helper function to create a lava trail (small temporary lava pool)
    function createLavaTrail(x, z, creatorId) {
        const trailGroup = new THREE.Group();
        
        // Glowing lava pool
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
        
        // Darker crust ring
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
        
        // Small bubbling particle
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
        
        const terrainHeight = getTerrainHeight(x, z);
        trailGroup.position.set(x, terrainHeight, z);
        scene.add(trailGroup);
        
        const trail = {
            id: Date.now() + Math.random(),
            mesh: trailGroup,
            x: x,
            z: z,
            radius: GAME_CONFIG.LAVA_TRAIL_RADIUS,
            createdAt: Date.now(),
            duration: GAME_CONFIG.LAVA_TRAIL_DURATION,
            pool: pool,
            crust: crust,
            creatorId: creatorId
        };
        
        lavaTrails.push(trail);
        
        // Sync to other player in multiplayer
        if (multiplayerManager && multiplayerManager.isConnected() && multiplayerManager.isHost) {
            multiplayerManager.sendGameEvent('lavaTrailCreate', {
                id: trail.id,
                x: x,
                z: z,
                creatorId: creatorId
            });
        }
        
        return trail;
    }

    // Helper function to create a tornado from a mummy
    function createMummyTornado(mummy, targetPlayer) {
        const tornadoGroup = new THREE.Group();
        
        // Create tornado cone shape - larger size
        const coneGeometry = new THREE.ConeGeometry(0.8, 3.0, 12, 4, true);
        const coneMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xc4a14a,  // Sandy color
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.rotation.x = Math.PI; // Point up
        cone.position.y = 1.5;
        tornadoGroup.add(cone);
        
        // Inner spinning cone
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
        
        // Add dust particles - more and larger
        const dustGroup = new THREE.Group();
        for (let i = 0; i < 25; i++) {
            const dustGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 4, 4);
            const dustMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xc4a14a,
                transparent: true,
                opacity: 0.6 + Math.random() * 0.3
            });
            const dust = new THREE.Mesh(dustGeometry, dustMaterial);
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 3.0;
            const radius = 0.2 + (height / 3.0) * 0.7; // Wider at top
            dust.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
            dustGroup.add(dust);
        }
        tornadoGroup.add(dustGroup);
        tornadoGroup.dustGroup = dustGroup;
        tornadoGroup.innerCone = innerCone;
        tornadoGroup.outerCone = cone;
        
        // Position at mummy
        tornadoGroup.position.copy(mummy.mesh.position);
        tornadoGroup.position.y += 0.5;
        scene.add(tornadoGroup);
        
        // Calculate direction to target
        const dirX = targetPlayer.position.x - tornadoGroup.position.x;
        const dirZ = targetPlayer.position.z - tornadoGroup.position.z;
        const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
        
        const speed = 0.18;
        
        mummyTornados.push({
            mesh: tornadoGroup,
            velocity: new THREE.Vector3(dirX / length * speed, 0, dirZ / length * speed),
            radius: 1.0,
            damage: 1,
            spinPhase: 0
        });
        
        // Play a whoosh sound
        Audio.playExplosionSound();
    }

    // Wild tornado spawning for out-of-bounds players
    let lastWildTornadoSpawn = 0;
    const wildTornadoBaseInterval = 2000; // Base spawn interval
    
    function spawnWildTornado(targetX, targetZ) {
        // Spawn tornado from a random direction outside the visible area
        const angle = Math.random() * Math.PI * 2;
        const spawnDistance = 40 + Math.random() * 20;
        const spawnX = targetX + Math.cos(angle) * spawnDistance;
        const spawnZ = targetZ + Math.sin(angle) * spawnDistance;
        
        const tornadoGroup = new THREE.Group();
        
        // Create tornado cone shape
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
        
        // Inner spinning cone
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
        
        // Add dust particles
        const dustGroup = new THREE.Group();
        for (let i = 0; i < 25; i++) {
            const dustGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 4, 4);
            const dustMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xc4a14a,
                transparent: true,
                opacity: 0.6 + Math.random() * 0.3
            });
            const dust = new THREE.Mesh(dustGeometry, dustMaterial);
            const dustAngle = Math.random() * Math.PI * 2;
            const height = Math.random() * 3.0;
            const radius = 0.2 + (height / 3.0) * 0.7;
            dust.position.set(Math.cos(dustAngle) * radius, height, Math.sin(dustAngle) * radius);
            dustGroup.add(dust);
        }
        tornadoGroup.add(dustGroup);
        tornadoGroup.dustGroup = dustGroup;
        tornadoGroup.innerCone = innerCone;
        tornadoGroup.outerCone = cone;
        
        const terrainHeight = getTerrainHeight(spawnX, spawnZ);
        tornadoGroup.position.set(spawnX, terrainHeight + 0.5, spawnZ);
        scene.add(tornadoGroup);
        
        // Calculate direction to target player
        const dirX = targetX - spawnX;
        const dirZ = targetZ - spawnZ;
        const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
        
        const speed = 0.22; // Slightly faster than mummy tornados
        
        mummyTornados.push({
            mesh: tornadoGroup,
            velocity: new THREE.Vector3(dirX / length * speed, 0, dirZ / length * speed),
            radius: 1.0,
            damage: 1,
            spinPhase: 0,
            isWild: true // Mark as wild tornado
        });
    }
    
    function checkAndSpawnWildTornados() {
        if (!levelConfig.safeZoneBounds) return;
        
        const bounds = levelConfig.safeZoneBounds;
        const px = playerGroup.position.x;
        const pz = playerGroup.position.z;
        
        // Check if player is outside safe zone
        const outsideX = px < bounds.minX ? bounds.minX - px : (px > bounds.maxX ? px - bounds.maxX : 0);
        const outsideZ = pz < bounds.minZ ? bounds.minZ - pz : (pz > bounds.maxZ ? pz - bounds.maxZ : 0);
        const distanceOutside = Math.sqrt(outsideX * outsideX + outsideZ * outsideZ);
        
        if (distanceOutside > 0) {
            const now = Date.now();
            // Spawn rate increases the further out you are
            // At 10 units out: every 2 seconds, at 50 units out: every 0.4 seconds
            const spawnInterval = Math.max(400, wildTornadoBaseInterval - distanceOutside * 40);
            
            if (now - lastWildTornadoSpawn > spawnInterval) {
                // Spawn 1-3 tornados based on distance
                const tornadoCount = Math.min(3, 1 + Math.floor(distanceOutside / 20));
                for (let i = 0; i < tornadoCount; i++) {
                    spawnWildTornado(px, pz);
                }
                lastWildTornadoSpawn = now;
            }
        }
    }

    // Update tornados
    function updateMummyTornados() {
        for (let i = mummyTornados.length - 1; i >= 0; i--) {
            const tornado = mummyTornados[i];
            tornado.mesh.position.add(tornado.velocity);
            
            // Spin the tornado continuously
            tornado.spinPhase += 0.35;
            tornado.mesh.outerCone.rotation.y = tornado.spinPhase;
            if (tornado.mesh.innerCone) {
                tornado.mesh.innerCone.rotation.y = -tornado.spinPhase * 1.8;
            }
            
            // Animate dust particles
            if (tornado.mesh.dustGroup) {
                tornado.mesh.dustGroup.children.forEach((dust, idx) => {
                    const baseAngle = (idx / 25) * Math.PI * 2;
                    const angle = baseAngle + tornado.spinPhase;
                    const height = dust.position.y;
                    const radius = 0.25 + (height / 3.0) * 0.8;
                    dust.position.x = Math.cos(angle) * radius;
                    dust.position.z = Math.sin(angle) * radius;
                });
            }
            
            // Check collision with player
            const px = playerGroup.position.x;
            const pz = playerGroup.position.z;
            const dist = Math.sqrt(
                (tornado.mesh.position.x - px) ** 2 +
                (tornado.mesh.position.z - pz) ** 2
            );
            
            if (dist < tornado.radius + 0.8) {
                // Player hit by tornado
                if (!godMode) {
                    playerHealth -= tornado.damage;
                    damageFlashTime = Date.now();
                    
                    // Start tornado spin visual effect
                    tornadoSpinActive = true;
                    tornadoSpinStartTime = Date.now();
                    
                    if (playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    }
                }
                scene.remove(tornado.mesh);
                mummyTornados.splice(i, 1);
                continue;
            }
            
            // Check collision with other player in multiplayer
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh && otherPlayerMesh.visible) {
                const otherDist = Math.sqrt(
                    (tornado.mesh.position.x - otherPlayerMesh.position.x) ** 2 +
                    (tornado.mesh.position.z - otherPlayerMesh.position.z) ** 2
                );
                if (otherDist < tornado.radius + 0.8) {
                    // Host notifies client of tornado hit damage
                    if (multiplayerManager.isHost) {
                        multiplayerManager.sendGameEvent('tornadoHit', {});
                    }
                    scene.remove(tornado.mesh);
                    mummyTornados.splice(i, 1);
                    continue;
                }
            }
            
            // Check collision with canyon walls
            let hitCanyonWall = false;
            for (const wall of canyonWalls) {
                const cos = Math.cos(-wall.rotation);
                const sin = Math.sin(-wall.rotation);
                const dx = tornado.mesh.position.x - wall.x;
                const dz = tornado.mesh.position.z - wall.z;
                const localX = dx * cos - dz * sin;
                const localZ = dx * sin + dz * cos;
                
                const halfWidth = wall.width / 2;
                const halfDepth = wall.depth / 2;
                
                if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth) {
                    hitCanyonWall = true;
                    break;
                }
            }
            
            if (hitCanyonWall) {
                scene.remove(tornado.mesh);
                mummyTornados.splice(i, 1);
                continue;
            }
            
            // Remove if out of bounds or too far
            const tornadoDistFromOrigin = Math.sqrt(
                tornado.mesh.position.x ** 2 + tornado.mesh.position.z ** 2
            );
            if (tornadoDistFromOrigin > 300) {
                scene.remove(tornado.mesh);
                mummyTornados.splice(i, 1);
            }
        }
    }

    // Update lava trails (fade and check collision)
    function updateLavaTrails() {
        const now = Date.now();
        const px = playerGroup.position.x;
        const pz = playerGroup.position.z;
        
        for (let i = lavaTrails.length - 1; i >= 0; i--) {
            const trail = lavaTrails[i];
            const elapsed = now - trail.createdAt;
            const progress = elapsed / trail.duration;
            
            // Fade out over time
            if (progress < 1) {
                const opacity = 1 - progress;
                const fadeMultiplier = Math.pow(opacity, 0.5); // Slower initial fade
                
                if (trail.pool) {
                    trail.pool.material.opacity = 0.9 * fadeMultiplier;
                }
                if (trail.crust) {
                    trail.crust.material.opacity = 0.6 * fadeMultiplier;
                }
                
                // Bubble animation
                if (trail.mesh.bubble) {
                    trail.mesh.bubble.position.y = 0.2 + Math.sin(now * 0.01 + i) * 0.15;
                    trail.mesh.bubble.material.opacity = 0.8 * fadeMultiplier;
                }
                
                // Shrink slightly as it fades
                const scale = 0.7 + 0.3 * fadeMultiplier;
                trail.mesh.scale.setScalar(scale);
                
                // Check collision with local player
                const dist = Math.sqrt((px - trail.x) ** 2 + (pz - trail.z) ** 2);
                if (dist < trail.radius * scale - 0.3 && !godMode) {
                    // Player stepped in lava trail - instant death
                    if (!gameDead) {
                        playerHealth = 0;
                        gameDead = true;
                        Audio.stopBackgroundMusic();
                        Audio.playDeathSound();
                    }
                }
                
                // Check collision with other player in multiplayer (host only)
                if (multiplayerManager && multiplayerManager.isHost && multiplayerManager.isConnected() && otherPlayerMesh && otherPlayerMesh.visible) {
                    const otherDist = Math.sqrt(
                        (otherPlayerMesh.position.x - trail.x) ** 2 +
                        (otherPlayerMesh.position.z - trail.z) ** 2
                    );
                    if (otherDist < trail.radius * scale - 0.3) {
                        // Notify client of lava trail death
                        multiplayerManager.sendGameEvent('lavaTrailDeath', {});
                    }
                }
            } else {
                // Trail expired, remove it
                scene.remove(trail.mesh);
                lavaTrails.splice(i, 1);
            }
        }
    }

    function updateFireballs() {
        const now = Date.now();
        
        // Update fireballs
        for (let i = fireballs.length - 1; i >= 0; i--) {
            const fireball = fireballs[i];
            fireball.mesh.position.add(fireball.velocity);
            
            // Add flame trail particles
            if (fireball.trail && now - fireball.lastTrailTime > 30) {
                // Clone pre-cached material for trail
                const trailMaterial = explosionBaseMaterial.clone();
                trailMaterial.opacity = 0.8;
                const trailSprite = new THREE.Sprite(trailMaterial);
                const trailSize = 0.8 + Math.random() * 0.5;
                trailSprite.scale.set(trailSize, trailSize, 1);
                trailSprite.position.copy(fireball.mesh.position);
                // Offset slightly behind the fireball
                trailSprite.position.x -= fireball.velocity.x * 2;
                trailSprite.position.y -= fireball.velocity.y * 2;
                trailSprite.position.z -= fireball.velocity.z * 2;
                scene.add(trailSprite);
                fireball.trail.push({ sprite: trailSprite, life: 15, initialSize: trailSize });
                fireball.lastTrailTime = now;
            }
            
            // Update trail particles
            if (fireball.trail) {
                for (let t = fireball.trail.length - 1; t >= 0; t--) {
                    const trail = fireball.trail[t];
                    trail.life--;
                    const lifeRatio = trail.life / 15;
                    trail.sprite.material.opacity = lifeRatio * 0.8;
                    const scale = trail.initialSize * (0.3 + lifeRatio * 0.7);
                    trail.sprite.scale.set(scale, scale, 1);
                    if (trail.life <= 0) {
                        scene.remove(trail.sprite);
                        fireball.trail.splice(t, 1);
                    }
                }
            }
            
            // Pulse the glow effects
            if (fireball.mesh.children && fireball.mesh.children.length > 1) {
                const pulseScale = 1 + Math.sin(now * 0.02) * 0.15;
                fireball.mesh.children[1].scale.set(3 * pulseScale, 3 * pulseScale, 1);
                fireball.mesh.children[2].scale.set(1.8 * pulseScale, 1.8 * pulseScale, 1);
            }
            
            // Check collision with player (only host applies damage)
            const distToPlayer = new THREE.Vector2(
                playerGroup.position.x - fireball.mesh.position.x,
                playerGroup.position.z - fireball.mesh.position.z
            ).length();
            
            if (distToPlayer < fireball.radius) {
                // Only host applies damage to host player
                if (!godMode && (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost)) {
                    playerHealth -= fireball.damage;
                    damageFlashTime = Date.now();
                    if (playerHealth <= 0) {
                        if (!gameDead) {
                            gameDead = true;
                            Audio.stopBackgroundMusic();
                            Audio.playDeathSound();
                        }
                    } else {
                        Audio.playStuckSound();
                    }
                }
                
                createFireballExplosion(fireball.mesh.position.x, fireball.mesh.position.y, fireball.mesh.position.z);
                // Clean up trail particles
                if (fireball.trail) {
                    fireball.trail.forEach(t => scene.remove(t.sprite));
                }
                scene.remove(fireball.mesh);
                fireballs.splice(i, 1);
                continue;
            }
            
            // Check collision with other player (multiplayer)
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = new THREE.Vector2(
                    otherPlayerMesh.position.x - fireball.mesh.position.x,
                    otherPlayerMesh.position.z - fireball.mesh.position.z
                ).length();
                
                if (distToOther < fireball.radius) {
                    // Let host handle damage
                    if (multiplayerManager.isHost) {
                        // Notify client of damage
                        multiplayerManager.sendGameEvent('playerDamage', {});
                    }
                    createFireballExplosion(fireball.mesh.position.x, fireball.mesh.position.y, fireball.mesh.position.z);
                    // Clean up trail particles
                    if (fireball.trail) {
                        fireball.trail.forEach(t => scene.remove(t.sprite));
                    }
                    scene.remove(fireball.mesh);
                    fireballs.splice(i, 1);
                    continue;
                }
            }
            
            // Remove if out of bounds or hit ground
            const terrainHeight = getTerrainHeight(fireball.mesh.position.x, fireball.mesh.position.z);
            
            // Check collision with mountains (if level has them)
            let hitMountain = false;
            if (levelConfig.mountains && levelConfig.mountains.length > 0) {
                for (const mtn of levelConfig.mountains) {
                    const distToMountain = Math.sqrt(
                        (fireball.mesh.position.x - mtn.x) ** 2 +
                        (fireball.mesh.position.z - mtn.z) ** 2
                    );
                    // Mountain radius is half its width
                    if (distToMountain < mtn.width / 2) {
                        hitMountain = true;
                        break;
                    }
                }
            }
            
            // Check collision with canyon walls
            let hitCanyonWall = false;
            for (const wall of canyonWalls) {
                // Transform fireball position into wall's local space
                const cos = Math.cos(-wall.rotation);
                const sin = Math.sin(-wall.rotation);
                const dx = fireball.mesh.position.x - wall.x;
                const dz = fireball.mesh.position.z - wall.z;
                const localX = dx * cos - dz * sin;
                const localZ = dx * sin + dz * cos;
                
                // Check if inside wall bounds
                const halfWidth = wall.width / 2;
                const halfDepth = wall.depth / 2;
                
                if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth && fireball.mesh.position.y < wall.height) {
                    hitCanyonWall = true;
                    break;
                }
            }
            
            if (fireball.mesh.position.y < terrainHeight || hitMountain || hitCanyonWall ||
                Math.abs(fireball.mesh.position.x) > GAME_CONFIG.WORLD_BOUND ||
                Math.abs(fireball.mesh.position.z) > GAME_CONFIG.WORLD_BOUND) {
                createFireballExplosion(fireball.mesh.position.x, terrainHeight, fireball.mesh.position.z);
                // Clean up trail particles
                if (fireball.trail) {
                    fireball.trail.forEach(t => scene.remove(t.sprite));
                }
                scene.remove(fireball.mesh);
                fireballs.splice(i, 1);
            }
        }
    }

    function checkCollisions(prevPos) {
        let isStuck = false;
        const px = playerGroup.position.x;
        const pz = playerGroup.position.z;
        
        // Lava pool collision - instant death!
        lavaPools.forEach(pool => {
            const dist = Math.sqrt(
                (px - pool.x) ** 2 +
                (pz - pool.z) ** 2
            );
            if (dist < pool.radius - 0.5 && !godMode) {
                // Player fell into lava - instant death
                if (!gameDead) {
                    playerHealth = 0;
                    gameDead = true;
                    Audio.stopBackgroundMusic();
                    Audio.playDeathSound();
                }
            }
        });
        
        // Mountains (only if level has them)
        if (levelConfig.mountains && levelConfig.mountains.length > 0) {
            levelConfig.mountains.forEach(mtn => {
                const dist = new THREE.Vector2(
                    playerGroup.position.x - mtn.x,
                    playerGroup.position.z - mtn.z
                ).length();
                if (dist < mtn.width/2 + 1.5) {
                    playerGroup.position.copy(prevPos);
                    isStuck = true;
                }
            });
        }
        
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
        
        // Boulders
        boulders.forEach(boulder => {
            const dist = new THREE.Vector2(
                playerGroup.position.x - boulder.mesh.position.x,
                playerGroup.position.z - boulder.mesh.position.z
            ).length();
            if (dist < boulder.radius + 0.8) {
                playerGroup.position.copy(prevPos);
                isStuck = true;
            }
        });
        
        // Canyon walls - box collision
        canyonWalls.forEach(wall => {
            // Transform player position into wall's local space (accounting for rotation)
            const cos = Math.cos(-wall.rotation);
            const sin = Math.sin(-wall.rotation);
            const dx = playerGroup.position.x - wall.x;
            const dz = playerGroup.position.z - wall.z;
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;
            
            // Check if inside wall bounds (with player radius buffer)
            const halfWidth = wall.width / 2 + 1.0;
            const halfDepth = wall.depth / 2 + 1.0;
            
            if (Math.abs(localX) < halfWidth && Math.abs(localZ) < halfDepth) {
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
        
        // Goblin collision damage
        const now = Date.now();
        goblins.forEach(gob => {
            if (!gob.alive) return;
            
            // Check if frozen
            if (gob.frozen && Date.now() < gob.frozenUntil) {
                return; // Skip damage while frozen
            }
            
            const distToGob = new THREE.Vector2(
                playerGroup.position.x - gob.mesh.position.x,
                playerGroup.position.z - gob.mesh.position.z
            ).length();
            
            // Check if player is in ice berg (safe zone) - only if iceBerg exists
            const playerInIceBerg = iceBerg ? Math.sqrt(
                Math.pow(playerGroup.position.x - iceBerg.position.x, 2) +
                Math.pow(playerGroup.position.z - iceBerg.position.z, 2)
            ) < iceBerg.radius : false;
            
            if (playerInIceBerg) {
                return; // Don't damage player in ice berg
            }
            
            if (distToGob < gob.radius + 1) {
                if (!godMode && now - lastDamageTime > damageCooldown) {
                    // Trigger giant attack animation and sound BEFORE damage
                    if (gob.isGiant) {
                        gob.isAttacking = true;
                        gob.attackAnimationProgress = 0;
                        Audio.playGiantAttackSound();
                    }
                    
                    playerHealth--;
                    lastDamageTime = now;
                    damageFlashTime = now;
                    
                    if (playerHealth <= 0) {
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
            if (waterTheme && gob.isGuardian && gob.mesh.tentacles) {
                const wavePhase = Date.now() * 0.003;
                gob.mesh.tentacles.forEach((tentacleData, idx) => {
                    const wave = Math.sin(wavePhase + idx * 0.5) * 0.4;
                    tentacleData.mesh.rotation.z = tentacleData.baseZ + wave;
                    tentacleData.mesh.rotation.x = tentacleData.baseX + wave * 0.5;
                });
            }
            
            // Update giant attack animation
            if (gob.isGiant && gob.isAttacking && !gob.frozen) {
                gob.attackAnimationProgress += 0.12;
                
                // Extra camera shake during attack
                const distToPlayer = new THREE.Vector2(
                    playerGroup.position.x - gob.mesh.position.x,
                    playerGroup.position.z - gob.mesh.position.z
                ).length();
                if (distToPlayer < 30) {
                    const attackShake = (1 - distToPlayer / 30) * 5;
                    camera.position.x += (Math.random() - 0.5) * attackShake;
                    camera.position.y += (Math.random() - 0.5) * attackShake;
                    camera.position.z += (Math.random() - 0.5) * attackShake;
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
        materials.forEach((material, idx) => {
            if (!material.collected) {
                const dist = playerGroup.position.distanceTo(material.mesh.position);
                if (dist < material.radius) {
                    material.collected = true;
                    material.mesh.visible = false;
                    materialsCollected++;
                    Audio.playCollectSound();
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', { type: 'material', index: idx });
                    }
                }
            }
        });
        
        // Collect ammo
        ammoPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const dist = playerGroup.position.distanceTo(pickup.mesh.position);
                if (dist < pickup.radius) {
                    pickup.collected = true;
                    pickup.mesh.visible = false;
                    ammo = Math.min(ammo + pickup.amount, maxAmmo);
                    Audio.playCollectSound();
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', { type: 'ammo', index: idx });
                    }
                }
            }
        });
        
        // Collect health
        healthPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const dist = playerGroup.position.distanceTo(pickup.mesh.position);
                if (dist < pickup.radius) {
                    pickup.collected = true;
                    pickup.mesh.visible = false;
                    playerHealth = Math.min(playerHealth + 1, maxPlayerHealth);
                    Audio.playCollectSound();
                    
                    // Notify other player
                    if (multiplayerManager && multiplayerManager.isConnected()) {
                        multiplayerManager.sendGameEvent('itemCollected', { type: 'health', index: idx });
                    }
                }
            }
        });
        
        // Collect scarabs
        scarabPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const dist = Math.sqrt(
                    Math.pow(playerGroup.position.x - pickup.x, 2) +
                    Math.pow(playerGroup.position.z - pickup.z, 2)
                );
                if (dist < 1.5) {
                    pickup.collected = true;
                    scene.remove(pickup.mesh);
                    scarabsCollected++;
                    Audio.playCollectSound();
                    
                    // Show collection message
                    if (totalScarabs > 0) {
                        const remaining = totalScarabs - scarabsCollected;
                        if (remaining > 0) {
                            console.log(`Scarab collected! ${remaining} more to find.`);
                        } else {
                            console.log('All scarabs collected! The treasure is now accessible!');
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
        scarabPickups.forEach((pickup) => {
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
        
        // Portal collision - level switching (only if portal exists)
        if (portal && portalCooldown <= 0) {
            const distToPortal = Math.sqrt(
                Math.pow(playerGroup.position.x - portal.x, 2) +
                Math.pow(playerGroup.position.z - portal.z, 2)
            );
            if (distToPortal < portal.radius) {
                // Switch to destination level
                const destinationLevel = portal.destinationLevel;
                console.log(`Entering portal to Level ${destinationLevel}!`);
                
                // Save inventory for next level
                persistentInventory.ammo = ammo;
                persistentInventory.bombs = bombInventory;
                persistentInventory.health = playerHealth;
                persistentInventory.hasKite = worldKiteCollected || player.hasKite;
                
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
        if (!player.isGliding) {
            traps.forEach(trap => {
                const distToTrap = new THREE.Vector2(
                    playerGroup.position.x - trap.mesh.position.x,
                    playerGroup.position.z - trap.mesh.position.z
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
        
        // Bridge repair - only if level has river/bridge
        if (bridgeObj && !bridgeRepaired && materialsCollected >= materialsNeeded) {
            const distToBridge = new THREE.Vector2(
                playerGroup.position.x,
                playerGroup.position.z
            ).length();
            if (distToBridge < 5) {
                bridgeRepaired = true;
                bridgeObj.mesh.visible = true;
                brokenBridgeGroup.visible = false;
                Audio.playRepairSound();
                
                // Notify other player in multiplayer
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('bridgeRepaired', {});
                }
            }
        }
        
        // River and bridge collision (can fly over when gliding) - only if river exists
        if (riverObj && !player.isGliding && playerGroup.position.z > riverObj.minZ && playerGroup.position.z < riverObj.maxZ) {
            const onBridge = bridgeRepaired &&
                            playerGroup.position.x > bridgeObj.minX && 
                            playerGroup.position.x < bridgeObj.maxX &&
                            playerGroup.position.z > bridgeObj.minZ && 
                            playerGroup.position.z < bridgeObj.maxZ;
            if (!onBridge) {
                playerGroup.position.copy(prevPos);
            }
        }
        
        // Treasure collection - only if this level has treasure
        if (treasure) {
            const dist = playerGroup.position.distanceTo(treasureGroup.position);
            if (dist < treasure.radius + 0.8) {
                // Check if scarabs are required and collected
                const scarabsRequired = totalScarabs > 0;
                const allScarabsCollected = scarabsCollected >= totalScarabs;
                
                if (scarabsRequired && !allScarabsCollected) {
                    // Can't collect treasure yet - need more scarabs
                    // Only show message occasionally to avoid spam
                    if (!treasure.lastWarningTime || Date.now() - treasure.lastWarningTime > 2000) {
                        treasure.lastWarningTime = Date.now();
                        const remaining = totalScarabs - scarabsCollected;
                        console.log(`Collect ${remaining} more Ancient Scarab${remaining > 1 ? 's' : ''} to unlock the treasure!`);
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
        }
        
        // Ice power collection - only if iceBerg exists
        if (iceBerg && !icePowerCollected) {
            const iceDist = Math.sqrt(
                (px - iceBerg.position.x) ** 2 +
                (pz - iceBerg.position.z) ** 2
            );
            if (iceDist < iceBerg.powerRadius) {
                icePowerCollected = true;
                hasIcePower = true;
                Audio.playCollectSound();
                
                // Notify other player in multiplayer
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('icePowerCollected', {});
                }
            }
        }
        
        // Banana power collection and refill
        const bananaDist = Math.sqrt(
            (px - bananaIceBerg.position.x) ** 2 +
            (pz - bananaIceBerg.position.z) ** 2
        );
        if (bananaDist < bananaIceBerg.powerRadius) {
            if (!worldBananaPowerCollected) {
                worldBananaPowerCollected = true;
                hasBananaPower = true;
                bananaInventory = maxBananas;
                Audio.playCollectSound();
                
                // Notify other player in multiplayer - both get the power
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('bananaPowerCollected', {});
                }
            } else if (hasBananaPower && bananaInventory < maxBananas) {
                // Refill bananas when returning to ice berg
                bananaInventory = maxBananas;
                Audio.playCollectSound();
            }
        }
        
        // Collect placed bananas
        for (let i = placedBananas.length - 1; i >= 0; i--) {
            const banana = placedBananas[i];
            const distToBanana = Math.sqrt(
                (px - banana.x) ** 2 +
                (pz - banana.z) ** 2
            );
            if (distToBanana < banana.radius) {
                // Pick up the banana
                bananaInventory = Math.min(bananaInventory + 1, maxBananas);
                scene.remove(banana.mesh);
                placedBananas.splice(i, 1);
                Audio.playCollectSound();
                
                // Notify other player
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('bananaCollected', { id: banana.id });
                }
            }
        }
        
        // Bomb pickups
        bombPickups.forEach((pickup, idx) => {
            if (!pickup.collected) {
                const distToPickup = Math.sqrt(
                    (px - pickup.mesh.position.x) ** 2 +
                    (pz - pickup.mesh.position.z) ** 2
                );
                if (distToPickup < pickup.radius && bombInventory < maxBombs) {
                    bombInventory++;
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
            }
        });
        
        // Check world kite collection
        if (!worldKiteCollected) {
            const kiteDistSq = (px - worldKiteGroup.position.x) ** 2 + (pz - worldKiteGroup.position.z) ** 2;
            if (kiteDistSq < 4) {
                worldKiteCollected = true;
                player.hasKite = true;
                player.glideCharge = player.maxGlideCharge; // Full charge immediately
                scene.remove(worldKiteGroup);
                Audio.playCollectSound();
                // Note: Kite state is synced via fullSync, not individual events
            }
        }
        
        return isStuck;
    }

    function resetGame() {
        gameDead = false;
        gameWon = false;
        
        Audio.startBackgroundMusic();
        
        const startX = (!multiplayerManager || multiplayerManager.isHost) ? levelConfig.playerStart.x - 2 : levelConfig.playerStart.x + 2;
        const startZ = levelConfig.playerStart.z;
        playerGroup.position.set(startX, getTerrainHeight(startX, startZ), startZ);
        player.rotation = Math.PI;
        playerGroup.rotation.y = Math.PI;
        playerGroup.rotation.x = 0;
        playerGroup.rotation.z = 0;
        player.isGliding = false;
        player.glideCharge = 100;
        player.glideState = 'none';
        player.glideLiftProgress = 0;
        player.hasKite = false;
        kiteGroup.visible = false;
        
        // Reset tornado spin effect
        tornadoSpinActive = false;
        
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
        otherPlayerHealth = 1;
        otherPlayerVelocity.x = 0;
        otherPlayerVelocity.z = 0;
        otherPlayerLastPos.x = otherStartX;
        otherPlayerLastPos.z = 40;
        
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
            gob.patrolLeft = gob.initialPatrolLeft;
            gob.patrolRight = gob.initialPatrolRight;
            const terrainH = getTerrainHeight(gob.initialX, gob.initialZ);
            gob.mesh.position.set(gob.initialX, terrainH, gob.initialZ);
            if (gob.isGuardian) {
                gob.lastFireTime = Date.now() - Math.random() * 4000;
            }
        });
        
        bullets.forEach(b => scene.remove(b.mesh));
        bullets.length = 0;
        
        explosions.forEach(exp => scene.remove(exp.mesh));
        explosions.length = 0;
        
        guardianArrows.forEach(arrow => scene.remove(arrow.mesh));
        guardianArrows.length = 0;
        
        bombs.forEach(bomb => scene.remove(bomb.mesh));
        bombs.length = 0;
        
        // Reset birds
        birds.forEach(bird => {
            bird.lastBombTime = Date.now();
        });
        
        ammo = GAME_CONFIG.STARTING_AMMO;
        playerHealth = 1;
        lastDamageTime = 0;
        bridgeRepaired = false;
        materialsCollected = 0;
        hasIcePower = false;
        icePowerCollected = false;
        hasBananaPower = false;
        worldBananaPowerCollected = false;
        bananaInventory = 0;
        bombInventory = 0;
        if (bridgeObj) {
            bridgeObj.mesh.visible = false;
        }
        if (brokenBridgeGroup) {
            brokenBridgeGroup.visible = true;
        }
        
        // Remove all placed bananas
        placedBananas.forEach(banana => scene.remove(banana.mesh));
        placedBananas.length = 0;
        
        // Remove all placed bombs
        placedBombs.forEach(bomb => scene.remove(bomb.mesh));
        placedBombs.length = 0;
        
        // Remove all lava trails
        lavaTrails.forEach(trail => scene.remove(trail.mesh));
        lavaTrails.length = 0;
        
        // Remove all mummy tornados
        mummyTornados.forEach(tornado => scene.remove(tornado.mesh));
        mummyTornados.length = 0;
        
        // Remove all fireballs
        fireballs.forEach(fb => {
            if (fb.trail) {
                fb.trail.forEach(t => scene.remove(t.sprite));
            }
            scene.remove(fb.mesh);
        });
        fireballs.length = 0;
        
        materials.forEach(material => {
            material.collected = false;
            material.mesh.visible = true;
        });
        
        ammoPickups.forEach(pickup => {
            pickup.collected = false;
            pickup.mesh.visible = true;
        });
        
        healthPickups.forEach(pickup => {
            pickup.collected = false;
            pickup.mesh.visible = true;
        });
        
        bombPickups.forEach(pickup => {
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
    }, { signal: eventSignal });

    function drawHUD() {
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
        
        // Level indicator (top right)
        hudCtx.fillStyle = '#6600cc';
        hudCtx.font = 'bold 24px Arial';
        const levelText = `Level ${currentLevel}`;
        const levelTextWidth = hudCtx.measureText(levelText).width;
        hudCtx.fillText(levelText, hudCanvas.width - levelTextWidth - 20, 30);
        
        // Portal proximity indicator
        if (portal) {
            const distToPortal = Math.sqrt(
                Math.pow(playerGroup.position.x - portal.x, 2) +
                Math.pow(playerGroup.position.z - portal.z, 2)
            );
            if (distToPortal < 8) {
                hudCtx.fillStyle = '#00ffff';
                hudCtx.font = 'bold 28px Arial';
                const portalText = `Betrete das Portal zu Level ${portal.destinationLevel}!`;
                const portalTextWidth = hudCtx.measureText(portalText).width;
                hudCtx.fillText(portalText, (hudCanvas.width - portalTextWidth) / 2, hudCanvas.height - 60);
            }
        }
        
        hudCtx.fillStyle = '#000';
        hudCtx.font = 'bold 18px Arial';
        hudCtx.fillText(`Schüsse: ${ammo}/${maxAmmo}`, 10, 25);
        
        const aliveGoblins = goblins.filter(g => g.alive).length;
        hudCtx.fillText(`Kobolde: ${aliveGoblins}`, 10, 50);
        
        hudCtx.fillText(`Material: ${materialsCollected}/${materialsNeeded}`, 10, 75);
        
        // Scarab display (only if level has scarabs)
        let nextYPos = 100;
        if (totalScarabs > 0) {
            hudCtx.fillStyle = scarabsCollected >= totalScarabs ? '#00ff88' : '#00ccaa';
            hudCtx.fillText(`Scarabs: ${scarabsCollected}/${totalScarabs}`, 10, nextYPos);
            hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Health display
        hudCtx.fillText(`Leben: ${playerHealth}/${maxPlayerHealth}`, 10, nextYPos);
        nextYPos += 25;
        
        // Damage flash effect
        const now = Date.now();
        if (now - damageFlashTime < 300) {
            const flashOpacity = 0.4 * (1 - (now - damageFlashTime) / 300);
            hudCtx.fillStyle = `rgba(255, 0, 0, ${flashOpacity})`;
            hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);
        }
        
        // Kite charge bar or collection status
        if (player.hasKite) {
            hudCtx.fillText(`Drachen: ${Math.floor(player.glideCharge)}%`, 10, nextYPos);
            hudCtx.fillStyle = player.glideCharge >= 20 ? '#00FF00' : '#FF0000';
            hudCtx.fillRect(10, nextYPos + 5, player.glideCharge * 2, 10);
            hudCtx.strokeStyle = '#000';
            hudCtx.strokeRect(10, nextYPos + 5, 200, 10);
            hudCtx.fillStyle = '#000';
            nextYPos += 25;
        } else {
            hudCtx.fillStyle = '#FFD700';
            hudCtx.fillText('Finde den Drachen auf der anderen Seite!', 10, nextYPos);
            hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Ice power status
        if (hasIcePower) {
            const cooldownRemaining = Math.max(0, icePowerCooldown - (now - lastIcePowerTime));
            if (cooldownRemaining > 0) {
                hudCtx.fillStyle = '#666';
                hudCtx.fillText('Eis-Kraft: ' + Math.ceil(cooldownRemaining / 1000) + 's', 10, nextYPos);
            } else {
                hudCtx.fillStyle = '#00BFFF';
                hudCtx.fillText('Eis-Kraft: Drücke E zum Einfrieren!', 10, nextYPos);
            }
            hudCtx.fillStyle = '#000';
            nextYPos += 25;
        } else if (!icePowerCollected) {
            hudCtx.fillStyle = '#87CEEB';
            hudCtx.fillText('Finde den Eisberg für Eis-Kraft!', 10, nextYPos);
            hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Banana power status
        if (hasBananaPower) {
            hudCtx.fillStyle = '#FFD700';
            hudCtx.fillText(`🍌 Bananen: ${bananaInventory}/${maxBananas} (Drücke B)`, 10, nextYPos);
            hudCtx.fillStyle = '#000';
            nextYPos += 25;
        } else if (!worldBananaPowerCollected) {
            hudCtx.fillStyle = '#FFFF99';
            hudCtx.fillText('Finde den Bananen-Eisberg!', 10, nextYPos);
            hudCtx.fillStyle = '#000';
            nextYPos += 25;
        }
        
        // Bomb inventory
        hudCtx.fillStyle = '#FF4500';
        hudCtx.fillText(`💣 Bomben: ${bombInventory}/${maxBombs} (Drücke X)`, 10, nextYPos);
        hudCtx.fillStyle = '#000';
        
        if (!bridgeRepaired && materialsCollected >= materialsNeeded) {
            hudCtx.fillStyle = '#FFD700';
            hudCtx.fillText('Gehe zur Brücke um sie zu reparieren!', 10, 185);
            hudCtx.fillStyle = '#000';
        } else if (bridgeRepaired) {
            hudCtx.fillStyle = '#00FF00';
            hudCtx.fillText('Brücke repariert!', 10, 185);
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
            // Show different message for host vs client
            if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                hudCtx.fillText('Drücke R zum Neustart', hudCanvas.width / 2, hudCanvas.height / 2 + 60);
            } else {
                hudCtx.fillText('Warte auf Host für Neustart...', hudCanvas.width / 2, hudCanvas.height / 2 + 60);
            }
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
            // Show different message for host vs client
            if (!multiplayerManager || !multiplayerManager.isConnected() || multiplayerManager.isHost) {
                hudCtx.fillText('Drücke R zum Neustart', hudCanvas.width / 2, hudCanvas.height / 2 + 30);
            } else {
                hudCtx.fillText('Warte auf Host für Neustart...', hudCanvas.width / 2, hudCanvas.height / 2 + 30);
            }
            hudCtx.textAlign = 'left';
        }
        
        // Math exercise display
        if (mathExerciseActive && mathExercises.length > 0) {
            // Semi-transparent overlay
            hudCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);
            
            // Exercise text
            hudCtx.fillStyle = 'white';
            hudCtx.font = 'bold 48px Arial';
            hudCtx.textAlign = 'center';
            hudCtx.fillText('Löse die Aufgabe!', hudCanvas.width / 2, 150);
            
            hudCtx.font = 'bold 64px Arial';
            hudCtx.fillText(mathExercises[0].question + ' = ?', hudCanvas.width / 2, 250);
            
            hudCtx.font = 'bold 56px Arial';
            hudCtx.fillStyle = '#4CAF50';
            hudCtx.fillText(currentMathAnswer || '_', hudCanvas.width / 2, 350);
            
            // Show remaining exercises
            if (mathExercises.length > 1) {
                hudCtx.font = '24px Arial';
                hudCtx.fillStyle = 'white';
                hudCtx.fillText(`Noch ${mathExercises.length} Aufgaben`, hudCanvas.width / 2, 420);
            }
            
            hudCtx.font = '20px Arial';
            hudCtx.fillStyle = '#AAA';
            hudCtx.fillText('Gib deine Antwort ein und drücke ENTER', hudCanvas.width / 2, 480);
            hudCtx.textAlign = 'left';
        }
        
        // Other player marker/indicator
        if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh && otherPlayerMesh.visible) {
            // Project other player's 3D position to 2D screen coordinates
            const otherPos = otherPlayerMesh.position.clone();
            otherPos.y += 2; // Slightly above head
            otherPos.project(camera);
            
            // Convert from normalized device coordinates (-1 to 1) to screen pixels
            const screenX = (otherPos.x * 0.5 + 0.5) * hudCanvas.width;
            const screenY = (-otherPos.y * 0.5 + 0.5) * hudCanvas.height;
            
            // Check if behind camera (z > 1 means behind)
            const isBehindCamera = otherPos.z > 1;
            
            // Check if on screen (with margin)
            const margin = 60;
            const isOnScreen = !isBehindCamera && 
                               screenX >= margin && screenX <= hudCanvas.width - margin &&
                               screenY >= margin && screenY <= hudCanvas.height - margin;
            
            // Player label
            const playerLabel = multiplayerManager.isHost ? "Spieler 2" : "Spieler 1";
            const markerColor = multiplayerManager.isHost ? '#4488FF' : '#FF6B9D';
            
            if (isOnScreen) {
                // Draw marker above player when visible
                hudCtx.fillStyle = markerColor;
                hudCtx.beginPath();
                hudCtx.moveTo(screenX, screenY - 25);
                hudCtx.lineTo(screenX - 10, screenY - 40);
                hudCtx.lineTo(screenX + 10, screenY - 40);
                hudCtx.closePath();
                hudCtx.fill();
                
                // Draw label
                hudCtx.font = 'bold 14px Arial';
                hudCtx.textAlign = 'center';
                hudCtx.fillStyle = '#FFF';
                hudCtx.strokeStyle = '#000';
                hudCtx.lineWidth = 3;
                hudCtx.strokeText(playerLabel, screenX, screenY - 45);
                hudCtx.fillText(playerLabel, screenX, screenY - 45);
                hudCtx.textAlign = 'left';
            } else {
                // Draw arrow at edge of screen pointing to other player
                let edgeX = screenX;
                let edgeY = screenY;
                
                // If behind camera, flip the direction
                if (isBehindCamera) {
                    edgeX = hudCanvas.width - screenX;
                    edgeY = hudCanvas.height - screenY;
                }
                
                // Clamp to screen edges with margin
                edgeX = Math.max(margin, Math.min(hudCanvas.width - margin, edgeX));
                edgeY = Math.max(margin, Math.min(hudCanvas.height - margin, edgeY));
                
                // Calculate direction from center to clamped position for arrow rotation
                const centerX = hudCanvas.width / 2;
                const centerY = hudCanvas.height / 2;
                const dirX = isBehindCamera ? (hudCanvas.width - screenX) - centerX : screenX - centerX;
                const dirY = isBehindCamera ? (hudCanvas.height - screenY) - centerY : screenY - centerY;
                const angle = Math.atan2(dirY, dirX);
                
                // Draw arrow indicator at edge
                hudCtx.save();
                hudCtx.translate(edgeX, edgeY);
                hudCtx.rotate(angle);
                
                // Arrow shape pointing right (will be rotated)
                hudCtx.fillStyle = markerColor;
                hudCtx.strokeStyle = '#000';
                hudCtx.lineWidth = 2;
                hudCtx.beginPath();
                hudCtx.moveTo(20, 0);         // Tip
                hudCtx.lineTo(-10, -12);      // Top back
                hudCtx.lineTo(-5, 0);         // Notch
                hudCtx.lineTo(-10, 12);       // Bottom back
                hudCtx.closePath();
                hudCtx.fill();
                hudCtx.stroke();
                
                hudCtx.restore();
                
                // Draw label near arrow
                hudCtx.font = 'bold 12px Arial';
                hudCtx.textAlign = 'center';
                hudCtx.fillStyle = '#FFF';
                hudCtx.strokeStyle = '#000';
                hudCtx.lineWidth = 3;
                const labelOffsetX = Math.cos(angle + Math.PI) * 35;
                const labelOffsetY = Math.sin(angle + Math.PI) * 35;
                hudCtx.strokeText(playerLabel, edgeX + labelOffsetX, edgeY + labelOffsetY);
                hudCtx.fillText(playerLabel, edgeX + labelOffsetX, edgeY + labelOffsetY);
                hudCtx.textAlign = 'left';
            }
        }
    }

    // Start background music
    Audio.startBackgroundMusic();

    // Game loop with delta time
    let lastTime = performance.now();
    const targetFPS = 60;
    const targetFrameTime = 1000 / targetFPS;
    let accumulator = 0;
    
    function animate(currentTime) {
        currentAnimationId = requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        accumulator += deltaTime;
        
        const time = currentTime * 0.001;
        
        // Animate water waves in water theme
        if (waterTheme && scene.userData.water) {
            const water = scene.userData.water;
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
        if (riverObj) {
            const riverGeometry = riverObj.mesh.geometry;
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
        if (!worldKiteCollected) {
            worldKiteGroup.rotation.y = time;
        }
        
        // Animate grass bushels (visual only)
        grassBushels.forEach(grass => {
            const sway = Math.sin(time * 2 + grass.phase) * 0.1;
            grass.mesh.rotation.z = sway;
        });
        
        // Animate player kites with natural sway movement
        if (kiteGroup.visible) {
            // Subtle random-looking movement using multiple sine waves
            const kiteSwayX = Math.sin(time * 1.5) * 0.15 + Math.sin(time * 2.3) * 0.1;
            const kiteSwayY = Math.sin(time * 1.8 + 1) * 0.1 + Math.cos(time * 2.1) * 0.08;
            const kiteSwayZ = Math.sin(time * 1.2 + 2) * 0.12;
            // Tilt forward/back from upright position with nose up - subtle rotation
            kiteGroup.rotation.x = -Math.PI / 2 + 0.3 + Math.sin(time * 1.5) * 0.05;
            kiteGroup.rotation.z = kiteSwayY * 0.05;
            kiteGroup.position.x = kiteSwayZ * 0.5;
            kiteGroup.position.y = 3.5 + Math.sin(time * 0.8) * 0.3;  // Gentle bobbing
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
        healthPickups.forEach(pickup => {
            if (!pickup.collected) {
                pickup.mesh.rotation.y = time * 2;
                pickup.mesh.position.y = getTerrainHeight(pickup.mesh.position.x, pickup.mesh.position.z) + 0.3 + Math.sin(time * 3) * 0.15;
            }
        });
        
        // Animate portal (visual effects)
        animatePortal();
        
        // Animate lava pools (pulsing glow effect)
        lavaPools.forEach(pool => {
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
        
        // Fixed timestep game logic updates
        while (accumulator >= targetFrameTime) {
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
                    camera.position.x += Math.sin(shakeSpeed * 5.7) * shakeIntensity;
                    camera.position.y += Math.sin(shakeSpeed * 6.3) * shakeIntensity;
                    camera.position.z += Math.sin(shakeSpeed * 4.9) * shakeIntensity;
                } else {
                    // Regular giant shake
                    let closestGiantDist = Infinity;
                    goblins.forEach(gob => {
                        if (!gob.alive || !gob.isGiant || gob.frozen) return;
                        const distToGiant = new THREE.Vector2(
                            playerGroup.position.x - gob.mesh.position.x,
                            playerGroup.position.z - gob.mesh.position.z
                        ).length();
                        
                        closestGiantDist = Math.min(closestGiantDist, distToGiant);
                        
                        if (distToGiant < 50) {
                            const shakeIntensity = (1 - distToGiant / 50) * 0.3;
                            const shakeSpeed = now * 0.015;
                            camera.position.x += Math.sin(shakeSpeed * 3.7) * shakeIntensity;
                            camera.position.y += Math.sin(shakeSpeed * 4.3) * shakeIntensity;
                            camera.position.z += Math.sin(shakeSpeed * 3.1) * shakeIntensity;
                        }
                    });
                    
                    // Controller rumble when close to giant
                    if (gamepad && closestGiantDist < 50) {
                        const rumbleIntensity = (1 - closestGiantDist / 50) * 0.8;
                        if (gamepad.vibrationActuator) {
                            gamepad.vibrationActuator.playEffect('dual-rumble', {
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
                    for (let i = placedBombs.length - 1; i >= 0; i--) {
                        const bomb = placedBombs[i];
                        
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
                            goblins.forEach(gob => {
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
                                (playerGroup.position.x - bomb.x) ** 2 +
                                (playerGroup.position.z - bomb.z) ** 2
                            );
                            if (distToPlayer < bomb.radius && !godMode) {
                                playerHealth -= 5;
                                damageFlashTime = now;
                                if (playerHealth <= 0 && !gameDead) {
                                    gameDead = true;
                                    Audio.stopBackgroundMusic();
                                    Audio.playDeathSound();
                                } else if (playerHealth > 0) {
                                    Audio.playStuckSound();
                                }
                            }
                            
                            // Damage dragon if present
                            if (dragon && dragon.alive) {
                                const distToDragon = Math.sqrt(
                                    (dragon.mesh.position.x - bomb.x) ** 2 +
                                    (dragon.mesh.position.z - bomb.z) ** 2
                                );
                                if (distToDragon < bomb.radius + 10) {
                                    dragon.health -= 5;
                                    if (dragon.health <= 0) {
                                        dragon.alive = false;
                                        dragon.mesh.visible = false;
                                    }
                                }
                            }
                            
                            // Remove bomb mesh
                            scene.remove(bomb.mesh);
                            placedBombs.splice(i, 1);
                            
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
                    updateGuardianArrows();
                    updateMummyTornados();
                    updateLavaTrails();
                    checkAndSpawnWildTornados();
                    updateBirds();
                    updateBombs();
                    updateDragon();
                }
                
                // Dragon visuals run on both host and client
                updateDragonVisuals();
                
                // Client does optimistic updates
                if (multiplayerManager && !multiplayerManager.isHost) {
                    // Client does optimistic goblin position updates
                    goblins.forEach(gob => {
                        if (gob.alive && gob.velocity) {
                            const dampening = 0.5; // Smooth interpolation
                            gob.mesh.position.x += gob.velocity.x * dampening;
                            gob.mesh.position.z += gob.velocity.z * dampening;
                            const terrainHeight = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
                            gob.mesh.position.y = terrainHeight + 0.1;
                        }
                    });
                    
                    // Client does optimistic arrow position updates
                    guardianArrows.forEach(arrow => {
                        if (arrow.velocity) {
                            const dampening = 0.6; // Smooth interpolation for arrows
                            arrow.mesh.position.x += arrow.velocity.x * dampening;
                            arrow.mesh.position.y += arrow.velocity.y * dampening;
                            arrow.mesh.position.z += arrow.velocity.z * dampening;
                        }
                    });
                }
                
                // Both update audio based on their position
                Audio.updateGoblinProximitySound(playerGroup.position, goblins);
                Audio.updateGiantProximitySound(playerGroup.position, goblins);
            }
            
            accumulator -= targetFrameTime;
        }
        
        drawHUD();
        renderer.render(scene, camera);
    }

    currentAnimationId = requestAnimationFrame(animate);
}
