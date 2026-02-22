/**
 * Flying Witch House Entity - Rapunzel Tower level high-flying spawner
 * A magical cottage floating on clouds that spawns flying witches
 * Flies too high to be targetable - spawns witches that descend to attack players
 */
(function() {
    'use strict';

    function createFlyingWitchHouse(posConfig, scale = 1, health = 9999) {
        const group = new THREE.Group();
        
        // Colors
        const woodColor = 0x5D4E37;           // Dark aged wood
        const roofColor = 0x3D2817;           // Dark brown thatch
        const windowGlow = 0x88FF88;          // Green magical glow
        const cloudColor = 0xE8E8FF;          // Magical clouds
        const magicColor = 0x9900FF;          // Purple magic
        const chimneyColor = 0x6B4423;        // Brown stone
        
        // === MAGICAL CLOUD BASE ===
        // Multiple cloud puffs supporting the house
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: cloudColor,
            transparent: true,
            opacity: 0.85
        });
        
        // Main cloud cluster
        const cloudPositions = [
            { x: 0, y: -2, z: 0, r: 2.5 },
            { x: 2, y: -2.2, z: 1, r: 2.0 },
            { x: -2.2, y: -2.1, z: 0.5, r: 2.2 },
            { x: 1, y: -2.3, z: -1.5, r: 1.8 },
            { x: -1.5, y: -2.2, z: -1.2, r: 2.0 },
            { x: 2.5, y: -2.4, z: -0.5, r: 1.5 },
            { x: -2.8, y: -2.3, z: -0.3, r: 1.6 },
            { x: 0, y: -2.5, z: 2, r: 1.7 },
            { x: 0, y: -2.4, z: -2, r: 1.9 }
        ];
        
        cloudPositions.forEach(pos => {
            const cloudGeometry = new THREE.SphereGeometry(pos.r, 12, 10);
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(pos.x, pos.y, pos.z);
            cloud.castShadow = true;
            group.add(cloud);
        });
        
        // === COTTAGE BODY ===
        // Main house structure
        const houseWidth = 4;
        const houseHeight = 3;
        const houseDepth = 3.5;
        
        const houseGeometry = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth);
        const houseMaterial = new THREE.MeshLambertMaterial({ color: woodColor });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        house.position.y = houseHeight / 2;
        house.castShadow = true;
        group.add(house);
        
        // Wooden planks texture (horizontal lines)
        for (let i = 0; i < 5; i++) {
            const plankGeometry = new THREE.BoxGeometry(houseWidth + 0.05, 0.08, houseDepth + 0.05);
            const plankMaterial = new THREE.MeshLambertMaterial({ color: 0x4A3728 });
            const plank = new THREE.Mesh(plankGeometry, plankMaterial);
            plank.position.y = 0.5 + i * 0.6;
            group.add(plank);
        }
        
        // === POINTED WITCH ROOF ===
        // Classic crooked witch cottage roof
        const roofGeometry = new THREE.ConeGeometry(3.5, 3, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: roofColor });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = houseHeight + 1.5;
        roof.rotation.y = Math.PI / 4; // Rotate to align with house
        roof.castShadow = true;
        group.add(roof);
        
        // Roof overhang details
        const overhangGeometry = new THREE.BoxGeometry(houseWidth + 1, 0.15, houseDepth + 1);
        const overhangMaterial = new THREE.MeshLambertMaterial({ color: roofColor });
        const overhang = new THREE.Mesh(overhangGeometry, overhangMaterial);
        overhang.position.y = houseHeight + 0.1;
        group.add(overhang);
        
        // === CROOKED CHIMNEY ===
        const chimneyGeometry = new THREE.BoxGeometry(0.6, 1.5, 0.6);
        const chimneyMaterial = new THREE.MeshLambertMaterial({ color: chimneyColor });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(1.2, houseHeight + 0.8, 0.8);
        chimney.rotation.z = 0.15; // Crooked
        chimney.castShadow = true;
        group.add(chimney);
        
        // Chimney smoke (magical purple)
        for (let i = 0; i < 5; i++) {
            const smokeGeometry = new THREE.SphereGeometry(0.2 + i * 0.08, 8, 8);
            const smokeMaterial = new THREE.MeshBasicMaterial({ 
                color: magicColor,
                transparent: true,
                opacity: 0.6 - i * 0.1
            });
            const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
            smoke.position.set(1.2 + i * 0.1, houseHeight + 1.8 + i * 0.4, 0.8);
            group.add(smoke);
        }
        
        // === GLOWING WINDOWS ===
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: windowGlow,
            transparent: true,
            opacity: 0.9
        });
        
        // Front windows (2)
        [-0.8, 0.8].forEach(x => {
            // Window frame
            const frameGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
            const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x2D1B1B });
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.set(x, 1.8, houseDepth / 2 + 0.05);
            group.add(frame);
            
            // Window glow
            const windowGeometry = new THREE.PlaneGeometry(0.6, 0.6);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(x, 1.8, houseDepth / 2 + 0.08);
            group.add(window);
        });
        
        // Side windows
        [-1, 1].forEach(side => {
            const windowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(side * (houseWidth / 2 + 0.05), 1.8, 0);
            window.rotation.y = side * Math.PI / 2;
            group.add(window);
        });
        
        // === DOOR ===
        const doorGeometry = new THREE.BoxGeometry(0.8, 1.4, 0.15);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x2D1B1B });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0.7, houseDepth / 2 + 0.08);
        group.add(door);
        
        // Door handle
        const handleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xB8860B });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0.25, 0.7, houseDepth / 2 + 0.18);
        group.add(handle);
        
        // === WITCHY DECORATIONS ===
        // Hanging herbs/brooms under roof
        for (let i = 0; i < 3; i++) {
            const herbGeometry = new THREE.CylinderGeometry(0.05, 0.15, 0.6, 6);
            const herbMaterial = new THREE.MeshLambertMaterial({ color: 0x4A5D23 });
            const herb = new THREE.Mesh(herbGeometry, herbMaterial);
            herb.position.set(-1 + i, houseHeight - 0.3, houseDepth / 2 + 0.3);
            herb.rotation.x = 0.2;
            group.add(herb);
        }
        
        // Cauldron on porch
        const cauldronGeometry = new THREE.SphereGeometry(0.4, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
        const cauldronMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        const cauldron = new THREE.Mesh(cauldronGeometry, cauldronMaterial);
        cauldron.position.set(-1.5, -0.1, houseDepth / 2 + 0.8);
        cauldron.rotation.x = Math.PI;
        group.add(cauldron);
        
        // Bubbling green potion
        const potionGeometry = new THREE.CircleGeometry(0.35, 12);
        const potionMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF44,
            transparent: true,
            opacity: 0.8
        });
        const potion = new THREE.Mesh(potionGeometry, potionMaterial);
        potion.position.set(-1.5, 0.25, houseDepth / 2 + 0.8);
        potion.rotation.x = -Math.PI / 2;
        group.add(potion);
        
        // === MAGICAL AURA ===
        // Swirling magical particles around the house
        for (let i = 0; i < 15; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.08, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: i % 2 === 0 ? magicColor : windowGlow,
                transparent: true,
                opacity: 0.5 + Math.random() * 0.3
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = (i / 15) * Math.PI * 2;
            particle.position.set(
                Math.cos(angle) * (3.5 + Math.random()),
                Math.random() * 4 - 1,
                Math.sin(angle) * (3.5 + Math.random())
            );
            particle.userData.orbitAngle = angle;
            particle.userData.orbitRadius = 3.5 + Math.random();
            particle.userData.orbitSpeed = 0.01 + Math.random() * 0.01;
            particle.userData.orbitY = particle.position.y;
            group.add(particle);
        }

        // Apply scale
        group.scale.set(scale, scale, scale);

        // Position - high but visible
        const houseX = posConfig.x;
        const houseZ = posConfig.z;
        const houseY = posConfig.y !== undefined ? posConfig.y : 15; // High but visible to player
        group.position.set(houseX, houseY, houseZ);
        
        // Add to scene
        G.scene.add(group);

        // Return object with proper structure for game systems
        return {
            mesh: group,
            health: health,
            maxHealth: health,
            scale: scale,
            alive: true,
            speed: 0.03 * speedMultiplier * scale,
            patrolLeft: houseX - 50,
            patrolRight: houseX + 50,
            patrolFront: houseZ - 35,
            patrolBack: houseZ + 35,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: 8000, // Spawns a witch every 8 seconds
            phase: 1,
            attackCooldown: 0,
            frozen: false,
            frozenUntil: 0,
            isFlyingWitchHouse: true,
            invincible: true, // Cannot be damaged - too high
            homeX: houseX,
            homeZ: houseZ,
            chaseRange: 60, // Patrol area
            flyingHeight: houseY,
            spawnRange: 80 // Only spawn witches when player is within this range
        };
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('flying-witch-house', createFlyingWitchHouse);
    }

    // Also expose globally for direct use
    window.createFlyingWitchHouse = createFlyingWitchHouse;
})();
