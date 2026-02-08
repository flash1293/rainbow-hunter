// Level 3 - The Scorching Sands
// Desert theme with mummies and tornados

LEVEL_REGISTRY.register(3, {
    name: "Level 3 - The Scorching Sands",
    theme: 'desert',
    
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
});
