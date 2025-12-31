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

// Store generated textures to reuse
let cachedTextures = null;

function getTerrainTextures(THREE) {
    if (!cachedTextures) {
        cachedTextures = {
            grass: generateGrassTexture(THREE, false),
            grassIce: generateGrassTexture(THREE, true),
            sand: generateSandTexture(THREE),
            bark: generateBarkTexture(THREE),
            foliage: generateFoliageTexture(THREE, false),
            foliageIce: generateFoliageTexture(THREE, true),
            mountain: generateMountainTexture(THREE),
            snow: generateSnowTexture(THREE),
            sky: generateSkyTexture(THREE),
            goblinSkin: generateGoblinSkinTexture(THREE),
            goblinArmor: generateGoblinArmorTexture(THREE),
            giantSkin: generateGiantSkinTexture(THREE),
            giantArmor: generateGiantArmorTexture(THREE),
            playerSkin: generatePlayerSkinTexture(THREE),
            playerClothingPink: generatePlayerClothingTexture(THREE, 0xFF69B4),
            playerClothingBlue: generatePlayerClothingTexture(THREE, 0x4169E1),
            hairBrown: generateHairTexture(THREE, 0x8B4513),
            hairBlack: generateHairTexture(THREE, 0x1a1a1a),
            dragonScale: generateDragonScaleTexture(THREE, false),
            dragonScaleIce: generateDragonScaleTexture(THREE, true),
            dragonBelly: generateDragonBellyTexture(THREE),
            fireball: generateFireballTexture(THREE, false),
            fireballIce: generateFireballTexture(THREE, true),
            explosion: generateExplosionTexture(THREE, false),
            explosionIce: generateExplosionTexture(THREE, true),
            smoke: generateSmokeTexture(THREE),
            scorch: generateScorchTexture(THREE),
            kitePink: generateKiteTexture(THREE, 0xFF1493),
            kiteBlue: generateKiteTexture(THREE, 0x00BFFF),
            goblinEye: generateGlowingEyeTexture(THREE, 0xFF0000),
            guardianEye: generateGlowingEyeTexture(THREE, 0xFFFF00),
            giantEye: generateGlowingEyeTexture(THREE, 0xFF6600),
            dragonEye: generateGlowingEyeTexture(THREE, 0xFF6600),
            dragonEyeIce: generateGlowingEyeTexture(THREE, 0x00BFFF),
            wizardRobe: generateWizardRobeTexture(THREE, false),
            wizardRobeIce: generateWizardRobeTexture(THREE, true),
            helmetPink: generateHelmetTexture(THREE, 0xFF69B4),
            helmetBlue: generateHelmetTexture(THREE, 0x4169E1)
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
function createHills(scene, THREE, hillPositions, hillColor, iceTheme, desertTheme) {
    const textures = getTerrainTextures(THREE);
    const hills = hillPositions || HILLS;
    const color = hillColor || 0x88cc88;
    let textureToUse;
    if (desertTheme) {
        textureToUse = textures.sand;
    } else if (iceTheme) {
        textureToUse = textures.grassIce;
    } else {
        textureToUse = textures.grass;
    }
    hills.forEach(hill => {
        const hillGeometry = new THREE.ConeGeometry(hill.radius, hill.height, 32);
        const hillMaterial = new THREE.MeshLambertMaterial({ 
            map: textureToUse,
            color: color
        });
        const hillMesh = new THREE.Mesh(hillGeometry, hillMaterial);
        hillMesh.position.set(hill.x, hill.height / 2, hill.z);
        hillMesh.castShadow = true;
        hillMesh.receiveShadow = true;
        scene.add(hillMesh);
    });
}

// Create mountains (world boundaries)
function createMountains(scene, THREE, mountainPositions) {
    const textures = getTerrainTextures(THREE);
    mountainPositions.forEach(mtn => {
        const mountainGeometry = new THREE.ConeGeometry(mtn.width/2, mtn.height, 6);
        const mountainMaterial = new THREE.MeshLambertMaterial({ 
            map: textures.mountain,
            color: 0xaaaaaa
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(mtn.x, mtn.height/2, mtn.z);
        scene.add(mountain);
        
        // Snow cap on top
        const snowGeometry = new THREE.ConeGeometry(mtn.width/4, mtn.height/3, 6);
        const snowMaterial = new THREE.MeshLambertMaterial({ 
            map: textures.snow,
            color: 0xffffff
        });
        const snow = new THREE.Mesh(snowGeometry, snowMaterial);
        snow.position.set(mtn.x, mtn.height * 0.75, mtn.z);
        scene.add(snow);
    });
}

// Create ground plane
function createGround(scene, THREE, groundColor, iceTheme, desertTheme) {
    const textures = getTerrainTextures(THREE);
    const color = groundColor || 0xffffff; // Tint color applied over texture
    let textureToUse;
    if (desertTheme) {
        textureToUse = textures.sand || textures.grass; // Fall back to grass if no sand texture
    } else if (iceTheme) {
        textureToUse = textures.grassIce;
    } else {
        textureToUse = textures.grass;
    }
    const groundGeometry = new THREE.PlaneGeometry(600, 600, 1, 1);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
        map: textureToUse,
        color: color
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

// Create river
function createRiver(scene, THREE) {
    const riverGeometry = new THREE.PlaneGeometry(600, 4, 60, 8);
    const riverMaterial = new THREE.MeshLambertMaterial({ 
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
    
    const plankGeometry = new THREE.BoxGeometry(5, 0.2, 1);
    const plankMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
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
