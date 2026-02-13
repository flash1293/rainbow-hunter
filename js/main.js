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
const isNativeSplitscreen = isSplitscreen === 'native';
const splitscreenRoom = urlParams.get('room');
const controllerIndex = parseInt(urlParams.get('controller')) || 0;

// Native splitscreen players array (used when isNativeSplitscreen is true)
// Each entry: { group, camera, keys, gamepad, controllerIndex, health, ammo, ... }
let splitscreenPlayers = [];


// Initialize multiplayer on page load
window.addEventListener('DOMContentLoaded', () => {
    // Hide multiplayer UI in splitscreen mode
    if (isSplitscreen) {
        const multiplayerSetup = document.getElementById('multiplayer-setup');
        if (multiplayerSetup) multiplayerSetup.style.display = 'none';
    }
    
    // For native splitscreen, no multiplayer manager needed
    if (isNativeSplitscreen) {
        // Native splitscreen starts directly - no network setup
        return;
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

// Difficulty selection - for native splitscreen, host, or non-splitscreen modes
if (!isSplitscreen || isSplitscreen === 'host' || isNativeSplitscreen) {
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
    
    // Check if this is a ruins-themed level
    G.ruinsTheme = G.levelConfig.ruinsTheme || false;
    
    // Check if this is a computer-themed level
    G.computerTheme = G.levelConfig.computerTheme || false;
    
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
    
    // Add fog for performance and atmosphere
    if (G.levelConfig.fogDensity) {
        // Explicit fog config from level
        const fogColor = G.levelConfig.fogColor || G.levelConfig.skyColor || 0x888888;
        G.scene.fog = new THREE.FogExp2(fogColor, G.levelConfig.fogDensity);
        // Use skyColor for background if explicitly set, otherwise fogColor
        const bgColor = G.levelConfig.skyColor !== undefined ? G.levelConfig.skyColor : fogColor;
        G.scene.background = new THREE.Color(bgColor);
    } else if (G.graveyardTheme) {
        // Default graveyard fog - spooky purple (dense to hide clipping)
        G.scene.fog = new THREE.FogExp2(0x443355, 0.02);
        G.scene.background = new THREE.Color(0x443355);
    } else if (G.lavaTheme) {
        // Lava level - smoky red/orange haze (dense to hide clipping)
        G.scene.fog = new THREE.FogExp2(0x331100, 0.02);
        G.scene.background = new THREE.Color(0x331100);
    } else if (G.desertTheme) {
        // Desert level - sandy dust haze (dense to hide clipping)
        G.scene.fog = new THREE.FogExp2(0xd4a574, 0.02);
        G.scene.background = new THREE.Color(0xd4a574);
    } else if (G.iceTheme) {
        // Ice level - white mist (dense to hide clipping)
        G.scene.fog = new THREE.FogExp2(0xc8d8e8, 0.02);
        G.scene.background = new THREE.Color(0xc8d8e8);
    } else if (G.waterTheme) {
        // Water level - misty blue (dense to hide clipping)
        G.scene.fog = new THREE.FogExp2(0x4488aa, 0.02);
        G.scene.background = new THREE.Color(0x4488aa);
    } else if (G.candyTheme) {
        // Candy level - cotton candy pink/purple mist (dense enough to hide far clipping)
        G.scene.fog = new THREE.FogExp2(0xffccee, 0.02);
        G.scene.background = new THREE.Color(0xffccee);
    } else if (G.ruinsTheme) {
        // Ruins level - light atmospheric haze (daylight)
        G.scene.fog = new THREE.FogExp2(0xB8C9D9, 0.008);
        G.scene.background = new THREE.Color(0x6AAFE6);
    } else if (G.computerTheme) {
        // Computer level - pure black void with minimal cyan-tinted fog
        G.scene.fog = new THREE.FogExp2(0x001111, 0.008);
        G.scene.background = new THREE.Color(0x000000);
    }
    
    // Determine camera far plane based on fog (closer = better performance)
    // Candy and computer levels get longer view distance
    const cameraFar = (G.candyTheme || G.computerTheme) ? 150 : (G.scene.fog ? 90 : GAME_CONFIG.CAMERA_FAR);
    
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
    // Pre-cache fog wisp material for graveyard level
    G.fogWispBaseMaterial = new THREE.SpriteMaterial({
        map: G.skyTextures.fogWisp,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        fog: true
    });

    // Calculate aspect ratio - half width for native splitscreen
    const aspectRatio = isNativeSplitscreen 
        ? (window.innerWidth / 2) / window.innerHeight 
        : window.innerWidth / window.innerHeight;

    G.camera = new THREE.PerspectiveCamera(
        GAME_CONFIG.CAMERA_FOV, 
        aspectRatio, 
        GAME_CONFIG.CAMERA_NEAR, 
        cameraFar
    );
    G.camera.position.set(0, GAME_CONFIG.CAMERA_Y, GAME_CONFIG.CAMERA_Z);
    G.camera.lookAt(0, 0, 0);

    // Second camera for native splitscreen (player 2)
    if (isNativeSplitscreen) {
        G.camera2 = new THREE.PerspectiveCamera(
            GAME_CONFIG.CAMERA_FOV, 
            aspectRatio, 
            GAME_CONFIG.CAMERA_NEAR, 
            cameraFar
        );
        G.camera2.position.set(0, GAME_CONFIG.CAMERA_Y, GAME_CONFIG.CAMERA_Z);
        G.camera2.lookAt(0, 0, 0);
    }

    // Reduce antialiasing for splitscreen (rendering twice) for performance
    const useAntialias = !isNativeSplitscreen;
    G.renderer = new THREE.WebGLRenderer({ antialias: useAntialias, powerPreference: 'high-performance' });
    currentRenderer = G.renderer; // Store for cleanup
    
    // Limit pixel ratio for performance (especially on retina displays)
    G.renderer.setPixelRatio(Math.min(window.devicePixelRatio, isNativeSplitscreen ? 1.5 : 2));
    G.renderer.setSize(window.innerWidth, window.innerHeight);
    G.renderer.shadowMap.enabled = true;
    // Use simpler shadow map type in fog/splitscreen for performance
    G.renderer.shadowMap.type = (isNativeSplitscreen || G.scene.fog) ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    G.renderer.setScissorTest(isNativeSplitscreen); // Enable scissor test for native splitscreen
    G.container.appendChild(G.renderer.domElement);

    G.container.style.position = 'relative';
    G.container.style.width = '100%';
    G.container.style.height = '100%';
    G.container.style.display = 'block';

    window.addEventListener('resize', () => {
        const newAspect = isNativeSplitscreen 
            ? (window.innerWidth / 2) / window.innerHeight 
            : window.innerWidth / window.innerHeight;
        G.camera.aspect = newAspect;
        G.camera.updateProjectionMatrix();
        if (isNativeSplitscreen && G.camera2) {
            G.camera2.aspect = newAspect;
            G.camera2.updateProjectionMatrix();
        }
        G.renderer.setSize(window.innerWidth, window.innerHeight);
    }, { signal: G.eventSignal });

    // Lighting
    // Adjust ambient light for themed levels
    const ambientIntensity = G.graveyardTheme ? 0.55 : (G.ruinsTheme ? 0.7 : 0.6);
    const ambientColor = G.graveyardTheme ? 0x9977dd : (G.ruinsTheme ? 0xfffef0 : 0xffffff);
    G.ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    G.scene.add(G.ambientLight);

    const directionalColor = G.graveyardTheme ? 0xaa88ee : (G.ruinsTheme ? 0xfff8e0 : 0xffffff);
    const directionalIntensity = G.graveyardTheme ? 0.6 : (G.ruinsTheme ? 0.9 : 0.8);
    G.directionalLight = new THREE.DirectionalLight(directionalColor, directionalIntensity);
    G.directionalLight.position.set(50, 100, 50);
    G.directionalLight.castShadow = true;
    
    // Reduce shadow quality in splitscreen or fog levels for performance
    const shadowQuality = (isNativeSplitscreen || G.scene.fog) ? 512 : 2048;
    const shadowRange = G.scene.fog ? 45 : 100;
    G.directionalLight.shadow.camera.left = -shadowRange;
    G.directionalLight.shadow.camera.right = shadowRange;
    G.directionalLight.shadow.camera.top = shadowRange;
    G.directionalLight.shadow.camera.bottom = -shadowRange;
    G.directionalLight.shadow.camera.far = cameraFar;
    G.directionalLight.shadow.mapSize.width = shadowQuality;
    G.directionalLight.shadow.mapSize.height = shadowQuality;
    G.scene.add(G.directionalLight);

    // Set current level hills for terrain height calculation
    setCurrentLevelHills(G.levelConfig.hills);
    
    // Get theme colors (default to green if not specified)
    G.hillColor = G.levelConfig.hillColor || 0x228B22;
    G.treeColor = G.levelConfig.treeColor || 0x228B22;
    G.grassColor = G.levelConfig.grassColor || 0x228B22;

    // Create terrain (use level-specific ground color and theme)
    createGround(G.scene, THREE, G.levelConfig.groundColor, G.iceTheme, G.desertTheme, G.lavaTheme, G.waterTheme, G.candyTheme, G.graveyardTheme, G.ruinsTheme, G.computerTheme);
    createHills(G.scene, THREE, G.levelConfig.hills, G.hillColor, G.iceTheme, G.desertTheme, G.lavaTheme, G.waterTheme, G.candyTheme, G.graveyardTheme, G.ruinsTheme, G.computerTheme);
    
    // Mountains are optional (disabled in desert)
    if (G.levelConfig.hasMountains !== false && G.levelConfig.mountains && G.levelConfig.mountains.length > 0) {
        createMountains(G.scene, THREE, G.levelConfig.mountains, G.candyTheme, G.graveyardTheme, G.ruinsTheme, G.computerTheme);
    }
    
    // Natural scenic mountains (backdrop around perimeter)
    if (G.levelConfig.naturalMountains && G.levelConfig.naturalMountains.length > 0) {
        G.levelConfig.naturalMountains.forEach(mtn => {
            const height = mtn.height || 30;
            const radius = mtn.radius || 20;
            
            if (G.computerTheme) {
                // Create massive server towers / data centers as backdrop
                const towerWidth = radius * 1.5;
                const towerDepth = radius * 0.8;
                const towerHeight = height * 1.2;
                
                // Main server tower body
                const towerGeometry = new THREE.BoxGeometry(towerWidth, towerHeight, towerDepth);
                const towerMaterial = new THREE.MeshPhongMaterial({
                    color: 0x050510,
                    emissive: 0x001122,
                    emissiveIntensity: 0.4,
                    shininess: 80
                });
                const tower = new THREE.Mesh(towerGeometry, towerMaterial);
                tower.position.set(mtn.x, towerHeight / 2, mtn.z);
                tower.castShadow = true;
                G.scene.add(tower);
                
                // Vertical LED strips on front
                const numStrips = Math.max(4, Math.floor(towerWidth / 5));
                for (let i = 0; i < numStrips; i++) {
                    const stripX = mtn.x - towerWidth/2 + (i + 0.5) * (towerWidth / numStrips);
                    const stripColor = [0x00FFFF, 0xFF00FF, 0x00FF00, 0xFFFF00][i % 4];
                    
                    const stripGeometry = new THREE.BoxGeometry(0.4, towerHeight * 0.85, 0.6);
                    const stripMaterial = new THREE.MeshBasicMaterial({ 
                        color: stripColor,
                        transparent: true,
                        opacity: 0.9
                    });
                    const strip = new THREE.Mesh(stripGeometry, stripMaterial);
                    strip.position.set(stripX, towerHeight/2, mtn.z + towerDepth/2 + 0.2);
                    G.scene.add(strip);
                }
                
                // Horizontal data bands
                for (let h = 5; h < towerHeight; h += 8) {
                    const bandGeometry = new THREE.BoxGeometry(towerWidth * 0.95, 0.5, 0.3);
                    const bandColor = Math.random() > 0.5 ? 0x00FFFF : 0xFF00FF;
                    const bandMaterial = new THREE.MeshBasicMaterial({
                        color: bandColor,
                        transparent: true,
                        opacity: 0.6
                    });
                    const band = new THREE.Mesh(bandGeometry, bandMaterial);
                    band.position.set(mtn.x, h, mtn.z + towerDepth/2 + 0.15);
                    G.scene.add(band);
                }
                
                // Blinking status lights along top
                const numLights = Math.max(6, Math.floor(towerWidth / 3));
                for (let i = 0; i < numLights; i++) {
                    const lightX = mtn.x - towerWidth/2 + (i + 0.5) * (towerWidth / numLights);
                    const lightGeometry = new THREE.SphereGeometry(0.4, 8, 8);
                    const lightColor = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00][Math.floor(Math.random() * 4)];
                    const lightMaterial = new THREE.MeshBasicMaterial({ 
                        color: lightColor,
                        transparent: true,
                        opacity: 0.95
                    });
                    const light = new THREE.Mesh(lightGeometry, lightMaterial);
                    light.position.set(lightX, towerHeight - 0.8, mtn.z + towerDepth/2 + 0.3);
                    G.scene.add(light);
                }
                
                // Glowing antenna/spire on top
                const spireGeometry = new THREE.CylinderGeometry(0.2, 0.5, 6, 8);
                const spireMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00FFFF,
                    transparent: true,
                    opacity: 0.8
                });
                const spire = new THREE.Mesh(spireGeometry, spireMaterial);
                spire.position.set(mtn.x, towerHeight + 3, mtn.z);
                G.scene.add(spire);
                
                // Antenna light beacon
                const beaconGeometry = new THREE.SphereGeometry(0.8, 16, 16);
                const beaconMaterial = new THREE.MeshBasicMaterial({
                    color: 0xFF00FF,
                    transparent: true,
                    opacity: 0.9
                });
                const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
                beacon.position.set(mtn.x, towerHeight + 6.5, mtn.z);
                G.scene.add(beacon);
            } else {
                // Regular mountain cone for other themes
                const mountainGeometry = new THREE.ConeGeometry(radius, height, 8, 4);
                let mountainColor = G.ruinsTheme ? 0x7A8B6A : 0x6B7B5B;  // Green-gray default
                const mountainMaterial = new THREE.MeshLambertMaterial({
                    color: mountainColor,
                    emissive: 0x000000,
                    emissiveIntensity: 0
                });
                const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
                mountain.position.set(mtn.x, height / 2, mtn.z);
                mountain.castShadow = true;
                mountain.receiveShadow = true;
                G.scene.add(mountain);
                
                // Snow cap on top (if tall enough)
                if (height > 25) {
                    const capGeometry = new THREE.ConeGeometry(radius * 0.35, height * 0.25, 8);
                    const capMaterial = new THREE.MeshLambertMaterial({
                        color: G.ruinsTheme ? 0xE8E4DC : 0xFFFFFF
                    });
                    const cap = new THREE.Mesh(capGeometry, capMaterial);
                    cap.position.set(mtn.x, height * 0.85, mtn.z);
                    G.scene.add(cap);
                }
                
                // Add some trees/greenery at base
                for (let i = 0; i < 3; i++) {
                    const treeGeometry = new THREE.ConeGeometry(2 + Math.random() * 2, 6 + Math.random() * 4, 6);
                    const treeMaterial = new THREE.MeshLambertMaterial({
                        color: 0x3A6B2A
                    });
                    const tree = new THREE.Mesh(treeGeometry, treeMaterial);
                    const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
                    const dist = radius * 0.7 + Math.random() * radius * 0.3;
                    tree.position.set(
                        mtn.x + Math.cos(angle) * dist,
                        3 + Math.random() * 2,
                        mtn.z + Math.sin(angle) * dist
                    );
                    tree.castShadow = true;
                    G.scene.add(tree);
                }
            }
        });
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
