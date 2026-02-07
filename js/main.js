// Main game file - orchestrates all game systems

// Shared game state object - all initGame locals stored here
let G = {};

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
let herzmanButtonWasPressed = false;

// Persistent inventory across levels
let persistentInventory = {
    ammo: null,        // null means use default, number means carry over
    bombs: null,
    health: null,
    hasKite: false,
    herzmen: null
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
        hasKite: false,
        herzmen: null
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
        Audio.stopTechnoMusic();
    }
    
    // Small delay to let things clean up, then restart
    setTimeout(() => {
        initGame();
    }, 100);
}

// Expose switchLevel globally for multiplayer sync
window.switchLevel = switchLevel;


function initGame() {
    G = {}; // Reset game state

    // Create AbortController for managing event listeners
    currentEventAbortController = new AbortController();
    G.eventSignal = currentEventAbortController.signal;
    
    // Get level configuration
    G.levelConfig = getLevelConfig(currentLevel);
    
    // Check if this is an ice-themed level (used for dragon/fireball textures)
    G.iceTheme = G.levelConfig.iceTheme || false;
    
    // Check if this is a desert-themed level
    G.desertTheme = G.levelConfig.desertTheme || false;
    
    // Check if this is a lava-themed level
    G.lavaTheme = G.levelConfig.lavaTheme || false;
    
    // Check if this is a water-themed level
    G.waterTheme = G.levelConfig.waterTheme || false;
    
    // Check if this is a candy-themed level
    G.candyTheme = G.levelConfig.candyTheme || false;
    
    // Check if this is a graveyard/halloween-themed level
    G.graveyardTheme = G.levelConfig.graveyardTheme || false;
    
    // Three.js setup
    G.container = document.getElementById('gameCanvas');
    G.scene = new THREE.Scene();
    currentScene = G.scene; // Store for cleanup

    
    // Use sky texture as background (only for non-themed levels)
    G.skyTextures = getTerrainTextures(THREE);
    if (G.levelConfig.skyColor) {
        // For themed levels, use solid color background
        G.scene.background = new THREE.Color(G.levelConfig.skyColor);
    } else {
        G.scene.background = G.skyTextures.sky;
    }
    
    // Pre-cache explosion and smoke materials to avoid texture loading glitches
    G.explosionTextureCached = G.iceTheme ? G.skyTextures.explosionIce : G.skyTextures.explosion;
    G.explosionBaseMaterial = new THREE.SpriteMaterial({
        map: G.explosionTextureCached,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true
    });
    G.smokeBaseMaterial = new THREE.SpriteMaterial({
        map: G.skyTextures.smoke,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
    });

    G.camera = new THREE.PerspectiveCamera(
        GAME_CONFIG.CAMERA_FOV, 
        window.innerWidth / window.innerHeight, 
        GAME_CONFIG.CAMERA_NEAR, 
        GAME_CONFIG.CAMERA_FAR
    );
    G.camera.position.set(0, GAME_CONFIG.CAMERA_Y, GAME_CONFIG.CAMERA_Z);
    G.camera.lookAt(0, 0, 0);

    G.renderer = new THREE.WebGLRenderer({ antialias: true });
    currentRenderer = G.renderer; // Store for cleanup
    G.renderer.setSize(window.innerWidth, window.innerHeight);
    G.renderer.shadowMap.enabled = true;
    G.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    G.container.appendChild(G.renderer.domElement);

    G.container.style.position = 'relative';
    G.container.style.width = '100%';
    G.container.style.height = '100%';
    G.container.style.display = 'block';

    window.addEventListener('resize', () => {
        G.camera.aspect = window.innerWidth / window.innerHeight;
        G.camera.updateProjectionMatrix();
        G.renderer.setSize(window.innerWidth, window.innerHeight);
    }, { signal: G.eventSignal });

    // Lighting
    G.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    G.scene.add(G.ambientLight);

    G.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    G.directionalLight.position.set(50, 100, 50);
    G.directionalLight.castShadow = true;
    G.directionalLight.shadow.camera.left = -100;
    G.directionalLight.shadow.camera.right = 100;
    G.directionalLight.shadow.camera.top = 100;
    G.directionalLight.shadow.camera.bottom = -100;
    G.directionalLight.shadow.mapSize.width = 2048;
    G.directionalLight.shadow.mapSize.height = 2048;
    G.scene.add(G.directionalLight);

    // Set current level hills for terrain height calculation
    setCurrentLevelHills(G.levelConfig.hills);
    
    // Get theme colors (default to green if not specified)
    G.hillColor = G.levelConfig.hillColor || 0x228B22;
    G.treeColor = G.levelConfig.treeColor || 0x228B22;
    G.grassColor = G.levelConfig.grassColor || 0x228B22;

    // Create terrain (use level-specific ground color and theme)
    createGround(G.scene, THREE, G.levelConfig.groundColor, G.iceTheme, G.desertTheme, G.lavaTheme, G.waterTheme, G.candyTheme, G.graveyardTheme);
    createHills(G.scene, THREE, G.levelConfig.hills, G.hillColor, G.iceTheme, G.desertTheme, G.lavaTheme, G.waterTheme, G.candyTheme, G.graveyardTheme);
    
    // Mountains are optional (disabled in desert)
    if (G.levelConfig.hasMountains !== false && G.levelConfig.mountains && G.levelConfig.mountains.length > 0) {
        createMountains(G.scene, THREE, G.levelConfig.mountains, G.candyTheme, G.graveyardTheme);
    }

    // Impassable cliffs - towering formations that block everything including gliding
    G.impassableCliffs = [];
    if (G.levelConfig.impassableCliffs && G.levelConfig.impassableCliffs.length > 0) {
        G.levelConfig.impassableCliffs.forEach(cliff => {
            const cliffGroup = new THREE.Group();

            // Main cliff body - tall rocky spire
            const cliffHeight = cliff.height || 50;
            const cliffRadius = cliff.radius || 15;

            // Base cone
            const baseGeometry = new THREE.ConeGeometry(cliffRadius, cliffHeight * 0.6, 8, 4);
            const baseMaterial = new THREE.MeshLambertMaterial({
                color: G.waterTheme ? 0x4a4a5a : 0x6b5b4f
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.y = cliffHeight * 0.3;
            cliffGroup.add(base);

            // Middle section
            const midGeometry = new THREE.ConeGeometry(cliffRadius * 0.7, cliffHeight * 0.4, 8, 3);
            const midMaterial = new THREE.MeshLambertMaterial({
                color: G.waterTheme ? 0x5a5a6a : 0x7b6b5f
            });
            const mid = new THREE.Mesh(midGeometry, midMaterial);
            mid.position.y = cliffHeight * 0.6;
            cliffGroup.add(mid);

            // Top spire
            const topGeometry = new THREE.ConeGeometry(cliffRadius * 0.4, cliffHeight * 0.3, 6, 2);
            const topMaterial = new THREE.MeshLambertMaterial({
                color: G.waterTheme ? 0x6a6a7a : 0x8b7b6f
            });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.y = cliffHeight * 0.85;
            cliffGroup.add(top);

            // Rocky outcrops
            for (let i = 0; i < 6; i++) {
                const rockGeometry = new THREE.DodecahedronGeometry(cliffRadius * 0.3, 0);
                const rockMaterial = new THREE.MeshLambertMaterial({
                    color: G.waterTheme ? 0x3a3a4a : 0x5b4b3f
                });
                const rock = new THREE.Mesh(rockGeometry, rockMaterial);
                const angle = (i / 6) * Math.PI * 2;
                const height = 5 + Math.random() * cliffHeight * 0.4;
                rock.position.set(
                    Math.cos(angle) * cliffRadius * 0.8,
                    height,
                    Math.sin(angle) * cliffRadius * 0.8
                );
                rock.rotation.set(Math.random(), Math.random(), Math.random());
                cliffGroup.add(rock);
            }

            const terrainHeight = getTerrainHeight(cliff.x, cliff.z);
            cliffGroup.position.set(cliff.x, terrainHeight, cliff.z);
            cliffGroup.castShadow = true;
            G.scene.add(cliffGroup);

            G.impassableCliffs.push({
                mesh: cliffGroup,
                x: cliff.x,
                z: cliff.z,
                radius: cliffRadius,
                height: cliffHeight
            });
        });
    }

    // River and bridge are optional per level

    // Initialize game phases from split files
    initSetup();
    initEntities();
    initLoop();
}
