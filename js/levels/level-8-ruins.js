// Level 8 - The Ancient Ruins
// Sunlit castle ruins with knights, ghosts, skeletons, dragons, and giant spiders

LEVEL_REGISTRY.register(8, {
    name: "Level 8 - The Ancient Ruins",
    theme: 'ruins',
    
    // Player start position - in the open courtyard (away from walls)
    playerStart: { x: 0, z: 160 },
    
    // Portal back to Level 1 (full cycle complete)
    portal: { x: 0, z: -220, destinationLevel: 1 },
    
    // Unique elements for ruins level
    ruinsTheme: true,
    skyColor: 0x6AAFE6,          // Light blue daylight sky
    groundColor: 0x4A8B3A,       // Lush green grass ground
    fogDensity: 0.008,           // Light atmospheric haze
    fogColor: 0xB8C9D9,          // Light gray-blue haze
    
    // No river - has overgrown courtyards instead
    hasRiver: false,
    hasMistPools: false,
    hasMaterials: false,
    
    // Has mountains (ruined walls and towers)
    hasMountains: true,
    
    // Theme colors for ruins level - friendly overgrown atmosphere
    hillColor: 0x7B6B5F,         // Warm rubble mounds
    treeColor: 0x3A6B2A,         // Lush green trees
    grassColor: 0x5A9B4A,        // Vibrant overgrown grass
    
    // Level 8 has treasure (ancient royal treasure)
    hasTreasure: true,
    
    // Treasure position - in the throne room ruins
    treasurePosition: { x: 0, z: -200 },
    
    // Rainbow position - above the ancient throne
    rainbow: { x: 0, z: -195 },
    
    // DRAGON boss - ancient stone dragon guardian
    dragon: { x: 0, z: -195, scale: 0.8 },
    useReaper: false,  // Use dragon, not reaper
    extraDragons: [
        // Two smaller dragons guarding the inner ruins
        { x: -50, z: -120, scale: 0.5 },
        { x: 50, z: -120, scale: 0.5 }
    ],
    
    // World Kite position - near spawn (royal banner)
    worldKite: { x: 5, z: 180 },

    // No iceberg
    iceBerg: null,
    
    // Ancient fountain in the courtyard (instead of haunted well)
    ancientFountain: { x: 50, z: 100 },

    // Rubble pile positions (instead of mist pools)
    rubblePiles: [
        { x: -70, z: 150, radius: 12 },
        { x: 75, z: 90, radius: 10 },
        { x: -65, z: 20, radius: 14 },
        { x: 70, z: -40, radius: 11 },
        { x: -75, z: -90, radius: 12 },
        { x: 65, z: -150, radius: 13 },
        { x: 0, z: -170, radius: 15 }
    ],

    // Few scattered rubble hills
    hills: [
        { x: -80, z: 165, radius: 6, height: 2 },
        { x: 85, z: 50, radius: 7, height: 2.5 },
        { x: -75, z: -75, radius: 6, height: 2 },
        { x: 80, z: -130, radius: 7, height: 2.5 }
    ],
    
    // Castle ruins walls - CRUMBLING STONE creating maze-like layout
    mountains: [
        // Outer boundary - ruined castle perimeter (tall crumbling walls)
        { x: 0, z: 210, width: 220, height: 12 },
        { x: 0, z: -220, width: 220, height: 12 },
        { x: -110, z: 0, width: 8, height: 12 },
        { x: 110, z: 0, width: 8, height: 12 },
        // Corner towers (imposing ruined towers)
        { x: -105, z: 180, width: 25, height: 18 },
        { x: 105, z: 180, width: 25, height: 18 },
        { x: -105, z: -190, width: 25, height: 18 },
        { x: 105, z: -190, width: 25, height: 18 },
        // Mid-wall towers
        { x: -105, z: 90, width: 18, height: 15 },
        { x: 105, z: 90, width: 18, height: 15 },
        { x: -105, z: -50, width: 18, height: 15 },
        { x: 105, z: -50, width: 18, height: 15 }
    ],
    
    // Natural mountains ALL AROUND the perimeter - complete scenic backdrop
    naturalMountains: [
        // North side - behind castle entrance
        { x: -100, z: 250, radius: 30, height: 45 },
        { x: -50, z: 260, radius: 25, height: 38 },
        { x: 0, z: 265, radius: 35, height: 55 },
        { x: 50, z: 258, radius: 28, height: 42 },
        { x: 100, z: 248, radius: 32, height: 48 },
        // South side - behind throne room
        { x: -100, z: -265, radius: 28, height: 42 },
        { x: -45, z: -270, radius: 32, height: 50 },
        { x: 30, z: -268, radius: 30, height: 46 },
        { x: 90, z: -260, radius: 26, height: 40 },
        // West side - full mountain range
        { x: -155, z: 200, radius: 25, height: 38 },
        { x: -165, z: 150, radius: 30, height: 48 },
        { x: -160, z: 100, radius: 28, height: 44 },
        { x: -170, z: 50, radius: 35, height: 55 },
        { x: -165, z: 0, radius: 30, height: 46 },
        { x: -160, z: -50, radius: 28, height: 42 },
        { x: -170, z: -100, radius: 32, height: 50 },
        { x: -165, z: -150, radius: 26, height: 38 },
        { x: -155, z: -200, radius: 30, height: 45 },
        // East side - full mountain range
        { x: 155, z: 195, radius: 28, height: 42 },
        { x: 168, z: 145, radius: 32, height: 50 },
        { x: 162, z: 95, radius: 26, height: 40 },
        { x: 172, z: 45, radius: 35, height: 55 },
        { x: 165, z: -5, radius: 30, height: 46 },
        { x: 160, z: -55, radius: 28, height: 42 },
        { x: 170, z: -105, radius: 32, height: 48 },
        { x: 162, z: -155, radius: 26, height: 38 },
        { x: 158, z: -205, radius: 30, height: 44 }
    ],
    
    // Knights (armored goblins) [x, z, patrolLeft, patrolRight, speed]
    goblins: [
        // Castle entrance guards
        [25, 180, 20, 30, 0.009],
        [-30, 165, -35, -25, 0.010],
        [35, 145, 30, 40, 0.009],
        [-25, 125, -30, -20, 0.010],
        // Outer courtyard patrols
        [30, 95, 25, 35, 0.010],
        [-35, 70, -40, -30, 0.009],
        [25, 45, 20, 30, 0.010],
        [-30, 20, -35, -25, 0.009],
        [35, -10, 30, 40, 0.010],
        [-25, -35, -30, -20, 0.009],
        // Inner courtyard
        [30, -65, 25, 35, 0.010],
        [-35, -95, -40, -30, 0.011],
        [25, -120, 20, 30, 0.011],
        [-30, -150, -35, -25, 0.011],
        // Wandering knights
        [0, 150, -5, 5, 0.008],
        [10, 80, 5, 15, 0.009],
        [-10, 0, -15, -5, 0.009],
        [5, -80, 0, 10, 0.010]
    ],
    
    // Ghost guardians (spectral knights) [x, z, patrolLeft, patrolRight, speed]
    guardians: [
        [50, 150, 45, 55, 0.007],
        [-55, 110, -60, -50, 0.008],
        [60, 60, 55, 65, 0.007],
        [-50, 20, -55, -45, 0.008],
        [55, -50, 50, 60, 0.007],
        [-60, -100, -65, -55, 0.008]
    ],
    
    // Skeleton archers [x, z, patrolLeft, patrolRight, speed]
    skeletons: [
        [55, -30, 50, 60, 0.009],
        [-60, -70, -65, -55, 0.010],
        [50, -110, 45, 55, 0.009],
        [-55, -150, -60, -50, 0.010],
        [25, -80, 20, 30, 0.009],
        [-30, -120, -35, -25, 0.010],
        [40, -170, 35, 45, 0.011],
        [-45, -180, -50, -40, 0.011],
        // Additional skeletons in the outer areas
        [60, 50, 55, 65, 0.009],
        [-55, 90, -60, -50, 0.010],
        [45, 130, 40, 50, 0.009],
        [-50, 170, -55, -45, 0.010],
        [30, -50, 25, 35, 0.011],
        [-35, -100, -40, -30, 0.010],
        [0, -140, -5, 5, 0.009],
        [65, -90, 60, 70, 0.011]
    ],
    
    // Giant Spiders (using giant entity type)
    giants: [
        [0, 100, -15, 15],
        [-55, 30, -65, -45],
        [55, -40, 45, 65],
        [0, -100, -15, 15],
        [-50, -150, -60, -40],
        [50, 50, 40, 60]
    ],
    
    // Dark Sorcerers (wizard entity) [x, z, patrolLeft, patrolRight, speed]
    wizards: [
        [35, 130, 30, 40, 0.006],
        [-40, 80, -45, -35, 0.007],
        [45, 20, 40, 50, 0.006],
        [-35, -30, -40, -30, 0.007],
        [40, -90, 35, 45, 0.006],
        [-45, -140, -50, -40, 0.007]
    ],
    
    // No mummies or lava monsters
    mummies: [],
    lavaMonsters: [],
    
    // Hard mode extra knights
    hardModeGoblins: [
        [40, 190, 35, 45, 0.013],
        [-45, 155, -50, -40, 0.012],
        [35, 115, 30, 40, 0.013],
        [-40, 75, -45, -35, 0.012],
        [45, 35, 40, 50, 0.013],
        [-35, -5, -40, -30, 0.012],
        [40, -55, 35, 45, 0.013],
        [-45, -105, -50, -40, 0.012],
        [35, -145, 30, 40, 0.013],
        [-40, -175, -45, -35, 0.012]
    ],
    
    // Ravens/Crows (bomb birds - for ruined atmosphere)
    birds: [
        [0, 140, 35, 0.008],
        [-35, 80, 30, 0.009],
        [40, 20, 32, 0.007],
        [-30, -40, 28, 0.008],
        [35, -100, 30, 0.009],
        [0, -160, 34, 0.008]
    ],
    
    // Ammo in treasure chests among ruins
    ammoPositions: [
        { x: 15, z: 185 }, { x: -20, z: 160 }, { x: 25, z: 130 },
        { x: -30, z: 100 }, { x: 20, z: 70 }, { x: -25, z: 40 },
        { x: 30, z: 10 }, { x: -20, z: -20 }, { x: 25, z: -50 },
        { x: -30, z: -80 }, { x: 20, z: -110 }, { x: -25, z: -140 },
        { x: 0, z: 155 }, { x: 0, z: 85 }, { x: 0, z: 15 },
        { x: 0, z: -55 }, { x: 0, z: -125 },
        { x: 45, z: 165 }, { x: -50, z: 125 }, { x: 55, z: 65 },
        { x: -45, z: 5 }, { x: 50, z: -65 }, { x: -55, z: -125 },
        // Extra ammo for combat
        { x: 35, z: 180 }, { x: -35, z: 145 }, { x: 40, z: 110 },
        { x: -40, z: 75 }, { x: 35, z: 45 }, { x: -35, z: -10 },
        { x: 40, z: -40 }, { x: -40, z: -95 }, { x: 35, z: -160 },
        { x: 60, z: 190 }, { x: -60, z: 140 }, { x: 65, z: 50 },
        { x: -65, z: -30 }, { x: 60, z: -100 }, { x: -60, z: -170 }
    ],
    
    // Bomb pickups (explosive barrels)
    bombPositions: [
        { x: 10, z: 170 },
        { x: -15, z: 115 },
        { x: 20, z: 55 },
        { x: -10, z: -5 },
        { x: 15, z: -65 },
        { x: -20, z: -120 }
    ],
    
    // Health pickups (healing potions)
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
    
    // Herz-Man pickup positions (royal guard turrets)
    herzmanPositions: [
        { x: 20, z: 175 }, { x: -25, z: 115 }, { x: 30, z: 45 },
        { x: -20, z: -25 }, { x: 25, z: -85 }, { x: -15, z: -145 }
    ],
    
    // Trap positions (spike traps in floor tiles)
    trapPositions: [
        { x: 25, z: 150 },
        { x: -30, z: 110 },
        { x: 35, z: 60 },
        { x: -25, z: 10 },
        { x: 30, z: -40 },
        { x: -35, z: -90 },
        { x: 25, z: -130 }
    ],
    
    // Trees, grass, and ruin decorations - friendly overgrown castle grounds
    treePositions: [
        // FRIENDLY OAK TREES scattered throughout the ruins
        { x: -90, z: 185, type: 'tree' }, { x: 95, z: 175, type: 'tree' },
        { x: -88, z: 130, type: 'tree' }, { x: 92, z: 140, type: 'tree' },
        { x: -95, z: 70, type: 'tree' }, { x: 88, z: 60, type: 'tree' },
        { x: -90, z: 10, type: 'tree' }, { x: 95, z: -20, type: 'tree' },
        { x: -92, z: -60, type: 'tree' }, { x: 90, z: -80, type: 'tree' },
        { x: -88, z: -130, type: 'tree' }, { x: 92, z: -140, type: 'tree' },
        { x: -95, z: -180, type: 'tree' }, { x: 88, z: -175, type: 'tree' },
        // Trees in courtyards
        { x: -45, z: 175, type: 'tree' }, { x: 55, z: 180, type: 'tree' },
        { x: 35, z: 100, type: 'tree' }, { x: -50, z: 85, type: 'tree' },
        { x: 60, z: 25, type: 'tree' }, { x: -55, z: -15, type: 'tree' },
        { x: 45, z: -60, type: 'tree' }, { x: -60, z: -85, type: 'tree' },
        { x: 55, z: -135, type: 'tree' }, { x: -45, z: -160, type: 'tree' },
        
        // GRASS PATCHES throughout the ruins
        { x: -30, z: 190, type: 'grass' }, { x: 25, z: 185, type: 'grass' },
        { x: -15, z: 170, type: 'grass' }, { x: 40, z: 160, type: 'grass' },
        { x: -45, z: 145, type: 'grass' }, { x: 20, z: 135, type: 'grass' },
        { x: -25, z: 115, type: 'grass' }, { x: 55, z: 110, type: 'grass' },
        { x: -60, z: 90, type: 'grass' }, { x: 30, z: 75, type: 'grass' },
        { x: -35, z: 55, type: 'grass' }, { x: 50, z: 45, type: 'grass' },
        { x: -50, z: 25, type: 'grass' }, { x: 25, z: 10, type: 'grass' },
        { x: -20, z: -15, type: 'grass' }, { x: 55, z: -30, type: 'grass' },
        { x: -55, z: -50, type: 'grass' }, { x: 35, z: -65, type: 'grass' },
        { x: -30, z: -90, type: 'grass' }, { x: 50, z: -100, type: 'grass' },
        { x: -45, z: -120, type: 'grass' }, { x: 25, z: -135, type: 'grass' },
        { x: -20, z: -155, type: 'grass' }, { x: 55, z: -165, type: 'grass' },
        { x: 0, z: 155, type: 'grass' }, { x: 5, z: 95, type: 'grass' },
        { x: -5, z: 35, type: 'grass' }, { x: 10, z: -25, type: 'grass' },
        { x: -10, z: -75, type: 'grass' }, { x: 5, z: -130, type: 'grass' },
        
        // Large broken columns along edges (away from spawn)
        { x: -100, z: 100, type: 'brokencolumn' }, { x: 100, z: 100, type: 'brokencolumn' },
        { x: -100, z: 0, type: 'brokencolumn' }, { x: 100, z: 0, type: 'brokencolumn' },
        { x: -100, z: -100, type: 'brokencolumn' }, { x: 100, z: -100, type: 'brokencolumn' },
        { x: -100, z: -190, type: 'brokencolumn' }, { x: 100, z: -190, type: 'brokencolumn' },
        { x: 0, z: -195, type: 'brokencolumn' },
        { x: -50, z: -195, type: 'brokencolumn' }, { x: 50, z: -195, type: 'brokencolumn' },
        
        // STONE ARCHES scattered throughout ruins
        // Section A: z=165 to z=140 (entrance courtyard - clear spawn area)
        
        { x: -85, z: 165, type: 'rubble' }, { x: -55, z: 165, type: 'stonearch' },
        { x: -25, z: 165, type: 'rubble' }, { x: 5, z: 165, type: 'stonearch' },
        { x: 35, z: 165, type: 'rubble' }, { x: 65, z: 165, type: 'stonearch' },
        
        { x: -70, z: 150, type: 'stonearch' }, { x: -40, z: 150, type: 'rubble' },
        { x: -10, z: 150, type: 'stonearch' }, { x: 20, z: 150, type: 'rubble' },
        { x: 50, z: 150, type: 'stonearch' }, { x: 80, z: 150, type: 'rubble' },
        
        { x: -85, z: 140, type: 'stonearch' }, { x: -55, z: 140, type: 'rubble' },
        { x: -25, z: 140, type: 'stonearch' }, { x: 5, z: 140, type: 'rubble' },
        { x: 35, z: 140, type: 'stonearch' }, { x: 65, z: 140, type: 'rubble' },
        
        // Section B: z=130 to z=80 (outer halls)
        { x: -70, z: 125, type: 'rubble' }, { x: -40, z: 125, type: 'stonearch' },
        { x: -10, z: 125, type: 'rubble' }, { x: 20, z: 125, type: 'stonearch' },
        { x: 50, z: 125, type: 'rubble' }, { x: 80, z: 125, type: 'stonearch' },
        
        { x: -85, z: 110, type: 'stonearch' }, { x: -55, z: 110, type: 'rubble' },
        { x: -25, z: 110, type: 'stonearch' }, { x: 5, z: 110, type: 'rubble' },
        { x: 35, z: 110, type: 'stonearch' }, { x: 65, z: 110, type: 'rubble' },
        
        { x: -70, z: 95, type: 'rubble' }, { x: -40, z: 95, type: 'stonearch' },
        { x: -10, z: 95, type: 'rubble' }, { x: 20, z: 95, type: 'stonearch' },
        { x: 50, z: 95, type: 'rubble' }, { x: 80, z: 95, type: 'stonearch' },
        
        { x: -85, z: 80, type: 'stonearch' }, { x: -55, z: 80, type: 'rubble' },
        { x: -25, z: 80, type: 'stonearch' }, { x: 5, z: 80, type: 'rubble' },
        { x: 35, z: 80, type: 'stonearch' }, { x: 65, z: 80, type: 'rubble' },
        
        // Section C: z=70 to z=20 (central courtyard)
        { x: -70, z: 65, type: 'rubble' }, { x: -40, z: 65, type: 'stonearch' },
        { x: -10, z: 65, type: 'rubble' }, { x: 20, z: 65, type: 'stonearch' },
        { x: 50, z: 65, type: 'rubble' }, { x: 80, z: 65, type: 'stonearch' },
        
        { x: -85, z: 50, type: 'stonearch' }, { x: -55, z: 50, type: 'rubble' },
        { x: -25, z: 50, type: 'stonearch' }, { x: 5, z: 50, type: 'rubble' },
        { x: 35, z: 50, type: 'stonearch' }, { x: 65, z: 50, type: 'rubble' },
        
        { x: -70, z: 35, type: 'rubble' }, { x: -40, z: 35, type: 'stonearch' },
        { x: -10, z: 35, type: 'rubble' }, { x: 20, z: 35, type: 'stonearch' },
        { x: 50, z: 35, type: 'rubble' }, { x: 80, z: 35, type: 'stonearch' },
        
        { x: -85, z: 20, type: 'stonearch' }, { x: -55, z: 20, type: 'rubble' },
        { x: -25, z: 20, type: 'stonearch' }, { x: 5, z: 20, type: 'rubble' },
        { x: 35, z: 20, type: 'stonearch' }, { x: 65, z: 20, type: 'rubble' },
        
        // Section D: z=10 to z=-40 (inner ward)
        { x: -70, z: 5, type: 'rubble' }, { x: -40, z: 5, type: 'stonearch' },
        { x: -10, z: 5, type: 'rubble' }, { x: 20, z: 5, type: 'stonearch' },
        { x: 50, z: 5, type: 'rubble' }, { x: 80, z: 5, type: 'stonearch' },
        
        { x: -85, z: -10, type: 'stonearch' }, { x: -55, z: -10, type: 'rubble' },
        { x: -25, z: -10, type: 'stonearch' }, { x: 5, z: -10, type: 'rubble' },
        { x: 35, z: -10, type: 'stonearch' }, { x: 65, z: -10, type: 'rubble' },
        
        { x: -70, z: -25, type: 'rubble' }, { x: -40, z: -25, type: 'stonearch' },
        { x: -10, z: -25, type: 'rubble' }, { x: 20, z: -25, type: 'stonearch' },
        { x: 50, z: -25, type: 'rubble' }, { x: 80, z: -25, type: 'stonearch' },
        
        { x: -85, z: -40, type: 'stonearch' }, { x: -55, z: -40, type: 'rubble' },
        { x: -25, z: -40, type: 'stonearch' }, { x: 5, z: -40, type: 'rubble' },
        { x: 35, z: -40, type: 'stonearch' }, { x: 65, z: -40, type: 'rubble' },
        
        // Section E: z=-50 to z=-100 (ruined great hall)
        { x: -70, z: -55, type: 'rubble' }, { x: -40, z: -55, type: 'stonearch' },
        { x: -10, z: -55, type: 'rubble' }, { x: 20, z: -55, type: 'stonearch' },
        { x: 50, z: -55, type: 'rubble' }, { x: 80, z: -55, type: 'stonearch' },
        
        { x: -85, z: -70, type: 'stonearch' }, { x: -55, z: -70, type: 'rubble' },
        { x: -25, z: -70, type: 'stonearch' }, { x: 5, z: -70, type: 'rubble' },
        { x: 35, z: -70, type: 'stonearch' }, { x: 65, z: -70, type: 'rubble' },
        
        { x: -70, z: -85, type: 'rubble' }, { x: -40, z: -85, type: 'stonearch' },
        { x: -10, z: -85, type: 'rubble' }, { x: 20, z: -85, type: 'stonearch' },
        { x: 50, z: -85, type: 'rubble' }, { x: 80, z: -85, type: 'stonearch' },
        
        { x: -85, z: -100, type: 'stonearch' }, { x: -55, z: -100, type: 'rubble' },
        { x: -25, z: -100, type: 'stonearch' }, { x: 5, z: -100, type: 'rubble' },
        { x: 35, z: -100, type: 'stonearch' }, { x: 65, z: -100, type: 'rubble' },
        
        // Section F: z=-110 to z=-160 (throne room approach)
        { x: -70, z: -115, type: 'rubble' }, { x: -40, z: -115, type: 'stonearch' },
        { x: -10, z: -115, type: 'rubble' }, { x: 20, z: -115, type: 'stonearch' },
        { x: 50, z: -115, type: 'rubble' }, { x: 80, z: -115, type: 'stonearch' },
        
        { x: -85, z: -130, type: 'stonearch' }, { x: -55, z: -130, type: 'rubble' },
        { x: -25, z: -130, type: 'stonearch' }, { x: 5, z: -130, type: 'rubble' },
        { x: 35, z: -130, type: 'stonearch' }, { x: 65, z: -130, type: 'rubble' },
        
        { x: -70, z: -145, type: 'rubble' }, { x: -40, z: -145, type: 'stonearch' },
        { x: -10, z: -145, type: 'rubble' }, { x: 20, z: -145, type: 'stonearch' },
        { x: 50, z: -145, type: 'rubble' }, { x: 80, z: -145, type: 'stonearch' },
        
        { x: -85, z: -160, type: 'stonearch' }, { x: -55, z: -160, type: 'rubble' },
        { x: -25, z: -160, type: 'stonearch' }, { x: 5, z: -160, type: 'rubble' },
        { x: 35, z: -160, type: 'stonearch' }, { x: 65, z: -160, type: 'rubble' },
        
        // Section G: z=-175 to z=-190 (throne room ruins)
        { x: -70, z: -175, type: 'rubble' }, { x: -40, z: -175, type: 'stonearch' },
        { x: 40, z: -175, type: 'stonearch' }, { x: 70, z: -175, type: 'rubble' },
        
        { x: -85, z: -190, type: 'stonearch' }, { x: -55, z: -190, type: 'rubble' },
        { x: 55, z: -190, type: 'rubble' }, { x: 85, z: -190, type: 'stonearch' },
        
        // Knight statues scattered throughout for atmosphere (away from spawn)
        { x: 45, z: 140, type: 'knightstatue' }, { x: -48, z: 135, type: 'knightstatue' },
        { x: 58, z: 52, type: 'knightstatue' }, { x: -55, z: 45, type: 'knightstatue' },
        { x: 48, z: 15, type: 'knightstatue' }, { x: -52, z: 8, type: 'knightstatue' },
        { x: 62, z: -25, type: 'knightstatue' }, { x: -62, z: -32, type: 'knightstatue' },
        { x: 52, z: -65, type: 'knightstatue' }, { x: -55, z: -72, type: 'knightstatue' },
        { x: 45, z: -105, type: 'knightstatue' }, { x: -48, z: -112, type: 'knightstatue' },
        { x: 58, z: -145, type: 'knightstatue' }, { x: -58, z: -152, type: 'knightstatue' },
        { x: 38, z: -185, type: 'knightstatue' }, { x: -42, z: -188, type: 'knightstatue' }
    ],
    
    // Rock positions (fallen stones and debris)
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
    
    // Boulder positions (collapsed tower sections)
    boulderPositions: [
        { x: -65, z: 175 }, { x: 70, z: 155 },
        { x: -60, z: 115 }, { x: 65, z: 85 },
        { x: -70, z: 45 }, { x: 60, z: 5 },
        { x: -65, z: -35 }, { x: 70, z: -75 },
        { x: -60, z: -115 }, { x: 65, z: -155 }
    ],
    
    // Castle ruin walls - tall crumbling stone walls with gaps
    canyonWalls: [
        // MAZE SECTION 1 (entrance area z:200 to z:140) - ruined gatehouse
        { x: -45, z: 185, width: 45, depth: 3, height: 10, rotation: 0 },
        { x: 55, z: 180, width: 38, depth: 3, height: 10, rotation: 0 },
        { x: -70, z: 145, width: 3, depth: 25, height: 11, rotation: 0 },
        { x: 75, z: 140, width: 3, depth: 28, height: 11, rotation: 0 },
        
        // MAZE SECTION 2 (z:140 to z:80) - crumbling corridors
        { x: -25, z: 125, width: 40, depth: 3, height: 10, rotation: 0 },
        { x: 40, z: 115, width: 45, depth: 3, height: 9, rotation: 0 },
        { x: -55, z: 100, width: 3, depth: 35, height: 11, rotation: 0 },
        { x: 60, z: 95, width: 3, depth: 30, height: 11, rotation: 0 },
        { x: 10, z: 85, width: 35, depth: 3, height: 9, rotation: 0 },
        { x: -40, z: 75, width: 30, depth: 3, height: 10, rotation: 0 },
        
        // MAZE SECTION 3 (z:80 to z:20) - collapsed wing
        { x: 50, z: 65, width: 40, depth: 3, height: 10, rotation: 0 },
        { x: -30, z: 55, width: 35, depth: 3, height: 9, rotation: 0 },
        { x: -70, z: 40, width: 3, depth: 30, height: 11, rotation: 0 },
        { x: 70, z: 35, width: 3, depth: 35, height: 11, rotation: 0 },
        { x: 15, z: 30, width: 40, depth: 3, height: 9, rotation: 0 },
        { x: -45, z: 20, width: 30, depth: 3, height: 10, rotation: 0 },
        
        // MAZE SECTION 4 (z:20 to z:-40) - inner ward
        { x: 45, z: 10, width: 35, depth: 3, height: 10, rotation: 0 },
        { x: -20, z: 0, width: 40, depth: 3, height: 9, rotation: 0 },
        { x: -60, z: -15, width: 3, depth: 30, height: 11, rotation: 0 },
        { x: 65, z: -20, width: 3, depth: 35, height: 11, rotation: 0 },
        { x: 20, z: -30, width: 35, depth: 3, height: 9, rotation: 0 },
        { x: -35, z: -40, width: 30, depth: 3, height: 10, rotation: 0 },
        
        // MAZE SECTION 5 (z:-40 to z:-100) - great hall ruins
        { x: 55, z: -55, width: 40, depth: 3, height: 10, rotation: 0 },
        { x: -25, z: -65, width: 35, depth: 3, height: 9, rotation: 0 },
        { x: -65, z: -75, width: 3, depth: 30, height: 11, rotation: 0 },
        { x: 70, z: -80, width: 3, depth: 35, height: 11, rotation: 0 },
        { x: 10, z: -90, width: 40, depth: 3, height: 9, rotation: 0 },
        { x: -40, z: -100, width: 30, depth: 3, height: 10, rotation: 0 },
        
        // MAZE SECTION 6 (z:-100 to z:-160) - throne room approach
        { x: 50, z: -115, width: 35, depth: 3, height: 10, rotation: 0 },
        { x: -30, z: -125, width: 40, depth: 3, height: 9, rotation: 0 },
        { x: -60, z: -135, width: 3, depth: 30, height: 11, rotation: 0 },
        { x: 65, z: -140, width: 3, depth: 35, height: 11, rotation: 0 },
        { x: 15, z: -150, width: 35, depth: 3, height: 9, rotation: 0 },
        { x: -40, z: -160, width: 30, depth: 3, height: 10, rotation: 0 },
        
        // THRONE ROOM ENTRANCE (z:-160 to z:-200)
        { x: -30, z: -175, width: 28, depth: 3, height: 12, rotation: 0 },
        { x: 30, z: -180, width: 28, depth: 3, height: 12, rotation: 0 },
        { x: 0, z: -192, width: 22, depth: 3, height: 10, rotation: 0 }
    ],
    
    // No scarabs
    scarabs: [],
    
    // Safe zone bounds
    safeZoneBounds: {
        minX: -120,
        maxX: 120,
        minZ: -230,
        maxZ: 210
    }
});
