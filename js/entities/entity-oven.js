/**
 * Oven Entity - Candy theme spawner for gingerbread enemies
 * Creates ovens that spawn gingerbread goblins in the candy level
 */
(function() {
    'use strict';

    function createOvenEntity(x, z) {
        const ovenGroup = new THREE.Group();
        
        // Main oven body (brick red with candy accents)
        const ovenBodyGeometry = new THREE.BoxGeometry(3, 3, 2.5);
        const ovenBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const ovenBody = new THREE.Mesh(ovenBodyGeometry, ovenBodyMaterial);
        ovenBody.position.y = 1.5;
        ovenBody.castShadow = true;
        ovenGroup.add(ovenBody);
        
        // Oven door (black with golden trim)
        const doorGeometry = new THREE.BoxGeometry(1.5, 1.2, 0.2);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.2, 1.35);
        ovenGroup.add(door);
        
        // Door window (orange glow)
        const windowGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.1);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF6600,
            transparent: true,
            opacity: 0.8
        });
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(0, 1.3, 1.45);
        ovenGroup.add(windowMesh);
        
        // Door handle (gold)
        const handleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0.5, 1.0, 1.5);
        handle.rotation.z = Math.PI / 2;
        ovenGroup.add(handle);
        
        // Chimney
        const chimneyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2, 8);
        const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(0, 4, -0.5);
        ovenGroup.add(chimney);
        
        // Chimney top rim
        const rimGeometry = new THREE.TorusGeometry(0.5, 0.1, 8, 12);
        const rim = new THREE.Mesh(rimGeometry, chimneyMaterial);
        rim.position.set(0, 5, -0.5);
        rim.rotation.x = Math.PI / 2;
        ovenGroup.add(rim);
        
        // Decorative icing trim on oven
        const icingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const topTrimGeometry = new THREE.BoxGeometry(3.2, 0.15, 2.7);
        const topTrim = new THREE.Mesh(topTrimGeometry, icingMaterial);
        topTrim.position.y = 3.05;
        ovenGroup.add(topTrim);
        
        // Fire glow light
        const fireLight = new THREE.PointLight(0xFF4500, 0.8, 8);
        fireLight.position.set(0, 1.2, 1);
        ovenGroup.add(fireLight);
        
        const terrainH = getTerrainHeight(x, z);
        ovenGroup.position.set(x, terrainH, z);
        G.scene.add(ovenGroup);
        
        return {
            mesh: ovenGroup,
            x: x,
            z: z,
            fireLight: fireLight,
            smokeParticles: [],
            lastSmokeTime: 0,
            lastSpawnTime: Date.now()
        };
    }

    // Register with entity registry
    ENTITY_REGISTRY.register('oven', {
        create: createOvenEntity
    });

    // Export for global access
    window.createOvenEntity = createOvenEntity;
})();
