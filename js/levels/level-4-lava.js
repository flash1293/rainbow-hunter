// Level 4 - The Lava Caves
// Lava theme with underground setting, lava pools and cave creatures

LEVEL_REGISTRY.register(4, {
    name: "Level 4 - The Lava Caves",
    theme: 'lava',
    
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
});
