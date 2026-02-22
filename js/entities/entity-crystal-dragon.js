/**
 * Crystal Dragon Entity - Crystal Cove boss
 * Majestic guardian made of thousands of sparkling gemstones, breathes crystal energy
 */
(function() {
    'use strict';

    function createCrystalDragon(config = {}) {
        const group = new THREE.Group();
        const innerGroup = new THREE.Group();
        const crystalPurple = 0xaa44ff;      // Main body
        const crystalPink = 0xff4488;        // Accent crystals
        const crystalBlue = 0x44aaff;        // Eyes/glow
        const crystalGreen = 0x44ff88;       // Breath glow
        const deepPurple = 0x5a3a7a;         // Dark accents
        const lightAmethyst = 0xcc77ff;      // Highlights
        const crystalWhite = 0xeeddff;       // Belly/teeth
        
        // Long segmented body - crystalline form
        const bodyGeometry = getGeometry('cylinder', 2.2, 2.8, 12, 8);
        const bodyMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.15
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.x = 5;
        body.castShadow = true;
        body.receiveShadow = true;
        innerGroup.add(body);
        
        // Crystal scales/spines along body
        const scaleGeometry = getGeometry('octahedron', 0.8, 0);
        const scaleMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.25
        });
        for (let i = 0; i < 10; i++) {
            const scale = new THREE.Mesh(scaleGeometry, scaleMaterial);
            scale.position.set(i * 1.0, 3.2, 0);
            scale.rotation.y = Math.PI / 4;
            scale.scale.set(0.8, 1.2, 0.6);
            scale.castShadow = true;
            innerGroup.add(scale);
        }
        
        // Neck - angular crystal formation
        const neckGeometry = getGeometry('cylinder', 1.8, 2.2, 5, 6);
        const neckMaterial = getMaterial('lambert', { 
            color: deepPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.1
        });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.rotation.z = Math.PI / 2 + 0.3;
        neck.position.x = 12;
        neck.position.y = 2;
        neck.castShadow = true;
        innerGroup.add(neck);
        
        // Head - large faceted crystal
        const headGeometry = getGeometry('octahedron', 3, 0);
        const headMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.2
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.x = 15;
        head.position.y = 3;
        head.rotation.z = -0.3;
        head.rotation.y = Math.PI / 4;
        head.scale.set(1.2, 1, 1.5);
        head.castShadow = true;
        head.receiveShadow = true;
        innerGroup.add(head);
        
        // Jaw - angular crystal
        const jawGeometry = getGeometry('octahedron', 1.5, 0);
        const jaw = new THREE.Mesh(jawGeometry, headMaterial);
        jaw.position.set(17, 1.5, 0);
        jaw.rotation.y = Math.PI / 4;
        jaw.scale.set(1.5, 0.5, 1);
        jaw.castShadow = true;
        innerGroup.add(jaw);
        
        // Crystal fangs/teeth
        const toothGeometry = getGeometry('cone', 0.2, 0.8, 4);
        const toothMaterial = getMaterial('lambert', { 
            color: crystalWhite,
            emissive: crystalBlue,
            emissiveIntensity: 0.3
        });
        for (let i = 0; i < 8; i++) {
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            tooth.position.set(16.5 + (i % 2) * 0.6, 2, -1.2 + i * 0.35);
            tooth.rotation.z = Math.PI;
            tooth.castShadow = true;
            innerGroup.add(tooth);
        }
        
        // Glowing crystal eyes
        const eyeGeometry = getGeometry('octahedron', 0.8, 0);
        const eyeMaterial = getMaterial('basic', { color: crystalBlue });
        [-1.5, 1.5].forEach(z => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(15.5, 4, z);
            eye.rotation.y = Math.PI / 4;
            eye.castShadow = true;
            innerGroup.add(eye);
            
            // Eye glow
            const glowGeometry = getGeometry('sphere', 1, 12, 12);
            const glowMaterial = getMaterial('basic', { 
                color: crystalBlue, 
                transparent: true, 
                opacity: 0.3 
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(15.5, 4, z);
            innerGroup.add(glow);
        });
        
        // Crystal horns
        const hornGeometry = getGeometry('cone', 0.6, 3, 5);
        const hornMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.3
        });
        [-2, 2].forEach((z, i) => {
            const horn = new THREE.Mesh(hornGeometry, hornMaterial);
            horn.position.set(13, 5.5, z);
            horn.rotation.z = -0.5;
            horn.rotation.x = i === 0 ? 0.3 : -0.3;
            horn.castShadow = true;
            innerGroup.add(horn);
        });
        
        // Extra crystal crown spikes
        const crownGeometry = getGeometry('cone', 0.4, 2, 4);
        [
            [14, 5.8, 0],
            [12.5, 5.3, 1],
            [12.5, 5.3, -1]
        ].forEach(([x, y, z]) => {
            const crown = new THREE.Mesh(crownGeometry, hornMaterial);
            crown.position.set(x, y, z);
            crown.castShadow = true;
            innerGroup.add(crown);
        });
        
        // Crystal wings - faceted gem surfaces
        const wingGeometry = new THREE.BufferGeometry();
        const wingVertices = new Float32Array([
            0, 0, 0,      // 0: base
            7, 3, 0,      // 1: top outer
            10, 1, 0,     // 2: far tip
            8, -1, 0,     // 3: mid outer
            5, -2, 0,     // 4: bottom outer
            3, -1, 0      // 5: bottom inner
        ]);
        wingGeometry.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
        wingGeometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5]);
        wingGeometry.computeVertexNormals();
        const wingMaterial = getMaterial('lambert', { 
            color: lightAmethyst, 
            side: THREE.DoubleSide,
            emissive: crystalPurple,
            emissiveIntensity: 0.15,
            transparent: true,
            opacity: 0.8
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(3, 3.5, 0);
        leftWing.rotation.y = Math.PI / 2;
        leftWing.castShadow = true;
        innerGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(3, 3.5, 0);
        rightWing.rotation.y = -Math.PI / 2;
        rightWing.castShadow = true;
        innerGroup.add(rightWing);
        
        // Wing crystal spikes
        const wingSpikeGeometry = getGeometry('cone', 0.3, 1.5, 4);
        const wingSpikePositions = [
            [3, 5, 4], [3, 4.5, 7], [3, 3.5, 9],
            [3, 5, -4], [3, 4.5, -7], [3, 3.5, -9]
        ];
        wingSpikePositions.forEach(([x, y, z]) => {
            const spike = new THREE.Mesh(wingSpikeGeometry, scaleMaterial);
            spike.position.set(x, y, z);
            spike.rotation.x = z > 0 ? -Math.PI / 2 : Math.PI / 2;
            spike.castShadow = true;
            innerGroup.add(spike);
        });
        
        // Tail segments - crystal formations
        for (let i = 0; i < 4; i++) {
            const segGeometry = new THREE.OctahedronGeometry(1.8 - i * 0.3, 0);
            const segMaterial = getMaterial('lambert', { 
                color: i % 2 === 0 ? crystalPurple : deepPurple,
                emissive: crystalPurple,
                emissiveIntensity: 0.12
            });
            const segment = new THREE.Mesh(segGeometry, segMaterial);
            segment.position.x = -3 - i * 2.5;
            segment.position.y = 0.5 - i * 0.4;
            segment.rotation.y = Math.PI / 4;
            segment.scale.set(1.5, 1, 1);
            segment.castShadow = true;
            innerGroup.add(segment);
        }
        
        // Tail crystal spikes
        for (let i = 0; i < 12; i++) {
            const spikeGeometry = getGeometry('cone', 0.35, 1.2, 4);
            const spike = new THREE.Mesh(spikeGeometry, scaleMaterial);
            spike.position.set(-i * 0.9, 3, 0);
            spike.rotation.z = Math.PI;
            spike.castShadow = true;
            innerGroup.add(spike);
        }
        
        // Tail tip - large crystal
        const tailTipGeometry = getGeometry('octahedron', 1.2, 0);
        const tailTipMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.35
        });
        const tailTip = new THREE.Mesh(tailTipGeometry, tailTipMaterial);
        tailTip.position.set(-13, -1, 0);
        tailTip.rotation.y = Math.PI / 4;
        tailTip.scale.set(2, 1.2, 1);
        tailTip.castShadow = true;
        innerGroup.add(tailTip);
        
        // Crystalline belly
        const bellyGeometry = getGeometry('cylinder', 2, 2.4, 10, 6);
        const bellyMaterial = getMaterial('lambert', { 
            color: lightAmethyst,
            emissive: crystalBlue,
            emissiveIntensity: 0.1
        });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.rotation.z = Math.PI / 2;
        belly.position.set(5, -1.2, 0);
        belly.castShadow = true;
        belly.receiveShadow = true;
        innerGroup.add(belly);
        
        // Legs - angular crystal formations
        const legGeometry = getGeometry('box', 1, 2.5, 1);
        const legMaterial = getMaterial('lambert', { 
            color: deepPurple,
            emissive: crystalPurple,
            emissiveIntensity: 0.1
        });
        [
            [2, -1.5, 2.5], [2, -1.5, -2.5],
            [8, -1.5, 2.5], [8, -1.5, -2.5]
        ].forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, y, z);
            leg.castShadow = true;
            innerGroup.add(leg);
            
            // Crystal claws
            const clawGeometry = getGeometry('cone', 0.25, 0.8, 4);
            for (let c = 0; c < 3; c++) {
                const claw = new THREE.Mesh(clawGeometry, toothMaterial);
                claw.position.set(x + (c - 1) * 0.3, -3, z);
                claw.rotation.z = Math.PI;
                claw.castShadow = true;
                innerGroup.add(claw);
            }
        });
        
        // Inner energy core glow
        const coreGeometry = getGeometry('sphere', 2, 16, 16);
        const coreMaterial = getMaterial('basic', { 
            color: crystalGreen, 
            transparent: true, 
            opacity: 0.15 
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.set(5, 0, 0);
        innerGroup.add(core);
        
        // Floating crystal fragments around dragon
        const fragmentGeometry = getGeometry('octahedron', 0.4, 0);
        const fragmentMaterial = getMaterial('lambert', { 
            color: crystalPink,
            emissive: crystalPink,
            emissiveIntensity: 0.4
        });
        [
            [6, 5, 3], [4, 5, -3], [8, 5, 4],
            [10, 5, -2], [2, 4.5, 2], [0, 4, -2]
        ].forEach(([x, y, z]) => {
            const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
            fragment.position.set(x, y, z);
            fragment.rotation.set(Math.random(), Math.random(), Math.random());
            fragment.castShadow = true;
            innerGroup.add(fragment);
        });
        
        // Crystal breath energy glow (at mouth)
        const breathGeometry = getGeometry('sphere', 0.8, 12, 12);
        const breathMaterial = getMaterial('basic', { 
            color: crystalGreen, 
            transparent: true, 
            opacity: 0.5 
        });
        const breath = new THREE.Mesh(breathGeometry, breathMaterial);
        breath.position.set(18, 1.5, 0);
        innerGroup.add(breath);
        
        group.add(innerGroup);
        
        return group;
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('crystal-dragon', createCrystalDragon);
    }

    // Expose globally for direct use
    window.createCrystalDragon = createCrystalDragon;
})();
