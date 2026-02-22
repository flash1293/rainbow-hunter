/**
 * Crystal Golem Entity - Crystal Cove critter enemy
 * Small golem made of living crystals with sharp crystal claws
 */
(function() {
    'use strict';

    function createCrystalGolem(config = {}) {
        const group = new THREE.Group();
        const crystalPurple = 0xaa44ff;     // Main body crystal
        const crystalPink = 0xff4488;       // Accent crystals
        const crystalBlue = 0x44aaff;       // Eyes/glow
        const crystalGreen = 0x44ff88;      // Claws
        const darkCrystal = 0x3a2a5a;       // Core/joints

        // Chunky torso made of crystal formations
        const torsoGeometry = getGeometry('box', 0.7, 0.7, 0.5);
        const torsoMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.15
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 0.8;
        torso.rotation.y = Math.PI / 6;
        torso.castShadow = true;
        torso.receiveShadow = true;
        group.add(torso);

        // Crystal protrusions on torso
        const protrusionGeometry = getGeometry('cone', 0.12, 0.35, 5);
        const protrusionMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.2
        });
        [
            [0.3, 1.1, 0.15, 0.3],
            [-0.25, 1.05, -0.1, -0.4],
            [0.15, 0.95, -0.25, 0.5]
        ].forEach(([x, y, z, rotZ]) => {
            const protrusion = new THREE.Mesh(protrusionGeometry, protrusionMaterial);
            protrusion.position.set(x, y, z);
            protrusion.rotation.z = rotZ;
            protrusion.castShadow = true;
            group.add(protrusion);
        });

        // Angular head (faceted crystal shape)
        const headGeometry = getGeometry('octahedron', 0.35, 0);
        const headMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.2
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.45;
        head.rotation.y = Math.PI / 4;
        head.castShadow = true;
        head.receiveShadow = true;
        group.add(head);

        // Glowing crystal eyes
        const eyeMaterial = getMaterial('basic', { 
            color: crystalBlue
        });
        const eyeGeometry = getGeometry('octahedron', 0.08, 0);
        [-0.12, 0.12].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.48, 0.28);
            eye.castShadow = true;
            group.add(eye);
        });

        // Crystal spike crown on head
        const spikeGeometry = getGeometry('cone', 0.06, 0.25, 4);
        const spikeMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.25
        });
        [
            [0, 1.75, 0],
            [-0.15, 1.68, 0.1],
            [0.15, 1.68, -0.1],
            [0.1, 1.65, 0.15]
        ].forEach(([x, y, z]) => {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(x, y, z);
            spike.castShadow = true;
            group.add(spike);
        });

        // Arms - chunky crystal formations
        const armGeometry = getGeometry('box', 0.25, 0.5, 0.2);
        const armMaterial = getMaterial('lambert', { 
            color: darkCrystal,
            emissive: crystalPurple,
            emissiveIntensity: 0.1
        });
        [-0.55, 0.55].forEach((x, i) => {
            const arm = new THREE.Mesh(armGeometry, armMaterial);
            arm.position.set(x, 0.7, 0);
            arm.rotation.z = i === 0 ? 0.3 : -0.3;
            arm.castShadow = true;
            group.add(arm);
        });

        // Crystal claw hands
        const clawGeometry = getGeometry('cone', 0.06, 0.3, 4);
        const clawMaterial = getMaterial('lambert', { 
            color: crystalGreen,
            emissive: crystalGreen,
            emissiveIntensity: 0.3
        });
        // Left hand claws
        [[-0.6, 0.35, 0.1], [-0.7, 0.38, 0], [-0.6, 0.35, -0.1]].forEach(([x, y, z]) => {
            const claw = new THREE.Mesh(clawGeometry, clawMaterial);
            claw.position.set(x, y, z);
            claw.rotation.z = Math.PI / 2 + 0.3;
            claw.castShadow = true;
            group.add(claw);
        });
        // Right hand claws
        [[0.6, 0.35, 0.1], [0.7, 0.38, 0], [0.6, 0.35, -0.1]].forEach(([x, y, z]) => {
            const claw = new THREE.Mesh(clawGeometry, clawMaterial);
            claw.position.set(x, y, z);
            claw.rotation.z = -Math.PI / 2 - 0.3;
            claw.castShadow = true;
            group.add(claw);
        });

        // Stumpy crystal legs
        const legGeometry = getGeometry('box', 0.25, 0.4, 0.25);
        const legMaterial = getMaterial('lambert', { 
            color: darkCrystal,
            emissive: crystalPurple,
            emissiveIntensity: 0.1
        });
        [-0.2, 0.2].forEach(x => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, 0.2, 0);
            leg.castShadow = true;
            group.add(leg);
        });

        // Crystal feet
        const footGeometry = getGeometry('octahedron', 0.15, 0);
        const footMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.15
        });
        [-0.2, 0.2].forEach(x => {
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.position.set(x, 0.05, 0.1);
            foot.scale.set(1.2, 0.5, 1.5);
            foot.castShadow = true;
            group.add(foot);
        });

        // Inner glow effect
        const glowGeometry = getGeometry('sphere', 0.5, 12, 12);
        const glowMaterial = getMaterial('basic', { 
            color: crystalBlue, 
            transparent: true, 
            opacity: 0.15 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.85;
        group.add(glow);

        return group;
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('crystal-golem', createCrystalGolem);
    }

    // Expose globally for direct use
    window.createCrystalGolem = createCrystalGolem;
})();
