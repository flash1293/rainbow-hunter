// entity-lava-monster.js - Lava Monster enemy (lava theme only)
// No theme variants - appears only in lava caves level

(function() {
    'use strict';
    
    /**
     * Create a lava monster enemy - lava caves enemy that shoots fireballs and leaves lava trails
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} patrolLeft - Left patrol boundary
     * @param {number} patrolRight - Right patrol boundary
     * @param {number} speed - Movement speed (default: 0.009)
     * @returns {object} Lava monster entity object
     */
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
    
    // ========================================
    // REGISTER WITH ENTITY REGISTRY
    // ========================================
    
    ENTITY_REGISTRY.register('lavaMonster', {
        create: createLavaMonster
    });
    
    // Export globally for backward compatibility
    window.createLavaMonster = createLavaMonster;
    
})();
