// Three.js Setup
const container = document.getElementById('gameCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 2000);
camera.position.set(0, 15, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(800, 600);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Make container position relative so HUD can be positioned absolutely within it
container.style.position = 'relative';
container.style.width = '800px';
container.style.height = '600px';
container.style.display = 'inline-block';

// Audio Context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Sound effect functions
function playShootSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playExplosionSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playDeathSound() {
    // Evil death music with dark, ominous tones
    const notes = [
        { freq: 65.41, duration: 0.3 },   // C2 (low)
        { freq: 73.42, duration: 0.3 },   // D2
        { freq: 61.74, duration: 0.3 },   // B1 (dissonant)
        { freq: 55.00, duration: 0.4 },   // A1 (very low)
        { freq: 46.25, duration: 0.5 }    // F#1 (ominous low end)
    ];
    
    let startTime = 0;
    notes.forEach((note, i) => {
        // Main dark tone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth'; // Harsh, evil sound
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + startTime);
        oscillator.frequency.exponentialRampToValueAtTime(note.freq * 0.5, audioContext.currentTime + startTime + note.duration);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, audioContext.currentTime + startTime);
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + note.duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + note.duration);
        
        // Add dissonant overtone for evil effect
        const overtone = audioContext.createOscillator();
        const overtoneGain = audioContext.createGain();
        
        overtone.connect(overtoneGain);
        overtoneGain.connect(audioContext.destination);
        
        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(note.freq * 1.5, audioContext.currentTime + startTime);
        
        overtoneGain.gain.setValueAtTime(0.15, audioContext.currentTime + startTime);
        overtoneGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + note.duration);
        
        overtone.start(audioContext.currentTime + startTime);
        overtone.stop(audioContext.currentTime + startTime + note.duration);
        
        startTime += note.duration * 0.8; // Overlap notes slightly for continuity
    });
}

function playCollectSound() {
    // Pleasant pickup sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playEmptyGunSound() {
    // Click sound when no ammo
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

function playStuckSound() {
    // Frustrated bump sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playBulletImpactSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
}

// Background music
let backgroundMusicOscillators = [];
let backgroundMusicPlaying = false;
let backgroundMusicTimeout = null;

function startBackgroundMusic() {
    if (backgroundMusicPlaying) return;
    backgroundMusicPlaying = true;
    
    // Extended cheerful adventure melody
    const melody = [
        { note: 523.25, duration: 0.3 }, // C5
        { note: 587.33, duration: 0.3 }, // D5
        { note: 659.25, duration: 0.3 }, // E5
        { note: 587.33, duration: 0.3 }, // D5
        { note: 523.25, duration: 0.6 }, // C5
        { note: 392.00, duration: 0.3 }, // G4
        { note: 440.00, duration: 0.3 }, // A4
        { note: 493.88, duration: 0.3 }, // B4
        { note: 523.25, duration: 0.6 }, // C5
        { note: 659.25, duration: 0.3 }, // E5
        { note: 587.33, duration: 0.3 }, // D5
        { note: 523.25, duration: 0.3 }, // C5
        { note: 587.33, duration: 0.3 }, // D5
        { note: 392.00, duration: 0.9 }, // G4
        { note: 493.88, duration: 0.3 }, // B4
        { note: 523.25, duration: 0.3 }, // C5
        { note: 587.33, duration: 0.3 }, // D5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 523.25, duration: 0.3 }, // C5
        { note: 392.00, duration: 0.6 }, // G4
        // New section
        { note: 659.25, duration: 0.3 }, // E5
        { note: 698.46, duration: 0.3 }, // F5
        { note: 783.99, duration: 0.3 }, // G5
        { note: 698.46, duration: 0.3 }, // F5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 587.33, duration: 0.3 }, // D5
        { note: 523.25, duration: 0.3 }, // C5
        { note: 493.88, duration: 0.3 }, // B4
        { note: 523.25, duration: 0.9 }, // C5
        { note: 440.00, duration: 0.3 }, // A4
        { note: 493.88, duration: 0.3 }, // B4
        { note: 523.25, duration: 0.3 }, // C5
        { note: 587.33, duration: 0.3 }, // D5
        { note: 659.25, duration: 0.6 }, // E5
        { note: 587.33, duration: 0.3 }, // D5
        { note: 523.25, duration: 0.3 }, // C5
        { note: 493.88, duration: 0.3 }, // B4
        { note: 440.00, duration: 0.6 }, // A4
        { note: 392.00, duration: 0.3 }, // G4
        { note: 440.00, duration: 0.3 }, // A4
        { note: 493.88, duration: 0.3 }, // B4
        { note: 523.25, duration: 1.2 }  // C5
    ];
    
    function playMelody() {
        if (!backgroundMusicPlaying) return;
        
        // Clear previous oscillators
        backgroundMusicOscillators = [];
        
        let time = 0;
        melody.forEach(note => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(note.note, audioContext.currentTime + time);
            
            gainNode.gain.setValueAtTime(0.04, audioContext.currentTime + time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + note.duration);
            
            oscillator.start(audioContext.currentTime + time);
            oscillator.stop(audioContext.currentTime + time + note.duration);
            
            // Store oscillator reference
            backgroundMusicOscillators.push({ oscillator, gainNode, stopTime: audioContext.currentTime + time + note.duration });
            
            time += note.duration;
        });
        
        // Loop the melody
        if (backgroundMusicPlaying) {
            backgroundMusicTimeout = setTimeout(playMelody, time * 1000);
        }
    }
    
    playMelody();
}

function stopBackgroundMusic() {
    backgroundMusicPlaying = false;
    
    // Clear the timeout for next melody loop
    if (backgroundMusicTimeout) {
        clearTimeout(backgroundMusicTimeout);
        backgroundMusicTimeout = null;
    }
    
    // Stop all currently playing oscillators immediately
    backgroundMusicOscillators.forEach(({ oscillator, gainNode, stopTime }) => {
        try {
            if (audioContext.currentTime < stopTime) {
                gainNode.gain.cancelScheduledValues(audioContext.currentTime);
                gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.stop(audioContext.currentTime + 0.05);
            }
        } catch (e) {
            // Oscillator may already be stopped
        }
    });
    backgroundMusicOscillators = [];
}

