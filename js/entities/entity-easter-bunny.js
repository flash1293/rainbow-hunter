/**
 * Giant Easter Bunny Entity - Easter Meadow boss enemy
 * Massive fluffy bunny with pink bow, golden basket, and rainbow carrot attacks
 */
(function() {
    'use strict';

    function createEasterBunny(posConfig, scale = 1, health = 60) {
        const bunnyGroup = new THREE.Group();

        // Easter bunny colors
        const furWhite = 0xFFF0F5;          // Lavender blush fur
        const innerEarPink = 0xFFB6C1;      // Light pink inner ears
        const nosePink = 0xFF69B4;          // Hot pink nose
        const eyeBlue = 0x4169E1;           // Royal blue eyes
        const ribbonPink = 0xFF1493;        // Deep pink ribbon
        const basketGold = 0xDAA520;        // Goldenrod basket
        const glowColor = 0xFFD700;         // Gold glow

        // Main body - large fluffy body
        const bodyGeometry = new THREE.SphereGeometry(3, 16, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: furWhite,
            emissive: glowColor,
            emissiveIntensity: 0.05,
            shininess: 20
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.scale.y = 1.2;
        body.position.set(0, 5, 0);
        body.castShadow = true;
        bunnyGroup.add(body);

        // Head - round bunny head
        const headGeometry = new THREE.SphereGeometry(2, 16, 16);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, 10, 0);
        head.castShadow = true;
        bunnyGroup.add(head);

        // Long ears
        const earGeometry = new THREE.CylinderGeometry(0.4, 0.6, 4, 8);
        const innerEarMaterial = new THREE.MeshPhongMaterial({
            color: innerEarPink,
            shininess: 10
        });

        // Left ear
        const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
        leftEar.position.set(-1, 13, 0);
        leftEar.rotation.z = 0.2;
        leftEar.castShadow = true;
        bunnyGroup.add(leftEar);

        // Left inner ear
        const leftInnerEarGeometry = new THREE.CylinderGeometry(0.2, 0.4, 3, 8);
        const leftInnerEar = new THREE.Mesh(leftInnerEarGeometry, innerEarMaterial);
        leftInnerEar.position.set(-1, 13, 0.2);
        leftInnerEar.rotation.z = 0.2;
        bunnyGroup.add(leftInnerEar);

        // Right ear
        const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
        rightEar.position.set(1, 13, 0);
        rightEar.rotation.z = -0.2;
        rightEar.castShadow = true;
        bunnyGroup.add(rightEar);

        // Right inner ear
        const rightInnerEar = new THREE.Mesh(leftInnerEarGeometry, innerEarMaterial);
        rightInnerEar.position.set(1, 13, 0.2);
        rightInnerEar.rotation.z = -0.2;
        bunnyGroup.add(rightInnerEar);

        // Eyes - big and sparkling
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.5, 12, 12);
        const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const eyeGeometry = new THREE.SphereGeometry(0.35, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: eyeBlue });
        const sparkleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
        const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        // Left eye
        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(-0.7, 10.3, 1.7);
        bunnyGroup.add(leftEyeWhite);
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.7, 10.3, 2.0);
        bunnyGroup.add(leftEye);
        const leftSparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        leftSparkle.position.set(-0.6, 10.4, 2.2);
        bunnyGroup.add(leftSparkle);

        // Right eye
        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.7, 10.3, 1.7);
        bunnyGroup.add(rightEyeWhite);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.7, 10.3, 2.0);
        bunnyGroup.add(rightEye);
        const rightSparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        rightSparkle.position.set(0.8, 10.4, 2.2);
        bunnyGroup.add(rightSparkle);

        // Cute nose
        const noseGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const noseMaterial = new THREE.MeshPhongMaterial({
            color: nosePink,
            shininess: 50
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 9.5, 2);
        bunnyGroup.add(nose);

        // Whiskers
        const whiskerMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const whiskerGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4);
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 3; i++) {
                const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
                whisker.position.set(side * 0.5, 9.4 + i * 0.15, 1.8);
                whisker.rotation.z = Math.PI / 2;
                whisker.rotation.y = (i - 1) * 0.2;
                bunnyGroup.add(whisker);
            }
        }

        // Pink ribbon bow
        const ribbonMaterial = new THREE.MeshPhongMaterial({
            color: ribbonPink,
            shininess: 50
        });
        const bowLoopGeometry = new THREE.TorusGeometry(0.6, 0.15, 8, 16, Math.PI);
        const leftBow = new THREE.Mesh(bowLoopGeometry, ribbonMaterial);
        leftBow.position.set(-0.7, 11.5, 1.2);
        leftBow.rotation.y = 0.5;
        bunnyGroup.add(leftBow);
        const rightBow = new THREE.Mesh(bowLoopGeometry, ribbonMaterial);
        rightBow.position.set(0.7, 11.5, 1.2);
        rightBow.rotation.y = -0.5;
        bunnyGroup.add(rightBow);
        const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), ribbonMaterial);
        bowCenter.position.set(0, 11.5, 1.4);
        bunnyGroup.add(bowCenter);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2.5, 8);
        const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
        leftArm.position.set(-3, 6.5, 0);
        leftArm.rotation.z = 0.8;
        leftArm.castShadow = true;
        bunnyGroup.add(leftArm);
        const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
        rightArm.position.set(3, 6.5, 0);
        rightArm.rotation.z = -0.5;
        rightArm.castShadow = true;
        bunnyGroup.add(rightArm);

        // Paws
        const pawGeometry = new THREE.SphereGeometry(0.4, 8, 8);
        const leftPaw = new THREE.Mesh(pawGeometry, bodyMaterial);
        leftPaw.position.set(-4, 5.5, 0);
        bunnyGroup.add(leftPaw);
        const rightPaw = new THREE.Mesh(pawGeometry, bodyMaterial);
        rightPaw.position.set(4.2, 5.8, 0);
        bunnyGroup.add(rightPaw);

        // Golden basket (held by right paw)
        const basketGeometry = new THREE.CylinderGeometry(1.2, 0.8, 1, 12, 1, true);
        const basketMaterial = new THREE.MeshPhongMaterial({
            color: basketGold,
            side: THREE.DoubleSide,
            shininess: 80
        });
        const basket = new THREE.Mesh(basketGeometry, basketMaterial);
        basket.position.set(5, 5, 0);
        bunnyGroup.add(basket);

        // Basket handle
        const handleGeometry = new THREE.TorusGeometry(0.8, 0.1, 8, 16, Math.PI);
        const handle = new THREE.Mesh(handleGeometry, basketMaterial);
        handle.position.set(5, 5.6, 0);
        handle.rotation.x = Math.PI / 2;
        bunnyGroup.add(handle);

        // Eggs in basket
        const eggColors = [0xFF69B4, 0x98FB98, 0x87CEEB, 0xFFD700, 0xE6E6FA];
        eggColors.forEach((color, i) => {
            const eggGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const eggMaterial = new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 50
            });
            const egg = new THREE.Mesh(eggGeometry, eggMaterial);
            const angle = (i / 5) * Math.PI * 2;
            egg.position.set(
                5 + Math.cos(angle) * 0.5,
                5.5,
                Math.sin(angle) * 0.5
            );
            egg.scale.y = 1.3;
            bunnyGroup.add(egg);
        });

        // Fluffy tail
        const tailGeometry = new THREE.SphereGeometry(1, 12, 12);
        const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
        tail.position.set(0, 4, -3);
        tail.castShadow = true;
        bunnyGroup.add(tail);

        // Large feet
        const footGeometry = new THREE.SphereGeometry(1.2, 8, 8);
        const leftFoot = new THREE.Mesh(footGeometry, bodyMaterial);
        leftFoot.position.set(-1.5, 1, 1.5);
        leftFoot.scale.set(0.6, 0.4, 1.2);
        leftFoot.castShadow = true;
        bunnyGroup.add(leftFoot);
        const rightFoot = new THREE.Mesh(footGeometry, bodyMaterial);
        rightFoot.position.set(1.5, 1, 1.5);
        rightFoot.scale.set(0.6, 0.4, 1.2);
        rightFoot.castShadow = true;
        bunnyGroup.add(rightFoot);

        // Magic aura sparkles
        for (let i = 0; i < 20; i++) {
            const auraGeometry = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 6, 6);
            const auraMaterial = new THREE.MeshBasicMaterial({
                color: [0xFFD700, 0xFF69B4, 0x98FB98, 0x87CEEB][i % 4],
                transparent: true,
                opacity: 0.7
            });
            const aura = new THREE.Mesh(auraGeometry, auraMaterial);
            const angle = (i / 20) * Math.PI * 2;
            const radius = 4 + Math.random() * 2;
            aura.position.set(
                Math.cos(angle) * radius,
                2 + Math.random() * 10,
                Math.sin(angle) * radius
            );
            bunnyGroup.add(aura);
        }

        // Apply scale
        bunnyGroup.scale.set(scale, scale, scale);

        // Position
        const bunnyX = posConfig.x;
        const bunnyZ = posConfig.z;
        const bunnyY = posConfig.y !== undefined ? posConfig.y : getTerrainHeight(bunnyX, bunnyZ);
        bunnyGroup.position.set(bunnyX, bunnyY, bunnyZ);
        
        // Add to scene
        G.scene.add(bunnyGroup);

        // Return object with proper structure for game systems
        return {
            mesh: bunnyGroup,
            health: health,
            maxHealth: health,
            scale: scale,
            alive: true,
            speed: 0.035 * speedMultiplier * scale, // Slow hopping speed
            patrolLeft: bunnyX - 25,
            patrolRight: bunnyX + 25,
            patrolFront: bunnyZ - 15,
            patrolBack: bunnyZ + 15,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: scale < 1 ? 4500 : 3500,
            phase: 1,
            attackCooldown: 0,
            breathColor: 0xFF69B4, // Pink carrot projectiles
            frozen: false,
            frozenUntil: 0,
            isEasterBunny: true,
            homeX: bunnyX,
            homeZ: bunnyZ,
            chaseRange: 35 // Only chase when player is fairly close
        };
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('easter-bunny', createEasterBunny);
    }

    // Also expose globally for direct use
    window.createEasterBunny = createEasterBunny;
})();
