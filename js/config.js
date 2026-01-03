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
        skyColor: 0x4a6fa5,  // Darker blue sky
        groundColor: 0xc8e6f5,  // Icy ground
        fogDensity: 0.008,
        
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
        
        // World Kite position - not needed since carried over
        worldKite: null,
        
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
        skyColor: 0xffcc66,  // Warm sunset sky
        groundColor: 0xe8c36a,  // Sandy ground
        fogDensity: 0.005,
        fogColor: 0xffe4b3,  // Dusty yellow fog
        
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
        
        // World Kite position - not needed since carried over
        worldKite: null,
        
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
        
        // Mummies - guarding chokepoints, scarabs nearby [x, z, patrolLeft, patrolRight, speed]
        mummies: [
            // Guard first chokepoint gap at z=120 (center opening)
            [0, 120, -10, 10, 0.01],
            [20, 115, 15, 25, 0.008],
            [-20, 125, -25, -15, 0.008],
            // Guard second chokepoint at z=40
            [0, 45, -10, 10, 0.009],
            // Guard third chokepoint at z=-40 (left opening)
            [-35, -35, -45, -25, 0.01],
            // Guard fourth chokepoint at z=-100 (right opening)
            [35, -95, 25, 45, 0.01],
            // Guard final approach at z=-150
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
        
        // Birds flying over desert
        birds: [
            [0, 80, 35, 0.006],
            [-40, -40, 30, 0.007],
            [40, -120, 32, 0.006]
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
            // Cacti scattered around
            { x: -30, z: 160, type: 'cactus' }, { x: 45, z: 145, type: 'cactus' },
            { x: -55, z: 120, type: 'cactus' }, { x: 70, z: 100, type: 'cactus' },
            { x: -40, z: 70, type: 'cactus' }, { x: 50, z: 55, type: 'cactus' },
            { x: -65, z: 30, type: 'cactus' }, { x: 35, z: 10, type: 'cactus' },
            { x: -45, z: -25, type: 'cactus' }, { x: 60, z: -45, type: 'cactus' },
            { x: -55, z: -75, type: 'cactus' }, { x: 45, z: -95, type: 'cactus' },
            { x: -35, z: -125, type: 'cactus' }, { x: 55, z: -145, type: 'cactus' },
            // Palms near oasis (treasure area)
            { x: -15, z: -165, type: 'palm' }, { x: 15, z: -170, type: 'palm' },
            { x: -20, z: -185, type: 'palm' }, { x: 20, z: -185, type: 'palm' },
            { x: 0, z: -195, type: 'palm' }
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
        
        // Canyon walls - create chokepoints forcing player through mummy areas
        // Each wall has: x, z, width, depth, height, rotation (in radians)
        canyonWalls: [
            // First chokepoint around z=120 - walls on sides, gap in middle guarded by mummies
            { x: -60, z: 120, width: 80, depth: 8, height: 12, rotation: 0 },
            { x: 60, z: 120, width: 80, depth: 8, height: 12, rotation: 0 },
            
            // Second chokepoint around z=40 - narrower passage
            { x: -55, z: 40, width: 70, depth: 8, height: 14, rotation: 0 },
            { x: 55, z: 40, width: 70, depth: 8, height: 14, rotation: 0 },
            
            // Third chokepoint around z=-40 - offset to create winding path
            { x: -70, z: -40, width: 60, depth: 8, height: 12, rotation: 0 },
            { x: 50, z: -40, width: 90, depth: 8, height: 12, rotation: 0 },
            
            // Fourth chokepoint around z=-100 - opposite side
            { x: -50, z: -100, width: 90, depth: 8, height: 14, rotation: 0 },
            { x: 70, z: -100, width: 60, depth: 8, height: 14, rotation: 0 },
            
            // Final approach to treasure - narrow canyon
            { x: -40, z: -150, width: 50, depth: 8, height: 16, rotation: 0 },
            { x: 40, z: -150, width: 50, depth: 8, height: 16, rotation: 0 }
        ],
        
        // No scarabs needed since portal leads to Level 4
        scarabs: [],
        
        // Message to show player about portal
        scarabMessage: "Find the portal to the Lava Caves!"
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
        skyColor: 0x1a0a00,         // Very dark reddish-black (cave darkness)
        groundColor: 0x8a6a50,      // Medium brown - visible but cave-like
        fogDensity: 0.008,          // Light fog for atmosphere
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
        
        // No dragon in lava level - just goblins and guardians
        dragon: null,
        extraDragons: [],
        
        // World Kite position - not needed since carried over
        worldKite: null,
        
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
        
        // No birds in underground caves
        birds: [],
        
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
        
        // Cave walls - box in the lava caves with rock walls (completely sealed)
        canyonWalls: [
            // North wall (back of cave) - full width
            { x: 0, z: -200, width: 260, depth: 12, height: 25, rotation: 0 },
            // South wall (front of cave) - full width, no gap
            { x: 0, z: 200, width: 260, depth: 12, height: 25, rotation: 0 },
            // West wall (left side) - connects north to south
            { x: -125, z: 0, width: 12, depth: 415, height: 25, rotation: 0 },
            // East wall (right side) - connects north to south
            { x: 125, z: 0, width: 12, depth: 415, height: 25, rotation: 0 }
        ],
        
        // No scarabs in lava level
        scarabs: []
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
