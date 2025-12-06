// Main game file - orchestrates all game systems
import * as Audio from './audio.js';
import { GAME_CONFIG, HILLS, MOUNTAINS, GOBLIN_POSITIONS } from './config.js';
import { getTerrainHeight, createHills, createMountains, createGround, createRiver, createBridge, createBrokenBridge } from './terrain.js';

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
    const bridge = createBridge(scene, THREE);
    const brokenBridgeGroup = createBrokenBridge(scene, THREE);

    // Create player
    const player = new Player(scene, THREE, getTerrainHeight);
    
    // Mouse look with pointer lock
    let isPointerLocked = false;
    container.addEventListener('click', () => {
        if (!isPointerLocked) {
            container.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === container;
    });

    document.addEventListener('mousemove', (e) => {
        if (isPointerLocked) {
            player.rotation -= e.movementX * 0.002;
        }
    });

    // Camera follow player
    function updateCamera() {
        const offset = new THREE.Vector3(
            -Math.sin(player.rotation) * 20,
            15,
            -Math.cos(player.rotation) * 20
        );
        camera.position.copy(player.group.position).add(offset);
        camera.lookAt(player.group.position);
    }

    // Start background music
    Audio.startBackgroundMusic();
    
    // Game state variables
    let ammo = GAME_CONFIG.STARTING_AMMO;
    const maxAmmo = GAME_CONFIG.MAX_AMMO;
    let materialsCollected = 0;
    const materialsNeeded = GAME_CONFIG.MATERIALS_NEEDED;
    
    // Create game objects (simplified - would need full implementation)
    const bullets = [];
    const explosions = [];
    const rocks = [];
    const trees = [];
    const materials = [];
    const ammoPickups = [];
    const traps = [];
    const goblins = [];
    const guardianArrows = [];
    
    // Create goblins based on difficulty
    const goblinGeometry = createGoblinGeometry(THREE);
    const maxGoblins = difficulty === 'easy' ? GAME_CONFIG.EASY_GOBLIN_COUNT : GAME_CONFIG.HARD_GOBLIN_COUNT;
    
    for (let i = 0; i < maxGoblins; i++) {
        const pos = GOBLIN_POSITIONS[i];
        goblins.push(createGoblin(pos[0], pos[1], pos[2], pos[3], pos[4], THREE, scene, getTerrainHeight, goblinGeometry, speedMultiplier));
    }
    
    // Create guardian goblins on hard
    if (difficulty === 'hard') {
        for (let i = 0; i < GAME_CONFIG.HARD_GUARDIAN_COUNT; i++) {
            const angle = (i / GAME_CONFIG.HARD_GUARDIAN_COUNT) * Math.PI * 2;
            const x = GAME_CONFIG.TREASURE_X + Math.cos(angle) * 8;
            const z = GAME_CONFIG.TREASURE_Z + Math.sin(angle) * 8;
            goblins.push(createGuardianGoblin(x, z, x - 3, x + 3, 0.014, THREE, scene, getTerrainHeight, speedMultiplier));
        }
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
        hudCtx.font = '20px Arial';
        hudCtx.fillText(`Munition: ${ammo}`, 10, 30);
        hudCtx.fillText(`Materialien: ${materialsCollected}/${materialsNeeded}`, 10, 60);
        
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
    }

    // Stub collision check
    function checkCollisions(prevPos) {
        return false;
    }

    // Game loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (!gameDead && !gameWon) {
            const { isMoving, isStuck } = player.update(checkCollisions);
            updateCamera();
            
            // Update goblins
            goblins.forEach(gob => {
                if (gob.alive) {
                    const status = updateGoblin(gob, player.group.position, getTerrainHeight, traps, () => {}, gameDead, Audio.stopBackgroundMusic, Audio.playDeathSound, gameWon);
                    if (status === 'dead') {
                        gameDead = true;
                        Audio.stopBackgroundMusic();
                        Audio.playDeathSound();
                    }
                }
            });
            
            // Update proximity sound
            Audio.updateGoblinProximitySound(player.group.position, goblins);
        }
        
        drawHUD();
        renderer.render(scene, camera);
    }

    // Restart handler
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'r' || e.key === 'R') && (gameWon || gameDead)) {
            location.reload();
        }
    });

    animate();
}
