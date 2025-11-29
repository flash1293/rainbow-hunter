// Three.js Setup
const container = document.getElementById('gameCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
camera.position.set(0, 15, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(800, 600);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -60;
directionalLight.shadow.camera.right = 60;
directionalLight.shadow.camera.top = 60;
directionalLight.shadow.camera.bottom = -60;
scene.add(directionalLight);

// Ground with height variation (terrain)
const groundGeometry = new THREE.PlaneGeometry(120, 120, 60, 60);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xa8d5a8 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

// Add height variation to terrain
const vertices = ground.geometry.attributes.position;

// Define specific hill locations
const hills = [
    { x: -25, z: 30, radius: 12, height: 4 },      // Links hinten
    { x: 30, z: 25, radius: 10, height: 3.5 },     // Rechts hinten
    { x: -35, z: -15, radius: 14, height: 5 },     // Links vor dem Fluss
    { x: 40, z: -20, radius: 11, height: 4.5 },    // Rechts zwischen Fluss und Kobold
    { x: -15, z: 12, radius: 8, height: 3 }        // Links nahe Start
];

for (let i = 0; i < vertices.count; i++) {
    // PlaneGeometry vertices are already in world space coordinates when centered
    const vertexX = vertices.getX(i);
    const vertexY = vertices.getY(i);
    
    let height = 0;
    
    // After rotation, vertexX stays X and vertexY becomes Z in world coordinates
    // BUT: Y coordinate is negated after rotation!
    const worldX = vertexX;
    const worldZ = -vertexY;  // Negated!
    
    // Keep flat zone around river (z between -5 and 5)
    // Keep flat zone around goblin area (z < -45 and x between 10 and 40)
    const inRiverZone = Math.abs(worldZ) < 5;
    const inGoblinZone = worldZ < -45 && worldX > 10 && worldX < 40;
    
    if (!inRiverZone && !inGoblinZone) {
        // Add each hill
        hills.forEach(hill => {
            const distToHill = Math.sqrt(
                Math.pow(worldX - hill.x, 2) + Math.pow(worldZ - hill.z, 2)
            );
            
            if (distToHill < hill.radius) {
                // Smooth hill shape using cosine
                const factor = Math.cos((distToHill / hill.radius) * Math.PI / 2);
                height += factor * factor * hill.height;
            }
        });
    }
    
    vertices.setZ(i, height);
}

ground.geometry.computeVertexNormals();
scene.add(ground);

// Function to get terrain height at position
function getTerrainHeight(x, z) {
    let y = 0;
    
    const inRiverZone = Math.abs(z) < 5;
    const inGoblinZone = z < -45 && x > 10 && x < 40;
    
    if (!inRiverZone && !inGoblinZone) {
        // Same hill calculation - must match terrain generation exactly
        const hills = [
            { x: -25, z: 30, radius: 12, height: 4 },
            { x: 30, z: 25, radius: 10, height: 3.5 },
            { x: -35, z: -15, radius: 14, height: 5 },
            { x: 40, z: -20, radius: 11, height: 4.5 },
            { x: -15, z: 12, radius: 8, height: 3 }
        ];
        
        hills.forEach(hill => {
            const distToHill = Math.sqrt(
                Math.pow(x - hill.x, 2) + Math.pow(z - hill.z, 2)
            );
            
            if (distToHill < hill.radius) {
                const factor = Math.cos((distToHill / hill.radius) * Math.PI / 2);
                y += factor * factor * hill.height;
            }
        });
    }
    
    return y;
}

// Game State
let gameWon = false;
let ammo = 100;
const maxAmmo = 100;

// Player (Girl on Bicycle) - 3D
const playerGroup = new THREE.Group();

// Bicycle wheels
const wheelGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
frontWheel.rotation.y = Math.PI / 2;
frontWheel.position.set(0.6, 0.3, 0);
frontWheel.castShadow = true;
playerGroup.add(frontWheel);

const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
backWheel.rotation.y = Math.PI / 2;
backWheel.position.set(-0.6, 0.3, 0);
backWheel.castShadow = true;
playerGroup.add(backWheel);

// Bicycle frame
const frameGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
const frameMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B9D });
const frame1 = new THREE.Mesh(frameGeometry, frameMaterial);
frame1.rotation.z = Math.PI / 4;
frame1.position.set(0, 0.8, 0);
frame1.castShadow = true;
playerGroup.add(frame1);

// Girl body
const bodyGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.3);
const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.set(0, 1.3, 0);
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

playerGroup.position.set(0, 0, 40);
scene.add(playerGroup);

const player = {
    mesh: playerGroup,
    speed: 0.15,
    direction: new THREE.Vector3(0, 0, -1)
};

