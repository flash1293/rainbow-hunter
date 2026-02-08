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
