// entity-guardian.js - Guardian goblin enemy with theme variants
// Theme variants: Octopus (water), Greater Devil (lava), Gingerbread Man (candy), Ghost (graveyard), Spectral Knight (ruins)

(function() {
    'use strict';
    
    /**
     * Create a guardian goblin enemy - stronger ranged enemy that shoots projectiles
     * @param {number} x - X position
     * @param {number} z - Z position  
     * @param {number} patrolLeft - Left patrol boundary
     * @param {number} patrolRight - Right patrol boundary
     * @param {number} speed - Movement speed (default: 0.014)
     * @returns {object} Guardian entity object
     */
    function createGuardianGoblin(x, z, patrolLeft, patrolRight, speed = 0.014) {
        const textures = getTerrainTextures(THREE);
        const goblinGrp = new THREE.Group();

        if (G.waterTheme) {
            buildOctopus(goblinGrp);
        } else if (G.lavaTheme) {
            buildGreaterDevil(goblinGrp);
        } else if (G.candyTheme) {
            buildGingerbreadMan(goblinGrp);
        } else if (G.graveyardTheme) {
            buildGhost(goblinGrp);
        } else if (G.ruinsTheme) {
            buildSpectralKnight(goblinGrp);
        } else if (G.computerTheme) {
            buildFirewallSentry(goblinGrp);
        } else if (G.enchantedTheme) {
            buildDarkFairy(goblinGrp);
        } else if (G.easterTheme) {
            buildEggWarrior(goblinGrp);
        } else if (G.christmasTheme) {
            buildNutcracker(goblinGrp);
        } else if (G.crystalTheme) {
            buildCrystalSentinel(goblinGrp);
        } else if (G.rapunzelTheme) {
            buildRapunzelWitch(goblinGrp);
        } else {
            buildStandardGuardian(goblinGrp, textures);
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
    
    // ========================================
    // THEME-SPECIFIC BUILDERS
    // ========================================
    
    function buildOctopus(group) {
        // Octopus body
        const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        bodyGeometry.scale(1, 1.2, 1);
        const bodyMaterial = getMaterial('lambert', { color: 0x8B008B });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        // Eyes
        const eyeGeometry = getGeometry('sphere', 0.15, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: 0xFFFFFF });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.3, 1.4, 0.6);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.3, 1.4, 0.6);
        group.add(eye2);

        const pupilGeometry = getGeometry('sphere', 0.08, 8, 8);
        const pupilMaterial = getMaterial('basic', { color: 0x000000 });
        const pupil1 = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil1.position.set(-0.3, 1.4, 0.68);
        group.add(pupil1);

        const pupil2 = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil2.position.set(0.3, 1.4, 0.68);
        group.add(pupil2);

        // 8 Tentacles in a circle
        const tentacleGeometry = getGeometry('cylinder', 0.12, 0.06, 1.5, 6);
        const tentacleMaterial = getMaterial('lambert', { color: 0x9932CC });
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
            group.add(tentacle);

            // Store tentacle for animation
            if (!group.tentacles) group.tentacles = [];
            group.tentacles.push({ mesh: tentacle, angle, baseZ: tentacle.rotation.z, baseX: tentacle.rotation.x });
        }
    }
    
    function buildGreaterDevil(group) {
        const devilRed = 0xAA1111;
        const darkRed = 0x660000;
        const fireOrange = 0xFF4400;

        // Muscular devil body
        const bodyGeometry = getGeometry('cylinder', 0.5, 0.6, 1.3, 8);
        const bodyMaterial = getMaterial('lambert', { color: devilRed });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.1;
        body.castShadow = true;
        group.add(body);

        // Devil head - slightly larger
        const headGeometry = getGeometry('sphere', 0.5, 16, 16);
        const headMaterial = getMaterial('lambert', { color: devilRed });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);

        // Large curved horns
        const hornGeometry = getGeometry('cone', 0.12, 0.8, 8);
        const hornMaterial = getMaterial('lambert', { color: 0x111111 });
        const horn1 = new THREE.Mesh(hornGeometry, hornMaterial);
        horn1.position.set(-0.35, 2.4, 0);
        horn1.rotation.z = 0.5;
        horn1.rotation.x = -0.2;
        horn1.castShadow = true;
        group.add(horn1);

        const horn2 = new THREE.Mesh(hornGeometry, hornMaterial);
        horn2.position.set(0.35, 2.4, 0);
        horn2.rotation.z = -0.5;
        horn2.rotation.x = -0.2;
        horn2.castShadow = true;
        group.add(horn2);

        // Fiery glowing eyes
        const eyeGeometry = getGeometry('sphere', 0.12, 12, 12);
        const eyeMaterial = getMaterial('basic', {
            color: fireOrange,
            transparent: true,
            opacity: 1.0
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.18, 2.0, 0.42);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.18, 2.0, 0.42);
        group.add(eye2);

        // Demonic grin with fangs
        const mouthGeometry = getGeometry('box', 0.3, 0.08, 0.1);
        const mouthMaterial = getMaterial('basic', { color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.82, 0.45);
        group.add(mouth);

        // Fangs
        const fangGeometry = getGeometry('cone', 0.03, 0.12, 4);
        const fangMaterial = getMaterial('basic', { color: 0xFFFFFF });
        const fang1 = new THREE.Mesh(fangGeometry, fangMaterial);
        fang1.position.set(-0.08, 1.76, 0.45);
        fang1.rotation.x = Math.PI;
        group.add(fang1);

        const fang2 = new THREE.Mesh(fangGeometry, fangMaterial);
        fang2.position.set(0.08, 1.76, 0.45);
        fang2.rotation.x = Math.PI;
        group.add(fang2);

        // Pointed ears
        const earGeometry = getGeometry('cone', 0.12, 0.4, 4);
        const earMaterial = getMaterial('lambert', { color: darkRed });
        const ear1 = new THREE.Mesh(earGeometry, earMaterial);
        ear1.rotation.z = Math.PI / 2;
        ear1.position.set(-0.6, 2.0, 0);
        group.add(ear1);

        const ear2 = new THREE.Mesh(earGeometry, earMaterial);
        ear2.rotation.z = -Math.PI / 2;
        ear2.position.set(0.6, 2.0, 0);
        group.add(ear2);

        // Bat-like wings
        const wingGeometry = getGeometry('plane', 1.2, 0.8);
        const wingMaterial = getMaterial('lambert', {
            color: darkRed,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing1.position.set(-0.8, 1.5, -0.2);
        wing1.rotation.y = 0.8;
        wing1.rotation.z = 0.3;
        group.add(wing1);

        const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing2.position.set(0.8, 1.5, -0.2);
        wing2.rotation.y = -0.8;
        wing2.rotation.z = -0.3;
        group.add(wing2);

        // Devil tail
        const tailGeometry = getGeometry('cylinder', 0.06, 0.04, 1.0, 6);
        const tailMaterial = getMaterial('lambert', { color: devilRed });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.6, -0.5);
        tail.rotation.x = 0.6;
        group.add(tail);

        // Tail tip
        const tipGeometry = getGeometry('cone', 0.12, 0.25, 4);
        const tipMaterial = getMaterial('lambert', { color: darkRed });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.set(0, 0.2, -0.9);
        tip.rotation.x = Math.PI / 2 + 0.4;
        group.add(tip);

        // Flaming trident
        const tridentStaff = getGeometry('cylinder', 0.04, 0.04, 1.8, 6);
        const tridentMaterial = getMaterial('lambert', { color: 0x222222 });
        const staff = new THREE.Mesh(tridentStaff, tridentMaterial);
        staff.position.set(0.5, 1.2, 0.2);
        staff.rotation.z = 0.15;
        group.add(staff);

        // Trident prongs
        const prongGeometry = getGeometry('cone', 0.05, 0.35, 4);
        for (let i = -1; i <= 1; i++) {
            const prong = new THREE.Mesh(prongGeometry, tridentMaterial);
            prong.position.set(0.5 + i * 0.12, 2.2, 0.2);
            prong.rotation.z = 0.15 + i * 0.15;
            group.add(prong);
        }

        // Fire glow at trident top (emissive mesh instead of PointLight for perf)
        const fireGlowGeometry = getGeometry('sphere', 0.3, 8, 8);
        const fireGlowMaterial = getMaterial('basic', { color: fireOrange, transparent: true, opacity: 0.5 });
        const fireGlow = new THREE.Mesh(fireGlowGeometry, fireGlowMaterial);
        fireGlow.position.set(0.5, 2.3, 0.2);
        group.add(fireGlow);
    }
    
    function buildGingerbreadMan(group) {
        const cookieColor = 0xB5651D;
        const icingWhite = 0xFFFFFF;
        const icingPink = 0xFF69B4;

        // Gingerbread body - flat and cookie-shaped
        const bodyGeometry = getGeometry('cylinder', 0.6, 0.6, 0.3, 16);
        const bodyMaterial = getMaterial('lambert', { color: cookieColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        // Gingerbread head
        const headGeometry = getGeometry('cylinder', 0.45, 0.45, 0.25, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.rotation.x = Math.PI / 2;
        head.position.y = 1.9;
        head.castShadow = true;
        group.add(head);

        // Icing button details on body
        const buttonGeometry = getGeometry('cylinder', 0.08, 0.08, 0.05, 12);
        const icingMaterial = getMaterial('basic', { color: icingWhite });
        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(buttonGeometry, icingMaterial);
            button.rotation.x = Math.PI / 2;
            button.position.set(0, 1.0 + i * 0.25, 0.18);
            group.add(button);
        }

        // Icing smile
        const smileGeometry = getGeometry('torus', 0.15, 0.03, 8, 16, Math.PI);
        const smileMaterial = getMaterial('basic', { color: icingPink });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.78, 0.15);
        smile.rotation.x = -0.2;
        group.add(smile);

        // Candy eyes (gumdrop style)
        const eyeGeometry = getGeometry('sphere', 0.08, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: 0x000000 });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.15, 1.95, 0.2);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.95, 0.2);
        group.add(eye2);

        // Icing eyebrows (angry)
        const browGeometry = getGeometry('box', 0.12, 0.03, 0.02);
        const browMaterial = getMaterial('basic', { color: icingWhite });
        const brow1 = new THREE.Mesh(browGeometry, browMaterial);
        brow1.position.set(-0.15, 2.05, 0.22);
        brow1.rotation.z = 0.3;
        group.add(brow1);

        const brow2 = new THREE.Mesh(browGeometry, browMaterial);
        brow2.position.set(0.15, 2.05, 0.22);
        brow2.rotation.z = -0.3;
        group.add(brow2);

        // Arms - cookie style
        const armGeometry = getGeometry('cylinder', 0.12, 0.15, 0.8, 8);
        const arm1 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm1.position.set(-0.65, 1.3, 0);
        arm1.rotation.z = 0.8;
        arm1.castShadow = true;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm2.position.set(0.65, 1.3, 0);
        arm2.rotation.z = -0.8;
        arm2.castShadow = true;
        group.add(arm2);

        // Icing cuffs on arms
        const cuffGeometry = getGeometry('torus', 0.15, 0.03, 8, 16);
        const cuff1 = new THREE.Mesh(cuffGeometry, icingMaterial);
        cuff1.position.set(-0.85, 1.0, 0);
        cuff1.rotation.y = Math.PI / 2;
        cuff1.rotation.x = 0.8;
        group.add(cuff1);

        const cuff2 = new THREE.Mesh(cuffGeometry, icingMaterial);
        cuff2.position.set(0.85, 1.0, 0);
        cuff2.rotation.y = Math.PI / 2;
        cuff2.rotation.x = -0.8;
        group.add(cuff2);

        // Legs - cookie style
        const legGeometry = getGeometry('cylinder', 0.15, 0.18, 0.9, 8);
        const leg1 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg1.position.set(-0.25, 0.45, 0);
        leg1.castShadow = true;
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg2.position.set(0.25, 0.45, 0);
        leg2.castShadow = true;
        group.add(leg2);

        // Candy cane weapon
        const caneGeometry = getGeometry('cylinder', 0.05, 0.05, 1.5, 8);
        const caneMaterial = getMaterial('lambert', { color: 0xFF0000 });
        const cane = new THREE.Mesh(caneGeometry, caneMaterial);
        cane.position.set(0.9, 1.4, 0.1);
        cane.rotation.z = -0.3;
        group.add(cane);

        // Candy cane hook
        const hookGeometry = getGeometry('torus', 0.15, 0.05, 8, 16, Math.PI);
        const hook = new THREE.Mesh(hookGeometry, caneMaterial);
        hook.position.set(0.75, 2.1, 0.1);
        hook.rotation.x = Math.PI / 2;
        hook.rotation.z = -0.3;
        group.add(hook);
    }
    
    function buildGhost(group) {
        const ghostColor = 0x88aacc;
        const ghostGlow = 0x6688aa;

        // Ghost body - flowing sheet-like form
        const bodyGeometry = getGeometry('cone', 0.8, 2.2, 8);
        const bodyMaterial = getMaterial('phong', {
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
        group.add(body);

        // Ghost head
        const headGeometry = getGeometry('sphere', 0.5, 16, 16);
        const headMaterial = getMaterial('phong', {
            color: ghostColor,
            transparent: true,
            opacity: 0.75,
            emissive: ghostGlow,
            emissiveIntensity: 0.2
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.3;
        group.add(head);

        // Hollow eye sockets with eerie glow
        const eyeSocketGeometry = getGeometry('sphere', 0.15, 12, 12);
        const eyeSocketMaterial = getMaterial('basic', {
            color: 0x000000,
            transparent: true,
            opacity: 0.9
        });
        const socket1 = new THREE.Mesh(eyeSocketGeometry, eyeSocketMaterial);
        socket1.position.set(-0.18, 2.35, 0.4);
        group.add(socket1);

        const socket2 = new THREE.Mesh(eyeSocketGeometry, eyeSocketMaterial);
        socket2.position.set(0.18, 2.35, 0.4);
        group.add(socket2);

        // Glowing pupils
        const pupilGeometry = getGeometry('sphere', 0.06, 8, 8);
        const pupilMaterial = getMaterial('basic', {
            color: 0xFF4400,
            transparent: true,
            opacity: 1.0
        });
        const pupil1 = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil1.position.set(-0.18, 2.35, 0.48);
        group.add(pupil1);

        const pupil2 = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil2.position.set(0.18, 2.35, 0.48);
        group.add(pupil2);

        // Wailing mouth
        const mouthGeometry = getGeometry('ring', 0.08, 0.15, 8);
        const mouthMaterial = getMaterial('basic', {
            color: 0x1a1a2a,
            side: THREE.DoubleSide
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 2.1, 0.48);
        group.add(mouth);

        // Ghostly arms/wisps
        const armGeometry = getGeometry('cylinder', 0.08, 0.15, 1.0, 6);
        const armMaterial = getMaterial('phong', {
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
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(0.6, 1.5, 0.2);
        arm2.rotation.z = -0.7;
        arm2.rotation.x = -0.3;
        group.add(arm2);

        // Ethereal glow (emissive mesh instead of PointLight for perf)
        const ghostGlowGeometry = getGeometry('sphere', 0.6, 8, 8);
        const ghostGlowMaterial = getMaterial('basic', { color: 0x6688ff, transparent: true, opacity: 0.25 });
        const ghostGlowMesh = new THREE.Mesh(ghostGlowGeometry, ghostGlowMaterial);
        ghostGlowMesh.position.set(0, 2.0, 0);
        group.add(ghostGlowMesh);

        // Floating effect handled by game loop
        group.userData.isGhost = true;
        group.userData.floatOffset = Math.random() * Math.PI * 2;
    }
    
    function buildSpectralKnight(group) {
        const ghostArmor = 0x5a6a8a;
        const ghostGlow = 0x4488cc;
        const etherealBlue = 0x6699cc;

        // Spectral armored body
        const bodyGeometry = getGeometry('box', 0.8, 1.1, 0.5);
        const bodyMaterial = getMaterial('phong', {
            color: ghostArmor,
            transparent: true,
            opacity: 0.7,
            emissive: ghostGlow,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        group.add(body);

        // Chest plate detail
        const chestGeometry = getGeometry('box', 0.6, 0.8, 0.15);
        const chestMaterial = getMaterial('phong', {
            color: 0x4a5a7a,
            transparent: true,
            opacity: 0.8,
            emissive: ghostGlow,
            emissiveIntensity: 0.15
        });
        const chestPlate = new THREE.Mesh(chestGeometry, chestMaterial);
        chestPlate.position.set(0, 1.05, 0.28);
        group.add(chestPlate);

        // Ghostly helmet
        const helmetGeometry = getGeometry('sphere', 0.45, 16, 16);
        const helmetMaterial = getMaterial('phong', {
            color: ghostArmor,
            transparent: true,
            opacity: 0.75,
            emissive: ghostGlow,
            emissiveIntensity: 0.2
        });
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 1.9;
        group.add(helmet);

        // Helmet visor (dark slit)
        const visorGeometry = getGeometry('box', 0.35, 0.12, 0.12);
        const visorMaterial = getMaterial('basic', { color: 0x0a0a1a });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 1.85, 0.38);
        group.add(visor);

        // Glowing eyes through visor
        const eyeGeometry = getGeometry('sphere', 0.06, 8, 8);
        const eyeMaterial = getMaterial('basic', {
            color: 0x44AAFF,
            transparent: true,
            opacity: 1.0
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.1, 1.87, 0.42);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.1, 1.87, 0.42);
        group.add(eye2);

        // Helmet crest/plume (ethereal)
        const crestGeometry = getGeometry('cone', 0.15, 0.6, 8);
        const crestMaterial = getMaterial('phong', {
            color: etherealBlue,
            transparent: true,
            opacity: 0.6,
            emissive: ghostGlow,
            emissiveIntensity: 0.3
        });
        const crest = new THREE.Mesh(crestGeometry, crestMaterial);
        crest.position.set(0, 2.4, -0.1);
        crest.rotation.x = 0.3;
        group.add(crest);

        // Ghostly arms
        const armGeometry = getGeometry('cylinder', 0.1, 0.08, 0.7, 8);
        const armMaterial = getMaterial('phong', {
            color: ghostArmor,
            transparent: true,
            opacity: 0.6,
            emissive: ghostGlow,
            emissiveIntensity: 0.15
        });
        const arm1 = new THREE.Mesh(armGeometry, armMaterial);
        arm1.position.set(-0.55, 0.9, 0);
        arm1.rotation.z = 0.3;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(0.55, 0.9, 0);
        arm2.rotation.z = -0.3;
        group.add(arm2);

        // Spectral gauntlets
        const gauntletGeometry = getGeometry('box', 0.15, 0.18, 0.15);
        const gauntlet1 = new THREE.Mesh(gauntletGeometry, bodyMaterial);
        gauntlet1.position.set(-0.65, 0.5, 0);
        group.add(gauntlet1);

        const gauntlet2 = new THREE.Mesh(gauntletGeometry, bodyMaterial);
        gauntlet2.position.set(0.65, 0.5, 0);
        group.add(gauntlet2);

        // Ghostly shield (left hand)
        const shieldGeometry = getGeometry('box', 0.5, 0.6, 0.08);
        const shieldMaterial = getMaterial('phong', {
            color: 0x3a4a6a,
            transparent: true,
            opacity: 0.65,
            emissive: ghostGlow,
            emissiveIntensity: 0.2
        });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.position.set(-0.85, 0.8, 0.25);
        shield.rotation.y = 0.4;
        group.add(shield);

        // Shield emblem (glowing)
        const emblemGeometry = getGeometry('circle', 0.12, 8);
        const emblemMaterial = getMaterial('basic', {
            color: 0x66AAFF,
            transparent: true,
            opacity: 0.8
        });
        const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
        emblem.position.set(-0.82, 0.8, 0.32);
        emblem.rotation.y = 0.4;
        group.add(emblem);

        // Spectral sword (right hand)
        const swordHandleGeometry = getGeometry('cylinder', 0.04, 0.04, 0.25, 6);
        const swordHandleMaterial = getMaterial('lambert', { color: 0x2a2a3a });
        const swordHandle = new THREE.Mesh(swordHandleGeometry, swordHandleMaterial);
        swordHandle.position.set(0.7, 0.6, 0.2);
        swordHandle.rotation.z = -0.3;
        group.add(swordHandle);

        const swordBladeGeometry = getGeometry('box', 0.08, 0.8, 0.03);
        const swordBladeMaterial = getMaterial('phong', {
            color: etherealBlue,
            transparent: true,
            opacity: 0.7,
            emissive: ghostGlow,
            emissiveIntensity: 0.4
        });
        const swordBlade = new THREE.Mesh(swordBladeGeometry, swordBladeMaterial);
        swordBlade.position.set(0.8, 1.1, 0.2);
        swordBlade.rotation.z = -0.3;
        group.add(swordBlade);

        // Ethereal mist at base (fading legs)
        const mistGeometry = getGeometry('cone', 0.6, 1.0, 8);
        const mistMaterial = getMaterial('phong', {
            color: etherealBlue,
            transparent: true,
            opacity: 0.3,
            emissive: ghostGlow,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide
        });
        const mist = new THREE.Mesh(mistGeometry, mistMaterial);
        mist.position.y = 0.2;
        mist.rotation.x = Math.PI;
        group.add(mist);

        // Ethereal glow (emissive mesh instead of PointLight for perf)
        const knightGlowGeometry = getGeometry('sphere', 0.6, 8, 8);
        const knightGlowMaterial = getMaterial('basic', { color: 0x4488ff, transparent: true, opacity: 0.25 });
        const knightGlowMesh = new THREE.Mesh(knightGlowGeometry, knightGlowMaterial);
        knightGlowMesh.position.set(0, 1.5, 0);
        group.add(knightGlowMesh);

        // Floating effect
        group.userData.isGhost = true;
        group.userData.floatOffset = Math.random() * Math.PI * 2;
    }
    
    function buildFirewallSentry(group) {
        // FIREWALL SENTRY - shield-bearing digital guardian (wiki style)
        const neonBlue = 0x00AAFF;
        const darkBlue = 0x001144;

        // Shield body core
        const bodyGeometry = getGeometry('box', 0.9, 1.2, 0.5);
        const bodyMaterial = getMaterial('lambert', { color: darkBlue });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);

        // Glowing shield panels on sides
        const shieldMaterial = getMaterial('basic', { 
            color: neonBlue, 
            transparent: true, 
            opacity: 0.7 
        });
        const shieldGeometry = getGeometry('box', 0.1, 1.0, 0.4);
        [-0.5, 0.5].forEach(x => {
            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            shield.position.set(x, 1.0, 0);
            group.add(shield);
        });

        // Head with scanner
        const headGeometry = getGeometry('sphere', 0.45, 12, 12);
        const headMaterial = getMaterial('lambert', { color: darkBlue });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);

        // Scanner visor
        const visorGeometry = getGeometry('box', 0.6, 0.15, 0.1);
        const visorMaterial = getMaterial('basic', { color: neonBlue });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 2.0, 0.4);
        group.add(visor);

        // LED indicators
        for (let i = 0; i < 4; i++) {
            const ledGeometry = getGeometry('sphere', 0.06, 8, 8);
            const ledMaterial = getMaterial('basic', { 
                color: [0x00FF00, 0xFF0000][i % 2] 
            });
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.set(-0.2 + i * 0.15, 0.5, 0.28);
            group.add(led);
        }

        group.userData.isFirewall = true;
        group.userData.floatOffset = Math.random() * Math.PI * 2;
    }
    
    function buildDarkFairy(group) {
        // DARK FAIRY - sinister fairy with shrink spell for enchanted theme
        const skinColor = 0x8B7D9B;   // Purple-grey skin
        const wingColor = 0x4B0082;   // Indigo wings
        const glowColor = 0xFF00FF;   // Magenta glow

        // Elegant body
        const bodyGeometry = getGeometry('cylinder', 0.2, 0.3, 0.8, 8);
        const bodyMaterial = getMaterial('lambert', { color: skinColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);

        // Dress/robe bottom
        const dressGeometry = getGeometry('cone', 0.4, 0.8, 8);
        const dressMaterial = getMaterial('lambert', { color: 0x2E0854 });
        const dress = new THREE.Mesh(dressGeometry, dressMaterial);
        dress.position.y = 0.6;
        dress.rotation.x = Math.PI;
        group.add(dress);

        // Head
        const headGeometry = getGeometry('sphere', 0.25, 12, 12);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.6;
        head.castShadow = true;
        group.add(head);

        // Glowing eyes
        const eyeGeometry = getGeometry('sphere', 0.06, 8, 8);
        const eyeMaterial = getMaterial('basic', { color: glowColor });
        [-0.1, 0.1].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.65, 0.2);
            group.add(eye);
        });

        // Dark crown/tiara
        for (let i = 0; i < 5; i++) {
            const spikeGeometry = getGeometry('cone', 0.03, 0.15 + (i === 2 ? 0.1 : 0), 4);
            const spikeMaterial = getMaterial('lambert', { color: 0x1A1A2E });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            const angle = ((i - 2) / 5) * Math.PI * 0.6;
            spike.position.set(Math.sin(angle) * 0.2, 1.85, Math.cos(angle) * 0.1);
            group.add(spike);
        }

        // Large dark wings - store references for animation
        const wingMaterial = getMaterial('basic', { 
            color: wingColor, 
            transparent: true, 
            opacity: 0.7, 
            side: THREE.DoubleSide 
        });
        
        // Use ellipse shape for wings
        const wingGeometry = getGeometry('circle', 0.6, 16, 0, Math.PI);
        
        group.wings = [];
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(-0.3, 1.2, -0.1);
        leftWing.rotation.y = -0.6;
        leftWing.rotation.z = 0.3;
        leftWing.userData.baseRotY = -0.6;
        leftWing.userData.isLeftWing = true;
        group.add(leftWing);
        group.wings.push(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0.3, 1.2, -0.1);
        rightWing.rotation.y = 0.6;
        rightWing.rotation.z = -0.3;
        rightWing.userData.baseRotY = 0.6;
        rightWing.userData.isLeftWing = false;
        rightWing.scale.x = -1;
        group.add(rightWing);
        group.wings.push(rightWing);

        // Magic orb in hand
        const orbGeometry = getGeometry('sphere', 0.12, 12, 12);
        const orbMaterial = getMaterial('basic', { color: glowColor, transparent: true, opacity: 0.8 });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.4, 1.0, 0.3);
        group.add(orb);
        
        group.userData.isDarkFairy = true;
    }
    
    function buildEggWarrior(group) {
        // EGG WARRIOR - decorated easter egg with limbs and bow
        const eggColor = 0xFFE4E1;      // Misty rose
        const stripColor1 = 0xFF69B4;   // Hot pink
        const stripColor2 = 0x98FB98;   // Pale green
        const stripColor3 = 0x87CEEB;   // Sky blue

        // Egg body
        const eggGeometry = getGeometry('sphere', 0.5, 16, 16);
        const eggMaterial = getMaterial('lambert', { color: eggColor });
        const egg = new THREE.Mesh(eggGeometry, eggMaterial);
        egg.position.y = 1.0;
        egg.scale.set(0.8, 1.2, 0.8);
        egg.castShadow = true;
        group.add(egg);

        // Decorative stripes
        [stripColor1, stripColor2, stripColor3].forEach((color, i) => {
            const stripeGeometry = getGeometry('torus', 0.4, 0.04, 8, 16);
            const stripeMaterial = getMaterial('lambert', { color });
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.position.y = 0.7 + i * 0.3;
            stripe.rotation.x = Math.PI / 2;
            stripe.scale.set(0.8, 1, 0.8);
            group.add(stripe);
        });

        // Eyes
        const eyeGeometry = getGeometry('sphere', 0.08, 8, 8);
        const eyeMaterial = getMaterial('basic', { color: 0x000000 });
        [-0.15, 0.15].forEach(x => {
            // Eye whites
            const whiteGeometry = getGeometry('sphere', 0.1, 8, 8);
            const whiteMaterial = getMaterial('basic', { color: 0xFFFFFF });
            const white = new THREE.Mesh(whiteGeometry, whiteMaterial);
            white.position.set(x, 1.2, 0.38);
            group.add(white);
            // Pupils
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.2, 0.4);
            group.add(eye);
        });

        // Little arms
        const armGeometry = getGeometry('cylinder', 0.06, 0.08, 0.4, 6);
        const armMaterial = getMaterial('lambert', { color: eggColor });
        [-0.5, 0.5].forEach((x, i) => {
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.set(x, 1.0, 0);
            arm.rotation.z = i === 0 ? 0.8 : -0.8;
            arm.castShadow = true;
            group.add(arm);
        });

        // Little legs
        const legGeometry = getGeometry('cylinder', 0.08, 0.1, 0.3, 6);
        [-0.2, 0.2].forEach(x => {
            const leg = new THREE.Mesh(legGeometry, armMaterial);
            leg.position.set(x, 0.2, 0);
            leg.castShadow = true;
            group.add(leg);
        });

        // Bow (weapon)
        const bowGeometry = getGeometry('torus', 0.25, 0.02, 6, 16, Math.PI);
        const bowMaterial = getMaterial('lambert', { color: 0x8B4513 });
        const bow = new THREE.Mesh(bowGeometry, bowMaterial);
        bow.position.set(0.6, 1.0, 0.2);
        bow.rotation.y = Math.PI / 2;
        group.add(bow);

        group.userData.isEggWarrior = true;
    }
    
    function buildNutcracker(group) {
        // Nutcracker soldier for Christmas theme
        const nutcrackerRed = 0xb22222;
        const nutcrackerGold = 0xffd700;
        const nutcrackerBlack = 0x111111;
        const nutcrackerWhite = 0xffffff;
        
        // Body - nutcracker soldier uniform
        const bodyGeometry = getGeometry('box', 0.8, 1.0, 0.5);
        const bodyMaterial = getMaterial('lambert', { color: nutcrackerRed });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);
        
        // Gold buttons on uniform
        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(
                getGeometry('cylinder', 0.08, 0.08, 0.05, 16),
                getMaterial('lambert', { color: nutcrackerGold })
            );
            button.rotation.x = Math.PI / 2;
            button.position.set(0, 1.3 - i * 0.3, 0.28);
            group.add(button);
        }
        
        // Head - wooden/painted look
        const headGeometry = getGeometry('cylinder', 0.4, 0.45, 0.6, 16);
        const headMaterial = getMaterial('lambert', { color: 0xffc0a0 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.9;
        head.castShadow = true;
        group.add(head);
        
        // Black eyes - nutcracker style
        const eyeMaterial = getMaterial('basic', { color: nutcrackerBlack });
        const eyeGeometry = getGeometry('sphere', 0.08, 12, 12);
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.95, 0.38);
            group.add(eye);
        });
        
        // Tall nutcracker hat - black with gold trim
        const hatBase = new THREE.Mesh(
            getGeometry('cylinder', 0.5, 0.5, 0.15, 16),
            getMaterial('lambert', { color: nutcrackerBlack })
        );
        hatBase.position.y = 2.3;
        group.add(hatBase);
        
        const hatTop = new THREE.Mesh(
            getGeometry('cylinder', 0.35, 0.38, 0.8, 16),
            getMaterial('lambert', { color: nutcrackerBlack })
        );
        hatTop.position.y = 2.75;
        group.add(hatTop);
        
        // Gold hat trim
        const hatTrim = new THREE.Mesh(
            getGeometry('cylinder', 0.39, 0.39, 0.1, 16),
            getMaterial('lambert', { color: nutcrackerGold })
        );
        hatTrim.position.y = 2.38;
        group.add(hatTrim);
        
        // White beard/mustache
        const beard = new THREE.Mesh(
            getGeometry('box', 0.5, 0.25, 0.2),
            getMaterial('lambert', { color: nutcrackerWhite })
        );
        beard.position.set(0, 1.75, 0.35);
        group.add(beard);
        
        // Red scarf around neck
        const scarf = new THREE.Mesh(
            getGeometry('torus', 0.5, 0.12, 8, 12, Math.PI),
            getMaterial('lambert', { color: 0xff0000 })
        );
        scarf.rotation.x = Math.PI / 2;
        scarf.position.y = 1.5;
        group.add(scarf);
        
        // Snowy shoulder pads (snow accumulated on shoulders)
        [-0.45, 0.45].forEach(x => {
            const snow = new THREE.Mesh(
                getGeometry('sphere', 0.18, 12, 12),
                getMaterial('lambert', { color: nutcrackerWhite })
            );
            snow.position.set(x, 1.55, 0);
            snow.scale.y = 0.5;
            group.add(snow);
        });
    }
    
    function buildCrystalSentinel(group) {
        // Crystal Sentinel - guards made of purple crystal
        const crystalPurple = 0x8844ff;
        const crystalPink = 0xff44aa;
        const crystalGlow = 0xaa88ff;
        const crystalDark = 0x5522aa;
        
        // Body - faceted crystal torso
        const bodyGeometry = getGeometry('octahedron', 0.55, 0);
        const bodyMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            transparent: true,
            opacity: 0.85
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.scale.set(0.9, 1.2, 0.7);
        body.castShadow = true;
        group.add(body);
        
        // Inner crystal core glow
        const coreGeometry = getGeometry('octahedron', 0.3, 0);
        const coreMaterial = getMaterial('basic', { 
            color: crystalGlow,
            transparent: true,
            opacity: 0.6
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 1.0;
        group.add(core);
        
        // Head - angular crystal shape
        const headGeometry = getGeometry('octahedron', 0.4, 0);
        const headMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            transparent: true,
            opacity: 0.85
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.85;
        head.rotation.y = Math.PI / 4;
        head.castShadow = true;
        group.add(head);
        
        // Glowing eyes - embedded gems
        const eyeMaterial = getMaterial('basic', { color: 0x00ffff });
        const eyeGeometry = getGeometry('octahedron', 0.1, 0);
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.85, 0.32);
            eye.rotation.y = Math.PI / 4;
            group.add(eye);
        });
        
        // Crystal spikes on head (like a crown)
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const spike = new THREE.Mesh(
                getGeometry('cone', 0.08, 0.35, 4),
                getMaterial('lambert', { 
                    color: crystalPink,
                    transparent: true,
                    opacity: 0.8
                })
            );
            spike.position.set(
                Math.cos(angle) * 0.28,
                2.15,
                Math.sin(angle) * 0.28
            );
            spike.rotation.x = Math.cos(angle) * 0.3;
            spike.rotation.z = -Math.sin(angle) * 0.3;
            group.add(spike);
        }
        
        // Crystal shoulder formations
        [-0.55, 0.55].forEach(x => {
            const shoulder = new THREE.Mesh(
                getGeometry('octahedron', 0.2, 0),
                getMaterial('lambert', { 
                    color: crystalDark,
                    transparent: true,
                    opacity: 0.85
                })
            );
            shoulder.position.set(x, 1.4, 0);
            shoulder.rotation.z = x > 0 ? -0.5 : 0.5;
            group.add(shoulder);
        });
        
        // Floating crystal arms
        [-0.7, 0.7].forEach(x => {
            const arm = new THREE.Mesh(
                getGeometry('cone', 0.15, 0.6, 5),
                getMaterial('lambert', { color: crystalPurple, transparent: true, opacity: 0.85 })
            );
            arm.position.set(x, 0.8, 0);
            arm.rotation.z = x > 0 ? 0.8 : -0.8;
            group.add(arm);
        });
    }
    
    function buildStandardGuardian(group, textures) {
        const bodyGeometry = getGeometry('box', 0.8, 1.0, 0.5);
        const bodyMaterial = getTexturedMaterial('lambert', { map: textures.goblinArmor }, 'goblinArmor');
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);
    
        const headGeometry = getGeometry('sphere', 0.5, 16, 16);
        const headMaterial = getTexturedMaterial('lambert', { map: textures.goblinSkin }, 'goblinSkin');
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        group.add(head);
    
        const eyeGeometry = getGeometry('sphere', 0.12, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            map: textures.guardianEye,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.18, 1.8, 0.42);
        group.add(e1);
    
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.18, 1.8, 0.42);
        group.add(e2);
    
        const earGeometry = getGeometry('cone', 0.18, 0.5, 4);
        const earMaterial = getTexturedMaterial('lambert', { map: textures.goblinSkin }, 'goblinSkin');
        const er1 = new THREE.Mesh(earGeometry, earMaterial);
        er1.rotation.z = Math.PI / 2;
        er1.position.set(-0.6, 1.8, 0);
        er1.castShadow = true;
        group.add(er1);
    
        const er2 = new THREE.Mesh(earGeometry, earMaterial);
        er2.rotation.z = -Math.PI / 2;
        er2.position.set(0.6, 1.8, 0);
        er2.castShadow = true;
        group.add(er2);
    }
    
    function buildRapunzelWitch(group) {
        // RAPUNZEL WITCH - evil witch that shoots pine cone projectiles
        const cloakColor = 0x2D1B4E;        // Dark purple cloak
        const skinColor = 0x98FB98;         // Pale green witch skin
        const hatColor = 0x1A0F2E;          // Very dark purple hat
        const hairColor = 0x1C1C1C;         // Black stringy hair
        const staffColor = 0x3D2817;        // Dark wood staff
        const gemColor = 0x00FF7F;          // Green magic gem
        
        // Witch cloak body (cone shape)
        const cloakGeometry = getGeometry('cone', 0.6, 1.6, 8);
        const cloakMaterial = getMaterial('lambert', { color: cloakColor });
        const cloak = new THREE.Mesh(cloakGeometry, cloakMaterial);
        cloak.position.y = 1.0;
        cloak.castShadow = true;
        group.add(cloak);
        
        // Tattered cloak edge
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const tatterGeometry = getGeometry('cone', 0.08, 0.3, 3);
            const tatter = new THREE.Mesh(tatterGeometry, cloakMaterial);
            tatter.position.set(
                Math.cos(angle) * 0.55,
                0.35,
                Math.sin(angle) * 0.55
            );
            group.add(tatter);
        }
        
        // Witch head
        const headGeometry = getGeometry('sphere', 0.4, 16, 16);
        const headMaterial = getMaterial('lambert', { color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);
        
        // Big warty nose
        const noseGeometry = getGeometry('cone', 0.1, 0.25, 6);
        const nose = new THREE.Mesh(noseGeometry, headMaterial);
        nose.position.set(0, 1.95, 0.42);
        nose.rotation.x = Math.PI / 2; // Point forward
        group.add(nose);
        
        // Wart on nose
        const wartGeometry = getGeometry('sphere', 0.04, 8, 8);
        const wartMaterial = getMaterial('lambert', { color: 0x556B2F });
        const wart = new THREE.Mesh(wartGeometry, wartMaterial);
        wart.position.set(0.05, 1.98, 0.55);
        group.add(wart);
        
        // Glowing evil eyes
        const eyeMaterial = getMaterial('basic', { color: 0xFF4500 });
        const eyeGeometry = getGeometry('sphere', 0.1, 12, 12);
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 2.1, 0.35);
            group.add(eye);
        });
        
        // Angry eyebrows
        const browGeometry = getGeometry('box', 0.18, 0.04, 0.02);
        const browMaterial = getMaterial('lambert', { color: hairColor });
        [-0.15, 0.15].forEach((x, i) => {
            const brow = new THREE.Mesh(browGeometry, browMaterial);
            brow.position.set(x, 2.2, 0.38);
            brow.rotation.z = i === 0 ? -0.4 : 0.4;
            group.add(brow);
        });
        
        // Pointed witch hat
        const hatBrimGeometry = getGeometry('cylinder', 0.55, 0.55, 0.08, 16);
        const hatMaterial = getMaterial('lambert', { color: hatColor });
        const hatBrim = new THREE.Mesh(hatBrimGeometry, hatMaterial);
        hatBrim.position.y = 2.35;
        hatBrim.castShadow = true;
        group.add(hatBrim);
        
        const hatConeGeometry = getGeometry('cone', 0.35, 0.9, 12);
        const hatCone = new THREE.Mesh(hatConeGeometry, hatMaterial);
        hatCone.position.y = 2.85;
        hatCone.castShadow = true;
        group.add(hatCone);
        
        // Hat buckle
        const buckleGeometry = getGeometry('box', 0.15, 0.1, 0.05);
        const buckleMaterial = getMaterial('lambert', { color: 0xFFD700 });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 2.5, 0.32);
        group.add(buckle);
        
        // Stringy black hair
        for (let i = 0; i < 6; i++) {
            const hairGeometry = getGeometry('cylinder', 0.025, 0.015, 0.5 + Math.random() * 0.3, 4);
            const hair = new THREE.Mesh(hairGeometry, getMaterial('lambert', { color: hairColor }));
            hair.position.set(
                (Math.random() - 0.5) * 0.6,
                1.8,
                -0.2 - Math.random() * 0.15
            );
            hair.rotation.x = 0.3 + Math.random() * 0.2;
            hair.rotation.z = (Math.random() - 0.5) * 0.5;
            group.add(hair);
        }
        
        // Gnarled wooden staff
        const staffGeometry = getGeometry('cylinder', 0.04, 0.06, 2.2, 6);
        const staffMaterial = getMaterial('lambert', { color: staffColor });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.65, 1.1, 0.2);
        staff.rotation.z = -0.15;
        staff.castShadow = true;
        group.add(staff);
        
        // Pine cone on top of staff (for projectile theme)
        const pineConeGeometry = getGeometry('cone', 0.12, 0.25, 8);
        const pineConeMaterial = getMaterial('lambert', { 
            color: gemColor,
            emissive: gemColor,
            emissiveIntensity: 0.5
        });
        const pineCone = new THREE.Mesh(pineConeGeometry, pineConeMaterial);
        pineCone.position.set(0.72, 2.3, 0.2);
        group.add(pineCone);
        group.staffOrb = pineCone; // For animation
        
        // Magic glow around staff top
        const glowGeometry = getGeometry('sphere', 0.18, 12, 12);
        const glowMaterial = getMaterial('basic', { 
            color: gemColor,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.set(0.72, 2.3, 0.2);
        group.add(glow);
        
        // Bony witch hands
        const handGeometry = getGeometry('sphere', 0.1, 8, 8);
        const handMaterial = getMaterial('lambert', { color: skinColor });
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.6, 1.3, 0.2);
        group.add(rightHand);
    }
    
    // ========================================
    // REGISTER WITH ENTITY REGISTRY
    // ========================================
    
    ENTITY_REGISTRY.register('guardian', {
        create: createGuardianGoblin
    });
    
    // Export globally for backward compatibility
    window.createGuardianGoblin = createGuardianGoblin;
    
})();
