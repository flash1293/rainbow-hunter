// Main game file - orchestrates all game systems

// Game state
let difficulty = null;
let speedMultiplier = 1;
let gameDead = false;
let gameWon = false;

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
            console.log('Client received gameStart');
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
    let playerHealth = 1;
    let otherPlayerHealth = 1;
    const maxPlayerHealth = 3;
    let lastDamageTime = 0;
    const damageCooldown = 2500; // ms between damage from goblins
    let damageFlashTime = 0;
    
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
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: isHost ? 0xFF69B4 : 0x4169E1 }); // Pink for girl, Blue for boy
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1.3, 0.1);
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.85, 0);
    head.castShadow = true;
    playerGroup.add(head);

    // Hair
    const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hairMaterial = new THREE.MeshLambertMaterial({ color: isHost ? 0x8B4513 : 0x000000 }); // Brown for girl, Black for boy
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

        // Body (opposite gender color)
        const bodyGeometry = new THREE.BoxGeometry(0.35, 0.6, 0.25);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: otherIsGirl ? 0xFF69B4 : 0x4169E1 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1.3, 0.1);
        body.castShadow = true;
        otherPlayerGroup.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFE4C4 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.85, 0);
        head.castShadow = true;
        otherPlayerGroup.add(head);

        // Hair (opposite gender)
        const hairGeometry = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMaterial = new THREE.MeshLambertMaterial({ color: otherIsGirl ? 0x8B4513 : 0x000000 });
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

        // Kite for other player
        const otherKiteGroup = new THREE.Group();
        const otherKiteGeometry = new THREE.ConeGeometry(0.8, 1.2, 4);
        const otherKiteMaterial = new THREE.MeshLambertMaterial({ color: otherIsGirl ? 0xFF1493 : 0x00BFFF });
        const otherKite = new THREE.Mesh(otherKiteGeometry, otherKiteMaterial);
        otherKite.rotation.x = Math.PI;
        otherKite.castShadow = true;
        otherKiteGroup.add(otherKite);
        
        const otherTailGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4);
        const otherTailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
        const otherTail = new THREE.Mesh(otherTailGeometry, otherTailMaterial);
        otherTail.position.y = -1.2;
        otherKiteGroup.add(otherTail);
        
        otherKiteGroup.position.set(0, 3, 0.5);
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
                    console.log('Host received playerState from client:', data);
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
                    console.log('otherPlayerMesh visible set to true, position:', otherPlayerMesh.position);
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
                vz: g.velocity ? g.velocity.z : 0
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
            items: {
                materials: materials.map(m => m.collected),
                ammoPickups: ammoPickups.map(a => a.collected),
                healthPickups: healthPickups.map(h => h.collected),
                kiteCollected: worldKiteCollected
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
                scene.remove(worldKiteGroup);
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
        d: false
    };

    // Gamepad support
    let gamepad = null;
    let lastShootTime = 0;
    let lastKiteActivationTime = 0;
    const shootCooldown = 200; // ms between shots
    const kiteActivationCooldown = 300; // ms between kite activations

    window.addEventListener('gamepadconnected', (e) => {
        // In splitscreen mode, only use the assigned controller
        if (isSplitscreen) {
            if (e.gamepad.index === controllerIndex) {
                gamepad = e.gamepad;
                console.log('Gamepad connected for player', controllerIndex + 1, ':', gamepad.id);
            }
        } else {
            gamepad = e.gamepad;
            console.log('Gamepad connected:', gamepad.id);
        }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
        if (!isSplitscreen || e.gamepad.index === controllerIndex) {
            console.log('Gamepad disconnected');
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
            player.rotation -= leftStickX * 0.015;
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
        
        // Options (button 9) for restart
        if (gamepad.buttons[9]?.pressed && (gameWon || gameDead)) {
            resetGame();
        }
    }

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
        { x: -30, z: -150 }, { x: 35, z: -155 }, { x: 10, z: -160 }
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
        { x: -10, z: -40 }, { x: 40, z: 35 }, { x: -35, z: 5 },
        { x: -50, z: -15 }, { x: 55, z: -20 }, { x: -18, z: 50 },
        { x: 25, z: 55 }, { x: -45, z: -50 }, { x: 50, z: -55 },
        // Behind the gap
        { x: -20, z: -100 }, { x: 30, z: -110 }, { x: -10, z: -125 },
        { x: 40, z: -135 },
        // Additional ammo for harder difficulty
        { x: 10, z: -70 }, { x: -35, z: -75 }, { x: 45, z: -90 },
        { x: -15, z: -105 }, { x: 25, z: -120 }, { x: -30, z: -118 },
        { x: 52, z: -125 }, { x: 15, z: 45 }
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

    // Health pickups (hearts)
    const healthPickups = [];
    const heartPositions = [
        { x: -8, z: 50 }, { x: 32, z: -18 }, { x: -48, z: -25 },
        { x: 55, z: 22 }, { x: -22, z: 65 }
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
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight
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
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight
        };
    }

    // Giant guardian helper - huge slow enemy with lots of health
    function createGiant(x, z, patrolLeft, patrolRight, speed = 0.018) {
        const giantGrp = new THREE.Group();
        
        // Massive cylindrical body
        const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.8, 5.0, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3.5;
        body.castShadow = true;
        giantGrp.add(body);
        
        // Add armor plates on body
        const plateGeometry = new THREE.BoxGeometry(2.0, 0.4, 2.2);
        const plateMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        for (let i = 0; i < 4; i++) {
            const plate = new THREE.Mesh(plateGeometry, plateMaterial);
            plate.position.y = 2.0 + (i * 1.2);
            plate.castShadow = true;
            giantGrp.add(plate);
        }
        
        // Large head with horns
        const headGeometry = new THREE.BoxGeometry(1.8, 1.5, 1.6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 6.5;
        head.castShadow = true;
        giantGrp.add(head);
        
        // Horns
        const hornGeometry = new THREE.ConeGeometry(0.3, 1.2, 6);
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        
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
        
        // Glowing orange eyes
        const eyeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff6600, 
            emissive: 0xff6600, 
            emissiveIntensity: 1.0 
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.5, 6.5, 0.9);
        giantGrp.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.5, 6.5, 0.9);
        giantGrp.add(e2);
        
        // Massive club-like arms
        const armGeometry = new THREE.CylinderGeometry(0.4, 0.8, 4.0, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
        
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
        const fistMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
        
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
        goblins.push(createGuardianGoblin(15, 15, 10, 20, 0.014));
        
        // Giant guardian at the gap - huge, fast, lots of health
        goblins.push(createGiant(0, -85, -8, 8));
        
        // Additional giants guarding key areas
        goblins.push(createGiant(-40, -50, -50, -30));
        goblins.push(createGiant(40, -110, 30, 50));
        goblins.push(createGiant(-25, -115, -35, -15));
        
        // Guardians at the narrow mountain gap (the passage before treasure area)
        goblins.push(createGuardianGoblin(-5, -85, -8, -2, 0.014));
        goblins.push(createGuardianGoblin(5, -85, 2, 8, 0.014));
        
        // More guardians in the mid-area
        goblins.push(createGuardianGoblin(-45, -65, -55, -35, 0.014));
        goblins.push(createGuardianGoblin(35, -70, 25, 45, 0.014));
        goblins.push(createGuardianGoblin(0, -100, -10, 10, 0.014));
        goblins.push(createGuardianGoblin(-30, -95, -40, -20, 0.014));
        
        // Original guardians around treasure
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

    // Game arrays
    const bullets = [];
    const explosions = [];
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

    // Big bomb explosion helper
    function createBombExplosion(x, y, z) {
        Audio.playBombExplosionSound();
        
        const particles = [];
        const particleCount = 80;
        
        for (let i = 0; i < particleCount; i++) {
            const size = 0.15 + Math.random() * 0.3;
            const particleGeometry = new THREE.SphereGeometry(size, 6, 6);
            
            // Mix of fire colors and smoke
            let color;
            const rand = Math.random();
            if (rand > 0.7) {
                color = 0xFFFF00; // Bright yellow
            } else if (rand > 0.4) {
                color = 0xFF4500; // Orange-red
            } else if (rand > 0.2) {
                color = 0xFF8C00; // Dark orange
            } else {
                color = 0x888888; // Gray smoke
            }
            
            const particleMaterial = new THREE.MeshBasicMaterial({ color: color });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(x, y, z);
            
            const speed = 0.3 + Math.random() * 0.8;
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speed,
                Math.random() * speed * 0.8,
                (Math.random() - 0.5) * speed
            );
            
            scene.add(particle);
            particles.push({ mesh: particle, velocity: velocity, life: 45 });
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
        ammo--;
        
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
            }
        } else if (eventType === 'bridgeRepaired') {
            // Other player repaired the bridge
            if (!bridgeRepaired) {
                bridgeRepaired = true;
                bridgeObj.mesh.visible = true;
                brokenBridgeGroup.visible = false;
                Audio.playRepairSound();
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
            playerHealth--;
            damageFlashTime = Date.now();
            // Don't check for death here - client will send updated health to host
            // and host will sync gameDead status back via fullSync
            if (playerHealth > 0) {
                Audio.playStuckSound();
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
        
        // Client syncs their player state to host (host handles full sync separately)
        if (multiplayerManager && multiplayerManager.isClient && multiplayerManager.isConnected()) {
            console.log('Client sending playerState, isClient:', multiplayerManager.isClient, 'isConnected:', multiplayerManager.isConnected());
            multiplayerManager.sendPlayerState({
                position: playerGroup.position,
                rotation: player.rotation,
                health: playerHealth,
                isGliding: player.isGliding,
                glideLiftProgress: player.glideLiftProgress
            });
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
            
            const maxDistance = difficulty === 'hard' ? 35 : 150;
            
            if (Math.abs(bullet.mesh.position.x) > 150 || Math.abs(bullet.mesh.position.z) > 150 || distFromStart > maxDistance) {
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
            
            if (exp.life <= 0) {
                scene.remove(exp.mesh);
                explosions.splice(i, 1);
            }
        }
    }

    function updateGoblins() {
        goblins.forEach(gob => {
            if (!gob.alive || gameWon) return;
            
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
            
            let targetPlayer = playerGroup;
            let distToTarget = distToPlayer;
            
            // If multiplayer and other player is visible, check distance to them too
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                const distToOther = Math.sqrt(
                    Math.pow(otherPlayerMesh.position.x - gob.mesh.position.x, 2) + 
                    Math.pow(otherPlayerMesh.position.z - gob.mesh.position.z, 2)
                );
                
                // Chase the closer player
                if (distToOther < distToTarget) {
                    targetPlayer = otherPlayerMesh;
                    distToTarget = distToOther;
                }
            }
            
            if (gob.isGuardian && distToTarget < 25) {
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
            
            // Check player collision
            const dist = playerGroup.position.distanceTo(gob.mesh.position);
            if (dist < 1.5) {
                if (!gameDead) {
                    gameDead = true;
                    Audio.stopBackgroundMusic();
                    Audio.playDeathSound();
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

    function updateBirds() {
        const now = Date.now();
        
        birds.forEach(bird => {
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
            
            // Drop bomb if player is close
            const distToPlayer = new THREE.Vector2(
                playerGroup.position.x - bird.mesh.position.x,
                playerGroup.position.z - bird.mesh.position.z
            ).length();
            
            // Also check distance to other player in multiplayer
            let distToOtherPlayer = Infinity;
            if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                distToOtherPlayer = new THREE.Vector2(
                    otherPlayerMesh.position.x - bird.mesh.position.x,
                    otherPlayerMesh.position.z - bird.mesh.position.z
                ).length();
            }
            
            const closestPlayerDist = Math.min(distToPlayer, distToOtherPlayer);
            
            if (closestPlayerDist < 20 && now - bird.lastBombTime > 2500) {
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
                
                if (distToPlayer < bomb.radius) {
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
            const distToGob = new THREE.Vector2(
                playerGroup.position.x - gob.mesh.position.x,
                playerGroup.position.z - gob.mesh.position.z
            ).length();
            
            if (distToGob < gob.radius + 1) {
                if (now - lastDamageTime > damageCooldown) {
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
            if (gob.isGiant && gob.isAttacking) {
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
                if (distToTrap < trap.radius) {
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
        
        // Check world kite collection
        if (!worldKiteCollected) {
            const kiteDistSq = (px - worldKiteGroup.position.x) ** 2 + (pz - worldKiteGroup.position.z) ** 2;
            if (kiteDistSq < 4) {
                worldKiteCollected = true;
                player.hasKite = true;
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
        
        healthPickups.forEach(pickup => {
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
        
        if (!bridgeRepaired && materialsCollected >= materialsNeeded) {
            hudCtx.fillStyle = '#FFD700';
            hudCtx.fillText('Gehe zur Brücke um sie zu reparieren!', 10, 155);
            hudCtx.fillStyle = '#000';
        } else if (bridgeRepaired) {
            hudCtx.fillStyle = '#00FF00';
            hudCtx.fillText('Brücke repariert!', 10, 155);
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
                let closestGiantDist = Infinity;
                goblins.forEach(gob => {
                    if (!gob.alive || !gob.isGiant) return;
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
                
                // Optimistic update for other player position (interpolation between syncs)
                if (multiplayerManager && multiplayerManager.isConnected() && otherPlayerMesh.visible) {
                    // Only apply optimistic updates if velocity is significant
                    const velocityMag = Math.sqrt(otherPlayerVelocity.x * otherPlayerVelocity.x + otherPlayerVelocity.z * otherPlayerVelocity.z);
                    if (velocityMag > 0.001) {
                        // Lighter dampening for smoother prediction
                        const dampening = 0.15;
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
                }
                
                // Only host runs game logic (goblins, arrows, etc.)
                if (!multiplayerManager || multiplayerManager.isHost) {
                    updateGoblins();
                    updateGuardianArrows();
                    updateBirds();
                    updateBombs();
                } else {
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
