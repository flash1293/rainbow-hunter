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

    // Goblin helper function
    function createGoblin(x, z, patrolLeft, patrolRight, speed = 0.013) {
        const textures = getTerrainTextures(THREE);
        const goblinGrp = new THREE.Group();

        if (G.waterTheme) {
            // Shark fin - triangle sticking out of water
            const finGeometry = new THREE.ConeGeometry(0.5, 2.5, 3);
            const finMaterial = new THREE.MeshLambertMaterial({ color: 0x2a3a4a });
            const fin = new THREE.Mesh(finGeometry, finMaterial);
            fin.position.y = 1.0;
            fin.castShadow = true;
            goblinGrp.add(fin);

            // Small dorsal detail
            const detailGeometry = new THREE.ConeGeometry(0.15, 0.5, 3);
            const detail = new THREE.Mesh(detailGeometry, finMaterial);
            detail.position.set(0, 0.3, -0.4);
            goblinGrp.add(detail);
        } else if (G.lavaTheme) {
            // DEVIL - red demonic creature for lava level
            const devilRed = 0xCC2222;
            const darkRed = 0x880000;

            // Devil body
            const bodyGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.4);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.85;
            body.castShadow = true;
            goblinGrp.add(body);

            // Devil head
            const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const headMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.55;
            head.castShadow = true;
            goblinGrp.add(head);

            // Devil horns
            const hornGeometry = new THREE.ConeGeometry(0.08, 0.5, 8);
            const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
            const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
            horn1.position.set(-0.25, 1.85, 0);
            horn1.rotation.z = 0.4;
            horn1.castShadow = true;
            goblinGrp.add(horn1);

            const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
            horn2.position.set(0.25, 1.85, 0);
            horn2.rotation.z = -0.4;
            horn2.castShadow = true;
            goblinGrp.add(horn2);

            // Glowing evil eyes
            const eyeGeometry = new THREE.SphereGeometry(0.1, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.9
            });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.15, 1.55, 0.35);
            goblinGrp.add(eye1);

            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.15, 1.55, 0.35);
            goblinGrp.add(eye2);

            // Evil grin
            const mouthGeometry = new THREE.BoxGeometry(0.25, 0.06, 0.1);
            const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0, 1.4, 0.38);
            goblinGrp.add(mouth);

            // Pointed ears
            const earGeometry = new THREE.ConeGeometry(0.1, 0.35, 4);
            const earMaterial = new THREE.MeshLambertMaterial({ color: darkRed });
            const ear1 = new THREE.Mesh(earGeometry, earMaterial);
            ear1.rotation.z = Math.PI / 2;
            ear1.position.set(-0.5, 1.5, 0);
            goblinGrp.add(ear1);

            const ear2 = new THREE.Mesh(earGeometry, earMaterial);
            ear2.rotation.z = -Math.PI / 2;
            ear2.position.set(0.5, 1.5, 0);
            goblinGrp.add(ear2);

            // Devil tail
            const tailGeometry = new THREE.CylinderGeometry(0.05, 0.03, 0.8, 6);
            const tailMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 0.5, -0.4);
            tail.rotation.x = 0.5;
            goblinGrp.add(tail);

            // Tail tip (arrow shape)
            const tipGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
            const tipMaterial = new THREE.MeshLambertMaterial({ color: darkRed });
            const tip = new THREE.Mesh(tipGeometry, tipMaterial);
            tip.position.set(0, 0.15, -0.7);
            tip.rotation.x = Math.PI / 2 + 0.3;
            goblinGrp.add(tip);

            // Small pitchfork
            const staffGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
            const staffMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const staff = new THREE.Mesh(staffGeometry, staffMaterial);
            staff.position.set(0.4, 0.9, 0.1);
            staff.rotation.z = 0.2;
            goblinGrp.add(staff);

            // Pitchfork prongs
            const prongGeometry = new THREE.ConeGeometry(0.03, 0.2, 4);
            const prongMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            for (let i = -1; i <= 1; i++) {
                const prong = new THREE.Mesh(prongGeometry, prongMaterial);
                prong.position.set(0.4 + i * 0.08, 1.55, 0.1);
                prong.rotation.z = 0.2;
                goblinGrp.add(prong);
            }
        } else if (G.candyTheme) {
            // GUMMY BEAR - colorful translucent candy creature
            const gummyColors = [0xFF6B6B, 0xFFE66D, 0x4ECDC4, 0x95E1D3, 0xF38181, 0xAA96DA];
            const gummyColor = gummyColors[Math.floor(Math.random() * gummyColors.length)];

            // Gummy bear body - rounded belly
            const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            bodyGeometry.scale(1, 1.2, 0.9);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: gummyColor,
                transparent: true,
                opacity: 0.85,
                shininess: 100,
                specular: 0xffffff
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.7;
            body.castShadow = true;
            goblinGrp.add(body);

            // Gummy bear head
            const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.y = 1.4;
            head.castShadow = true;
            goblinGrp.add(head);

            // Round ears
            const earGeometry = new THREE.SphereGeometry(0.12, 12, 12);
            const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear1.position.set(-0.25, 1.65, 0);
            goblinGrp.add(ear1);

            const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear2.position.set(0.25, 1.65, 0);
            goblinGrp.add(ear2);

            // Cute eyes
            const eyeGeometry = new THREE.SphereGeometry(0.06, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.12, 1.45, 0.3);
            goblinGrp.add(eye1);

            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.12, 1.45, 0.3);
            goblinGrp.add(eye2);

            // Little smile
            const smileGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
            const smileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const smile = new THREE.Mesh(smileGeometry, smileMaterial);
            smile.position.set(0, 1.32, 0.32);
            smile.rotation.x = Math.PI;
            goblinGrp.add(smile);

            // Short arms
            const armGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            armGeometry.scale(1, 1.5, 1);
            const arm1 = new THREE.Mesh(armGeometry, bodyMaterial);
            arm1.position.set(-0.5, 0.8, 0);
            goblinGrp.add(arm1);

            const arm2 = new THREE.Mesh(armGeometry, bodyMaterial);
            arm2.position.set(0.5, 0.8, 0);
            goblinGrp.add(arm2);

            // Short legs
            const legGeometry = new THREE.SphereGeometry(0.18, 12, 12);
            legGeometry.scale(1, 1.3, 1);
            const leg1 = new THREE.Mesh(legGeometry, bodyMaterial);
            leg1.position.set(-0.2, 0.15, 0);
            goblinGrp.add(leg1);

            const leg2 = new THREE.Mesh(legGeometry, bodyMaterial);
            leg2.position.set(0.2, 0.15, 0);
            goblinGrp.add(leg2);
        } else if (G.graveyardTheme) {
            // ZOMBIE - rotting undead creature for graveyard level
            const zombieGreen = 0x4a6040;
            const zombieDark = 0x2a3020;
            const rotColor = 0x3a4030;

            // Zombie body - hunched torso
            const bodyGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.4);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: zombieGreen });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.75;
            body.rotation.x = 0.2; // Hunched forward
            body.castShadow = true;
            goblinGrp.add(body);

            // Zombie head - slightly lopsided
            const headGeometry = new THREE.SphereGeometry(0.38, 16, 16);
            const headMaterial = new THREE.MeshLambertMaterial({ color: zombieGreen });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0.05, 1.45, 0.1);
            head.rotation.z = 0.15; // Tilted head
            head.castShadow = true;
            goblinGrp.add(head);

            // Sunken glowing eyes
            const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.8
            });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.12, 1.48, 0.32);
            goblinGrp.add(eye1);

            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.15, 1.45, 0.32);
            goblinGrp.add(eye2);

            // Gaping mouth
            const mouthGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.1);
            const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1010 });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0.02, 1.32, 0.35);
            goblinGrp.add(mouth);

            // Exposed bones/ribs
            const ribMaterial = new THREE.MeshLambertMaterial({ color: 0xd0c8b0 });
            for (let i = 0; i < 3; i++) {
                const ribGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6);
                const rib = new THREE.Mesh(ribGeometry, ribMaterial);
                rib.position.set(0, 0.6 + i * 0.12, 0.22);
                rib.rotation.z = Math.PI / 2;
                goblinGrp.add(rib);
            }

            // Tattered arms
            const armGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.6, 6);
            const armMaterial = new THREE.MeshLambertMaterial({ color: rotColor });
            const arm1 = new THREE.Mesh(armGeometry, armMaterial);
            arm1.position.set(-0.4, 0.6, 0.15);
            arm1.rotation.z = 0.8;
            arm1.rotation.x = -0.3;
            goblinGrp.add(arm1);

            const arm2 = new THREE.Mesh(armGeometry, armMaterial);
            arm2.position.set(0.4, 0.55, 0.15);
            arm2.rotation.z = -0.6;
            arm2.rotation.x = -0.4;
            goblinGrp.add(arm2);

            // Shambling legs
            const legGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 6);
            const leg1 = new THREE.Mesh(legGeometry, armMaterial);
            leg1.position.set(-0.15, 0.25, 0);
            goblinGrp.add(leg1);

            const leg2 = new THREE.Mesh(legGeometry, armMaterial);
            leg2.position.set(0.15, 0.25, 0);
            leg2.rotation.x = 0.1;
            goblinGrp.add(leg2);
        } else {
            const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
            const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinArmor });
            const goblinBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
            goblinBody.position.y = 0.8;
            goblinBody.castShadow = true;
            goblinGrp.add(goblinBody);
        
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
        const goblinHead = new THREE.Mesh(headGeometry, headMaterial);
        goblinHead.position.y = 1.5;
        goblinHead.castShadow = true;
        goblinGrp.add(goblinHead);
        
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            map: textures.goblinEye,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.15, 1.5, 0.35);
        goblinGrp.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.5, 0.35);
        goblinGrp.add(eye2);
        
        const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
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
        }
        
        goblinGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(goblinGrp);
        
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
        const textures = getTerrainTextures(THREE);
        const goblinGrp = new THREE.Group();

        if (G.waterTheme) {
            // Octopus body
            const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            bodyGeometry.scale(1, 1.2, 1);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B008B });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.2;
            body.castShadow = true;
            goblinGrp.add(body);

            // Eyes
            const eyeGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.3, 1.4, 0.6);
            goblinGrp.add(eye1);

            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.3, 1.4, 0.6);
            goblinGrp.add(eye2);

            const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
            const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const pupil1 = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil1.position.set(-0.3, 1.4, 0.68);
            goblinGrp.add(pupil1);

            const pupil2 = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil2.position.set(0.3, 1.4, 0.68);
            goblinGrp.add(pupil2);

            // 8 Tentacles in a circle
            const tentacleGeometry = new THREE.CylinderGeometry(0.12, 0.06, 1.5, 6);
            const tentacleMaterial = new THREE.MeshLambertMaterial({ color: 0x9932CC });
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const tentacle = new THREE.Mesh(tentacleGeometry, tentacleMaterial);
                tentacle.position.set(
                    Math.cos(angle) * 0.6,
                    0.3,
                    Math.sin(angle) * 0.6
                );
                tentacle.rotation.z = Math.cos(angle) * 0.3;
                tentacle.rotation.x = Math.sin(angle) * 0.3;
                tentacle.castShadow = true;
                goblinGrp.add(tentacle);

                // Store tentacle for animation
                if (!goblinGrp.tentacles) goblinGrp.tentacles = [];
                goblinGrp.tentacles.push({ mesh: tentacle, angle, baseZ: tentacle.rotation.z, baseX: tentacle.rotation.x });
            }
        } else if (G.lavaTheme) {
            // GREATER DEVIL - larger demonic creature for lava level guardian
            const devilRed = 0xAA1111;
            const darkRed = 0x660000;
            const fireOrange = 0xFF4400;

            // Muscular devil body
            const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.3, 8);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.1;
            body.castShadow = true;
            goblinGrp.add(body);

            // Devil head - slightly larger
            const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const headMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 2.0;
            head.castShadow = true;
            goblinGrp.add(head);

            // Large curved horns
            const hornGeometry = new THREE.ConeGeometry(0.12, 0.8, 8);
            const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
            const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
            horn1.position.set(-0.35, 2.4, 0);
            horn1.rotation.z = 0.5;
            horn1.rotation.x = -0.2;
            horn1.castShadow = true;
            goblinGrp.add(horn1);

            const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
            horn2.position.set(0.35, 2.4, 0);
            horn2.rotation.z = -0.5;
            horn2.rotation.x = -0.2;
            horn2.castShadow = true;
            goblinGrp.add(horn2);

            // Fiery glowing eyes
            const eyeGeometry = new THREE.SphereGeometry(0.12, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({
                color: fireOrange,
                transparent: true,
                opacity: 1.0
            });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.18, 2.0, 0.42);
            goblinGrp.add(eye1);

            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.18, 2.0, 0.42);
            goblinGrp.add(eye2);

            // Demonic grin with fangs
            const mouthGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.1);
            const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0, 1.82, 0.45);
            goblinGrp.add(mouth);

            // Fangs
            const fangGeometry = new THREE.ConeGeometry(0.03, 0.12, 4);
            const fangMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const fang1 = new THREE.Mesh(fangGeometry, fangMaterial);
            fang1.position.set(-0.08, 1.76, 0.45);
            fang1.rotation.x = Math.PI;
            goblinGrp.add(fang1);

            const fang2 = new THREE.Mesh(fangGeometry, fangMaterial);
            fang2.position.set(0.08, 1.76, 0.45);
            fang2.rotation.x = Math.PI;
            goblinGrp.add(fang2);

            // Pointed ears
            const earGeometry = new THREE.ConeGeometry(0.12, 0.4, 4);
            const earMaterial = new THREE.MeshLambertMaterial({ color: darkRed });
            const ear1 = new THREE.Mesh(earGeometry, earMaterial);
            ear1.rotation.z = Math.PI / 2;
            ear1.position.set(-0.6, 2.0, 0);
            goblinGrp.add(ear1);

            const ear2 = new THREE.Mesh(earGeometry, earMaterial);
            ear2.rotation.z = -Math.PI / 2;
            ear2.position.set(0.6, 2.0, 0);
            goblinGrp.add(ear2);

            // Bat-like wings
            const wingGeometry = new THREE.PlaneGeometry(1.2, 0.8);
            const wingMaterial = new THREE.MeshLambertMaterial({
                color: darkRed,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
            wing1.position.set(-0.8, 1.5, -0.2);
            wing1.rotation.y = 0.8;
            wing1.rotation.z = 0.3;
            goblinGrp.add(wing1);

            const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
            wing2.position.set(0.8, 1.5, -0.2);
            wing2.rotation.y = -0.8;
            wing2.rotation.z = -0.3;
            goblinGrp.add(wing2);

            // Devil tail
            const tailGeometry = new THREE.CylinderGeometry(0.06, 0.04, 1.0, 6);
            const tailMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
            const tail = new THREE.Mesh(tailGeometry, tailMaterial);
            tail.position.set(0, 0.6, -0.5);
            tail.rotation.x = 0.6;
            goblinGrp.add(tail);

            // Tail tip
            const tipGeometry = new THREE.ConeGeometry(0.12, 0.25, 4);
            const tipMaterial = new THREE.MeshLambertMaterial({ color: darkRed });
            const tip = new THREE.Mesh(tipGeometry, tipMaterial);
            tip.position.set(0, 0.2, -0.9);
            tip.rotation.x = Math.PI / 2 + 0.4;
            goblinGrp.add(tip);

            // Flaming trident
            const tridentStaff = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
            const tridentMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
            const staff = new THREE.Mesh(tridentStaff, tridentMaterial);
            staff.position.set(0.5, 1.2, 0.2);
            staff.rotation.z = 0.15;
            goblinGrp.add(staff);

            // Trident prongs
            const prongGeometry = new THREE.ConeGeometry(0.05, 0.35, 4);
            for (let i = -1; i <= 1; i++) {
                const prong = new THREE.Mesh(prongGeometry, tridentMaterial);
                prong.position.set(0.5 + i * 0.12, 2.2, 0.2);
                prong.rotation.z = 0.15 + i * 0.15;
                goblinGrp.add(prong);
            }

            // Fire glow at trident top
            const fireGlow = new THREE.PointLight(fireOrange, 0.5, 3);
            fireGlow.position.set(0.5, 2.3, 0.2);
            goblinGrp.add(fireGlow);
        } else if (G.candyTheme) {
            // GINGERBREAD MAN - cookie guardian with icing details
            const cookieColor = 0xB5651D;
            const icingWhite = 0xFFFFFF;
            const icingPink = 0xFF69B4;

            // Gingerbread body - flat and cookie-shaped
            const bodyGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: cookieColor });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.rotation.x = Math.PI / 2;
            body.position.y = 1.2;
            body.castShadow = true;
            goblinGrp.add(body);

            // Gingerbread head
            const headGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 16);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.rotation.x = Math.PI / 2;
            head.position.y = 1.9;
            head.castShadow = true;
            goblinGrp.add(head);

            // Icing button details on body
            const buttonGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12);
            const icingMaterial = new THREE.MeshBasicMaterial({ color: icingWhite });
            for (let i = 0; i < 3; i++) {
                const button = new THREE.Mesh(buttonGeometry, icingMaterial);
                button.rotation.x = Math.PI / 2;
                button.position.set(0, 1.0 + i * 0.25, 0.18);
                goblinGrp.add(button);
            }

            // Icing smile
            const smileGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI);
            const smileMaterial = new THREE.MeshBasicMaterial({ color: icingPink });
            const smile = new THREE.Mesh(smileGeometry, smileMaterial);
            smile.position.set(0, 1.78, 0.15);
            smile.rotation.x = -0.2;
            goblinGrp.add(smile);

            // Candy eyes (gumdrop style)
            const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.15, 1.95, 0.2);
            goblinGrp.add(eye1);

            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.15, 1.95, 0.2);
            goblinGrp.add(eye2);

            // Icing eyebrows (angry)
            const browGeometry = new THREE.BoxGeometry(0.12, 0.03, 0.02);
            const browMaterial = new THREE.MeshBasicMaterial({ color: icingWhite });
            const brow1 = new THREE.Mesh(browGeometry, browMaterial);
            brow1.position.set(-0.15, 2.05, 0.22);
            brow1.rotation.z = 0.3;
            goblinGrp.add(brow1);

            const brow2 = new THREE.Mesh(browGeometry, browMaterial);
            brow2.position.set(0.15, 2.05, 0.22);
            brow2.rotation.z = -0.3;
            goblinGrp.add(brow2);

            // Arms - cookie style
            const armGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 8);
            const arm1 = new THREE.Mesh(armGeometry, bodyMaterial);
            arm1.position.set(-0.65, 1.3, 0);
            arm1.rotation.z = 0.8;
            arm1.castShadow = true;
            goblinGrp.add(arm1);

            const arm2 = new THREE.Mesh(armGeometry, bodyMaterial);
            arm2.position.set(0.65, 1.3, 0);
            arm2.rotation.z = -0.8;
            arm2.castShadow = true;
            goblinGrp.add(arm2);

            // Icing cuffs on arms
            const cuffGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 16);
            const cuff1 = new THREE.Mesh(cuffGeometry, icingMaterial);
            cuff1.position.set(-0.85, 1.0, 0);
            cuff1.rotation.y = Math.PI / 2;
            cuff1.rotation.x = 0.8;
            goblinGrp.add(cuff1);

            const cuff2 = new THREE.Mesh(cuffGeometry, icingMaterial);
            cuff2.position.set(0.85, 1.0, 0);
            cuff2.rotation.y = Math.PI / 2;
            cuff2.rotation.x = -0.8;
            goblinGrp.add(cuff2);

            // Legs - cookie style
            const legGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.9, 8);
            const leg1 = new THREE.Mesh(legGeometry, bodyMaterial);
            leg1.position.set(-0.25, 0.45, 0);
            leg1.castShadow = true;
            goblinGrp.add(leg1);

            const leg2 = new THREE.Mesh(legGeometry, bodyMaterial);
            leg2.position.set(0.25, 0.45, 0);
            leg2.castShadow = true;
            goblinGrp.add(leg2);

            // Candy cane weapon
            const caneGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
            const caneMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
            const cane = new THREE.Mesh(caneGeometry, caneMaterial);
            cane.position.set(0.9, 1.4, 0.1);
            cane.rotation.z = -0.3;
            goblinGrp.add(cane);

            // Candy cane hook
            const hookGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16, Math.PI);
            const hook = new THREE.Mesh(hookGeometry, caneMaterial);
            hook.position.set(0.75, 2.1, 0.1);
            hook.rotation.x = Math.PI / 2;
            hook.rotation.z = -0.3;
            goblinGrp.add(hook);
        } else if (G.graveyardTheme) {
            // GHOST/SPECTRE - ethereal floating spirit
            const ghostColor = 0x88aacc;
            const ghostGlow = 0x6688aa;

            // Ghost body - flowing sheet-like form
            const bodyGeometry = new THREE.ConeGeometry(0.8, 2.2, 8);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: ghostColor,
                transparent: true,
                opacity: 0.7,
                emissive: ghostGlow,
                emissiveIntensity: 0.3,
                side: THREE.DoubleSide
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.1;
            body.rotation.x = Math.PI; // Inverted cone for ghost shape
            goblinGrp.add(body);

            // Ghost head
            const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const headMaterial = new THREE.MeshPhongMaterial({
                color: ghostColor,
                transparent: true,
                opacity: 0.75,
                emissive: ghostGlow,
                emissiveIntensity: 0.2
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 2.3;
            goblinGrp.add(head);

            // Hollow eye sockets with eerie glow
            const eyeSocketGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            const eyeSocketMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.9
            });
            const socket1 = new THREE.Mesh(eyeSocketGeometry, eyeSocketMaterial);
            socket1.position.set(-0.18, 2.35, 0.4);
            goblinGrp.add(socket1);

            const socket2 = new THREE.Mesh(eyeSocketGeometry, eyeSocketMaterial);
            socket2.position.set(0.18, 2.35, 0.4);
            goblinGrp.add(socket2);

            // Glowing pupils
            const pupilGeometry = new THREE.SphereGeometry(0.06, 8, 8);
            const pupilMaterial = new THREE.MeshBasicMaterial({
                color: 0xFF4400,
                transparent: true,
                opacity: 1.0
            });
            const pupil1 = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil1.position.set(-0.18, 2.35, 0.48);
            goblinGrp.add(pupil1);

            const pupil2 = new THREE.Mesh(pupilGeometry, pupilMaterial);
            pupil2.position.set(0.18, 2.35, 0.48);
            goblinGrp.add(pupil2);

            // Wailing mouth
            const mouthGeometry = new THREE.RingGeometry(0.08, 0.15, 8);
            const mouthMaterial = new THREE.MeshBasicMaterial({
                color: 0x1a1a2a,
                side: THREE.DoubleSide
            });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0, 2.1, 0.48);
            goblinGrp.add(mouth);

            // Ghostly arms/wisps
            const armGeometry = new THREE.CylinderGeometry(0.08, 0.15, 1.0, 6);
            const armMaterial = new THREE.MeshPhongMaterial({
                color: ghostColor,
                transparent: true,
                opacity: 0.5,
                emissive: ghostGlow,
                emissiveIntensity: 0.2
            });
            const arm1 = new THREE.Mesh(armGeometry, armMaterial);
            arm1.position.set(-0.6, 1.5, 0.2);
            arm1.rotation.z = 0.7;
            arm1.rotation.x = -0.3;
            goblinGrp.add(arm1);

            const arm2 = new THREE.Mesh(armGeometry, armMaterial);
            arm2.position.set(0.6, 1.5, 0.2);
            arm2.rotation.z = -0.7;
            arm2.rotation.x = -0.3;
            goblinGrp.add(arm2);

            // Ethereal glow light
            const ghostLight = new THREE.PointLight(0x6688ff, 0.4, 5);
            ghostLight.position.set(0, 2.0, 0);
            goblinGrp.add(ghostLight);

            // Floating effect handled by game loop
            goblinGrp.userData.isGhost = true;
            goblinGrp.userData.floatOffset = Math.random() * Math.PI * 2;
        } else {
            const bodyGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.5);
            const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinArmor });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.0;
            body.castShadow = true;
            goblinGrp.add(body);
        
            const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.8;
            head.castShadow = true;
            goblinGrp.add(head);
        
            const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
            const eyeMaterial = new THREE.MeshBasicMaterial({ 
                map: textures.guardianEye,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e1.position.set(-0.18, 1.8, 0.42);
            goblinGrp.add(e1);
        
            const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e2.position.set(0.18, 1.8, 0.42);
                goblinGrp.add(e2);
        
            const earGeometry = new THREE.ConeGeometry(0.18, 0.5, 4);
            const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
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
        }
        
        goblinGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(goblinGrp);
        
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

    // Skeleton warrior helper - undead skeletal enemy for graveyard
    function createSkeleton(x, z, patrolLeft, patrolRight, speed = 0.012) {
        const skeletonGrp = new THREE.Group();
        
        const boneWhite = 0xe8e0d0;
        const boneShadow = 0xc0b8a8;
        const eyeGlow = 0xFF4444;
        
        // Skull
        const skullGeometry = new THREE.SphereGeometry(0.4, 12, 12);
        const skullMaterial = new THREE.MeshLambertMaterial({ color: boneWhite });
        const skull = new THREE.Mesh(skullGeometry, skullMaterial);
        skull.scale.set(1, 1.1, 0.9);
        skull.position.y = 1.8;
        skull.castShadow = true;
        skeletonGrp.add(skull);
        
        // Eye sockets (dark hollows)
        const socketGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const socketMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1010 });
        const socket1 = new THREE.Mesh(socketGeometry, socketMaterial);
        socket1.position.set(-0.12, 1.85, 0.32);
        skeletonGrp.add(socket1);
        
        const socket2 = new THREE.Mesh(socketGeometry, socketMaterial);
        socket2.position.set(0.12, 1.85, 0.32);
        skeletonGrp.add(socket2);
        
        // Glowing red eyes
        const eyeGlowGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const eyeGlowMaterial = new THREE.MeshBasicMaterial({ 
            color: eyeGlow,
            transparent: true,
            opacity: 0.9
        });
        const glow1 = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        glow1.position.set(-0.12, 1.85, 0.35);
        skeletonGrp.add(glow1);
        
        const glow2 = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        glow2.position.set(0.12, 1.85, 0.35);
        skeletonGrp.add(glow2);
        
        // Nose hole (triangle)
        const noseGeometry = new THREE.ConeGeometry(0.06, 0.1, 3);
        const noseMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1010 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.75, 0.35);
        nose.rotation.x = Math.PI;
        skeletonGrp.add(nose);
        
        // Jaw with teeth
        const jawGeometry = new THREE.BoxGeometry(0.3, 0.12, 0.15);
        const jawMaterial = new THREE.MeshLambertMaterial({ color: boneShadow });
        const jaw = new THREE.Mesh(jawGeometry, jawMaterial);
        jaw.position.set(0, 1.58, 0.28);
        skeletonGrp.add(jaw);
        
        // Teeth
        for (let i = 0; i < 5; i++) {
            const toothGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.04);
            const toothMaterial = new THREE.MeshLambertMaterial({ color: boneWhite });
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            tooth.position.set(-0.1 + i * 0.05, 1.62, 0.35);
            skeletonGrp.add(tooth);
        }
        
        // Spine/ribcage
        const spineGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.9, 6);
        const spineMaterial = new THREE.MeshLambertMaterial({ color: boneShadow });
        const spine = new THREE.Mesh(spineGeometry, spineMaterial);
        spine.position.y = 1.1;
        skeletonGrp.add(spine);
        
        // Ribs
        for (let i = 0; i < 4; i++) {
            const ribGeometry = new THREE.TorusGeometry(0.25, 0.03, 6, 12, Math.PI);
            const ribMaterial = new THREE.MeshLambertMaterial({ color: boneWhite });
            const rib = new THREE.Mesh(ribGeometry, ribMaterial);
            rib.position.set(0, 1.35 - i * 0.15, 0.1);
            rib.rotation.x = -Math.PI / 2;
            rib.rotation.z = Math.PI;
            skeletonGrp.add(rib);
        }
        
        // Pelvis
        const pelvisGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.2);
        const pelvisMaterial = new THREE.MeshLambertMaterial({ color: boneShadow });
        const pelvis = new THREE.Mesh(pelvisGeometry, pelvisMaterial);
        pelvis.position.y = 0.6;
        skeletonGrp.add(pelvis);
        
        // Arms (bones)
        const armGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.6, 6);
        const armMaterial = new THREE.MeshLambertMaterial({ color: boneWhite });
        
        // Upper arms
        const upperArm1 = new THREE.Mesh(armGeometry, armMaterial);
        upperArm1.position.set(-0.35, 1.2, 0);
        upperArm1.rotation.z = 0.3;
        skeletonGrp.add(upperArm1);
        
        const upperArm2 = new THREE.Mesh(armGeometry, armMaterial);
        upperArm2.position.set(0.35, 1.2, 0);
        upperArm2.rotation.z = -0.3;
        skeletonGrp.add(upperArm2);
        
        // Forearms
        const forearm1 = new THREE.Mesh(armGeometry, armMaterial);
        forearm1.position.set(-0.55, 0.75, 0.1);
        forearm1.rotation.z = 0.8;
        forearm1.rotation.x = -0.3;
        skeletonGrp.add(forearm1);
        
        const forearm2 = new THREE.Mesh(armGeometry, armMaterial);
        forearm2.position.set(0.55, 0.75, 0.1);
        forearm2.rotation.z = -0.8;
        forearm2.rotation.x = -0.3;
        skeletonGrp.add(forearm2);
        
        // Legs (bones)
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.5, 6);
        const leg1 = new THREE.Mesh(legGeometry, armMaterial);
        leg1.position.set(-0.12, 0.3, 0);
        skeletonGrp.add(leg1);
        
        const leg2 = new THREE.Mesh(legGeometry, armMaterial);
        leg2.position.set(0.12, 0.3, 0);
        skeletonGrp.add(leg2);
        
        // Bone bow (instead of sword - skeleton archers!)
        const bowGroup = new THREE.Group();
        
        // Bow limb (curved bone shape)
        const bowCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, -0.5, 0),
            new THREE.Vector3(0.3, 0, 0),
            new THREE.Vector3(0, 0.5, 0)
        );
        const bowTubeGeometry = new THREE.TubeGeometry(bowCurve, 20, 0.04, 8, false);
        const bowMaterial = new THREE.MeshLambertMaterial({ color: boneWhite });
        const bowLimb = new THREE.Mesh(bowTubeGeometry, bowMaterial);
        bowGroup.add(bowLimb);
        
        // Bowstring
        const stringGeometry = new THREE.CylinderGeometry(0.01, 0.01, 1.0, 4);
        const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x3a3a3a });
        const bowString = new THREE.Mesh(stringGeometry, stringMaterial);
        bowString.position.set(0, 0, 0);
        bowGroup.add(bowString);
        
        bowGroup.position.set(-0.65, 1.0, 0.2);
        bowGroup.rotation.z = 0.3;
        skeletonGrp.add(bowGroup);
        
        // Quiver of arrows on back
        const quiverGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.6, 8);
        const quiverMaterial = new THREE.MeshLambertMaterial({ color: boneShadow });
        const quiver = new THREE.Mesh(quiverGeometry, quiverMaterial);
        quiver.position.set(0, 1.2, -0.25);
        quiver.rotation.x = 0.2;
        skeletonGrp.add(quiver);
        
        // Arrows sticking out of quiver
        for (let i = 0; i < 3; i++) {
            const arrowShaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
            const arrowShaftMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
            const arrowShaft = new THREE.Mesh(arrowShaftGeometry, arrowShaftMaterial);
            arrowShaft.position.set(-0.05 + i * 0.05, 1.5, -0.25);
            arrowShaft.rotation.x = 0.15;
            skeletonGrp.add(arrowShaft);
        }
        
        // Eye glow point light
        const skeletonLight = new THREE.PointLight(eyeGlow, 0.3, 3);
        skeletonLight.position.set(0, 1.85, 0.3);
        skeletonGrp.add(skeletonLight);
        
        skeletonGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(skeletonGrp);
        
        const health = 4;
        
        return {
            mesh: skeletonGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 1.5,
            health: health,
            maxHealth: health,
            isSkeleton: true,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight,
            lastFireTime: 0
        };
    }

    // Giant guardian helper - huge slow enemy with lots of health
    function createGiant(x, z, patrolLeft, patrolRight, speed = 0.018) {
        const textures = getTerrainTextures(THREE);
        const giantGrp = new THREE.Group();
        
        if (G.candyTheme) {
            // MARSHMALLOW MONSTER - giant fluffy white creature
            const marshmallowWhite = 0xFFF8F0;
            const marshmallowPink = 0xFFB6C1;

            // Marshmallow body - cylindrical and fluffy
            const bodyGeometry = new THREE.CylinderGeometry(1.8, 2.0, 4.5, 16);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: marshmallowWhite,
                shininess: 30,
                specular: 0xffffff
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 3.0;
            body.castShadow = true;
            giantGrp.add(body);

            // Fluffy texture bumps on body
            for (let i = 0; i < 12; i++) {
                const bumpGeometry = new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 12, 12);
                const bump = new THREE.Mesh(bumpGeometry, bodyMaterial);
                const angle = (i / 12) * Math.PI * 2;
                const height = 1.5 + Math.random() * 3;
                bump.position.set(Math.cos(angle) * 1.9, height, Math.sin(angle) * 1.9);
                giantGrp.add(bump);
            }

            // Round marshmallow head
            const headGeometry = new THREE.SphereGeometry(1.4, 16, 16);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.y = 6.0;
            head.castShadow = true;
            giantGrp.add(head);

            // Cute angry eyes
            const eyeGeometry = new THREE.SphereGeometry(0.35, 16, 16);
            const eyeBlackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const e1 = new THREE.Mesh(eyeGeometry, eyeBlackMaterial);
            e1.position.set(-0.5, 6.2, 1.1);
            giantGrp.add(e1);

            const e2 = new THREE.Mesh(eyeGeometry, eyeBlackMaterial);
            e2.position.set(0.5, 6.2, 1.1);
            giantGrp.add(e2);

            // Angry eyebrows
            const browGeometry = new THREE.BoxGeometry(0.5, 0.12, 0.1);
            const browMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
            const brow1 = new THREE.Mesh(browGeometry, browMaterial);
            brow1.position.set(-0.5, 6.6, 1.2);
            brow1.rotation.z = 0.3;
            giantGrp.add(brow1);

            const brow2 = new THREE.Mesh(browGeometry, browMaterial);
            brow2.position.set(0.5, 6.6, 1.2);
            brow2.rotation.z = -0.3;
            giantGrp.add(brow2);

            // Pink blush cheeks
            const blushGeometry = new THREE.CircleGeometry(0.25, 16);
            const blushMaterial = new THREE.MeshBasicMaterial({
                color: marshmallowPink,
                transparent: true,
                opacity: 0.6
            });
            const blush1 = new THREE.Mesh(blushGeometry, blushMaterial);
            blush1.position.set(-0.9, 5.8, 1.15);
            giantGrp.add(blush1);

            const blush2 = new THREE.Mesh(blushGeometry, blushMaterial);
            blush2.position.set(0.9, 5.8, 1.15);
            giantGrp.add(blush2);

            // Stubby marshmallow arms
            const armGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2.5, 12);
            const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
            leftArm.position.set(-2.3, 3.5, 0);
            leftArm.rotation.z = 0.5;
            leftArm.castShadow = true;
            giantGrp.add(leftArm);
            giantGrp.leftArm = leftArm;

            const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
            rightArm.position.set(2.3, 3.5, 0);
            rightArm.rotation.z = -0.5;
            rightArm.castShadow = true;
            giantGrp.add(rightArm);
            giantGrp.rightArm = rightArm;

            // Round marshmallow fists
            const fistGeometry = new THREE.SphereGeometry(0.6, 12, 12);
            const leftFist = new THREE.Mesh(fistGeometry, bodyMaterial);
            leftFist.position.set(-3.0, 2.0, 0);
            leftFist.castShadow = true;
            giantGrp.add(leftFist);
            giantGrp.leftFist = leftFist;

            const rightFist = new THREE.Mesh(fistGeometry, bodyMaterial);
            rightFist.position.set(3.0, 2.0, 0);
            rightFist.castShadow = true;
            giantGrp.add(rightFist);
            giantGrp.rightFist = rightFist;

            // Stubby legs
            const legGeometry = new THREE.CylinderGeometry(0.8, 1.0, 2.0, 12);
            const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
            leftLeg.position.set(-1.0, 0.8, 0);
            leftLeg.castShadow = true;
            giantGrp.add(leftLeg);

            const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
            rightLeg.position.set(1.0, 0.8, 0);
            rightLeg.castShadow = true;
            giantGrp.add(rightLeg);

        } else if (G.graveyardTheme) {
            // EXECUTIONER - massive hooded figure with giant axe
            const hoodBlack = 0x0a0a0f;
            const skinPale = 0x6a5a5a;
            const bloodRed = 0x660000;

            // Massive robed body
            const bodyGeometry = new THREE.CylinderGeometry(1.4, 2.2, 5.0, 12);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: hoodBlack });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 3.2;
            body.castShadow = true;
            giantGrp.add(body);

            // Ragged cape edges
            for (let i = 0; i < 12; i++) {
                const ragGeometry = new THREE.ConeGeometry(0.25, 1.0, 4);
                const ragMaterial = new THREE.MeshLambertMaterial({ color: 0x050508 });
                const rag = new THREE.Mesh(ragGeometry, ragMaterial);
                const angle = (i / 12) * Math.PI * 2;
                rag.position.set(Math.cos(angle) * 2.0, 0.5, Math.sin(angle) * 2.0);
                rag.rotation.x = Math.PI;
                giantGrp.add(rag);
            }

            // Hood
            const hoodGeometry = new THREE.ConeGeometry(1.2, 2.0, 12);
            const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
            hood.position.y = 6.5;
            hood.castShadow = true;
            giantGrp.add(hood);

            // Shadowed face (only glowing eyes visible)
            const faceGeometry = new THREE.SphereGeometry(0.8, 12, 12);
            const faceMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const face = new THREE.Mesh(faceGeometry, faceMaterial);
            face.position.set(0, 5.8, 0.4);
            face.scale.z = 0.6;
            giantGrp.add(face);

            // Glowing red eyes in the darkness
            const eyeGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({
                color: 0xFF0000,
                transparent: true,
                opacity: 1.0
            });
            const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e1.position.set(-0.25, 5.85, 0.85);
            giantGrp.add(e1);

            const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e2.position.set(0.25, 5.85, 0.85);
            giantGrp.add(e2);

            // Eye glow light
            const eyeLight = new THREE.PointLight(0xFF0000, 0.3, 3);
            eyeLight.position.set(0, 5.85, 0.9);
            giantGrp.add(eyeLight);

            // Massive arms
            const armGeometry = new THREE.CylinderGeometry(0.4, 0.7, 3.5, 8);
            const armMaterial = new THREE.MeshLambertMaterial({ color: hoodBlack });

            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-2.0, 3.5, 0);
            leftArm.rotation.z = 0.4;
            leftArm.castShadow = true;
            giantGrp.add(leftArm);
            giantGrp.leftArm = leftArm;

            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(2.0, 3.5, 0);
            rightArm.rotation.z = -0.4;
            rightArm.castShadow = true;
            giantGrp.add(rightArm);
            giantGrp.rightArm = rightArm;

            // Pale hands
            const handGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.5);
            const handMaterial = new THREE.MeshLambertMaterial({ color: skinPale });

            const leftFist = new THREE.Mesh(handGeometry, handMaterial);
            leftFist.position.set(-2.6, 1.5, 0);
            leftFist.castShadow = true;
            giantGrp.add(leftFist);
            giantGrp.leftFist = leftFist;

            const rightFist = new THREE.Mesh(handGeometry, handMaterial);
            rightFist.position.set(2.6, 1.5, 0);
            rightFist.castShadow = true;
            giantGrp.add(rightFist);
            giantGrp.rightFist = rightFist;

            // GIANT AXE
            // Axe handle
            const handleGeometry = new THREE.CylinderGeometry(0.12, 0.12, 5.0, 8);
            const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
            const handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(2.8, 3.5, 0.5);
            handle.rotation.z = -0.3;
            giantGrp.add(handle);

            // Axe blade (double-sided)
            const bladeGeometry = new THREE.BoxGeometry(2.0, 2.5, 0.15);
            const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.set(3.5, 5.5, 0.5);
            blade.rotation.z = -0.3;
            giantGrp.add(blade);

            // Blade edge (sharper triangle)
            const edgeGeometry = new THREE.ConeGeometry(0.8, 2.5, 4);
            const edgeMaterial = new THREE.MeshLambertMaterial({ color: 0x6a6a6a });
            const edge1 = new THREE.Mesh(edgeGeometry, edgeMaterial);
            edge1.position.set(4.5, 5.5, 0.5);
            edge1.rotation.z = Math.PI / 2 - 0.3;
            giantGrp.add(edge1);

            // Blood stains on blade
            const bloodGeometry = new THREE.PlaneGeometry(0.5, 0.8);
            const bloodMaterial = new THREE.MeshBasicMaterial({
                color: bloodRed,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            for (let i = 0; i < 3; i++) {
                const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
                blood.position.set(3.5 + i * 0.4, 5.0 + i * 0.3, 0.52);
                blood.rotation.z = Math.random() * 0.5;
                giantGrp.add(blood);
            }

            // Thick legs
            const legGeometry = new THREE.CylinderGeometry(0.6, 0.8, 2.5, 8);
            const legMaterial = new THREE.MeshLambertMaterial({ color: hoodBlack });

            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.8, 1.0, 0);
            leftLeg.castShadow = true;
            giantGrp.add(leftLeg);

            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.8, 1.0, 0);
            rightLeg.castShadow = true;
            giantGrp.add(rightLeg);

        } else {
            // Use theme-appropriate textures
            const giantSkinTexture = G.lavaTheme ? textures.giantSkinLava : textures.giantSkin;
            const giantArmorTexture = G.lavaTheme ? textures.giantArmorLava : textures.giantArmor;
            const giantEyeTexture = G.lavaTheme ? textures.giantEyeLava : textures.giantEye;
            
            // Massive cylindrical body
            const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.8, 5.0, 12);
            const bodyMaterial = new THREE.MeshLambertMaterial({ map: giantSkinTexture });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 3.5;
            body.castShadow = true;
            giantGrp.add(body);
            
            // Add armor plates on body
            const plateGeometry = new THREE.BoxGeometry(2.0, 0.4, 2.2);
            const plateMaterial = new THREE.MeshLambertMaterial({ map: giantArmorTexture });
            for (let i = 0; i < 4; i++) {
                const plate = new THREE.Mesh(plateGeometry, plateMaterial);
                plate.position.y = 2.0 + (i * 1.2);
                plate.castShadow = true;
                giantGrp.add(plate);
            }
            
            // Large head with horns
            const headGeometry = new THREE.BoxGeometry(1.8, 1.5, 1.6);
            const headMaterial = new THREE.MeshLambertMaterial({ map: textures.giantSkin });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 6.5;
            head.castShadow = true;
            giantGrp.add(head);
            
            // Horns
            const hornGeometry = new THREE.ConeGeometry(0.3, 1.2, 6);
            const hornMaterial = new THREE.MeshLambertMaterial({ map: textures.giantArmor });
            
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
            
            // Glowing eyes with texture
            const eyeGeometry = new THREE.SphereGeometry(0.4, 16, 16);
            const eyeMaterial = new THREE.MeshBasicMaterial({ 
                map: giantEyeTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e1.position.set(-0.5, 6.5, 0.9);
            giantGrp.add(e1);
            
            const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e2.position.set(0.5, 6.5, 0.9);
            giantGrp.add(e2);
            
            // Massive club-like arms
            const armGeometry = new THREE.CylinderGeometry(0.4, 0.8, 4.0, 8);
            const armMaterial = new THREE.MeshLambertMaterial({ map: giantSkinTexture });
            
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
            const fistMaterial = new THREE.MeshLambertMaterial({ map: giantSkinTexture });
            
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
        }
        
        giantGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(giantGrp);
        
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

    // Wizard goblin helper - large magic-wielding enemy that shoots fireballs
    function createWizard(x, z, patrolLeft, patrolRight, speed = 0.008) {
        const textures = getTerrainTextures(THREE);
        const wizardGrp = new THREE.Group();
        
        if (G.candyTheme) {
            // COTTON CANDY WIZARD - fluffy pink and blue magical creature
            const cottonPink = 0xFF69B4;
            const cottonBlue = 0x87CEEB;
            const sparkleWhite = 0xFFFFFF;

            // Fluffy cotton candy body (swirled)
            const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.9, 2.2, 16);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: cottonPink,
                transparent: true,
                opacity: 0.9,
                shininess: 50
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.4;
            body.castShadow = true;
            wizardGrp.add(body);

            // Cotton candy fluff pieces
            for (let i = 0; i < 10; i++) {
                const fluffGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.2, 12, 12);
                const fluffColor = i % 2 === 0 ? cottonPink : cottonBlue;
                const fluffMaterial = new THREE.MeshPhongMaterial({
                    color: fluffColor,
                    transparent: true,
                    opacity: 0.8
                });
                const fluff = new THREE.Mesh(fluffGeometry, fluffMaterial);
                const angle = (i / 10) * Math.PI * 2;
                const height = 0.8 + Math.random() * 1.5;
                fluff.position.set(Math.cos(angle) * 0.7, height, Math.sin(angle) * 0.7);
                wizardGrp.add(fluff);
            }

            // Round fluffy head
            const headGeometry = new THREE.SphereGeometry(0.55, 16, 16);
            const headMaterial = new THREE.MeshPhongMaterial({
                color: cottonBlue,
                transparent: true,
                opacity: 0.9
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 2.8;
            head.castShadow = true;
            wizardGrp.add(head);

            // Swirled wizard hat (ice cream cone style)
            const hatGeometry = new THREE.ConeGeometry(0.6, 1.3, 16);
            const hatMaterial = new THREE.MeshPhongMaterial({
                color: cottonPink,
                transparent: true,
                opacity: 0.9
            });
            const hat = new THREE.Mesh(hatGeometry, hatMaterial);
            hat.position.y = 3.8;
            hat.castShadow = true;
            wizardGrp.add(hat);

            // Swirl decoration on hat
            const swirlGeometry = new THREE.TorusGeometry(0.35, 0.08, 8, 16, Math.PI * 3);
            const swirlMaterial = new THREE.MeshPhongMaterial({ color: cottonBlue });
            const swirl = new THREE.Mesh(swirlGeometry, swirlMaterial);
            swirl.position.y = 3.5;
            swirl.rotation.x = Math.PI / 2;
            wizardGrp.add(swirl);

            // Sparkly eyes
            const eyeGeometry = new THREE.SphereGeometry(0.1, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({
                color: sparkleWhite,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e1.position.set(-0.2, 2.85, 0.45);
            wizardGrp.add(e1);

            const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e2.position.set(0.2, 2.85, 0.45);
            wizardGrp.add(e2);

            // Pupil dots
            const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const p1 = new THREE.Mesh(pupilGeometry, pupilMaterial);
            p1.position.set(-0.2, 2.85, 0.52);
            wizardGrp.add(p1);

            const p2 = new THREE.Mesh(pupilGeometry, pupilMaterial);
            p2.position.set(0.2, 2.85, 0.52);
            wizardGrp.add(p2);

            // Cute blush
            const blushGeometry = new THREE.CircleGeometry(0.12, 12);
            const blushMaterial = new THREE.MeshBasicMaterial({
                color: 0xFF1493,
                transparent: true,
                opacity: 0.5
            });
            const blush1 = new THREE.Mesh(blushGeometry, blushMaterial);
            blush1.position.set(-0.35, 2.7, 0.48);
            wizardGrp.add(blush1);

            const blush2 = new THREE.Mesh(blushGeometry, blushMaterial);
            blush2.position.set(0.35, 2.7, 0.48);
            wizardGrp.add(blush2);

            // Lollipop magic wand
            const stickGeometry = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8);
            const stickMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const stick = new THREE.Mesh(stickGeometry, stickMaterial);
            stick.position.set(0.7, 1.5, 0.3);
            stick.rotation.z = -0.2;
            wizardGrp.add(stick);

            // Lollipop swirl top
            const lolliGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const lolliMaterial = new THREE.MeshPhongMaterial({
                color: 0xFF00FF,
                shininess: 80
            });
            const lolli = new THREE.Mesh(lolliGeometry, lolliMaterial);
            lolli.position.set(0.8, 3.0, 0.3);
            wizardGrp.add(lolli);
            wizardGrp.staffOrb = lolli;

            // Swirl pattern on lollipop
            const lolliSwirlGeometry = new THREE.TorusGeometry(0.2, 0.05, 8, 16, Math.PI * 2);
            const lolliSwirlMaterial = new THREE.MeshPhongMaterial({ color: sparkleWhite });
            const lolliSwirl = new THREE.Mesh(lolliSwirlGeometry, lolliSwirlMaterial);
            lolliSwirl.position.set(0.8, 3.0, 0.35);
            wizardGrp.add(lolliSwirl);

        } else if (G.graveyardTheme) {
            // WITCH - green-skinned crone with pointy hat and broomstick
            const witchGreen = 0x3a6030;
            const witchDark = 0x1a3010;
            const hatBlack = 0x1a1a1a;

            // Hunched robed body
            const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.9, 2.2, 12);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a2a });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.3;
            body.rotation.x = 0.15;
            body.castShadow = true;
            wizardGrp.add(body);

            // Ragged cloak edges
            for (let i = 0; i < 8; i++) {
                const ragGeometry = new THREE.ConeGeometry(0.15, 0.5, 4);
                const ragMaterial = new THREE.MeshLambertMaterial({ color: 0x0a0a15 });
                const rag = new THREE.Mesh(ragGeometry, ragMaterial);
                const angle = (i / 8) * Math.PI * 2;
                rag.position.set(Math.cos(angle) * 0.8, 0.25, Math.sin(angle) * 0.8);
                rag.rotation.x = Math.PI;
                wizardGrp.add(rag);
            }

            // Witch head - pointed chin
            const headGeometry = new THREE.SphereGeometry(0.45, 16, 16);
            headGeometry.scale(1, 1.1, 0.9);
            const headMaterial = new THREE.MeshLambertMaterial({ color: witchGreen });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 2.7;
            head.castShadow = true;
            wizardGrp.add(head);

            // Pointed chin
            const chinGeometry = new THREE.ConeGeometry(0.15, 0.3, 6);
            const chin = new THREE.Mesh(chinGeometry, headMaterial);
            chin.position.set(0, 2.3, 0.25);
            chin.rotation.x = -0.5;
            wizardGrp.add(chin);

            // Long hooked nose
            const noseGeometry = new THREE.ConeGeometry(0.08, 0.35, 6);
            const nose = new THREE.Mesh(noseGeometry, headMaterial);
            nose.position.set(0, 2.65, 0.5);
            nose.rotation.x = Math.PI / 2 + 0.4;
            wizardGrp.add(nose);

            // Wart on nose
            const wartGeometry = new THREE.SphereGeometry(0.04, 8, 8);
            const wartMaterial = new THREE.MeshLambertMaterial({ color: witchDark });
            const wart = new THREE.Mesh(wartGeometry, wartMaterial);
            wart.position.set(0.05, 2.62, 0.58);
            wizardGrp.add(wart);

            // Glowing evil eyes
            const eyeGeometry = new THREE.SphereGeometry(0.1, 12, 12);
            const eyeMaterial = new THREE.MeshBasicMaterial({
                color: 0x00FF00,
                transparent: true,
                opacity: 0.9
            });
            const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e1.position.set(-0.15, 2.75, 0.38);
            wizardGrp.add(e1);

            const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e2.position.set(0.15, 2.75, 0.38);
            wizardGrp.add(e2);

            // Sinister grin
            const mouthGeometry = new THREE.TorusGeometry(0.12, 0.02, 8, 16, Math.PI);
            const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x400000 });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0, 2.45, 0.4);
            wizardGrp.add(mouth);

            // Pointy witch hat
            const hatBrimGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.08, 12);
            const hatMaterial = new THREE.MeshLambertMaterial({ color: hatBlack });
            const hatBrim = new THREE.Mesh(hatBrimGeometry, hatMaterial);
            hatBrim.position.y = 3.15;
            wizardGrp.add(hatBrim);

            const hatConeGeometry = new THREE.ConeGeometry(0.4, 1.2, 12);
            const hatCone = new THREE.Mesh(hatConeGeometry, hatMaterial);
            hatCone.position.y = 3.8;
            hatCone.rotation.z = 0.15; // Slightly crooked
            wizardGrp.add(hatCone);

            // Hat buckle
            const buckleGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.05);
            const buckleMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
            const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
            buckle.position.set(0, 3.25, 0.38);
            wizardGrp.add(buckle);

            // Scraggly hair
            const hairMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            for (let i = 0; i < 5; i++) {
                const hairGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.4 + Math.random() * 0.3, 4);
                const hair = new THREE.Mesh(hairGeometry, hairMaterial);
                const angle = Math.PI + (i - 2) * 0.3;
                hair.position.set(Math.cos(angle) * 0.35, 2.45, Math.sin(angle) * 0.35);
                hair.rotation.x = 0.5 + Math.random() * 0.3;
                hair.rotation.z = (Math.random() - 0.5) * 0.4;
                wizardGrp.add(hair);
            }

            // Broomstick (staff equivalent)
            const broomStickGeometry = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 6);
            const broomStickMaterial = new THREE.MeshLambertMaterial({ color: 0x5c3d2e });
            const broomStick = new THREE.Mesh(broomStickGeometry, broomStickMaterial);
            broomStick.position.set(0.7, 1.6, 0.2);
            broomStick.rotation.z = -0.15;
            wizardGrp.add(broomStick);

            // Broom bristles
            const bristleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
            for (let i = 0; i < 12; i++) {
                const bristleGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.5, 4);
                const bristle = new THREE.Mesh(bristleGeometry, bristleMaterial);
                const angle = (i / 12) * Math.PI * 2;
                bristle.position.set(
                    0.7 + Math.cos(angle) * 0.1,
                    0.15,
                    0.2 + Math.sin(angle) * 0.1
                );
                bristle.rotation.x = 0.2 + Math.random() * 0.2;
                bristle.rotation.z = (Math.random() - 0.5) * 0.3;
                wizardGrp.add(bristle);
            }

            // Magic orb (glowing green)
            const orbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const orbMaterial = new THREE.MeshBasicMaterial({
                color: 0x00FF44,
                transparent: true,
                opacity: 0.8
            });
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            orb.position.set(-0.5, 2.2, 0.4);
            wizardGrp.add(orb);
            wizardGrp.staffOrb = orb;

            // Orb glow light
            const orbLight = new THREE.PointLight(0x00FF44, 0.5, 4);
            orbLight.position.copy(orb.position);
            wizardGrp.add(orbLight);

        } else {
            // Use ice theme robe texture if in ice level
            const robeTexture = G.iceTheme ? textures.wizardRobeIce : textures.wizardRobe;
            
            // Tall robed body (bigger than guardians)
            const bodyGeometry = new THREE.CylinderGeometry(0.6, 1.0, 2.5, 12);
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
                map: robeTexture,
                color: G.iceTheme ? 0x6688aa : 0x8866aa  // Tint to enhance texture
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.5;
            body.castShadow = true;
            wizardGrp.add(body);
            
            // Robe details - glowing trim
            const trimGeometry = new THREE.TorusGeometry(0.75, 0.1, 8, 16);
            const trimMaterial = new THREE.MeshBasicMaterial({ 
                color: G.iceTheme ? 0x00FFFF : 0xFF00FF,
                transparent: true,
                opacity: 0.8
            });
            const bottomTrim = new THREE.Mesh(trimGeometry, trimMaterial);
            bottomTrim.rotation.x = Math.PI / 2;
            bottomTrim.position.y = 0.3;
            wizardGrp.add(bottomTrim);
            
            // Head (larger than guardian)
            const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
            const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 3.0;
            head.castShadow = true;
            wizardGrp.add(head);
            
            // Wizard hat with texture
            const hatGeometry = new THREE.ConeGeometry(0.7, 1.5, 8);
            const hatMaterial = new THREE.MeshLambertMaterial({ 
                map: robeTexture,
                color: G.iceTheme ? 0x5577aa : 0x7755aa
            });
            const hat = new THREE.Mesh(hatGeometry, hatMaterial);
            hat.position.y = 4.0;
            hat.castShadow = true;
            wizardGrp.add(hat);
            
            // Hat brim with glow
            const brimGeometry = new THREE.TorusGeometry(0.75, 0.15, 8, 16);
            const brimMaterial = new THREE.MeshLambertMaterial({ 
                map: robeTexture,
                color: G.iceTheme ? 0x4466aa : 0x6644aa
            });
            const brim = new THREE.Mesh(brimGeometry, brimMaterial);
            brim.rotation.x = Math.PI / 2;
            brim.position.y = 3.4;
            wizardGrp.add(brim);
            
            // Glowing purple/cyan eyes
            const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
            const eyeMaterial = new THREE.MeshBasicMaterial({ 
                color: G.iceTheme ? 0x00FFFF : 0xFF00FF,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e1.position.set(-0.22, 3.0, 0.52);
            wizardGrp.add(e1);
            
            const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            e2.position.set(0.22, 3.0, 0.52);
            wizardGrp.add(e2);
            
            // Pointy ears
            const earGeometry = new THREE.ConeGeometry(0.2, 0.6, 4);
            const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
            const er1 = new THREE.Mesh(earGeometry, earMaterial);
            er1.rotation.z = Math.PI / 2;
            er1.position.set(-0.7, 3.0, 0);
            er1.castShadow = true;
            wizardGrp.add(er1);
            
            const er2 = new THREE.Mesh(earGeometry, earMaterial);
            er2.rotation.z = -Math.PI / 2;
            er2.position.set(0.7, 3.0, 0);
            er2.castShadow = true;
            wizardGrp.add(er2);
            
            // Magic staff
            const staffGeometry = new THREE.CylinderGeometry(0.06, 0.08, 3.0, 8);
            const staffMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const staff = new THREE.Mesh(staffGeometry, staffMaterial);
            staff.position.set(0.8, 1.5, 0.3);
            staff.rotation.z = -0.2;
            staff.castShadow = true;
            wizardGrp.add(staff);
            
            // Glowing orb on staff
            const orbGeometry = new THREE.SphereGeometry(0.25, 12, 12);
            const orbMaterial = new THREE.MeshBasicMaterial({ 
                color: G.iceTheme ? 0x00FFFF : 0xFF4500,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            orb.position.set(0.9, 3.2, 0.3);
            wizardGrp.add(orb);
            wizardGrp.staffOrb = orb; // Store for animation
        }
        
        wizardGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(wizardGrp);
        
        const health = 7;
        
        return {
            mesh: wizardGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 2.0,
            health: health,
            maxHealth: health,
            isWizard: true,
            lastFireTime: Date.now() - Math.random() * 3000,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight,
            orbGlowPhase: Math.random() * Math.PI * 2
        };
    }

    // Mummy helper - desert enemy that casts tornados
    function createMummy(x, z, patrolLeft, patrolRight, speed = 0.008) {
        const textures = getTerrainTextures(THREE);
        const mummyGrp = new THREE.Group();
        
        // Wrapped body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2.2, 12);
        const bandageMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xd4c4a0,  // Aged bandage color
            map: textures.goblinSkin
        });
        const body = new THREE.Mesh(bodyGeometry, bandageMaterial);
        body.position.y = 1.3;
        body.castShadow = true;
        mummyGrp.add(body);
        
        // Bandage strips wrapping around body
        for (let i = 0; i < 6; i++) {
            const stripGeometry = new THREE.TorusGeometry(0.55, 0.05, 4, 16);
            const stripMaterial = new THREE.MeshLambertMaterial({ color: 0xc4b490 });
            const strip = new THREE.Mesh(stripGeometry, stripMaterial);
            strip.rotation.x = Math.PI / 2;
            strip.rotation.z = (i * 0.3);
            strip.position.y = 0.5 + i * 0.35;
            mummyGrp.add(strip);
        }
        
        // Head wrapped in bandages
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd4c4a0 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.7;
        head.castShadow = true;
        mummyGrp.add(head);
        
        // Glowing eyes peeking through bandages
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF88,  // Eerie green glow
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.18, 2.75, 0.42);
        mummyGrp.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.18, 2.75, 0.42);
        mummyGrp.add(e2);
        
        // Tattered bandage arm pieces
        const armGeometry = new THREE.CylinderGeometry(0.12, 0.15, 1.2, 8);
        const arm1 = new THREE.Mesh(armGeometry, bandageMaterial);
        arm1.position.set(-0.65, 1.5, 0);
        arm1.rotation.z = 0.3;
        arm1.castShadow = true;
        mummyGrp.add(arm1);
        
        const arm2 = new THREE.Mesh(armGeometry, bandageMaterial);
        arm2.position.set(0.65, 1.5, 0);
        arm2.rotation.z = -0.3;
        arm2.castShadow = true;
        mummyGrp.add(arm2);
        
        // Floating sand particles around mummy
        const sandGroup = new THREE.Group();
        for (let i = 0; i < 8; i++) {
            const sandGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            const sandMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xc4a14a,
                transparent: true,
                opacity: 0.6
            });
            const sand = new THREE.Mesh(sandGeometry, sandMaterial);
            const angle = (i / 8) * Math.PI * 2;
            sand.position.set(Math.cos(angle) * 0.8, 1.5 + Math.random(), Math.sin(angle) * 0.8);
            sandGroup.add(sand);
        }
        mummyGrp.add(sandGroup);
        mummyGrp.sandParticles = sandGroup;
        
        mummyGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(mummyGrp);
        
        const health = 6;
        
        return {
            mesh: mummyGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 1.9,
            health: health,
            maxHealth: health,
            isMummy: true,
            lastFireTime: Date.now() - Math.random() * 4000,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight,
            sandPhase: Math.random() * Math.PI * 2
        };
    }

    // Lava Monster helper - lava caves enemy that shoots fireballs and leaves lava trails
    function createLavaMonster(x, z, patrolLeft, patrolRight, speed = 0.009) {
        const lavaGrp = new THREE.Group();
        
        // Torso - larger, more menacing molten core
        const torsoGeometry = new THREE.SphereGeometry(1.0, 16, 12);
        torsoGeometry.scale(1.0, 1.3, 0.9); // Elongated torso
        const torsoMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff3300,
            transparent: true,
            opacity: 0.9
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 2.2;
        torso.castShadow = true;
        lavaGrp.add(torso);
        
        // Outer rocky armor shell (cracked and jagged)
        const shellGeometry = new THREE.DodecahedronGeometry(1.25, 1);
        shellGeometry.scale(1.0, 1.3, 0.9);
        const shellMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x1a0a05,
            transparent: true,
            opacity: 0.75
        });
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.position.y = 2.2;
        shell.castShadow = true;
        lavaGrp.add(shell);
        
        // Head - angular and intimidating
        const headGeometry = new THREE.DodecahedronGeometry(0.6, 0);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1208 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.5;
        head.castShadow = true;
        lavaGrp.add(head);
        
        // Glowing lava cracks on head
        const headGlowGeometry = new THREE.DodecahedronGeometry(0.55, 0);
        const headGlowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4400,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const headGlow = new THREE.Mesh(headGlowGeometry, headGlowMaterial);
        headGlow.position.y = 3.5;
        lavaGrp.add(headGlow);
        
        // Horns - demonic appearance
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x1a0805 });
        const hornGeometry = new THREE.ConeGeometry(0.15, 0.6, 6);
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(-0.35, 3.9, 0);
        leftHorn.rotation.z = 0.4;
        leftHorn.rotation.x = -0.2;
        lavaGrp.add(leftHorn);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(0.35, 3.9, 0);
        rightHorn.rotation.z = -0.4;
        rightHorn.rotation.x = -0.2;
        lavaGrp.add(rightHorn);
        
        // Eyes - menacing, slitted, glowing
        const eyeGeometry = new THREE.SphereGeometry(0.18, 12, 12);
        eyeGeometry.scale(1.3, 0.7, 1); // Slitted eyes
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.25, 3.55, 0.45);
        lavaGrp.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.25, 3.55, 0.45);
        lavaGrp.add(rightEye);
        
        // Eye glow aura
        const eyeGlowMaterial = new THREE.SpriteMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const leftEyeGlow = new THREE.Sprite(eyeGlowMaterial);
        leftEyeGlow.scale.set(0.5, 0.3, 1);
        leftEyeGlow.position.set(-0.25, 3.55, 0.5);
        lavaGrp.add(leftEyeGlow);
        
        const rightEyeGlow = new THREE.Sprite(eyeGlowMaterial.clone());
        rightEyeGlow.scale.set(0.5, 0.3, 1);
        rightEyeGlow.position.set(0.25, 3.55, 0.5);
        lavaGrp.add(rightEyeGlow);
        
        // Mouth - jagged opening with lava glow
        const mouthGeometry = new THREE.BoxGeometry(0.5, 0.15, 0.2);
        const mouthMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff2200,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 3.25, 0.5);
        lavaGrp.add(mouth);
        
        // ARMS - bulky, molten rock
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1510 });
        const armGlowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4400,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        // Left arm
        const leftArmGroup = new THREE.Group();
        const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8), armMaterial);
        leftUpperArm.position.y = -0.3;
        leftUpperArm.rotation.z = 0.5;
        leftArmGroup.add(leftUpperArm);
        
        const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.9, 8), armMaterial);
        leftForearm.position.set(-0.4, -0.9, 0);
        leftForearm.rotation.z = 0.3;
        leftArmGroup.add(leftForearm);
        
        // Left hand - claw-like
        const leftHand = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), armMaterial);
        leftHand.position.set(-0.6, -1.5, 0);
        leftArmGroup.add(leftHand);
        
        // Lava glow on arm
        const leftArmGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.6, 6), armGlowMaterial);
        leftArmGlow.position.set(-0.2, -0.6, 0);
        leftArmGlow.rotation.z = 0.4;
        leftArmGroup.add(leftArmGlow);
        
        leftArmGroup.position.set(-1.1, 2.5, 0);
        lavaGrp.add(leftArmGroup);
        lavaGrp.leftArm = leftArmGroup;
        
        // Right arm (mirrored)
        const rightArmGroup = new THREE.Group();
        const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.0, 8), armMaterial);
        rightUpperArm.position.y = -0.3;
        rightUpperArm.rotation.z = -0.5;
        rightArmGroup.add(rightUpperArm);
        
        const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.9, 8), armMaterial);
        rightForearm.position.set(0.4, -0.9, 0);
        rightForearm.rotation.z = -0.3;
        rightArmGroup.add(rightForearm);
        
        const rightHand = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), armMaterial);
        rightHand.position.set(0.6, -1.5, 0);
        rightArmGroup.add(rightHand);
        
        const rightArmGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.6, 6), armGlowMaterial);
        rightArmGlow.position.set(0.2, -0.6, 0);
        rightArmGlow.rotation.z = -0.4;
        rightArmGroup.add(rightArmGlow);
        
        rightArmGroup.position.set(1.1, 2.5, 0);
        lavaGrp.add(rightArmGroup);
        lavaGrp.rightArm = rightArmGroup;
        
        // LEGS - thick, powerful
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1510 });
        
        // Left leg
        const leftLegGroup = new THREE.Group();
        const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), legMaterial);
        leftThigh.position.y = -0.4;
        leftLegGroup.add(leftThigh);
        
        const leftShin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.8, 8), legMaterial);
        leftShin.position.y = -1.1;
        leftLegGroup.add(leftShin);
        
        const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.7), legMaterial);
        leftFoot.position.set(0, -1.6, 0.1);
        leftLegGroup.add(leftFoot);
        
        // Lava glow in leg cracks
        const leftLegGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 6), armGlowMaterial);
        leftLegGlow.position.y = -0.75;
        leftLegGroup.add(leftLegGlow);
        
        leftLegGroup.position.set(-0.5, 1.1, 0);
        lavaGrp.add(leftLegGroup);
        lavaGrp.leftLeg = leftLegGroup;
        
        // Right leg (mirrored)
        const rightLegGroup = new THREE.Group();
        const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), legMaterial);
        rightThigh.position.y = -0.4;
        rightLegGroup.add(rightThigh);
        
        const rightShin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.8, 8), legMaterial);
        rightShin.position.y = -1.1;
        rightLegGroup.add(rightShin);
        
        const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.7), legMaterial);
        rightFoot.position.set(0, -1.6, 0.1);
        rightLegGroup.add(rightFoot);
        
        const rightLegGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 6), armGlowMaterial);
        rightLegGlow.position.y = -0.75;
        rightLegGroup.add(rightLegGlow);
        
        rightLegGroup.position.set(0.5, 1.1, 0);
        lavaGrp.add(rightLegGroup);
        lavaGrp.rightLeg = rightLegGroup;
        
        // Glowing lava veins across body
        for (let i = 0; i < 10; i++) {
            const veinGeometry = new THREE.BoxGeometry(0.1, 0.6 + Math.random() * 0.5, 0.1);
            const veinMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff5500,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending
            });
            const vein = new THREE.Mesh(veinGeometry, veinMaterial);
            const angle = (i / 10) * Math.PI * 2;
            vein.position.set(
                Math.cos(angle) * 0.95,
                2.2 + (Math.random() - 0.5) * 0.8,
                Math.sin(angle) * 0.85
            );
            vein.rotation.set(Math.random() * 0.5, Math.random(), Math.random() * 0.5);
            lavaGrp.add(vein);
        }
        
        // Floating ember particles around the monster
        const emberGroup = new THREE.Group();
        for (let i = 0; i < 16; i++) {
            const emberGeometry = new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 6, 6);
            const emberMaterial = new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xff4400 : 0xff8800,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending
            });
            const ember = new THREE.Mesh(emberGeometry, emberMaterial);
            const angle = (i / 16) * Math.PI * 2;
            ember.position.set(
                Math.cos(angle) * (1.5 + Math.random() * 0.5),
                1.5 + Math.random() * 2.5,
                Math.sin(angle) * (1.5 + Math.random() * 0.5)
            );
            emberGroup.add(ember);
        }
        lavaGrp.add(emberGroup);
        lavaGrp.emberParticles = emberGroup;
        
        // Store body parts for animation
        lavaGrp.innerBody = torso;
        lavaGrp.outerShell = shell;
        lavaGrp.head = head;
        lavaGrp.headGlow = headGlow;
        
        lavaGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(lavaGrp);
        
        const health = 7;
        
        return {
            mesh: lavaGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 2.2,
            health: health,
            maxHealth: health,
            isLavaMonster: true,
            lastFireTime: Date.now() - Math.random() * 3000,
            lastTrailTime: Date.now() - Math.random() * 500,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight,
            emberPhase: Math.random() * Math.PI * 2,
            pulsePhase: Math.random() * Math.PI * 2
        };
    }

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
    
    // Helper function to create candy ovens
    function createOvenEntity(x, z) {
        const ovenGroup = new THREE.Group();
        
        // Main oven body (brick red with candy accents)
        const ovenBodyGeometry = new THREE.BoxGeometry(3, 3, 2.5);
        const ovenBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const ovenBody = new THREE.Mesh(ovenBodyGeometry, ovenBodyMaterial);
        ovenBody.position.y = 1.5;
        ovenBody.castShadow = true;
        ovenGroup.add(ovenBody);
        
        // Oven door (black with golden trim)
        const doorGeometry = new THREE.BoxGeometry(1.5, 1.2, 0.2);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.2, 1.35);
        ovenGroup.add(door);
        
        // Door window (orange glow)
        const windowGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF6600,
            transparent: true,
            opacity: 0.8
        });
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(0, 1.3, 1.45);
        ovenGroup.add(windowMesh);
        
        // Door handle (gold)
        const handleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0.5, 1.0, 1.5);
        handle.rotation.z = Math.PI / 2;
        ovenGroup.add(handle);
        
        // Chimney
        const chimneyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2, 8);
        const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(0, 4, -0.5);
        ovenGroup.add(chimney);
        
        // Chimney top rim
        const rimGeometry = new THREE.TorusGeometry(0.5, 0.1, 8, 12);
        const rim = new THREE.Mesh(rimGeometry, chimneyMaterial);
        rim.position.set(0, 5, -0.5);
        rim.rotation.x = Math.PI / 2;
        ovenGroup.add(rim);
        
        // Decorative icing trim on oven
        const icingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const topTrimGeometry = new THREE.BoxGeometry(3.2, 0.15, 2.7);
        const topTrim = new THREE.Mesh(topTrimGeometry, icingMaterial);
        topTrim.position.y = 3.05;
        ovenGroup.add(topTrim);
        
        // Fire glow light
        const fireLight = new THREE.PointLight(0xFF4500, 0.8, 8);
        fireLight.position.set(0, 1.2, 1);
        ovenGroup.add(fireLight);
        
        const terrainH = getTerrainHeight(x, z);
        ovenGroup.position.set(x, terrainH, z);
        G.scene.add(ovenGroup);
        
        return {
            mesh: ovenGroup,
            x: x,
            z: z,
            fireLight: fireLight,
            smokeParticles: [],
            lastSmokeTime: 0,
            lastSpawnTime: Date.now()
        };
    }
    
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
        const iceBergGeometry = new THREE.ConeGeometry(8, 20, 6);
        const iceBergMaterial = G.lavaTheme ? new THREE.MeshPhongMaterial({
            color: 0x2a1a3a,  // Dark purple obsidian
            transparent: true,
            opacity: 0.85,
            shininess: 150,
            specular: 0x6644aa,
            emissive: 0x110022,
            emissiveIntensity: 0.3
        }) : new THREE.MeshPhongMaterial({
            color: 0xB0E0E6,
            transparent: true,
            opacity: 0.7,
            shininess: 100,
            specular: 0xFFFFFF
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
    G.bananaIceBergGeometry = new THREE.ConeGeometry(8, 20, 6);
    G.bananaIceBergMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFF99, // Yellow tint
        transparent: true,
        opacity: 0.7,
        shininess: 100,
        specular: 0xFFFFFF
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

    // Create Dragon (boss enemy)
    function createDragon(posConfig, scale = 1, health = 50) {
        const textures = getTerrainTextures(THREE);
        const dragonGroup = new THREE.Group();
        
        // Use theme-appropriate textures
        let dragonScaleTexture, dragonEyeTexture;
        if (G.lavaTheme) {
            dragonScaleTexture = textures.dragonScaleLava;
            dragonEyeTexture = textures.dragonEyeLava;
        } else if (G.iceTheme) {
            dragonScaleTexture = textures.dragonScaleIce;
            dragonEyeTexture = textures.dragonEyeIce;
        } else if (G.waterTheme) {
            dragonScaleTexture = textures.dragonScaleWater;
            dragonEyeTexture = textures.dragonEyeWater;
        } else if (G.candyTheme) {
            dragonScaleTexture = textures.dragonScaleCandy;
            dragonEyeTexture = textures.dragonEyeCandy;
        } else {
            dragonScaleTexture = textures.dragonScale;
            dragonEyeTexture = textures.dragonEye;
        }
        
        // Body - long segmented shape
        const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 10, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.x = 5;
        body.castShadow = true;
        dragonGroup.add(body);
        
        // Body scales
        for (let i = 0; i < 8; i++) {
            const scaleGeometry = new THREE.ConeGeometry(0.6, 1.2, 6);
            const scaleMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
            const scale = new THREE.Mesh(scaleGeometry, scaleMaterial);
            scale.position.set(i * 1.2, 2.8, 0);
            scale.rotation.z = 0;
            scale.castShadow = true;
            dragonGroup.add(scale);
        }
        
        // Neck
        const neckGeometry = new THREE.CylinderGeometry(1.8, 2, 4, 8);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.rotation.z = Math.PI / 2;
        neck.position.x = 10;
        neck.position.y = 1;
        neck.castShadow = true;
        dragonGroup.add(neck);
        
        // Head - large diamond shape
        const headGeometry = new THREE.ConeGeometry(2.5, 5, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.rotation.z = -Math.PI / 2;
        head.position.x = 13;
        head.position.y = 1.5;
        head.castShadow = true;
        dragonGroup.add(head);
        
        // Jaw
        const jawGeometry = new THREE.BoxGeometry(2, 1.5, 2);
        const jaw = new THREE.Mesh(jawGeometry, headMaterial);
        jaw.position.set(14, 0.5, 0);
        jaw.castShadow = true;
        dragonGroup.add(jaw);
        
        // Teeth
        for (let i = 0; i < 6; i++) {
            const toothGeometry = new THREE.ConeGeometry(0.15, 0.6, 4);
            const toothMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            tooth.position.set(14 + (i % 2) * 0.5, 1.2, -1 + i * 0.4);
            tooth.rotation.z = Math.PI;
            dragonGroup.add(tooth);
        }
        
        // Eyes - glowing with texture and sprite glow
        const eyeGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            map: dragonEyeTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(13.5, 2.5, 1.2);
        dragonGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(13.5, 2.5, -1.2);
        dragonGroup.add(rightEye);
        
        // Eye glow sprites - larger and brighter
        const eyeGlowGeometry = new THREE.PlaneGeometry(2.5, 2.5);
        const eyeGlowMaterial = new THREE.MeshBasicMaterial({
            map: dragonEyeTexture,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const leftEyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        leftEyeGlow.position.set(13.8, 2.5, 1.2);
        dragonGroup.add(leftEyeGlow);
        
        const rightEyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        rightEyeGlow.position.set(13.8, 2.5, -1.2);
        dragonGroup.add(rightEyeGlow);
        
        // Wings - more detailed
        const wingGeometry = new THREE.BufferGeometry();
        const wingVertices = new Float32Array([
            0, 0, 0,
            6, 2, 0,
            8, 0, 0,
            6, -2, 0,
            4, -1, 0
        ]);
        wingGeometry.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
        wingGeometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]);
        wingGeometry.computeVertexNormals();
        
        const wingMaterial = new THREE.MeshLambertMaterial({ 
            map: dragonScaleTexture, 
            side: THREE.DoubleSide 
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(3, 3, 0);
        leftWing.rotation.y = Math.PI / 2;
        leftWing.castShadow = true;
        dragonGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(3, 3, 0);
        rightWing.rotation.y = -Math.PI / 2;
        rightWing.castShadow = true;
        dragonGroup.add(rightWing);
        
        // Tail segments
        const tailSegments = [];
        for (let i = 0; i < 3; i++) {
            const segmentGeometry = new THREE.CylinderGeometry(1.5 - i * 0.3, 1.8 - i * 0.3, 3, 8);
            const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
            segment.rotation.z = Math.PI / 2;
            segment.position.x = -3 - i * 2.5;
            segment.position.y = 0.5 - i * 0.3;
            segment.castShadow = true;
            dragonGroup.add(segment);
            tailSegments.push(segment);
        }
        
        // Tail spikes
        for (let i = 0; i < 10; i++) {
            const spikeGeometry = new THREE.ConeGeometry(0.3, 1, 6);
            const spikeMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(-i * 0.8, 2.5, 0);
            spike.rotation.z = Math.PI;
            spike.castShadow = true;
            dragonGroup.add(spike);
        }
        
        // Horns - larger and more imposing
        const hornGeometry = new THREE.ConeGeometry(0.5, 2.5, 6);
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(12.5, 4, 1.5);
        leftHorn.rotation.z = -0.4;
        leftHorn.rotation.x = 0.2;
        leftHorn.castShadow = true;
        dragonGroup.add(leftHorn);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(12.5, 4, -1.5);
        rightHorn.rotation.z = -0.4;
        rightHorn.rotation.x = -0.2;
        rightHorn.castShadow = true;
        dragonGroup.add(rightHorn);
        
        // Chest/belly - lighter color
        const bellyGeometry = new THREE.CylinderGeometry(1.8, 2.2, 8, 12);
        const bellyMaterial = new THREE.MeshLambertMaterial({ map: textures.dragonBelly });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.rotation.z = Math.PI / 2;
        belly.position.x = 5;
        belly.position.y = -1.5;
        belly.castShadow = true;
        dragonGroup.add(belly);
        
        // Position dragon from provided config or level config
        const dragonConfig = posConfig || G.levelConfig.dragon || { x: 0, z: -200 };
        const dragonX = dragonConfig.x;
        const dragonZ = dragonConfig.z;
        // Use config y if provided, otherwise calculate from terrain
        const dragonY = dragonConfig.y !== undefined ? dragonConfig.y : getTerrainHeight(dragonX, dragonZ) + 3 * scale;

        // Apply scale to the entire dragon
        dragonGroup.scale.set(scale, scale, scale);
        dragonGroup.position.set(dragonX, dragonY, dragonZ);
        G.scene.add(dragonGroup);
        
        return {
            mesh: dragonGroup,
            head: head,
            leftWing: leftWing,
            rightWing: rightWing,
            tailSegments: tailSegments,
            leftEye: leftEye,
            rightEye: rightEye,
            leftEyeGlow: leftEyeGlow,
            rightEyeGlow: rightEyeGlow,
            health: health,
            maxHealth: health,
            scale: scale,
            alive: true,
            speed: 0.08 * speedMultiplier * scale,
            patrolLeft: dragonX - 30,
            patrolRight: dragonX + 30,
            patrolFront: dragonZ - 20,
            patrolBack: dragonZ + 20,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: scale < 1 ? 5000 : 4000, // Smaller dragons fire less often
            wingFlapPhase: 0,
            isFlying: false,
            flyStartTime: 0,
            flyDuration: 0,
            flyTargetY: 0,
            groundY: 0,
            frozen: false,
            frozenUntil: 0
        };
    }

    // Create Reaper (boss enemy for graveyard theme - replaces dragon)
    function createReaper(posConfig, scale = 1, health = 60) {
        const textures = getTerrainTextures(THREE);
        const reaperGroup = new THREE.Group();

        // MASSIVE HOODED DEATH FIGURE - using visible dark colors (not pure black)
        const cloakBlack = 0x2a2035;  // Dark purple-gray (visible against dark sky)
        const cloakDark = 0x1a1520;   // Slightly lighter dark
        const boneWhite = 0xd0c8b0;
        const glowGreen = 0x00FF44;

        // Main body/robe - massive flowing cloak
        const robeGeometry = new THREE.CylinderGeometry(2.5, 4.5, 12, 16);
        const robeMaterial = new THREE.MeshLambertMaterial({
            color: cloakBlack
        });
        const robe = new THREE.Mesh(robeGeometry, robeMaterial);
        robe.position.y = 6;
        robe.castShadow = true;
        reaperGroup.add(robe);

        // Flowing tattered edges
        for (let i = 0; i < 16; i++) {
            const tatGeometry = new THREE.ConeGeometry(0.5, 3 + Math.random() * 2, 4);
            const tatMaterial = new THREE.MeshLambertMaterial({ color: cloakDark });
            const tatter = new THREE.Mesh(tatGeometry, tatMaterial);
            const angle = (i / 16) * Math.PI * 2;
            tatter.position.set(Math.cos(angle) * 4.2, 0.5, Math.sin(angle) * 4.2);
            tatter.rotation.x = Math.PI;
            reaperGroup.add(tatter);
        }

        // Upper body shroud
        const shroudGeometry = new THREE.CylinderGeometry(2.0, 2.5, 4, 12);
        const shroud = new THREE.Mesh(shroudGeometry, robeMaterial);
        shroud.position.y = 12.5;
        shroud.castShadow = true;
        reaperGroup.add(shroud);

        // Hood - deep and dark
        const hoodGeometry = new THREE.ConeGeometry(2.5, 4, 12);
        const hoodMaterial = new THREE.MeshLambertMaterial({ color: cloakBlack });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.y = 16;
        hood.rotation.x = 0.2;
        hood.castShadow = true;
        reaperGroup.add(hood);

        // Hood opening (shadowed face area)
        const faceVoidGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const faceVoidMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.95
        });
        const faceVoid = new THREE.Mesh(faceVoidGeometry, faceVoidMaterial);
        faceVoid.position.set(0, 14.5, 1.2);
        faceVoid.scale.z = 0.5;
        reaperGroup.add(faceVoid);

        // Skull face (barely visible in hood darkness)
        const skullGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const skullMaterial = new THREE.MeshLambertMaterial({
            color: boneWhite,
            transparent: true,
            opacity: 0.4
        });
        const skull = new THREE.Mesh(skullGeometry, skullMaterial);
        skull.position.set(0, 14.5, 0.8);
        skull.scale.z = 0.8;
        reaperGroup.add(skull);

        // Glowing eye sockets
        const eyeGeometry = new THREE.SphereGeometry(0.35, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.5, 14.7, 1.8);
        reaperGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.5, 14.7, 1.8);
        reaperGroup.add(rightEye);

        // Eye glow effect - brighter
        const eyeGlowLight = new THREE.PointLight(0xFF0000, 3.0, 20);
        eyeGlowLight.position.set(0, 14.7, 2);
        reaperGroup.add(eyeGlowLight);

        // Skeletal hands emerging from sleeves
        const handMaterial = new THREE.MeshLambertMaterial({ color: boneWhite });

        // Left hand holding scythe
        const leftHandGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.4);
        const leftHand = new THREE.Mesh(leftHandGeometry, handMaterial);
        leftHand.position.set(-3.5, 10, 2);
        leftHand.rotation.z = 0.3;
        reaperGroup.add(leftHand);

        // Left arm sleeve
        const leftSleeveGeometry = new THREE.CylinderGeometry(0.6, 1.2, 4, 8);
        const leftSleeve = new THREE.Mesh(leftSleeveGeometry, robeMaterial);
        leftSleeve.position.set(-3, 11, 1);
        leftSleeve.rotation.z = 0.4;
        leftSleeve.rotation.x = -0.3;
        reaperGroup.add(leftSleeve);

        // Right hand reaching out
        const rightHandGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.4);
        const rightHand = new THREE.Mesh(rightHandGeometry, handMaterial);
        rightHand.position.set(3.5, 10, 2);
        rightHand.rotation.z = -0.3;
        reaperGroup.add(rightHand);

        // Right arm sleeve
        const rightSleeveGeometry = new THREE.CylinderGeometry(0.6, 1.2, 4, 8);
        const rightSleeve = new THREE.Mesh(rightSleeveGeometry, robeMaterial);
        rightSleeve.position.set(3, 11, 1);
        rightSleeve.rotation.z = -0.4;
        rightSleeve.rotation.x = -0.3;
        reaperGroup.add(rightSleeve);

        // GIANT SCYTHE
        // Scythe handle
        const handleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 16, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x2a1a0a });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(-4, 12, 2.5);
        handle.rotation.z = 0.3;
        handle.rotation.x = -0.15;
        reaperGroup.add(handle);

        // Scythe blade - curved deadly
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0);
        bladeShape.lineTo(5, 1);
        bladeShape.quadraticCurveTo(7, 0.5, 8, -1);
        bladeShape.quadraticCurveTo(6, -0.5, 4, 0);
        bladeShape.lineTo(0, 0);

        const bladeExtrudeSettings = {
            steps: 1,
            depth: 0.1,
            bevelEnabled: false
        };
        const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, bladeExtrudeSettings);
        const bladeMaterial = new THREE.MeshPhongMaterial({
            color: 0x3a3a3a,
            shininess: 100,
            specular: 0x666666
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(-5, 19, 2);
        blade.rotation.y = Math.PI / 2;
        blade.rotation.z = 0.5;
        reaperGroup.add(blade);

        // Blade edge glow
        const edgeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 6, 8);
        const edgeMaterial = new THREE.MeshBasicMaterial({
            color: glowGreen,
            transparent: true,
            opacity: 0.6
        });
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.position.set(-3, 19.5, 5);
        edge.rotation.z = 0.8;
        reaperGroup.add(edge);

        // Ghostly trail particles (ethereal essence)
        const trailGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: glowGreen,
            transparent: true,
            opacity: 0.3
        });
        for (let i = 0; i < 8; i++) {
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.set(
                (Math.random() - 0.5) * 6,
                Math.random() * 12,
                (Math.random() - 0.5) * 6
            );
            trail.scale.setScalar(0.3 + Math.random() * 0.7);
            reaperGroup.add(trail);
        }

        // Eerie ambient light
        const ambientGlow = new THREE.PointLight(glowGreen, 0.5, 15);
        ambientGlow.position.set(0, 8, 0);
        reaperGroup.add(ambientGlow);

        // Position reaper
        const reaperConfig = posConfig || G.levelConfig.dragon || { x: 0, z: -200 };
        const reaperX = reaperConfig.x;
        const reaperZ = reaperConfig.z;
        const terrainH = getTerrainHeight(reaperX, reaperZ);
        // Reaper should be at ground level
        const reaperY = reaperConfig.y !== undefined ? reaperConfig.y : terrainH;

        // Apply scale (use config scale or default 0.5)
        const finalScale = reaperConfig.scale !== undefined ? reaperConfig.scale : scale;
        reaperGroup.scale.set(finalScale, finalScale, finalScale);
        reaperGroup.position.set(reaperX, reaperY, reaperZ);
        G.scene.add(reaperGroup);

        // Store blade and handle for attack animations
        reaperGroup.blade = blade;
        reaperGroup.handle = handle;

        return {
            mesh: reaperGroup,
            head: hood,
            leftEye: leftEye,
            rightEye: rightEye,
            blade: blade,
            health: health,
            maxHealth: health,
            scale: finalScale,
            alive: true,
            speed: 0.025 * speedMultiplier * finalScale, // Slower reaper
            patrolLeft: reaperX - 40,
            patrolRight: reaperX + 40,
            patrolFront: reaperZ - 25,
            patrolBack: reaperZ + 25,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: finalScale < 0.5 ? 4000 : 3000,
            isFlying: false, // Reapers float/hover
            flyStartTime: 0,
            flyDuration: 0,
            flyTargetY: 0,
            groundY: reaperY,
            frozen: false,
            frozenUntil: 0,
            isReaper: true, // Flag to identify as reaper for special behavior
            hoverPhase: Math.random() * Math.PI * 2,
            chaseRange: 40, // Only chase player within this range
            homeX: reaperX,
            homeZ: reaperZ
        };
    }
    
    G.dragon = null;
    G.extraDragons = [];
    G.fireballs = [];
    
    // Spawn boss - Reaper for graveyard (always, both difficulties), Dragon for others on hard
    if (G.graveyardTheme || G.levelConfig.useReaper) {
        G.dragon = createReaper();
    } else if (difficulty === 'hard') {
        G.dragon = createDragon();
    }
    
    if (difficulty === 'hard') {
        
        // Create extra bosses for levels with multiple dragons/reapers
        if (G.levelConfig.extraDragons) {
            G.levelConfig.extraDragons.forEach(pos => {
                const bossScale = pos.scale || 0.6;
                const bossHealth = pos.health || 25;
                if (G.graveyardTheme || pos.useReaper) {
                    const extraReaper = createReaper(pos, bossScale, bossHealth);
                    G.extraDragons.push(extraReaper);
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

    // Bird helper
    function createBird(centerX, centerZ, radius, speed) {
        const birdGroup = new THREE.Group();
        
        if (G.graveyardTheme) {
            // BAT - dark flying creature for graveyard
            const batColor = 0x1a1a1a;
            const batWingColor = 0x2a2020;

            // Bat body - small and furry
            const bodyGeometry = new THREE.SphereGeometry(0.35, 12, 12);
            bodyGeometry.scale(1, 1, 1.3);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: batColor });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);

            // Bat head
            const headGeometry = new THREE.SphereGeometry(0.2, 10, 10);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.1, -0.35);
            birdGroup.add(head);

            // Pointy ears
            const earGeometry = new THREE.ConeGeometry(0.08, 0.2, 4);
            const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear1.position.set(-0.1, 0.25, -0.35);
            ear1.rotation.z = -0.2;
            birdGroup.add(ear1);

            const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear2.position.set(0.1, 0.25, -0.35);
            ear2.rotation.z = 0.2;
            birdGroup.add(ear2);

            // Glowing red eyes
            const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({
                color: 0xFF0000,
                transparent: true,
                opacity: 0.9
            });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.08, 0.12, -0.5);
            birdGroup.add(eye1);

            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.08, 0.12, -0.5);
            birdGroup.add(eye2);

            // Bat wings - membrane-like
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0, 0);
            wingShape.lineTo(0.8, 0.3);
            wingShape.lineTo(1.0, 0);
            wingShape.lineTo(0.9, -0.2);
            wingShape.lineTo(0.6, -0.1);
            wingShape.lineTo(0.3, -0.2);
            wingShape.lineTo(0, 0);

            const wingGeometry = new THREE.ShapeGeometry(wingShape);
            const wingMaterial = new THREE.MeshLambertMaterial({
                color: batWingColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });

            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.1, 0, 0);
            leftWing.rotation.y = Math.PI / 2;
            leftWing.scale.x = -1;
            leftWing.castShadow = true;
            birdGroup.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.1, 0, 0);
            rightWing.rotation.y = -Math.PI / 2;
            rightWing.castShadow = true;
            birdGroup.add(rightWing);

            birdGroup.leftWing = leftWing;
            birdGroup.rightWing = rightWing;
        } else if (G.candyTheme) {
            // CANDY BUTTERFLY - colorful flying candy
            const butterflyColors = [0xFF69B4, 0x87CEEB, 0xFFD700, 0x98FB98, 0xDDA0DD];
            const butterflyColor = butterflyColors[Math.floor(Math.random() * butterflyColors.length)];

            // Small round body
            const bodyGeometry = new THREE.SphereGeometry(0.25, 10, 10);
            bodyGeometry.scale(1, 1, 1.5);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: butterflyColor,
                shininess: 80
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);

            // Butterfly wings
            const wingGeometry = new THREE.CircleGeometry(0.6, 16);
            const wingMaterial = new THREE.MeshPhongMaterial({
                color: butterflyColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });

            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.5, 0, 0);
            leftWing.rotation.y = 0.3;
            leftWing.castShadow = true;
            birdGroup.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.5, 0, 0);
            rightWing.rotation.y = -0.3;
            rightWing.castShadow = true;
            birdGroup.add(rightWing);

            // Sparkle on wings
            const sparkleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            for (let i = 0; i < 4; i++) {
                const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
                sparkle.position.set(
                    (Math.random() - 0.5) * 1.2,
                    (Math.random() - 0.5) * 0.3,
                    0
                );
                birdGroup.add(sparkle);
            }

            birdGroup.leftWing = leftWing;
            birdGroup.rightWing = rightWing;
        } else {
            // Standard bird
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

            birdGroup.leftWing = leftWing;
            birdGroup.rightWing = rightWing;
        }
        
        const angle = Math.random() * Math.PI * 2;
        const startX = centerX + Math.cos(angle) * radius;
        const startZ = centerZ + Math.sin(angle) * radius;
        const startY = 8 + Math.random() * 4;
        
        birdGroup.position.set(startX, startY, startZ);
        G.scene.add(birdGroup);
        
        return {
            mesh: birdGroup,
            centerX: centerX,
            centerZ: centerZ,
            radius: radius,
            speed: speed,
            angle: angle,
            height: startY,
            leftWing: birdGroup.leftWing,
            rightWing: birdGroup.rightWing,
            lastBombTime: Date.now(),
            wingFlapPhase: 0
        };
    }
    
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

    function createPirateShip(config) {
        const shipGroup = new THREE.Group();

        // Hull - dark wood
        const hullGeometry = new THREE.BoxGeometry(8, 3, 20);
        const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 1.5;
        hull.castShadow = true;
        shipGroup.add(hull);

        // Deck
        const deckGeometry = new THREE.BoxGeometry(7, 0.5, 18);
        const deckMaterial = new THREE.MeshLambertMaterial({ color: 0x6a5040 });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 3;
        shipGroup.add(deck);

        // Mast
        const mastGeometry = new THREE.CylinderGeometry(0.3, 0.4, 12, 8);
        const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2510 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.y = 9;
        shipGroup.add(mast);

        // Sail
        const sailGeometry = new THREE.PlaneGeometry(6, 8);
        const sailMaterial = new THREE.MeshLambertMaterial({
            color: 0x111111,
            side: THREE.DoubleSide
        });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.y = 10;
        sail.position.z = 0.5;
        shipGroup.add(sail);

        // Skull emblem on sail
        const skullGeometry = new THREE.CircleGeometry(1.5, 8);
        const skullMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const skull = new THREE.Mesh(skullGeometry, skullMaterial);
        skull.position.y = 10;
        skull.position.z = 0.6;
        shipGroup.add(skull);

        // Cannons (sides)
        for (let i = 0; i < 3; i++) {
            const cannonGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
            const cannonMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });

            const leftCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
            leftCannon.rotation.z = Math.PI / 2;
            leftCannon.position.set(-4.5, 2.5, (i - 1) * 5);
            shipGroup.add(leftCannon);

            const rightCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
            rightCannon.rotation.z = Math.PI / 2;
            rightCannon.position.set(4.5, 2.5, (i - 1) * 5);
            shipGroup.add(rightCannon);
        }

        const terrainHeight = getTerrainHeight(config.x, config.z);
        shipGroup.position.set(config.x, terrainHeight + 0.5, config.z);
        G.scene.add(shipGroup);

        return {
            mesh: shipGroup,
            x: config.x,
            z: config.z,
            patrolZ1: config.patrolZ1,
            patrolZ2: config.patrolZ2,
            speed: config.speed,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: 3000 + Math.random() * 2000
        };
    }

    // Create pirate ships in hard mode (water level only)
    if (difficulty === 'hard' && G.levelConfig.pirateShips) {
        G.levelConfig.pirateShips.forEach(shipConfig => {
            G.pirateShips.push(createPirateShip(shipConfig));
        });
    }

    // Export functions needed by other files
    window.animatePortal = animatePortal;
}
