/**
 * Oven Entity - Candy theme spawner for gingerbread enemies
 * Creates ovens that spawn gingerbread goblins in the candy level
 */
(function() {
    'use strict';

    function createOvenEntity(x, z) {
        const ovenGroup = new THREE.Group();
        
        // Main oven body (brick red with candy accents)
        const ovenBodyGeometry = getGeometry('box', 3, 3, 2.5);
        const ovenBodyMaterial = getMaterial('lambert', { color: 0x8B4513 });
        const ovenBody = new THREE.Mesh(ovenBodyGeometry, ovenBodyMaterial);
        ovenBody.position.y = 1.5;
        ovenBody.castShadow = true;
        ovenGroup.add(ovenBody);
        
        // Oven door (black with golden trim)
        const doorGeometry = getGeometry('box', 1.5, 1.2, 0.2);
        const doorMaterial = getMaterial('lambert', { color: 0x1a1a1a });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.2, 1.35);
        ovenGroup.add(door);
        
        // Door window (orange glow)
        const windowGeometry = getGeometry('box', 0.8, 0.6, 0.1);
        const windowMaterial = getMaterial('basic', { 
            color: 0xFF6600,
            transparent: true,
            opacity: 0.8
        });
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(0, 1.3, 1.45);
        ovenGroup.add(windowMesh);
        
        // Door handle (gold)
        const handleGeometry = getGeometry('cylinder', 0.08, 0.08, 0.4, 8);
        const handleMaterial = getMaterial('lambert', { color: 0xDAA520 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0.5, 1.0, 1.5);
        handle.rotation.z = Math.PI / 2;
        ovenGroup.add(handle);
        
        // Chimney
        const chimneyGeometry = getGeometry('cylinder', 0.4, 0.5, 2, 8);
        const chimneyMaterial = getMaterial('lambert', { color: 0x654321 });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(0, 4, -0.5);
        ovenGroup.add(chimney);
        
        // Chimney top rim
        const rimGeometry = getGeometry('torus', 0.5, 0.1, 8, 12);
        const rim = new THREE.Mesh(rimGeometry, chimneyMaterial);
        rim.position.set(0, 5, -0.5);
        rim.rotation.x = Math.PI / 2;
        ovenGroup.add(rim);
        
        // Decorative icing trim on oven
        const icingMaterial = getMaterial('basic', { color: 0xFFFFFF });
        const topTrimGeometry = getGeometry('box', 3.2, 0.15, 2.7);
        const topTrim = new THREE.Mesh(topTrimGeometry, icingMaterial);
        topTrim.position.y = 3.05;
        ovenGroup.add(topTrim);
        
        // Fire glow (emissive mesh instead of PointLight for perf)
        const fireGlowGeometry = getGeometry('sphere', 0.5, 8, 8);
        const fireGlowMaterial = getMaterial('basic', { color: 0xFF4500, transparent: true, opacity: 0.4 });
        const fireGlowMesh = new THREE.Mesh(fireGlowGeometry, fireGlowMaterial);
        fireGlowMesh.position.set(0, 1.2, 1);
        ovenGroup.add(fireGlowMesh);
        
        const terrainH = getTerrainHeight(x, z);
        ovenGroup.position.set(x, terrainH, z);
        G.scene.add(ovenGroup);
        
        return {
            mesh: ovenGroup,
            x: x,
            z: z,
            fireLight: fireGlowMesh,
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
