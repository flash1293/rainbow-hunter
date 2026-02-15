// Level 11 - Easter Meadow
// Bright spring meadow with Easter decorations and the Giant Easter Bunny boss
// Unique mechanic: Easter Egg Hunt - collect hidden eggs to unlock the portal

LEVEL_REGISTRY.register(11, {
    name: "Level 11 - Easter Meadow",
    theme: 'easter',
    
    // Player start position - Meadow entrance
    playerStart: { x: 0, z: 180 },
    
    // Portal leads back to Level 1
    portal: { x: 0, z: -220, destinationLevel: 1 },
    
    // Easter theme settings
    easterTheme: true,
    skyColor: 0xFFB6C1,          // Light pink sky
    groundColor: 0x90EE90,       // Light green meadow
    fogDensity: 0.004,           // Light spring haze
    fogColor: 0xFFF0F5,          // Lavender blush
    
    // No river - has flower patches and egg hiding spots
    hasRiver: false,
    hasMaterials: false,
    
    // Easter Egg Hunt mechanic
    hasEasterEggHunt: true,
    requiredEggs: 8,  // Must collect 8 eggs to unlock portal
    
    // Rolling hills for egg hiding
    hasMountains: true,
    
    // Theme colors
    hillColor: 0x98FB98,         // Pale green hills
    treeColor: 0xFFB6C1,         // Pink blossom trees
    grassColor: 0x7CFC00,        // Lawn green
    
    // Level 11 has treasure - Easter basket
    hasTreasure: true,
    treasurePosition: { x: 0, z: -200 },
    
    // Rainbow at end
    rainbow: { x: 0, z: -195 },
    
    // GIANT EASTER BUNNY boss
    dragon: { x: 0, z: -175, scale: 1.0 },
    useEasterBunny: true,
    useReaper: false,
    extraDragons: [
        // Mini Easter bunnies guarding clearings
        { x: -50, z: -80, scale: 0.5, health: 25 },
        { x: 55, z: -100, scale: 0.5, health: 25 }
    ],
    
    // World Kite position - hidden in flower patch
    worldKite: { x: 5, z: 175 },

    // No iceberg in Easter meadow
    iceBerg: null,
    
    // =========================================
    // EASTER EGGS - use scarab system for collection mechanic
    // Format: { x, z }
    // =========================================
    scarabs: [
        // Near start - easier to find
        { x: 25, z: 170 },
        { x: -30, z: 155 },
        // Mid-field eggs
        { x: 50, z: 120 },
        { x: -55, z: 90 },
        { x: 40, z: 50 },
        { x: -45, z: 10 },
        // Harder to reach eggs
        { x: 55, z: -40 },
        { x: -50, z: -80 },
        { x: 35, z: -120 },
        { x: -40, z: -150 },
        // Near boss - most dangerous
        { x: 20, z: -165 },
        { x: -25, z: -175 }
    ],
    
    // Message shown to player about egg collection
    scarabMessage: "Sammle alle Ostereier, um das Portal zu öffnen!",
    
    // =========================================
    // FLOWER PATCHES - decorative spring flowers
    // Format: { x, z, radius }
    // =========================================
    flowerPatches: [
        { x: -40, z: 165, radius: 8 },
        { x: 50, z: 145, radius: 7 },
        { x: -55, z: 105, radius: 9 },
        { x: 45, z: 75, radius: 8 },
        { x: -35, z: 35, radius: 7 },
        { x: 55, z: -5, radius: 8 },
        { x: -45, z: -55, radius: 9 },
        { x: 40, z: -95, radius: 7 },
        { x: -50, z: -135, radius: 8 },
        { x: 35, z: -170, radius: 7 }
    ],
    
    // =========================================
    // EASTER BASKETS - decorative baskets
    // Format: { x, z, scale }
    // =========================================
    easterBaskets: [
        { x: -20, z: 160, scale: 1.2 },
        { x: 30, z: 130, scale: 1.0 },
        { x: -45, z: 80, scale: 1.3 },
        { x: 50, z: 40, scale: 1.1 },
        { x: -30, z: -10, scale: 1.2 },
        { x: 40, z: -60, scale: 1.0 },
        { x: -50, z: -110, scale: 1.3 },
        { x: 25, z: -145, scale: 1.1 }
    ],
    
    // =========================================
    // BLOSSOM TREES - pink flowering trees
    // Format: { x, z, scale }
    // =========================================
    blossomTrees: [
        // Meadow entrance - welcoming trees
        { x: -25, z: 175, scale: 1.8 },
        { x: 30, z: 170, scale: 2.0 },
        { x: -45, z: 155, scale: 1.7 },
        { x: 50, z: 150, scale: 1.9 },
        // Along the path
        { x: -60, z: 115, scale: 2.2 },
        { x: 55, z: 105, scale: 2.0 },
        { x: -50, z: 65, scale: 1.8 },
        { x: 60, z: 55, scale: 2.1 },
        { x: -55, z: 15, scale: 1.9 },
        { x: 50, z: 5, scale: 1.8 },
        { x: -60, z: -35, scale: 2.0 },
        { x: 55, z: -50, scale: 2.2 },
        { x: -50, z: -90, scale: 1.9 },
        { x: 60, z: -105, scale: 1.8 },
        // Near boss area
        { x: -45, z: -145, scale: 2.3 },
        { x: 50, z: -155, scale: 2.1 },
        { x: -35, z: -180, scale: 2.5 },
        { x: 40, z: -185, scale: 2.4 }
    ],

    // Rolling green hills
    hills: [
        { x: -35, z: 170, radius: 10, height: 4 },
        { x: 45, z: 155, radius: 9, height: 3.5 },
        { x: -50, z: 120, radius: 8, height: 3 },
        { x: 55, z: 85, radius: 10, height: 4 },
        { x: -40, z: 45, radius: 9, height: 3.5 },
        { x: 50, z: 10, radius: 8, height: 3 },
        { x: -45, z: -30, radius: 10, height: 4 },
        { x: 55, z: -70, radius: 9, height: 3.5 },
        { x: -50, z: -115, radius: 8, height: 3 },
        { x: 45, z: -150, radius: 10, height: 4 }
    ],
    
    // Hedge walls forming garden paths (low hedges)
    mountains: [
        // Outer meadow edge
        { x: 0, z: 220, width: 250, height: 4 },
        { x: 0, z: -250, width: 250, height: 4 },
        { x: -125, z: 0, width: 10, height: 4 },
        { x: 125, z: 0, width: 10, height: 4 },
        // Corner hedges
        { x: -115, z: 200, width: 35, height: 5 },
        { x: 115, z: 200, width: 35, height: 5 },
        { x: -115, z: -220, width: 35, height: 5 },
        { x: 115, z: -220, width: 35, height: 5 },
        // Interior hedge barriers - winding garden path
        { x: -25, z: 140, width: 45, height: 3 },
        { x: 35, z: 95, width: 50, height: 3 },
        { x: -30, z: 50, width: 40, height: 3 },
        { x: 40, z: -20, width: 45, height: 3 },
        { x: -35, z: -75, width: 50, height: 3 }
    ],
    
    // Background hills (decorative distant meadow)
    naturalMountains: [
        // North backdrop
        { x: -100, z: 270, radius: 35, height: 40 },
        { x: -40, z: 280, radius: 40, height: 45 },
        { x: 30, z: 275, radius: 38, height: 42 },
        { x: 95, z: 268, radius: 35, height: 38 },
        // South backdrop
        { x: -90, z: -290, radius: 38, height: 42 },
        { x: -30, z: -295, radius: 42, height: 48 },
        { x: 40, z: -288, radius: 40, height: 45 },
        { x: 100, z: -285, radius: 35, height: 40 },
        // West meadow hills
        { x: -170, z: 180, radius: 32, height: 35 },
        { x: -175, z: 100, radius: 38, height: 42 },
        { x: -168, z: 20, radius: 35, height: 38 },
        { x: -172, z: -60, radius: 40, height: 45 },
        { x: -165, z: -140, radius: 32, height: 35 },
        // East meadow hills
        { x: 172, z: 160, radius: 35, height: 38 },
        { x: 168, z: 80, radius: 40, height: 45 },
        { x: 175, z: 0, radius: 38, height: 42 },
        { x: 170, z: -80, radius: 35, height: 40 },
        { x: 165, z: -160, radius: 32, height: 35 }
    ],
    
    // =========================================
    // ENEMIES
    // =========================================
    
    // Bunnies (goblin variant) - cute but fast attackers [x, z, patrolLeft, patrolRight, speed]
    goblins: [
        // Near entrance
        [20, 175, 15, 25, 0.014],
        [-25, 165, -30, -20, 0.015],
        [30, 150, 25, 35, 0.014],
        [-20, 140, -25, -15, 0.015],
        // Mid-meadow bunnies
        [25, 110, 20, 30, 0.016],
        [-30, 85, -35, -25, 0.015],
        [20, 55, 15, 25, 0.016],
        [-25, 25, -30, -20, 0.015],
        [30, -10, 25, 35, 0.016],
        [-20, -40, -25, -15, 0.015],
        // Deep meadow bunnies
        [25, -75, 20, 30, 0.017],
        [-30, -105, -35, -25, 0.016],
        [20, -135, 15, 25, 0.017],
        [-25, -160, -30, -20, 0.016],
        // Scout bunnies near boss
        [15, -175, 10, 20, 0.018],
        [-20, -180, -25, -15, 0.017]
    ],
    
    // Egg Warriors (guardian variant) - ranged egg throwers [x, z, patrolLeft, patrolRight, speed]
    guardians: [
        [50, 155, 45, 55, 0.010],
        [-55, 115, -60, -50, 0.011],
        [55, 70, 50, 60, 0.010],
        [-50, 30, -55, -45, 0.011],
        [50, -20, 45, 55, 0.010],
        [-55, -65, -60, -50, 0.011],
        [55, -115, 50, 60, 0.012],
        [-50, -155, -55, -45, 0.011]
    ],
    
    // Chicks (giant variant) - slow tanky chicks
    giants: [
        [-5, 125, -20, 10],
        [55, 75, 45, 65],
        [-60, 20, -70, -50],
        [5, -35, -10, 20],
        [-55, -90, -65, -45],
        [60, -140, 50, 70]
    ],
    
    // Easter Wizards (wizard variant) - magic carrot staff [x, z, patrolLeft, patrolRight, speed]
    wizards: [
        [35, 145, 30, 40, 0.008],
        [-40, 100, -45, -35, 0.009],
        [45, 50, 40, 50, 0.008],
        [-35, 0, -40, -30, 0.009],
        [40, -55, 35, 45, 0.008],
        [-45, -100, -50, -40, 0.009],
        [0, -145, -5, 5, 0.010]
    ],
    
    // No mummies, lava monsters, or skeletons in Easter meadow
    mummies: [],
    lavaMonsters: [],
    skeletons: [],
    
    // Hard mode extra bunnies
    hardModeGoblins: [
        [40, 180, 35, 45, 0.019],
        [-45, 158, -50, -40, 0.018],
        [35, 125, 30, 40, 0.019],
        [-40, 95, -45, -35, 0.018],
        [45, 60, 40, 50, 0.019],
        [-35, 28, -40, -30, 0.018],
        [40, -8, 35, 45, 0.019],
        [-45, -48, -50, -40, 0.018],
        [35, -88, 30, 40, 0.020],
        [-40, -125, -45, -35, 0.019]
    ],
    
    // Egg Bombers (bird variant) - flying birds dropping egg bombs
    birds: [
        [0, 160, 35, 0.012],
        [-35, 105, 32, 0.013],
        [40, 55, 34, 0.011],
        [-30, 5, 30, 0.012],
        [35, -50, 32, 0.013],
        [-40, -100, 35, 0.014],
        [0, -140, 38, 0.012]
    ],
    
    // =========================================
    // ITEM PICKUPS
    // =========================================
    
    // Ammo hidden in flower patches
    ammoPositions: [
        { x: 15, z: 185 }, { x: -20, z: 168 }, { x: 25, z: 145 },
        { x: -30, z: 118 }, { x: 20, z: 90 }, { x: -25, z: 65 },
        { x: 30, z: 40 }, { x: -20, z: 15 }, { x: 25, z: -15 },
        { x: -30, z: -45 }, { x: 20, z: -75 }, { x: -25, z: -105 },
        { x: 0, z: 175 }, { x: 0, z: 105 }, { x: 0, z: 45 },
        { x: 0, z: -25 }, { x: 0, z: -90 },
        { x: 45, z: 165 }, { x: -50, z: 120 }, { x: 55, z: 70 },
        { x: -45, z: 25 }, { x: 50, z: -30 }, { x: -55, z: -85 }
    ],
    
    // Banana items near baskets
    bananaPositions: [
        { x: -25, z: 158 }, { x: 35, z: 128 }, { x: -50, z: 78 },
        { x: 55, z: 38 }, { x: -35, z: -12 }, { x: 45, z: -62 },
        { x: -55, z: -112 }, { x: 30, z: -147 }
    ],
    
    // Bombs near obstacles
    bombPositions: [
        { x: -45, z: 138 }, { x: 50, z: 93 }, { x: -35, z: 48 },
        { x: 40, z: -22 }, { x: -50, z: -77 }, { x: 45, z: -117 }
    ],
    
    // Health in flower patches
    healthPositions: [
        { x: -35, z: 163 }, { x: 45, z: 143 }, { x: -50, z: 103 },
        { x: 40, z: 73 }, { x: -30, z: 33 }, { x: 50, z: -7 },
        { x: -45, z: -57 }, { x: 35, z: -97 }, { x: -40, z: -137 },
        { x: 30, z: -172 }, { x: 0, z: 195 }, { x: 0, z: 140 },
        { x: 0, z: 80 }, { x: 0, z: -40 }, { x: 0, z: -100 }
    ],
    
    // Herzman defenses near difficult areas
    herzmanPositions: [
        { x: 0, z: 165 },
        { x: -45, z: 55 },
        { x: 50, z: -35 },
        { x: 0, z: -95 }
    ]
});
