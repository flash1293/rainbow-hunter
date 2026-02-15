/**
 * Evil Elf Entity - Christmas Village critter enemy
 * A malicious elf in red-green clothing with pointed ears, corrupted by Evil Santa
 */
(function() {
    'use strict';

    function createEvilElf(config = {}) {
        const group = new THREE.Group();
        const elfGreen = 0x228b22;      // Forest green
        const elfRed = 0xdc143c;        // Crimson red
        const skinColor = 0xffdab9;     // Peach
        const hatRed = 0xb22222;        // Firebrick
        const eyeColor = 0xff0000;      // Red glowing eyes

        // Body with green tunic
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: elfGreen });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Red belt
        const beltGeometry = new THREE.BoxGeometry(0.62, 0.15, 0.42);
        const beltMaterial = new THREE.MeshLambertMaterial({ color: elfRed });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.7;
        belt.castShadow = true;
        group.add(belt);

        // Belt buckle
        const buckleGeometry = new THREE.BoxGeometry(0.15, 0.12, 0.05);
        const buckleMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 0.7, 0.25);
        buckle.castShadow = true;
        group.add(buckle);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.45;
        head.castShadow = true;
        group.add(head);

        // Pointed ears
        const earGeometry = new THREE.ConeGeometry(0.12, 0.35, 8);
        const earMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
        [-0.45, 0.45].forEach((x, i) => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.rotation.z = i === 0 ? Math.PI / 2 : -Math.PI / 2;
            ear.position.set(x, 1.5, 0);
            ear.castShadow = true;
            group.add(ear);
        });

        // Evil red glowing eyes
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: eyeColor });
        const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.45, 0.32);
            group.add(eye);
        });

        // Pointy red hat
        const hatGeometry = new THREE.ConeGeometry(0.35, 0.6, 16);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: hatRed });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 2.0;
        hat.castShadow = true;
        group.add(hat);

        // White pom-pom on hat
        const pomGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const pomMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const pom = new THREE.Mesh(pomGeometry, pomMaterial);
        pom.position.y = 2.3;
        pom.castShadow = true;
        group.add(pom);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8);
        const armMaterial = new THREE.MeshLambertMaterial({ color: elfGreen });
        [-0.45, 0.45].forEach(x => {
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.set(x, 0.8, 0);
            arm.rotation.z = x < 0 ? 0.3 : -0.3;
            arm.castShadow = true;
            group.add(arm);
        });

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: elfRed });
        [-0.2, 0.2].forEach(x => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, 0.25, 0);
            leg.castShadow = true;
            leg.receiveShadow = true;
            group.add(leg);
        });

        // Curled toe shoes
        const shoeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const shoeMaterial = new THREE.MeshLambertMaterial({ color: elfGreen });
        [-0.2, 0.2].forEach(x => {
            const shoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
            shoe.position.set(x, 0.05, 0.15);
            shoe.scale.set(1, 0.6, 1.5);
            shoe.castShadow = true;
            group.add(shoe);
        });

        return group;
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('evil-elf', createEvilElf);
    }

    // Also expose globally for direct use
    window.createEvilElf = createEvilElf;
})();
