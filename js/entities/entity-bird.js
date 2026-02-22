/**
 * Bird Entity - Flying creature (hard mode only)
 * Themes: Standard bird, Graveyard bat, Candy butterfly
 */
(function() {
    'use strict';

    function createBird(centerX, centerZ, radius, speed) {
        const birdGroup = new THREE.Group();
        
        if (G.graveyardTheme) {
            // BAT - dark flying creature for graveyard
            const batColor = 0x1a1a1a;
            const batWingColor = 0x2a2020;

            // Bat body - small and furry
            const bodyGeometry = new THREE.SphereGeometry(0.35, 12, 12);
            bodyGeometry.scale(1, 1, 1.3);
            const bodyMaterial = getMaterial('lambert', { color: batColor });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);

            // Bat head
            const headGeometry = getGeometry('sphere', 0.2, 10, 10);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.1, -0.35);
            birdGroup.add(head);

            // Pointy ears
            const earGeometry = getGeometry('cone', 0.08, 0.2, 4);
            const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear1.position.set(-0.1, 0.25, -0.35);
            ear1.rotation.z = -0.2;
            birdGroup.add(ear1);

            const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear2.position.set(0.1, 0.25, -0.35);
            ear2.rotation.z = 0.2;
            birdGroup.add(ear2);

            // Glowing red eyes
            const eyeGeometry = getGeometry('sphere', 0.04, 8, 8);
            const eyeMaterial = getMaterial('basic', {
                color: 0xFF0000,
                transparent: true,
                opacity: 0.9
            });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(-0.08, 0.12, -0.5);
            birdGroup.add(eye1);

            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(0.08, 0.12, -0.5);
            birdGroup.add(eye2);

            // Bat wings - membrane-like
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0, 0);
            wingShape.lineTo(0.8, 0.3);
            wingShape.lineTo(1.0, 0);
            wingShape.lineTo(0.9, -0.2);
            wingShape.lineTo(0.6, -0.1);
            wingShape.lineTo(0.3, -0.2);
            wingShape.lineTo(0, 0);

            const wingGeometry = new THREE.ShapeGeometry(wingShape);
            const wingMaterial = getMaterial('lambert', {
                color: batWingColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });

            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.1, 0, 0);
            leftWing.rotation.y = Math.PI / 2;
            leftWing.scale.x = -1;
            leftWing.castShadow = true;
            birdGroup.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.1, 0, 0);
            rightWing.rotation.y = -Math.PI / 2;
            rightWing.castShadow = true;
            birdGroup.add(rightWing);

            birdGroup.leftWing = leftWing;
            birdGroup.rightWing = rightWing;
        } else if (G.computerTheme) {
            // SURVEILLANCE DRONE - flying security bot
            const droneColor = 0x0A0A15;
            const glowColor = Math.random() > 0.5 ? 0x00FFFF : 0xFF00FF;
            
            // Main body - flat hexagonal disk
            const bodyGeometry = getGeometry('cylinder', 0.4, 0.4, 0.15, 6);
            const bodyMaterial = getMaterial('phong', { 
                color: droneColor,
                emissive: 0x001122,
                emissiveIntensity: 0.3,
                shininess: 80
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);
            
            // Central eye/sensor (glowing)
            const eyeGeometry = getGeometry('sphere', 0.15, 12, 12);
            const eyeMaterial = getMaterial('basic', { 
                color: 0xFF0000,
                transparent: true,
                opacity: 0.9
            });
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.y = -0.1;
            birdGroup.add(eye);
            
            // Rotating propeller arms (4 arms)
            const armGeometry = getGeometry('box', 0.8, 0.03, 0.08);
            const armMaterial = getMaterial('phong', { 
                color: 0x222233,
                shininess: 60
            });
            
            const arm1 = new THREE.Mesh(armGeometry, armMaterial);
            arm1.position.y = 0.1;
            birdGroup.add(arm1);
            
            const arm2 = new THREE.Mesh(armGeometry, armMaterial);
            arm2.position.y = 0.1;
            arm2.rotation.y = Math.PI / 2;
            birdGroup.add(arm2);
            
            // Propeller discs at arm ends (glowing)
            const propGeometry = getGeometry('cylinder', 0.12, 0.12, 0.02, 12);
            const propMaterial = getMaterial('basic', { 
                color: glowColor,
                transparent: true,
                opacity: 0.7
            });
            
            const positions = [[0.4, 0], [-0.4, 0], [0, 0.4], [0, -0.4]];
            positions.forEach(pos => {
                const prop = new THREE.Mesh(propGeometry, propMaterial);
                prop.position.set(pos[0], 0.12, pos[1]);
                birdGroup.add(prop);
            });
            
            // Blinking status lights
            const lightGeometry = getGeometry('sphere', 0.04, 8, 8);
            const lightColors = [0x00FF00, 0xFF0000, 0x00FFFF];
            for (let i = 0; i < 3; i++) {
                const lightMaterial = getMaterial('basic', { 
                    color: lightColors[i],
                    transparent: true,
                    opacity: 0.9
                });
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                const angle = (i / 3) * Math.PI * 2;
                light.position.set(Math.cos(angle) * 0.25, 0.1, Math.sin(angle) * 0.25);
                birdGroup.add(light);
            }
            
            // Data stream trail (wireframe cone pointing down)
            const trailGeometry = getGeometry('cone', 0.15, 0.4, 8);
            const trailMaterial = getMaterial('basic', { 
                color: glowColor,
                wireframe: true,
                transparent: true,
                opacity: 0.5
            });
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.y = -0.35;
            trail.rotation.x = Math.PI;
            birdGroup.add(trail);
            
            // Use arms as "wings" for animation
            birdGroup.leftWing = arm1;
            birdGroup.rightWing = arm2;
            birdGroup.isDrone = true;
        } else if (G.candyTheme) {
            // CANDY BUTTERFLY - colorful flying candy
            const butterflyColors = [0xFF69B4, 0x87CEEB, 0xFFD700, 0x98FB98, 0xDDA0DD];
            const butterflyColor = butterflyColors[Math.floor(Math.random() * butterflyColors.length)];

            // Small round body
            const bodyGeometry = new THREE.SphereGeometry(0.25, 10, 10);
            bodyGeometry.scale(1, 1, 1.5);
            const bodyMaterial = getMaterial('phong', {
                color: butterflyColor,
                shininess: 80
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);

            // Butterfly wings
            const wingGeometry = getGeometry('circle', 0.6, 16);
            const wingMaterial = getMaterial('phong', {
                color: butterflyColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });

            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.5, 0, 0);
            leftWing.rotation.y = 0.3;
            leftWing.castShadow = true;
            birdGroup.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.5, 0, 0);
            rightWing.rotation.y = -0.3;
            rightWing.castShadow = true;
            birdGroup.add(rightWing);

            // Sparkle on wings
            const sparkleGeometry = getGeometry('sphere', 0.05, 8, 8);
            const sparkleMaterial = getMaterial('basic', { color: 0xFFFFFF });
            for (let i = 0; i < 4; i++) {
                const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
                sparkle.position.set(
                    (Math.random() - 0.5) * 1.2,
                    (Math.random() - 0.5) * 0.3,
                    0
                );
                birdGroup.add(sparkle);
            }

            birdGroup.leftWing = leftWing;
            birdGroup.rightWing = rightWing;
        } else if (G.enchantedTheme) {
            // GIANT BUTTERFLY - large ornate butterfly for enchanted theme
            const bodyColor = 0x8B4513;
            const wingColors = [0xFF69B4, 0x9370DB, 0x00CED1, 0xFFD700];

            // Fuzzy body
            const bodyGeometry = getGeometry('cylinder', 0.15, 0.18, 0.7, 8);
            const bodyMaterial = getMaterial('lambert', { color: bodyColor });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.rotation.x = Math.PI / 6;
            body.castShadow = true;
            birdGroup.add(body);

            // Head
            const headGeometry = getGeometry('sphere', 0.15, 10, 10);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.5, 0.1);
            birdGroup.add(head);

            // Compound eyes
            const eyeGeometry = getGeometry('sphere', 0.07, 8, 8);
            const eyeMaterial = getMaterial('basic', { color: 0x000000 });
            [-0.08, 0.08].forEach(x => {
                const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
                eye.position.set(x, 0.55, 0.2);
                birdGroup.add(eye);
            });

            // Curly antennae
            const antennaGeometry = getGeometry('cylinder', 0.015, 0.015, 0.35, 6);
            const antennaMaterial = getMaterial('lambert', { color: 0x333333 });
            [-0.06, 0.06].forEach((x, i) => {
                const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
                antenna.position.set(x, 0.75, 0.05);
                antenna.rotation.z = x * 2;
                birdGroup.add(antenna);
                
                // Antenna tip
                const tipGeometry = getGeometry('sphere', 0.04, 6, 6);
                const tip = new THREE.Mesh(tipGeometry, antennaMaterial);
                tip.position.set(x * 2.5, 0.9, 0.05);
                birdGroup.add(tip);
            });

            // Large ornate wings (upper pair)
            const wingGeometry = getGeometry('circle', 0.8, 16, 0, Math.PI);
            const leftWingMaterial = getMaterial('basic', { 
                color: 0xFF69B4, 
                transparent: true, 
                opacity: 0.7, 
                side: THREE.DoubleSide 
            });
            const rightWingMaterial = getMaterial('basic', { 
                color: 0x9370DB, 
                transparent: true, 
                opacity: 0.7, 
                side: THREE.DoubleSide 
            });
            
            const leftWing = new THREE.Mesh(wingGeometry, leftWingMaterial);
            leftWing.position.set(-0.65, 0, 0);
            leftWing.rotation.y = 0.8;
            leftWing.rotation.z = -0.3;
            birdGroup.add(leftWing);
            
            const rightWing = new THREE.Mesh(wingGeometry, rightWingMaterial);
            rightWing.position.set(0.65, 0, 0);
            rightWing.rotation.y = -0.8;
            rightWing.rotation.z = 0.3;
            rightWing.scale.x = -1;
            birdGroup.add(rightWing);

            // Lower wings (smaller)
            const lowerWingGeometry = getGeometry('circle', 0.45, 12);
            const lowerLeftMaterial = getMaterial('basic', { 
                color: 0x00CED1, 
                transparent: true, 
                opacity: 0.6, 
                side: THREE.DoubleSide 
            });
            const lowerRightMaterial = getMaterial('basic', { 
                color: 0xFFD700, 
                transparent: true, 
                opacity: 0.6, 
                side: THREE.DoubleSide 
            });
            
            const lowerLeftWing = new THREE.Mesh(lowerWingGeometry, lowerLeftMaterial);
            lowerLeftWing.position.set(-0.45, -0.3, -0.1);
            lowerLeftWing.rotation.y = 0.6;
            birdGroup.add(lowerLeftWing);
            
            const lowerRightWing = new THREE.Mesh(lowerWingGeometry, lowerRightMaterial);
            lowerRightWing.position.set(0.45, -0.3, -0.1);
            lowerRightWing.rotation.y = -0.6;
            birdGroup.add(lowerRightWing);

            // Wing spots (white dots)
            const spotGeometry = getGeometry('circle', 0.08, 8);
            const spotMaterial = getMaterial('basic', { color: 0xFFFFFF, side: THREE.DoubleSide });
            [[0.45, 0.3, 0.01], [-0.45, 0.3, 0.01], [0.25, 0, 0.01], [-0.25, 0, 0.01]].forEach(pos => {
                const spot = new THREE.Mesh(spotGeometry, spotMaterial);
                spot.position.set(...pos);
                birdGroup.add(spot);
            });

            // Pollen trail
            for (let i = 0; i < 4; i++) {
                const pollenGeometry = getGeometry('sphere', 0.04, 6, 6);
                const pollenMaterial = getMaterial('basic', { color: 0xFFFF00, transparent: true, opacity: 0.6 });
                const pollen = new THREE.Mesh(pollenGeometry, pollenMaterial);
                pollen.position.set(
                    (Math.random() - 0.5) * 0.3,
                    -0.3 - i * 0.12,
                    -0.15 - i * 0.08
                );
                birdGroup.add(pollen);
            }

            birdGroup.leftWing = leftWing;
            birdGroup.rightWing = rightWing;
            birdGroup.isGiantButterfly = true;
        } else {
            // Standard bird
            // Bird body
            const bodyGeometry = getGeometry('sphere', 0.4, 8, 8);
            const bodyMaterial = getMaterial('lambert', { color: 0x4a3a2a });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);
            
            // Wings
            const wingGeometry = getGeometry('box', 1.2, 0.1, 0.4);
            const wingMaterial = getMaterial('lambert', { color: 0x3a2a1a });
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.6, 0, 0);
            leftWing.castShadow = true;
            birdGroup.add(leftWing);
            
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.6, 0, 0);
            rightWing.castShadow = true;
            birdGroup.add(rightWing);
            
            // Beak
            const beakGeometry = getGeometry('cone', 0.15, 0.3, 6);
            const beakMaterial = getMaterial('lambert', { color: 0xFFA500 });
            const beak = new THREE.Mesh(beakGeometry, beakMaterial);
            beak.rotation.z = -Math.PI / 2;
            beak.position.set(0, 0, -0.4);
            birdGroup.add(beak);

            birdGroup.leftWing = leftWing;
            birdGroup.rightWing = rightWing;
        }
        
        const angle = Math.random() * Math.PI * 2;
        const startX = centerX + Math.cos(angle) * radius;
        const startZ = centerZ + Math.sin(angle) * radius;
        const startY = 8 + Math.random() * 4;
        
        birdGroup.position.set(startX, startY, startZ);
        G.scene.add(birdGroup);
        
        return {
            mesh: birdGroup,
            centerX: centerX,
            centerZ: centerZ,
            radius: radius,
            speed: speed,
            angle: angle,
            height: startY,
            leftWing: birdGroup.leftWing,
            rightWing: birdGroup.rightWing,
            lastBombTime: Date.now(),
            wingFlapPhase: 0
        };
    }

    // Register with entity registry
    ENTITY_REGISTRY.register('bird', {
        create: createBird
    });

    // Export for global access
    window.createBird = createBird;
})();
