// entity-goblin.js - Base goblin enemy with theme variants
// Theme variants: Shark (water), Devil (lava), Gummy Bear (candy), Zombie (graveyard), Knight (ruins)

(function() {
    'use strict';
    
    // ========================================
    // GOBLIN CREATION
    // ========================================
    
    /**
     * Create a goblin enemy with theme-appropriate appearance
     * @param {number} x - X position
     * @param {number} z - Z position  
     * @param {number} patrolLeft - Left patrol boundary
     * @param {number} patrolRight - Right patrol boundary
     * @param {number} speed - Movement speed (default: 0.013)
     * @returns {object} Goblin entity object
     */
    function createGoblin(x, z, patrolLeft, patrolRight, speed = 0.013) {
        const textures = getTerrainTextures(THREE);
        const goblinGrp = new THREE.Group();

        if (G.waterTheme) {
            buildSharkFin(goblinGrp);
        } else if (G.lavaTheme) {
            buildDevil(goblinGrp);
        } else if (G.candyTheme) {
            buildGummyBear(goblinGrp);
        } else if (G.graveyardTheme) {
            buildZombie(goblinGrp);
        } else if (G.ruinsTheme) {
            buildKnight(goblinGrp);
        } else if (G.computerTheme) {
            buildBug(goblinGrp);
        } else {
            buildStandardGoblin(goblinGrp, textures);
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
    
    // ========================================
    // THEME-SPECIFIC BUILDERS
    // ========================================
    
    function buildSharkFin(group) {
        // Shark fin - triangle sticking out of water
        const finGeometry = new THREE.ConeGeometry(0.5, 2.5, 3);
        const finMaterial = new THREE.MeshLambertMaterial({ color: 0x2a3a4a });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.y = 1.0;
        fin.castShadow = true;
        group.add(fin);

        // Small dorsal detail
        const detailGeometry = new THREE.ConeGeometry(0.15, 0.5, 3);
        const detail = new THREE.Mesh(detailGeometry, finMaterial);
        detail.position.set(0, 0.3, -0.4);
        group.add(detail);
    }
    
    function buildDevil(group) {
        // DEVIL - red demonic creature for lava level
        const devilRed = 0xCC2222;
        const darkRed = 0x880000;

        // Devil body
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.85;
        body.castShadow = true;
        group.add(body);

        // Devil head
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.55;
        head.castShadow = true;
        group.add(head);

        // Devil horns
        const hornGeometry = new THREE.ConeGeometry(0.08, 0.5, 8);
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
        horn1.position.set(-0.25, 1.85, 0);
        horn1.rotation.z = 0.4;
        horn1.castShadow = true;
        group.add(horn1);

        const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
        horn2.position.set(0.25, 1.85, 0);
        horn2.rotation.z = -0.4;
        horn2.castShadow = true;
        group.add(horn2);

        // Glowing evil eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.9
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.15, 1.55, 0.35);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.55, 0.35);
        group.add(eye2);

        // Evil grin
        const mouthGeometry = new THREE.BoxGeometry(0.25, 0.06, 0.1);
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.4, 0.38);
        group.add(mouth);

        // Pointed ears
        const earGeometry = new THREE.ConeGeometry(0.1, 0.35, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: darkRed });
        const ear1 = new THREE.Mesh(earGeometry, earMaterial);
        ear1.rotation.z = Math.PI / 2;
        ear1.position.set(-0.5, 1.5, 0);
        group.add(ear1);

        const ear2 = new THREE.Mesh(earGeometry, earMaterial);
        ear2.rotation.z = -Math.PI / 2;
        ear2.position.set(0.5, 1.5, 0);
        group.add(ear2);

        // Devil tail
        const tailGeometry = new THREE.CylinderGeometry(0.05, 0.03, 0.8, 6);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.5, -0.4);
        tail.rotation.x = 0.5;
        group.add(tail);

        // Tail tip (arrow shape)
        const tipGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
        const tipMaterial = new THREE.MeshLambertMaterial({ color: darkRed });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.set(0, 0.15, -0.7);
        tip.rotation.x = Math.PI / 2 + 0.3;
        group.add(tip);

        // Small pitchfork
        const staffGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
        const staffMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.4, 0.9, 0.1);
        staff.rotation.z = 0.2;
        group.add(staff);

        // Pitchfork prongs
        const prongGeometry = new THREE.ConeGeometry(0.03, 0.2, 4);
        const prongMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        for (let i = -1; i <= 1; i++) {
            const prong = new THREE.Mesh(prongGeometry, prongMaterial);
            prong.position.set(0.4 + i * 0.08, 1.55, 0.1);
            prong.rotation.z = 0.2;
            group.add(prong);
        }
    }
    
    function buildGummyBear(group) {
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
        group.add(body);

        // Gummy bear head
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.4;
        head.castShadow = true;
        group.add(head);

        // Round ears
        const earGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
        ear1.position.set(-0.25, 1.65, 0);
        group.add(ear1);

        const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
        ear2.position.set(0.25, 1.65, 0);
        group.add(ear2);

        // Cute eyes
        const eyeGeometry = new THREE.SphereGeometry(0.06, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.12, 1.45, 0.3);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.12, 1.45, 0.3);
        group.add(eye2);

        // Little smile
        const smileGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
        const smileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.32, 0.32);
        smile.rotation.x = Math.PI;
        group.add(smile);

        // Short arms
        const armGeometry = new THREE.SphereGeometry(0.15, 12, 12);
        armGeometry.scale(1, 1.5, 1);
        const arm1 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm1.position.set(-0.5, 0.8, 0);
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm2.position.set(0.5, 0.8, 0);
        group.add(arm2);

        // Short legs
        const legGeometry = new THREE.SphereGeometry(0.18, 12, 12);
        legGeometry.scale(1, 1.3, 1);
        const leg1 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg1.position.set(-0.2, 0.15, 0);
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg2.position.set(0.2, 0.15, 0);
        group.add(leg2);
    }
    
    function buildZombie(group) {
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
        group.add(body);

        // Zombie head - slightly lopsided
        const headGeometry = new THREE.SphereGeometry(0.38, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: zombieGreen });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.05, 1.45, 0.1);
        head.rotation.z = 0.15; // Tilted head
        head.castShadow = true;
        group.add(head);

        // Sunken glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.8
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.12, 1.48, 0.32);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.45, 0.32);
        group.add(eye2);

        // Gaping mouth
        const mouthGeometry = new THREE.BoxGeometry(0.2, 0.15, 0.1);
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1010 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0.02, 1.32, 0.35);
        group.add(mouth);

        // Exposed bones/ribs
        const ribMaterial = new THREE.MeshLambertMaterial({ color: 0xd0c8b0 });
        for (let i = 0; i < 3; i++) {
            const ribGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 6);
            const rib = new THREE.Mesh(ribGeometry, ribMaterial);
            rib.position.set(0, 0.6 + i * 0.12, 0.22);
            rib.rotation.z = Math.PI / 2;
            group.add(rib);
        }

        // Tattered arms
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.06, 0.6, 6);
        const armMaterial = new THREE.MeshLambertMaterial({ color: rotColor });
        const arm1 = new THREE.Mesh(armGeometry, armMaterial);
        arm1.position.set(-0.4, 0.6, 0.15);
        arm1.rotation.z = 0.8;
        arm1.rotation.x = -0.3;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(0.4, 0.55, 0.15);
        arm2.rotation.z = -0.6;
        arm2.rotation.x = -0.4;
        group.add(arm2);

        // Shambling legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 6);
        const leg1 = new THREE.Mesh(legGeometry, armMaterial);
        leg1.position.set(-0.15, 0.25, 0);
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, armMaterial);
        leg2.position.set(0.15, 0.25, 0);
        leg2.rotation.x = 0.1;
        group.add(leg2);
    }
    
    function buildKnight(group) {
        // KNIGHT - armored warrior for ruins level
        const armorColor = 0x6a6a7a;
        const chainmailColor = 0x4a4a5a;
        const plumageColor = 0x8B0000;

        // Armored torso
        const bodyGeometry = new THREE.BoxGeometry(0.65, 0.85, 0.45);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: armorColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.85;
        body.castShadow = true;
        group.add(body);

        // Chest plate detail
        const chestPlateGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.1);
        const chestPlateMaterial = new THREE.MeshLambertMaterial({ color: 0x5a5a6a });
        const chestPlate = new THREE.Mesh(chestPlateGeometry, chestPlateMaterial);
        chestPlate.position.set(0, 0.9, 0.25);
        group.add(chestPlate);

        // Knight helmet
        const helmetGeometry = new THREE.SphereGeometry(0.38, 16, 16);
        const helmetMaterial = new THREE.MeshLambertMaterial({ color: armorColor });
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 1.55;
        helmet.castShadow = true;
        group.add(helmet);

        // Helmet visor
        const visorGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.15);
        const visorMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a2a });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 1.5, 0.32);
        group.add(visor);

        // Eye slits (glowing)
        const eyeSlitGeometry = new THREE.BoxGeometry(0.08, 0.04, 0.05);
        const eyeSlitMaterial = new THREE.MeshBasicMaterial({
            color: 0x6699FF,
            transparent: true,
            opacity: 0.8
        });
        const eyeSlit1 = new THREE.Mesh(eyeSlitGeometry, eyeSlitMaterial);
        eyeSlit1.position.set(-0.08, 1.52, 0.38);
        group.add(eyeSlit1);

        const eyeSlit2 = new THREE.Mesh(eyeSlitGeometry, eyeSlitMaterial);
        eyeSlit2.position.set(0.08, 1.52, 0.38);
        group.add(eyeSlit2);

        // Helmet plume
        const plumeGeometry = new THREE.ConeGeometry(0.12, 0.5, 8);
        const plumeMaterial = new THREE.MeshLambertMaterial({ color: plumageColor });
        const plume = new THREE.Mesh(plumeGeometry, plumeMaterial);
        plume.position.set(0, 1.95, -0.1);
        plume.rotation.x = 0.3;
        group.add(plume);

        // Armored arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.55, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: chainmailColor });
        const arm1 = new THREE.Mesh(armGeometry, armMaterial);
        arm1.position.set(-0.45, 0.7, 0);
        arm1.rotation.z = 0.3;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(0.45, 0.7, 0);
        arm2.rotation.z = -0.3;
        group.add(arm2);

        // Gauntlets
        const gauntletGeometry = new THREE.BoxGeometry(0.12, 0.15, 0.12);
        const gauntletMaterial = new THREE.MeshLambertMaterial({ color: armorColor });
        const gauntlet1 = new THREE.Mesh(gauntletGeometry, gauntletMaterial);
        gauntlet1.position.set(-0.55, 0.4, 0);
        group.add(gauntlet1);

        const gauntlet2 = new THREE.Mesh(gauntletGeometry, gauntletMaterial);
        gauntlet2.position.set(0.55, 0.4, 0);
        group.add(gauntlet2);

        // Shield (left hand)
        const shieldGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.08);
        const shieldMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.set(-0.7, 0.6, 0.2);
        shield.rotation.y = 0.3;
        group.add(shield);

        // Shield emblem
        const emblemGeometry = new THREE.CircleGeometry(0.1, 8);
        const emblemMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
        emblem.position.set(-0.68, 0.6, 0.26);
        emblem.rotation.y = 0.3;
        group.add(emblem);

        // Sword (right hand)
        const swordHandleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6);
        const swordHandleMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
        const swordHandle = new THREE.Mesh(swordHandleGeometry, swordHandleMaterial);
        swordHandle.position.set(0.6, 0.5, 0.15);
        swordHandle.rotation.z = -0.3;
        group.add(swordHandle);

        const swordBladeGeometry = new THREE.BoxGeometry(0.06, 0.6, 0.02);
        const swordBladeMaterial = new THREE.MeshLambertMaterial({ color: 0x9a9aaa });
        const swordBlade = new THREE.Mesh(swordBladeGeometry, swordBladeMaterial);
        swordBlade.position.set(0.7, 0.9, 0.15);
        swordBlade.rotation.z = -0.3;
        group.add(swordBlade);

        // Armored legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: chainmailColor });
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.18, 0.25, 0);
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(0.18, 0.25, 0);
        group.add(leg2);
    }
    
    function buildBug(group) {
        // COMPUTER BUG - pixelated green glitch creature (wiki style)
        const bugColor = 0x00FF00;      // Green glitch color
        const darkColor = 0x003300;     // Dark green

        // Glitchy pixelated body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.4);
        const bodyMaterial = new THREE.MeshBasicMaterial({ 
            color: bugColor, 
            transparent: true, 
            opacity: 0.8 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.7;
        body.castShadow = true;
        group.add(body);

        // Pixel head
        const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.4);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.3;
        head.castShadow = true;
        group.add(head);

        // Red error eyes
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const eyeGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.1);
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.35, 0.22);
            group.add(eye);
        });

        // Antenna (error flags)
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
        const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        [-0.15, 0.15].forEach(x => {
            const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            antenna.position.set(x, 1.7, 0);
            antenna.castShadow = true;
            group.add(antenna);
        });

        // Glitch particles around
        for (let i = 0; i < 6; i++) {
            const glitchGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const glitchMaterial = new THREE.MeshBasicMaterial({ 
                color: [0x00FF00, 0xFF0000, 0x00FFFF][i % 3] 
            });
            const glitch = new THREE.Mesh(glitchGeometry, glitchMaterial);
            const angle = (i / 6) * Math.PI * 2;
            glitch.position.set(Math.cos(angle) * 0.6, 0.8 + (i % 3) * 0.3, Math.sin(angle) * 0.4);
            glitch.userData.floatOffset = Math.random() * Math.PI * 2;
            group.add(glitch);
        }

        group.userData.isBug = true;
    }
    
    function buildStandardGoblin(group, textures) {
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinArmor });
        const goblinBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        goblinBody.position.y = 0.8;
        goblinBody.castShadow = true;
        group.add(goblinBody);
    
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
        const goblinHead = new THREE.Mesh(headGeometry, headMaterial);
        goblinHead.position.y = 1.5;
        goblinHead.castShadow = true;
        group.add(goblinHead);
        
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            map: textures.goblinEye,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.15, 1.5, 0.35);
        group.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.5, 0.35);
        group.add(eye2);
        
        const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
        const ear1 = new THREE.Mesh(earGeometry, earMaterial);
        ear1.rotation.z = Math.PI / 2;
        ear1.position.set(-0.5, 1.5, 0);
        ear1.castShadow = true;
        group.add(ear1);
        
        const ear2 = new THREE.Mesh(earGeometry, earMaterial);
        ear2.rotation.z = -Math.PI / 2;
        ear2.position.set(0.5, 1.5, 0);
        ear2.castShadow = true;
        group.add(ear2);
    }
    
    // ========================================
    // REGISTER WITH ENTITY REGISTRY
    // ========================================
    
    ENTITY_REGISTRY.register('goblin', {
        create: createGoblin
        // update function will be added when we extract updateGoblins
    });
    
    // Export createGoblin globally for backward compatibility during migration
    window.createGoblin = createGoblin;
    
})();
