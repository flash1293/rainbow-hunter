// Game configuration and constants

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
    
    // Difficulty settings
    EASY_GOBLIN_COUNT: 20,
    HARD_GOBLIN_COUNT: 53,
    HARD_GUARDIAN_COUNT: 12,
    HARD_SPEED_MULTIPLIER: 1.5,
    EASY_SPEED_MULTIPLIER: 1.0,
    
    // World bounds
    WORLD_BOUND: 150,
    
    // Treasure location
    TREASURE_X: 30,
    TREASURE_Z: -57,
    TREASURE_RADIUS: 0.8
};

// Hill positions and dimensions
const HILLS = [
    { x: -30, z: -30, radius: 8, height: 4 },
    { x: 40, z: -50, radius: 10, height: 5 },
    { x: -60, z: 20, radius: 7, height: 3.5 },
    { x: 60, z: 30, radius: 9, height: 4.5 },
    { x: -20, z: 60, radius: 6, height: 3 },
    { x: 20, z: -70, radius: 8, height: 4 },
    { x: -80, z: -60, radius: 7, height: 3.5 },
    { x: 80, z: -20, radius: 8, height: 4 },
    { x: -40, z: 80, radius: 9, height: 4.5 },
    { x: 50, z: 70, radius: 7, height: 3.5 },
    { x: 10, z: 40, radius: 6, height: 3 },
    { x: -70, z: -30, radius: 8, height: 4 },
    { x: 70, z: 60, radius: 7, height: 3.5 },
    { x: -50, z: 50, radius: 9, height: 4.5 },
    { x: 30, z: -20, radius: 6, height: 3 }
];

// Mountain positions (world boundaries)
const MOUNTAINS = [
    { x: 0, z: -140, width: 80, height: 30 },
    { x: -100, z: -100, width: 60, height: 25 },
    { x: 100, z: -100, width: 60, height: 25 },
    { x: -140, z: 0, width: 60, height: 28 },
    { x: 140, z: 0, width: 60, height: 28 },
    { x: -100, z: 100, width: 70, height: 22 },
    { x: 100, z: 100, width: 70, height: 22 },
    { x: 0, z: 140, width: 80, height: 26 },
    { x: -50, z: -135, width: 65, height: 27 },
    { x: 50, z: -135, width: 65, height: 27 },
    { x: -135, z: -50, width: 55, height: 24 },
    { x: -135, z: 50, width: 55, height: 24 },
    { x: 135, z: -50, width: 55, height: 24 },
    { x: 135, z: 50, width: 55, height: 24 },
    { x: -50, z: 135, width: 65, height: 23 },
    { x: 50, z: 135, width: 65, height: 23 }
];

// Goblin spawn positions [x, z, patrolLeft, patrolRight, speed]
const GOBLIN_POSITIONS = [
    [-40, -20, -45, -35, 0.012],
    [50, 10, 45, 55, 0.014],
    [-30, 30, -35, -25, 0.013],
    [40, -40, 35, 45, 0.016],
    [10, -30, 5, 15, 0.013],
    [-70, 50, -75, -65, 0.013],
    [80, -30, 75, 85, 0.014],
    [-50, -70, -55, -45, 0.015],
    [20, 60, 15, 25, 0.013],
    [60, -70, 55, 65, 0.016],
    [-80, -40, -85, -75, 0.013],
    [90, 40, 85, 95, 0.014],
    [-15, -25, -20, -10, 0.013],
    [45, 15, 40, 50, 0.014],
    [-25, 50, -30, -20, 0.012],
    [55, -45, 50, 60, 0.015],
    [-65, 35, -70, -60, 0.013],
    [75, -10, 70, 80, 0.014],
    [-55, 65, -60, -50, 0.014],
    [70, 55, 65, 75, 0.015],
    [-45, -55, -50, -40, 0.013],
    [60, -60, 55, 65, 0.014],
    [-85, 25, -90, -80, 0.013],
    [95, -20, 90, 100, 0.016],
    [5, -70, 0, 10, 0.014],
    [-35, 75, -40, -30, 0.013],
    [48, 70, 43, 53, 0.015],
    [-75, -55, -80, -70, 0.013],
    [85, -65, 80, 90, 0.014],
    [-20, -65, -25, -15, 0.014],
    [32, 80, 27, 37, 0.013],
    [-90, -25, -95, -85, 0.013],
    [100, 30, 95, 105, 0.016],
    [-10, -80, -15, -5, 0.014],
    [25, -75, 20, 30, 0.014],
    [-95, 10, -100, -90, 0.013],
    [105, -10, 100, 110, 0.016],
    [-60, -30, -65, -55, 0.014],
    [65, 25, 60, 70, 0.014],
    [-38, -45, -43, -33, 0.013],
    [52, -55, 47, 57, 0.015],
    [-72, 65, -77, -67, 0.014],
    [82, 70, 77, 87, 0.016],
    [-28, -85, -33, -23, 0.014],
    [38, 85, 33, 43, 0.014],
    [-100, -15, -105, -95, 0.013],
    [110, 15, 105, 115, 0.016],
    [-12, 55, -17, -7, 0.014],
    [28, -50, 23, 33, 0.014],
    [-82, -65, -87, -77, 0.013],
    [92, -75, 87, 97, 0.016],
    [-48, 82, -53, -43, 0.014],
    [58, -82, 53, 63, 0.016]
];
