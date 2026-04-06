// entity-giant-eye.js - Giant floating eye in the sky for horror level
// A terrifying colossal eye that floats gently and constantly watches the player

(function() {
    'use strict';

    function createGiantEye(position, config = {}) {
        const eyeGroup = new THREE.Group();

        // Configuration
        const eyeRadius = config.radius || 8;
        const eyeColor = config.eyeColor || 0xff0000;  // Red menacing eye
        const irisColor = config.irisColor || 0xffff00; // Yellow iris
        const pupilColor = config.pupilColor || 0x000000; // Black pupil
        const floatHeight = position.y !== undefined ? position.y : 60;
        const floatSpeed = config.floatSpeed || 0.0003;
        const floatRange = config.floatRange || 30;
        const baseX = position.x;
        const baseZ = position.z;

        // ===== EYEBALL (white of the eye) =====
        const eyeballGeometry = new THREE.SphereGeometry(eyeRadius, 32, 32);
        const eyeballMaterial = getMaterial('lambert', {
            color: 0xffffff,
            emissive: 0x330000,
            emissiveIntensity: 0.1
        });
        const eyeball = new THREE.Mesh(eyeballGeometry, eyeballMaterial);
        eyeball.scale.set(1, 0.7, 1); // Flatten slightly for more natural eye shape
        eyeball.castShadow = true;
        eyeGroup.add(eyeball);

        // ===== BLOOD VESSELS (creepy veins on eyeball) =====
        const veinMaterial = getMaterial('basic', {
            color: 0x8b0000,
            transparent: true,
            opacity: 0.6
        });

        // Create several twisted veins on the eyeball
        for (let i = 0; i < 12; i++) {
            const veinPath = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(
                    (Math.random() - 0.5) * eyeRadius * 1.8,
                    (Math.random() - 0.5) * eyeRadius * 0.5,
                    (Math.random() - 0.5) * eyeRadius * 1.8
                ),
                new THREE.Vector3(
                    (Math.random() - 0.5) * eyeRadius * 2.2,
                    (Math.random() - 0.5) * eyeRadius * 0.6,
                    (Math.random() - 0.5) * eyeRadius * 2.2
                )
            ]);

            const veinGeometry = new THREE.TubeGeometry(veinPath, 20, 0.08 + Math.random() * 0.06, 8, false);
            const vein = new THREE.Mesh(veinGeometry, veinMaterial);
            vein.position.copy(eyeball.position);
            eyeGroup.add(vein);
        }

        // ===== IRIS (colored part) =====
        const irisRadius = eyeRadius * 0.35;
        const irisGeometry = new THREE.SphereGeometry(irisRadius, 24, 24);
        const irisMaterial = getMaterial('basic', {
            color: irisColor,
            emissive: irisColor,
            emissiveIntensity: 0.3
        });
        const iris = new THREE.Mesh(irisGeometry, irisMaterial);
        iris.position.set(0, 0, eyeRadius * 0.85); // Position at front of eyeball
        iris.scale.set(1, 1, 0.3); // Flatten against eyeball
        eyeGroup.add(iris);
        eyeGroup.iris = iris; // Store reference for pupil

        // ===== PUPIL (black center) =====
        const pupilRadius = irisRadius * 0.4;
        const pupilGeometry = new THREE.SphereGeometry(pupilRadius, 16, 16);
        const pupilMaterial = getMaterial('basic', {
            color: pupilColor,
            emissive: 0x440000,
            emissiveIntensity: 0.5
        });
        const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        pupil.position.set(0, 0, iris.position.z + irisRadius * 0.3);
        eyeGroup.add(pupil);
        eyeGroup.pupil = pupil;

        // ===== EVIL EYEBROW (menacing brow) =====
        const browMaterial = getMaterial('lambert', { color: 0x1a0000 });
        const browGeometry = getGeometry('box', eyeRadius * 1.4, eyeRadius * 0.2, eyeRadius * 0.3);
        const leftBrow = new THREE.Mesh(browGeometry, browMaterial);
        leftBrow.position.set(-eyeRadius * 0.4, eyeRadius * 0.5, eyeRadius * 0.7);
        leftBrow.rotation.z = -0.3;
        leftBrow.rotation.x = 0.2;
        eyeGroup.add(leftBrow);

        const rightBrow = new THREE.Mesh(browGeometry, browMaterial);
        rightBrow.position.set(eyeRadius * 0.4, eyeRadius * 0.5, eyeRadius * 0.7);
        rightBrow.rotation.z = 0.3;
        rightBrow.rotation.x = 0.2;
        eyeGroup.add(rightBrow);

        // ===== UPPER EYELID (creepy fleshy lid) =====
        const eyelidMaterial = getMaterial('lambert', { color: 0x2a0808 });
        const eyelidGeometry = getGeometry('sphere', eyeRadius * 1.1, 16, 16);

        // Customize eyelid to be like a fleshy dome
        const eyelid = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
        eyelid.position.set(0, eyeRadius * 0.3, 0);
        eyelid.scale.set(1.2, 0.15, 1);
        eyelid.rotation.x = -0.5; // Tilted to partially cover top
        eyeGroup.add(eyelid);
        eyeGroup.eyelid = eyelid;

        // ===== LOWER EYELID (smaller) =====
        const lowerLid = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
        lowerLid.position.set(0, -eyeRadius * 0.3, 0);
        lowerLid.scale.set(1.1, 0.12, 1);
        lowerLid.rotation.x = 0.4;
        eyeGroup.add(lowerLid);

        // ===== EVIL GLOW (overall eye glow) =====
        const glowGeometry = new THREE.SphereGeometry(eyeRadius * 1.3, 24, 24);
        const glowMaterial = getMaterial('basic', {
            color: eyeColor,
            transparent: true,
            opacity: 0.15
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        eyeGroup.add(glow);
        eyeGroup.glow = glow;

        // ===== ADDITIONAL CREEPY PARTS =====
        // Tiny moist droplets on eyeball (disgusting detail)
        const dropletMaterial = getMaterial('basic', { color: 0xffffff });
        for (let i = 0; i < 20; i++) {
            const dropletGeometry = getGeometry('sphere', 0.08 + Math.random() * 0.1, 6, 6);
            const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
            const angle = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.4 + Math.PI * 0.75; // Lower hemisphere mostly
            const r = eyeRadius * 0.95;
            droplet.position.set(
                r * Math.sin(phi) * Math.cos(angle),
                r * Math.sin(phi) * Math.sin(angle) + eyeRadius * 0.2,
                r * Math.cos(phi)
            );
            eyeGroup.add(droplet);
        }

        // Position the entire eye group
        eyeGroup.position.set(baseX, floatHeight, baseZ);

        // Store animation data
        eyeGroup.userData = {
            baseX: baseX,
            baseZ: baseZ,
            initialY: floatHeight, // Store the initial Y (from config) as offset above terrain
            phase: Math.random() * Math.PI * 2,
            lookAtPlayer: true,
            blinkPhase: Math.random() * Math.PI * 2,
            blinkSpeed: 0.5 + Math.random() * 0.5,
            orbitRadius: config.orbitRadius || 35,  // Distance from player
            orbitSpeed: config.orbitSpeed || 0.0003
        };

        // Add to scene
        G.scene.add(eyeGroup);

        return {
            mesh: eyeGroup,
            iris: iris,
            pupil: pupil,
            glow: glow,
            eyelid: eyelid,
            position: { x: baseX, y: floatHeight, z: baseZ },
            radius: eyeRadius,
            type: 'giantEye'
        };
    }

    // Register with entity registry
    if (typeof ENTITY_REGISTRY !== 'undefined') {
        ENTITY_REGISTRY.register('giant-eye', {
            create: createGiantEye,
            update: function(eyes, deltaTime) {
                const now = Date.now();
                const time = now * 0.001;
                const playerPos = G.playerGroup.position;

                eyes.forEach(eye => {
                    const mesh = eye.mesh;
                    const userData = mesh.userData;

                    // Orbit around the player - always stays in view
                    const orbitAngle = time * 2 * userData.orbitSpeed + userData.phase;
                    const targetX = playerPos.x + Math.cos(orbitAngle) * userData.orbitRadius;
                    const targetZ = playerPos.z + Math.sin(orbitAngle) * userData.orbitRadius;
                    
                    // Smooth interpolation to orbit position
                    mesh.position.x += (targetX - mesh.position.x) * 0.02;
                    mesh.position.z += (targetZ - mesh.position.z) * 0.02;
                    
                    // Maintain the configured Y height (absolute, not terrain-relative)
                    const desiredY = userData.initialY;
                    mesh.position.y += (desiredY - mesh.position.y) * 0.05;

                    // Always look at player
                    if (userData.lookAtPlayer) {
                        mesh.lookAt(playerPos.x, playerPos.y + 1.5, playerPos.z);
                    }

                    // Subtle eyelid twitch
                    const blinkOffset = Math.sin(time * userData.blinkSpeed + userData.blinkPhase) * 0.1;
                    mesh.eyelid.position.y = eye.radius * (0.3 + blinkOffset);

                    // Pulsing glow
                    const pulse = 0.8 + Math.sin(time * 3 + userData.phase) * 0.2;
                    mesh.glow.material.opacity = 0.15 * pulse;
                });
            }
        });
    }

    // Also expose globally for direct use
    window.createGiantEye = createGiantEye;
})();
