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
     * @param {number} speed - Movement speed (default: 0.007)
     * @returns {object} Giant entity object
     */
    function createGiant(x, z, patrolLeft, patrolRight, speed = 0.007) {
        const giantGrp = new THREE.Group();
        
        if (G.candyTheme) {
            buildMarshmallowMonster(giantGrp);
        } else if (G.graveyardTheme) {
            buildExecutioner(giantGrp);
        } else if (G.ruinsTheme) {
            buildGiantSpider(giantGrp);
        } else {
            buildStandardGiant(giantGrp);
        }
        
        giantGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(giantGrp);
        
        const health = 10;
        
        return {
            mesh: giantGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 2.5,
            health: health,
            maxHealth: health,
            isGiant: true,
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
    
    function buildMarshmallowMonster(group) {
        const marshmallowWhite = 0xFFFAFA;
        const pinkTint = 0xFFE4E8;
        const gooeyPink = 0xFF69B4;

        // Giant marshmallow body - soft and puffy
        const bodyGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: marshmallowWhite,
            emissive: 0x222222,
            emissiveIntensity: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.set(1, 1.3, 1);
        body.position.y = 2.2;
        body.castShadow = true;
        group.add(body);

        // Pink swirl decorations on body
        const swirlGeometry = new THREE.TorusGeometry(0.8, 0.1, 8, 32, Math.PI);
        const swirlMaterial = new THREE.MeshLambertMaterial({ color: gooeyPink });
        const swirl1 = new THREE.Mesh(swirlGeometry, swirlMaterial);
        swirl1.position.set(0, 2.5, 0.8);
        swirl1.rotation.x = 0.5;
        group.add(swirl1);

        const swirl2 = new THREE.Mesh(swirlGeometry, swirlMaterial);
        swirl2.position.set(0, 1.8, -0.7);
        swirl2.rotation.x = -0.5;
        swirl2.rotation.y = Math.PI;
        group.add(swirl2);

        // Marshmallow head
        const headGeometry = new THREE.SphereGeometry(0.9, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: pinkTint });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 4.2;
        head.castShadow = true;
        group.add(head);

        // Gooey dripping eyes
        const eyeGeometry = new THREE.SphereGeometry(0.25, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.35, 4.3, 0.7);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.35, 4.3, 0.7);
        group.add(eye2);

        // Dripping marshmallow under eyes (like tears)
        const dripGeometry = new THREE.ConeGeometry(0.1, 0.4, 8);
        const dripMaterial = new THREE.MeshLambertMaterial({ color: marshmallowWhite });
        const drip1 = new THREE.Mesh(dripGeometry, dripMaterial);
        drip1.position.set(-0.35, 3.95, 0.75);
        drip1.rotation.x = Math.PI;
        group.add(drip1);

        const drip2 = new THREE.Mesh(dripGeometry, dripMaterial);
        drip2.position.set(0.35, 3.95, 0.75);
        drip2.rotation.x = Math.PI;
        group.add(drip2);

        // Angry zig-zag mouth
        const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x880000 });
        for (let i = 0; i < 4; i++) {
            const toothGeometry = new THREE.ConeGeometry(0.15, 0.25, 4);
            const tooth = new THREE.Mesh(toothGeometry, mouthMaterial);
            tooth.position.set(-0.3 + i * 0.2, 3.85, 0.8);
            tooth.rotation.x = i % 2 === 0 ? 0 : Math.PI;
            group.add(tooth);
        }

        // Puffy marshmallow arms
        const armGeometry = new THREE.CylinderGeometry(0.35, 0.45, 1.8, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: marshmallowWhite });
        const arm1 = new THREE.Mesh(armGeometry, armMaterial);
        arm1.position.set(-1.4, 2.5, 0);
        arm1.rotation.z = 0.5;
        arm1.castShadow = true;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(1.4, 2.5, 0);
        arm2.rotation.z = -0.5;
        arm2.castShadow = true;
        group.add(arm2);

        // Marshmallow hands (round blobs)
        const handGeometry = new THREE.SphereGeometry(0.4, 12, 12);
        const hand1 = new THREE.Mesh(handGeometry, armMaterial);
        hand1.position.set(-1.9, 1.6, 0);
        group.add(hand1);

        const hand2 = new THREE.Mesh(handGeometry, armMaterial);
        hand2.position.set(1.9, 1.6, 0);
        group.add(hand2);

        // Stumpy marshmallow legs
        const legGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.5, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: pinkTint });
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.6, 0.75, 0);
        leg1.castShadow = true;
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(0.6, 0.75, 0);
        leg2.castShadow = true;
        group.add(leg2);

        // Graham cracker feet
        const footGeometry = new THREE.BoxGeometry(0.7, 0.2, 0.9);
        const footMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        const foot1 = new THREE.Mesh(footGeometry, footMaterial);
        foot1.position.set(-0.6, 0.1, 0.15);
        group.add(foot1);

        const foot2 = new THREE.Mesh(footGeometry, footMaterial);
        foot2.position.set(0.6, 0.1, 0.15);
        group.add(foot2);
    }
    
    function buildExecutioner(group) {
        const fleshColor = 0x8B7355;
        const darkCloth = 0x1a1a1a;
        const bloodRed = 0x8B0000;

        // Massive muscular body
        const bodyGeometry = new THREE.CylinderGeometry(1.0, 1.3, 2.8, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: fleshColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2.2;
        body.castShadow = true;
        group.add(body);

        // Executioner's hood
        const hoodGeometry = new THREE.ConeGeometry(0.8, 1.2, 8);
        const hoodMaterial = new THREE.MeshLambertMaterial({ color: darkCloth });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.y = 4.2;
        hood.castShadow = true;
        group.add(hood);

        // Face area (darker, with eye holes)
        const faceGeometry = new THREE.SphereGeometry(0.6, 12, 12);
        const faceMaterial = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
        const face = new THREE.Mesh(faceMaterial, faceMaterial);
        face.position.set(0, 3.8, 0.3);
        face.scale.z = 0.5;
        group.add(face);

        // Glowing red eyes through hood
        const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF0000,
            transparent: true,
            opacity: 0.9
        });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.2, 3.9, 0.55);
        group.add(eye1);

        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.2, 3.9, 0.55);
        group.add(eye2);

        // Leather straps across chest
        const strapGeometry = new THREE.BoxGeometry(0.15, 2.5, 0.1);
        const strapMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
        const strap1 = new THREE.Mesh(strapGeometry, strapMaterial);
        strap1.position.set(-0.4, 2.5, 0.7);
        strap1.rotation.z = 0.3;
        group.add(strap1);

        const strap2 = new THREE.Mesh(strapGeometry, strapMaterial);
        strap2.position.set(0.4, 2.5, 0.7);
        strap2.rotation.z = -0.3;
        group.add(strap2);

        // Massive arms
        const armGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2.0, 8);
        const arm1 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm1.position.set(-1.5, 2.5, 0);
        arm1.rotation.z = 0.3;
        arm1.castShadow = true;
        group.add(arm1);

        const arm2 = new THREE.Mesh(armGeometry, bodyMaterial);
        arm2.position.set(1.5, 2.5, 0);
        arm2.rotation.z = -0.3;
        arm2.castShadow = true;
        group.add(arm2);

        // Forearms (holding axe)
        const forearmGeometry = new THREE.CylinderGeometry(0.35, 0.4, 1.6, 8);
        const forearm1 = new THREE.Mesh(forearmGeometry, bodyMaterial);
        forearm1.position.set(-1.8, 1.2, 0.4);
        forearm1.rotation.z = 0.5;
        forearm1.rotation.x = -0.5;
        group.add(forearm1);

        const forearm2 = new THREE.Mesh(forearmGeometry, bodyMaterial);
        forearm2.position.set(1.8, 1.2, 0.4);
        forearm2.rotation.z = -0.5;
        forearm2.rotation.x = -0.5;
        group.add(forearm2);

        // MASSIVE BLOODY AXE
        // Axe handle
        const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3.5, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, 2.5, 1.0);
        handle.rotation.x = 0.2;
        group.add(handle);

        // Axe blade (huge)
        const bladeGeometry = new THREE.BoxGeometry(1.5, 0.15, 1.2);
        const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(0, 4.4, 1.2);
        blade.rotation.x = 0.2;
        group.add(blade);

        // Blood on blade
        const bloodGeometry = new THREE.BoxGeometry(0.8, 0.16, 0.5);
        const bloodMaterial = new THREE.MeshLambertMaterial({ color: bloodRed });
        const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
        blood.position.set(-0.2, 4.42, 1.5);
        blood.rotation.x = 0.2;
        group.add(blood);

        // Blood drips
        const dripGeometry = new THREE.ConeGeometry(0.05, 0.3, 6);
        const drip1 = new THREE.Mesh(dripGeometry, bloodMaterial);
        drip1.position.set(-0.3, 4.1, 1.6);
        drip1.rotation.x = Math.PI;
        group.add(drip1);

        const drip2 = new THREE.Mesh(dripGeometry, bloodMaterial);
        drip2.position.set(0.1, 4.0, 1.55);
        drip2.rotation.x = Math.PI;
        group.add(drip2);

        // Tattered cloth/apron
        const apronGeometry = new THREE.BoxGeometry(1.2, 2.0, 0.15);
        const apronMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2a1a1a,
            side: THREE.DoubleSide
        });
        const apron = new THREE.Mesh(apronGeometry, apronMaterial);
        apron.position.set(0, 1.2, 0.7);
        group.add(apron);

        // Blood stains on apron
        const stainGeometry = new THREE.CircleGeometry(0.2, 8);
        const stainMaterial = new THREE.MeshBasicMaterial({ color: bloodRed });
        const stain1 = new THREE.Mesh(stainGeometry, stainMaterial);
        stain1.position.set(-0.2, 1.5, 0.78);
        group.add(stain1);

        const stain2 = new THREE.Mesh(stainGeometry, stainMaterial);
        stain2.position.set(0.3, 0.8, 0.78);
        stain2.scale.set(1.5, 1.2, 1);
        group.add(stain2);

        // Massive legs
        const legGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2.0, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.5, 0.7, 0);
        leg1.castShadow = true;
        group.add(leg1);

        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(0.5, 0.7, 0);
        leg2.castShadow = true;
        group.add(leg2);

        // Heavy boots
        const bootGeometry = new THREE.BoxGeometry(0.7, 0.4, 1.0);
        const bootMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1010 });
        const boot1 = new THREE.Mesh(bootGeometry, bootMaterial);
        boot1.position.set(-0.5, 0.2, 0.15);
        group.add(boot1);

        const boot2 = new THREE.Mesh(bootGeometry, bootMaterial);
        boot2.position.set(0.5, 0.2, 0.15);
        group.add(boot2);
    }
    
    function buildGiantSpider(group) {
        const spiderBlack = 0x1a1a1a;
        const spiderBrown = 0x3a2a1a;
        const poisonGreen = 0x44FF44;

        // Spider abdomen (large back section)
        const abdomenGeometry = new THREE.SphereGeometry(1.3, 16, 16);
        const abdomenMaterial = new THREE.MeshLambertMaterial({ color: spiderBlack });
        const abdomen = new THREE.Mesh(abdomenGeometry, abdomenMaterial);
        abdomen.position.set(0, 1.5, -1.0);
        abdomen.scale.set(1, 0.8, 1.3);
        abdomen.castShadow = true;
        group.add(abdomen);

        // Spider markings on abdomen
        const markingGeometry = new THREE.CircleGeometry(0.3, 8);
        const markingMaterial = new THREE.MeshBasicMaterial({ color: 0x8B0000 });
        const marking1 = new THREE.Mesh(markingGeometry, markingMaterial);
        marking1.position.set(0, 2.0, -0.3);
        marking1.rotation.x = -0.5;
        group.add(marking1);

        const marking2 = new THREE.Mesh(markingGeometry, markingMaterial);
        marking2.position.set(0, 1.8, -1.5);
        marking2.rotation.x = 0.8;
        marking2.scale.set(1.5, 1, 1);
        group.add(marking2);

        // Spider cephalothorax (front section)
        const thoraxGeometry = new THREE.SphereGeometry(0.9, 16, 16);
        const thoraxMaterial = new THREE.MeshLambertMaterial({ color: spiderBrown });
        const thorax = new THREE.Mesh(thoraxGeometry, thoraxMaterial);
        thorax.position.set(0, 1.4, 0.6);
        thorax.scale.set(1, 0.7, 1);
        thorax.castShadow = true;
        group.add(thorax);

        // Multiple eyes (spider has 8)
        const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
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
            eye.position.set(pos.x, pos.y, pos.z);
            group.add(eye);
        });

        // Back row of smaller eyes (4 eyes)
        const smallEyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const backEyePositions = [
            { x: -0.35, y: 1.75, z: 1.0 },
            { x: -0.15, y: 1.8, z: 1.1 },
            { x: 0.15, y: 1.8, z: 1.1 },
            { x: 0.35, y: 1.75, z: 1.0 }
        ];
        
        backEyePositions.forEach(pos => {
            const eye = new THREE.Mesh(smallEyeGeometry, eyeMaterial);
            eye.position.set(pos.x, pos.y, pos.z);
            group.add(eye);
        });

        // Fangs/chelicerae
        const fangGeometry = new THREE.ConeGeometry(0.12, 0.5, 6);
        const fangMaterial = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const fang1 = new THREE.Mesh(fangGeometry, fangMaterial);
        fang1.position.set(-0.2, 1.1, 1.4);
        fang1.rotation.x = 0.5;
        fang1.rotation.z = 0.2;
        group.add(fang1);

        const fang2 = new THREE.Mesh(fangGeometry, fangMaterial);
        fang2.position.set(0.2, 1.1, 1.4);
        fang2.rotation.x = 0.5;
        fang2.rotation.z = -0.2;
        group.add(fang2);

        // Poison dripping from fangs
        const poisonGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const poisonMaterial = new THREE.MeshBasicMaterial({ 
            color: poisonGreen,
            transparent: true,
            opacity: 0.8
        });
        const poison1 = new THREE.Mesh(poisonGeometry, poisonMaterial);
        poison1.position.set(-0.22, 0.75, 1.55);
        group.add(poison1);

        const poison2 = new THREE.Mesh(poisonGeometry, poisonMaterial);
        poison2.position.set(0.22, 0.75, 1.55);
        group.add(poison2);

        // 8 spider legs
        const legSegmentGeometry = new THREE.CylinderGeometry(0.08, 0.06, 1.5, 6);
        const legMaterial = new THREE.MeshLambertMaterial({ color: spiderBlack });
        
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
            upperLeg.position.set(config.x, 1.5, config.zOffset);
            upperLeg.rotation.z = config.angle;
            upperLeg.rotation.x = 0.3;
            group.add(upperLeg);

            // Lower leg segment (pointing down to ground)
            const lowerLegGeometry = new THREE.CylinderGeometry(0.06, 0.04, 1.8, 6);
            const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
            const legEndX = config.x + Math.sin(config.angle) * 1.5;
            lowerLeg.position.set(
                legEndX, 
                0.6, 
                config.zOffset + 0.4
            );
            lowerLeg.rotation.z = config.angle * 0.5;
            group.add(lowerLeg);

            // Leg joint
            const jointGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const joint = new THREE.Mesh(jointGeometry, legMaterial);
            joint.position.set(
                config.x + Math.sin(config.angle) * 0.8,
                1.3,
                config.zOffset + 0.3
            );
            group.add(joint);
        });

        // Spinnerets at back
        const spinneretGeometry = new THREE.ConeGeometry(0.15, 0.4, 6);
        const spinneretMaterial = new THREE.MeshLambertMaterial({ color: spiderBrown });
        const spinneret1 = new THREE.Mesh(spinneretGeometry, spinneretMaterial);
        spinneret1.position.set(-0.15, 1.2, -2.2);
        spinneret1.rotation.x = -Math.PI / 2 - 0.3;
        group.add(spinneret1);

        const spinneret2 = new THREE.Mesh(spinneretGeometry, spinneretMaterial);
        spinneret2.position.set(0.15, 1.2, -2.2);
        spinneret2.rotation.x = -Math.PI / 2 - 0.3;
        group.add(spinneret2);

        // Web strand trailing behind
        const webGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2.0, 4);
        const webMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xcccccc,
            transparent: true,
            opacity: 0.4
        });
        const web = new THREE.Mesh(webGeometry, webMaterial);
        web.position.set(0, 0.8, -3.0);
        web.rotation.x = Math.PI / 2 - 0.2;
        group.add(web);
    }
    
    function buildStandardGiant(group) {
        // Giant body
        const bodyGeometry = new THREE.CylinderGeometry(1.0, 1.2, 2.5, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x664422 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2.0;
        body.castShadow = true;
        group.add(body);
        
        // Armor plates
        const armorGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.15);
        const armorMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const armor1 = new THREE.Mesh(armorGeometry, armorMaterial);
        armor1.position.set(-0.5, 2.3, 0.7);
        group.add(armor1);
        
        const armor2 = new THREE.Mesh(armorGeometry, armorMaterial);
        armor2.position.set(0.5, 2.3, 0.7);
        group.add(armor2);
        
        // Giant head
        const headGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x775533 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 4.0;
        head.castShadow = true;
        group.add(head);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.2, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye1.position.set(-0.3, 4.1, 0.65);
        group.add(eye1);
        
        const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye2.position.set(0.3, 4.1, 0.65);
        group.add(eye2);
        
        // Massive arms
        const armGeometry = new THREE.CylinderGeometry(0.35, 0.45, 2.0, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x664422 });
        const arm1 = new THREE.Mesh(armGeometry, armMaterial);
        arm1.position.set(-1.4, 2.2, 0);
        arm1.rotation.z = 0.4;
        arm1.castShadow = true;
        group.add(arm1);
        
        const arm2 = new THREE.Mesh(armGeometry, armMaterial);
        arm2.position.set(1.4, 2.2, 0);
        arm2.rotation.z = -0.4;
        arm2.castShadow = true;
        group.add(arm2);
        
        // Fists
        const fistGeometry = new THREE.SphereGeometry(0.45, 12, 12);
        const fistMaterial = new THREE.MeshLambertMaterial({ color: 0x775533 });
        const fist1 = new THREE.Mesh(fistGeometry, fistMaterial);
        fist1.position.set(-1.9, 1.2, 0);
        group.add(fist1);
        
        const fist2 = new THREE.Mesh(fistGeometry, fistMaterial);
        fist2.position.set(1.9, 1.2, 0);
        group.add(fist2);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.8, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x553311 });
        const leg1 = new THREE.Mesh(legGeometry, legMaterial);
        leg1.position.set(-0.5, 0.6, 0);
        leg1.castShadow = true;
        group.add(leg1);
        
        const leg2 = new THREE.Mesh(legGeometry, legMaterial);
        leg2.position.set(0.5, 0.6, 0);
        leg2.castShadow = true;
        group.add(leg2);
        
        // Club weapon
        const clubGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2.5, 8);
        const clubMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
        const club = new THREE.Mesh(clubGeometry, clubMaterial);
        club.position.set(2.2, 1.8, 0.3);
        club.rotation.z = -0.3;
        group.add(club);
        
        // Club head
        const clubHeadGeometry = new THREE.SphereGeometry(0.5, 12, 12);
        const clubHead = new THREE.Mesh(clubHeadGeometry, clubMaterial);
        clubHead.position.set(2.5, 3.0, 0.3);
        group.add(clubHead);
        
        // Spikes on club
        const spikeGeometry = new THREE.ConeGeometry(0.08, 0.3, 6);
        const spikeMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        for (let i = 0; i < 5; i++) {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            const angle = (i / 5) * Math.PI * 2;
            spike.position.set(
                2.5 + Math.cos(angle) * 0.5,
                3.0 + Math.sin(angle) * 0.4,
                0.3
            );
            spike.rotation.z = angle;
            group.add(spike);
        }
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
