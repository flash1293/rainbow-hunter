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

// Level configurations - each level contains all spawn positions and settings
const LEVELS = {
    1: {
        name: "Level 1 - Dragon's Lair",
        
        // Theme colors
        hillColor: 0x228B22,       // Forest green hills
        treeColor: 0x228B22,       // Forest green foliage
        grassColor: 0x228B22,      // Forest green grass
        
        // Level features
        hasRiver: true,
        hasMaterials: true,
        
        // Player start position
        playerStart: { x: 0, z: 40 },
        
        // No treasure in Level 1 - portal is at treasure location
        hasTreasure: false,
        
        // Portal to Level 2 at the treasure location (far end of level)
        portal: { x: -120, z: -220, destinationLevel: 2 },
        
        // World Kite position
        worldKite: { x: 0, z: -10 },
        
        // Ice Berg position
        iceBerg: { x: 80, z: -40 },
        
        // Dragon spawn position (only used in hard mode)
        dragon: { x: 0, z: -200 },
        
        // Rainbow position (near treasure)
        rainbow: { x: -120, z: -215 },
        
        // Hill positions and dimensions
        hills: [
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
            { x: 30, z: -20, radius: 6, height: 3 },
            // Hills behind the gap (treasure area)
            { x: -40, z: -100, radius: 8, height: 4 },
            { x: 25, z: -105, radius: 7, height: 3.5 },
            { x: -15, z: -130, radius: 9, height: 4.5 },
            { x: 50, z: -125, radius: 8, height: 4 },
            { x: 0, z: -95, radius: 6, height: 3 },
            { x: 60, z: -150, radius: 7, height: 3.5 },
            { x: -60, z: -140, radius: 8, height: 4 },
            // Dragon boss area hills - many in CENTER behind dragon
            { x: -25, z: -212, radius: 8, height: 3.5 },
            { x: 20, z: -220, radius: 9, height: 4 },
            { x: -15, z: -228, radius: 7, height: 3 },
            { x: 30, z: -236, radius: 8, height: 3.5 },
            { x: -35, z: -244, radius: 9, height: 4 },
            { x: 10, z: -252, radius: 8, height: 3.5 },
            { x: -20, z: -258, radius: 7, height: 3 },
            { x: 35, z: -215, radius: 6, height: 2.5 },
            { x: -30, z: -225, radius: 8, height: 3.5 },
            { x: 5, z: -235, radius: 7, height: 3 },
            { x: 25, z: -248, radius: 9, height: 4 }
        ],
        
        // Mountain positions (world boundaries)
        mountains: [
            // Far north wall (behind treasure at z: -210) - solid wall
            { x: -160, z: -270, width: 80, height: 30 },
            { x: -120, z: -270, width: 80, height: 30 },
            { x: -80, z: -270, width: 80, height: 30 },
            { x: -40, z: -270, width: 80, height: 30 },
            { x: 0, z: -270, width: 80, height: 30 },
            { x: 40, z: -270, width: 80, height: 30 },
            { x: 80, z: -270, width: 80, height: 30 },
            { x: 120, z: -270, width: 80, height: 30 },
            { x: 160, z: -270, width: 80, height: 30 },
            // Second row for solid wall
            { x: -140, z: -260, width: 60, height: 28 },
            { x: -80, z: -260, width: 60, height: 28 },
            { x: -20, z: -260, width: 60, height: 28 },
            { x: 20, z: -260, width: 60, height: 28 },
            { x: 80, z: -260, width: 60, height: 28 },
            { x: 140, z: -260, width: 60, height: 28 },
            // Back area side walls (z: -180 to z: -270) - widest area for dragon
            { x: -190, z: -260, width: 50, height: 28 },
            { x: -190, z: -240, width: 50, height: 28 },
            { x: -190, z: -220, width: 50, height: 28 },
            { x: -190, z: -200, width: 50, height: 28 },
            { x: -190, z: -190, width: 50, height: 28 },
            { x: 190, z: -260, width: 50, height: 28 },
            { x: 190, z: -240, width: 50, height: 28 },
            { x: 190, z: -220, width: 50, height: 28 },
            { x: 190, z: -200, width: 50, height: 28 },
            { x: 190, z: -190, width: 50, height: 28 },
            // Second gap entrance at z: -180 (narrow passage leading to back area)
            { x: -120, z: -180, width: 60, height: 28 },
            { x: -70, z: -180, width: 50, height: 28 },
            { x: -35, z: -180, width: 40, height: 28 },
            { x: 35, z: -180, width: 40, height: 28 },
            { x: 70, z: -180, width: 50, height: 28 },
            { x: 120, z: -180, width: 60, height: 28 },
            // Middle area side walls (z: -85 to z: -180) - medium width for guardians
            { x: -150, z: -170, width: 50, height: 28 },
            { x: -150, z: -150, width: 50, height: 28 },
            { x: -150, z: -130, width: 50, height: 28 },
            { x: -150, z: -110, width: 50, height: 28 },
            { x: -150, z: -95, width: 50, height: 28 },
            { x: 150, z: -170, width: 50, height: 28 },
            { x: 150, z: -150, width: 50, height: 28 },
            { x: 150, z: -130, width: 50, height: 28 },
            { x: 150, z: -110, width: 50, height: 28 },
            { x: 150, z: -95, width: 50, height: 28 },
            // First gap entrance at z: -85 (narrow passage leading to middle area)
            { x: -120, z: -85, width: 60, height: 28 },
            { x: -70, z: -85, width: 50, height: 28 },
            { x: -35, z: -85, width: 40, height: 28 },
            { x: 35, z: -85, width: 40, height: 28 },
            { x: 70, z: -85, width: 50, height: 28 },
            { x: 120, z: -85, width: 60, height: 28 },
            // Front area corners (before first gap)
            { x: -170, z: -70, width: 60, height: 28 },
            { x: -170, z: -50, width: 60, height: 28 },
            { x: 170, z: -70, width: 60, height: 28 },
            { x: 170, z: -50, width: 60, height: 28 },
            // West wall (left side) - front area
            { x: -190, z: -80, width: 50, height: 28 },
            { x: -190, z: -40, width: 50, height: 28 },
            { x: -190, z: 0, width: 50, height: 28 },
            { x: -190, z: 40, width: 50, height: 28 },
            { x: -190, z: 80, width: 50, height: 28 },
            { x: -190, z: 120, width: 50, height: 28 },
            // East wall (right side) - front area
            { x: 190, z: -80, width: 50, height: 28 },
            { x: 190, z: -40, width: 50, height: 28 },
            { x: 190, z: 0, width: 50, height: 28 },
            { x: 190, z: 40, width: 50, height: 28 },
            { x: 190, z: 80, width: 50, height: 28 },
            { x: 190, z: -80, width: 50, height: 28 },
            { x: 190, z: -40, width: 50, height: 28 },
            { x: 190, z: 0, width: 50, height: 28 },
            { x: 190, z: 40, width: 50, height: 28 },
            { x: 190, z: 80, width: 50, height: 28 },
            { x: 190, z: 120, width: 50, height: 28 },
            // Southwest corner
            { x: -170, z: 140, width: 60, height: 26 },
            { x: -170, z: 100, width: 60, height: 26 },
            // Southeast corner
            { x: 170, z: 140, width: 60, height: 26 },
            { x: 170, z: 100, width: 60, height: 26 },
            // South wall (player side) - complete coverage
            { x: -120, z: 180, width: 80, height: 26 },
            { x: -40, z: 180, width: 80, height: 26 },
            { x: 40, z: 180, width: 80, height: 26 },
            { x: 120, z: 180, width: 80, height: 26 },
            { x: -80, z: 165, width: 60, height: 24 },
            { x: 0, z: 165, width: 60, height: 24 },
            { x: 80, z: 165, width: 60, height: 24 }
        ],
        
        // Goblin spawn positions [x, z, patrolLeft, patrolRight, speed]
        goblins: [
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
        ],
        
        // Guardian goblin positions (hard mode) [x, z, patrolLeft, patrolRight, speed]
        guardians: [
            // Early area (just past the first gap)
            [-45, -15, -50, -40, 0.012],
            [50, -25, 45, 55, 0.012],
            [-15, -40, -20, -10, 0.010],
            [35, -55, 30, 40, 0.011],
            // Middle area (before second gap and dragon)
            [-70, -95, -75, -65, 0.013],
            [60, -105, 55, 65, 0.012],
            [-30, -125, -35, -25, 0.011],
            [80, -135, 75, 85, 0.013],
            [-85, -150, -90, -80, 0.012],
            [40, -165, 35, 45, 0.011],
            // Dragon area (scattered around the boss)
            [-90, -195, -95, -85, 0.013],
            [85, -205, 80, 90, 0.012],
            [-50, -215, -55, -45, 0.011],
            [60, -230, 55, 65, 0.013]
        ],
        
        // Giant goblin positions (hard mode) [x, z, patrolLeft, patrolRight]
        giants: [
            [0, -85, -8, 8],        // Giant guardian at the gap
            [-40, -50, -50, -30],   // Additional giant
            [40, -110, 30, 50],     // Additional giant
            [-25, -115, -35, -15]   // Additional giant
        ],
        
        // Wizard goblin positions (hard mode) [x, z, patrolLeft, patrolRight, speed]
        wizards: [
            [0, -180, -10, 10, 0.008],      // Wizard guarding dragon approach
            [-60, -220, -70, -50, 0.007],   // Wizard in dragon boss area
            [50, -150, 40, 60, 0.008],      // Wizard on right side of middle area
            [-40, -120, -50, -30, 0.007],   // Wizard on left side
            [30, -200, 20, 40, 0.008]       // Wizard near dragon from other side
        ],
        
        // Additional regular goblins for hard mode [x, z, patrolLeft, patrolRight, speed]
        hardModeGoblins: [
            // Middle area
            [-50, -100, -60, -40, 0.013],
            [45, -120, 35, 55, 0.012],
            [-15, -145, -25, -5, 0.011],
            [65, -160, 55, 75, 0.013],
            // Dragon area
            [-75, -210, -85, -65, 0.012],
            [70, -220, 60, 80, 0.013],
            [-30, -235, -40, -20, 0.011],
            [40, -245, 30, 50, 0.012],
            [0, -225, -10, 10, 0.013]
        ],
        
        // Bird positions (hard mode) [centerX, centerZ, radius, speed]
        birds: [
            [0, -85, 35, 0.006],
            [0, -85, 42, 0.007],
            [5, -80, 38, 0.0065],
            [60, -130, 22, 0.007],
            [60, -130, 28, 0.006]
        ],
        
        // Ammo pickup positions
        ammoPositions: [
            { x: -15, z: 20 }, { x: 35, z: 15 }, { x: -25, z: -10 },
            { x: 15, z: -25 }, { x: -40, z: 40 }, { x: 45, z: -35 },
            { x: 5, z: 25 }, { x: -30, z: -30 }, { x: 20, z: -15 },
            { x: -10, z: -40 }, { x: 40, z: 35 }, { x: -35, z: 5 },
            { x: -50, z: -15 }, { x: 55, z: -20 }, { x: -18, z: 50 },
            { x: 25, z: 55 }, { x: -45, z: -50 }, { x: 50, z: -55 },
            // Behind the gap
            { x: -20, z: -100 }, { x: 30, z: -110 }, { x: -10, z: -125 },
            { x: 40, z: -135 },
            // Additional ammo for harder difficulty
            { x: 10, z: -70 }, { x: -35, z: -75 }, { x: 45, z: -90 },
            { x: -15, z: -105 }, { x: 25, z: -120 }, { x: -30, z: -118 },
            { x: 52, z: -125 }, { x: 15, z: 45 },
            // Dragon boss area
            { x: -90, z: -195 }, { x: 100, z: -205 }, { x: -70, z: -220 },
            { x: 85, z: -235 }, { x: 0, z: -245 }, { x: -110, z: -250 },
            { x: 120, z: -215 }
        ],
        
        // Bomb pickup positions
        bombPositions: [
            // Early area
            { x: -35, z: 30 }, { x: 42, z: -10 }, { x: -18, z: -35 },
            { x: 30, z: 45 }, { x: -48, z: -18 }, { x: 15, z: -50 },
            { x: -25, z: 55 }, { x: 50, z: 25 }, { x: -55, z: -45 },
            // Middle area
            { x: -65, z: -110 }, { x: 55, z: -115 }, { x: -25, z: -140 },
            { x: 70, z: -155 }, { x: -80, z: -125 }, { x: 35, z: -130 },
            { x: -45, z: -165 }, { x: 60, z: -145 },
            // Dragon area
            { x: -95, z: -200 }, { x: 90, z: -210 }, { x: -60, z: -225 },
            { x: 75, z: -195 }, { x: -110, z: -215 }, { x: 105, z: -230 },
            { x: -40, z: -240 }, { x: 50, z: -220 }
        ],
        
        // Health pickup positions (hearts)
        healthPositions: [
            { x: -8, z: 50 }, { x: 32, z: -18 }, { x: -48, z: -25 },
            { x: 55, z: 22 }, { x: -22, z: 65 },
            // Middle area (before second gap and dragon)
            { x: -80, z: -100 }, { x: 75, z: -110 }, { x: 0, z: -120 },
            { x: -60, z: -140 }, { x: 65, z: -160 },
            // Dragon boss area
            { x: -100, z: -210 }, { x: 95, z: -225 }, { x: -60, z: -240 },
            { x: 70, z: -255 }
        ],
        
        // Herz-Man pickup positions (presents with bow)
        herzmanPositions: [
            { x: 20, z: 40 }, { x: -30, z: -20 }, { x: 50, z: -40 },
            { x: -60, z: -100 }, { x: 40, z: -150 },
            { x: -80, z: -200 }, { x: 60, z: -230 }
        ],
        
        // Bridge repair materials
        materials: [
            { x: -20, z: 35, type: 'wood', color: 0x8B4513, glowColor: 0xFFAA00 },
            { x: 25, z: 30, type: 'glass', color: 0x87CEEB, glowColor: 0x00FFFF },
            { x: 10, z: 15, type: 'metal', color: 0xC0C0C0, glowColor: 0xFFFFFF }
        ],
        
        // Trap positions
        trapPositions: [
            { x: -5, z: 12 }, { x: 12, z: 11 }, { x: -15, z: 9 },
            { x: -8, z: -5 }, { x: 10, z: -6 }, { x: -2, z: -20 },
            { x: 25, z: 15 }, { x: -30, z: 20 }, { x: 18, z: -15 },
            { x: -22, z: -25 }, { x: 35, z: -10 }, { x: -28, z: -40 },
            { x: -38, z: 28 }, { x: 40, z: 32 }, { x: -12, z: 50 },
            { x: 15, z: 52 }, { x: -48, z: -18 }, { x: 50, z: -22 },
            { x: -25, z: -50 }, { x: 28, z: -52 }, { x: -55, z: 40 },
            { x: 58, z: 42 }, { x: 5, z: -55 }, { x: -8, z: -58 },
            { x: -42, z: 55 }
        ],
        
        // Tree positions for Level 1
        treePositions: [
            { x: -10, z: -15 }, { x: 10, z: -16 }, { x: 0, z: -18 },
            { x: -25, z: -30 }, { x: 20, z: -35 }, { x: -15, z: -45 },
            { x: 30, z: -25 }, { x: -35, z: 15 }, { x: 40, z: 20 },
            { x: -45, z: 25 }, { x: 50, z: 30 }, { x: -20, z: 40 },
            { x: 35, z: 45 }, { x: -50, z: -20 }, { x: 55, z: -25 },
            { x: -30, z: -50 }, { x: 25, z: -55 }, { x: -60, z: 10 },
            { x: 65, z: 5 }, { x: 15, z: 55 }, { x: -40, z: 60 },
            { x: 45, z: -60 }, { x: -55, z: -55 }, { x: 60, z: 60 },
            { x: 5, z: -65 }, { x: -65, z: 35 },
            // Trees behind the gap (treasure area)
            { x: -20, z: -95 }, { x: 15, z: -100 }, { x: -35, z: -110 },
            { x: 40, z: -115 }, { x: -10, z: -125 }, { x: 25, z: -130 },
            { x: -50, z: -135 }, { x: 55, z: -140 }, { x: 0, z: -145 },
            { x: -30, z: -150 }, { x: 35, z: -155 }, { x: 10, z: -160 },
            // Dragon boss area trees
            { x: -130, z: -195 }, { x: 140, z: -205 }, { x: -100, z: -220 },
            { x: 110, z: -230 }, { x: -140, z: -245 }, { x: 130, z: -255 },
            { x: -80, z: -200 }, { x: 90, z: -215 }, { x: -70, z: -260 },
            { x: 115, z: -240 }, { x: -95, z: -235 }, { x: 105, z: -250 },
            { x: -150, z: -220 }, { x: 145, z: -225 }, { x: 75, z: -195 },
            { x: -50, z: -210 }, { x: 55, z: -235 }, { x: -85, z: -247 },
            { x: 95, z: -258 }, { x: -120, z: -262 }, { x: 125, z: -248 },
            { x: -60, z: -225 }, { x: 65, z: -252 }, { x: -110, z: -238 },
            { x: 100, z: -222 }, { x: -75, z: -254 }, { x: 85, z: -245 },
            { x: -135, z: -232 }, { x: 135, z: -260 }, { x: -45, z: -218 },
            { x: 50, z: -243 }, { x: -105, z: -256 }, { x: 120, z: -217 },
            // CENTER area behind dragon
            { x: -30, z: -210 }, { x: -15, z: -215 }, { x: 0, z: -220 },
            { x: 15, z: -225 }, { x: 30, z: -230 }, { x: -35, z: -235 },
            { x: -20, z: -240 }, { x: 10, z: -245 }, { x: 25, z: -250 },
            { x: -25, z: -255 }, { x: 5, z: -260 }, { x: 35, z: -212 },
            { x: -40, z: -222 }, { x: 20, z: -233 }, { x: -10, z: -248 },
            { x: 40, z: -258 }, { x: -5, z: -228 }, { x: 12, z: -238 }
        ],
        
        // Rock positions for Level 1
        rockPositions: [
            { x: -8, z: 8 }, { x: -3, z: 7 }, { x: 5, z: 8 }, { x: 10, z: 7 },
            { x: -20, z: 25 }, { x: 15, z: 30 }, { x: -10, z: 35 },
            { x: -18, z: 5 }, { x: 22, z: 10 }, { x: -25, z: -5 }, { x: 30, z: -2 },
            { x: -12, z: -8 }, { x: -6, z: -9 }, { x: 7, z: -8 }, { x: 12, z: -9 },
            { x: -30, z: -20 }, { x: 35, z: -25 }, { x: -20, z: -35 }, { x: 25, z: -40 },
            { x: -40, z: 15 }, { x: 42, z: 12 }, { x: -15, z: 45 }, { x: 18, z: 48 },
            { x: -50, z: -10 }, { x: 52, z: -15 }, { x: -35, z: -45 }, { x: 38, z: -48 },
            { x: -45, z: 50 }, { x: 48, z: 55 }, { x: -55, z: -30 }, { x: 58, z: -35 },
            { x: 8, z: 60 }, { x: -12, z: 65 }, { x: 15, z: -60 }, { x: -18, z: -65 },
            { x: -60, z: 20 }, { x: 62, z: 25 }, { x: -28, z: 70 }, { x: 32, z: 72 },
            { x: -65, z: -50 }, { x: 68, z: -55 }, { x: 25, z: 75 },
            { x: 0, z: 30 },
            // Dragon boss area rocks
            { x: -110, z: -200 }, { x: 125, z: -210 }, { x: -85, z: -225 },
            { x: 95, z: -235 }, { x: -135, z: -250 }, { x: 120, z: -245 },
            { x: -75, z: -205 }, { x: 100, z: -220 }, { x: -115, z: -255 },
            { x: 130, z: -230 }, { x: -90, z: -240 }, { x: 110, z: -260 },
            { x: -140, z: -215 }, { x: 135, z: -250 }, { x: -65, z: -260 },
            { x: 85, z: -200 }, { x: -125, z: -225 }, { x: 105, z: -255 },
            { x: -55, z: -218 }, { x: 70, z: -238 }, { x: -98, z: -248 },
            { x: 115, z: -252 }, { x: -82, z: -233 }, { x: 92, z: -258 },
            { x: -122, z: -243 }, { x: 128, z: -222 }, { x: -68, z: -246 },
            { x: 88, z: -228 }, { x: -102, z: -262 }, { x: 118, z: -236 },
            { x: -78, z: -214 }, { x: 82, z: -254 }, { x: -132, z: -257 },
            { x: 138, z: -241 }, { x: -72, z: -222 }, { x: 78, z: -248 },
            // CENTER area rocks behind dragon
            { x: -35, z: -212 }, { x: -20, z: -218 }, { x: -8, z: -224 },
            { x: 5, z: -230 }, { x: 18, z: -236 }, { x: 32, z: -242 },
            { x: -28, z: -248 }, { x: -15, z: -254 }, { x: 0, z: -260 },
            { x: 12, z: -216 }, { x: 25, z: -222 }, { x: -38, z: -228 },
            { x: -25, z: -234 }, { x: -10, z: -240 }, { x: 8, z: -246 },
            { x: 22, z: -252 }, { x: 35, z: -258 }, { x: -32, z: -215 },
            { x: -18, z: -225 }, { x: 15, z: -235 }, { x: 28, z: -245 }
        ]
    },
    
    2: {
        name: "Level 2 - The Frozen Wastes",
        
        // Player start position - bottom of the L (south end) - EXTENDED
        playerStart: { x: 0, z: 200 },
        
        // No portal in level 2 - portal to level 3
        portal: { x: -180, z: -100, destinationLevel: 3 },
        
        // Unique elements for level 2
        iceTheme: true,
        skyColor: 0xc8d8e8,  // Match fog color for seamless fade
        groundColor: 0xc8e6f5,  // Icy ground
        fogDensity: 0.02,
        fogColor: 0xc8d8e8,  // White mist
        
        // No river or materials in level 2
        hasRiver: false,
        hasMaterials: false,
        
        // Theme colors for ice level
        hillColor: 0x88bbdd,       // Icy blue-gray hills
        treeColor: 0x667788,       // Frosted gray-blue foliage
        grassColor: 0x99aacc,      // Frosted pale blue grass
        
        // Level 2 has no treasure - portal leads to level 3
        hasTreasure: false,
        
        // Treasure position - at the end of the L (west end)
        treasurePosition: { x: -180, z: -100 },
        
        // Rainbow position - above the treasure
        rainbow: { x: -180, z: -95 },
        
        // Dragon spawn positions - THREE dragons guarding Level 2
        dragon: { x: -120, z: -100 },  // Main dragon near treasure
        extraDragons: [
            { x: 0, z: 50 },           // Dragon in southern corridor
            { x: -70, z: -100 }        // Dragon in middle of western corridor
        ],
        
        // World Kite position - near spawn for easy collection
        worldKite: { x: 5, z: 190 },

        // Ice Berg position - in the extended southern corridor
        iceBerg: { x: 20, z: 100 },
        
        // L-shaped layout hills - scattered along the EXTENDED L path
        // The L goes: South (z:200) -> North (z:-60 corner) -> West (treasure)
        hills: [
            // Extended southern corridor (z: 200 to z: 0)
            { x: -20, z: 180, radius: 8, height: 4 },
            { x: 25, z: 160, radius: 9, height: 4.5 },
            { x: -15, z: 140, radius: 7, height: 3.5 },
            { x: 30, z: 120, radius: 8, height: 4 },
            { x: -25, z: 100, radius: 9, height: 4.5 },
            { x: 20, z: 80, radius: 7, height: 3.5 },
            { x: -20, z: 60, radius: 8, height: 4 },
            { x: 25, z: 40, radius: 9, height: 4.5 },
            { x: -15, z: 20, radius: 7, height: 3.5 },
            { x: 30, z: 0, radius: 8, height: 4 },
            { x: -25, z: -20, radius: 9, height: 4.5 },
            // Corner area (z: -40 to z: -60)
            { x: -10, z: -45, radius: 10, height: 5 },
            { x: 25, z: -55, radius: 8, height: 4 },
            // Western corridor (x: -40 to x: -180, z: -80 to z: -120)
            { x: -50, z: -90, radius: 8, height: 4 },
            { x: -80, z: -105, radius: 9, height: 4.5 },
            { x: -110, z: -95, radius: 7, height: 3.5 },
            { x: -140, z: -110, radius: 8, height: 4 },
            { x: -160, z: -85, radius: 9, height: 4.5 }
        ],
        
        // L-shaped mountain layout - walls forming the EXTENDED L corridor
        mountains: [
            // === EXTENDED SOUTHERN CORRIDOR (vertical part of L) ===
            // East wall of southern corridor (x: 60) - from z:220 to z:-40
            { x: 60, z: 220, width: 50, height: 28 },
            { x: 60, z: 180, width: 50, height: 28 },
            { x: 60, z: 140, width: 50, height: 28 },
            { x: 60, z: 100, width: 50, height: 28 },
            { x: 60, z: 60, width: 50, height: 28 },
            { x: 60, z: 20, width: 50, height: 28 },
            { x: 60, z: -20, width: 50, height: 28 },
            { x: 60, z: -60, width: 50, height: 28 },
            // West wall of southern corridor (x: -60) - only goes to corner
            { x: -60, z: 220, width: 50, height: 28 },
            { x: -60, z: 180, width: 50, height: 28 },
            { x: -60, z: 140, width: 50, height: 28 },
            { x: -60, z: 100, width: 50, height: 28 },
            { x: -60, z: 60, width: 50, height: 28 },
            { x: -60, z: 20, width: 50, height: 28 },
            { x: -60, z: -20, width: 50, height: 28 },
            // South wall (behind player start at z:200)
            { x: -40, z: 240, width: 60, height: 26 },
            { x: 20, z: 240, width: 60, height: 26 },
            
            // === CORNER AREA ===
            // East wall continues down
            { x: 60, z: -100, width: 50, height: 28 },
            { x: 60, z: -140, width: 50, height: 28 },
            // North-east corner wall (blocking direct path north)
            { x: 30, z: -160, width: 60, height: 28 },
            { x: -30, z: -160, width: 60, height: 28 },
            
            // === WESTERN CORRIDOR (horizontal part of L) ===
            // North wall of western corridor (z: -60)
            { x: -60, z: -60, width: 50, height: 28 },
            { x: -100, z: -60, width: 50, height: 28 },
            { x: -140, z: -60, width: 50, height: 28 },
            { x: -180, z: -60, width: 50, height: 28 },
            // South wall of western corridor (z: -140)
            { x: -60, z: -140, width: 50, height: 28 },
            { x: -100, z: -140, width: 50, height: 28 },
            { x: -140, z: -140, width: 50, height: 28 },
            { x: -180, z: -140, width: 50, height: 28 },
            // West wall (treasure area end)
            { x: -220, z: -80, width: 50, height: 28 },
            { x: -220, z: -120, width: 50, height: 28 }
        ],
        
        // Goblin spawn positions - along the EXTENDED L-shaped path
        goblins: [
            // Extended southern corridor (z: 200 to z: 0)
            [25, 150, 20, 30, 0.016],
            [-15, 130, -20, -10, 0.015],
            [30, 110, 25, 35, 0.015],
            [-25, 90, -30, -20, 0.014],
            [20, 70, 15, 25, 0.016],
            [-15, 50, -20, -10, 0.015],
            [25, 30, 20, 30, 0.014],
            [-20, 10, -25, -15, 0.016],
            [30, -10, 25, 35, 0.015],
            [-25, -30, -30, -20, 0.014],
            // Corner area
            [10, -50, 5, 15, 0.016],
            [-20, -70, -25, -15, 0.015],
            // Western corridor
            [-60, -100, -65, -55, 0.015],
            [-90, -95, -95, -85, 0.016],
            [-120, -105, -125, -115, 0.014],
            [-150, -90, -155, -145, 0.015]
        ],
        
        // Guardians along the EXTENDED L path
        guardians: [
            // Extended southern corridor
            [0, 160, -5, 5, 0.012],
            [-10, 120, -15, -5, 0.013],
            [15, 80, 10, 20, 0.012],
            [0, 40, -5, 5, 0.013],
            [-10, 0, -15, -5, 0.012],
            [15, -40, 10, 20, 0.013],
            // Corner area
            [-30, -80, -35, -25, 0.014],
            // Western corridor - near dragon
            [-80, -100, -85, -75, 0.013],
            [-110, -90, -115, -105, 0.014],
            [-140, -100, -145, -135, 0.013],
            [-165, -95, -170, -160, 0.015]
        ],
        
        // Giants guarding key positions
        giants: [
            [0, 100, -10, 10],           // Mid southern corridor
            [0, -60, -10, 10],           // Corner entrance
            [-100, -100, -110, -90],     // Western corridor
            [-160, -100, -170, -150]     // Near treasure
        ],
        
        // Wizards casting fireballs (hard mode) [x, z, patrolLeft, patrolRight, speed]
        wizards: [
            [0, 150, -10, 10, 0.007],       // Wizard in southern corridor (top)
            [0, 80, -10, 10, 0.008],        // Wizard in southern corridor (middle)
            [0, 10, -10, 10, 0.007],        // Wizard in southern corridor (bottom)
            [-20, -60, -30, -10, 0.008],    // Wizard at the corner
            [-40, -100, -50, -30, 0.008],   // Wizard in western corridor
            [-90, -95, -100, -80, 0.007],   // Wizard in mid-western corridor
            [-140, -95, -150, -130, 0.007]  // Wizard near treasure
        ],
        
        hardModeGoblins: [
            // Extra goblins in hard mode - extended
            [20, 180, 15, 25, 0.015],
            [-30, 140, -35, -25, 0.014],
            [25, 100, 20, 30, 0.016],
            [-25, 60, -30, -20, 0.015],
            [20, 20, 15, 25, 0.014],
            [-30, -20, -35, -25, 0.016],
            [-45, -90, -50, -40, 0.015],
            [-130, -110, -135, -125, 0.014]
        ],
        
        // More birds in level 2
        birds: [
            [0, 120, 30, 0.007],
            [0, 0, 25, 0.008],
            [-80, -100, 30, 0.008]
        ],
        
        // Ammo pickups along the EXTENDED L path - LOTS MORE
        ammoPositions: [
            // Extended southern corridor - many ammo drops
            { x: -15, z: 175 }, { x: 20, z: 155 }, { x: -10, z: 135 },
            { x: 25, z: 115 }, { x: -20, z: 95 }, { x: 15, z: 75 },
            { x: -10, z: 55 }, { x: 20, z: 35 }, { x: -15, z: 15 },
            { x: 25, z: -5 }, { x: -20, z: -25 },
            // Additional ammo in southern corridor
            { x: 30, z: 185 }, { x: -25, z: 165 }, { x: 35, z: 145 },
            { x: -30, z: 125 }, { x: 25, z: 85 }, { x: -25, z: 45 },
            { x: 30, z: 5 }, { x: -30, z: -35 },
            // Corner area
            { x: 15, z: -55 }, { x: -25, z: -75 }, { x: 25, z: -65 },
            { x: -15, z: -85 },
            // Western corridor - more ammo for dragon fights
            { x: -55, z: -95 }, { x: -85, z: -105 }, { x: -115, z: -90 },
            { x: -145, z: -100 }, { x: -170, z: -95 },
            { x: -65, z: -80 }, { x: -95, z: -115 }, { x: -125, z: -80 },
            { x: -155, z: -115 }, { x: -175, z: -85 }
        ],
        
        bombPositions: [
            // Extended southern corridor - more bombs
            { x: 20, z: 180 }, { x: -15, z: 145 }, { x: 25, z: 105 },
            { x: -20, z: 65 }, { x: 15, z: 25 }, { x: -10, z: -15 },
            // Additional bombs
            { x: -25, z: 170 }, { x: 30, z: 130 }, { x: -30, z: 90 },
            { x: 25, z: 50 }, { x: -25, z: 10 },
            // Corner - more bombs
            { x: -20, z: -60 }, { x: 20, z: -70 }, { x: -10, z: -80 },
            // Western corridor - lots of bombs for dragons
            { x: -70, z: -90 }, { x: -100, z: -110 }, { x: -135, z: -85 },
            { x: -165, z: -105 }, { x: -60, z: -115 }, { x: -90, z: -80 },
            { x: -120, z: -115 }, { x: -150, z: -80 }, { x: -180, z: -100 }
        ],
        
        healthPositions: [
            // Extended southern corridor - more health
            { x: -10, z: 160 }, { x: 15, z: 125 }, { x: -15, z: 85 },
            { x: 10, z: 45 }, { x: -10, z: 5 },
            // Additional health pickups
            { x: 25, z: 175 }, { x: -20, z: 140 }, { x: 20, z: 100 },
            { x: -15, z: 60 }, { x: 25, z: 20 }, { x: -20, z: -20 },
            // Corner - extra health for dragon fight prep
            { x: 5, z: -65 }, { x: -15, z: -75 }, { x: 15, z: -85 },
            // Western corridor - health for dragon battles
            { x: -75, z: -105 }, { x: -125, z: -95 }, { x: -155, z: -100 },
            { x: -65, z: -85 }, { x: -95, z: -110 }, { x: -140, z: -80 },
            { x: -175, z: -110 }
        ],
        
        // Herz-Man pickup positions (presents with bow)
        herzmanPositions: [
            { x: 0, z: 150 }, { x: -10, z: 80 }, { x: 15, z: 10 },
            { x: -5, z: -60 }, { x: -100, z: -100 }, { x: -160, z: -95 }
        ],
        
        // No materials in Level 2
        materials: [],
        
        // MANY MORE traps in Level 2
        trapPositions: [
            // Extended southern corridor - lots of traps!
            { x: -5, z: 185 }, { x: 15, z: 175 }, { x: -20, z: 165 },
            { x: 10, z: 150 }, { x: -15, z: 140 }, { x: 20, z: 130 },
            { x: -10, z: 115 }, { x: 5, z: 105 }, { x: -25, z: 95 },
            { x: 15, z: 85 }, { x: -5, z: 70 }, { x: 20, z: 60 },
            { x: -15, z: 50 }, { x: 10, z: 40 }, { x: -20, z: 25 },
            { x: 5, z: 15 }, { x: -10, z: 0 }, { x: 15, z: -10 },
            { x: -5, z: -25 }, { x: 20, z: -35 },
            // Corner area - tight trap field
            { x: 15, z: -50 }, { x: -10, z: -55 }, { x: 5, z: -65 },
            { x: -20, z: -70 }, { x: 10, z: -80 },
            // Western corridor - more traps
            { x: -50, z: -85 }, { x: -65, z: -95 }, { x: -75, z: -110 },
            { x: -90, z: -85 }, { x: -105, z: -100 }, { x: -120, z: -115 },
            { x: -135, z: -90 }, { x: -150, z: -105 }, { x: -165, z: -95 },
            { x: -175, z: -110 }
        ],
        
        // Tree positions for Level 2 - frosted trees along the L
        treePositions: [
            // Extended southern corridor trees
            { x: -35, z: 185 }, { x: 35, z: 175 }, { x: -40, z: 155 },
            { x: 40, z: 145 }, { x: -35, z: 125 }, { x: 35, z: 115 },
            { x: -40, z: 95 }, { x: 40, z: 85 }, { x: -35, z: 65 },
            { x: 35, z: 55 }, { x: -40, z: 35 }, { x: 40, z: 25 },
            { x: -35, z: 5 }, { x: 35, z: -5 }, { x: -40, z: -25 },
            { x: 40, z: -35 },
            // Some trees scattered inside corridor
            { x: -15, z: 170 }, { x: 20, z: 140 }, { x: -10, z: 110 },
            { x: 15, z: 80 }, { x: -20, z: 50 }, { x: 25, z: 20 },
            { x: -15, z: -10 }, { x: 10, z: -40 },
            // Corner area trees
            { x: -40, z: -50 }, { x: 40, z: -55 }, { x: -35, z: -75 },
            // Western corridor trees
            { x: -55, z: -70 }, { x: -55, z: -130 }, { x: -85, z: -70 },
            { x: -85, z: -130 }, { x: -115, z: -70 }, { x: -115, z: -130 },
            { x: -145, z: -70 }, { x: -145, z: -130 }, { x: -175, z: -70 },
            { x: -175, z: -130 },
            // Trees near treasure
            { x: -190, z: -85 }, { x: -190, z: -115 }
        ],
        
        // Rock positions for Level 2 - icy rocks scattered throughout
        rockPositions: [
            // Extended southern corridor rocks - many scattered
            { x: -25, z: 190 }, { x: 30, z: 185 }, { x: -10, z: 178 },
            { x: 15, z: 168 }, { x: -30, z: 160 }, { x: 25, z: 152 },
            { x: -18, z: 145 }, { x: 12, z: 138 }, { x: -28, z: 128 },
            { x: 22, z: 122 }, { x: -15, z: 112 }, { x: 18, z: 102 },
            { x: -22, z: 92 }, { x: 28, z: 88 }, { x: -12, z: 78 },
            { x: 15, z: 68 }, { x: -25, z: 58 }, { x: 20, z: 48 },
            { x: -18, z: 38 }, { x: 25, z: 28 }, { x: -10, z: 18 },
            { x: 12, z: 8 }, { x: -22, z: -2 }, { x: 18, z: -12 },
            { x: -15, z: -22 }, { x: 28, z: -32 }, { x: -8, z: -42 },
            // Corner area rocks
            { x: -30, z: -52 }, { x: 25, z: -58 }, { x: -15, z: -68 },
            { x: 10, z: -78 }, { x: -25, z: -85 },
            // Western corridor rocks - scattered
            { x: -52, z: -80 }, { x: -48, z: -115 }, { x: -68, z: -88 },
            { x: -72, z: -108 }, { x: -88, z: -82 }, { x: -92, z: -118 },
            { x: -108, z: -88 }, { x: -112, z: -112 }, { x: -128, z: -82 },
            { x: -132, z: -118 }, { x: -148, z: -88 }, { x: -152, z: -112 },
            { x: -168, z: -82 }, { x: -172, z: -118 },
            // Near treasure
            { x: -185, z: -88 }, { x: -185, z: -112 }, { x: -195, z: -100 }
        ]
    },
    
    3: {
        name: "Level 3 - The Scorching Sands",
        
        // Player start position - south side of desert
        playerStart: { x: 0, z: 180 },
        
        // Portal to Level 4 - Lava Caves
        portal: { x: 0, z: -180, destinationLevel: 4 },
        
        // Unique elements for level 3
        desertTheme: true,
        skyColor: 0xd4a574,  // Match fog color for seamless fade
        groundColor: 0xe8c36a,  // Sandy ground
        fogDensity: 0.02,
        fogColor: 0xd4a574,  // Sandy dust haze
        
        // No river or materials in desert
        hasRiver: false,
        hasMaterials: false,
        
        // No mountains in desert
        hasMountains: false,
        
        // Theme colors for desert level
        hillColor: 0xc4a14a,       // Sandy dune color
        treeColor: 0x2d5a27,       // Cactus/palm green
        grassColor: 0xc4a14a,      // Sandy grass
        
        // Level 3 has no treasure - portal leads to Level 4
        hasTreasure: false,
        
        // Rainbow position - at the portal
        rainbow: { x: 0, z: -175 },
        
        // Dragon spawn position
        dragon: { x: 0, z: -120 },
        extraDragons: [
            { x: -80, z: -60 },
            { x: 80, z: -60 }
        ],
        
        // World Kite position - near spawn for easy collection
        worldKite: { x: 5, z: 170 },

        // No Ice Berg in desert
        iceBerg: null,

        // Sand dunes instead of hills
        hills: [
            // Scattered dunes across the desert
            { x: -60, z: 150, radius: 12, height: 3 },
            { x: 60, z: 140, radius: 14, height: 3.5 },
            { x: -40, z: 100, radius: 10, height: 2.5 },
            { x: 80, z: 80, radius: 15, height: 4 },
            { x: -80, z: 60, radius: 13, height: 3 },
            { x: 40, z: 40, radius: 11, height: 2.5 },
            { x: -60, z: 0, radius: 12, height: 3 },
            { x: 60, z: -20, radius: 14, height: 3.5 },
            { x: -40, z: -60, radius: 10, height: 2.5 },
            { x: 80, z: -80, radius: 15, height: 4 },
            { x: -80, z: -100, radius: 13, height: 3 },
            { x: 40, z: -140, radius: 11, height: 2.5 }
        ],
        
        // No mountains
        mountains: [],
        
        // Pyramids for atmosphere
        pyramids: [
            { x: -120, z: 80, size: 25, height: 35 },   // Large pyramid on the left
            { x: 130, z: 60, size: 20, height: 28 },    // Medium pyramid on the right
            { x: -100, z: -80, size: 18, height: 25 },  // Medium pyramid mid-left
            { x: 140, z: -100, size: 30, height: 42 },  // Largest pyramid far right
            { x: -140, z: -140, size: 15, height: 20 }  // Small pyramid near treasure area
        ],
        
        // Boundary for spawning wild tornados (outside this = danger zone)
        safeZoneBounds: { minX: -100, maxX: 100, minZ: -170, maxZ: 175 },
        
        // Goblins scattered through desert [x, z, patrolLeft, patrolRight, speed]
        goblins: [
            // Near spawn area
            [30, 160, 25, 35, 0.012],
            [-35, 150, -40, -30, 0.013],
            [20, 120, 15, 25, 0.014],
            [-25, 100, -30, -20, 0.012],
            // Mid desert
            [40, 60, 35, 45, 0.013],
            [-50, 40, -55, -45, 0.014],
            [35, 0, 30, 40, 0.012],
            [-45, -30, -50, -40, 0.013],
            // Near treasure
            [30, -100, 25, 35, 0.014],
            [-35, -120, -40, -30, 0.013],
            [25, -150, 20, 30, 0.012]
        ],
        
        // Guardians protecting key areas [x, z, patrolLeft, patrolRight, speed]
        guardians: [
            [60, 80, 55, 65, 0.01],
            [-70, 50, -75, -65, 0.011],
            [50, -40, 45, 55, 0.01],
            [-60, -80, -65, -55, 0.011]
        ],
        
        // Giants in the desert
        giants: [
            [0, 60, -10, 10],
            [-60, -40, -70, -50],
            [60, -100, 50, 70]
        ],
        
        // Wizards casting fireballs [x, z, patrolLeft, patrolRight, speed]
        wizards: [
            [50, 120, 45, 55, 0.007],
            [-55, 70, -60, -50, 0.008],
            [45, 10, 40, 50, 0.007],
            [-50, -50, -55, -45, 0.008],
            [40, -110, 35, 45, 0.007]
        ],
        
        // Mummies - guarding the offset chokepoint gaps [x, z, patrolLeft, patrolRight, speed]
        mummies: [
            // Guard first chokepoint gap at z=120 (LEFT side gap around x=-50)
            [-50, 120, -60, -40, 0.01],
            [-45, 115, -55, -35, 0.008],
            [-55, 125, -65, -45, 0.008],
            // Guard second chokepoint at z=40 (RIGHT side gap around x=50)
            [50, 45, 40, 60, 0.009],
            [55, 40, 45, 65, 0.008],
            // Guard third chokepoint at z=-40 (LEFT side gap around x=-40)
            [-40, -35, -50, -30, 0.01],
            [-45, -45, -55, -35, 0.009],
            // Guard fourth chokepoint at z=-100 (RIGHT side gap around x=45)
            [45, -95, 35, 55, 0.01],
            [50, -105, 40, 60, 0.009],
            // Guard final approach at z=-150 (center gap)
            [0, -145, -10, 10, 0.01]
        ],
        
        hardModeGoblins: [
            // Extra goblins in hard mode
            [45, 170, 40, 50, 0.016],
            [-50, 130, -55, -45, 0.015],
            [55, 90, 50, 60, 0.016],
            [-45, 50, -50, -40, 0.015],
            [50, -10, 45, 55, 0.016],
            [-55, -70, -60, -50, 0.015],
            [45, -130, 40, 50, 0.016],
            [-50, -160, -55, -45, 0.015]
        ],
        
        // Birds flying over desert - more to increase difficulty
        birds: [
            [0, 150, 30, 0.006],     // Near spawn
            [-50, 100, 35, 0.005],   // Left side near first chokepoint
            [50, 80, 32, 0.007],     // Right side
            [0, 40, 28, 0.006],      // Center at second chokepoint
            [-40, 0, 30, 0.005],     // Left mid area
            [45, -40, 35, 0.006],    // Right at third chokepoint
            [0, -80, 32, 0.007],     // Center lower
            [-50, -120, 30, 0.005],  // Left near fourth chokepoint
            [40, -150, 28, 0.006]    // Right near portal
        ],
        
        // Ammo pickups across the desert - extra for survivability
        ammoPositions: [
            { x: 20, z: 170 }, { x: -25, z: 140 }, { x: 30, z: 110 },
            { x: -35, z: 80 }, { x: 25, z: 50 }, { x: -30, z: 20 },
            { x: 35, z: -10 }, { x: -25, z: -40 }, { x: 30, z: -70 },
            { x: -35, z: -100 }, { x: 25, z: -130 }, { x: -30, z: -160 },
            { x: 60, z: 130 }, { x: -65, z: 100 }, { x: 55, z: 30 },
            { x: -60, z: -30 }, { x: 50, z: -90 }, { x: -55, z: -140 },
            // Extra ammo near canyon walls
            { x: 15, z: 95 }, { x: -15, z: 70 }, { x: 10, z: 45 },
            { x: -10, z: 10 }, { x: 15, z: -25 }, { x: -10, z: -55 },
            { x: 10, z: -85 }, { x: -15, z: -115 }, { x: 0, z: 160 },
            { x: 0, z: 0 }, { x: 0, z: -70 }, { x: 0, z: -140 }
        ],
        
        // Bomb pickups across the desert
        bombPositions: [
            { x: 0, z: 150 },
            { x: -40, z: 90 },
            { x: 45, z: 40 },
            { x: -35, z: -20 },
            { x: 40, z: -80 },
            { x: 0, z: -130 }
        ],
        
        // Health pickups - extra scattered throughout for survivability
        healthPositions: [
            { x: 0, z: 170 },
            { x: 30, z: 140 },
            { x: -35, z: 110 },
            { x: 0, z: 120 },
            { x: -50, z: 80 },
            { x: 45, z: 60 },
            { x: -50, z: 40 },
            { x: 50, z: 20 },
            { x: -40, z: -10 },
            { x: 40, z: -35 },
            { x: 50, z: -50 },
            { x: -45, z: -70 },
            { x: 0, z: -100 },
            { x: 45, z: -120 },
            { x: -40, z: -150 },
            // Extra health in canyon chokepoints
            { x: 5, z: 85 },
            { x: -5, z: 55 },
            { x: 5, z: 25 },
            { x: -5, z: -5 },
            { x: 5, z: -45 },
            { x: -5, z: -75 },
            { x: 5, z: -105 },
            { x: -5, z: -135 },
            { x: 25, z: 165 },
            { x: -25, z: -175 },
            { x: 0, z: -165 }
        ],
        
        // Herz-Man pickup positions (presents with bow)
        herzmanPositions: [
            { x: 25, z: 150 }, { x: -30, z: 100 }, { x: 40, z: 40 },
            { x: -35, z: -30 }, { x: 30, z: -90 }, { x: -20, z: -150 }
        ],
        
        // Trap positions (quicksand pits in desert)
        trapPositions: [
            { x: 30, z: 140 },
            { x: -40, z: 110 },
            { x: 50, z: 60 },
            { x: -30, z: 10 },
            { x: 40, z: -40 },
            { x: -50, z: -80 },
            { x: 30, z: -110 },
            { x: -40, z: -140 }
        ],
        
        // Cacti and palm positions (replaces trees)
        treePositions: [
            // Cacti scattered densely throughout the desert
            { x: -30, z: 160, type: 'cactus' }, { x: 45, z: 145, type: 'cactus' },
            { x: -55, z: 120, type: 'cactus' }, { x: 70, z: 100, type: 'cactus' },
            { x: -40, z: 70, type: 'cactus' }, { x: 50, z: 55, type: 'cactus' },
            { x: -65, z: 30, type: 'cactus' }, { x: 35, z: 10, type: 'cactus' },
            { x: -45, z: -25, type: 'cactus' }, { x: 60, z: -45, type: 'cactus' },
            { x: -55, z: -75, type: 'cactus' }, { x: 45, z: -95, type: 'cactus' },
            { x: -35, z: -125, type: 'cactus' }, { x: 55, z: -145, type: 'cactus' },
            // More cacti - near spawn area
            { x: 20, z: 175, type: 'cactus' }, { x: -50, z: 170, type: 'cactus' },
            { x: 65, z: 165, type: 'cactus' }, { x: -70, z: 155, type: 'cactus' },
            { x: 80, z: 140, type: 'cactus' }, { x: -80, z: 135, type: 'cactus' },
            // More cacti - upper mid area
            { x: 25, z: 110, type: 'cactus' }, { x: -20, z: 95, type: 'cactus' },
            { x: 85, z: 85, type: 'cactus' }, { x: -85, z: 80, type: 'cactus' },
            { x: 20, z: 65, type: 'cactus' }, { x: -75, z: 55, type: 'cactus' },
            // More cacti - mid area
            { x: 75, z: 40, type: 'cactus' }, { x: -25, z: 45, type: 'cactus' },
            { x: 55, z: 20, type: 'cactus' }, { x: -80, z: 15, type: 'cactus' },
            { x: 80, z: -10, type: 'cactus' }, { x: -15, z: -5, type: 'cactus' },
            // More cacti - lower mid area
            { x: 25, z: -30, type: 'cactus' }, { x: -70, z: -35, type: 'cactus' },
            { x: 75, z: -55, type: 'cactus' }, { x: -25, z: -60, type: 'cactus' },
            { x: 20, z: -85, type: 'cactus' }, { x: -80, z: -90, type: 'cactus' },
            // More cacti - near portal
            { x: 70, z: -110, type: 'cactus' }, { x: -70, z: -115, type: 'cactus' },
            { x: 80, z: -135, type: 'cactus' }, { x: -75, z: -140, type: 'cactus' },
            { x: 65, z: -160, type: 'cactus' }, { x: -65, z: -165, type: 'cactus' },
            // Small oasis with palms near first chokepoint
            { x: -85, z: 110, type: 'palm' }, { x: -90, z: 105, type: 'palm' },
            { x: -80, z: 100, type: 'palm' },
            // Small oasis mid-right
            { x: 90, z: 50, type: 'palm' }, { x: 85, z: 45, type: 'palm' },
            { x: 95, z: 40, type: 'palm' },
            // Small oasis mid-left
            { x: -90, z: -50, type: 'palm' }, { x: -85, z: -55, type: 'palm' },
            // Main oasis near portal (treasure area)
            { x: -15, z: -165, type: 'palm' }, { x: 15, z: -170, type: 'palm' },
            { x: -20, z: -185, type: 'palm' }, { x: 20, z: -185, type: 'palm' },
            { x: 0, z: -195, type: 'palm' }, { x: -30, z: -175, type: 'palm' },
            { x: 30, z: -180, type: 'palm' }, { x: 0, z: -175, type: 'palm' }
        ],
        
        // Boulder positions (large rocks instead of mountains)
        boulderPositions: [
            { x: -70, z: 170 }, { x: 75, z: 160 }, { x: -80, z: 130 },
            { x: 85, z: 110 }, { x: -90, z: 80 }, { x: 90, z: 60 },
            { x: -85, z: 20 }, { x: 80, z: -10 }, { x: -75, z: -50 },
            { x: 85, z: -70 }, { x: -90, z: -110 }, { x: 75, z: -130 },
            { x: -80, z: -160 }, { x: 80, z: -170 },
            // Some in the middle
            { x: -20, z: 90 }, { x: 25, z: 70 }, { x: -15, z: -20 },
            { x: 20, z: -60 }, { x: -25, z: -90 }
        ],
        
        // Regular rock positions
        rockPositions: [
            { x: -25, z: 175 }, { x: 30, z: 165 }, { x: -35, z: 135 },
            { x: 40, z: 115 }, { x: -30, z: 85 }, { x: 35, z: 65 },
            { x: -40, z: 35 }, { x: 30, z: 5 }, { x: -35, z: -35 },
            { x: 40, z: -65 }, { x: -30, z: -95 }, { x: 35, z: -125 },
            { x: -25, z: -155 }, { x: 30, z: -175 }
        ],
        
        // Canyon walls - create winding chokepoints forcing player through mummy areas
        // Gaps are offset to alternate sides, making navigation harder
        // Each wall has: x, z, width, depth, height, rotation (in radians)
        canyonWalls: [
            // First chokepoint around z=120 - gap on LEFT side (around x=-50)
            { x: -100, z: 120, width: 30, depth: 8, height: 12, rotation: 0 },  // Far left wall
            { x: 30, z: 120, width: 140, depth: 8, height: 12, rotation: 0 },   // Large right wall

            // Second chokepoint around z=40 - gap on RIGHT side (around x=50)
            { x: -30, z: 40, width: 140, depth: 8, height: 14, rotation: 0 },   // Large left wall
            { x: 100, z: 40, width: 30, depth: 8, height: 14, rotation: 0 },    // Far right wall

            // Third chokepoint around z=-40 - gap on LEFT side (around x=-40)
            { x: -110, z: -40, width: 25, depth: 8, height: 12, rotation: 0 },  // Far left wall
            { x: 25, z: -40, width: 150, depth: 8, height: 12, rotation: 0 },   // Large right wall

            // Fourth chokepoint around z=-100 - gap on RIGHT side (around x=45)
            { x: -25, z: -100, width: 150, depth: 8, height: 14, rotation: 0 }, // Large left wall
            { x: 110, z: -100, width: 25, depth: 8, height: 14, rotation: 0 },  // Far right wall

            // Final approach around z=-150 - narrow gap in CENTER (harder final stretch)
            { x: -55, z: -150, width: 70, depth: 8, height: 16, rotation: 0 },
            { x: 55, z: -150, width: 70, depth: 8, height: 16, rotation: 0 }
        ],
        
        // Scarabs scattered throughout the desert - collect them all!
        scarabs: [
            { x: -30, z: 150 },     // Near spawn, left side
            { x: 50, z: 130 },      // Near first chokepoint, right
            { x: -70, z: 90 },      // Before second chokepoint, far left
            { x: 0, z: 60 },        // Center of desert
            { x: 65, z: 20 },       // Right side mid desert
            { x: -45, z: -30 },     // Between third chokepoint
            { x: 30, z: -70 },      // Lower mid area
            { x: -60, z: -120 },    // Near fourth chokepoint
            { x: 0, z: -160 }       // Near portal
        ],

        // Message to show player about scarabs
        scarabMessage: "Collect all Ancient Scarabs to unlock the portal!"
    },
    
    4: {
        name: "Level 4 - The Lava Caves",
        
        // Player start position - south side of caves
        playerStart: { x: 0, z: 180 },
        
        // No portal - final level
        portal: null,
        
        // Unique elements for level 4
        lavaTheme: true,
        hasCeiling: true,           // Underground - has a ceiling
        ceilingHeight: 25,          // Height of the cave ceiling
        skyColor: 0x331100,         // Match fog color for seamless fade
        groundColor: 0x8a6a50,      // Medium brown - visible but cave-like
        fogDensity: 0.02,           // Dense fog to hide clipping
        fogColor: 0x331100,         // Dark red/orange smoke
        
        // No river or materials
        hasRiver: false,
        hasMaterials: false,
        
        // No mountains - underground
        hasMountains: false,
        
        // Theme colors for lava level
        hillColor: 0x3a2a1a,        // Dark rock color
        treeColor: 0x4a3a2a,        // Stalagmite color
        grassColor: 0x2a1a0a,       // Dark ground
        
        // Level 4 has the treasure
        hasTreasure: true,
        
        // Treasure position - at the far end of the caves
        treasurePosition: { x: 0, z: -180 },
        
        // Rainbow position - above the treasure
        rainbow: { x: 0, z: -175 },
        
        // Dragon in lava level - positioned in open area near treasure
        dragon: { x: 0, z: -120, y: 12 },  // y: 12 keeps it below ceiling (25)
        extraDragons: [
            { x: -60, z: -80, y: 10, scale: 0.7, health: 30 },
            { x: 60, z: -80, y: 10, scale: 0.7, health: 30 }
        ],
        
        // World Kite position - near spawn for easy collection
        worldKite: { x: 5, z: 170 },

        // Ice Berg position - becomes a "cool rock" safe zone
        iceBerg: { x: 0, z: 100 },

        // Lava pools - touching these is instant death
        lavaPools: [
            // Far back area (z: 160-200)
            { x: -80, z: 180, radius: 12 },
            { x: -40, z: 190, radius: 10 },
            { x: 10, z: 185, radius: 8 },
            { x: 50, z: 175, radius: 11 },
            { x: 90, z: 185, radius: 9 },
            // Upper area (z: 100-160)
            { x: -100, z: 150, radius: 14 },
            { x: -60, z: 150, radius: 15 },
            { x: -30, z: 140, radius: 9 },
            { x: 0, z: 155, radius: 7 },
            { x: 35, z: 145, radius: 10 },
            { x: 60, z: 130, radius: 14 },
            { x: 95, z: 140, radius: 11 },
            { x: -85, z: 110, radius: 10 },
            { x: -50, z: 105, radius: 8 },
            { x: 20, z: 115, radius: 9 },
            { x: 75, z: 100, radius: 12 },
            // Upper-mid area (z: 40-100)
            { x: -95, z: 80, radius: 13 },
            { x: -65, z: 70, radius: 11 },
            { x: -35, z: 85, radius: 8 },
            { x: -10, z: 60, radius: 10 },
            { x: 25, z: 75, radius: 9 },
            { x: 55, z: 55, radius: 12 },
            { x: 85, z: 70, radius: 10 },
            { x: -80, z: 45, radius: 9 },
            { x: -45, z: 50, radius: 7 },
            // Removed pool at x: 10, z: 40 - too close to spawn
            { x: 70, z: 45, radius: 11 },
            // Mid area (z: -20 to 40)
            { x: -90, z: 20, radius: 12 },
            { x: -55, z: 15, radius: 9 },
            { x: -25, z: 25, radius: 7 },
            // Removed pool at x: 5, z: 5 - too close to spawn
            { x: 40, z: 20, radius: 8 },
            { x: 75, z: 10, radius: 13 },
            { x: -70, z: -10, radius: 10 },
            { x: -35, z: -5, radius: 8 },
            { x: 25, z: -15, radius: 9 },
            { x: 60, z: -5, radius: 11 },
            { x: 95, z: -15, radius: 8 },
            // Lower-mid area (z: -80 to -20)
            { x: -100, z: -40, radius: 11 },
            { x: -65, z: -35, radius: 9 },
            { x: -30, z: -45, radius: 8 },
            { x: 0, z: -30, radius: 7 },
            { x: 35, z: -40, radius: 10 },
            { x: 70, z: -35, radius: 12 },
            { x: -85, z: -65, radius: 10 },
            { x: -50, z: -70, radius: 8 },
            { x: -15, z: -60, radius: 9 },
            { x: 20, z: -75, radius: 7 },
            { x: 55, z: -65, radius: 11 },
            { x: 90, z: -70, radius: 9 },
            // Lower area (z: -140 to -80)
            { x: -95, z: -100, radius: 12 },
            { x: -60, z: -95, radius: 10 },
            { x: -25, z: -105, radius: 8 },
            { x: 10, z: -90, radius: 9 },
            { x: 45, z: -100, radius: 11 },
            { x: 80, z: -95, radius: 10 },
            { x: -75, z: -125, radius: 9 },
            { x: -40, z: -130, radius: 8 },
            { x: 0, z: -120, radius: 7 },
            { x: 35, z: -135, radius: 10 },
            { x: 70, z: -125, radius: 12 },
            // Deep area (z: -180 to -140)
            { x: -90, z: -155, radius: 11 },
            { x: -55, z: -160, radius: 9 },
            { x: -20, z: -150, radius: 8 },
            { x: 25, z: -160, radius: 10 },
            { x: 60, z: -155, radius: 12 },
            { x: 95, z: -165, radius: 9 },
            { x: -70, z: -180, radius: 10 },
            { x: -30, z: -185, radius: 8 },
            { x: 40, z: -180, radius: 11 },
            { x: 80, z: -190, radius: 9 }
        ],
        
        // Hill positions - rocky formations
        hills: [
            { x: -40, z: 160, radius: 6, height: 4 },
            { x: 45, z: 140, radius: 7, height: 5 },
            { x: -50, z: 100, radius: 5, height: 3 },
            { x: 40, z: 80, radius: 6, height: 4 },
            { x: -35, z: 40, radius: 7, height: 5 },
            { x: 50, z: 20, radius: 5, height: 3 },
            { x: -45, z: -30, radius: 6, height: 4 },
            { x: 35, z: -60, radius: 7, height: 5 },
            { x: -40, z: -100, radius: 5, height: 3 },
            { x: 45, z: -140, radius: 6, height: 4 }
        ],

        // Lava flows from rocks - visual effect of lava cascading down
        lavaFlows: [
            { x: -40, z: 160, length: 8, direction: 0.5 },      // From first hill
            { x: 45, z: 140, length: 10, direction: -0.3 },     // From second hill
            { x: 40, z: 80, length: 7, direction: 0.8 },        // From fourth hill
            { x: -35, z: 40, length: 9, direction: -0.6 },      // From fifth hill
            { x: 50, z: 20, length: 6, direction: 0.4 },        // From sixth hill
            { x: 35, z: -60, length: 8, direction: -0.7 },      // From eighth hill
            { x: 45, z: -140, length: 7, direction: 0.2 }       // From tenth hill
        ],

        // Crevices - deep dark pits that players can fall into (instant death)
        crevices: [
            { x: -70, z: 130, width: 4, length: 15, rotation: 0.3 },    // Near spawn left
            { x: 80, z: 120, width: 3, length: 12, rotation: -0.2 },    // Near spawn right
            { x: -60, z: 30, width: 5, length: 18, rotation: 0.5 },     // Mid-left
            { x: 70, z: -20, width: 4, length: 14, rotation: -0.4 },    // Mid-right
            { x: -50, z: -70, width: 3, length: 16, rotation: 0.2 },    // Lower-left
            { x: 65, z: -100, width: 4, length: 12, rotation: -0.3 },   // Lower-right
            { x: 0, z: -140, width: 5, length: 20, rotation: 0 }        // Before treasure
        ],

        // No mountains - underground
        mountains: [],
        
        // Goblins scattered through caves [x, z, patrolLeft, patrolRight, speed]
        goblins: [
            // Near spawn
            [30, 165, 25, 35, 0.014],
            [-35, 155, -40, -30, 0.013],
            [20, 130, 15, 25, 0.015],
            [-25, 110, -30, -20, 0.014],
            // Mid caves
            [35, 70, 30, 40, 0.015],
            [-40, 45, -45, -35, 0.014],
            [30, 15, 25, 35, 0.013],
            [-35, -15, -40, -30, 0.015],
            [25, -45, 20, 30, 0.014],
            [-30, -75, -35, -25, 0.015],
            // Near treasure
            [35, -110, 30, 40, 0.014],
            [-40, -135, -45, -35, 0.015],
            [25, -160, 20, 30, 0.013],
            [-30, -170, -35, -25, 0.014],
            // Extra scattered goblins
            [0, 90, -5, 5, 0.012],
            [10, 30, 5, 15, 0.013],
            [-10, -40, -15, -5, 0.012],
            [5, -100, 0, 10, 0.014]
        ],
        
        // Guardians protecting key areas [x, z, patrolLeft, patrolRight, speed]
        guardians: [
            [45, 120, 40, 50, 0.01],
            [-50, 60, -55, -45, 0.011],
            [40, -30, 35, 45, 0.01],
            [-45, -80, -50, -40, 0.011],
            [35, -145, 30, 40, 0.01],
            [-40, -165, -45, -35, 0.011]
        ],
        
        // Giants in the caves
        giants: [
            [0, 50, -10, 10],
            [-30, -50, -40, -20],
            [30, -120, 20, 40]
        ],
        
        // No wizards or mummies in lava level
        wizards: [],
        mummies: [],
        
        // Lava monsters - unique to lava caves [x, z, patrolLeft, patrolRight, speed]
        lavaMonsters: [
            [-40, 130, -50, -30, 0.009],
            [40, 90, 30, 50, 0.008],
            [-50, 30, -60, -40, 0.009],
            [45, -20, 35, 55, 0.008],
            [-35, -70, -45, -25, 0.009],
            [50, -130, 40, 60, 0.008]
        ],
        
        hardModeGoblins: [
            [40, 175, 35, 45, 0.016],
            [-45, 145, -50, -40, 0.017],
            [50, 95, 45, 55, 0.016],
            [-55, 35, -60, -50, 0.017],
            [45, -25, 40, 50, 0.016],
            [-50, -65, -55, -45, 0.017],
            [40, -115, 35, 45, 0.016],
            [-45, -155, -50, -40, 0.017]
        ],
        
        // Cave bats (bomb birds that patrol the lava caves)
        birds: [
            [0, 100, 30, 0.005],      // Center patrol near spawn
            [-40, 50, 25, 0.006],     // Left side patrol
            [40, 0, 28, 0.005],       // Right side patrol
            [0, -50, 32, 0.004],      // Mid-cave patrol
            [-30, -100, 26, 0.006],   // Deep left patrol
            [30, -130, 24, 0.005]     // Near treasure patrol
        ],
        
        // Ammo pickups
        ammoPositions: [
            { x: 15, z: 170 }, { x: -20, z: 145 }, { x: 25, z: 115 },
            { x: -30, z: 85 }, { x: 20, z: 55 }, { x: -25, z: 25 },
            { x: 30, z: -5 }, { x: -20, z: -35 }, { x: 25, z: -65 },
            { x: -30, z: -95 }, { x: 20, z: -125 }, { x: -25, z: -155 },
            { x: 0, z: 140 }, { x: 0, z: 70 }, { x: 0, z: 0 },
            { x: 0, z: -70 }, { x: 0, z: -140 }
        ],
        
        // Bomb pickups
        bombPositions: [
            { x: 10, z: 160 },
            { x: -15, z: 100 },
            { x: 20, z: 40 },
            { x: -10, z: -20 },
            { x: 15, z: -80 },
            { x: -20, z: -140 }
        ],
        
        // Health pickups - many for survivability
        healthPositions: [
            { x: 5, z: 175 }, { x: -10, z: 155 }, { x: 15, z: 135 },
            { x: -5, z: 115 }, { x: 10, z: 95 }, { x: -15, z: 75 },
            { x: 5, z: 55 }, { x: -10, z: 35 }, { x: 15, z: 15 },
            { x: -5, z: -5 }, { x: 10, z: -25 }, { x: -15, z: -45 },
            { x: 5, z: -65 }, { x: -10, z: -85 }, { x: 15, z: -105 },
            { x: -5, z: -125 }, { x: 10, z: -145 }, { x: -15, z: -165 },
            { x: 0, z: 180 }, { x: 0, z: 120 }, { x: 0, z: 60 },
            { x: 0, z: -60 }, { x: 0, z: -120 }
        ],
        
        // Herz-Man pickup positions (presents with bow)
        herzmanPositions: [
            { x: 5, z: 160 }, { x: -10, z: 90 }, { x: 10, z: 20 },
            { x: -5, z: -50 }, { x: 5, z: -120 }
        ],
        
        // Trap positions (lava vents)
        trapPositions: [
            { x: 35, z: 150 },
            { x: -40, z: 110 },
            { x: 30, z: 60 },
            { x: -35, z: 10 },
            { x: 40, z: -40 },
            { x: -30, z: -90 },
            { x: 35, z: -130 }
        ],
        
        // No trees in lava caves
        treePositions: [],
        
        // Boulder positions (large volcanic rocks) - includes former stalagmite positions
        boulderPositions: [
            // Original boulders
            { x: -55, z: 165 }, { x: 55, z: 145 },
            { x: -60, z: 90 }, { x: 60, z: 60 },
            { x: -55, z: 10 }, { x: 55, z: -30 },
            { x: -60, z: -70 }, { x: 60, z: -110 },
            { x: -55, z: -150 }, { x: 55, z: -170 },
            // Converted from stalagmites
            { x: -30, z: 170 }, { x: 40, z: 160 },
            { x: -45, z: 130 }, { x: 50, z: 110 },
            { x: -35, z: 70 }, { x: 45, z: 50 },
            { x: -50, z: 20 }, { x: 40, z: -10 },
            { x: -40, z: -50 }, { x: 50, z: -70 },
            { x: -45, z: -110 }, { x: 40, z: -140 },
            { x: -35, z: -170 }, { x: 45, z: -175 }
        ],
        
        // Rock positions
        rockPositions: [
            { x: -25, z: 175 }, { x: 30, z: 165 },
            { x: -35, z: 140 }, { x: 40, z: 120 },
            { x: -30, z: 80 }, { x: 35, z: 55 },
            { x: -40, z: 25 }, { x: 30, z: -10 },
            { x: -35, z: -55 }, { x: 40, z: -85 },
            { x: -30, z: -125 }, { x: 35, z: -155 }
        ],
        
        // Cave walls - labyrinth structure with internal walls
        canyonWalls: [
            // Outer walls
            // North wall (back of cave) - full width
            { x: 0, z: -200, width: 260, depth: 12, height: 25, rotation: 0 },
            // South wall (front of cave) - full width, no gap
            { x: 0, z: 200, width: 260, depth: 12, height: 25, rotation: 0 },
            // West wall (left side) - connects north to south
            { x: -125, z: 0, width: 12, depth: 415, height: 25, rotation: 0 },
            // East wall (right side) - connects north to south
            { x: 125, z: 0, width: 12, depth: 415, height: 25, rotation: 0 },

            // Internal labyrinth walls - create winding path from spawn to treasure
            // Row 1 (near spawn z: 140-160) - blocks center, forces left or right
            { x: 0, z: 150, width: 100, depth: 10, height: 20, rotation: 0 },

            // Row 2 (z: 100-120) - blocks left side, forces right
            { x: -70, z: 110, width: 90, depth: 10, height: 20, rotation: 0 },

            // Row 3 (z: 50-70) - blocks right side, forces left
            { x: 70, z: 60, width: 90, depth: 10, height: 20, rotation: 0 },

            // Row 4 (z: 0-20) - blocks center-left, creates maze decision point
            { x: -30, z: 10, width: 80, depth: 10, height: 20, rotation: 0 },
            { x: 80, z: 10, width: 60, depth: 10, height: 20, rotation: 0 },

            // Row 5 (z: -40 to -60) - blocks right side
            { x: 50, z: -50, width: 100, depth: 10, height: 20, rotation: 0 },

            // Row 6 (z: -90 to -110) - blocks left side
            { x: -60, z: -100, width: 100, depth: 10, height: 20, rotation: 0 },

            // Row 7 (z: -140 to -160) - final approach, blocks center
            { x: 20, z: -150, width: 80, depth: 10, height: 20, rotation: 0 },

            // Vertical walls to create corridors
            { x: -50, z: 130, width: 10, depth: 50, height: 20, rotation: 0 },
            { x: 50, z: 85, width: 10, depth: 60, height: 20, rotation: 0 },
            { x: -80, z: -30, width: 10, depth: 70, height: 20, rotation: 0 },
            { x: 90, z: -75, width: 10, depth: 60, height: 20, rotation: 0 },
            { x: -40, z: -130, width: 10, depth: 50, height: 20, rotation: 0 }
        ],
        
        // No scarabs in lava level
        scarabs: []
    },

    5: {
        name: "Level 5 - The Deep Waters",

        // Player start position - far from treasure at z: -200
        playerStart: { x: 0, z: 180 },
        
        // Portal to next level
        portal: { x: 0, z: -220, destinationLevel: 6 },
        
        // Unique elements for level 5
        waterTheme: true,
        hasWaves: true,             // Animated water surface
        skyColor: 0x4488aa,         // Match fog color for seamless fade
        groundColor: 0x1E90FF,      // Dodger blue water
        fogDensity: 0.02,           // Dense fog to hide clipping
        fogColor: 0x4488aa,         // Misty blue
        
        // No river or materials
        hasRiver: false,
        hasMaterials: false,
        
        // Mountains as islands
        hasMountains: true,
        
        // Theme colors for water level
        hillColor: 0x8B7355,        // Sandy islands
        treeColor: 0x228B22,        // No trees - just decorative
        grassColor: 0x1E90FF,       // Water color
        
        // Level 5 has treasure
        hasTreasure: true,
        
        // Treasure position
        treasurePosition: { x: 0, z: -200 },
        
        // Rainbow position
        rainbow: { x: 0, z: -195 },
        
        // Water dragon (sea serpent) - positioned away from cliffs
        dragon: { x: -30, z: -175, y: 3 },
        extraDragons: [
            { x: -55, z: -60, y: 2, scale: 0.6, health: 25 },
            { x: 55, z: -130, y: 2, scale: 0.6, health: 25 },
            { x: -50, z: 35, y: 2, scale: 0.5, health: 20 },
            { x: 50, z: 85, y: 2, scale: 0.5, health: 20 }
        ],

        // World Kite - near spawn for easy collection
        worldKite: { x: 5, z: 170 },

        // Iceberg - safe zone in the water
        iceBerg: { x: 0, z: 80 },
        
        // Hills as small islands - many more to block line of sight
        hills: [
            // Original islands
            { x: -60, z: 120, radius: 8, height: 2 },
            { x: 55, z: 100, radius: 7, height: 2 },
            { x: -50, z: 50, radius: 6, height: 2 },
            { x: 60, z: 30, radius: 7, height: 2 },
            { x: -55, z: -20, radius: 8, height: 2 },
            { x: 50, z: -60, radius: 6, height: 2 },
            { x: -60, z: -100, radius: 7, height: 2 },
            { x: 55, z: -140, radius: 8, height: 2 },
            // Additional islands to create maze-like path
            { x: 0, z: 140, radius: 10, height: 3 },      // Center blocker near spawn
            { x: -30, z: 95, radius: 7, height: 2 },
            { x: 30, z: 75, radius: 8, height: 2 },
            { x: -25, z: 10, radius: 6, height: 2 },
            { x: 25, z: -10, radius: 7, height: 2 },
            { x: 0, z: -40, radius: 9, height: 3 },       // Center blocker mid
            { x: -35, z: -70, radius: 6, height: 2 },
            { x: 35, z: -85, radius: 7, height: 2 },
            { x: 0, z: -120, radius: 8, height: 2 },      // Center blocker
            { x: -30, z: -155, radius: 6, height: 2 },
            { x: 30, z: -170, radius: 7, height: 2 },
            // Small rocks/sandbars
            { x: -15, z: 160, radius: 4, height: 1 },
            { x: 20, z: 130, radius: 5, height: 1 },
            { x: -20, z: 65, radius: 4, height: 1 },
            { x: 15, z: -30, radius: 5, height: 1 },
            { x: -10, z: -90, radius: 4, height: 1 },
            { x: 10, z: -145, radius: 5, height: 1 }
        ],

        // Mountains as larger islands - more to create barriers
        mountains: [
            // Original islands on sides
            { x: -90, z: 150, radius: 15, height: 8 },
            { x: 85, z: 140, radius: 14, height: 7 },
            { x: -80, z: 80, radius: 12, height: 6 },
            { x: 90, z: 60, radius: 13, height: 7 },
            { x: -85, z: -30, radius: 14, height: 8 },
            { x: 80, z: -80, radius: 12, height: 6 },
            { x: -90, z: -130, radius: 15, height: 7 },
            { x: 85, z: -170, radius: 13, height: 8 },
            // Additional side islands
            { x: -40, z: 170, radius: 10, height: 5 },
            { x: 45, z: 160, radius: 11, height: 5 },
            { x: -70, z: 20, radius: 10, height: 5 },
            { x: 70, z: -10, radius: 11, height: 5 },
            { x: -65, z: -65, radius: 10, height: 5 },
            { x: 65, z: -50, radius: 10, height: 4 },
            { x: -75, z: -160, radius: 12, height: 6 },
            { x: 75, z: -145, radius: 11, height: 5 },
            // Regular center islands (can glide over)
            { x: -25, z: 80, radius: 15, height: 8 },
            { x: 30, z: 60, radius: 16, height: 9 },
            { x: -35, z: -30, radius: 14, height: 7 },
            { x: 25, z: -50, radius: 15, height: 8 },
            { x: -30, z: -130, radius: 14, height: 7 },
            { x: 35, z: -150, radius: 15, height: 8 }
        ],

        // IMPASSABLE CLIFFS - rock formations that block gliding, fewer and shorter
        impassableCliffs: [
            // Upper area - cliff on right, go left
            { x: 40, z: 120, radius: 25, height: 20 },

            // Mid-upper - cliff on left, go right
            { x: -40, z: 50, radius: 25, height: 22 },

            // Center - cliff on right, go left
            { x: 40, z: -20, radius: 25, height: 20 },

            // Mid-lower - cliff on left, go right
            { x: -40, z: -90, radius: 25, height: 22 },

            // Near treasure - cliff on right, go left
            { x: 40, z: -155, radius: 25, height: 20 }
        ],
        
        // Goblins as shark fins [x, z, patrolLeft, patrolRight, speed]
        goblins: [
            [25, 150, 20, 30, 0.016],
            [-30, 130, -35, -25, 0.015],
            [35, 90, 30, 40, 0.016],
            [-25, 70, -30, -20, 0.015],
            [30, 30, 25, 35, 0.016],
            [-35, 10, -40, -30, 0.015],
            [25, -30, 20, 30, 0.016],
            [-30, -60, -35, -25, 0.015],
            [35, -100, 30, 40, 0.016],
            [-25, -130, -30, -20, 0.015],
            [30, -160, 25, 35, 0.016],
            [-35, -180, -40, -30, 0.015],
            [0, 110, -5, 5, 0.014],
            [0, 50, -5, 5, 0.014],
            [0, -10, -5, 5, 0.014],
            [0, -70, -5, 5, 0.014],
            [0, -150, -5, 5, 0.014]
        ],
        
        // Guardians as octopuses [x, z, patrolLeft, patrolRight, speed] - many more!
        guardians: [
            // Near spawn area
            [50, 160, 45, 55, 0.01],
            [-55, 145, -60, -50, 0.011],
            [40, 130, 35, 45, 0.01],
            // Upper section
            [-45, 110, -50, -40, 0.011],
            [55, 95, 50, 60, 0.01],
            [-50, 75, -55, -45, 0.011],
            [45, 60, 40, 50, 0.01],
            // Mid-upper section
            [-55, 40, -60, -50, 0.011],
            [50, 25, 45, 55, 0.01],
            [-45, 10, -50, -40, 0.011],
            // Center section
            [55, -10, 50, 60, 0.01],
            [-50, -25, -55, -45, 0.011],
            [45, -45, 40, 50, 0.01],
            [-55, -60, -60, -50, 0.011],
            // Mid-lower section
            [50, -80, 45, 55, 0.01],
            [-45, -95, -50, -40, 0.011],
            [55, -115, 50, 60, 0.01],
            // Lower section
            [-50, -130, -55, -45, 0.011],
            [45, -145, 40, 50, 0.01],
            [-55, -165, -60, -50, 0.011],
            // Near treasure
            [50, -180, 45, 55, 0.01],
            [-45, -190, -50, -40, 0.011]
        ],
        
        // No giants in water level
        giants: [],
        
        // No wizards, mummies, or lava monsters in water level
        wizards: [],
        mummies: [],
        lavaMonsters: [],
        
        // Hard mode extra goblins
        hardModeGoblins: [
            [45, 165, 40, 50, 0.018],
            [-50, 145, -55, -45, 0.017],
            [40, 105, 35, 45, 0.018],
            [-45, 45, -50, -40, 0.017],
            [50, -15, 45, 55, 0.018],
            [-40, -75, -45, -35, 0.017],
            [45, -125, 40, 50, 0.018],
            [-50, -165, -55, -45, 0.017]
        ],
        
        // Seagulls (bomb birds) over the water - reduced count
        birds: [
            [0, 100, 25, 0.006],      // Upper area
            [-40, 30, 30, 0.005],     // Left mid
            [45, -50, 28, 0.007],     // Right lower
            [0, -120, 32, 0.006],     // Near treasure
            [-35, -170, 26, 0.005]    // Far end
        ],
        
        // Ammo pickups on floating debris - many more for the longer journey
        ammoPositions: [
            // Along the path
            { x: 10, z: 175 }, { x: -15, z: 160 }, { x: 20, z: 145 },
            { x: -10, z: 130 }, { x: 15, z: 115 }, { x: -20, z: 100 },
            { x: 10, z: 85 }, { x: -15, z: 70 }, { x: 20, z: 55 },
            { x: -10, z: 40 }, { x: 15, z: 25 }, { x: -20, z: 10 },
            { x: 10, z: -5 }, { x: -15, z: -20 }, { x: 20, z: -35 },
            { x: -10, z: -50 }, { x: 15, z: -65 }, { x: -20, z: -80 },
            { x: 10, z: -95 }, { x: -15, z: -110 }, { x: 20, z: -125 },
            { x: -10, z: -140 }, { x: 15, z: -155 }, { x: -20, z: -170 },
            { x: 10, z: -185 },
            // Center line pickups
            { x: 0, z: 170 }, { x: 0, z: 140 }, { x: 0, z: 110 },
            { x: 0, z: 80 }, { x: 0, z: 50 }, { x: 0, z: 20 },
            { x: 0, z: -10 }, { x: 0, z: -40 }, { x: 0, z: -70 },
            { x: 0, z: -100 }, { x: 0, z: -130 }, { x: 0, z: -160 },
            // Side pickups
            { x: 40, z: 150 }, { x: -45, z: 120 }, { x: 50, z: 75 },
            { x: -40, z: 30 }, { x: 45, z: -15 }, { x: -50, z: -60 },
            { x: 40, z: -105 }, { x: -45, z: -150 }
        ],
        
        // Bomb pickups
        bombPositions: [
            { x: 15, z: 140 },
            { x: -20, z: 80 },
            { x: 25, z: 20 },
            { x: -15, z: -50 },
            { x: 20, z: -115 },
            { x: -10, z: -170 }
        ],
        
        // Health pickups
        healthPositions: [
            { x: 5, z: 165 }, { x: -10, z: 145 }, { x: 15, z: 125 },
            { x: -5, z: 105 }, { x: 10, z: 85 }, { x: -15, z: 65 },
            { x: 5, z: 45 }, { x: -10, z: 25 }, { x: 15, z: -5 },
            { x: -5, z: -25 }, { x: 10, z: -45 }, { x: -15, z: -85 },
            { x: 5, z: -120 }, { x: -10, z: -155 }, { x: 15, z: -185 },
            { x: 0, z: 170 }, { x: 0, z: 110 }, { x: 0, z: 50 },
            { x: 0, z: -80 }, { x: 0, z: -140 }
        ],
        
        // Herz-Man pickup positions (presents with bow)
        herzmanPositions: [
            { x: 20, z: 155 }, { x: -25, z: 95 }, { x: 30, z: 30 },
            { x: -20, z: -40 }, { x: 25, z: -100 }, { x: -15, z: -160 }
        ],
        
        // Trap positions (whirlpools/Strudel) - blocking center path to enforce slalom
        trapPositions: [
            // Row 1 (z: 120 area) - cliff on right, whirlpools block center/right
            { x: 0, z: 125 }, { x: 10, z: 118 }, { x: -5, z: 130 },
            { x: 15, z: 125 }, { x: 5, z: 115 },

            // Between rows - scattered
            { x: -35, z: 100 }, { x: 30, z: 90 }, { x: -20, z: 80 },

            // Row 2 (z: 50 area) - cliff on left, whirlpools block center/left
            { x: 0, z: 55 }, { x: -10, z: 48 }, { x: 5, z: 60 },
            { x: -15, z: 55 }, { x: -5, z: 45 },

            // Between rows - scattered
            { x: 35, z: 30 }, { x: -30, z: 10 }, { x: 25, z: 0 },

            // Row 3 (z: -20 area) - cliff on right, whirlpools block center/right
            { x: 0, z: -15 }, { x: 10, z: -22 }, { x: -5, z: -10 },
            { x: 15, z: -18 }, { x: 5, z: -25 },

            // Between rows - scattered
            { x: -35, z: -45 }, { x: 30, z: -55 }, { x: -20, z: -65 },

            // Row 4 (z: -90 area) - cliff on left, whirlpools block center/left
            { x: 0, z: -85 }, { x: -10, z: -92 }, { x: 5, z: -80 },
            { x: -15, z: -88 }, { x: -5, z: -95 },

            // Between rows - scattered
            { x: 35, z: -110 }, { x: -30, z: -125 }, { x: 25, z: -135 },

            // Row 5 (z: -155 area) - cliff on right, whirlpools block center/right
            { x: 0, z: -150 }, { x: 10, z: -158 }, { x: -5, z: -145 },
            { x: 15, z: -152 }, { x: 5, z: -160 },

            // Near treasure - guard the approach
            { x: -25, z: -175 }, { x: 20, z: -180 }, { x: -10, z: -185 }
        ],

        // Moving waterspouts that drift around - many more!
        movingTraps: [
            // Near spawn area
            { x: -40, z: 160, radius: 5, speed: 0.001, rangeX: 15, rangeZ: 12 },
            { x: 15, z: 150, radius: 5, speed: 0.001, rangeX: 18, rangeZ: 15 },
            { x: 45, z: 140, radius: 4, speed: 0.0012, rangeX: 12, rangeZ: 14 },
            // Upper section
            { x: -20, z: 120, radius: 5, speed: 0.0008, rangeX: 15, rangeZ: 18 },
            { x: 30, z: 110, radius: 4, speed: 0.001, rangeX: 14, rangeZ: 12 },
            { x: -45, z: 90, radius: 5, speed: 0.0012, rangeX: 16, rangeZ: 14 },
            { x: 10, z: 80, radius: 4, speed: 0.001, rangeX: 12, rangeZ: 16 },
            // Mid-upper section
            { x: 40, z: 70, radius: 5, speed: 0.0008, rangeX: 14, rangeZ: 12 },
            { x: -25, z: 55, radius: 6, speed: 0.001, rangeX: 18, rangeZ: 15 },
            { x: 20, z: 40, radius: 4, speed: 0.0012, rangeX: 12, rangeZ: 14 },
            // Center section
            { x: -40, z: 20, radius: 5, speed: 0.001, rangeX: 16, rangeZ: 14 },
            { x: 35, z: 5, radius: 5, speed: 0.0008, rangeX: 14, rangeZ: 16 },
            { x: -15, z: -10, radius: 4, speed: 0.0012, rangeX: 12, rangeZ: 12 },
            { x: 45, z: -25, radius: 5, speed: 0.001, rangeX: 15, rangeZ: 14 },
            // Mid-lower section
            { x: -35, z: -40, radius: 4, speed: 0.001, rangeX: 14, rangeZ: 16 },
            { x: 15, z: -55, radius: 5, speed: 0.0008, rangeX: 16, rangeZ: 14 },
            { x: -20, z: -70, radius: 5, speed: 0.0012, rangeX: 12, rangeZ: 15 },
            { x: 40, z: -85, radius: 4, speed: 0.001, rangeX: 14, rangeZ: 12 },
            // Lower section
            { x: -45, z: -100, radius: 5, speed: 0.001, rangeX: 15, rangeZ: 16 },
            { x: 25, z: -115, radius: 4, speed: 0.0008, rangeX: 12, rangeZ: 14 },
            { x: -30, z: -130, radius: 5, speed: 0.0012, rangeX: 14, rangeZ: 12 },
            { x: 35, z: -145, radius: 4, speed: 0.001, rangeX: 16, rangeZ: 15 },
            // Near treasure
            { x: -40, z: -160, radius: 5, speed: 0.001, rangeX: 14, rangeZ: 14 },
            { x: 15, z: -175, radius: 5, speed: 0.0012, rangeX: 12, rangeZ: 16 }
        ],
        
        // No trees - water level
        treePositions: [],
        
        // Boulder positions as coral/rocks in water
        boulderPositions: [
            { x: -45, z: 175 }, { x: 50, z: 155 },
            { x: -40, z: 115 }, { x: 45, z: 85 },
            { x: -50, z: 55 }, { x: 40, z: 15 },
            { x: -45, z: -25 }, { x: 50, z: -55 },
            { x: -40, z: -95 }, { x: 45, z: -135 },
            { x: -50, z: -175 }, { x: 40, z: -195 }
        ],
        
        // Rock positions as smaller debris - more to obstruct path
        rockPositions: [
            { x: -20, z: 170 }, { x: 25, z: 160 },
            { x: -25, z: 140 }, { x: 30, z: 110 },
            { x: -30, z: 70 }, { x: 25, z: 40 },
            { x: -20, z: 10 }, { x: 30, z: -20 },
            { x: -25, z: -60 }, { x: 25, z: -100 },
            { x: -30, z: -140 }, { x: 20, z: -175 },
            // Additional rocks
            { x: 10, z: 155 }, { x: -15, z: 125 },
            { x: 15, z: 90 }, { x: -10, z: 55 },
            { x: 5, z: 20 }, { x: -5, z: -15 },
            { x: 10, z: -45 }, { x: -15, z: -80 },
            { x: 15, z: -115 }, { x: -10, z: -160 }
        ],

        // No canyon walls - open ocean
        canyonWalls: [],

        // No scarabs in water level
        scarabs: [],

        // Safe zone bounds for tornado spawning
        safeZoneBounds: {
            minX: -110,
            maxX: 110,
            minZ: -230,
            maxZ: 210
        },

        // Pirate ships that patrol and shoot cannonballs at the player
        pirateShips: [
            { x: -100, z: 100, patrolZ1: 50, patrolZ2: 150, speed: 0.03 },
            { x: 100, z: -50, patrolZ1: -150, patrolZ2: 50, speed: 0.025 }
        ]
    },

    6: {
        name: "Level 6 - Candy Kingdom",
        
        // Player start position
        playerStart: { x: 0, z: 180 },
        
        // Portal to Level 7 (Graveyard)
        portal: { x: 0, z: -200, destinationLevel: 7 },
        
        // Unique elements for level 6
        candyTheme: true,
        skyColor: 0xFFB6C1,         // Light pink sky
        groundColor: 0xFFE4E1,      // Misty rose ground
        fogDensity: 0.02,           // Dense fog to hide far clipping
        fogColor: 0xFFB6C1,         // Match sky color for seamless fade
        
        // No river - has chocolate river instead
        hasRiver: false,
        hasChocolateRiver: true,
        hasMaterials: false,
        
        // No mountains
        hasMountains: false,
        
        // Theme colors for candy level
        hillColor: 0xFF69B4,        // Hot pink (cupcakes)
        treeColor: 0xFF1493,        // Deep pink (lollipops)
        grassColor: 0x98FB98,       // Pale green (mint grass)
        
        // Level 6 has treasure
        hasTreasure: true,
        
        // Treasure position
        treasurePosition: { x: 0, z: -180 },
        
        // Rainbow position
        rainbow: { x: 0, z: -175 },
        
        // Candy Dragon - made of licorice and sugar
        dragon: { x: 0, z: -120 },
        extraDragons: [
            { x: -70, z: -60, scale: 0.7, health: 30 },
            { x: 70, z: -60, scale: 0.7, health: 30 }
        ],
        
        // World Kite position
        worldKite: { x: 5, z: 170 },

        // Ice Berg becomes "Ice Cream Berg"
        iceBerg: { x: 60, z: 80 },

        // Cupcake hills
        hills: [
            // Near spawn
            { x: -50, z: 150, radius: 10, height: 5 },
            { x: 50, z: 140, radius: 12, height: 6 },
            { x: -30, z: 100, radius: 8, height: 4 },
            { x: 70, z: 90, radius: 11, height: 5 },
            // Mid area
            { x: -60, z: 50, radius: 10, height: 5 },
            { x: 40, z: 30, radius: 9, height: 4 },
            { x: -40, z: -10, radius: 12, height: 6 },
            { x: 60, z: -30, radius: 8, height: 4 },
            // Near treasure
            { x: -50, z: -70, radius: 10, height: 5 },
            { x: 45, z: -90, radius: 11, height: 5 },
            { x: -35, z: -130, radius: 9, height: 4 },
            { x: 55, z: -150, radius: 10, height: 5 }
        ],
        
        // Giant lollipop and candy cane obstacles (as "mountains")
        mountains: [],
        
        // Chocolate river sections
        chocolateRiver: [
            { x: -80, z: 120, width: 20, length: 60, rotation: 0.3 },
            { x: 80, z: 60, width: 18, length: 50, rotation: -0.2 },
            { x: -70, z: -20, width: 22, length: 55, rotation: 0.1 },
            { x: 75, z: -80, width: 20, length: 60, rotation: -0.3 },
            { x: 0, z: -140, width: 25, length: 40, rotation: 0 }
        ],
        
        // Gummy bear goblins [x, z, patrolLeft, patrolRight, speed]
        goblins: [
            // Near spawn
            [30, 160, 25, 35, 0.014],
            [-35, 145, -40, -30, 0.013],
            [25, 120, 20, 30, 0.015],
            [-40, 100, -45, -35, 0.014],
            // Mid area
            [35, 70, 30, 40, 0.015],
            [-30, 45, -35, -25, 0.014],
            [40, 15, 35, 45, 0.013],
            [-35, -15, -40, -30, 0.015],
            // Near treasure
            [30, -50, 25, 35, 0.014],
            [-40, -80, -45, -35, 0.015],
            [35, -110, 30, 40, 0.014],
            [-30, -140, -35, -25, 0.013],
            // Extra scattered
            [0, 130, -5, 5, 0.012],
            [10, 60, 5, 15, 0.013],
            [-10, -30, -15, -5, 0.014],
            [5, -95, 0, 10, 0.013]
        ],
        
        // Gingerbread man guardians [x, z, patrolLeft, patrolRight, speed]
        guardians: [
            [55, 130, 50, 60, 0.01],
            [-60, 90, -65, -55, 0.011],
            [50, 40, 45, 55, 0.01],
            [-55, -10, -60, -50, 0.011],
            [60, -60, 55, 65, 0.01],
            [-50, -100, -55, -45, 0.011],
            [55, -140, 50, 60, 0.01],
            [-60, -165, -65, -55, 0.011]
        ],
        
        // Marshmallow giants
        giants: [
            [0, 80, -10, 10],
            [-50, 0, -60, -40],
            [50, -70, 40, 60],
            [0, -150, -10, 10]
        ],
        
        // Cotton candy wizards [x, z, patrolLeft, patrolRight, speed]
        wizards: [
            [40, 110, 35, 45, 0.007],
            [-45, 60, -50, -40, 0.008],
            [50, 0, 45, 55, 0.007],
            [-40, -50, -45, -35, 0.008],
            [45, -100, 40, 50, 0.007],
            [-50, -150, -55, -45, 0.008]
        ],
        
        // No mummies or lava monsters
        mummies: [],
        lavaMonsters: [],
        
        // Gingerbread ovens - spawn gingerbread men periodically
        ovens: [
            { x: -65, z: 60 },
            { x: 65, z: -40 }
        ],
        
        // Hard mode extra goblins
        hardModeGoblins: [
            [45, 170, 40, 50, 0.017],
            [-50, 135, -55, -45, 0.016],
            [40, 95, 35, 45, 0.017],
            [-45, 55, -50, -40, 0.016],
            [50, 5, 45, 55, 0.017],
            [-40, -45, -45, -35, 0.016],
            [45, -85, 40, 50, 0.017],
            [-50, -125, -55, -45, 0.016]
        ],
        
        // Candy butterflies (bomb birds)
        birds: [
            [0, 120, 30, 0.006],
            [-40, 60, 28, 0.007],
            [45, 0, 32, 0.005],
            [0, -60, 26, 0.006],
            [-35, -120, 30, 0.007]
        ],
        
        // Ammo in candy boxes
        ammoPositions: [
            { x: 15, z: 170 }, { x: -20, z: 145 }, { x: 25, z: 115 },
            { x: -30, z: 85 }, { x: 20, z: 55 }, { x: -25, z: 25 },
            { x: 30, z: -5 }, { x: -20, z: -35 }, { x: 25, z: -65 },
            { x: -30, z: -95 }, { x: 20, z: -125 }, { x: -25, z: -155 },
            { x: 0, z: 140 }, { x: 0, z: 70 }, { x: 0, z: 0 },
            { x: 0, z: -70 }, { x: 0, z: -140 },
            { x: 50, z: 150 }, { x: -55, z: 110 }, { x: 60, z: 50 },
            { x: -50, z: -20 }, { x: 55, z: -80 }, { x: -60, z: -140 }
        ],
        
        // Bomb pickups (candy bombs)
        bombPositions: [
            { x: 10, z: 155 },
            { x: -15, z: 100 },
            { x: 20, z: 40 },
            { x: -10, z: -20 },
            { x: 15, z: -75 },
            { x: -20, z: -130 }
        ],
        
        // Health pickups (candy hearts)
        healthPositions: [
            { x: 5, z: 175 }, { x: -10, z: 155 }, { x: 15, z: 135 },
            { x: -5, z: 115 }, { x: 10, z: 95 }, { x: -15, z: 75 },
            { x: 5, z: 55 }, { x: -10, z: 35 }, { x: 15, z: 15 },
            { x: -5, z: -5 }, { x: 10, z: -25 }, { x: -15, z: -45 },
            { x: 5, z: -65 }, { x: -10, z: -85 }, { x: 15, z: -105 },
            { x: -5, z: -125 }, { x: 10, z: -145 }, { x: -15, z: -165 },
            { x: 0, z: 180 }, { x: 0, z: 120 }, { x: 0, z: 60 },
            { x: 0, z: -60 }, { x: 0, z: -120 }
        ],
        
        // Herz-Man pickup positions
        herzmanPositions: [
            { x: 25, z: 160 }, { x: -30, z: 100 }, { x: 35, z: 30 },
            { x: -25, z: -40 }, { x: 30, z: -100 }, { x: -20, z: -160 }
        ],
        
        // Trap positions (sticky candy puddles)
        trapPositions: [
            { x: 30, z: 135 },
            { x: -35, z: 95 },
            { x: 40, z: 45 },
            { x: -30, z: -5 },
            { x: 35, z: -55 },
            { x: -40, z: -95 },
            { x: 30, z: -135 }
        ],
        
        // Lollipop and candy cane tree positions
        treePositions: [
            // Lollipops
            { x: -40, z: 165, type: 'lollipop' }, { x: 45, z: 155, type: 'lollipop' },
            { x: -55, z: 120, type: 'lollipop' }, { x: 60, z: 100, type: 'lollipop' },
            { x: -45, z: 70, type: 'lollipop' }, { x: 50, z: 55, type: 'lollipop' },
            { x: -60, z: 20, type: 'lollipop' }, { x: 40, z: -5, type: 'lollipop' },
            { x: -50, z: -40, type: 'lollipop' }, { x: 55, z: -65, type: 'lollipop' },
            { x: -45, z: -100, type: 'lollipop' }, { x: 50, z: -125, type: 'lollipop' },
            { x: -55, z: -155, type: 'lollipop' }, { x: 45, z: -175, type: 'lollipop' },
            // Candy canes
            { x: -25, z: 175, type: 'candycane' }, { x: 30, z: 160, type: 'candycane' },
            { x: -35, z: 130, type: 'candycane' }, { x: 40, z: 110, type: 'candycane' },
            { x: -30, z: 80, type: 'candycane' }, { x: 35, z: 60, type: 'candycane' },
            { x: -40, z: 30, type: 'candycane' }, { x: 30, z: 10, type: 'candycane' },
            { x: -35, z: -25, type: 'candycane' }, { x: 40, z: -50, type: 'candycane' },
            { x: -30, z: -80, type: 'candycane' }, { x: 35, z: -110, type: 'candycane' },
            { x: -40, z: -140, type: 'candycane' }, { x: 30, z: -165, type: 'candycane' },
            // More lollipops and candy canes scattered throughout
            { x: 20, z: 145, type: 'lollipop' }, { x: -15, z: 115, type: 'candycane' }, { x: 25, z: 85, type: 'lollipop' },
            { x: -20, z: 55, type: 'candycane' }, { x: 15, z: 25, type: 'lollipop' }, { x: -25, z: -5, type: 'candycane' },
            { x: 20, z: -35, type: 'lollipop' }, { x: -15, z: -65, type: 'candycane' }, { x: 25, z: -95, type: 'lollipop' },
            { x: -20, z: -125, type: 'candycane' }, { x: 15, z: -155, type: 'lollipop' }
        ],
        
        // Candy rock positions (gumdrops)
        rockPositions: [
            { x: -20, z: 170 }, { x: 25, z: 150 },
            { x: -30, z: 120 }, { x: 35, z: 95 },
            { x: -25, z: 65 }, { x: 30, z: 40 },
            { x: -35, z: 10 }, { x: 25, z: -20 },
            { x: -30, z: -50 }, { x: 35, z: -80 },
            { x: -25, z: -110 }, { x: 30, z: -140 },
            { x: 10, z: 165 }, { x: -15, z: 135 },
            { x: 20, z: 105 }, { x: -10, z: 75 },
            { x: 15, z: 45 }, { x: -20, z: 15 },
            { x: 10, z: -15 }, { x: -15, z: -45 },
            { x: 20, z: -75 }, { x: -10, z: -105 },
            { x: 15, z: -135 }, { x: -20, z: -165 }
        ],
        
        // Boulder positions (giant gumballs)
        boulderPositions: [
            { x: -70, z: 160 }, { x: 75, z: 140 },
            { x: -65, z: 100 }, { x: 70, z: 70 },
            { x: -75, z: 30 }, { x: 65, z: -10 },
            { x: -70, z: -50 }, { x: 75, z: -90 },
            { x: -65, z: -130 }, { x: 70, z: -160 }
        ],
        
        // Candy walls create maze-like structure
        canyonWalls: [
            // Boundary walls
            { x: 0, z: 200, width: 250, depth: 10, height: 15, rotation: 0 },
            { x: 0, z: -220, width: 250, depth: 10, height: 15, rotation: 0 },
            { x: -120, z: 0, width: 10, depth: 430, height: 15, rotation: 0 },
            { x: 120, z: 0, width: 10, depth: 430, height: 15, rotation: 0 },
            
            // Internal candy walls
            { x: 0, z: 140, width: 80, depth: 8, height: 12, rotation: 0 },
            { x: -60, z: 100, width: 70, depth: 8, height: 12, rotation: 0 },
            { x: 60, z: 60, width: 70, depth: 8, height: 12, rotation: 0 },
            { x: -40, z: 20, width: 60, depth: 8, height: 12, rotation: 0 },
            { x: 50, z: -20, width: 70, depth: 8, height: 12, rotation: 0 },
            { x: -50, z: -60, width: 60, depth: 8, height: 12, rotation: 0 },
            { x: 40, z: -100, width: 70, depth: 8, height: 12, rotation: 0 },
            { x: 0, z: -140, width: 80, depth: 8, height: 12, rotation: 0 }
        ],
        
        // No scarabs in candy level
        scarabs: [],
        
        // Safe zone bounds
        safeZoneBounds: {
            minX: -110,
            maxX: 110,
            minZ: -210,
            maxZ: 195
        }
    },
    
    7: {
        name: "Level 7 - The Haunted Graveyard",
        
        // Player start position - at the graveyard entrance
        playerStart: { x: 0, z: 200 },
        
        // Portal back to Level 1 (full cycle complete)
        portal: { x: 0, z: -220, destinationLevel: 1 },
        
        // Unique elements for graveyard level
        graveyardTheme: true,
        skyColor: 0x443355,          // Match fog color for seamless fade
        groundColor: 0x8a7a65,       // Visible dead earth brown (lighter)
        fogDensity: 0.02,            // Dense fog to hide clipping
        fogColor: 0x443355,          // Purple-tinted fog
        
        // No river - has eerie mist pools instead
        hasRiver: false,
        hasMistPools: true,
        hasMaterials: false,
        
        // Has mountains (crypt walls and mausoleums)
        hasMountains: true,
        
        // Theme colors for graveyard level
        hillColor: 0x3a3520,         // Dead grass mounds
        treeColor: 0x1a1510,         // Dead/bare trees
        grassColor: 0x2a2a1a,        // Dying grass
        
        // Level 7 has treasure (cursed treasure)
        hasTreasure: true,
        
        // Treasure position - in the deepest crypt
        treasurePosition: { x: 0, z: -200 },
        
        // Rainbow position - dark rainbow above cursed treasure
        rainbow: { x: 0, z: -195 },
        
        // REAPER boss - single guardian near treasure
        dragon: { x: 0, z: -195, scale: 0.7 },
        useReaper: true,  // Flag to use Reaper instead of Dragon
        extraDragons: [],  // Single reaper only
        
        // World Kite position - near spawn (ghostly kite)
        worldKite: { x: 5, z: 180 },

        // No iceberg - has haunted well instead
        iceBerg: null,
        hauntedWell: { x: 50, z: 100 },

        // Mist pool positions (Nebelteiche)
        mistPools: [
            { x: -70, z: 150, radius: 12 },
            { x: 75, z: 90, radius: 10 },
            { x: -65, z: 20, radius: 14 },
            { x: 70, z: -40, radius: 11 },
            { x: -75, z: -90, radius: 12 },
            { x: 65, z: -150, radius: 13 },
            { x: 0, z: -170, radius: 15 }
        ],

        // Few scattered grave mound hills (reduced)
        hills: [
            { x: -80, z: 165, radius: 6, height: 2 },
            { x: 85, z: 50, radius: 7, height: 2.5 },
            { x: -75, z: -75, radius: 6, height: 2 },
            { x: 80, z: -130, radius: 7, height: 2.5 }
        ],
        
        // Brick walls with iron fences - THIN walls creating interesting maze
        mountains: [
            // Outer boundary - simple perimeter (thin walls)
            { x: 0, z: 210, width: 220, height: 3 },
            { x: 0, z: -220, width: 220, height: 3 },
            { x: -110, z: 0, width: 8, height: 3 },
            { x: 110, z: 0, width: 8, height: 3 },
            // Corner connectors
            { x: -105, z: 180, width: 20, height: 2.5 },
            { x: 105, z: 180, width: 20, height: 2.5 },
            { x: -105, z: -190, width: 20, height: 2.5 },
            { x: 105, z: -190, width: 20, height: 2.5 }
        ],
        
        // Zombie goblins [x, z, patrolLeft, patrolRight, speed]
        goblins: [
            // Near spawn - rising from graves
            [25, 180, 20, 30, 0.008],
            [-30, 165, -35, -25, 0.009],
            [35, 145, 30, 40, 0.008],
            [-25, 125, -30, -20, 0.009],
            // Mid graveyard
            [30, 95, 25, 35, 0.009],
            [-35, 70, -40, -30, 0.008],
            [25, 45, 20, 30, 0.009],
            [-30, 20, -35, -25, 0.008],
            [35, -10, 30, 40, 0.009],
            [-25, -35, -30, -20, 0.008],
            // Near crypt
            [30, -65, 25, 35, 0.009],
            [-35, -95, -40, -30, 0.01],
            [25, -120, 20, 30, 0.01],
            [-30, -150, -35, -25, 0.01],
            // Extra wandering
            [0, 150, -5, 5, 0.007],
            [10, 80, 5, 15, 0.008],
            [-10, 0, -15, -5, 0.008],
            [5, -80, 0, 10, 0.009]
        ],
        
        // Ghost/Spectre guardians [x, z, patrolLeft, patrolRight, speed]
        guardians: [
            [50, 150, 45, 55, 0.006],
            [-55, 110, -60, -50, 0.007],
            [60, 60, 55, 65, 0.006],
            [-50, 20, -55, -45, 0.007]
        ],
        
        // Skeleton archers [x, z, patrolLeft, patrolRight, speed]
        skeletons: [
            [55, -30, 50, 60, 0.008],
            [-60, -70, -65, -55, 0.009],
            [50, -110, 45, 55, 0.008],
            [-55, -150, -60, -50, 0.009],
            [25, -80, 20, 30, 0.008],
            [-30, -120, -35, -25, 0.009],
            [40, -170, 35, 45, 0.01],
            [-45, -180, -50, -40, 0.01],
            // Additional skeletons
            [60, 50, 55, 65, 0.008],
            [-55, 90, -60, -50, 0.009],
            [45, 130, 40, 50, 0.008],
            [-50, 170, -55, -45, 0.009],
            [30, -50, 25, 35, 0.01],
            [-35, -100, -40, -30, 0.009],
            [0, -140, -5, 5, 0.008],
            [65, -90, 60, 70, 0.01]
        ],
        
        // Executioner giants
        giants: [
            [0, 100, -15, 15],
            [-55, 30, -65, -45],
            [55, -40, 45, 65],
            [0, -100, -15, 15]
        ],
        
        // Witch wizards [x, z, patrolLeft, patrolRight, speed]
        wizards: [
            [35, 130, 30, 40, 0.005],
            [-40, 80, -45, -35, 0.006],
            [45, 20, 40, 50, 0.005],
            [-35, -30, -40, -30, 0.006],
            [40, -90, 35, 45, 0.005],
            [-45, -140, -50, -40, 0.006]
        ],
        
        // No mummies or lava monsters - graveyard has its own horrors
        mummies: [],
        lavaMonsters: [],
        
        // Hard mode extra zombies
        hardModeGoblins: [
            [40, 190, 35, 45, 0.012],
            [-45, 155, -50, -40, 0.011],
            [35, 115, 30, 40, 0.012],
            [-40, 75, -45, -35, 0.011],
            [45, 35, 40, 50, 0.012],
            [-35, -5, -40, -30, 0.011],
            [40, -55, 35, 45, 0.012],
            [-45, -105, -50, -40, 0.011],
            [35, -145, 30, 40, 0.012],
            [-40, -175, -45, -35, 0.011]
        ],
        
        // Bats (bomb birds)
        birds: [
            [0, 140, 35, 0.008],
            [-35, 80, 30, 0.009],
            [40, 20, 32, 0.007],
            [-30, -40, 28, 0.008],
            [35, -100, 30, 0.009],
            [0, -160, 34, 0.008]
        ],
        
        // Ammo in coffins/crypts (increased for skeleton archers)
        ammoPositions: [
            { x: 15, z: 185 }, { x: -20, z: 160 }, { x: 25, z: 130 },
            { x: -30, z: 100 }, { x: 20, z: 70 }, { x: -25, z: 40 },
            { x: 30, z: 10 }, { x: -20, z: -20 }, { x: 25, z: -50 },
            { x: -30, z: -80 }, { x: 20, z: -110 }, { x: -25, z: -140 },
            { x: 0, z: 155 }, { x: 0, z: 85 }, { x: 0, z: 15 },
            { x: 0, z: -55 }, { x: 0, z: -125 },
            { x: 45, z: 165 }, { x: -50, z: 125 }, { x: 55, z: 65 },
            { x: -45, z: 5 }, { x: 50, z: -65 }, { x: -55, z: -125 },
            // Extra ammo for fighting skeleton archers
            { x: 35, z: 180 }, { x: -35, z: 145 }, { x: 40, z: 110 },
            { x: -40, z: 75 }, { x: 35, z: 45 }, { x: -35, z: -10 },
            { x: 40, z: -40 }, { x: -40, z: -95 }, { x: 35, z: -160 },
            { x: 60, z: 190 }, { x: -60, z: 140 }, { x: 65, z: 50 },
            { x: -65, z: -30 }, { x: 60, z: -100 }, { x: -60, z: -170 }
        ],
        
        // Bomb pickups (cursed skulls)
        bombPositions: [
            { x: 10, z: 170 },
            { x: -15, z: 115 },
            { x: 20, z: 55 },
            { x: -10, z: -5 },
            { x: 15, z: -65 },
            { x: -20, z: -120 }
        ],
        
        // Health pickups (soul fragments)
        healthPositions: [
            { x: 5, z: 195 }, { x: -10, z: 175 }, { x: 15, z: 155 },
            { x: -5, z: 135 }, { x: 10, z: 115 }, { x: -15, z: 95 },
            { x: 5, z: 75 }, { x: -10, z: 55 }, { x: 15, z: 35 },
            { x: -5, z: 15 }, { x: 10, z: -5 }, { x: -15, z: -25 },
            { x: 5, z: -45 }, { x: -10, z: -65 }, { x: 15, z: -85 },
            { x: -5, z: -105 }, { x: 10, z: -125 }, { x: -15, z: -145 },
            { x: 0, z: 200 }, { x: 0, z: 140 }, { x: 0, z: 80 },
            { x: 0, z: -40 }, { x: 0, z: -100 }
        ],
        
        // Herz-Man pickup positions (possessed hearts)
        herzmanPositions: [
            { x: 20, z: 175 }, { x: -25, z: 115 }, { x: 30, z: 45 },
            { x: -20, z: -25 }, { x: 25, z: -85 }, { x: -15, z: -145 }
        ],
        
        // Trap positions (cursed ground that slows)
        trapPositions: [
            { x: 25, z: 150 },
            { x: -30, z: 110 },
            { x: 35, z: 60 },
            { x: -25, z: 10 },
            { x: 30, z: -40 },
            { x: -35, z: -90 },
            { x: 25, z: -130 }
        ],
        
        // Dead tree and tombstone positions - DENSE GRAVEYARD covering entire area
        treePositions: [
            // Dead trees along edges and scattered (bare, twisted)
            { x: -100, z: 195, type: 'deadtree' }, { x: 100, z: 195, type: 'deadtree' },
            { x: -100, z: 100, type: 'deadtree' }, { x: 100, z: 100, type: 'deadtree' },
            { x: -100, z: 0, type: 'deadtree' }, { x: 100, z: 0, type: 'deadtree' },
            { x: -100, z: -100, type: 'deadtree' }, { x: 100, z: -100, type: 'deadtree' },
            { x: -100, z: -190, type: 'deadtree' }, { x: 100, z: -190, type: 'deadtree' },
            { x: 0, z: 195, type: 'deadtree' }, { x: 0, z: -195, type: 'deadtree' },
            { x: -50, z: 195, type: 'deadtree' }, { x: 50, z: 195, type: 'deadtree' },
            { x: -50, z: -195, type: 'deadtree' }, { x: 50, z: -195, type: 'deadtree' },
            
            // MASSIVE TOMBSTONE GRID - every 10 units, staggered rows
            // Section A: z=190 to z=140 (near spawn)
            { x: -85, z: 190, type: 'tombstone' }, { x: -70, z: 190, type: 'tombstone' }, { x: -55, z: 190, type: 'tombstone' },
            { x: -40, z: 190, type: 'tombstone' }, { x: -25, z: 190, type: 'tombstone' }, { x: -10, z: 190, type: 'tombstone' },
            { x: 5, z: 190, type: 'tombstone' }, { x: 20, z: 190, type: 'tombstone' }, { x: 35, z: 190, type: 'tombstone' },
            { x: 50, z: 190, type: 'tombstone' }, { x: 65, z: 190, type: 'tombstone' }, { x: 80, z: 190, type: 'tombstone' },
            
            { x: -80, z: 180, type: 'tombstone' }, { x: -65, z: 180, type: 'tombstone' }, { x: -50, z: 180, type: 'tombstone' },
            { x: -35, z: 180, type: 'tombstone' }, { x: -20, z: 180, type: 'tombstone' }, { x: -5, z: 180, type: 'tombstone' },
            { x: 10, z: 180, type: 'tombstone' }, { x: 25, z: 180, type: 'tombstone' }, { x: 40, z: 180, type: 'tombstone' },
            { x: 55, z: 180, type: 'tombstone' }, { x: 70, z: 180, type: 'tombstone' }, { x: 85, z: 180, type: 'tombstone' },
            
            { x: -85, z: 165, type: 'tombstone' }, { x: -70, z: 165, type: 'tombstone' }, { x: -55, z: 165, type: 'tombstone' },
            { x: -40, z: 165, type: 'tombstone' }, { x: -25, z: 165, type: 'tombstone' }, { x: -10, z: 165, type: 'tombstone' },
            { x: 5, z: 165, type: 'tombstone' }, { x: 20, z: 165, type: 'tombstone' }, { x: 35, z: 165, type: 'tombstone' },
            { x: 50, z: 165, type: 'tombstone' }, { x: 65, z: 165, type: 'tombstone' }, { x: 80, z: 165, type: 'tombstone' },
            
            { x: -80, z: 150, type: 'tombstone' }, { x: -65, z: 150, type: 'tombstone' }, { x: -50, z: 150, type: 'tombstone' },
            { x: -35, z: 150, type: 'tombstone' }, { x: -20, z: 150, type: 'tombstone' }, { x: -5, z: 150, type: 'tombstone' },
            { x: 10, z: 150, type: 'tombstone' }, { x: 25, z: 150, type: 'tombstone' }, { x: 40, z: 150, type: 'tombstone' },
            { x: 55, z: 150, type: 'tombstone' }, { x: 70, z: 150, type: 'tombstone' }, { x: 85, z: 150, type: 'tombstone' },
            
            { x: -85, z: 140, type: 'tombstone' }, { x: -70, z: 140, type: 'tombstone' }, { x: -55, z: 140, type: 'tombstone' },
            { x: -40, z: 140, type: 'tombstone' }, { x: -25, z: 140, type: 'tombstone' }, { x: -10, z: 140, type: 'tombstone' },
            { x: 5, z: 140, type: 'tombstone' }, { x: 20, z: 140, type: 'tombstone' }, { x: 35, z: 140, type: 'tombstone' },
            { x: 50, z: 140, type: 'tombstone' }, { x: 65, z: 140, type: 'tombstone' }, { x: 80, z: 140, type: 'tombstone' },
            
            // Section B: z=130 to z=80
            { x: -80, z: 125, type: 'tombstone' }, { x: -65, z: 125, type: 'tombstone' }, { x: -50, z: 125, type: 'tombstone' },
            { x: -35, z: 125, type: 'tombstone' }, { x: -20, z: 125, type: 'tombstone' }, { x: -5, z: 125, type: 'tombstone' },
            { x: 10, z: 125, type: 'tombstone' }, { x: 25, z: 125, type: 'tombstone' }, { x: 40, z: 125, type: 'tombstone' },
            { x: 55, z: 125, type: 'tombstone' }, { x: 70, z: 125, type: 'tombstone' }, { x: 85, z: 125, type: 'tombstone' },
            
            { x: -85, z: 110, type: 'tombstone' }, { x: -70, z: 110, type: 'tombstone' }, { x: -55, z: 110, type: 'tombstone' },
            { x: -40, z: 110, type: 'tombstone' }, { x: -25, z: 110, type: 'tombstone' }, { x: -10, z: 110, type: 'tombstone' },
            { x: 5, z: 110, type: 'tombstone' }, { x: 20, z: 110, type: 'tombstone' }, { x: 35, z: 110, type: 'tombstone' },
            { x: 50, z: 110, type: 'tombstone' }, { x: 65, z: 110, type: 'tombstone' }, { x: 80, z: 110, type: 'tombstone' },
            
            { x: -80, z: 95, type: 'tombstone' }, { x: -65, z: 95, type: 'tombstone' }, { x: -50, z: 95, type: 'tombstone' },
            { x: -35, z: 95, type: 'tombstone' }, { x: -20, z: 95, type: 'tombstone' }, { x: -5, z: 95, type: 'tombstone' },
            { x: 10, z: 95, type: 'tombstone' }, { x: 25, z: 95, type: 'tombstone' }, { x: 40, z: 95, type: 'tombstone' },
            { x: 55, z: 95, type: 'tombstone' }, { x: 70, z: 95, type: 'tombstone' }, { x: 85, z: 95, type: 'tombstone' },
            
            { x: -85, z: 80, type: 'tombstone' }, { x: -70, z: 80, type: 'tombstone' }, { x: -55, z: 80, type: 'tombstone' },
            { x: -40, z: 80, type: 'tombstone' }, { x: -25, z: 80, type: 'tombstone' }, { x: -10, z: 80, type: 'tombstone' },
            { x: 5, z: 80, type: 'tombstone' }, { x: 20, z: 80, type: 'tombstone' }, { x: 35, z: 80, type: 'tombstone' },
            { x: 50, z: 80, type: 'tombstone' }, { x: 65, z: 80, type: 'tombstone' }, { x: 80, z: 80, type: 'tombstone' },
            
            // Section C: z=70 to z=20
            { x: -80, z: 65, type: 'tombstone' }, { x: -65, z: 65, type: 'tombstone' }, { x: -50, z: 65, type: 'tombstone' },
            { x: -35, z: 65, type: 'tombstone' }, { x: -20, z: 65, type: 'tombstone' }, { x: -5, z: 65, type: 'tombstone' },
            { x: 10, z: 65, type: 'tombstone' }, { x: 25, z: 65, type: 'tombstone' }, { x: 40, z: 65, type: 'tombstone' },
            { x: 55, z: 65, type: 'tombstone' }, { x: 70, z: 65, type: 'tombstone' }, { x: 85, z: 65, type: 'tombstone' },
            
            { x: -85, z: 50, type: 'tombstone' }, { x: -70, z: 50, type: 'tombstone' }, { x: -55, z: 50, type: 'tombstone' },
            { x: -40, z: 50, type: 'tombstone' }, { x: -25, z: 50, type: 'tombstone' }, { x: -10, z: 50, type: 'tombstone' },
            { x: 5, z: 50, type: 'tombstone' }, { x: 20, z: 50, type: 'tombstone' }, { x: 35, z: 50, type: 'tombstone' },
            { x: 50, z: 50, type: 'tombstone' }, { x: 65, z: 50, type: 'tombstone' }, { x: 80, z: 50, type: 'tombstone' },
            
            { x: -80, z: 35, type: 'tombstone' }, { x: -65, z: 35, type: 'tombstone' }, { x: -50, z: 35, type: 'tombstone' },
            { x: -35, z: 35, type: 'tombstone' }, { x: -20, z: 35, type: 'tombstone' }, { x: -5, z: 35, type: 'tombstone' },
            { x: 10, z: 35, type: 'tombstone' }, { x: 25, z: 35, type: 'tombstone' }, { x: 40, z: 35, type: 'tombstone' },
            { x: 55, z: 35, type: 'tombstone' }, { x: 70, z: 35, type: 'tombstone' }, { x: 85, z: 35, type: 'tombstone' },
            
            { x: -85, z: 20, type: 'tombstone' }, { x: -70, z: 20, type: 'tombstone' }, { x: -55, z: 20, type: 'tombstone' },
            { x: -40, z: 20, type: 'tombstone' }, { x: -25, z: 20, type: 'tombstone' }, { x: -10, z: 20, type: 'tombstone' },
            { x: 5, z: 20, type: 'tombstone' }, { x: 20, z: 20, type: 'tombstone' }, { x: 35, z: 20, type: 'tombstone' },
            { x: 50, z: 20, type: 'tombstone' }, { x: 65, z: 20, type: 'tombstone' }, { x: 80, z: 20, type: 'tombstone' },
            
            // Section D: z=10 to z=-40
            { x: -80, z: 5, type: 'tombstone' }, { x: -65, z: 5, type: 'tombstone' }, { x: -50, z: 5, type: 'tombstone' },
            { x: -35, z: 5, type: 'tombstone' }, { x: -20, z: 5, type: 'tombstone' }, { x: -5, z: 5, type: 'tombstone' },
            { x: 10, z: 5, type: 'tombstone' }, { x: 25, z: 5, type: 'tombstone' }, { x: 40, z: 5, type: 'tombstone' },
            { x: 55, z: 5, type: 'tombstone' }, { x: 70, z: 5, type: 'tombstone' }, { x: 85, z: 5, type: 'tombstone' },
            
            { x: -85, z: -10, type: 'tombstone' }, { x: -70, z: -10, type: 'tombstone' }, { x: -55, z: -10, type: 'tombstone' },
            { x: -40, z: -10, type: 'tombstone' }, { x: -25, z: -10, type: 'tombstone' }, { x: -10, z: -10, type: 'tombstone' },
            { x: 5, z: -10, type: 'tombstone' }, { x: 20, z: -10, type: 'tombstone' }, { x: 35, z: -10, type: 'tombstone' },
            { x: 50, z: -10, type: 'tombstone' }, { x: 65, z: -10, type: 'tombstone' }, { x: 80, z: -10, type: 'tombstone' },
            
            { x: -80, z: -25, type: 'tombstone' }, { x: -65, z: -25, type: 'tombstone' }, { x: -50, z: -25, type: 'tombstone' },
            { x: -35, z: -25, type: 'tombstone' }, { x: -20, z: -25, type: 'tombstone' }, { x: -5, z: -25, type: 'tombstone' },
            { x: 10, z: -25, type: 'tombstone' }, { x: 25, z: -25, type: 'tombstone' }, { x: 40, z: -25, type: 'tombstone' },
            { x: 55, z: -25, type: 'tombstone' }, { x: 70, z: -25, type: 'tombstone' }, { x: 85, z: -25, type: 'tombstone' },
            
            { x: -85, z: -40, type: 'tombstone' }, { x: -70, z: -40, type: 'tombstone' }, { x: -55, z: -40, type: 'tombstone' },
            { x: -40, z: -40, type: 'tombstone' }, { x: -25, z: -40, type: 'tombstone' }, { x: -10, z: -40, type: 'tombstone' },
            { x: 5, z: -40, type: 'tombstone' }, { x: 20, z: -40, type: 'tombstone' }, { x: 35, z: -40, type: 'tombstone' },
            { x: 50, z: -40, type: 'tombstone' }, { x: 65, z: -40, type: 'tombstone' }, { x: 80, z: -40, type: 'tombstone' },
            
            // Section E: z=-50 to z=-100
            { x: -80, z: -55, type: 'tombstone' }, { x: -65, z: -55, type: 'tombstone' }, { x: -50, z: -55, type: 'tombstone' },
            { x: -35, z: -55, type: 'tombstone' }, { x: -20, z: -55, type: 'tombstone' }, { x: -5, z: -55, type: 'tombstone' },
            { x: 10, z: -55, type: 'tombstone' }, { x: 25, z: -55, type: 'tombstone' }, { x: 40, z: -55, type: 'tombstone' },
            { x: 55, z: -55, type: 'tombstone' }, { x: 70, z: -55, type: 'tombstone' }, { x: 85, z: -55, type: 'tombstone' },
            
            { x: -85, z: -70, type: 'tombstone' }, { x: -70, z: -70, type: 'tombstone' }, { x: -55, z: -70, type: 'tombstone' },
            { x: -40, z: -70, type: 'tombstone' }, { x: -25, z: -70, type: 'tombstone' }, { x: -10, z: -70, type: 'tombstone' },
            { x: 5, z: -70, type: 'tombstone' }, { x: 20, z: -70, type: 'tombstone' }, { x: 35, z: -70, type: 'tombstone' },
            { x: 50, z: -70, type: 'tombstone' }, { x: 65, z: -70, type: 'tombstone' }, { x: 80, z: -70, type: 'tombstone' },
            
            { x: -80, z: -85, type: 'tombstone' }, { x: -65, z: -85, type: 'tombstone' }, { x: -50, z: -85, type: 'tombstone' },
            { x: -35, z: -85, type: 'tombstone' }, { x: -20, z: -85, type: 'tombstone' }, { x: -5, z: -85, type: 'tombstone' },
            { x: 10, z: -85, type: 'tombstone' }, { x: 25, z: -85, type: 'tombstone' }, { x: 40, z: -85, type: 'tombstone' },
            { x: 55, z: -85, type: 'tombstone' }, { x: 70, z: -85, type: 'tombstone' }, { x: 85, z: -85, type: 'tombstone' },
            
            { x: -85, z: -100, type: 'tombstone' }, { x: -70, z: -100, type: 'tombstone' }, { x: -55, z: -100, type: 'tombstone' },
            { x: -40, z: -100, type: 'tombstone' }, { x: -25, z: -100, type: 'tombstone' }, { x: -10, z: -100, type: 'tombstone' },
            { x: 5, z: -100, type: 'tombstone' }, { x: 20, z: -100, type: 'tombstone' }, { x: 35, z: -100, type: 'tombstone' },
            { x: 50, z: -100, type: 'tombstone' }, { x: 65, z: -100, type: 'tombstone' }, { x: 80, z: -100, type: 'tombstone' },
            
            // Section F: z=-110 to z=-160 (approaching crypt)
            { x: -80, z: -115, type: 'tombstone' }, { x: -65, z: -115, type: 'tombstone' }, { x: -50, z: -115, type: 'tombstone' },
            { x: -35, z: -115, type: 'tombstone' }, { x: -20, z: -115, type: 'tombstone' }, { x: -5, z: -115, type: 'tombstone' },
            { x: 10, z: -115, type: 'tombstone' }, { x: 25, z: -115, type: 'tombstone' }, { x: 40, z: -115, type: 'tombstone' },
            { x: 55, z: -115, type: 'tombstone' }, { x: 70, z: -115, type: 'tombstone' }, { x: 85, z: -115, type: 'tombstone' },
            
            { x: -85, z: -130, type: 'tombstone' }, { x: -70, z: -130, type: 'tombstone' }, { x: -55, z: -130, type: 'tombstone' },
            { x: -40, z: -130, type: 'tombstone' }, { x: -25, z: -130, type: 'tombstone' }, { x: -10, z: -130, type: 'tombstone' },
            { x: 5, z: -130, type: 'tombstone' }, { x: 20, z: -130, type: 'tombstone' }, { x: 35, z: -130, type: 'tombstone' },
            { x: 50, z: -130, type: 'tombstone' }, { x: 65, z: -130, type: 'tombstone' }, { x: 80, z: -130, type: 'tombstone' },
            
            { x: -80, z: -145, type: 'tombstone' }, { x: -65, z: -145, type: 'tombstone' }, { x: -50, z: -145, type: 'tombstone' },
            { x: -35, z: -145, type: 'tombstone' }, { x: -20, z: -145, type: 'tombstone' }, { x: -5, z: -145, type: 'tombstone' },
            { x: 10, z: -145, type: 'tombstone' }, { x: 25, z: -145, type: 'tombstone' }, { x: 40, z: -145, type: 'tombstone' },
            { x: 55, z: -145, type: 'tombstone' }, { x: 70, z: -145, type: 'tombstone' }, { x: 85, z: -145, type: 'tombstone' },
            
            { x: -85, z: -160, type: 'tombstone' }, { x: -70, z: -160, type: 'tombstone' }, { x: -55, z: -160, type: 'tombstone' },
            { x: -40, z: -160, type: 'tombstone' }, { x: -25, z: -160, type: 'tombstone' }, { x: -10, z: -160, type: 'tombstone' },
            { x: 5, z: -160, type: 'tombstone' }, { x: 20, z: -160, type: 'tombstone' }, { x: 35, z: -160, type: 'tombstone' },
            { x: 50, z: -160, type: 'tombstone' }, { x: 65, z: -160, type: 'tombstone' }, { x: 80, z: -160, type: 'tombstone' },
            
            // Section G: z=-175 to z=-190 (crypt area)
            { x: -80, z: -175, type: 'tombstone' }, { x: -65, z: -175, type: 'tombstone' }, { x: -50, z: -175, type: 'tombstone' },
            { x: -35, z: -175, type: 'tombstone' }, { x: 35, z: -175, type: 'tombstone' },
            { x: 50, z: -175, type: 'tombstone' }, { x: 65, z: -175, type: 'tombstone' }, { x: 80, z: -175, type: 'tombstone' },
            
            { x: -85, z: -190, type: 'tombstone' }, { x: -70, z: -190, type: 'tombstone' }, { x: -55, z: -190, type: 'tombstone' },
            { x: 55, z: -190, type: 'tombstone' }, { x: 70, z: -190, type: 'tombstone' }, { x: 85, z: -190, type: 'tombstone' },
            
            // Jack-o-lanterns - scattered throughout for Halloween atmosphere
            // Near spawn area
            { x: -15, z: 195, type: 'jackolantern' }, { x: 12, z: 188, type: 'jackolantern' },
            { x: -28, z: 175, type: 'jackolantern' }, { x: 32, z: 172, type: 'jackolantern' },
            { x: 8, z: 160, type: 'jackolantern' }, { x: -22, z: 155, type: 'jackolantern' },
            // Along path section 1
            { x: 45, z: 140, type: 'jackolantern' }, { x: -48, z: 135, type: 'jackolantern' },
            { x: 18, z: 125, type: 'jackolantern' }, { x: -32, z: 118, type: 'jackolantern' },
            { x: 55, z: 105, type: 'jackolantern' }, { x: -58, z: 98, type: 'jackolantern' },
            // Mid graveyard
            { x: -8, z: 88, type: 'jackolantern' }, { x: 42, z: 78, type: 'jackolantern' },
            { x: -45, z: 72, type: 'jackolantern' }, { x: 22, z: 62, type: 'jackolantern' },
            { x: 58, z: 52, type: 'jackolantern' }, { x: -55, z: 45, type: 'jackolantern' },
            { x: 12, z: 38, type: 'jackolantern' }, { x: -18, z: 28, type: 'jackolantern' },
            // Central area
            { x: 48, z: 15, type: 'jackolantern' }, { x: -52, z: 8, type: 'jackolantern' },
            { x: 28, z: -5, type: 'jackolantern' }, { x: -25, z: -12, type: 'jackolantern' },
            { x: 62, z: -25, type: 'jackolantern' }, { x: -62, z: -32, type: 'jackolantern' },
            // Deeper graves
            { x: 15, z: -45, type: 'jackolantern' }, { x: -38, z: -52, type: 'jackolantern' },
            { x: 52, z: -65, type: 'jackolantern' }, { x: -55, z: -72, type: 'jackolantern' },
            { x: 8, z: -82, type: 'jackolantern' }, { x: -28, z: -88, type: 'jackolantern' },
            // Near crypt
            { x: 45, z: -105, type: 'jackolantern' }, { x: -48, z: -112, type: 'jackolantern' },
            { x: 22, z: -125, type: 'jackolantern' }, { x: -35, z: -132, type: 'jackolantern' },
            { x: 58, z: -145, type: 'jackolantern' }, { x: -58, z: -152, type: 'jackolantern' },
            // Crypt entrance area
            { x: 12, z: -168, type: 'jackolantern' }, { x: -15, z: -175, type: 'jackolantern' },
            { x: 38, z: -185, type: 'jackolantern' }, { x: -42, z: -188, type: 'jackolantern' }
        ],
        
        // Rock positions (broken tombstones and bone piles)
        rockPositions: [
            { x: -15, z: 185 }, { x: 20, z: 165 },
            { x: -25, z: 135 }, { x: 30, z: 110 },
            { x: -20, z: 80 }, { x: 25, z: 55 },
            { x: -30, z: 25 }, { x: 20, z: -5 },
            { x: -25, z: -35 }, { x: 30, z: -65 },
            { x: -20, z: -95 }, { x: 25, z: -125 },
            { x: 5, z: 180 }, { x: -10, z: 150 },
            { x: 15, z: 120 }, { x: -5, z: 90 },
            { x: 10, z: 60 }, { x: -15, z: 30 },
            { x: 5, z: 0 }, { x: -10, z: -30 },
            { x: 15, z: -60 }, { x: -5, z: -90 },
            { x: 10, z: -120 }, { x: -15, z: -150 }
        ],
        
        // Boulder positions (large crypts and sarcophagi)
        boulderPositions: [
            { x: -65, z: 175 }, { x: 70, z: 155 },
            { x: -60, z: 115 }, { x: 65, z: 85 },
            { x: -70, z: 45 }, { x: 60, z: 5 },
            { x: -65, z: -35 }, { x: 70, z: -75 },
            { x: -60, z: -115 }, { x: 65, z: -155 }
        ],
        
        // Graveyard fence/wall structure - thin brick walls with iron fence on top
        canyonWalls: [
            // MAZE SECTION 1 (spawn area z:200 to z:140) - funnel player through
            { x: -40, z: 170, width: 50, depth: 1, height: 3.5, rotation: 0 },
            { x: 50, z: 165, width: 40, depth: 1, height: 3.5, rotation: 0 },
            { x: 0, z: 155, width: 35, depth: 1, height: 3.5, rotation: 0 },
            { x: -70, z: 155, width: 1, depth: 30, height: 3.5, rotation: 0 },
            { x: 75, z: 150, width: 1, depth: 35, height: 3.5, rotation: 0 },
            
            // MAZE SECTION 2 (z:140 to z:80) - zigzag corridors
            { x: -25, z: 130, width: 45, depth: 1, height: 3.5, rotation: 0 },
            { x: 35, z: 120, width: 50, depth: 1, height: 3.5, rotation: 0 },
            { x: -55, z: 110, width: 1, depth: 40, height: 3.5, rotation: 0 },
            { x: 60, z: 105, width: 1, depth: 35, height: 3.5, rotation: 0 },
            { x: 10, z: 95, width: 40, depth: 1, height: 3.5, rotation: 0 },
            { x: -40, z: 85, width: 35, depth: 1, height: 3.5, rotation: 0 },
            
            // MAZE SECTION 3 (z:80 to z:20) - winding path
            { x: 45, z: 70, width: 45, depth: 1, height: 3.5, rotation: 0 },
            { x: -30, z: 60, width: 40, depth: 1, height: 3.5, rotation: 0 },
            { x: -70, z: 50, width: 1, depth: 35, height: 3.5, rotation: 0 },
            { x: 70, z: 45, width: 1, depth: 40, height: 3.5, rotation: 0 },
            { x: 15, z: 40, width: 45, depth: 1, height: 3.5, rotation: 0 },
            { x: -45, z: 30, width: 35, depth: 1, height: 3.5, rotation: 0 },
            
            // MAZE SECTION 4 (z:20 to z:-40) - central graveyard
            { x: 40, z: 15, width: 40, depth: 1, height: 3.5, rotation: 0 },
            { x: -20, z: 5, width: 45, depth: 1, height: 3.5, rotation: 0 },
            { x: -60, z: -5, width: 1, depth: 35, height: 3.5, rotation: 0 },
            { x: 65, z: -10, width: 1, depth: 40, height: 3.5, rotation: 0 },
            { x: 20, z: -20, width: 40, depth: 1, height: 3.5, rotation: 0 },
            { x: -35, z: -30, width: 35, depth: 1, height: 3.5, rotation: 0 },
            
            // MAZE SECTION 5 (z:-40 to z:-100) - deeper graves
            { x: 50, z: -45, width: 45, depth: 1, height: 3.5, rotation: 0 },
            { x: -25, z: -55, width: 40, depth: 1, height: 3.5, rotation: 0 },
            { x: -65, z: -65, width: 1, depth: 35, height: 3.5, rotation: 0 },
            { x: 70, z: -70, width: 1, depth: 40, height: 3.5, rotation: 0 },
            { x: 10, z: -80, width: 45, depth: 1, height: 3.5, rotation: 0 },
            { x: -40, z: -90, width: 35, depth: 1, height: 3.5, rotation: 0 },
            
            // MAZE SECTION 6 (z:-100 to z:-160) - crypt approach
            { x: 45, z: -105, width: 40, depth: 1, height: 3.5, rotation: 0 },
            { x: -30, z: -115, width: 45, depth: 1, height: 3.5, rotation: 0 },
            { x: -60, z: -125, width: 1, depth: 35, height: 3.5, rotation: 0 },
            { x: 65, z: -130, width: 1, depth: 40, height: 3.5, rotation: 0 },
            { x: 15, z: -140, width: 40, depth: 1, height: 3.5, rotation: 0 },
            { x: -40, z: -150, width: 35, depth: 1, height: 3.5, rotation: 0 },
            
            // CRYPT ENTRANCE (z:-160 to z:-200)
            { x: -25, z: -170, width: 30, depth: 1, height: 4, rotation: 0 },
            { x: 25, z: -175, width: 30, depth: 1, height: 4, rotation: 0 },
            { x: 0, z: -185, width: 25, depth: 1, height: 4, rotation: 0 }
        ],
        
        // No scarabs - graveyard has different creatures
        scarabs: [],
        
        // Safe zone bounds
        safeZoneBounds: {
            minX: -120,
            maxX: 120,
            minZ: -230,
            maxZ: 210
        }
    }
};

// Helper to get current level config
function getLevelConfig(levelNumber) {
    return LEVELS[levelNumber] || LEVELS[1];
}

// Backward compatibility - these point to level 1 for any code that still uses them
const GOBLIN_POSITIONS = LEVELS[1].goblins;
const HILLS = LEVELS[1].hills;
const MOUNTAINS = LEVELS[1].mountains;
