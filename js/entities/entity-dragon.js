/**
 * Dragon Entity - Boss enemy with theme-based textures
 * Themes: Standard, Lava, Ice, Water, Candy
 */
(function() {
    'use strict';

    function createDragon(posConfig, scale = 1, health = 50) {
        const textures = getTerrainTextures(THREE);
        const dragonGroup = new THREE.Group();
        
        // Use theme-appropriate textures
        let dragonScaleTexture, dragonEyeTexture;
        let useGlitchStyle = false;  // For computer theme special rendering
        
        if (G.lavaTheme) {
            dragonScaleTexture = textures.dragonScaleLava;
            dragonEyeTexture = textures.dragonEyeLava;
        } else if (G.iceTheme) {
            dragonScaleTexture = textures.dragonScaleIce;
            dragonEyeTexture = textures.dragonEyeIce;
        } else if (G.waterTheme) {
            dragonScaleTexture = textures.dragonScaleWater;
            dragonEyeTexture = textures.dragonEyeWater;
        } else if (G.candyTheme) {
            dragonScaleTexture = textures.dragonScaleCandy;
            dragonEyeTexture = textures.dragonEyeCandy;
        } else if (G.computerTheme) {
            // Trojan Dragon uses special glitch materials instead of textures
            useGlitchStyle = true;
            dragonScaleTexture = null;
            dragonEyeTexture = null;
        } else if (G.crystalTheme) {
            dragonScaleTexture = textures.dragonScaleCrystal;
            dragonEyeTexture = textures.dragonEyeCrystal;
        } else {
            dragonScaleTexture = textures.dragonScale;
            dragonEyeTexture = textures.dragonEye;
        }
        
        // Trojan Dragon - corrupted data beast with glitch effects (wiki style)
        const trojanColor = 0x9900FF;      // Purple corruption (wiki glitchPurple)
        const dataColor = 0x00FFFF;        // Cyan data
        const darkColor = 0x110022;        // Dark corrupted core
        
        // Body - long segmented shape
        const bodyGeometry = new THREE.CylinderGeometry(2, 2.5, 10, 12);
        const bodyMaterial = useGlitchStyle 
            ? new THREE.MeshPhongMaterial({
                color: darkColor,
                emissive: trojanColor,
                emissiveIntensity: 0.3,
                shininess: 50,
                transparent: true,
                opacity: 0.9
            })
            : new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.x = 5;
        body.castShadow = true;
        dragonGroup.add(body);
        
        // Add glitch effect fragments for Trojan Dragon
        if (useGlitchStyle) {
            for (let i = 0; i < 12; i++) {
                const glitchGeometry = new THREE.BoxGeometry(
                    0.3 + Math.random() * 0.5,
                    0.1 + Math.random() * 0.3,
                    0.3 + Math.random() * 0.5
                );
                const glitchMaterial = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? trojanColor : dataColor,
                    transparent: true,
                    opacity: 0.6 + Math.random() * 0.4
                });
                const glitch = new THREE.Mesh(glitchGeometry, glitchMaterial);
                glitch.position.set(
                    Math.random() * 10,
                    2 + Math.random() * 2,
                    (Math.random() - 0.5) * 4
                );
                glitch.userData.glitchOffset = Math.random() * Math.PI * 2;
                dragonGroup.add(glitch);
            }
        }
        
        // Body scales
        for (let i = 0; i < 8; i++) {
            const scaleGeometry = new THREE.ConeGeometry(0.6, 1.2, 6);
            const scaleMaterial = useGlitchStyle
                ? new THREE.MeshPhongMaterial({
                    color: darkColor,
                    emissive: i % 2 === 0 ? trojanColor : dataColor,
                    emissiveIntensity: 0.5
                })
                : new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
            const scale = new THREE.Mesh(scaleGeometry, scaleMaterial);
            scale.position.set(i * 1.2, 2.8, 0);
            scale.rotation.z = 0;
            scale.castShadow = true;
            dragonGroup.add(scale);
        }
        
        // Neck
        const neckGeometry = new THREE.CylinderGeometry(1.8, 2, 4, 8);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.rotation.z = Math.PI / 2;
        neck.position.x = 10;
        neck.position.y = 1;
        neck.castShadow = true;
        dragonGroup.add(neck);
        
        // Head - large diamond shape
        const headGeometry = new THREE.ConeGeometry(2.5, 5, 8);
        const headMaterial = useGlitchStyle
            ? new THREE.MeshPhongMaterial({
                color: darkColor,
                emissive: trojanColor,
                emissiveIntensity: 0.4,
                shininess: 60
            })
            : new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.rotation.z = -Math.PI / 2;
        head.position.x = 13;
        head.position.y = 1.5;
        head.castShadow = true;
        dragonGroup.add(head);
        
        // Jaw
        const jawGeometry = new THREE.BoxGeometry(2, 1.5, 2);
        const jaw = new THREE.Mesh(jawGeometry, headMaterial);
        jaw.position.set(14, 0.5, 0);
        jaw.castShadow = true;
        dragonGroup.add(jaw);
        
        // Teeth
        for (let i = 0; i < 6; i++) {
            const toothGeometry = new THREE.ConeGeometry(0.15, 0.6, 4);
            const toothMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            tooth.position.set(14 + (i % 2) * 0.5, 1.2, -1 + i * 0.4);
            tooth.rotation.z = Math.PI;
            dragonGroup.add(tooth);
        }
        
        // Eyes - glowing with texture and sprite glow
        const eyeGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const eyeMaterial = useGlitchStyle
            ? new THREE.MeshBasicMaterial({ 
                color: 0xFF0000,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
            : new THREE.MeshBasicMaterial({ 
                map: dragonEyeTexture,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(13.5, 2.5, 1.2);
        dragonGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(13.5, 2.5, -1.2);
        dragonGroup.add(rightEye);
        
        // Eye glow sprites - larger and brighter
        const eyeGlowGeometry = new THREE.PlaneGeometry(2.5, 2.5);
        const eyeGlowMaterial = useGlitchStyle
            ? new THREE.MeshBasicMaterial({
                color: 0xFF0000,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
            : new THREE.MeshBasicMaterial({
                map: dragonEyeTexture,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
        const leftEyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        leftEyeGlow.position.set(13.8, 2.5, 1.2);
        dragonGroup.add(leftEyeGlow);
        
        const rightEyeGlow = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        rightEyeGlow.position.set(13.8, 2.5, -1.2);
        dragonGroup.add(rightEyeGlow);
        
        // Wings - more detailed
        const wingGeometry = new THREE.BufferGeometry();
        const wingVertices = new Float32Array([
            0, 0, 0,
            6, 2, 0,
            8, 0, 0,
            6, -2, 0,
            4, -1, 0
        ]);
        wingGeometry.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
        wingGeometry.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4]);
        wingGeometry.computeVertexNormals();
        
        const wingMaterial = new THREE.MeshLambertMaterial({ 
            map: dragonScaleTexture, 
            side: THREE.DoubleSide 
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(3, 3, 0);
        leftWing.rotation.y = Math.PI / 2;
        leftWing.castShadow = true;
        dragonGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(3, 3, 0);
        rightWing.rotation.y = -Math.PI / 2;
        rightWing.castShadow = true;
        dragonGroup.add(rightWing);
        
        // Tail segments
        const tailSegments = [];
        for (let i = 0; i < 3; i++) {
            const segmentGeometry = new THREE.CylinderGeometry(1.5 - i * 0.3, 1.8 - i * 0.3, 3, 8);
            const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
            segment.rotation.z = Math.PI / 2;
            segment.position.x = -3 - i * 2.5;
            segment.position.y = 0.5 - i * 0.3;
            segment.castShadow = true;
            dragonGroup.add(segment);
            tailSegments.push(segment);
        }
        
        // Tail spikes
        for (let i = 0; i < 10; i++) {
            const spikeGeometry = new THREE.ConeGeometry(0.3, 1, 6);
            const spikeMaterial = new THREE.MeshLambertMaterial({ map: dragonScaleTexture });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(-i * 0.8, 2.5, 0);
            spike.rotation.z = Math.PI;
            spike.castShadow = true;
            dragonGroup.add(spike);
        }
        
        // Horns - larger and more imposing
        const hornGeometry = new THREE.ConeGeometry(0.5, 2.5, 6);
        const hornMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
        
        const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        leftHorn.position.set(12.5, 4, 1.5);
        leftHorn.rotation.z = -0.4;
        leftHorn.rotation.x = 0.2;
        leftHorn.castShadow = true;
        dragonGroup.add(leftHorn);
        
        const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
        rightHorn.position.set(12.5, 4, -1.5);
        rightHorn.rotation.z = -0.4;
        rightHorn.rotation.x = -0.2;
        rightHorn.castShadow = true;
        dragonGroup.add(rightHorn);
        
        // Chest/belly - lighter color
        const bellyGeometry = new THREE.CylinderGeometry(1.8, 2.2, 8, 12);
        const bellyMaterial = new THREE.MeshLambertMaterial({ map: textures.dragonBelly });
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.rotation.z = Math.PI / 2;
        belly.position.x = 5;
        belly.position.y = -1.5;
        belly.castShadow = true;
        dragonGroup.add(belly);
        
        // Position dragon from provided config or level config
        const dragonConfig = posConfig || G.levelConfig.dragon || { x: 0, z: -200 };
        const dragonX = dragonConfig.x;
        const dragonZ = dragonConfig.z;
        // Use config y if provided, otherwise calculate from terrain
        const dragonY = dragonConfig.y !== undefined ? dragonConfig.y : getTerrainHeight(dragonX, dragonZ) + 3 * scale;

        // Apply scale to the entire dragon
        dragonGroup.scale.set(scale, scale, scale);
        dragonGroup.position.set(dragonX, dragonY, dragonZ);
        G.scene.add(dragonGroup);
        
        return {
            mesh: dragonGroup,
            head: head,
            leftWing: leftWing,
            rightWing: rightWing,
            tailSegments: tailSegments,
            leftEye: leftEye,
            rightEye: rightEye,
            leftEyeGlow: leftEyeGlow,
            rightEyeGlow: rightEyeGlow,
            health: health,
            maxHealth: health,
            scale: scale,
            alive: true,
            speed: 0.08 * speedMultiplier * scale,
            patrolLeft: dragonX - 30,
            patrolRight: dragonX + 30,
            patrolFront: dragonZ - 20,
            patrolBack: dragonZ + 20,
            direction: 1,
            lastFireTime: Date.now(),
            fireInterval: scale < 1 ? 5000 : 4000, // Smaller dragons fire less often
            wingFlapPhase: 0,
            isFlying: false,
            flyStartTime: 0,
            flyDuration: 0,
            flyTargetY: 0,
            groundY: 0,
            frozen: false,
            frozenUntil: 0
        };
    }

    // Register with entity registry
    ENTITY_REGISTRY.register('dragon', {
        create: createDragon
    });

    // Export for global access
    window.createDragon = createDragon;
})();
