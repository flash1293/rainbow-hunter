// Game configuration and constants
// 
// ARCHITECTURE:
// - GAME_CONFIG: Global game settings (this file)
// - LEVELS: Populated by level registration files (js/levels/level-*.js)
// - Themes: Visual configurations (js/themes/theme-*.js)
// - Registries: Level/Theme/Entity management (js/registries/*.js)
//
// To add a new level:
// 1. Create js/levels/level-N-name.js
// 2. Call LEVEL_REGISTRY.register(N, { ...config })
// 3. Optionally create a new theme in js/themes/theme-name.js
//
// The LEVELS object is now a proxy to LEVEL_REGISTRY for backward compatibility.

const GAME_CONFIG = {
    // Player settings
    PLAYER_SPEED: 0.15,
    PLAYER_ROTATION_SPEED: 0.05,
    PLAYER_RADIUS: 0.8,
    
    // Camera settings
    CAMERA_FOV: 75,
    CAMERA_NEAR: 0.1,
    CAMERA_FAR: 2000,
    CAMERA_Y: 15,
    CAMERA_Z: 20,
    
    // Ammo settings
    MAX_AMMO: 100,
    STARTING_AMMO: 10,
    BULLET_SPEED: 0.5,
    BULLET_RADIUS: 0.2,
    
    // Materials needed for bridge repair
    MATERIALS_NEEDED: 3,
    
    // Goblin settings
    GOBLIN_DETECTION_RANGE: 25,
    GOBLIN_PROXIMITY_SOUND_RANGE: 20,
    
    // Guardian settings
    GUARDIAN_FIRE_INTERVAL_MIN: 4000,
    GUARDIAN_FIRE_INTERVAL_MAX: 6000,
    GUARDIAN_RANGE: 25,
    
    // Wizard settings
    WIZARD_FIRE_INTERVAL_MIN: 3000,
    WIZARD_FIRE_INTERVAL_MAX: 5000,
    WIZARD_RANGE: 30,
    
    // Mummy settings
    MUMMY_FIRE_INTERVAL_MIN: 2000,
    MUMMY_FIRE_INTERVAL_MAX: 3500,
    MUMMY_RANGE: 28,

    // Lava Monster settings
    LAVA_MONSTER_FIRE_INTERVAL_MIN: 2500,
    LAVA_MONSTER_FIRE_INTERVAL_MAX: 4000,
    LAVA_MONSTER_RANGE: 35,
    LAVA_MONSTER_TRAIL_INTERVAL: 800,
    LAVA_TRAIL_DURATION: 8000,
    LAVA_TRAIL_RADIUS: 1.5,

    // Herz-Man turret settings
    HERZMAN_FIRE_INTERVAL: 1500,      // Time between shots (ms)
    HERZMAN_RANGE: 20,                 // Detection range
    HERZMAN_HEART_SPEED: 0.3,         // Heart bomb speed
    HERZMAN_HEART_DAMAGE: 2,          // Damage per heart bomb
    HERZMAN_HEART_RADIUS: 4,          // Explosion radius
    HERZMAN_MAX_PLACED: 3,            // Max turrets that can be placed (legacy, not enforced)
    HERZMAN_STARTING_COUNT: 2,        // Starting inventory
    HERZMAN_LIFETIME: 60000,          // Lifetime in ms (1 minute)

    // Difficulty settings
    EASY_GOBLIN_COUNT: 53,
    HARD_GOBLIN_COUNT: 53,
    HARD_GUARDIAN_COUNT: 12,
    HARD_SPEED_MULTIPLIER: 1.5,
    EASY_SPEED_MULTIPLIER: 1.5,
    
    // World bounds
    WORLD_BOUND: 300,
    
    // Treasure location (left corner of dragon boss area, away from mountains)
    TREASURE_X: -120,
    TREASURE_Z: -220,
    TREASURE_RADIUS: 0.8
};

// =============================================================================
// LEVELS - Now populated by level registration files
// =============================================================================
// Level configurations are now in separate files:
// - js/levels/level-1-dragon.js   (Dragon's Lair - Forest theme)
// - js/levels/level-2-frozen.js   (Frozen Wastes - Ice theme)
// - js/levels/level-3-desert.js   (Scorching Sands - Desert theme)
// - js/levels/level-4-lava.js     (Lava Caves - Lava theme)
// - js/levels/level-5-water.js    (Deep Waters - Water theme)
// - js/levels/level-6-candy.js    (Candy Kingdom - Candy theme)
// - js/levels/level-7-graveyard.js (Haunted Graveyard - Graveyard theme)
//
// The LEVELS constant is created by level-registry.js as a proxy to LEVEL_REGISTRY
// for backward compatibility with existing code.
// =============================================================================

// =============================================================================
// LEGACY FALLBACK GLOBALS
// =============================================================================
// These are fallback values for global variables that were previously in config.js.
// They should not be used directly - always prefer level-specific values.

const HILLS = [];  // Empty fallback - actual hills come from level config
const MOUNTAINS = [];  // Empty fallback - actual mountains come from level config

