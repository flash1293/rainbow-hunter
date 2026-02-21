// Level 13 - Crystal Cove
// A mystical underground cave filled with glowing gemstones and crystal formations
// Unique mechanic: Gem Collection - collect colored gems for temporary power-ups

LEVEL_REGISTRY.register(13, {
    name: "Level 13 - Crystal Cove",
    theme: 'crystal',
    
    // Player start position - Cave entrance
    playerStart: { x: 0, z: 180 },
    
    // Portal leads back to Level 1 (moved further back)
    portal: { x: 0, z: -280, destinationLevel: 1 },
    
    // Crystal theme settings
    crystalTheme: true,
    skyColor: 0x0a0a1a,          // Dark cave ceiling
    groundColor: 0x2a2a4a,       // Dark cave floor
    fogDensity: 0.018,           // Dense cave atmosphere
    fogColor: 0x1a1a3a,          // Purple-tinted darkness
    
    // Feature flags from spec
    hasRiver: false,
    hasMountains: true,
    hasTreasure: true,
    hasMaterials: false,
    
    // Theme colors
    hillColor: 0x3a3a5a,         // Dark purple hills
    treeColor: 0x6a4a8a,         // Crystal purple
    grassColor: 0x4a4a6a,        // Cave floor accent
    
    // No hills in crystal cave (all rocky terrain)
    hills: [],
    
    // Tree positions become crystal formations along the winding path
    treePositions: [
        // Entrance area
        { x: -25, z: 185 }, { x: 22, z: 178 },
        // Curve right section
        { x: 20, z: 155 }, { x: 35, z: 140 }, { x: 48, z: 125 },
        // First combat area 
        { x: 55, z: 108 }, { x: 60, z: 98 },
        // Curve left section
        { x: 25, z: 85 }, { x: 5, z: 72 }, { x: -15, z: 60 },
        // Narrow passage
        { x: -28, z: 48 }, { x: -32, z: 35 },
        // Curve right again
        { x: -35, z: 18 }, { x: -30, z: 5 },
        // Second combat area
        { x: -25, z: -15 }, { x: 15, z: -28 }, { x: 30, z: -42 },
        // Third passage
        { x: 35, z: -62 }, { x: 25, z: -78 },
        // Third combat area
        { x: 5, z: -98 }, { x: -15, z: -112 },
        // Final passage to boss
        { x: -30, z: -145 }, { x: 30, z: -155 },
        // Boss arena decorations
        { x: -45, z: -200 }, { x: 45, z: -205 }, { x: -40, z: -230 }, { x: 40, z: -235 }
    ],
    
    // Rock positions (gem geodes) along the winding path
    rockPositions: [
        { x: 12, z: 182 }, { x: -15, z: 172 },
        { x: 28, z: 148 }, { x: 42, z: 132 },
        { x: 50, z: 105 }, { x: 58, z: 95 },
        { x: 20, z: 82 }, { x: -5, z: 68 },
        { x: -25, z: 52 }, { x: -30, z: 38 },
        { x: -38, z: 15 }, { x: -28, z: 2 },
        { x: -18, z: -20 }, { x: 8, z: -35 },
        { x: 28, z: -58 }, { x: 18, z: -72 },
        { x: 0, z: -95 }, { x: -10, z: -108 },
        { x: -25, z: -150 }, { x: 25, z: -160 },
        { x: 0, z: -215 }
    ],
    
    // Treasure position - end of boss arena
    treasurePosition: { x: 0, z: -270 },
    
    // Rainbow at end
    rainbow: { x: 0, z: -265 },
    
    // CRYSTAL DRAGON boss - in boss arena (further back)
    dragon: { x: 0, z: -235, scale: 1.0 },
    useReaper: false,
    extraDragons: [
        // Mini crystal dragons at combat areas
        { x: 50, z: 102, scale: 0.5, health: 25 },   // First combat area
        { x: 0, z: -35, scale: 0.5, health: 25 },    // Second combat area
        { x: -5, z: -105, scale: 0.5, health: 25 }   // Third combat area
    ],
    
    // World Kite position - near cave entrance  
    worldKite: { x: 5, z: 175 },

    // No iceberg in crystal cave
    iceBerg: null,
    
    // =========================================
    // CRYSTAL WALLS - Extended winding cave path with NO GAPS
    // Path: entrance -> curve right -> combat 1 -> curve left -> narrow -> curve right -> combat 2 -> curve left -> combat 3 -> boss
    // Format: { x, z, width, height }
    // =========================================
    mountains: [
        // === ENTRANCE CORRIDOR (z: 200 to 160) ===
        { x: -35, z: 195, width: 16, height: 28 },
        { x: -38, z: 185, width: 18, height: 30 },
        { x: -36, z: 175, width: 16, height: 28 },
        { x: -35, z: 165, width: 16, height: 28 },
        { x: 35, z: 195, width: 16, height: 28 },
        { x: 38, z: 185, width: 18, height: 30 },
        { x: 36, z: 175, width: 16, height: 28 },
        { x: 35, z: 165, width: 16, height: 28 },
        
        // === CURVE RIGHT (z: 160 to 120) ===
        { x: -32, z: 158, width: 18, height: 28 },
        { x: -28, z: 150, width: 20, height: 30 },
        { x: -20, z: 142, width: 22, height: 30 },
        { x: -12, z: 135, width: 24, height: 32 },
        { x: -5, z: 128, width: 24, height: 32 },
        { x: 40, z: 158, width: 16, height: 28 },
        { x: 46, z: 150, width: 18, height: 30 },
        { x: 52, z: 142, width: 18, height: 30 },
        { x: 58, z: 135, width: 20, height: 32 },
        { x: 64, z: 128, width: 20, height: 32 },
        
        // === FIRST COMBAT AREA (z: 120 to 90) ===
        { x: 2, z: 120, width: 22, height: 30 },
        { x: 6, z: 112, width: 22, height: 30 },
        { x: 10, z: 104, width: 20, height: 28 },
        { x: 14, z: 96, width: 18, height: 28 },
        { x: 68, z: 120, width: 18, height: 30 },
        { x: 70, z: 112, width: 20, height: 32 },
        { x: 72, z: 104, width: 20, height: 32 },
        { x: 72, z: 96, width: 18, height: 28 },
        
        // === CURVE LEFT (z: 90 to 55) ===
        { x: 12, z: 88, width: 20, height: 30 },
        { x: 6, z: 80, width: 22, height: 32 },
        { x: -2, z: 72, width: 24, height: 32 },
        { x: -12, z: 64, width: 24, height: 30 },
        { x: -20, z: 56, width: 22, height: 30 },
        { x: 66, z: 88, width: 22, height: 32 },
        { x: 58, z: 80, width: 26, height: 34 },
        { x: 48, z: 72, width: 28, height: 34 },
        { x: 36, z: 64, width: 28, height: 32 },
        { x: 24, z: 56, width: 26, height: 32 },
        
        // === NARROW PASSAGE (z: 55 to 25) ===
        { x: -32, z: 52, width: 18, height: 28 },
        { x: -36, z: 44, width: 18, height: 30 },
        { x: -40, z: 36, width: 18, height: 30 },
        { x: -42, z: 28, width: 16, height: 28 },
        { x: 10, z: 52, width: 22, height: 30 },
        { x: 4, z: 44, width: 24, height: 32 },
        { x: -2, z: 36, width: 24, height: 32 },
        { x: -8, z: 28, width: 22, height: 30 },
        
        // === CURVE RIGHT (z: 25 to -10) ===
        { x: -44, z: 20, width: 16, height: 28 },
        { x: -44, z: 12, width: 18, height: 30 },
        { x: -42, z: 4, width: 18, height: 30 },
        { x: -40, z: -4, width: 16, height: 28 },
        { x: -38, z: -12, width: 16, height: 28 },
        { x: -12, z: 20, width: 20, height: 28 },
        { x: -6, z: 12, width: 20, height: 30 },
        { x: 2, z: 4, width: 22, height: 30 },
        { x: 10, z: -4, width: 24, height: 32 },
        { x: 18, z: -12, width: 24, height: 32 },
        
        // === SECOND COMBAT AREA (z: -15 to -50) ===
        { x: -36, z: -20, width: 16, height: 28 },
        { x: -34, z: -28, width: 18, height: 30 },
        { x: -34, z: -36, width: 18, height: 30 },
        { x: -36, z: -44, width: 16, height: 28 },
        { x: 32, z: -20, width: 22, height: 30 },
        { x: 36, z: -28, width: 24, height: 32 },
        { x: 40, z: -36, width: 24, height: 32 },
        { x: 42, z: -44, width: 22, height: 30 },
        
        // === CURVE LEFT (z: -50 to -85) ===
        { x: -38, z: -52, width: 18, height: 30 },
        { x: -42, z: -60, width: 20, height: 32 },
        { x: -46, z: -68, width: 20, height: 32 },
        { x: -50, z: -76, width: 18, height: 30 },
        { x: -52, z: -84, width: 16, height: 28 },
        { x: 44, z: -52, width: 22, height: 30 },
        { x: 42, z: -60, width: 24, height: 32 },
        { x: 38, z: -68, width: 26, height: 34 },
        { x: 34, z: -76, width: 26, height: 32 },
        { x: 28, z: -84, width: 24, height: 30 },
        
        // === THIRD COMBAT AREA (z: -90 to -125) ===
        { x: -52, z: -92, width: 16, height: 28 },
        { x: -50, z: -100, width: 18, height: 30 },
        { x: -50, z: -108, width: 18, height: 30 },
        { x: -52, z: -116, width: 16, height: 28 },
        { x: 22, z: -92, width: 24, height: 30 },
        { x: 20, z: -100, width: 26, height: 32 },
        { x: 18, z: -108, width: 26, height: 32 },
        { x: 20, z: -116, width: 24, height: 30 },
        
        // === FINAL PASSAGE (z: -125 to -175) ===
        { x: -54, z: -124, width: 16, height: 28 },
        { x: -54, z: -136, width: 18, height: 30 },
        { x: -54, z: -148, width: 18, height: 30 },
        { x: -54, z: -160, width: 18, height: 30 },
        { x: -54, z: -172, width: 16, height: 28 },
        { x: 54, z: -124, width: 16, height: 28 },
        { x: 54, z: -136, width: 18, height: 30 },
        { x: 54, z: -148, width: 18, height: 30 },
        { x: 54, z: -160, width: 18, height: 30 },
        { x: 54, z: -172, width: 16, height: 28 },
        
        // === BOSS ARENA (z: -180 to -275) ===
        { x: -56, z: -182, width: 16, height: 28 },
        { x: -60, z: -195, width: 18, height: 30 },
        { x: -64, z: -210, width: 20, height: 32 },
        { x: -66, z: -225, width: 20, height: 32 },
        { x: -64, z: -240, width: 18, height: 30 },
        { x: -60, z: -255, width: 16, height: 28 },
        { x: -56, z: -268, width: 16, height: 28 },
        { x: 56, z: -182, width: 16, height: 28 },
        { x: 60, z: -195, width: 18, height: 30 },
        { x: 64, z: -210, width: 20, height: 32 },
        { x: 66, z: -225, width: 20, height: 32 },
        { x: 64, z: -240, width: 18, height: 30 },
        { x: 60, z: -255, width: 16, height: 28 },
        { x: 56, z: -268, width: 16, height: 28 },
        
        // === CAVE END WALLS ===
        { x: -35, z: -280, width: 30, height: 32 },
        { x: 0, z: -285, width: 40, height: 35 },
        { x: 35, z: -280, width: 30, height: 32 },
        
        // === OUTER BOUNDARY WALLS (thick continuous barriers) ===
        // Front wall
        { x: 0, z: 210, width: 220, height: 40 },
        // Left side outer walls
        { x: -80, z: 150, width: 40, height: 35 },
        { x: -85, z: 100, width: 45, height: 35 },
        { x: -90, z: 50, width: 50, height: 35 },
        { x: -85, z: 0, width: 45, height: 35 },
        { x: -80, z: -50, width: 40, height: 35 },
        { x: -85, z: -100, width: 45, height: 35 },
        { x: -90, z: -150, width: 50, height: 35 },
        { x: -90, z: -200, width: 50, height: 35 },
        { x: -85, z: -250, width: 45, height: 35 },
        // Right side outer walls
        { x: 100, z: 150, width: 45, height: 35 },
        { x: 105, z: 100, width: 50, height: 35 },
        { x: 110, z: 50, width: 55, height: 35 },
        { x: 105, z: 0, width: 50, height: 35 },
        { x: 100, z: -50, width: 45, height: 35 },
        { x: 95, z: -100, width: 40, height: 35 },
        { x: 90, z: -150, width: 40, height: 35 },
        { x: 90, z: -200, width: 40, height: 35 },
        { x: 85, z: -250, width: 40, height: 35 }
    ],
    
    // =========================================
    // CRYSTAL FORMATIONS - decorative elements
    // =========================================
    crystalFormations: [
        { x: -25, z: 165, type: 'cluster', colors: ['0xff4488', '0xaa44ff'], scale: 1.2 },
        { x: 25, z: 158, type: 'pillar', color: '0x44aaff', scale: 1.5 },
        { x: 45, z: 138, type: 'geode', color: '0x9944ff', scale: 1.0 },
        { x: 55, z: 108, type: 'cluster', colors: ['0x44ff88', '0x44aaff'], scale: 1.3 },
        { x: 22, z: 78, type: 'pillar', color: '0xff4488', scale: 1.8 },
        { x: -8, z: 65, type: 'cluster', colors: ['0xaa44ff', '0xff4488'], scale: 1.1 },
        { x: -28, z: 42, type: 'geode', color: '0x44aaff', scale: 1.4 },
        { x: -32, z: 12, type: 'pillar', color: '0x44ff88', scale: 1.6 },
        { x: 0, z: -28, type: 'cluster', colors: ['0xff4488', '0x44ff88', '0xaa44ff'], scale: 1.5 },
        { x: 32, z: -42, type: 'pillar', color: '0xaa44ff', scale: 2.0 },
        { x: -38, z: -65, type: 'geode', color: '0xff4488', scale: 1.2 },
        { x: 25, z: -78, type: 'cluster', colors: ['0x44aaff', '0xaa44ff'], scale: 1.4 },
        { x: -15, z: -105, type: 'pillar', color: '0x44ff88', scale: 1.7 },
        { x: 8, z: -118, type: 'cluster', colors: ['0xff4488', '0x44aaff', '0x44ff88'], scale: 1.3 },
        { x: -40, z: -155, type: 'geode', color: '0xaa44ff', scale: 1.5 },
        { x: 40, z: -165, type: 'pillar', color: '0xff4488', scale: 1.9 },
        { x: -35, z: -210, type: 'cluster', colors: ['0xccffff', '0x44aaff'], scale: 1.6 },
        { x: 35, z: -230, type: 'pillar', color: '0xccffff', scale: 2.0 }
    ],
    
    // =========================================
    // ENEMIES - Positioned IN the winding path corridors
    // =========================================
    
    // Crystal Golems (goblin variant) - patrol INSIDE the path
    // Path centers: entrance x=0, curve right x=30, combat1 x=40, curve left x=10, narrow x=-20, curve right x=-25, combat2 x=0, curve left x=-15, combat3 x=-15, boss x=0
    goblins: [
        // Entrance corridor (z: 195-165), path center x=0
        [8, 185, -15, 22, 0.014],
        [-12, 172, -25, 12, 0.015],
        // Curve right (z: 155-120), path shifts to center around x=25
        [18, 152, 5, 35, 0.014],
        [32, 138, 15, 48, 0.015],
        [42, 125, 25, 55, 0.014],
        // First combat area (z: 115-90), path center around x=40
        [35, 110, 20, 55, 0.016],
        [48, 100, 28, 60, 0.015],
        // Curve left (z: 85-55), path shifts to x=10
        [28, 80, 15, 45, 0.016],
        [12, 68, -5, 32, 0.015],
        [-5, 58, -15, 18, 0.016],
        // Narrow passage (z: 50-25), path center x=-18
        [-18, 45, -30, -5, 0.017],
        [-22, 32, -35, -8, 0.016],
        // Curve right (z: 20 to -5), path center x=-25
        [-28, 12, -38, -12, 0.017],
        [-25, 0, -35, -10, 0.016],
        // Second combat area (z: -15 to -45), path center x=0
        [-12, -18, -28, 18, 0.017],
        [8, -32, -18, 28, 0.016],
        [15, -42, -10, 32, 0.018],
        // Curve left (z: -55 to -82), path center x=-8
        [-5, -60, -25, 18, 0.017],
        [-15, -72, -35, 12, 0.016],
        // Third combat area (z: -90 to -120), path center x=-15
        [-18, -98, -38, 8, 0.018],
        [-8, -110, -32, 12, 0.017],
        [-15, -118, -38, 8, 0.018],
        // Final passage (z: -135 to -165)
        [-5, -145, -38, 38, 0.018],
        [5, -158, -35, 40, 0.017]
    ],
    
    // Gem Specters (guardian variant) - stationed along path edges
    guardians: [
        // First combat area edges
        [52, 112, 35, 62, 0.010],
        [45, 98, 30, 58, 0.011],
        // Curve left
        [18, 75, 0, 35, 0.010],
        [-8, 62, -18, 12, 0.011],
        // Narrow passage
        [-25, 40, -32, -12, 0.010],
        // Second combat area
        [-22, -25, -30, 5, 0.011],
        [22, -38, -5, 35, 0.012],
        // Third combat area
        [-28, -102, -42, 0, 0.011],
        [5, -115, -25, 15, 0.012],
        // Boss approach
        [-32, -148, -45, 0, 0.011],
        [32, -155, 0, 45, 0.012]
    ],
    
    // Crystal Giants - tanks in combat areas
    giants: [
        [42, 105, 25, 58],       // First combat area
        [-15, 42, -30, 0],       // Narrow passage entrance
        [5, -35, -25, 30],       // Second combat area
        [-12, -105, -35, 10],    // Third combat area
        [0, -200, -45, 45]       // Boss arena
    ],
    
    // No other enemy types in crystal cave
    wizards: [],
    mummies: [],
    lavaMonsters: [],
    skeletons: [],
    birds: [],
    
    // Hard mode extra golems
    hardModeGoblins: [
        [15, 188, -5, 28, 0.019],
        [22, 145, 8, 42, 0.018],
        [52, 108, 32, 62, 0.019],
        [8, 72, -10, 28, 0.018],
        [-25, 48, -32, -8, 0.019],
        [-32, 8, -40, -18, 0.018],
        [12, -28, -15, 30, 0.019],
        [-10, -68, -32, 15, 0.018],
        [-22, -108, -40, 5, 0.020],
        [0, -190, -38, 38, 0.019]
    ],
    
    // =========================================
    // GEM COLLECTIBLES - including diamond for infinite ammo
    // =========================================
    gemPositions: [
        // Entrance area - diamond for infinite ammo!
        { x: 0, z: 188, color: 'diamond' },
        { x: -18, z: 172, color: 'amethyst' },
        { x: 18, z: 165, color: 'ruby' },
        // Curve right area
        { x: 28, z: 148, color: 'sapphire' },
        { x: 42, z: 132, color: 'emerald' },
        // First combat area
        { x: 38, z: 108, color: 'ruby' },
        { x: 52, z: 98, color: 'diamond' },
        // Curve left
        { x: 18, z: 78, color: 'amethyst' },
        { x: -2, z: 65, color: 'sapphire' },
        // Narrow passage
        { x: -22, z: 48, color: 'emerald' },
        { x: -28, z: 35, color: 'ruby' },
        // Curve right
        { x: -32, z: 15, color: 'diamond' },
        { x: -28, z: 2, color: 'amethyst' },
        // Second combat area
        { x: -15, z: -22, color: 'sapphire' },
        { x: 12, z: -38, color: 'emerald' },
        { x: 25, z: -45, color: 'ruby' },
        // Curve left  
        { x: -8, z: -62, color: 'amethyst' },
        { x: -18, z: -75, color: 'diamond' },
        // Third combat area
        { x: -22, z: -98, color: 'sapphire' },
        { x: -8, z: -112, color: 'ruby' },
        { x: 5, z: -118, color: 'emerald' },
        // Final passage
        { x: -25, z: -148, color: 'diamond' },
        { x: 25, z: -158, color: 'amethyst' },
        // Boss arena
        { x: -35, z: -195, color: 'diamond' },
        { x: 35, z: -215, color: 'sapphire' },
        { x: 0, z: -240, color: 'ruby' }
    ],
    
    // =========================================
    // ITEM PICKUPS - More ammo and herzmen!
    // =========================================
    
    // Ammo scattered generously along path
    ammoPositions: [
        // Entrance
        { x: 12, z: 182 }, { x: -8, z: 175 }, { x: 5, z: 168 },
        // Curve right
        { x: 22, z: 155 }, { x: 35, z: 142 }, { x: 48, z: 128 },
        // First combat
        { x: 32, z: 115 }, { x: 48, z: 105 }, { x: 55, z: 95 },
        // Curve left
        { x: 22, z: 82 }, { x: 5, z: 72 }, { x: -8, z: 62 },
        // Narrow passage
        { x: -18, z: 52 }, { x: -25, z: 42 }, { x: -22, z: 32 },
        // Curve right
        { x: -32, z: 18 }, { x: -28, z: 8 }, { x: -22, z: -2 },
        // Second combat
        { x: -10, z: -18 }, { x: 8, z: -28 }, { x: 18, z: -42 },
        // Curve left
        { x: -5, z: -58 }, { x: -12, z: -72 },
        // Third combat
        { x: -18, z: -95 }, { x: -5, z: -108 }, { x: 2, z: -118 },
        // Final passage
        { x: -18, z: -142 }, { x: 0, z: -155 }, { x: 18, z: -168 },
        // Boss arena
        { x: -28, z: -195 }, { x: 28, z: -210 }, { x: 0, z: -235 }, { x: -22, z: -250 }, { x: 22, z: -260 }
    ],
    
    // Banana items at key points
    bananaPositions: [
        { x: -12, z: 178 }, { x: 38, z: 140 }, { x: 50, z: 102 },
        { x: 8, z: 75 }, { x: -28, z: 45 }, { x: -35, z: 10 },
        { x: 15, z: -35 }, { x: -12, z: -70 }, { x: -18, z: -108 },
        { x: 0, z: -150 }, { x: 0, z: -220 }
    ],
    
    // Bombs near tight spots
    bombPositions: [
        { x: 32, z: 148 }, { x: 48, z: 108 }, { x: -5, z: 68 },
        { x: -30, z: 38 }, { x: 18, z: -40 }, { x: -15, z: -75 },
        { x: -8, z: -115 }, { x: 0, z: -195 }, { x: 0, z: -245 }
    ],
    
    // Health along the path
    healthPositions: [
        { x: 5, z: 185 }, { x: 25, z: 158 }, { x: 45, z: 130 },
        { x: 42, z: 108 }, { x: 15, z: 78 }, { x: -12, z: 60 },
        { x: -25, z: 40 }, { x: -32, z: 12 }, { x: -20, z: -15 },
        { x: 12, z: -38 }, { x: -8, z: -65 }, { x: -18, z: -100 },
        { x: -5, z: -115 }, { x: -30, z: -150 }, { x: 30, z: -160 },
        { x: 0, z: -205 }, { x: -25, z: -235 }, { x: 25, z: -255 }
    ],
    
    // Herzman defenses - MORE at combat areas
    herzmanPositions: [
        { x: 0, z: 178 },
        { x: 35, z: 145 },
        { x: 45, z: 108 },
        { x: 10, z: 75 },
        { x: -25, z: 42 },
        { x: -30, z: 8 },
        { x: 0, z: -25 },
        { x: 20, z: -42 },
        { x: -10, z: -68 },
        { x: -15, z: -105 },
        { x: 0, z: -118 },
        { x: -20, z: -148 },
        { x: 20, z: -160 },
        { x: 0, z: -200 },
        { x: -30, z: -230 },
        { x: 30, z: -245 }
    ]
});
