// entity-goblin-christmas.js - Evil Elf (Böser Elf)
// Christmas-themed variant of goblin

(function() {
    'use strict';
    
    function createGoblinChristmas(config = {}) {
        const group = new THREE.Group();
        const elfGreen = 0x228b22;          // Forest green for evil elf
        const elfRed = 0xcc0000;            // Christmas red
        const snowWhite = 0xffffff;         // Snow white
        const hatRed = 0xdc143c;            // Bright red for santa hat
        const goldBell = 0xffd700;          // Gold for bell
        
        // Body (green elf outfit)
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: elfGreen });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Red belt
        const beltGeometry = new THREE.BoxGeometry(0.65, 0.15, 0.42);
        const beltMaterial = new THREE.MeshLambertMaterial({ color: elfRed });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.7;
        belt.castShadow = true;
        group.add(belt);
        
        // Gold belt buckle
        const buckleGeometry = new THREE.BoxGeometry(0.2, 0.12, 0.05);
        const buckleMaterial = new THREE.MeshLambertMaterial({ color: goldBell });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 0.7, 0.23);
        buckle.castShadow = true;
        group.add(buckle);
        
        // Head (green elf skin)
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: elfGreen });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        group.add(head);
        
        // Evil red eyes
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.5, 0.35);
            group.add(eye);
        });
        
        // Pointed elf ears (green)
        const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: elfGreen });
        [-0.5, 0.5].forEach((x, i) => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.rotation.z = i === 0 ? Math.PI / 2 : -Math.PI / 2;
            ear.position.set(x, 1.5, 0);
            ear.castShadow = true;
            group.add(ear);
        });
        
        // Santa hat (red with white trim)
        const hatConeGeometry = new THREE.ConeGeometry(0.35, 0.6, 16);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: hatRed });
        const hatCone = new THREE.Mesh(hatConeGeometry, hatMaterial);
        hatCone.position.y = 2.1;
        hatCone.rotation.z = 0.3; // Tilt slightly
        hatCone.castShadow = true;
        group.add(hatCone);
        
        // Hat trim (white fur)
        const trimGeometry = new THREE.TorusGeometry(0.36, 0.08, 8, 16);
        const trimMaterial = new THREE.MeshLambertMaterial({ color: snowWhite });
        const trim = new THREE.Mesh(trimGeometry, trimMaterial);
        trim.position.y = 1.8;
        trim.rotation.x = Math.PI / 2;
        trim.castShadow = true;
        group.add(trim);
        
        // Hat pom-pom
        const pomGeometry = new THREE.SphereGeometry(0.12, 12, 12);
        const pom = new THREE.Mesh(pomGeometry, trimMaterial);
        pom.position.set(0.15, 2.5, 0);
        pom.castShadow = true;
        group.add(pom);
        
        // Red scarf
        const scarfGeometry = new THREE.TorusGeometry(0.3, 0.08, 8, 16);
        const scarfMaterial = new THREE.MeshLambertMaterial({ color: elfRed });
        const scarf = new THREE.Mesh(scarfGeometry, scarfMaterial);
        scarf.position.y = 1.2;
        scarf.rotation.x = Math.PI / 2;
        scarf.castShadow = true;
        group.add(scarf);
        
        // Scarf tail
        const tailGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.08);
        const tail = new THREE.Mesh(tailGeometry, scarfMaterial);
        tail.position.set(0.25, 0.9, 0.1);
        tail.rotation.z = -0.3;
        tail.castShadow = true;
        group.add(tail);
        
        return group;
    }
    
    // Register with entity registry
    ENTITY_REGISTRY.register('goblin-christmas', createGoblinChristmas);
    
})();
