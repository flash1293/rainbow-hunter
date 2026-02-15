// Level 10 - The Enchanted Grove
// Mystical fairy forest with fog, giant trees, and the Corrupted Unicorn boss
// Unique mechanic: Shrink/Grow - Dark Fairies shrink players, Size Potions restore/grow

LEVEL_REGISTRY.register(10, {
    name: "Level 10 - The Enchanted Grove",
    theme: 'enchanted',
    
    // Player start position - Forest entrance clearing
    playerStart: { x: 0, z: 180 },
    
    // Portal leads to Level 11 - Easter Meadow
    portal: { x: 0, z: -220, destinationLevel: 11 },
    
    // Enchanted theme settings
    enchantedTheme: true,
    skyColor: 0x9FD5D1,          // Soft teal sky
    groundColor: 0x3D7A47,       // Lush forest green
    fogDensity: 0.025,           // Dense mystical fog
    fogColor: 0xB8D4CE,          // Misty green-white
    
    // No river - has fairy rings and mushroom patches instead
    hasRiver: false,
    hasFairyRings: true,
    hasMaterials: false,
    
    // Has natural tree walls instead of mountains
    hasMountains: true,
    
    // Theme colors
    hillColor: 0x2D6B37,         // Moss green hills
    treeColor: 0x2A5D34,         // Deep forest green
    grassColor: 0x4A9E54,        // Vibrant grass
    
    // Level 10 has treasure - the Fairy Queen's crown
    hasTreasure: true,
    treasurePosition: { x: 0, z: -200 },
    
    // Rainbow at end
    rainbow: { x: 0, z: -195 },
    
    // CORRUPTED UNICORN boss - dark flying unicorn
    dragon: { x: 0, z: -175, scale: 1.0 },
    useUnicorn: true,
    useReaper: false,
    extraDragons: [
        // Mini corrupted unicorns guarding clearings
        { x: -50, z: -80, scale: 0.5, health: 25 },
        { x: 55, z: -100, scale: 0.5, health: 25 }
    ],
    
    // World Kite position - hidden in fairy ring
    worldKite: { x: 5, z: 175 },

    // No iceberg in enchanted forest
    iceBerg: null,
    
    // =========================================
    // FAIRY RINGS - magical mushroom circles with sparkle effects
    // Format: { x, z, radius }
    // =========================================
    fairyRings: [
        { x: -50, z: 160, radius: 8 },
        { x: 60, z: 140, radius: 7 },
        { x: -40, z: 100, radius: 9 },
        { x: 50, z: 70, radius: 8 },
        { x: -55, z: 30, radius: 7 },
        { x: 45, z: -10, radius: 8 },
        { x: -35, z: -60, radius: 9 },
        { x: 60, z: -90, radius: 7 },
        { x: -50, z: -130, radius: 8 },
        { x: 40, z: -160, radius: 7 }
    ],
    
    // =========================================
    // GIANT TREES - massive ancient trees that define the grove
    // Much more trees than normal, and they're huge
    // Format: { x, z, scale }
    // =========================================
    giantTrees: [
        // Forest entrance - welcoming giant trees
        { x: -30, z: 170, scale: 2.5 },
        { x: 35, z: 165, scale: 2.8 },
        { x: -50, z: 150, scale: 2.3 },
        { x: 55, z: 145, scale: 2.6 },
        { x: -20, z: 130, scale: 2.4 },
        { x: 25, z: 125, scale: 2.7 },
        // Dense grove section
        { x: -60, z: 110, scale: 3.0 },
        { x: 65, z: 100, scale: 2.9 },
        { x: -45, z: 85, scale: 2.5 },
        { x: 50, z: 80, scale: 2.6 },
        { x: -70, z: 60, scale: 2.8 },
        { x: 70, z: 55, scale: 2.7 },
        { x: -55, z: 35, scale: 2.4 },
        { x: 60, z: 30, scale: 2.5 },
        // Deep forest
        { x: -65, z: 10, scale: 2.9 },
        { x: 65, z: 5, scale: 3.0 },
        { x: -50, z: -15, scale: 2.6 },
        { x: 55, z: -20, scale: 2.5 },
        { x: -70, z: -45, scale: 2.8 },
        { x: 70, z: -50, scale: 2.7 },
        { x: -60, z: -75, scale: 3.0 },
        { x: 60, z: -80, scale: 2.9 },
        // Near boss clearing
        { x: -40, z: -110, scale: 2.5 },
        { x: 45, z: -115, scale: 2.6 },
        { x: -55, z: -140, scale: 2.8 },
        { x: 55, z: -145, scale: 2.7 },
        // Boss arena perimeter - ancient sentinels
        { x: -35, z: -170, scale: 3.2 },
        { x: 40, z: -175, scale: 3.0 },
        { x: -60, z: -190, scale: 3.5 },
        { x: 60, z: -195, scale: 3.3 }
    ],
    
    // =========================================
    // ENCHANTED MUSHROOMS - glowing oversized mushrooms
    // Format: { x, z, scale }
    // =========================================
    enchantedMushrooms: [
        { x: -25, z: 155, scale: 1.5 },
        { x: 30, z: 135, scale: 1.8 },
        { x: -40, z: 90, scale: 1.6 },
        { x: 45, z: 65, scale: 1.7 },
        { x: -30, z: 20, scale: 1.5 },
        { x: 35, z: -25, scale: 1.8 },
        { x: -45, z: -70, scale: 1.6 },
        { x: 40, z: -105, scale: 1.7 },
        { x: -20, z: -150, scale: 1.5 },
        { x: 25, z: -180, scale: 1.8 }
    ],
    
    // =========================================
    // CRYSTAL FLOWERS - magical rainbow flowers
    // Format: { x, z }
    // =========================================
    crystalFlowers: [
        { x: -15, z: 175 }, { x: 20, z: 160 }, { x: -35, z: 140 },
        { x: 40, z: 120 }, { x: -50, z: 95 }, { x: 55, z: 70 },
        { x: -25, z: 45 }, { x: 30, z: 15 }, { x: -40, z: -20 },
        { x: 45, z: -55 }, { x: -55, z: -85 }, { x: 50, z: -120 },
        { x: -20, z: -155 }, { x: 15, z: -185 }
    ],
    
    // =========================================
    // RAINBOW ARCS - small floating rainbows
    // Format: { x, z, height }
    // =========================================
    rainbowArcs: [
        { x: -45, z: 150, height: 8 },
        { x: 50, z: 110, height: 10 },
        { x: -55, z: 50, height: 9 },
        { x: 45, z: -15, height: 8 },
        { x: -40, z: -80, height: 10 },
        { x: 55, z: -130, height: 9 }
    ],
    
    // =========================================
    // THORN PATCHES - damage zones scattered in the forest
    // Format: { x, z, radius }
    // =========================================
    thornPatches: [
        { x: -55, z: 130, radius: 6 },
        { x: 60, z: 85, radius: 5 },
        { x: -45, z: 40, radius: 6 },
        { x: 50, z: -5, radius: 5 },
        { x: -60, z: -55, radius: 6 },
        { x: 55, z: -95, radius: 5 },
        { x: -40, z: -135, radius: 6 },
        { x: 45, z: -165, radius: 5 }
    ],
    
    // =========================================
    // SLEEP SPORE CLOUDS - slowing hazard zones
    // Format: { x, z, radius }
    // =========================================
    sleepSpores: [
        { x: -35, z: 145, radius: 8 },
        { x: 45, z: 95, radius: 7 },
        { x: -50, z: 50, radius: 8 },
        { x: 40, z: 5, radius: 7 },
        { x: -55, z: -40, radius: 8 },
        { x: 50, z: -85, radius: 7 },
        { x: -45, z: -125, radius: 8 },
        { x: 40, z: -155, radius: 7 }
    ],
    
    // =========================================
    // SIZE POTION POSITIONS - restore size or become giant briefly
    // Format: { x, z }
    // =========================================
    sizePotionPositions: [
        { x: 0, z: 150 },
        { x: -40, z: 100 },
        { x: 45, z: 50 },
        { x: 0, z: 0 },
        { x: -45, z: -50 },
        { x: 50, z: -100 },
        { x: 0, z: -145 }
    ],

    // Mossy hills throughout the grove
    hills: [
        { x: -40, z: 170, radius: 10, height: 4 },
        { x: 50, z: 155, radius: 9, height: 3.5 },
        { x: -55, z: 120, radius: 8, height: 3 },
        { x: 60, z: 90, radius: 10, height: 4 },
        { x: -45, z: 55, radius: 9, height: 3.5 },
        { x: 55, z: 20, radius: 8, height: 3 },
        { x: -50, z: -15, radius: 10, height: 4 },
        { x: 50, z: -50, radius: 9, height: 3.5 },
        { x: -55, z: -90, radius: 8, height: 3 },
        { x: 60, z: -125, radius: 10, height: 4 }
    ],
    
    // Dense tree walls forming natural barriers
    mountains: [
        // Outer forest edge - impenetrable ancient trees
        { x: 0, z: 220, width: 250, height: 18 },
        { x: 0, z: -250, width: 250, height: 18 },
        { x: -125, z: 0, width: 10, height: 18 },
        { x: 125, z: 0, width: 10, height: 18 },
        // Corner thickets
        { x: -115, z: 200, width: 35, height: 22 },
        { x: 115, z: 200, width: 35, height: 22 },
        { x: -115, z: -220, width: 35, height: 22 },
        { x: 115, z: -220, width: 35, height: 22 },
        // Interior tree barriers - winding forest path
        { x: -30, z: 135, width: 50, height: 14 },
        { x: 40, z: 75, width: 55, height: 14 },
        { x: -35, z: 15, width: 45, height: 14 },
        { x: 35, z: -45, width: 50, height: 14 },
        { x: -25, z: -105, width: 55, height: 14 }
    ],
    
    // Background forest (decorative distant trees)
    naturalMountains: [
        // North forest backdrop
        { x: -100, z: 270, radius: 35, height: 50 },
        { x: -40, z: 280, radius: 40, height: 55 },
        { x: 30, z: 275, radius: 38, height: 52 },
        { x: 95, z: 268, radius: 35, height: 48 },
        // South forest backdrop
        { x: -90, z: -290, radius: 38, height: 52 },
        { x: -30, z: -295, radius: 42, height: 58 },
        { x: 40, z: -288, radius: 40, height: 55 },
        { x: 100, z: -285, radius: 35, height: 50 },
        // West forest range
        { x: -170, z: 180, radius: 32, height: 45 },
        { x: -175, z: 100, radius: 38, height: 52 },
        { x: -168, z: 20, radius: 35, height: 48 },
        { x: -172, z: -60, radius: 40, height: 55 },
        { x: -165, z: -140, radius: 32, height: 45 },
        // East forest range
        { x: 172, z: 160, radius: 35, height: 48 },
        { x: 168, z: 80, radius: 40, height: 55 },
        { x: 175, z: 0, radius: 38, height: 52 },
        { x: 170, z: -80, radius: 35, height: 50 },
        { x: 165, z: -160, radius: 32, height: 45 }
    ],
    
    // =========================================
    // ENEMIES
    // =========================================
    
    // Pixies (goblin variant) - small fast fairies [x, z, patrolLeft, patrolRight, speed]
    goblins: [
        // Forest entrance pixies
        [20, 175, 15, 25, 0.015],
        [-25, 165, -30, -20, 0.016],
        [30, 150, 25, 35, 0.015],
        [-20, 140, -25, -15, 0.016],
        // Grove path pixies
        [25, 115, 20, 30, 0.017],
        [-30, 95, -35, -25, 0.016],
        [20, 70, 15, 25, 0.017],
        [-25, 45, -30, -20, 0.016],
        [30, 15, 25, 35, 0.017],
        [-20, -10, -25, -15, 0.016],
        // Deep grove pixies
        [25, -40, 20, 30, 0.018],
        [-30, -70, -35, -25, 0.017],
        [20, -100, 15, 25, 0.018],
        [-25, -130, -30, -20, 0.017],
        // Boss area scout pixies
        [15, -155, 10, 20, 0.019],
        [-20, -165, -25, -15, 0.018]
    ],
    
    // Dark Fairies (guardian variant) - cast shrink spells [x, z, patrolLeft, patrolRight, speed]
    guardians: [
        [50, 155, 45, 55, 0.010],
        [-55, 120, -60, -50, 0.011],
        [55, 75, 50, 60, 0.010],
        [-50, 35, -55, -45, 0.011],
        [50, -15, 45, 55, 0.010],
        [-55, -60, -60, -50, 0.011],
        [55, -110, 50, 60, 0.012],
        [-50, -150, -55, -45, 0.011]
    ],
    
    // Treants (giant variant) - slow but tanky tree guardians
    giants: [
        [-5, 130, -20, 10],
        [55, 80, 45, 65],
        [-60, 25, -70, -50],
        [5, -30, -10, 20],
        [-55, -85, -65, -45],
        [60, -135, 50, 70]
    ],
    
    // Enchantresses (wizard variant) - nature magic [x, z, patrolLeft, patrolRight, speed]
    wizards: [
        [35, 145, 30, 40, 0.008],
        [-40, 105, -45, -35, 0.009],
        [45, 55, 40, 50, 0.008],
        [-35, 5, -40, -30, 0.009],
        [40, -50, 35, 45, 0.008],
        [-45, -95, -50, -40, 0.009],
        [0, -140, -5, 5, 0.010]
    ],
    
    // No mummies, lava monsters, or skeletons in enchanted grove
    mummies: [],
    lavaMonsters: [],
    skeletons: [],
    
    // Hard mode extra pixies
    hardModeGoblins: [
        [40, 180, 35, 45, 0.020],
        [-45, 160, -50, -40, 0.019],
        [35, 130, 30, 40, 0.020],
        [-40, 100, -45, -35, 0.019],
        [45, 65, 40, 50, 0.020],
        [-35, 30, -40, -30, 0.019],
        [40, -5, 35, 45, 0.020],
        [-45, -45, -50, -40, 0.019],
        [35, -85, 30, 40, 0.021],
        [-40, -120, -45, -35, 0.020]
    ],
    
    // Giant butterflies (bird variant) - drop sleep spores
    birds: [
        [0, 160, 35, 0.012],
        [-35, 110, 32, 0.013],
        [40, 60, 34, 0.011],
        [-30, 10, 30, 0.012],
        [35, -45, 32, 0.013],
        [-40, -95, 35, 0.014],
        [0, -135, 38, 0.012]
    ],
    
    // =========================================
    // ITEM PICKUPS
    // =========================================
    
    // Ammo hidden in flower patches
    ammoPositions: [
        { x: 15, z: 185 }, { x: -20, z: 168 }, { x: 25, z: 145 },
        { x: -30, z: 120 }, { x: 20, z: 95 }, { x: -25, z: 70 },
        { x: 30, z: 45 }, { x: -20, z: 20 }, { x: 25, z: -10 },
        { x: -30, z: -40 }, { x: 20, z: -70 }, { x: -25, z: -100 },
        { x: 0, z: 175 }, { x: 0, z: 110 }, { x: 0, z: 50 },
        { x: 0, z: -20 }, { x: 0, z: -85 },
        { x: 45, z: 165 }, { x: -50, z: 125 }, { x: 55, z: 75 },
        { x: -45, z: 30 }, { x: 50, z: -25 }, { x: -55, z: -80 }
    ],
    
    // Banana items near fairy rings
    bananaPositions: [
        { x: -45, z: 158 }, { x: 55, z: 135 }, { x: -35, z: 98 },
        { x: 45, z: 68 }, { x: -50, z: 28 }, { x: 40, z: -12 },
        { x: -30, z: -62 }, { x: 55, z: -92 }, { x: -45, z: -132 }
    ],
    
    // Bombs near thorn patches for clearing paths
    bombPositions: [
        { x: -50, z: 135 }, { x: 55, z: 90 }, { x: -40, z: 45 },
        { x: 45, z: 0 }, { x: -55, z: -50 }, { x: 50, z: -90 }
    ],
    
    // Health in mushroom areas
    healthPositions: [
        { x: -20, z: 158 }, { x: 25, z: 138 }, { x: -35, z: 93 },
        { x: 40, z: 68 }, { x: -25, z: 23 }, { x: 30, z: -22 },
        { x: -40, z: -67 }, { x: 35, z: -102 }, { x: -15, z: -147 },
        { x: 20, z: -177 }, { x: 0, z: 195 }, { x: 0, z: 145 },
        { x: 0, z: 85 }, { x: 0, z: -35 }, { x: 0, z: -95 }
    ],
    
    // Herzman defenses near difficult areas
    herzmanPositions: [
        { x: 0, z: 165 },
        { x: -45, z: 60 },
        { x: 50, z: -30 },
        { x: 0, z: -90 }
    ]
});
