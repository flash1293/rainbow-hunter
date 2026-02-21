// entity-goblin-crystal.js - Cave Crawler (Höhlenkrabbler)
// Crystal-themed variant of goblin - bioluminescent cave dweller

(function() {
    'use strict';
    
    function createGoblinCrystal(config = {}) {
        const group = new THREE.Group();
        const biolumGreen = 0x44ffaa;        // Primary bioluminescent skin color
        const crystalPurple = 0xaa44ff;     // Crystal accents
        const crystalBlue = 0x44aaff;       // Secondary glow color
        const darkCave = 0x2a2a4a;          // Dark cave clothing
        const glowWhite = 0xccffee;         // Bright glow spots
        
        // Body (dark cave dweller outfit with crystal accents)
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: darkCave });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Crystal shard belt
        const beltGeometry = new THREE.BoxGeometry(0.65, 0.12, 0.42);
        const beltMaterial = new THREE.MeshLambertMaterial({ color: crystalPurple });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 0.7;
        belt.castShadow = true;
        group.add(belt);
        
        // Small crystal on belt
        const beltCrystalGeometry = new THREE.OctahedronGeometry(0.1, 0);
        const beltCrystalMaterial = new THREE.MeshLambertMaterial({ color: crystalBlue, emissive: crystalBlue, emissiveIntensity: 0.3 });
        const beltCrystal = new THREE.Mesh(beltCrystalGeometry, beltCrystalMaterial);
        beltCrystal.position.set(0, 0.7, 0.23);
        beltCrystal.rotation.y = Math.PI / 4;
        beltCrystal.castShadow = true;
        group.add(beltCrystal);
        
        // Head (bioluminescent green skin)
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: biolumGreen, emissive: biolumGreen, emissiveIntensity: 0.15 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        group.add(head);
        
        // Glowing eyes (bright cyan for cave adaptation)
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: glowWhite });
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.5, 0.35);
            group.add(eye);
        });
        
        // Bioluminescent spots on face
        const spotMaterial = new THREE.MeshBasicMaterial({ color: glowWhite });
        const spotGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        [[-0.25, 1.6, 0.25], [0.25, 1.6, 0.25], [-0.1, 1.35, 0.38], [0.1, 1.35, 0.38]].forEach(pos => {
            const spot = new THREE.Mesh(spotGeometry, spotMaterial);
            spot.position.set(pos[0], pos[1], pos[2]);
            group.add(spot);
        });
        
        // Pointed cave goblin ears (bioluminescent)
        const earGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const earMaterial = new THREE.MeshLambertMaterial({ color: biolumGreen, emissive: biolumGreen, emissiveIntensity: 0.15 });
        [-0.5, 0.5].forEach((x, i) => {
            const ear = new THREE.Mesh(earGeometry, earMaterial);
            ear.rotation.z = i === 0 ? Math.PI / 2 : -Math.PI / 2;
            ear.position.set(x, 1.5, 0);
            ear.castShadow = true;
            group.add(ear);
        });
        
        // Crystal growth on head (like a natural formation)
        const headCrystalGeometry = new THREE.ConeGeometry(0.08, 0.35, 5);
        const headCrystalMaterial = new THREE.MeshLambertMaterial({ color: crystalPurple, emissive: crystalPurple, emissiveIntensity: 0.4 });
        const headCrystal1 = new THREE.Mesh(headCrystalGeometry, headCrystalMaterial);
        headCrystal1.position.set(-0.15, 1.95, 0);
        headCrystal1.rotation.z = 0.3;
        headCrystal1.castShadow = true;
        group.add(headCrystal1);
        
        const headCrystal2 = new THREE.Mesh(headCrystalGeometry, headCrystalMaterial);
        headCrystal2.position.set(0.1, 2.0, 0.05);
        headCrystal2.rotation.z = -0.2;
        headCrystal2.scale.set(0.8, 1.2, 0.8);
        headCrystal2.castShadow = true;
        group.add(headCrystal2);
        
        const headCrystal3Geometry = new THREE.ConeGeometry(0.06, 0.25, 5);
        const headCrystal3Material = new THREE.MeshLambertMaterial({ color: crystalBlue, emissive: crystalBlue, emissiveIntensity: 0.4 });
        const headCrystal3 = new THREE.Mesh(headCrystal3Geometry, headCrystal3Material);
        headCrystal3.position.set(0.2, 1.9, -0.1);
        headCrystal3.rotation.z = -0.4;
        headCrystal3.castShadow = true;
        group.add(headCrystal3);
        
        // Crystal shoulder pads
        const shoulderCrystalGeometry = new THREE.OctahedronGeometry(0.12, 0);
        const shoulderCrystalMaterial = new THREE.MeshLambertMaterial({ color: crystalBlue, emissive: crystalBlue, emissiveIntensity: 0.3 });
        [-0.35, 0.35].forEach(x => {
            const shoulderCrystal = new THREE.Mesh(shoulderCrystalGeometry, shoulderCrystalMaterial);
            shoulderCrystal.position.set(x, 1.15, 0);
            shoulderCrystal.rotation.y = Math.PI / 4;
            shoulderCrystal.castShadow = true;
            group.add(shoulderCrystal);
        });
        
        // Bioluminescent arm markings
        const armGlowGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.08);
        const armGlowMaterial = new THREE.MeshBasicMaterial({ color: biolumGreen });
        [-0.38, 0.38].forEach(x => {
            const armGlow = new THREE.Mesh(armGlowGeometry, armGlowMaterial);
            armGlow.position.set(x, 0.6, 0.1);
            group.add(armGlow);
        });
        
        return group;
    }
    
    // Register with entity registry
    ENTITY_REGISTRY.register('goblin-crystal', createGoblinCrystal);
    
})();
