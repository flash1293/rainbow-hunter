// entity-giant.js - Giant enemy with theme variants
// Theme variants: Marshmallow Monster (candy), Executioner (graveyard), Giant Spider (ruins)

(function() {
    'use strict';
    
    /**
     * Create a giant enemy - large slow enemy that takes multiple hits
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} patrolLeft - Left patrol boundary
     * @param {number} patrolRight - Right patrol boundary  
     * @param {number} speed - Movement speed (default: 0.018)
     * @returns {object} Giant entity object
     */
    function createGiant(x, z, patrolLeft, patrolRight, speed = 0.018) {
        const textures = getTerrainTextures(THREE);
        const giantGrp = new THREE.Group();
        
        if (G.candyTheme) {
            buildMarshmallowMonster(giantGrp);
        } else if (G.graveyardTheme) {
            buildExecutioner(giantGrp);
        } else if (G.ruinsTheme) {
            buildGiantSpider(giantGrp);
        } else if (G.computerTheme) {
            buildMainframe(giantGrp);
        } else if (G.enchantedTheme) {
            buildTreant(giantGrp);
        } else if (G.easterTheme) {
            buildChick(giantGrp);
        } else if (G.christmasTheme) {
            buildEvilSnowman(giantGrp);
        } else if (G.crystalTheme) {
            buildCrystalGiant(giantGrp);
        } else if (G.rapunzelTheme) {
            buildTowerGiant(giantGrp);
        } else {
            buildStandardGiant(giantGrp, textures);
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
    
    // ========================================
    // THEME-SPECIFIC BUILDERS
    // ========================================
    
    function buildMainframe(group) {
        // MAINFRAME - massive boxy server unit with blinking LEDs
        const chassisColor = 0x2A2A3A;   // Dark server chassis
        const panelColor = 0x1A1A2A;     // Darker panel
        const ledGreen = 0x00FF00;       // Active LED
        const ledOrange = 0xFF6600;      // Warning LED
        const screenColor = 0x003300;    // Terminal screen

        // Main chassis body - tall server rack
        const chassisGeometry = getGeometry('box', 3.5, 6.0, 2.5);
        const chassisMaterial = getMaterial('phong', {
            color: chassisColor,
            shininess: 30
        });
        const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassis.position.y = 3.5;
        chassis.castShadow = true;
        group.add(chassis);

        // Front panel (slightly recessed)
        const panelGeometry = getGeometry('box', 3.2, 5.6, 0.1);
        const panelMaterial = getMaterial('phong', {
            color: panelColor,
            shininess: 20
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.set(0, 3.5, 1.25);
        group.add(panel);

        // Terminal screen (face)
        const screenGeometry = getGeometry('box', 2.0, 1.5, 0.05);
        const screenMaterial = getMaterial('basic', {
            color: screenColor
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 5.5, 1.3);
        group.add(screen);

        // Eyes on screen (terminal cursors)
        const eyeGeometry = getGeometry('box', 0.3, 0.4, 0.02);
        const eyeMaterial = getMaterial('basic', {
            color: ledGreen,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.5, 5.6, 1.35);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.5, 5.6, 1.35);
        group.add(eye2);

        // Angry "eyebrows" - error indicators
        const browGeometry = getGeometry('box', 0.5, 0.08, 0.02);
        const browMaterial = getMaterial('basic', { color: 0xFF0000 });
        const brow1 = new THREE.Mesh(browGeometry, browMaterial);
        brow1.position.set(-0.5, 5.9, 1.35);
        brow1.rotation.z = 0.3;
        group.add(brow1);

        const brow2 = new THREE.Mesh(browGeometry, browMaterial);
        brow2.position.set(0.5, 5.9, 1.35);
        brow2.rotation.z = -0.3;
        group.add(brow2);

        // LED status lights grid
        const ledGeometry = getGeometry('sphere', 0.08, 8, 8);
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
                const ledColor = Math.random() > 0.3 ? ledGreen : ledOrange;
                const ledMaterial = getMaterial('basic', {
                    color: ledColor,
                    transparent: true,
                    opacity: 0.8 + Math.random() * 0.2
                });
                const led = new THREE.Mesh(ledGeometry, ledMaterial);
                led.position.set(
                    -1.2 + col * 0.5,
                    4.0 - row * 0.4,
                    1.3
                );
                led.userData.blinkOffset = Math.random() * Math.PI * 2;
                group.add(led);
            }
        }

        // Drive bays with activity lights
        for (let i = 0; i < 3; i++) {
            const bayGeometry = getGeometry('box', 2.8, 0.4, 0.15);
            const bayMaterial = getMaterial('lambert', { color: 0x111118 });
            const bay = new THREE.Mesh(bayGeometry, bayMaterial);
            bay.position.set(0, 2.0 + i * 0.6, 1.25);
            group.add(bay);

            // Activity light
            const activityMaterial = getMaterial('basic', {
                color: Math.random() > 0.5 ? ledGreen : ledOrange,
                transparent: true,
                blending: THREE.AdditiveBlending
            });
            const activity = new THREE.Mesh(ledGeometry, activityMaterial);
            activity.position.set(1.2, 2.0 + i * 0.6, 1.35);
            group.add(activity);
        }

        // Ventilation grilles on sides
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 8; i++) {
                const grillGeometry = getGeometry('box', 0.05, 0.3, 2.0);
                const grillMaterial = getMaterial('lambert', { color: 0x0A0A0A });
                const grill = new THREE.Mesh(grillGeometry, grillMaterial);
                grill.position.set(side * 1.8, 1.5 + i * 0.5, 0);
                group.add(grill);
            }
        }

        // Cable "arms" (thick data cables)
        const cableGeometry = getGeometry('cylinder', 0.2, 0.25, 3.0, 8);
        const cableMaterial = getMaterial('lambert', { color: 0x222222 });
        
        const leftCable = new THREE.Mesh(cableGeometry, cableMaterial);
        leftCable.position.set(-2.0, 3.0, 0);
        leftCable.rotation.z = 0.4;
        leftCable.castShadow = true;
        group.add(leftCable);
        group.leftArm = leftCable;

        const rightCable = new THREE.Mesh(cableGeometry, cableMaterial);
        rightCable.position.set(2.0, 3.0, 0);
        rightCable.rotation.z = -0.4;
        rightCable.castShadow = true;
        group.add(rightCable);
        group.rightArm = rightCable;

        // Cable connectors (fists)
        const connectorGeometry = getGeometry('box', 0.6, 0.6, 0.6);
        const connectorMaterial = getMaterial('phong', {
            color: 0x333333,
            emissive: ledOrange,
            emissiveIntensity: 0.2
        });
        
        const leftConn = new THREE.Mesh(connectorGeometry, connectorMaterial);
        leftConn.position.set(-3.0, 1.5, 0);
        group.add(leftConn);
        group.leftFist = leftConn;

        const rightConn = new THREE.Mesh(connectorGeometry, connectorMaterial);
        rightConn.position.set(3.0, 1.5, 0);
        group.add(rightConn);
        group.rightFist = rightConn;

        // Base with wheels/casters
        const baseGeometry = getGeometry('box', 3.8, 0.4, 2.8);
        const baseMaterial = getMaterial('lambert', { color: 0x1A1A1A });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.2;
        group.add(base);

        // Add some floor glow
        const glowGeometry = getGeometry('plane', 4, 3);
        const glowMaterial = getMaterial('basic', {
            color: ledGreen,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = 0.05;
        group.add(glow);

        group.userData.isMainframe = true;
    }
    
    function buildMarshmallowMonster(group) {
        // MARSHMALLOW MONSTER - giant fluffy white creature
        const marshmallowWhite = 0xFFF8F0;
        const marshmallowPink = 0xFFB6C1;

        // Marshmallow body - cylindrical and fluffy
        const bodyGeometry = getGeometry('cylinder', 1.8, 2.0, 4.5, 16);
        const bodyMaterial = getMaterial('phong', {
            color: marshmallowWhite,
            shininess: 30,
            specular: 0xffffff
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3.0;
        body.castShadow = true;
        group.add(body);

        // Fluffy texture bumps on body
        for (let i = 0; i < 12; i++) {
            const bumpGeometry = getGeometry('sphere', 0.4 + Math.random() * 0.3, 12, 12);
            const bump = new THREE.Mesh(bumpGeometry, bodyMaterial);
            const angle = (i / 12) * Math.PI * 2;
            const height = 1.5 + Math.random() * 3;
            bump.position.set(Math.cos(angle) * 1.9, height, Math.sin(angle) * 1.9);
            group.add(bump);
        }

        // Round marshmallow head
        const headGeometry = getGeometry('sphere', 1.4, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 6.0;
        head.castShadow = true;
        group.add(head);

        // Cute angry eyes
        const eyeGeometry = getGeometry('sphere', 0.35, 16, 16);
        const eyeBlackMaterial = getMaterial('basic', { color: 0x000000 });
        const e1 = new THREE.Mesh(eyeGeometry, eyeBlackMaterial);
        e1.position.set(-0.5, 6.2, 1.1);
        group.add(e1);

        const e2 = new THREE.Mesh(eyeGeometry, eyeBlackMaterial);
        e2.position.set(0.5, 6.2, 1.1);
        group.add(e2);

        // Angry eyebrows
        const browGeometry = getGeometry('box', 0.5, 0.12, 0.1);
        const browMaterial = getMaterial('basic', { color: 0x333333 });
        const brow1 = new THREE.Mesh(browGeometry, browMaterial);
        brow1.position.set(-0.5, 6.6, 1.2);
        brow1.rotation.z = 0.3;
        group.add(brow1);

        const brow2 = new THREE.Mesh(browGeometry, browMaterial);
        brow2.position.set(0.5, 6.6, 1.2);
        brow2.rotation.z = -0.3;
        group.add(brow2);

        // Pink blush cheeks
        const blushGeometry = getGeometry('circle', 0.25, 16);
        const blushMaterial = getMaterial('basic', {
            color: marshmallowPink,
            transparent: true,
            opacity: 0.6
        });
        const blush1 = new THREE.Mesh(blushGeometry, blushMaterial);
        blush1.position.set(-0.9, 5.8, 1.15);
        group.add(blush1);

        const blush2 = new THREE.Mesh(blushGeometry, blushMaterial);
        blush2.position.set(0.9, 5.8, 1.15);
        group.add(blush2);

        // Stubby marshmallow arms
        const armGeometry = getGeometry('cylinder', 0.5, 0.7, 2.5, 12);
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-2.3, 3.5, 0);
        leftArm.rotation.z = 0.5;
        leftArm.castShadow = true;
        group.add(leftArm);
        group.leftArm = leftArm;

        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(2.3, 3.5, 0);
        rightArm.rotation.z = -0.5;
        rightArm.castShadow = true;
        group.add(rightArm);
        group.rightArm = rightArm;

        // Round marshmallow fists
        const fistGeometry = getGeometry('sphere', 0.6, 12, 12);
        const leftFist = new THREE.Mesh(fistGeometry, bodyMaterial);
        leftFist.position.set(-3.0, 2.0, 0);
        leftFist.castShadow = true;
        group.add(leftFist);
        group.leftFist = leftFist;

        const rightFist = new THREE.Mesh(fistGeometry, bodyMaterial);
        rightFist.position.set(3.0, 2.0, 0);
        rightFist.castShadow = true;
        group.add(rightFist);
        group.rightFist = rightFist;

        // Stubby legs
        const legGeometry = getGeometry('cylinder', 0.8, 1.0, 2.0, 12);
        const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        leftLeg.position.set(-1.0, 0.8, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
        rightLeg.position.set(1.0, 0.8, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
    }
    
    function buildExecutioner(group) {
        // EXECUTIONER - massive hooded figure with giant axe
        const hoodBlack = 0x0a0a0f;
        const skinPale = 0x6a5a5a;

        // Massive robed body
        const bodyGeometry = getGeometry('cylinder', 1.4, 2.2, 5.0, 12);
        const bodyMaterial = getMaterial('lambert', { color: hoodBlack });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3.2;
        body.castShadow = true;
        group.add(body);

        // Ragged cape edges
        for (let i = 0; i < 12; i++) {
            const ragGeometry = getGeometry('cone', 0.25, 1.0, 4);
            const ragMaterial = getMaterial('lambert', { color: 0x050508 });
            const rag = new THREE.Mesh(ragGeometry, ragMaterial);
            const angle = (i / 12) * Math.PI * 2;
            rag.position.set(Math.cos(angle) * 2.0, 0.5, Math.sin(angle) * 2.0);
            rag.rotation.x = Math.PI;
            group.add(rag);
        }

        // Hood
        const hoodGeometry = getGeometry('cone', 1.2, 2.0, 12);
        const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
        hood.position.y = 6.5;
        hood.castShadow = true;
        group.add(hood);

        // Shadowed face (only glowing eyes visible)
        const faceGeometry = getGeometry('sphere', 0.8, 12, 12);
        const faceMaterial = getMaterial('basic', { color: 0x000000 });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(0, 5.8, 0.4);
        face.scale.z = 0.6;
        group.add(face);

        // Glowing red eyes in the darkness
        const eyeGeometry = getGeometry('sphere', 0.15, 12, 12);
        const eyeMaterial = getMaterial('basic', {
            color: 0xFF0000,
            transparent: true,
            opacity: 1.0
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.25, 5.85, 0.85);
        group.add(e1);

        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.25, 5.85, 0.85);
        group.add(e2);

        // Eye glow (emissive mesh instead of PointLight for perf)
        const eyeGlowGeometry = getGeometry('sphere', 0.2, 8, 8);
        const eyeGlowMaterial = getMaterial('basic', { color: 0xFF0000, transparent: true, opacity: 0.4 });
        const eyeGlowMesh = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        eyeGlowMesh.position.set(0, 5.85, 0.9);
        group.add(eyeGlowMesh);

        // Massive arms
        const armGeometry = getGeometry('cylinder', 0.4, 0.7, 3.5, 8);
        const armMaterial = getMaterial('lambert', { color: hoodBlack });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-2.0, 3.5, 0);
        leftArm.rotation.z = 0.4;
        leftArm.castShadow = true;
        group.add(leftArm);
        group.leftArm = leftArm;

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(2.0, 3.5, 0);
        rightArm.rotation.z = -0.4;
        rightArm.castShadow = true;
        group.add(rightArm);
        group.rightArm = rightArm;

        // Pale hands
        const handGeometry = getGeometry('box', 0.6, 0.6, 0.5);
        const handMaterial = getMaterial('lambert', { color: skinPale });
        
        const leftFist = new THREE.Mesh(handGeometry, handMaterial);
        leftFist.position.set(-2.6, 1.5, 0);
        leftFist.castShadow = true;
        group.add(leftFist);
        group.leftFist = leftFist;

        const rightFist = new THREE.Mesh(handGeometry, handMaterial);
        rightFist.position.set(2.6, 1.5, 0);
        rightFist.castShadow = true;
        group.add(rightFist);
        group.rightFist = rightFist;

        // GIANT AXE
        // Axe handle
        const handleGeometry = getGeometry('cylinder', 0.12, 0.12, 5.0, 8);
        const handleMaterial = getMaterial('lambert', { color: 0x3a2a1a });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(2.8, 3.5, 0.5);
        handle.rotation.z = -0.3;
        group.add(handle);

        // Axe blade (double-sided)
        const bladeGeometry = getGeometry('box', 2.0, 2.5, 0.15);
        const bladeMaterial = getMaterial('lambert', { color: 0x4a4a4a });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(3.5, 5.5, 0.5);
        blade.rotation.z = -0.3;
        group.add(blade);

        // Blade edge (sharper triangle)
        const edgeGeometry = getGeometry('cone', 0.8, 2.5, 4);
        const edgeMaterial = getMaterial('lambert', { color: 0x6a6a6a });
        const edge1 = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge1.position.set(4.5, 5.5, 0.5);
        edge1.rotation.z = Math.PI / 2 - 0.3;
        group.add(edge1);

        // Blood stains on blade - more prominent and dripping
        const bloodMaterial = getMaterial('basic', {
            color: 0x8B0000,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        
        // Main blood splatter on blade
        for (let i = 0; i < 5; i++) {
            const bloodGeometry = getGeometry('plane', 0.4 + Math.random() * 0.3, 0.6 + Math.random() * 0.4);
            const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
            blood.position.set(3.3 + i * 0.35, 4.8 + i * 0.25, 0.53 + (i % 2) * 0.02);
            blood.rotation.z = Math.random() * 0.6 - 0.3;
            group.add(blood);
        }
        
        // Blood drips running down the blade
        const dripMaterial = getMaterial('basic', {
            color: 0x660000,
            transparent: true,
            opacity: 0.85
        });
        for (let i = 0; i < 4; i++) {
            const dripGeometry = getGeometry('cylinder', 0.04, 0.08, 0.8 + Math.random() * 0.5, 6);
            const drip = new THREE.Mesh(dripGeometry, dripMaterial);
            drip.position.set(3.0 + i * 0.5, 4.2 + Math.random() * 0.3, 0.52);
            drip.rotation.z = -0.3 + Math.random() * 0.2;
            group.add(drip);
        }
        
        // Fresh blood drop at blade tip
        const dropGeometry = getGeometry('sphere', 0.12, 8, 8);
        const dropMaterial = getMaterial('basic', { color: 0x8B0000 });
        const bloodDrop = new THREE.Mesh(dropGeometry, dropMaterial);
        bloodDrop.position.set(4.8, 4.5, 0.5);
        group.add(bloodDrop);

        // Thick legs
        const legGeometry = getGeometry('cylinder', 0.6, 0.8, 2.5, 8);
        const legMaterial = getMaterial('lambert', { color: hoodBlack });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.8, 1.0, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.8, 1.0, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
    }
    
    function buildGiantSpider(group) {
        // Keep the new spider design but scale it 1.8x bigger
        const scale = 1.8;
        
        const spiderBlack = 0x1a1a1a;
        const spiderBrown = 0x3a2a1a;
        const poisonGreen = 0x44FF44;

        // Spider abdomen (large back section)
        const abdomenGeometry = getGeometry('sphere', 1.3 * scale, 16, 16);
        const abdomenMaterial = getMaterial('lambert', { color: spiderBlack });
        const abdomen = new THREE.Mesh(abdomenGeometry, abdomenMaterial);
        abdomen.position.set(0, 1.5 * scale, -1.0 * scale);
        abdomen.scale.set(1, 0.8, 1.3);
        abdomen.castShadow = true;
        group.add(abdomen);

        // Spider markings on abdomen
        const markingGeometry = getGeometry('circle', 0.3 * scale, 8);
        const markingMaterial = getMaterial('basic', { color: 0x8B0000 });
        const marking1 = new THREE.Mesh(markingGeometry, markingMaterial);
        marking1.position.set(0, 2.0 * scale, -0.3 * scale);
        marking1.rotation.x = -0.5;
        group.add(marking1);

        const marking2 = new THREE.Mesh(markingGeometry, markingMaterial);
        marking2.position.set(0, 1.8 * scale, -1.5 * scale);
        marking2.rotation.x = 0.8;
        marking2.scale.set(1.5, 1, 1);
        group.add(marking2);

        // Spider cephalothorax (front section)
        const thoraxGeometry = getGeometry('sphere', 0.9 * scale, 16, 16);
        const thoraxMaterial = getMaterial('lambert', { color: spiderBrown });
        const thorax = new THREE.Mesh(thoraxGeometry, thoraxMaterial);
        thorax.position.set(0, 1.4 * scale, 0.6 * scale);
        thorax.scale.set(1, 0.7, 1);
        thorax.castShadow = true;
        group.add(thorax);

        // Multiple eyes (spider has 8)
        const eyeGeometry = getGeometry('sphere', 0.15 * scale, 8, 8);
        const eyeMaterial = getMaterial('basic', { 
            color: poisonGreen,
            transparent: true,
            opacity: 0.9
        });
        
        // Front row of eyes (4 eyes)
        const eyePositions = [
            { x: -0.3, y: 1.6, z: 1.3 },
            { x: -0.1, y: 1.65, z: 1.35 },
            { x: 0.1, y: 1.65, z: 1.35 },
            { x: 0.3, y: 1.6, z: 1.3 }
        ];
        
        eyePositions.forEach(pos => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
            group.add(eye);
        });

        // Back row of smaller eyes (4 eyes)
        const smallEyeGeometry = getGeometry('sphere', 0.1 * scale, 8, 8);
        const backEyePositions = [
            { x: -0.35, y: 1.75, z: 1.0 },
            { x: -0.15, y: 1.8, z: 1.1 },
            { x: 0.15, y: 1.8, z: 1.1 },
            { x: 0.35, y: 1.75, z: 1.0 }
        ];
        
        backEyePositions.forEach(pos => {
            const eye = new THREE.Mesh(smallEyeGeometry, eyeMaterial);
            eye.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
            group.add(eye);
        });

        // Fangs/chelicerae
        const fangGeometry = getGeometry('cone', 0.12 * scale, 0.5 * scale, 6);
        const fangMaterial = getMaterial('lambert', { color: 0x111111 });
        const fang1 = new THREE.Mesh(fangGeometry, fangMaterial);
        fang1.position.set(-0.2 * scale, 1.1 * scale, 1.4 * scale);
        fang1.rotation.x = 0.5;
        fang1.rotation.z = 0.2;
        group.add(fang1);

        const fang2 = new THREE.Mesh(fangGeometry, fangMaterial);
        fang2.position.set(0.2 * scale, 1.1 * scale, 1.4 * scale);
        fang2.rotation.x = 0.5;
        fang2.rotation.z = -0.2;
        group.add(fang2);

        // Poison dripping from fangs
        const poisonGeometry = getGeometry('sphere', 0.06 * scale, 8, 8);
        const poisonMaterial = getMaterial('basic', { 
            color: poisonGreen,
            transparent: true,
            opacity: 0.8
        });
        const poison1 = new THREE.Mesh(poisonGeometry, poisonMaterial);
        poison1.position.set(-0.22 * scale, 0.75 * scale, 1.55 * scale);
        group.add(poison1);

        const poison2 = new THREE.Mesh(poisonGeometry, poisonMaterial);
        poison2.position.set(0.22 * scale, 0.75 * scale, 1.55 * scale);
        group.add(poison2);

        // 8 spider legs
        const legSegmentGeometry = getGeometry('cylinder', 0.08 * scale, 0.06 * scale, 1.5 * scale, 6);
        const legMaterial = getMaterial('lambert', { color: spiderBlack });
        
        const legConfigs = [
            // Right side legs
            { x: 0.7, angle: -0.5, zOffset: 0.4 },
            { x: 0.8, angle: -0.3, zOffset: 0.1 },
            { x: 0.8, angle: -0.1, zOffset: -0.3 },
            { x: 0.7, angle: 0.2, zOffset: -0.7 },
            // Left side legs
            { x: -0.7, angle: 0.5, zOffset: 0.4 },
            { x: -0.8, angle: 0.3, zOffset: 0.1 },
            { x: -0.8, angle: 0.1, zOffset: -0.3 },
            { x: -0.7, angle: -0.2, zOffset: -0.7 }
        ];

        legConfigs.forEach((config, index) => {
            // Upper leg segment
            const upperLeg = new THREE.Mesh(legSegmentGeometry, legMaterial);
            upperLeg.position.set(config.x * scale, 1.5 * scale, config.zOffset * scale);
            upperLeg.rotation.z = config.angle;
            upperLeg.rotation.x = 0.3;
            group.add(upperLeg);

            // Lower leg segment (pointing down to ground)
            const lowerLegGeometry = getGeometry('cylinder', 0.06 * scale, 0.04 * scale, 1.8 * scale, 6);
            const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
            const legEndX = config.x + Math.sin(config.angle) * 1.5;
            lowerLeg.position.set(
                legEndX * scale, 
                0.6 * scale, 
                (config.zOffset + 0.4) * scale
            );
            lowerLeg.rotation.z = config.angle * 0.5;
            group.add(lowerLeg);

            // Leg joint
            const jointGeometry = getGeometry('sphere', 0.1 * scale, 8, 8);
            const joint = new THREE.Mesh(jointGeometry, legMaterial);
            joint.position.set(
                (config.x + Math.sin(config.angle) * 0.8) * scale,
                1.3 * scale,
                (config.zOffset + 0.3) * scale
            );
            group.add(joint);
        });

        // Spinnerets at back
        const spinneretGeometry = getGeometry('cone', 0.15 * scale, 0.4 * scale, 6);
        const spinneretMaterial = getMaterial('lambert', { color: spiderBrown });
        const spinneret1 = new THREE.Mesh(spinneretGeometry, spinneretMaterial);
        spinneret1.position.set(-0.15 * scale, 1.2 * scale, -2.2 * scale);
        spinneret1.rotation.x = -Math.PI / 2 - 0.3;
        group.add(spinneret1);

        const spinneret2 = new THREE.Mesh(spinneretGeometry, spinneretMaterial);
        spinneret2.position.set(0.15 * scale, 1.2 * scale, -2.2 * scale);
        spinneret2.rotation.x = -Math.PI / 2 - 0.3;
        group.add(spinneret2);

        // Web strand trailing behind
        const webGeometry = getGeometry('cylinder', 0.02 * scale, 0.02 * scale, 2.0 * scale, 4);
        const webMaterial = getMaterial('basic', { 
            color: 0xcccccc,
            transparent: true,
            opacity: 0.4
        });
        const web = new THREE.Mesh(webGeometry, webMaterial);
        web.position.set(0, 0.8 * scale, -3.0 * scale);
        web.rotation.x = Math.PI / 2 - 0.2;
        group.add(web);
    }
    
    function buildTreant(group) {
        // TREANT - living tree guardian for enchanted theme
        // Scale factor for bigger treants
        const s = 1.8;
        const barkColor = 0x4A3728;
        const mossColor = 0x3A5F0B;
        const eyeColor = 0x90EE90;

        // Thick trunk body
        const bodyGeometry = getGeometry('cylinder', 0.8 * s, 1.0 * s, 2.5 * s, 8);
        const bodyMaterial = getMaterial('lambert', { color: barkColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5 * s;
        body.castShadow = true;
        group.add(body);

        // Bark texture ridges
        for (let i = 0; i < 6; i++) {
            const ridgeGeometry = getGeometry('box', 0.12 * s, 2.0 * s, 0.08 * s);
            const ridge = new THREE.Mesh(ridgeGeometry, bodyMaterial);
            const angle = (i / 6) * Math.PI * 2;
            ridge.position.set(Math.cos(angle) * 0.85 * s, 1.5 * s, Math.sin(angle) * 0.85 * s);
            ridge.rotation.y = -angle;
            group.add(ridge);
        }

        // Head (wider top of trunk)
        const headGeometry = getGeometry('cylinder', 0.9 * s, 0.8 * s, 0.8 * s, 8);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 3.1 * s;
        head.castShadow = true;
        group.add(head);

        // Glowing eyes
        const eyeGeometry = getGeometry('sphere', 0.15 * s, 8, 8);
        const eyeMaterial = getMaterial('basic', { color: eyeColor });
        [-0.4, 0.4].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x * s, 3.1 * s, 0.75 * s);
            group.add(eye);
        });

        // Branch arms with knotted ends (fists attached)
        const armGeometry = getGeometry('cylinder', 0.2 * s, 0.35 * s, 1.8 * s, 6);
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-1.4 * s, 2.5 * s, 0);
        leftArm.rotation.z = 0.8;
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(1.4 * s, 2.5 * s, 0);
        rightArm.rotation.z = -0.8;
        rightArm.castShadow = true;
        group.add(rightArm);

        // Knotted branch ends (visual fists at end of arms)
        const fistGeometry = getGeometry('sphere', 0.35 * s, 6, 6);
        const leftFist = new THREE.Mesh(fistGeometry, bodyMaterial);
        // Position at end of rotated arm
        leftFist.position.set(-1.4 * s - Math.sin(0.8) * 0.9 * s, 2.5 * s - Math.cos(0.8) * 0.9 * s, 0);
        leftFist.castShadow = true;
        group.add(leftFist);

        const rightFist = new THREE.Mesh(fistGeometry, bodyMaterial);
        rightFist.position.set(1.4 * s + Math.sin(0.8) * 0.9 * s, 2.5 * s - Math.cos(0.8) * 0.9 * s, 0);
        rightFist.castShadow = true;
        group.add(rightFist);
        
        // Treant doesn't use standard arm animation (no leftArm/rightArm/leftFist/rightFist refs)

        // Leaf crown
        const leafMaterial = getMaterial('lambert', { color: mossColor });
        for (let i = 0; i < 8; i++) {
            const leafGeometry = getGeometry('sphere', (0.25 + Math.random() * 0.15) * s, 6, 6);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            const angle = (i / 8) * Math.PI * 2;
            leaf.position.set(
                Math.cos(angle) * (0.7 + Math.random() * 0.3) * s,
                (3.5 + Math.random() * 0.3) * s,
                Math.sin(angle) * (0.7 + Math.random() * 0.3) * s
            );
            group.add(leaf);
        }

        // Moss patches on body
        for (let i = 0; i < 4; i++) {
            const mossGeometry = getGeometry('sphere', 0.15 * s, 6, 6);
            const moss = new THREE.Mesh(mossGeometry, leafMaterial);
            const angle = Math.random() * Math.PI * 2;
            moss.position.set(
                Math.cos(angle) * 1.0 * s,
                (1.0 + Math.random() * 1.5) * s,
                Math.sin(angle) * 1.0 * s
            );
            moss.scale.y = 0.5;
            group.add(moss);
        }

        // Root feet
        for (let i = 0; i < 3; i++) {
            const rootGeometry = getGeometry('cylinder', 0.15 * s, 0.3 * s, 0.8 * s, 6);
            const root = new THREE.Mesh(rootGeometry, bodyMaterial);
            const angle = (i / 3) * Math.PI * 2 + 0.4;
            root.position.set(Math.cos(angle) * 0.9 * s, 0.3 * s, Math.sin(angle) * 0.9 * s);
            root.rotation.z = Math.cos(angle) * 0.4;
            root.rotation.x = Math.sin(angle) * 0.4;
            root.castShadow = true;
            group.add(root);
        }
        
        group.userData.isTreant = true;
    }
    
    function buildChick(group) {
        // CHICK - giant fluffy baby chicken for Easter theme
        const bodyColor = 0xFFD700;     // Golden yellow
        const beakColor = 0xFF8C00;     // Dark orange
        const eyeColor = 0x000000;
        const wingColor = 0xFFA500;     // Orange

        // Round body (scaled for giant size)
        const bodyGeometry = getGeometry('sphere', 1.6, 16, 16);
        const bodyMaterial = getMaterial('lambert', { color: bodyColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2.0;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = getGeometry('sphere', 1.0, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.y = 4.0;
        head.castShadow = true;
        group.add(head);

        // Eyes
        const eyeGeometry = getGeometry('sphere', 0.2, 8, 8);
        const eyeMaterial = getMaterial('basic', { color: eyeColor });
        [-0.4, 0.4].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 4.2, 0.8);
            group.add(eye);
        });

        // Beak
        const beakGeometry = getGeometry('cone', 0.3, 0.6, 8);
        const beakMaterial = getMaterial('lambert', { color: beakColor });
        const beak = new THREE.Mesh(beakGeometry, beakMaterial);
        beak.position.set(0, 3.8, 1.1);
        beak.rotation.x = Math.PI / 2;
        group.add(beak);

        // Small comb on head
        const combGeometry = getGeometry('cone', 0.16, 0.4, 4);
        const combMaterial = getMaterial('lambert', { color: 0xFF4444 });
        for (let i = 0; i < 3; i++) {
            const comb = new THREE.Mesh(combGeometry, combMaterial);
            comb.position.set(0, 5.0 + i * 0.1, -0.2 + i * 0.1);
            group.add(comb);
        }

        // Wings
        const wingGeometry = getGeometry('sphere', 0.6, 8, 8);
        const wingMaterial = getMaterial('lambert', { color: wingColor });
        [-1.4, 1.4].forEach(x => {
            const wing = new THREE.Mesh(wingGeometry, wingMaterial);
            wing.position.set(x, 2.4, 0);
            wing.scale.set(0.4, 0.8, 0.6);
            wing.castShadow = true;
            group.add(wing);
        });

        // Feet
        const legGeometry = getGeometry('cylinder', 0.1, 0.1, 0.6, 6);
        const legMaterial = getMaterial('lambert', { color: beakColor });
        [-0.6, 0.6].forEach(x => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, 0.3, 0);
            leg.castShadow = true;
            group.add(leg);
        });

        group.userData.isChick = true;
    }
    
    function buildEvilSnowman(group) {
        // Evil snowman for Christmas theme
        const snowWhite = 0xffffff;         // Snow white body
        const coalBlack = 0x222222;         // Coal eyes/buttons
        const carrotOrange = 0xff6600;      // Carrot nose
        const scarfRed = 0xdc143c;          // Red scarf
        const hatBlack = 0x1a1a1a;          // Black top hat
        const hatRibbon = 0xcc0000;         // Red hat ribbon
        const iceBlue = 0xccffff;           // Icy highlights
        
        // Large snowball body (bottom)
        const bodyBottomGeometry = getGeometry('sphere', 1.8, 16, 16);
        const snowMaterial = getMaterial('lambert', { color: snowWhite });
        const bodyBottom = new THREE.Mesh(bodyBottomGeometry, snowMaterial);
        bodyBottom.position.y = 2.0;
        bodyBottom.scale.set(1, 0.95, 1);
        bodyBottom.castShadow = true;
        group.add(bodyBottom);
        
        // Middle snowball
        const bodyMiddleGeometry = getGeometry('sphere', 1.5, 16, 16);
        const bodyMiddle = new THREE.Mesh(bodyMiddleGeometry, snowMaterial);
        bodyMiddle.position.y = 4.2;
        bodyMiddle.scale.set(1, 0.9, 1);
        bodyMiddle.castShadow = true;
        group.add(bodyMiddle);
        
        // Coal buttons on body
        const buttonGeometry = getGeometry('sphere', 0.25, 12, 12);
        const coalMaterial = getMaterial('lambert', { color: coalBlack });
        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(buttonGeometry, coalMaterial);
            button.position.set(0, 3.5 + (i * 0.5), 1.5);
            group.add(button);
        }
        
        // Head (top snowball)
        const headGeometry = getGeometry('sphere', 1.2, 16, 16);
        const head = new THREE.Mesh(headGeometry, snowMaterial);
        head.position.y = 6.0;
        head.castShadow = true;
        group.add(head);
        
        // Evil coal eyes (glowing red)
        const eyeGeometry = getGeometry('sphere', 0.2, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: 0xff0000 });
        [-0.4, 0.4].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 6.2, 1.1);
            group.add(eye);
            
            // Evil glow
            const glowGeometry = getGeometry('sphere', 0.25, 12, 12);
            const glowMaterial = getMaterial('basic', { 
                color: 0xff0000, 
                transparent: true, 
                opacity: 0.3 
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, 6.2, 1.1);
            group.add(glow);
        });
        
        // Carrot nose
        const noseGeometry = getGeometry('cone', 0.15, 0.8, 8);
        const noseMaterial = getMaterial('lambert', { color: carrotOrange });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 5.9, 1.2);
        nose.rotation.x = Math.PI / 2;
        group.add(nose);
        
        // Evil grin made of coal pieces
        const mouthCoalGeometry = getGeometry('sphere', 0.12, 8, 8);
        for (let i = 0; i < 7; i++) {
            const angle = (i - 3) * 0.15;
            const x = Math.sin(angle) * 0.6;
            const y = 5.5 - Math.abs(i - 3) * 0.08;
            const mouthCoal = new THREE.Mesh(mouthCoalGeometry, coalMaterial);
            mouthCoal.position.set(x, y, 1.1);
            group.add(mouthCoal);
        }
        
        // Black top hat
        const hatBaseGeometry = getGeometry('cylinder', 0.8, 0.8, 0.2, 16);
        const hatMaterial = getMaterial('lambert', { color: hatBlack });
        const hatBase = new THREE.Mesh(hatBaseGeometry, hatMaterial);
        hatBase.position.y = 7.0;
        group.add(hatBase);
        
        const hatTopGeometry = getGeometry('cylinder', 0.6, 0.6, 1.2, 16);
        const hatTop = new THREE.Mesh(hatTopGeometry, hatMaterial);
        hatTop.position.y = 7.7;
        group.add(hatTop);
        
        // Red ribbon on hat
        const ribbonGeometry = getGeometry('cylinder', 0.65, 0.65, 0.15, 16);
        const ribbonMaterial = getMaterial('lambert', { color: hatRibbon });
        const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
        ribbon.position.y = 7.2;
        group.add(ribbon);
        
        // Red scarf around neck
        const scarfMaterial = getMaterial('lambert', { color: scarfRed });
        const scarfRingGeometry = getGeometry('torus', 1.3, 0.2, 8, 16);
        const scarfRing = new THREE.Mesh(scarfRingGeometry, scarfMaterial);
        scarfRing.position.y = 5.2;
        scarfRing.rotation.x = Math.PI / 2;
        group.add(scarfRing);
        
        // Scarf tails hanging down
        const scarfTailGeometry = getGeometry('cylinder', 0.18, 0.15, 1.5, 8);
        [-0.9, 0.9].forEach(x => {
            const tail = new THREE.Mesh(scarfTailGeometry, scarfMaterial);
            tail.position.set(x, 4.2, 0.8);
            tail.rotation.z = x < 0 ? 0.2 : -0.2;
            group.add(tail);
        });
        
        // Stick arms (frozen tree branches)
        const stickMaterial = getMaterial('lambert', { color: 0x4a3a2a });
        const armGeometry = getGeometry('cylinder', 0.15, 0.12, 2.5, 8);
        
        const leftArm = new THREE.Mesh(armGeometry, stickMaterial);
        leftArm.position.set(-1.8, 4.5, 0);
        leftArm.rotation.z = Math.PI / 3;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, stickMaterial);
        rightArm.position.set(1.8, 4.5, 0);
        rightArm.rotation.z = -Math.PI / 3;
        group.add(rightArm);
        
        // Stick fingers (3 per hand)
        const fingerGeometry = getGeometry('cylinder', 0.05, 0.04, 0.6, 6);
        [[-2.7, 3.8], [2.7, 3.8]].forEach(([x, y], armIndex) => {
            for (let i = 0; i < 3; i++) {
                const finger = new THREE.Mesh(fingerGeometry, stickMaterial);
                const angleOffset = (i - 1) * 0.3;
                finger.position.set(
                    x + Math.sin(angleOffset) * 0.2,
                    y + Math.cos(angleOffset) * 0.2,
                    0
                );
                finger.rotation.z = armIndex === 0 ? 
                    (Math.PI / 3 + angleOffset) : 
                    (-Math.PI / 3 + angleOffset);
                group.add(finger);
            }
        });
        
        // Icy highlights/frost patches
        const frostMaterial = getMaterial('lambert', { 
            color: iceBlue, 
            transparent: true, 
            opacity: 0.4 
        });
        const frostGeometry = getGeometry('sphere', 0.3, 12, 12);
        [
            [0.8, 4.5, 1.4],
            [-0.9, 3.2, 1.6],
            [0.5, 6.3, 1.0],
            [-0.6, 2.5, 1.7]
        ].forEach(([x, y, z]) => {
            const frost = new THREE.Mesh(frostGeometry, frostMaterial);
            frost.position.set(x, y, z);
            frost.scale.set(1.2, 0.8, 0.6);
            group.add(frost);
        });
    }
    
    function buildStandardGiant(group, textures) {
        // STANDARD GIANT - ogre-like creature with club
        const giantSkinTexture = textures.giantSkin || null;
        const giantEyeTexture = textures.giantEye || null;
        
        // Massive body with texture
        const bodyGeometry = getGeometry('cylinder', 1.4, 1.8, 5.0, 12);
        const bodyMaterial = giantSkinTexture 
            ? getMaterial('lambert', { map: giantSkinTexture })
            : getMaterial('lambert', { color: 0x5a4a3a });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3.2;
        body.castShadow = true;
        group.add(body);
        
        // Giant head
        const headGeometry = getGeometry('sphere', 1.3, 16, 16);
        const headMaterial = giantSkinTexture
            ? getMaterial('lambert', { map: giantSkinTexture })
            : getMaterial('lambert', { color: 0x5a4a3a });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 6.5;
        head.castShadow = true;
        group.add(head);
        
        // Horns
        const hornGeometry = getGeometry('cone', 0.25, 1.2, 8);
        const hornMaterial = getMaterial('lambert', { color: 0x3a3a2a });
        
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(-0.9, 7.5, 0);
        leftHorn.rotation.z = -0.3;
        leftHorn.castShadow = true;
        group.add(leftHorn);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(0.9, 7.5, 0);
        rightHorn.rotation.z = 0.3;
        rightHorn.castShadow = true;
        group.add(rightHorn);
        
        // Glowing eyes with texture
        const eyeGeometry = getGeometry('sphere', 0.4, 16, 16);
        const eyeMaterial = giantEyeTexture 
            ? getMaterial('basic', { 
                map: giantEyeTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
            : getMaterial('basic', { color: 0xFF4400 });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.5, 6.5, 0.9);
        group.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.5, 6.5, 0.9);
        group.add(e2);
        
        // Massive club-like arms
        const armGeometry = getGeometry('cylinder', 0.4, 0.8, 4.0, 8);
        const armMaterial = giantSkinTexture
            ? getMaterial('lambert', { map: giantSkinTexture })
            : getMaterial('lambert', { color: 0x5a4a3a });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-2.2, 4.0, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        group.add(leftArm);
        group.leftArm = leftArm;
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(2.2, 4.0, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        group.add(rightArm);
        group.rightArm = rightArm;
        
        // Giant fists
        const fistGeometry = getGeometry('box', 0.8, 0.8, 0.8);
        const fistMaterial = giantSkinTexture
            ? getMaterial('lambert', { map: giantSkinTexture })
            : getMaterial('lambert', { color: 0x5a4a3a });
        
        const leftFist = new THREE.Mesh(fistGeometry, fistMaterial);
        leftFist.position.set(-2.8, 1.8, 0);
        leftFist.castShadow = true;
        group.add(leftFist);
        group.leftFist = leftFist;
        
        const rightFist = new THREE.Mesh(fistGeometry, fistMaterial);
        rightFist.position.set(2.8, 1.8, 0);
        rightFist.castShadow = true;
        group.add(rightFist);
        group.rightFist = rightFist;
        
        // Thick legs
        const legGeometry = getGeometry('cylinder', 0.7, 0.9, 3.5, 8);
        const leftLeg = new THREE.Mesh(legGeometry, armMaterial);
        leftLeg.position.set(-0.9, 1.2, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, armMaterial);
        rightLeg.position.set(0.9, 1.2, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
    }
    
    function buildCrystalGiant(group) {
        // Crystal Giant - massive amethyst colossus
        const crystalPurple = 0xaa44ff;
        const crystalPink = 0xff4488;
        const crystalBlue = 0x44aaff;
        const crystalGlow = 0xcc77ff;
        const darkCrystal = 0x5a3a7a;
        
        // Massive crystal body - multiple faceted shapes
        const bodyGeometry = getGeometry('octahedron', 2.0, 0);
        const bodyMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.15,
            transparent: true,
            opacity: 0.85
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 4.0;
        body.scale.set(1.0, 1.5, 0.8);
        body.castShadow = true;
        group.add(body);
        
        // Inner glow core
        const coreGeometry = getGeometry('octahedron', 1.2, 0);
        const coreMaterial = getMaterial('basic', { 
            color: crystalGlow,
            transparent: true,
            opacity: 0.4
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 4.0;
        group.add(core);
        
        // Crystal head - large angular faceted shape
        const headGeometry = getGeometry('octahedron', 1.2, 0);
        const headMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.85
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 7.0;
        head.rotation.y = Math.PI / 4;
        head.castShadow = true;
        group.add(head);
        
        // Glowing eyes - large gem-like
        const eyeMaterial = getMaterial('basic', { color: 0x00ffff });
        const eyeGeometry = getGeometry('octahedron', 0.3, 0);
        [-0.5, 0.5].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 7.0, 1.0);
            group.add(eye);
        });
        
        // Massive crystal spikes on shoulders
        [-2.2, 2.2].forEach(x => {
            const spike = new THREE.Mesh(
                getGeometry('cone', 0.6, 2.5, 5),
                getMaterial('lambert', { 
                    color: crystalPink,
                    emissive: crystalPink,
                    emissiveIntensity: 0.3,
                    transparent: true,
                    opacity: 0.85
                })
            );
            spike.position.set(x, 5.5, 0);
            spike.rotation.z = x > 0 ? -0.3 : 0.3;
            spike.castShadow = true;
            group.add(spike);
        });
        
        // Crystal arms - angular formations
        [-2.5, 2.5].forEach((x, i) => {
            const armGeometry = getGeometry('cone', 0.5, 3.0, 6);
            const armMaterial = getMaterial('lambert', { 
                color: darkCrystal,
                transparent: true,
                opacity: 0.85
            });
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.set(x, 3.5, 0);
            arm.rotation.z = x > 0 ? 0.6 : -0.6;
            arm.castShadow = true;
            group.add(arm);
            if (i === 0) group.leftArm = arm;
            else group.rightArm = arm;
            
            // Crystal fist
            const fist = new THREE.Mesh(
                getGeometry('octahedron', 0.5, 0),
                getMaterial('lambert', { color: crystalBlue, emissive: crystalBlue, emissiveIntensity: 0.3 })
            );
            fist.position.set(x * 1.3, 1.5, 0);
            group.add(fist);
            if (i === 0) group.leftFist = fist;
            else group.rightFist = fist;
        });
        
        // Crystal legs - thick angular supports
        [-1.0, 1.0].forEach(x => {
            const legGeometry = getGeometry('cone', 0.7, 3.0, 6);
            const legMaterial = getMaterial('lambert', { 
                color: darkCrystal,
                transparent: true,
                opacity: 0.85
            });
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, 1.5, 0);
            leg.rotation.x = Math.PI;
            leg.castShadow = true;
            group.add(leg);
        });
        
        // Crown of crystal spikes
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const spike = new THREE.Mesh(
                getGeometry('cone', 0.2, 1.2, 4),
                getMaterial('lambert', { color: crystalPink, emissive: crystalPink, emissiveIntensity: 0.4 })
            );
            spike.position.set(
                Math.cos(angle) * 0.8,
                8.2,
                Math.sin(angle) * 0.8
            );
            group.add(spike);
        }
    }
    
    function buildTowerGiant(group) {
        // TOWER GIANT - living stone tower with face and battlements
        const stoneColor = 0x7A7A7A;        // Gray stone
        const stoneDark = 0x5A5A5A;         // Darker stone
        const mossColor = 0x4A5D3A;         // Green moss
        const windowColor = 0x2A1A1A;       // Dark window
        const eyeGlow = 0xFF6600;           // Glowing orange eyes
        const doorColor = 0x4A3A2A;         // Wooden door brown
        
        // Main tower body (tall cylinder with slight taper)
        const towerGeometry = getGeometry('cylinder', 1.8, 2.2, 5.0, 12);
        const towerMaterial = getMaterial('lambert', { color: stoneColor });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 3.0;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);
        
        // Stone block texture lines (horizontal)
        for (let i = 0; i < 8; i++) {
            const lineGeometry = getGeometry('torus', 1.85 - i * 0.03, 0.03, 4, 24);
            const lineMaterial = getMaterial('lambert', { color: stoneDark });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.y = 0.8 + i * 0.6;
            line.rotation.x = Math.PI / 2;
            group.add(line);
        }
        
        // Battlements on top (crown of the tower)
        const numBattlements = 8;
        for (let i = 0; i < numBattlements; i++) {
            const angle = (i / numBattlements) * Math.PI * 2;
            const battlementGeometry = getGeometry('box', 0.8, 1.0, 0.5);
            const battlementMaterial = getMaterial('lambert', { color: stoneDark });
            const battlement = new THREE.Mesh(battlementGeometry, battlementMaterial);
            battlement.position.set(
                Math.cos(angle) * 1.6,
                6.0,
                Math.sin(angle) * 1.6
            );
            battlement.rotation.y = -angle;
            battlement.castShadow = true;
            group.add(battlement);
        }
        
        // Face - carved into the tower
        // Glowing eyes (windows that look like eyes)
        const eyeGeometry = getGeometry('box', 0.5, 0.7, 0.2);
        const eyeMaterial = getMaterial('basic', { color: eyeGlow });
        [-0.7, 0.7].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 4.5, 1.9);
            group.add(eye);
            
            // Eye glow effect
            const glowGeometry = getGeometry('sphere', 0.4, 8, 8);
            const glowMaterial = getMaterial('basic', { 
                color: eyeGlow,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, 4.5, 2.0);
            group.add(glow);
        });
        
        // Angry stone eyebrows
        const browGeometry = getGeometry('box', 0.7, 0.15, 0.2);
        const browMaterial = getMaterial('lambert', { color: stoneDark });
        [-0.7, 0.7].forEach((x, i) => {
            const brow = new THREE.Mesh(browGeometry, browMaterial);
            brow.position.set(x, 5.0, 1.9);
            brow.rotation.z = i === 0 ? -0.3 : 0.3;
            group.add(brow);
        });
        
        // Mouth (door that looks like a grimacing mouth)
        const mouthGeometry = getGeometry('box', 1.2, 0.8, 0.2);
        const mouthMaterial = getMaterial('lambert', { color: doorColor });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 3.0, 2.0);
        group.add(mouth);
        
        // Teeth (stone blocks in mouth)
        for (let i = 0; i < 4; i++) {
            const toothGeometry = getGeometry('box', 0.2, 0.3, 0.15);
            const toothMaterial = getMaterial('lambert', { color: 0xE8E8E8 });
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            tooth.position.set(-0.45 + i * 0.3, 3.4, 2.05);
            group.add(tooth);
        }
        
        // Nose (protruding stone block)
        const noseGeometry = getGeometry('box', 0.5, 0.5, 0.4);
        const nose = new THREE.Mesh(noseGeometry, towerMaterial);
        nose.position.set(0, 3.8, 2.1);
        nose.castShadow = true;
        group.add(nose);
        
        // Moss patches
        const mossGeometry = getGeometry('sphere', 0.3, 8, 8);
        const mossMaterial = getMaterial('lambert', { color: mossColor });
        [[1.5, 2.0, 1.0], [-1.6, 3.5, 0.8], [1.2, 5.0, -1.2], [-1.0, 1.5, -1.5]].forEach(pos => {
            const moss = new THREE.Mesh(mossGeometry, mossMaterial);
            moss.position.set(pos[0], pos[1], pos[2]);
            moss.scale.set(1 + Math.random() * 0.5, 0.5, 1 + Math.random() * 0.5);
            group.add(moss);
        });
        
        // Ivy vines climbing up
        for (let i = 0; i < 3; i++) {
            const vineAngle = Math.random() * Math.PI * 2;
            for (let j = 0; j < 6; j++) {
                const vineLeafGeometry = getGeometry('sphere', 0.15, 6, 6);
                const vineLeaf = new THREE.Mesh(vineLeafGeometry, mossMaterial);
                vineLeaf.position.set(
                    Math.cos(vineAngle + j * 0.2) * 2.0,
                    1.0 + j * 0.8,
                    Math.sin(vineAngle + j * 0.2) * 2.0
                );
                vineLeaf.scale.set(1.2, 0.6, 1);
                group.add(vineLeaf);
            }
        }
        
        // Stone legs (thick pillars)
        const legGeometry = getGeometry('cylinder', 0.6, 0.8, 2.0, 8);
        const legMaterial = getMaterial('lambert', { color: stoneDark });
        [-1.0, 1.0].forEach(x => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, 0.5, 0);
            leg.castShadow = true;
            group.add(leg);
        });
        
        // Stone feet
        const footGeometry = getGeometry('box', 1.0, 0.4, 1.2);
        [-1.0, 1.0].forEach(x => {
            const foot = new THREE.Mesh(footGeometry, legMaterial);
            foot.position.set(x, 0.2, 0.2);
            foot.castShadow = true;
            group.add(foot);
        });
        
        // Stone arms (smaller towers as arms)
        const armGeometry = getGeometry('cylinder', 0.35, 0.45, 2.5, 8);
        [-2.3, 2.3].forEach((x, i) => {
            const arm = new THREE.Mesh(armGeometry, towerMaterial);
            arm.position.set(x, 3.5, 0);
            arm.rotation.z = i === 0 ? 0.4 : -0.4;
            arm.castShadow = true;
            group.add(arm);
            if (i === 0) group.leftArm = arm;
            else group.rightArm = arm;
            
            // Stone fist
            const fistGeometry = getGeometry('box', 0.7, 0.7, 0.7);
            const fist = new THREE.Mesh(fistGeometry, stoneDark);
            fist.position.set(x * 1.35, 2.2, 0);
            fist.castShadow = true;
            group.add(fist);
            if (i === 0) group.leftFist = fist;
            else group.rightFist = fist;
        });
    }
    
    // ========================================
    // REGISTER WITH ENTITY REGISTRY
    // ========================================
    
    ENTITY_REGISTRY.register('giant', {
        create: createGiant
    });
    
    // Export globally for backward compatibility
    window.createGiant = createGiant;
    
})();
