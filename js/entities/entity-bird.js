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
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: batColor });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);

            // Bat head
            const headGeometry = new THREE.SphereGeometry(0.2, 10, 10);
            const head = new THREE.Mesh(headGeometry, bodyMaterial);
            head.position.set(0, 0.1, -0.35);
            birdGroup.add(head);

            // Pointy ears
            const earGeometry = new THREE.ConeGeometry(0.08, 0.2, 4);
            const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear1.position.set(-0.1, 0.25, -0.35);
            ear1.rotation.z = -0.2;
            birdGroup.add(ear1);

            const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
            ear2.position.set(0.1, 0.25, -0.35);
            ear2.rotation.z = 0.2;
            birdGroup.add(ear2);

            // Glowing red eyes
            const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({
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
            const wingMaterial = new THREE.MeshLambertMaterial({
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
        } else if (G.candyTheme) {
            // CANDY BUTTERFLY - colorful flying candy
            const butterflyColors = [0xFF69B4, 0x87CEEB, 0xFFD700, 0x98FB98, 0xDDA0DD];
            const butterflyColor = butterflyColors[Math.floor(Math.random() * butterflyColors.length)];

            // Small round body
            const bodyGeometry = new THREE.SphereGeometry(0.25, 10, 10);
            bodyGeometry.scale(1, 1, 1.5);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: butterflyColor,
                shininess: 80
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);

            // Butterfly wings
            const wingGeometry = new THREE.CircleGeometry(0.6, 16);
            const wingMaterial = new THREE.MeshPhongMaterial({
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
            const sparkleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
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
        } else {
            // Standard bird
            // Bird body
            const bodyGeometry = new THREE.SphereGeometry(0.4, 8, 8);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            birdGroup.add(body);
            
            // Wings
            const wingGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.4);
            const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2a1a });
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.6, 0, 0);
            leftWing.castShadow = true;
            birdGroup.add(leftWing);
            
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.6, 0, 0);
            rightWing.castShadow = true;
            birdGroup.add(rightWing);
            
            // Beak
            const beakGeometry = new THREE.ConeGeometry(0.15, 0.3, 6);
            const beakMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
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
