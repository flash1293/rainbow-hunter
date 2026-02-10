// entity-mummy.js - Mummy enemy (desert theme only)
// No theme variants - appears only in desert level

(function() {
    'use strict';
    
    /**
     * Create a mummy enemy - desert enemy that casts tornados
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} patrolLeft - Left patrol boundary
     * @param {number} patrolRight - Right patrol boundary
     * @param {number} speed - Movement speed (default: 0.008)
     * @returns {object} Mummy entity object
     */
    function createMummy(x, z, patrolLeft, patrolRight, speed = 0.008) {
        const textures = getTerrainTextures(THREE);
        const mummyGrp = new THREE.Group();
        
        // Wrapped body
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 2.2, 12);
        const bandageMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xd4c4a0,  // Aged bandage color
            map: textures.goblinSkin
        });
        const body = new THREE.Mesh(bodyGeometry, bandageMaterial);
        body.position.y = 1.3;
        body.castShadow = true;
        mummyGrp.add(body);
        
        // Bandage strips wrapping around body
        for (let i = 0; i < 6; i++) {
            const stripGeometry = new THREE.TorusGeometry(0.55, 0.05, 4, 16);
            const stripMaterial = new THREE.MeshLambertMaterial({ color: 0xc4b490 });
            const strip = new THREE.Mesh(stripGeometry, stripMaterial);
            strip.rotation.x = Math.PI / 2;
            strip.rotation.z = (i * 0.3);
            strip.position.y = 0.5 + i * 0.35;
            mummyGrp.add(strip);
        }
        
        // Head wrapped in bandages
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd4c4a0 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.7;
        head.castShadow = true;
        mummyGrp.add(head);
        
        // Glowing eyes peeking through bandages
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF88,  // Eerie green glow
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e1.position.set(-0.18, 2.75, 0.42);
        mummyGrp.add(e1);
        
        const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
        e2.position.set(0.18, 2.75, 0.42);
        mummyGrp.add(e2);
        
        // Tattered bandage arm pieces
        const armGeometry = new THREE.CylinderGeometry(0.12, 0.15, 1.2, 8);
        const arm1 = new THREE.Mesh(armGeometry, bandageMaterial);
        arm1.position.set(-0.65, 1.5, 0);
        arm1.rotation.z = 0.3;
        arm1.castShadow = true;
        mummyGrp.add(arm1);
        
        const arm2 = new THREE.Mesh(armGeometry, bandageMaterial);
        arm2.position.set(0.65, 1.5, 0);
        arm2.rotation.z = -0.3;
        arm2.castShadow = true;
        mummyGrp.add(arm2);
        
        // Floating sand particles around mummy
        const sandGroup = new THREE.Group();
        for (let i = 0; i < 8; i++) {
            const sandGeometry = new THREE.SphereGeometry(0.05, 4, 4);
            const sandMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xc4a14a,
                transparent: true,
                opacity: 0.6
            });
            const sand = new THREE.Mesh(sandGeometry, sandMaterial);
            const angle = (i / 8) * Math.PI * 2;
            sand.position.set(Math.cos(angle) * 0.8, 1.5 + Math.random(), Math.sin(angle) * 0.8);
            sandGroup.add(sand);
        }
        mummyGrp.add(sandGroup);
        mummyGrp.sandParticles = sandGroup;
        
        mummyGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(mummyGrp);
        
        const health = 6;
        
        return {
            mesh: mummyGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 1.9,
            health: health,
            maxHealth: health,
            isMummy: true,
            lastFireTime: Date.now() - Math.random() * 4000,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight,
            sandPhase: Math.random() * Math.PI * 2
        };
    }
    
    // ========================================
    // REGISTER WITH ENTITY REGISTRY
    // ========================================
    
    ENTITY_REGISTRY.register('mummy', {
        create: createMummy
    });
    
    // Export globally for backward compatibility
    window.createMummy = createMummy;
    
})();
