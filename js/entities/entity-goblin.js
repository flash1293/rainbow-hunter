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
        } else if (G.enchantedTheme) {
            buildPixie(goblinGrp);
        } else if (G.easterTheme) {
            buildBunny(goblinGrp);
        } else if (G.christmasTheme) {
            buildGingerbreadMan(goblinGrp);
        } else if (G.crystalTheme) {
            buildCaveCrawler(goblinGrp);
        } else if (G.rapunzelTheme) {
            buildLittlePrincess(goblinGrp);
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
        const finGeometry = getGeometry('cone', 0.5, 2.5, 3);
        const finMaterial = getMaterial('lambert', { color: 0x2a3a4a });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.y = 1.0;
        fin.castShadow = true;
        group.add(fin);

        // Small dorsal detail
        const detailGeometry = getGeometry('cone', 0.15, 0.5, 3);
        const detail = new THREE.Mesh(detailGeometry, finMaterial);
        detail.position.set(0, 0.3, -0.4);
        group.add(detail);
    }
    
    function buildDevil(group) {
        // DEVIL - red demonic creature for lava level
        const devilRed = 0xCC2222;
        const darkRed = 0x880000;

        // Devil body
        const bodyGeometry = getGeometry('box', 0.6, 0.9, 0.4);
        const bodyMaterial = getMaterial('lambert', { color: devilRed });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.85;
        body.castShadow = true;
        group.add(body);

        // Devil head
        const headGeometry = getGeometry('sphere', 0.4, 16, 16);
        const headMaterial = getMaterial('lambert', { color: devilRed });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.55;
        head.castShadow = true;
        group.add(head);

        // Devil horns
        const hornGeometry = getGeometry('cone', 0.08, 0.5, 8);
        const hornMaterial = getMaterial('lambert', { color: 0x222222 });
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
        const eyeGeometry = getGeometry('sphere', 0.1, 12, 12);
        const eyeMaterial = getMaterial('basic', {
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
        const mouthGeometry = getGeometry('box', 0.25, 0.06, 0.1);
        const mouthMaterial = getMaterial('basic', { color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.4, 0.38);
        group.add(mouth);

        // Pointed ears
        const earGeometry = getGeometry('cone', 0.1, 0.35, 4);
        const earMaterial = getMaterial('lambert', { color: darkRed });
        const ear1 = new THREE.Mesh(earGeometry, earMaterial);
        ear1.rotation.z = Math.PI / 2;
        ear1.position.set(-0.5, 1.5, 0);
        group.add(ear1);

        const ear2 = new THREE.Mesh(earGeometry, earMaterial);
        ear2.rotation.z = -Math.PI / 2;
        ear2.position.set(0.5, 1.5, 0);
        group.add(ear2);

        // Devil tail
        const tailGeometry = getGeometry('cylinder', 0.05, 0.03, 0.8, 6);
        const tailMaterial = getMaterial('lambert', { color: devilRed });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.5, -0.4);
        tail.rotation.x = 0.5;
        group.add(tail);

        // Tail tip (arrow shape)
        const tipGeometry = getGeometry('cone', 0.1, 0.2, 4);
        const tipMaterial = getMaterial('lambert', { color: darkRed });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.set(0, 0.15, -0.7);
        tip.rotation.x = Math.PI / 2 + 0.3;
        group.add(tip);

        // Small pitchfork
        const staffGeometry = getGeometry('cylinder', 0.03, 0.03, 1.2, 6);
        const staffMaterial = getMaterial('lambert', { color: 0x333333 });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.4, 0.9, 0.1);
        staff.rotation.z = 0.2;
        group.add(staff);

        // Pitchfork prongs
        const prongGeometry = getGeometry('cone', 0.03, 0.2, 4);
        const prongMaterial = getMaterial('lambert', { color: 0x333333 });
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
        const bodyMaterial = getMaterial('phong', {
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
        const headGeometry = getGeometry('sphere', 0.35, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.4;
        head.castShadow = true;
        group.add(head);

        // Round ears
        const earGeometry = getGeometry('sphere', 0.12, 12, 12);
        const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
        ear1.position.set(-0.25, 1.65, 0);
        group.add(ear1);

        const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
        ear2.position.set(0.25, 1.65, 0);
        group.add(ear2);

        // Cute eyes
        const eyeGeometry = getGeometry('sphere', 0.06, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: 0x000000 });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.12, 1.45, 0.3);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.12, 1.45, 0.3);
        group.add(eye2);

        // Little smile
        const smileGeometry = getGeometry('torus', 0.08, 0.02, 8, 16, Math.PI);
        const smileMaterial = getMaterial('basic', { color: 0x000000 });
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
        const bodyGeometry = getGeometry('box', 0.6, 0.9, 0.4);
        const bodyMaterial = getMaterial('lambert', { color: zombieGreen });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.rotation.x = 0.2; // Hunched forward
        body.castShadow = true;
        group.add(body);

        // Zombie head - slightly lopsided
        const headGeometry = getGeometry('sphere', 0.38, 16, 16);
        const headMaterial = getMaterial('lambert', { color: zombieGreen });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0.05, 1.45, 0.1);
        head.rotation.z = 0.15; // Tilted head
        head.castShadow = true;
        group.add(head);

        // Sunken glowing eyes
        const eyeGeometry = getGeometry('sphere', 0.08, 12, 12);
        const eyeMaterial = getMaterial('basic', {
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
        const mouthGeometry = getGeometry('box', 0.2, 0.15, 0.1);
        const mouthMaterial = getMaterial('basic', { color: 0x1a1010 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0.02, 1.32, 0.35);
        group.add(mouth);

        // Exposed bones/ribs
        const ribMaterial = getMaterial('lambert', { color: 0xd0c8b0 });
        for (let i = 0; i < 3; i++) {
            const ribGeometry = getGeometry('cylinder', 0.03, 0.03, 0.25, 6);
            const rib = new THREE.Mesh(ribGeometry, ribMaterial);
            rib.position.set(0, 0.6 + i * 0.12, 0.22);
            rib.rotation.z = Math.PI / 2;
            group.add(rib);
        }

        // Tattered arms
        const armGeometry = getGeometry('cylinder', 0.08, 0.06, 0.6, 6);
        const armMaterial = getMaterial('lambert', { color: rotColor });
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
        const legGeometry = getGeometry('cylinder', 0.1, 0.08, 0.5, 6);
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
        const bodyGeometry = getGeometry('box', 0.65, 0.85, 0.45);
        const bodyMaterial = getMaterial('lambert', { color: armorColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.85;
        body.castShadow = true;
        group.add(body);

        // Chest plate detail
        const chestPlateGeometry = getGeometry('box', 0.5, 0.6, 0.1);
        const chestPlateMaterial = getMaterial('lambert', { color: 0x5a5a6a });
        const chestPlate = new THREE.Mesh(chestPlateGeometry, chestPlateMaterial);
        chestPlate.position.set(0, 0.9, 0.25);
        group.add(chestPlate);

        // Knight helmet
        const helmetGeometry = getGeometry('sphere', 0.38, 16, 16);
        const helmetMaterial = getMaterial('lambert', { color: armorColor });
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 1.55;
        helmet.castShadow = true;
        group.add(helmet);

        // Helmet visor
        const visorGeometry = getGeometry('box', 0.3, 0.15, 0.15);
        const visorMaterial = getMaterial('basic', { color: 0x1a1a2a });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 1.5, 0.32);
        group.add(visor);

        // Eye slits (glowing)
        const eyeSlitGeometry = getGeometry('box', 0.08, 0.04, 0.05);
        const eyeSlitMaterial = getMaterial('basic', {
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
        const plumeGeometry = getGeometry('cone', 0.12, 0.5, 8);
        const plumeMaterial = getMaterial('lambert', { color: plumageColor });
        const plume = new THREE.Mesh(plumeGeometry, plumeMaterial);
        plume.position.set(0, 1.95, -0.1);
        plume.rotation.x = 0.3;
        group.add(plume);

        // Armored arms
        const armGeometry = getGeometry('cylinder', 0.1, 0.08, 0.55, 8);
        const armMaterial = getMaterial('lambert', { color: chainmailColor });
        const arm1 = new THREE.Mesh(armGeometry, armMaterial);
        arm1.position.set(-0.45, 0.7, 0);
        arm1.rotation.z = 0.3;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(0.45, 0.7, 0);
        arm2.rotation.z = -0.3;
        group.add(arm2);

        // Gauntlets
        const gauntletGeometry = getGeometry('box', 0.12, 0.15, 0.12);
        const gauntletMaterial = getMaterial('lambert', { color: armorColor });
        const gauntlet1 = new THREE.Mesh(gauntletGeometry, gauntletMaterial);
        gauntlet1.position.set(-0.55, 0.4, 0);
        group.add(gauntlet1);

        const gauntlet2 = new THREE.Mesh(gauntletGeometry, gauntletMaterial);
        gauntlet2.position.set(0.55, 0.4, 0);
        group.add(gauntlet2);

        // Shield (left hand)
        const shieldGeometry = getGeometry('box', 0.4, 0.5, 0.08);
        const shieldMaterial = getMaterial('lambert', { color: 0x4a3a2a });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.set(-0.7, 0.6, 0.2);
        shield.rotation.y = 0.3;
        group.add(shield);

        // Shield emblem
        const emblemGeometry = getGeometry('circle', 0.1, 8);
        const emblemMaterial = getMaterial('lambert', { color: 0xFFD700 });
        const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
        emblem.position.set(-0.68, 0.6, 0.26);
        emblem.rotation.y = 0.3;
        group.add(emblem);

        // Sword (right hand)
        const swordHandleGeometry = getGeometry('cylinder', 0.03, 0.03, 0.2, 6);
        const swordHandleMaterial = getMaterial('lambert', { color: 0x3a2a1a });
        const swordHandle = new THREE.Mesh(swordHandleGeometry, swordHandleMaterial);
        swordHandle.position.set(0.6, 0.5, 0.15);
        swordHandle.rotation.z = -0.3;
        group.add(swordHandle);

        const swordBladeGeometry = getGeometry('box', 0.06, 0.6, 0.02);
        const swordBladeMaterial = getMaterial('lambert', { color: 0x9a9aaa });
        const swordBlade = new THREE.Mesh(swordBladeGeometry, swordBladeMaterial);
        swordBlade.position.set(0.7, 0.9, 0.15);
        swordBlade.rotation.z = -0.3;
        group.add(swordBlade);

        // Armored legs
        const legGeometry = getGeometry('cylinder', 0.1, 0.12, 0.5, 8);
        const legMaterial = getMaterial('lambert', { color: chainmailColor });
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
        const bodyGeometry = getGeometry('box', 0.8, 0.6, 0.4);
        const bodyMaterial = getMaterial('basic', { 
            color: bugColor, 
            transparent: true, 
            opacity: 0.8 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.7;
        body.castShadow = true;
        group.add(body);

        // Pixel head
        const headGeometry = getGeometry('box', 0.5, 0.5, 0.4);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.3;
        head.castShadow = true;
        group.add(head);

        // Red error eyes
        const eyeMaterial = getMaterial('basic', { color: 0xFF0000 });
        const eyeGeometry = getGeometry('box', 0.12, 0.12, 0.1);
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.35, 0.22);
            group.add(eye);
        });

        // Antenna (error flags)
        const antennaGeometry = getGeometry('cylinder', 0.02, 0.02, 0.4, 4);
        const antennaMaterial = getMaterial('basic', { color: 0xFF0000 });
        [-0.15, 0.15].forEach(x => {
            const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            antenna.position.set(x, 1.7, 0);
            antenna.castShadow = true;
            group.add(antenna);
        });

        // Glitch particles around
        for (let i = 0; i < 6; i++) {
            const glitchGeometry = getGeometry('box', 0.1, 0.1, 0.1);
            const glitchMaterial = getMaterial('basic', { 
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
    
    function buildPixie(group) {
        // PIXIE - tiny fairy creature for enchanted theme
        const skinColor = 0xFFE4E1;  // Misty rose
        const wingColor = 0x98FB98;  // Pale green
        const hairColor = 0xFF69B4;  // Hot pink

        // Tiny body
        const bodyGeometry = getGeometry('cylinder', 0.15, 0.15, 0.3, 8);
        const bodyMaterial = getMaterial('lambert', { color: skinColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = getGeometry('sphere', 0.18, 12, 12);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.65;
        head.castShadow = true;
        group.add(head);

        // Spiky hair
        for (let i = 0; i < 6; i++) {
            const hairGeometry = getGeometry('cone', 0.05, 0.2, 4);
            const hairMaterial = getMaterial('lambert', { color: hairColor });
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            const angle = (i / 6) * Math.PI * 2;
            hair.position.set(Math.cos(angle) * 0.1, 1.85, Math.sin(angle) * 0.1);
            hair.rotation.z = Math.cos(angle) * 0.4;
            hair.rotation.x = Math.sin(angle) * 0.4;
            group.add(hair);
        }

        // Big eyes
        const eyeGeometry = getGeometry('sphere', 0.05, 8, 8);
        const eyeMaterial = getMaterial('basic', { color: 0x9932CC });
        [-0.07, 0.07].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.68, 0.15);
            group.add(eye);
        });

        // Delicate wings (4 wings) - store references for animation
        const wingGeometry = getGeometry('plane', 0.4, 0.6);
        const wingMaterial = getMaterial('basic', { 
            color: wingColor, 
            transparent: true, 
            opacity: 0.5, 
            side: THREE.DoubleSide 
        });
        group.wings = [];
        [[-0.25, 0.3], [0.25, -0.3], [-0.2, 0.5], [0.2, -0.5]].forEach(([x, rotY], i) => {
            const wing = new THREE.Mesh(wingGeometry, wingMaterial);
            wing.position.set(x, 1.3, -0.1);
            wing.rotation.y = rotY;
            wing.userData.baseRotY = rotY;
            wing.userData.isLeftWing = x < 0;
            wing.scale.set(i < 2 ? 1 : 0.7, i < 2 ? 1 : 0.7, 1);
            group.add(wing);
            group.wings.push(wing);
        });

        // Sparkle particles - store for animation
        group.sparkles = [];
        for (let i = 0; i < 6; i++) {
            const sparkleGeometry = getGeometry('sphere', 0.03, 6, 6);
            const sparkleMaterial = getMaterial('basic', { color: [0xFFD700, 0xFFFFFF, 0xFF69B4][i % 3] });
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
            sparkle.position.set(
                (Math.random() - 0.5) * 0.8,
                1.0 + Math.random() * 0.8,
                (Math.random() - 0.5) * 0.6
            );
            sparkle.userData.baseY = sparkle.position.y;
            sparkle.userData.floatOffset = Math.random() * Math.PI * 2;
            group.add(sparkle);
            group.sparkles.push(sparkle);
        }
        
        // Mark as pixie for animation
        group.userData.isPixie = true;
    }
    
    function buildBunny(group) {
        // BUNNY - cute white rabbit for Easter theme
        const furColor = 0xFFFFFF;      // White
        const innerEarColor = 0xFFB6C1; // Light pink
        const noseColor = 0xFF69B4;     // Pink
        const eyeColor = 0x000000;      // Black

        // Body
        const bodyGeometry = getGeometry('sphere', 0.5, 16, 16);
        const bodyMaterial = getMaterial('lambert', { color: furColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.scale.y = 0.8;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = getGeometry('sphere', 0.4, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.3;
        head.castShadow = true;
        group.add(head);

        // Ears
        const earGeometry = getGeometry('cylinder', 0.08, 0.12, 0.6, 8);
        const innerEarMaterial = getMaterial('lambert', { color: innerEarColor });
        [-0.15, 0.15].forEach((x, i) => {
            const ear = new THREE.Mesh(earGeometry, bodyMaterial);
            ear.position.set(x, 1.8, 0);
            ear.rotation.z = i === 0 ? 0.2 : -0.2;
            ear.castShadow = true;
            group.add(ear);
            // Inner ear
            const innerEarGeometry = getGeometry('cylinder', 0.04, 0.08, 0.4, 8);
            const innerEar = new THREE.Mesh(innerEarGeometry, innerEarMaterial);
            innerEar.position.set(x, 1.8, 0.05);
            innerEar.rotation.z = i === 0 ? 0.2 : -0.2;
            group.add(innerEar);
        });

        // Eyes
        const eyeGeometry = getGeometry('sphere', 0.08, 8, 8);
        const eyeMaterial = getMaterial('basic', { color: eyeColor });
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.35, 0.35);
            group.add(eye);
        });

        // Nose
        const noseGeometry = getGeometry('sphere', 0.06, 8, 8);
        const noseMaterial = getMaterial('lambert', { color: noseColor });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.25, 0.4);
        group.add(nose);

        // Tail (fluffy ball)
        const tailGeometry = getGeometry('sphere', 0.15, 8, 8);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 0.5, -0.5);
        group.add(tail);

        // Feet
        const footGeometry = getGeometry('sphere', 0.15, 8, 8);
        [-0.2, 0.2].forEach(x => {
            const foot = new THREE.Mesh(footGeometry, bodyMaterial);
            foot.position.set(x, 0.15, 0.2);
            foot.scale.set(1, 0.5, 1.4);
            group.add(foot);
        });

        group.userData.isBunny = true;
    }
    
    function buildElf(group) {
        // Evil Elf for Christmas theme
        const elfGreen = 0x228b22;      // Forest green
        const elfRed = 0xdc143c;        // Crimson red
        const skinColor = 0xffdab9;     // Peach
        const hatRed = 0xb22222;        // Firebrick
        const eyeColor = 0xff0000;      // Red glowing eyes

        // Body with green tunic
        const bodyGeometry = getGeometry('box', 0.6, 0.8, 0.4);
        const bodyMaterial = getMaterial('lambert', { color: elfGreen });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        group.add(body);

        // Red belt
        const beltGeometry = getGeometry('box', 0.62, 0.15, 0.42);
        const beltMaterial = getMaterial('lambert', { color: elfRed });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.7;
        group.add(belt);

        // Belt buckle
        const buckleGeometry = getGeometry('box', 0.15, 0.12, 0.05);
        const buckleMaterial = getMaterial('lambert', { color: 0xffd700 });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 0.7, 0.25);
        group.add(buckle);

        // Head
        const headGeometry = getGeometry('sphere', 0.35, 16, 16);
        const headMaterial = getMaterial('lambert', { color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.45;
        head.castShadow = true;
        group.add(head);

        // Pointed ears
        const earGeometry = getGeometry('cone', 0.12, 0.35, 8);
        const earMaterial = getMaterial('lambert', { color: skinColor });
        [-0.45, 0.45].forEach((x, i) => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.rotation.z = i === 0 ? Math.PI / 2 : -Math.PI / 2;
            ear.position.set(x, 1.5, 0);
            ear.castShadow = true;
            group.add(ear);
        });

        // Evil red glowing eyes
        const eyeMaterial = getMaterial('basic', { color: eyeColor });
        const eyeGeometry = getGeometry('sphere', 0.08, 12, 12);
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.45, 0.32);
            group.add(eye);
        });

        // Pointy red hat
        const hatGeometry = getGeometry('cone', 0.35, 0.6, 16);
        const hatMaterial = getMaterial('lambert', { color: hatRed });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 2.0;
        hat.castShadow = true;
        group.add(hat);

        // White pom-pom on hat
        const pomGeometry = getGeometry('sphere', 0.1, 8, 8);
        const pomMaterial = getMaterial('lambert', { color: 0xffffff });
        const pom = new THREE.Mesh(pomGeometry, pomMaterial);
        pom.position.y = 2.3;
        group.add(pom);

        // Arms
        const armGeometry = getGeometry('cylinder', 0.1, 0.12, 0.6, 8);
        const armMaterial = getMaterial('lambert', { color: elfGreen });
        [-0.45, 0.45].forEach(x => {
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.set(x, 0.8, 0);
            arm.rotation.z = x < 0 ? 0.3 : -0.3;
            group.add(arm);
        });

        // Legs
        const legGeometry = getGeometry('cylinder', 0.12, 0.1, 0.5, 8);
        const legMaterial = getMaterial('lambert', { color: elfRed });
        [-0.2, 0.2].forEach(x => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, 0.25, 0);
            group.add(leg);
        });

        // Curled toe shoes
        const shoeGeometry = getGeometry('sphere', 0.15, 8, 8);
        const shoeMaterial = getMaterial('lambert', { color: elfGreen });
        [-0.2, 0.2].forEach(x => {
            const shoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
            shoe.position.set(x, 0.05, 0.15);
            shoe.scale.set(1, 0.6, 1.5);
            group.add(shoe);
        });
    }
    
    function buildGingerbreadMan(group) {
        // Smaller gingerbread man for goblin-type enemy
        const cookieColor = 0xB5651D;
        const icingWhite = 0xFFFFFF;
        const icingPink = 0xFF69B4;

        // Gingerbread body - flat and cookie-shaped
        const bodyGeometry = getGeometry('cylinder', 0.4, 0.4, 0.2, 16);
        const bodyMaterial = getMaterial('lambert', { color: cookieColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        body.position.y = 0.9;
        body.castShadow = true;
        group.add(body);

        // Gingerbread head
        const headGeometry = getGeometry('cylinder', 0.3, 0.3, 0.18, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.rotation.x = Math.PI / 2;
        head.position.y = 1.4;
        head.castShadow = true;
        group.add(head);

        // Icing button details on body
        const buttonGeometry = getGeometry('cylinder', 0.05, 0.05, 0.04, 12);
        const icingMaterial = getMaterial('basic', { color: icingWhite });
        for (let i = 0; i < 2; i++) {
            const button = new THREE.Mesh(buttonGeometry, icingMaterial);
            button.rotation.x = Math.PI / 2;
            button.position.set(0, 0.75 + i * 0.2, 0.12);
            group.add(button);
        }

        // Icing smile
        const smileGeometry = getGeometry('torus', 0.1, 0.02, 8, 16, Math.PI);
        const smileMaterial = getMaterial('basic', { color: icingPink });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.32, 0.1);
        smile.rotation.x = -0.2;
        group.add(smile);

        // Candy eyes
        const eyeGeometry = getGeometry('sphere', 0.05, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: 0x000000 });
        [-0.1, 0.1].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.45, 0.15);
            group.add(eye);
        });

        // Arms - cookie style
        const armGeometry = getGeometry('cylinder', 0.08, 0.1, 0.5, 8);
        const arm1 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm1.position.set(-0.45, 0.95, 0);
        arm1.rotation.z = 0.8;
        arm1.castShadow = true;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm2.position.set(0.45, 0.95, 0);
        arm2.rotation.z = -0.8;
        arm2.castShadow = true;
        group.add(arm2);

        // Legs - cookie style
        const legGeometry = getGeometry('cylinder', 0.1, 0.12, 0.6, 8);
        const leg1 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg1.position.set(-0.18, 0.3, 0);
        leg1.castShadow = true;
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg2.position.set(0.18, 0.3, 0);
        leg2.castShadow = true;
        group.add(leg2);
    }
    
    function buildCaveCrawler(group) {
        // Cave Crawler - bioluminescent cave dweller variant
        const biolumGreen = 0x44ffaa;
        const crystalPurple = 0xaa44ff;
        const crystalBlue = 0x44aaff;
        const darkCave = 0x2a2a4a;
        const glowWhite = 0xccffee;
        
        // Body (dark cave dweller outfit)
        const bodyGeometry = getGeometry('box', 0.6, 0.8, 0.4);
        const bodyMaterial = getMaterial('lambert', { color: darkCave });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Crystal shard belt
        const beltGeometry = getGeometry('box', 0.65, 0.12, 0.42);
        const beltMaterial = getMaterial('lambert', { color: crystalPurple });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.7;
        group.add(belt);
        
        // Small crystal on belt
        const beltCrystalGeometry = getGeometry('octahedron', 0.1, 0);
        const beltCrystalMaterial = getMaterial('lambert', { color: crystalBlue, emissive: crystalBlue, emissiveIntensity: 0.3 });
        const beltCrystal = new THREE.Mesh(beltCrystalGeometry, beltCrystalMaterial);
        beltCrystal.position.set(0, 0.7, 0.23);
        beltCrystal.rotation.y = Math.PI / 4;
        group.add(beltCrystal);
        
        // Head (bioluminescent green skin)
        const headGeometry = getGeometry('sphere', 0.4, 16, 16);
        const headMaterial = getMaterial('lambert', { color: biolumGreen, emissive: biolumGreen, emissiveIntensity: 0.15 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        group.add(head);
        
        // Glowing eyes
        const eyeMaterial = getMaterial('basic', { color: glowWhite });
        const eyeGeometry = getGeometry('sphere', 0.1, 16, 16);
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.5, 0.35);
            group.add(eye);
        });
        
        // Bioluminescent spots on face
        const spotMaterial = getMaterial('basic', { color: glowWhite });
        const spotGeometry = getGeometry('sphere', 0.04, 8, 8);
        [[-0.25, 1.6, 0.25], [0.25, 1.6, 0.25]].forEach(pos => {
            const spot = new THREE.Mesh(spotGeometry, spotMaterial);
            spot.position.set(pos[0], pos[1], pos[2]);
            group.add(spot);
        });
        
        // Pointed cave goblin ears
        const earGeometry = getGeometry('cone', 0.15, 0.4, 4);
        const earMaterial = getMaterial('lambert', { color: biolumGreen, emissive: biolumGreen, emissiveIntensity: 0.15 });
        [-0.5, 0.5].forEach((x, i) => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.rotation.z = i === 0 ? Math.PI / 2 : -Math.PI / 2;
            ear.position.set(x, 1.5, 0);
            group.add(ear);
        });
        
        // Crystal growths on head
        const headCrystalGeometry = getGeometry('cone', 0.08, 0.35, 5);
        const headCrystalMaterial = getMaterial('lambert', { color: crystalPurple, emissive: crystalPurple, emissiveIntensity: 0.4 });
        const headCrystal1 = new THREE.Mesh(headCrystalGeometry, headCrystalMaterial);
        headCrystal1.position.set(-0.15, 1.95, 0);
        headCrystal1.rotation.z = 0.3;
        group.add(headCrystal1);
        
        const headCrystal2 = new THREE.Mesh(headCrystalGeometry, headCrystalMaterial);
        headCrystal2.position.set(0.1, 2.0, 0.05);
        headCrystal2.rotation.z = -0.2;
        group.add(headCrystal2);
    }
    
    function buildStandardGoblin(group, textures) {
        const bodyGeometry = getGeometry('box', 0.6, 0.8, 0.4);
        const bodyMaterial = getTexturedMaterial('lambert', { map: textures.goblinArmor }, 'goblinArmor');
        const goblinBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        goblinBody.position.y = 0.8;
        goblinBody.castShadow = true;
        group.add(goblinBody);
    
        const headGeometry = getGeometry('sphere', 0.4, 16, 16);
        const headMaterial = getTexturedMaterial('lambert', { map: textures.goblinSkin }, 'goblinSkin');
        const goblinHead = new THREE.Mesh(headGeometry, headMaterial);
        goblinHead.position.y = 1.5;
        goblinHead.castShadow = true;
        group.add(goblinHead);
        
        const eyeGeometry = getGeometry('sphere', 0.1, 16, 16);
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
        
        const earGeometry = getGeometry('cone', 0.15, 0.4, 4);
        const earMaterial = getTexturedMaterial('lambert', { map: textures.goblinSkin }, 'goblinSkin');
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
    
    function buildLittlePrincess(group) {
        // LITTLE PRINCESS - small princess with crown for Rapunzel theme
        const dressColor = 0xFFB6C1;        // Light pink dress
        const skinColor = 0xFFDFC4;         // Peachy skin
        const crownGold = 0xFFD700;         // Gold crown
        const hairColor = 0xFFE4B5;         // Blonde hair
        const shoeColor = 0xFF69B4;         // Hot pink shoes
        
        // Pink dress body
        const bodyGeometry = getGeometry('cone', 0.4, 0.8, 8);
        const bodyMaterial = getMaterial('lambert', { color: dressColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        group.add(body);
        
        // Dress details - white lace trim
        const laceGeometry = getGeometry('torus', 0.4, 0.04, 8, 16);
        const laceMaterial = getMaterial('lambert', { color: 0xFFFFFF });
        const lace = new THREE.Mesh(laceGeometry, laceMaterial);
        lace.position.y = 0.2;
        lace.rotation.x = Math.PI / 2;
        group.add(lace);
        
        // Head
        const headGeometry = getGeometry('sphere', 0.35, 16, 16);
        const headMaterial = getMaterial('lambert', { color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.35;
        head.castShadow = true;
        group.add(head);
        
        // Blonde hair buns
        const bunGeometry = getGeometry('sphere', 0.15, 12, 12);
        const hairMaterial = getMaterial('lambert', { color: hairColor });
        [-0.25, 0.25].forEach(x => {
            const bun = new THREE.Mesh(bunGeometry, hairMaterial);
            bun.position.set(x, 1.55, -0.1);
            group.add(bun);
        });
        
        // Hair back
        const hairBackGeometry = getGeometry('sphere', 0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairBack = new THREE.Mesh(hairBackGeometry, hairMaterial);
        hairBack.position.set(0, 1.35, -0.1);
        hairBack.rotation.x = Math.PI;
        group.add(hairBack);
        
        // Little Crown
        const crownBaseGeometry = getGeometry('cylinder', 0.15, 0.18, 0.1, 8);
        const crownMaterial = getMaterial('lambert', { 
            color: crownGold,
            emissive: crownGold,
            emissiveIntensity: 0.3
        });
        const crownBase = new THREE.Mesh(crownBaseGeometry, crownMaterial);
        crownBase.position.y = 1.75;
        group.add(crownBase);
        
        // Crown points
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const pointGeometry = getGeometry('cone', 0.03, 0.12, 4);
            const point = new THREE.Mesh(pointGeometry, crownMaterial);
            point.position.set(
                Math.cos(angle) * 0.12,
                1.85,
                Math.sin(angle) * 0.12
            );
            group.add(point);
        }
        
        // Cute eyes
        const eyeMaterial = getMaterial('basic', { color: 0x4169E1 });
        const eyeGeometry = getGeometry('sphere', 0.08, 12, 12);
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.4, 0.3);
            group.add(eye);
        });
        
        // Angry eyebrows (she's evil!)
        const browGeometry = getGeometry('box', 0.12, 0.02, 0.02);
        const browMaterial = getMaterial('lambert', { color: hairColor });
        [-0.12, 0.12].forEach((x, i) => {
            const brow = new THREE.Mesh(browGeometry, browMaterial);
            brow.position.set(x, 1.52, 0.32);
            brow.rotation.z = i === 0 ? -0.3 : 0.3;
            group.add(brow);
        });
        
        // Small mouth
        const mouthGeometry = getGeometry('sphere', 0.04, 8, 8);
        const mouthMaterial = getMaterial('lambert', { color: 0xFF6B6B });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.28, 0.32);
        mouth.scale.set(1.5, 0.5, 1);
        group.add(mouth);
        
        // Little arms
        const armGeometry = getGeometry('cylinder', 0.06, 0.06, 0.4, 6);
        const armMaterial = getMaterial('lambert', { color: skinColor });
        [-0.35, 0.35].forEach((x, i) => {
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.set(x, 0.9, 0);
            arm.rotation.z = i === 0 ? 0.5 : -0.5;
            arm.castShadow = true;
            group.add(arm);
        });
        
        // Pink shoes
        const shoeGeometry = getGeometry('box', 0.12, 0.08, 0.2);
        const shoeMaterial = getMaterial('lambert', { color: shoeColor });
        [-0.15, 0.15].forEach(x => {
            const shoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
            shoe.position.set(x, 0.04, 0.05);
            shoe.castShadow = true;
            group.add(shoe);
        });
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
