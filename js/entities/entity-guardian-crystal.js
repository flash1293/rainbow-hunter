// entity-guardian-crystal.js - Crystal Sentinel (Kristallwächter)
// Crystal-themed variant of guardian - guards made of purple crystal

(function() {
    'use strict';
    
    function createGuardianCrystal(config = {}) {
        const group = new THREE.Group();
        const crystalPurple = 0x8844ff;
        const crystalPink = 0xff44aa;
        const crystalGlow = 0xaa88ff;
        const crystalDark = 0x5522aa;
        
        // Body - faceted crystal torso
        const bodyGeometry = getGeometry('octahedron', 0.55, 0);
        const bodyMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            transparent: true,
            opacity: 0.85
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.0;
        body.scale.set(0.9, 1.2, 0.7);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Inner crystal core glow
        const coreGeometry = getGeometry('octahedron', 0.3, 0);
        const coreMaterial = getMaterial('basic', { 
            color: crystalGlow,
            transparent: true,
            opacity: 0.6
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        core.position.y = 1.0;
        group.add(core);
        
        // Head - angular crystal shape
        const headGeometry = getGeometry('octahedron', 0.4, 0);
        const headMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            transparent: true,
            opacity: 0.85
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.85;
        head.rotation.y = Math.PI / 4;
        head.castShadow = true;
        group.add(head);
        
        // Glowing eyes - embedded gems
        const eyeMaterial = getMaterial('basic', { color: 0x00ffff });
        const eyeGeometry = getGeometry('octahedron', 0.1, 0);
        [-0.15, 0.15].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 1.85, 0.32);
            eye.rotation.y = Math.PI / 4;
            group.add(eye);
        });
        
        // Crystal spikes on head (like a crown)
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const spike = new THREE.Mesh(
                getGeometry('cone', 0.08, 0.35, 4),
                getMaterial('lambert', { 
                    color: crystalPink,
                    transparent: true,
                    opacity: 0.8
                })
            );
            spike.position.set(
                Math.cos(angle) * 0.28,
                2.15,
                Math.sin(angle) * 0.28
            );
            spike.rotation.x = Math.cos(angle) * 0.3;
            spike.rotation.z = -Math.sin(angle) * 0.3;
            spike.castShadow = true;
            group.add(spike);
        }
        
        // Crystal shoulder formations
        [-0.55, 0.55].forEach(x => {
            const shoulder = new THREE.Mesh(
                getGeometry('octahedron', 0.2, 0),
                getMaterial('lambert', { 
                    color: crystalDark,
                    transparent: true,
                    opacity: 0.85
                })
            );
            shoulder.position.set(x, 1.4, 0);
            shoulder.rotation.z = x > 0 ? -0.5 : 0.5;
            shoulder.castShadow = true;
            group.add(shoulder);
            
            // Small crystal cluster on shoulders
            const cluster = new THREE.Mesh(
                getGeometry('cone', 0.1, 0.25, 4),
                getMaterial('lambert', { 
                    color: crystalGlow,
                    transparent: true,
                    opacity: 0.7
                })
            );
            cluster.position.set(x * 1.1, 1.55, 0);
            cluster.rotation.z = x > 0 ? -0.8 : 0.8;
            cluster.castShadow = true;
            group.add(cluster);
        });
        
        // Floating crystal shards around body
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const shard = new THREE.Mesh(
                getGeometry('cone', 0.06, 0.2, 4),
                getMaterial('basic', { 
                    color: crystalGlow,
                    transparent: true,
                    opacity: 0.5
                })
            );
            shard.position.set(
                Math.cos(angle) * 0.7,
                1.0 + (i % 2) * 0.3,
                Math.sin(angle) * 0.7
            );
            shard.rotation.z = Math.PI;
            shard.castShadow = true;
            group.add(shard);
        }
        
        return group;
    }
    
    // Register with entity registry
    ENTITY_REGISTRY.register('guardian-crystal', createGuardianCrystal);
    
})();