// Keyboard input
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
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
    if ((e.key === 'r' || e.key === 'R') && gameWon) {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Obstacles - Trees
const trees = [];
const treePositions = [
    { x: -10, z: -15 },
    { x: 10, z: -16 },
    { x: 0, z: -18 },
    { x: -25, z: -30 },
    { x: 20, z: -35 },
    { x: -15, z: -45 },
    { x: 30, z: -25 },
    { x: -35, z: 15 },
    { x: 40, z: 20 },
];

treePositions.forEach(pos => {
    const treeGroup = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Foliage
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
    // Bottom area
    { x: -8, z: 8 },
    { x: -3, z: 7 },
    { x: 5, z: 8 },
    { x: 10, z: 7 },
    { x: -20, z: 25 },
    { x: 15, z: 30 },
    { x: -10, z: 35 },
    // Middle area
    { x: -18, z: 5 },
    { x: 22, z: 10 },
    { x: -25, z: -5 },
    { x: 30, z: -2 },
    // Top area
    { x: -12, z: -8 },
    { x: -6, z: -9 },
    { x: 7, z: -8 },
    { x: 12, z: -9 },
    { x: -30, z: -20 },
    { x: 35, z: -25 },
    { x: -20, z: -35 },
    { x: 25, z: -40 }
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

// River
const riverGeometry = new THREE.PlaneGeometry(120, 4);
const riverMaterial = new THREE.MeshLambertMaterial({ color: 0x4682B4 });
const river = new THREE.Mesh(riverGeometry, riverMaterial);
river.rotation.x = -Math.PI / 2;
river.position.set(0, 0.05, 0);
river.receiveShadow = true;
scene.add(river);

const riverObj = { 
    mesh: river, 
    type: 'river', 
    minZ: -2, 
    maxZ: 2,
    minX: -60,
    maxX: 60
};

// Bridge
const bridgeGroup = new THREE.Group();

// Bridge deck
const deckGeometry = new THREE.BoxGeometry(5, 0.3, 5);
const deckMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const deck = new THREE.Mesh(deckGeometry, deckMaterial);
deck.position.y = 0.5;
deck.castShadow = true;
deck.receiveShadow = true;
bridgeGroup.add(deck);

// Bridge railings
const railGeometry = new THREE.BoxGeometry(5, 0.5, 0.1);
const railMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
const rail1 = new THREE.Mesh(railGeometry, railMaterial);
rail1.position.set(0, 0.9, 2.5);
rail1.castShadow = true;
bridgeGroup.add(rail1);

const rail2 = new THREE.Mesh(railGeometry, railMaterial);
rail2.position.set(0, 0.9, -2.5);
rail2.castShadow = true;
bridgeGroup.add(rail2);

bridgeGroup.position.set(0, 0, 0);
scene.add(bridgeGroup);

const bridge = { 
    mesh: bridgeGroup, 
    type: 'bridge', 
    minX: -2.5, 
    maxX: 2.5, 
    minZ: -2.5, 
    maxZ: 2.5 
};

// Traps
const traps = [];
const trapPositions = [
    { x: -5, z: 12 },
    { x: 12, z: 11 },
    { x: -15, z: 9 },
    { x: -8, z: -5 },
    { x: 10, z: -6 },
    { x: -2, z: -20 },
    { x: 25, z: 15 },
    { x: -30, z: 20 },
    { x: 18, z: -15 },
    { x: -22, z: -25 },
    { x: 35, z: -10 },
    { x: -28, z: -40 }
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

// Goblin
const goblinGroup = new THREE.Group();

// Goblin body
const goblinBodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
const goblinBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
const goblinBody = new THREE.Mesh(goblinBodyGeometry, goblinBodyMaterial);
goblinBody.position.y = 0.8;
goblinBody.castShadow = true;
goblinGroup.add(goblinBody);

// Goblin head
const goblinHeadGeometry = new THREE.SphereGeometry(0.4, 16, 16);
const goblinHeadMaterial = new THREE.MeshLambertMaterial({ color: 0x3d5c3d });
const goblinHead = new THREE.Mesh(goblinHeadGeometry, goblinHeadMaterial);
goblinHead.position.y = 1.5;
goblinHead.castShadow = true;
goblinGroup.add(goblinHead);

// Goblin eyes (glowing red)
const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
eye1.position.set(-0.15, 1.5, 0.35);
goblinGroup.add(eye1);

const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
eye2.position.set(0.15, 1.5, 0.35);
goblinGroup.add(eye2);

// Goblin ears
const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
const earMaterial = new THREE.MeshLambertMaterial({ color: 0x3d5c3d });
const ear1 = new THREE.Mesh(earGeometry, earMaterial);
ear1.rotation.z = Math.PI / 2;
ear1.position.set(-0.5, 1.5, 0);
ear1.castShadow = true;
goblinGroup.add(ear1);

const ear2 = new THREE.Mesh(earGeometry, earMaterial);
ear2.rotation.z = -Math.PI / 2;
ear2.position.set(0.5, 1.5, 0);
ear2.castShadow = true;
goblinGroup.add(ear2);

goblinGroup.position.set(25, 0, -50);
scene.add(goblinGroup);

const goblin = {
    mesh: goblinGroup,
    speed: 0.04,
    direction: 1,
    patrolLeft: 15,
    patrolRight: 35,
    alive: true,
    radius: 1.5
};

// Rainbow
const rainbowGroup = new THREE.Group();
const rainbowColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
rainbowColors.forEach((color, i) => {
    const radius = 5 - (i * 0.3);
    const arcGeometry = new THREE.TorusGeometry(radius, 0.3, 8, 32, Math.PI);
    const arcMaterial = new THREE.MeshLambertMaterial({ color: color });
    const arc = new THREE.Mesh(arcGeometry, arcMaterial);
    arc.rotation.x = Math.PI / 2;
    rainbowGroup.add(arc);
});
rainbowGroup.position.set(30, 0, -55);
scene.add(rainbowGroup);

// Treasure
const treasureGroup = new THREE.Group();

// Chest bottom
const chestBottomGeometry = new THREE.BoxGeometry(1, 0.6, 0.8);
const chestMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const chestBottom = new THREE.Mesh(chestBottomGeometry, chestMaterial);
chestBottom.position.y = 0.3;
chestBottom.castShadow = true;
treasureGroup.add(chestBottom);

// Chest lid
const chestLidGeometry = new THREE.BoxGeometry(1, 0.4, 0.8);
const chestLid = new THREE.Mesh(chestLidGeometry, chestMaterial);
chestLid.position.y = 0.8;
chestLid.castShadow = true;
treasureGroup.add(chestLid);

// Gold
const goldGeometry = new THREE.SphereGeometry(0.3, 8, 8);
const goldMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0xFFAA00 });
const gold = new THREE.Mesh(goldGeometry, goldMaterial);
gold.position.y = 0.7;
treasureGroup.add(gold);

treasureGroup.position.set(30, 0, -57);
scene.add(treasureGroup);

const treasure = {
    mesh: treasureGroup,
    radius: 1
};

// Bullets
const bullets = [];

function shootBullet() {
    if (gameWon || ammo <= 0) return;
    
    const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const bulletMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bulletMesh.position.copy(playerGroup.position);
    bulletMesh.position.y = 1;
    bulletMesh.castShadow = true;
    scene.add(bulletMesh);
    
    const bullet = {
        mesh: bulletMesh,
        velocity: player.direction.clone().multiplyScalar(0.5),
        radius: 0.2
    };
    bullets.push(bullet);
    ammo--;
}

// Update functions
function updatePlayer() {
    if (gameWon) return;
    
    const prevPos = playerGroup.position.clone();
    
    if (keys.ArrowUp) {
        playerGroup.position.z -= player.speed;
        player.direction.set(0, 0, -1);
    }
    if (keys.ArrowDown) {
        playerGroup.position.z += player.speed;
        player.direction.set(0, 0, 1);
    }
    if (keys.ArrowLeft) {
        playerGroup.position.x -= player.speed;
        player.direction.set(-1, 0, 0);
    }
    if (keys.ArrowRight) {
        playerGroup.position.x += player.speed;
        player.direction.set(1, 0, 0);
    }
    
    // Boundary check
    if (playerGroup.position.x < -55 || playerGroup.position.x > 55 ||
        playerGroup.position.z < -55 || playerGroup.position.z > 55) {
        playerGroup.position.copy(prevPos);
    }
    
    checkCollisions(prevPos);
    
    // Update player height based on terrain
    const terrainHeight = getTerrainHeight(playerGroup.position.x, playerGroup.position.z);
    playerGroup.position.y = terrainHeight;
    
    // Camera follow
    camera.position.x = playerGroup.position.x;
    camera.position.z = playerGroup.position.z + 20;
    camera.lookAt(playerGroup.position.x, 0, playerGroup.position.z);
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.mesh.position.add(bullet.velocity);
        
        // Remove if out of bounds
        if (Math.abs(bullet.mesh.position.x) > 60 || Math.abs(bullet.mesh.position.z) > 60) {
            scene.remove(bullet.mesh);
            bullets.splice(i, 1);
            continue;
        }
        
        // Check collision with goblin
        if (goblin.alive) {
            const dist = bullet.mesh.position.distanceTo(goblinGroup.position);
            if (dist < goblin.radius + bullet.radius) {
                goblin.alive = false;
                goblinGroup.visible = false;
                scene.remove(bullet.mesh);
                bullets.splice(i, 1);
            }
        }
    }
}

function updateGoblin() {
    if (!goblin.alive || gameWon) return;
    
    // Smart goblin - chases player when in range
    const distToPlayer = Math.sqrt(
        Math.pow(playerGroup.position.x - goblinGroup.position.x, 2) + 
        Math.pow(playerGroup.position.z - goblinGroup.position.z, 2)
    );
    
    // If player is within 30 units, chase them
    if (distToPlayer < 30) {
        const directionX = playerGroup.position.x - goblinGroup.position.x;
        const directionZ = playerGroup.position.z - goblinGroup.position.z;
        const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
        
        if (length > 0) {
            goblinGroup.position.x += (directionX / length) * goblin.speed;
            goblinGroup.position.z += (directionZ / length) * goblin.speed;
        }
    } else {
        // Otherwise patrol
        goblinGroup.position.x += goblin.speed * goblin.direction;
        
        if (goblinGroup.position.x <= goblin.patrolLeft) {
            goblin.direction = 1;
        } else if (goblinGroup.position.x >= goblin.patrolRight) {
            goblin.direction = -1;
        }
    }
    
    // Update goblin height based on terrain
    const terrainHeight = getTerrainHeight(goblinGroup.position.x, goblinGroup.position.z);
    goblinGroup.position.y = terrainHeight;
    
    // Check collision with player
    const dist = playerGroup.position.distanceTo(goblinGroup.position);
    if (dist < 1.5) {
        resetGame();
    }
}

function checkCollisions(prevPos) {
    // Rocks
    rocks.forEach(rock => {
        const dist = new THREE.Vector2(
            playerGroup.position.x - rock.mesh.position.x,
            playerGroup.position.z - rock.mesh.position.z
        ).length();
        if (dist < rock.radius + 0.8) {
            playerGroup.position.copy(prevPos);
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
        }
    });
    
    // River and bridge
    if (playerGroup.position.z > riverObj.minZ && playerGroup.position.z < riverObj.maxZ) {
        // In river area - check if on bridge
        const onBridge = playerGroup.position.x > bridge.minX && 
                        playerGroup.position.x < bridge.maxX &&
                        playerGroup.position.z > bridge.minZ && 
                        playerGroup.position.z < bridge.maxZ;
        if (!onBridge) {
            playerGroup.position.copy(prevPos);
        }
    }
    
    // Traps
    traps.forEach(trap => {
        const dist = new THREE.Vector2(
            playerGroup.position.x - trap.mesh.position.x,
            playerGroup.position.z - trap.mesh.position.z
        ).length();
        if (dist < trap.radius) {
            resetGame();
        }
    });
    
    // Treasure
    if (!goblin.alive) {
        const dist = playerGroup.position.distanceTo(treasureGroup.position);
        if (dist < treasure.radius + 0.8) {
            gameWon = true;
        }
    }
}

function resetGame() {
    playerGroup.position.set(0, getTerrainHeight(0, 40), 40);
    player.direction.set(0, 0, -1);
    goblin.alive = true;
    goblinGroup.visible = true;
    const goblinTerrainHeight = getTerrainHeight(25, -50);
    goblinGroup.position.set(25, goblinTerrainHeight, -50);
    goblin.direction = 1;
    bullets.forEach(b => scene.remove(b.mesh));
    bullets.length = 0;
    ammo = maxAmmo;
    gameWon = false;
    camera.position.set(0, 15, 20);
}

// HUD
const hudCanvas = document.createElement('canvas');
hudCanvas.width = 800;
hudCanvas.height = 600;
hudCanvas.style.position = 'absolute';
hudCanvas.style.top = '0';
hudCanvas.style.left = '0';
hudCanvas.style.pointerEvents = 'none';
container.appendChild(hudCanvas);
const hudCtx = hudCanvas.getContext('2d');

function drawHUD() {
    hudCtx.clearRect(0, 0, 800, 600);
    
    // Ammo counter
    hudCtx.fillStyle = '#000';
    hudCtx.font = 'bold 18px Arial';
    hudCtx.fillText(`Schüsse: ${ammo}/${maxAmmo}`, 10, 25);
    
    // Win screen
    if (gameWon) {
        hudCtx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        hudCtx.fillRect(250, 200, 300, 200);
        
        hudCtx.fillStyle = '#000';
        hudCtx.font = 'bold 36px Arial';
        hudCtx.textAlign = 'center';
        hudCtx.fillText('GEWONNEN!', 400, 280);
        hudCtx.font = '20px Arial';
        hudCtx.fillText('Drücke R zum Neustart', 400, 340);
        hudCtx.textAlign = 'left';
    }
}

// Game loop
function animate() {
    requestAnimationFrame(animate);
    
    updatePlayer();
    updateBullets();
    updateGoblin();
    drawHUD();
    
    renderer.render(scene, camera);
}

animate();
