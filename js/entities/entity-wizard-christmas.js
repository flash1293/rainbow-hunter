// entity-wizard-christmas.js - Walking Evil Santa
// Christmas-themed variant of wizard - red coat, white beard, no sledge, walks on ground

(function() {
    'use strict';
    
    function createWizardChristmas(config = {}) {
        const group = new THREE.Group();
        
        // Red Santa coat
        const bodyGeometry = getGeometry('cylinder', 0.6, 1.0, 2.5, 12);
        const bodyMaterial = getMaterial('lambert', { color: 0xcc0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // White fur trim on coat
        const trimGeometry = getGeometry('cylinder', 1.02, 1.02, 0.3, 12);
        const trimMaterial = getMaterial('lambert', { color: 0xffffff });
        const trim = new THREE.Mesh(trimGeometry, trimMaterial);
        trim.position.y = 0.4;
        trim.castShadow = true;
        group.add(trim);
        
        // Belt
        const beltGeometry = getGeometry('cylinder', 1.01, 1.01, 0.25, 12);
        const beltMaterial = getMaterial('lambert', { color: 0x1a1a1a });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.y = 1.5;
        belt.castShadow = true;
        group.add(belt);
        
        // Gold belt buckle
        const buckleGeometry = getGeometry('box', 0.35, 0.35, 0.1);
        const buckleMaterial = getMaterial('lambert', { color: 0xffd700 });
        const buckle = new THREE.Mesh(buckleGeometry, buckleMaterial);
        buckle.position.set(0, 1.5, 1.05);
        buckle.castShadow = true;
        group.add(buckle);
        
        // Head with pale skin
        const headGeometry = getGeometry('sphere', 0.6, 16, 16);
        const headMaterial = getMaterial('lambert', { color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.0;
        head.castShadow = true;
        group.add(head);
        
        // White beard
        const beardGeometry = new THREE.SphereGeometry(0.55, 16, 12);
        beardGeometry.scale(1.0, 0.8, 0.9);
        const beardMaterial = getMaterial('lambert', { color: 0xffffff });
        const beard = new THREE.Mesh(beardGeometry, beardMaterial);
        beard.position.set(0, 2.7, 0.3);
        beard.castShadow = true;
        group.add(beard);
        
        // Red Santa hat
        const hatGeometry = getGeometry('cone', 0.7, 1.5, 8);
        const hatMaterial = getMaterial('lambert', { color: 0xcc0000 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 4.0;
        hat.castShadow = true;
        group.add(hat);
        
        // White fur trim on hat
        const hatTrimGeometry = getGeometry('torus', 0.72, 0.15, 8, 16);
        const hatTrim = new THREE.Mesh(hatTrimGeometry, trimMaterial);
        hatTrim.rotation.x = Math.PI / 2;
        hatTrim.position.y = 3.4;
        hatTrim.castShadow = true;
        group.add(hatTrim);
        
        // White pompom on hat
        const pompomGeometry = getGeometry('sphere', 0.2, 12, 12);
        const pompom = new THREE.Mesh(pompomGeometry, trimMaterial);
        pompom.position.y = 4.75;
        pompom.castShadow = true;
        group.add(pompom);
        
        // Dark evil eyes
        const eyeMaterial = getMaterial('basic', { color: 0xff0000 });
        const eyeGeometry = getGeometry('sphere', 0.12, 16, 16);
        [-0.22, 0.22].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 3.1, 0.52);
            group.add(eye);
        });
        
        // Candy cane staff instead of wizard staff
        const staffGeometry = getGeometry('cylinder', 0.08, 0.08, 3.0, 8);
        const staffMaterial = getMaterial('lambert', { color: 0xffffff });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.8, 1.5, 0.3);
        staff.rotation.z = -0.2;
        staff.castShadow = true;
        group.add(staff);
        
        // Red stripes on candy cane
        for (let i = 0; i < 6; i++) {
            const stripeGeometry = getGeometry('cylinder', 0.09, 0.09, 0.3, 8);
            const stripeMaterial = getMaterial('lambert', { color: 0xff0000 });
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.position.set(0.8, 0.5 + i * 0.5, 0.3);
            stripe.rotation.z = -0.2;
            stripe.castShadow = true;
            group.add(stripe);
        }
        
        // Curved top of candy cane
        const caneTopGeometry = getGeometry('torus', 0.3, 0.08, 8, 16, Math.PI);
        const caneTop = new THREE.Mesh(caneTopGeometry, staffMaterial);
        caneTop.rotation.z = Math.PI / 2 - 0.2;
        caneTop.position.set(0.85, 3.2, 0.3);
        caneTop.castShadow = true;
        group.add(caneTop);
        
        // Red glowing ornament orb
        const orbGeometry = getGeometry('sphere', 0.25, 12, 12);
        const orbMaterial = getMaterial('basic', { color: 0xff0000 });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.55, 3.2, 0.3);
        group.add(orb);
        
        return group;
    }
    
    // Register with entity registry
    ENTITY_REGISTRY.register('wizard-christmas', createWizardChristmas);
    
})();