// Bike tire on dirt sound (continuous while moving)
let bikeNoiseNode = null;

function startBikeSound() {
    if (bikeNoiseNode) return; // Already playing
    
    // Use white noise filtered to sound like tires on dirt
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    bikeNoiseNode = audioContext.createBufferSource();
    bikeNoiseNode.buffer = noiseBuffer;
    bikeNoiseNode.loop = true;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.008, audioContext.currentTime);
    
    bikeNoiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    bikeNoiseNode.start(audioContext.currentTime);
}

function stopBikeSound() {
    if (!bikeNoiseNode) return;
    
    bikeNoiseNode.stop(audioContext.currentTime + 0.05);
    bikeNoiseNode = null;
}

// Goblin proximity sound - periodic footsteps
let lastGoblinFootstep = 0;

function playGoblinFootstep() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
}

function updateGoblinProximitySound() {
    // Find closest alive goblin
    let closestDistance = Infinity;
    
    if (goblin.alive) {
        const dist = Math.sqrt(
            Math.pow(playerGroup.position.x - goblinGroup.position.x, 2) + 
            Math.pow(playerGroup.position.z - goblinGroup.position.z, 2)
        );
        closestDistance = Math.min(closestDistance, dist);
    }
    
    if (bridgeGoblin.alive) {
        const dist = Math.sqrt(
            Math.pow(playerGroup.position.x - bridgeGoblinGroup.position.x, 2) + 
            Math.pow(playerGroup.position.z - bridgeGoblinGroup.position.z, 2)
        );
        closestDistance = Math.min(closestDistance, dist);
    }
    
    additionalGoblins.forEach(gob => {
        if (gob.alive) {
            const dist = Math.sqrt(
                Math.pow(playerGroup.position.x - gob.mesh.position.x, 2) + 
                Math.pow(playerGroup.position.z - gob.mesh.position.z, 2)
            );
            closestDistance = Math.min(closestDistance, dist);
        }
    });
    
    // Play periodic footstep if goblin is within 30 units
    const maxDistance = 30;
    if (closestDistance < maxDistance) {
        const now = Date.now();
        // Play footstep every 0.5-1.5 seconds depending on distance
        const interval = 500 + (closestDistance / maxDistance) * 1000;
        
        if (now - lastGoblinFootstep > interval) {
            playGoblinFootstep();
            lastGoblinFootstep = now;
        }
    }
}

// Start background music when game loads
startBackgroundMusic();

function playRepairSound() {
    // Construction/building sound
    const duration = 0.5;
    
    // Hammer hits
    for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + i * 0.15);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, audioContext.currentTime + i * 0.15);
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + i * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.1);
        
        oscillator.start(audioContext.currentTime + i * 0.15);
        oscillator.stop(audioContext.currentTime + i * 0.15 + 0.1);
    }
}

function playWinSound() {
    // Very creepy, unsettling horror music
    const notes = [
        { freq: 55.00, duration: 0.6 },   // A1 (very low)
        { freq: 46.25, duration: 0.6 },   // F#1 (dissonant)
        { freq: 41.20, duration: 0.7 },   // E1 (extremely low)
        { freq: 36.71, duration: 0.8 },   // D1 (ominous deep)
        { freq: 32.70, duration: 1.0 }    // C1 (terrifying low end)
    ];
    
    let startTime = 0;
    notes.forEach((note, i) => {
        // Main creepy drone
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + startTime);
        oscillator.frequency.exponentialRampToValueAtTime(note.freq * 0.7, audioContext.currentTime + startTime + note.duration);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, audioContext.currentTime + startTime);
        filter.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + startTime + note.duration);
        
        gainNode.gain.setValueAtTime(0.35, audioContext.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + note.duration);
        
        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + note.duration);
        
        // Dissonant high overtone (creepy)
        const overtone1 = audioContext.createOscillator();
        const overtoneGain1 = audioContext.createGain();
        
        overtone1.connect(overtoneGain1);
        overtoneGain1.connect(audioContext.destination);
        
        overtone1.type = 'triangle';
        overtone1.frequency.setValueAtTime(note.freq * 1.414, audioContext.currentTime + startTime); // Tritone
        
        overtoneGain1.gain.setValueAtTime(0.2, audioContext.currentTime + startTime);
        overtoneGain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + note.duration);
        
        overtone1.start(audioContext.currentTime + startTime);
        overtone1.stop(audioContext.currentTime + startTime + note.duration);
        
        // Extra dissonant layer for horror effect
        const overtone2 = audioContext.createOscillator();
        const overtoneGain2 = audioContext.createGain();
        
        overtone2.connect(overtoneGain2);
        overtoneGain2.connect(audioContext.destination);
        
        overtone2.type = 'square';
        overtone2.frequency.setValueAtTime(note.freq * 1.68, audioContext.currentTime + startTime); // Very dissonant interval
        
        overtoneGain2.gain.setValueAtTime(0.12, audioContext.currentTime + startTime);
        overtoneGain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + note.duration);
        
        overtone2.start(audioContext.currentTime + startTime);
        overtone2.stop(audioContext.currentTime + startTime + note.duration);
        
        startTime += note.duration * 0.6; // Longer overlap for droning horror effect
    });
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

