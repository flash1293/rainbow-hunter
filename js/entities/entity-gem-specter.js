/**
 * Gem Specter Entity - Crystal Cove ranged enemy
 * Ghostly being trapped in a glowing crystal, shoots crystal shards
 */
(function() {
    'use strict';

    function createGemSpecter(config = {}) {
        const group = new THREE.Group();
        const crystalPurple = 0xaa44ff;     // Main crystal shell
        const crystalPink = 0xff4488;       // Crystal accents
        const crystalBlue = 0x44aaff;       // Specter glow
        const spectralWhite = 0xccddff;     // Ghost body
        const darkCore = 0x3a2a5a;          // Inner darkness

        // Large crystal shell encasing the specter
        const shellGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const shellMaterial = new THREE.MeshLambertMaterial({ 
            color: crystalPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.6
        });
        const shell = new THREE.Mesh(shellGeometry, shellMaterial);
        shell.position.y = 1.3;
        shell.rotation.y = Math.PI / 4;
        shell.castShadow = true;
        shell.receiveShadow = true;
        group.add(shell);

        // Inner crystal core
        const coreGeometry = new THREE.OctahedronGeometry(0.45, 0);
        const coreMaterial = new THREE.MeshLambertMaterial({ 
            color: darkCore,
            emissive: crystalBlue,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 1.3;
        core.rotation.y = Math.PI / 6;
        core.castShadow = true;
        core.receiveShadow = true;
        group.add(core);

        // Ghostly face/head inside crystal
        const faceGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const faceMaterial = new THREE.MeshLambertMaterial({ 
            color: spectralWhite,
            emissive: crystalBlue,
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.7
        });
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.y = 1.45;
        face.scale.set(1.0, 1.2, 0.9);
        face.castShadow = true;
        group.add(face);

        // Eerie glowing eyes
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: crystalPink
        });
        const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
        [-0.1, 0.1].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.5, 0.25);
            eye.castShadow = true;
            group.add(eye);
        });

        // Ghostly mouth (dark void)
        const mouthGeometry = new THREE.SphereGeometry(0.06, 8, 8);
        const mouthMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x220022
        });
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, 1.35, 0.28);
        mouth.scale.set(1.5, 0.8, 1);
        group.add(mouth);

        // Crystal spikes protruding from shell
        const spikeGeometry = new THREE.ConeGeometry(0.1, 0.5, 5);
        const spikeMaterial = new THREE.MeshLambertMaterial({ 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.25
        });
        [
            [0, 2.2, 0, 0, 0],           // Top
            [0.7, 1.3, 0, 0, -Math.PI/2], // Right
            [-0.7, 1.3, 0, 0, Math.PI/2], // Left
            [0, 1.3, 0.7, Math.PI/2, 0],  // Front
            [0, 1.3, -0.7, -Math.PI/2, 0], // Back
            [0, 0.4, 0, Math.PI, 0]       // Bottom
        ].forEach(([x, y, z, rotX, rotZ]) => {
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(x, y, z);
            spike.rotation.x = rotX;
            spike.rotation.z = rotZ;
            spike.castShadow = true;
            group.add(spike);
        });

        // Smaller crystal accents
        const accentGeometry = new THREE.ConeGeometry(0.06, 0.3, 4);
        const accentMaterial = new THREE.MeshLambertMaterial({ 
            color: crystalBlue,
            emissive: crystalBlue,
            emissiveIntensity: 0.35
        });
        [
            [0.45, 1.9, 0.35, -0.3, -0.4],
            [-0.4, 1.85, -0.4, 0.2, 0.5],
            [0.35, 0.8, -0.35, 0.4, -0.3],
            [-0.4, 0.75, 0.4, -0.3, 0.4]
        ].forEach(([x, y, z, rotX, rotZ]) => {
            const accent = new THREE.Mesh(accentGeometry, accentMaterial);
            accent.position.set(x, y, z);
            accent.rotation.x = rotX;
            accent.rotation.z = rotZ;
            accent.castShadow = true;
            group.add(accent);
        });

        // Floating crystal shard projectiles around specter
        const shardGeometry = new THREE.OctahedronGeometry(0.12, 0);
        const shardMaterial = new THREE.MeshLambertMaterial({ 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.4
        });
        [
            [0.9, 1.6, 0.3],
            [-0.85, 1.5, -0.25],
            [0.3, 1.8, 0.85],
            [-0.25, 1.0, -0.9]
        ].forEach(([x, y, z]) => {
            const shard = new THREE.Mesh(shardGeometry, shardMaterial);
            shard.position.set(x, y, z);
            shard.rotation.set(Math.random(), Math.random(), Math.random());
            shard.castShadow = true;
            group.add(shard);
        });

        // Ethereal wispy trails below
        const wispGeometry = new THREE.ConeGeometry(0.25, 0.6, 8);
        const wispMaterial = new THREE.MeshLambertMaterial({ 
            color: spectralWhite,
            emissive: crystalBlue,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.4
        });
        [
            [0, 0.3, 0, Math.PI, 0],
            [0.2, 0.4, 0.15, Math.PI + 0.2, 0.15],
            [-0.2, 0.35, -0.1, Math.PI - 0.15, -0.1]
        ].forEach(([x, y, z, rotX, rotZ]) => {
            const wisp = new THREE.Mesh(wispGeometry, wispMaterial);
            wisp.position.set(x, y, z);
            wisp.rotation.x = rotX;
            wisp.rotation.z = rotZ;
            wisp.castShadow = true;
            group.add(wisp);
        });

        // Inner glow aura
        const glowGeometry = new THREE.SphereGeometry(0.6, 12, 12);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: crystalBlue, 
            transparent: true, 
            opacity: 0.15 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 1.3;
        group.add(glow);

        return group;
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('gem-specter', createGemSpecter);
    }

    // Expose globally for direct use
    window.createGemSpecter = createGemSpecter;
})();
