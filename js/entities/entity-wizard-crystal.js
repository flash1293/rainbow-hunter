// entity-wizard-crystal.js - Gem Mage (Edelsteinmagier)
// Crystal-themed variant of wizard - sorcerers who channel crystal magic

(function() {
    'use strict';
    
    function createWizardCrystal(config = {}) {
        const group = new THREE.Group();
        const crystalPink = 0xff44aa;
        const crystalPurple = 0xaa44ff;
        const crystalGlow = 0xff88cc;
        const crystalDark = 0x8822aa;
        
        // Crystal robe body - faceted like a gem
        const bodyGeometry = getGeometry('cylinder', 0.5, 0.9, 2.5, 6);
        const bodyMaterial = getMaterial('lambert', { 
            color: crystalPink,
            transparent: true,
            opacity: 0.85
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // Inner robe glow
        const innerGlowGeometry = getGeometry('cylinder', 0.35, 0.7, 2.3, 6);
        const innerGlowMaterial = getMaterial('basic', { 
            color: crystalGlow,
            transparent: true,
            opacity: 0.4
        });
        const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
        innerGlow.position.y = 1.5;
        group.add(innerGlow);
        
        // Crystal collar/trim
        const collarGeometry = getGeometry('torus', 0.55, 0.12, 6, 6);
        const collarMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            transparent: true,
            opacity: 0.9
        });
        const collar = new THREE.Mesh(collarGeometry, collarMaterial);
        collar.rotation.x = Math.PI / 2;
        collar.position.y = 2.7;
        collar.castShadow = true;
        group.add(collar);
        
        // Head - octahedron for crystal feel
        const headGeometry = getGeometry('octahedron', 0.55, 0);
        const headMaterial = getMaterial('lambert', { 
            color: 0xffccee,
            transparent: true,
            opacity: 0.9
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 3.2;
        head.scale.set(1.0, 0.85, 0.9);
        head.rotation.y = Math.PI / 4;
        head.castShadow = true;
        group.add(head);
        
        // Crystal wizard hat - pointed cone with facets
        const hatGeometry = getGeometry('cone', 0.65, 1.6, 6);
        const hatMaterial = getMaterial('lambert', { 
            color: crystalDark,
            transparent: true,
            opacity: 0.85
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 4.3;
        hat.castShadow = true;
        group.add(hat);
        
        // Hat inner glow
        const hatGlowGeometry = getGeometry('cone', 0.45, 1.4, 6);
        const hatGlowMaterial = getMaterial('basic', { 
            color: crystalPink,
            transparent: true,
            opacity: 0.3
        });
        const hatGlow = new THREE.Mesh(hatGlowGeometry, hatGlowMaterial);
        hatGlow.position.y = 4.3;
        group.add(hatGlow);
        
        // Crystal brim - hexagonal
        const brimGeometry = getGeometry('torus', 0.7, 0.12, 6, 6);
        const brimMaterial = getMaterial('lambert', { 
            color: crystalPink,
            transparent: true,
            opacity: 0.85
        });
        const brim = new THREE.Mesh(brimGeometry, brimMaterial);
        brim.rotation.x = Math.PI / 2;
        brim.position.y = 3.6;
        brim.castShadow = true;
        group.add(brim);
        
        // Crystal spikes on hat tip
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const spike = new THREE.Mesh(
                getGeometry('cone', 0.08, 0.35, 4),
                getMaterial('lambert', { 
                    color: crystalGlow,
                    transparent: true,
                    opacity: 0.8
                })
            );
            spike.position.set(
                Math.cos(angle) * 0.25,
                5.0,
                Math.sin(angle) * 0.25
            );
            spike.rotation.x = Math.cos(angle) * 0.4;
            spike.rotation.z = -Math.sin(angle) * 0.4;
            spike.castShadow = true;
            group.add(spike);
        }
        
        // Glowing gem eyes
        const eyeMaterial = getMaterial('basic', { color: 0x00ffff });
        const eyeGeometry = getGeometry('octahedron', 0.1, 0);
        [-0.2, 0.2].forEach(x => {
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye.position.set(x, 3.15, 0.45);
            eye.rotation.y = Math.PI / 4;
            group.add(eye);
        });
        
        // Crystal staff - faceted pillar
        const staffGeometry = getGeometry('cylinder', 0.06, 0.1, 3.0, 6);
        const staffMaterial = getMaterial('lambert', { 
            color: crystalPurple,
            transparent: true,
            opacity: 0.85
        });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.85, 1.5, 0.3);
        staff.rotation.z = -0.2;
        staff.castShadow = true;
        group.add(staff);
        
        // Large gem orb on staff
        const orbGeometry = getGeometry('octahedron', 0.3, 0);
        const orbMaterial = getMaterial('basic', { 
            color: crystalPink,
            transparent: true,
            opacity: 0.9
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.95, 3.3, 0.35);
        orb.rotation.y = Math.PI / 6;
        orb.castShadow = true;
        group.add(orb);
        
        // Outer orb glow
        const orbGlowGeometry = getGeometry('sphere', 0.38, 8, 8);
        const orbGlowMaterial = getMaterial('basic', { 
            color: crystalGlow,
            transparent: true,
            opacity: 0.3
        });
        const orbGlow = new THREE.Mesh(orbGlowGeometry, orbGlowMaterial);
        orbGlow.position.set(0.95, 3.3, 0.35);
        group.add(orbGlow);
        
        // Floating crystal shards around wizard
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const shard = new THREE.Mesh(
                getGeometry('cone', 0.06, 0.22, 4),
                getMaterial('basic', { 
                    color: i % 2 === 0 ? crystalPink : crystalPurple,
                    transparent: true,
                    opacity: 0.6
                })
            );
            shard.position.set(
                Math.cos(angle) * 0.9,
                1.8 + (i % 3) * 0.4,
                Math.sin(angle) * 0.9
            );
            shard.rotation.z = Math.PI;
            shard.castShadow = true;
            group.add(shard);
        }
        
        // Gem embedded in robe
        const robeGem = new THREE.Mesh(
            getGeometry('octahedron', 0.15, 0),
            getMaterial('basic', { color: 0x00ffaa })
        );
        robeGem.position.set(0, 2.0, 0.85);
        robeGem.rotation.y = Math.PI / 4;
        robeGem.castShadow = true;
        group.add(robeGem);
        
        return group;
    }
    
    // Register with entity registry
    ENTITY_REGISTRY.register('wizard-crystal', createWizardCrystal);
    
})();
