// main-entities.js - Enemies, collectibles, and special objects

function initEntities() {
    // Traps (whirlpools in water level)
    G.traps = [];
    G.trapPositions = G.levelConfig.trapPositions || [];

    G.trapPositions.forEach(pos => {
        const terrainHeight = getTerrainHeight(pos.x, pos.z);

        if (G.waterTheme) {
            // Whirlpool (Strudel) for water level
            const whirlpoolGroup = new THREE.Group();

            // Outer spinning ring
            const outerRingGeometry = new THREE.RingGeometry(1.5, 2.5, 24);
            const outerRingMaterial = new THREE.MeshBasicMaterial({
                color: 0x104080,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
            outerRing.rotation.x = -Math.PI / 2;
            outerRing.position.y = 0.1;
            whirlpoolGroup.add(outerRing);

            // Middle ring
            const midRingGeometry = new THREE.RingGeometry(0.8, 1.5, 24);
            const midRingMaterial = new THREE.MeshBasicMaterial({
                color: 0x1060a0,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            const midRing = new THREE.Mesh(midRingGeometry, midRingMaterial);
            midRing.rotation.x = -Math.PI / 2;
            midRing.position.y = 0.05;
            whirlpoolGroup.add(midRing);

            // Inner dark vortex
            const innerGeometry = new THREE.CircleGeometry(0.8, 24);
            const innerMaterial = new THREE.MeshBasicMaterial({
                color: 0x000020,
                transparent: true,
                opacity: 0.9
            });
            const inner = new THREE.Mesh(innerGeometry, innerMaterial);
            inner.rotation.x = -Math.PI / 2;
            inner.position.y = 0.02;
            whirlpoolGroup.add(inner);

            // Foam/spray particles around the edge
            for (let i = 0; i < 8; i++) {
                const foamGeometry = new THREE.SphereGeometry(0.15, 4, 4);
                const foamMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.6
                });
                const foam = new THREE.Mesh(foamGeometry, foamMaterial);
                const angle = (i / 8) * Math.PI * 2;
                foam.position.set(Math.cos(angle) * 2, 0.2, Math.sin(angle) * 2);
                whirlpoolGroup.add(foam);
            }

            whirlpoolGroup.position.set(pos.x, terrainHeight, pos.z);
            G.scene.add(whirlpoolGroup);
            G.traps.push({
                mesh: whirlpoolGroup,
                outerRing: outerRing,
                midRing: midRing,
                type: 'whirlpool',
                radius: 1.2,  // Smaller hitbox - only the inner vortex kills
                spinPhase: Math.random() * Math.PI * 2
            });
        } else {
            // Regular trap for other levels
            const trapGeometry = new THREE.PlaneGeometry(2, 2);
            const trapMaterial = new THREE.MeshLambertMaterial({ color: 0x6a8a6a });
            const trap = new THREE.Mesh(trapGeometry, trapMaterial);
            trap.rotation.x = -Math.PI / 2;
            trap.position.set(pos.x, terrainHeight + 0.02, pos.z);
            trap.receiveShadow = true;
            G.scene.add(trap);
            G.traps.push({ mesh: trap, type: 'trap', radius: 1 });
        }
    });

    // Moving waterspouts (only in water level)
    G.movingTraps = [];
    if (G.levelConfig.movingTraps && G.waterTheme) {
        G.levelConfig.movingTraps.forEach(trapConfig => {
            const waterspoutGroup = new THREE.Group();
            const terrainHeight = getTerrainHeight(trapConfig.x, trapConfig.z);

            // Waterspout colors
            const outerColor = 0x1E90FF;  // Dodger blue
            const innerColor = 0x87CEEB;  // Sky blue
            const particleColor = 0xB0E0E6; // Powder blue

            // Outer cone - moderate size
            const coneHeight = 8 + trapConfig.radius;
            const coneRadius = trapConfig.radius * 0.8;
            const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 16, 6, true);
            const coneMaterial = new THREE.MeshBasicMaterial({
                color: outerColor,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const outerCone = new THREE.Mesh(coneGeometry, coneMaterial);
            outerCone.rotation.x = Math.PI; // Point up
            outerCone.position.y = coneHeight / 2;
            waterspoutGroup.add(outerCone);

            // Inner spinning cone
            const innerRadius = coneRadius * 0.5;
            const innerHeight = coneHeight * 0.8;
            const innerConeGeometry = new THREE.ConeGeometry(innerRadius, innerHeight, 16, 6, true);
            const innerConeMaterial = new THREE.MeshBasicMaterial({
                color: innerColor,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const innerCone = new THREE.Mesh(innerConeGeometry, innerConeMaterial);
            innerCone.rotation.x = Math.PI;
            innerCone.position.y = innerHeight / 2;
            waterspoutGroup.add(innerCone);

            // Core vortex
            const coreRadius = coneRadius * 0.25;
            const coreHeight = coneHeight * 0.6;
            const coreConeGeometry = new THREE.ConeGeometry(coreRadius, coreHeight, 12, 4, true);
            const coreConeMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const coreCone = new THREE.Mesh(coreConeGeometry, coreConeMaterial);
            coreCone.rotation.x = Math.PI;
            coreCone.position.y = coreHeight / 2;
            waterspoutGroup.add(coreCone);

            // Add water spray particles - many particles for intimidating look
            const dustGroup = new THREE.Group();
            for (let i = 0; i < 80; i++) {
                const dustGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 4, 4);
                const dustMaterial = new THREE.MeshBasicMaterial({
                    color: i % 3 === 0 ? 0xFFFFFF : particleColor,
                    transparent: true,
                    opacity: 0.4 + Math.random() * 0.4
                });
                const dust = new THREE.Mesh(dustGeometry, dustMaterial);
                const angle = Math.random() * Math.PI * 2;
                const height = Math.random() * coneHeight;
                const radius = (height / coneHeight) * coneRadius * (0.5 + Math.random() * 0.6);
                dust.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
                dustGroup.add(dust);
            }
            waterspoutGroup.add(dustGroup);

            // Swirling foam rings at different heights
            for (let h = 0; h < 4; h++) {
                const ringHeight = (h + 1) * coneHeight * 0.2;
                const ringRadius = (ringHeight / coneHeight) * coneRadius;
                const foamRingGeometry = new THREE.TorusGeometry(ringRadius, 0.15, 8, 16);
                const foamRingMaterial = new THREE.MeshBasicMaterial({
                    color: 0xB0E0E6,
                    transparent: true,
                    opacity: 0.5 - h * 0.1
                });
                const foamRing = new THREE.Mesh(foamRingGeometry, foamRingMaterial);
                foamRing.rotation.x = Math.PI / 2;
                foamRing.position.y = ringHeight;
                foamRing.userData.spinSpeed = 0.05 + h * 0.02;
                waterspoutGroup.add(foamRing);
            }

            // Flying debris/fish being sucked up
            const debrisGroup = new THREE.Group();
            for (let i = 0; i < 8; i++) {
                const debrisGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.5);
                const debrisMaterial = new THREE.MeshBasicMaterial({
                    color: i % 2 === 0 ? 0x8B4513 : 0x696969,  // Brown wood or grey
                    transparent: true,
                    opacity: 0.8
                });
                const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
                const angle = (i / 8) * Math.PI * 2;
                const height = 2 + Math.random() * (coneHeight - 3);
                const radius = (height / coneHeight) * coneRadius * 0.7;
                debris.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
                debris.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                debrisGroup.add(debris);
            }
            waterspoutGroup.add(debrisGroup);
            waterspoutGroup.debrisGroup = debrisGroup;

            // Large base foam/splash ring
            const baseRingGeometry = new THREE.RingGeometry(coneRadius * 0.5, coneRadius * 1.5, 32);
            const baseRingMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
            });
            const baseRing = new THREE.Mesh(baseRingGeometry, baseRingMaterial);
            baseRing.rotation.x = -Math.PI / 2;
            baseRing.position.y = 0.2;
            waterspoutGroup.add(baseRing);

            // Outer splash waves
            const splashGeometry = new THREE.RingGeometry(coneRadius * 1.3, coneRadius * 2.0, 32);
            const splashMaterial = new THREE.MeshBasicMaterial({
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const splash = new THREE.Mesh(splashGeometry, splashMaterial);
            splash.rotation.x = -Math.PI / 2;
            splash.position.y = 0.1;
            waterspoutGroup.add(splash);

            waterspoutGroup.position.set(trapConfig.x, terrainHeight, trapConfig.z);
            G.scene.add(waterspoutGroup);

            G.movingTraps.push({
                mesh: waterspoutGroup,
                outerCone: outerCone,
                innerCone: innerCone,
                coreCone: coreCone,
                dustGroup: dustGroup,
                debrisGroup: debrisGroup,
                baseRing: baseRing,
                baseX: trapConfig.x,
                baseZ: trapConfig.z,
                radius: trapConfig.radius,
                speed: trapConfig.speed,
                rangeX: trapConfig.rangeX,
                rangeZ: trapConfig.rangeZ,
                phase: Math.random() * Math.PI * 2,
                spinPhase: Math.random() * Math.PI * 2
            });
        });
    }

    // Goblin creation - now handled by js/entities/entity-goblin.js
    // createGoblin function is registered with ENTITY_REGISTRY and exported as window.createGoblin

    // Guardian creation - now handled by js/entities/entity-guardian.js
    // createGuardianGoblin function is registered with ENTITY_REGISTRY and exported as window.createGuardianGoblin

    // Skeleton creation - now handled by js/entities/entity-skeleton.js
    // createSkeleton function is registered with ENTITY_REGISTRY and exported as window.createSkeleton

    // Giant creation - now handled by js/entities/entity-giant.js
    // createGiant function is registered with ENTITY_REGISTRY and exported as window.createGiant

    // Wizard creation - now handled by js/entities/entity-wizard.js
    // createWizard function is registered with ENTITY_REGISTRY and exported as window.createWizard

    // Mummy creation - now handled by js/entities/entity-mummy.js
    // createMummy function is registered with ENTITY_REGISTRY and exported as window.createMummy

    // Lava Monster creation - now handled by js/entities/entity-lava-monster.js
    // createLavaMonster function is registered with ENTITY_REGISTRY and exported as window.createLavaMonster

    // Create goblins
    G.goblins = [];
    G.goblinPositions = G.levelConfig.goblins;
    G.maxGoblins = difficulty === 'easy' ? GAME_CONFIG.EASY_GOBLIN_COUNT : GAME_CONFIG.HARD_GOBLIN_COUNT;
    
    for (let i = 0; i < Math.min(G.maxGoblins, G.goblinPositions.length); i++) {
        const pos = G.goblinPositions[i];
        G.goblins.push(createGoblin(pos[0], pos[1], pos[2], pos[3], pos[4]));
    }
    
    // Create guardian goblins from level config (both difficulties)
    G.levelConfig.guardians.forEach(guardian => {
        G.goblins.push(createGuardianGoblin(guardian[0], guardian[1], guardian[2], guardian[3], guardian[4]));
    });
    
    // Create skeleton warriors from level config (graveyard level)
    if (G.levelConfig.skeletons) {
        G.levelConfig.skeletons.forEach(skeleton => {
            G.goblins.push(createSkeleton(skeleton[0], skeleton[1], skeleton[2], skeleton[3], skeleton[4]));
        });
    }
    
    // Guardians in a ring around treasure (both difficulties, only if level has treasure)
    if (G.levelConfig.hasTreasure !== false) {
        const treasureGuardX = G.levelConfig.treasurePosition?.x ?? GAME_CONFIG.TREASURE_X;
        const treasureGuardZ = G.levelConfig.treasurePosition?.z ?? GAME_CONFIG.TREASURE_Z;
        for (let i = 0; i < GAME_CONFIG.HARD_GUARDIAN_COUNT; i++) {
            const angle = (i / GAME_CONFIG.HARD_GUARDIAN_COUNT) * Math.PI * 2;
            const x = treasureGuardX + Math.cos(angle) * 8;
            const z = treasureGuardZ + Math.sin(angle) * 8;
            G.goblins.push(createGuardianGoblin(x, z, x - 3, x + 3, 0.014));
        }
    }
    
    // Create special enemies on hard mode only
    if (difficulty === 'hard') {
        // Create giants from level config
        G.levelConfig.giants.forEach(giant => {
            G.goblins.push(createGiant(giant[0], giant[1], giant[2], giant[3]));
        });
        
        // Create wizard goblins from level config
        if (G.levelConfig.wizards) {
            G.levelConfig.wizards.forEach(wizard => {
                G.goblins.push(createWizard(wizard[0], wizard[1], wizard[2], wizard[3], wizard[4]));
            });
        }
        
        // Create mummies from level config (desert enemies)
        if (G.levelConfig.mummies) {
            G.levelConfig.mummies.forEach(mummy => {
                G.goblins.push(createMummy(mummy[0], mummy[1], mummy[2], mummy[3], mummy[4]));
            });
        }
        
        // Create lava monsters from level config (lava caves enemies)
        if (G.levelConfig.lavaMonsters) {
            G.levelConfig.lavaMonsters.forEach(monster => {
                G.goblins.push(createLavaMonster(monster[0], monster[1], monster[2], monster[3], monster[4]));
            });
        }
        
        // Additional regular goblins for hard mode
        G.levelConfig.hardModeGoblins.forEach(goblin => {
            G.goblins.push(createGoblin(goblin[0], goblin[1], goblin[2], goblin[3], goblin[4]));
        });
    }

    // createOvenEntity function moved to js/entities/entity-oven.js

    // Create candy ovens for gingerbread spawning (candy theme only)
    G.ovens = [];
    if (G.candyTheme && G.levelConfig.ovens) {
        G.levelConfig.ovens.forEach(ovenConfig => {
            const oven = createOvenEntity(ovenConfig.x, ovenConfig.z);
            G.ovens.push(oven);
        });
    }

    // Rainbow
    G.rainbowGroup = new THREE.Group();
    G.rainbowColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
    G.rainbowLights = [];
    G.rainbowColors.forEach((color, i) => {
        const radius = 5 - (i * 0.3);
        const arcGeometry = new THREE.TorusGeometry(radius, 0.3, 8, 32, Math.PI);
        const arcMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });
        const arc = new THREE.Mesh(arcGeometry, arcMaterial);
        G.rainbowGroup.add(arc);

        // Add a point light for each rainbow color
        const light = new THREE.PointLight(color, 0.8, 25);
        // Position lights along the arc
        const angle = Math.PI * (i / (G.rainbowColors.length - 1)); // Spread across the arc
        light.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        );
        G.rainbowGroup.add(light);
        G.rainbowLights.push(light);
    });

    // Add LOTS of glow sprites around the rainbow for a real party!
    G.rainbowGlowSprites = [];
    for (let i = 0; i < 200; i++) {
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 64;
        glowCanvas.height = 64;
        const glowCtx = glowCanvas.getContext('2d');

        // Random rainbow color for each sprite
        const color = G.rainbowColors[Math.floor(Math.random() * G.rainbowColors.length)];
        const colorStr = '#' + color.toString(16).padStart(6, '0');

        // Create glowing circle
        const gradient = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.2, colorStr);
        gradient.addColorStop(0.5, colorStr);
        gradient.addColorStop(1, 'transparent');
        glowCtx.fillStyle = gradient;
        glowCtx.fillRect(0, 0, 64, 64);

        const glowTexture = new THREE.CanvasTexture(glowCanvas);
        const glowMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.9
        });
        const glowSprite = new THREE.Sprite(glowMaterial);

        // Position sprites in a larger area around the rainbow
        const angle = Math.random() * Math.PI;
        const radius = 1 + Math.random() * 8;
        const offset = (Math.random() - 0.5) * 6;
        glowSprite.position.set(
            Math.cos(angle) * radius + (Math.random() - 0.5) * 3,
            Math.sin(angle) * radius + (Math.random() - 0.5) * 3,
            offset
        );
        glowSprite.scale.set(0.4 + Math.random() * 0.8, 0.4 + Math.random() * 0.8, 1);
        glowSprite.userData = {
            baseY: glowSprite.position.y,
            baseX: glowSprite.position.x,
            baseZ: glowSprite.position.z,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 2,
            pulseSpeed: 1 + Math.random() * 3,
            orbitSpeed: (Math.random() - 0.5) * 0.5
        };
        G.rainbowGroup.add(glowSprite);
        G.rainbowGlowSprites.push(glowSprite);
    }

    // Create BIG disco ball above the rainbow - using 3D mirror tiles
    G.discoBallGroup = new THREE.Group();
    G.discoBallRadius = 2.5;

    // Create disco ball using actual 3D box tiles arranged in a sphere
    G.discoMirrors = [];
    G.tileSize = 0.35;
    G.tileDepth = 0.08;

    for (let lat = -80; lat <= 80; lat += 12) {
        const latRad = lat * Math.PI / 180;
        const ringRadius = Math.cos(latRad) * G.discoBallRadius;
        const y = Math.sin(latRad) * G.discoBallRadius;
        const circumference = 2 * Math.PI * ringRadius;
        const tilesInRing = Math.max(4, Math.floor(circumference / (G.tileSize + 0.05)));

        for (let i = 0; i < tilesInRing; i++) {
            const lon = (i / tilesInRing) * Math.PI * 2;
            const x = Math.cos(lon) * ringRadius;
            const z = Math.sin(lon) * ringRadius;

            // Create 3D mirror tile
            const tileGeometry = new THREE.BoxGeometry(G.tileSize, G.tileSize, G.tileDepth);
            const tileMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: false
            });
            const tile = new THREE.Mesh(tileGeometry, tileMaterial);

            // Position tile on sphere surface
            tile.position.set(x, y, z);
            // Make tile face outward from center
            tile.lookAt(x * 2, y * 2, z * 2);

            tile.userData = { phase: Math.random() * Math.PI * 2 };
            G.discoBallGroup.add(tile);
            G.discoMirrors.push(tile);
        }
    }

    // Add top and bottom cap tiles
    G.capTileMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    G.topCap = new THREE.Mesh(new THREE.BoxGeometry(G.tileSize, G.tileSize, G.tileDepth), G.capTileMaterial.clone());
    G.topCap.position.set(0, G.discoBallRadius, 0);
    G.topCap.rotation.x = -Math.PI / 2;
    G.topCap.userData = { phase: Math.random() * Math.PI * 2 };
    G.discoBallGroup.add(G.topCap);
    G.discoMirrors.push(G.topCap);

    G.bottomCap = new THREE.Mesh(new THREE.BoxGeometry(G.tileSize, G.tileSize, G.tileDepth), G.capTileMaterial.clone());
    G.bottomCap.position.set(0, -G.discoBallRadius, 0);
    G.bottomCap.rotation.x = Math.PI / 2;
    G.bottomCap.userData = { phase: Math.random() * Math.PI * 2 };
    G.discoBallGroup.add(G.bottomCap);
    G.discoMirrors.push(G.bottomCap);

    // Add dark gaps/core visible between tiles
    G.coreGeometry = new THREE.SphereGeometry(G.discoBallRadius - G.tileDepth, 16, 16);
    G.coreMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
    G.core = new THREE.Mesh(G.coreGeometry, G.coreMaterial);
    G.discoBallGroup.add(G.core);

    // Disco ball hanging rod - connects to top of rainbow
    G.rodLength = 3;
    G.rodGeometry = new THREE.CylinderGeometry(0.08, 0.08, G.rodLength, 8);
    G.rodMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
    G.rod = new THREE.Mesh(G.rodGeometry, G.rodMaterial);
    G.rod.position.y = G.discoBallRadius + G.rodLength / 2;
    G.discoBallGroup.add(G.rod);

    // Add a small hook/ring at the top of the rod
    G.hookGeometry = new THREE.TorusGeometry(0.15, 0.04, 8, 16);
    G.hookMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    G.hook = new THREE.Mesh(G.hookGeometry, G.hookMaterial);
    G.hook.position.y = G.discoBallRadius + G.rodLength;
    G.hook.rotation.x = Math.PI / 2;
    G.discoBallGroup.add(G.hook);

    // Add multiple colored point lights around the disco ball
    G.discoBallLight = new THREE.PointLight(0xffffff, 3, 50);
    G.discoBallLight.position.set(0, 0, 0);
    G.discoBallGroup.add(G.discoBallLight);

    // Add spinning light beams shooting out from disco ball
    G.discoLightBeams = [];
    for (let i = 0; i < 12; i++) {
        const beamCanvas = document.createElement('canvas');
        beamCanvas.width = 32;
        beamCanvas.height = 128;
        const beamCtx = beamCanvas.getContext('2d');

        const beamGradient = beamCtx.createLinearGradient(16, 0, 16, 128);
        beamGradient.addColorStop(0, 'rgba(255,255,255,0.8)');
        beamGradient.addColorStop(0.3, 'rgba(255,255,255,0.4)');
        beamGradient.addColorStop(1, 'rgba(255,255,255,0)');
        beamCtx.fillStyle = beamGradient;
        beamCtx.fillRect(0, 0, 32, 128);

        const beamTexture = new THREE.CanvasTexture(beamCanvas);
        const beamMaterial = new THREE.SpriteMaterial({
            map: beamTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.6
        });
        const beam = new THREE.Sprite(beamMaterial);
        beam.scale.set(1.5, 15, 1);
        beam.position.set(0, -5, 0);

        const beamPivot = new THREE.Group();
        beamPivot.add(beam);
        const angle = (i / 12) * Math.PI * 2;
        beamPivot.rotation.z = angle;
        beamPivot.userData = {
            baseAngle: angle,
            color: G.rainbowColors[i % G.rainbowColors.length]
        };
        G.discoBallGroup.add(beamPivot);
        G.discoLightBeams.push(beamPivot);
    }

    // Position disco ball hanging from the center top of the rainbow arc
    // Rainbow outer radius is 5, so top of arc is at y=5. Disco ball hangs below that.
    G.discoBallGroup.position.set(0, 5 - G.discoBallRadius - 3, 0);  // Hang from top center
    G.rainbowGroup.add(G.discoBallGroup);

    G.rainbowGroup.position.set(G.levelConfig.rainbow.x, 5, G.levelConfig.rainbow.z + 5);
    G.rainbowGroup.rotation.y = Math.PI / 2; // Rotate 90 degrees to face G.player
    G.scene.add(G.rainbowGroup);

    // Track if techno music is playing
    G.technoMusicPlaying = false;

    // Treasure
    G.treasureGroup = new THREE.Group();

    // World Kite (collectible)
    G.worldKiteGroup = new THREE.Group();
    G.worldKiteGeometry = new THREE.ConeGeometry(0.8, 1.2, 4);
    G.worldKiteMaterial = new THREE.MeshLambertMaterial({ color: 0xFF1493 });
    G.worldKite = new THREE.Mesh(G.worldKiteGeometry, G.worldKiteMaterial);
    G.worldKite.rotation.x = Math.PI;
    G.worldKite.castShadow = true;
    G.worldKiteGroup.add(G.worldKite);
    
    G.worldTailGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 4);
    G.worldTailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFF00 });
    G.worldTail = new THREE.Mesh(G.worldTailGeometry, G.worldTailMaterial);
    G.worldTail.position.y = -1.2;
    G.worldKiteGroup.add(G.worldTail);
    
    // Only create world kite if defined for this level and not already collected
    if (G.levelConfig.worldKite) {
        G.worldKiteGroup.position.set(G.levelConfig.worldKite.x, getTerrainHeight(G.levelConfig.worldKite.x, G.levelConfig.worldKite.z) + 1.5, G.levelConfig.worldKite.z);
        G.scene.add(G.worldKiteGroup);
    }
    
    // Use persistent kite state
    G.worldKiteCollected = persistentInventory.hasKite;
    if (G.worldKiteCollected) {
        G.player.hasKite = true;
        G.worldKiteGroup.visible = false;
    }

    G.chestBottomGeometry = new THREE.BoxGeometry(1, 0.6, 0.8);
    G.chestMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    G.chestBottom = new THREE.Mesh(G.chestBottomGeometry, G.chestMaterial);
    G.chestBottom.position.y = 0.3;
    G.chestBottom.castShadow = true;
    G.treasureGroup.add(G.chestBottom);

    G.chestLidGeometry = new THREE.BoxGeometry(1, 0.4, 0.8);
    G.chestLid = new THREE.Mesh(G.chestLidGeometry, G.chestMaterial);
    G.chestLid.position.y = 0.8;
    G.chestLid.position.z = -0.3;
    G.chestLid.rotation.x = -Math.PI / 3;
    G.chestLid.castShadow = true;
    G.treasureGroup.add(G.chestLid);

    G.goldMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xFFD700, 
        emissive: 0xFFAA00,
        emissiveIntensity: 0.5
    });

    G.goldPileGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    G.goldPile = new THREE.Mesh(G.goldPileGeometry, G.goldMaterial);
    G.goldPile.position.y = 0.7;
    G.goldPile.castShadow = true;
    G.treasureGroup.add(G.goldPile);

    for (let i = 0; i < 12; i++) {
        const goldGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8);
        const goldCoin = new THREE.Mesh(goldGeometry, G.goldMaterial);
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.4 + (i % 2) * 0.1;
        goldCoin.position.x = Math.cos(angle) * radius;
        goldCoin.position.y = 0.6 + Math.random() * 0.2;
        goldCoin.position.z = Math.sin(angle) * radius;
        goldCoin.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        goldCoin.rotation.z = Math.random() * Math.PI;
        goldCoin.castShadow = true;
        G.treasureGroup.add(goldCoin);
    }

    // Use level-specific treasure position if defined, otherwise use default
    G.treasureX = G.levelConfig.treasurePosition?.x ?? GAME_CONFIG.TREASURE_X;
    G.treasureZ = G.levelConfig.treasurePosition?.z ?? GAME_CONFIG.TREASURE_Z;
    G.treasureGroup.position.set(G.treasureX, 0, G.treasureZ);
    
    // Only add treasure if level has it (default true for backwards compatibility)
    G.hasTreasure = G.levelConfig.hasTreasure !== false;
    if (G.hasTreasure) {
        G.scene.add(G.treasureGroup);
    }

    G.treasure = G.hasTreasure ? { mesh: G.treasureGroup, radius: 1 } : null;

    // Ice Berg - optional per level
    G.iceBergGroup = new THREE.Group();
    G.iceBerg = null;
    G.hasIcePower = false;
    G.icePowerCollected = false;
    
    if (G.levelConfig.iceBerg) {
        // Main ice berg structure - tall crystalline shape
        // Use obsidian theme for lava level, ice theme for others
        // Using MeshLambertMaterial for better performance (no expensive specular calculations)
        const iceBergGeometry = new THREE.ConeGeometry(8, 20, 6);
        const iceBergMaterial = G.lavaTheme ? new THREE.MeshLambertMaterial({
            color: 0x3a2a4a,  // Dark purple obsidian
            transparent: true,
            opacity: 0.85,
            emissive: 0x110022,
            emissiveIntensity: 0.3
        }) : new THREE.MeshLambertMaterial({
            color: 0xB0E0E6,
            transparent: true,
            opacity: 0.75
        });
    const iceBergMesh = new THREE.Mesh(iceBergGeometry, iceBergMaterial);
    iceBergMesh.position.y = 10;
    iceBergMesh.castShadow = true;
    iceBergMesh.receiveShadow = true;
    G.iceBergGroup.add(iceBergMesh);

    // Add glowing core for lava level obsidian pillar
    if (G.lavaTheme) {
        G.coreGeometry = new THREE.ConeGeometry(3, 18, 6);
        G.coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x6633cc,
            transparent: true,
            opacity: 0.4
        });
        G.core = new THREE.Mesh(G.coreGeometry, G.coreMaterial);
        G.core.position.y = 10;
        G.iceBergGroup.add(G.core);

        // Add point light for glow effect
        const obsidianLight = new THREE.PointLight(0x6633cc, 1.5, 25);
        obsidianLight.position.y = 10;
        G.iceBergGroup.add(obsidianLight);
    }

    // Additional crystals around the base
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const dist = 6;
        const crystalGeometry = new THREE.ConeGeometry(2, 8, 6);
        const crystal = new THREE.Mesh(crystalGeometry, iceBergMaterial);
        crystal.position.x = Math.cos(angle) * dist;
        crystal.position.z = Math.sin(angle) * dist;
        crystal.position.y = 4;
        crystal.rotation.z = Math.random() * 0.3 - 0.15;
        G.iceBergGroup.add(crystal);
    }
    
        // Position ice berg on the north side of river, between river and gap
        G.iceBergGroup.position.set(G.levelConfig.iceBerg.x, getTerrainHeight(G.levelConfig.iceBerg.x, G.levelConfig.iceBerg.z), G.levelConfig.iceBerg.z);
        G.scene.add(G.iceBergGroup);
        
        G.iceBerg = {
            mesh: G.iceBergGroup,
            position: { x: G.levelConfig.iceBerg.x, z: G.levelConfig.iceBerg.z },
            radius: 12,
            powerRadius: 8 // Radius for collecting ice power
        };
    } // End of G.iceBerg if block

    // Banana Ice Berg - close to spawn for easy testing
    G.bananaIceBergGroup = new THREE.Group();
    
    // Main banana ice berg structure - tall crystalline shape (yellow tinted)
    // Using MeshLambertMaterial for better performance
    G.bananaIceBergGeometry = new THREE.ConeGeometry(8, 20, 6);
    G.bananaIceBergMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFF99, // Yellow tint
        transparent: true,
        opacity: 0.75
    });
    G.bananaIceBergMesh = new THREE.Mesh(G.bananaIceBergGeometry, G.bananaIceBergMaterial);
    G.bananaIceBergMesh.position.y = 10;
    G.bananaIceBergMesh.castShadow = true;
    G.bananaIceBergMesh.receiveShadow = true;
    G.bananaIceBergGroup.add(G.bananaIceBergMesh);
    
    // Additional banana crystals around the base
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const dist = 6;
        const crystalGeometry = new THREE.ConeGeometry(2, 8, 6);
        const crystal = new THREE.Mesh(crystalGeometry, G.bananaIceBergMaterial);
        crystal.position.x = Math.cos(angle) * dist;
        crystal.position.z = Math.sin(angle) * dist;
        crystal.position.y = 4;
        crystal.rotation.z = Math.random() * 0.3 - 0.15;
        G.bananaIceBergGroup.add(crystal);
    }
    
    // Position banana ice berg in first area (before first mountain gap)
    G.bananaIceBergGroup.position.set(-30, getTerrainHeight(-30, -50), -50);
    G.scene.add(G.bananaIceBergGroup);
    
    G.bananaIceBerg = {
        mesh: G.bananaIceBergGroup,
        position: { x: -30, z: -50 },
        radius: 12,
        powerRadius: 8
    };
    
    G.hasBananaPower = false;
    G.bananaPowerCollected = false;
    G.bananaInventory = 0; // Number of bananas G.player has
    G.maxBananas = 5;
    
    // Placed bananas array
    G.placedBananas = [];
    G.worldBananaPowerCollected = false; // Shared collection flag for multiplayer

    // Bomb inventory - use persistent if available
    G.bombInventory = persistentInventory.bombs !== null ? persistentInventory.bombs : 0;
    G.maxBombs = 3;
    G.placedBombs = []; // {id, mesh, x, z, radius, explodeAt}

    // ============================================
    // HERZ-MAN TURRET SYSTEM
    // ============================================
    G.herzmanInventory = persistentInventory.herzmen !== null ? persistentInventory.herzmen : GAME_CONFIG.HERZMAN_STARTING_COUNT;
    G.maxHerzmen = GAME_CONFIG.HERZMAN_MAX_PLACED;
    G.placedHerzmen = []; // {id, mesh, x, z, lastFireTime}
    G.heartBombs = []; // Projectiles shot by Herz-Men
    // Note: G.herzmanPickups is initialized and populated in initSetup()

    // ============================================
    // PORTAL SYSTEM - For level switching
    // ============================================
    G.portalGroup = new THREE.Group();
    G.portalConfig = G.levelConfig.portal;
    G.portalCooldown = 0; // Prevent immediate re-entry
    G.portal = null; // Will be null if no G.portal for this level
    G.portalParticles = [];
    
    // Only create portal if this level has one
    if (G.portalConfig) {
        // Create portal outer ring (spinning torus)
        const portalRingGeometry = new THREE.TorusGeometry(3, 0.3, 16, 48);
        const portalRingMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const portalRing = new THREE.Mesh(portalRingGeometry, portalRingMaterial);
        portalRing.rotation.x = Math.PI / 2;
        G.portalGroup.add(portalRing);
        
        // Inner spinning ring
        const portalInnerRingGeometry = new THREE.TorusGeometry(2.2, 0.2, 16, 48);
    const portalInnerRingMaterial = new THREE.MeshPhongMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.8
    });
    const portalInnerRing = new THREE.Mesh(portalInnerRingGeometry, portalInnerRingMaterial);
    portalInnerRing.rotation.x = Math.PI / 2;
    G.portalGroup.add(portalInnerRing);
    
    // Portal center swirl effect (animated disc)
    const portalCenterGeometry = new THREE.CircleGeometry(2, 32);
    const portalCenterMaterial = new THREE.MeshBasicMaterial({
        color: 0x8800ff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const portalCenter = new THREE.Mesh(portalCenterGeometry, portalCenterMaterial);
    portalCenter.rotation.x = Math.PI / 2;
    portalCenter.position.y = 0.1;
    G.portalGroup.add(portalCenter);
    
    // Portal particles (floating orbs)
    for (let i = 0; i < 12; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x00ffff : 0xff00ff,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.userData = {
            angle: (i / 12) * Math.PI * 2,
            radius: 2.5,
            speed: 0.02 + Math.random() * 0.02,
            yOffset: Math.random() * 2
        };
        G.portalGroup.add(particle);
        G.portalParticles.push(particle);
    }
    
    // Portal base glow
    const portalGlowGeometry = new THREE.CylinderGeometry(4, 4, 0.2, 32);
    const portalGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x4400aa,
        transparent: true,
        opacity: 0.4
    });
    const portalGlow = new THREE.Mesh(portalGlowGeometry, portalGlowMaterial);
    portalGlow.position.y = 0.1;
    G.portalGroup.add(portalGlow);
    
    // Portal pillars (mystical columns on each side)
    const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, 5, 8);
    const pillarMaterial = new THREE.MeshPhongMaterial({
        color: 0x6600cc,
        emissive: 0x220044,
        emissiveIntensity: 0.4
    });
    
    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    leftPillar.position.set(-3.5, 2.5, 0);
    G.portalGroup.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    rightPillar.position.set(3.5, 2.5, 0);
    G.portalGroup.add(rightPillar);
    
    // Pillar top orbs
    const orbGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const orbMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.9
    });
    
    const leftOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    leftOrb.position.set(-3.5, 5.3, 0);
    G.portalGroup.add(leftOrb);
    
    const rightOrb = new THREE.Mesh(orbGeometry, orbMaterial);
    rightOrb.position.set(3.5, 5.3, 0);
    G.portalGroup.add(rightOrb);
    
    // Position portal
    const portalY = getTerrainHeight(G.portalConfig.x, G.portalConfig.z);
    G.portalGroup.position.set(G.portalConfig.x, portalY, G.portalConfig.z);
    G.scene.add(G.portalGroup);
    
    G.portal = {
        mesh: G.portalGroup,
        x: G.portalConfig.x,
        z: G.portalConfig.z,
        radius: 3,
        destinationLevel: G.portalConfig.destinationLevel
    };
    } // End of G.portal creation if block
    
    // Portal animation function (called in game loop) - only if portal exists
    function animatePortal() {
        if (!G.portal) return;
        
        const time = Date.now() * 0.001;
        
        // Decrease portal cooldown
        if (G.portalCooldown > 0) {
            G.portalCooldown--;
        }
        
        // Animate the portal group children
        G.portalGroup.children.forEach(child => {
            if (child.geometry && child.geometry.type === 'TorusGeometry') {
                child.rotation.z = time * (child.geometry.parameters.radius > 2.5 ? 0.5 : -0.8);
            }
        });
    }
    
    // Level 2 unique elements (ice crystals and frozen lakes)
    G.iceCrystals = [];
    G.frozenLakes = [];
    
    if (G.levelConfig.iceCrystals) {
        G.levelConfig.iceCrystals.forEach(crystal => {
            const crystalGroup = new THREE.Group();
            
            // Main crystal
            const mainCrystalGeometry = new THREE.ConeGeometry(0.8 * crystal.scale, 3 * crystal.scale, 6);
            const crystalMaterial = new THREE.MeshPhongMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0.7,
                shininess: 100,
                specular: 0xffffff
            });
            const mainCrystal = new THREE.Mesh(mainCrystalGeometry, crystalMaterial);
            mainCrystal.position.y = 1.5 * crystal.scale;
            crystalGroup.add(mainCrystal);
            
            // Smaller side crystals
            for (let i = 0; i < 3; i++) {
                const sideGeometry = new THREE.ConeGeometry(0.4 * crystal.scale, 1.5 * crystal.scale, 6);
                const sideCrystal = new THREE.Mesh(sideGeometry, crystalMaterial);
                const angle = (i / 3) * Math.PI * 2 + Math.random();
                sideCrystal.position.x = Math.cos(angle) * 0.8 * crystal.scale;
                sideCrystal.position.z = Math.sin(angle) * 0.8 * crystal.scale;
                sideCrystal.position.y = 0.75 * crystal.scale;
                sideCrystal.rotation.z = (Math.random() - 0.5) * 0.3;
                crystalGroup.add(sideCrystal);
            }
            
            crystalGroup.position.set(crystal.x, getTerrainHeight(crystal.x, crystal.z), crystal.z);
            G.scene.add(crystalGroup);
            G.iceCrystals.push({ mesh: crystalGroup, x: crystal.x, z: crystal.z });
        });
    }
    
    if (G.levelConfig.frozenLakes) {
        G.levelConfig.frozenLakes.forEach(lake => {
            const lakeGeometry = new THREE.CircleGeometry(lake.radius, 32);
            const lakeMaterial = new THREE.MeshPhongMaterial({
                color: 0x88ccff,
                transparent: true,
                opacity: 0.8,
                shininess: 150,
                specular: 0xffffff
            });
            const lakeMesh = new THREE.Mesh(lakeGeometry, lakeMaterial);
            lakeMesh.rotation.x = -Math.PI / 2;
            lakeMesh.position.set(lake.x, getTerrainHeight(lake.x, lake.z) + 0.05, lake.z);
            G.scene.add(lakeMesh);
            G.frozenLakes.push({ mesh: lakeMesh, x: lake.x, z: lake.z, radius: lake.radius });
        });
    }
    
    // Level 4 unique elements - lava pools and cave ceiling
    G.lavaPools = [];
    G.caveCeiling = null;
    
    if (G.levelConfig.lavaPools) {
        G.levelConfig.lavaPools.forEach(pool => {
            const poolGroup = new THREE.Group();
            
            // Main lava surface - positioned above ground
            const poolGeometry = new THREE.CircleGeometry(pool.radius, 32);
            const poolMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.95
            });
            const poolMesh = new THREE.Mesh(poolGeometry, poolMaterial);
            poolMesh.rotation.x = -Math.PI / 2;
            poolMesh.position.y = 0.3;
            poolGroup.add(poolMesh);
            
            // Inner brighter core
            G.coreGeometry = new THREE.CircleGeometry(pool.radius * 0.6, 32);
            G.coreMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.9
            });
            const coreMesh = new THREE.Mesh(G.coreGeometry, G.coreMaterial);
            coreMesh.rotation.x = -Math.PI / 2;
            coreMesh.position.y = 0.35;
            poolGroup.add(coreMesh);
            
            // Hottest center
            const centerGeometry = new THREE.CircleGeometry(pool.radius * 0.25, 32);
            const centerMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.85
            });
            const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);
            centerMesh.rotation.x = -Math.PI / 2;
            centerMesh.position.y = 0.4;
            poolGroup.add(centerMesh);
            
            // Add point light for glow - brighter
            const lavaLight = new THREE.PointLight(0xff4400, 1.5, pool.radius * 4);
            lavaLight.position.y = 3;
            poolGroup.add(lavaLight);
            
            poolGroup.position.set(pool.x, getTerrainHeight(pool.x, pool.z) + 0.1, pool.z);
            G.scene.add(poolGroup);
            G.lavaPools.push({
                mesh: poolGroup,
                x: pool.x,
                z: pool.z,
                radius: pool.radius,
                pulsePhase: Math.random() * Math.PI * 2
            });
        });
    }

    // Level 7 unique elements - mist pools (Nebelteiche)
    G.mistPools = [];
    if (G.levelConfig.mistPools) {
        G.levelConfig.mistPools.forEach(pool => {
            const poolGroup = new THREE.Group();
            
            // Dark water surface
            const poolGeometry = new THREE.CircleGeometry(pool.radius, 32);
            const poolMaterial = new THREE.MeshLambertMaterial({
                color: 0x1a2a3a,
                transparent: true,
                opacity: 0.85
            });
            const poolMesh = new THREE.Mesh(poolGeometry, poolMaterial);
            poolMesh.rotation.x = -Math.PI / 2;
            poolMesh.position.y = 0.02;
            poolGroup.add(poolMesh);
            
            // Mist/fog layer
            const mistGeometry = new THREE.CircleGeometry(pool.radius * 1.3, 32);
            const mistMaterial = new THREE.MeshBasicMaterial({
                color: 0x445566,
                transparent: true,
                opacity: 0.4
            });
            const mistMesh = new THREE.Mesh(mistGeometry, mistMaterial);
            mistMesh.rotation.x = -Math.PI / 2;
            mistMesh.position.y = 0.5;
            poolGroup.add(mistMesh);
            
            // Rising mist particles
            const particleGroup = new THREE.Group();
            for (let i = 0; i < 8; i++) {
                const particleGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 8, 8);
                const particleMaterial = new THREE.MeshBasicMaterial({
                    color: 0x667788,
                    transparent: true,
                    opacity: 0.3
                });
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                const angle = (i / 8) * Math.PI * 2;
                const dist = pool.radius * 0.5 * Math.random();
                particle.position.set(
                    Math.cos(angle) * dist,
                    0.5 + Math.random() * 1.5,
                    Math.sin(angle) * dist
                );
                particle.userData.baseY = particle.position.y;
                particle.userData.phase = Math.random() * Math.PI * 2;
                particleGroup.add(particle);
            }
            poolGroup.add(particleGroup);
            poolGroup.userData.mistParticles = particleGroup;
            
            // Eerie purple glow
            const glowLight = new THREE.PointLight(0x6644aa, 0.5, pool.radius * 2);
            glowLight.position.y = 1;
            poolGroup.add(glowLight);
            
            poolGroup.position.set(pool.x, getTerrainHeight(pool.x, pool.z), pool.z);
            G.scene.add(poolGroup);
            G.mistPools.push({
                mesh: poolGroup,
                x: pool.x,
                z: pool.z,
                radius: pool.radius,
                phase: Math.random() * Math.PI * 2
            });
        });
    }

    // Nebelschwaden (fog wisps) for graveyard level - atmospheric floating fog sprites
    G.fogWisps = [];
    if (G.graveyardTheme) {
        // Create MANY fog wisps scattered densely across the graveyard
        const wispPositions = [
            // Near spawn area - dense fog
            { x: -20, z: 190 }, { x: 30, z: 175 }, { x: -40, z: 160 },
            { x: 50, z: 145 }, { x: -15, z: 130 }, { x: 25, z: 115 },
            { x: 0, z: 195 }, { x: -60, z: 180 }, { x: 60, z: 165 },
            { x: 10, z: 185 }, { x: -30, z: 170 }, { x: 45, z: 155 },
            { x: -55, z: 140 }, { x: 70, z: 125 }, { x: -5, z: 142 },
            // Mid graveyard - very dense
            { x: -45, z: 100 }, { x: 35, z: 85 }, { x: -10, z: 70 },
            { x: 55, z: 55 }, { x: -35, z: 40 }, { x: 20, z: 25 },
            { x: -50, z: 10 }, { x: 40, z: -5 }, { x: -25, z: -20 },
            { x: 0, z: 105 }, { x: -70, z: 90 }, { x: 70, z: 75 },
            { x: 15, z: 95 }, { x: -60, z: 80 }, { x: 65, z: 65 },
            { x: -20, z: 50 }, { x: 50, z: 35 }, { x: -65, z: 20 },
            { x: 30, z: 5 }, { x: -40, z: -10 }, { x: 60, z: -25 },
            { x: 5, z: 60 }, { x: -55, z: 45 }, { x: 55, z: 30 },
            { x: -15, z: 15 }, { x: 45, z: 0 }, { x: -30, z: -15 },
            // Near crypt - ominous thick fog
            { x: 30, z: -35 }, { x: -40, z: -50 }, { x: 15, z: -65 },
            { x: -30, z: -80 }, { x: 45, z: -95 }, { x: -20, z: -110 },
            { x: 35, z: -125 }, { x: -45, z: -140 }, { x: 10, z: -155 },
            { x: -35, z: -170 }, { x: 25, z: -185 }, { x: 0, z: -40 },
            { x: -60, z: -55 }, { x: 60, z: -70 }, { x: -5, z: -85 },
            { x: 50, z: -100 }, { x: -55, z: -115 }, { x: 20, z: -130 },
            { x: -25, z: -145 }, { x: 55, z: -160 }, { x: -15, z: -175 },
            { x: 40, z: -190 }, { x: -50, z: -180 }, { x: 5, z: -195 },
            // Extra wisps along edges
            { x: -80, z: 150 }, { x: 80, z: 140 }, { x: -85, z: 100 },
            { x: 85, z: 90 }, { x: -80, z: 50 }, { x: 80, z: 40 },
            { x: -85, z: 0 }, { x: 85, z: -10 }, { x: -80, z: -50 },
            { x: 80, z: -60 }, { x: -85, z: -100 }, { x: 85, z: -110 },
            { x: -80, z: -150 }, { x: 80, z: -160 }, { x: -75, z: -190 },
            // Central path fog
            { x: 0, z: 150 }, { x: 0, z: 120 }, { x: 0, z: 90 },
            { x: 0, z: 60 }, { x: 0, z: 30 }, { x: 0, z: 0 },
            { x: 0, z: -30 }, { x: 0, z: -60 }, { x: 0, z: -90 },
            { x: 0, z: -120 }, { x: 0, z: -150 }, { x: 0, z: -180 }
        ];
        
        wispPositions.forEach((pos, idx) => {
            // Clone the pre-cached material for each wisp
            const wispMaterial = G.fogWispBaseMaterial.clone();
            wispMaterial.opacity = 0.6 + Math.random() * 0.25;
            const wisp = new THREE.Sprite(wispMaterial);
            
            const baseY = getTerrainHeight(pos.x, pos.z) + 1.0 + Math.random() * 3;
            const scale = 8 + Math.random() * 12; // 8-20 units wide (much bigger!)
            wisp.scale.set(scale, scale * 0.8, 1); // Thicker fog wisps
            wisp.position.set(pos.x, baseY, pos.z);
            
            G.scene.add(wisp);
            G.fogWisps.push({
                sprite: wisp,
                baseX: pos.x,
                baseY: baseY,
                baseZ: pos.z,
                driftSpeed: 0.2 + Math.random() * 0.4,
                driftRange: 4 + Math.random() * 5,
                phase: Math.random() * Math.PI * 2,
                verticalPhase: Math.random() * Math.PI * 2,
                fadePhase: Math.random() * Math.PI * 2,
                scale: scale
            });
        });
    }

    // Create lava flows from rocks
    G.lavaFlows = [];
    if (G.levelConfig.lavaFlows) {
        G.levelConfig.lavaFlows.forEach(flow => {
            const flowGroup = new THREE.Group();
            const baseY = getTerrainHeight(flow.x, flow.z);

            // Create cascading lava stream with multiple segments
            const segments = 5;
            for (let i = 0; i < segments; i++) {
                const segmentLength = flow.length / segments;
                const segmentWidth = 1.5 - (i * 0.15);  // Narrows as it flows down
                const yOffset = 3 - (i * 0.5);  // Starts high, flows down

                // Lava stream segment
                const streamGeometry = new THREE.BoxGeometry(segmentWidth, 0.3, segmentLength);
                const streamMaterial = new THREE.MeshBasicMaterial({
                    color: i % 2 === 0 ? 0xff4400 : 0xffaa00,
                    transparent: true,
                    opacity: 0.9 - (i * 0.1)
                });
                const stream = new THREE.Mesh(streamGeometry, streamMaterial);
                stream.position.set(
                    flow.direction * i * 0.8,
                    yOffset,
                    i * segmentLength - flow.length / 2
                );
                stream.rotation.x = -0.15;  // Slight downward angle
                flowGroup.add(stream);
            }

            // Add glowing core
            G.coreGeometry = new THREE.BoxGeometry(0.8, 0.2, flow.length * 0.8);
            G.coreMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffaa,
                transparent: true,
                opacity: 0.6
            });
            G.core = new THREE.Mesh(G.coreGeometry, G.coreMaterial);
            G.core.position.y = 2;
            flowGroup.add(G.core);

            // Add point light for glow
            const flowLight = new THREE.PointLight(0xff6600, 1.2, 15);
            flowLight.position.y = 2;
            flowGroup.add(flowLight);

            // Position the flow at the rock
            flowGroup.position.set(flow.x, baseY, flow.z);
            flowGroup.rotation.y = flow.direction;
            G.scene.add(flowGroup);

            G.lavaFlows.push({
                mesh: flowGroup,
                x: flow.x,
                z: flow.z,
                pulsePhase: Math.random() * Math.PI * 2
            });
        });
    }

    // Create crevices (deep pits that players can fall into)
    G.crevices = [];
    if (G.levelConfig.crevices) {
        G.levelConfig.crevices.forEach(crevice => {
            const creviceGroup = new THREE.Group();
            const baseY = getTerrainHeight(crevice.x, crevice.z);

            // Dark pit opening
            const pitGeometry = new THREE.PlaneGeometry(crevice.width, crevice.length);
            const pitMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.DoubleSide
            });
            const pit = new THREE.Mesh(pitGeometry, pitMaterial);
            pit.rotation.x = -Math.PI / 2;
            pit.position.y = 0.05;
            creviceGroup.add(pit);

            // Jagged edges around the crevice
            const edgeColor = G.lavaTheme ? 0x2a1a0a : 0x333333;
            for (let i = 0; i < 8; i++) {
                const side = i < 4 ? -1 : 1;
                const along = (i % 4) / 3 - 0.5;
                const edgeGeometry = new THREE.ConeGeometry(0.4, 1, 4);
                const edgeMaterial = new THREE.MeshLambertMaterial({ color: edgeColor });
                const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
                edge.position.set(
                    side * crevice.width / 2 + (Math.random() - 0.5) * 0.5,
                    0.3,
                    along * crevice.length + (Math.random() - 0.5) * 2
                );
                edge.rotation.z = side * 0.5;
                creviceGroup.add(edge);
            }

            // Position and rotate the crevice
            creviceGroup.position.set(crevice.x, baseY, crevice.z);
            creviceGroup.rotation.y = crevice.rotation || 0;
            G.scene.add(creviceGroup);

            G.crevices.push({
                mesh: creviceGroup,
                x: crevice.x,
                z: crevice.z,
                width: crevice.width,
                length: crevice.length,
                rotation: crevice.rotation || 0
            });
        });
    }

    // Create cave ceiling for underground level
    if (G.levelConfig.hasCeiling) {
        const ceilingHeight = G.levelConfig.ceilingHeight || 25;
        
        // Large ceiling plane
        const ceilingGeometry = new THREE.PlaneGeometry(600, 600);
        const ceilingMaterial = new THREE.MeshLambertMaterial({
            color: 0x1a0f0a,
            side: THREE.DoubleSide
        });
        G.caveCeiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        G.caveCeiling.rotation.x = Math.PI / 2;
        G.caveCeiling.position.y = ceilingHeight;
        G.scene.add(G.caveCeiling);
        
        // Add stalactites hanging from ceiling
        for (let i = 0; i < 100; i++) {
            const x = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 400;
            const size = 0.5 + Math.random() * 1.5;
            const height = 2 + Math.random() * 4;
            
            const stalactiteGeometry = new THREE.ConeGeometry(size, height, 6);
            const stalactiteMaterial = new THREE.MeshLambertMaterial({
                color: 0x2a1a0a
            });
            const stalactite = new THREE.Mesh(stalactiteGeometry, stalactiteMaterial);
            stalactite.rotation.x = Math.PI; // Point downward
            stalactite.position.set(x, ceilingHeight - height / 2, z);
            G.scene.add(stalactite);
        }
        
        // Adjust ambient light for cave atmosphere - balanced visibility
        G.scene.children.forEach(child => {
            if (child.isAmbientLight) {
                child.intensity = 0.5; // Balanced cave lighting
            }
        });
    }
    
    // Apply level-specific fog
    if (G.levelConfig.fogDensity) {
        const fogColor = G.levelConfig.fogColor || G.levelConfig.skyColor || 0x87CEEB;
        G.scene.fog = new THREE.FogExp2(fogColor, G.levelConfig.fogDensity);
    }

    // createDragon function moved to js/entities/entity-dragon.js

    // createReaper function moved to js/entities/entity-reaper.js

    G.dragon = null;
    G.extraDragons = [];
    G.fireballs = [];
    
    // Spawn boss - Reaper for graveyard, Unicorn for enchanted, Easter Bunny for easter, Evil Santa for christmas, Dragon for others
    if (G.graveyardTheme || G.levelConfig.useReaper) {
        G.dragon = createReaper();
    } else if (G.enchantedTheme || G.levelConfig.useUnicorn) {
        G.dragon = createUnicorn();
    } else if (G.easterTheme || G.levelConfig.useEasterBunny) {
        G.dragon = createEasterBunny(G.levelConfig.dragon, G.levelConfig.dragon.scale || 1, 60);
    } else if (G.christmasTheme || G.levelConfig.useEvilSanta) {
        G.dragon = createEvilSanta(G.levelConfig.dragon, G.levelConfig.dragon.scale || 1, 70);
    } else if (difficulty === 'hard') {
        G.dragon = createDragon();
    }
    
    if (difficulty === 'hard') {
        
        // Create extra bosses for levels with multiple dragons/reapers/unicorns/bunnies/santas
        if (G.levelConfig.extraDragons) {
            G.levelConfig.extraDragons.forEach(pos => {
                const bossScale = pos.scale || 0.6;
                const bossHealth = pos.health || 25;
                if (G.graveyardTheme || pos.useReaper) {
                    const extraReaper = createReaper(pos, bossScale, bossHealth);
                    G.extraDragons.push(extraReaper);
                } else if (G.enchantedTheme || pos.useUnicorn) {
                    const extraUnicorn = createUnicorn(pos, bossScale, bossHealth);
                    G.extraDragons.push(extraUnicorn);
                } else if (G.easterTheme || pos.useEasterBunny) {
                    const extraBunny = createEasterBunny(pos, bossScale, bossHealth);
                    G.extraDragons.push(extraBunny);
                } else if (G.christmasTheme || pos.useEvilSanta) {
                    const extraSanta = createEvilSanta(pos, bossScale, bossHealth);
                    G.extraDragons.push(extraSanta);
                } else {
                    const extraDragon = createDragon(pos, bossScale, bossHealth);
                    G.extraDragons.push(extraDragon);
                }
            });
        }
    }

    // Game arrays
    G.bullets = [];
    G.explosions = [];
    G.smokeParticles = [];
    G.scorchMarks = [];
    G.guardianArrows = [];
    G.mummyTornados = [];
    G.lastWildTornadoSpawn = 0;
    G.wildTornadoBaseInterval = 2000; // Base spawn interval for out-of-bounds tornados
    G.lavaTrails = [];
    G.birds = [];
    G.bombs = [];

    // createBird function moved to js/entities/entity-bird.js

    // Create birds in hard mode
    if (difficulty === 'hard') {
        // Create birds from level config
        G.levelConfig.birds.forEach(birdConfig => {
            G.birds.push(createBird(birdConfig[0], birdConfig[1], birdConfig[2], birdConfig[3]));
        });
    }

    // Pirate ships (water level only)
    G.pirateShips = [];
    G.cannonballs = [];

    // createPirateShip function moved to js/entities/entity-pirate-ship.js

    // Create pirate ships in hard mode (water level only)
    if (difficulty === 'hard' && G.levelConfig.pirateShips) {
        G.levelConfig.pirateShips.forEach(shipConfig => {
            G.pirateShips.push(createPirateShip(shipConfig));
        });
    }
    
    // Initialize computer-themed level systems (firewall gates, lag events, buffer overflow zones)
    if (G.computerTheme && typeof initComputerSystems === 'function') {
        initComputerSystems();
    }

    // Export functions needed by other files
    window.animatePortal = animatePortal;
}
