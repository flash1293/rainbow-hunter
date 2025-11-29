// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Spieler (Mädchen auf Fahrrad)
const player = {
    x: 50,
    y: 500,
    width: 40,
    height: 60,
    speed: 3,
    direction: 'right'
};

// Spielstatus
let gameWon = false;

// Schüsse
let bullets = [];
const bulletSpeed = 5;
let ammo = 3;
const maxAmmo = 3;

// Kobold (bewacht den Schatz)
const goblin = {
    x: 650,
    y: 50,
    width: 35,
    height: 45,
    speed: 2,
    direction: 1,
    alive: true,
    patrolLeft: 550,
    patrolRight: 750
};

// Schatz
const treasure = {
    x: 700,
    y: 30,
    width: 40,
    height: 40
};

// Regenbogen-Daten
const rainbow = {
    x: 680,
    y: -20,
    width: 100,
    height: 120
};

// Tastatureingaben
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// Spielwelt Elemente (Bäume, Blumen, etc.)
const worldObjects = [
    { type: 'tree', x: 150, y: 100, width: 60, height: 80 },
    { type: 'tree', x: 650, y: 120, width: 60, height: 80 },
    { type: 'tree', x: 400, y: 80, width: 60, height: 80 },
    { type: 'flower', x: 100, y: 150, width: 20, height: 20 },
    { type: 'flower', x: 200, y: 180, width: 20, height: 20 },
    { type: 'flower', x: 600, y: 160, width: 20, height: 20 },
    { type: 'flower', x: 700, y: 140, width: 20, height: 20 }
];

// Parcour-Hindernisse
const obstacles = [
    // Steine im Weg (unten) - mit Lücken
    { type: 'rock', x: 150, y: 450, width: 40, height: 30 },
    { type: 'rock', x: 250, y: 430, width: 35, height: 28 },
    // Lücke hier bei ca. x: 300-400 für Durchgang zur Brücke
    { type: 'rock', x: 500, y: 440, width: 38, height: 32 },
    { type: 'rock', x: 600, y: 420, width: 42, height: 30 },
    
    // Fluss (horizontal)
    { type: 'river', x: 0, y: 280, width: 800, height: 80 },
    
    // Brücke über den Fluss
    { type: 'bridge', x: 350, y: 270, width: 100, height: 100 },
    
    // Steine auf der anderen Seite (oben) - mit klarem Weg
    { type: 'rock', x: 80, y: 200, width: 42, height: 32 },
    { type: 'rock', x: 200, y: 180, width: 38, height: 30 },
    // Freier Bereich bei x: 250-520 für Bewegungsfreiheit
    { type: 'rock', x: 520, y: 190, width: 45, height: 35 },
    { type: 'rock', x: 650, y: 210, width: 40, height: 30 },
    
    // Fallen (rote Löcher/Gruben) - neu positioniert
    { type: 'trap', x: 100, y: 520, width: 50, height: 50 },
    { type: 'trap', x: 650, y: 500, width: 50, height: 50 },
    { type: 'trap', x: 750, y: 430, width: 50, height: 50 },
    { type: 'trap', x: 150, y: 240, width: 50, height: 50 },
    { type: 'trap', x: 600, y: 250, width: 50, height: 50 },
    { type: 'trap', x: 280, y: 120, width: 50, height: 50 }
];

// Startposition
const startPosition = { x: 50, y: 500 };

// Startposition für Kollisionserkennung speichern
let previousX = player.x;
let previousY = player.y;

// Event Listener
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
    
    // Schießen mit Leertaste
    if (e.key === ' ' || e.key === 'Space') {
        shootBullet();
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Spieler bewegen
function updatePlayer() {
    if (gameWon) return;
    
    // Vorherige Position speichern
    previousX = player.x;
    previousY = player.y;
    
    if (keys.ArrowUp && player.y > 0) {
        player.y -= player.speed;
        player.direction = 'up';
    }
    if (keys.ArrowDown && player.y < canvas.height - player.height) {
        player.y += player.speed;
        player.direction = 'down';
    }
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
        player.direction = 'left';
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
        player.direction = 'right';
    }
    
    // Kollisionserkennung
    checkCollisions();
}

