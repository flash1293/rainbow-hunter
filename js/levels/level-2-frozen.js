// Level 2 - The Frozen Wastes
// Ice theme with multiple dragons

LEVEL_REGISTRY.register(2, {
    name: "Level 2 - The Frozen Wastes",
    theme: 'ice',
    
    // Player start position - bottom of the L (south end) - EXTENDED
    playerStart: { x: 0, z: 200 },
    
    // No portal in level 2 - portal to level 3
    portal: { x: -180, z: -100, destinationLevel: 3 },
    
    // Unique elements for level 2
    iceTheme: true,
    skyColor: 0xc8d8e8,  // Match fog color for seamless fade
    groundColor: 0xc8e6f5,  // Icy ground
    fogDensity: 0.02,
    fogColor: 0xc8d8e8,  // White mist
    
    // No river or materials in level 2
    hasRiver: false,
    hasMaterials: false,
    
    // Theme colors for ice level
    hillColor: 0x88bbdd,       // Icy blue-gray hills
    treeColor: 0x667788,       // Frosted gray-blue foliage
    grassColor: 0x99aacc,      // Frosted pale blue grass
    
    // Level 2 has no treasure - portal leads to level 3
    hasTreasure: false,
    
    // Treasure position - at the end of the L (west end)
    treasurePosition: { x: -180, z: -100 },
    
    // Rainbow position - above the treasure
    rainbow: { x: -180, z: -95 },
    
    // Dragon spawn positions - THREE dragons guarding Level 2
    dragon: { x: -120, z: -100 },  // Main dragon near treasure
    extraDragons: [
        { x: 0, z: 50 },           // Dragon in southern corridor
        { x: -70, z: -100 }        // Dragon in middle of western corridor
    ],
    
    // World Kite position - near spawn for easy collection
    worldKite: { x: 5, z: 190 },

    // Ice Berg position - in the extended southern corridor
    iceBerg: { x: 20, z: 100 },
    
    // L-shaped layout hills - scattered along the EXTENDED L path
    // The L goes: South (z:200) -> North (z:-60 corner) -> West (treasure)
    hills: [
        // Extended southern corridor (z: 200 to z: 0)
        { x: -20, z: 180, radius: 8, height: 4 },
        { x: 25, z: 160, radius: 9, height: 4.5 },
        { x: -15, z: 140, radius: 7, height: 3.5 },
        { x: 30, z: 120, radius: 8, height: 4 },
        { x: -25, z: 100, radius: 9, height: 4.5 },
        { x: 20, z: 80, radius: 7, height: 3.5 },
        { x: -20, z: 60, radius: 8, height: 4 },
        { x: 25, z: 40, radius: 9, height: 4.5 },
        { x: -15, z: 20, radius: 7, height: 3.5 },
        { x: 30, z: 0, radius: 8, height: 4 },
        { x: -25, z: -20, radius: 9, height: 4.5 },
        // Corner area (z: -40 to z: -60)
        { x: -10, z: -45, radius: 10, height: 5 },
        { x: 25, z: -55, radius: 8, height: 4 },
        // Western corridor (x: -40 to x: -180, z: -80 to z: -120)
        { x: -50, z: -90, radius: 8, height: 4 },
        { x: -80, z: -105, radius: 9, height: 4.5 },
        { x: -110, z: -95, radius: 7, height: 3.5 },
        { x: -140, z: -110, radius: 8, height: 4 },
        { x: -160, z: -85, radius: 9, height: 4.5 }
    ],
    
    // L-shaped mountain layout - walls forming the EXTENDED L corridor
    mountains: [
        // === EXTENDED SOUTHERN CORRIDOR (vertical part of L) ===
        // East wall of southern corridor (x: 60) - from z:220 to z:-40
        { x: 60, z: 220, width: 50, height: 28 },
        { x: 60, z: 180, width: 50, height: 28 },
        { x: 60, z: 140, width: 50, height: 28 },
        { x: 60, z: 100, width: 50, height: 28 },
        { x: 60, z: 60, width: 50, height: 28 },
        { x: 60, z: 20, width: 50, height: 28 },
        { x: 60, z: -20, width: 50, height: 28 },
        { x: 60, z: -60, width: 50, height: 28 },
        // West wall of southern corridor (x: -60) - only goes to corner
        { x: -60, z: 220, width: 50, height: 28 },
        { x: -60, z: 180, width: 50, height: 28 },
        { x: -60, z: 140, width: 50, height: 28 },
        { x: -60, z: 100, width: 50, height: 28 },
        { x: -60, z: 60, width: 50, height: 28 },
        { x: -60, z: 20, width: 50, height: 28 },
        { x: -60, z: -20, width: 50, height: 28 },
        // South wall (behind player start at z:200)
        { x: -40, z: 240, width: 60, height: 26 },
        { x: 20, z: 240, width: 60, height: 26 },
        
        // === CORNER AREA ===
        // East wall continues down
        { x: 60, z: -100, width: 50, height: 28 },
        { x: 60, z: -140, width: 50, height: 28 },
        // North-east corner wall (blocking direct path north)
        { x: 30, z: -160, width: 60, height: 28 },
        { x: -30, z: -160, width: 60, height: 28 },
        
        // === WESTERN CORRIDOR (horizontal part of L) ===
        // North wall of western corridor (z: -60)
        { x: -60, z: -60, width: 50, height: 28 },
        { x: -100, z: -60, width: 50, height: 28 },
        { x: -140, z: -60, width: 50, height: 28 },
        { x: -180, z: -60, width: 50, height: 28 },
        // South wall of western corridor (z: -140)
        { x: -60, z: -140, width: 50, height: 28 },
        { x: -100, z: -140, width: 50, height: 28 },
        { x: -140, z: -140, width: 50, height: 28 },
        { x: -180, z: -140, width: 50, height: 28 },
        // West wall (treasure area end)
        { x: -220, z: -80, width: 50, height: 28 },
        { x: -220, z: -120, width: 50, height: 28 }
    ],
    
    // Goblin spawn positions - along the EXTENDED L-shaped path
    goblins: [
        // Extended southern corridor (z: 200 to z: 0)
        [25, 150, 20, 30, 0.016],
        [-15, 130, -20, -10, 0.015],
        [30, 110, 25, 35, 0.015],
        [-25, 90, -30, -20, 0.014],
        [20, 70, 15, 25, 0.016],
        [-15, 50, -20, -10, 0.015],
        [25, 30, 20, 30, 0.014],
        [-20, 10, -25, -15, 0.016],
        [30, -10, 25, 35, 0.015],
        [-25, -30, -30, -20, 0.014],
        // Corner area
        [10, -50, 5, 15, 0.016],
        [-20, -70, -25, -15, 0.015],
        // Western corridor
        [-60, -100, -65, -55, 0.015],
        [-90, -95, -95, -85, 0.016],
        [-120, -105, -125, -115, 0.014],
        [-150, -90, -155, -145, 0.015]
    ],
    
    // Guardians along the EXTENDED L path
    guardians: [
        // Extended southern corridor
        [0, 160, -5, 5, 0.012],
        [-10, 120, -15, -5, 0.013],
        [15, 80, 10, 20, 0.012],
        [0, 40, -5, 5, 0.013],
        [-10, 0, -15, -5, 0.012],
        [15, -40, 10, 20, 0.013],
        // Corner area
        [-30, -80, -35, -25, 0.014],
        // Western corridor - near dragon
        [-80, -100, -85, -75, 0.013],
        [-110, -90, -115, -105, 0.014],
        [-140, -100, -145, -135, 0.013],
        [-165, -95, -170, -160, 0.015]
    ],
    
    // Giants guarding key positions
    giants: [
        [0, 100, -10, 10],           // Mid southern corridor
        [0, -60, -10, 10],           // Corner entrance
        [-100, -100, -110, -90],     // Western corridor
        [-160, -100, -170, -150]     // Near treasure
    ],
    
    // Wizards casting fireballs (hard mode) [x, z, patrolLeft, patrolRight, speed]
    wizards: [
        [0, 150, -10, 10, 0.007],       // Wizard in southern corridor (top)
        [0, 80, -10, 10, 0.008],        // Wizard in southern corridor (middle)
        [0, 10, -10, 10, 0.007],        // Wizard in southern corridor (bottom)
        [-20, -60, -30, -10, 0.008],    // Wizard at the corner
        [-40, -100, -50, -30, 0.008],   // Wizard in western corridor
        [-90, -95, -100, -80, 0.007],   // Wizard in mid-western corridor
        [-140, -95, -150, -130, 0.007]  // Wizard near treasure
    ],
    
    hardModeGoblins: [
        // Extra goblins in hard mode - extended
        [20, 180, 15, 25, 0.015],
        [-30, 140, -35, -25, 0.014],
        [25, 100, 20, 30, 0.016],
        [-25, 60, -30, -20, 0.015],
        [20, 20, 15, 25, 0.014],
        [-30, -20, -35, -25, 0.016],
        [-45, -90, -50, -40, 0.015],
        [-130, -110, -135, -125, 0.014]
    ],
    
    // More birds in level 2
    birds: [
        [0, 120, 30, 0.007],
        [0, 0, 25, 0.008],
        [-80, -100, 30, 0.008]
    ],
    
    // Ammo pickups along the EXTENDED L path - LOTS MORE
    ammoPositions: [
        // Extended southern corridor - many ammo drops
        { x: -15, z: 175 }, { x: 20, z: 155 }, { x: -10, z: 135 },
        { x: 25, z: 115 }, { x: -20, z: 95 }, { x: 15, z: 75 },
        { x: -10, z: 55 }, { x: 20, z: 35 }, { x: -15, z: 15 },
        { x: 25, z: -5 }, { x: -20, z: -25 },
        // Additional ammo in southern corridor
        { x: 30, z: 185 }, { x: -25, z: 165 }, { x: 35, z: 145 },
        { x: -30, z: 125 }, { x: 25, z: 85 }, { x: -25, z: 45 },
        { x: 30, z: 5 }, { x: -30, z: -35 },
        // Corner area
        { x: 15, z: -55 }, { x: -25, z: -75 }, { x: 25, z: -65 },
        { x: -15, z: -85 },
        // Western corridor - more ammo for dragon fights
        { x: -55, z: -95 }, { x: -85, z: -105 }, { x: -115, z: -90 },
        { x: -145, z: -100 }, { x: -170, z: -95 },
        { x: -65, z: -80 }, { x: -95, z: -115 }, { x: -125, z: -80 },
        { x: -155, z: -115 }, { x: -175, z: -85 }
    ],
    
    bombPositions: [
        // Extended southern corridor - more bombs
        { x: 20, z: 180 }, { x: -15, z: 145 }, { x: 25, z: 105 },
        { x: -20, z: 65 }, { x: 15, z: 25 }, { x: -10, z: -15 },
        // Additional bombs
        { x: -25, z: 170 }, { x: 30, z: 130 }, { x: -30, z: 90 },
        { x: 25, z: 50 }, { x: -25, z: 10 },
        // Corner - more bombs
        { x: -20, z: -60 }, { x: 20, z: -70 }, { x: -10, z: -80 },
        // Western corridor - lots of bombs for dragons
        { x: -70, z: -90 }, { x: -100, z: -110 }, { x: -135, z: -85 },
        { x: -165, z: -105 }, { x: -60, z: -115 }, { x: -90, z: -80 },
        { x: -120, z: -115 }, { x: -150, z: -80 }, { x: -180, z: -100 }
    ],
    
    healthPositions: [
        // Extended southern corridor - more health
        { x: -10, z: 160 }, { x: 15, z: 125 }, { x: -15, z: 85 },
        { x: 10, z: 45 }, { x: -10, z: 5 },
        // Additional health pickups
        { x: 25, z: 175 }, { x: -20, z: 140 }, { x: 20, z: 100 },
        { x: -15, z: 60 }, { x: 25, z: 20 }, { x: -20, z: -20 },
        // Corner - extra health for dragon fight prep
        { x: 5, z: -65 }, { x: -15, z: -75 }, { x: 15, z: -85 },
        // Western corridor - health for dragon battles
        { x: -75, z: -105 }, { x: -125, z: -95 }, { x: -155, z: -100 },
        { x: -65, z: -85 }, { x: -95, z: -110 }, { x: -140, z: -80 },
        { x: -175, z: -110 }
    ],
    
    // Herz-Man pickup positions (presents with bow)
    herzmanPositions: [
        { x: 0, z: 150 }, { x: -10, z: 80 }, { x: 15, z: 10 },
        { x: -5, z: -60 }, { x: -100, z: -100 }, { x: -160, z: -95 }
    ],
    
    // No materials in Level 2
    materials: [],
    
    // MANY MORE traps in Level 2
    trapPositions: [
        // Extended southern corridor - lots of traps!
        { x: -5, z: 185 }, { x: 15, z: 175 }, { x: -20, z: 165 },
        { x: 10, z: 150 }, { x: -15, z: 140 }, { x: 20, z: 130 },
        { x: -10, z: 115 }, { x: 5, z: 105 }, { x: -25, z: 95 },
        { x: 15, z: 85 }, { x: -5, z: 70 }, { x: 20, z: 60 },
        { x: -15, z: 50 }, { x: 10, z: 40 }, { x: -20, z: 25 },
        { x: 5, z: 15 }, { x: -10, z: 0 }, { x: 15, z: -10 },
        { x: -5, z: -25 }, { x: 20, z: -35 },
        // Corner area - tight trap field
        { x: 15, z: -50 }, { x: -10, z: -55 }, { x: 5, z: -65 },
        { x: -20, z: -70 }, { x: 10, z: -80 },
        // Western corridor - more traps
        { x: -50, z: -85 }, { x: -65, z: -95 }, { x: -75, z: -110 },
        { x: -90, z: -85 }, { x: -105, z: -100 }, { x: -120, z: -115 },
        { x: -135, z: -90 }, { x: -150, z: -105 }, { x: -165, z: -95 },
        { x: -175, z: -110 }
    ],
    
    // Tree positions for Level 2 - frosted trees along the L
    treePositions: [
        // Extended southern corridor trees
        { x: -35, z: 185 }, { x: 35, z: 175 }, { x: -40, z: 155 },
        { x: 40, z: 145 }, { x: -35, z: 125 }, { x: 35, z: 115 },
        { x: -40, z: 95 }, { x: 40, z: 85 }, { x: -35, z: 65 },
        { x: 35, z: 55 }, { x: -40, z: 35 }, { x: 40, z: 25 },
        { x: -35, z: 5 }, { x: 35, z: -5 }, { x: -40, z: -25 },
        { x: 40, z: -35 },
        // Some trees scattered inside corridor
        { x: -15, z: 170 }, { x: 20, z: 140 }, { x: -10, z: 110 },
        { x: 15, z: 80 }, { x: -20, z: 50 }, { x: 25, z: 20 },
        { x: -15, z: -10 }, { x: 10, z: -40 },
        // Corner area trees
        { x: -40, z: -50 }, { x: 40, z: -55 }, { x: -35, z: -75 },
        // Western corridor trees
        { x: -55, z: -70 }, { x: -55, z: -130 }, { x: -85, z: -70 },
        { x: -85, z: -130 }, { x: -115, z: -70 }, { x: -115, z: -130 },
        { x: -145, z: -70 }, { x: -145, z: -130 }, { x: -175, z: -70 },
        { x: -175, z: -130 },
        // Trees near treasure
        { x: -190, z: -85 }, { x: -190, z: -115 }
    ],
    
    // Rock positions for Level 2 - icy rocks scattered throughout
    rockPositions: [
        // Extended southern corridor rocks - many scattered
        { x: -25, z: 190 }, { x: 30, z: 185 }, { x: -10, z: 178 },
        { x: 15, z: 168 }, { x: -30, z: 160 }, { x: 25, z: 152 },
        { x: -18, z: 145 }, { x: 12, z: 138 }, { x: -28, z: 128 },
        { x: 22, z: 122 }, { x: -15, z: 112 }, { x: 18, z: 102 },
        { x: -22, z: 92 }, { x: 28, z: 88 }, { x: -12, z: 78 },
        { x: 15, z: 68 }, { x: -25, z: 58 }, { x: 20, z: 48 },
        { x: -18, z: 38 }, { x: 25, z: 28 }, { x: -10, z: 18 },
        { x: 12, z: 8 }, { x: -22, z: -2 }, { x: 18, z: -12 },
        { x: -15, z: -22 }, { x: 28, z: -32 }, { x: -8, z: -42 },
        // Corner area rocks
        { x: -30, z: -52 }, { x: 25, z: -58 }, { x: -15, z: -68 },
        { x: 10, z: -78 }, { x: -25, z: -85 },
        // Western corridor rocks - scattered
        { x: -52, z: -80 }, { x: -48, z: -115 }, { x: -68, z: -88 },
        { x: -72, z: -108 }, { x: -88, z: -82 }, { x: -92, z: -118 },
        { x: -108, z: -88 }, { x: -112, z: -112 }, { x: -128, z: -82 },
        { x: -132, z: -118 }, { x: -148, z: -88 }, { x: -152, z: -112 },
        { x: -168, z: -82 }, { x: -172, z: -118 },
        // Near treasure
        { x: -185, z: -88 }, { x: -185, z: -112 }, { x: -195, z: -100 }
    ]
});
