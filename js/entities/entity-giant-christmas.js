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
        const bodyBottomGeometry = new THREE.SphereGeometry(1.8, 16, 16);
        const snowMaterial = new THREE.MeshLambertMaterial({ color: snowWhite });
        const bodyBottom = new THREE.Mesh(bodyBottomGeometry, snowMaterial);
        bodyBottom.position.y = 2.0;
        bodyBottom.scale.set(1, 0.95, 1);
        bodyBottom.castShadow = true;
        bodyBottom.receiveShadow = true;
        group.add(bodyBottom);
        
        // Middle snowball
        const bodyMiddleGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const bodyMiddle = new THREE.Mesh(bodyMiddleGeometry, snowMaterial);
        bodyMiddle.position.y = 4.2;
        bodyMiddle.scale.set(1, 0.9, 1);
        bodyMiddle.castShadow = true;
        bodyMiddle.receiveShadow = true;
        group.add(bodyMiddle);
        
        // Coal buttons on body
        const buttonGeometry = new THREE.SphereGeometry(0.25, 12, 12);
        const coalMaterial = new THREE.MeshLambertMaterial({ color: coalBlack });
        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(buttonGeometry, coalMaterial);
            button.position.set(0, 3.5 + (i * 0.5), 1.5);
            button.castShadow = true;
            group.add(button);
        }
        
        // Head (top snowball)
        const headGeometry = new THREE.SphereGeometry(1.2, 16, 16);
        const head = new THREE.Mesh(headGeometry, snowMaterial);
        head.position.y = 6.0;
        head.castShadow = true;
        group.add(head);
        
        // Evil coal eyes (glowing red)
        const eyeGeometry = new THREE.SphereGeometry(0.2, 12, 12);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        [-0.4, 0.4].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 6.2, 1.1);
            group.add(eye);
            
            // Evil glow
            const glowGeometry = new THREE.SphereGeometry(0.25, 12, 12);
            const glowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xff0000, 
                transparent: true, 
                opacity: 0.3 
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.set(x, 6.2, 1.1);
            group.add(glow);
        });
        
        // Carrot nose
        const noseGeometry = new THREE.ConeGeometry(0.15, 0.8, 8);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: carrotOrange });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 5.9, 1.2);
        nose.rotation.x = Math.PI / 2;
        nose.castShadow = true;
        group.add(nose);
        
        // Evil grin made of coal pieces
        const mouthCoalGeometry = new THREE.SphereGeometry(0.12, 8, 8);
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
        const hatBaseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: hatBlack });
        const hatBase = new THREE.Mesh(hatBaseGeometry, hatMaterial);
        hatBase.position.y = 7.0;
        hatBase.castShadow = true;
        group.add(hatBase);
        
        const hatTopGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16);
        const hatTop = new THREE.Mesh(hatTopGeometry, hatMaterial);
        hatTop.position.y = 7.7;
        hatTop.castShadow = true;
        group.add(hatTop);
        
        // Red ribbon on hat
        const ribbonGeometry = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16);
        const ribbonMaterial = new THREE.MeshLambertMaterial({ color: hatRibbon });
        const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
        ribbon.position.y = 7.2;
        ribbon.castShadow = true;
        group.add(ribbon);
        
        // Red scarf around neck
        const scarfMaterial = new THREE.MeshLambertMaterial({ color: scarfRed });
        const scarfRingGeometry = new THREE.TorusGeometry(1.3, 0.2, 8, 16);
        const scarfRing = new THREE.Mesh(scarfRingGeometry, scarfMaterial);
        scarfRing.position.y = 5.2;
        scarfRing.rotation.x = Math.PI / 2;
        scarfRing.castShadow = true;
        group.add(scarfRing);
        
        // Scarf tails hanging down
        const scarfTailGeometry = new THREE.CylinderGeometry(0.18, 0.15, 1.5, 8);
        [-0.9, 0.9].forEach(x => {
            const tail = new THREE.Mesh(scarfTailGeometry, scarfMaterial);
            tail.position.set(x, 4.2, 0.8);
            tail.rotation.z = x < 0 ? 0.2 : -0.2;
            tail.castShadow = true;
            group.add(tail);
        });
        
        // Stick arms (frozen tree branches)
        const stickMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.12, 2.5, 8);
        
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
        const fingerGeometry = new THREE.CylinderGeometry(0.05, 0.04, 0.6, 6);
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
        const frostMaterial = new THREE.MeshLambertMaterial({ 
            color: iceBlue, 
            transparent: true, 
            opacity: 0.4 
        });
        const frostGeometry = new THREE.SphereGeometry(0.3, 12, 12);
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