// Define hill locations (shared between terrain generation and height lookup)
// Avoid placing hills near the river (z between -5 and 5)
const HILLS = [
    { x: -25, z: 30, radius: 6, height: 5 },
    { x: 30, z: 25, radius: 5, height: 3 },
    { x: -35, z: -15, radius: 7, height: 6 },
    { x: 40, z: -20, radius: 5, height: 4 },
    { x: -50, z: 60, radius: 8, height: 7 },
    { x: 55, z: 55, radius: 6, height: 5 },
    { x: -60, z: -40, radius: 7, height: 6 },
    { x: 65, z: -50, radius: 5, height: 4 },
    { x: 10, z: 50, radius: 5, height: 3 },
    { x: -15, z: -50, radius: 6, height: 5 },
    { x: 45, z: 45, radius: 5, height: 4 },
    { x: -70, z: 20, radius: 6, height: 5 },
    { x: 70, z: -25, radius: 7, height: 6 },
    { x: 15, z: -35, radius: 5, height: 3 },
    { x: -40, z: 45, radius: 6, height: 5 }
];

// Ground - flat terrain
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xa8d5a8 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Render hills as cone objects
HILLS.forEach(hill => {
    const hillGeometry = new THREE.ConeGeometry(hill.radius, hill.height, 16);
    const hillMaterial = new THREE.MeshLambertMaterial({ color: 0x8db87d });
    const hillMesh = new THREE.Mesh(hillGeometry, hillMaterial);
    hillMesh.position.set(hill.x, hill.height / 2, hill.z);
    hillMesh.castShadow = true;
    hillMesh.receiveShadow = true;
    scene.add(hillMesh);
});

// Background mountains around the world
const mountainPositions = [
    { x: 0, z: -140, width: 80, height: 30 },
    { x: -100, z: -100, width: 60, height: 25 },
    { x: 100, z: -100, width: 60, height: 25 },
    { x: -140, z: 0, width: 60, height: 28 },
    { x: 140, z: 0, width: 60, height: 28 },
    { x: -100, z: 100, width: 70, height: 22 },
    { x: 100, z: 100, width: 70, height: 22 },
    { x: 0, z: 140, width: 80, height: 26 },
    { x: -50, z: -135, width: 65, height: 27 },
    { x: 50, z: -135, width: 65, height: 27 },
    { x: -135, z: -50, width: 55, height: 24 },
    { x: -135, z: 50, width: 55, height: 24 },
    { x: 135, z: -50, width: 55, height: 24 },
    { x: 135, z: 50, width: 55, height: 24 },
    { x: -50, z: 135, width: 65, height: 23 },
    { x: 50, z: 135, width: 65, height: 23 }
];

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

// Function to get terrain height at position
function getTerrainHeight(x, z) {
    let y = 0;
    
    // No coordinate transformation needed - hills are placed directly in world space
    
    const inRiverZone = Math.abs(z) < 5;
    const inGoblinZone = z < -45 && x > 10 && x < 40;
    
    if (!inRiverZone && !inGoblinZone) {
        // Find the nearest hill and use only its height
        let nearestDist = Infinity;
        let nearestHill = null;
        
        HILLS.forEach(hill => {
            const distToHill = Math.sqrt(
                Math.pow(x - hill.x, 2) + Math.pow(z - hill.z, 2)
            );
            
            if (distToHill < hill.radius && distToHill < nearestDist) {
                nearestDist = distToHill;
                nearestHill = hill;
            }
        });
        
        if (nearestHill) {
            // Linear interpolation from center to edge
            const factor = 1 - (nearestDist / nearestHill.radius);
            y = factor * nearestHill.height;
        }
    }
    
    return y;
}

// Game State
let gameWon = false;
let gameDead = false;
let ammo = 10;
const maxAmmo = 100;
let bridgeRepaired = false;
let materialsCollected = 0;
const materialsNeeded = 3;

// Player (Girl on Bicycle) - 3D
const playerGroup = new THREE.Group();

// Bicycle wheels - positioned front to back (along Z axis)
const wheelGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

// Front wheel (forward direction)
const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
frontWheel.rotation.y = Math.PI / 2;
frontWheel.position.set(0, 0.3, -0.7);
frontWheel.castShadow = true;
playerGroup.add(frontWheel);

// Back wheel
const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
backWheel.rotation.y = Math.PI / 2;
backWheel.position.set(0, 0.3, 0.5);
backWheel.castShadow = true;
playerGroup.add(backWheel);

// Bicycle frame connecting wheels
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

// Handlebar (horizontal)
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

// Direction indicator - a cone pointing forward
const coneGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
const coneMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
const directionCone = new THREE.Mesh(coneGeometry, coneMaterial);
directionCone.rotation.x = Math.PI / 2;
directionCone.position.set(0, 0.5, -1.0);
directionCone.castShadow = true;
playerGroup.add(directionCone);

playerGroup.position.set(0, 0, 40);
playerGroup.rotation.y = Math.PI; // Rotate 180 degrees to face the right direction
scene.add(playerGroup);

const player = {
    mesh: playerGroup,
    speed: 0.08,
    rotation: Math.PI, // Initialize rotation to match the group rotation
    rotationSpeed: 0.025
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
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Mouse controls for rotation
let lastMouseX = null;
let isPointerLocked = false;

// Request pointer lock on click
container.addEventListener('click', () => {
    if (!isPointerLocked) {
        container.requestPointerLock = container.requestPointerLock || 
                                       container.mozRequestPointerLock || 
                                       container.webkitRequestPointerLock;
        container.requestPointerLock();
    }
});

// Track pointer lock state
document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === container;
    if (!isPointerLocked) {
        lastMouseX = null;
    }
});

document.addEventListener('mozpointerlockchange', () => {
    isPointerLocked = document.mozPointerLockElement === container;
    if (!isPointerLocked) {
        lastMouseX = null;
    }
});

document.addEventListener('webkitpointerlockchange', () => {
    isPointerLocked = document.webkitPointerLockElement === container;
    if (!isPointerLocked) {
        lastMouseX = null;
    }
});

document.addEventListener('mousemove', (e) => {
    if (isPointerLocked) {
        // Use movementX for pointer lock (much smoother)
        const deltaX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        player.rotation -= deltaX * 0.003;
    }
});

