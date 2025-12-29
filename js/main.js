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
            // Client receives game start from host
            startGame(data.difficulty);
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

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    speedMultiplier = difficulty === 'hard' ? GAME_CONFIG.HARD_SPEED_MULTIPLIER : GAME_CONFIG.EASY_SPEED_MULTIPLIER;
    document.getElementById('difficulty-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Host sends game start to client
    if (multiplayerManager && multiplayerManager.isHost && multiplayerManager.isConnected()) {
        multiplayerManager.sendGameStart(selectedDifficulty);
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

function initGame() {
    // Three.js setup
    const container = document.getElementById('gameCanvas');
    const scene = new THREE.Scene();
    
    // Use sky texture as background
    const skyTextures = getTerrainTextures(THREE);
    scene.background = skyTextures.sky;
    
    // Pre-cache explosion and smoke materials to avoid texture loading glitches
    const explosionBaseMaterial = new THREE.SpriteMaterial({
        map: skyTextures.explosion,
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
    let ammo = GAME_CONFIG.STARTING_AMMO;
    const maxAmmo = GAME_CONFIG.MAX_AMMO;
    let materialsCollected = 0;
    const materialsNeeded = GAME_CONFIG.MATERIALS_NEEDED;
    let playerHealth = 1;
    let otherPlayerHealth = 1;
    const maxPlayerHealth = 3;
    let lastDamageTime = 0;
    const damageCooldown = 2500; // ms between damage from goblins
    let damageFlashTime = 0;
    let lastClientStateSend = 0;
    const clientStateSendInterval = 50; // Send client state at 20Hz to match host sync
    
    // Get textures for player
    const playerTextures = getTerrainTextures(THREE);
    
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
    const startX = isHost ? -2 : 2;
    playerGroup.position.set(startX, 0, 40);
    playerGroup.rotation.y = Math.PI;
    scene.add(playerGroup);

    // Create other player mesh (for multiplayer)
    function createOtherPlayerMesh() {
        const otherPlayerGroup = new THREE.Group();
        
        // Opposite gender of main player
        const otherIsGirl = !isHost; // If we're host (girl), other is boy. If we're client (boy), other is girl.
        
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
            fireballs: fireballs.map(f => ({
                x: f.mesh.position.x,
                y: f.mesh.position.y,
                z: f.mesh.position.z,
                vx: f.velocity.x,
                vy: f.velocity.y,
                vz: f.velocity.z
            })),
            items: {
                materials: materials.map(m => m.collected),
                ammoPickups: ammoPickups.map(a => a.collected),
                healthPickups: healthPickups.map(h => h.collected),
                kiteCollected: worldKiteCollected,
                icePowerCollected: icePowerCollected
            },
            gameState: {
                bridgeRepaired: bridgeRepaired,
                materialsCollected: materialsCollected,
                gameWon: gameWon,
                gameDead: gameDead
            }
        };
    }
    
    // Function for client to apply full game state from host
    function applyFullGameSync(data) {
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
        
        // Update goblins
        if (data.goblins) {
            data.goblins.forEach((gobData, i) => {
                if (i < goblins.length) {
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
                    
                    // Create fireball group with core, glow, and flames
                    const fireballGroup = new THREE.Group();
                    
                    // Core sphere
                    const coreGeometry = new THREE.SphereGeometry(0.6, 12, 12);
                    const coreMaterial = new THREE.MeshBasicMaterial({ 
                        map: fbTextures.fireball,
                        transparent: true
                    });
                    const core = new THREE.Mesh(coreGeometry, coreMaterial);
                    fireballGroup.add(core);
                    
                    // Outer glow sprite
                    const glowMaterial = new THREE.SpriteMaterial({
                        map: fbTextures.explosion,
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
                        map: fbTextures.explosion,
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
    });

    window.addEventListener('gamepaddisconnected', (e) => {
        if (!isSplitscreen || e.gamepad.index === controllerIndex) {
            gamepad = null;
        }
    });

    function updateGamepad() {
        // In splitscreen mode, use specific controller index
        const gamepads = navigator.getGamepads();
        if (isSplitscreen) {
            gamepad = gamepads[controllerIndex];
        } else if (gamepad) {
            gamepad = gamepads[gamepad.index];
        }
        
        if (!gamepad) return;
        
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
    });

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
        { x: 5, z: -65 }, { x: -65, z: 35 },
        // Trees behind the gap (treasure area)
        { x: -20, z: -95 }, { x: 15, z: -100 }, { x: -35, z: -110 },
        { x: 40, z: -115 }, { x: -10, z: -125 }, { x: 25, z: -130 },
        { x: -50, z: -135 }, { x: 55, z: -140 }, { x: 0, z: -145 },
        { x: -30, z: -150 }, { x: 35, z: -155 }, { x: 10, z: -160 },
        // Dragon boss area trees - MANY MORE in the back and CENTER
        { x: -130, z: -195 }, { x: 140, z: -205 }, { x: -100, z: -220 },
        { x: 110, z: -230 }, { x: -140, z: -245 }, { x: 130, z: -255 },
        { x: -80, z: -200 }, { x: 90, z: -215 }, { x: -70, z: -260 },
        { x: 115, z: -240 }, { x: -95, z: -235 }, { x: 105, z: -250 },
        { x: -150, z: -220 }, { x: 145, z: -225 }, { x: 75, z: -195 },
        { x: -50, z: -210 }, { x: 55, z: -235 }, { x: -85, z: -247 },
        { x: 95, z: -258 }, { x: -120, z: -262 }, { x: 125, z: -248 },
        { x: -60, z: -225 }, { x: 65, z: -252 }, { x: -110, z: -238 },
        { x: 100, z: -222 }, { x: -75, z: -254 }, { x: 85, z: -245 },
        { x: -135, z: -232 }, { x: 135, z: -260 }, { x: -45, z: -218 },
        { x: 50, z: -243 }, { x: -105, z: -256 }, { x: 120, z: -217 },
        // CENTER area behind dragon (x: -40 to 40, z: -210 to -260)
        { x: -30, z: -210 }, { x: -15, z: -215 }, { x: 0, z: -220 },
        { x: 15, z: -225 }, { x: 30, z: -230 }, { x: -35, z: -235 },
        { x: -20, z: -240 }, { x: 10, z: -245 }, { x: 25, z: -250 },
        { x: -25, z: -255 }, { x: 5, z: -260 }, { x: 35, z: -212 },
        { x: -40, z: -222 }, { x: 20, z: -233 }, { x: -10, z: -248 },
        { x: 40, z: -258 }, { x: -5, z: -228 }, { x: 12, z: -238 }
    ];

    treePositions.forEach(pos => {
        const treeGroup = new THREE.Group();
        
        // Get cached textures from terrain.js
        const textures = getTerrainTextures(THREE);
        
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            map: textures.bark,
            color: 0xccbbaa
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const foliageMaterial = new THREE.MeshLambertMaterial({ 
            map: textures.foliage,
            color: 0x88dd88
        });
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
        { x: 0, z: 30 },
        // Dragon boss area rocks - MANY MORE in the back
        { x: -110, z: -200 }, { x: 125, z: -210 }, { x: -85, z: -225 },
        { x: 95, z: -235 }, { x: -135, z: -250 }, { x: 120, z: -245 },
        { x: -75, z: -205 }, { x: 100, z: -220 }, { x: -115, z: -255 },
        { x: 130, z: -230 }, { x: -90, z: -240 }, { x: 110, z: -260 },
        { x: -140, z: -215 }, { x: 135, z: -250 }, { x: -65, z: -260 },
        { x: 85, z: -200 }, { x: -125, z: -225 }, { x: 105, z: -255 },
        { x: -55, z: -218 }, { x: 70, z: -238 }, { x: -98, z: -248 },
        { x: 115, z: -252 }, { x: -82, z: -233 }, { x: 92, z: -258 },
        { x: -122, z: -243 }, { x: 128, z: -222 }, { x: -68, z: -246 },
        { x: 88, z: -228 }, { x: -102, z: -262 }, { x: 118, z: -236 },
        { x: -78, z: -214 }, { x: 82, z: -254 }, { x: -132, z: -257 },
        { x: 138, z: -241 }, { x: -72, z: -222 }, { x: 78, z: -248 },
        // CENTER area rocks behind dragon (x: -40 to 40, z: -210 to -260)
        { x: -35, z: -212 }, { x: -20, z: -218 }, { x: -8, z: -224 },
        { x: 5, z: -230 }, { x: 18, z: -236 }, { x: 32, z: -242 },
        { x: -28, z: -248 }, { x: -15, z: -254 }, { x: 0, z: -260 },
        { x: 12, z: -216 }, { x: 25, z: -222 }, { x: -38, z: -228 },
        { x: -25, z: -234 }, { x: -10, z: -240 }, { x: 8, z: -246 },
        { x: 22, z: -252 }, { x: 35, z: -258 }, { x: -32, z: -215 },
        { x: -18, z: -225 }, { x: 15, z: -235 }, { x: 28, z: -245 }
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
    
    // Extra grass in dragon boss area
    for (let i = 0; i < 150; i++) {
        const x = (Math.random() - 0.5) * 80; // x: -40 to 40
        const z = -210 - Math.random() * 55; // z: -210 to -265
        
        const grassGroup = new THREE.Group();
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

    // Ammo pickups
    const ammoPickups = [];
    const ammoPositions = [
        { x: -15, z: 20 }, { x: 35, z: 15 }, { x: -25, z: -10 },
        { x: 15, z: -25 }, { x: -40, z: 40 }, { x: 45, z: -35 },
        { x: 5, z: 25 }, { x: -30, z: -30 }, { x: 20, z: -15 },
        { x: -10, z: -40 }, { x: 40, z: 35 }, { x: -35, z: 5 },
        { x: -50, z: -15 }, { x: 55, z: -20 }, { x: -18, z: 50 },
        { x: 25, z: 55 }, { x: -45, z: -50 }, { x: 50, z: -55 },
        // Behind the gap
        { x: -20, z: -100 }, { x: 30, z: -110 }, { x: -10, z: -125 },
        { x: 40, z: -135 },
        // Additional ammo for harder difficulty
        { x: 10, z: -70 }, { x: -35, z: -75 }, { x: 45, z: -90 },
        { x: -15, z: -105 }, { x: 25, z: -120 }, { x: -30, z: -118 },
        { x: 52, z: -125 }, { x: 15, z: 45 },
        // Dragon boss area
        { x: -90, z: -195 }, { x: 100, z: -205 }, { x: -70, z: -220 },
        { x: 85, z: -235 }, { x: 0, z: -245 }, { x: -110, z: -250 },
        { x: 120, z: -215 }
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

    // Bomb pickups
    const bombPickups = [];
    const bombPositions = [
        // Early area
        { x: -35, z: 30 }, { x: 42, z: -10 }, { x: -18, z: -35 },
        { x: 30, z: 45 }, { x: -48, z: -18 }, { x: 15, z: -50 },
        { x: -25, z: 55 }, { x: 50, z: 25 }, { x: -55, z: -45 },
        // Middle area
        { x: -65, z: -110 }, { x: 55, z: -115 }, { x: -25, z: -140 },
        { x: 70, z: -155 }, { x: -80, z: -125 }, { x: 35, z: -130 },
        { x: -45, z: -165 }, { x: 60, z: -145 },
        // Dragon area
        { x: -95, z: -200 }, { x: 90, z: -210 }, { x: -60, z: -225 },
        { x: 75, z: -195 }, { x: -110, z: -215 }, { x: 105, z: -230 },
        { x: -40, z: -240 }, { x: 50, z: -220 }
    ];

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
    const heartPositions = [
        { x: -8, z: 50 }, { x: 32, z: -18 }, { x: -48, z: -25 },
        { x: 55, z: 22 }, { x: -22, z: 65 },
        // Middle area (before second gap and dragon)
        { x: -80, z: -100 }, { x: 75, z: -110 }, { x: 0, z: -120 },
        { x: -60, z: -140 }, { x: 65, z: -160 },
        // Dragon boss area
        { x: -100, z: -210 }, { x: 95, z: -225 }, { x: -60, z: -240 },
        { x: 70, z: -255 }
    ];

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
        const textures = getTerrainTextures(THREE);
        const goblinGrp = new THREE.Group();
        
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
        
        // Massive cylindrical body
        const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.8, 5.0, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.giantSkin });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3.5;
        body.castShadow = true;
        giantGrp.add(body);
        
        // Add armor plates on body
        const plateGeometry = new THREE.BoxGeometry(2.0, 0.4, 2.2);
        const plateMaterial = new THREE.MeshLambertMaterial({ map: textures.giantArmor });
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
        
        // Glowing orange eyes with texture
        const eyeGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            map: textures.giantEye,
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
        const armMaterial = new THREE.MeshLambertMaterial({ map: textures.giantSkin });
        
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
        const fistMaterial = new THREE.MeshLambertMaterial({ map: textures.giantSkin });
        
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

    // Create goblins
    const goblins = [];
    const maxGoblins = difficulty === 'easy' ? GAME_CONFIG.EASY_GOBLIN_COUNT : GAME_CONFIG.HARD_GOBLIN_COUNT;
    
    for (let i = 0; i < maxGoblins; i++) {
        const pos = GOBLIN_POSITIONS[i];
        goblins.push(createGoblin(pos[0], pos[1], pos[2], pos[3], pos[4]));
    }
    
    // Create guardian goblins on hard
    if (difficulty === 'hard') {
        // Add one test guardian for testing
        // goblins.push(createGuardianGoblin(15, 15, 10, 20, 0.014));
        
        // Giant guardian at the gap - huge, fast, lots of health
        goblins.push(createGiant(0, -85, -8, 8));
        
        // Additional giants guarding key areas
        goblins.push(createGiant(-40, -50, -50, -30));
        goblins.push(createGiant(40, -110, 30, 50));
        goblins.push(createGiant(-25, -115, -35, -15));
        
        // Guardians sprinkled across the far side of the river
        // Early area (just past the first gap)
        goblins.push(createGuardianGoblin(-45, -15, -50, -40, 0.012));
        goblins.push(createGuardianGoblin(50, -25, 45, 55, 0.012));
        goblins.push(createGuardianGoblin(-15, -40, -20, -10, 0.010));
        goblins.push(createGuardianGoblin(35, -55, 30, 40, 0.011));
        
        // Middle area (before second gap and dragon)
        goblins.push(createGuardianGoblin(-70, -95, -75, -65, 0.013));
        goblins.push(createGuardianGoblin(60, -105, 55, 65, 0.012));
        goblins.push(createGuardianGoblin(-30, -125, -35, -25, 0.011));
        goblins.push(createGuardianGoblin(80, -135, 75, 85, 0.013));
        goblins.push(createGuardianGoblin(-85, -150, -90, -80, 0.012));
        goblins.push(createGuardianGoblin(40, -165, 35, 45, 0.011));
        
        // Additional regular goblins in middle area
        goblins.push(createGoblin(-50, -100, -60, -40, 0.013));
        goblins.push(createGoblin(45, -120, 35, 55, 0.012));
        goblins.push(createGoblin(-15, -145, -25, -5, 0.011));
        goblins.push(createGoblin(65, -160, 55, 75, 0.013));
        
        // Dragon area (scattered around the boss)
        goblins.push(createGuardianGoblin(-90, -195, -95, -85, 0.013));
        goblins.push(createGuardianGoblin(85, -205, 80, 90, 0.012));
        goblins.push(createGuardianGoblin(-50, -215, -55, -45, 0.011));
        goblins.push(createGuardianGoblin(60, -230, 55, 65, 0.013));
        
        // Additional regular goblins in dragon area
        goblins.push(createGoblin(-75, -210, -85, -65, 0.012));
        goblins.push(createGoblin(70, -220, 60, 80, 0.013));
        goblins.push(createGoblin(-30, -235, -40, -20, 0.011));
        goblins.push(createGoblin(40, -245, 30, 50, 0.012));
        goblins.push(createGoblin(0, -225, -10, 10, 0.013));
        
        // Guardians in a ring around treasure
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
    rainbowGroup.position.set(GAME_CONFIG.TREASURE_X, 5, GAME_CONFIG.TREASURE_Z + 5);
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

    treasureGroup.position.set(GAME_CONFIG.TREASURE_X, 0, GAME_CONFIG.TREASURE_Z);
    scene.add(treasureGroup);

    const treasure = { mesh: treasureGroup, radius: 1 };

    // Ice Berg - opposite side of treasure, behind the gap
    const iceBergGroup = new THREE.Group();
    
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
    iceBergGroup.position.set(80, getTerrainHeight(80, -40), -40);
    scene.add(iceBergGroup);
    
    const iceBerg = {
        mesh: iceBergGroup,
        position: { x: 80, z: -40 },
        radius: 12,
        powerRadius: 8 // Radius for collecting ice power
    };
    
    let hasIcePower = false;
    let icePowerCollected = false;

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

    // Bomb inventory
    let bombInventory = 0;
    const maxBombs = 3;
    const placedBombs = []; // {id, mesh, x, z, radius, explodeAt}

    // Create Dragon (boss enemy)
    function createDragon() {
        const textures = getTerrainTextures(THREE);
        const dragonGroup = new THREE.Group();
        
        // Body - long segmented shape
        const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 10, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.dragonScale });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.x = 5;
        body.castShadow = true;
        dragonGroup.add(body);
        
        // Body scales
        for (let i = 0; i < 8; i++) {
            const scaleGeometry = new THREE.ConeGeometry(0.6, 1.2, 6);
            const scaleMaterial = new THREE.MeshLambertMaterial({ map: textures.dragonScale });
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
        const headMaterial = new THREE.MeshLambertMaterial({ map: textures.dragonScale });
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
            map: textures.dragonEye,
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
            map: textures.dragonEye,
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
            map: textures.dragonScale, 
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
            const spikeMaterial = new THREE.MeshLambertMaterial({ map: textures.dragonScale });
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
        
        // Position dragon closer to spawn for testing (normally at 60, -160)
        const dragonX = 0;
        const dragonZ = -200;
        dragonGroup.position.set(dragonX, getTerrainHeight(dragonX, dragonZ) + 3, dragonZ);
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
            health: 50,
            maxHealth: 50,
            alive: true,
            speed: 0.08 * speedMultiplier,
            patrolLeft: -30,
            patrolRight: 30,
            patrolFront: -210,
            patrolBack: -190,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: 4000, // Fire every 4 seconds
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
    const fireballs = [];
    
    if (difficulty === 'hard') {
        dragon = createDragon();
    }

    // Game arrays
    const bullets = [];
    const explosions = [];
    const smokeParticles = [];
    const scorchMarks = [];
    const guardianArrows = [];
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
        // Birds circling around the gap area - moved further from mountains
        birds.push(createBird(0, -85, 35, 0.006));
        birds.push(createBird(0, -85, 42, 0.007));
        birds.push(createBird(5, -80, 38, 0.0065));
        
        // Birds circling around the rainbow treasure area
        birds.push(createBird(60, -130, 22, 0.007));
        birds.push(createBird(60, -130, 28, 0.006));
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
                                gob.mesh.rotation.z = Math.PI / 2;
                                const terrainH = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
                                gob.mesh.position.y = terrainH + 0.5;
                                
                                // Show math exercise(s) only in easy mode
                                if (difficulty === 'easy') {
                                    const exerciseCount = gob.isGiant ? 3 : 1;
                                    showMathExercise(exerciseCount);
                                }
                            }
                        }
                        bulletHit = true;
                        break;
                    }
                }
            }
            
            // Check collision with dragon
            if (!bulletHit && dragon && dragon.alive) {
                const dist = bullet.mesh.position.distanceTo(dragon.mesh.position);
                if (dist < 8) {
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
            
            // Check if player is in ice berg (safe zone)
            const playerInIceBerg = Math.sqrt(
                Math.pow(playerGroup.position.x - iceBerg.position.x, 2) +
                Math.pow(playerGroup.position.z - iceBerg.position.z, 2)
            ) < iceBerg.radius;
            
            let targetPlayer = playerGroup;
            let distToTarget = distToPlayer;
            let targetInIceBerg = playerInIceBerg;
            
            // If multiplayer and other player is visible, check distance to them too
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = Math.sqrt(
                    Math.pow(otherPlayerMesh.position.x - gob.mesh.position.x, 2) + 
                    Math.pow(otherPlayerMesh.position.z - gob.mesh.position.z, 2)
                );
                
                const otherInIceBerg = Math.sqrt(
                    Math.pow(otherPlayerMesh.position.x - iceBerg.position.x, 2) +
                    Math.pow(otherPlayerMesh.position.z - iceBerg.position.z, 2)
                ) < iceBerg.radius;
                
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
                    
                    // Show math exercise(s) only in easy mode
                    if (difficulty === 'easy') {
                        const exerciseCount = gob.isGiant ? 3 : 1;
                        showMathExercise(exerciseCount);
                    }
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
                    
                    // Show math exercise(s) only in easy mode
                    if (difficulty === 'easy') {
                        const exerciseCount = gob.isGiant ? 3 : 1;
                        showMathExercise(exerciseCount);
                    }
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
            
            // Guardian arrows
            if (gob.isGuardian && distToTarget < 25) {
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
                    
                    Audio.playArrowShootSound();
                    
                    const tipGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
                    const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
                    const tipMesh = new THREE.Mesh(tipGeometry, tipMaterial);
                    tipMesh.position.y = 0.5;
                    arrowMesh.add(tipMesh);
                    
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
                    arrowMesh.rotation.x = Math.PI / 2;
                    arrowMesh.rotation.z = -angle;
                    
                    const arrowSpeed = difficulty === 'hard' ? 0.15 : 0.1;
                    
                    guardianArrows.push({
                        mesh: arrowMesh,
                        velocity: direction.multiplyScalar(arrowSpeed * speedMultiplier),
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
            
            // Check if players are in ice berg (safe zone)
            const playerInIceBerg = Math.sqrt(
                Math.pow(playerGroup.position.x - iceBerg.position.x, 2) +
                Math.pow(playerGroup.position.z - iceBerg.position.z, 2)
            ) < iceBerg.radius;
            
            // Drop bomb if player is close (and not in ice berg)
            const distToPlayer = new THREE.Vector2(
                playerGroup.position.x - bird.mesh.position.x,
                playerGroup.position.z - bird.mesh.position.z
            ).length();
            
            // Also check distance to other player in multiplayer
            let distToOtherPlayer = Infinity;
            let otherInIceBerg = true;
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                otherInIceBerg = Math.sqrt(
                    Math.pow(otherPlayerMesh.position.x - iceBerg.position.x, 2) +
                    Math.pow(otherPlayerMesh.position.z - iceBerg.position.z, 2)
                ) < iceBerg.radius;
                
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
        
        // Check if freeze effect should end
        if (dragon.frozen && now >= dragon.frozenUntil) {
            dragon.frozen = false;
            // Remove blue tint
            dragon.mesh.children.forEach(child => {
                if (child.material && child.material.emissive !== undefined) {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            });
        }
        
        // Wing flap animation
        dragon.wingFlapPhase += 0.15;
        const flapAngle = Math.sin(dragon.wingFlapPhase) * 0.5;
        dragon.leftWing.rotation.x = flapAngle;
        dragon.rightWing.rotation.x = -flapAngle;
        dragon.leftWing.rotation.z = 0.3 + flapAngle * 0.3;
        dragon.rightWing.rotation.z = -0.3 - flapAngle * 0.3;
        
        // Tail sway
        if (dragon.tailSegments) {
            dragon.tailSegments.forEach((segment, i) => {
                const sway = Math.sin(now * 0.003 + i * 0.5) * (0.15 + i * 0.05);
                segment.rotation.y = sway;
            });
        }
    }

    function updateDragon() {
        if (!dragon) return;
        
        const now = Date.now();
        
        // Handle death - dragon is hidden after explosion
        if (!dragon.alive) {
            return; // Don't update behavior when dead
        }
        
        // Find closest player for targeting
        const distToPlayer = Math.sqrt(
            (playerGroup.position.x - dragon.mesh.position.x) ** 2 +
            (playerGroup.position.z - dragon.mesh.position.z) ** 2
        );
        
        let targetPlayer = playerGroup;
        let targetDist = distToPlayer;
        
        if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
            const distToOther = Math.sqrt(
                (otherPlayerMesh.position.x - dragon.mesh.position.x) ** 2 +
                (otherPlayerMesh.position.z - dragon.mesh.position.z) ** 2
            );
            if (distToOther < targetDist) {
                targetPlayer = otherPlayerMesh;
                targetDist = distToOther;
            }
        }
        
        // Look at the closest player (add Math.PI/2 offset to fix 90-degree rotation)
        const angleToPlayer = Math.atan2(
            targetPlayer.position.x - dragon.mesh.position.x,
            targetPlayer.position.z - dragon.mesh.position.z
        );
        dragon.mesh.rotation.y = angleToPlayer - Math.PI / 2;
        
        // Make eye glows pulse menacingly
        const eyePulse = 0.4 + Math.sin(now * 0.005) * 0.2;
        if (dragon.leftEyeGlow) dragon.leftEyeGlow.material.opacity = eyePulse;
        if (dragon.rightEyeGlow) dragon.rightEyeGlow.material.opacity = eyePulse;
        
        // Check collision damage with host player (host only handles damage)
        if (distToPlayer < 5 && !godMode) { // Dragon body radius ~5 units
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
                (otherPlayerMesh.position.x - dragon.mesh.position.x) ** 2 +
                (otherPlayerMesh.position.z - dragon.mesh.position.z) ** 2
            );
            
            if (distToOther < 5) {
                // Initialize cooldown tracker if needed
                if (!dragon.lastOtherPlayerDamageTime) dragon.lastOtherPlayerDamageTime = 0;
                
                if (now - dragon.lastOtherPlayerDamageTime > damageCooldown) {
                    multiplayerManager.sendGameEvent('playerDamage', {});
                    dragon.lastOtherPlayerDamageTime = now;
                }
            }
        }
        
        // Flying behavior - randomly fly up sometimes
        if (!dragon.isFlying && Math.random() < 0.0005) { // 0.05% chance per frame (4x less frequent)
            dragon.isFlying = true;
            dragon.flyStartTime = now;
            dragon.flyDuration = 3000 + Math.random() * 2000; // 3-5 seconds
            dragon.groundY = dragon.mesh.position.y;
            dragon.flyTargetY = dragon.groundY + 15 + Math.random() * 10; // Fly 15-25 units up
        }
        
        // Handle flying state
        if (dragon.isFlying) {
            const flyElapsed = now - dragon.flyStartTime;
            const flyProgress = flyElapsed / dragon.flyDuration;
            
            if (flyProgress < 0.3) {
                // Ascending
                const ascendProgress = flyProgress / 0.3;
                dragon.mesh.position.y = dragon.groundY + (dragon.flyTargetY - dragon.groundY) * ascendProgress;
            } else if (flyProgress < 0.7) {
                // Flying at height
                dragon.mesh.position.y = dragon.flyTargetY;
            } else if (flyProgress < 1.0) {
                // Descending
                const descendProgress = (flyProgress - 0.7) / 0.3;
                dragon.mesh.position.y = dragon.flyTargetY - (dragon.flyTargetY - dragon.groundY) * descendProgress;
            } else {
                // Landing complete
                dragon.mesh.position.y = dragon.groundY;
                dragon.isFlying = false;
            }
        }
        
        // Patrol movement
        dragon.mesh.position.x += dragon.speed * dragon.direction;
        
        if (dragon.mesh.position.x <= dragon.patrolLeft) {
            dragon.direction = 1;
        } else if (dragon.mesh.position.x >= dragon.patrolRight) {
            dragon.direction = -1;
        }
        
        // Fire fireballs at players (not when frozen)
        if (!dragon.frozen && now - dragon.lastFireTime > dragon.fireInterval) {            let targetPlayer = playerGroup;
            let targetDist = distToPlayer;
            
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = Math.sqrt(
                    (otherPlayerMesh.position.x - dragon.mesh.position.x) ** 2 +
                    (otherPlayerMesh.position.z - dragon.mesh.position.z) ** 2
                );
                if (distToOther < targetDist) {
                    targetPlayer = otherPlayerMesh;
                    targetDist = distToOther;
                }
            }
            
            // Only fire if player is in range
            if (targetDist < 100) {
                const fbTextures = getTerrainTextures(THREE);
                
                // Create fireball group with core, glow, and flames
                const fireballGroup = new THREE.Group();
                
                // Core sphere
                const coreGeometry = new THREE.SphereGeometry(0.6, 12, 12);
                const coreMaterial = new THREE.MeshBasicMaterial({ 
                    map: fbTextures.fireball,
                    transparent: true
                });
                const core = new THREE.Mesh(coreGeometry, coreMaterial);
                fireballGroup.add(core);
                
                // Outer glow sprite
                const glowMaterial = new THREE.SpriteMaterial({
                    map: fbTextures.explosion,
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
                    map: fbTextures.explosion,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    opacity: 0.9
                });
                const innerGlow = new THREE.Sprite(innerGlowMaterial);
                innerGlow.scale.set(1.8, 1.8, 1);
                fireballGroup.add(innerGlow);
                
                fireballGroup.position.copy(dragon.mesh.position);
                fireballGroup.position.x += dragon.direction > 0 ? 14 : -14;
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
                    radius: 1.5,
                    damage: 1,
                    trail: [],
                    lastTrailTime: 0
                });
                
                dragon.lastFireTime = now;
                Audio.playExplosionSound();
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
            
            // Check collision with mountains
            let hitMountain = false;
            for (const mtn of MOUNTAINS) {
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
            
            if (fireball.mesh.position.y < terrainHeight || hitMountain ||
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
            
            // Check if player is in ice berg (safe zone)
            const playerInIceBerg = Math.sqrt(
                Math.pow(playerGroup.position.x - iceBerg.position.x, 2) +
                Math.pow(playerGroup.position.z - iceBerg.position.z, 2)
            ) < iceBerg.radius;
            
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
                
                // Notify other player in multiplayer
                if (multiplayerManager && multiplayerManager.isConnected()) {
                    multiplayerManager.sendGameEvent('bridgeRepaired', {});
                }
            }
        }
        
        // River and bridge collision (can fly over when gliding)
        if (!player.isGliding && playerGroup.position.z > riverObj.minZ && playerGroup.position.z < riverObj.maxZ) {
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
        
        // Ice power collection
        if (!icePowerCollected) {
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
        
        const startX = (!multiplayerManager || multiplayerManager.isHost) ? -2 : 2;
        playerGroup.position.set(startX, getTerrainHeight(startX, 40), 40);
        player.rotation = Math.PI;
        playerGroup.rotation.y = Math.PI;
        player.isGliding = false;
        player.glideCharge = 100;
        player.glideState = 'none';
        player.glideLiftProgress = 0;
        player.hasKite = false;
        kiteGroup.visible = false;
        
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
        bridgeObj.mesh.visible = false;
        brokenBridgeGroup.visible = true;
        
        // Remove all placed bananas
        placedBananas.forEach(banana => scene.remove(banana.mesh));
        placedBananas.length = 0;
        
        // Remove all placed bombs
        placedBombs.forEach(bomb => scene.remove(bomb.mesh));
        placedBombs.length = 0;
        
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
    });

    function drawHUD() {
        hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
        
        hudCtx.fillStyle = '#000';
        hudCtx.font = 'bold 18px Arial';
        hudCtx.fillText(`Schüsse: ${ammo}/${maxAmmo}`, 10, 25);
        
        const aliveGoblins = goblins.filter(g => g.alive).length;
        hudCtx.fillText(`Kobolde: ${aliveGoblins}`, 10, 50);
        
        hudCtx.fillText(`Material: ${materialsCollected}/${materialsNeeded}`, 10, 75);
        
        // Health display
        hudCtx.fillText(`Leben: ${playerHealth}/${maxPlayerHealth}`, 10, 100);
        
        // Damage flash effect
        const now = Date.now();
        if (now - damageFlashTime < 300) {
            const flashOpacity = 0.4 * (1 - (now - damageFlashTime) / 300);
            hudCtx.fillStyle = `rgba(255, 0, 0, ${flashOpacity})`;
            hudCtx.fillRect(0, 0, hudCanvas.width, hudCanvas.height);
        }
        
        // Kite charge bar or collection status
        if (player.hasKite) {
            hudCtx.fillText(`Drachen: ${Math.floor(player.glideCharge)}%`, 10, 125);
            hudCtx.fillStyle = player.glideCharge >= 20 ? '#00FF00' : '#FF0000';
            hudCtx.fillRect(10, 130, player.glideCharge * 2, 10);
            hudCtx.strokeStyle = '#000';
            hudCtx.strokeRect(10, 130, 200, 10);
            hudCtx.fillStyle = '#000';
        } else {
            hudCtx.fillStyle = '#FFD700';
            hudCtx.fillText('Finde den Drachen auf der anderen Seite!', 10, 125);
            hudCtx.fillStyle = '#000';
        }
        
        // Ice power status
        if (hasIcePower) {
            const now = Date.now();
            const cooldownRemaining = Math.max(0, icePowerCooldown - (now - lastIcePowerTime));
            if (cooldownRemaining > 0) {
                hudCtx.fillStyle = '#666';
                hudCtx.fillText('Eis-Kraft: ' + Math.ceil(cooldownRemaining / 1000) + 's', 10, 155);
            } else {
                hudCtx.fillStyle = '#00BFFF';
                hudCtx.fillText('Eis-Kraft: Drücke E zum Einfrieren!', 10, 155);
            }
            hudCtx.fillStyle = '#000';
        } else if (!icePowerCollected) {
            hudCtx.fillStyle = '#87CEEB';
            hudCtx.fillText('Finde den Eisberg für Eis-Kraft!', 10, 155);
            hudCtx.fillStyle = '#000';
        }
        
        // Banana power status
        if (hasBananaPower) {
            hudCtx.fillStyle = '#FFD700';
            hudCtx.fillText(`🍌 Bananen: ${bananaInventory}/${maxBananas} (Drücke B)`, 10, 180);
            hudCtx.fillStyle = '#000';
        } else if (!worldBananaPowerCollected) {
            hudCtx.fillStyle = '#FFFF99';
            hudCtx.fillText('Finde den Bananen-Eisberg!', 10, 180);
            hudCtx.fillStyle = '#000';
        }
        
        // Bomb inventory
        hudCtx.fillStyle = '#FF4500';
        hudCtx.fillText(`💣 Bomben: ${bombInventory}/${maxBombs} (Drücke X)`, 10, 210);
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
        requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        accumulator += deltaTime;
        
        const time = currentTime * 0.001;
        
        // Animate river water (visual only, runs every frame)
        const riverGeometry = riverObj.mesh.geometry;
        const positions = riverGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const wave = Math.sin(x * 0.5 + time * 2) * Math.cos(y * 0.5 + time * 1.5) * 0.05;
            positions.setZ(i, wave);
        }
        positions.needsUpdate = true;
        
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
                                            if (difficulty === 'easy') {
                                                const exerciseCount = gob.isGiant ? 3 : 1;
                                                showMathExercise(exerciseCount);
                                            }
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

    animate(performance.now());
}
