// Terrain and environment utilities

// Current level hills (set by main.js when level loads)
let currentLevelHills = null;

function setCurrentLevelHills(hills) {
    currentLevelHills = hills;
}

// ============================================
// PROCEDURAL TEXTURE GENERATION
// ============================================

// Generate a grass/ground texture
function generateGrassTexture(THREE, iceTheme = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (iceTheme) {
        // Ice/snow base color
        ctx.fillStyle = '#c8dde8';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add snow/ice variation
        for (let i = 0; i < 8000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const brightness = 0.85 + Math.random() * 0.15;
            const r = Math.floor(200 * brightness);
            const g = Math.floor(220 * brightness);
            const b = Math.floor(240 * brightness);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 2, 2);
        }
        
        // Add icy patches
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = 10 + Math.random() * 30;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(180, 200, 230, 0.4)');
            gradient.addColorStop(1, 'rgba(180, 200, 230, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        
        // Add brighter snow patches
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = 15 + Math.random() * 25;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
    } else {
        // Base green color
        ctx.fillStyle = '#4a8f3c';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add noise and grass variation
        for (let i = 0; i < 8000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const brightness = 0.7 + Math.random() * 0.6;
            const r = Math.floor(60 * brightness);
            const g = Math.floor(120 + Math.random() * 40);
            const b = Math.floor(40 * brightness);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 2, 2);
        }
        
        // Add darker patches
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = 10 + Math.random() * 30;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(30, 80, 20, 0.3)');
            gradient.addColorStop(1, 'rgba(30, 80, 20, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
        
        // Add lighter patches
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = 15 + Math.random() * 25;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(120, 180, 80, 0.25)');
            gradient.addColorStop(1, 'rgba(120, 180, 80, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
}

// Generate a sand texture for desert levels
function generateSandTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base sandy color
    ctx.fillStyle = '#d4b86a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add sand grain variation
    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const brightness = 0.85 + Math.random() * 0.3;
        const r = Math.floor(210 * brightness);
        const g = Math.floor(180 * brightness);
        const b = Math.floor(100 * brightness);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1.5, 1.5);
    }
    
    // Add darker sand patches (shadows of dunes)
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 20 + Math.random() * 40;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(180, 150, 80, 0.3)');
        gradient.addColorStop(1, 'rgba(180, 150, 80, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add lighter sand patches (sun highlights)
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 15 + Math.random() * 35;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 240, 180, 0.25)');
        gradient.addColorStop(1, 'rgba(255, 240, 180, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add subtle wind ripple lines
    ctx.strokeStyle = 'rgba(200, 170, 90, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 80; i++) {
        const y = Math.random() * 512;
        const startX = Math.random() * 200;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.bezierCurveTo(
            startX + 100, y + 5,
            startX + 200, y - 5,
            startX + 300, y
        );
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
}

// Generate a candy/sweets texture for the Candy Kingdom level
function generateCandyTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base pink frosting color
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add candy sprinkles
    const sprinkleColors = ['#FF69B4', '#87CEEB', '#FFD700', '#98FB98', '#DDA0DD', '#FF6347', '#00CED1'];
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const color = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
        const length = 5 + Math.random() * 10;
        const angle = Math.random() * Math.PI;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-length/2, -1.5, length, 3, 1.5);
        ctx.fill();
        ctx.restore();
    }
    
    // Add frosting swirl patches (lighter pink)
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 15 + Math.random() * 35;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 200, 210, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 200, 210, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add white icing drizzle lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(
            x + 40, y + (Math.random() - 0.5) * 30,
            x + 80, y + (Math.random() - 0.5) * 30,
            x + 120, y + (Math.random() - 0.5) * 40
        );
        ctx.stroke();
    }
    
    // Add sugar sparkles
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 1 + Math.random() * 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add candy hearts scattered around
    ctx.fillStyle = '#FF1493';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 4 + Math.random() * 6;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5);
        ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3);
        ctx.fill();
        ctx.restore();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
}

// Generate a graveyard/halloween texture for the spooky level
function generateGraveyardTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base earthy color - dead grass and dirt (lighter for visibility)
    ctx.fillStyle = '#4a4a3f';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add dead grass/dirt variation
    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const brightness = 0.7 + Math.random() * 0.3;
        const r = Math.floor(80 * brightness);
        const g = Math.floor(75 * brightness);
        const b = Math.floor(55 * brightness);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Add darker muddy patches
    for (let i = 0; i < 35; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 15 + Math.random() * 40;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(40, 38, 25, 0.35)');
        gradient.addColorStop(1, 'rgba(40, 38, 25, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add some sickly green patches (moss/mold)
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 10 + Math.random() * 25;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(50, 70, 30, 0.25)');
        gradient.addColorStop(1, 'rgba(50, 70, 30, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add eerie purple fog patches
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 20 + Math.random() * 35;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(60, 30, 70, 0.15)');
        gradient.addColorStop(1, 'rgba(60, 30, 70, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add some scattered bones/debris
    ctx.fillStyle = 'rgba(200, 190, 170, 0.3)';
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const length = 3 + Math.random() * 8;
        const angle = Math.random() * Math.PI;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillRect(-length/2, -1, length, 2);
        ctx.restore();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
}

// Generate old English brick wall texture for graveyard
function generateBrickWallTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base mortar color (weathered gray)
    ctx.fillStyle = '#3a3a38';
    ctx.fillRect(0, 0, 256, 256);
    
    const brickWidth = 32;
    const brickHeight = 16;
    const mortarWidth = 3;
    
    // Draw brick rows
    for (let row = 0; row < Math.ceil(256 / brickHeight); row++) {
        const offsetX = (row % 2) * (brickWidth / 2); // Staggered pattern
        
        for (let col = -1; col < Math.ceil(256 / brickWidth) + 1; col++) {
            const x = col * brickWidth + offsetX;
            const y = row * brickHeight;
            
            // Vary brick color (old weathered red/brown bricks)
            const baseR = 80 + Math.random() * 40;
            const baseG = 50 + Math.random() * 25;
            const baseB = 40 + Math.random() * 20;
            
            // Some bricks are darker (soot/age)
            const darken = Math.random() > 0.7 ? 0.6 : 1;
            const r = Math.floor(baseR * darken);
            const g = Math.floor(baseG * darken);
            const b = Math.floor(baseB * darken);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(
                x + mortarWidth/2, 
                y + mortarWidth/2, 
                brickWidth - mortarWidth, 
                brickHeight - mortarWidth
            );
            
            // Add some texture/variation within brick
            for (let i = 0; i < 5; i++) {
                const px = x + mortarWidth + Math.random() * (brickWidth - mortarWidth * 2);
                const py = y + mortarWidth + Math.random() * (brickHeight - mortarWidth * 2);
                const shade = Math.random() > 0.5 ? 20 : -20;
                ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r + shade))}, ${Math.max(0, Math.min(255, g + shade))}, ${Math.max(0, Math.min(255, b + shade))})`;
                ctx.fillRect(px, py, 3, 2);
            }
        }
    }
    
    // Add moss/age patches
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = 8 + Math.random() * 15;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(40, 60, 35, 0.4)');
        gradient.addColorStop(1, 'rgba(40, 60, 35, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add cracks
    ctx.strokeStyle = 'rgba(20, 20, 18, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        let x = Math.random() * 256;
        let y = Math.random() * 256;
        ctx.moveTo(x, y);
        for (let j = 0; j < 3; j++) {
            x += (Math.random() - 0.5) * 20;
            y += Math.random() * 15;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
}

// Generate volcanic rock texture for lava caves
function generateRockTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base rock color - medium brown for cave floor
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add rock grain variation
    for (let i = 0; i < 12000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const brightness = 0.7 + Math.random() * 0.3;
        const r = Math.floor(120 * brightness);
        const g = Math.floor(95 * brightness);
        const b = Math.floor(75 * brightness);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Add darker cracks
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.7)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60);
        ctx.stroke();
    }
    
    // Add reddish glow spots (heat from lava below)
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 20 + Math.random() * 40;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(180, 60, 0, 0.35)');
        gradient.addColorStop(1, 'rgba(180, 60, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add lighter rock patches
    for (let i = 0; i < 35; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 15 + Math.random() * 30;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(140, 110, 80, 0.35)');
        gradient.addColorStop(1, 'rgba(140, 110, 80, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
}

// Generate a tree bark texture
function generateBarkTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base brown color
    ctx.fillStyle = '#5c3d2e';
    ctx.fillRect(0, 0, 128, 256);
    
    // Vertical bark lines
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 128;
        const width = 2 + Math.random() * 4;
        const darkness = 0.6 + Math.random() * 0.4;
        ctx.fillStyle = `rgba(40, 25, 15, ${darkness})`;
        ctx.fillRect(x, 0, width, 256);
    }
    
    // Horizontal cracks
    for (let i = 0; i < 30; i++) {
        const y = Math.random() * 256;
        const x = Math.random() * 60;
        const width = 20 + Math.random() * 40;
        ctx.strokeStyle = `rgba(30, 20, 10, ${0.3 + Math.random() * 0.4})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + (Math.random() - 0.5) * 10);
        ctx.stroke();
    }
    
    // Add noise
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 256;
        const brightness = 0.5 + Math.random() * 0.5;
        ctx.fillStyle = `rgba(${60 * brightness}, ${35 * brightness}, ${20 * brightness}, 0.5)`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Generate a foliage/leaves texture