// Schuss abfeuern
function shootBullet() {
    if (gameWon || ammo <= 0) return;
    
    const bullet = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        width: 8,
        height: 8,
        direction: player.direction
    };
    bullets.push(bullet);
    ammo--;
}

// Schüsse aktualisieren
function updateBullets() {
    bullets = bullets.filter(bullet => {
        // Bewegung basierend auf Richtung
        switch (bullet.direction) {
            case 'up':
                bullet.y -= bulletSpeed;
                break;
            case 'down':
                bullet.y += bulletSpeed;
                break;
            case 'left':
                bullet.x -= bulletSpeed;
                break;
            case 'right':
                bullet.x += bulletSpeed;
                break;
        }
        
        // Entfernen wenn außerhalb
        if (bullet.x < 0 || bullet.x > canvas.width || 
            bullet.y < 0 || bullet.y > canvas.height) {
            return false;
        }
        
        // Kollision mit Kobold prüfen
        if (goblin.alive && isColliding(bullet, goblin)) {
            goblin.alive = false;
            return false;
        }
        
        return true;
    });
}

// Kobold aktualisieren
function updateGoblin() {
    if (!goblin.alive || gameWon) return;
    
    // Patrouillenbewegung
    goblin.x += goblin.speed * goblin.direction;
    
    if (goblin.x <= goblin.patrolLeft) {
        goblin.direction = 1;
    } else if (goblin.x >= goblin.patrolRight) {
        goblin.direction = -1;
    }
    
    // Kollision mit Spieler prüfen
    if (isColliding(goblin, player)) {
        resetGame();
    }
}

// Kollisionserkennung
function checkCollisions() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'rock' && isColliding(player, obstacle)) {
            // Bei Stein-Kollision: zurück zur vorherigen Position
            player.x = previousX;
            player.y = previousY;
        } else if (obstacle.type === 'trap' && isColliding(player, obstacle)) {
            // Bei Fallen-Kollision: Spiel von vorn starten
            resetGame();
        } else if (obstacle.type === 'river') {
            // Prüfen ob Spieler im Fluss ist
            if (isColliding(player, obstacle)) {
                // Prüfen ob Spieler auf der Brücke ist
                let onBridge = false;
                obstacles.forEach(obj => {
                    if (obj.type === 'bridge' && isColliding(player, obj)) {
                        onBridge = true;
                    }
                });
                
                // Wenn nicht auf Brücke, zurück zur vorherigen Position
                if (!onBridge) {
                    player.x = previousX;
                    player.y = previousY;
                }
            }
        }
    });
    
    // Schatz-Kollision prüfen
    if (!goblin.alive && isColliding(player, treasure)) {
        gameWon = true;
    }
}

// Spiel zurücksetzen
function resetGame() {
    player.x = startPosition.x;
    player.y = startPosition.y;
    previousX = player.x;
    previousY = player.y;
    goblin.alive = true;
    goblin.x = 650;
    goblin.direction = 1;
    bullets = [];
    ammo = maxAmmo;
    gameWon = false;
}

// Hilfsfunktion für Kollisionserkennung
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Baum zeichnen
function drawTree(x, y, width, height) {
    // Baumstamm
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + width/3, y + height/2, width/3, height/2);
    
    // Baumkrone
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/3, width/2, 0, Math.PI * 2);
    ctx.fill();
}

// Blume zeichnen
function drawFlower(x, y, width) {
    // Stängel
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + width);
    ctx.lineTo(x + width/2, y + width/2);
    ctx.stroke();
    
    // Blütenblätter
    ctx.fillStyle = '#FF69B4';
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        const petalX = x + width/2 + Math.cos(angle) * width/3;
        const petalY = y + width/2 + Math.sin(angle) * width/3;
        ctx.beginPath();
        ctx.arc(petalX, petalY, width/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Blütenmitte
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + width/2, y + width/2, width/5, 0, Math.PI * 2);
    ctx.fill();
}