// Obstacles - Trees
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
    { x: 0, z: 30 }  // Rock on top of test hill
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
const riverGeometry = new THREE.PlaneGeometry(300, 4);
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
    minX: -150,
    maxX: 150
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
bridgeGroup.visible = false; // Bridge starts broken
scene.add(bridgeGroup);

// Broken bridge planks (visible when bridge is broken)
const brokenBridgeGroup = new THREE.Group();

// Broken/tilted planks
const brokenPlankGeometry = new THREE.BoxGeometry(1.5, 0.2, 0.3);
const brokenPlankMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

for (let i = 0; i < 3; i++) {
    const plank = new THREE.Mesh(brokenPlankGeometry, brokenPlankMaterial);
    plank.position.set(-1.5 + i * 1.5, 0.2, -1 + i * 0.5);
    plank.rotation.y = (Math.random() - 0.5) * 0.5;
    plank.rotation.z = (Math.random() - 0.5) * 0.3;
    plank.castShadow = true;
    brokenBridgeGroup.add(plank);
}

// Broken posts
for (let i = 0; i < 2; i++) {
    const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8),
        brokenPlankMaterial
    );
    post.position.set(i === 0 ? -2 : 2, 0.4, 0);
    post.rotation.z = (i === 0 ? -1 : 1) * Math.PI / 6;
    post.castShadow = true;
    brokenBridgeGroup.add(post);
}

brokenBridgeGroup.position.set(0, 0.05, 0);
scene.add(brokenBridgeGroup);

const bridge = { 
    mesh: bridgeGroup, 
    type: 'bridge', 
    minX: -2.5, 
    maxX: 2.5, 
    minZ: -2.5, 
    maxZ: 2.5 
};

// Ammo pickups
const ammoPickups = [];
const ammoPositions = [
    { x: -15, z: 20 },
    { x: 35, z: 15 },
    { x: -25, z: -10 },
    { x: 15, z: -25 },
    { x: -40, z: 40 },
    { x: 45, z: -35 },
    { x: 5, z: 25 },
    { x: -30, z: -30 },
    { x: 20, z: -15 },
    { x: -10, z: -40 },
    { x: 40, z: 35 },
    { x: -35, z: 5 }
];

ammoPositions.forEach(pos => {
    const ammoGroup = new THREE.Group();
    
    // Ammo box
    const boxGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const ammoBox = new THREE.Mesh(boxGeometry, boxMaterial);
    ammoBox.position.y = 0.3;
    ammoBox.castShadow = true;
    ammoGroup.add(ammoBox);
    
    // Yellow marking on box
    const markGeometry = new THREE.BoxGeometry(0.61, 0.15, 0.41);
    const markMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFFF00,
        emissive: 0xFFAA00,
        emissiveIntensity: 0.3
    });
    const mark = new THREE.Mesh(markGeometry, markMaterial);
    mark.position.y = 0.3;
    ammoGroup.add(mark);
    
    // Glow effect
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
    { x: -20, z: 35, type: 'wood', color: 0x8B4513, glowColor: 0xFFAA00 },  // Wood - brown
    { x: 25, z: 30, type: 'glass', color: 0x87CEEB, glowColor: 0x00FFFF },  // Glass - light blue
    { x: 10, z: 15, type: 'metal', color: 0xC0C0C0, glowColor: 0xFFFFFF }   // Metal - silver
];

