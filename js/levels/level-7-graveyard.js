// Level 7 - The Haunted Graveyard
// Graveyard theme with zombies, skeletons and the Reaper boss

LEVEL_REGISTRY.register(7, {
    name: "Level 7 - The Haunted Graveyard",
    theme: 'graveyard',
    
    // Player start position - at the graveyard entrance
    playerStart: { x: 0, z: 200 },
    
    // Portal back to Level 1 (full cycle complete)
    portal: { x: 0, z: -220, destinationLevel: 1 },
    
    // Unique elements for graveyard level
    graveyardTheme: true,
    skyColor: 0x443355,          // Match fog color for seamless fade
    groundColor: 0x8a7a65,       // Visible dead earth brown (lighter)
    fogDensity: 0.02,            // Dense fog to hide clipping
    fogColor: 0x443355,          // Purple-tinted fog
    
    // No river - has eerie mist pools instead
    hasRiver: false,
    hasMistPools: true,
    hasMaterials: false,
    
    // Has mountains (crypt walls and mausoleums)
    hasMountains: true,
    
    // Theme colors for graveyard level
    hillColor: 0x3a3520,         // Dead grass mounds
    treeColor: 0x1a1510,         // Dead/bare trees
    grassColor: 0x2a2a1a,        // Dying grass
    
    // Level 7 has treasure (cursed treasure)
    hasTreasure: true,
    
    // Treasure position - in the deepest crypt
    treasurePosition: { x: 0, z: -200 },
    
    // Rainbow position - dark rainbow above cursed treasure
    rainbow: { x: 0, z: -195 },
    
    // REAPER boss - single guardian near treasure
    dragon: { x: 0, z: -195, scale: 0.7 },
    useReaper: true,  // Flag to use Reaper instead of Dragon
    extraDragons: [],  // Single reaper only
    
    // World Kite position - near spawn (ghostly kite)
    worldKite: { x: 5, z: 180 },

    // No iceberg - has haunted well instead
    iceBerg: null,
    hauntedWell: { x: 50, z: 100 },

    // Mist pool positions (Nebelteiche)
    mistPools: [
        { x: -70, z: 150, radius: 12 },
        { x: 75, z: 90, radius: 10 },
        { x: -65, z: 20, radius: 14 },
        { x: 70, z: -40, radius: 11 },
        { x: -75, z: -90, radius: 12 },
        { x: 65, z: -150, radius: 13 },
        { x: 0, z: -170, radius: 15 }
    ],

    // Few scattered grave mound hills (reduced)
    hills: [
        { x: -80, z: 165, radius: 6, height: 2 },
        { x: 85, z: 50, radius: 7, height: 2.5 },
        { x: -75, z: -75, radius: 6, height: 2 },
        { x: 80, z: -130, radius: 7, height: 2.5 }
    ],
    
    // Brick walls with iron fences - THIN walls creating interesting maze
    mountains: [
        // Outer boundary - simple perimeter (thin walls)
        { x: 0, z: 210, width: 220, height: 3 },
        { x: 0, z: -220, width: 220, height: 3 },
        { x: -110, z: 0, width: 8, height: 3 },
        { x: 110, z: 0, width: 8, height: 3 },
        // Corner connectors
        { x: -105, z: 180, width: 20, height: 2.5 },
        { x: 105, z: 180, width: 20, height: 2.5 },
        { x: -105, z: -190, width: 20, height: 2.5 },
        { x: 105, z: -190, width: 20, height: 2.5 }
    ],
    
    // Zombie goblins [x, z, patrolLeft, patrolRight, speed]
    goblins: [
        // Near spawn - rising from graves
        [25, 180, 20, 30, 0.008],
        [-30, 165, -35, -25, 0.009],
        [35, 145, 30, 40, 0.008],
        [-25, 125, -30, -20, 0.009],
        // Mid graveyard
        [30, 95, 25, 35, 0.009],
        [-35, 70, -40, -30, 0.008],
        [25, 45, 20, 30, 0.009],
        [-30, 20, -35, -25, 0.008],
        [35, -10, 30, 40, 0.009],
        [-25, -35, -30, -20, 0.008],
        // Near crypt
        [30, -65, 25, 35, 0.009],
        [-35, -95, -40, -30, 0.01],
        [25, -120, 20, 30, 0.01],
        [-30, -150, -35, -25, 0.01],
        // Extra wandering
        [0, 150, -5, 5, 0.007],
        [10, 80, 5, 15, 0.008],
        [-10, 0, -15, -5, 0.008],
        [5, -80, 0, 10, 0.009]
    ],
    
    // Ghost/Spectre guardians [x, z, patrolLeft, patrolRight, speed]
    guardians: [
        [50, 150, 45, 55, 0.006],
        [-55, 110, -60, -50, 0.007],
        [60, 60, 55, 65, 0.006],
        [-50, 20, -55, -45, 0.007]
    ],
    
    // Skeleton archers [x, z, patrolLeft, patrolRight, speed]
    skeletons: [
        [55, -30, 50, 60, 0.008],
        [-60, -70, -65, -55, 0.009],
        [50, -110, 45, 55, 0.008],
        [-55, -150, -60, -50, 0.009],
        [25, -80, 20, 30, 0.008],
        [-30, -120, -35, -25, 0.009],
        [40, -170, 35, 45, 0.01],
        [-45, -180, -50, -40, 0.01],
        // Additional skeletons
        [60, 50, 55, 65, 0.008],
        [-55, 90, -60, -50, 0.009],
        [45, 130, 40, 50, 0.008],
        [-50, 170, -55, -45, 0.009],
        [30, -50, 25, 35, 0.01],
        [-35, -100, -40, -30, 0.009],
        [0, -140, -5, 5, 0.008],
        [65, -90, 60, 70, 0.01]
    ],
    
    // Executioner giants
    giants: [
        [0, 100, -15, 15],
        [-55, 30, -65, -45],
        [55, -40, 45, 65],
        [0, -100, -15, 15]
    ],
    
    // Witch wizards [x, z, patrolLeft, patrolRight, speed]
    wizards: [
        [35, 130, 30, 40, 0.005],
        [-40, 80, -45, -35, 0.006],
        [45, 20, 40, 50, 0.005],
        [-35, -30, -40, -30, 0.006],
        [40, -90, 35, 45, 0.005],
        [-45, -140, -50, -40, 0.006]
    ],
    
    // No mummies or lava monsters - graveyard has its own horrors
    mummies: [],
    lavaMonsters: [],
    
    // Hard mode extra zombies
    hardModeGoblins: [
        [40, 190, 35, 45, 0.012],
        [-45, 155, -50, -40, 0.011],
        [35, 115, 30, 40, 0.012],
        [-40, 75, -45, -35, 0.011],
        [45, 35, 40, 50, 0.012],
        [-35, -5, -40, -30, 0.011],
        [40, -55, 35, 45, 0.012],
        [-45, -105, -50, -40, 0.011],
        [35, -145, 30, 40, 0.012],
        [-40, -175, -45, -35, 0.011]
    ],
    
    // Bats (bomb birds)
    birds: [
        [0, 140, 35, 0.008],
        [-35, 80, 30, 0.009],
        [40, 20, 32, 0.007],
        [-30, -40, 28, 0.008],
        [35, -100, 30, 0.009],
        [0, -160, 34, 0.008]
    ],
    
    // Ammo in coffins/crypts (increased for skeleton archers)
    ammoPositions: [
        { x: 15, z: 185 }, { x: -20, z: 160 }, { x: 25, z: 130 },
        { x: -30, z: 100 }, { x: 20, z: 70 }, { x: -25, z: 40 },
        { x: 30, z: 10 }, { x: -20, z: -20 }, { x: 25, z: -50 },
        { x: -30, z: -80 }, { x: 20, z: -110 }, { x: -25, z: -140 },
        { x: 0, z: 155 }, { x: 0, z: 85 }, { x: 0, z: 15 },
        { x: 0, z: -55 }, { x: 0, z: -125 },
        { x: 45, z: 165 }, { x: -50, z: 125 }, { x: 55, z: 65 },
        { x: -45, z: 5 }, { x: 50, z: -65 }, { x: -55, z: -125 },
        // Extra ammo for fighting skeleton archers
        { x: 35, z: 180 }, { x: -35, z: 145 }, { x: 40, z: 110 },
        { x: -40, z: 75 }, { x: 35, z: 45 }, { x: -35, z: -10 },
        { x: 40, z: -40 }, { x: -40, z: -95 }, { x: 35, z: -160 },
        { x: 60, z: 190 }, { x: -60, z: 140 }, { x: 65, z: 50 },
        { x: -65, z: -30 }, { x: 60, z: -100 }, { x: -60, z: -170 }
    ],
    
    // Bomb pickups (cursed skulls)
    bombPositions: [
        { x: 10, z: 170 },
        { x: -15, z: 115 },
        { x: 20, z: 55 },
        { x: -10, z: -5 },
        { x: 15, z: -65 },
        { x: -20, z: -120 }
    ],
    
    // Health pickups (soul fragments)
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
    
    // Herz-Man pickup positions (possessed hearts)
    herzmanPositions: [
        { x: 20, z: 175 }, { x: -25, z: 115 }, { x: 30, z: 45 },
        { x: -20, z: -25 }, { x: 25, z: -85 }, { x: -15, z: -145 }
    ],
    
    // Trap positions (cursed ground that slows)
    trapPositions: [
        { x: 25, z: 150 },
        { x: -30, z: 110 },
        { x: 35, z: 60 },
        { x: -25, z: 10 },
        { x: 30, z: -40 },
        { x: -35, z: -90 },
        { x: 25, z: -130 }
    ],
    
    // Dead tree and tombstone positions - DENSE GRAVEYARD covering entire area
    treePositions: [
        // Dead trees along edges and scattered (bare, twisted)
        { x: -100, z: 195, type: 'deadtree' }, { x: 100, z: 195, type: 'deadtree' },
        { x: -100, z: 100, type: 'deadtree' }, { x: 100, z: 100, type: 'deadtree' },
        { x: -100, z: 0, type: 'deadtree' }, { x: 100, z: 0, type: 'deadtree' },
        { x: -100, z: -100, type: 'deadtree' }, { x: 100, z: -100, type: 'deadtree' },
        { x: -100, z: -190, type: 'deadtree' }, { x: 100, z: -190, type: 'deadtree' },
        { x: 0, z: 195, type: 'deadtree' }, { x: 0, z: -195, type: 'deadtree' },
        { x: -50, z: 195, type: 'deadtree' }, { x: 50, z: 195, type: 'deadtree' },
        { x: -50, z: -195, type: 'deadtree' }, { x: 50, z: -195, type: 'deadtree' },
        
        // MASSIVE TOMBSTONE GRID - every 10 units, staggered rows
        // Section A: z=190 to z=140 (near spawn)
        { x: -85, z: 190, type: 'tombstone' }, { x: -70, z: 190, type: 'tombstone' }, { x: -55, z: 190, type: 'tombstone' },
        { x: -40, z: 190, type: 'tombstone' }, { x: -25, z: 190, type: 'tombstone' }, { x: -10, z: 190, type: 'tombstone' },
        { x: 5, z: 190, type: 'tombstone' }, { x: 20, z: 190, type: 'tombstone' }, { x: 35, z: 190, type: 'tombstone' },
        { x: 50, z: 190, type: 'tombstone' }, { x: 65, z: 190, type: 'tombstone' }, { x: 80, z: 190, type: 'tombstone' },
        
        { x: -80, z: 180, type: 'tombstone' }, { x: -65, z: 180, type: 'tombstone' }, { x: -50, z: 180, type: 'tombstone' },
        { x: -35, z: 180, type: 'tombstone' }, { x: -20, z: 180, type: 'tombstone' }, { x: -5, z: 180, type: 'tombstone' },
        { x: 10, z: 180, type: 'tombstone' }, { x: 25, z: 180, type: 'tombstone' }, { x: 40, z: 180, type: 'tombstone' },
        { x: 55, z: 180, type: 'tombstone' }, { x: 70, z: 180, type: 'tombstone' }, { x: 85, z: 180, type: 'tombstone' },
        
        { x: -85, z: 165, type: 'tombstone' }, { x: -70, z: 165, type: 'tombstone' }, { x: -55, z: 165, type: 'tombstone' },
        { x: -40, z: 165, type: 'tombstone' }, { x: -25, z: 165, type: 'tombstone' }, { x: -10, z: 165, type: 'tombstone' },
        { x: 5, z: 165, type: 'tombstone' }, { x: 20, z: 165, type: 'tombstone' }, { x: 35, z: 165, type: 'tombstone' },
        { x: 50, z: 165, type: 'tombstone' }, { x: 65, z: 165, type: 'tombstone' }, { x: 80, z: 165, type: 'tombstone' },
        
        { x: -80, z: 150, type: 'tombstone' }, { x: -65, z: 150, type: 'tombstone' }, { x: -50, z: 150, type: 'tombstone' },
        { x: -35, z: 150, type: 'tombstone' }, { x: -20, z: 150, type: 'tombstone' }, { x: -5, z: 150, type: 'tombstone' },
        { x: 10, z: 150, type: 'tombstone' }, { x: 25, z: 150, type: 'tombstone' }, { x: 40, z: 150, type: 'tombstone' },
        { x: 55, z: 150, type: 'tombstone' }, { x: 70, z: 150, type: 'tombstone' }, { x: 85, z: 150, type: 'tombstone' },
        
        { x: -85, z: 140, type: 'tombstone' }, { x: -70, z: 140, type: 'tombstone' }, { x: -55, z: 140, type: 'tombstone' },
        { x: -40, z: 140, type: 'tombstone' }, { x: -25, z: 140, type: 'tombstone' }, { x: -10, z: 140, type: 'tombstone' },
        { x: 5, z: 140, type: 'tombstone' }, { x: 20, z: 140, type: 'tombstone' }, { x: 35, z: 140, type: 'tombstone' },
        { x: 50, z: 140, type: 'tombstone' }, { x: 65, z: 140, type: 'tombstone' }, { x: 80, z: 140, type: 'tombstone' },
        
        // Section B: z=130 to z=80
        { x: -80, z: 125, type: 'tombstone' }, { x: -65, z: 125, type: 'tombstone' }, { x: -50, z: 125, type: 'tombstone' },
        { x: -35, z: 125, type: 'tombstone' }, { x: -20, z: 125, type: 'tombstone' }, { x: -5, z: 125, type: 'tombstone' },
        { x: 10, z: 125, type: 'tombstone' }, { x: 25, z: 125, type: 'tombstone' }, { x: 40, z: 125, type: 'tombstone' },
        { x: 55, z: 125, type: 'tombstone' }, { x: 70, z: 125, type: 'tombstone' }, { x: 85, z: 125, type: 'tombstone' },
        
        { x: -85, z: 110, type: 'tombstone' }, { x: -70, z: 110, type: 'tombstone' }, { x: -55, z: 110, type: 'tombstone' },
        { x: -40, z: 110, type: 'tombstone' }, { x: -25, z: 110, type: 'tombstone' }, { x: -10, z: 110, type: 'tombstone' },
        { x: 5, z: 110, type: 'tombstone' }, { x: 20, z: 110, type: 'tombstone' }, { x: 35, z: 110, type: 'tombstone' },
        { x: 50, z: 110, type: 'tombstone' }, { x: 65, z: 110, type: 'tombstone' }, { x: 80, z: 110, type: 'tombstone' },
        
        { x: -80, z: 95, type: 'tombstone' }, { x: -65, z: 95, type: 'tombstone' }, { x: -50, z: 95, type: 'tombstone' },
        { x: -35, z: 95, type: 'tombstone' }, { x: -20, z: 95, type: 'tombstone' }, { x: -5, z: 95, type: 'tombstone' },
        { x: 10, z: 95, type: 'tombstone' }, { x: 25, z: 95, type: 'tombstone' }, { x: 40, z: 95, type: 'tombstone' },
        { x: 55, z: 95, type: 'tombstone' }, { x: 70, z: 95, type: 'tombstone' }, { x: 85, z: 95, type: 'tombstone' },
        
        { x: -85, z: 80, type: 'tombstone' }, { x: -70, z: 80, type: 'tombstone' }, { x: -55, z: 80, type: 'tombstone' },
        { x: -40, z: 80, type: 'tombstone' }, { x: -25, z: 80, type: 'tombstone' }, { x: -10, z: 80, type: 'tombstone' },
        { x: 5, z: 80, type: 'tombstone' }, { x: 20, z: 80, type: 'tombstone' }, { x: 35, z: 80, type: 'tombstone' },
        { x: 50, z: 80, type: 'tombstone' }, { x: 65, z: 80, type: 'tombstone' }, { x: 80, z: 80, type: 'tombstone' },
        
        // Section C: z=70 to z=20
        { x: -80, z: 65, type: 'tombstone' }, { x: -65, z: 65, type: 'tombstone' }, { x: -50, z: 65, type: 'tombstone' },
        { x: -35, z: 65, type: 'tombstone' }, { x: -20, z: 65, type: 'tombstone' }, { x: -5, z: 65, type: 'tombstone' },
        { x: 10, z: 65, type: 'tombstone' }, { x: 25, z: 65, type: 'tombstone' }, { x: 40, z: 65, type: 'tombstone' },
        { x: 55, z: 65, type: 'tombstone' }, { x: 70, z: 65, type: 'tombstone' }, { x: 85, z: 65, type: 'tombstone' },
        
        { x: -85, z: 50, type: 'tombstone' }, { x: -70, z: 50, type: 'tombstone' }, { x: -55, z: 50, type: 'tombstone' },
        { x: -40, z: 50, type: 'tombstone' }, { x: -25, z: 50, type: 'tombstone' }, { x: -10, z: 50, type: 'tombstone' },
        { x: 5, z: 50, type: 'tombstone' }, { x: 20, z: 50, type: 'tombstone' }, { x: 35, z: 50, type: 'tombstone' },
        { x: 50, z: 50, type: 'tombstone' }, { x: 65, z: 50, type: 'tombstone' }, { x: 80, z: 50, type: 'tombstone' },
        
        { x: -80, z: 35, type: 'tombstone' }, { x: -65, z: 35, type: 'tombstone' }, { x: -50, z: 35, type: 'tombstone' },
        { x: -35, z: 35, type: 'tombstone' }, { x: -20, z: 35, type: 'tombstone' }, { x: -5, z: 35, type: 'tombstone' },
        { x: 10, z: 35, type: 'tombstone' }, { x: 25, z: 35, type: 'tombstone' }, { x: 40, z: 35, type: 'tombstone' },
        { x: 55, z: 35, type: 'tombstone' }, { x: 70, z: 35, type: 'tombstone' }, { x: 85, z: 35, type: 'tombstone' },
        
        { x: -85, z: 20, type: 'tombstone' }, { x: -70, z: 20, type: 'tombstone' }, { x: -55, z: 20, type: 'tombstone' },
        { x: -40, z: 20, type: 'tombstone' }, { x: -25, z: 20, type: 'tombstone' }, { x: -10, z: 20, type: 'tombstone' },
        { x: 5, z: 20, type: 'tombstone' }, { x: 20, z: 20, type: 'tombstone' }, { x: 35, z: 20, type: 'tombstone' },
        { x: 50, z: 20, type: 'tombstone' }, { x: 65, z: 20, type: 'tombstone' }, { x: 80, z: 20, type: 'tombstone' },
        
        // Section D: z=10 to z=-40
        { x: -80, z: 5, type: 'tombstone' }, { x: -65, z: 5, type: 'tombstone' }, { x: -50, z: 5, type: 'tombstone' },
        { x: -35, z: 5, type: 'tombstone' }, { x: -20, z: 5, type: 'tombstone' }, { x: -5, z: 5, type: 'tombstone' },
        { x: 10, z: 5, type: 'tombstone' }, { x: 25, z: 5, type: 'tombstone' }, { x: 40, z: 5, type: 'tombstone' },
        { x: 55, z: 5, type: 'tombstone' }, { x: 70, z: 5, type: 'tombstone' }, { x: 85, z: 5, type: 'tombstone' },
        
        { x: -85, z: -10, type: 'tombstone' }, { x: -70, z: -10, type: 'tombstone' }, { x: -55, z: -10, type: 'tombstone' },
        { x: -40, z: -10, type: 'tombstone' }, { x: -25, z: -10, type: 'tombstone' }, { x: -10, z: -10, type: 'tombstone' },
        { x: 5, z: -10, type: 'tombstone' }, { x: 20, z: -10, type: 'tombstone' }, { x: 35, z: -10, type: 'tombstone' },
        { x: 50, z: -10, type: 'tombstone' }, { x: 65, z: -10, type: 'tombstone' }, { x: 80, z: -10, type: 'tombstone' },
        
        { x: -80, z: -25, type: 'tombstone' }, { x: -65, z: -25, type: 'tombstone' }, { x: -50, z: -25, type: 'tombstone' },
        { x: -35, z: -25, type: 'tombstone' }, { x: -20, z: -25, type: 'tombstone' }, { x: -5, z: -25, type: 'tombstone' },
        { x: 10, z: -25, type: 'tombstone' }, { x: 25, z: -25, type: 'tombstone' }, { x: 40, z: -25, type: 'tombstone' },
        { x: 55, z: -25, type: 'tombstone' }, { x: 70, z: -25, type: 'tombstone' }, { x: 85, z: -25, type: 'tombstone' },
        
        { x: -85, z: -40, type: 'tombstone' }, { x: -70, z: -40, type: 'tombstone' }, { x: -55, z: -40, type: 'tombstone' },
        { x: -40, z: -40, type: 'tombstone' }, { x: -25, z: -40, type: 'tombstone' }, { x: -10, z: -40, type: 'tombstone' },
        { x: 5, z: -40, type: 'tombstone' }, { x: 20, z: -40, type: 'tombstone' }, { x: 35, z: -40, type: 'tombstone' },
        { x: 50, z: -40, type: 'tombstone' }, { x: 65, z: -40, type: 'tombstone' }, { x: 80, z: -40, type: 'tombstone' },
        
        // Section E: z=-50 to z=-100
        { x: -80, z: -55, type: 'tombstone' }, { x: -65, z: -55, type: 'tombstone' }, { x: -50, z: -55, type: 'tombstone' },
        { x: -35, z: -55, type: 'tombstone' }, { x: -20, z: -55, type: 'tombstone' }, { x: -5, z: -55, type: 'tombstone' },
        { x: 10, z: -55, type: 'tombstone' }, { x: 25, z: -55, type: 'tombstone' }, { x: 40, z: -55, type: 'tombstone' },
        { x: 55, z: -55, type: 'tombstone' }, { x: 70, z: -55, type: 'tombstone' }, { x: 85, z: -55, type: 'tombstone' },
        
        { x: -85, z: -70, type: 'tombstone' }, { x: -70, z: -70, type: 'tombstone' }, { x: -55, z: -70, type: 'tombstone' },
        { x: -40, z: -70, type: 'tombstone' }, { x: -25, z: -70, type: 'tombstone' }, { x: -10, z: -70, type: 'tombstone' },
        { x: 5, z: -70, type: 'tombstone' }, { x: 20, z: -70, type: 'tombstone' }, { x: 35, z: -70, type: 'tombstone' },
        { x: 50, z: -70, type: 'tombstone' }, { x: 65, z: -70, type: 'tombstone' }, { x: 80, z: -70, type: 'tombstone' },
        
        { x: -80, z: -85, type: 'tombstone' }, { x: -65, z: -85, type: 'tombstone' }, { x: -50, z: -85, type: 'tombstone' },
        { x: -35, z: -85, type: 'tombstone' }, { x: -20, z: -85, type: 'tombstone' }, { x: -5, z: -85, type: 'tombstone' },
        { x: 10, z: -85, type: 'tombstone' }, { x: 25, z: -85, type: 'tombstone' }, { x: 40, z: -85, type: 'tombstone' },
        { x: 55, z: -85, type: 'tombstone' }, { x: 70, z: -85, type: 'tombstone' }, { x: 85, z: -85, type: 'tombstone' },
        
        { x: -85, z: -100, type: 'tombstone' }, { x: -70, z: -100, type: 'tombstone' }, { x: -55, z: -100, type: 'tombstone' },
        { x: -40, z: -100, type: 'tombstone' }, { x: -25, z: -100, type: 'tombstone' }, { x: -10, z: -100, type: 'tombstone' },
        { x: 5, z: -100, type: 'tombstone' }, { x: 20, z: -100, type: 'tombstone' }, { x: 35, z: -100, type: 'tombstone' },
        { x: 50, z: -100, type: 'tombstone' }, { x: 65, z: -100, type: 'tombstone' }, { x: 80, z: -100, type: 'tombstone' },
        
        // Section F: z=-110 to z=-160 (approaching crypt)
        { x: -80, z: -115, type: 'tombstone' }, { x: -65, z: -115, type: 'tombstone' }, { x: -50, z: -115, type: 'tombstone' },
        { x: -35, z: -115, type: 'tombstone' }, { x: -20, z: -115, type: 'tombstone' }, { x: -5, z: -115, type: 'tombstone' },
        { x: 10, z: -115, type: 'tombstone' }, { x: 25, z: -115, type: 'tombstone' }, { x: 40, z: -115, type: 'tombstone' },
        { x: 55, z: -115, type: 'tombstone' }, { x: 70, z: -115, type: 'tombstone' }, { x: 85, z: -115, type: 'tombstone' },
        
        { x: -85, z: -130, type: 'tombstone' }, { x: -70, z: -130, type: 'tombstone' }, { x: -55, z: -130, type: 'tombstone' },
        { x: -40, z: -130, type: 'tombstone' }, { x: -25, z: -130, type: 'tombstone' }, { x: -10, z: -130, type: 'tombstone' },
        { x: 5, z: -130, type: 'tombstone' }, { x: 20, z: -130, type: 'tombstone' }, { x: 35, z: -130, type: 'tombstone' },
        { x: 50, z: -130, type: 'tombstone' }, { x: 65, z: -130, type: 'tombstone' }, { x: 80, z: -130, type: 'tombstone' },
        
        { x: -80, z: -145, type: 'tombstone' }, { x: -65, z: -145, type: 'tombstone' }, { x: -50, z: -145, type: 'tombstone' },
        { x: -35, z: -145, type: 'tombstone' }, { x: -20, z: -145, type: 'tombstone' }, { x: -5, z: -145, type: 'tombstone' },
        { x: 10, z: -145, type: 'tombstone' }, { x: 25, z: -145, type: 'tombstone' }, { x: 40, z: -145, type: 'tombstone' },
        { x: 55, z: -145, type: 'tombstone' }, { x: 70, z: -145, type: 'tombstone' }, { x: 85, z: -145, type: 'tombstone' },
        
        { x: -85, z: -160, type: 'tombstone' }, { x: -70, z: -160, type: 'tombstone' }, { x: -55, z: -160, type: 'tombstone' },
        { x: -40, z: -160, type: 'tombstone' }, { x: -25, z: -160, type: 'tombstone' }, { x: -10, z: -160, type: 'tombstone' },
        { x: 5, z: -160, type: 'tombstone' }, { x: 20, z: -160, type: 'tombstone' }, { x: 35, z: -160, type: 'tombstone' },
        { x: 50, z: -160, type: 'tombstone' }, { x: 65, z: -160, type: 'tombstone' }, { x: 80, z: -160, type: 'tombstone' },
        
        // Section G: z=-175 to z=-190 (crypt area)
        { x: -80, z: -175, type: 'tombstone' }, { x: -65, z: -175, type: 'tombstone' }, { x: -50, z: -175, type: 'tombstone' },
        { x: -35, z: -175, type: 'tombstone' }, { x: 35, z: -175, type: 'tombstone' },
        { x: 50, z: -175, type: 'tombstone' }, { x: 65, z: -175, type: 'tombstone' }, { x: 80, z: -175, type: 'tombstone' },
        
        { x: -85, z: -190, type: 'tombstone' }, { x: -70, z: -190, type: 'tombstone' }, { x: -55, z: -190, type: 'tombstone' },
        { x: 55, z: -190, type: 'tombstone' }, { x: 70, z: -190, type: 'tombstone' }, { x: 85, z: -190, type: 'tombstone' },
        
        // Jack-o-lanterns - scattered throughout for Halloween atmosphere
        // Near spawn area
        { x: -15, z: 195, type: 'jackolantern' }, { x: 12, z: 188, type: 'jackolantern' },
        { x: -28, z: 175, type: 'jackolantern' }, { x: 32, z: 172, type: 'jackolantern' },
        { x: 8, z: 160, type: 'jackolantern' }, { x: -22, z: 155, type: 'jackolantern' },
        // Along path section 1
        { x: 45, z: 140, type: 'jackolantern' }, { x: -48, z: 135, type: 'jackolantern' },
        { x: 18, z: 125, type: 'jackolantern' }, { x: -32, z: 118, type: 'jackolantern' },
        { x: 55, z: 105, type: 'jackolantern' }, { x: -58, z: 98, type: 'jackolantern' },
        // Mid graveyard
        { x: -8, z: 88, type: 'jackolantern' }, { x: 42, z: 78, type: 'jackolantern' },
        { x: -45, z: 72, type: 'jackolantern' }, { x: 22, z: 62, type: 'jackolantern' },
        { x: 58, z: 52, type: 'jackolantern' }, { x: -55, z: 45, type: 'jackolantern' },
        { x: 12, z: 38, type: 'jackolantern' }, { x: -18, z: 28, type: 'jackolantern' },
        // Central area
        { x: 48, z: 15, type: 'jackolantern' }, { x: -52, z: 8, type: 'jackolantern' },
        { x: 28, z: -5, type: 'jackolantern' }, { x: -25, z: -12, type: 'jackolantern' },
        { x: 62, z: -25, type: 'jackolantern' }, { x: -62, z: -32, type: 'jackolantern' },
        // Deeper graves
        { x: 15, z: -45, type: 'jackolantern' }, { x: -38, z: -52, type: 'jackolantern' },
        { x: 52, z: -65, type: 'jackolantern' }, { x: -55, z: -72, type: 'jackolantern' },
        { x: 8, z: -82, type: 'jackolantern' }, { x: -28, z: -88, type: 'jackolantern' },
        // Near crypt
        { x: 45, z: -105, type: 'jackolantern' }, { x: -48, z: -112, type: 'jackolantern' },
        { x: 22, z: -125, type: 'jackolantern' }, { x: -35, z: -132, type: 'jackolantern' },
        { x: 58, z: -145, type: 'jackolantern' }, { x: -58, z: -152, type: 'jackolantern' },
        // Crypt entrance area
        { x: 12, z: -168, type: 'jackolantern' }, { x: -15, z: -175, type: 'jackolantern' },
        { x: 38, z: -185, type: 'jackolantern' }, { x: -42, z: -188, type: 'jackolantern' }
    ],
    
    // Rock positions (broken tombstones and bone piles)
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
    
    // Boulder positions (large crypts and sarcophagi)
    boulderPositions: [
        { x: -65, z: 175 }, { x: 70, z: 155 },
        { x: -60, z: 115 }, { x: 65, z: 85 },
        { x: -70, z: 45 }, { x: 60, z: 5 },
        { x: -65, z: -35 }, { x: 70, z: -75 },
        { x: -60, z: -115 }, { x: 65, z: -155 }
    ],
    
    // Graveyard fence/wall structure - thin brick walls with iron fence on top
    canyonWalls: [
        // MAZE SECTION 1 (spawn area z:200 to z:140) - funnel player through
        { x: -40, z: 170, width: 50, depth: 1, height: 3.5, rotation: 0 },
        { x: 50, z: 165, width: 40, depth: 1, height: 3.5, rotation: 0 },
        { x: 0, z: 155, width: 35, depth: 1, height: 3.5, rotation: 0 },
        { x: -70, z: 155, width: 1, depth: 30, height: 3.5, rotation: 0 },
        { x: 75, z: 150, width: 1, depth: 35, height: 3.5, rotation: 0 },
        
        // MAZE SECTION 2 (z:140 to z:80) - zigzag corridors
        { x: -25, z: 130, width: 45, depth: 1, height: 3.5, rotation: 0 },
        { x: 35, z: 120, width: 50, depth: 1, height: 3.5, rotation: 0 },
        { x: -55, z: 110, width: 1, depth: 40, height: 3.5, rotation: 0 },
        { x: 60, z: 105, width: 1, depth: 35, height: 3.5, rotation: 0 },
        { x: 10, z: 95, width: 40, depth: 1, height: 3.5, rotation: 0 },
        { x: -40, z: 85, width: 35, depth: 1, height: 3.5, rotation: 0 },
        
        // MAZE SECTION 3 (z:80 to z:20) - winding path
        { x: 45, z: 70, width: 45, depth: 1, height: 3.5, rotation: 0 },
        { x: -30, z: 60, width: 40, depth: 1, height: 3.5, rotation: 0 },
        { x: -70, z: 50, width: 1, depth: 35, height: 3.5, rotation: 0 },
        { x: 70, z: 45, width: 1, depth: 40, height: 3.5, rotation: 0 },
        { x: 15, z: 40, width: 45, depth: 1, height: 3.5, rotation: 0 },
        { x: -45, z: 30, width: 35, depth: 1, height: 3.5, rotation: 0 },
        
        // MAZE SECTION 4 (z:20 to z:-40) - central graveyard
        { x: 40, z: 15, width: 40, depth: 1, height: 3.5, rotation: 0 },
        { x: -20, z: 5, width: 45, depth: 1, height: 3.5, rotation: 0 },
        { x: -60, z: -5, width: 1, depth: 35, height: 3.5, rotation: 0 },
        { x: 65, z: -10, width: 1, depth: 40, height: 3.5, rotation: 0 },
        { x: 20, z: -20, width: 40, depth: 1, height: 3.5, rotation: 0 },
        { x: -35, z: -30, width: 35, depth: 1, height: 3.5, rotation: 0 },
        
        // MAZE SECTION 5 (z:-40 to z:-100) - deeper graves
        { x: 50, z: -45, width: 45, depth: 1, height: 3.5, rotation: 0 },
        { x: -25, z: -55, width: 40, depth: 1, height: 3.5, rotation: 0 },
        { x: -65, z: -65, width: 1, depth: 35, height: 3.5, rotation: 0 },
        { x: 70, z: -70, width: 1, depth: 40, height: 3.5, rotation: 0 },
        { x: 10, z: -80, width: 45, depth: 1, height: 3.5, rotation: 0 },
        { x: -40, z: -90, width: 35, depth: 1, height: 3.5, rotation: 0 },
        
        // MAZE SECTION 6 (z:-100 to z:-160) - crypt approach
        { x: 45, z: -105, width: 40, depth: 1, height: 3.5, rotation: 0 },
        { x: -30, z: -115, width: 45, depth: 1, height: 3.5, rotation: 0 },
        { x: -60, z: -125, width: 1, depth: 35, height: 3.5, rotation: 0 },
        { x: 65, z: -130, width: 1, depth: 40, height: 3.5, rotation: 0 },
        { x: 15, z: -140, width: 40, depth: 1, height: 3.5, rotation: 0 },
        { x: -40, z: -150, width: 35, depth: 1, height: 3.5, rotation: 0 },
        
        // CRYPT ENTRANCE (z:-160 to z:-200)
        { x: -25, z: -170, width: 30, depth: 1, height: 4, rotation: 0 },
        { x: 25, z: -175, width: 30, depth: 1, height: 4, rotation: 0 },
        { x: 0, z: -185, width: 25, depth: 1, height: 4, rotation: 0 }
    ],
    
    // No scarabs - graveyard has different creatures
    scarabs: [],
    
    // Safe zone bounds
    safeZoneBounds: {
        minX: -120,
        maxX: 120,
        minZ: -230,
        maxZ: 210
    }
});
