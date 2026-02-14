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
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B008B });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.3, 1.4, 0.6);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.3, 1.4, 0.6);
        group.add(eye2);

        const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const pupil1 = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil1.position.set(-0.3, 1.4, 0.68);
        group.add(pupil1);

        const pupil2 = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil2.position.set(0.3, 1.4, 0.68);
        group.add(pupil2);

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
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.3, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.1;
        body.castShadow = true;
        group.add(body);

        // Devil head - slightly larger
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);

        // Large curved horns
        const hornGeometry = new THREE.ConeGeometry(0.12, 0.8, 8);
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
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
        const eyeGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({
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
        const mouthGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.1);
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.82, 0.45);
        group.add(mouth);

        // Fangs
        const fangGeometry = new THREE.ConeGeometry(0.03, 0.12, 4);
        const fangMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const fang1 = new THREE.Mesh(fangGeometry, fangMaterial);
        fang1.position.set(-0.08, 1.76, 0.45);
        fang1.rotation.x = Math.PI;
        group.add(fang1);

        const fang2 = new THREE.Mesh(fangGeometry, fangMaterial);
        fang2.position.set(0.08, 1.76, 0.45);
        fang2.rotation.x = Math.PI;
        group.add(fang2);

        // Pointed ears
        const earGeometry = new THREE.ConeGeometry(0.12, 0.4, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: darkRed });
        const ear1 = new THREE.Mesh(earGeometry, earMaterial);
        ear1.rotation.z = Math.PI / 2;
        ear1.position.set(-0.6, 2.0, 0);
        group.add(ear1);

        const ear2 = new THREE.Mesh(earGeometry, earMaterial);
        ear2.rotation.z = -Math.PI / 2;
        ear2.position.set(0.6, 2.0, 0);
        group.add(ear2);

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
        group.add(wing1);

        const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing2.position.set(0.8, 1.5, -0.2);
        wing2.rotation.y = -0.8;
        wing2.rotation.z = -0.3;
        group.add(wing2);

        // Devil tail
        const tailGeometry = new THREE.CylinderGeometry(0.06, 0.04, 1.0, 6);
        const tailMaterial = new THREE.MeshLambertMaterial({ color: devilRed });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.6, -0.5);
        tail.rotation.x = 0.6;
        group.add(tail);

        // Tail tip
        const tipGeometry = new THREE.ConeGeometry(0.12, 0.25, 4);
        const tipMaterial = new THREE.MeshLambertMaterial({ color: darkRed });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.set(0, 0.2, -0.9);
        tip.rotation.x = Math.PI / 2 + 0.4;
        group.add(tip);

        // Flaming trident
        const tridentStaff = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6);
        const tridentMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const staff = new THREE.Mesh(tridentStaff, tridentMaterial);
        staff.position.set(0.5, 1.2, 0.2);
        staff.rotation.z = 0.15;
        group.add(staff);

        // Trident prongs
        const prongGeometry = new THREE.ConeGeometry(0.05, 0.35, 4);
        for (let i = -1; i <= 1; i++) {
            const prong = new THREE.Mesh(prongGeometry, tridentMaterial);
            prong.position.set(0.5 + i * 0.12, 2.2, 0.2);
            prong.rotation.z = 0.15 + i * 0.15;
            group.add(prong);
        }

        // Fire glow at trident top
        const fireGlow = new THREE.PointLight(fireOrange, 0.5, 3);
        fireGlow.position.set(0.5, 2.3, 0.2);
        group.add(fireGlow);
    }
    
    function buildGingerbreadMan(group) {
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
        group.add(body);

        // Gingerbread head
        const headGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.rotation.x = Math.PI / 2;
        head.position.y = 1.9;
        head.castShadow = true;
        group.add(head);

        // Icing button details on body
        const buttonGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12);
        const icingMaterial = new THREE.MeshBasicMaterial({ color: icingWhite });
        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(buttonGeometry, icingMaterial);
            button.rotation.x = Math.PI / 2;
            button.position.set(0, 1.0 + i * 0.25, 0.18);
            group.add(button);
        }

        // Icing smile
        const smileGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI);
        const smileMaterial = new THREE.MeshBasicMaterial({ color: icingPink });
        const smile = new THREE.Mesh(smileGeometry, smileMaterial);
        smile.position.set(0, 1.78, 0.15);
        smile.rotation.x = -0.2;
        group.add(smile);

        // Candy eyes (gumdrop style)
        const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.15, 1.95, 0.2);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.15, 1.95, 0.2);
        group.add(eye2);

        // Icing eyebrows (angry)
        const browGeometry = new THREE.BoxGeometry(0.12, 0.03, 0.02);
        const browMaterial = new THREE.MeshBasicMaterial({ color: icingWhite });
        const brow1 = new THREE.Mesh(browGeometry, browMaterial);
        brow1.position.set(-0.15, 2.05, 0.22);
        brow1.rotation.z = 0.3;
        group.add(brow1);

        const brow2 = new THREE.Mesh(browGeometry, browMaterial);
        brow2.position.set(0.15, 2.05, 0.22);
        brow2.rotation.z = -0.3;
        group.add(brow2);

        // Arms - cookie style
        const armGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 8);
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
        const cuffGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 16);
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
        const legGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.9, 8);
        const leg1 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg1.position.set(-0.25, 0.45, 0);
        leg1.castShadow = true;
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, bodyMaterial);
        leg2.position.set(0.25, 0.45, 0);
        leg2.castShadow = true;
        group.add(leg2);

        // Candy cane weapon
        const caneGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        const caneMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        const cane = new THREE.Mesh(caneGeometry, caneMaterial);
        cane.position.set(0.9, 1.4, 0.1);
        cane.rotation.z = -0.3;
        group.add(cane);

        // Candy cane hook
        const hookGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16, Math.PI);
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
        group.add(body);

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
        group.add(head);

        // Hollow eye sockets with eerie glow
        const eyeSocketGeometry = new THREE.SphereGeometry(0.15, 12, 12);
        const eyeSocketMaterial = new THREE.MeshBasicMaterial({
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
        const pupilGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const pupilMaterial = new THREE.MeshBasicMaterial({
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
        const mouthGeometry = new THREE.RingGeometry(0.08, 0.15, 8);
        const mouthMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a2a,
            side: THREE.DoubleSide
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 2.1, 0.48);
        group.add(mouth);

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
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(0.6, 1.5, 0.2);
        arm2.rotation.z = -0.7;
        arm2.rotation.x = -0.3;
        group.add(arm2);

        // Ethereal glow light
        const ghostLight = new THREE.PointLight(0x6688ff, 0.4, 5);
        ghostLight.position.set(0, 2.0, 0);
        group.add(ghostLight);

        // Floating effect handled by game loop
        group.userData.isGhost = true;
        group.userData.floatOffset = Math.random() * Math.PI * 2;
    }
    
    function buildSpectralKnight(group) {
        const ghostArmor = 0x5a6a8a;
        const ghostGlow = 0x4488cc;
        const etherealBlue = 0x6699cc;

        // Spectral armored body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.1, 0.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({
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
        const chestGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.15);
        const chestMaterial = new THREE.MeshPhongMaterial({
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
        const helmetGeometry = new THREE.SphereGeometry(0.45, 16, 16);
        const helmetMaterial = new THREE.MeshPhongMaterial({
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
        const visorGeometry = new THREE.BoxGeometry(0.35, 0.12, 0.12);
        const visorMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a1a });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 1.85, 0.38);
        group.add(visor);

        // Glowing eyes through visor
        const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({
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
        const crestGeometry = new THREE.ConeGeometry(0.15, 0.6, 8);
        const crestMaterial = new THREE.MeshPhongMaterial({
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
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 8);
        const armMaterial = new THREE.MeshPhongMaterial({
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
        const gauntletGeometry = new THREE.BoxGeometry(0.15, 0.18, 0.15);
        const gauntlet1 = new THREE.Mesh(gauntletGeometry, bodyMaterial);
        gauntlet1.position.set(-0.65, 0.5, 0);
        group.add(gauntlet1);

        const gauntlet2 = new THREE.Mesh(gauntletGeometry, bodyMaterial);
        gauntlet2.position.set(0.65, 0.5, 0);
        group.add(gauntlet2);

        // Ghostly shield (left hand)
        const shieldGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.08);
        const shieldMaterial = new THREE.MeshPhongMaterial({
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
        const emblemGeometry = new THREE.CircleGeometry(0.12, 8);
        const emblemMaterial = new THREE.MeshBasicMaterial({
            color: 0x66AAFF,
            transparent: true,
            opacity: 0.8
        });
        const emblem = new THREE.Mesh(emblemGeometry, emblemMaterial);
        emblem.position.set(-0.82, 0.8, 0.32);
        emblem.rotation.y = 0.4;
        group.add(emblem);

        // Spectral sword (right hand)
        const swordHandleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6);
        const swordHandleMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a3a });
        const swordHandle = new THREE.Mesh(swordHandleGeometry, swordHandleMaterial);
        swordHandle.position.set(0.7, 0.6, 0.2);
        swordHandle.rotation.z = -0.3;
        group.add(swordHandle);

        const swordBladeGeometry = new THREE.BoxGeometry(0.08, 0.8, 0.03);
        const swordBladeMaterial = new THREE.MeshPhongMaterial({
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
        const mistGeometry = new THREE.ConeGeometry(0.6, 1.0, 8);
        const mistMaterial = new THREE.MeshPhongMaterial({
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

        // Ethereal glow light
        const ghostLight = new THREE.PointLight(0x4488ff, 0.4, 5);
        ghostLight.position.set(0, 1.5, 0);
        group.add(ghostLight);

        // Floating effect
        group.userData.isGhost = true;
        group.userData.floatOffset = Math.random() * Math.PI * 2;
    }
    
    function buildFirewallSentry(group) {
        // FIREWALL SENTRY - shield-bearing digital guardian (wiki style)
        const neonBlue = 0x00AAFF;
        const darkBlue = 0x001144;

        // Shield body core
        const bodyGeometry = new THREE.BoxGeometry(0.9, 1.2, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: darkBlue });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);

        // Glowing shield panels on sides
        const shieldMaterial = new THREE.MeshBasicMaterial({ 
            color: neonBlue, 
            transparent: true, 
            opacity: 0.7 
        });
        const shieldGeometry = new THREE.BoxGeometry(0.1, 1.0, 0.4);
        [-0.5, 0.5].forEach(x => {
            const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
            shield.position.set(x, 1.0, 0);
            group.add(shield);
        });

        // Head with scanner
        const headGeometry = new THREE.SphereGeometry(0.45, 12, 12);
        const headMaterial = new THREE.MeshLambertMaterial({ color: darkBlue });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.0;
        head.castShadow = true;
        group.add(head);

        // Scanner visor
        const visorGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.1);
        const visorMaterial = new THREE.MeshBasicMaterial({ color: neonBlue });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.set(0, 2.0, 0.4);
        group.add(visor);

        // LED indicators
        for (let i = 0; i < 4; i++) {
            const ledGeometry = new THREE.SphereGeometry(0.06, 8, 8);
            const ledMaterial = new THREE.MeshBasicMaterial({ 
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
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);

        // Dress/robe bottom
        const dressGeometry = new THREE.ConeGeometry(0.4, 0.8, 8);
        const dressMaterial = new THREE.MeshLambertMaterial({ color: 0x2E0854 });
        const dress = new THREE.Mesh(dressGeometry, dressMaterial);
        dress.position.y = 0.6;
        dress.rotation.x = Math.PI;
        group.add(dress);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 12, 12);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 1.6;
        head.castShadow = true;
        group.add(head);

        // Glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: glowColor });
        [-0.1, 0.1].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.65, 0.2);
            group.add(eye);
        });

        // Dark crown/tiara
        for (let i = 0; i < 5; i++) {
            const spikeGeometry = new THREE.ConeGeometry(0.03, 0.15 + (i === 2 ? 0.1 : 0), 4);
            const spikeMaterial = new THREE.MeshLambertMaterial({ color: 0x1A1A2E });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            const angle = ((i - 2) / 5) * Math.PI * 0.6;
            spike.position.set(Math.sin(angle) * 0.2, 1.85, Math.cos(angle) * 0.1);
            group.add(spike);
        }

        // Large dark wings - store references for animation
        const wingMaterial = new THREE.MeshBasicMaterial({ 
            color: wingColor, 
            transparent: true, 
            opacity: 0.7, 
            side: THREE.DoubleSide 
        });
        
        // Use ellipse shape for wings
        const wingGeometry = new THREE.CircleGeometry(0.6, 16, 0, Math.PI);
        
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
        const orbGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        const orbMaterial = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.8 });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.4, 1.0, 0.3);
        group.add(orb);
        
        group.userData.isDarkFairy = true;
    }
    
    function buildStandardGuardian(group, textures) {
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinArmor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        group.add(body);
    
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.8;
        head.castShadow = true;
        group.add(head);
    
        const eyeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
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
    
        const earGeometry = new THREE.ConeGeometry(0.18, 0.5, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
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
    
    // ========================================
    // REGISTER WITH ENTITY REGISTRY
    // ========================================
    
    ENTITY_REGISTRY.register('guardian', {
        create: createGuardianGoblin
    });
    
    // Export globally for backward compatibility
    window.createGuardianGoblin = createGuardianGoblin;
    
})();
