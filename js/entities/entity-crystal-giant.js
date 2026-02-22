/**
 * Crystal Giant Entity - Crystal Cove tank enemy
 * Massive colossus made of amethyst crystals with rock-smashing fists
 */
(function() {
    'use strict';

    function createCrystalGiant(config = {}) {
        const group = new THREE.Group();
        const amethystPurple = 0x9944ff;     // Main body amethyst
        const crystalPink = 0xff4488;        // Accent crystals
        const crystalBlue = 0x44aaff;        // Eyes/glow
        const crystalGreen = 0x44ff88;       // Fist accents
        const darkCrystal = 0x3a2a5a;        // Joints/core
        const lightAmethyst = 0xcc77ff;      // Highlights

        // Massive torso - chunky crystal formation
        const torsoGeometry = getGeometry('box', 1.8, 2.0, 1.4);
        const torsoMaterial = getMaterial('lambert', { 
            color: amethystPurple,
            emissive: amethystPurple,
            emissiveIntensity: 0.15
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 3.5;
        torso.rotation.y = Math.PI / 8;
        torso.castShadow = true;
        torso.receiveShadow = true;
        group.add(torso);

        // Crystal protrusions on shoulders/back (spiky crystals)
        const spikeGeometry = getGeometry('cone', 0.25, 0.8, 5);
        const spikeMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.25
        });
        [
            [0.8, 4.5, 0.4, 0.4, 0],
            [-0.7, 4.4, 0.3, -0.5, 0],
            [0.4, 4.6, -0.5, 0.2, 0.3],
            [-0.3, 4.7, -0.6, -0.2, -0.2],
            [0.9, 4.2, -0.3, 0.6, 0.1],
            [-0.85, 4.3, -0.2, -0.6, -0.1]
        ].forEach(([x, y, z, rotZ, rotX]) => {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(x, y, z);
            spike.rotation.z = rotZ;
            spike.rotation.x = rotX;
            spike.castShadow = true;
            group.add(spike);
        });

        // Chest plate - large crystal formation
        const chestGeometry = getGeometry('octahedron', 0.6, 0);
        const chestMaterial = getMaterial('lambert', { 
            color: lightAmethyst,
            emissive: crystalBlue,
            emissiveIntensity: 0.2
        });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.set(0, 3.5, 0.75);
        chest.rotation.y = Math.PI / 4;
        chest.scale.set(1, 1.2, 0.5);
        chest.castShadow = true;
        group.add(chest);

        // Angular head (massive faceted crystal)
        const headGeometry = getGeometry('octahedron', 0.7, 0);
        const headMaterial = getMaterial('lambert', { 
            color: amethystPurple,
            emissive: amethystPurple,
            emissiveIntensity: 0.2
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 5.2;
        head.rotation.y = Math.PI / 4;
        head.scale.set(1, 1.3, 0.9);
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        // Glowing crystal eyes
        const eyeMaterial = getMaterial('basic', { 
            color: crystalBlue
        });
        const eyeGeometry = getGeometry('octahedron', 0.18, 0);
        [-0.25, 0.25].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 5.3, 0.55);
            eye.castShadow = true;
            group.add(eye);
        });

        // Crystal crown spikes on head
        const crownGeometry = getGeometry('cone', 0.15, 0.6, 4);
        const crownMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.3
        });
        [
            [0, 5.9, 0],
            [-0.35, 5.7, 0.2],
            [0.35, 5.7, -0.2],
            [0.2, 5.65, 0.35],
            [-0.2, 5.65, -0.35]
        ].forEach(([x, y, z]) => {
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.set(x, y, z);
            crown.castShadow = true;
            group.add(crown);
        });

        // Massive arms - chunky crystal formations
        const upperArmGeometry = getGeometry('box', 0.7, 1.4, 0.6);
        const armMaterial = getMaterial('lambert', { 
            color: darkCrystal,
            emissive: amethystPurple,
            emissiveIntensity: 0.1
        });
        
        // Left upper arm
        const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        leftUpperArm.position.set(-1.5, 3.8, 0);
        leftUpperArm.rotation.z = 0.3;
        leftUpperArm.castShadow = true;
        group.add(leftUpperArm);
        
        // Right upper arm
        const rightUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
        rightUpperArm.position.set(1.5, 3.8, 0);
        rightUpperArm.rotation.z = -0.3;
        rightUpperArm.castShadow = true;
        group.add(rightUpperArm);

        // Forearms
        const forearmGeometry = getGeometry('box', 0.6, 1.2, 0.5);
        const forearmMaterial = getMaterial('lambert', { 
            color: amethystPurple,
            emissive: amethystPurple,
            emissiveIntensity: 0.15
        });
        
        const leftForearm = new THREE.Mesh(forearmGeometry, forearmMaterial);
        leftForearm.position.set(-1.9, 2.6, 0);
        leftForearm.rotation.z = 0.2;
        leftForearm.castShadow = true;
        group.add(leftForearm);
        
        const rightForearm = new THREE.Mesh(forearmGeometry, forearmMaterial);
        rightForearm.position.set(1.9, 2.6, 0);
        rightForearm.rotation.z = -0.2;
        rightForearm.castShadow = true;
        group.add(rightForearm);

        // Massive crystal fists (rock-smashing fists)
        const fistGeometry = getGeometry('octahedron', 0.55, 0);
        const fistMaterial = getMaterial('lambert', { 
            color: lightAmethyst,
            emissive: crystalGreen,
            emissiveIntensity: 0.2
        });
        
        const leftFist = new THREE.Mesh(fistGeometry, fistMaterial);
        leftFist.position.set(-2.1, 1.7, 0);
        leftFist.rotation.y = Math.PI / 4;
        leftFist.scale.set(1.2, 0.9, 1);
        leftFist.castShadow = true;
        group.add(leftFist);
        
        const rightFist = new THREE.Mesh(fistGeometry, fistMaterial);
        rightFist.position.set(2.1, 1.7, 0);
        rightFist.rotation.y = -Math.PI / 4;
        rightFist.scale.set(1.2, 0.9, 1);
        rightFist.castShadow = true;
        group.add(rightFist);

        // Fist crystal spikes
        const fistSpikeGeometry = getGeometry('cone', 0.12, 0.4, 4);
        const fistSpikeMaterial = getMaterial('lambert', { 
            color: crystalGreen,
            emissive: crystalGreen,
            emissiveIntensity: 0.35
        });
        // Left fist spikes
        [[-2.3, 1.5, 0.3], [-2.5, 1.7, 0], [-2.3, 1.5, -0.3]].forEach(([x, y, z]) => {
            const spike = new THREE.Mesh(fistSpikeGeometry, fistSpikeMaterial);
            spike.position.set(x, y, z);
            spike.rotation.z = Math.PI / 2 + 0.3;
            spike.castShadow = true;
            group.add(spike);
        });
        // Right fist spikes
        [[2.3, 1.5, 0.3], [2.5, 1.7, 0], [2.3, 1.5, -0.3]].forEach(([x, y, z]) => {
            const spike = new THREE.Mesh(fistSpikeGeometry, fistSpikeMaterial);
            spike.position.set(x, y, z);
            spike.rotation.z = -Math.PI / 2 - 0.3;
            spike.castShadow = true;
            group.add(spike);
        });

        // Thick crystal legs
        const legGeometry = getGeometry('box', 0.7, 1.8, 0.6);
        const legMaterial = getMaterial('lambert', { 
            color: darkCrystal,
            emissive: amethystPurple,
            emissiveIntensity: 0.1
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.6, 1.4, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.6, 1.4, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);

        // Massive crystal feet
        const footGeometry = getGeometry('octahedron', 0.45, 0);
        const footMaterial = getMaterial('lambert', { 
            color: amethystPurple,
            emissive: amethystPurple,
            emissiveIntensity: 0.15
        });
        [-0.6, 0.6].forEach(x => {
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.position.set(x, 0.25, 0.2);
            foot.scale.set(1.3, 0.4, 1.8);
            foot.castShadow = true;
            group.add(foot);
        });

        // Inner energy glow (core)
        const glowGeometry = getGeometry('sphere', 0.8, 16, 16);
        const glowMaterial = getMaterial('basic', { 
            color: crystalBlue, 
            transparent: true, 
            opacity: 0.2 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 3.5;
        group.add(glow);

        // Floating crystal fragments around body
        const fragmentGeometry = getGeometry('octahedron', 0.15, 0);
        const fragmentMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.4
        });
        [
            [1.3, 4.8, 0.8],
            [-1.4, 4.6, -0.7],
            [0.9, 2.8, 1.0],
            [-1.0, 3.0, 0.9]
        ].forEach(([x, y, z]) => {
            const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
            fragment.position.set(x, y, z);
            fragment.rotation.set(Math.random(), Math.random(), Math.random());
            fragment.castShadow = true;
            group.add(fragment);
        });

        return group;
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('crystal-giant', createCrystalGiant);
    }

    // Expose globally for direct use
    window.createCrystalGiant = createCrystalGiant;
})();
