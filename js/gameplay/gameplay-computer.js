/**
 * Computer Level Gameplay Systems
 * Handles: Lag Events, Firewall Gates, Buffer Overflow Zones, Data Streams
 * Used by Level 9 - System Core
 */

(function() {
    'use strict';

    // ========================================
    // LAG EVENT SYSTEM
    // Global slowdown that affects all movement
    // ========================================
    
    let lagState = {
        isActive: false,
        isWarning: false,
        lastLagTime: 0,
        lagStartTime: 0,
        warningStartTime: 0,
        visualOverlay: null,
        originalSpeedMultiplier: 1
    };
    
    function initLagSystem() {
        if (!G.computerTheme) return;
        
        lagState.lastLagTime = Date.now();
        lagState.originalSpeedMultiplier = window.speedMultiplier || 1;
        
        // Create visual overlay for lag effect
        createLagOverlay();
    }
    
    function createLagOverlay() {
        // The lag effect will be a screen-space overlay
        // We'll use a plane attached to the camera
        const overlayGeometry = new THREE.PlaneGeometry(100, 100);
        const overlayMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthTest: false
        });
        lagState.visualOverlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
        lagState.visualOverlay.renderOrder = 999;
        // Will be positioned in front of camera during updates
    }
    
    function updateLagSystem() {
        if (!G.computerTheme) return;
        
        const now = Date.now();
        const levelConfig = LEVEL_REGISTRY.get(G.currentLevel);
        const lagConfig = levelConfig?.lagConfig || {
            interval: 25000,
            duration: 4000,
            warningTime: 3000,
            slowdownFactor: 0.4,
            affectsEnemies: true,
            opensFirewalls: true
        };
        
        const timeSinceLastLag = now - lagState.lastLagTime;
        
        // Check if warning should start
        if (!lagState.isWarning && !lagState.isActive && 
            timeSinceLastLag >= lagConfig.interval - lagConfig.warningTime) {
            startLagWarning();
        }
        
        // Check if lag should activate
        if (lagState.isWarning && !lagState.isActive && 
            timeSinceLastLag >= lagConfig.interval) {
            startLag(lagConfig);
        }
        
        // Check if lag should end
        if (lagState.isActive && now - lagState.lagStartTime >= lagConfig.duration) {
            endLag();
        }
        
        // Update visual effects
        updateLagVisuals(lagConfig);
    }
    
    function startLagWarning() {
        lagState.isWarning = true;
        lagState.warningStartTime = Date.now();
        
        // Play warning sound
        if (typeof Audio !== 'undefined' && Audio.playSystemSound) {
            Audio.playSystemSound('warning');
        }
        
        // Show HUD warning
        showLagWarningHUD();
    }
    
    function startLag(lagConfig) {
        lagState.isActive = true;
        lagState.isWarning = false;
        lagState.lagStartTime = Date.now();
        
        // Apply slowdown to player
        G.lagSlowdownActive = true;
        G.lagSlowdownFactor = lagConfig.slowdownFactor;
        
        // Enable screen shake
        G.lagScreenShake = true;
        
        // Play lag activation sound
        if (typeof Audio !== 'undefined' && Audio.playSystemSound) {
            Audio.playSystemSound('lag');
        }
        
        // Open firewall gates
        if (lagConfig.opensFirewalls && G.firewallGates) {
            G.firewallGates.forEach(gate => {
                gate.forcedOpen = true;
            });
        }
        
        showLagActiveHUD();
    }
    
    function endLag() {
        lagState.isActive = false;
        lagState.lastLagTime = Date.now();
        
        // Remove slowdown
        G.lagSlowdownActive = false;
        G.lagSlowdownFactor = 1;
        
        // Disable screen shake
        G.lagScreenShake = false;
        
        // Reset camera position offset
        if (G.camera) {
            G.camera.position.x = G.camera.position.x; // Force recalculation
        }
        
        // Close firewall gates
        if (G.firewallGates) {
            G.firewallGates.forEach(gate => {
                gate.forcedOpen = false;
            });
        }
        
        hideLagHUD();
    }
    
    function updateLagVisuals(lagConfig) {
        if (!lagState.visualOverlay) return;
        
        // Intense screen shake during active lag
        if (lagState.isActive && G.camera && G.lagScreenShake) {
            // Much stronger shake intensity
            const shakeIntensity = 0.4;
            const shakeX = (Math.random() - 0.5) * shakeIntensity;
            const shakeY = (Math.random() - 0.5) * shakeIntensity * 0.7;
            const shakeZ = (Math.random() - 0.5) * shakeIntensity;
            
            // Occasional big jolts
            if (Math.random() > 0.9) {
                G.lagShakeOffset = { 
                    x: shakeX * 3, 
                    y: shakeY * 2, 
                    z: shakeZ * 3 
                };
            } else {
                G.lagShakeOffset = { x: shakeX, y: shakeY, z: shakeZ };
            }
        } else {
            G.lagShakeOffset = { x: 0, y: 0, z: 0 };
        }
        
        if (lagState.isWarning) {
            // Intense pulsing warning
            const warningProgress = (Date.now() - lagState.warningStartTime) / lagConfig.warningTime;
            const pulse = Math.sin(warningProgress * Math.PI * 12) * 0.5 + 0.5;
            lagState.visualOverlay.material.opacity = pulse * 0.35;
            lagState.visualOverlay.material.color.setHex(0x00FFFF);
        } else if (lagState.isActive) {
            // EXTREMELY dramatic glitchy effect during lag
            const lagProgress = (Date.now() - lagState.lagStartTime) / lagConfig.duration;
            const glitch = Math.random() * 0.4;
            lagState.visualOverlay.material.opacity = 0.25 + glitch;
            // Rapid color flashing between intense colors
            const colorRoll = Math.random();
            if (colorRoll > 0.9) {
                lagState.visualOverlay.material.color.setHex(0xFFFFFF); // White flash!
            } else if (colorRoll > 0.75) {
                lagState.visualOverlay.material.color.setHex(0xFF0000); // Red flash
            } else if (colorRoll > 0.6) {
                lagState.visualOverlay.material.color.setHex(0xFF00FF); // Pure Magenta
            } else if (colorRoll > 0.45) {
                lagState.visualOverlay.material.color.setHex(0x00FF00); // Green flash
            } else {
                lagState.visualOverlay.material.color.setHex(0x00FFFF); // Cyan
            }
        } else {
            lagState.visualOverlay.material.opacity = 0;
        }
    }
    
    function showLagWarningHUD() {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'lag-warning';
        warningDiv.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            color: #00FFFF;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            text-shadow: 0 0 10px #00FFFF;
            animation: blink 0.5s infinite;
            z-index: 1000;
            pointer-events: none;
        `;
        warningDiv.textContent = '⚠ SYSTEMVERZÖGERUNG DROHT ⚠';
        document.body.appendChild(warningDiv);
        
        // Add blink animation if not exists
        if (!document.getElementById('lag-styles')) {
            const style = document.createElement('style');
            style.id = 'lag-styles';
            style.textContent = `
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                @keyframes glitch {
                    0%, 100% { transform: translateX(-50%) skewX(0deg); filter: hue-rotate(0deg); }
                    10% { transform: translateX(-48%) skewX(-5deg); filter: hue-rotate(90deg); }
                    20% { transform: translateX(-52%) skewX(5deg); }
                    30% { transform: translateX(-50%) skewX(-3deg); filter: hue-rotate(-90deg); }
                    40% { transform: translateX(-48%) skewX(3deg); }
                    50% { transform: translateX(-52%) skewX(-2deg); filter: hue-rotate(45deg); }
                    60% { transform: translateX(-50%) skewX(4deg); }
                    70% { transform: translateX(-48%) skewX(-4deg); filter: hue-rotate(-45deg); }
                    80% { transform: translateX(-52%) skewX(2deg); }
                    90% { transform: translateX(-50%) skewX(-1deg); filter: hue-rotate(0deg); }
                }
                @keyframes scanline {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100vh; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function showLagActiveHUD() {
        // Remove warning
        const warning = document.getElementById('lag-warning');
        if (warning) warning.remove();
        
        const activeDiv = document.createElement('div');
        activeDiv.id = 'lag-active';
        activeDiv.style.cssText = `
            position: fixed;
            top: 18%;
            left: 50%;
            transform: translateX(-50%);
            color: #FF0066;
            font-family: 'Courier New', monospace;
            font-size: 48px;
            font-weight: bold;
            text-shadow: 0 0 30px #FF0066, 0 0 60px #FF0066, 0 0 90px #FF0000,
                         4px 4px 0 #00FFFF, -4px -4px 0 #00FF00, 
                         4px -4px 0 #FFFF00, -4px 4px 0 #FF00FF;
            animation: glitch 0.1s infinite, pulse-size 0.3s infinite;
            z-index: 1000;
            pointer-events: none;
            letter-spacing: 8px;
        `;
        activeDiv.textContent = '█▓ SYSTEMVERZÖGERUNG ▓█';
        document.body.appendChild(activeDiv);
        
        // Add scanline overlay - more intense
        const scanlineDiv = document.createElement('div');
        scanlineDiv.id = 'lag-scanlines';
        scanlineDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
            background: repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.25),
                rgba(0, 0, 0, 0.25) 2px,
                transparent 2px,
                transparent 4px
            );
            animation: scanline 0.3s linear infinite;
        `;
        document.body.appendChild(scanlineDiv);
        
        // Add chromatic aberration / glitch border effect
        const borderDiv = document.createElement('div');
        borderDiv.id = 'lag-border';
        borderDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 998;
            box-shadow: inset 0 0 100px rgba(255, 0, 102, 0.5),
                        inset 0 0 200px rgba(0, 255, 255, 0.3);
            animation: border-flash 0.2s infinite;
        `;
        document.body.appendChild(borderDiv);
        
        // Add static noise overlay
        const noiseDiv = document.createElement('div');
        noiseDiv.id = 'lag-noise';
        noiseDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 997;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            opacity: 0.15;
            animation: noise-flash 0.1s steps(3) infinite;
        `;
        document.body.appendChild(noiseDiv);
        
        // Add additional glitch styles
        if (!document.getElementById('lag-extra-styles')) {
            const style = document.createElement('style');
            style.id = 'lag-extra-styles';
            style.textContent = `
                @keyframes pulse-size {
                    0%, 100% { transform: translateX(-50%) scale(1); }
                    50% { transform: translateX(-50%) scale(1.05); }
                }
                @keyframes border-flash {
                    0%, 100% { 
                        box-shadow: inset 0 0 100px rgba(255, 0, 102, 0.5),
                                    inset 0 0 200px rgba(0, 255, 255, 0.3);
                    }
                    33% { 
                        box-shadow: inset 0 0 150px rgba(0, 255, 255, 0.6),
                                    inset 0 0 100px rgba(255, 0, 102, 0.2);
                    }
                    66% { 
                        box-shadow: inset 0 0 80px rgba(0, 255, 0, 0.5),
                                    inset 0 0 180px rgba(255, 0, 255, 0.4);
                    }
                }
                @keyframes noise-flash {
                    0% { opacity: 0.1; }
                    50% { opacity: 0.2; }
                    100% { opacity: 0.15; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function hideLagHUD() {
        const warning = document.getElementById('lag-warning');
        const active = document.getElementById('lag-active');
        const scanlines = document.getElementById('lag-scanlines');
        const border = document.getElementById('lag-border');
        const noise = document.getElementById('lag-noise');
        if (warning) warning.remove();
        if (active) active.remove();
        if (scanlines) scanlines.remove();
        if (border) border.remove();
        if (noise) noise.remove();
    }
    
    // ========================================
    // FIREWALL GATE SYSTEM
    // Energy barriers that cycle on/off
    // ========================================
    
    function initFirewallGates() {
        if (!G.computerTheme) return;
        
        const levelConfig = LEVEL_REGISTRY.get(G.currentLevel);
        if (!levelConfig?.firewallGates) return;
        
        G.firewallGates = [];
        
        levelConfig.firewallGates.forEach((gateConfig, index) => {
            const gate = createFirewallGate(gateConfig, index);
            G.firewallGates.push(gate);
        });
    }
    
    function createFirewallGate(config, index) {
        const gateGroup = new THREE.Group();
        
        // Gate frame (always visible)
        const frameGeometry = new THREE.BoxGeometry(config.width, 6, 0.3);
        const frameMaterial = new THREE.MeshPhongMaterial({
            color: 0x333355,
            emissive: 0x001122,
            emissiveIntensity: 0.3
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 3;
        gateGroup.add(frame);
        
        // Energy barrier (toggles on/off)
        const barrierGeometry = new THREE.PlaneGeometry(config.width - 0.5, 5.5);
        const barrierMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.y = 3;
        barrier.position.z = 0.2;
        gateGroup.add(barrier);
        
        // Hexagonal grid pattern on barrier
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < Math.floor(config.width / 2); col++) {
                const hexGeometry = new THREE.CircleGeometry(0.4, 6);
                const hexMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00FFFF,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                });
                const hex = new THREE.Mesh(hexGeometry, hexMaterial);
                hex.position.set(
                    -config.width/2 + 1 + col * 2 + (row % 2) * 1,
                    1.5 + row * 1.8,
                    0.25
                );
                gateGroup.add(hex);
            }
        }
        
        // Warning lights on frame
        const warningGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const warningMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF6600,
            transparent: true,
            opacity: 0.8
        });
        const leftWarning = new THREE.Mesh(warningGeometry, warningMaterial);
        leftWarning.position.set(-config.width/2 + 0.3, 5.5, 0.3);
        gateGroup.add(leftWarning);
        
        const rightWarning = new THREE.Mesh(warningGeometry, warningMaterial);
        rightWarning.position.set(config.width/2 - 0.3, 5.5, 0.3);
        gateGroup.add(rightWarning);
        
        // Position and rotate gate
        gateGroup.position.set(config.x, 0, config.z);
        gateGroup.rotation.y = config.rotation || 0;
        
        G.scene.add(gateGroup);
        
        return {
            mesh: gateGroup,
            barrier: barrier,
            warningLights: [leftWarning, rightWarning],
            config: config,
            isActive: true,
            cycleOffset: config.cycleOffset || 0,
            forcedOpen: false,
            width: config.width,
            x: config.x,
            z: config.z,
            rotation: config.rotation || 0
        };
    }
    
    function updateFirewallGates() {
        if (!G.computerTheme || !G.firewallGates) return;
        
        const now = Date.now();
        const cycleTime = 6000; // 6 second cycle
        
        G.firewallGates.forEach(gate => {
            // Check if forced open by lag
            if (gate.forcedOpen) {
                gate.isActive = false;
                gate.barrier.material.opacity = 0.1;
                gate.warningLights.forEach(light => {
                    light.material.color.setHex(0x00FF00); // Green = safe
                });
                return;
            }
            
            // Normal cycling
            const cycleProgress = ((now + gate.cycleOffset) % cycleTime) / cycleTime;
            
            // Gate is active (dangerous) for 70% of cycle
            gate.isActive = cycleProgress < 0.7;
            
            if (gate.isActive) {
                // Active - pulsing barrier
                const pulse = Math.sin(cycleProgress * Math.PI * 10) * 0.2 + 0.6;
                gate.barrier.material.opacity = pulse;
                gate.barrier.material.color.setHex(0x00FFFF);
                gate.warningLights.forEach(light => {
                    light.material.color.setHex(0xFF0000);
                    light.material.opacity = 0.5 + Math.sin(now * 0.01) * 0.5;
                });
            } else {
                // Inactive - safe to pass
                gate.barrier.material.opacity = 0.1;
                gate.barrier.material.color.setHex(0x00FF00);
                gate.warningLights.forEach(light => {
                    light.material.color.setHex(0x00FF00);
                    light.material.opacity = 0.8;
                });
            }
        });
    }
    
    function checkFirewallCollision(playerX, playerZ, playerRadius) {
        if (!G.computerTheme || !G.firewallGates) return false;
        
        for (const gate of G.firewallGates) {
            if (!gate.isActive) continue;
            
            // Transform player position to gate's local space
            const dx = playerX - gate.x;
            const dz = playerZ - gate.z;
            const cos = Math.cos(-gate.rotation);
            const sin = Math.sin(-gate.rotation);
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;
            
            // Check if player is within gate bounds
            const halfWidth = gate.width / 2;
            if (Math.abs(localX) < halfWidth + playerRadius && Math.abs(localZ) < 1 + playerRadius) {
                return true; // Collision!
            }
        }
        
        return false;
    }
    
    // ========================================
    // BUFFER OVERFLOW ZONES
    // Expanding damage areas that reset
    // ========================================
    
    function initBufferOverflowZones() {
        if (!G.computerTheme) return;
        
        const levelConfig = LEVEL_REGISTRY.get(G.currentLevel);
        if (!levelConfig?.bufferOverflowZones) return;
        
        G.bufferOverflowZones = [];
        
        levelConfig.bufferOverflowZones.forEach((zoneConfig, index) => {
            const zone = createBufferOverflowZone(zoneConfig, index);
            G.bufferOverflowZones.push(zone);
        });
    }
    
    function createBufferOverflowZone(config, index) {
        const zoneGroup = new THREE.Group();
        
        // Core warning marker (always visible)
        const coreGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 8);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 0.1;
        zoneGroup.add(core);
        
        // Warning symbol
        const symbolGeometry = new THREE.RingGeometry(0.3, 0.45, 3);
        const symbolMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
        symbol.rotation.x = -Math.PI / 2;
        symbol.position.y = 0.25;
        zoneGroup.add(symbol);
        
        // Expanding damage zone (visual ring)
        const zoneGeometry = new THREE.RingGeometry(config.minRadius - 0.5, config.minRadius, 32);
        const zoneMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0066,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const zoneRing = new THREE.Mesh(zoneGeometry, zoneMaterial);
        zoneRing.rotation.x = -Math.PI / 2;
        zoneRing.position.y = 0.15;
        zoneGroup.add(zoneRing);
        
        // Inner fill (semi-transparent danger area)
        const fillGeometry = new THREE.CircleGeometry(config.minRadius, 32);
        const fillMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0066,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const fill = new THREE.Mesh(fillGeometry, fillMaterial);
        fill.rotation.x = -Math.PI / 2;
        fill.position.y = 0.12;
        zoneGroup.add(fill);
        
        // Glitch particles floating up
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const particleGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xFF0066 : 0x00FFFF,
                transparent: true,
                opacity: 0.6
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = (i / 8) * Math.PI * 2;
            particle.position.set(
                Math.cos(angle) * config.minRadius * 0.5,
                Math.random() * 2,
                Math.sin(angle) * config.minRadius * 0.5
            );
            particle.userData.angle = angle;
            particle.userData.heightOffset = Math.random() * Math.PI * 2;
            zoneGroup.add(particle);
            particles.push(particle);
        }
        
        zoneGroup.position.set(config.x, 0, config.z);
        G.scene.add(zoneGroup);
        
        return {
            mesh: zoneGroup,
            zoneRing: zoneRing,
            fill: fill,
            particles: particles,
            config: config,
            currentRadius: config.minRadius,
            growing: true,
            lastDamageTime: 0
        };
    }
    
    function updateBufferOverflowZones() {
        if (!G.computerTheme || !G.bufferOverflowZones) return;
        
        const now = Date.now();
        
        G.bufferOverflowZones.forEach(zone => {
            // Grow or shrink the zone
            if (zone.growing) {
                zone.currentRadius += zone.config.growthRate;
                if (zone.currentRadius >= zone.config.maxRadius) {
                    zone.growing = false;
                    // Flash effect when max reached
                    zone.fill.material.opacity = 0.5;
                }
            } else {
                zone.currentRadius -= zone.config.growthRate * 3; // Shrink faster
                if (zone.currentRadius <= zone.config.minRadius) {
                    zone.growing = true;
                    zone.currentRadius = zone.config.minRadius;
                }
            }
            
            // Update visual scale
            const scale = zone.currentRadius / zone.config.minRadius;
            zone.zoneRing.scale.set(scale, scale, 1);
            zone.fill.scale.set(scale, scale, 1);
            
            // Pulse opacity based on danger level
            const dangerLevel = (zone.currentRadius - zone.config.minRadius) / 
                               (zone.config.maxRadius - zone.config.minRadius);
            zone.fill.material.opacity = 0.1 + dangerLevel * 0.3;
            zone.zoneRing.material.opacity = 0.3 + dangerLevel * 0.4;
            
            // Animate particles
            zone.particles.forEach((particle, i) => {
                const time = now * 0.001;
                particle.position.y = 0.5 + Math.sin(time * 2 + particle.userData.heightOffset) * 1.5;
                const newAngle = particle.userData.angle + time * 0.5;
                const radius = zone.currentRadius * 0.7;
                particle.position.x = Math.cos(newAngle) * radius;
                particle.position.z = Math.sin(newAngle) * radius;
                particle.rotation.x += 0.05;
                particle.rotation.y += 0.03;
            });
        });
    }
    
    function checkBufferOverflowDamage(playerX, playerZ) {
        if (!G.computerTheme || !G.bufferOverflowZones) return 0;
        
        const now = Date.now();
        let totalDamage = 0;
        
        G.bufferOverflowZones.forEach(zone => {
            const dx = playerX - zone.config.x;
            const dz = playerZ - zone.config.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < zone.currentRadius) {
                // Player is in danger zone - apply damage with cooldown
                if (now - zone.lastDamageTime > 1000) { // 1 second damage cooldown
                    totalDamage += zone.config.damage;
                    zone.lastDamageTime = now;
                    
                    // Visual feedback - flash the zone
                    zone.fill.material.color.setHex(0xFFFFFF);
                    setTimeout(() => {
                        zone.fill.material.color.setHex(0xFF0066);
                    }, 100);
                }
            }
        });
        
        return totalDamage;
    }
    
    // ========================================
    // DATA STREAM SYSTEM
    // Flowing rivers of light that push players
    // ========================================
    
    function initDataStreams() {
        if (!G.computerTheme) return;
        
        const levelConfig = LEVEL_REGISTRY.get(G.currentLevel);
        if (!levelConfig?.dataStreams) return;
        
        G.dataStreams = [];
        
        levelConfig.dataStreams.forEach((streamConfig, index) => {
            const stream = createDataStream(streamConfig, index);
            G.dataStreams.push(stream);
        });
    }
    
    function createDataStream(config, index) {
        const streamGroup = new THREE.Group();
        
        // Base flow plane
        const baseGeometry = new THREE.PlaneGeometry(config.length, config.width);
        const baseMaterial = new THREE.MeshBasicMaterial({
            color: 0x003300,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.rotation.x = -Math.PI / 2;
        base.position.y = 0.05;
        streamGroup.add(base);
        
        // Flowing data particles
        const particles = [];
        const particleCount = Math.floor(config.length / 3);
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x00FF00,
                transparent: true,
                opacity: 0.7
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * config.length,
                0.15,
                (Math.random() - 0.5) * config.width * 0.7
            );
            particle.userData.speed = 0.1 + Math.random() * 0.1;
            particle.userData.streamLength = config.length;
            streamGroup.add(particle);
            particles.push(particle);
        }
        
        // Edge glow lines
        const edgeGeometry = new THREE.BoxGeometry(config.length, 0.1, 0.2);
        const edgeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.5
        });
        const topEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        topEdge.position.set(0, 0.1, config.width / 2);
        streamGroup.add(topEdge);
        
        const bottomEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        bottomEdge.position.set(0, 0.1, -config.width / 2);
        streamGroup.add(bottomEdge);
        
        // Direction arrows
        for (let i = 0; i < 3; i++) {
            const arrowGeometry = new THREE.ConeGeometry(0.3, 0.6, 3);
            const arrowMaterial = new THREE.MeshBasicMaterial({
                color: 0x00FF00,
                transparent: true,
                opacity: 0.4
            });
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.rotation.x = Math.PI / 2;
            arrow.rotation.z = config.flowDirection > 0 ? Math.PI / 2 : -Math.PI / 2;
            arrow.position.set(
                -config.length/2 + config.length * (i + 1) / 4,
                0.2,
                0
            );
            streamGroup.add(arrow);
        }
        
        streamGroup.position.set(config.x, 0, config.z);
        streamGroup.rotation.y = config.rotation || 0;
        
        G.scene.add(streamGroup);
        
        return {
            mesh: streamGroup,
            particles: particles,
            config: config
        };
    }
    
    function updateDataStreams() {
        if (!G.computerTheme || !G.dataStreams) return;
        
        G.dataStreams.forEach(stream => {
            // Animate flowing particles
            stream.particles.forEach(particle => {
                particle.position.x += particle.userData.speed * stream.config.flowDirection;
                
                // Wrap around
                const halfLength = stream.config.length / 2;
                if (stream.config.flowDirection > 0 && particle.position.x > halfLength) {
                    particle.position.x = -halfLength;
                } else if (stream.config.flowDirection < 0 && particle.position.x < -halfLength) {
                    particle.position.x = halfLength;
                }
            });
        });
    }
    
    function getDataStreamPush(playerX, playerZ) {
        if (!G.computerTheme || !G.dataStreams) return { x: 0, z: 0 };
        
        let pushX = 0;
        let pushZ = 0;
        
        G.dataStreams.forEach(stream => {
            // Transform player to stream's local space
            const dx = playerX - stream.config.x;
            const dz = playerZ - stream.config.z;
            const cos = Math.cos(-stream.config.rotation);
            const sin = Math.sin(-stream.config.rotation);
            const localX = dx * cos - dz * sin;
            const localZ = dx * sin + dz * cos;
            
            // Check if player is in stream
            const halfLength = stream.config.length / 2;
            const halfWidth = stream.config.width / 2;
            
            if (Math.abs(localX) < halfLength && Math.abs(localZ) < halfWidth) {
                // Player is in stream - calculate push in world space
                const pushStrength = stream.config.flowStrength;
                const localPushX = pushStrength * stream.config.flowDirection;
                
                // Transform push back to world space
                pushX += localPushX * Math.cos(stream.config.rotation);
                pushZ += localPushX * Math.sin(stream.config.rotation);
            }
        });
        
        return { x: pushX, z: pushZ };
    }
    
    // ========================================
    // SQUEEZING WALL SYSTEM
    // Walls that periodically close in from left/right
    // Player must escape to safe zone before being crushed
    // ========================================
    
    let squeezingWallState = {
        walls: [],
        isActive: false,
        currentZone: null,
        squeezingPhase: 0, // 0=waiting, 1=warning, 2=squeezing, 3=crushing
        phaseStartTime: 0,
        lastCrushCheck: 0
    };
    
    function initSqueezingWalls() {
        if (!G.computerTheme) return;
        
        const levelConfig = LEVEL_REGISTRY.get(G.currentLevel);
        if (!levelConfig?.squeezingWallZones) return;
        
        squeezingWallState.walls = [];
        G.squeezingWallZones = [];
        
        levelConfig.squeezingWallZones.forEach((zoneConfig, index) => {
            const zone = createSqueezingWallZone(zoneConfig, index);
            G.squeezingWallZones.push(zone);
        });
        
        // Start the squeezing cycle
        scheduleSqueezingEvent();
    }
    
    function createSqueezingWallZone(config, index) {
        const zoneGroup = new THREE.Group();
        const wallHeight = config.wallHeight || 8;
        const wallDepth = config.wallDepth || 40;
        
        // Left wall - big server rack barrier
        const leftWallGeometry = new THREE.BoxGeometry(3, wallHeight, wallDepth);
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: 0x0A0A15,
            emissive: 0xFF0000,
            emissiveIntensity: 0,
            shininess: 60
        });
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial.clone());
        leftWall.position.set(-config.maxWidth / 2, wallHeight / 2, 0);
        leftWall.castShadow = true;
        zoneGroup.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial.clone());
        rightWall.position.set(config.maxWidth / 2, wallHeight / 2, 0);
        rightWall.castShadow = true;
        zoneGroup.add(rightWall);
        
        // Add LED strips to walls
        const stripColors = [0x00FFFF, 0xFF00FF, 0x00FF00];
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 5; i++) {
                const stripGeometry = new THREE.BoxGeometry(0.2, wallHeight * 0.9, 0.3);
                const stripMaterial = new THREE.MeshBasicMaterial({
                    color: stripColors[i % 3],
                    transparent: true,
                    opacity: 0.8
                });
                const strip = new THREE.Mesh(stripGeometry, stripMaterial);
                const wallX = side * config.maxWidth / 2;
                strip.position.set(
                    wallX + (side * -1.6) + (i - 2) * 0.6,
                    wallHeight / 2,
                    -wallDepth / 4 + i * (wallDepth / 6)
                );
                zoneGroup.add(strip);
            }
        }
        
        // Warning floor markers
        const floorGeometry = new THREE.PlaneGeometry(config.maxWidth, wallDepth);
        const floorMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.15;
        zoneGroup.add(floor);
        
        zoneGroup.position.set(config.x, 0, config.z);
        G.scene.add(zoneGroup);
        
        return {
            mesh: zoneGroup,
            leftWall: leftWall,
            rightWall: rightWall,
            floor: floor,
            config: config,
            originalLeftX: -config.maxWidth / 2,
            originalRightX: config.maxWidth / 2,
            currentLeftX: -config.maxWidth / 2,
            currentRightX: config.maxWidth / 2,
            isSqueezing: false
        };
    }
    
    function scheduleSqueezingEvent() {
        if (!G.computerTheme || !G.squeezingWallZones || G.squeezingWallZones.length === 0) return;
        
        // Random delay before next squeeze
        const delay = 15000 + Math.random() * 20000; // 15-35 seconds
        
        setTimeout(() => {
            if (!G.computerTheme || G.gamePaused) {
                scheduleSqueezingEvent();
                return;
            }
            startSqueezingEvent();
        }, delay);
    }
    
    function startSqueezingEvent() {
        if (!G.squeezingWallZones || G.squeezingWallZones.length === 0) return;
        
        // Pick a random zone
        const zoneIndex = Math.floor(Math.random() * G.squeezingWallZones.length);
        const zone = G.squeezingWallZones[zoneIndex];
        
        squeezingWallState.isActive = true;
        squeezingWallState.currentZone = zone;
        squeezingWallState.squeezingPhase = 1; // Warning
        squeezingWallState.phaseStartTime = Date.now();
        zone.isSqueezing = true;
        
        // Show warning HUD
        showSqueezingWarningHUD(zone.config.x, zone.config.z);
        
        // Flash floor warning
        zone.floor.material.opacity = 0.3;
        zone.floor.material.color.setHex(0xFFFF00);
    }
    
    function updateSqueezingWalls() {
        if (!G.computerTheme || !squeezingWallState.isActive) return;
        
        const zone = squeezingWallState.currentZone;
        if (!zone) return;
        
        const now = Date.now();
        const elapsed = now - squeezingWallState.phaseStartTime;
        
        switch (squeezingWallState.squeezingPhase) {
            case 1: // Warning phase - 3 seconds
                // Pulse floor warning
                const warnPulse = Math.sin(elapsed * 0.02) * 0.5 + 0.5;
                zone.floor.material.opacity = 0.2 + warnPulse * 0.3;
                
                // Pulse wall emissive
                zone.leftWall.material.emissiveIntensity = warnPulse * 0.3;
                zone.rightWall.material.emissiveIntensity = warnPulse * 0.3;
                
                if (elapsed > 3000) {
                    squeezingWallState.squeezingPhase = 2;
                    squeezingWallState.phaseStartTime = now;
                    hideSqueezingWarningHUD();
                    showSqueezingActiveHUD();
                    zone.floor.material.color.setHex(0xFF0000);
                }
                break;
                
            case 2: // Squeezing phase - walls close in
                const squeezeProgress = Math.min(elapsed / 4000, 1); // 4 seconds to squeeze
                const targetGap = zone.config.minGap || 4;
                
                // Move walls inward
                const squeezeAmount = (zone.config.maxWidth / 2 - targetGap / 2) * squeezeProgress;
                zone.currentLeftX = zone.originalLeftX + squeezeAmount;
                zone.currentRightX = zone.originalRightX - squeezeAmount;
                
                zone.leftWall.position.x = zone.currentLeftX;
                zone.rightWall.position.x = zone.currentRightX;
                
                // Intense pulsing
                zone.leftWall.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 0.03) * 0.3;
                zone.rightWall.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 0.03) * 0.3;
                zone.floor.material.opacity = 0.4 + Math.sin(elapsed * 0.02) * 0.2;
                
                if (squeezeProgress >= 1) {
                    squeezingWallState.squeezingPhase = 3;
                    squeezingWallState.phaseStartTime = now;
                }
                break;
                
            case 3: // Crushing phase - hold for 2 seconds then reset
                // Maximum intensity
                zone.leftWall.material.emissiveIntensity = 0.8;
                zone.rightWall.material.emissiveIntensity = 0.8;
                zone.floor.material.opacity = 0.6;
                
                if (elapsed > 2000) {
                    // Reset walls
                    resetSqueezingZone(zone);
                    hideSqueezingActiveHUD();
                    scheduleSqueezingEvent();
                }
                break;
        }
    }
    
    function resetSqueezingZone(zone) {
        // Animate walls back to original position
        const animateReset = () => {
            let done = true;
            
            if (Math.abs(zone.currentLeftX - zone.originalLeftX) > 0.1) {
                zone.currentLeftX += (zone.originalLeftX - zone.currentLeftX) * 0.1;
                done = false;
            } else {
                zone.currentLeftX = zone.originalLeftX;
            }
            
            if (Math.abs(zone.currentRightX - zone.originalRightX) > 0.1) {
                zone.currentRightX += (zone.originalRightX - zone.currentRightX) * 0.1;
                done = false;
            } else {
                zone.currentRightX = zone.originalRightX;
            }
            
            zone.leftWall.position.x = zone.currentLeftX;
            zone.rightWall.position.x = zone.currentRightX;
            zone.leftWall.material.emissiveIntensity *= 0.9;
            zone.rightWall.material.emissiveIntensity *= 0.9;
            zone.floor.material.opacity *= 0.9;
            
            if (!done) {
                requestAnimationFrame(animateReset);
            } else {
                zone.isSqueezing = false;
                zone.floor.material.opacity = 0;
                zone.leftWall.material.emissiveIntensity = 0;
                zone.rightWall.material.emissiveIntensity = 0;
                squeezingWallState.isActive = false;
                squeezingWallState.currentZone = null;
            }
        };
        animateReset();
    }
    
    function checkSqueezingWallDamage(playerX, playerZ) {
        if (!G.computerTheme || !squeezingWallState.isActive) return { damage: 0, push: { x: 0, z: 0 } };
        
        const zone = squeezingWallState.currentZone;
        if (!zone || squeezingWallState.squeezingPhase < 2) return { damage: 0, push: { x: 0, z: 0 } };
        
        // Check if player is in the zone
        const localX = playerX - zone.config.x;
        const localZ = playerZ - zone.config.z;
        const halfDepth = (zone.config.wallDepth || 40) / 2;
        
        if (Math.abs(localZ) > halfDepth) return { damage: 0, push: { x: 0, z: 0 } };
        
        let damage = 0;
        let push = { x: 0, z: 0 };
        
        // Check collision with walls
        const wallBuffer = 2; // Player radius buffer
        
        if (localX < zone.currentLeftX + wallBuffer) {
            // Too close to left wall - push right
            push.x = 0.3;
            if (localX < zone.currentLeftX + 0.5) {
                // Being crushed
                const now = Date.now();
                if (now - squeezingWallState.lastCrushCheck > 500) {
                    damage = 2;
                    squeezingWallState.lastCrushCheck = now;
                }
            }
        } else if (localX > zone.currentRightX - wallBuffer) {
            // Too close to right wall - push left
            push.x = -0.3;
            if (localX > zone.currentRightX - 0.5) {
                // Being crushed
                const now = Date.now();
                if (now - squeezingWallState.lastCrushCheck > 500) {
                    damage = 2;
                    squeezingWallState.lastCrushCheck = now;
                }
            }
        }
        
        return { damage, push };
    }
    
    function showSqueezingWarningHUD(x, z) {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'squeeze-warning';
        warningDiv.style.cssText = `
            position: fixed;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
            color: #FFFF00;
            font-family: 'Courier New', monospace;
            font-size: 28px;
            text-shadow: 0 0 15px #FFFF00, 0 0 30px #FF6600;
            animation: blink 0.3s infinite;
            z-index: 1000;
            pointer-events: none;
            letter-spacing: 3px;
        `;
        warningDiv.textContent = '⚠ KOMPRIMIERUNG DROHT ⚠';
        document.body.appendChild(warningDiv);
    }
    
    function hideSqueezingWarningHUD() {
        const warning = document.getElementById('squeeze-warning');
        if (warning) warning.remove();
    }
    
    function showSqueezingActiveHUD() {
        const activeDiv = document.createElement('div');
        activeDiv.id = 'squeeze-active';
        activeDiv.style.cssText = `
            position: fixed;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
            color: #FF0066;
            font-family: 'Courier New', monospace;
            font-size: 36px;
            font-weight: bold;
            text-shadow: 0 0 20px #FF0066, 0 0 40px #FF0000;
            animation: glitch 0.1s infinite;
            z-index: 1000;
            pointer-events: none;
            letter-spacing: 5px;
        `;
        activeDiv.textContent = '█ KOMPRIMIERUNG █';
        document.body.appendChild(activeDiv);
    }
    
    function hideSqueezingActiveHUD() {
        const active = document.getElementById('squeeze-active');
        if (active) active.remove();
    }
    
    // ========================================
    // MAIN UPDATE FUNCTION
    // Called from game loop
    // ========================================
    
    function updateComputerSystems() {
        if (!G.computerTheme) return;
        
        updateLagSystem();
        updateFirewallGates();
        updateBufferOverflowZones();
        updateDataStreams();
        updateSqueezingWalls();
        updateComputerDecorations();
    }
    
    function initComputerSystems() {
        if (!G.computerTheme) return;
        
        initLagSystem();
        initFirewallGates();
        initBufferOverflowZones();
        initDataStreams();
        initSqueezingWalls();
        initComputerDecorations();
    }
    
    // ========================================
    // COMPUTER DECORATIONS
    // Floating holograms, data cubes, energy pillars
    // ========================================
    
    let computerDecorations = [];
    
    function initComputerDecorations() {
        if (!G.computerTheme || !G.scene) return;
        
        computerDecorations = [];
        
        // Create floating data cubes scattered around the level
        const dataCubePositions = [
            { x: -30, z: 160, y: 2 }, { x: 25, z: 155, y: 3 },
            { x: -60, z: 110, y: 2.5 }, { x: 55, z: 105, y: 2 },
            { x: -20, z: 80, y: 4 }, { x: 35, z: 70, y: 3.5 },
            { x: -50, z: 20, y: 2 }, { x: 45, z: 15, y: 3 },
            { x: -25, z: -35, y: 2.5 }, { x: 30, z: -50, y: 2 },
            { x: -65, z: -80, y: 3 }, { x: 60, z: -90, y: 2.5 },
            { x: -35, z: -130, y: 4 }, { x: 40, z: -145, y: 3.5 }
        ];
        
        dataCubePositions.forEach((pos, i) => {
            const cube = createFloatingDataCube(pos.x, pos.y, pos.z, i);
            computerDecorations.push(cube);
        });
        
        // Create holographic display panels
        const hologramPositions = [
            { x: -80, z: 140, rotation: 0.3 },
            { x: 85, z: 130, rotation: -0.3 },
            { x: -75, z: 0, rotation: 0.5 },
            { x: 80, z: -10, rotation: -0.5 },
            { x: -70, z: -110, rotation: 0.4 },
            { x: 75, z: -120, rotation: -0.4 }
        ];
        
        hologramPositions.forEach((pos, i) => {
            const hologram = createHolographicDisplay(pos.x, pos.z, pos.rotation, i);
            computerDecorations.push(hologram);
        });
        
        // Create energy pillars
        const pillarPositions = [
            { x: -90, z: 170 }, { x: 95, z: 165 },
            { x: -95, z: 60 }, { x: 100, z: 50 },
            { x: -90, z: -60 }, { x: 95, z: -70 },
            { x: -85, z: -160 }, { x: 90, z: -170 }
        ];
        
        pillarPositions.forEach((pos, i) => {
            const pillar = createEnergyPillar(pos.x, pos.z, i);
            computerDecorations.push(pillar);
        });
        
        // Create floating binary particles
        createFloatingParticles();
    }
    
    function createFloatingDataCube(x, baseY, z, index) {
        const group = new THREE.Group();
        
        // Main cube - wireframe style
        const cubeSize = 0.8 + Math.random() * 0.5;
        const cubeGeom = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeEdges = new THREE.EdgesGeometry(cubeGeom);
        
        // Outer wireframe
        const wireMat = new THREE.LineBasicMaterial({ 
            color: Math.random() > 0.5 ? 0x00FFFF : 0xFF0066,
            transparent: true,
            opacity: 0.8
        });
        const wireframe = new THREE.LineSegments(cubeEdges, wireMat);
        group.add(wireframe);
        
        // Inner glow cube
        const glowMat = new THREE.MeshBasicMaterial({
            color: wireMat.color,
            transparent: true,
            opacity: 0.2
        });
        const glowCube = new THREE.Mesh(cubeGeom, glowMat);
        group.add(glowCube);
        
        // Animation data
        group.userData = {
            type: 'dataCube',
            baseY: baseY,
            bobSpeed: 0.001 + Math.random() * 0.001,
            bobOffset: index * 0.5,
            rotateSpeed: 0.01 + Math.random() * 0.01,
            wireframe: wireframe
        };
        
        group.position.set(x, baseY, z);
        G.scene.add(group);
        
        return group;
    }
    
    function createHolographicDisplay(x, z, rotation, index) {
        const group = new THREE.Group();
        
        // Frame
        const frameGeom = new THREE.BoxGeometry(6, 4, 0.1);
        const frameMat = new THREE.MeshPhongMaterial({
            color: 0x333355,
            emissive: 0x111133,
            emissiveIntensity: 0.5
        });
        const frame = new THREE.Mesh(frameGeom, frameMat);
        frame.position.y = 3;
        group.add(frame);
        
        // Holographic screen
        const screenGeom = new THREE.PlaneGeometry(5.5, 3.5);
        const screenMat = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        screen.position.y = 3;
        screen.position.z = 0.1;
        group.add(screen);
        
        // Data lines on screen
        for (let i = 0; i < 5; i++) {
            const lineGeom = new THREE.PlaneGeometry(4 + Math.random() * 1.5, 0.1);
            const lineMat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x00FF88 : 0x00FFFF,
                transparent: true,
                opacity: 0.7
            });
            const line = new THREE.Mesh(lineGeom, lineMat);
            line.position.set(-0.5 + Math.random(), 1.5 + i * 0.6, 0.15);
            group.add(line);
        }
        
        // Animation data
        group.userData = {
            type: 'hologram',
            flickerSpeed: 0.1,
            screen: screen
        };
        
        group.position.set(x, 0, z);
        group.rotation.y = rotation;
        G.scene.add(group);
        
        return group;
    }
    
    function createEnergyPillar(x, z, index) {
        const group = new THREE.Group();
        
        // Base
        const baseGeom = new THREE.CylinderGeometry(1.5, 2, 0.5, 6);
        const baseMat = new THREE.MeshPhongMaterial({
            color: 0x222244,
            emissive: 0x000022,
            emissiveIntensity: 0.3
        });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = 0.25;
        group.add(base);
        
        // Energy core
        const coreGeom = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
        const coreMat = new THREE.MeshBasicMaterial({
            color: index % 2 === 0 ? 0x00FFFF : 0xFF0066,
            transparent: true,
            opacity: 0.6
        });
        const core = new THREE.Mesh(coreGeom, coreMat);
        core.position.y = 4.5;
        group.add(core);
        
        // Outer ring effects
        const ringGeom = new THREE.TorusGeometry(1, 0.1, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({
            color: coreMat.color,
            transparent: true,
            opacity: 0.5
        });
        
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.position.y = 2 + i * 2.5;
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        }
        
        // Animation data
        group.userData = {
            type: 'pillar',
            pulseSpeed: 0.002 + Math.random() * 0.002,
            core: core,
            rings: group.children.filter(c => c.geometry === ringGeom)
        };
        
        group.position.set(x, 0, z);
        G.scene.add(group);
        
        return group;
    }
    
    function createFloatingParticles() {
        // Create particle system for floating bits/bytes
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const cyan = new THREE.Color(0x00FFFF);
        const magenta = new THREE.Color(0xFF0066);
        const green = new THREE.Color(0x00FF88);
        
        for (let i = 0; i < particleCount; i++) {
            // Spread particles across the level
            positions[i * 3] = (Math.random() - 0.5) * 250;
            positions[i * 3 + 1] = 1 + Math.random() * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 450;
            
            // Random color
            const color = Math.random() > 0.6 ? cyan : (Math.random() > 0.5 ? magenta : green);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            sizes[i] = 0.3 + Math.random() * 0.5;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.4,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            type: 'particles',
            positions: positions,
            velocities: new Float32Array(particleCount * 3)
        };
        
        // Initialize velocities
        for (let i = 0; i < particleCount; i++) {
            particles.userData.velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            particles.userData.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
            particles.userData.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        G.scene.add(particles);
        computerDecorations.push(particles);
    }
    
    function updateComputerDecorations() {
        const now = Date.now();
        
        computerDecorations.forEach(obj => {
            if (!obj || !obj.userData) return;
            
            const data = obj.userData;
            
            if (data.type === 'dataCube') {
                // Floating bob animation
                obj.position.y = data.baseY + Math.sin(now * data.bobSpeed + data.bobOffset) * 0.5;
                // Rotation
                obj.rotation.x += data.rotateSpeed;
                obj.rotation.y += data.rotateSpeed * 0.7;
            }
            else if (data.type === 'hologram') {
                // Flicker effect
                if (data.screen && Math.random() > 0.98) {
                    data.screen.material.opacity = 0.1 + Math.random() * 0.3;
                }
            }
            else if (data.type === 'pillar') {
                // Pulse effect
                const pulse = Math.sin(now * data.pulseSpeed) * 0.5 + 0.5;
                if (data.core) {
                    data.core.material.opacity = 0.4 + pulse * 0.4;
                }
                if (data.rings) {
                    data.rings.forEach((ring, i) => {
                        ring.rotation.z += 0.02 * (i % 2 === 0 ? 1 : -1);
                    });
                }
            }
            else if (data.type === 'particles') {
                // Move particles
                const positions = obj.geometry.attributes.position.array;
                const velocities = data.velocities;
                
                for (let i = 0; i < positions.length / 3; i++) {
                    positions[i * 3] += velocities[i * 3];
                    positions[i * 3 + 1] += velocities[i * 3 + 1];
                    positions[i * 3 + 2] += velocities[i * 3 + 2];
                    
                    // Wrap around boundaries
                    if (positions[i * 3] > 125) positions[i * 3] = -125;
                    if (positions[i * 3] < -125) positions[i * 3] = 125;
                    if (positions[i * 3 + 1] > 12) positions[i * 3 + 1] = 1;
                    if (positions[i * 3 + 1] < 1) positions[i * 3 + 1] = 12;
                    if (positions[i * 3 + 2] > 230) positions[i * 3 + 2] = -230;
                    if (positions[i * 3 + 2] < -230) positions[i * 3 + 2] = 230;
                }
                
                obj.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    function cleanupComputerSystems() {
        // Cleanup lag system
        hideLagHUD();
        lagState.isActive = false;
        lagState.isWarning = false;
        G.lagSlowdownActive = false;
        G.lagSlowdownFactor = 1;
        G.lagScreenShake = false;
        G.lagShakeOffset = null;
        
        // Remove firewall gates
        if (G.firewallGates) {
            G.firewallGates.forEach(gate => {
                if (gate.mesh && gate.mesh.parent) {
                    gate.mesh.parent.remove(gate.mesh);
                }
            });
            G.firewallGates = null;
        }
        
        // Remove buffer overflow zones
        if (G.bufferOverflowZones) {
            G.bufferOverflowZones.forEach(zone => {
                if (zone.mesh && zone.mesh.parent) {
                    zone.mesh.parent.remove(zone.mesh);
                }
            });
            G.bufferOverflowZones = null;
        }
        
        // Remove data streams
        if (G.dataStreams) {
            G.dataStreams.forEach(stream => {
                if (stream.mesh && stream.mesh.parent) {
                    stream.mesh.parent.remove(stream.mesh);
                }
            });
            G.dataStreams = null;
        }
        
        // Remove decorations
        if (computerDecorations) {
            computerDecorations.forEach(obj => {
                if (obj && obj.parent) {
                    obj.parent.remove(obj);
                }
            });
            computerDecorations = [];
        }
        
        // Remove squeezing walls
        if (G.squeezingWallZones) {
            G.squeezingWallZones.forEach(zone => {
                if (zone.leftWall && zone.leftWall.parent) {
                    zone.leftWall.parent.remove(zone.leftWall);
                }
                if (zone.rightWall && zone.rightWall.parent) {
                    zone.rightWall.parent.remove(zone.rightWall);
                }
            });
            G.squeezingWallZones = null;
        }
    }
    
    // ========================================
    // GET LAG STATE (for external use)
    // ========================================
    
    function isLagActive() {
        return lagState.isActive;
    }
    
    function getLagSlowdownFactor() {
        if (!G.computerTheme || !lagState.isActive) return 1;
        return G.lagSlowdownFactor || 0.4;
    }
    
    // ========================================
    // EXPORT FUNCTIONS
    // ========================================
    
    window.initComputerSystems = initComputerSystems;
    window.updateComputerSystems = updateComputerSystems;
    window.cleanupComputerSystems = cleanupComputerSystems;
    window.checkFirewallCollision = checkFirewallCollision;
    window.checkBufferOverflowDamage = checkBufferOverflowDamage;
    window.checkSqueezingWallDamage = checkSqueezingWallDamage;
    window.getDataStreamPush = getDataStreamPush;
    window.isLagActive = isLagActive;
    window.getLagSlowdownFactor = getLagSlowdownFactor;
    
})();
