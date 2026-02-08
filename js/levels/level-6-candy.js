// Level 6 - Candy Kingdom
// Candy theme with chocolate rivers, lollipops and gummy bears

LEVEL_REGISTRY.register(6, {
    name: "Level 6 - Candy Kingdom",
    theme: 'candy',
    
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
});