// Stein zeichnen
function drawRock(x, y, width, height) {
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Schatten/Details
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.ellipse(x + width/2 + 5, y + height/2 + 3, width/4, height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Umriss
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
    ctx.stroke();
}

// Fluss zeichnen
function drawRiver(x, y, width, height) {
    // Wasser
    ctx.fillStyle = '#4682B4';
    ctx.fillRect(x, y, width, height);
    
    // Wellen-Effekt
    ctx.strokeStyle = '#5F9ECD';
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.arc(x + i + 20, y + height/3, 10, 0, Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + i + 20, y + 2*height/3, 10, 0, Math.PI, true);
        ctx.stroke();
    }
}

// Brücke zeichnen
function drawBridge(x, y, width, height) {
    // Brückenboden
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y + height/3, width, height/3);
    
    // Geländer
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    
    // Oberes Geländer
    ctx.beginPath();
    ctx.moveTo(x, y + height/3);
    ctx.lineTo(x + width, y + height/3);
    ctx.stroke();
    
    // Unteres Geländer
    ctx.beginPath();
    ctx.moveTo(x, y + 2*height/3);
    ctx.lineTo(x + width, y + 2*height/3);
    ctx.stroke();
    
    // Pfosten
    for (let i = 0; i <= width; i += width/4) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + height/3);
        ctx.lineTo(x + i, y + 2*height/3);
        ctx.stroke();
    }
    
    // Bretter
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 15) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + height/3);
        ctx.lineTo(x + i, y + 2*height/3);
        ctx.stroke();
    }
}

// Falle zeichnen
function drawTrap(x, y, width, height) {
    // Dunkler Gras-Ton (kaum sichtbar)
    ctx.fillStyle = '#7a9a7a';
    ctx.fillRect(x, y, width, height);
    
    // Noch dunkleres Zentrum
    ctx.fillStyle = '#6a8a6a';
    ctx.fillRect(x + 8, y + 8, width - 16, height - 16);
    
    // Sehr subtile dunkle Flecken
    ctx.fillStyle = '#5a7a5a';
    for (let i = 0; i < 3; i++) {
        const offsetX = Math.random() * (width - 20) + 10;
        const offsetY = Math.random() * (height - 20) + 10;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Regenbogen zeichnen
function drawRainbow(x, y, width, height) {
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
    const stripeHeight = height / colors.length;
    
    ctx.save();
    colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        const radius = height - (i * stripeHeight);
        // Verhindere negativen Radius
        if (radius > 0 && radius - stripeHeight > 0) {
            ctx.arc(x + width/2, y + height, radius, Math.PI, 0);
            ctx.arc(x + width/2, y + height, radius - stripeHeight, 0, Math.PI, true);
            ctx.closePath();
            ctx.fill();
        }
    });
    ctx.restore();
}

// Schatz zeichnen
function drawTreasure(x, y, width, height) {
    // Truhe
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x, y + height/2, width, height/2);
    
    // Deckel
    ctx.fillStyle = '#654321';
    ctx.fillRect(x, y, width, height/2);
    
    // Gold im Inneren (wenn Kobold tot)
    if (!goblin.alive) {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, width/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Glitzer
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(x + width/3, y + height/3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 2*width/3, y + height/3, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Schloss
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + width/2 - 5, y + height/2, 10, 12);
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, 5, Math.PI, 0, true);
    ctx.fill();
}

