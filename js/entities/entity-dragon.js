/**
 * Dragon Entity - Boss enemy with theme-based textures
 * Themes: Standard, Lava, Ice, Water, Candy
 */
(function() {
    'use strict';

    // Builds a completely different boss for the horror theme –
    // a massive pulsating flesh-abomination with membrane wings, dozens of eyes and a gaping maw.
    function buildHorrorAbomination(posConfig, scale, health) {
        const grp = new THREE.Group();

        const fleshMat   = getMaterial('phong', { color: 0x3a0a00, emissive: 0x200500, emissiveIntensity: 0.4, shininess: 18 });
        const innerMat   = getMaterial('phong', { color: 0x5a0800, emissive: 0x3a0000, emissiveIntensity: 0.6, shininess: 60 });
        const boneMat    = getMaterial('lambert', { color: 0xb09070 });
        const eyeMat     = getMaterial('basic', { color: 0xff2200, transparent: true,
                                                  blending: THREE.AdditiveBlending, depthWrite: false });
        const eyeGlowMat = getMaterial('basic', { color: 0xff0000, transparent: true, opacity: 0.6,
                                                  side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
        const toothMat   = getMaterial('phong', { color: 0xc8b898, shininess: 30 });
        const memMat     = getMaterial('phong', { color: 0x2a0000, emissive: 0x500000, emissiveIntensity: 0.3,
                                                  transparent: true, opacity: 0.78, side: THREE.DoubleSide });

        // ── Helper: add a glowing eye at a world-space position, return {eye, glow} ──
        function addEye(x, y, z, r) {
            r = r || 0.55;
            const eye  = new THREE.Mesh(getGeometry('sphere', r, 10, 10), eyeMat.clone());
            eye.position.set(x, y, z);
            grp.add(eye);
            const glow = new THREE.Mesh(getGeometry('plane', r * 3.6, r * 3.6), eyeGlowMat.clone());
            glow.position.set(x, y, z);
            grp.add(glow);
            return { eye, glow };
        }

        // ═══════════════════════════════════════════════
        // BODY: Three visible barrel-shaped body segments
        // ═══════════════════════════════════════════════
        // Segment positions along X axis (head=front, tail=back)
        //   front segment at x=+8, mid at x=0, rear at x=-8
        const segData = [
            { x:  8.5, rx: 3.0, ry: 2.8, rz: 3.2 },   // front – widest
            { x:  0,   rx: 3.5, ry: 3.2, rz: 3.8 },   // mid   – fattest
            { x: -8.5, rx: 2.8, ry: 2.5, rz: 2.8 }    // rear  – narrower
        ];
        segData.forEach(function(s) {
            const seg = new THREE.Mesh(getGeometry('sphere', 1, 14, 10), fleshMat);
            seg.scale.set(s.rx, s.ry, s.rz);
            seg.position.set(s.x, 0, 0);
            seg.castShadow = true;
            grp.add(seg);
        });

        // Connecting necks between segments (visible cylinders)
        [{ x: 4.2, lean: 0.15 }, { x: -4.2, lean: -0.1 }].forEach(function(n) {
            const neck = new THREE.Mesh(getGeometry('cylinder', 2.0, 2.4, 4.0, 10), fleshMat);
            neck.rotation.z = Math.PI / 2;
            neck.position.set(n.x, n.lean, 0);
            neck.castShadow = true;
            grp.add(neck);
        });

        // ═══════════════════════════════════════════════
        // GAPING MAW – on front face, fully exposed
        // ═══════════════════════════════════════════════
        // Throat tunnel (open cylinder, glowing inside)
        const throat = new THREE.Mesh(
            getGeometry('cylinder', 2.2, 2.8, 3.0, 14, 1, true),
            getMaterial('phong', { color: 0x0a0000, emissive: 0x6a0000, emissiveIntensity: 0.9,
                                   side: THREE.DoubleSide, shininess: 120 })
        );
        throat.rotation.z = Math.PI / 2;
        throat.position.set(11.2, 0, 0);
        grp.add(throat);

        // Lip ring
        const lip = new THREE.Mesh(getGeometry('cylinder', 2.9, 2.9, 0.5, 14, 1, true), innerMat);
        lip.rotation.z = Math.PI / 2;
        lip.position.set(12.6, 0, 0);
        grp.add(lip);

        // Outer teeth ring (18 big fangs)
        for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2;
            const t = new THREE.Mesh(getGeometry('cone', 0.22, 1.4, 4), toothMat);
            t.position.set(12.8, Math.cos(a) * 2.8, Math.sin(a) * 2.8);
            t.rotation.z = -(Math.PI / 2 - 0.15);   // point outward along X
            t.rotation.y = a;
            t.castShadow = true;
            grp.add(t);
        }
        // Inner teeth ring (12 smaller fangs)
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const t = new THREE.Mesh(getGeometry('cone', 0.14, 0.9, 4), toothMat);
            t.position.set(11.8, Math.cos(a) * 1.7, Math.sin(a) * 1.7);
            t.rotation.z = -(Math.PI / 2 - 0.1);
            t.rotation.y = a;
            grp.add(t);
        }

        // ═══════════════════════════════════════════════
        // EYES – raised on stalks so they're fully visible
        // ═══════════════════════════════════════════════
        // Stalk + eye pairs: [x, y, z, stalkLen, eyeR]
        const eyeStalks = [
            // Front cluster around the maw
            [ 10.5,  3.5,  2.0,  1.2, 0.65 ],
            [ 10.5,  3.5, -2.0,  1.2, 0.65 ],
            [ 10.5,  0.5,  3.5,  1.0, 0.55 ],
            [ 10.5,  0.5, -3.5,  1.0, 0.55 ],
            // Mid-body sides
            [  2.0,  4.5,  4.2,  0.9, 0.60 ],
            [  2.0,  4.5, -4.2,  0.9, 0.60 ],
            [ -2.0,  4.2,  4.0,  0.8, 0.55 ],
            [ -2.0,  4.2, -4.0,  0.8, 0.55 ],
            // Top of mid segment
            [  0.5,  5.2,  1.5,  0.6, 0.50 ],
            [  0.5,  5.2, -1.5,  0.6, 0.50 ],
            // Rear segment
            [ -7.0,  3.8,  2.8,  0.7, 0.50 ],
            [ -7.0,  3.8, -2.8,  0.7, 0.50 ]
        ];

        let leftEye, rightEye, leftEyeGlow, rightEyeGlow;
        eyeStalks.forEach(function(es, i) {
            // Eye stalk
            const stalk = new THREE.Mesh(getGeometry('cylinder', 0.12, 0.18, es[3], 5), fleshMat);
            stalk.position.set(es[0], es[1] - es[3] * 0.4, es[2]);
            stalk.rotation.z = (Math.random() - 0.5) * 0.4;
            stalk.castShadow = true;
            grp.add(stalk);
            // Eye itself (raised above stalk)
            const eg = addEye(es[0], es[1] + es[3] * 0.3, es[2], es[4]);
            if (i === 0) { leftEye = eg.eye; leftEyeGlow = eg.glow; }
            if (i === 1) { rightEye = eg.eye; rightEyeGlow = eg.glow; }
        });

        // ═══════════════════════════════════════════════
        // BONE SPURS – clearly protruding from back ridge
        // ═══════════════════════════════════════════════
        [
            { x:  7,  y: 6.2, z:  0,   h: 5.0, tilt:  0.0 },
            { x:  4,  y: 6.8, z:  1.5, h: 4.5, tilt:  0.15 },
            { x:  4,  y: 6.8, z: -1.5, h: 4.5, tilt: -0.15 },
            { x:  0,  y: 7.2, z:  0,   h: 5.5, tilt:  0.0 },
            { x: -4,  y: 6.5, z:  1.5, h: 4.2, tilt:  0.2 },
            { x: -4,  y: 6.5, z: -1.5, h: 4.2, tilt: -0.2 },
            { x: -8,  y: 5.5, z:  0,   h: 3.8, tilt:  0.1 }
        ].forEach(function(sp) {
            const spur = new THREE.Mesh(getGeometry('cone', 0.38, sp.h, 5), boneMat);
            spur.position.set(sp.x, sp.y, sp.z);
            spur.rotation.z = sp.tilt;
            spur.castShadow = true;
            grp.add(spur);
            // Base collar where spur meets flesh
            const collar = new THREE.Mesh(getGeometry('cylinder', 0.55, 0.42, 0.5, 6), fleshMat);
            collar.position.set(sp.x, sp.y - sp.h * 0.4, sp.z);
            collar.rotation.z = sp.tilt;
            grp.add(collar);
        });

        // ═══════════════════════════════════════════════
        // WINGS – large membrane wings, root on mid-body
        // ═══════════════════════════════════════════════
        function makeWing(side) {
            const wGrp = new THREE.Group();
            // Primary arm bone
            const armBone = new THREE.Mesh(getGeometry('cylinder', 0.22, 0.32, 10, 6), boneMat);
            armBone.rotation.z = Math.PI / 2;
            armBone.position.set(5, 0, 0);
            wGrp.add(armBone);
            // Secondary arm
            const arm2 = new THREE.Mesh(getGeometry('cylinder', 0.14, 0.20, 7, 5), boneMat);
            arm2.position.set(12, 0.5, 0);
            arm2.rotation.z = Math.PI / 2 - 0.3;
            wGrp.add(arm2);
            // Three membrane panels fanning from arm
            [-0.4, 0, 0.4].forEach(function(yOff, pi) {
                const panelGeom = new THREE.BufferGeometry();
                const verts = new Float32Array([
                    0,        0,        0,
                    8,        0.5+yOff, side * 3,
                    14,       1.0+yOff, side * 6,
                    8,       -0.5+yOff, side * 3,
                    14,      -1.0+yOff, side * 6
                ]);
                panelGeom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
                panelGeom.setIndex([0,1,3, 1,4,3, 1,2,4]);
                panelGeom.computeVertexNormals();
                wGrp.add(new THREE.Mesh(panelGeom, memMat));
            });
            // Finger bones along membrane
            for (let f = 0; f < 5; f++) {
                const finger = new THREE.Mesh(getGeometry('cylinder', 0.06, 0.10, 5 + f, 4), boneMat);
                finger.rotation.z = Math.PI / 2;
                finger.rotation.y = side * (f * 0.18 - 0.36);
                finger.position.set(5 + f * 1.2, 0, side * f * 0.8);
                wGrp.add(finger);
            }
            return wGrp;
        }

        const leftWing = makeWing(1);
        leftWing.position.set(0, 2, 4.5);
        grp.add(leftWing);

        const rightWing = makeWing(-1);
        rightWing.position.set(0, 2, -4.5);
        grp.add(rightWing);

        // ═══════════════════════════════════════════════
        // LIMBS – 6 clawed arms jutting from belly
        // ═══════════════════════════════════════════════
        [
            {x:  7, z:  3.5}, {x:  7, z: -3.5},
            {x:  0, z:  4.0}, {x:  0, z: -4.0},
            {x: -6, z:  3.0}, {x: -6, z: -3.0}
        ].forEach(function(lp) {
            // Upper arm
            const upper = new THREE.Mesh(getGeometry('cylinder', 0.25, 0.35, 2.5, 6), fleshMat);
            upper.position.set(lp.x, -3.0, lp.z);
            upper.rotation.z = (lp.z > 0 ? 0.6 : -0.6);
            upper.rotation.x = 0.3;
            upper.castShadow = true;
            grp.add(upper);
            // Lower arm
            const lower = new THREE.Mesh(getGeometry('cylinder', 0.15, 0.22, 2.2, 5), boneMat);
            lower.position.set(lp.x + 0.8, -5.2, lp.z + (lp.z > 0 ? 1.2 : -1.2));
            lower.rotation.z = (lp.z > 0 ? 1.1 : -1.1);
            lower.castShadow = true;
            grp.add(lower);
            // Three claws at tip
            for (let c = 0; c < 3; c++) {
                const claw = new THREE.Mesh(getGeometry('cone', 0.08, 0.7, 4), boneMat);
                claw.position.set(
                    lp.x + 1.5 + c * 0.18,
                    -7.0 + c * 0.15,
                    lp.z + (lp.z > 0 ? 1.8 : -1.8) + (c - 1) * 0.3
                );
                claw.rotation.z = (lp.z > 0 ? 1.3 : -1.3);
                claw.castShadow = true;
                grp.add(claw);
            }
        });

        // ═══════════════════════════════════════════════
        // TAIL – segmented tapering tail
        // ═══════════════════════════════════════════════
        for (let t = 0; t < 6; t++) {
            const r = 2.0 - t * 0.28;
            const tailSeg = new THREE.Mesh(getGeometry('sphere', r, 8, 7), fleshMat);
            tailSeg.position.set(-11.5 - t * 2.8, -t * 0.5, Math.sin(t * 0.6) * 1.5);
            tailSeg.castShadow = true;
            grp.add(tailSeg);
            // Tail spines
            if (t % 2 === 0) {
                const tspine = new THREE.Mesh(getGeometry('cone', 0.2, 2.0 - t * 0.2, 4), boneMat);
                tspine.position.set(-11.5 - t * 2.8, r + 0.8, Math.sin(t * 0.6) * 1.5);
                grp.add(tspine);
            }
        }

        // ═══════════════════════════════════════════════
        // Position in world
        // ═══════════════════════════════════════════════
        const cfg = posConfig || G.levelConfig.dragon || { x: 0, z: -200 };
        const bx = cfg.x, bz = cfg.z;
        const by = cfg.y !== undefined ? cfg.y : getTerrainHeight(bx, bz) + 5 * scale;
        grp.scale.set(scale, scale, scale);
        grp.position.set(bx, by, bz);
        G.scene.add(grp);

        return {
            mesh: grp,
            head: null,
            leftWing:     leftWing,
            rightWing:    rightWing,
            tailSegments: [],
            leftEye:      leftEye,
            rightEye:     rightEye,
            leftEyeGlow:  leftEyeGlow,
            rightEyeGlow: rightEyeGlow,
            health:        health,
            maxHealth:     health,
            scale:         scale,
            alive:         true,
            speed:         0.07 * speedMultiplier * scale,
            patrolLeft:    bx - 30,
            patrolRight:   bx + 30,
            patrolFront:   bz - 20,
            patrolBack:    bz + 20,
            direction:     1,
            lastFireTime:  Date.now(),
            fireInterval:  4000,
            wingFlapPhase: 0,
            isFlying:      false,
            flyStartTime:  0,
            flyDuration:   0,
            flyTargetY:    0,
            groundY:       0,
            frozen:        false,
            frozenUntil:   0
        };
    }

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
        } else if (G.horrorTheme) {
            useGlitchStyle = true;
            dragonScaleTexture = null;
            dragonEyeTexture = null;
        } else {
            dragonScaleTexture = textures.dragonScale;
            dragonEyeTexture = textures.dragonEye;
        }
        
        const dragonScaleTexName = G.lavaTheme ? 'dragonScaleLava' : G.iceTheme ? 'dragonScaleIce' : G.waterTheme ? 'dragonScaleWater' : G.candyTheme ? 'dragonScaleCandy' : G.crystalTheme ? 'dragonScaleCrystal' : 'dragonScale';
        
        // Trojan Dragon - corrupted data beast with glitch effects (wiki style)
        const trojanColor = G.horrorTheme ? 0xcc0000 : 0x9900FF;  // horror=blood red, glitch=purple
        const dataColor   = G.horrorTheme ? 0x8b0000 : 0x00FFFF;  // horror=dark red, glitch=cyan
        const darkColor   = G.horrorTheme ? 0x050000 : 0x110022;  // horror=near-black, glitch=dark
        
        // Body - long segmented shape
        const bodyGeometry = getGeometry('cylinder', 2, 2.5, 10, 12);
        const bodyMaterial = useGlitchStyle 
            ? getMaterial('phong', {
                color: darkColor,
                emissive: trojanColor,
                emissiveIntensity: 0.3,
                shininess: 50,
                transparent: true,
                opacity: 0.9
            })
            : getTexturedMaterial('lambert', { map: dragonScaleTexture }, dragonScaleTexName);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.position.x = 5;
        body.castShadow = true;
        dragonGroup.add(body);
        
        // Add glitch effect fragments for Trojan Dragon
        if (useGlitchStyle) {
            for (let i = 0; i < 12; i++) {
                const glitchGeometry = getGeometry('box',
                    0.3 + Math.random() * 0.5,
                    0.1 + Math.random() * 0.3,
                    0.3 + Math.random() * 0.5
                );
                const glitchMaterial = getMaterial('basic', {
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
            const scaleGeometry = getGeometry('cone', 0.6, 1.2, 6);
            const scaleMaterial = useGlitchStyle
                ? getMaterial('phong', {
                    color: darkColor,
                    emissive: i % 2 === 0 ? trojanColor : dataColor,
                    emissiveIntensity: 0.5
                })
                : getTexturedMaterial('lambert', { map: dragonScaleTexture }, dragonScaleTexName);
            const scale = new THREE.Mesh(scaleGeometry, scaleMaterial);
            scale.position.set(i * 1.2, 2.8, 0);
            scale.rotation.z = 0;
            scale.castShadow = true;
            dragonGroup.add(scale);
        }
        
        // Neck
        const neckGeometry = getGeometry('cylinder', 1.8, 2, 4, 8);
        const neck = new THREE.Mesh(neckGeometry, bodyMaterial);
        neck.rotation.z = Math.PI / 2;
        neck.position.x = 10;
        neck.position.y = 1;
        neck.castShadow = true;
        dragonGroup.add(neck);
        
        // Head - large diamond shape
        const headGeometry = getGeometry('cone', 2.5, 5, 8);
        const headMaterial = useGlitchStyle
            ? getMaterial('phong', {
                color: darkColor,
                emissive: trojanColor,
                emissiveIntensity: 0.4,
                shininess: 60
            })
            : getTexturedMaterial('lambert', { map: dragonScaleTexture }, dragonScaleTexName);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.rotation.z = -Math.PI / 2;
        head.position.x = 13;
        head.position.y = 1.5;
        head.castShadow = true;
        dragonGroup.add(head);
        
        // Jaw
        const jawGeometry = getGeometry('box', 2, 1.5, 2);
        const jaw = new THREE.Mesh(jawGeometry, headMaterial);
        jaw.position.set(14, 0.5, 0);
        jaw.castShadow = true;
        dragonGroup.add(jaw);
        
        // Teeth
        for (let i = 0; i < 6; i++) {
            const toothGeometry = getGeometry('cone', 0.15, 0.6, 4);
            const toothMaterial = getMaterial('lambert', { color: 0xFFFFFF });
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            tooth.position.set(14 + (i % 2) * 0.5, 1.2, -1 + i * 0.4);
            tooth.rotation.z = Math.PI;
            dragonGroup.add(tooth);
        }
        
        // Eyes - glowing with texture and sprite glow
        const eyeGeometry = getGeometry('sphere', 0.6, 16, 16);
        const eyeMaterial = useGlitchStyle
            ? getMaterial('basic', { 
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
        const eyeGlowGeometry = getGeometry('plane', 2.5, 2.5);
        const eyeGlowMaterial = useGlitchStyle
            ? getMaterial('basic', {
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
        
        const wingMaterial = useGlitchStyle
            ? getMaterial('phong', { color: darkColor, emissive: trojanColor, emissiveIntensity: 0.3,
                side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
            : new THREE.MeshLambertMaterial({ map: dragonScaleTexture, side: THREE.DoubleSide });
        
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
            const segmentGeometry = getGeometry('cylinder', 1.5 - i * 0.3, 1.8 - i * 0.3, 3, 8);
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
            const spikeGeometry = getGeometry('cone', 0.3, 1, 6);
            const spikeMaterial = useGlitchStyle
                ? getMaterial('lambert', { color: darkColor })
                : getTexturedMaterial('lambert', { map: dragonScaleTexture }, dragonScaleTexName);
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            spike.position.set(-i * 0.8, 2.5, 0);
            spike.rotation.z = Math.PI;
            spike.castShadow = true;
            dragonGroup.add(spike);
        }
        
        // Horns - larger and more imposing
        const hornGeometry = getGeometry('cone', 0.5, 2.5, 6);
        const hornMaterial = getMaterial('lambert', { color: 0x2F2F2F });
        
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
        const bellyGeometry = getGeometry('cylinder', 1.8, 2.2, 8, 12);
        const bellyMaterial = useGlitchStyle
            ? getMaterial('phong', { color: darkColor, emissive: trojanColor, emissiveIntensity: 0.2 })
            : getTexturedMaterial('lambert', { map: textures.dragonBelly }, 'dragonBelly');
        const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
        belly.rotation.z = Math.PI / 2;
        belly.position.x = 5;
        belly.position.y = -1.5;
        belly.castShadow = true;
        dragonGroup.add(belly);
        
        // Horror theme – completely replace the dragon with a flesh abomination
        if (G.horrorTheme) {
            return buildHorrorAbomination(posConfig, scale, health);
        }

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
