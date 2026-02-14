/**
 * Corrupted Unicorn Entity - Enchanted Grove boss enemy
 * Dark flying unicorn with purple mane, broken horn, and rainbow attacks
 */
(function() {
    'use strict';

    function createUnicorn(posConfig, scale = 1, health = 60) {
        const unicornGroup = new THREE.Group();

        // Corrupted unicorn colors
        const bodyDark = 0x1a0a1a;        // Near-black dark purple body
        const manePurple = 0x8B008B;       // Dark magenta mane
        const maneHighlight = 0x9932CC;    // Dark orchid highlight
        const hornBroken = 0x666666;       // Gray broken horn
        const eyeRed = 0xFF0000;           // Glowing red eyes
        const glowPurple = 0x9400D3;       // Dark violet glow

        // Main body - horse-like elongated body
        const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 8, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: bodyDark,
            emissive: glowPurple,
            emissiveIntensity: 0.1,
            shininess: 30
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.set(0, 4, 0);
        body.castShadow = true;
        unicornGroup.add(body);

        // Neck
        const neckGeometry = new THREE.CylinderGeometry(1.2, 1.8, 4, 12);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.position.set(4, 6, 0);
        neck.rotation.z = -0.4;
        neck.castShadow = true;
        unicornGroup.add(neck);

        // Head - horse head shape
        const headGeometry = new THREE.CylinderGeometry(0.8, 1.4, 3.5, 12);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(6, 8.5, 0);
        head.rotation.z = 0.2;
        head.castShadow = true;
        unicornGroup.add(head);

        // Snout
        const snoutGeometry = new THREE.CylinderGeometry(0.5, 0.8, 2, 10);
        const snout = new THREE.Mesh(snoutGeometry, bodyMaterial);
        snout.position.set(7.5, 8, 0);
        snout.rotation.z = Math.PI / 2;
        snout.castShadow = true;
        unicornGroup.add(snout);

        // Nostrils with faint glow
        const nostrilGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const nostrilMaterial = new THREE.MeshBasicMaterial({
            color: glowPurple,
            transparent: true,
            opacity: 0.7
        });
        const leftNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
        leftNostril.position.set(8.4, 7.8, 0.3);
        unicornGroup.add(leftNostril);
        
        const rightNostril = new THREE.Mesh(nostrilGeometry, nostrilMaterial);
        rightNostril.position.set(8.4, 7.8, -0.3);
        unicornGroup.add(rightNostril);

        // BROKEN HORN - jagged and cracked
        const hornGeometry = new THREE.ConeGeometry(0.4, 2.5, 6);
        const hornMaterial = new THREE.MeshPhongMaterial({
            color: hornBroken,
            emissive: glowPurple,
            emissiveIntensity: 0.2
        });
        const horn = new THREE.Mesh(hornGeometry, hornMaterial);
        horn.position.set(6.2, 10.5, 0);
        horn.rotation.z = 0.3; // Slightly tilted - broken
        horn.castShadow = true;
        unicornGroup.add(horn);

        // Crack effect on horn
        for (let i = 0; i < 3; i++) {
            const crackGeometry = new THREE.BoxGeometry(0.05, 0.5 + Math.random() * 0.3, 0.05);
            const crackMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.8
            });
            const crack = new THREE.Mesh(crackGeometry, crackMaterial);
            crack.position.set(6.2 + (Math.random() - 0.5) * 0.3, 10 + i * 0.4, (Math.random() - 0.5) * 0.3);
            crack.rotation.z = Math.random() * 0.5;
            unicornGroup.add(crack);
        }

        // Ears
        const earGeometry = new THREE.ConeGeometry(0.3, 0.8, 6);
        const earMaterial = new THREE.MeshPhongMaterial({ color: bodyDark });
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(5.5, 10, 0.6);
        leftEar.rotation.x = -0.2;
        unicornGroup.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(5.5, 10, -0.6);
        rightEar.rotation.x = 0.2;
        unicornGroup.add(rightEar);

        // Glowing RED eyes
        const eyeGeometry = new THREE.SphereGeometry(0.35, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({
            color: eyeRed,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(6.8, 9, 0.6);
        unicornGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(6.8, 9, -0.6);
        unicornGroup.add(rightEye);

        // Eye glow light
        const eyeLight = new THREE.PointLight(eyeRed, 2.0, 15);
        eyeLight.position.set(6.8, 9, 0);
        unicornGroup.add(eyeLight);

        // MANE - flowing purple strands
        const maneMaterial = new THREE.MeshPhongMaterial({
            color: manePurple,
            emissive: maneHighlight,
            emissiveIntensity: 0.3,
            shininess: 40
        });
        
        // Forelock (mane on forehead)
        for (let i = 0; i < 8; i++) {
            const strandGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1.5 + Math.random(), 6);
            const strand = new THREE.Mesh(strandGeometry, maneMaterial);
            strand.position.set(5.5 + Math.random() * 0.5, 9.5 + Math.random() * 0.5, (i - 4) * 0.15);
            strand.rotation.z = 0.3 + Math.random() * 0.2;
            strand.userData.maneOffset = Math.random() * Math.PI * 2;
            unicornGroup.add(strand);
        }

        // Neck mane
        for (let i = 0; i < 15; i++) {
            const strandGeometry = new THREE.CylinderGeometry(0.12, 0.04, 2 + Math.random() * 1.5, 6);
            const strand = new THREE.Mesh(strandGeometry, maneMaterial);
            const progress = i / 15;
            strand.position.set(2 + progress * 3, 6 + progress * 2.5, 0);
            strand.rotation.z = 0.8 - progress * 0.3;
            strand.userData.maneOffset = Math.random() * Math.PI * 2;
            unicornGroup.add(strand);
        }

        // LEGS - four horse legs
        const legMaterial = new THREE.MeshPhongMaterial({ color: bodyDark });
        const legPositions = [
            { x: -2.5, z: 1.2 }, // back left
            { x: -2.5, z: -1.2 }, // back right
            { x: 2.5, z: 1.2 }, // front left
            { x: 2.5, z: -1.2 } // front right
        ];

        legPositions.forEach((pos, i) => {
            // Upper leg
            const upperLegGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2.5, 8);
            const upperLeg = new THREE.Mesh(upperLegGeometry, legMaterial);
            upperLeg.position.set(pos.x, 2, pos.z);
            unicornGroup.add(upperLeg);

            // Lower leg
            const lowerLegGeometry = new THREE.CylinderGeometry(0.3, 0.35, 2, 8);
            const lowerLeg = new THREE.Mesh(lowerLegGeometry, legMaterial);
            lowerLeg.position.set(pos.x, 0.3, pos.z);
            unicornGroup.add(lowerLeg);

            // Hoof
            const hoofGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.4, 8);
            const hoofMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const hoof = new THREE.Mesh(hoofGeometry, hoofMaterial);
            hoof.position.set(pos.x, -0.5, pos.z);
            unicornGroup.add(hoof);
        });

        // TAIL - long flowing purple
        for (let i = 0; i < 20; i++) {
            const tailStrandGeometry = new THREE.CylinderGeometry(0.08, 0.03, 3 + Math.random() * 2, 6);
            const tailStrand = new THREE.Mesh(tailStrandGeometry, maneMaterial);
            tailStrand.position.set(-5 - Math.random() * 0.5, 3 + (Math.random() - 0.5), (i - 10) * 0.15);
            tailStrand.rotation.z = 0.3 + Math.random() * 0.3;
            tailStrand.userData.tailOffset = Math.random() * Math.PI * 2;
            unicornGroup.add(tailStrand);
        }

        // WINGS - dark ethereal wings (for flying)
        const wingMaterial = new THREE.MeshPhongMaterial({
            color: bodyDark,
            emissive: glowPurple,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        // Wing structure
        function createWing(side) {
            const wingGroup = new THREE.Group();
            
            // Main wing shape
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0, 0);
            wingShape.quadraticCurveTo(2, 3, 4, 5);
            wingShape.quadraticCurveTo(3, 3, 3, 1);
            wingShape.quadraticCurveTo(2, 2, 2.5, 3);
            wingShape.quadraticCurveTo(1.5, 2, 1.5, 0.5);
            wingShape.quadraticCurveTo(1, 1, 0, 0);
            
            const wingGeometry = new THREE.ShapeGeometry(wingShape);
            const wing = new THREE.Mesh(wingGeometry, wingMaterial);
            wing.rotation.y = side * Math.PI / 2;
            wing.scale.set(1.5, 1.5, 1);
            wingGroup.add(wing);

            // Wing bones
            for (let i = 0; i < 4; i++) {
                const boneGeometry = new THREE.CylinderGeometry(0.08, 0.05, 4 + i * 0.5, 6);
                const boneMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
                const bone = new THREE.Mesh(boneGeometry, boneMaterial);
                bone.position.set(0, 2 + i * 0.3, side * (1 + i * 0.3));
                bone.rotation.x = side * 0.3;
                bone.rotation.z = -0.5 + i * 0.2;
                wingGroup.add(bone);
            }

            return wingGroup;
        }

        const leftWing = createWing(1);
        leftWing.position.set(0, 6, 2);
        leftWing.rotation.x = Math.PI / 6;
        unicornGroup.add(leftWing);

        const rightWing = createWing(-1);
        rightWing.position.set(0, 6, -2);
        rightWing.rotation.x = -Math.PI / 6;
        unicornGroup.add(rightWing);

        // Corruption particles floating around
        for (let i = 0; i < 10; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.15, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? glowPurple : manePurple,
                transparent: true,
                opacity: 0.5 + Math.random() * 0.3
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 12,
                3 + Math.random() * 6,
                (Math.random() - 0.5) * 6
            );
            particle.userData.floatOffset = Math.random() * Math.PI * 2;
            particle.userData.floatSpeed = 0.5 + Math.random() * 0.5;
            unicornGroup.add(particle);
        }

        // Body glow
        const bodyLight = new THREE.PointLight(glowPurple, 1.5, 25);
        bodyLight.position.set(0, 5, 0);
        unicornGroup.add(bodyLight);

        // Scale and position
        unicornGroup.scale.set(scale, scale, scale);
        
        // Position configuration
        const pos = posConfig || G.levelConfig.dragon;
        const unicornX = pos ? pos.x : 0;
        const unicornZ = pos ? pos.z : -120;
        const unicornY = pos && pos.y !== undefined ? pos.y : 3 * scale; // Stays closer to ground
        
        unicornGroup.position.set(unicornX, unicornY, unicornZ);
        G.scene.add(unicornGroup);

        // Return dragon-compatible object structure
        return {
            mesh: unicornGroup,
            leftWing: leftWing,
            rightWing: rightWing,
            health: health,
            maxHealth: health,
            scale: scale,
            alive: true,
            speed: 0.06 * scale,
            patrolLeft: unicornX - 40,
            patrolRight: unicornX + 40,
            patrolFront: unicornZ - 30,
            patrolBack: unicornZ + 30,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: scale < 0.6 ? 5000 : 3500,
            wingFlapPhase: 0,
            isFlying: true, // Always flying
            flyStartTime: 0,
            flyDuration: 0,
            flyTargetY: unicornY,
            groundY: unicornY,
            frozen: false,
            frozenUntil: 0,
            isUnicorn: true, // Flag to identify as unicorn
            hoverPhase: Math.random() * Math.PI * 2,
            homeX: unicornX,
            homeZ: unicornZ,
            baseY: unicornY
        };
    }

    // Animation update function for unicorn visuals
    function updateUnicorn(unicorn, time) {
        if (!unicorn || !unicorn.mesh) return;

        // Floating motion - add to current position based on hoverPhase
        const floatAmount = Math.sin(time * 0.001 + (unicorn.hoverPhase || 0)) * 1.5;
        unicorn.mesh.position.y = unicorn.baseY + floatAmount;

        // Wing flapping
        if (unicorn.leftWing) {
            unicorn.leftWing.rotation.x = Math.PI / 6 + Math.sin(time * 0.008) * 0.4;
        }
        if (unicorn.rightWing) {
            unicorn.rightWing.rotation.x = -Math.PI / 6 - Math.sin(time * 0.008) * 0.4;
        }

        // Mane and tail animation
        unicorn.mesh.children.forEach(child => {
            if (child.userData && child.userData.maneOffset !== undefined) {
                child.rotation.x = Math.sin(time * 0.003 + child.userData.maneOffset) * 0.2;
            }
            if (child.userData && child.userData.tailOffset !== undefined) {
                child.rotation.x = Math.sin(time * 0.004 + child.userData.tailOffset) * 0.3;
            }
            if (child.userData && child.userData.floatOffset !== undefined) {
                // Floating particles - slightly adjust y position
                const baseY = child.userData.baseParticleY || child.position.y;
                if (!child.userData.baseParticleY) child.userData.baseParticleY = child.position.y;
                child.position.y = baseY + Math.sin(time * 0.002 * (child.userData.floatSpeed || 1) + child.userData.floatOffset) * 0.5;
            }
        });
    }

    // Register with entity system
    ENTITY_REGISTRY.register('unicorn', {
        create: createUnicorn,
        update: updateUnicorn
    });

    // Make globally accessible
    window.createUnicorn = createUnicorn;
    window.updateUnicorn = updateUnicorn;

})();