// Kobold zeichnen
function drawGoblin(x, y, width, height) {
    if (!goblin.alive) return;
    
    // Körper (dunkler und zerrissene Kleidung)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + width/4, y + height/2, width/2, height/2);
    
    // Zerrissene Details
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(x + width/3, y + height/1.8, 4, 8);
    ctx.fillRect(x + width/2, y + height/1.6, 3, 10);
    
    // Kopf (grünlich-grau, unheimlich)
    ctx.fillStyle = '#3d5c3d';
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/3, width/3, height/2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Narben
    ctx.strokeStyle = '#2a402a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width/4, y + height/4);
    ctx.lineTo(x + width/3, y + height/3.5);
    ctx.stroke();
    
    // Sehr spitze, große Ohren
    ctx.fillStyle = '#3d5c3d';
    ctx.beginPath();
    ctx.moveTo(x + width/6, y + height/3);
    ctx.lineTo(x - width/8, y + height/6);
    ctx.lineTo(x + width/5, y + height/2.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 5*width/6, y + height/3);
    ctx.lineTo(x + width + width/8, y + height/6);
    ctx.lineTo(x + 4*width/5, y + height/2.5);
    ctx.closePath();
    ctx.fill();
    
    // Glühende böse Augen (größer und leuchtend)
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x + width/3, y + height/3.2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 2*width/3, y + height/3.2, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupillen (schwarz, schmal)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.fillRect(x + width/3 - 1, y + height/3.2 - 3, 2, 6);
    ctx.fillRect(x + 2*width/3 - 1, y + height/3.2 - 3, 2, 6);
    
    // Gruseliger Mund mit Zähnen
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2.3, width/4, 0.2, Math.PI - 0.2);
    ctx.lineTo(x + width/2 - width/4, y + height/2.3);
    ctx.closePath();
    ctx.fill();
    
    // Spitze Zähne
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
        const toothX = x + width/3 + (i * width/8);
        ctx.beginPath();
        ctx.moveTo(toothX, y + height/2.3);
        ctx.lineTo(toothX + 3, y + height/2.1);
        ctx.lineTo(toothX + 6, y + height/2.3);
        ctx.closePath();
        ctx.fill();
    }
    
    // Klauenartige Hände
    ctx.strokeStyle = '#3d5c3d';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Linke Hand
    ctx.beginPath();
    ctx.moveTo(x + width/4, y + height/1.8);
    ctx.lineTo(x + width/8, y + height/1.5);
    ctx.stroke();
    
    // Krallen
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + width/8, y + height/1.5);
        ctx.lineTo(x + width/12 - i*2, y + height/1.6 + i*2);
        ctx.stroke();
    }
    
    // Rechte Hand
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 3*width/4, y + height/1.8);
    ctx.lineTo(x + 7*width/8, y + height/1.5);
    ctx.stroke();
    
    // Krallen
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 7*width/8, y + height/1.5);
        ctx.lineTo(x + 9*width/10 + i*2, y + height/1.6 + i*2);
        ctx.stroke();
    }
}

// Kugel zeichnen
function drawBullet(x, y, width, height) {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
    ctx.fill();
}

// Gewinn-Pokal zeichnen
function drawTrophy() {
    const x = canvas.width / 2 - 50;
    const y = canvas.height / 2 - 100;
    
    // Hintergrund
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
    ctx.fillRect(x - 50, y - 50, 200, 200);
    
    // Pokal
    ctx.fillStyle = '#FFD700';
    
    // Kelch
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 80);
    ctx.lineTo(x + 30, y + 20);
    ctx.lineTo(x + 70, y + 20);
    ctx.lineTo(x + 80, y + 80);
    ctx.closePath();
    ctx.fill();
    
    // Henkel links
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x + 15, y + 40, 15, Math.PI/2, Math.PI * 1.5);
    ctx.stroke();
    
    // Henkel rechts
    ctx.beginPath();
    ctx.arc(x + 85, y + 40, 15, Math.PI * 1.5, Math.PI/2);
    ctx.stroke();
    
    // Sockel
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x + 40, y + 80, 20, 10);
    ctx.fillRect(x + 35, y + 90, 30, 8);
    
    // Text
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GEWONNEN!', canvas.width / 2, y + 130);
    ctx.font = '16px Arial';
    ctx.fillText('Drücke R zum Neustart', canvas.width / 2, y + 155);
}

