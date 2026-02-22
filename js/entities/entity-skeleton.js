// entity-skeleton.js - Skeleton archer enemy (graveyard theme only)
// No theme variants - appears only in graveyard

(function() {
    'use strict';
    
    /**
     * Create a skeleton archer enemy (graveyard-only ranged enemy)
     * @param {number} x - X position
     * @param {number} z - Z position
     * @param {number} patrolLeft - Left patrol boundary  
     * @param {number} patrolRight - Right patrol boundary
     * @param {number} speed - Movement speed (default: 0.015)
     * @returns {object} Skeleton entity object
     */
    function createSkeleton(x, z, patrolLeft, patrolRight, speed = 0.015) {
        const skeletonGrp = new THREE.Group();
        
        const boneColor = 0xE8E8D0;
        const darkBone = 0xC8C8B0;
        
        // Use cached materials
        const boneMaterial = getMaterial('lambert', { color: boneColor });
        const darkBoneMaterial = getMaterial('lambert', { color: darkBone });
        const socketMaterial = getMaterial('basic', { color: 0x1a0a0a });
        const eyeGlowMaterial = getMaterial('basic', { color: 0x44FF44, transparent: true, opacity: 0.9 });
        const ribcageMaterial = getMaterial('lambert', { color: boneColor, side: THREE.DoubleSide });
        const bowMaterial = getMaterial('lambert', { color: 0x4a3728 });
        const stringMaterial = getMaterial('basic', { color: 0xccccaa });
        const quiverMaterial = getMaterial('lambert', { color: 0x3a2a1a });
        const arrowMaterial = getMaterial('basic', { color: 0x5a4a3a });
        
        // Skull
        const skullGeometry = getGeometry('sphere', 0.35, 12, 12);
        const skull = new THREE.Mesh(skullGeometry, boneMaterial);
        skull.position.y = 1.9;
        skull.scale.y = 0.9;
        skull.castShadow = true;
        skeletonGrp.add(skull);
        
        // Jaw
        const jawGeometry = getGeometry('box', 0.25, 0.1, 0.2);
        const jaw = new THREE.Mesh(jawGeometry, boneMaterial);
        jaw.position.set(0, 1.68, 0.1);
        skeletonGrp.add(jaw);
        
        // Eye sockets (dark holes)
        const socketGeometry = getGeometry('sphere', 0.08, 8, 8);
        const socket1 = new THREE.Mesh(socketGeometry, socketMaterial);
        socket1.position.set(-0.1, 1.92, 0.28);
        skeletonGrp.add(socket1);
        
        const socket2 = new THREE.Mesh(socketGeometry, socketMaterial);
        socket2.position.set(0.1, 1.92, 0.28);
        skeletonGrp.add(socket2);
        
        // Glowing eyes inside sockets
        const eyeGlowGeometry = getGeometry('sphere', 0.04, 8, 8);
        const eyeGlow1 = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        eyeGlow1.position.set(-0.1, 1.92, 0.3);
        skeletonGrp.add(eyeGlow1);
        
        const eyeGlow2 = new THREE.Mesh(eyeGlowGeometry, eyeGlowMaterial);
        eyeGlow2.position.set(0.1, 1.92, 0.3);
        skeletonGrp.add(eyeGlow2);
        
        // Ribcage
        const ribcageGeometry = getGeometry('cylinder', 0.25, 0.2, 0.6, 8, 1, true);
        const ribcage = new THREE.Mesh(ribcageGeometry, ribcageMaterial);
        ribcage.position.y = 1.3;
        ribcage.castShadow = true;
        skeletonGrp.add(ribcage);
        
        // Spine
        const spineGeometry = getGeometry('cylinder', 0.05, 0.05, 0.9, 6);
        const spine = new THREE.Mesh(spineGeometry, boneMaterial);
        spine.position.set(0, 1.1, -0.1);
        skeletonGrp.add(spine);
        
        // Pelvis
        const pelvisGeometry = getGeometry('box', 0.35, 0.15, 0.2);
        const pelvis = new THREE.Mesh(pelvisGeometry, boneMaterial);
        pelvis.position.y = 0.7;
        skeletonGrp.add(pelvis);
        
        // Arms (bones)
        const armBoneGeometry = getGeometry('cylinder', 0.04, 0.03, 0.5, 6);
        
        // Left upper arm
        const leftUpperArm = new THREE.Mesh(armBoneGeometry, darkBoneMaterial);
        leftUpperArm.position.set(-0.35, 1.35, 0);
        leftUpperArm.rotation.z = 0.3;
        skeletonGrp.add(leftUpperArm);
        
        // Left forearm
        const leftForearm = new THREE.Mesh(armBoneGeometry, darkBoneMaterial);
        leftForearm.position.set(-0.5, 1.0, 0.15);
        leftForearm.rotation.z = 0.6;
        leftForearm.rotation.x = -0.4;
        skeletonGrp.add(leftForearm);
        
        // Right upper arm
        const rightUpperArm = new THREE.Mesh(armBoneGeometry, darkBoneMaterial);
        rightUpperArm.position.set(0.35, 1.35, 0);
        rightUpperArm.rotation.z = -0.5;
        skeletonGrp.add(rightUpperArm);
        
        // Right forearm (holding bow)
        const rightForearm = new THREE.Mesh(armBoneGeometry, darkBoneMaterial);
        rightForearm.position.set(0.55, 1.05, 0.2);
        rightForearm.rotation.z = -0.8;
        rightForearm.rotation.x = -0.3;
        skeletonGrp.add(rightForearm);
        
        // Legs
        const legBoneGeometry = getGeometry('cylinder', 0.05, 0.04, 0.65, 6);
        
        const leftThigh = new THREE.Mesh(legBoneGeometry, boneMaterial);
        leftThigh.position.set(-0.12, 0.35, 0);
        skeletonGrp.add(leftThigh);
        
        const leftShin = new THREE.Mesh(legBoneGeometry, boneMaterial);
        leftShin.position.set(-0.12, -0.25, 0.05);
        skeletonGrp.add(leftShin);
        
        const rightThigh = new THREE.Mesh(legBoneGeometry, boneMaterial);
        rightThigh.position.set(0.12, 0.35, 0);
        skeletonGrp.add(rightThigh);
        
        const rightShin = new THREE.Mesh(legBoneGeometry, boneMaterial);
        rightShin.position.set(0.12, -0.25, 0.05);
        skeletonGrp.add(rightShin);
        
        // Bow
        const bowGeometry = getGeometry('torus', 0.35, 0.025, 8, 16, Math.PI);
        const bow = new THREE.Mesh(bowGeometry, bowMaterial);
        bow.position.set(0.65, 1.2, 0.3);
        bow.rotation.y = Math.PI / 2;
        bow.rotation.x = Math.PI / 2;
        skeletonGrp.add(bow);
        
        // Bowstring
        const stringGeometry = getGeometry('cylinder', 0.008, 0.008, 0.7, 4);
        const bowstring = new THREE.Mesh(stringGeometry, stringMaterial);
        bowstring.position.set(0.65, 1.2, 0.3);
        bowstring.rotation.x = Math.PI / 2;
        skeletonGrp.add(bowstring);
        
        // Quiver on back
        const quiverGeometry = getGeometry('cylinder', 0.08, 0.06, 0.5, 8);
        const quiver = new THREE.Mesh(quiverGeometry, quiverMaterial);
        quiver.position.set(0.1, 1.25, -0.25);
        quiver.rotation.x = 0.2;
        skeletonGrp.add(quiver);
        
        // Arrows in quiver
        const arrowGeometry = getGeometry('cylinder', 0.01, 0.01, 0.4, 4);
        for (let i = 0; i < 3; i++) {
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.position.set(0.08 + i * 0.04, 1.45, -0.25);
            skeletonGrp.add(arrow);
        }
        
        skeletonGrp.position.set(x, getTerrainHeight(x, z), z);
        G.scene.add(skeletonGrp);
        
        const health = 3;
        
        return {
            mesh: skeletonGrp,
            speed: speed * speedMultiplier,
            direction: 1,
            patrolLeft: patrolLeft,
            patrolRight: patrolRight,
            alive: true,
            radius: 1.2,
            health: health,
            maxHealth: health,
            isSkeleton: true,
            lastFireTime: Date.now() - Math.random() * 3000,
            isChasing: false,
            initialX: x,
            initialZ: z,
            initialPatrolLeft: patrolLeft,
            initialPatrolRight: patrolRight
        };
    }
    
    // ========================================
    // REGISTER WITH ENTITY REGISTRY
    // ========================================
    
    ENTITY_REGISTRY.register('skeleton', {
        create: createSkeleton
    });
    
    // Export globally for backward compatibility
    window.createSkeleton = createSkeleton;
    
})();
