// Goblin entities and AI
import { GAME_CONFIG } from './config.js';
import { getTerrainTextures } from './terrain.js';

export function createGoblinGeometry(THREE) {
    const textures = getTerrainTextures(THREE);
    return {
        body: new THREE.BoxGeometry(0.6, 0.8, 0.4),
        bodyMaterial: new THREE.MeshLambertMaterial({ map: textures.goblinArmor }),
        head: new THREE.SphereGeometry(0.4, 16, 16),
        headMaterial: new THREE.MeshLambertMaterial({ map: textures.goblinSkin }),
        eye: new THREE.SphereGeometry(0.08, 8, 8),
        eyeMaterial: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
        ear: new THREE.ConeGeometry(0.15, 0.4, 4),
        earMaterial: new THREE.MeshLambertMaterial({ map: textures.goblinSkin })
    };
}

export function createGoblin(x, z, patrolLeft, patrolRight, speed, THREE, scene, getTerrainHeight, geometry, speedMultiplier) {
    const goblinGrp = new THREE.Group();
    
    const body = new THREE.Mesh(geometry.body, geometry.bodyMaterial);
    body.position.y = 0.8;
    body.castShadow = true;
    goblinGrp.add(body);
    
    const head = new THREE.Mesh(geometry.head, geometry.headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    goblinGrp.add(head);
    
    const e1 = new THREE.Mesh(geometry.eye, geometry.eyeMaterial);
    e1.position.set(-0.15, 1.5, 0.35);
    goblinGrp.add(e1);
    
    const e2 = new THREE.Mesh(geometry.eye, geometry.eyeMaterial);
    e2.position.set(0.15, 1.5, 0.35);
    goblinGrp.add(e2);
    
    const er1 = new THREE.Mesh(geometry.ear, geometry.earMaterial);
    er1.rotation.z = Math.PI / 2;
    er1.position.set(-0.5, 1.5, 0);
    er1.castShadow = true;
    goblinGrp.add(er1);
    
    const er2 = new THREE.Mesh(geometry.ear, geometry.earMaterial);
    er2.rotation.z = -Math.PI / 2;
    er2.position.set(0.5, 1.5, 0);
    er2.castShadow = true;
    goblinGrp.add(er2);
    
    goblinGrp.position.set(x, getTerrainHeight(x, z), z);
    scene.add(goblinGrp);
    
    const health = Math.random() < 0.4 ? 3 : 1;
    
    return {
        mesh: goblinGrp,
        speed: speed * speedMultiplier,
        direction: 1,
        patrolLeft: patrolLeft,
        patrolRight: patrolRight,
        alive: true,
        radius: 1.5,
        health: health,
        maxHealth: health,
        isChasing: false
    };
}

export function createGuardianGoblin(x, z, patrolLeft, patrolRight, speed, THREE, scene, getTerrainHeight, speedMultiplier) {
    const textures = getTerrainTextures(THREE);
    const goblinGrp = new THREE.Group();
    
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.0, 0.5);
    const bodyMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinArmor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.0;
    body.castShadow = true;
    goblinGrp.add(body);
    
    const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    goblinGrp.add(head);
    
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const e1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    e1.position.set(-0.18, 1.8, 0.42);
    goblinGrp.add(e1);
    
    const e2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
    e2.position.set(0.18, 1.8, 0.42);
    goblinGrp.add(e2);
    
    const earGeometry = new THREE.ConeGeometry(0.18, 0.5, 4);
    const earMaterial = new THREE.MeshLambertMaterial({ map: textures.goblinSkin });
    const er1 = new THREE.Mesh(earGeometry, earMaterial);
    er1.rotation.z = Math.PI / 2;
    er1.position.set(-0.6, 1.8, 0);
    er1.castShadow = true;
    goblinGrp.add(er1);
    
    const er2 = new THREE.Mesh(earGeometry, earMaterial);
    er2.rotation.z = -Math.PI / 2;
    er2.position.set(0.6, 1.8, 0);
    er2.castShadow = true;
    goblinGrp.add(er2);
    
    goblinGrp.position.set(x, getTerrainHeight(x, z), z);
    scene.add(goblinGrp);
    
    const health = 5;
    
    return {
        mesh: goblinGrp,
        speed: speed * speedMultiplier,
        direction: 1,
        patrolLeft: patrolLeft,
        patrolRight: patrolRight,
        alive: true,
        radius: 1.8,
        health: health,
        maxHealth: health,
        isGuardian: true,
        lastFireTime: Date.now() - Math.random() * 4000,
        isChasing: false
    };
}

export function updateGoblin(goblin, playerPosition, getTerrainHeight, traps, createExplosion, gameDead, stopBackgroundMusic, playDeathSound, gameWon) {
    if (!goblin.alive || gameWon) return;
    
    const distToPlayer = Math.sqrt(
        Math.pow(playerPosition.x - goblin.mesh.position.x, 2) + 
        Math.pow(playerPosition.z - goblin.mesh.position.z, 2)
    );
    
    if (distToPlayer < 30) {
        goblin.isChasing = true;
    }
    
    if (distToPlayer < 30 || goblin.isChasing) {
        const directionX = playerPosition.x - goblin.mesh.position.x;
        const directionZ = playerPosition.z - goblin.mesh.position.z;
        const length = Math.sqrt(directionX * directionX + directionZ * directionZ);
        
        if (length > 0) {
            goblin.mesh.position.x += (directionX / length) * goblin.speed;
            goblin.mesh.position.z += (directionZ / length) * goblin.speed;
            goblin.mesh.rotation.y = Math.atan2(directionX, directionZ);
        }
    } else {
        goblin.mesh.position.x += goblin.speed * goblin.direction;
        goblin.mesh.rotation.y = goblin.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        
        if (goblin.mesh.position.x <= goblin.patrolLeft) {
            goblin.direction = 1;
        } else if (goblin.mesh.position.x >= goblin.patrolRight) {
            goblin.direction = -1;
        }
    }
    
    const terrainHeight = getTerrainHeight(goblin.mesh.position.x, goblin.mesh.position.z);
    goblin.mesh.position.y = terrainHeight + 0.1;
    
    traps.forEach(trap => {
        const distToTrap = Math.sqrt(
            Math.pow(goblin.mesh.position.x - trap.mesh.position.x, 2) +
            Math.pow(goblin.mesh.position.z - trap.mesh.position.z, 2)
        );
        if (distToTrap < trap.radius) {
            goblin.alive = false;
            goblin.mesh.rotation.z = Math.PI / 2;
            goblin.mesh.position.y = terrainHeight + 0.5;
            createExplosion(goblin.mesh.position.x, goblin.mesh.position.y + 1, goblin.mesh.position.z);
        }
    });
    
    const dist = Math.sqrt(
        Math.pow(playerPosition.x - goblin.mesh.position.x, 2) +
        Math.pow(playerPosition.z - goblin.mesh.position.z, 2)
    );
    
    if (dist < 1.5) {
        return 'dead';
    }
    
    return 'alive';
}