// Mädchen auf Fahrrad zeichnen
function drawPlayer() {
    ctx.save();
    
    // Fahrrad - Räder
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#666';
    
    const wheelRadius = 12;
    const frontWheelX = player.x + 30;
    const backWheelX = player.x + 10;
    const wheelY = player.y + player.height - 10;
    
    // Hinterrad
    ctx.beginPath();
    ctx.arc(backWheelX, wheelY, wheelRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Vorderrad
    ctx.beginPath();
    ctx.arc(frontWheelX, wheelY, wheelRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Fahrradrahmen
    ctx.strokeStyle = '#FF6B9D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(backWheelX, wheelY);
    ctx.lineTo(player.x + 15, player.y + 30);
    ctx.lineTo(frontWheelX, wheelY);
    ctx.lineTo(player.x + 15, player.y + 30);
    ctx.lineTo(player.x + 20, player.y + 15);
    ctx.stroke();
    
    // Mädchen - Körper
    ctx.fillStyle = '#FFE4C4';
    ctx.beginPath();
    ctx.arc(player.x + 20, player.y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Haare
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(player.x + 20, player.y + 8, 9, 0, Math.PI);
    ctx.fill();
    
    // Oberkörper
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(player.x + 15, player.y + 18, 10, 15);
    
    // Arme
    ctx.strokeStyle = '#FFE4C4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.x + 17, player.y + 22);
    ctx.lineTo(player.x + 22, player.y + 28);
    ctx.stroke();
    
    // Beine
    ctx.beginPath();
    ctx.moveTo(player.x + 18, player.y + 33);
    ctx.lineTo(player.x + 12, player.y + 45);
    ctx.stroke();
    
    ctx.restore();
}

// Spielwelt zeichnen
function drawWorld() {
    // Hintergrund (Gras)
    ctx.fillStyle = '#a8d5a8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Regenbogen zeichnen (Hintergrund)
    drawRainbow(rainbow.x, rainbow.y, rainbow.width, rainbow.height);
    
    // Zuerst Fallen zeichnen (ganz im Hintergrund)
    obstacles.forEach(obj => {
        if (obj.type === 'trap') {
            drawTrap(obj.x, obj.y, obj.width, obj.height);
        }
    });
    
    // Dann Fluss und Brücke zeichnen
    obstacles.forEach(obj => {
        if (obj.type === 'river') {
            drawRiver(obj.x, obj.y, obj.width, obj.height);
        }
    });
    
    obstacles.forEach(obj => {
        if (obj.type === 'bridge') {
            drawBridge(obj.x, obj.y, obj.width, obj.height);
        }
    });
    
    // Weltobjeckte zeichnen
    worldObjects.forEach(obj => {
        if (obj.type === 'tree') {
            drawTree(obj.x, obj.y, obj.width, obj.height);
        } else if (obj.type === 'flower') {
            drawFlower(obj.x, obj.y, obj.width);
        }
    });
    
    // Steine zeichnen (im Vordergrund)
    obstacles.forEach(obj => {
        if (obj.type === 'rock') {
            drawRock(obj.x, obj.y, obj.width, obj.height);
        }
    });
    
    // Schatz und Kobold zeichnen
    drawTreasure(treasure.x, treasure.y, treasure.width, treasure.height);
    drawGoblin(goblin.x, goblin.y, goblin.width, goblin.height);
    
    // Schüsse zeichnen
    bullets.forEach(bullet => {
        drawBullet(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Munitionsanzeige
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Schüsse: ${ammo}/${maxAmmo}`, 10, 25);
}

// Hauptspiel-Loop
function gameLoop() {
    updatePlayer();
    updateBullets();
    updateGoblin();
    
    // Alles zeichnen
    drawWorld();
    drawPlayer();
    
    // Gewinn-Bildschirm
    if (gameWon) {
        drawTrophy();
    }
    
    requestAnimationFrame(gameLoop);
}

// Neustart-Taste
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        if (gameWon) {
            resetGame();
        }
    }
});

// Spiel starten
gameLoop();
