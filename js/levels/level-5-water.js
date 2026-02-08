// Level 5 - The Deep Waters
// Water theme with islands, sharks, and whirlpools

LEVEL_REGISTRY.register(5, {
    name: "Level 5 - The Deep Waters",
    theme: 'water',

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
});
