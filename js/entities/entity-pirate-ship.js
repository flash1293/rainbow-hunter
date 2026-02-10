/**
 * Pirate Ship Entity - Water level enemy (hard mode only)
 * Black ship with cannons that fires cannonballs
 */
(function() {
    'use strict';

    function createPirateShip(config) {
        const shipGroup = new THREE.Group();

        // Hull - dark wood
        const hullGeometry = new THREE.BoxGeometry(8, 3, 20);
        const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3020 });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.position.y = 1.5;
        hull.castShadow = true;
        shipGroup.add(hull);

        // Deck
        const deckGeometry = new THREE.BoxGeometry(7, 0.5, 18);
        const deckMaterial = new THREE.MeshLambertMaterial({ color: 0x6a5040 });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 3;
        shipGroup.add(deck);

        // Mast
        const mastGeometry = new THREE.CylinderGeometry(0.3, 0.4, 12, 8);
        const mastMaterial = new THREE.MeshLambertMaterial({ color: 0x3a2510 });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.y = 9;
        shipGroup.add(mast);

        // Sail
        const sailGeometry = new THREE.PlaneGeometry(6, 8);
        const sailMaterial = new THREE.MeshLambertMaterial({
            color: 0x111111,
            side: THREE.DoubleSide
        });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.y = 10;
        sail.position.z = 0.5;
        shipGroup.add(sail);

        // Skull emblem on sail
        const skullGeometry = new THREE.CircleGeometry(1.5, 8);
        const skullMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const skull = new THREE.Mesh(skullGeometry, skullMaterial);
        skull.position.y = 10;
        skull.position.z = 0.6;
        shipGroup.add(skull);

        // Cannons (sides)
        for (let i = 0; i < 3; i++) {
            const cannonGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
            const cannonMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });

            const leftCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
            leftCannon.rotation.z = Math.PI / 2;
            leftCannon.position.set(-4.5, 2.5, (i - 1) * 5);
            shipGroup.add(leftCannon);

            const rightCannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
            rightCannon.rotation.z = Math.PI / 2;
            rightCannon.position.set(4.5, 2.5, (i - 1) * 5);
            shipGroup.add(rightCannon);
        }

        const terrainHeight = getTerrainHeight(config.x, config.z);
        shipGroup.position.set(config.x, terrainHeight + 0.5, config.z);
        G.scene.add(shipGroup);

        return {
            mesh: shipGroup,
            x: config.x,
            z: config.z,
            patrolZ1: config.patrolZ1,
            patrolZ2: config.patrolZ2,
            speed: config.speed,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: 3000 + Math.random() * 2000
        };
    }

    // Register with entity registry
    ENTITY_REGISTRY.register('pirateShip', {
        create: createPirateShip
    });

    // Export for global access
    window.createPirateShip = createPirateShip;
})();
