/**
 * Flying Witch Entity - Rapunzel Tower level flying enemy
 * A witch on a broomstick that flies around and shoots green magical fireballs
 */
(function() {
    'use strict';

    function createFlyingWitch(posConfig, scale = 1, health = 40) {
        const group = new THREE.Group();
        const cloakColor = 0x2D1B4E;        // Dark purple cloak
        const skinColor = 0x98FB98;         // Pale green witch skin
        const hatColor = 0x1A0F2E;          // Very dark purple hat
        const hairColor = 0x1C1C1C;         // Black stringy hair
        const broomColor = 0x5D4037;        // Brown wood
        const bristleColor = 0x8B7355;      // Tan bristles
        const eyeGlow = 0x00FF00;           // Green glowing eyes
        const magicGlow = 0x00FF7F;         // Green magic aura
        
        // === BROOMSTICK ===
        // Broom handle
        const handleGeometry = getGeometry('cylinder', 0.08, 0.1, 4, 8);
        const handleMaterial = getMaterial('lambert', { color: broomColor });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.z = 0;
        handle.castShadow = true;
        group.add(handle);
        
        // Broom bristles (back of broom)
        const bristleGeometry = getGeometry('cone', 0.4, 1.2, 8);
        const bristleMaterial = getMaterial('lambert', { color: bristleColor });
        const bristles = new THREE.Mesh(bristleGeometry, bristleMaterial);
        bristles.rotation.x = -Math.PI / 2;
        bristles.position.z = -2.5;
        bristles.castShadow = true;
        group.add(bristles);
        
        // Binding around bristles
        const bindingGeometry = getGeometry('torus', 0.25, 0.03, 6, 16);
        const bindingMaterial = getMaterial('lambert', { color: 0x3D2817 });
        const binding = new THREE.Mesh(bindingGeometry, bindingMaterial);
        binding.rotation.x = Math.PI / 2;
        binding.position.z = -1.9;
        group.add(binding);
        
        // === WITCH BODY ===
        // Witch cloak body (cone shape) - sitting on broom
        const cloakGeometry = getGeometry('cone', 0.5, 1.2, 8);
        const cloakMaterial = getMaterial('lambert', { color: cloakColor });
        const cloak = new THREE.Mesh(cloakGeometry, cloakMaterial);
        cloak.position.y = 0.8;
        cloak.position.z = 0.5;
        cloak.castShadow = true;
        group.add(cloak);
        
        // Legs/feet dangling
        const legMaterial = getMaterial('lambert', { color: 0x1A0F2E });
        [-0.2, 0.2].forEach(x => {
            const legGeometry = getGeometry('cylinder', 0.08, 0.06, 0.6, 6);
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, -0.1, 0.5);
            leg.rotation.x = 0.3;
            group.add(leg);
            
            // Pointed shoes
            const shoeGeometry = getGeometry('cone', 0.1, 0.25, 6);
            const shoe = new THREE.Mesh(shoeGeometry, legMaterial);
            shoe.position.set(x, -0.35, 0.65);
            shoe.rotation.x = Math.PI / 2;
            group.add(shoe);
        });
        
        // Witch head
        const headGeometry = getGeometry('sphere', 0.35, 16, 16);
        const headMaterial = getMaterial('lambert', { color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.6;
        head.position.z = 0.5;
        head.castShadow = true;
        group.add(head);
        
        // Big warty nose
        const noseGeometry = getGeometry('cone', 0.08, 0.2, 6);
        const nose = new THREE.Mesh(noseGeometry, headMaterial);
        nose.position.set(0, 1.55, 0.88);
        nose.rotation.x = Math.PI / 2;
        group.add(nose);
        
        // Wart on nose
        const wartGeometry = getGeometry('sphere', 0.03, 8, 8);
        const wartMaterial = getMaterial('lambert', { color: 0x556B2F });
        const wart = new THREE.Mesh(wartGeometry, wartMaterial);
        wart.position.set(0.04, 1.58, 0.98);
        group.add(wart);
        
        // Evil glowing green eyes
        const eyeGeometry = getGeometry('sphere', 0.08, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: eyeGlow });
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.65, 0.82);
            group.add(eye);
            
            // Glow effect
            const glowGeometry = getGeometry('sphere', 0.12, 8, 8);
            const glowMaterial = getMaterial('basic', { 
                color: eyeGlow, 
                transparent: true, 
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, 1.65, 0.82);
            group.add(glow);
        });
        
        // Evil grin
        const grinGeometry = getGeometry('torus', 0.12, 0.025, 8, 12, Math.PI);
        const grinMaterial = getMaterial('basic', { color: 0x2D0A0A });
        const grin = new THREE.Mesh(grinGeometry, grinMaterial);
        grin.position.set(0, 1.45, 0.82);
        grin.rotation.x = Math.PI;
        group.add(grin);
        
        // Stringy black hair
        const hairMaterial = getMaterial('lambert', { color: hairColor });
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI + Math.PI / 2; // Back half of head
            const hairGeometry = new THREE.CylinderGeometry(0.02, 0.015, 0.5 + Math.random() * 0.3, 4);
            const hair = new THREE.Mesh(hairGeometry, hairMaterial);
            hair.position.set(
                Math.cos(angle) * 0.3 + 0,
                1.4 - Math.random() * 0.2,
                Math.sin(angle) * 0.3 + 0.5
            );
            hair.rotation.z = (Math.random() - 0.5) * 0.5;
            hair.rotation.x = 0.3;
            group.add(hair);
        }
        
        // Pointed witch hat
        const hatBrimGeometry = getGeometry('cylinder', 0.45, 0.45, 0.06, 16);
        const hatMaterial = getMaterial('lambert', { color: hatColor });
        const hatBrim = new THREE.Mesh(hatBrimGeometry, hatMaterial);
        hatBrim.position.y = 1.9;
        hatBrim.position.z = 0.5;
        hatBrim.castShadow = true;
        group.add(hatBrim);
        
        const hatConeGeometry = getGeometry('cone', 0.28, 0.8, 12);
        const hatCone = new THREE.Mesh(hatConeGeometry, hatMaterial);
        hatCone.position.y = 2.35;
        hatCone.position.z = 0.5;
        hatCone.rotation.z = 0.15; // Slightly tilted
        hatCone.castShadow = true;
        group.add(hatCone);
        
        // Hat buckle
        const buckleGeometry = getGeometry('box', 0.12, 0.1, 0.04);
        const buckleMaterial = getMaterial('lambert', { color: 0xC0C0C0 });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 1.95, 0.92);
        group.add(buckle);
        
        // === ARMS HOLDING BROOM ===
        const armMaterial = getMaterial('lambert', { color: cloakColor });
        // Left arm
        const leftArmGeometry = getGeometry('cylinder', 0.06, 0.05, 0.5, 6);
        const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        leftArm.position.set(-0.3, 0.6, 0.3);
        leftArm.rotation.z = 0.8;
        leftArm.rotation.x = -0.3;
        group.add(leftArm);
        
        // Right arm
        const rightArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        rightArm.position.set(0.3, 0.6, 0.3);
        rightArm.rotation.z = -0.8;
        rightArm.rotation.x = -0.3;
        group.add(rightArm);
        
        // Bony hands (green)
        const handGeometry = getGeometry('sphere', 0.06, 8, 8);
        const handMaterial = getMaterial('lambert', { color: skinColor });
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.45, 0.35, 0.15);
        group.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.45, 0.35, 0.15);
        group.add(rightHand);
        
        // === MAGICAL TRAIL EFFECTS ===
        for (let i = 0; i < 10; i++) {
            const sparkleGeometry = getGeometry('sphere', 0.05, 6, 6);
            const sparkleMaterial = getMaterial('basic', { 
                color: magicGlow,
                transparent: true,
                opacity: 0.4 + Math.random() * 0.3
            });
            const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
            sparkle.position.set(
                (Math.random() - 0.5) * 0.8,
                (Math.random() - 0.5) * 0.5,
                -2.5 - Math.random() * 1.5 // Behind broom
            );
            group.add(sparkle);
        }

        // Apply scale
        group.scale.set(scale, scale, scale);

        // Position
        const witchX = posConfig.x;
        const witchZ = posConfig.z;
        const witchY = posConfig.y !== undefined ? posConfig.y : getTerrainHeight(witchX, witchZ) + 8;
        group.position.set(witchX, witchY, witchZ);
        
        // Add to scene
        G.scene.add(group);

        // Return object with proper structure for game systems
        return {
            mesh: group,
            health: health,
            maxHealth: health,
            scale: scale,
            alive: true,
            speed: 0.06 * speedMultiplier * scale,
            patrolLeft: witchX - 35,
            patrolRight: witchX + 35,
            patrolFront: witchZ - 25,
            patrolBack: witchZ + 25,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: scale < 1 ? 2500 : 1800,
            phase: 1,
            attackCooldown: 0,
            breathColor: 0x00FF00, // Green projectiles
            frozen: false,
            frozenUntil: 0,
            isFlyingWitch: true,
            homeX: witchX,
            homeZ: witchZ,
            chaseRange: 45,
            flyingHeight: witchY
        };
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('flying-witch', createFlyingWitch);
    }

    // Also expose globally for direct use
    window.createFlyingWitch = createFlyingWitch;
})();