// =============================================================================
// GLOBAL MATERIAL CACHE
// =============================================================================
// Caches THREE.js materials to prevent GPU shader recompilation on every entity/
// projectile/effect creation. Call getMaterial() instead of new THREE.Mesh*Material().
// Call clearMaterialCache() on level transitions.

const MATERIAL_CACHE = new Map();

/**
 * Get a cached material or create a new one
 * @param {string} type - 'basic', 'lambert', or 'phong'
 * @param {object} props - Material properties (color, transparent, opacity, etc.)
 * @returns {THREE.Material} Cached or newly created material
 */
function getMaterial(type, props) {
    // Create a cache key from type and sorted properties
    const key = type + '_' + JSON.stringify(props, Object.keys(props).sort());
    
    if (MATERIAL_CACHE.has(key)) {
        return MATERIAL_CACHE.get(key);
    }
    
    let material;
    switch (type) {
        case 'basic':
            material = new THREE.MeshBasicMaterial(props);
            break;
        case 'phong':
            material = new THREE.MeshPhongMaterial(props);
            break;
        case 'lambert':
        default:
            material = new THREE.MeshLambertMaterial(props);
            break;
    }
    
    MATERIAL_CACHE.set(key, material);
    return material;
}

/**
 * Clear the material cache (call on level transitions)
 */
function clearMaterialCache() {
    // Dispose all materials to free GPU memory
    MATERIAL_CACHE.forEach(material => {
        if (material.dispose) material.dispose();
    });
    MATERIAL_CACHE.clear();
}

/**
 * Get a cached material that uses a texture map.
 * Regular getMaterial() can't cache textured materials because JSON.stringify
 * doesn't serialize texture objects. This function uses a textureName string as key.
 * @param {string} type - 'basic', 'lambert', or 'phong'
 * @param {object} props - Material properties INCLUDING map (texture object)
 * @param {string} textureName - A stable name for the texture (e.g. 'rock', 'brickWall')
 * @returns {THREE.Material} Cached or newly created material
 */
function getTexturedMaterial(type, props, textureName) {
    // Build cache key from type, sorted scalar props, and texture name
    const scalarProps = {};
    for (const k of Object.keys(props).sort()) {
        if (k !== 'map') scalarProps[k] = props[k];
    }
    const key = 'tex_' + type + '_' + textureName + '_' + JSON.stringify(scalarProps);

    if (MATERIAL_CACHE.has(key)) {
        return MATERIAL_CACHE.get(key);
    }

    let material;
    switch (type) {
        case 'basic':
            material = new THREE.MeshBasicMaterial(props);
            break;
        case 'phong':
            material = new THREE.MeshPhongMaterial(props);
            break;
        case 'lambert':
        default:
            material = new THREE.MeshLambertMaterial(props);
            break;
    }

    MATERIAL_CACHE.set(key, material);
    return material;
}

// ============================================================================
// GEOMETRY CACHE
// ============================================================================
// Reuse identical geometry objects across entities and terrain.
// Geometries with the same type + constructor args share one GPU buffer.
// Do NOT cache geometries that are mutated after creation (.scale(), .translate(), etc.)

const GEOMETRY_CACHE = new Map();

/**
 * Get a cached geometry or create a new one
 * @param {string} type - 'box', 'sphere', 'cylinder', 'cone', 'plane', 'torus', 'circle', 'ring', 'dodecahedron', 'icosahedron', 'octahedron', 'tetrahedron'
 * @param {...number} args - Constructor arguments for the geometry
 * @returns {THREE.BufferGeometry} Cached or newly created geometry
 */
function getGeometry(type, ...args) {
    const key = type + '_' + args.join('_');

    if (GEOMETRY_CACHE.has(key)) {
        return GEOMETRY_CACHE.get(key);
    }

    let geometry;
    switch (type) {
        case 'box':          geometry = new THREE.BoxGeometry(...args); break;
        case 'sphere':       geometry = new THREE.SphereGeometry(...args); break;
        case 'cylinder':     geometry = new THREE.CylinderGeometry(...args); break;
        case 'cone':         geometry = new THREE.ConeGeometry(...args); break;
        case 'plane':        geometry = new THREE.PlaneGeometry(...args); break;
        case 'torus':        geometry = new THREE.TorusGeometry(...args); break;
        case 'circle':       geometry = new THREE.CircleGeometry(...args); break;
        case 'ring':         geometry = new THREE.RingGeometry(...args); break;
        case 'dodecahedron': geometry = new THREE.DodecahedronGeometry(...args); break;
        case 'icosahedron':  geometry = new THREE.IcosahedronGeometry(...args); break;
        case 'octahedron':   geometry = new THREE.OctahedronGeometry(...args); break;
        case 'tetrahedron':  geometry = new THREE.TetrahedronGeometry(...args); break;
        default:
            console.warn('getGeometry: unknown type', type);
            geometry = new THREE.BoxGeometry(...args);
    }

    GEOMETRY_CACHE.set(key, geometry);
    return geometry;
}

/**
 * Clear the geometry cache (call on level transitions alongside clearMaterialCache)
 */
function clearGeometryCache() {
    GEOMETRY_CACHE.forEach(geometry => {
        if (geometry.dispose) geometry.dispose();
    });
    GEOMETRY_CACHE.clear();
}
