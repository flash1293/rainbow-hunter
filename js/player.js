// Player controls and movement
import { GAME_CONFIG } from './config.js';

export class Player {
    constructor(scene, THREE, getTerrainHeight) {
        this.scene = scene;
        this.THREE = THREE;
        this.getTerrainHeight = getTerrainHeight;
        
        this.rotation = 0;
        this.rotationSpeed = GAME_CONFIG.PLAYER_ROTATION_SPEED;
        this.speed = GAME_CONFIG.PLAYER_SPEED;
        
        this.keys = {};
        this.setupControls();
        this.createPlayerMesh();
    }
    
    createPlayerMesh() {
        this.group = new this.THREE.Group();
        
        // Bike frame
        const frameGeometry = new this.THREE.BoxGeometry(0.3, 0.8, 1.5);
        const frameMaterial = new this.THREE.MeshLambertMaterial({ color: 0xFF0000 });
        const frame = new this.THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 0.8;
        frame.castShadow = true;
        this.group.add(frame);
        
        // Wheels
        const wheelGeometry = new this.THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const wheelMaterial = new this.THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const frontWheel = new this.THREE.Mesh(wheelGeometry, wheelMaterial);
        frontWheel.rotation.z = Math.PI / 2;
        frontWheel.position.set(0, 0.3, 0.7);
        frontWheel.castShadow = true;
        this.group.add(frontWheel);
        
        const backWheel = new this.THREE.Mesh(wheelGeometry, wheelMaterial);
        backWheel.rotation.z = Math.PI / 2;
        backWheel.position.set(0, 0.3, -0.7);
        backWheel.castShadow = true;
        this.group.add(backWheel);
        
        // Rider
        const bodyGeometry = new this.THREE.BoxGeometry(0.5, 0.7, 0.3);
        const bodyMaterial = new this.THREE.MeshLambertMaterial({ color: 0x0000FF });
        const body = new this.THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 1.5, -0.2);
        body.castShadow = true;
        this.group.add(body);
        
        const headGeometry = new this.THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new this.THREE.MeshLambertMaterial({ color: 0xFFDBAC });
        const head = new this.THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 2.2, -0.2);
        head.castShadow = true;
        this.group.add(head);
        
        this.group.position.set(0, 0, 10);
        this.scene.add(this.group);
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update(checkCollisions) {
        const prevPos = this.group.position.clone();
        
        // Keyboard rotation with left/right arrows or A/D
        if (this.keys.ArrowLeft || this.keys.a || this.keys.A) {
            this.rotation += this.rotationSpeed;
        }
        if (this.keys.ArrowRight || this.keys.d || this.keys.D) {
            this.rotation -= this.rotationSpeed;
        }
        
        // Set player mesh rotation
        this.group.rotation.y = this.rotation;
        
        // Forward/backward movement based on rotation
        const isMoving = this.keys.ArrowUp || this.keys.ArrowDown || 
                        this.keys.w || this.keys.W || this.keys.s || this.keys.S;
        
        if (this.keys.ArrowUp || this.keys.w || this.keys.W) {
            this.group.position.x += Math.sin(this.rotation) * this.speed;
            this.group.position.z += Math.cos(this.rotation) * this.speed;
        }
        if (this.keys.ArrowDown || this.keys.s || this.keys.S) {
            this.group.position.x -= Math.sin(this.rotation) * this.speed;
            this.group.position.z -= Math.cos(this.rotation) * this.speed;
        }
        
        // Update height based on terrain
        const terrainHeight = this.getTerrainHeight(this.group.position.x, this.group.position.z);
        this.group.position.y = terrainHeight;
        
        // Check collisions and get isStuck status
        const isStuck = checkCollisions(prevPos);
        
        return { isMoving, isStuck };
    }
}
