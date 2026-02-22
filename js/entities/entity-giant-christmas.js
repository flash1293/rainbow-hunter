// entity-giant-christmas.js - Evil Snowman
// Christmas-themed variant of giant

(function() {
    'use strict';
    
    function createGiantChristmas(config = {}) {
        const group = new THREE.Group();
        const snowWhite = 0xffffff;         // Snow white body
        const coalBlack = 0x222222;         // Coal eyes/buttons
        const carrotOrange = 0xff6600;      // Carrot nose
        const scarfRed = 0xdc143c;          // Red scarf
        const hatBlack = 0x1a1a1a;          // Black top hat
        const hatRibbon = 0xcc0000;         // Red hat ribbon
        const iceBlue = 0xccffff;           // Icy highlights
        
        // Large snowball body (bottom)
        const bodyBottomGeometry = getGeometry('sphere', 1.8, 16, 16);
        const snowMaterial = getMaterial('lambert', { color: snowWhite });
        const bodyBottom = new THREE.Mesh(bodyBottomGeometry, snowMaterial);
        bodyBottom.position.y = 2.0;
        bodyBottom.scale.set(1, 0.95, 1);
        bodyBottom.castShadow = true;
        bodyBottom.receiveShadow = true;
        group.add(bodyBottom);
        
        // Middle snowball
        const bodyMiddleGeometry = getGeometry('sphere', 1.5, 16, 16);
        const bodyMiddle = new THREE.Mesh(bodyMiddleGeometry, snowMaterial);
        bodyMiddle.position.y = 4.2;
        bodyMiddle.scale.set(1, 0.9, 1);
        bodyMiddle.castShadow = true;
        bodyMiddle.receiveShadow = true;
        group.add(bodyMiddle);
        
        // Coal buttons on body
        const buttonGeometry = getGeometry('sphere', 0.25, 12, 12);
        const coalMaterial = getMaterial('lambert', { color: coalBlack });
        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(buttonGeometry, coalMaterial);
            button.position.set(0, 3.5 + (i * 0.5), 1.5);
            button.castShadow = true;
            group.add(button);
        }
        
        // Head (top snowball)
        const headGeometry = getGeometry('sphere', 1.2, 16, 16);
        const head = new THREE.Mesh(headGeometry, snowMaterial);
        head.position.y = 6.0;
        head.castShadow = true;
        group.add(head);
        
        // Evil coal eyes (glowing red)
        const eyeGeometry = getGeometry('sphere', 0.2, 12, 12);
        const eyeMaterial = getMaterial('basic', { color: 0xff0000 });
        [-0.4, 0.4].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 6.2, 1.1);
            group.add(eye);
            
            // Evil glow
            const glowGeometry = getGeometry('sphere', 0.25, 12, 12);
            const glowMaterial = getMaterial('basic', { 
                color: 0xff0000, 
                transparent: true, 
                opacity: 0.3 
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, 6.2, 1.1);
            group.add(glow);
        });
        
        // Carrot nose
        const noseGeometry = getGeometry('cone', 0.15, 0.8, 8);
        const noseMaterial = getMaterial('lambert', { color: carrotOrange });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 5.9, 1.2);
        nose.rotation.x = Math.PI / 2;
        nose.castShadow = true;
        group.add(nose);
        
        // Evil grin made of coal pieces
        const mouthCoalGeometry = getGeometry('sphere', 0.12, 8, 8);
        for (let i = 0; i < 7; i++) {
            const angle = (i - 3) * 0.15;
            const x = Math.sin(angle) * 0.6;
            const y = 5.5 - Math.abs(i - 3) * 0.08;
            const mouthCoal = new THREE.Mesh(mouthCoalGeometry, coalMaterial);
            mouthCoal.position.set(x, y, 1.1);
            mouthCoal.castShadow = true;
            group.add(mouthCoal);
        }
        
        // Black top hat
        const hatBaseGeometry = getGeometry('cylinder', 0.8, 0.8, 0.2, 16);
        const hatMaterial = getMaterial('lambert', { color: hatBlack });
        const hatBase = new THREE.Mesh(hatBaseGeometry, hatMaterial);
        hatBase.position.y = 7.0;
        hatBase.castShadow = true;
        group.add(hatBase);
        
        const hatTopGeometry = getGeometry('cylinder', 0.6, 0.6, 1.2, 16);
        const hatTop = new THREE.Mesh(hatTopGeometry, hatMaterial);
        hatTop.position.y = 7.7;
        hatTop.castShadow = true;
        group.add(hatTop);
        
        // Red ribbon on hat
        const ribbonGeometry = getGeometry('cylinder', 0.65, 0.65, 0.15, 16);
        const ribbonMaterial = getMaterial('lambert', { color: hatRibbon });
        const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
        ribbon.position.y = 7.2;
        ribbon.castShadow = true;
        group.add(ribbon);
        
        // Red scarf around neck
        const scarfMaterial = getMaterial('lambert', { color: scarfRed });
        const scarfRingGeometry = getGeometry('torus', 1.3, 0.2, 8, 16);
        const scarfRing = new THREE.Mesh(scarfRingGeometry, scarfMaterial);
        scarfRing.position.y = 5.2;
        scarfRing.rotation.x = Math.PI / 2;
        scarfRing.castShadow = true;
        group.add(scarfRing);
        
        // Scarf tails hanging down
        const scarfTailGeometry = getGeometry('cylinder', 0.18, 0.15, 1.5, 8);
        [-0.9, 0.9].forEach(x => {
            const tail = new THREE.Mesh(scarfTailGeometry, scarfMaterial);
            tail.position.set(x, 4.2, 0.8);
            tail.rotation.z = x < 0 ? 0.2 : -0.2;
            tail.castShadow = true;
            group.add(tail);
        });
        
        // Stick arms (frozen tree branches)
        const stickMaterial = getMaterial('lambert', { color: 0x4a3a2a });
        const armGeometry = getGeometry('cylinder', 0.15, 0.12, 2.5, 8);
        
        const leftArm = new THREE.Mesh(armGeometry, stickMaterial);
        leftArm.position.set(-1.8, 4.5, 0);
        leftArm.rotation.z = Math.PI / 3;
        leftArm.castShadow = true;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, stickMaterial);
        rightArm.position.set(1.8, 4.5, 0);
        rightArm.rotation.z = -Math.PI / 3;
        rightArm.castShadow = true;
        group.add(rightArm);
        
        // Stick fingers (3 per hand)
        const fingerGeometry = getGeometry('cylinder', 0.05, 0.04, 0.6, 6);
        [[-2.7, 3.8], [2.7, 3.8]].forEach(([x, y], armIndex) => {
            for (let i = 0; i < 3; i++) {
                const finger = new THREE.Mesh(fingerGeometry, stickMaterial);
                const angleOffset = (i - 1) * 0.3;
                finger.position.set(
                    x + Math.sin(angleOffset) * 0.2,
                    y + Math.cos(angleOffset) * 0.2,
                    0
                );
                finger.rotation.z = armIndex === 0 ? 
                    (Math.PI / 3 + angleOffset) : 
                    (-Math.PI / 3 + angleOffset);
                finger.castShadow = true;
                group.add(finger);
            }
        });
        
        // Icy highlights/frost patches
        const frostMaterial = getMaterial('lambert', { 
            color: iceBlue, 
            transparent: true, 
            opacity: 0.4 
        });
        const frostGeometry = getGeometry('sphere', 0.3, 12, 12);
        [
            [0.8, 4.5, 1.4],
            [-0.9, 3.2, 1.6],
            [0.5, 6.3, 1.0],
            [-0.6, 2.5, 1.7]
        ].forEach(([x, y, z]) => {
            const frost = new THREE.Mesh(frostGeometry, frostMaterial);
            frost.position.set(x, y, z);
            frost.scale.set(1.2, 0.8, 0.6);
            group.add(frost);
        });
        
        return group;
    }
    
    // Register with entity registry
    ENTITY_REGISTRY.register('giant-christmas', createGiantChristmas);
    
})();
