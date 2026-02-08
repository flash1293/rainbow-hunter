// Level 1 - Dragon's Lair
// Forest theme with dragon boss

LEVEL_REGISTRY.register(1, {
    name: "Level 1 - Dragon's Lair",
    theme: 'forest',
    
    // Theme colors
    hillColor: 0x228B22,       // Forest green hills
    treeColor: 0x228B22,       // Forest green foliage
    grassColor: 0x228B22,      // Forest green grass
    
    // Level features
    hasRiver: true,
    hasMaterials: true,
    
    // Player start position
    playerStart: { x: 0, z: 40 },
    
    // No treasure in Level 1 - portal is at treasure location
    hasTreasure: false,
    
    // Portal to Level 2 at the treasure location (far end of level)
    portal: { x: -120, z: -220, destinationLevel: 2 },
    
    // World Kite position
    worldKite: { x: 0, z: -10 },
    
    // Ice Berg position
    iceBerg: { x: 80, z: -40 },
    
    // Dragon spawn position (only used in hard mode)
    dragon: { x: 0, z: -200 },
    
    // Rainbow position (near treasure)
    rainbow: { x: -120, z: -215 },
    
    // Hill positions and dimensions
    hills: [
        { x: -30, z: -30, radius: 8, height: 4 },
        { x: 40, z: -50, radius: 10, height: 5 },
        { x: -60, z: 20, radius: 7, height: 3.5 },
        { x: 60, z: 30, radius: 9, height: 4.5 },
        { x: -20, z: 60, radius: 6, height: 3 },
        { x: 20, z: -70, radius: 8, height: 4 },
        { x: -80, z: -60, radius: 7, height: 3.5 },
        { x: 80, z: -20, radius: 8, height: 4 },
        { x: -40, z: 80, radius: 9, height: 4.5 },
        { x: 50, z: 70, radius: 7, height: 3.5 },
        { x: 10, z: 40, radius: 6, height: 3 },
        { x: -70, z: -30, radius: 8, height: 4 },
        { x: 70, z: 60, radius: 7, height: 3.5 },
        { x: -50, z: 50, radius: 9, height: 4.5 },
        { x: 30, z: -20, radius: 6, height: 3 },
        // Hills behind the gap (treasure area)
        { x: -40, z: -100, radius: 8, height: 4 },
        { x: 25, z: -105, radius: 7, height: 3.5 },
        { x: -15, z: -130, radius: 9, height: 4.5 },
        { x: 50, z: -125, radius: 8, height: 4 },
        { x: 0, z: -95, radius: 6, height: 3 },
        { x: 60, z: -150, radius: 7, height: 3.5 },
        { x: -60, z: -140, radius: 8, height: 4 },
        // Dragon boss area hills - many in CENTER behind dragon
        { x: -25, z: -212, radius: 8, height: 3.5 },
        { x: 20, z: -220, radius: 9, height: 4 },
        { x: -15, z: -228, radius: 7, height: 3 },
        { x: 30, z: -236, radius: 8, height: 3.5 },
        { x: -35, z: -244, radius: 9, height: 4 },
        { x: 10, z: -252, radius: 8, height: 3.5 },
        { x: -20, z: -258, radius: 7, height: 3 },
        { x: 35, z: -215, radius: 6, height: 2.5 },
        { x: -30, z: -225, radius: 8, height: 3.5 },
        { x: 5, z: -235, radius: 7, height: 3 },
        { x: 25, z: -248, radius: 9, height: 4 }
    ],
    
    // Mountain positions (world boundaries)
    mountains: [
        // Far north wall (behind treasure at z: -210) - solid wall
        { x: -160, z: -270, width: 80, height: 30 },
        { x: -120, z: -270, width: 80, height: 30 },
        { x: -80, z: -270, width: 80, height: 30 },
        { x: -40, z: -270, width: 80, height: 30 },
        { x: 0, z: -270, width: 80, height: 30 },
        { x: 40, z: -270, width: 80, height: 30 },
        { x: 80, z: -270, width: 80, height: 30 },
        { x: 120, z: -270, width: 80, height: 30 },
        { x: 160, z: -270, width: 80, height: 30 },
        // Second row for solid wall
        { x: -140, z: -260, width: 60, height: 28 },
        { x: -80, z: -260, width: 60, height: 28 },
        { x: -20, z: -260, width: 60, height: 28 },
        { x: 20, z: -260, width: 60, height: 28 },
        { x: 80, z: -260, width: 60, height: 28 },
        { x: 140, z: -260, width: 60, height: 28 },
        // Back area side walls (z: -180 to z: -270) - widest area for dragon
        { x: -190, z: -260, width: 50, height: 28 },
        { x: -190, z: -240, width: 50, height: 28 },
        { x: -190, z: -220, width: 50, height: 28 },
        { x: -190, z: -200, width: 50, height: 28 },
        { x: -190, z: -190, width: 50, height: 28 },
        { x: 190, z: -260, width: 50, height: 28 },
        { x: 190, z: -240, width: 50, height: 28 },
        { x: 190, z: -220, width: 50, height: 28 },
        { x: 190, z: -200, width: 50, height: 28 },
        { x: 190, z: -190, width: 50, height: 28 },
        // Second gap entrance at z: -180 (narrow passage leading to back area)
        { x: -120, z: -180, width: 60, height: 28 },
        { x: -70, z: -180, width: 50, height: 28 },
        { x: -35, z: -180, width: 40, height: 28 },
        { x: 35, z: -180, width: 40, height: 28 },
        { x: 70, z: -180, width: 50, height: 28 },
        { x: 120, z: -180, width: 60, height: 28 },
        // Middle area side walls (z: -85 to z: -180) - medium width for guardians
        { x: -150, z: -170, width: 50, height: 28 },
        { x: -150, z: -150, width: 50, height: 28 },
        { x: -150, z: -130, width: 50, height: 28 },
        { x: -150, z: -110, width: 50, height: 28 },
        { x: -150, z: -95, width: 50, height: 28 },
        { x: 150, z: -170, width: 50, height: 28 },
        { x: 150, z: -150, width: 50, height: 28 },
        { x: 150, z: -130, width: 50, height: 28 },
        { x: 150, z: -110, width: 50, height: 28 },
        { x: 150, z: -95, width: 50, height: 28 },
        // First gap entrance at z: -85 (narrow passage leading to middle area)
        { x: -120, z: -85, width: 60, height: 28 },
        { x: -70, z: -85, width: 50, height: 28 },
        { x: -35, z: -85, width: 40, height: 28 },
        { x: 35, z: -85, width: 40, height: 28 },
        { x: 70, z: -85, width: 50, height: 28 },
        { x: 120, z: -85, width: 60, height: 28 },
        // Front area corners (before first gap)
        { x: -170, z: -70, width: 60, height: 28 },
        { x: -170, z: -50, width: 60, height: 28 },
        { x: 170, z: -70, width: 60, height: 28 },
        { x: 170, z: -50, width: 60, height: 28 },
        // West wall (left side) - front area
        { x: -190, z: -80, width: 50, height: 28 },
        { x: -190, z: -40, width: 50, height: 28 },
        { x: -190, z: 0, width: 50, height: 28 },
        { x: -190, z: 40, width: 50, height: 28 },
        { x: -190, z: 80, width: 50, height: 28 },
        { x: -190, z: 120, width: 50, height: 28 },
        // East wall (right side) - front area
        { x: 190, z: -80, width: 50, height: 28 },
        { x: 190, z: -40, width: 50, height: 28 },
        { x: 190, z: 0, width: 50, height: 28 },
        { x: 190, z: 40, width: 50, height: 28 },
        { x: 190, z: 80, width: 50, height: 28 },
        { x: 190, z: -80, width: 50, height: 28 },
        { x: 190, z: -40, width: 50, height: 28 },
        { x: 190, z: 0, width: 50, height: 28 },
        { x: 190, z: 40, width: 50, height: 28 },
        { x: 190, z: 80, width: 50, height: 28 },
        { x: 190, z: 120, width: 50, height: 28 },
        // Southwest corner
        { x: -170, z: 140, width: 60, height: 26 },
        { x: -170, z: 100, width: 60, height: 26 },
        // Southeast corner
        { x: 170, z: 140, width: 60, height: 26 },
        { x: 170, z: 100, width: 60, height: 26 },
        // South wall (player side) - complete coverage
        { x: -120, z: 180, width: 80, height: 26 },
        { x: -40, z: 180, width: 80, height: 26 },
        { x: 40, z: 180, width: 80, height: 26 },
        { x: 120, z: 180, width: 80, height: 26 },
        { x: -80, z: 165, width: 60, height: 24 },
        { x: 0, z: 165, width: 60, height: 24 },
        { x: 80, z: 165, width: 60, height: 24 }
    ],
    
    // Goblin spawn positions [x, z, patrolLeft, patrolRight, speed]
    goblins: [
        [-40, -20, -45, -35, 0.012],
        [50, 10, 45, 55, 0.014],
        [-30, 30, -35, -25, 0.013],
        [40, -40, 35, 45, 0.016],
        [10, -30, 5, 15, 0.013],
        [-70, 50, -75, -65, 0.013],
        [80, -30, 75, 85, 0.014],
        [-50, -70, -55, -45, 0.015],
        [20, 60, 15, 25, 0.013],
        [60, -70, 55, 65, 0.016],
        [-80, -40, -85, -75, 0.013],
        [90, 40, 85, 95, 0.014],
        [-15, -25, -20, -10, 0.013],
        [45, 15, 40, 50, 0.014],
        [-25, 50, -30, -20, 0.012],
        [55, -45, 50, 60, 0.015],
        [-65, 35, -70, -60, 0.013],
        [75, -10, 70, 80, 0.014],
        [-55, 65, -60, -50, 0.014],
        [70, 55, 65, 75, 0.015],
        [-45, -55, -50, -40, 0.013],
        [60, -60, 55, 65, 0.014],
        [-85, 25, -90, -80, 0.013],
        [95, -20, 90, 100, 0.016],
        [5, -70, 0, 10, 0.014],
        [-35, 75, -40, -30, 0.013],
        [48, 70, 43, 53, 0.015],
        [-75, -55, -80, -70, 0.013],
        [85, -65, 80, 90, 0.014],
        [-20, -65, -25, -15, 0.014],
        [32, 80, 27, 37, 0.013],
        [-90, -25, -95, -85, 0.013],
        [100, 30, 95, 105, 0.016],
        [-10, -80, -15, -5, 0.014],
        [25, -75, 20, 30, 0.014],
        [-95, 10, -100, -90, 0.013],
        [105, -10, 100, 110, 0.016],
        [-60, -30, -65, -55, 0.014],
        [65, 25, 60, 70, 0.014],
        [-38, -45, -43, -33, 0.013],
        [52, -55, 47, 57, 0.015],
        [-72, 65, -77, -67, 0.014],
        [82, 70, 77, 87, 0.016],
        [-28, -85, -33, -23, 0.014],
        [38, 85, 33, 43, 0.014],
        [-100, -15, -105, -95, 0.013],
        [110, 15, 105, 115, 0.016],
        [-12, 55, -17, -7, 0.014],
        [28, -50, 23, 33, 0.014],
        [-82, -65, -87, -77, 0.013],
        [92, -75, 87, 97, 0.016],
        [-48, 82, -53, -43, 0.014],
        [58, -82, 53, 63, 0.016]
    ],
    
    // Guardian goblin positions (hard mode) [x, z, patrolLeft, patrolRight, speed]
    guardians: [
        // Early area (just past the first gap)
        [-45, -15, -50, -40, 0.012],
        [50, -25, 45, 55, 0.012],
        [-15, -40, -20, -10, 0.010],
        [35, -55, 30, 40, 0.011],
        // Middle area (before second gap and dragon)
        [-70, -95, -75, -65, 0.013],
        [60, -105, 55, 65, 0.012],
        [-30, -125, -35, -25, 0.011],
        [80, -135, 75, 85, 0.013],
        [-85, -150, -90, -80, 0.012],
        [40, -165, 35, 45, 0.011],
        // Dragon area (scattered around the boss)
        [-90, -195, -95, -85, 0.013],
        [85, -205, 80, 90, 0.012],
        [-50, -215, -55, -45, 0.011],
        [60, -230, 55, 65, 0.013]
    ],
    
    // Giant goblin positions (hard mode) [x, z, patrolLeft, patrolRight]
    giants: [
        [0, -85, -8, 8],        // Giant guardian at the gap
        [-40, -50, -50, -30],   // Additional giant
        [40, -110, 30, 50],     // Additional giant
        [-25, -115, -35, -15]   // Additional giant
    ],
    
    // Wizard goblin positions (hard mode) [x, z, patrolLeft, patrolRight, speed]
    wizards: [
        [0, -180, -10, 10, 0.008],      // Wizard guarding dragon approach
        [-60, -220, -70, -50, 0.007],   // Wizard in dragon boss area
        [50, -150, 40, 60, 0.008],      // Wizard on right side of middle area
        [-40, -120, -50, -30, 0.007],   // Wizard on left side
        [30, -200, 20, 40, 0.008]       // Wizard near dragon from other side
    ],
    
    // Additional regular goblins for hard mode [x, z, patrolLeft, patrolRight, speed]
    hardModeGoblins: [
        // Middle area
        [-50, -100, -60, -40, 0.013],
        [45, -120, 35, 55, 0.012],
        [-15, -145, -25, -5, 0.011],
        [65, -160, 55, 75, 0.013],
        // Dragon area
        [-75, -210, -85, -65, 0.012],
        [70, -220, 60, 80, 0.013],
        [-30, -235, -40, -20, 0.011],
        [40, -245, 30, 50, 0.012],
        [0, -225, -10, 10, 0.013]
    ],
    
    // Bird positions (hard mode) [centerX, centerZ, radius, speed]
    birds: [
        [0, -85, 35, 0.006],
        [0, -85, 42, 0.007],
        [5, -80, 38, 0.0065],
        [60, -130, 22, 0.007],
        [60, -130, 28, 0.006]
    ],
    
    // Ammo pickup positions
    ammoPositions: [
        { x: -15, z: 20 }, { x: 35, z: 15 }, { x: -25, z: -10 },
        { x: 15, z: -25 }, { x: -40, z: 40 }, { x: 45, z: -35 },
        { x: 5, z: 25 }, { x: -30, z: -30 }, { x: 20, z: -15 },
        { x: -10, z: -40 }, { x: 40, z: 35 }, { x: -35, z: 5 },
        { x: -50, z: -15 }, { x: 55, z: -20 }, { x: -18, z: 50 },
        { x: 25, z: 55 }, { x: -45, z: -50 }, { x: 50, z: -55 },
        // Behind the gap
        { x: -20, z: -100 }, { x: 30, z: -110 }, { x: -10, z: -125 },
        { x: 40, z: -135 },
        // Additional ammo for harder difficulty
        { x: 10, z: -70 }, { x: -35, z: -75 }, { x: 45, z: -90 },
        { x: -15, z: -105 }, { x: 25, z: -120 }, { x: -30, z: -118 },
        { x: 52, z: -125 }, { x: 15, z: 45 },
        // Dragon boss area
        { x: -90, z: -195 }, { x: 100, z: -205 }, { x: -70, z: -220 },
        { x: 85, z: -235 }, { x: 0, z: -245 }, { x: -110, z: -250 },
        { x: 120, z: -215 }
    ],
    
    // Bomb pickup positions
    bombPositions: [
        // Early area
        { x: -35, z: 30 }, { x: 42, z: -10 }, { x: -18, z: -35 },
        { x: 30, z: 45 }, { x: -48, z: -18 }, { x: 15, z: -50 },
        { x: -25, z: 55 }, { x: 50, z: 25 }, { x: -55, z: -45 },
        // Middle area
        { x: -65, z: -110 }, { x: 55, z: -115 }, { x: -25, z: -140 },
        { x: 70, z: -155 }, { x: -80, z: -125 }, { x: 35, z: -130 },
        { x: -45, z: -165 }, { x: 60, z: -145 },
        // Dragon area
        { x: -95, z: -200 }, { x: 90, z: -210 }, { x: -60, z: -225 },
        { x: 75, z: -195 }, { x: -110, z: -215 }, { x: 105, z: -230 },
        { x: -40, z: -240 }, { x: 50, z: -220 }
    ],
    
    // Health pickup positions (hearts)
    healthPositions: [
        { x: -8, z: 50 }, { x: 32, z: -18 }, { x: -48, z: -25 },
        { x: 55, z: 22 }, { x: -22, z: 65 },
        // Middle area (before second gap and dragon)
        { x: -80, z: -100 }, { x: 75, z: -110 }, { x: 0, z: -120 },
        { x: -60, z: -140 }, { x: 65, z: -160 },
        // Dragon boss area
        { x: -100, z: -210 }, { x: 95, z: -225 }, { x: -60, z: -240 },
        { x: 70, z: -255 }
    ],
    
    // Herz-Man pickup positions (presents with bow)
    herzmanPositions: [
        { x: 20, z: 40 }, { x: -30, z: -20 }, { x: 50, z: -40 },
        { x: -60, z: -100 }, { x: 40, z: -150 },
        { x: -80, z: -200 }, { x: 60, z: -230 }
    ],
    
    // Bridge repair materials
    materials: [
        { x: -20, z: 35, type: 'wood', color: 0x8B4513, glowColor: 0xFFAA00 },
        { x: 25, z: 30, type: 'glass', color: 0x87CEEB, glowColor: 0x00FFFF },
        { x: 10, z: 15, type: 'metal', color: 0xC0C0C0, glowColor: 0xFFFFFF }
    ],
    
    // Trap positions
    trapPositions: [
        { x: -5, z: 12 }, { x: 12, z: 11 }, { x: -15, z: 9 },
        { x: -8, z: -5 }, { x: 10, z: -6 }, { x: -2, z: -20 },
        { x: 25, z: 15 }, { x: -30, z: 20 }, { x: 18, z: -15 },
        { x: -22, z: -25 }, { x: 35, z: -10 }, { x: -28, z: -40 },
        { x: -38, z: 28 }, { x: 40, z: 32 }, { x: -12, z: 50 },
        { x: 15, z: 52 }, { x: -48, z: -18 }, { x: 50, z: -22 },
        { x: -25, z: -50 }, { x: 28, z: -52 }, { x: -55, z: 40 },
        { x: 58, z: 42 }, { x: 5, z: -55 }, { x: -8, z: -58 },
        { x: -42, z: 55 }
    ],
    
    // Tree positions for Level 1
    treePositions: [
        { x: -10, z: -15 }, { x: 10, z: -16 }, { x: 0, z: -18 },
        { x: -25, z: -30 }, { x: 20, z: -35 }, { x: -15, z: -45 },
        { x: 30, z: -25 }, { x: -35, z: 15 }, { x: 40, z: 20 },
        { x: -45, z: 25 }, { x: 50, z: 30 }, { x: -20, z: 40 },
        { x: 35, z: 45 }, { x: -50, z: -20 }, { x: 55, z: -25 },
        { x: -30, z: -50 }, { x: 25, z: -55 }, { x: -60, z: 10 },
        { x: 65, z: 5 }, { x: 15, z: 55 }, { x: -40, z: 60 },
        { x: 45, z: -60 }, { x: -55, z: -55 }, { x: 60, z: 60 },
        { x: 5, z: -65 }, { x: -65, z: 35 },
        // Trees behind the gap (treasure area)
        { x: -20, z: -95 }, { x: 15, z: -100 }, { x: -35, z: -110 },
        { x: 40, z: -115 }, { x: -10, z: -125 }, { x: 25, z: -130 },
        { x: -50, z: -135 }, { x: 55, z: -140 }, { x: 0, z: -145 },
        { x: -30, z: -150 }, { x: 35, z: -155 }, { x: 10, z: -160 },
        // Dragon boss area trees
        { x: -130, z: -195 }, { x: 140, z: -205 }, { x: -100, z: -220 },
        { x: 110, z: -230 }, { x: -140, z: -245 }, { x: 130, z: -255 },
        { x: -80, z: -200 }, { x: 90, z: -215 }, { x: -70, z: -260 },
        { x: 115, z: -240 }, { x: -95, z: -235 }, { x: 105, z: -250 },
        { x: -150, z: -220 }, { x: 145, z: -225 }, { x: 75, z: -195 },
        { x: -50, z: -210 }, { x: 55, z: -235 }, { x: -85, z: -247 },
        { x: 95, z: -258 }, { x: -120, z: -262 }, { x: 125, z: -248 },
        { x: -60, z: -225 }, { x: 65, z: -252 }, { x: -110, z: -238 },
        { x: 100, z: -222 }, { x: -75, z: -254 }, { x: 85, z: -245 },
        { x: -135, z: -232 }, { x: 135, z: -260 }, { x: -45, z: -218 },
        { x: 50, z: -243 }, { x: -105, z: -256 }, { x: 120, z: -217 },
        // CENTER area behind dragon
        { x: -30, z: -210 }, { x: -15, z: -215 }, { x: 0, z: -220 },
        { x: 15, z: -225 }, { x: 30, z: -230 }, { x: -35, z: -235 },
        { x: -20, z: -240 }, { x: 10, z: -245 }, { x: 25, z: -250 },
        { x: -25, z: -255 }, { x: 5, z: -260 }, { x: 35, z: -212 },
        { x: -40, z: -222 }, { x: 20, z: -233 }, { x: -10, z: -248 },
        { x: 40, z: -258 }, { x: -5, z: -228 }, { x: 12, z: -238 }
    ],
    
    // Rock positions for Level 1
    rockPositions: [
        { x: -8, z: 8 }, { x: -3, z: 7 }, { x: 5, z: 8 }, { x: 10, z: 7 },
        { x: -20, z: 25 }, { x: 15, z: 30 }, { x: -10, z: 35 },
        { x: -18, z: 5 }, { x: 22, z: 10 }, { x: -25, z: -5 }, { x: 30, z: -2 },
        { x: -12, z: -8 }, { x: -6, z: -9 }, { x: 7, z: -8 }, { x: 12, z: -9 },
        { x: -30, z: -20 }, { x: 35, z: -25 }, { x: -20, z: -35 }, { x: 25, z: -40 },
        { x: -40, z: 15 }, { x: 42, z: 12 }, { x: -15, z: 45 }, { x: 18, z: 48 },
        { x: -50, z: -10 }, { x: 52, z: -15 }, { x: -35, z: -45 }, { x: 38, z: -48 },
        { x: -45, z: 50 }, { x: 48, z: 55 }, { x: -55, z: -30 }, { x: 58, z: -35 },
        { x: 8, z: 60 }, { x: -12, z: 65 }, { x: 15, z: -60 }, { x: -18, z: -65 },
        { x: -60, z: 20 }, { x: 62, z: 25 }, { x: -28, z: 70 }, { x: 32, z: 72 },
        { x: -65, z: -50 }, { x: 68, z: -55 }, { x: 25, z: 75 },
        { x: 0, z: 30 },
        // Dragon boss area rocks
        { x: -110, z: -200 }, { x: 125, z: -210 }, { x: -85, z: -225 },
        { x: 95, z: -235 }, { x: -135, z: -250 }, { x: 120, z: -245 },
        { x: -75, z: -205 }, { x: 100, z: -220 }, { x: -115, z: -255 },
        { x: 130, z: -230 }, { x: -90, z: -240 }, { x: 110, z: -260 },
        { x: -140, z: -215 }, { x: 135, z: -250 }, { x: -65, z: -260 },
        { x: 85, z: -200 }, { x: -125, z: -225 }, { x: 105, z: -255 },
        { x: -55, z: -218 }, { x: 70, z: -238 }, { x: -98, z: -248 },
        { x: 115, z: -252 }, { x: -82, z: -233 }, { x: 92, z: -258 },
        { x: -122, z: -243 }, { x: 128, z: -222 }, { x: -68, z: -246 },
        { x: 88, z: -228 }, { x: -102, z: -262 }, { x: 118, z: -236 },
        { x: -78, z: -214 }, { x: 82, z: -254 }, { x: -132, z: -257 },
        { x: 138, z: -241 }, { x: -72, z: -222 }, { x: 78, z: -248 },
        // CENTER area rocks behind dragon
        { x: -35, z: -212 }, { x: -20, z: -218 }, { x: -8, z: -224 },
        { x: 5, z: -230 }, { x: 18, z: -236 }, { x: 32, z: -242 },
        { x: -28, z: -248 }, { x: -15, z: -254 }, { x: 0, z: -260 },
        { x: 12, z: -216 }, { x: 25, z: -222 }, { x: -38, z: -228 },
        { x: -25, z: -234 }, { x: -10, z: -240 }, { x: 8, z: -246 },
        { x: 22, z: -252 }, { x: 35, z: -258 }, { x: -32, z: -215 },
        { x: -18, z: -225 }, { x: 15, z: -235 }, { x: 28, z: -245 }
    ]
});