function generateFoliageTexture(THREE, iceTheme = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (iceTheme) {
        // Frosted blue-gray base
        ctx.fillStyle = '#6688aa';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add frosted leaf clusters
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = 5 + Math.random() * 15;
            const hue = 200 + Math.random() * 30; // Blue range
            const lightness = 45 + Math.random() * 25;
            ctx.fillStyle = `hsl(${hue}, 25%, ${lightness}%)`;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add frost highlights
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = 3 + Math.random() * 8;
            ctx.fillStyle = `rgba(200, 220, 255, ${0.3 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add icy shadows
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = 8 + Math.random() * 15;
            ctx.fillStyle = `rgba(60, 80, 120, ${0.2 + Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // Base green
        ctx.fillStyle = '#2d6b22';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add leaf clusters
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = 5 + Math.random() * 15;
            const hue = 80 + Math.random() * 40; // Green range
            const lightness = 25 + Math.random() * 25;
            ctx.fillStyle = `hsl(${hue}, 60%, ${lightness}%)`;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add highlights
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = 3 + Math.random() * 8;
            ctx.fillStyle = `rgba(150, 220, 100, ${0.3 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add shadows
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = 8 + Math.random() * 15;
            ctx.fillStyle = `rgba(20, 60, 10, ${0.2 + Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate a mountain/rock texture
function generateMountainTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base gray-brown
    ctx.fillStyle = '#6b5d4d';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add rocky noise
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const gray = 60 + Math.random() * 80;
        const brown = gray * (0.8 + Math.random() * 0.3);
        ctx.fillStyle = `rgb(${gray}, ${gray * 0.85}, ${brown * 0.7})`;
        ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    
    // Add cracks/crevices
    for (let i = 0; i < 25; i++) {
        const startX = Math.random() * 256;
        const startY = Math.random() * 256;
        ctx.strokeStyle = `rgba(40, 35, 30, ${0.4 + Math.random() * 0.4})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let x = startX, y = startY;
        for (let j = 0; j < 5; j++) {
            x += (Math.random() - 0.5) * 40;
            y += 10 + Math.random() * 20;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Add lighter streaks (mineral deposits)
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const width = 20 + Math.random() * 40;
        const height = 5 + Math.random() * 10;
        ctx.fillStyle = `rgba(140, 130, 115, ${0.3 + Math.random() * 0.3})`;
        ctx.fillRect(x, y, width, height);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Generate snow texture for mountain caps
function generateSnowTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Base white
    ctx.fillStyle = '#f8f8ff';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add subtle shadows and variation
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const brightness = 230 + Math.random() * 25;
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 5})`;
        ctx.fillRect(x, y, 3, 3);
    }
    
    // Add blue tints (reflected sky)
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const radius = 5 + Math.random() * 10;
        ctx.fillStyle = 'rgba(200, 220, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate sky texture/cubemap-like gradient
function generateSkyTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Gradient from light blue at horizon to deeper blue at top
    const gradient = ctx.createLinearGradient(0, 512, 0, 0);
    gradient.addColorStop(0, '#b8d4e8');    // Light blue/white at horizon
    gradient.addColorStop(0.3, '#87CEEB');  // Sky blue
    gradient.addColorStop(0.6, '#5ba3d0');  // Medium blue
    gradient.addColorStop(1, '#3a7cb8');    // Deeper blue at top
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add subtle clouds
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * 512;
        const y = 50 + Math.random() * 250;
        const width = 40 + Math.random() * 100;
        const height = 15 + Math.random() * 30;
        
        const cloudGradient = ctx.createRadialGradient(x, y, 0, x, y, width);
        cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        cloudGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = cloudGradient;
        ctx.fillRect(x - width, y - height, width * 2, height * 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
}

// Generate goblin skin texture (scaly, greenish)
function generateGoblinSkinTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Base dark green
    ctx.fillStyle = '#2d4a2d';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add scale pattern
    for (let y = 0; y < 128; y += 8) {
        for (let x = 0; x < 128; x += 8) {
            const offsetX = (y % 16 === 0) ? 4 : 0;
            const brightness = 0.8 + Math.random() * 0.4;
            const g = Math.floor(60 * brightness);
            ctx.fillStyle = `rgb(${g * 0.5}, ${g}, ${g * 0.4})`;
            ctx.beginPath();
            ctx.ellipse(x + offsetX + 4, y + 4, 3.5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Add warts/bumps
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const radius = 2 + Math.random() * 3;
        ctx.fillStyle = `rgba(60, 90, 50, ${0.5 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add darker areas
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const radius = 5 + Math.random() * 10;
        ctx.fillStyle = 'rgba(20, 35, 20, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Generate water texture
function generateWaterTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base blue color with gradient
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#1a6fab');
    gradient.addColorStop(0.5, '#1e7dc4');
    gradient.addColorStop(1, '#1560a0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add foam/wave patterns - more and smaller
    for (let i = 0; i < 120; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = 2 + Math.random() * 5;
        const opacity = 0.1 + Math.random() * 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add darker water variations - more detail
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = 3 + Math.random() * 10;
        const opacity = 0.05 + Math.random() * 0.2;
        ctx.fillStyle = `rgba(10, 40, 80, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add small ripple details - much more
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = 0.5 + Math.random() * 1.5;
        const opacity = 0.2 + Math.random() * 0.4;
        ctx.fillStyle = `rgba(200, 230, 255, ${opacity})`;
        ctx.fillRect(x, y, size, size * 0.3);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
}

// Generate goblin armor/clothing texture (dark, tattered)
function generateGoblinArmorTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Base dark gray
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add leather-like texture
    for (let i = 0; i < 800; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const brightness = 15 + Math.random() * 25;
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Add stitching lines
    ctx.strokeStyle = 'rgba(50, 40, 30, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
        const y = 15 + i * 15;
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(0, y);
        ctx.lineTo(128, y + (Math.random() - 0.5) * 5);
        ctx.stroke();
    }
    
    // Add wear/tear marks
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        ctx.strokeStyle = 'rgba(40, 30, 25, 0.5)';
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 20, y + Math.random() * 15);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate wizard robe texture with magical patterns
function generateWizardRobeTexture(THREE, iceTheme = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base deep purple or icy blue
    const baseColor = iceTheme ? '#1a3a5a' : '#2a1a4a';
    const accentColor = iceTheme ? '#00FFFF' : '#FF00FF';
    const secondaryColor = iceTheme ? '#88CCFF' : '#9400D3';
    
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add fabric texture variation
    for (let i = 0; i < 1500; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const brightness = 0.7 + Math.random() * 0.4;
        if (iceTheme) {
            const r = Math.floor(30 * brightness);
            const g = Math.floor(60 * brightness);
            const b = Math.floor(100 * brightness);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        } else {
            const r = Math.floor(50 * brightness);
            const g = Math.floor(30 * brightness);
            const b = Math.floor(80 * brightness);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        }
        ctx.fillRect(x, y, 2, 3);
    }
    
    // Draw magical runes/symbols scattered across the robe
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 4;
    
    // Draw arcane circles
    for (let i = 0; i < 6; i++) {
        const cx = 40 + Math.random() * 180;
        const cy = 40 + Math.random() * 180;
        const radius = 8 + Math.random() * 15;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Cross lines through circle
        ctx.beginPath();
        ctx.moveTo(cx - radius, cy);
        ctx.lineTo(cx + radius, cy);
        ctx.moveTo(cx, cy - radius);
        ctx.lineTo(cx, cy + radius);
        ctx.stroke();
    }
    
    // Draw star patterns
    for (let i = 0; i < 12; i++) {
        const cx = Math.random() * 256;
        const cy = Math.random() * 256;
        const size = 4 + Math.random() * 8;
        
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            const angle = (j * Math.PI * 2 / 5) - Math.PI / 2;
            const x = cx + Math.cos(angle) * size;
            const y = cy + Math.sin(angle) * size;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // Draw flowing magical lines
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 2;
    
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        let x = Math.random() * 256;
        let y = Math.random() * 256;
        ctx.moveTo(x, y);
        
        for (let j = 0; j < 5; j++) {
            x += (Math.random() - 0.5) * 60;
            y += (Math.random() - 0.5) * 60;
            ctx.quadraticCurveTo(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 20,
                x, y
            );
        }
        ctx.stroke();
    }
    
    // Draw vertical trim lines (robe edges)
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 6;
    ctx.setLineDash([8, 4]);
    
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(20, 256);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(236, 0);
    ctx.lineTo(236, 256);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Add glowing particles/sparkles
    ctx.shadowBlur = 8;
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const size = 1 + Math.random() * 2;
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.shadowBlur = 0;
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Generate giant skin texture (rough, brownish)
function generateGiantSkinTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base brown-gray
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add rough stone-like texture
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const brightness = 0.6 + Math.random() * 0.5;
        const r = Math.floor(70 * brightness);
        const g = Math.floor(55 * brightness);
        const b = Math.floor(40 * brightness);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 3 + Math.random() * 4, 3 + Math.random() * 4);
    }
    
    // Add cracks/wrinkles
    for (let i = 0; i < 30; i++) {
        const startX = Math.random() * 256;
        const startY = Math.random() * 256;
        ctx.strokeStyle = `rgba(30, 20, 15, ${0.3 + Math.random() * 0.4})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let x = startX, y = startY;
        for (let j = 0; j < 4; j++) {
            x += (Math.random() - 0.5) * 30;
            y += (Math.random() - 0.5) * 30;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Add scars
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        ctx.strokeStyle = 'rgba(80, 50, 40, 0.5)';
        ctx.lineWidth = 2 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 40, y + Math.random() * 30);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate lava giant skin texture (molten rock with glowing cracks)
function generateGiantSkinTextureLava(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base dark volcanic rock
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add rough volcanic texture
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const brightness = 0.5 + Math.random() * 0.5;
        const r = Math.floor(50 * brightness);
        const g = Math.floor(30 * brightness);
        const b = Math.floor(20 * brightness);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 3 + Math.random() * 4, 3 + Math.random() * 4);
    }
    
    // Add glowing lava cracks
    for (let i = 0; i < 25; i++) {
        const startX = Math.random() * 256;
        const startY = Math.random() * 256;
        ctx.strokeStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${0.6 + Math.random() * 0.4})`;
        ctx.lineWidth = 2 + Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let x = startX, y = startY;
        for (let j = 0; j < 5; j++) {
            x += (Math.random() - 0.5) * 40;
            y += (Math.random() - 0.5) * 40;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Add glowing spots
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = 5 + Math.random() * 15;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 150, 0, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 80, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate lava giant armor texture (obsidian with lava veins)
function generateGiantArmorTextureLava(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Base obsidian black
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add obsidian shimmer
    for (let i = 0; i < 500; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const brightness = 0.3 + Math.random() * 0.3;
        ctx.fillStyle = `rgba(${60 * brightness}, ${50 * brightness}, ${70 * brightness}, 0.8)`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Add glowing lava seams between plates
    for (let i = 0; i < 8; i++) {
        const y = i * 16;
        ctx.strokeStyle = `rgba(255, ${80 + Math.random() * 80}, 0, 0.8)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 128; x += 10) {
            ctx.lineTo(x, y + (Math.random() - 0.5) * 4);
        }
        ctx.stroke();
    }
    
    // Add hot spots at edges
    for (let i = 0; i < 12; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const radius = 3 + Math.random() * 6;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 200, 50, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate giant armor texture (heavy metal plates)
function generateGiantArmorTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Base dark metal
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add metallic sheen gradient
    const gradient = ctx.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, 'rgba(60, 60, 60, 0.5)');
    gradient.addColorStop(0.5, 'rgba(30, 30, 30, 0.3)');
    gradient.addColorStop(1, 'rgba(50, 50, 50, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    // Add scratches
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        ctx.strokeStyle = `rgba(80, 80, 80, ${0.3 + Math.random() * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
        ctx.stroke();
    }
    
    // Add rivets
    for (let x = 10; x < 128; x += 25) {
        for (let y = 10; y < 128; y += 25) {
            ctx.fillStyle = '#3a3a3a';
            ctx.beginPath();
            ctx.arc(x + (Math.random() - 0.5) * 5, y + (Math.random() - 0.5) * 5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#555555';
            ctx.beginPath();
            ctx.arc(x + (Math.random() - 0.5) * 5 - 1, y + (Math.random() - 0.5) * 5 - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate player skin texture (smooth, human-like)
function generatePlayerSkinTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Base skin tone
    ctx.fillStyle = '#ffe4c4';
    ctx.fillRect(0, 0, 64, 64);
    
    // Add subtle variation
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const variation = (Math.random() - 0.5) * 15;
        const r = Math.min(255, Math.max(200, 255 + variation));
        const g = Math.min(240, Math.max(180, 228 + variation));
        const b = Math.min(220, Math.max(160, 196 + variation));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Add subtle blush areas
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const radius = 5 + Math.random() * 8;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 200, 180, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 200, 180, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate player clothing texture (fabric-like)
function generatePlayerClothingTexture(THREE, baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Parse base color and convert to RGB
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;
    
    // Fill with base color
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 64, 64);
    
    // Add fabric weave pattern
    for (let y = 0; y < 64; y += 2) {
        for (let x = 0; x < 64; x += 2) {
            const variation = (Math.random() - 0.5) * 20;
            const newR = Math.min(255, Math.max(0, r + variation));
            const newG = Math.min(255, Math.max(0, g + variation));
            const newB = Math.min(255, Math.max(0, b + variation));
            ctx.fillStyle = `rgb(${newR}, ${newG}, ${newB})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Add subtle fold shadows
    for (let i = 0; i < 6; i++) {
        const x = Math.random() * 64;
        const height = 64;
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.05 + Math.random() * 0.08})`;
        ctx.lineWidth = 2 + Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (Math.random() - 0.5) * 10, height);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate hair texture
function generateHairTexture(THREE, baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Parse base color
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;
    
    // Fill with base color
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 64, 64);
    
    // Add hair strand pattern
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 64;
        const variation = (Math.random() - 0.5) * 40;
        const newR = Math.min(255, Math.max(0, r + variation));
        const newG = Math.min(255, Math.max(0, g + variation));
        const newB = Math.min(255, Math.max(0, b + variation));
        ctx.strokeStyle = `rgb(${newR}, ${newG}, ${newB})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(
            x + (Math.random() - 0.5) * 10, 20,
            x + (Math.random() - 0.5) * 10, 40,
            x + (Math.random() - 0.5) * 15, 64
        );
        ctx.stroke();
    }
    
    // Add shine highlights
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 30;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.15})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 8, y + 10 + Math.random() * 10);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate dragon scale texture (deep red with scale pattern, or icy blue)
function generateDragonScaleTexture(THREE, iceTheme = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (iceTheme) {
        // Base icy blue
        ctx.fillStyle = '#1E4D6B';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add scale pattern
        for (let row = 0; row < 32; row++) {
            for (let col = 0; col < 32; col++) {
                const offsetX = (row % 2 === 0) ? 4 : 0;
                const x = col * 8 + offsetX;
                const y = row * 8;
                const brightness = 0.7 + Math.random() * 0.4;
                const r = Math.floor(50 * brightness);
                const g = Math.floor(120 * brightness);
                const b = Math.floor(160 * brightness);
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.beginPath();
                ctx.ellipse(x + 4, y + 4, 3.5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Add frost highlight on each scale
                ctx.fillStyle = `rgba(180, 220, 255, 0.4)`;
                ctx.beginPath();
                ctx.ellipse(x + 3, y + 3, 1.5, 1, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Add lighter frost vein patterns
        for (let i = 0; i < 15; i++) {
            const startX = Math.random() * 256;
            const startY = Math.random() * 256;
            ctx.strokeStyle = `rgba(200, 230, 255, 0.3)`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            let x = startX, y = startY;
            for (let j = 0; j < 5; j++) {
                x += (Math.random() - 0.5) * 40;
                y += (Math.random() - 0.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    } else {
        // Base dark red
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add scale pattern
        for (let row = 0; row < 32; row++) {
            for (let col = 0; col < 32; col++) {
                const offsetX = (row % 2 === 0) ? 4 : 0;
                const x = col * 8 + offsetX;
                const y = row * 8;
                const brightness = 0.7 + Math.random() * 0.4;
                const r = Math.floor(139 * brightness);
                const g = Math.floor(10 * brightness);
                const b = Math.floor(10 * brightness);
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.beginPath();
                ctx.ellipse(x + 4, y + 4, 3.5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Add highlight on each scale
                ctx.fillStyle = `rgba(180, 50, 50, 0.3)`;
                ctx.beginPath();
                ctx.ellipse(x + 3, y + 3, 1.5, 1, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Add darker vein patterns
        for (let i = 0; i < 15; i++) {
            const startX = Math.random() * 256;
            const startY = Math.random() * 256;
            ctx.strokeStyle = `rgba(50, 0, 0, 0.4)`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            let x = startX, y = startY;
            for (let j = 0; j < 5; j++) {
                x += (Math.random() - 0.5) * 40;
                y += (Math.random() - 0.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate lava dragon scale texture (black obsidian with glowing orange cracks)
function generateDragonScaleTextureLava(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base obsidian black
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add scale pattern - dark obsidian with orange glow edges
    for (let row = 0; row < 32; row++) {
        for (let col = 0; col < 32; col++) {
            const offsetX = (row % 2 === 0) ? 4 : 0;
            const x = col * 8 + offsetX;
            const y = row * 8;
            const brightness = 0.4 + Math.random() * 0.3;
            const r = Math.floor(40 * brightness);
            const g = Math.floor(25 * brightness);
            const b = Math.floor(15 * brightness);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            ctx.ellipse(x + 4, y + 4, 3.5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glowing orange edge on each scale
            ctx.strokeStyle = `rgba(255, ${100 + Math.random() * 80}, 0, ${0.3 + Math.random() * 0.3})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.ellipse(x + 4, y + 4, 3.5, 3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Add glowing lava vein patterns
    for (let i = 0; i < 20; i++) {
        const startX = Math.random() * 256;
        const startY = Math.random() * 256;
        ctx.strokeStyle = `rgba(255, ${80 + Math.random() * 100}, 0, ${0.5 + Math.random() * 0.4})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let x = startX, y = startY;
        for (let j = 0; j < 5; j++) {
            x += (Math.random() - 0.5) * 40;
            y += (Math.random() - 0.5) * 40;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Add hot spots
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = 8 + Math.random() * 15;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate water/sea dragon scale texture (deep teal with shimmering scales)
function generateDragonScaleTextureWater(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base deep teal/ocean blue
    ctx.fillStyle = '#0a4a5c';
    ctx.fillRect(0, 0, 256, 256);

    // Add scale pattern - aquatic with iridescent shimmer
    for (let row = 0; row < 32; row++) {
        for (let col = 0; col < 32; col++) {
            const offsetX = (row % 2 === 0) ? 4 : 0;
            const x = col * 8 + offsetX;
            const y = row * 8;
            const brightness = 0.6 + Math.random() * 0.5;
            // Teal/cyan scales
            const r = Math.floor(20 * brightness);
            const g = Math.floor(140 * brightness);
            const b = Math.floor(160 * brightness);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            ctx.ellipse(x + 4, y + 4, 3.5, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Add iridescent shimmer highlight on each scale
            const shimmerHue = Math.random() > 0.5 ? '120, 200, 255' : '180, 255, 220';
            ctx.fillStyle = `rgba(${shimmerHue}, 0.35)`;
            ctx.beginPath();
            ctx.ellipse(x + 3, y + 2.5, 1.8, 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Add bioluminescent vein patterns
    for (let i = 0; i < 12; i++) {
        const startX = Math.random() * 256;
        const startY = Math.random() * 256;
        ctx.strokeStyle = `rgba(100, 255, 220, ${0.3 + Math.random() * 0.3})`;
        ctx.lineWidth = 1 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let lx = startX, ly = startY;
        for (let j = 0; j < 5; j++) {
            lx += (Math.random() - 0.5) * 35;
            ly += (Math.random() - 0.5) * 35;
            ctx.lineTo(lx, ly);
        }
        ctx.stroke();
    }

    // Add glowing spots (like deep sea fish)
    for (let i = 0; i < 10; i++) {
        const sx = Math.random() * 256;
        const sy = Math.random() * 256;
        const radius = 5 + Math.random() * 10;
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        gradient.addColorStop(0, 'rgba(100, 255, 200, 0.5)');
        gradient.addColorStop(0.5, 'rgba(50, 200, 180, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 150, 150, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate candy dragon scale texture (pink and blue swirls with sprinkles)
function generateDragonScaleTextureCandy(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base cotton candy pink
    ctx.fillStyle = '#FF69B4';
    ctx.fillRect(0, 0, 256, 256);

    // Add swirly scale pattern - candy colored
    for (let row = 0; row < 32; row++) {
        for (let col = 0; col < 32; col++) {
            const offsetX = (row % 2 === 0) ? 4 : 0;
            const x = col * 8 + offsetX;
            const y = row * 8;
            const brightness = 0.8 + Math.random() * 0.3;
            // Alternating pink and blue scales
            const isPink = (row + col) % 2 === 0;
            const r = isPink ? Math.floor(255 * brightness) : Math.floor(135 * brightness);
            const g = isPink ? Math.floor(105 * brightness) : Math.floor(206 * brightness);
            const b = isPink ? Math.floor(180 * brightness) : Math.floor(235 * brightness);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            ctx.ellipse(x + 4, y + 4, 3.5, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Add sparkle highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(x + 3, y + 2.5, 1.5, 1, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Add colorful sprinkles
    const sprinkleColors = ['#FF6347', '#FFD700', '#98FB98', '#DDA0DD', '#00CED1', '#FF1493'];
    for (let i = 0; i < 80; i++) {
        const sx = Math.random() * 256;
        const sy = Math.random() * 256;
        const color = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
        const angle = Math.random() * Math.PI;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-3, -1, 6, 2, 1);
        ctx.fill();
        ctx.restore();
    }

    // Add sugar sparkle glows
    for (let i = 0; i < 15; i++) {
        const sx = Math.random() * 256;
        const sy = Math.random() * 256;
        const radius = 8 + Math.random() * 12;
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 150, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate crystal dragon scale texture (faceted amethyst with inner glow)
function generateDragonScaleTextureCrystal(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base deep amethyst purple
    ctx.fillStyle = '#2a0a4a';
    ctx.fillRect(0, 0, 256, 256);

    // Add crystalline faceted scale pattern
    for (let row = 0; row < 32; row++) {
        for (let col = 0; col < 32; col++) {
            const offsetX = (row % 2 === 0) ? 4 : 0;
            const x = col * 8 + offsetX;
            const y = row * 8;
            const brightness = 0.5 + Math.random() * 0.6;
            // Alternate between purple, pink, and cyan crystal facets
            const colorType = (row + col) % 3;
            let r, g, b;
            if (colorType === 0) {
                // Amethyst purple
                r = Math.floor(138 * brightness);
                g = Math.floor(43 * brightness);
                b = Math.floor(226 * brightness);
            } else if (colorType === 1) {
                // Crystal pink
                r = Math.floor(255 * brightness);
                g = Math.floor(68 * brightness);
                b = Math.floor(170 * brightness);
            } else {
                // Cyan crystal
                r = Math.floor(68 * brightness);
                g = Math.floor(170 * brightness);
                b = Math.floor(255 * brightness);
            }

            // Draw hexagonal faceted scale
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.beginPath();
            const cx = x + 4, cy = y + 4;
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;
                const px = cx + Math.cos(angle) * 3.5;
                const py = cy + Math.sin(angle) * 3;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            // Add inner glow/refraction highlight
            ctx.fillStyle = `rgba(255, 200, 255, ${0.3 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.ellipse(x + 3, y + 2.5, 1.5, 1, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Add glowing crystal vein patterns
    const veinColors = ['rgba(255, 68, 170, 0.5)', 'rgba(68, 170, 255, 0.5)', 'rgba(170, 68, 255, 0.5)'];
    for (let i = 0; i < 15; i++) {
        const startX = Math.random() * 256;
        const startY = Math.random() * 256;
        ctx.strokeStyle = veinColors[Math.floor(Math.random() * veinColors.length)];
        ctx.lineWidth = 1.5 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let lx = startX, ly = startY;
        for (let j = 0; j < 5; j++) {
            lx += (Math.random() - 0.5) * 35;
            ly += (Math.random() - 0.5) * 35;
            ctx.lineTo(lx, ly);
        }
        ctx.stroke();
    }

    // Add bright gem-like glow spots
    for (let i = 0; i < 20; i++) {
        const sx = Math.random() * 256;
        const sy = Math.random() * 256;
        const radius = 6 + Math.random() * 12;
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        const glowColors = [[255, 100, 200], [100, 200, 255], [200, 100, 255]];
        const glow = glowColors[Math.floor(Math.random() * glowColors.length)];
        gradient.addColorStop(0, `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, 0.6)`);
        gradient.addColorStop(0.5, `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, 0.2)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate dragon belly texture (golden/amber)
function generateDragonBellyTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Base golden color
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add horizontal striping pattern (like reptile belly)
    for (let y = 0; y < 128; y += 6) {
        const brightness = 0.8 + Math.random() * 0.3;
        ctx.fillStyle = `rgba(${Math.floor(200 * brightness)}, ${Math.floor(150 * brightness)}, ${Math.floor(30 * brightness)}, 0.5)`;
        ctx.fillRect(0, y, 128, 4);
    }
    
    // Add subtle scratches
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        ctx.strokeStyle = `rgba(150, 100, 20, 0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 20, y + Math.random() * 10);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate Reaper cloak texture (dark, tattered, ghostly)
function generateReaperCloakTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base black cloak color
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add fabric fold shadows
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * 256;
        const y1 = Math.random() * 50;
        const y2 = y1 + 150 + Math.random() * 100;
        const width = 5 + Math.random() * 15;
        
        const gradient = ctx.createLinearGradient(x, y1, x + width * 0.3, y2);
        gradient.addColorStop(0, 'rgba(30, 30, 40, 0.4)');
        gradient.addColorStop(0.5, 'rgba(10, 10, 20, 0.6)');
        gradient.addColorStop(1, 'rgba(30, 30, 40, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y1, width, y2 - y1);
    }
    
    // Add ethereal purple/green glow patches
    for (let i = 0; i < 25; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = 15 + Math.random() * 30;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const isGreen = Math.random() > 0.5;
        if (isGreen) {
            gradient.addColorStop(0, 'rgba(0, 80, 40, 0.15)');
            gradient.addColorStop(1, 'rgba(0, 50, 30, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(60, 0, 80, 0.15)');
            gradient.addColorStop(1, 'rgba(40, 0, 60, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Add tattered edges / holes (darker voids)
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * 256;
        const y = 180 + Math.random() * 76; // Bottom part of cloak
        const w = 3 + Math.random() * 10;
        const h = 10 + Math.random() * 30;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add ghostly wisps
    ctx.strokeStyle = 'rgba(100, 80, 120, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(
            x + 20, y - 10,
            x + 40, y + 20,
            x + 60, y - 5
        );
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate reaper eye texture (glowing sinister red)
function generateReaperEyeTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Dark void background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 64);
    
    // Glowing red core
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.15, '#FF4444');
    gradient.addColorStop(0.4, '#CC0000');
    gradient.addColorStop(0.7, '#660000');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Sinister pupil/slit
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(32, 32, 3, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer hellfire glow
    ctx.strokeStyle = 'rgba(255, 100, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(32, 32, 26, 0, Math.PI * 2);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate fireball texture (fiery plasma, or icy blue)
function generateFireballTexture(THREE, iceTheme = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (iceTheme) {
        // Create radial gradient for ice core
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.2, '#E0FFFF');
        gradient.addColorStop(0.4, '#87CEEB');
        gradient.addColorStop(0.6, '#4169E1');
        gradient.addColorStop(0.8, '#0000CD');
        gradient.addColorStop(1, '#00008B');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        // Add ice shard tendrils
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const startR = 10 + Math.random() * 10;
            const endR = 25 + Math.random() * 10;
            const startX = 32 + Math.cos(angle) * startR;
            const startY = 32 + Math.sin(angle) * startR;
            const endX = 32 + Math.cos(angle) * endR;
            const endY = 32 + Math.sin(angle) * endR;
            
            const iceGrad = ctx.createLinearGradient(startX, startY, endX, endY);
            iceGrad.addColorStop(0, 'rgba(200, 240, 255, 0.8)');
            iceGrad.addColorStop(1, 'rgba(100, 150, 255, 0)');
            ctx.strokeStyle = iceGrad;
            ctx.lineWidth = 2 + Math.random() * 3;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    } else {
        // Create radial gradient for fire core
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.2, '#FFFF00');
        gradient.addColorStop(0.4, '#FFA500');
        gradient.addColorStop(0.6, '#FF4500');
        gradient.addColorStop(0.8, '#FF0000');
        gradient.addColorStop(1, '#8B0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        // Add flame tendrils
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const startR = 10 + Math.random() * 10;
            const endR = 25 + Math.random() * 10;
            const startX = 32 + Math.cos(angle) * startR;
            const startY = 32 + Math.sin(angle) * startR;
            const endX = 32 + Math.cos(angle) * endR;
            const endY = 32 + Math.sin(angle) * endR;
            
            const flameGrad = ctx.createLinearGradient(startX, startY, endX, endY);
            flameGrad.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
            flameGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.strokeStyle = flameGrad;
            ctx.lineWidth = 2 + Math.random() * 3;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate explosion particle texture - SUPER BRIGHT (or icy blue)
function generateExplosionTexture(THREE, iceTheme = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (iceTheme) {
        // Icy blue explosion
        const outerGlow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        outerGlow.addColorStop(0, '#FFFFFF');
        outerGlow.addColorStop(0.1, '#E0FFFF');
        outerGlow.addColorStop(0.25, '#87CEEB');
        outerGlow.addColorStop(0.4, '#6495ED');
        outerGlow.addColorStop(0.6, '#4169E1');
        outerGlow.addColorStop(0.8, '#0000CD');
        outerGlow.addColorStop(1, 'rgba(0, 0, 139, 0)');
        ctx.fillStyle = outerGlow;
        ctx.fillRect(0, 0, 64, 64);
        
        // Inner bright ice core
        const innerGlow = ctx.createRadialGradient(32, 32, 0, 32, 32, 12);
        innerGlow.addColorStop(0, '#FFFFFF');
        innerGlow.addColorStop(0.5, '#E0FFFF');
        innerGlow.addColorStop(1, '#87CEEB');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(32, 32, 16, 0, Math.PI * 2);
        ctx.fill();
        
        // Add ice crystal sparks
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 8 + Math.random() * 20;
            const x = 32 + Math.cos(angle) * r;
            const y = 32 + Math.sin(angle) * r;
            
            const sparkGrad = ctx.createRadialGradient(x, y, 0, x, y, 3);
            sparkGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            sparkGrad.addColorStop(0.5, 'rgba(200, 230, 255, 0.8)');
            sparkGrad.addColorStop(1, 'rgba(100, 180, 255, 0)');
            ctx.fillStyle = sparkGrad;
            ctx.beginPath();
            ctx.arc(x, y, 3 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // Multiple layered gradients for intense glow
        // Outer glow layer
        const outerGlow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        outerGlow.addColorStop(0, '#FFFFFF');
        outerGlow.addColorStop(0.1, '#FFFFAA');
        outerGlow.addColorStop(0.25, '#FFFF00');
        outerGlow.addColorStop(0.4, '#FFAA00');
        outerGlow.addColorStop(0.6, '#FF6600');
        outerGlow.addColorStop(0.8, '#FF2200');
        outerGlow.addColorStop(1, 'rgba(200, 0, 0, 0)');
        ctx.fillStyle = outerGlow;
        ctx.fillRect(0, 0, 64, 64);
        
        // Inner super bright core
        const innerGlow = ctx.createRadialGradient(32, 32, 0, 32, 32, 12);
        innerGlow.addColorStop(0, '#FFFFFF');
        innerGlow.addColorStop(0.5, '#FFFFCC');
        innerGlow.addColorStop(1, '#FFFF00');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(32, 32, 16, 0, Math.PI * 2);
        ctx.fill();
        
        // Add bright sparks
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 8 + Math.random() * 20;
            const x = 32 + Math.cos(angle) * r;
            const y = 32 + Math.sin(angle) * r;
            
            const sparkGrad = ctx.createRadialGradient(x, y, 0, x, y, 3);
            sparkGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            sparkGrad.addColorStop(0.5, 'rgba(255, 255, 100, 0.8)');
            sparkGrad.addColorStop(1, 'rgba(255, 200, 0, 0)');
            ctx.fillStyle = sparkGrad;
            ctx.beginPath();
            ctx.arc(x, y, 3 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate smoke texture - soft gray billowing cloud
function generateSmokeTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Soft radial gradient for smoke puff
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(80, 80, 80, 0.6)');
    gradient.addColorStop(0.3, 'rgba(60, 60, 60, 0.4)');
    gradient.addColorStop(0.6, 'rgba(50, 50, 50, 0.2)');
    gradient.addColorStop(1, 'rgba(40, 40, 40, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    // Add some noise/variation
    for (let i = 0; i < 8; i++) {
        const x = 20 + Math.random() * 24;
        const y = 20 + Math.random() * 24;
        const r = 5 + Math.random() * 10;
        const puffGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        puffGrad.addColorStop(0, 'rgba(70, 70, 70, 0.3)');
        puffGrad.addColorStop(1, 'rgba(50, 50, 50, 0)');
        ctx.fillStyle = puffGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate fog wisp texture - spooky purple-gray wisp for graveyard
function generateFogWispTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Soft radial gradient for fog wisp with purple tint
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(100, 80, 120, 0.5)');
    gradient.addColorStop(0.3, 'rgba(80, 70, 100, 0.35)');
    gradient.addColorStop(0.6, 'rgba(60, 55, 80, 0.15)');
    gradient.addColorStop(1, 'rgba(50, 45, 70, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    // Add wispy tendrils
    for (let i = 0; i < 12; i++) {
        const x = 16 + Math.random() * 32;
        const y = 16 + Math.random() * 32;
        const r = 4 + Math.random() * 12;
        const puffGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        puffGrad.addColorStop(0, 'rgba(90, 75, 110, 0.25)');
        puffGrad.addColorStop(0.5, 'rgba(70, 60, 90, 0.15)');
        puffGrad.addColorStop(1, 'rgba(50, 45, 70, 0)');
        ctx.fillStyle = puffGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate scorch mark texture - dark burned ground
function generateScorchTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Dark radial gradient with rough edges
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(15, 10, 5, 0.9)');
    gradient.addColorStop(0.4, 'rgba(30, 20, 10, 0.7)');
    gradient.addColorStop(0.7, 'rgba(40, 30, 15, 0.4)');
    gradient.addColorStop(1, 'rgba(50, 40, 20, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    // Add charred details
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 20;
        const x = 32 + Math.cos(angle) * dist;
        const y = 32 + Math.sin(angle) * dist;
        const r = 3 + Math.random() * 6;
        const charGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        charGrad.addColorStop(0, 'rgba(10, 5, 0, 0.5)');
        charGrad.addColorStop(1, 'rgba(20, 15, 5, 0)');
        ctx.fillStyle = charGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate kite texture - colorful diamond pattern
function generateKiteTexture(THREE, primaryColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Convert hex color to RGB
    const r = (primaryColor >> 16) & 255;
    const g = (primaryColor >> 8) & 255;
    const b = primaryColor & 255;
    
    // Base color
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 64, 64);
    
    // Darker cross pattern in the middle
    ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(32, 64);
    ctx.moveTo(0, 32);
    ctx.lineTo(64, 32);
    ctx.stroke();
    
    // Lighter diagonal sections
    ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(64, 32);
    ctx.lineTo(32, 32);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(32, 64);
    ctx.lineTo(0, 32);
    ctx.lineTo(32, 32);
    ctx.closePath();
    ctx.fill();
    
    // Add some decorative dots
    ctx.fillStyle = `rgba(255, 255, 0, 0.8)`;
    ctx.beginPath();
    ctx.arc(32, 16, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(32, 48, 4, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate glowing eye texture - INTENSE GLOW with pulsing rings
function generateGlowingEyeTexture(THREE, baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;
    
    // Large outer glow halo
    const outerHalo = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    outerHalo.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    outerHalo.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.9)`);
    outerHalo.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.6)`);
    outerHalo.addColorStop(0.6, `rgba(${Math.floor(r*0.8)}, ${Math.floor(g*0.8)}, ${Math.floor(b*0.8)}, 0.3)`);
    outerHalo.addColorStop(0.8, `rgba(${Math.floor(r*0.5)}, ${Math.floor(g*0.5)}, ${Math.floor(b*0.5)}, 0.1)`);
    outerHalo.addColorStop(1, `rgba(${Math.floor(r*0.3)}, ${Math.floor(g*0.3)}, ${Math.floor(b*0.3)}, 0)`);
    ctx.fillStyle = outerHalo;
    ctx.fillRect(0, 0, 128, 128);
    
    // Bright main eye
    const mainEye = ctx.createRadialGradient(64, 64, 0, 64, 64, 28);
    mainEye.addColorStop(0, '#FFFFFF');
    mainEye.addColorStop(0.2, `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`);
    mainEye.addColorStop(0.5, `rgb(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)})`);
    mainEye.addColorStop(1, `rgb(${r}, ${g}, ${b})`);
    ctx.fillStyle = mainEye;
    ctx.beginPath();
    ctx.arc(64, 64, 28, 0, Math.PI * 2);
    ctx.fill();
    
    // Super bright inner core
    const innerCore = ctx.createRadialGradient(64, 64, 0, 64, 64, 12);
    innerCore.addColorStop(0, '#FFFFFF');
    innerCore.addColorStop(0.6, '#FFFFFF');
    innerCore.addColorStop(1, `rgb(${Math.min(255, r + 100)}, ${Math.min(255, g + 100)}, ${Math.min(255, b + 100)})`);
    ctx.fillStyle = innerCore;
    ctx.beginPath();
    ctx.arc(64, 64, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Menacing slit pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(64, 64, 3, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Sharp reflection highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(54, 54, 5, 3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(74, 70, 3, 2, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow rings
    ctx.strokeStyle = `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, 0.3)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(64, 64, 35, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.strokeStyle = `rgba(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}, 0.15)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(64, 64, 45, 0, Math.PI * 2);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate bicycle helmet texture with vents and patterns
function generateHelmetTexture(THREE, baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Extract RGB from hex color
    const r = (baseColor >> 16) & 255;
    const g = (baseColor >> 8) & 255;
    const b = baseColor & 255;
    
    // Base helmet color
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 256, 256);
    
    // Add subtle plastic/matte texture variation
    for (let i = 0; i < 1500; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const brightness = 0.9 + Math.random() * 0.2;
        const nr = Math.floor(Math.min(255, r * brightness));
        const ng = Math.floor(Math.min(255, g * brightness));
        const nb = Math.floor(Math.min(255, b * brightness));
        ctx.fillStyle = `rgb(${nr}, ${ng}, ${nb})`;
        ctx.fillRect(x, y, 2, 2);
    }
    
    // Draw vent slots at the back of helmet
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 7; i++) {
        const y = 30 + i * 25;
        // Short vent slots at back (x=0 wraps to back of sphere)
        ctx.beginPath();
        ctx.roundRect(2, y, 12, 6, 3);
        ctx.fill();
        
        // Inner vent shadow
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.roundRect(4, y + 2, 8, 2, 1);
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
    }
    
    // Add edge highlight on top
    const gradient = ctx.createLinearGradient(0, 0, 0, 60);
    gradient.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
    gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 60);
    
    // Add bottom shadow
    const shadowGradient = ctx.createLinearGradient(0, 200, 0, 256);
    shadowGradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    shadowGradient.addColorStop(1, `rgba(0, 0, 0, 0.2)`);
    ctx.fillStyle = shadowGradient;
    ctx.fillRect(0, 200, 256, 56);
    
    // Add manufacturer logo area (small rectangle)
    ctx.fillStyle = `rgba(0, 0, 0, 0.15)`;
    ctx.fillRect(100, 220, 56, 20);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Generate overgrown ancient stone wall texture for the labyrinth (512×512)
function generateLabyrinthStoneTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const W = 512;

    // --- Base stone fill with warm/cool temperature gradient ---
    const baseGrad = ctx.createLinearGradient(0, 0, W, W);
    baseGrad.addColorStop(0, '#42513C');   // cooler grey-green top-left
    baseGrad.addColorStop(0.5, '#3E4E3A'); // neutral mid
    baseGrad.addColorStop(1, '#4A4F38');   // warmer olive bottom-right
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, W);

    // --- Fine stone-grain noise over entire surface ---
    for (let i = 0; i < 14000; i++) {
        const nx = Math.random() * W;
        const ny = Math.random() * W;
        const v = 52 + Math.random() * 40;
        ctx.fillStyle = `rgba(${v|0},${(v + 8)|0},${(v - 4)|0},0.12)`;
        ctx.fillRect(nx, ny, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }

    // --- Irregular stone block masonry ---
    // Use two alternating row heights for variety
    const rowHeights = [26, 34, 28, 38, 24, 32, 30];
    const baseBlockW = 48;
    let by = 0;
    let rowIdx = 0;
    const blockRects = [];  // store for later edge highlights
    while (by < W + 40) {
        const rowH = rowHeights[rowIdx % rowHeights.length];
        const stagger = (rowIdx % 2) * (baseBlockW * 0.5) + (rowIdx % 3) * 6;
        let bx = -baseBlockW + stagger;
        while (bx < W + baseBlockW) {
            const bw = baseBlockW + (Math.random() - 0.5) * 16; // vary width
            const mortar = 2.5;
            // Stone color — mix grey, green and occasional warm brown
            const warm = Math.random() < 0.15;  // 15% of blocks get warm tint
            const shade = 0.72 + Math.random() * 0.38;
            let r, g, b;
            if (warm) {
                r = Math.floor(72 * shade); g = Math.floor(62 * shade); b = Math.floor(48 * shade);
            } else {
                r = Math.floor(58 * shade); g = Math.floor(74 * shade); b = Math.floor(55 * shade);
            }
            const x0 = bx + mortar;
            const y0 = by + mortar;
            const w0 = bw - mortar * 2;
            const h0 = rowH - mortar * 2;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x0, y0, w0, h0);
            blockRects.push({ x: x0, y: y0, w: w0, h: h0, r, g, b });

            // Per-block grain speckles
            for (let n = 0; n < 14; n++) {
                const px = x0 + Math.random() * w0;
                const py = y0 + Math.random() * h0;
                const ns = (Math.random() - 0.5) * 26;
                ctx.fillStyle = `rgb(${Math.max(0,Math.min(255,r+ns))|0},${Math.max(0,Math.min(255,g+ns))|0},${Math.max(0,Math.min(255,b+ns))|0})`;
                ctx.fillRect(px, py, 2 + Math.random() * 2, 1.5 + Math.random());
            }

            // Erosion pits — tiny dark spots
            for (let n = 0; n < 3; n++) {
                if (Math.random() < 0.4) {
                    const px = x0 + 4 + Math.random() * (w0 - 8);
                    const py = y0 + 4 + Math.random() * (h0 - 8);
                    ctx.fillStyle = 'rgba(20,25,18,0.35)';
                    ctx.beginPath();
                    ctx.ellipse(px, py, 1 + Math.random() * 2.5, 1 + Math.random() * 1.5, Math.random() * Math.PI, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            bx += bw;
        }
        by += rowH;
        rowIdx++;
    }

    // --- Block edge highlights and shadows (chisel effect) ---
    for (const br of blockRects) {
        // Top + left highlight
        ctx.strokeStyle = 'rgba(180,190,170,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(br.x, br.y + br.h);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(br.x + br.w, br.y);
        ctx.stroke();
        // Bottom + right shadow
        ctx.strokeStyle = 'rgba(15,18,12,0.2)';
        ctx.beginPath();
        ctx.moveTo(br.x + br.w, br.y);
        ctx.lineTo(br.x + br.w, br.y + br.h);
        ctx.lineTo(br.x, br.y + br.h);
        ctx.stroke();
    }

    // --- Mortar lines — dark grooves ---
    ctx.strokeStyle = 'rgba(22, 28, 18, 0.55)';
    ctx.lineWidth = 1.5;
    by = 0; rowIdx = 0;
    while (by < W + 40) {
        const rowH = rowHeights[rowIdx % rowHeights.length];
        ctx.beginPath(); ctx.moveTo(0, by); ctx.lineTo(W, by); ctx.stroke();
        by += rowH; rowIdx++;
    }

    // --- Deep cracks (branching, irregular) ---
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 16; i++) {
        ctx.strokeStyle = `rgba(16,20,14,${0.5 + Math.random() * 0.3})`;
        ctx.beginPath();
        let cx = Math.random() * W;
        let cy = Math.random() * W;
        ctx.moveTo(cx, cy);
        const segs = 3 + Math.floor(Math.random() * 5);
        for (let s = 0; s < segs; s++) {
            cx += (Math.random() - 0.5) * 35;
            cy += Math.random() * 22;
            ctx.lineTo(cx, cy);
            // Occasional branch
            if (Math.random() < 0.3) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                let bx2 = cx + (Math.random() - 0.5) * 20;
                let by2 = cy + Math.random() * 14;
                ctx.lineTo(bx2, by2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(cx, cy);
            }
        }
        ctx.stroke();
    }

    // --- Heavy moss patches (varied greens + yellow lichen) ---
    const mossShades = [
        [50, 90, 40], [60, 115, 45], [45, 80, 35],
        [70, 125, 55], [55, 100, 40], [80, 110, 30]  // yellowish lichen
    ];
    for (let i = 0; i < 50; i++) {
        const mx = Math.random() * W;
        const my = Math.random() * W;
        const mr = 12 + Math.random() * 45;
        const ms = mossShades[Math.floor(Math.random() * mossShades.length)];
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
        gradient.addColorStop(0, `rgba(${ms[0]},${ms[1]},${ms[2]},0.5)`);
        gradient.addColorStop(0.5, `rgba(${ms[0]},${ms[1]},${ms[2]},0.22)`);
        gradient.addColorStop(1, `rgba(${ms[0]},${ms[1]},${ms[2]},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    }

    // --- Yellowish-orange lichen splotches ---
    for (let i = 0; i < 15; i++) {
        const lx = Math.random() * W;
        const ly = Math.random() * W;
        const lr = 5 + Math.random() * 12;
        const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        gradient.addColorStop(0, 'rgba(140,120,40,0.35)');
        gradient.addColorStop(0.7, 'rgba(120,100,30,0.12)');
        gradient.addColorStop(1, 'rgba(120,100,30,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
    }

    // --- Bright moss/lichen speckles ---
    for (let i = 0; i < 350; i++) {
        const sx = Math.random() * W;
        const sy = Math.random() * W;
        const sc = mossShades[Math.floor(Math.random() * mossShades.length)];
        ctx.fillStyle = `rgb(${sc[0] + 35},${sc[1] + 35},${sc[2] + 18})`;
        ctx.fillRect(sx, sy, 1.5 + Math.random(), 1.5 + Math.random());
    }

    // --- Vine tendrils with bezier curves ---
    for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = `rgba(32,60,25,${0.35 + Math.random() * 0.25})`;
        ctx.lineWidth = 1.5 + Math.random() * 1.5;
        ctx.beginPath();
        let vx = Math.random() * W;
        let vy = Math.random() * W * 0.25;
        ctx.moveTo(vx, vy);
        for (let s = 0; s < 10; s++) {
            const cpx = vx + (Math.random() - 0.5) * 30;
            const cpy = vy + 6 + Math.random() * 14;
            vx += (Math.random() - 0.5) * 18;
            vy += 10 + Math.random() * 14;
            ctx.quadraticCurveTo(cpx, cpy, vx, vy);
        }
        ctx.stroke();

        // Tiny leaves sprouting off vines
        const leafClr = mossShades[Math.floor(Math.random() * mossShades.length)];
        ctx.fillStyle = `rgba(${leafClr[0] + 20},${leafClr[1] + 20},${leafClr[2] + 10},0.45)`;
        for (let l = 0; l < 6; l++) {
            const lx2 = vx + (Math.random() - 0.5) * 30;
            const ly2 = vy - Math.random() * 60;
            ctx.beginPath();
            ctx.ellipse(lx2, ly2, 3 + Math.random() * 4, 1.5 + Math.random() * 2.5, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- Carved rune-like symbols (faint ancient markings) ---
    ctx.strokeStyle = 'rgba(28,34,24,0.18)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
        const rx = 40 + Math.random() * (W - 80);
        const ry = 40 + Math.random() * (W - 80);
        const rs = 6 + Math.random() * 10;
        ctx.beginPath();
        // Simple geometric rune shapes
        const type = Math.floor(Math.random() * 4);
        if (type === 0) { // cross
            ctx.moveTo(rx - rs, ry); ctx.lineTo(rx + rs, ry);
            ctx.moveTo(rx, ry - rs); ctx.lineTo(rx, ry + rs);
        } else if (type === 1) { // diamond
            ctx.moveTo(rx, ry - rs); ctx.lineTo(rx + rs, ry);
            ctx.lineTo(rx, ry + rs); ctx.lineTo(rx - rs, ry); ctx.closePath();
        } else if (type === 2) { // zigzag
            ctx.moveTo(rx - rs, ry - rs * 0.5);
            ctx.lineTo(rx, ry + rs * 0.5);
            ctx.lineTo(rx + rs, ry - rs * 0.5);
        } else { // circle with line
            ctx.arc(rx, ry, rs * 0.7, 0, Math.PI * 2);
            ctx.moveTo(rx, ry - rs); ctx.lineTo(rx, ry + rs);
        }
        ctx.stroke();
    }

    // --- Tiny flower dots ---
    const flowerClrs = ['rgba(255,105,180,0.45)', 'rgba(255,215,0,0.4)', 'rgba(200,160,255,0.35)', 'rgba(255,160,100,0.35)'];
    for (let i = 0; i < 14; i++) {
        ctx.fillStyle = flowerClrs[Math.floor(Math.random() * flowerClrs.length)];
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * W, 1.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- Water stain drip streaks (dark vertical blotches, bottom half) ---
    for (let i = 0; i < 12; i++) {
        const wx = Math.random() * W;
        const wy = W * (0.45 + Math.random() * 0.55);
        const wh = 25 + Math.random() * 55;
        const ww = 3 + Math.random() * 6;
        const gradient = ctx.createLinearGradient(wx, wy - wh, wx, wy);
        gradient.addColorStop(0, 'rgba(28, 32, 25, 0)');
        gradient.addColorStop(0.6, 'rgba(28, 32, 25, 0.12)');
        gradient.addColorStop(1, 'rgba(28, 32, 25, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(wx - ww / 2, wy - wh, ww, wh);
    }

    // --- Subtle overall vignette (darker edges) ---
    const vignette = ctx.createRadialGradient(W / 2, W / 2, W * 0.25, W / 2, W / 2, W * 0.7);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, W);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
}

// Generate mossy stone floor texture for the labyrinth ground (512×512)
function generateLabyrinthGroundTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const W = 512;

    // Base — dark earthy grey-green (matches wall palette)
    ctx.fillStyle = '#3A4A36';
    ctx.fillRect(0, 0, W, W);

    // Subtle warm-to-cool temperature shift
    const tempGrad = ctx.createLinearGradient(0, 0, W, W);
    tempGrad.addColorStop(0, 'rgba(60,50,35,0.12)');
    tempGrad.addColorStop(1, 'rgba(35,50,45,0.12)');
    ctx.fillStyle = tempGrad;
    ctx.fillRect(0, 0, W, W);

    // Large irregular stone pavers
    const paverCenters = [];
    for (let i = 0; i < 80; i++) {
        paverCenters.push({ x: Math.random() * W, y: Math.random() * W });
    }
    // Voronoi-like pavers via filled circles (approximate)
    for (const pc of paverCenters) {
        const pr = 18 + Math.random() * 28;
        const shade = 0.7 + Math.random() * 0.4;
        const r = Math.floor(52 * shade);
        const g = Math.floor(62 * shade);
        const b = Math.floor(50 * shade);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        // Slightly irregular shape via ellipse with random rotation
        ctx.ellipse(pc.x, pc.y, pr, pr * (0.7 + Math.random() * 0.6),
                    Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    // Dirt/gravel fill in gaps (coarse noise)
    for (let i = 0; i < 10000; i++) {
        const dx = Math.random() * W;
        const dy = Math.random() * W;
        const shade = 40 + Math.random() * 35;
        ctx.fillStyle = `rgba(${shade + 10|0},${shade + 5|0},${shade - 5|0},0.15)`;
        ctx.fillRect(dx, dy, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }

    // Dark crevice lines between pavers
    ctx.strokeStyle = 'rgba(18,22,16,0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        let lx = Math.random() * W;
        let ly = Math.random() * W;
        ctx.moveTo(lx, ly);
        for (let s = 0; s < 3; s++) {
            lx += (Math.random() - 0.5) * 40;
            ly += (Math.random() - 0.5) * 40;
            ctx.lineTo(lx, ly);
        }
        ctx.stroke();
    }

    // Scattered pebbles
    for (let i = 0; i < 120; i++) {
        const px = Math.random() * W;
        const py = Math.random() * W;
        const pr = 1 + Math.random() * 3;
        const shade = 55 + Math.random() * 40;
        ctx.fillStyle = `rgb(${shade + 8|0},${shade + 5|0},${shade - 3|0})`;
        ctx.beginPath();
        ctx.ellipse(px, py, pr, pr * (0.6 + Math.random() * 0.8), Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    // Moss patches (match wall palette)
    const mossShades = [
        [48, 88, 38], [58, 108, 42], [42, 78, 32],
        [65, 118, 50], [52, 95, 38]
    ];
    for (let i = 0; i < 40; i++) {
        const mx = Math.random() * W;
        const my = Math.random() * W;
        const mr = 15 + Math.random() * 50;
        const ms = mossShades[Math.floor(Math.random() * mossShades.length)];
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
        gradient.addColorStop(0, `rgba(${ms[0]},${ms[1]},${ms[2]},0.4)`);
        gradient.addColorStop(0.6, `rgba(${ms[0]},${ms[1]},${ms[2]},0.15)`);
        gradient.addColorStop(1, `rgba(${ms[0]},${ms[1]},${ms[2]},0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
    }

    // Grass tufts growing through cracks
    for (let i = 0; i < 300; i++) {
        const gx = Math.random() * W;
        const gy = Math.random() * W;
        const ms = mossShades[Math.floor(Math.random() * mossShades.length)];
        ctx.fillStyle = `rgb(${ms[0] + 30},${ms[1] + 30},${ms[2] + 15})`;
        ctx.fillRect(gx, gy, 1.5, 1.5);
    }

    // Small puddle stains (darker wet patches)
    for (let i = 0; i < 10; i++) {
        const px2 = Math.random() * W;
        const py2 = Math.random() * W;
        const pr2 = 8 + Math.random() * 20;
        const gradient = ctx.createRadialGradient(px2, py2, 0, px2, py2, pr2);
        gradient.addColorStop(0, 'rgba(25,30,22,0.22)');
        gradient.addColorStop(1, 'rgba(25,30,22,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(px2 - pr2, py2 - pr2, pr2 * 2, pr2 * 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

// Store generated textures to reuse
let cachedTextures = null;

function getTerrainTextures(THREE) {
    if (!cachedTextures) {
        cachedTextures = {
            grass: generateGrassTexture(THREE, false),
            grassIce: generateGrassTexture(THREE, true),
            sand: generateSandTexture(THREE),
            candy: generateCandyTexture(THREE),
            graveyard: generateGraveyardTexture(THREE),
            brickWall: generateBrickWallTexture(THREE),
            rock: generateRockTexture(THREE),
            bark: generateBarkTexture(THREE),
            foliage: generateFoliageTexture(THREE, false),
            foliageIce: generateFoliageTexture(THREE, true),
            mountain: generateMountainTexture(THREE),
            snow: generateSnowTexture(THREE),
            sky: generateSkyTexture(THREE),
            goblinSkin: generateGoblinSkinTexture(THREE),
            goblinArmor: generateGoblinArmorTexture(THREE),
            giantSkin: generateGiantSkinTexture(THREE),
            giantSkinLava: generateGiantSkinTextureLava(THREE),
            giantArmor: generateGiantArmorTexture(THREE),
            giantArmorLava: generateGiantArmorTextureLava(THREE),
            playerSkin: generatePlayerSkinTexture(THREE),
            playerClothingPink: generatePlayerClothingTexture(THREE, 0xFF69B4),
            playerClothingBlue: generatePlayerClothingTexture(THREE, 0x4169E1),
            hairBrown: generateHairTexture(THREE, 0x8B4513),
            hairBlack: generateHairTexture(THREE, 0x1a1a1a),
            dragonScale: generateDragonScaleTexture(THREE, false),
            dragonScaleIce: generateDragonScaleTexture(THREE, true),
            dragonScaleLava: generateDragonScaleTextureLava(THREE),
            dragonScaleWater: generateDragonScaleTextureWater(THREE),
            dragonScaleCandy: generateDragonScaleTextureCandy(THREE),
            dragonScaleCrystal: generateDragonScaleTextureCrystal(THREE),
            reaperCloak: generateReaperCloakTexture(THREE),
            dragonBelly: generateDragonBellyTexture(THREE),
            fireball: generateFireballTexture(THREE, false),
            fireballIce: generateFireballTexture(THREE, true),
            explosion: generateExplosionTexture(THREE, false),
            explosionIce: generateExplosionTexture(THREE, true),
            smoke: generateSmokeTexture(THREE),
            fogWisp: generateFogWispTexture(THREE),
            scorch: generateScorchTexture(THREE),
            kitePink: generateKiteTexture(THREE, 0xFF1493),
            kiteBlue: generateKiteTexture(THREE, 0x00BFFF),
            goblinEye: generateGlowingEyeTexture(THREE, 0xFF0000),
            guardianEye: generateGlowingEyeTexture(THREE, 0xFFFF00),
            giantEye: generateGlowingEyeTexture(THREE, 0xFF6600),
            dragonEye: generateGlowingEyeTexture(THREE, 0xFF6600),
            dragonEyeIce: generateGlowingEyeTexture(THREE, 0x00BFFF),
            dragonEyeLava: generateGlowingEyeTexture(THREE, 0xFFFF00),
            dragonEyeWater: generateGlowingEyeTexture(THREE, 0x00FF88),
            dragonEyeCandy: generateGlowingEyeTexture(THREE, 0xFF69B4),
            dragonEyeCrystal: generateGlowingEyeTexture(THREE, 0xAA44FF),
            reaperEye: generateReaperEyeTexture(THREE),
            giantEyeLava: generateGlowingEyeTexture(THREE, 0xFF4400),
            wizardRobe: generateWizardRobeTexture(THREE, false),
            wizardRobeIce: generateWizardRobeTexture(THREE, true),
            helmetPink: generateHelmetTexture(THREE, 0xFF69B4),
            helmetBlue: generateHelmetTexture(THREE, 0x4169E1),
            labyrinthStone: generateLabyrinthStoneTexture(THREE),
            labyrinthGround: generateLabyrinthGroundTexture(THREE)
        };
    }
    return cachedTextures;
}

// ============================================
// TERRAIN FUNCTIONS
// ============================================

// Function to get terrain height at position
function getTerrainHeight(x, z) {
    let y = 0;
    
    // Use current level hills if set, otherwise fall back to global HILLS
    const hills = currentLevelHills || HILLS;
    
    // In water theme, everything stays at water level (y=0)
    // Check if we're in water theme by seeing if hills have very low height (islands)
    const isWaterTheme = hills.length > 0 && hills[0].height <= 2;
    if (isWaterTheme) {
        return 0;
    }
    
    // Check each hill
    hills.forEach(hill => {
        const dist = Math.sqrt(
            Math.pow(x - hill.x, 2) + Math.pow(z - hill.z, 2)
        );
        
        if (dist < hill.radius) {
            const normalizedDist = dist / hill.radius;
            const heightMultiplier = Math.cos(normalizedDist * Math.PI / 2);
            y = Math.max(y, hill.height * heightMultiplier);
        }
    });
    
    return y;
}

// Create visual hill meshes
function createHills(scene, THREE, hillPositions, hillColor, iceTheme, desertTheme, lavaTheme, waterTheme, candyTheme, graveyardTheme, ruinsTheme, computerTheme, christmasTheme, crystalTheme, rapunzelTheme, labyrinthTheme) {
    const textures = getTerrainTextures(THREE);
    const hills = hillPositions || HILLS;
    const color = hillColor || 0x88cc88;
    let textureToUse;
    
    if (computerTheme) {
        textureToUse = null; // Procedural material for computer theme
    } else if (waterTheme) {
        textureToUse = textures.sand || textures.grass; // Sandy islands
    } else if (lavaTheme) {
        textureToUse = textures.rock || textures.grass;
    } else if (desertTheme) {
        textureToUse = textures.sand;
    } else if (candyTheme) {
        textureToUse = textures.candy; // Candy frosting hills
    } else if (graveyardTheme) {
        textureToUse = textures.graveyard; // Burial mound texture
    } else if (ruinsTheme) {
        textureToUse = textures.rock; // Rubble pile texture
    } else if (iceTheme || christmasTheme) {
        textureToUse = textures.grassIce;
    } else if (crystalTheme) {
        textureToUse = textures.rock || textures.grass; // Dark cave rock
    } else {
        textureToUse = textures.grass;
    }
    // Determine texture name for material caching
    let hillTextureName = 'grass';
    if (waterTheme) hillTextureName = 'sand';
    else if (lavaTheme) hillTextureName = 'rock';
    else if (desertTheme) hillTextureName = 'sand';
    else if (candyTheme) hillTextureName = 'candy';
    else if (graveyardTheme) hillTextureName = 'graveyard';
    else if (ruinsTheme) hillTextureName = 'rock';
    else if (iceTheme || christmasTheme) hillTextureName = 'grassIce';
    else if (crystalTheme) hillTextureName = 'rock';
    hills.forEach(hill => {
        if (computerTheme) {
            // Create processor chip / data hub instead of cone hill
            const chipSize = hill.radius * 1.2;
            const chipHeight = 1.5;
            
            // Main processor chip - flat octagonal/hexagonal shape
            const chipGeometry = new THREE.CylinderGeometry(chipSize, chipSize * 1.1, chipHeight, 8);
            const chipMaterial = getMaterial('phong', { 
                color: 0x0A0A15,
                emissive: 0x001133,
                emissiveIntensity: 0.4,
                shininess: 100,
                transparent: true,
                opacity: 0.95
            });
            const chip = new THREE.Mesh(chipGeometry, chipMaterial);
            chip.position.set(hill.x, chipHeight / 2, hill.z);
            chip.castShadow = true;
            chip.receiveShadow = true;
            scene.add(chip);
            
            // Glowing top surface circuit pattern
            const surfaceGeometry = new THREE.CylinderGeometry(chipSize * 0.95, chipSize * 0.95, 0.1, 8);
            const surfaceMaterial = getMaterial('basic', { 
                color: 0x002244,
                transparent: true,
                opacity: 0.8
            });
            const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
            surface.position.set(hill.x, chipHeight + 0.05, hill.z);
            scene.add(surface);
            
            // CPU core in center - glowing
            const coreGeometry = new THREE.BoxGeometry(chipSize * 0.4, 0.3, chipSize * 0.4);
            const coreMaterial = getMaterial('basic', { 
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.9
            });
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            core.position.set(hill.x, chipHeight + 0.25, hill.z);
            scene.add(core);
            
            // Circuit traces radiating outward
            const numTraces = 8;
            for (let i = 0; i < numTraces; i++) {
                const angle = (i / numTraces) * Math.PI * 2;
                const traceLength = chipSize * 0.45;
                const traceGeometry = new THREE.BoxGeometry(0.15, 0.1, traceLength);
                const traceColor = i % 2 === 0 ? 0x00FFFF : 0xFF00FF;
                const traceMaterial = getMaterial('basic', { 
                    color: traceColor,
                    transparent: true,
                    opacity: 0.8
                });
                const trace = new THREE.Mesh(traceGeometry, traceMaterial);
                const midDist = (chipSize * 0.2) + (traceLength / 2);
                trace.position.set(
                    hill.x + Math.cos(angle) * midDist,
                    chipHeight + 0.15,
                    hill.z + Math.sin(angle) * midDist
                );
                trace.rotation.y = -angle + Math.PI / 2;
                scene.add(trace);
            }
            
            // Corner connection pins
            const numPins = 8;
            for (let i = 0; i < numPins; i++) {
                const angle = (i / numPins) * Math.PI * 2 + Math.PI / 8;
                const pinGeometry = getGeometry('box', 0.8, 0.6, 0.3);
                const pinMaterial = getMaterial('phong', { 
                    color: 0xCCCC00,
                    emissive: 0x444400,
                    emissiveIntensity: 0.3,
                    shininess: 100
                });
                const pin = new THREE.Mesh(pinGeometry, pinMaterial);
                pin.position.set(
                    hill.x + Math.cos(angle) * (chipSize + 0.5),
                    0.3,
                    hill.z + Math.sin(angle) * (chipSize + 0.5)
                );
                pin.rotation.y = -angle;
                scene.add(pin);
            }
            
            // Holographic data readout floating above
            const holoHeight = hill.height * 0.3 + 2;
            const holoGeometry = new THREE.PlaneGeometry(chipSize * 0.6, chipSize * 0.4);
            const holoMaterial = getMaterial('basic', { 
                color: 0x00FF88,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const holo = new THREE.Mesh(holoGeometry, holoMaterial);
            holo.position.set(hill.x, chipHeight + holoHeight, hill.z);
            holo.rotation.x = -0.3;
            scene.add(holo);
            
            // Glowing status indicator
            const statusGeometry = getGeometry('sphere', 0.4, 16, 16);
            const statusColor = Math.random() > 0.3 ? 0x00FF00 : 0xFF0000;
            const statusMaterial = getMaterial('basic', { 
                color: statusColor,
                transparent: true,
                opacity: 0.9
            });
            const status = new THREE.Mesh(statusGeometry, statusMaterial);
            status.position.set(hill.x, chipHeight + holoHeight + 1, hill.z);
            scene.add(status);
        } else {
            // Non-computer theme: use cone hills
            const hillGeometry = new THREE.ConeGeometry(hill.radius, hill.height, 32);
            let hillMaterial;
            if (candyTheme) {
                // Cupcake-style hills with frosting
                hillMaterial = getTexturedMaterial('phong', { 
                    map: textureToUse,
                    color: color,
                    shininess: 50
                }, hillTextureName);
            } else if (graveyardTheme) {
                // Dark burial mounds
                hillMaterial = getTexturedMaterial('lambert', { 
                    map: textureToUse,
                    color: 0x2a2a20
                }, hillTextureName);
            } else if (ruinsTheme) {
                // Rocky rubble piles
                hillMaterial = getTexturedMaterial('lambert', { 
                    map: textureToUse,
                    color: 0x6B5B4F
                }, hillTextureName);
            } else {
                hillMaterial = getTexturedMaterial('lambert', { 
                    map: textureToUse,
                    color: color
                }, hillTextureName);
            }
            const hillMesh = new THREE.Mesh(hillGeometry, hillMaterial);
            hillMesh.position.set(hill.x, hill.height / 2, hill.z);
            hillMesh.castShadow = true;
            hillMesh.receiveShadow = true;
            scene.add(hillMesh);
            
            // Add sprinkles on candy hills
            if (candyTheme) {
                const sprinkleColors = [0xFF6347, 0xFFD700, 0x98FB98, 0xDDA0DD, 0x00CED1, 0xFF1493];
                for (let i = 0; i < 15; i++) {
                    const sprinkleGeometry = getGeometry('cylinder', 0.1, 0.1, 0.4, 6);
                    const sprinkleColor = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
                    const sprinkleMaterial = getMaterial('phong', { color: sprinkleColor, shininess: 80 });
                    const sprinkle = new THREE.Mesh(sprinkleGeometry, sprinkleMaterial);
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * hill.radius * 0.7;
                    const heightOnHill = hill.height * 0.3 + Math.random() * hill.height * 0.5;
                    sprinkle.position.set(
                        hill.x + Math.cos(angle) * dist,
                        heightOnHill,
                        hill.z + Math.sin(angle) * dist
                    );
                    sprinkle.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
                    scene.add(sprinkle);
                }
            }
            
            // Add gravestones on graveyard hills
            if (graveyardTheme) {
            const numGravestones = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < numGravestones; i++) {
                const gravestoneGroup = new THREE.Group();
                
                // Gravestone base
                const baseGeometry = getGeometry('box', 1.2, 0.3, 0.6);
                const stoneMaterial = getMaterial('lambert', { color: 0x4a4a4a });
                const base = new THREE.Mesh(baseGeometry, stoneMaterial);
                base.position.y = 0.15;
                gravestoneGroup.add(base);
                
                // Gravestone body (rounded top)
                const bodyGeometry = getGeometry('box', 1, 1.5, 0.3);
                const body = new THREE.Mesh(bodyGeometry, stoneMaterial);
                body.position.y = 1.05;
                gravestoneGroup.add(body);
                
                // Rounded top
                const topGeometry = getGeometry('cylinder', 0.5, 0.5, 0.3, 16, 1, false, 0, Math.PI);
                const top = new THREE.Mesh(topGeometry, stoneMaterial);
                top.rotation.x = Math.PI / 2;
                top.rotation.z = Math.PI / 2;
                top.position.y = 1.8;
                gravestoneGroup.add(top);
                
                // Position on hill
                const angle = (i / numGravestones) * Math.PI * 2 + Math.random() * 0.5;
                const dist = hill.radius * 0.3 + Math.random() * hill.radius * 0.3;
                gravestoneGroup.position.set(
                    hill.x + Math.cos(angle) * dist,
                    hill.height * 0.3,
                    hill.z + Math.sin(angle) * dist
                );
                gravestoneGroup.rotation.y = Math.random() * 0.3 - 0.15;
                gravestoneGroup.castShadow = true;
                scene.add(gravestoneGroup);
            }
        }
        } // Close the else block for non-computer theme
    });
}

// =========================================
// Labyrinth Decoration Manager
// Spatially chunks decorations into grid cells.
// Only chunks near a player are visible, boosting frame rate.
// All decorations for a single wall are assigned to the same chunk
// (keyed on wall center) so they appear/disappear together.
// =========================================
var _labyrinthDecoChunks = [];  // Array of { group, cx, cz }
var _labyrinthDecoScene = null;
var _labyrinthDecoTHREE = null;
const LABY_DECO_CHUNK_SIZE = 40; // World-units per chunk side
const LABY_DECO_VIEW_DIST = 70;  // Show chunks within this distance of any player
const LABY_DECO_VIEW_DIST_SQ = LABY_DECO_VIEW_DIST * LABY_DECO_VIEW_DIST;
const LABY_DECO_MAX_TOGGLES_PER_FRAME = 4; // Amortize: max chunk visibility changes per frame

// Get or create the chunk group for world position (x, z)
function _getLabyrinthDecoChunk(x, z) {
    const ci = Math.floor(x / LABY_DECO_CHUNK_SIZE);
    const cj = Math.floor(z / LABY_DECO_CHUNK_SIZE);
    const key = ci + ',' + cj;
    // Linear scan is fine for ~100-200 chunks at init time
    for (let i = 0; i < _labyrinthDecoChunks.length; i++) {
        if (_labyrinthDecoChunks[i].key === key) return _labyrinthDecoChunks[i].group;
    }
    const group = new _labyrinthDecoTHREE.Group();
    group.visible = false; // Hidden by default until player approaches
    // Add to scene immediately — we'll only toggle visible, never add/remove
    _labyrinthDecoScene.add(group);
    const entry = {
        key: key,
        group: group,
        cx: (ci + 0.5) * LABY_DECO_CHUNK_SIZE,
        cz: (cj + 0.5) * LABY_DECO_CHUNK_SIZE,
        visible: false
    };
    _labyrinthDecoChunks.push(entry);
    return group;
}

// Current wall center for chunk assignment (set per-wall before building decorations)
var _labyrinthCurrentWallX = 0;
var _labyrinthCurrentWallZ = 0;

// Set the wall center for subsequent _addLabyrinthDeco calls.
// All decorations added after this call will be assigned to the chunk
// that contains (wallX, wallZ), so a wall's decorations stay together.
function _setLabyrinthDecoWall(wallX, wallZ) {
    _labyrinthCurrentWallX = wallX;
    _labyrinthCurrentWallZ = wallZ;
}

// Helper: add a mesh to the chunk for the current wall center
function _addLabyrinthDeco(mesh) {
    _getLabyrinthDecoChunk(_labyrinthCurrentWallX, _labyrinthCurrentWallZ).add(mesh);
}

// Called every frame from the game loop to show/hide chunks near players.
// Amortized: at most LABY_DECO_MAX_TOGGLES_PER_FRAME chunks change per call
// to avoid frame spikes when many chunks cross the distance threshold at once.
var _labyrinthDecoScanIdx = 0;
function updateLabyrinthDecorations(player1X, player1Z, player2X, player2Z) {
    let togglesRemaining = LABY_DECO_MAX_TOGGLES_PER_FRAME;
    const len = _labyrinthDecoChunks.length;
    if (len === 0) return;
    // Wrap scan index
    if (_labyrinthDecoScanIdx >= len) _labyrinthDecoScanIdx = 0;
    // Scan all chunks for proximity but only apply a limited number of changes
    for (let count = 0; count < len; count++) {
        const idx = (_labyrinthDecoScanIdx + count) % len;
        const c = _labyrinthDecoChunks[idx];
        const dx1 = c.cx - player1X;
        const dz1 = c.cz - player1Z;
        let near = (dx1 * dx1 + dz1 * dz1) < LABY_DECO_VIEW_DIST_SQ;
        if (!near && player2X !== undefined) {
            const dx2 = c.cx - player2X;
            const dz2 = c.cz - player2Z;
            near = (dx2 * dx2 + dz2 * dz2) < LABY_DECO_VIEW_DIST_SQ;
        }
        if (near && !c.visible) {
            c.group.visible = true;
            c.visible = true;
            togglesRemaining--;
        } else if (!near && c.visible) {
            c.group.visible = false;
            c.visible = false;
            togglesRemaining--;
        }
        if (togglesRemaining <= 0) {
            _labyrinthDecoScanIdx = (idx + 1) % len;
            return;
        }
    }
    _labyrinthDecoScanIdx = 0;
}

// Create mountains (world boundaries)
function createMountains(scene, THREE, mountainPositions, candyTheme, graveyardTheme, ruinsTheme, computerTheme, enchantedTheme, easterTheme, christmasTheme, crystalTheme, rapunzelTheme, labyrinthTheme) {
    const textures = getTerrainTextures(THREE);
    // Initialize labyrinth decoration chunk system (only once — async chunk
    // loads also call createMountains, so guard against wiping the array)
    if (labyrinthTheme && !_labyrinthDecoScene) {
        _labyrinthDecoScene = scene;
        _labyrinthDecoTHREE = THREE;
        _labyrinthDecoChunks = [];
    }
    mountainPositions.forEach(mtn => {
        // If this mountain has a rotation, use a Group as a proxy scene
        // so all child objects get positioned relative to origin, then
        // the Group is rotated and placed at the final position.
        const hasRotation = mtn.rotation && mtn.rotation !== 0;
        let targetScene = scene;
        let proxyGroup = null;
        let origX, origZ;
        if (hasRotation) {
            proxyGroup = new THREE.Group();
            targetScene = proxyGroup;
            origX = mtn.x;
            origZ = mtn.z;
            // Temporarily zero out position so children build around origin
            mtn = Object.assign({}, mtn, { x: 0, z: 0 });
        }
        // Alias scene to targetScene for all theme code below
        const _scene = targetScene;
        if (computerTheme) {
            // Firewall server racks - tall glowing barriers
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            const wallDepth = 2;
            
            // Main server rack body - dark metallic
            const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
            const wallMaterial = getMaterial('phong', { 
                color: 0x0A0A1A,
                emissive: 0x001122,
                emissiveIntensity: 0.3,
                shininess: 60
            });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(mtn.x, wallHeight/2, mtn.z);
            wall.castShadow = true;
            _scene.add(wall);
            
            // Add glowing LED strips vertically
            const numStrips = Math.max(3, Math.floor(wallWidth / 8));
            for (let i = 0; i < numStrips; i++) {
                const stripX = mtn.x - wallWidth/2 + (i + 0.5) * (wallWidth / numStrips);
                const stripColor = [0x00FFFF, 0xFF00FF, 0x00FF00][i % 3];
                
                const stripGeometry = new THREE.BoxGeometry(0.3, wallHeight * 0.9, 0.5);
                const stripMaterial = getMaterial('basic', { 
                    color: stripColor,
                    transparent: true,
                    opacity: 0.8
                });
                const strip = new THREE.Mesh(stripGeometry, stripMaterial);
                strip.position.set(stripX, wallHeight/2, mtn.z + wallDepth/2 + 0.1);
                _scene.add(strip);
            }
            
            // Add blinking indicator lights along top
            const numLights = Math.max(5, Math.floor(wallWidth / 4));
            for (let i = 0; i < numLights; i++) {
                const lightX = mtn.x - wallWidth/2 + (i + 0.5) * (wallWidth / numLights);
                const lightGeometry = getGeometry('sphere', 0.25, 8, 8);
                const lightColor = Math.random() > 0.5 ? 0xFF0000 : 0x00FF00;
                const lightMaterial = getMaterial('basic', { 
                    color: lightColor,
                    transparent: true,
                    opacity: 0.9
                });
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.position.set(lightX, wallHeight - 0.5, mtn.z + wallDepth/2 + 0.2);
                _scene.add(light);
            }
            
        } else if (graveyardTheme) {
            // Old English brick wall with iron fence
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            // Walls are thin - fixed depth for realistic brick wall (~0.3m)
            const wallDepth = 1;
            
            // Brick wall body
            const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
            const wallMaterial = getTexturedMaterial('lambert', { 
                color: 0x8b7355,
                map: textures.brickWall
            }, 'brickWall');
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(mtn.x, wallHeight/2, mtn.z);
            _scene.add(wall);
            
            // Stone cap on top of wall (proportional to wall)
            const capHeight = Math.min(0.3, wallHeight * 0.1);
            const capGeometry = new THREE.BoxGeometry(wallWidth + 0.4, capHeight, wallDepth + 0.4);
            const capMaterial = getTexturedMaterial('lambert', { 
                color: 0x4a4a4a,
                map: textures.rock
            }, 'rock');
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.set(mtn.x, wallHeight + capHeight/2, mtn.z);
            _scene.add(cap);
            
            // Iron fence on top (realistic height ~1m)
            const fenceHeight = 1.5;
            const postCount = Math.max(2, Math.floor(wallWidth / 6));
            const spacing = wallWidth / (postCount + 1);
            const fenceBase = wallHeight + capHeight; // Start fence on top of cap
            
            // Fence posts
            for (let i = 1; i <= postCount; i++) {
                const postX = mtn.x - wallWidth/2 + i * spacing;
                
                // Main post
                const postGeometry = new THREE.CylinderGeometry(0.08, 0.08, fenceHeight, 6);
                const postMaterial = getMaterial('phong', { 
                    color: 0x1a1a1a,
                    shininess: 30
                });
                const post = new THREE.Mesh(postGeometry, postMaterial);
                post.position.set(postX, fenceBase + fenceHeight/2, mtn.z);
                _scene.add(post);
                
                // Spear tip on post
                const tipGeometry = getGeometry('cone', 0.12, 0.25, 6);
                const tipMaterial = getMaterial('phong', { 
                    color: 0x1a1a1a,
                    shininess: 50
                });
                const tip = new THREE.Mesh(tipGeometry, tipMaterial);
                tip.position.set(postX, fenceBase + fenceHeight + 0.12, mtn.z);
                _scene.add(tip);
            }
            
            // Horizontal rails
            const railGeometry = new THREE.BoxGeometry(wallWidth, 0.06, 0.06);
            const railMaterial = getMaterial('phong', { 
                color: 0x1a1a1a,
                shininess: 30
            });
            
            // Lower rail
            const lowerRail = new THREE.Mesh(railGeometry, railMaterial);
            lowerRail.position.set(mtn.x, fenceBase + fenceHeight * 0.35, mtn.z);
            _scene.add(lowerRail);
            
            // Upper rail
            const upperRail = new THREE.Mesh(railGeometry, railMaterial);
            upperRail.position.set(mtn.x, fenceBase + fenceHeight * 0.75, mtn.z);
            _scene.add(upperRail);
            
            // Eerie green glow behind fence (only on some walls)
            if (Math.random() > 0.5) {
                const glowGeometry = new THREE.SphereGeometry(Math.min(mtn.width/8, 5), 12, 12);
                const glowMaterial = getMaterial('basic', { 
                    color: 0x44ff44,
                    transparent: true,
                    opacity: 0.2
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                glow.position.set(mtn.x, fenceBase + fenceHeight/2, mtn.z - wallDepth/2 - 3);
                _scene.add(glow);
            }
            
        } else if (ruinsTheme) {
            // Detailed warm sandstone castle walls with architectural features
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            const wallDepth = 2.5; // Thick castle walls
            
            // Main stone wall body
            const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight * 0.8, wallDepth);
            const wallMaterial = getTexturedMaterial('lambert', { 
                color: 0xC8BEA8, // Light warm sandstone
                map: textures.rock
            }, 'rock');
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(mtn.x, wallHeight * 0.4, mtn.z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            _scene.add(wall);
            
            // Stone base (slightly wider, darker)
            const baseGeometry = new THREE.BoxGeometry(wallWidth + 0.6, wallHeight * 0.12, wallDepth + 0.5);
            const baseMaterial = getTexturedMaterial('lambert', { 
                color: 0xA09888,
                map: textures.rock
            }, 'rock');
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(mtn.x, wallHeight * 0.06, mtn.z);
            _scene.add(base);
            
            // Horizontal decorative band
            const bandGeometry = new THREE.BoxGeometry(wallWidth + 0.3, wallHeight * 0.06, wallDepth + 0.2);
            const bandMaterial = getMaterial('lambert', { color: 0xD5CAB8 });
            const band = new THREE.Mesh(bandGeometry, bandMaterial);
            band.position.set(mtn.x, wallHeight * 0.6, mtn.z);
            _scene.add(band);
            
            // Battlements on top
            const merlonCount = Math.floor(wallWidth / 3);
            for (let i = 0; i < merlonCount; i++) {
                if (Math.random() > 0.1) { // Most intact
                    const merlonHeight = wallHeight * 0.18;
                    const merlonGeometry = new THREE.BoxGeometry(1.3, merlonHeight, wallDepth);
                    const merlonMaterial = getTexturedMaterial('lambert', { 
                        color: 0xBFB5A0,
                        map: textures.rock
                    }, 'rock');
                    const merlon = new THREE.Mesh(merlonGeometry, merlonMaterial);
                    merlon.position.set(
                        mtn.x - wallWidth/2 + (i + 0.5) * (wallWidth / merlonCount),
                        wallHeight * 0.8 + merlonHeight/2,
                        mtn.z
                    );
                    merlon.castShadow = true;
                    _scene.add(merlon);
                    
                    // Cap on merlon
                    const capGeometry = new THREE.BoxGeometry(1.5, 0.12, wallDepth + 0.1);
                    const cap = new THREE.Mesh(capGeometry, bandMaterial);
                    cap.position.set(merlon.position.x, merlon.position.y + merlonHeight/2 + 0.06, mtn.z);
                    _scene.add(cap);
                }
            }
            
            // Arrow slits
            const slitCount = Math.floor(wallWidth / 10);
            for (let i = 0; i < slitCount; i++) {
                const slitGeometry = new THREE.BoxGeometry(0.12, wallHeight * 0.2, wallDepth + 0.1);
                const slitMaterial = getMaterial('basic', { color: 0x2A2520 });
                const slit = new THREE.Mesh(slitGeometry, slitMaterial);
                slit.position.set(
                    mtn.x - wallWidth/2 + (i + 0.5) * (wallWidth / slitCount),
                    wallHeight * 0.35,
                    mtn.z
                );
                _scene.add(slit);
            }
            
            // Subtle rubble
            for (let i = 0; i < wallWidth / 15; i++) {
                const rubbleGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.3, 0);
                const rubbleMaterial = getMaterial('lambert', { color: 0xA09888 });
                const rubble = new THREE.Mesh(rubbleGeometry, rubbleMaterial);
                rubble.position.set(
                    mtn.x - wallWidth/2 + Math.random() * wallWidth,
                    0.2,
                    mtn.z + wallDepth/2 + 0.3 + Math.random()
                );
                rubble.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                _scene.add(rubble);
            }
            
            // Ivy/moss patches
            if (Math.random() > 0.4) {
                const ivyGeometry = new THREE.PlaneGeometry(wallWidth * 0.2, wallHeight * 0.3);
                const ivyMaterial = getMaterial('lambert', { 
                    color: 0x5A8F5A,
                    transparent: true,
                    opacity: 0.65,
                    side: THREE.DoubleSide
                });
                const ivy = new THREE.Mesh(ivyGeometry, ivyMaterial);
                ivy.position.set(
                    mtn.x + (Math.random() - 0.5) * wallWidth * 0.5, 
                    wallHeight * 0.35, 
                    mtn.z + wallDepth/2 + 0.05
                );
                _scene.add(ivy);
            }
            
        } else if (enchantedTheme) {
            // Dense magical forest wall - impenetrable ancient tree barrier
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            const wallDepth = Math.min(mtn.width * 0.15, 8);
            
            // Dense foliage wall base
            const foliageGeometry = new THREE.BoxGeometry(wallWidth, wallHeight * 0.7, wallDepth);
            const foliageMaterial = getMaterial('lambert', { 
                color: 0x1A4D1A,  // Very dark forest green
            });
            const foliageWall = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliageWall.position.set(mtn.x, wallHeight * 0.35, mtn.z);
            foliageWall.castShadow = true;
            _scene.add(foliageWall);
            
            // Add tree trunks visible through foliage
            const trunkCount = Math.max(3, Math.floor(wallWidth / 8));
            const trunkMaterial = getMaterial('lambert', { color: 0x3D2817 });
            for (let i = 0; i < trunkCount; i++) {
                const trunkX = mtn.x - wallWidth/2 + (i + 0.5) * (wallWidth / trunkCount);
                const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, wallHeight, 8);
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                trunk.position.set(trunkX, wallHeight/2, mtn.z);
                trunk.castShadow = true;
                _scene.add(trunk);
            }
            
            // Canopy on top - layered spherical foliage
            const canopyMaterial = getMaterial('lambert', { color: 0x2D5A27 });
            for (let i = 0; i < trunkCount; i++) {
                const canopyX = mtn.x - wallWidth/2 + (i + 0.5) * (wallWidth / trunkCount);
                const canopyGeometry = new THREE.SphereGeometry(wallDepth * 0.8, 8, 6);
                const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
                canopy.position.set(canopyX, wallHeight * 0.85, mtn.z);
                canopy.scale.y = 0.6;
                canopy.castShadow = true;
                _scene.add(canopy);
            }
            
            // Fairy lights scattered in the foliage
            const lightMaterial = getMaterial('basic', { 
                color: 0xFFFF88,
                transparent: true,
                opacity: 0.7
            });
            for (let i = 0; i < wallWidth / 5; i++) {
                const lightGeometry = getGeometry('sphere', 0.15, 6, 6);
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.position.set(
                    mtn.x - wallWidth/2 + Math.random() * wallWidth,
                    wallHeight * 0.3 + Math.random() * wallHeight * 0.5,
                    mtn.z + (Math.random() - 0.5) * wallDepth * 0.8
                );
                _scene.add(light);
            }
            
            // Hanging vines on front
            const vineMaterial = getMaterial('lambert', { color: 0x4A7A42 });
            for (let i = 0; i < wallWidth / 10; i++) {
                const vineLength = 2 + Math.random() * 3;
                const vineGeometry = new THREE.CylinderGeometry(0.04, 0.06, vineLength, 4);
                const vine = new THREE.Mesh(vineGeometry, vineMaterial);
                vine.position.set(
                    mtn.x - wallWidth/2 + Math.random() * wallWidth,
                    wallHeight * 0.6 - vineLength/2,
                    mtn.z + wallDepth/2 + 0.1
                );
                vine.rotation.z = (Math.random() - 0.5) * 0.3;
                _scene.add(vine);
            }
            
        } else if (easterTheme) {
            // Easter hedge walls - decorative garden hedges
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            const wallDepth = Math.min(mtn.width * 0.15, 8);
            
            // Main hedge body - lush green
            const hedgeGeometry = new THREE.BoxGeometry(wallWidth, wallHeight * 0.85, wallDepth);
            const hedgeMaterial = getMaterial('lambert', { 
                color: 0x228B22  // Forest green
            });
            const hedge = new THREE.Mesh(hedgeGeometry, hedgeMaterial);
            hedge.position.set(mtn.x, wallHeight * 0.425, mtn.z);
            hedge.castShadow = true;
            _scene.add(hedge);
            
            // Rounded top layer - slightly different green
            const topGeometry = new THREE.BoxGeometry(wallWidth * 1.02, wallHeight * 0.2, wallDepth * 1.1);
            const topMaterial = getMaterial('lambert', { color: 0x32CD32 }); // Lime green
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.set(mtn.x, wallHeight * 0.95, mtn.z);
            _scene.add(top);
            
            // Add spring flowers scattered on hedge
            const flowerColors = [0xFF69B4, 0xFFFF00, 0xFF6347, 0xFFB6C1, 0xFFA500]; // Pink, yellow, red, light pink, orange
            for (let i = 0; i < wallWidth / 4; i++) {
                const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                const flowerGeometry = getGeometry('sphere', 0.3, 6, 6);
                const flowerMaterial = getMaterial('basic', { color: flowerColor });
                const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                flower.position.set(
                    mtn.x - wallWidth/2 + Math.random() * wallWidth,
                    wallHeight * 0.4 + Math.random() * wallHeight * 0.5,
                    mtn.z + (Math.random() > 0.5 ? 1 : -1) * (wallDepth/2 + 0.2)
                );
                _scene.add(flower);
            }
            
            // Easter bunny decorations on top occasionally
            if (Math.random() > 0.6) {
                const bunnyX = mtn.x + (Math.random() - 0.5) * wallWidth * 0.5;
                // Simple bunny silhouette - body
                const bunnyBody = new THREE.Mesh(
                    getGeometry('sphere', 0.5, 8, 8),
                    getMaterial('lambert', { color: 0xFFFFFF })
                );
                bunnyBody.position.set(bunnyX, wallHeight + 0.5, mtn.z);
                _scene.add(bunnyBody);
                // Head
                const bunnyHead = new THREE.Mesh(
                    getGeometry('sphere', 0.35, 8, 8),
                    getMaterial('lambert', { color: 0xFFFFFF })
                );
                bunnyHead.position.set(bunnyX, wallHeight + 1.1, mtn.z);
                _scene.add(bunnyHead);
                // Ears
                const earGeometry = getGeometry('cylinder', 0.1, 0.12, 0.5, 6);
                const earMaterial = getMaterial('lambert', { color: 0xFFB6C1 }); // Pink inner ear
                const leftEar = new THREE.Mesh(earGeometry, earMaterial);
                leftEar.position.set(bunnyX - 0.15, wallHeight + 1.6, mtn.z);
                leftEar.rotation.z = -0.2;
                _scene.add(leftEar);
                const rightEar = new THREE.Mesh(earGeometry, earMaterial);
                rightEar.position.set(bunnyX + 0.15, wallHeight + 1.6, mtn.z);
                rightEar.rotation.z = 0.2;
                _scene.add(rightEar);
            }
            
        } else if (christmasTheme) {
            // Christmas snowy walls - natural rounded snow banks (not built structures)
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            const wallDepth = Math.min(mtn.width * 0.3, 8);
            
            const snowMaterial = getTexturedMaterial('lambert', { 
                color: 0xF0F8FF,  // Alice blue - natural snow
                map: textures.grassIce
            }, 'grassIce');
            const pureSnowMaterial = getMaterial('lambert', { color: 0xFFFAFA }); // Snow white
            
            // Build natural snowbank from overlapping elongated spheres
            const moundCount = Math.max(3, Math.floor(wallWidth / 12));
            for (let i = 0; i < moundCount; i++) {
                const moundX = mtn.x - wallWidth/2 + (i + 0.5) * (wallWidth / moundCount);
                const moundWidth = wallWidth / moundCount * 1.4; // Overlap slightly
                const moundHeight = wallHeight * (0.7 + Math.random() * 0.3);
                const moundDepth = wallDepth * (0.8 + Math.random() * 0.4);
                
                // Main mound body - elongated sphere
                const moundGeometry = getGeometry('sphere', 1, 12, 8);
                const mound = new THREE.Mesh(moundGeometry, snowMaterial);
                mound.position.set(moundX + (Math.random() - 0.5) * 2, moundHeight * 0.4, mtn.z);
                mound.scale.set(moundWidth * 0.5, moundHeight * 0.5, moundDepth * 0.5);
                mound.castShadow = true;
                mound.receiveShadow = true;
                _scene.add(mound);
                
                // Add smaller rounded top for fluffy look
                const topGeometry = getGeometry('sphere', 1, 10, 6);
                const top = new THREE.Mesh(topGeometry, pureSnowMaterial);
                top.position.set(moundX + (Math.random() - 0.5) * 3, moundHeight * 0.75, mtn.z);
                top.scale.set(moundWidth * 0.35, moundHeight * 0.3, moundDepth * 0.4);
                top.castShadow = true;
                _scene.add(top);
            }
            
            // Add natural snow drifts scattered around base
            const driftCount = Math.max(4, Math.floor(wallWidth / 10));
            for (let i = 0; i < driftCount; i++) {
                const driftX = mtn.x - wallWidth/2 + Math.random() * wallWidth;
                const driftSize = 1.5 + Math.random() * 2.5;
                const driftGeometry = new THREE.SphereGeometry(driftSize, 8, 6);
                const drift = new THREE.Mesh(driftGeometry, pureSnowMaterial);
                const side = Math.random() > 0.5 ? 1 : -1;
                drift.position.set(driftX, driftSize * 0.25, mtn.z + side * (wallDepth/2 + driftSize * 0.4));
                drift.scale.set(1.2 + Math.random() * 0.5, 0.35, 0.9 + Math.random() * 0.3); // Flatten into natural drift
                drift.receiveShadow = true;
                _scene.add(drift);
            }
            
            // Occasional icicles hanging from taller mounds
            if (Math.random() > 0.5) {
                const icicleCount = Math.floor(wallWidth / 12);
                for (let i = 0; i < icicleCount; i++) {
                    const icicleX = mtn.x - wallWidth/2 + Math.random() * wallWidth;
                    const icicleLength = 0.4 + Math.random() * 1.2;
                    const icicleGeometry = new THREE.ConeGeometry(0.08, icicleLength, 4);
                    const icicleMaterial = getMaterial('phong', { 
                        color: 0xB0E0E6,  // Pale blue ice
                        shininess: 100,
                        transparent: true,
                        opacity: 0.7
                    });
                    const icicle = new THREE.Mesh(icicleGeometry, icicleMaterial);
                    icicle.position.set(icicleX, wallHeight * 0.6 + Math.random() * wallHeight * 0.3, mtn.z + wallDepth/3);
                    icicle.rotation.x = Math.PI; // Point downward
                    _scene.add(icicle);
                }
            }
            
            // Add subtle sparkle effects
            for (let i = 0; i < wallWidth / 12; i++) {
                const sparkleGeometry = getGeometry('sphere', 0.06, 4, 4);
                const sparkleMaterial = getMaterial('basic', { 
                    color: 0xFFFFFF,
                    transparent: true,
                    opacity: 0.5
                });
                const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
                sparkle.position.set(
                    mtn.x - wallWidth/2 + Math.random() * wallWidth,
                    wallHeight * 0.2 + Math.random() * wallHeight * 0.6,
                    mtn.z + (Math.random() - 0.5) * wallDepth
                );
                _scene.add(sparkle);
            }
            
        } else if (crystalTheme) {
            // Crystal cave walls - massive crystal formations
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            const wallDepth = 8;
            
            const crystalColors = [0xff4488, 0x44aaff, 0x44ff88, 0xaa44ff, 0xff88ff, 0x88ffff];
            
            // Create wall as cluster of large crystal spires instead of stone
            const crystalCount = Math.max(3, Math.floor(wallWidth / 3));
            
            for (let i = 0; i < crystalCount; i++) {
                const crystalColor = crystalColors[Math.floor(Math.random() * crystalColors.length)];
                const crystalHeight = wallHeight * (0.6 + Math.random() * 0.5);
                const crystalRadius = 1.2 + Math.random() * 1.5;
                
                // Main large crystal pillar
                const crystalGeometry = new THREE.ConeGeometry(crystalRadius, crystalHeight, 6);
                const crystalMaterial = getMaterial('phong', { 
                    color: crystalColor,
                    emissive: crystalColor,
                    emissiveIntensity: 0.35,
                    shininess: 120,
                    transparent: true,
                    opacity: 0.85
                });
                const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
                const xOffset = (i / (crystalCount - 1 || 1)) * wallWidth - wallWidth / 2;
                crystal.position.set(
                    mtn.x + xOffset + (Math.random() - 0.5) * 2,
                    crystalHeight / 2,
                    mtn.z + (Math.random() - 0.5) * wallDepth * 0.4
                );
                crystal.rotation.x = (Math.random() - 0.5) * 0.25;
                crystal.rotation.z = (Math.random() - 0.5) * 0.25;
                crystal.castShadow = true;
                _scene.add(crystal);
                
                // Secondary smaller crystals around the main one
                const secondaryCount = 2 + Math.floor(Math.random() * 3);
                for (let j = 0; j < secondaryCount; j++) {
                    const secColor = crystalColors[Math.floor(Math.random() * crystalColors.length)];
                    const secHeight = crystalHeight * (0.3 + Math.random() * 0.4);
                    const secRadius = crystalRadius * (0.3 + Math.random() * 0.4);
                    
                    const secGeometry = new THREE.ConeGeometry(secRadius, secHeight, 6);
                    const secMaterial = getMaterial('phong', { 
                        color: secColor,
                        emissive: secColor,
                        emissiveIntensity: 0.4,
                        shininess: 100,
                        transparent: true,
                        opacity: 0.8
                    });
                    const secCrystal = new THREE.Mesh(secGeometry, secMaterial);
                    const angle = (j / secondaryCount) * Math.PI * 2;
                    secCrystal.position.set(
                        crystal.position.x + Math.cos(angle) * (crystalRadius + 0.5),
                        secHeight / 2,
                        crystal.position.z + Math.sin(angle) * (crystalRadius * 0.5)
                    );
                    secCrystal.rotation.x = (Math.random() - 0.5) * 0.4;
                    secCrystal.rotation.z = (Math.random() - 0.5) * 0.4;
                    _scene.add(secCrystal);
                }
                
                // Inner glow core
                const coreGeometry = new THREE.SphereGeometry(crystalRadius * 0.5, 8, 8);
                const coreMaterial = getMaterial('basic', { 
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.25
                });
                const core = new THREE.Mesh(coreGeometry, coreMaterial);
                core.position.set(crystal.position.x, crystalHeight * 0.3, crystal.position.z);
                _scene.add(core);
                
                // Outer glow aura
                const glowGeometry = new THREE.SphereGeometry(crystalRadius * 2, 8, 8);
                const glowMaterial = getMaterial('basic', { 
                    color: crystalColor,
                    transparent: true,
                    opacity: 0.12
                });
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                glow.position.set(crystal.position.x, crystalHeight * 0.4, crystal.position.z);
                _scene.add(glow);
            }
            
            // Crystal base - faceted rock with embedded gems
            const baseGeometry = new THREE.BoxGeometry(wallWidth * 1.1, wallHeight * 0.15, wallDepth);
            const baseMaterial = getMaterial('phong', { 
                color: 0x3a2a5a,
                emissive: 0x1a0a2a,
                emissiveIntensity: 0.2,
                shininess: 40
            });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(mtn.x, wallHeight * 0.075, mtn.z);
            _scene.add(base);
            
            // Embedded gems in base
            const gemCount = Math.floor(wallWidth / 2);
            for (let i = 0; i < gemCount; i++) {
                const gemColor = crystalColors[Math.floor(Math.random() * crystalColors.length)];
                const gemSize = 0.2 + Math.random() * 0.3;
                const gemGeometry = new THREE.OctahedronGeometry(gemSize, 0);
                const gemMaterial = getMaterial('phong', { 
                    color: gemColor,
                    emissive: gemColor,
                    emissiveIntensity: 0.6,
                    shininess: 100
                });
                const gem = new THREE.Mesh(gemGeometry, gemMaterial);
                gem.position.set(
                    mtn.x - wallWidth/2 + Math.random() * wallWidth,
                    wallHeight * 0.05 + Math.random() * wallHeight * 0.1,
                    mtn.z + wallDepth/2 + 0.1
                );
                gem.rotation.y = Math.random() * Math.PI;
                _scene.add(gem);
            }
            
        } else if (rapunzelTheme) {
            // Mix of stone walls and rocky cliffs for fairytale forest
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            const wallDepth = Math.min(mtn.width * 0.03, 1.5); // Much thinner walls
            
            // Randomly choose wall (40%) or rocky cliff (60%)
            const isRockyCliff = Math.random() > 0.4;
            
            if (isRockyCliff) {
                // Rocky cliff - mountain range with multiple varied peaks
                const cliffGroup = new THREE.Group();
                
                // Main peaks spread along the width
                const numPeaks = Math.max(3, Math.floor(wallWidth / 6));
                const peakSpacing = wallWidth / numPeaks;
                
                // Create main peaks with varied heights
                for (let p = 0; p < numPeaks; p++) {
                    // Alternate between tall and medium peaks for visual interest
                    const heightVariation = p % 2 === 0 ? 1.0 + Math.random() * 0.3 : 0.6 + Math.random() * 0.3;
                    const peakHeight = wallHeight * heightVariation;
                    const peakRadius = peakHeight * 0.5; // Sharper, more dramatic peaks
                    const peakGeometry = new THREE.ConeGeometry(peakRadius, peakHeight, 8);
                    
                    // Varied rock colors
                    const rockColors = [0x7A7A6A, 0x6A6A5A, 0x8A8A7A, 0x5A5A4A];
                    const peakMaterial = getTexturedMaterial('lambert', { 
                        map: textures.rock,
                        color: rockColors[p % rockColors.length]
                    }, 'rock');
                    const peak = new THREE.Mesh(peakGeometry, peakMaterial);
                    peak.position.set(
                        -wallWidth/2 + peakSpacing * (p + 0.5) + (Math.random() - 0.5) * 1.5,
                        peakHeight / 2,
                        (Math.random() - 0.5) * 2
                    );
                    peak.castShadow = true;
                    cliffGroup.add(peak);
                    
                    // Snow cap on taller peaks
                    if (peakHeight > wallHeight * 0.8) {
                        const snowCapGeometry = new THREE.ConeGeometry(peakRadius * 0.4, peakHeight * 0.25, 8);
                        const snowCapMaterial = getMaterial('lambert', { color: 0xF5F5F5 });
                        const snowCap = new THREE.Mesh(snowCapGeometry, snowCapMaterial);
                        snowCap.position.set(peak.position.x, peakHeight * 0.88, peak.position.z);
                        cliffGroup.add(snowCap);
                    } else {
                        // Mossy/grassy cap on shorter peaks
                        const capGeometry = new THREE.ConeGeometry(peakRadius * 0.35, peakHeight * 0.2, 8);
                        const capMaterial = getMaterial('lambert', { color: 0x5A6B4A });
                        const cap = new THREE.Mesh(capGeometry, capMaterial);
                        cap.position.set(peak.position.x, peakHeight * 0.9, peak.position.z);
                        cliffGroup.add(cap);
                    }
                    
                    // Add smaller secondary peak beside main ones
                    if (Math.random() > 0.4) {
                        const secondaryHeight = peakHeight * (0.4 + Math.random() * 0.3);
                        const secondaryRadius = secondaryHeight * 0.5;
                        const secondaryGeometry = new THREE.ConeGeometry(secondaryRadius, secondaryHeight, 6);
                        const secondaryMaterial = getTexturedMaterial('lambert', { 
                            map: textures.rock,
                            color: 0x6A6A5A
                        }, 'rock');
                        const secondaryPeak = new THREE.Mesh(secondaryGeometry, secondaryMaterial);
                        const sideOffset = (Math.random() > 0.5 ? 1 : -1) * (peakRadius * 0.8 + secondaryRadius * 0.6);
                        secondaryPeak.position.set(
                            peak.position.x + sideOffset,
                            secondaryHeight / 2,
                            peak.position.z + (Math.random() - 0.5) * 1.5
                        );
                        secondaryPeak.castShadow = true;
                        cliffGroup.add(secondaryPeak);
                    }
                }
                
                // Add ridge lines connecting peaks
                const ridgeCount = Math.max(2, Math.floor(wallWidth / 15));
                for (let r = 0; r < ridgeCount; r++) {
                    const ridgeWidth = 3 + Math.random() * 4;
                    const ridgeHeight = wallHeight * (0.2 + Math.random() * 0.2);
                    const ridgeGeometry = new THREE.BoxGeometry(ridgeWidth, ridgeHeight, 1.5);
                    const ridgeMaterial = getTexturedMaterial('lambert', { 
                        map: textures.rock,
                        color: 0x6A6A5A 
                    }, 'rock');
                    const ridge = new THREE.Mesh(ridgeGeometry, ridgeMaterial);
                    ridge.position.set(
                        -wallWidth/2 + Math.random() * wallWidth,
                        ridgeHeight / 2,
                        (Math.random() - 0.5) * 3
                    );
                    ridge.rotation.y = (Math.random() - 0.5) * 0.5;
                    ridge.castShadow = true;
                    cliffGroup.add(ridge);
                }
                
                // Boulder rocks scattered along base of range
                const numBoulders = Math.max(5, Math.floor(wallWidth / 8));
                for (let b = 0; b < numBoulders; b++) {
                    const boulderSize = 0.5 + Math.random() * 1.0;
                    const boulderGeometry = new THREE.DodecahedronGeometry(boulderSize, 0);
                    const boulderMaterial = getTexturedMaterial('lambert', { 
                        map: textures.rock,
                        color: 0x5A5A4A 
                    }, 'rock');
                    const boulder = new THREE.Mesh(boulderGeometry, boulderMaterial);
                    boulder.position.set(
                        -wallWidth/2 + Math.random() * wallWidth,
                        boulderSize * 0.4,
                        (Math.random() - 0.5) * 5
                    );
                    boulder.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    boulder.castShadow = true;
                    cliffGroup.add(boulder);
                }
                
                // Add some small rock outcroppings
                const outcroppingCount = Math.floor(wallWidth / 10);
                for (let o = 0; o < outcroppingCount; o++) {
                    const outHeight = 1 + Math.random() * 2;
                    const outGeometry = new THREE.ConeGeometry(outHeight * 0.6, outHeight, 5);
                    const outMaterial = getTexturedMaterial('lambert', { 
                        map: textures.rock,
                        color: 0x7A7A6A
                    }, 'rock');
                    const outcropping = new THREE.Mesh(outGeometry, outMaterial);
                    outcropping.position.set(
                        -wallWidth/2 + Math.random() * wallWidth,
                        outHeight * 0.5,
                        2 + Math.random() * 3
                    );
                    outcropping.rotation.x = (Math.random() - 0.5) * 0.3;
                    outcropping.castShadow = true;
                    cliffGroup.add(outcropping);
                }
                
                cliffGroup.position.set(mtn.x, 0, mtn.z);
                _scene.add(cliffGroup);
                
            } else {
                // Stone wall section with ivy and moss
                // Stone wall base
                const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
                const wallMaterial = getTexturedMaterial('lambert', { 
                    color: 0x7A7A7A,
                    map: textures.rock
                }, 'rock');
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(mtn.x, wallHeight/2, mtn.z);
                wall.castShadow = true;
                _scene.add(wall);
                
                // Stone cap on top
                const capHeight = Math.min(0.4, wallHeight * 0.1);
                const capGeometry = new THREE.BoxGeometry(wallWidth + 0.6, capHeight, wallDepth + 0.6);
                const capMaterial = getMaterial('lambert', { color: 0x5A5A5A });
                const cap = new THREE.Mesh(capGeometry, capMaterial);
                cap.position.set(mtn.x, wallHeight + capHeight/2, mtn.z);
                _scene.add(cap);
                
                // Ivy vines climbing walls
                const ivyColor = 0x2D5A2D;
                const ivyCount = Math.max(3, Math.floor(wallWidth / 5));
                for (let i = 0; i < ivyCount; i++) {
                    const ivyX = mtn.x - wallWidth/2 + (i + 0.5) * (wallWidth / ivyCount) + (Math.random() - 0.5) * 2;
                    const vineHeight = wallHeight * (0.5 + Math.random() * 0.5);
                    
                    // Vine stem
                    const stemGeometry = new THREE.CylinderGeometry(0.08, 0.12, vineHeight, 6);
                    const stemMaterial = getMaterial('lambert', { color: 0x3D4A3D });
                    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                    stem.position.set(ivyX, vineHeight/2, mtn.z + wallDepth/2 + 0.15);
                    _scene.add(stem);
                    
                    // Ivy leaves along the vine
                    const leafCount = Math.floor(vineHeight / 0.8);
                    for (let j = 0; j < leafCount; j++) {
                        const leafGeometry = new THREE.SphereGeometry(0.25 + Math.random() * 0.15, 6, 6);
                        const leafMaterial = getMaterial('lambert', { color: ivyColor });
                        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                        leaf.position.set(
                            ivyX + (Math.random() - 0.5) * 0.6,
                            0.4 + j * (vineHeight / leafCount),
                            mtn.z + wallDepth/2 + 0.2 + Math.random() * 0.2
                        );
                        leaf.scale.set(1.3, 0.6, 1);
                        _scene.add(leaf);
                    }
                }
                
                // Moss patches on wall
                const mossCount = Math.floor(wallWidth / 4);
                for (let i = 0; i < mossCount; i++) {
                    const mossGeometry = new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 8, 8);
                    const mossMaterial = getMaterial('lambert', { color: 0x4A5D3A });
                    const moss = new THREE.Mesh(mossGeometry, mossMaterial);
                    moss.position.set(
                        mtn.x - wallWidth/2 + Math.random() * wallWidth,
                        Math.random() * wallHeight * 0.7,
                        mtn.z + wallDepth/2 + 0.1
                    );
                    moss.scale.set(1.5, 0.5, 0.8);
                    _scene.add(moss);
                }
                
                // Small flowers growing on wall
                const flowerColors = [0xFF69B4, 0xFFD700, 0xFF6347, 0x9370DB];
                const flowerCount = Math.floor(wallWidth / 3);
                for (let i = 0; i < flowerCount; i++) {
                    const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                    const flowerGeometry = getGeometry('sphere', 0.15, 8, 8);
                    const flowerMaterial = getMaterial('lambert', { color: flowerColor });
                    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                    flower.position.set(
                        mtn.x - wallWidth/2 + Math.random() * wallWidth,
                        wallHeight * 0.1 + Math.random() * wallHeight * 0.5,
                        mtn.z + wallDepth/2 + 0.25
                    );
                    _scene.add(flower);
                }
            }
            
        } else if (labyrinthTheme) {
            // =========================================
            // Heavily overgrown ancient labyrinth walls
            // Walls are barely visible under dense vegetation
            // Decorations distributed across ALL four faces proportionally
            // =========================================
            const wallHeight = mtn.height;
            const wallWidth = mtn.width;
            const wallDepth = mtn.depth || Math.min(mtn.width * 0.15, 8);
            
            // Pin all subsequent _addLabyrinthDeco calls to this wall's center
            // so all its decorations land in the same visibility chunk.
            _setLabyrinthDecoWall(mtn.x, mtn.z);
            
            // Probability of placing a side decoration on a Z-normal face vs X-normal face
            // For a 143×11 wall: zFaceProb=0.93 (most on long Z faces)
            // For a  11×11 pillar: zFaceProb=0.50 (equal distribution)
            const zFaceProb = wallWidth / (wallWidth + wallDepth);
            
            // Helper: pick a random wall face and return position along it
            // alongFrac: 0-1 position along the face
            // perpOffset: outward distance from the face surface
            function wallSidePos(alongFrac, perpOffset) {
                const side = Math.random() < 0.5 ? 1 : -1;
                if (Math.random() < zFaceProb) {
                    return {
                        x: mtn.x - wallWidth/2 + alongFrac * wallWidth,
                        z: mtn.z + side * (wallDepth/2 + perpOffset),
                        side: side, onZFace: true
                    };
                } else {
                    return {
                        x: mtn.x + side * (wallWidth/2 + perpOffset),
                        z: mtn.z - wallDepth/2 + alongFrac * wallDepth,
                        side: side, onZFace: false
                    };
                }
            }
            
            // Main stone wall - dark, mossy, and textured
            const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
            // Scale UV repeats so texture density is consistent regardless of wall size
            const repeatX = Math.max(1, Math.round(wallWidth / 11));
            const repeatY = Math.max(1, Math.round(wallHeight / 8));
            const stoneTexClone = textures.labyrinthStone.clone();
            stoneTexClone.needsUpdate = true;
            stoneTexClone.wrapS = THREE.RepeatWrapping;
            stoneTexClone.wrapT = THREE.RepeatWrapping;
            stoneTexClone.repeat.set(repeatX, repeatY);
            const wallColors = [0x3A5B3E, 0x2E4E32, 0x44634A, 0x385838];
            const wallMaterial = new THREE.MeshLambertMaterial({
                map: stoneTexClone,
                color: wallColors[Math.floor(Math.random() * wallColors.length)]
            });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(mtn.x, wallHeight / 2, mtn.z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            _scene.add(wall);
            
            // Thick living green cap on top (overgrown top surface)
            const capGeometry = new THREE.BoxGeometry(wallWidth + 0.6, 0.7, wallDepth + 0.7);
            const capMaterial = getMaterial('lambert', { color: 0x3A7B2A });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.set(mtn.x, wallHeight + 0.35, mtn.z);
            _scene.add(cap);
            
            // All decorations go into proximity-loaded chunks based on each item's position
            // Skip dense vegetation for rotated walls (e.g. chunk boundary walls) because
            // the rotation proxy zeroes mtn.x/z, so decoration positions would all land at
            // the world origin instead of the actual wall location.
            if (!hasRotation) {
            
            // Dense grass tufts growing on top of wall — cover full top surface
            const topArea = wallWidth * wallDepth;
            const tuftsCount = Math.max(2, Math.floor(Math.sqrt(topArea) / 2));
            for (let i = 0; i < tuftsCount; i++) {
                const tuftGeometry = new THREE.ConeGeometry(0.2 + Math.random() * 0.25, 0.6 + Math.random() * 0.6, 4);
                const tuftMaterial = getMaterial('lambert', { 
                    color: [0x3A7B2A, 0x4A8B3A, 0x2A6B1A, 0x358025, 0x2D7020][Math.floor(Math.random() * 5)]
                });
                const tuft = new THREE.Mesh(tuftGeometry, tuftMaterial);
                tuft.position.set(
                    mtn.x + (Math.random() - 0.5) * wallWidth,
                    wallHeight + 0.6 + Math.random() * 0.3,
                    mtn.z + (Math.random() - 0.5) * wallDepth
                );
                tuft.rotation.z = (Math.random() - 0.5) * 0.4;
                _addLabyrinthDeco(tuft);
            }
            
            // Small bushes / hedge lumps growing on top of wall
            const bushTopCount = Math.max(1, Math.floor(Math.sqrt(topArea) / 6));
            for (let i = 0; i < bushTopCount; i++) {
                const bushGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 5, 5);
                const bushMaterial = getMaterial('lambert', { 
                    color: [0x2A6B1A, 0x3A7B2A, 0x1E5A10][Math.floor(Math.random() * 3)]
                });
                const bush = new THREE.Mesh(bushGeometry, bushMaterial);
                bush.position.set(
                    mtn.x + (Math.random() - 0.5) * wallWidth,
                    wallHeight + 0.5 + Math.random() * 0.3,
                    mtn.z + (Math.random() - 0.5) * wallDepth
                );
                bush.scale.set(1.2 + Math.random() * 0.5, 0.6 + Math.random() * 0.4, 1.0 + Math.random() * 0.3);
                _addLabyrinthDeco(bush);
            }
            
            // Dense moss bulges covering wall faces — distributed across all 4 faces
            const mossCount = Math.max(2, Math.floor(wallWidth / 2.5));
            for (let i = 0; i < mossCount; i++) {
                const mossGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 5, 5);
                const mossMaterial = getMaterial('lambert', { 
                    color: [0x4A6B3A, 0x3A5B2A, 0x5A7B4A, 0x3D6B30, 0x2E5420][Math.floor(Math.random() * 5)]
                });
                const moss = new THREE.Mesh(mossGeometry, mossMaterial);
                const fp = wallSidePos(Math.random(), 0.05);
                moss.position.set(
                    fp.x,
                    Math.random() * wallHeight * 0.8 + wallHeight * 0.1,
                    fp.z
                );
                moss.scale.set(1.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.3, 0.8 + Math.random() * 0.3);
                _addLabyrinthDeco(moss);
            }
            
            // Ivy vines climbing all sides of every wall
            const totalFaceLen = 2 * wallWidth + 2 * wallDepth;
            const ivyVineCount = Math.max(1, Math.floor(totalFaceLen / 10));
            for (let v = 0; v < ivyVineCount; v++) {
                // Pick a face for this vine
                const onZFace = Math.random() < zFaceProb;
                const side = Math.random() < 0.5 ? 1 : -1;
                const faceLen = onZFace ? wallWidth : wallDepth;
                const vineAlong = mtn.x - wallWidth/2 + (v + 0.5) * (wallWidth / ivyVineCount); // fallback
                const vinePosAlong = -faceLen/2 + (Math.random()) * faceLen;
                const segCount = Math.floor(wallHeight / 0.5);
                // Main vine stem
                for (let s = 0; s < segCount; s++) {
                    const stemGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.55, 3);
                    const stemMaterial = getMaterial('lambert', { color: 0x2A4A1A });
                    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                    const meander = Math.sin(s * 0.6) * 0.4;
                    if (onZFace) {
                        stem.position.set(
                            mtn.x + vinePosAlong + meander,
                            s * 0.5 + 0.25,
                            mtn.z + side * (wallDepth/2 + 0.06)
                        );
                    } else {
                        stem.position.set(
                            mtn.x + side * (wallWidth/2 + 0.06),
                            s * 0.5 + 0.25,
                            mtn.z + vinePosAlong + meander
                        );
                    }
                    stem.rotation.z = Math.sin(s * 0.6) * 0.3;
                    _addLabyrinthDeco(stem);
                    
                    // Ivy leaves along the vine (every other segment)
                    if (s % 2 === 0 || Math.random() < 0.6) {
                        const leafGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.12, 3, 3);
                        const leafMaterial = getMaterial('lambert', { 
                            color: [0x2A5A1A, 0x3A6B2A, 0x1E4E12, 0x357025][Math.floor(Math.random() * 4)]
                        });
                        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                        const leafSide = Math.random() < 0.5 ? -0.2 : 0.2;
                        if (onZFace) {
                            leaf.position.set(
                                mtn.x + vinePosAlong + meander + leafSide,
                                s * 0.5 + 0.3,
                                mtn.z + side * (wallDepth/2 + 0.12)
                            );
                        } else {
                            leaf.position.set(
                                mtn.x + side * (wallWidth/2 + 0.12),
                                s * 0.5 + 0.3,
                                mtn.z + vinePosAlong + meander + leafSide
                            );
                        }
                        leaf.scale.set(1.4, 0.5, 1.0);
                        _addLabyrinthDeco(leaf);
                    }
                }
                // Branching tendrils at the top
                if (Math.random() < 0.7) {
                    for (let b = 0; b < 2; b++) {
                        const tendrilGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.8, 3);
                        const tendrilMaterial = getMaterial('lambert', { color: 0x2A4A1A });
                        const tendril = new THREE.Mesh(tendrilGeometry, tendrilMaterial);
                        const tOff = b === 0 ? -0.4 : 0.4;
                        if (onZFace) {
                            tendril.position.set(
                                mtn.x + vinePosAlong + tOff,
                                wallHeight - 0.3,
                                mtn.z + side * (wallDepth/2 + 0.08)
                            );
                        } else {
                            tendril.position.set(
                                mtn.x + side * (wallWidth/2 + 0.08),
                                wallHeight - 0.3,
                                mtn.z + vinePosAlong + tOff
                            );
                        }
                        tendril.rotation.z = (b === 0 ? 0.5 : -0.5);
                        _addLabyrinthDeco(tendril);
                    }
                }
            }
            
            // Hanging moss drapes from top of wall — all faces
            const drapesCount = Math.max(1, Math.floor(totalFaceLen / 16));
            for (let d = 0; d < drapesCount; d++) {
                const fp = wallSidePos(Math.random(), 0.15);
                const drapeLength = 1.0 + Math.random() * 2.5;
                const drapeSegments = Math.floor(drapeLength / 0.3);
                for (let s = 0; s < drapeSegments; s++) {
                    const segGeometry = new THREE.SphereGeometry(0.06 + (1 - s / drapeSegments) * 0.06, 3, 3);
                    const segMaterial = getMaterial('lambert', { 
                        color: [0x5A8B4A, 0x4A7B3A, 0x6A9B5A][Math.floor(Math.random() * 3)]
                    });
                    const seg = new THREE.Mesh(segGeometry, segMaterial);
                    if (fp.onZFace) {
                        seg.position.set(
                            fp.x + Math.sin(s * 0.3) * 0.15,
                            wallHeight - s * 0.3,
                            fp.z
                        );
                    } else {
                        seg.position.set(
                            fp.x,
                            wallHeight - s * 0.3,
                            fp.z + Math.sin(s * 0.3) * 0.15
                        );
                    }
                    seg.scale.set(1.5, 1.0, 0.8);
                    _addLabyrinthDeco(seg);
                }
            }
            
            // Colorful flowers growing from wall cracks — all faces
            const flowerColors = [0xFF69B4, 0xFFD700, 0xFF6347, 0x9370DB, 0xFFB6C1, 0xFFA500, 0xE6E600, 0xFF85C2, 0xB266FF];
            const wallFlowerCount = Math.max(2, Math.floor(wallWidth / 4));
            for (let i = 0; i < wallFlowerCount; i++) {
                if (Math.random() < 0.85) {
                    const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                    const flowerGeometry = new THREE.SphereGeometry(0.12 + Math.random() * 0.1, 5, 5);
                    const flowerMaterial = getMaterial('lambert', { color: flowerColor });
                    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                    const fp = wallSidePos(Math.random(), 0.15);
                    flower.position.set(
                        fp.x,
                        0.3 + Math.random() * wallHeight * 0.7,
                        fp.z
                    );
                    _addLabyrinthDeco(flower);
                    // Add flower stem
                    const stemGeometry = new THREE.CylinderGeometry(0.015, 0.02, 0.3, 3);
                    const stemMaterial = getMaterial('lambert', { color: 0x2A5A1A });
                    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                    if (fp.onZFace) {
                        stem.position.set(flower.position.x, flower.position.y - 0.15, flower.position.z - fp.side * 0.03);
                    } else {
                        stem.position.set(flower.position.x - fp.side * 0.03, flower.position.y - 0.15, flower.position.z);
                    }
                    _addLabyrinthDeco(stem);
                }
            }
            
            // Flowers on top of wall too — cover full top surface
            const topFlowerCount = Math.max(1, Math.floor(Math.sqrt(topArea) / 5));
            for (let i = 0; i < topFlowerCount; i++) {
                const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                const stemH = 0.3 + Math.random() * 0.4;
                // Stem
                const stemGeometry = new THREE.CylinderGeometry(0.02, 0.025, stemH, 3);
                const stemMaterial = getMaterial('lambert', { color: 0x2A5A1A });
                const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                const fx = mtn.x + (Math.random() - 0.5) * wallWidth;
                const fz = mtn.z + (Math.random() - 0.5) * wallDepth;
                stem.position.set(fx, wallHeight + 0.5 + stemH/2, fz);
                _addLabyrinthDeco(stem);
                // Bloom
                const bloomGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.08, 5, 5);
                const bloomMaterial = getMaterial('lambert', { color: flowerColor });
                const bloom = new THREE.Mesh(bloomGeometry, bloomMaterial);
                bloom.position.set(fx, wallHeight + 0.5 + stemH + 0.05, fz);
                _addLabyrinthDeco(bloom);
            }
            
            // Dense ferns at wall base on all sides
            const fernCount = Math.max(2, Math.floor(wallWidth / 4));
            for (let i = 0; i < fernCount; i++) {
                if (Math.random() < 0.8) {
                    const fernSize = 0.3 + Math.random() * 0.4;
                    const fernGeometry = new THREE.ConeGeometry(fernSize, fernSize * 2.5, 5);
                    const fernMaterial = getMaterial('lambert', { 
                        color: [0x3A7B2A, 0x2A6B1A, 0x4A8B3A, 0x358528][Math.floor(Math.random() * 4)]
                    });
                    const fern = new THREE.Mesh(fernGeometry, fernMaterial);
                    const fp = wallSidePos(Math.random(), 0.3 + Math.random() * 0.4);
                    fern.position.set(
                        fp.x,
                        fernSize * 1.2,
                        fp.z
                    );
                    fern.rotation.z = fp.side * (0.1 + Math.random() * 0.25);
                    fern.rotation.y = Math.random() * Math.PI;
                    _addLabyrinthDeco(fern);
                }
            }
            
            // Root systems at wall base — all faces
            const rootCount = Math.max(1, Math.floor(wallWidth / 7));
            for (let i = 0; i < rootCount; i++) {
                if (Math.random() < 0.65) {
                    const fp = wallSidePos(Math.random(), 0);
                    const side = fp.side;
                    for (let r = 0; r < 2 + Math.floor(Math.random() * 2); r++) {
                        const rootLen = 0.5 + Math.random() * 1.0;
                        const rootGeometry = new THREE.CylinderGeometry(0.04, 0.02, rootLen, 3);
                        const rootMaterial = getMaterial('lambert', { color: [0x4A3A2A, 0x3A2A1A, 0x5A4A3A][Math.floor(Math.random() * 3)] });
                        const root = new THREE.Mesh(rootGeometry, rootMaterial);
                        if (fp.onZFace) {
                            root.position.set(
                                fp.x + (Math.random() - 0.5) * 0.5,
                                0.1 + Math.random() * 0.15,
                                mtn.z + side * (wallDepth/2 + rootLen/3)
                            );
                            root.rotation.x = side * (0.8 + Math.random() * 0.5);
                        } else {
                            root.position.set(
                                mtn.x + side * (wallWidth/2 + rootLen/3),
                                0.1 + Math.random() * 0.15,
                                fp.z + (Math.random() - 0.5) * 0.5
                            );
                            root.rotation.z = -side * (0.8 + Math.random() * 0.5);
                        }
                        root.rotation.y = Math.random() * Math.PI;
                        _addLabyrinthDeco(root);
                    }
                }
            }
            
            // Mushroom clusters at wall base (occasional) — all faces
            if (Math.random() < 0.35) {
                const mushroomCount = 1 + Math.floor(Math.random() * 3);
                const fp = wallSidePos(0.25 + Math.random() * 0.5, 0);
                for (let m = 0; m < mushroomCount; m++) {
                    const mushroomColors = [0xCD853F, 0xD2691E, 0xA0522D, 0x8B4513, 0xDEB887];
                    // Stem
                    const stemGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.2 + Math.random() * 0.15, 5);
                    const stemMaterial = getMaterial('lambert', { color: 0xFFFACD });
                    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                    const mNoise = (Math.random() - 0.5) * 0.5;
                    if (fp.onZFace) {
                        stem.position.set(fp.x + mNoise, 0.12, mtn.z + fp.side * (wallDepth/2 + 0.3 + Math.random() * 0.3));
                    } else {
                        stem.position.set(mtn.x + fp.side * (wallWidth/2 + 0.3 + Math.random() * 0.3), 0.12, fp.z + mNoise);
                    }
                    _addLabyrinthDeco(stem);
                    // Cap
                    const capGeometry = new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 5, 5);
                    const capMaterial = getMaterial('lambert', { color: mushroomColors[Math.floor(Math.random() * mushroomColors.length)] });
                    const mushroomCap = new THREE.Mesh(capGeometry, capMaterial);
                    mushroomCap.position.set(stem.position.x, 0.25, stem.position.z);
                    mushroomCap.scale.set(1.5, 0.7, 1.5);
                    _addLabyrinthDeco(mushroomCap);
                }
            }
            
            } // end if (!hasRotation) — skip decorations for rotated walls
            
        } else {
            // Regular mountain (cone shape)
            const mountainGeometry = new THREE.ConeGeometry(mtn.width/2, mtn.height, 6);
            let mountainMaterial;
            
            if (candyTheme) {
                // Rock candy / crystal mountains
                const crystalColors = [0xFF69B4, 0x87CEEB, 0xDDA0DD, 0x98FB98];
                const crystalColor = crystalColors[Math.floor(Math.random() * crystalColors.length)];
                mountainMaterial = getMaterial('phong', { 
                    color: crystalColor,
                    shininess: 100,
                    transparent: true,
                    opacity: 0.85
                });
            } else {
                mountainMaterial = getTexturedMaterial('lambert', { 
                    map: textures.mountain,
                    color: 0xaaaaaa
                }, 'mountain');
            }
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            mountain.position.set(mtn.x, mtn.height/2, mtn.z);
            _scene.add(mountain);
            
            if (candyTheme) {
                // Frosting top instead of snow
                const frostingGeometry = new THREE.ConeGeometry(mtn.width/4, mtn.height/3, 6);
                const frostingMaterial = getMaterial('phong', { 
                    color: 0xFFFFFF,
                    shininess: 80
                });
                const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial);
                frosting.position.set(mtn.x, mtn.height * 0.75, mtn.z);
                _scene.add(frosting);
                
                // Add cherry on top
                const cherryGeometry = new THREE.SphereGeometry(mtn.width/8, 12, 12);
                const cherryMaterial = getMaterial('phong', { color: 0xFF0000, shininess: 100 });
                const cherry = new THREE.Mesh(cherryGeometry, cherryMaterial);
                cherry.position.set(mtn.x, mtn.height * 0.95, mtn.z);
                _scene.add(cherry);
            } else {
                // Snow cap on top
                const snowGeometry = new THREE.ConeGeometry(mtn.width/4, mtn.height/3, 6);
                const snowMaterial = getTexturedMaterial('lambert', { 
                    map: textures.snow,
                    color: 0xffffff
                }, 'snow');
                const snow = new THREE.Mesh(snowGeometry, snowMaterial);
                snow.position.set(mtn.x, mtn.height * 0.75, mtn.z);
                _scene.add(snow);
            }
        }

        // If this mountain was rotated, finalize the proxy Group:
        // rotate it, position it at the original coordinates, and add to the real scene.
        if (hasRotation && proxyGroup) {
            proxyGroup.rotation.y = mtn.rotation;
            proxyGroup.position.set(origX, 0, origZ);
            scene.add(proxyGroup);
        }
    });

}

// Create computer-themed ground with circuit board pattern and glowing grid lines
function createComputerGround(scene, THREE) {
    // Base dark ground
    const groundGeometry = getGeometry('plane', 600, 600, 1, 1);
    const groundMaterial = getMaterial('lambert', { 
        color: 0x000808,  // Very dark teal-black
        emissive: 0x001111,
        emissiveIntensity: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create glowing grid lines - raised position to be clearly visible
    const gridSpacing = 8;  // Denser grid
    const gridExtent = 300;
    const gridMaterial = getMaterial('basic', { 
        color: 0x00FFFF,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false  // Prevents z-fighting
    });
    
    // Create line group for grid
    const gridGroup = new THREE.Group();
    gridGroup.renderOrder = 1;  // Render after ground
    
    // X-axis lines (running along X)
    for (let z = -gridExtent; z <= gridExtent; z += gridSpacing) {
        const lineGeometry = new THREE.PlaneGeometry(gridExtent * 2, 0.2);  // Thicker lines
        const line = new THREE.Mesh(lineGeometry, gridMaterial.clone());
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.15, z);  // Raised higher
        
        // Make some lines brighter (major grid lines)
        if (z % 40 === 0) {
            line.material.opacity = 1.0;
            line.material.color.setHex(0x00FFFF);
            line.scale.y = 3; // Wider major lines
        }
        
        gridGroup.add(line);
    }
    
    // Z-axis lines (running along Z)
    for (let x = -gridExtent; x <= gridExtent; x += gridSpacing) {
        const lineGeometry = new THREE.PlaneGeometry(0.2, gridExtent * 2);  // Thicker lines
        const line = new THREE.Mesh(lineGeometry, gridMaterial.clone());
        line.rotation.x = -Math.PI / 2;
        line.position.set(x, 0.15, 0);  // Raised higher
        
        // Make some lines brighter (major grid lines)
        if (x % 40 === 0) {
            line.material.opacity = 1.0;
            line.material.color.setHex(0x00FFFF);
            line.scale.x = 3; // Wider major lines
        }
        
        gridGroup.add(line);
    }
    
    scene.add(gridGroup);
    
    // Add some glowing accent circles/nodes at intersections
    const nodeGeometry = getGeometry('circle', 0.5, 16);
    const nodeMaterial = getMaterial('basic', { 
        color: 0xFF00FF,  // Magenta nodes
        transparent: true,
        opacity: 0.8
    });
    
    // Place nodes at major intersections
    for (let x = -gridExtent; x <= gridExtent; x += 50) {
        for (let z = -gridExtent; z <= gridExtent; z += 50) {
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
            node.rotation.x = -Math.PI / 2;
            node.position.set(x, 0.03, z);
            scene.add(node);
        }
    }
    
    // Add larger data hub circles at key points
    const hubPositions = [
        { x: 0, z: 100 },
        { x: -100, z: 0 },
        { x: 100, z: 0 },
        { x: 0, z: -100 },
        { x: 0, z: 0 }
    ];
    
    hubPositions.forEach(pos => {
        // Outer ring
        const ringGeometry = getGeometry('ring', 3, 4, 32);
        const ringMaterial = getMaterial('basic', { 
            color: 0x00FF00,  // Green data hubs
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(pos.x, 0.04, pos.z);
        scene.add(ring);
        
        // Inner circle
        const centerGeometry = getGeometry('circle', 2, 32);
        const centerMaterial = getMaterial('basic', { 
            color: 0x00FF88,
            transparent: true,
            opacity: 0.6
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.rotation.x = -Math.PI / 2;
        center.position.set(pos.x, 0.035, pos.z);
        scene.add(center);
    });
    
    // Add some random circuit traces
    for (let i = 0; i < 50; i++) {
        const traceLength = 10 + Math.random() * 40;
        const traceGeometry = new THREE.PlaneGeometry(traceLength, 0.3);
        const traceMaterial = getMaterial('basic', { 
            color: Math.random() > 0.5 ? 0x00FFFF : 0xFF00FF,
            transparent: true,
            opacity: 0.4 + Math.random() * 0.3
        });
        const trace = new THREE.Mesh(traceGeometry, traceMaterial);
        trace.rotation.x = -Math.PI / 2;
        trace.rotation.z = Math.random() * Math.PI;
        trace.position.set(
            (Math.random() - 0.5) * 500,
            0.015,
            (Math.random() - 0.5) * 500
        );
        scene.add(trace);
    }
    
    return ground;
}

// Create ground plane
function createGround(scene, THREE, groundColor, iceTheme, desertTheme, lavaTheme, waterTheme, candyTheme, graveyardTheme, ruinsTheme, computerTheme, christmasTheme, crystalTheme, rapunzelTheme, labyrinthTheme) {
    const textures = getTerrainTextures(THREE);
    const color = groundColor || 0xffffff; // Tint color applied over texture
    let textureToUse;
    let groundMaterial;
    
    // Computer theme - circuit board with glowing grid lines
    if (computerTheme) {
        createComputerGround(scene, THREE);
        return;
    }
    
    if (waterTheme) {
        // Water surface with animated waves - higher resolution for more detail
        const waterGeometry = new THREE.PlaneGeometry(600, 600, 150, 150);
        
        // Add wave animation to vertices
        const vertices = waterGeometry.attributes.position;
        const waveData = [];
        for (let i = 0; i < vertices.count; i++) {
            waveData.push({
                x: vertices.getX(i),
                z: vertices.getY(i), // PlaneGeometry Y becomes world Z after rotation
                randomPhase: Math.random() * Math.PI * 2
            });
        }
        
        const waterTexture = generateWaterTexture(THREE);
        groundMaterial = getTexturedMaterial('lambert', { 
            map: waterTexture,
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            flatShading: true
        }, 'water');
        
        const water = new THREE.Mesh(waterGeometry, groundMaterial);
        water.rotation.x = -Math.PI / 2;
        water.receiveShadow = true;
        scene.add(water);
        
        // Store water data for animation
        water.userData = { waveData, vertices };
        
        // Add to scene for access in game loop
        scene.userData.water = water;
        
        return water;
    } else if (lavaTheme) {
        textureToUse = textures.rock || textures.grass; // Use rock texture for lava caves
    } else if (desertTheme) {
        textureToUse = textures.sand || textures.grass; // Fall back to grass if no sand texture
    } else if (candyTheme) {
        textureToUse = textures.candy || textures.grass; // Candy frosting texture
    } else if (graveyardTheme) {
        textureToUse = textures.graveyard || textures.grass; // Graveyard dead grass/dirt texture
    } else if (ruinsTheme) {
        textureToUse = textures.grass; // Green grass ground for ruins // Stone floor texture for ruins
    } else if (iceTheme || christmasTheme) {
        textureToUse = textures.grassIce;
    } else if (crystalTheme) {
        textureToUse = textures.rock || textures.grass; // Dark cave rock floor
    } else if (labyrinthTheme) {
        textureToUse = textures.labyrinthGround; // Mossy stone floor
    } else {
        textureToUse = textures.grass;
    }
    // Determine texture name for ground material caching
    let groundTextureName = 'grass';
    if (lavaTheme) groundTextureName = 'rock';
    else if (desertTheme) groundTextureName = 'sand';
    else if (candyTheme) groundTextureName = 'candy';
    else if (graveyardTheme) groundTextureName = 'graveyard';
    else if (ruinsTheme) groundTextureName = 'grass';
    else if (iceTheme || christmasTheme) groundTextureName = 'grassIce';
    else if (crystalTheme) groundTextureName = 'rock';
    else if (labyrinthTheme) groundTextureName = 'labyrinthGround';
    const groundGeometry = getGeometry('plane', 600, 600, 1, 1);
    groundMaterial = getTexturedMaterial('lambert', { 
        map: textureToUse,
        color: color
    }, groundTextureName);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Labyrinth ground vegetation - scatter plants, grass clumps, flowers, moss across the ground
    if (labyrinthTheme) {
        createLabyrinthGroundVegetation(scene, THREE);
    }
}

// Dense ground vegetation for labyrinth theme - uses chunk manager for proximity loading
function createLabyrinthGroundVegetation(scene, THREE) {
    // Ensure chunk manager is initialized (may be called after createMountains)
    if (!_labyrinthDecoScene) {
        _labyrinthDecoScene = scene;
        _labyrinthDecoTHREE = THREE;
    }
    const extent = 200; // Cover a large area
    
    // Helper: add mesh to the correct spatial chunk
    function addDeco(mesh, x, z) {
        _getLabyrinthDecoChunk(x, z).add(mesh);
    }
    
    // Tall grass clumps scattered everywhere
    for (let i = 0; i < 350; i++) {
        const x = (Math.random() - 0.5) * extent * 2;
        const z = (Math.random() - 0.5) * extent * 2;
        const clumpSize = 2 + Math.floor(Math.random() * 4);
        for (let g = 0; g < clumpSize; g++) {
            const grassH = 0.3 + Math.random() * 0.5;
            const grassGeometry = new THREE.ConeGeometry(0.08 + Math.random() * 0.08, grassH, 3);
            const grassMaterial = getMaterial('lambert', { 
                color: [0x3A7B2A, 0x4A8B3A, 0x2A6B1A, 0x358025, 0x2D7020, 0x4A9B40][Math.floor(Math.random() * 6)]
            });
            const grass = new THREE.Mesh(grassGeometry, grassMaterial);
            const gx = x + (Math.random() - 0.5) * 1.2;
            const gz = z + (Math.random() - 0.5) * 1.2;
            grass.position.set(gx, grassH / 2, gz);
            grass.rotation.z = (Math.random() - 0.5) * 0.3;
            grass.rotation.x = (Math.random() - 0.5) * 0.2;
            addDeco(grass, gx, gz);
        }
    }
    
    // Wildflower patches on the ground
    const flowerColors = [0xFF69B4, 0xFFD700, 0xFF6347, 0x9370DB, 0xFFB6C1, 0xFFA500, 0xE6E600, 0xFF85C2, 0xB266FF, 0xFFFFFF, 0xFF4444];
    for (let i = 0; i < 200; i++) {
        const px = (Math.random() - 0.5) * extent * 2;
        const pz = (Math.random() - 0.5) * extent * 2;
        const patchFlowers = 1 + Math.floor(Math.random() * 4);
        for (let f = 0; f < patchFlowers; f++) {
            const stemH = 0.2 + Math.random() * 0.3;
            const stemGeometry = new THREE.CylinderGeometry(0.015, 0.02, stemH, 3);
            const stemMaterial = getMaterial('lambert', { color: 0x2A5A1A });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            const fx = px + (Math.random() - 0.5) * 1.5;
            const fz = pz + (Math.random() - 0.5) * 1.5;
            stem.position.set(fx, stemH / 2, fz);
            addDeco(stem, fx, fz);
            const bloomSize = 0.06 + Math.random() * 0.08;
            const bloomGeometry = new THREE.SphereGeometry(bloomSize, 5, 5);
            const bloomMaterial = getMaterial('lambert', { 
                color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
            });
            const bloom = new THREE.Mesh(bloomGeometry, bloomMaterial);
            bloom.position.set(fx, stemH + bloomSize * 0.5, fz);
            addDeco(bloom, fx, fz);
        }
    }
    
    // Moss patches on ground (flat green circles)
    for (let i = 0; i < 120; i++) {
        const patchSize = 0.5 + Math.random() * 1.5;
        const mossGeometry = new THREE.CircleGeometry(patchSize, 8);
        const mossMaterial = getMaterial('lambert', { 
            color: [0x3A6B2A, 0x4A7B3A, 0x2A5B1A, 0x3D7030][Math.floor(Math.random() * 4)]
        });
        const moss = new THREE.Mesh(mossGeometry, mossMaterial);
        moss.rotation.x = -Math.PI / 2;
        const mx = (Math.random() - 0.5) * extent * 2;
        const mz = (Math.random() - 0.5) * extent * 2;
        moss.position.set(mx, 0.02 + Math.random() * 0.01, mz);
        addDeco(moss, mx, mz);
    }
    
    // Small ferns scattered on ground
    for (let i = 0; i < 150; i++) {
        const fernSize = 0.2 + Math.random() * 0.35;
        const fernGeometry = new THREE.ConeGeometry(fernSize, fernSize * 2.2, 5);
        const fernMaterial = getMaterial('lambert', { 
            color: [0x3A7B2A, 0x2A6B1A, 0x4A8B3A, 0x358528][Math.floor(Math.random() * 4)]
        });
        const fern = new THREE.Mesh(fernGeometry, fernMaterial);
        const fx = (Math.random() - 0.5) * extent * 2;
        const fz = (Math.random() - 0.5) * extent * 2;
        fern.position.set(fx, fernSize * 1.0, fz);
        fern.rotation.z = (Math.random() - 0.5) * 0.3;
        fern.rotation.y = Math.random() * Math.PI * 2;
        addDeco(fern, fx, fz);
    }
    
    // Mushroom clusters on the ground
    for (let i = 0; i < 40; i++) {
        const mx = (Math.random() - 0.5) * extent * 2;
        const mz = (Math.random() - 0.5) * extent * 2;
        const count = 1 + Math.floor(Math.random() * 4);
        const mushroomCapColors = [0xCD853F, 0xD2691E, 0xA0522D, 0x8B4513, 0xDEB887, 0xB22222, 0xF5DEB3];
        for (let m = 0; m < count; m++) {
            const stemH = 0.12 + Math.random() * 0.15;
            const capR = 0.06 + Math.random() * 0.1;
            const stemGeometry = new THREE.CylinderGeometry(capR * 0.4, capR * 0.5, stemH, 5);
            const stemMaterial = getMaterial('lambert', { color: 0xFFFACD });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            const smx = mx + (Math.random() - 0.5) * 0.8;
            const smz = mz + (Math.random() - 0.5) * 0.8;
            stem.position.set(smx, stemH / 2, smz);
            addDeco(stem, smx, smz);
            const capGeometry = new THREE.SphereGeometry(capR, 5, 5);
            const capMaterial = getMaterial('lambert', { 
                color: mushroomCapColors[Math.floor(Math.random() * mushroomCapColors.length)]
            });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.set(smx, stemH + capR * 0.3, smz);
            cap.scale.set(1.5, 0.7, 1.5);
            addDeco(cap, smx, smz);
        }
    }
    
    // Small ground cover bushes (low, wide)
    for (let i = 0; i < 80; i++) {
        const bushSize = 0.3 + Math.random() * 0.5;
        const bushGeometry = new THREE.SphereGeometry(bushSize, 5, 5);
        const bushMaterial = getMaterial('lambert', { 
            color: [0x2A6B1A, 0x3A7B2A, 0x1E5A10, 0x2D7020][Math.floor(Math.random() * 4)]
        });
        const bush = new THREE.Mesh(bushGeometry, bushMaterial);
        const bx = (Math.random() - 0.5) * extent * 2;
        const bz = (Math.random() - 0.5) * extent * 2;
        bush.position.set(bx, bushSize * 0.35, bz);
        bush.scale.set(1.3 + Math.random() * 0.5, 0.4 + Math.random() * 0.3, 1.3 + Math.random() * 0.5);
        addDeco(bush, bx, bz);
    }
    
    // Fallen leaves / debris patches
    const leafColors = [0x8B6914, 0x6B8E23, 0x9ACD32, 0x556B2F, 0x8FBC8F, 0x808000];
    for (let i = 0; i < 100; i++) {
        const leafGeometry = new THREE.CircleGeometry(0.08 + Math.random() * 0.08, 4);
        const leafMaterial = getMaterial('lambert', { 
            color: leafColors[Math.floor(Math.random() * leafColors.length)]
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        leaf.rotation.z = Math.random() * Math.PI * 2;
        const lx = (Math.random() - 0.5) * extent * 2;
        const lz = (Math.random() - 0.5) * extent * 2;
        leaf.position.set(lx, 0.015 + Math.random() * 0.01, lz);
        addDeco(leaf, lx, lz);
    }
    
    // Larger decorative plants (like small palms / broad-leaf plants)
    for (let i = 0; i < 30; i++) {
        const plantX = (Math.random() - 0.5) * extent * 2;
        const plantZ = (Math.random() - 0.5) * extent * 2;
        const stalkH = 0.4 + Math.random() * 0.4;
        const stalkGeometry = new THREE.CylinderGeometry(0.03, 0.05, stalkH, 4);
        const stalkMaterial = getMaterial('lambert', { color: 0x2A5A1A });
        const stalk = new THREE.Mesh(stalkGeometry, stalkMaterial);
        stalk.position.set(plantX, stalkH / 2, plantZ);
        addDeco(stalk, plantX, plantZ);
        const leafCount = 3 + Math.floor(Math.random() * 3);
        for (let l = 0; l < leafCount; l++) {
            const angle = (l / leafCount) * Math.PI * 2 + Math.random() * 0.3;
            const leafLen = 0.3 + Math.random() * 0.3;
            const broadLeafGeometry = new THREE.ConeGeometry(0.1, leafLen, 3);
            const broadLeafMaterial = getMaterial('lambert', { 
                color: [0x2A6B1A, 0x3A7B2A, 0x1E5A10][Math.floor(Math.random() * 3)]
            });
            const broadLeaf = new THREE.Mesh(broadLeafGeometry, broadLeafMaterial);
            broadLeaf.position.set(
                plantX + Math.cos(angle) * 0.15,
                stalkH * 0.7,
                plantZ + Math.sin(angle) * 0.15
            );
            broadLeaf.rotation.z = Math.cos(angle) * 0.8;
            broadLeaf.rotation.x = Math.sin(angle) * 0.8;
            addDeco(broadLeaf, plantX, plantZ);
        }
    }

}

// Create river
function createRiver(scene, THREE) {
    const riverGeometry = getGeometry('plane', 600, 4, 60, 8);
    const riverMaterial = getMaterial('lambert', { 
        color: 0x4682B4,
        transparent: true,
        opacity: 0.8
    });
    const river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.rotation.x = -Math.PI / 2;
    river.position.y = 0.05;
    river.receiveShadow = true;
    scene.add(river);
    
    return {
        mesh: river,
        minZ: -2,
        maxZ: 2
    };
}

// Create bridge
function createBridge(scene, THREE) {
    const bridgeGroup = new THREE.Group();

    // Bridge deck
    const deckGeometry = getGeometry('box', 5, 0.3, 5);
    const deckMaterial = getMaterial('lambert', { color: 0x8B4513 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 0.5;
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Add visible wood planks on bridge (like the material)
    for (let i = 0; i < 3; i++) {
        const woodPlank = new THREE.Mesh(
            getGeometry('box', 0.8, 0.15, 4.5),
            getMaterial('lambert', { color: 0x8B4513 })
        );
        woodPlank.position.set(-1.5 + i * 1.5, 0.73, 0);
        woodPlank.castShadow = true;
        bridgeGroup.add(woodPlank);
    }

    // Add glass panels on sides (like the material)
    for (let i = 0; i < 2; i++) {
        const glassPanel = new THREE.Mesh(
            getGeometry('box', 0.1, 0.6, 4.5),
            getMaterial('lambert', { 
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
            getGeometry('cylinder', 0.08, 0.08, 1.2, 8),
            getMaterial('lambert', { 
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
    const railGeometry = getGeometry('box', 0.1, 0.5, 5);
    const railMaterial = getMaterial('lambert', { color: 0x654321 });
    const rail1 = new THREE.Mesh(railGeometry, railMaterial);
    rail1.position.set(2.5, 0.9, 0);
    rail1.castShadow = true;
    bridgeGroup.add(rail1);

    const rail2 = new THREE.Mesh(railGeometry, railMaterial);
    rail2.position.set(-2.5, 0.9, 0);
    rail2.castShadow = true;
    bridgeGroup.add(rail2);

    bridgeGroup.position.set(0, 0, 0);
    bridgeGroup.visible = false;
    scene.add(bridgeGroup);
    
    return {
        mesh: bridgeGroup,
        minX: -2.5,
        maxX: 2.5,
        minZ: -2.5,
        maxZ: 2.5
    };
}

// Create broken bridge
function createBrokenBridge(scene, THREE) {
    const brokenBridgeGroup = new THREE.Group();
    
    const plankGeometry = getGeometry('box', 5, 0.2, 1);
    const plankMaterial = getMaterial('lambert', { color: 0x654321 });
    
    for (let i = 0; i < 3; i++) {
        const plank = new THREE.Mesh(plankGeometry, plankMaterial);
        plank.position.set(0, 0.1, -4.5 + i);
        plank.rotation.z = (Math.random() - 0.5) * 0.3;
        plank.castShadow = true;
        brokenBridgeGroup.add(plank);
    }
    
    for (let i = 7; i < 10; i++) {
        const plank = new THREE.Mesh(plankGeometry, plankMaterial);
        plank.position.set(0, 0.1, -4.5 + i);
        plank.rotation.z = (Math.random() - 0.5) * 0.3;
        plank.castShadow = true;
        brokenBridgeGroup.add(plank);
    }
    
    brokenBridgeGroup.position.y = 0;
    scene.add(brokenBridgeGroup);
    
    return brokenBridgeGroup;
}
