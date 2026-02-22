// Level 14 - Rapunzel's Tower
// Magical fairytale forest with mystery towers
// Unique mechanic: Mystery Towers - find Rapunzel to win, but most towers spawn enemies!

LEVEL_REGISTRY.register(14, {
    name: "Level 14 - Rapunzel's Tower",
    theme: 'rapunzel',
    
    // Player start position - Forest entrance
    playerStart: { x: 0, z: 180 },
    
    // Portal leads back to Level 1
    portal: { x: 0, z: -220, destinationLevel: 1 },
    
    // Rapunzel theme settings
    rapunzelTheme: true,
    skyColor: 0x7eb5d6,          // Soft blue sky
    groundColor: 0x4a7c4f,       // Lush green ground
    fogDensity: 0.015,           // Light mystical fog
    fogColor: 0x9ecfb7,          // Magical green fog
    
    // No river - enchanted forest paths
    hasRiver: false,
    hasMaterials: false,
    
    // Forested mountains/walls
    hasMountains: true,
    
    // Theme colors
    hillColor: 0x5d8c5d,         // Green hills
    treeColor: 0x2d5a2d,         // Deep forest green
    grassColor: 0x3d6b3d,        // Dark grass
    
    // Level 14 has treasure
    hasTreasure: true,
    treasurePosition: { x: 0, z: -200 },
    
    // Rainbow at end
    rainbow: { x: 0, z: -195 },
    
    // Boss - uses Dragon with rapunzel theme
    dragon: { x: 0, z: -175, scale: 0.8 },
    useReaper: false,
    useEvilSanta: false,
    extraDragons: [
        // Mini Tower Giants guarding the forest (regular dragons in rapunzel theme)
        { x: -50, z: -85, scale: 0.5, health: 25 },
        { x: 55, z: -115, scale: 0.5, health: 25 },
        // Flying Witch Houses - fly very high and spawn flying witches
        { x: -45, z: 120, scale: 0.6, health: 9999, useFlyingWitchHouse: true },
        { x: 50, z: 50, scale: 0.6, health: 9999, useFlyingWitchHouse: true },
        { x: -50, z: -30, scale: 0.6, health: 9999, useFlyingWitchHouse: true },
        { x: 45, z: -100, scale: 0.6, health: 9999, useFlyingWitchHouse: true }
    ],
    
    // World Kite position - near entrance
    worldKite: { x: 5, z: 175 },

    // No iceberg
    iceBerg: null,
    
    // =========================================
    // MYSTERY TOWERS - Special Mechanic
    // Format: { x, z, enemyType }
    // enemyType: 'witch', 'giant', 'crown', 'princess-swarm'
    // Rapunzel is randomly placed in one tower at runtime!
    // =========================================
    mysteryTowers: [
        { x: -60, z: 140, enemyType: 'witch' },
        { x: 65, z: 120, enemyType: 'giant' },
        { x: -55, z: 60, enemyType: 'princess-swarm' },
        { x: 70, z: 20, enemyType: 'crown' },
        { x: -65, z: -30, enemyType: 'witch' },
        { x: 60, z: -80, enemyType: 'witch' },
        { x: -70, z: -120, enemyType: 'giant' },
        { x: 55, z: -160, enemyType: 'crown' }
    ],
    
    // =========================================
    // FAIRYTALE PINE TREES
    // Format: { x, z, scale }
    // =========================================
    fairytaleTrees: [
        // Dense forest entrance (north area)
        { x: -30, z: 175, scale: 2.0 }, { x: 35, z: 170, scale: 1.8 }, { x: -50, z: 155, scale: 2.2 },
        { x: 55, z: 150, scale: 1.9 }, { x: -15, z: 165, scale: 1.7 }, { x: 10, z: 160, scale: 2.1 },
        { x: -65, z: 168, scale: 1.6 }, { x: 70, z: 162, scale: 1.8 }, { x: -25, z: 185, scale: 2.0 },
        { x: 20, z: 180, scale: 1.9 }, { x: -45, z: 195, scale: 2.2 }, { x: 50, z: 190, scale: 2.0 },
        { x: -5, z: 195, scale: 1.8 }, { x: 5, z: 175, scale: 1.6 }, { x: -70, z: 145, scale: 2.3 },
        { x: 75, z: 140, scale: 2.1 }, { x: -80, z: 160, scale: 1.9 }, { x: 85, z: 155, scale: 1.7 },
        
        // Dense forest paths (middle sections)
        { x: -40, z: 120, scale: 2.1 }, { x: 45, z: 110, scale: 2.0 }, { x: -60, z: 125, scale: 1.8 },
        { x: 65, z: 115, scale: 1.9 }, { x: -25, z: 130, scale: 2.0 }, { x: 30, z: 125, scale: 1.7 },
        { x: -75, z: 110, scale: 2.2 }, { x: 80, z: 100, scale: 2.0 }, { x: -55, z: 95, scale: 1.9 },
        { x: 60, z: 85, scale: 2.1 }, { x: -35, z: 70, scale: 1.8 }, { x: 50, z: 60, scale: 2.3 },
        { x: -70, z: 75, scale: 2.0 }, { x: 75, z: 65, scale: 1.8 }, { x: -20, z: 85, scale: 1.6 },
        { x: 25, z: 80, scale: 1.9 }, { x: -85, z: 90, scale: 2.4 }, { x: 90, z: 85, scale: 2.2 },
        
        // Middle forest dense section
        { x: -45, z: 20, scale: 2.0 }, { x: 40, z: 10, scale: 1.9 }, { x: -65, z: 30, scale: 2.1 },
        { x: 70, z: 25, scale: 1.8 }, { x: -30, z: 40, scale: 1.7 }, { x: 35, z: 35, scale: 2.0 },
        { x: -80, z: 15, scale: 2.3 }, { x: 85, z: 5, scale: 2.1 }, { x: -55, z: -5, scale: 1.9 },
        { x: 60, z: -10, scale: 2.0 }, { x: -15, z: 25, scale: 1.6 }, { x: 15, z: 15, scale: 1.8 },
        { x: -90, z: 35, scale: 2.2 }, { x: 95, z: 30, scale: 2.0 }, { x: -75, z: 50, scale: 1.9 },
        { x: 80, z: 45, scale: 2.1 },
        
        // South forest section
        { x: -50, z: -30, scale: 2.2 }, { x: 45, z: -45, scale: 2.1 }, { x: -70, z: -25, scale: 2.0 },
        { x: 75, z: -35, scale: 1.8 }, { x: -35, z: -50, scale: 1.9 }, { x: 40, z: -60, scale: 2.3 },
        { x: -85, z: -40, scale: 2.1 }, { x: 90, z: -50, scale: 1.7 }, { x: -60, z: -65, scale: 2.0 },
        { x: 65, z: -70, scale: 1.9 }, { x: -25, z: -40, scale: 1.6 }, { x: 30, z: -55, scale: 2.2 },
        { x: -95, z: -30, scale: 2.4 }, { x: 100, z: -40, scale: 2.0 }, { x: -80, z: -55, scale: 1.8 },
        { x: 85, z: -65, scale: 2.1 },
        
        // Deep forest (near boss approach)
        { x: -40, z: -85, scale: 2.0 }, { x: 50, z: -100, scale: 1.8 }, { x: -65, z: -80, scale: 2.2 },
        { x: 70, z: -90, scale: 2.0 }, { x: -30, z: -95, scale: 1.7 }, { x: 35, z: -105, scale: 2.1 },
        { x: -80, z: -90, scale: 2.3 }, { x: 85, z: -95, scale: 1.9 }, { x: -55, z: -110, scale: 2.0 },
        { x: 60, z: -115, scale: 1.8 }, { x: -90, z: -100, scale: 2.1 }, { x: 95, z: -105, scale: 1.9 },
        { x: -45, z: -120, scale: 1.6 }, { x: 50, z: -125, scale: 2.2 }, { x: -70, z: -130, scale: 2.0 },
        { x: 75, z: -135, scale: 1.8 },
        
        // Dense forest around tower area
        { x: -35, z: -140, scale: 2.4 }, { x: 40, z: -150, scale: 2.2 }, { x: -60, z: -145, scale: 2.0 },
        { x: 65, z: -155, scale: 1.9 }, { x: -25, z: -160, scale: 1.8 }, { x: 30, z: -165, scale: 2.1 },
        { x: -75, z: -150, scale: 2.3 }, { x: 80, z: -160, scale: 2.0 }, { x: -50, z: -170, scale: 1.9 },
        { x: 55, z: -175, scale: 2.2 }, { x: -85, z: -165, scale: 2.1 }, { x: 90, z: -170, scale: 1.7 },
        { x: -30, z: -175, scale: 2.5 }, { x: 35, z: -180, scale: 2.3 }, { x: -65, z: -185, scale: 2.0 },
        { x: 70, z: -190, scale: 1.9 }, { x: -45, z: -195, scale: 2.4 }, { x: 50, z: -200, scale: 2.2 },
        { x: -80, z: -195, scale: 1.8 }, { x: 85, z: -200, scale: 2.1 }, { x: -95, z: -180, scale: 2.0 },
        { x: 100, z: -185, scale: 1.9 }
    ],

    // Grassy hills with flowers
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
    
    // Stone walls forming forest boundaries (covered in vines/moss)
    mountains: [
        // Outer forest edge - long boundary walls
        { x: 0, z: 220, width: 250, height: 6 },
        { x: 0, z: -250, width: 250, height: 6 },
        { x: -125, z: 0, width: 10, height: 6 },
        { x: 125, z: 0, width: 10, height: 6 },
        // Corner walls
        { x: -115, z: 200, width: 35, height: 6 },
        { x: 115, z: 200, width: 35, height: 6 },
        { x: -115, z: -220, width: 35, height: 6 },
        { x: 115, z: -220, width: 35, height: 6 },
        // Interior mountain ranges running east-west (wide barriers)
        { x: -55, z: 160, width: 50, height: 6 },
        { x: 60, z: 145, width: 55, height: 5 },
        { x: -50, z: 110, width: 45, height: 6 },
        { x: 55, z: 85, width: 50, height: 5 },
        { x: -60, z: 55, width: 55, height: 6 },
        { x: 50, z: 25, width: 45, height: 5 },
        { x: -55, z: -10, width: 50, height: 6 },
        { x: 60, z: -45, width: 55, height: 5 },
        { x: -50, z: -80, width: 45, height: 6 },
        { x: 55, z: -115, width: 50, height: 5 },
        { x: -60, z: -150, width: 55, height: 6 },
        { x: 50, z: -185, width: 45, height: 5 },
        // Central forest walls creating paths
        { x: 0, z: 130, width: 35, height: 5 },
        { x: -15, z: 70, width: 40, height: 6 },
        { x: 20, z: 10, width: 35, height: 5 },
        { x: -10, z: -50, width: 40, height: 6 },
        { x: 15, z: -100, width: 35, height: 5 },
        { x: -5, z: -145, width: 40, height: 6 }
    ],
    
    // Background forested mountains
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
    
    // Little Princesses (goblin variant) - small with crowns [x, z, patrolLeft, patrolRight, speed]
    goblins: [
        // Near entrance
        [18, 172, 13, 23, 0.014],
        [-22, 162, -27, -17, 0.015],
        [28, 148, 23, 33, 0.014],
        [-18, 138, -23, -13, 0.015],
        // Mid-forest princesses
        [22, 108, 17, 27, 0.016],
        [-28, 82, -33, -23, 0.015],
        [18, 52, 13, 23, 0.016],
        [-22, 22, -27, -17, 0.015],
        [28, -8, 23, 33, 0.016],
        [-18, -38, -23, -13, 0.015],
        // Deep forest princesses
        [22, -72, 17, 27, 0.017],
        [-28, -102, -33, -23, 0.016],
        [18, -132, 13, 23, 0.017],
        [-22, -158, -27, -17, 0.016],
        // Near boss area
        [12, -172, 7, 17, 0.018],
        [-18, -178, -23, -13, 0.017]
    ],
    
    // Rapunzel Witches (guardian variant) - shoot pine cone projectiles [x, z, patrolLeft, patrolRight, speed]
    // WITCHES EVERYWHERE!
    guardians: [
        // Original positions
        [48, 152, 43, 53, 0.010],
        [-52, 112, -57, -47, 0.011],
        [52, 68, 47, 57, 0.010],
        [-48, 28, -53, -43, 0.011],
        [48, -18, 43, 53, 0.010],
        [-52, -62, -57, -47, 0.011],
        [52, -112, 47, 57, 0.012],
        [-48, -152, -53, -43, 0.011],
        [45, 35, 40, 50, 0.010],
        [-50, -5, -55, -45, 0.011],
        // More witches along the edges
        [-75, 165, -80, -70, 0.009],
        [80, 155, 75, 85, 0.010],
        [-80, 95, -85, -75, 0.011],
        [85, 85, 80, 90, 0.009],
        [-78, 45, -83, -73, 0.010],
        [82, 55, 77, 87, 0.011],
        [-85, -25, -90, -80, 0.009],
        [88, -35, 83, 93, 0.010],
        [-82, -85, -87, -77, 0.011],
        [85, -95, 80, 90, 0.009],
        [-80, -145, -85, -75, 0.010],
        [82, -175, 77, 87, 0.011],
        // Central area witches
        [-15, 145, -20, -10, 0.012],
        [20, 135, 15, 25, 0.011],
        [-25, 75, -30, -20, 0.010],
        [30, 95, 25, 35, 0.012],
        [-18, -45, -23, -13, 0.011],
        [22, -55, 17, 27, 0.010],
        [-20, -105, -25, -15, 0.012],
        [25, -125, 20, 30, 0.011],
        // Near towers
        [-45, 135, -50, -40, 0.009],
        [50, 125, 45, 55, 0.010],
        [-40, 55, -45, -35, 0.011],
        [55, 15, 50, 60, 0.009],
        [-50, -35, -55, -45, 0.010],
        [45, -85, 40, 50, 0.011],
        [-55, -125, -60, -50, 0.009],
        [40, -165, 35, 45, 0.010]
    ],
    
    // Tower Giants (giant variant) - slow tanky towers with faces
    giants: [
        [-8, 122, -23, 7],
        [52, 72, 42, 62],
        [-58, 18, -68, -48]
    ],
    
    // Crown Wizards (wizard variant) - huge crowns with legs shooting fireballs
    wizards: [
        [35, 165, 25, 45, 0.009],
        [-42, 95, -52, -32, 0.010],
        [38, 40, 28, 48, 0.009],
        [-35, -20, -45, -25, 0.010],
        [42, -75, 32, 52, 0.011],
        [-38, -135, -48, -28, 0.010]
    ],
    
    // No mummies, lava monsters, or skeletons
    mummies: [],
    lavaMonsters: [],
    skeletons: [],
    
    // Hard mode extra princesses
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
    
    // Magical birds (butterflies/fireflies)
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
    
    // Ammo scattered around forest
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
    
    // Banana items near cottages
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
    
    // Health in forest clearings
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
