/**
 * Reaper Entity - Graveyard boss enemy (replaces dragon)
 * Massive hooded death figure with giant scythe
 */
(function() {
    'use strict';

    function createReaper(posConfig, scale = 1, health = 60) {
        const textures = getTerrainTextures(THREE);
        const reaperGroup = new THREE.Group();

        // MASSIVE HOODED DEATH FIGURE - using visible dark colors (not pure black)
        const cloakBlack = 0x2a2035;  // Dark purple-gray (visible against dark sky)
        const cloakDark = 0x1a1520;   // Slightly lighter dark
        const boneWhite = 0xd0c8b0;
        const glowGreen = 0x00FF44;

        // Main body/robe - massive flowing cloak
        const robeGeometry = getGeometry('cylinder', 2.5, 4.5, 12, 16);
        const robeMaterial = getMaterial('lambert', {
            color: cloakBlack
        });
        const robe = new THREE.Mesh(robeGeometry, robeMaterial);
        robe.position.y = 6;
        robe.castShadow = true;
        reaperGroup.add(robe);

        // Flowing tattered edges
        for (let i = 0; i < 16; i++) {
            const tatGeometry = getGeometry('cone', 0.5, 3 + Math.random() * 2, 4);
            const tatMaterial = getMaterial('lambert', { color: cloakDark });
            const tatter = new THREE.Mesh(tatGeometry, tatMaterial);
            const angle = (i / 16) * Math.PI * 2;
            tatter.position.set(Math.cos(angle) * 4.2, 0.5, Math.sin(angle) * 4.2);
            tatter.rotation.x = Math.PI;
            reaperGroup.add(tatter);
        }

        // Upper body shroud
        const shroudGeometry = getGeometry('cylinder', 2.0, 2.5, 4, 12);
        const shroud = new THREE.Mesh(shroudGeometry, robeMaterial);
        shroud.position.y = 12.5;
        shroud.castShadow = true;
        reaperGroup.add(shroud);

        // Hood - deep and dark
        const hoodGeometry = getGeometry('cone', 2.5, 4, 12);
        const hoodMaterial = getMaterial('lambert', { color: cloakBlack });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.y = 16;
        hood.rotation.x = 0.2;
        hood.castShadow = true;
        reaperGroup.add(hood);

        // Hood opening (shadowed face area)
        const faceVoidGeometry = getGeometry('sphere', 1.5, 16, 16);
        const faceVoidMaterial = getMaterial('basic', {
            color: 0x000000,
            transparent: true,
            opacity: 0.95
        });
        const faceVoid = new THREE.Mesh(faceVoidGeometry, faceVoidMaterial);
        faceVoid.position.set(0, 14.5, 1.2);
        faceVoid.scale.z = 0.5;
        reaperGroup.add(faceVoid);

        // Skull face (barely visible in hood darkness)
        const skullGeometry = getGeometry('sphere', 1.2, 16, 16);
        const skullMaterial = getMaterial('lambert', {
            color: boneWhite,
            transparent: true,
            opacity: 0.4
        });
        const skull = new THREE.Mesh(skullGeometry, skullMaterial);
        skull.position.set(0, 14.5, 0.8);
        skull.scale.z = 0.8;
        reaperGroup.add(skull);

        // Glowing eye sockets
        const eyeGeometry = getGeometry('sphere', 0.35, 12, 12);
        const eyeMaterial = getMaterial('basic', {
            color: 0xFF0000,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.5, 14.7, 1.8);
        reaperGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.5, 14.7, 1.8);
        reaperGroup.add(rightEye);

        // Eye glow effect (emissive mesh instead of PointLight for perf)
        const eyeGlowGeometry = getGeometry('sphere', 0.8, 8, 8);
        const eyeGlowMaterial = getMaterial('basic', { color: 0xFF0000, transparent: true, opacity: 0.4 });
        const eyeGlowMesh = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        eyeGlowMesh.position.set(0, 14.7, 2);
        reaperGroup.add(eyeGlowMesh);

        // Skeletal hands emerging from sleeves
        const handMaterial = getMaterial('lambert', { color: boneWhite });

        // Left hand holding scythe
        const leftHandGeometry = getGeometry('box', 0.8, 1.5, 0.4);
        const leftHand = new THREE.Mesh(leftHandGeometry, handMaterial);
        leftHand.position.set(-3.5, 10, 2);
        leftHand.rotation.z = 0.3;
        reaperGroup.add(leftHand);

        // Left arm sleeve
        const leftSleeveGeometry = getGeometry('cylinder', 0.6, 1.2, 4, 8);
        const leftSleeve = new THREE.Mesh(leftSleeveGeometry, robeMaterial);
        leftSleeve.position.set(-3, 11, 1);
        leftSleeve.rotation.z = 0.4;
        leftSleeve.rotation.x = -0.3;
        reaperGroup.add(leftSleeve);

        // Right hand reaching out
        const rightHandGeometry = getGeometry('box', 0.8, 1.5, 0.4);
        const rightHand = new THREE.Mesh(rightHandGeometry, handMaterial);
        rightHand.position.set(3.5, 10, 2);
        rightHand.rotation.z = -0.3;
        reaperGroup.add(rightHand);

        // Right arm sleeve
        const rightSleeveGeometry = getGeometry('cylinder', 0.6, 1.2, 4, 8);
        const rightSleeve = new THREE.Mesh(rightSleeveGeometry, robeMaterial);
        rightSleeve.position.set(3, 11, 1);
        rightSleeve.rotation.z = -0.4;
        rightSleeve.rotation.x = -0.3;
        reaperGroup.add(rightSleeve);

        // GIANT SCYTHE
        // Scythe handle
        const handleGeometry = getGeometry('cylinder', 0.2, 0.2, 16, 8);
        const handleMaterial = getMaterial('lambert', { color: 0x2a1a0a });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(-4, 12, 2.5);
        handle.rotation.z = 0.3;
        handle.rotation.x = -0.15;
        reaperGroup.add(handle);

        // Scythe blade - curved deadly
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0);
        bladeShape.lineTo(5, 1);
        bladeShape.quadraticCurveTo(7, 0.5, 8, -1);
        bladeShape.quadraticCurveTo(6, -0.5, 4, 0);
        bladeShape.lineTo(0, 0);

        const bladeExtrudeSettings = {
            steps: 1,
            depth: 0.1,
            bevelEnabled: false
        };
        const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, bladeExtrudeSettings);
        const bladeMaterial = getMaterial('phong', {
            color: 0x3a3a3a,
            shininess: 100,
            specular: 0x666666
        });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(-5, 19, 2);
        blade.rotation.y = Math.PI / 2;
        blade.rotation.z = 0.5;
        reaperGroup.add(blade);

        // Blade edge glow
        const edgeGeometry = getGeometry('cylinder', 0.05, 0.05, 6, 8);
        const edgeMaterial = getMaterial('basic', {
            color: glowGreen,
            transparent: true,
            opacity: 0.6
        });
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.position.set(-3, 19.5, 5);
        edge.rotation.z = 0.8;
        reaperGroup.add(edge);

        // Ghostly trail particles (ethereal essence)
        const trailGeometry = getGeometry('sphere', 0.5, 8, 8);
        const trailMaterial = getMaterial('basic', {
            color: glowGreen,
            transparent: true,
            opacity: 0.3
        });
        for (let i = 0; i < 8; i++) {
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.set(
                (Math.random() - 0.5) * 6,
                Math.random() * 12,
                (Math.random() - 0.5) * 6
            );
            trail.scale.setScalar(0.3 + Math.random() * 0.7);
            reaperGroup.add(trail);
        }

        // Eerie ambient glow (emissive mesh instead of PointLight for perf)
        const ambientGlowGeometry = getGeometry('sphere', 2.0, 8, 8);
        const ambientGlowMaterial = getMaterial('basic', { color: glowGreen, transparent: true, opacity: 0.15 });
        const ambientGlowMesh = new THREE.Mesh(ambientGlowGeometry, ambientGlowMaterial);
        ambientGlowMesh.position.set(0, 8, 0);
        reaperGroup.add(ambientGlowMesh);

        // Position reaper
        const reaperConfig = posConfig || G.levelConfig.dragon || { x: 0, z: -200 };
        const reaperX = reaperConfig.x;
        const reaperZ = reaperConfig.z;
        const terrainH = getTerrainHeight(reaperX, reaperZ);
        // Reaper should be at ground level
        const reaperY = reaperConfig.y !== undefined ? reaperConfig.y : terrainH;

        // Apply scale (use config scale or default 0.5)
        const finalScale = reaperConfig.scale !== undefined ? reaperConfig.scale : scale;
        reaperGroup.scale.set(finalScale, finalScale, finalScale);
        reaperGroup.position.set(reaperX, reaperY, reaperZ);
        G.scene.add(reaperGroup);

        // Store blade and handle for attack animations
        reaperGroup.blade = blade;
        reaperGroup.handle = handle;

        return {
            mesh: reaperGroup,
            head: hood,
            leftEye: leftEye,
            rightEye: rightEye,
            blade: blade,
            health: health,
            maxHealth: health,
            scale: finalScale,
            alive: true,
            speed: 0.025 * speedMultiplier * finalScale, // Slower reaper
            patrolLeft: reaperX - 40,
            patrolRight: reaperX + 40,
            patrolFront: reaperZ - 25,
            patrolBack: reaperZ + 25,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: finalScale < 0.5 ? 4000 : 3000,
            isFlying: false, // Reapers float/hover
            flyStartTime: 0,
            flyDuration: 0,
            flyTargetY: 0,
            groundY: reaperY,
            frozen: false,
            frozenUntil: 0,
            isReaper: true, // Flag to identify as reaper for special behavior
            hoverPhase: Math.random() * Math.PI * 2,
            chaseRange: 40, // Only chase player within this range
            homeX: reaperX,
            homeZ: reaperZ
        };
    }

    // Register with entity registry
    ENTITY_REGISTRY.register('reaper', {
        create: createReaper
    });

    // Export for global access
    window.createReaper = createReaper;
})();
