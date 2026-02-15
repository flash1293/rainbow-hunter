// entity-guardian-christmas.js - Nutcracker Soldier
// Christmas-themed variant of guardian

(function() {
    'use strict';
    
    function createGuardianChristmas(config = {}) {
        const group = new THREE.Group();
        const nutcrackerRed = 0xb22222;
        const nutcrackerGold = 0xffd700;
        const nutcrackerBlack = 0x111111;
        const nutcrackerWhite = 0xffffff;
        
        // Body - nutcracker soldier uniform
        const bodyGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: nutcrackerRed });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Gold buttons on uniform
        for (let i = 0; i < 3; i++) {
            const button = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16),
                new THREE.MeshLambertMaterial({ color: nutcrackerGold })
            );
            button.rotation.x = Math.PI / 2;
            button.position.set(0, 1.3 - i * 0.3, 0.28);
            button.castShadow = true;
            group.add(button);
        }
        
        // Head - wooden/painted look
        const headGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.6, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffc0a0 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.9;
        head.castShadow = true;
        group.add(head);
        
        // Black eyes - nutcracker style
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: nutcrackerBlack });
        const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.95, 0.38);
            group.add(eye);
        });
        
        // Tall nutcracker hat - black with gold trim
        const hatBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16),
            new THREE.MeshLambertMaterial({ color: nutcrackerBlack })
        );
        hatBase.position.y = 2.3;
        hatBase.castShadow = true;
        group.add(hatBase);
        
        const hatTop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.38, 0.8, 16),
            new THREE.MeshLambertMaterial({ color: nutcrackerBlack })
        );
        hatTop.position.y = 2.75;
        hatTop.castShadow = true;
        group.add(hatTop);
        
        // Gold hat trim
        const hatTrim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.39, 0.39, 0.1, 16),
            new THREE.MeshLambertMaterial({ color: nutcrackerGold })
        );
        hatTrim.position.y = 2.38;
        hatTrim.castShadow = true;
        group.add(hatTrim);
        
        // White beard/mustache
        const beard = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.25, 0.2),
            new THREE.MeshLambertMaterial({ color: nutcrackerWhite })
        );
        beard.position.set(0, 1.75, 0.35);
        beard.castShadow = true;
        group.add(beard);
        
        // Red scarf around neck
        const scarf = new THREE.Mesh(
            new THREE.TorusGeometry(0.5, 0.12, 8, 12, Math.PI),
            new THREE.MeshLambertMaterial({ color: 0xff0000 })
        );
        scarf.rotation.x = Math.PI / 2;
        scarf.position.y = 1.5;
        scarf.castShadow = true;
        group.add(scarf);
        
        // Snowy shoulder pads (snow accumulated on shoulders)
        [-0.45, 0.45].forEach(x => {
            const snow = new THREE.Mesh(
                new THREE.SphereGeometry(0.18, 12, 12),
                new THREE.MeshLambertMaterial({ color: nutcrackerWhite })
            );
            snow.position.set(x, 1.55, 0);
            snow.scale.y = 0.5;
            snow.castShadow = true;
            group.add(snow);
        });
        
        return group;
    }
    
    // Register with entity registry
    ENTITY_REGISTRY.register('guardian-christmas', createGuardianChristmas);
    
})();