materialConfigs.forEach(config => {
    const materialGroup = new THREE.Group();
    
    let materialMesh;
    
    if (config.type === 'wood') {
        // Wood plank - larger
        const plankGeometry = new THREE.BoxGeometry(1.2, 0.3, 0.5);
        const plankMaterial = new THREE.MeshLambertMaterial({ color: config.color });
        materialMesh = new THREE.Mesh(plankGeometry, plankMaterial);
    } else if (config.type === 'glass') {
        // Glass pane - transparent, larger
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
        // Metal bar - shiny cylinder, larger
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
    
    // Glow effect with type-specific color
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
    speed: 0.02,
    direction: 1,
    patrolLeft: 15,
    patrolRight: 35,
    alive: true,
    radius: 1.5,
    health: 3,
    maxHealth: 3
};

// Bridge Goblin (second goblin guarding the bridge)
const bridgeGoblinGroup = new THREE.Group();

// Bridge goblin body
const bridgeGoblinBody = new THREE.Mesh(goblinBodyGeometry, goblinBodyMaterial);
bridgeGoblinBody.position.y = 0.8;
bridgeGoblinBody.castShadow = true;
bridgeGoblinGroup.add(bridgeGoblinBody);

// Bridge goblin head
const bridgeGoblinHead = new THREE.Mesh(goblinHeadGeometry, goblinHeadMaterial);
bridgeGoblinHead.position.y = 1.5;
bridgeGoblinHead.castShadow = true;
bridgeGoblinGroup.add(bridgeGoblinHead);

// Bridge goblin eyes
const bridgeEye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
bridgeEye1.position.set(-0.15, 1.5, 0.35);
bridgeGoblinGroup.add(bridgeEye1);

const bridgeEye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
bridgeEye2.position.set(0.15, 1.5, 0.35);
bridgeGoblinGroup.add(bridgeEye2);

// Bridge goblin ears
const bridgeEar1 = new THREE.Mesh(earGeometry, earMaterial);
bridgeEar1.rotation.z = Math.PI / 2;
bridgeEar1.position.set(-0.5, 1.5, 0);
bridgeEar1.castShadow = true;
bridgeGoblinGroup.add(bridgeEar1);

const bridgeEar2 = new THREE.Mesh(earGeometry, earMaterial);
bridgeEar2.rotation.z = -Math.PI / 2;
bridgeEar2.position.set(0.5, 1.5, 0);
bridgeEar2.castShadow = true;
bridgeGoblinGroup.add(bridgeEar2);

bridgeGoblinGroup.position.set(0, 0.5, 0);
scene.add(bridgeGoblinGroup);

const bridgeGoblin = {
    mesh: bridgeGoblinGroup,
    speed: 0.015,
    direction: 1,
    patrolLeft: -2,
    patrolRight: 2,
    alive: true,
    radius: 1.5,
    health: 1,
    maxHealth: 1
};

// Additional Goblins
const additionalGoblins = [];

// Helper function to create a goblin
function createGoblin(x, z, patrolLeft, patrolRight, speed = 0.02) {
    const goblinGrp = new THREE.Group();
    
    const body = new THREE.Mesh(goblinBodyGeometry, goblinBodyMaterial);
    body.position.y = 0.8;
    body.castShadow = true;
    goblinGrp.add(body);
    
    const head = new THREE.Mesh(goblinHeadGeometry, goblinHeadMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    goblinGrp.add(head);
    
    const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    e1.position.set(-0.15, 1.5, 0.35);
    goblinGrp.add(e1);
    
    const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    e2.position.set(0.15, 1.5, 0.35);
    goblinGrp.add(e2);
    
    const er1 = new THREE.Mesh(earGeometry, earMaterial);
    er1.rotation.z = Math.PI / 2;
    er1.position.set(-0.5, 1.5, 0);
    er1.castShadow = true;
    goblinGrp.add(er1);
    
    const er2 = new THREE.Mesh(earGeometry, earMaterial);
    er2.rotation.z = -Math.PI / 2;
    er2.position.set(0.5, 1.5, 0);
    er2.castShadow = true;
    goblinGrp.add(er2);
    
    goblinGrp.position.set(x, getTerrainHeight(x, z), z);
    scene.add(goblinGrp);
    
    // Randomly assign health: 40% chance of 3 health, 60% chance of 1 health
    const health = Math.random() < 0.4 ? 3 : 1;
    
    return {
        mesh: goblinGrp,
        speed: speed,
        direction: 1,
        patrolLeft: patrolLeft,
        patrolRight: patrolRight,
        alive: true,
        radius: 1.5,
        health: health,
        maxHealth: health
    };
}

// Create 33 additional goblins at different locations (35 total with main goblin and bridge goblin)
additionalGoblins.push(createGoblin(-40, -20, -45, -35, 0.018));
additionalGoblins.push(createGoblin(50, 10, 45, 55, 0.022));
additionalGoblins.push(createGoblin(-30, 30, -35, -25, 0.02));
additionalGoblins.push(createGoblin(40, -40, 35, 45, 0.025));
additionalGoblins.push(createGoblin(10, -30, 5, 15, 0.02));
additionalGoblins.push(createGoblin(-70, 50, -75, -65, 0.019));
additionalGoblins.push(createGoblin(80, -30, 75, 85, 0.021));
additionalGoblins.push(createGoblin(-50, -70, -55, -45, 0.023));
additionalGoblins.push(createGoblin(20, 60, 15, 25, 0.02));
additionalGoblins.push(createGoblin(60, -70, 55, 65, 0.024));
additionalGoblins.push(createGoblin(-80, -40, -85, -75, 0.02));
additionalGoblins.push(createGoblin(90, 40, 85, 95, 0.022));
additionalGoblins.push(createGoblin(-15, -25, -20, -10, 0.02));
additionalGoblins.push(createGoblin(45, 15, 40, 50, 0.022));
additionalGoblins.push(createGoblin(-25, 50, -30, -20, 0.018));
additionalGoblins.push(createGoblin(55, -45, 50, 60, 0.023));
additionalGoblins.push(createGoblin(-65, 35, -70, -60, 0.02));
additionalGoblins.push(createGoblin(75, -10, 70, 80, 0.022));
additionalGoblins.push(createGoblin(-55, 65, -60, -50, 0.021));
additionalGoblins.push(createGoblin(70, 55, 65, 75, 0.023));
additionalGoblins.push(createGoblin(-45, -55, -50, -40, 0.019));
additionalGoblins.push(createGoblin(60, -60, 55, 65, 0.022));
additionalGoblins.push(createGoblin(-85, 25, -90, -80, 0.02));
additionalGoblins.push(createGoblin(95, -20, 90, 100, 0.024));
additionalGoblins.push(createGoblin(5, -70, 0, 10, 0.021));
additionalGoblins.push(createGoblin(-35, 75, -40, -30, 0.019));
additionalGoblins.push(createGoblin(48, 70, 43, 53, 0.023));
additionalGoblins.push(createGoblin(-75, -55, -80, -70, 0.02));
additionalGoblins.push(createGoblin(85, -65, 80, 90, 0.022));
additionalGoblins.push(createGoblin(-20, -65, -25, -15, 0.021));
additionalGoblins.push(createGoblin(32, 80, 27, 37, 0.02));
additionalGoblins.push(createGoblin(-90, -25, -95, -85, 0.019));
additionalGoblins.push(createGoblin(100, 30, 95, 105, 0.025));

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

// Chest bottom
const chestBottomGeometry = new THREE.BoxGeometry(1, 0.6, 0.8);
const chestMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
const chestBottom = new THREE.Mesh(chestBottomGeometry, chestMaterial);
chestBottom.position.y = 0.3;
chestBottom.castShadow = true;
treasureGroup.add(chestBottom);

// Chest lid - opened/tilted back
const chestLidGeometry = new THREE.BoxGeometry(1, 0.4, 0.8);
const chestLid = new THREE.Mesh(chestLidGeometry, chestMaterial);
chestLid.position.y = 0.8;
chestLid.position.z = -0.3;
chestLid.rotation.x = -Math.PI / 3; // Tilted open
chestLid.castShadow = true;
treasureGroup.add(chestLid);

// Gold - multiple coins visible and higher up
const goldMaterial = new THREE.MeshLambertMaterial({ 
    color: 0xFFD700, 
    emissive: 0xFFAA00,
    emissiveIntensity: 0.5
});

// Large gold pile in the center
const goldPileGeometry = new THREE.SphereGeometry(0.3, 8, 8);
const goldPile = new THREE.Mesh(goldPileGeometry, goldMaterial);
goldPile.position.y = 0.7;
goldPile.castShadow = true;
treasureGroup.add(goldPile);

// Gold coins around
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

const treasure = {
    mesh: treasureGroup,
    radius: 1
};

// Function to count alive goblins
function countAliveGoblins() {
    let count = 0;
    if (goblin.alive) count++;
    if (bridgeGoblin.alive) count++;
    additionalGoblins.forEach(g => { if (g.alive) count++; });
    return count;
}

// Explosion particles
const explosions = [];

function createExplosion(x, y, z) {
    playExplosionSound();
    
    const particles = [];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.1, 3, 3);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: Math.random() > 0.5 ? 0xFF4500 : 0xFFFF00 
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(x, y, z);
        
        // Random velocity
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

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.mesh.position.add(exp.velocity);
        exp.velocity.y -= 0.02; // gravity
        exp.life--;
        
        if (exp.life <= 0) {
            scene.remove(exp.mesh);
            explosions.splice(i, 1);
        }
    }
}

// Bullets
const bullets = [];

function shootBullet() {
    if (gameWon) return;
    
    if (ammo <= 0) {
        playEmptyGunSound();
        return;
    }
    
    playShootSound();
    
    const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const bulletMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bulletMesh.position.copy(playerGroup.position);
    bulletMesh.position.y = 1;
    bulletMesh.castShadow = true;
    scene.add(bulletMesh);
    
    // Shoot in the direction player is facing
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
    
    // Keyboard rotation with left/right arrows or A/D
    if (keys.ArrowLeft || keys.a) {
        player.rotation += player.rotationSpeed;
    }
    if (keys.ArrowRight || keys.d) {
        player.rotation -= player.rotationSpeed;
    }
    
    // Set player mesh rotation
    playerGroup.rotation.y = player.rotation;
    
    // Forward/backward movement based on rotation (Arrow keys or W/S)
    const isMoving = keys.ArrowUp || keys.ArrowDown || keys.w || keys.s;
    if (keys.ArrowUp || keys.w) {
        playerGroup.position.x += Math.sin(player.rotation) * player.speed;
        playerGroup.position.z += Math.cos(player.rotation) * player.speed;
    }
    if (keys.ArrowDown || keys.s) {
        playerGroup.position.x -= Math.sin(player.rotation) * player.speed;
        playerGroup.position.z -= Math.cos(player.rotation) * player.speed;
    }
    
    const isStuck = checkCollisions(prevPos);
    
    // Play bike tire sound when moving and not stuck
    if (isMoving && !isStuck) {
        startBikeSound();
    } else {
        stopBikeSound();
    }
    
    // Update player height based on terrain
    const terrainHeight = getTerrainHeight(playerGroup.position.x, playerGroup.position.z);
    playerGroup.position.y = terrainHeight + 0.1;
    
    // Camera follow with rotation
    const cameraDistance = 8;
    const cameraHeight = 4;
    
    // Calculate camera offset based on player rotation (behind the player)
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
        
        // Remove if out of bounds
        if (Math.abs(bullet.mesh.position.x) > 150 || Math.abs(bullet.mesh.position.z) > 150) {
            scene.remove(bullet.mesh);
            bullets.splice(i, 1);
            continue;
        }
        
        let bulletHit = false;
        
        // Check collision with goblin
        if (goblin.alive) {
            const dist = bullet.mesh.position.distanceTo(goblinGroup.position);
            if (dist < goblin.radius + bullet.radius) {
                goblin.health--;
                createExplosion(goblinGroup.position.x, goblinGroup.position.y + 1, goblinGroup.position.z);
                if (goblin.health <= 0) {
                    goblin.alive = false;
                    // Make goblin lie down instead of disappearing
                    goblinGroup.rotation.z = Math.PI / 2;
                    goblinGroup.position.y = getTerrainHeight(goblinGroup.position.x, goblinGroup.position.z) + 0.5;
                }
                bulletHit = true;
            }
        }
        
        // Check collision with bridge goblin
        if (!bulletHit && bridgeGoblin.alive) {
            const dist = bullet.mesh.position.distanceTo(bridgeGoblinGroup.position);
            if (dist < bridgeGoblin.radius + bullet.radius) {
                bridgeGoblin.health--;
                createExplosion(bridgeGoblinGroup.position.x, bridgeGoblinGroup.position.y + 1, bridgeGoblinGroup.position.z);
                if (bridgeGoblin.health <= 0) {
                    bridgeGoblin.alive = false;
                    bridgeGoblinGroup.rotation.z = Math.PI / 2;
                    bridgeGoblinGroup.position.y = 1.0;
                }
                bulletHit = true;
            }
        }
        
        // Check collision with additional goblins
        if (!bulletHit) {
            for (let j = 0; j < additionalGoblins.length; j++) {
                const addGob = additionalGoblins[j];
                if (addGob.alive) {
                    const dist = bullet.mesh.position.distanceTo(addGob.mesh.position);
                    if (dist < addGob.radius + bullet.radius) {
                        addGob.health--;
                        createExplosion(addGob.mesh.position.x, addGob.mesh.position.y + 1, addGob.mesh.position.z);
                        if (addGob.health <= 0) {
                            addGob.alive = false;
                            addGob.mesh.rotation.z = Math.PI / 2;
                            const terrainH = getTerrainHeight(addGob.mesh.position.x, addGob.mesh.position.z);
                            addGob.mesh.position.y = terrainH + 0.5;
                        }
                        bulletHit = true;
                        break;
                    }
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
                    playBulletImpactSound();
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
                
                // Check if bullet is within hill radius and at appropriate height
                if (dist < hill.radius) {
                    const hillHeight = getTerrainHeight(bullet.mesh.position.x, bullet.mesh.position.z);
                    if (bullet.mesh.position.y <= hillHeight + 1) {
                        playBulletImpactSound();
                        bulletHit = true;
                        break;
                    }
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
                    playBulletImpactSound();
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
                
                // Check if bullet is within hill radius and at appropriate height
                if (dist < hill.radius) {
                    const hillHeight = getTerrainHeight(bullet.mesh.position.x, bullet.mesh.position.z);
                    if (bullet.mesh.position.y <= hillHeight + 1) {
                        playBulletImpactSound();
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
            // Face the direction of movement
            goblinGroup.rotation.y = Math.atan2(directionX, directionZ);
        }
    } else {
        // Otherwise patrol
        goblinGroup.position.x += goblin.speed * goblin.direction;
        // Face patrol direction
        goblinGroup.rotation.y = goblin.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        
        if (goblinGroup.position.x <= goblin.patrolLeft) {
            goblin.direction = 1;
        } else if (goblinGroup.position.x >= goblin.patrolRight) {
            goblin.direction = -1;
        }
    }
    
    // Update goblin height based on terrain
    const terrainHeight = getTerrainHeight(goblinGroup.position.x, goblinGroup.position.z);
    goblinGroup.position.y = terrainHeight + 0.1;
    
    // Check if goblin stepped on trap
    traps.forEach(trap => {
        const distToTrap = new THREE.Vector2(
            goblinGroup.position.x - trap.mesh.position.x,
            goblinGroup.position.z - trap.mesh.position.z
        ).length();
        if (distToTrap < trap.radius) {
            goblin.alive = false;
            goblinGroup.rotation.z = Math.PI / 2;
            goblinGroup.position.y = terrainHeight + 0.5;
            createExplosion(goblinGroup.position.x, goblinGroup.position.y + 1, goblinGroup.position.z);
        }
    });
    
    // Check collision with player
    const dist = playerGroup.position.distanceTo(goblinGroup.position);
    if (dist < 1.5) {
        gameDead = true;
        stopBackgroundMusic();
        playDeathSound();
    }
}

function updateBridgeGoblin() {
    if (!bridgeGoblin.alive || gameWon) return;
    
    // Check distance to player
    const distToPlayer = Math.sqrt(
        Math.pow(playerGroup.position.x - bridgeGoblinGroup.position.x, 2) + 
        Math.pow(playerGroup.position.z - bridgeGoblinGroup.position.z, 2)
    );
    
    // If player is within 25 units, chase them
    if (distToPlayer < 25) {
        const directionX = playerGroup.position.x - bridgeGoblinGroup.position.x;
        const directionZ = playerGroup.position.z - bridgeGoblinGroup.position.z;
        const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
        
        if (length > 0) {
            bridgeGoblinGroup.position.x += (directionX / length) * bridgeGoblin.speed;
            bridgeGoblinGroup.position.z += (directionZ / length) * bridgeGoblin.speed;
            // Face the direction of movement
            bridgeGoblinGroup.rotation.y = Math.atan2(directionX, directionZ);
        }
    } else {
        // Otherwise patrol the bridge (only x-axis)
        bridgeGoblinGroup.position.x += bridgeGoblin.speed * bridgeGoblin.direction;
        // Face patrol direction
        bridgeGoblinGroup.rotation.y = bridgeGoblin.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        
        if (bridgeGoblinGroup.position.x <= bridgeGoblin.patrolLeft) {
            bridgeGoblin.direction = 1;
        } else if (bridgeGoblinGroup.position.x >= bridgeGoblin.patrolRight) {
            bridgeGoblin.direction = -1;
        }
    }
    
    // Check if goblin stepped on trap
    traps.forEach(trap => {
        const distToTrap = new THREE.Vector2(
            bridgeGoblinGroup.position.x - trap.mesh.position.x,
            bridgeGoblinGroup.position.z - trap.mesh.position.z
        ).length();
        if (distToTrap < trap.radius) {
            bridgeGoblin.alive = false;
            bridgeGoblinGroup.rotation.z = Math.PI / 2;
            bridgeGoblinGroup.position.y = 1.0;
            createExplosion(bridgeGoblinGroup.position.x, bridgeGoblinGroup.position.y + 1, bridgeGoblinGroup.position.z);
        }
    });
    
    // Check collision with player
    const dist = playerGroup.position.distanceTo(bridgeGoblinGroup.position);
    if (dist < 1.5) {
        gameDead = true;
        stopBackgroundMusic();
        playDeathSound();
    }
}

// Update additional goblins
function updateAdditionalGoblins() {
    additionalGoblins.forEach(gob => {
        if (!gob.alive || gameWon) return;
        
        // Check distance to player
        const distToPlayer = Math.sqrt(
            Math.pow(playerGroup.position.x - gob.mesh.position.x, 2) + 
            Math.pow(playerGroup.position.z - gob.mesh.position.z, 2)
        );
        
        // If player is within 25 units, chase them
        if (distToPlayer < 25) {
            const directionX = playerGroup.position.x - gob.mesh.position.x;
            const directionZ = playerGroup.position.z - gob.mesh.position.z;
            const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
            
            if (length > 0) {
                gob.mesh.position.x += (directionX / length) * gob.speed;
                gob.mesh.position.z += (directionZ / length) * gob.speed;
                // Face the direction of movement
                gob.mesh.rotation.y = Math.atan2(directionX, directionZ);
            }
        } else {
            // Otherwise patrol
            gob.mesh.position.x += gob.speed * gob.direction;
            // Face patrol direction
            gob.mesh.rotation.y = gob.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
            
            if (gob.mesh.position.x <= gob.patrolLeft) {
                gob.direction = 1;
            } else if (gob.mesh.position.x >= gob.patrolRight) {
                gob.direction = -1;
            }
        }
        
        // Update height based on terrain
        const terrainHeight = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
        gob.mesh.position.y = terrainHeight + 0.1;
        
        // Check if goblin stepped on trap
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
        
        // Check collision with player
        const dist = playerGroup.position.distanceTo(gob.mesh.position);
        if (dist < 1.5) {
            gameDead = true;
            stopBackgroundMusic();
            playDeathSound();
        }
    });
}

function checkCollisions(prevPos) {
    let isStuck = false;
    
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
    
    // Play stuck sound if player hit something (throttled to once per second)
    if (isStuck) {
        const now = Date.now();
        if (!checkCollisions.lastStuckSound || now - checkCollisions.lastStuckSound > 1000) {
            playStuckSound();
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
                playCollectSound();
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
                playCollectSound();
            }
        }
    });
    
    // Check if player stepped on trap
    traps.forEach(trap => {
        const distToTrap = new THREE.Vector2(
            playerGroup.position.x - trap.mesh.position.x,
            playerGroup.position.z - trap.mesh.position.z
        ).length();
        if (distToTrap < trap.radius) {
            gameDead = true;
            stopBackgroundMusic();
            playDeathSound();
        }
    });
    
    // Check if player is at bridge with all materials to repair it
    if (!bridgeRepaired && materialsCollected >= materialsNeeded) {
        const distToBridge = new THREE.Vector2(
            playerGroup.position.x,
            playerGroup.position.z
        ).length();
        if (distToBridge < 5) {
            bridgeRepaired = true;
            bridgeGroup.visible = true;
            brokenBridgeGroup.visible = false;
            playRepairSound();
        }
    }
    
    // River and bridge
    if (playerGroup.position.z > riverObj.minZ && playerGroup.position.z < riverObj.maxZ) {
        // In river area - check if on bridge
        const onBridge = bridgeRepaired &&
                        playerGroup.position.x > bridge.minX && 
                        playerGroup.position.x < bridge.maxX &&
                        playerGroup.position.z > bridge.minZ && 
                        playerGroup.position.z < bridge.maxZ;
        if (!onBridge) {
            playerGroup.position.copy(prevPos);
        }
    }
    
    // Treasure
    const allGoblinsDead = !goblin.alive && !bridgeGoblin.alive && 
                          additionalGoblins.every(g => !g.alive);
    if (allGoblinsDead) {
        const dist = playerGroup.position.distanceTo(treasureGroup.position);
        if (dist < treasure.radius + 0.8) {
            gameWon = true;
            playWinSound();
        }
    }
    
    return isStuck;
}

function resetGame() {
    gameDead = false;
    
    // Restart background music
    startBackgroundMusic();
    
    playerGroup.position.set(0, getTerrainHeight(0, 40), 40);
    player.rotation = 0;
    playerGroup.rotation.y = 0;
    goblin.alive = true;
    goblinGroup.visible = true;
    goblinGroup.rotation.z = 0;
    goblin.health = goblin.maxHealth;
    const goblinTerrainHeight = getTerrainHeight(25, -50);
    goblinGroup.position.set(25, goblinTerrainHeight, -50);
    goblin.direction = 1;
    bridgeGoblin.alive = true;
    bridgeGoblinGroup.visible = true;
    bridgeGoblinGroup.rotation.z = 0;
    bridgeGoblin.health = bridgeGoblin.maxHealth;
    bridgeGoblinGroup.position.set(0, 0.5, 0);
    bridgeGoblin.direction = 1;
    
    // Reset additional goblins
    additionalGoblins.forEach((gob, idx) => {
        gob.alive = true;
        gob.mesh.visible = true;
        gob.mesh.rotation.z = 0;
        gob.health = gob.maxHealth;
        gob.direction = 1;
        // Reset to original position
        const terrainH = getTerrainHeight(gob.mesh.position.x, gob.mesh.position.z);
        gob.mesh.position.y = terrainH;
    });
    
    bullets.forEach(b => scene.remove(b.mesh));
    bullets.length = 0;
    
    // Clear explosions
    explosions.forEach(exp => scene.remove(exp.mesh));
    explosions.length = 0;
    
    ammo = maxAmmo;
    gameWon = false;
    bridgeRepaired = false;
    materialsCollected = 0;
    bridgeGroup.visible = false;
    brokenBridgeGroup.visible = true;
    
    // Reset materials
    materials.forEach(material => {
        material.collected = false;
        material.mesh.visible = true;
    });
    
    // Reset ammo pickups
    ammoPickups.forEach(pickup => {
        pickup.collected = false;
        pickup.mesh.visible = true;
    });
    
    camera.position.set(0, 15, 20);
}

// HUD
const hudCanvas = document.createElement('canvas');
hudCanvas.width = 800;
hudCanvas.height = 600;
hudCanvas.style.position = 'absolute';
hudCanvas.style.top = '0';
hudCanvas.style.left = '0';
hudCanvas.style.width = '800px';
hudCanvas.style.height = '600px';
hudCanvas.style.pointerEvents = 'none';
container.appendChild(hudCanvas);
const hudCtx = hudCanvas.getContext('2d');

function drawHUD() {
    hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    
    // Ammo counter
    hudCtx.fillStyle = '#000';
    hudCtx.font = 'bold 18px Arial';
    hudCtx.fillText(`Schüsse: ${ammo}/${maxAmmo}`, 10, 25);
    
    // Goblin counter
    const aliveGoblins = countAliveGoblins();
    hudCtx.fillText(`Kobolde: ${aliveGoblins}`, 10, 50);
    
    // Materials counter
    hudCtx.fillText(`Material: ${materialsCollected}/${materialsNeeded}`, 10, 75);
    
    // Bridge repair status
    if (!bridgeRepaired && materialsCollected >= materialsNeeded) {
        hudCtx.fillStyle = '#FFD700';
        hudCtx.fillText('Gehe zur Brücke um sie zu reparieren!', 10, 100);
        hudCtx.fillStyle = '#000';
    } else if (bridgeRepaired) {
        hudCtx.fillStyle = '#00FF00';
        hudCtx.fillText('Brücke repariert!', 10, 100);
        hudCtx.fillStyle = '#000';
    }
    
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
    
    // Death screen
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

// Game loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!gameDead) {
        updatePlayer();
        updateBullets();
        updateExplosions();
        updateGoblin();
        updateBridgeGoblin();
        updateAdditionalGoblins();
        updateGoblinProximitySound();
    }
    
    drawHUD();
    
    renderer.render(scene, camera);
}

animate();
