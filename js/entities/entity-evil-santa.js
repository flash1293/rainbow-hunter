/**
 * Evil Santa Entity - Christmas Village boss enemy
 * The evil Santa on his flying sledge, throwing explosive presents and summoning evil elves
 */
(function() {
    'use strict';

    function createEvilSanta(posConfig, scale = 1, health = 70) {
        const group = new THREE.Group();
        const santaRed = 0xCC0000;      // Dark red coat
        const santaWhite = 0xFFFFFF;    // White trim
        const skinColor = 0xFFCCCC;     // Pale skin
        const beltColor = 0x222222;     // Black belt
        const buckleColor = 0xFFD700;   // Gold buckle
        const sledgeColor = 0x8B0000;   // Dark red sledge
        const sledgeRailColor = 0xFFD700; // Gold rails
        const eyeGlow = 0xFF0000;       // Evil red eyes
        
        // Large body with coat
        const bodyGeometry = getGeometry('cylinder', 1.0, 1.4, 2.5, 12);
        const bodyMaterial = getMaterial('lambert', { color: santaRed });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2.5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // White coat trim (bottom)
        const trimBottomGeometry = getGeometry('cylinder', 1.5, 1.5, 0.3, 12);
        const trimMaterial = getMaterial('lambert', { color: santaWhite });
        const trimBottom = new THREE.Mesh(trimBottomGeometry, trimMaterial);
        trimBottom.position.y = 1.3;
        trimBottom.castShadow = true;
        group.add(trimBottom);
        
        // White coat trim (middle)
        const trimMiddleGeometry = getGeometry('cylinder', 1.1, 1.1, 0.15, 12);
        const trimMiddle = new THREE.Mesh(trimMiddleGeometry, trimMaterial);
        trimMiddle.position.y = 3.7;
        trimMiddle.castShadow = true;
        group.add(trimMiddle);
        
        // Black belt
        const beltGeometry = getGeometry('cylinder', 1.05, 1.35, 0.25, 12);
        const beltMaterial = getMaterial('lambert', { color: beltColor });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 2.3;
        belt.castShadow = true;
        group.add(belt);
        
        // Gold belt buckle
        const buckleGeometry = getGeometry('box', 0.4, 0.3, 0.15);
        const buckleMaterial = getMaterial('lambert', { color: buckleColor });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 2.3, 1.4);
        buckle.castShadow = true;
        group.add(buckle);
        
        // Head
        const headGeometry = getGeometry('sphere', 0.8, 16, 16);
        const headMaterial = getMaterial('lambert', { color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 4.5;
        head.castShadow = true;
        group.add(head);
        
        // Santa hat
        const hatGeometry = getGeometry('cone', 0.7, 1.5, 12);
        const hat = new THREE.Mesh(hatGeometry, bodyMaterial);
        hat.position.y = 5.6;
        hat.castShadow = true;
        group.add(hat);
        
        // Hat trim
        const hatTrimGeometry = getGeometry('cylinder', 0.75, 0.75, 0.2, 12);
        const hatTrim = new THREE.Mesh(hatTrimGeometry, trimMaterial);
        hatTrim.position.y = 4.9;
        hatTrim.castShadow = true;
        group.add(hatTrim);
        
        // Hat pom-pom
        const pomPomGeometry = getGeometry('sphere', 0.2, 12, 12);
        const pomPom = new THREE.Mesh(pomPomGeometry, trimMaterial);
        pomPom.position.y = 6.3;
        pomPom.castShadow = true;
        group.add(pomPom);
        
        // Evil glowing eyes
        const eyeGeometry = getGeometry('sphere', 0.15, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: eyeGlow });
        [-0.3, 0.3].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 4.6, 0.7);
            group.add(eye);
            
            // Evil glow effect
            const glowGeometry = getGeometry('sphere', 0.2, 12, 12);
            const glowMaterial = getMaterial('basic', { 
                color: eyeGlow, 
                transparent: true, 
                opacity: 0.3 
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, 4.6, 0.7);
            group.add(glow);
        });
        
        // Evil beard (darker, scraggly)
        const beardGeometry = getGeometry('sphere', 0.6, 12, 12);
        const beardMaterial = getMaterial('lambert', { color: 0xE0E0E0 });
        const beard = new THREE.Mesh(beardGeometry, beardMaterial);
        beard.position.set(0, 4.0, 0.6);
        beard.scale.set(1.2, 1.0, 0.8);
        beard.castShadow = true;
        group.add(beard);
        
        // Mustache
        [-0.3, 0.3].forEach(x => {
            const mustacheGeometry = getGeometry('sphere', 0.25, 12, 12);
            const mustache = new THREE.Mesh(mustacheGeometry, beardMaterial);
            mustache.position.set(x, 4.3, 0.65);
            mustache.scale.set(1.5, 0.5, 0.8);
            mustache.castShadow = true;
            group.add(mustache);
        });
        
        // Arms
        const armGeometry = getGeometry('cylinder', 0.3, 0.35, 1.8, 8);
        const armMaterial = getMaterial('lambert', { color: santaRed });
        [-1.3, 1.3].forEach((x, i) => {
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.set(x, 2.8, 0);
            arm.rotation.z = i === 0 ? 0.4 : -0.4;
            arm.castShadow = true;
            group.add(arm);
            
            // White cuff
            const cuffGeometry = getGeometry('cylinder', 0.38, 0.38, 0.2, 8);
            const cuff = new THREE.Mesh(cuffGeometry, trimMaterial);
            const cuffOffset = i === 0 ? 
                { x: x - 0.4, y: 2.2 } : 
                { x: x + 0.4, y: 2.2 };
            cuff.position.set(cuffOffset.x, cuffOffset.y, 0);
            cuff.castShadow = true;
            group.add(cuff);
            
            // Black gloves
            const gloveGeometry = getGeometry('sphere', 0.35, 8, 8);
            const gloveMaterial = getMaterial('lambert', { color: beltColor });
            const glove = new THREE.Mesh(gloveGeometry, gloveMaterial);
            const gloveOffset = i === 0 ? 
                { x: x - 0.6, y: 1.8 } : 
                { x: x + 0.6, y: 1.8 };
            glove.position.set(gloveOffset.x, gloveOffset.y, 0);
            glove.castShadow = true;
            group.add(glove);
        });
        
        // Flying Sledge
        const sledgeBaseGeometry = getGeometry('box', 3.0, 0.3, 1.5);
        const sledgeMaterial = getMaterial('lambert', { color: sledgeColor });
        const sledgeBase = new THREE.Mesh(sledgeBaseGeometry, sledgeMaterial);
        sledgeBase.position.set(0, 0.5, 0);
        sledgeBase.castShadow = true;
        sledgeBase.receiveShadow = true;
        group.add(sledgeBase);
        
        // Sledge curved front
        const sledgeFrontGeometry = getGeometry('cylinder', 0.15, 0.15, 1.5, 8);
        const sledgeFront = new THREE.Mesh(sledgeFrontGeometry, sledgeMaterial);
        sledgeFront.position.set(1.5, 0.6, 0);
        sledgeFront.rotation.x = Math.PI / 2;
        sledgeFront.rotation.z = 0.5;
        sledgeFront.castShadow = true;
        group.add(sledgeFront);
        
        // Gold rails (runners)
        const railGeometry = getGeometry('box', 3.5, 0.15, 0.2);
        const railMaterial = getMaterial('lambert', { color: sledgeRailColor });
        [-0.6, 0.6].forEach(z => {
            const rail = new THREE.Mesh(railGeometry, railMaterial);
            rail.position.set(0, 0.2, z);
            rail.castShadow = true;
            group.add(rail);
            
            // Curved front of rail
            const railFrontGeometry = getGeometry('torus', 0.3, 0.1, 8, 16, Math.PI / 2);
            const railFront = new THREE.Mesh(railFrontGeometry, railMaterial);
            railFront.position.set(1.6, 0.3, z);
            railFront.rotation.y = Math.PI / 2;
            railFront.castShadow = true;
            group.add(railFront);
        });
        
        // Gift bag on sledge (stolen presents!)
        const bagGeometry = getGeometry('sphere', 0.6, 12, 12);
        const bagMaterial = getMaterial('lambert', { color: 0x8B4513 });
        const bag = new THREE.Mesh(bagGeometry, bagMaterial);
        bag.position.set(-1.0, 0.9, 0);
        bag.scale.set(1.2, 1.4, 1.0);
        bag.castShadow = true;
        group.add(bag);
        
        // Rope tied around bag
        const ropeGeometry = getGeometry('torus', 0.5, 0.05, 8, 16);
        const ropeMaterial = getMaterial('lambert', { color: 0xFFD700 });
        const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
        rope.position.set(-1.0, 1.5, 0);
        rope.rotation.x = Math.PI / 2;
        rope.castShadow = true;
        group.add(rope);
        
        // Evil magical aura
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 2.5 + Math.random() * 0.5;
            const sparkleGeometry = getGeometry('sphere', 0.08, 6, 6);
            const sparkleMaterial = getMaterial('basic', { 
                color: Math.random() > 0.5 ? 0xFF0000 : 0x8B0000,
                transparent: true,
                opacity: 0.6
            });
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
            sparkle.position.set(
                Math.cos(angle) * radius,
                2.5 + Math.sin(angle * 3) * 0.5,
                Math.sin(angle) * radius
            );
            group.add(sparkle);
        }

        // Apply scale
        group.scale.set(scale, scale, scale);

        // Position
        const santaX = posConfig.x;
        const santaZ = posConfig.z;
        const santaY = posConfig.y !== undefined ? posConfig.y : getTerrainHeight(santaX, santaZ) + 3; // Flying height (low enough to see)
        group.position.set(santaX, santaY, santaZ);
        
        // Add to scene
        G.scene.add(group);

        // Return object with proper structure for game systems
        return {
            mesh: group,
            health: health,
            maxHealth: health,
            scale: scale,
            alive: true,
            speed: 0.04 * speedMultiplier * scale,
            patrolLeft: santaX - 30,
            patrolRight: santaX + 30,
            patrolFront: santaZ - 20,
            patrolBack: santaZ + 20,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: scale < 1 ? 2000 : 1500,
            phase: 1,
            attackCooldown: 0,
            breathColor: 0xFF0000, // Red projectiles
            frozen: false,
            frozenUntil: 0,
            isEvilSanta: true,
            homeX: santaX,
            homeZ: santaZ,
            chaseRange: 40,
            flyingHeight: santaY // Track flying height
        };
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('evil-santa', createEvilSanta);
    }

    // Also expose globally for direct use
    window.createEvilSanta = createEvilSanta;
})();
