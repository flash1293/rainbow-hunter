// Level 12 - Christmas Village
// Magical snowy Christmas village with festive enemies and Evil Santa boss
// Unique mechanic: Gift collection - collect presents to unlock portal and spawn items

LEVEL_REGISTRY.register(12, {
    name: "Level 12 - Christmas Village",
    theme: 'christmas',
    
    // Player start position - Village entrance
    playerStart: { x: 0, z: 180 },
    
    // Portal leads back to Level 1
    portal: { x: 0, z: -220, destinationLevel: 1 },
    
    // Christmas theme settings
    christmasTheme: true,
    skyColor: 0xc4d4e0,          // Match fog for seamless blend
    groundColor: 0xfffafa,       // Snow white ground
    fogDensity: 0.04,            // Dense Christmas fog
    fogColor: 0xc4d4e0,          // Light blue fog
    
    // No river - snowy village paths
    hasRiver: false,
    hasMaterials: false,
    
    // Snowy mountains
    hasMountains: true,
    
    // Theme colors
    hillColor: 0xe8e8e8,         // Snow-covered hills
    treeColor: 0x1e5631,         // Dark green pine trees
    grassColor: 0xffffff,        // Snow
    
    // Level 12 has treasure - Christmas gifts
    hasTreasure: true,
    treasurePosition: { x: 0, z: -200 },
    
    // Rainbow at end
    rainbow: { x: 0, z: -195 },
    
    // EVIL SANTA boss
    dragon: { x: 0, z: -175, scale: 1.0 },
    useReaper: false,
    useEvilSanta: true,
    extraDragons: [
        // Mini Evil Santas guarding the village
        { x: -50, z: -85, scale: 0.5, health: 25, useEvilSanta: true },
        { x: 55, z: -115, scale: 0.5, health: 25, useEvilSanta: true }
    ],
    
    // World Kite position - near entrance
    worldKite: { x: 5, z: 175 },

    // No iceberg in Christmas village
    iceBerg: null,
    
    // =========================================
    // SNOWY PINE TREES
    // Format: { x, z, scale }
    // =========================================
    christmasTrees: [
        // Village entrance
        { x: -30, z: 175, scale: 2.0 },
        { x: 35, z: 170, scale: 1.8 },
        { x: -50, z: 155, scale: 2.2 },
        { x: 55, z: 150, scale: 1.9 },
        // Village paths
        { x: -60, z: 120, scale: 2.1 },
        { x: 58, z: 110, scale: 2.0 },
        { x: -55, z: 70, scale: 1.8 },
        { x: 60, z: 60, scale: 2.3 },
        { x: -58, z: 20, scale: 2.0 },
        { x: 55, z: 10, scale: 1.9 },
        { x: -60, z: -30, scale: 2.2 },
        { x: 58, z: -45, scale: 2.1 },
        { x: -55, z: -85, scale: 2.0 },
        { x: 60, z: -100, scale: 1.8 },
        // Near boss area
        { x: -50, z: -140, scale: 2.4 },
        { x: 55, z: -150, scale: 2.2 },
        { x: -40, z: -175, scale: 2.5 },
        { x: 45, z: -180, scale: 2.3 }
    ],

    // Snowy hills
    hills: [
        { x: -40, z: 165, radius: 10, height: 4 },
        { x: 50, z: 150, radius: 9, height: 3.5 },
        { x: -55, z: 115, radius: 8, height: 3 },
        { x: 60, z: 90, radius: 10, height: 4 },
        { x: -45, z: 50, radius: 9, height: 3.5 },
        { x: 55, z: 15, radius: 8, height: 3 },
        { x: -50, z: -25, radius: 10, height: 4 },
        { x: 60, z: -65, radius: 9, height: 3.5 },
        { x: -55, z: -110, radius: 8, height: 3 },
        { x: 50, z: -145, radius: 10, height: 4 }
    ],
    
    // Snow walls forming village boundaries
    mountains: [
        // Outer village edge
        { x: 0, z: 220, width: 250, height: 5 },
        { x: 0, z: -250, width: 250, height: 5 },
        { x: -125, z: 0, width: 10, height: 5 },
        { x: 125, z: 0, width: 10, height: 5 },
        // Corner walls
        { x: -115, z: 200, width: 35, height: 6 },
        { x: 115, z: 200, width: 35, height: 6 },
        { x: -115, z: -220, width: 35, height: 6 },
        { x: 115, z: -220, width: 35, height: 6 },
        // Interior barriers
        { x: -30, z: 135, width: 45, height: 4 },
        { x: 40, z: 90, width: 50, height: 4 },
        { x: -35, z: 45, width: 40, height: 4 },
        { x: 45, z: -15, width: 45, height: 4 },
        { x: -40, z: -70, width: 50, height: 4 }
    ],
    
    // Background snowy mountains
    naturalMountains: [
        // North backdrop
        { x: -100, z: 270, radius: 35, height: 45 },
        { x: -40, z: 280, radius: 40, height: 50 },
        { x: 30, z: 275, radius: 38, height: 48 },
        { x: 95, z: 268, radius: 35, height: 45 },
        // South backdrop
        { x: -90, z: -290, radius: 38, height: 48 },
        { x: -30, z: -295, radius: 42, height: 52 },
        { x: 40, z: -288, radius: 40, height: 50 },
        { x: 100, z: -285, radius: 35, height: 45 },
        // West mountains
        { x: -170, z: 180, radius: 32, height: 40 },
        { x: -175, z: 100, radius: 38, height: 45 },
        { x: -168, z: 20, radius: 35, height: 42 },
        { x: -172, z: -60, radius: 40, height: 48 },
        { x: -165, z: -140, radius: 32, height: 40 },
        // East mountains
        { x: 172, z: 160, radius: 35, height: 42 },
        { x: 168, z: 80, radius: 40, height: 48 },
        { x: 175, z: 0, radius: 38, height: 45 },
        { x: 170, z: -80, radius: 35, height: 45 },
        { x: 165, z: -160, radius: 32, height: 40 }
    ],
    
    // =========================================
    // ENEMIES
    // =========================================
    
    // Evil Elves (goblin variant) - corrupted helpers [x, z, patrolLeft, patrolRight, speed]
    goblins: [
        // Near entrance
        [18, 172, 13, 23, 0.014],
        [-22, 162, -27, -17, 0.015],
        [28, 148, 23, 33, 0.014],
        [-18, 138, -23, -13, 0.015],
        // Mid-village elves
        [22, 108, 17, 27, 0.016],
        [-28, 82, -33, -23, 0.015],
        [18, 52, 13, 23, 0.016],
        [-22, 22, -27, -17, 0.015],
        [28, -8, 23, 33, 0.016],
        [-18, -38, -23, -13, 0.015],
        // Deep village elves
        [22, -72, 17, 27, 0.017],
        [-28, -102, -33, -23, 0.016],
        [18, -132, 13, 23, 0.017],
        [-22, -158, -27, -17, 0.016],
        // Scout elves near boss
        [12, -172, 7, 17, 0.018],
        [-18, -178, -23, -13, 0.017],
        [25, 130, 20, 30, 0.016],
        [-30, 95, -35, -25, 0.015]
    ],
    
    // Nutcracker Soldiers (guardian variant) - ranged toy soldiers [x, z, patrolLeft, patrolRight, speed]
    guardians: [
        [48, 152, 43, 53, 0.010],
        [-52, 112, -57, -47, 0.011],
        [52, 68, 47, 57, 0.010],
        [-48, 28, -53, -43, 0.011],
        [48, -18, 43, 53, 0.010],
        [-52, -62, -57, -47, 0.011],
        [52, -112, 47, 57, 0.012],
        [-48, -152, -53, -43, 0.011],
        [45, 35, 40, 50, 0.010],
        [-50, -5, -55, -45, 0.011]
    ],
    
    // Evil Snowmen (giant variant) - slow tanky snowmen
    giants: [
        [-8, 122, -23, 7],
        [52, 72, 42, 62],
        [-58, 18, -68, -48]
    ],
    
    // No wizards, mummies, lava monsters, or skeletons in Christmas village
    wizards: [],
    mummies: [],
    lavaMonsters: [],
    skeletons: [],
    
    // Hard mode extra elves
    hardModeGoblins: [
        [38, 178, 33, 43, 0.019],
        [-42, 156, -47, -37, 0.018],
        [32, 122, 27, 37, 0.019],
        [-38, 92, -43, -33, 0.018],
        [42, 58, 37, 47, 0.019],
        [-32, 26, -37, -27, 0.018],
        [38, -10, 33, 43, 0.019],
        [-42, -46, -47, -37, 0.018],
        [32, -86, 27, 37, 0.020],
        [-38, -122, -43, -33, 0.019]
    ],
    
    // Flying Reindeer (bird variant) - flying reindeer
    birds: [
        [0, 158, 35, 0.012],
        [-32, 102, 32, 0.013],
        [38, 52, 34, 0.011],
        [-28, 2, 30, 0.012],
        [32, -48, 32, 0.013],
        [-38, -98, 35, 0.014],
        [0, -138, 38, 0.012]
    ],
    
    // =========================================
    // ITEM PICKUPS
    // =========================================
    
    // Ammo scattered around village
    ammoPositions: [
        { x: 12, z: 182 }, { x: -18, z: 165 }, { x: 22, z: 142 },
        { x: -28, z: 115 }, { x: 18, z: 88 }, { x: -22, z: 62 },
        { x: 28, z: 38 }, { x: -18, z: 12 }, { x: 22, z: -18 },
        { x: -28, z: -42 }, { x: 18, z: -72 }, { x: -22, z: -102 },
        { x: 0, z: 172 }, { x: 0, z: 102 }, { x: 0, z: 42 },
        { x: 0, z: -28 }, { x: 0, z: -88 },
        { x: 42, z: 162 }, { x: -48, z: 118 }, { x: 52, z: 68 },
        { x: -42, z: 22 }, { x: 48, z: -32 }, { x: -52, z: -82 }
    ],
    
    // Banana items near houses
    bananaPositions: [
        { x: -22, z: 155 }, { x: 32, z: 125 }, { x: -48, z: 75 },
        { x: 52, z: 35 }, { x: -32, z: -15 }, { x: 42, z: -65 },
        { x: -52, z: -115 }, { x: 28, z: -145 }
    ],
    
    // Bombs near obstacles
    bombPositions: [
        { x: -42, z: 135 }, { x: 48, z: 90 }, { x: -32, z: 45 },
        { x: 38, z: -25 }, { x: -48, z: -75 }, { x: 42, z: -120 }
    ],
    
    // Health in village
    healthPositions: [
        { x: -32, z: 160 }, { x: 42, z: 140 }, { x: -48, z: 100 },
        { x: 38, z: 70 }, { x: -28, z: 30 }, { x: 48, z: -10 },
        { x: -42, z: -60 }, { x: 32, z: -100 }, { x: -38, z: -140 },
        { x: 28, z: -175 }, { x: 0, z: 192 }, { x: 0, z: 137 },
        { x: 0, z: 77 }, { x: 0, z: -43 }, { x: 0, z: -103 }
    ],
    
    // Herzman defenses near difficult areas
    herzmanPositions: [
        { x: 0, z: 162 },
        { x: -42, z: 52 },
        { x: 48, z: -38 },
        { x: 0, z: -98 }
    ]
});
