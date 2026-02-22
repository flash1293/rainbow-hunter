// entity-wizard.js - Wizard enemy with theme variants
// Theme variants: Cotton Candy Wizard (candy), Witch (graveyard), Dark Sorcerer (ruins), Ice/Standard

(function() {
    'use strict';
    
    /**
     * Create a wizard enemy - magic-wielding enemy that shoots fireballs
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} patrolLeft - Left patrol boundary
     * @param {number} patrolRight - Right patrol boundary
     * @param {number} speed - Movement speed (default: 0.008)
     * @returns {object} Wizard entity object
     */
    function createWizard(x, z, patrolLeft, patrolRight, speed = 0.008) {
        const textures = getTerrainTextures(THREE);
        const wizardGrp = new THREE.Group();
        
        if (G.candyTheme) {
            buildCottonCandyWizard(wizardGrp);
        } else if (G.graveyardTheme) {
            buildWitch(wizardGrp);
        } else if (G.ruinsTheme) {
            buildDarkSorcerer(wizardGrp);
        } else if (G.computerTheme) {
            buildHacker(wizardGrp);
        } else if (G.enchantedTheme) {
            buildEnchantress(wizardGrp);
        } else if (G.easterTheme) {
            buildEasterWizard(wizardGrp);
        } else if (G.christmasTheme) {
            buildWalkingEvilSanta(wizardGrp);
        } else if (G.rapunzelTheme) {
            buildCrownWizard(wizardGrp);
        } else {
            buildStandardWizard(wizardGrp, textures);
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
    
    // ========================================
    // THEME-SPECIFIC BUILDERS
    // ========================================
    
    function buildHacker(group) {
        // HACKER - hooded figure with holographic screen (wiki style)
        const darkGray = 0x1A1A1A;
        const neonGreen = 0x00FF00;

        // Hooded robe body (cone shape)
        const bodyGeometry = getGeometry('cone', 0.6, 1.8, 8);
        const bodyMaterial = getMaterial('lambert', { color: darkGray });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);

        // Hood (half-sphere)
        const hoodGeometry = getGeometry('sphere', 0.45, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const hoodMaterial = getMaterial('lambert', { color: darkGray });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.y = 2.2;
        hood.rotation.x = -0.4;
        hood.castShadow = true;
        group.add(hood);

        // Glowing eyes in shadow
        const eyeMaterial = getMaterial('basic', { color: neonGreen });
        const eyeGeometry = getGeometry('sphere', 0.08, 8, 8);
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 2.1, 0.3);
            group.add(eye);
        });

        // Holographic screen in front
        const screenGeometry = getGeometry('plane', 0.8, 0.6);
        const screenMaterial = getMaterial('basic', { 
            color: neonGreen, 
            transparent: true, 
            opacity: 0.4, 
            side: THREE.DoubleSide 
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 1.5, 0.8);
        group.add(screen);

        // Matrix-like code lines on screen
        for (let i = 0; i < 5; i++) {
            const codeGeometry = getGeometry('box', 0.6, 0.03, 0.01);
            const codeMaterial = getMaterial('basic', { color: 0x00AA00 });
            const code = new THREE.Mesh(codeGeometry, codeMaterial);
            code.position.set(0, 1.35 + i * 0.12, 0.82);
            code.userData.codeOffset = Math.random() * Math.PI * 2;
            group.add(code);
        }

        // Glowing orb (malware packet) - for wizard compatibility
        const orbGeometry = getGeometry('icosahedron', 0.2, 1);
        const orbMaterial = getMaterial('basic', {
            color: 0xFF0066,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.5, 2.0, 0.3);
        group.add(orb);
        group.staffOrb = orb;

        group.userData.isHacker = true;
        group.userData.floatOffset = Math.random() * Math.PI * 2;
    }
    
    function buildCottonCandyWizard(group) {
        // COTTON CANDY WIZARD - fluffy pink and blue magical creature
        const cottonPink = 0xFF69B4;
        const cottonBlue = 0x87CEEB;
        const sparkleWhite = 0xFFFFFF;

        // Fluffy cotton candy body (swirled)
        const bodyGeometry = getGeometry('cylinder', 0.5, 0.9, 2.2, 16);
        const bodyMaterial = getMaterial('phong', {
            color: cottonPink,
            transparent: true,
            opacity: 0.9,
            shininess: 50
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.4;
        body.castShadow = true;
        group.add(body);

        // Cotton candy fluff pieces
        for (let i = 0; i < 10; i++) {
            const fluffGeometry = getGeometry('sphere', 0.2 + Math.random() * 0.2, 12, 12);
            const fluffColor = i % 2 === 0 ? cottonPink : cottonBlue;
            const fluffMaterial = getMaterial('phong', {
                color: fluffColor,
                transparent: true,
                opacity: 0.8
            });
            const fluff = new THREE.Mesh(fluffGeometry, fluffMaterial);
            const angle = (i / 10) * Math.PI * 2;
            const height = 0.8 + Math.random() * 1.5;
            fluff.position.set(Math.cos(angle) * 0.7, height, Math.sin(angle) * 0.7);
            group.add(fluff);
        }

        // Round fluffy head
        const headGeometry = getGeometry('sphere', 0.55, 16, 16);
        const headMaterial = getMaterial('phong', {
            color: cottonBlue,
            transparent: true,
            opacity: 0.9
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.8;
        head.castShadow = true;
        group.add(head);

        // Swirled wizard hat (ice cream cone style)
        const hatGeometry = getGeometry('cone', 0.6, 1.3, 16);
        const hatMaterial = getMaterial('phong', {
            color: cottonPink,
            transparent: true,
            opacity: 0.9
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 3.8;
        hat.castShadow = true;
        group.add(hat);

        // Swirl decoration on hat
        const swirlGeometry = getGeometry('torus', 0.35, 0.08, 8, 16, Math.PI * 3);
        const swirlMaterial = getMaterial('phong', { color: cottonBlue });
        const swirl = new THREE.Mesh(swirlGeometry, swirlMaterial);
        swirl.position.y = 3.5;
        swirl.rotation.x = Math.PI / 2;
        group.add(swirl);

        // Sparkly eyes
        const eyeGeometry = getGeometry('sphere', 0.1, 12, 12);
        const eyeMaterial = getMaterial('basic', {
            color: sparkleWhite,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.2, 2.85, 0.45);
        group.add(e1);

        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.2, 2.85, 0.45);
        group.add(e2);

        // Pupil dots
        const pupilGeometry = getGeometry('sphere', 0.05, 8, 8);
        const pupilMaterial = getMaterial('basic', { color: 0x000000 });
        const p1 = new THREE.Mesh(pupilGeometry, pupilMaterial);
        p1.position.set(-0.2, 2.85, 0.52);
        group.add(p1);

        const p2 = new THREE.Mesh(pupilGeometry, pupilMaterial);
        p2.position.set(0.2, 2.85, 0.52);
        group.add(p2);

        // Cute blush
        const blushGeometry = getGeometry('circle', 0.12, 12);
        const blushMaterial = getMaterial('basic', {
            color: 0xFF1493,
            transparent: true,
            opacity: 0.5
        });
        const blush1 = new THREE.Mesh(blushGeometry, blushMaterial);
        blush1.position.set(-0.35, 2.7, 0.48);
        group.add(blush1);

        const blush2 = new THREE.Mesh(blushGeometry, blushMaterial);
        blush2.position.set(0.35, 2.7, 0.48);
        group.add(blush2);

        // Lollipop magic wand
        const stickGeometry = getGeometry('cylinder', 0.04, 0.04, 2.5, 8);
        const stickMaterial = getMaterial('lambert', { color: 0xFFFFFF });
        const stick = new THREE.Mesh(stickGeometry, stickMaterial);
        stick.position.set(0.7, 1.5, 0.3);
        stick.rotation.z = -0.2;
        group.add(stick);

        // Lollipop swirl top
        const lolliGeometry = getGeometry('sphere', 0.3, 16, 16);
        const lolliMaterial = getMaterial('phong', {
            color: 0xFF00FF,
            shininess: 80
        });
        const lolli = new THREE.Mesh(lolliGeometry, lolliMaterial);
        lolli.position.set(0.8, 3.0, 0.3);
        group.add(lolli);
        group.staffOrb = lolli;

        // Swirl pattern on lollipop
        const lolliSwirlGeometry = getGeometry('torus', 0.2, 0.05, 8, 16, Math.PI * 2);
        const lolliSwirlMaterial = getMaterial('phong', { color: sparkleWhite });
        const lolliSwirl = new THREE.Mesh(lolliSwirlGeometry, lolliSwirlMaterial);
        lolliSwirl.position.set(0.8, 3.0, 0.35);
        group.add(lolliSwirl);
    }
    
    function buildWitch(group) {
        // WITCH - green-skinned crone with pointy hat and broomstick
        const witchGreen = 0x3a6030;
        const witchDark = 0x1a3010;
        const hatBlack = 0x1a1a1a;

        // Hunched robed body
        const bodyGeometry = getGeometry('cylinder', 0.5, 0.9, 2.2, 12);
        const bodyMaterial = getMaterial('lambert', { color: 0x1a1a2a });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.3;
        body.rotation.x = 0.15;
        body.castShadow = true;
        group.add(body);

        // Ragged cloak edges
        for (let i = 0; i < 8; i++) {
            const ragGeometry = getGeometry('cone', 0.15, 0.5, 4);
            const ragMaterial = getMaterial('lambert', { color: 0x0a0a15 });
            const rag = new THREE.Mesh(ragGeometry, ragMaterial);
            const angle = (i / 8) * Math.PI * 2;
            rag.position.set(Math.cos(angle) * 0.8, 0.25, Math.sin(angle) * 0.8);
            rag.rotation.x = Math.PI;
            group.add(rag);
        }

        // Witch head - pointed chin
        const headGeometry = new THREE.SphereGeometry(0.45, 16, 16);
        headGeometry.scale(1, 1.1, 0.9);
        const headMaterial = getMaterial('lambert', { color: witchGreen });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.7;
        head.castShadow = true;
        group.add(head);

        // Pointed chin
        const chinGeometry = getGeometry('cone', 0.15, 0.3, 6);
        const chin = new THREE.Mesh(chinGeometry, headMaterial);
        chin.position.set(0, 2.3, 0.25);
        chin.rotation.x = -0.5;
        group.add(chin);

        // Long hooked nose
        const noseGeometry = getGeometry('cone', 0.08, 0.35, 6);
        const nose = new THREE.Mesh(noseGeometry, headMaterial);
        nose.position.set(0, 2.65, 0.5);
        nose.rotation.x = Math.PI / 2 + 0.4;
        group.add(nose);

        // Wart on nose
        const wartGeometry = getGeometry('sphere', 0.04, 8, 8);
        const wartMaterial = getMaterial('lambert', { color: witchDark });
        const wart = new THREE.Mesh(wartGeometry, wartMaterial);
        wart.position.set(0.05, 2.62, 0.58);
        group.add(wart);

        // Glowing evil eyes
        const eyeGeometry = getGeometry('sphere', 0.1, 12, 12);
        const eyeMaterial = getMaterial('basic', {
            color: 0x00FF00,
            transparent: true,
            opacity: 0.9
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.15, 2.75, 0.38);
        group.add(e1);

        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.15, 2.75, 0.38);
        group.add(e2);

        // Sinister grin
        const mouthGeometry = getGeometry('torus', 0.12, 0.02, 8, 16, Math.PI);
        const mouthMaterial = getMaterial('basic', { color: 0x400000 });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 2.45, 0.4);
        group.add(mouth);

        // Pointy witch hat
        const hatBrimGeometry = getGeometry('cylinder', 0.7, 0.7, 0.08, 12);
        const hatMaterial = getMaterial('lambert', { color: hatBlack });
        const hatBrim = new THREE.Mesh(hatBrimGeometry, hatMaterial);
        hatBrim.position.y = 3.15;
        group.add(hatBrim);

        const hatConeGeometry = getGeometry('cone', 0.4, 1.2, 12);
        const hatCone = new THREE.Mesh(hatConeGeometry, hatMaterial);
        hatCone.position.y = 3.8;
        hatCone.rotation.z = 0.15; // Slightly crooked
        group.add(hatCone);

        // Hat buckle
        const buckleGeometry = getGeometry('box', 0.2, 0.15, 0.05);
        const buckleMaterial = getMaterial('lambert', { color: 0xFFD700 });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 3.25, 0.38);
        group.add(buckle);

        // Scraggly hair
        const hairMaterial = getMaterial('lambert', { color: 0x333333 });
        for (let i = 0; i < 5; i++) {
            const hairGeometry = getGeometry('cylinder', 0.02, 0.01, 0.4 + Math.random() * 0.3, 4);
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            const angle = Math.PI + (i - 2) * 0.3;
            hair.position.set(Math.cos(angle) * 0.35, 2.45, Math.sin(angle) * 0.35);
            hair.rotation.x = 0.5 + Math.random() * 0.3;
            hair.rotation.z = (Math.random() - 0.5) * 0.4;
            group.add(hair);
        }

        // Broomstick (staff equivalent)
        const broomStickGeometry = getGeometry('cylinder', 0.04, 0.04, 2.8, 6);
        const broomStickMaterial = getMaterial('lambert', { color: 0x5c3d2e });
        const broomStick = new THREE.Mesh(broomStickGeometry, broomStickMaterial);
        broomStick.position.set(0.7, 1.6, 0.2);
        broomStick.rotation.z = -0.15;
        group.add(broomStick);

        // Broom bristles
        const bristleMaterial = getMaterial('lambert', { color: 0x8B7355 });
        for (let i = 0; i < 12; i++) {
            const bristleGeometry = getGeometry('cylinder', 0.02, 0.01, 0.5, 4);
            const bristle = new THREE.Mesh(bristleGeometry, bristleMaterial);
            const angle = (i / 12) * Math.PI * 2;
            bristle.position.set(
                0.7 + Math.cos(angle) * 0.1,
                0.15,
                0.2 + Math.sin(angle) * 0.1
            );
            bristle.rotation.x = 0.2 + Math.random() * 0.2;
            bristle.rotation.z = (Math.random() - 0.5) * 0.3;
            group.add(bristle);
        }

        // Magic orb (glowing green)
        const orbGeometry = getGeometry('sphere', 0.2, 16, 16);
        const orbMaterial = getMaterial('basic', {
            color: 0x00FF44,
            transparent: true,
            opacity: 0.8
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(-0.5, 2.2, 0.4);
        group.add(orb);
        group.staffOrb = orb;

        // Orb glow (emissive mesh instead of PointLight for perf)
        const orbGlowGeometry = getGeometry('sphere', 0.25, 8, 8);
        const orbGlowMaterial = getMaterial('basic', { color: 0x00FF44, transparent: true, opacity: 0.35 });
        const orbGlowMesh = new THREE.Mesh(orbGlowGeometry, orbGlowMaterial);
        orbGlowMesh.position.copy(orb.position);
        group.add(orbGlowMesh);
    }
    
    function buildDarkSorcerer(group) {
        // DARK SORCERER - hooded mage with dark magic for ruins level
        const robeBlack = 0x1a1a2a;
        const robeDark = 0x2a2a3a;
        const magicPurple = 0x6622aa;
        const magicGlow = 0x8844cc;

        // Dark hooded robe body
        const bodyGeometry = getGeometry('cylinder', 0.55, 1.0, 2.4, 12);
        const bodyMaterial = getMaterial('lambert', { color: robeBlack });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.4;
        body.castShadow = true;
        group.add(body);

        // Robe details/folds
        for (let i = 0; i < 6; i++) {
            const foldGeometry = getGeometry('box', 0.15, 2.2, 0.08);
            const foldMaterial = getMaterial('lambert', { color: robeDark });
            const fold = new THREE.Mesh(foldGeometry, foldMaterial);
            const angle = (i / 6) * Math.PI * 2;
            fold.position.set(Math.cos(angle) * 0.75, 1.2, Math.sin(angle) * 0.75);
            fold.rotation.y = angle;
            group.add(fold);
        }

        // Ragged robe bottom
        for (let i = 0; i < 10; i++) {
            const ragGeometry = getGeometry('cone', 0.12, 0.5, 4);
            const ragMaterial = getMaterial('lambert', { color: 0x0a0a15 });
            const rag = new THREE.Mesh(ragGeometry, ragMaterial);
            const angle = (i / 10) * Math.PI * 2;
            rag.position.set(Math.cos(angle) * 0.9, 0.2, Math.sin(angle) * 0.9);
            rag.rotation.x = Math.PI;
            group.add(rag);
        }

        // Deep hood
        const hoodGeometry = getGeometry('sphere', 0.45, 16, 16);
        const hoodMaterial = getMaterial('lambert', { color: robeBlack });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.y = 2.75;
        hood.scale.z = 1.2;
        hood.castShadow = true;
        group.add(hood);

        // Hood opening (dark face)
        const faceGeometry = getGeometry('sphere', 0.35, 12, 12);
        const faceMaterial = getMaterial('basic', { color: 0x000005 });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 2.7, 0.25);
        face.scale.z = 0.7;
        group.add(face);

        // Glowing eyes in the darkness
        const eyeGeometry = getGeometry('sphere', 0.07, 8, 8);
        const eyeMaterial = getMaterial('basic', {
            color: magicPurple,
            transparent: true,
            opacity: 1.0
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.12, 2.73, 0.42);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.12, 2.73, 0.42);
        group.add(eye2);

        // Eye glow (emissive mesh instead of PointLight for perf)
        const eyeGlowGeometry = getGeometry('sphere', 0.15, 8, 8);
        const eyeGlowMaterial = getMaterial('basic', { color: magicPurple, transparent: true, opacity: 0.4 });
        const eyeGlowMesh = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        eyeGlowMesh.position.set(0, 2.73, 0.45);
        group.add(eyeGlowMesh);

        // Skeletal hands
        const handMaterial = getMaterial('lambert', { color: 0x8a7a6a });
        const handGeometry = getGeometry('box', 0.1, 0.15, 0.08);
        
        // Left hand
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.5, 1.6, 0.4);
        group.add(leftHand);

        // Bony fingers on left hand
        for (let i = 0; i < 4; i++) {
            const fingerGeometry = getGeometry('cylinder', 0.015, 0.01, 0.12, 4);
            const finger = new THREE.Mesh(fingerGeometry, handMaterial);
            finger.position.set(-0.52 + i * 0.025, 1.52, 0.42);
            finger.rotation.x = 0.3;
            group.add(finger);
        }

        // Right hand (holding staff)
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.55, 1.8, 0.3);
        group.add(rightHand);

        // Dark magic staff
        const staffGeometry = getGeometry('cylinder', 0.04, 0.05, 2.8, 8);
        const staffMaterial = getMaterial('lambert', { color: 0x1a0a1a });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.6, 1.6, 0.25);
        staff.rotation.z = -0.1;
        group.add(staff);

        // Staff head - twisted metal
        const staffHeadGeometry = new THREE.TorusKnotGeometry(0.12, 0.03, 32, 8, 2, 3);
        const staffHeadMaterial = getMaterial('lambert', { color: 0x2a1a2a });
        const staffHead = new THREE.Mesh(staffHeadGeometry, staffHeadMaterial);
        staffHead.position.set(0.55, 3.0, 0.25);
        staffHead.rotation.x = Math.PI / 2;
        group.add(staffHead);

        // Magic orb in staff head
        const orbGeometry = getGeometry('sphere', 0.15, 16, 16);
        const orbMaterial = getMaterial('basic', {
            color: magicGlow,
            transparent: true,
            opacity: 0.85
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.55, 3.0, 0.25);
        group.add(orb);
        group.staffOrb = orb;

        // Magic orb glow (emissive mesh instead of PointLight for perf)
        const staffOrbGlowGeometry = getGeometry('sphere', 0.3, 8, 8);
        const staffOrbGlowMaterial = getMaterial('basic', { color: magicPurple, transparent: true, opacity: 0.35 });
        const staffOrbGlowMesh = new THREE.Mesh(staffOrbGlowGeometry, staffOrbGlowMaterial);
        staffOrbGlowMesh.position.copy(orb.position);
        group.add(staffOrbGlowMesh);

        // Dark energy particles around staff (decorative)
        const particleMaterial = getMaterial('basic', {
            color: magicGlow,
            transparent: true,
            opacity: 0.5
        });
        for (let i = 0; i < 5; i++) {
            const particleGeometry = getGeometry('sphere', 0.03 + Math.random() * 0.02, 6, 6);
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = (i / 5) * Math.PI * 2;
            particle.position.set(
                0.55 + Math.cos(angle) * 0.25,
                2.8 + Math.sin(angle) * 0.25,
                0.25
            );
            group.add(particle);
        }

        // Floating spell book (left side)
        const bookGeometry = getGeometry('box', 0.25, 0.3, 0.08);
        const bookMaterial = getMaterial('lambert', { color: 0x3a2a1a });
        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(-0.65, 2.0, 0.3);
        book.rotation.y = 0.3;
        book.rotation.z = -0.1;
        group.add(book);

        // Book pages
        const pagesGeometry = getGeometry('box', 0.2, 0.25, 0.06);
        const pagesMaterial = getMaterial('lambert', { color: 0xd0c0a0 });
        const pages = new THREE.Mesh(pagesGeometry, pagesMaterial);
        pages.position.set(-0.64, 2.0, 0.31);
        pages.rotation.y = 0.3;
        pages.rotation.z = -0.1;
        group.add(pages);

        // Glowing runes on book
        const runeMaterial = getMaterial('basic', {
            color: magicPurple,
            transparent: true,
            opacity: 0.7
        });
        const runeGeometry = getGeometry('circle', 0.03, 6);
        for (let i = 0; i < 3; i++) {
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.set(-0.62, 1.95 + i * 0.08, 0.36);
            rune.rotation.y = 0.3;
            group.add(rune);
        }
    }
    
    function buildEnchantress(group) {
        // ENCHANTRESS - beautiful fairy sorceress for enchanted theme
        const robeColor = 0x9370DB;   // Medium purple
        const skinColor = 0xFFDBFF;   // Light pink
        const hairColor = 0xE6E6FA;   // Lavender
        const magicColor = 0x00FFAA;  // Spring green

        // Flowing robe body
        const robeGeometry = getGeometry('cone', 0.6, 2.0, 8);
        const robeMaterial = getMaterial('lambert', { color: robeColor });
        const robe = new THREE.Mesh(robeGeometry, robeMaterial);
        robe.position.y = 1.0;
        robe.rotation.x = Math.PI;
        robe.castShadow = true;
        group.add(robe);

        // Upper body
        const torsoGeometry = getGeometry('cylinder', 0.2, 0.25, 0.5, 8);
        const torsoMaterial = getMaterial('lambert', { color: robeColor });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 1.8;
        torso.castShadow = true;
        group.add(torso);

        // Head
        const headGeometry = getGeometry('sphere', 0.28, 12, 12);
        const headMaterial = getMaterial('lambert', { color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.4;
        head.castShadow = true;
        group.add(head);

        // Flowing hair
        const hairMaterial = getMaterial('lambert', { color: hairColor });
        for (let i = 0; i < 6; i++) {
            const strandGeometry = getGeometry('cylinder', 0.04, 0.02, 0.5 + Math.random() * 0.2, 6);
            const strand = new THREE.Mesh(strandGeometry, hairMaterial);
            const angle = ((i / 6) * Math.PI) + Math.PI * 0.5;
            strand.position.set(
                Math.cos(angle) * 0.2,
                2.3,
                Math.sin(angle) * 0.2 - 0.1
            );
            strand.rotation.x = 0.3;
            strand.rotation.z = Math.cos(angle) * 0.3;
            group.add(strand);
        }

        // Pretty eyes
        const eyeGeometry = getGeometry('sphere', 0.05, 8, 8);
        const eyeMaterial = getMaterial('basic', { color: 0x9932CC });
        [-0.1, 0.1].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 2.45, 0.23);
            group.add(eye);
        });

        // Wizard staff
        const staffGeometry = getGeometry('cylinder', 0.04, 0.05, 2.5, 8);
        const staffMaterial = getMaterial('lambert', { color: 0x8B4513 });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.6, 1.2, 0.2);
        staff.rotation.z = -0.2;
        staff.castShadow = true;
        group.add(staff);

        // Staff crystal top
        const crystalGeometry = getGeometry('octahedron', 0.15, 0);
        const crystalMaterial = getMaterial('basic', { color: magicColor, transparent: true, opacity: 0.8 });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.set(0.5, 2.5, 0.15);
        group.add(crystal);

        // Floating magic particles
        for (let i = 0; i < 5; i++) {
            const particleGeometry = getGeometry('sphere', 0.04, 6, 6);
            const particleMaterial = getMaterial('basic', { color: [magicColor, 0xFF69B4, 0xFFD700][i % 3] });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                0.5 + (Math.random() - 0.5) * 0.5,
                2.3 + Math.random() * 0.5,
                0.15 + (Math.random() - 0.5) * 0.3
            );
            group.add(particle);
        }
        
        group.userData.isEnchantress = true;
    }
    
    function buildEasterWizard(group) {
        // EASTER WIZARD - bunny in wizard robes with carrot staff
        const robeColor = 0xE6E6FA;     // Lavender
        const furColor = 0xFFFFFF;      // White
        const staffColor = 0xFFD700;    // Gold
        const gemColor = 0xFFA500;      // Orange (carrot)

        // Body (robe)
        const robeGeometry = getGeometry('cone', 0.5, 1.2, 8);
        const robeMaterial = getMaterial('lambert', { color: robeColor });
        const robe = new THREE.Mesh(robeGeometry, robeMaterial);
        robe.position.y = 0.6;
        robe.castShadow = true;
        group.add(robe);

        // Head (bunny)
        const headGeometry = getGeometry('sphere', 0.35, 16, 16);
        const headMaterial = getMaterial('lambert', { color: furColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        group.add(head);

        // Ears
        const earGeometry = getGeometry('cylinder', 0.06, 0.1, 0.5, 8);
        const innerEarMaterial = getMaterial('lambert', { color: 0xFFB6C1 });
        [-0.12, 0.12].forEach((x, i) => {
            const ear = new THREE.Mesh(earGeometry, headMaterial);
            ear.position.set(x, 2.0, 0);
            ear.rotation.z = i === 0 ? 0.15 : -0.15;
            ear.castShadow = true;
            group.add(ear);
        });

        // Eyes
        const eyeGeometry = getGeometry('sphere', 0.06, 8, 8);
        const eyeMaterial = getMaterial('basic', { color: 0x000000 });
        [-0.1, 0.1].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.55, 0.3);
            group.add(eye);
        });

        // Nose
        const noseGeometry = getGeometry('sphere', 0.05, 8, 8);
        const noseMaterial = getMaterial('lambert', { color: 0xFF69B4 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 1.45, 0.35);
        group.add(nose);

        // Wizard hat
        const hatGeometry = getGeometry('cone', 0.3, 0.6, 8);
        const hatMaterial = getMaterial('lambert', { color: 0x9370DB });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 2.1;
        hat.castShadow = true;
        group.add(hat);

        // Hat brim
        const brimGeometry = getGeometry('cylinder', 0.4, 0.4, 0.05, 16);
        const brim = new THREE.Mesh(brimGeometry, hatMaterial);
        brim.position.y = 1.8;
        group.add(brim);

        // Staff (carrot)
        const staffGeometry = getGeometry('cylinder', 0.03, 0.08, 1.2, 8);
        const staffMaterial = getMaterial('lambert', { color: gemColor });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.5, 1.0, 0.2);
        staff.rotation.z = -0.3;
        group.add(staff);

        // Staff top (leaf)
        const leafGeometry = getGeometry('cone', 0.1, 0.2, 6);
        const leafMaterial = getMaterial('lambert', { color: 0x228B22 });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.set(0.4, 1.7, 0.15);
        group.add(leaf);

        // Magic sparkles
        for (let i = 0; i < 5; i++) {
            const sparkleGeometry = getGeometry('sphere', 0.04, 6, 6);
            const sparkleMaterial = getMaterial('basic', { 
                color: [0xFFD700, 0xFF69B4, 0x98FB98][i % 3] 
            });
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
            sparkle.position.set(
                0.3 + Math.random() * 0.4,
                1.5 + Math.random() * 0.5,
                0.1 + Math.random() * 0.2
            );
            group.add(sparkle);
        }

        group.userData.isEasterWizard = true;
    }
    
    function buildWalkingEvilSanta(group) {
        // Walking evil Santa for Christmas theme (no sledge)
        // Red Santa coat
        const bodyGeometry = getGeometry('cylinder', 0.6, 1.0, 2.5, 12);
        const bodyMaterial = getMaterial('lambert', { color: 0xcc0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);
        
        // White fur trim on coat
        const trimGeometry = getGeometry('cylinder', 1.02, 1.02, 0.3, 12);
        const trimMaterial = getMaterial('lambert', { color: 0xffffff });
        const trim = new THREE.Mesh(trimGeometry, trimMaterial);
        trim.position.y = 0.4;
        group.add(trim);
        
        // Belt
        const beltGeometry = getGeometry('cylinder', 1.01, 1.01, 0.25, 12);
        const beltMaterial = getMaterial('lambert', { color: 0x1a1a1a });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 1.5;
        group.add(belt);
        
        // Gold belt buckle
        const buckleGeometry = getGeometry('box', 0.35, 0.35, 0.1);
        const buckleMaterial = getMaterial('lambert', { color: 0xffd700 });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 1.5, 1.05);
        group.add(buckle);
        
        // Head with pale skin
        const headGeometry = getGeometry('sphere', 0.6, 16, 16);
        const headMaterial = getMaterial('lambert', { color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.0;
        head.castShadow = true;
        group.add(head);
        
        // White beard
        const beardGeometry = new THREE.SphereGeometry(0.55, 16, 12);
        beardGeometry.scale(1.0, 0.8, 0.9);
        const beardMaterial = getMaterial('lambert', { color: 0xffffff });
        const beard = new THREE.Mesh(beardGeometry, beardMaterial);
        beard.position.set(0, 2.7, 0.3);
        group.add(beard);
        
        // Red Santa hat
        const hatGeometry = getGeometry('cone', 0.7, 1.5, 8);
        const hatMaterial = getMaterial('lambert', { color: 0xcc0000 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 4.0;
        hat.castShadow = true;
        group.add(hat);
        
        // White fur trim on hat
        const hatTrimGeometry = getGeometry('torus', 0.72, 0.15, 8, 16);
        const hatTrim = new THREE.Mesh(hatTrimGeometry, trimMaterial);
        hatTrim.rotation.x = Math.PI / 2;
        hatTrim.position.y = 3.4;
        group.add(hatTrim);
        
        // White pompom on hat
        const pompomGeometry = getGeometry('sphere', 0.2, 12, 12);
        const pompom = new THREE.Mesh(pompomGeometry, trimMaterial);
        pompom.position.y = 4.75;
        group.add(pompom);
        
        // Dark evil eyes
        const eyeMaterial = getMaterial('basic', { color: 0xff0000 });
        const eyeGeometry = getGeometry('sphere', 0.12, 16, 16);
        [-0.22, 0.22].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 3.1, 0.52);
            group.add(eye);
        });
        
        // Candy cane staff instead of wizard staff
        const staffGeometry = getGeometry('cylinder', 0.08, 0.08, 3.0, 8);
        const staffMaterial = getMaterial('lambert', { color: 0xffffff });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.8, 1.5, 0.3);
        staff.rotation.z = -0.2;
        group.add(staff);
        
        // Red stripes on candy cane
        for (let i = 0; i < 6; i++) {
            const stripeGeometry = getGeometry('cylinder', 0.09, 0.09, 0.3, 8);
            const stripeMaterial = getMaterial('lambert', { color: 0xff0000 });
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.position.set(0.8, 0.5 + i * 0.5, 0.3);
            stripe.rotation.z = -0.2;
            group.add(stripe);
        }
        
        // Curved top of candy cane
        const caneTopGeometry = getGeometry('torus', 0.3, 0.08, 8, 16, Math.PI);
        const caneTop = new THREE.Mesh(caneTopGeometry, staffMaterial);
        caneTop.rotation.z = Math.PI / 2 - 0.2;
        caneTop.position.set(0.85, 3.2, 0.3);
        group.add(caneTop);
        
        // Red glowing ornament orb
        const orbGeometry = getGeometry('sphere', 0.25, 12, 12);
        const orbMaterial = getMaterial('basic', { color: 0xff0000 });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.55, 3.2, 0.3);
        group.add(orb);
    }
    
    function buildStandardWizard(group, textures) {
        // Use ice theme robe texture if in ice level
        const robeTexture = G.iceTheme ? textures.wizardRobeIce : textures.wizardRobe;
        
        // Tall robed body (bigger than guardians)
        const bodyGeometry = getGeometry('cylinder', 0.6, 1.0, 2.5, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            map: robeTexture,
            color: G.iceTheme ? 0x6688aa : 0x8866aa  // Tint to enhance texture
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        group.add(body);
        
        // Robe details - glowing trim
        const trimGeometry = getGeometry('torus', 0.75, 0.1, 8, 16);
        const trimMaterial = getMaterial('basic', { 
            color: G.iceTheme ? 0x00FFFF : 0xFF00FF,
            transparent: true,
            opacity: 0.8
        });
        const bottomTrim = new THREE.Mesh(trimGeometry, trimMaterial);
        bottomTrim.rotation.x = Math.PI / 2;
        bottomTrim.position.y = 0.3;
        group.add(bottomTrim);
        
        // Head (larger than guardian)
        const headGeometry = getGeometry('sphere', 0.6, 16, 16);
        const headMaterial = getTexturedMaterial('lambert', { map: textures.goblinSkin }, 'goblinSkin');
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.0;
        head.castShadow = true;
        group.add(head);
        
        // Wizard hat with texture
        const hatGeometry = getGeometry('cone', 0.7, 1.5, 8);
        const hatMaterial = new THREE.MeshLambertMaterial({ 
            map: robeTexture,
            color: G.iceTheme ? 0x5577aa : 0x7755aa
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 4.0;
        hat.castShadow = true;
        group.add(hat);
        
        // Hat brim with glow
        const brimGeometry = getGeometry('torus', 0.75, 0.15, 8, 16);
        const brimMaterial = new THREE.MeshLambertMaterial({ 
            map: robeTexture,
            color: G.iceTheme ? 0x4466aa : 0x6644aa
        });
        const brim = new THREE.Mesh(brimGeometry, brimMaterial);
        brim.rotation.x = Math.PI / 2;
        brim.position.y = 3.4;
        group.add(brim);
        
        // Glowing purple/cyan eyes
        const eyeGeometry = getGeometry('sphere', 0.12, 16, 16);
        const eyeMaterial = getMaterial('basic', { 
            color: G.iceTheme ? 0x00FFFF : 0xFF00FF,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.22, 3.0, 0.52);
        group.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.22, 3.0, 0.52);
        group.add(e2);
        
        // Pointy ears
        const earGeometry = getGeometry('cone', 0.2, 0.6, 4);
        const earMaterial = getTexturedMaterial('lambert', { map: textures.goblinSkin }, 'goblinSkin');
        const er1 = new THREE.Mesh(earGeometry, earMaterial);
        er1.rotation.z = Math.PI / 2;
        er1.position.set(-0.7, 3.0, 0);
        er1.castShadow = true;
        group.add(er1);
        
        const er2 = new THREE.Mesh(earGeometry, earMaterial);
        er2.rotation.z = -Math.PI / 2;
        er2.position.set(0.7, 3.0, 0);
        er2.castShadow = true;
        group.add(er2);
        
        // Magic staff
        const staffGeometry = getGeometry('cylinder', 0.06, 0.08, 3.0, 8);
        const staffMaterial = getMaterial('lambert', { color: 0x8B4513 });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.8, 1.5, 0.3);
        staff.rotation.z = -0.2;
        staff.castShadow = true;
        group.add(staff);
        
        // Glowing orb on staff
        const orbGeometry = getGeometry('sphere', 0.25, 12, 12);
        const orbMaterial = getMaterial('basic', { 
            color: G.iceTheme ? 0x00FFFF : 0xFF4500,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.9, 3.2, 0.3);
        group.add(orb);
        group.staffOrb = orb; // Store for animation
    }
    
    function buildCrownWizard(group) {
        // CROWN WIZARD - huge golden crown with legs that shoots fireballs
        const crownGold = 0xFFD700;         // Bright gold
        const crownDarkGold = 0xDAA520;     // Darker gold
        const gemRed = 0xFF0000;            // Ruby gems
        const gemBlue = 0x0066FF;           // Sapphire gems
        const gemGreen = 0x00FF00;          // Emerald gems
        const legColor = 0x8B6914;          // Bronze legs
        const eyeGlow = 0xFF4500;           // Orange fire eyes
        
        // Main crown base (large cylinder)
        const crownBaseGeometry = getGeometry('cylinder', 1.2, 1.4, 0.8, 16);
        const crownMaterial = getMaterial('lambert', { 
            color: crownGold,
            emissive: crownGold,
            emissiveIntensity: 0.2
        });
        const crownBase = new THREE.Mesh(crownBaseGeometry, crownMaterial);
        crownBase.position.y = 2.4;
        crownBase.castShadow = true;
        group.add(crownBase);
        
        // Crown rim detail
        const rimGeometry = getGeometry('torus', 1.3, 0.1, 8, 24);
        const rimMaterial = getMaterial('lambert', { color: crownDarkGold });
        const topRim = new THREE.Mesh(rimGeometry, rimMaterial);
        topRim.position.y = 2.8;
        topRim.rotation.x = Math.PI / 2;
        group.add(topRim);
        
        const bottomRim = new THREE.Mesh(rimGeometry, rimMaterial);
        bottomRim.position.y = 2.0;
        bottomRim.rotation.x = Math.PI / 2;
        group.add(bottomRim);
        
        // Crown points (8 large points around the top)
        const numPoints = 8;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            
            // Main point
            const pointGeometry = getGeometry('cone', 0.25, 1.2, 6);
            const point = new THREE.Mesh(pointGeometry, crownMaterial);
            point.position.set(
                Math.cos(angle) * 1.0,
                3.4,
                Math.sin(angle) * 1.0
            );
            point.castShadow = true;
            group.add(point);
            
            // Gem on each point
            const gemColors = [gemRed, gemBlue, gemGreen];
            const gemGeometry = getGeometry('octahedron', 0.15, 0);
            const gemMaterial = getMaterial('lambert', { 
                color: gemColors[i % 3],
                emissive: gemColors[i % 3],
                emissiveIntensity: 0.4
            });
            const gem = new THREE.Mesh(gemGeometry, gemMaterial);
            gem.position.set(
                Math.cos(angle) * 1.0,
                4.1,
                Math.sin(angle) * 1.0
            );
            group.add(gem);
        }
        
        // Front face on the crown
        // Evil glowing eyes
        const eyeGeometry = getGeometry('sphere', 0.2, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: eyeGlow });
        [-0.4, 0.4].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 2.6, 1.35);
            group.add(eye);
            
            // Eye glow
            const glowGeometry = getGeometry('sphere', 0.3, 8, 8);
            const glowMaterial = getMaterial('basic', { 
                color: eyeGlow,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, 2.6, 1.35);
            group.add(glow);
        });
        
        // Angry eyebrows (gold ridges)
        const browGeometry = getGeometry('box', 0.4, 0.08, 0.1);
        const browMaterial = getMaterial('lambert', { color: crownDarkGold });
        [-0.4, 0.4].forEach((x, i) => {
            const brow = new THREE.Mesh(browGeometry, browMaterial);
            brow.position.set(x, 2.85, 1.38);
            brow.rotation.z = i === 0 ? -0.4 : 0.4;
            group.add(brow);
        });
        
        // Large center gem (forehead jewel)
        const centerGemGeometry = getGeometry('octahedron', 0.35, 0);
        const centerGemMaterial = getMaterial('lambert', { 
            color: gemRed,
            emissive: gemRed,
            emissiveIntensity: 0.5
        });
        const centerGem = new THREE.Mesh(centerGemGeometry, centerGemMaterial);
        centerGem.position.set(0, 2.4, 1.5);
        centerGem.rotation.y = Math.PI / 4;
        group.add(centerGem);
        group.staffOrb = centerGem; // For spell casting animation
        
        // Inner crown glow (magical energy)
        const innerGlowGeometry = getGeometry('cylinder', 0.8, 0.8, 0.6, 16);
        const innerGlowMaterial = getMaterial('basic', { 
            color: 0xFF6600,
            transparent: true,
            opacity: 0.3
        });
        const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
        innerGlow.position.y = 2.4;
        group.add(innerGlow);
        
        // Mechanical/magical legs
        const legGeometry = getGeometry('cylinder', 0.15, 0.2, 1.8, 8);
        const legMaterial = getMaterial('lambert', { color: legColor });
        [-0.6, 0.6].forEach(x => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, 1.0, 0);
            leg.castShadow = true;
            group.add(leg);
        });
        
        // Ornate feet
        const footGeometry = getGeometry('box', 0.4, 0.15, 0.5);
        const footMaterial = getMaterial('lambert', { color: crownGold });
        [-0.6, 0.6].forEach(x => {
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.position.set(x, 0.1, 0.1);
            foot.castShadow = true;
            group.add(foot);
        });
        
        // Small decorative arms (scepter-like)
        const armGeometry = getGeometry('cylinder', 0.08, 0.1, 1.2, 6);
        [-1.3, 1.3].forEach((x, i) => {
            const arm = new THREE.Mesh(armGeometry, legMaterial);
            arm.position.set(x, 2.2, 0);
            arm.rotation.z = i === 0 ? 0.6 : -0.6;
            arm.castShadow = true;
            group.add(arm);
            
            // Small orb at end
            const orbGeometry = getGeometry('sphere', 0.15, 12, 12);
            const orbMaterial = getMaterial('basic', { 
                color: 0xFF4500,
                transparent: true,
                opacity: 0.8
            });
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            orb.position.set(x * 1.35, 1.6, 0);
            group.add(orb);
        });
    }
    
    // ========================================
    // REGISTER WITH ENTITY REGISTRY
    // ========================================
    
    ENTITY_REGISTRY.register('wizard', {
        create: createWizard
    });
    
    // Export globally for backward compatibility
    window.createWizard = createWizard;
    
})();
