// Level 17 – Das Horrorlevel
// Dark, bloody, full of unspeakable monsters and swords

LEVEL_REGISTRY.register(17, {
    name: 'Level 17 - Das Horrorlevel',
    theme: 'horror',
    horrorTheme: true,

    // ---- Atmosphere ----
    skyColor:   0x1a0005,
    fogColor:   0x2d0008,
    fogDensity: 0.020,

    groundColor: 0x1a0000,
    hillColor:   0x2a0505,
    grassColor:  0x150000,
    treeColor:   0x1a0000,

    // ---- World layout ----
    worldKite: { x: -20, z: 130 },

    playerStart:   { x: 0,  z: 170 },
    treasurePosition: { x: 0, z: -220 },

    portal: {
        x: 0, z: -240,
        targetLevel: 1
    },

    // ---- Dragons & Special Entities ----
    dragon: {
        x: 0, z: -200,
        health: 10
    },

    // Giant floating eye in the sky (always watches the player)
    giantEye: {
        x: 0,
        z: 0,
        y: 12,           // Higher up in the sky
        radius: 6,       // Smaller - better fit for the view
        orbitRadius: 60, // Much farther away
        orbitSpeed: 0.00045, // Same speed
        eyeColor: 0xff0000,    // Blood red
        irisColor: 0xffff00,   // Yellow iris
        pupilColor: 0x000000
    },

    extraDragons: [
        { x: -30, z: -160, health: 6 },
        { x:  30, z: -160, health: 6 }
    ],

    // ---- Rainbow (finishing arc) ----
    rainbow: { x: 0, z: -235, scale: 1.2 },

    // ---- Mountains – jagged dark spires forming walls and chokepoints ----
    mountains: [
        // === LEFT border wall ===
        { x: -130, z:  200, width: 60, height: 32 },
        { x: -130, z:  160, width: 60, height: 32 },
        { x: -130, z:  120, width: 60, height: 32 },
        { x: -130, z:   80, width: 60, height: 32 },
        { x: -130, z:   40, width: 60, height: 32 },
        { x: -130, z:    0, width: 60, height: 32 },
        { x: -130, z:  -40, width: 60, height: 32 },
        { x: -130, z:  -80, width: 60, height: 32 },
        { x: -130, z: -120, width: 60, height: 32 },
        { x: -130, z: -160, width: 60, height: 32 },
        { x: -130, z: -200, width: 60, height: 32 },
        { x: -130, z: -240, width: 60, height: 32 },
        // === RIGHT border wall ===
        { x:  130, z:  200, width: 60, height: 32 },
        { x:  130, z:  160, width: 60, height: 32 },
        { x:  130, z:  120, width: 60, height: 32 },
        { x:  130, z:   80, width: 60, height: 32 },
        { x:  130, z:   40, width: 60, height: 32 },
        { x:  130, z:    0, width: 60, height: 32 },
        { x:  130, z:  -40, width: 60, height: 32 },
        { x:  130, z:  -80, width: 60, height: 32 },
        { x:  130, z: -120, width: 60, height: 32 },
        { x:  130, z: -160, width: 60, height: 32 },
        { x:  130, z: -200, width: 60, height: 32 },
        { x:  130, z: -240, width: 60, height: 32 },
        // === First chokepoint at z=-90 (narrow gap ±20 in center) ===
        { x: -115, z: -90, width: 50, height: 30 },
        { x:  -75, z: -90, width: 50, height: 30 },
        { x:  -40, z: -90, width: 40, height: 30 },
        { x:   40, z: -90, width: 40, height: 30 },
        { x:   75, z: -90, width: 50, height: 30 },
        { x:  115, z: -90, width: 50, height: 30 },
        // === Second chokepoint at z=-180 (narrow gap ±20 in center) ===
        { x: -115, z: -180, width: 50, height: 30 },
        { x:  -75, z: -180, width: 50, height: 30 },
        { x:  -40, z: -180, width: 40, height: 30 },
        { x:   40, z: -180, width: 40, height: 30 },
        { x:   75, z: -180, width: 50, height: 30 },
        { x:  115, z: -180, width: 50, height: 30 },
        // === Far-north back wall (behind boss/treasure at z=-220) ===
        { x: -120, z: -265, width: 80, height: 35 },
        { x:  -60, z: -265, width: 80, height: 35 },
        { x:    0, z: -265, width: 80, height: 35 },
        { x:   60, z: -265, width: 80, height: 35 },
        { x:  120, z: -265, width: 80, height: 35 },
        { x: -100, z: -255, width: 60, height: 30 },
        { x:  -30, z: -255, width: 60, height: 30 },
        { x:   30, z: -255, width: 60, height: 30 },
        { x:  100, z: -255, width: 60, height: 30 }
    ],

    // ---- Sword / skull decorations (as "tree" positions, rendered by horror theme branch) ----
    treePositions: [
        // Near start
        { x: -15, z: 145 }, { x:  15, z: 148 }, { x:  -5, z: 138 }, { x:  8, z: 152 },
        { x: -25, z: 130 }, { x:  25, z: 135 }, { x: -30, z: 120 }, { x: 30, z: 125 },
        // Mid section
        { x: -20, z:  90 }, { x:  20, z:  95 }, { x:  -8, z:  78 }, { x:  12, z:  70 },
        { x: -35, z:  55 }, { x:  35, z:  50 }, { x:  -2, z:  62 }, { x: -18, z:  40 },
        { x:  22, z:  35 }, { x: -28, z:  20 }, { x:  28, z:  18 }, { x:   5, z:  28 },
        // Dense mid-field
        { x: -12, z:  -5 }, { x:  12, z: -10 }, { x:  -5, z: -22 }, { x:  18, z: -15 },
        { x: -22, z: -30 }, { x:  25, z: -25 }, { x:  -8, z: -48 }, { x:   8, z: -55 },
        { x: -30, z: -60 }, { x:  30, z: -65 }, { x:   0, z: -72 }, { x: -16, z: -85 },
        // Boss approach
        { x:  16, z: -90 }, { x: -24, z:-105 }, { x:  24, z:-110 }, { x:   0, z:-118 },
        { x: -12, z:-130 }, { x:  12, z:-135 }, { x: -20, z:-148 }, { x:  20, z:-152 }
    ],

    // ---- Blood pools / blade stumps (as "rock" positions) ----
    rockPositions: [
        { x: -10, z: 155 }, { x:  10, z: 160 }, { x: -20, z: 115 }, { x:  20, z: 110 },
        { x:  -5, z:  60 }, { x:   5, z:  55 }, { x: -15, z:  -8 }, { x:  15, z: -12 },
        { x:  -8, z: -70 }, { x:   8, z: -75 }, { x: -18, z:-120 }, { x:  18, z:-125 },
        { x:   0, z:  99 }, { x: -28, z:  42 }, { x:  28, z:  38 }, { x:  -3, z: -38 }
    ],

    // ---- Enemy goblin spawn points [x, z, patrolLeft, patrolRight, speed] ----
    goblins: [
        // Near start
        [-18, 120, -30,  -6, 0.020], [ 18, 118,   6, 30, 0.020],
        [-10, 100, -22,   2, 0.020], [ 10, 105,  -2, 22, 0.020],
        [-25,  85, -37, -13, 0.020], [ 25,  88,  13, 37, 0.020],
        // Mid section
        [ -8,  65, -20,   4, 0.020], [  8,  60,  -4, 20, 0.020],
        [-20,  45, -32,  -8, 0.020], [ 20,  43,   8, 32, 0.020],
        [ -5,  25, -17,   7, 0.020], [ 12,  20,   0, 24, 0.020],
        [-15,   5, -27,  -3, 0.020], [ 18,   0,   6, 30, 0.020],
        // Dense mid-field
        [ -8, -20, -20,   4, 0.020], [  8, -25,  -4, 20, 0.020],
        [-22, -40, -34, -10, 0.020], [ 22, -42,  10, 34, 0.020],
        [ -5, -58, -17,   7, 0.020], [ 10, -62,  -2, 22, 0.020],
        [-18, -78, -30,  -6, 0.020], [ 18, -80,   6, 30, 0.020],
        // Boss approach
        [ -8,-100, -20,   4, 0.020], [  8,-105,  -4, 20, 0.020],
        [-20,-125, -32,  -8, 0.020], [ 20,-128,   8, 32, 0.020],
        [ -5,-145, -17,   7, 0.020], [ 12,-150,   0, 24, 0.020]
    ],

    // ---- Ammo pickups scattered along the path ----
    ammoPositions: [
        { x: -15, z: 130 }, { x:  15, z: 125 },
        { x:  -8, z:  72 }, { x:   8, z:  68 },
        { x: -12, z:   0 }, { x:  12, z:  -5 },
        { x:  -6, z: -68 }, { x:   6, z: -72 },
        { x: -10, z:-120 }, { x:  10, z:-125 }
    ],

    // ---- Health pickups ----
    healthPositions: [
        // Spawn area
        { x: -20, z: 150 }, { x:  20, z: 145 },
        { x: -20, z: 100 }, { x:  20, z:  95 },
        // Mid area
        { x: -25, z:  80 }, { x:  25, z:  75 },
        { x:  -5, z:  30 }, { x:   5, z:  25 },
        { x: -18, z:  10 }, { x:  18, z:   5 },
        // Lower area
        { x: -10, z: -50 }, { x:  10, z: -55 },
        { x: -22, z: -35 }, { x:  22, z: -40 },
        { x:  -8, z: -80 }, { x:   8, z: -85 },
        // Boss approach
        { x: -15, z:-100 }, { x:  15, z:-105 },
        { x:  -8, z:-110 }, { x:   8, z:-115 },
        { x: -12, z:-135 }, { x:  12, z:-140 }
    ],

    // ---- Wizards in normal area ----
    wizards: [
        [-25, 100, -45, -5, 0.015],
        [ 25,  95,   5, 45, 0.015],
        [ -8,  50, -28, 28, 0.015],
        [  0,  15, -20, 20, 0.015],
        [-20, -20, -40,  0, 0.015],
        [ 20, -30,   0, 40, 0.015]
    ],

    // ---- Wizards in normal area ----
    wizards: [
        [-25, 100, -45, -5, 0.015],
        [ 25,  95,   5, 45, 0.015],
        [ -8,  50, -28, 28, 0.015],
        [  0,  15, -20, 20, 0.015],
        [-20, -20, -40,  0, 0.015],
        [ 20, -30,   0, 40, 0.015]
    ],

    // ---- Bomb pickups ----
    bombPositions: [
        { x: -18, z:  80 },
        { x:  18, z: -20 },
        { x:  -8, z: -95 }
    ],

    // ---- Hills – dark mounds of dead earth ----
    hills: [
        // Near start
        { x: -25, z: 155, radius: 8,  height: 4   },
        { x:  28, z: 148, radius: 7,  height: 3.5 },
        { x: -40, z: 130, radius: 9,  height: 4.5 },
        { x:  38, z: 125, radius: 8,  height: 4   },
        { x:  -8, z: 112, radius: 6,  height: 3   },
        // Mid section
        { x: -30, z:  90, radius: 8,  height: 4   },
        { x:  32, z:  85, radius: 7,  height: 3.5 },
        { x: -18, z:  65, radius: 9,  height: 4.5 },
        { x:  22, z:  60, radius: 8,  height: 4   },
        { x:  -5, z:  45, radius: 6,  height: 3   },
        { x: -35, z:  30, radius: 8,  height: 4   },
        { x:  35, z:  25, radius: 7,  height: 3.5 },
        { x: -12, z:   5, radius: 7,  height: 3.5 },
        { x:  15, z:   0, radius: 6,  height: 3   },
        // Back section
        { x: -28, z: -20, radius: 8,  height: 4   },
        { x:  28, z: -25, radius: 7,  height: 3.5 },
        { x:  -8, z: -45, radius: 9,  height: 4.5 },
        { x:  10, z: -50, radius: 8,  height: 4   },
        { x: -22, z: -70, radius: 7,  height: 3.5 },
        { x:  25, z: -75, radius: 8,  height: 4   },
        // Boss approach
        { x: -15, z:-100, radius: 7,  height: 3.5 },
        { x:  18, z:-108, radius: 8,  height: 4   },
        { x:  -5, z:-130, radius: 6,  height: 3   },
        { x:  12, z:-140, radius: 8,  height: 4   },
        // Boss arena surrounds
        { x: -30, z:-175, radius: 9,  height: 4.5 },
        { x:  30, z:-178, radius: 9,  height: 4.5 },
        { x: -20, z:-205, radius: 8,  height: 4   },
        { x:  22, z:-210, radius: 8,  height: 4   },
        { x:  -8, z:-225, radius: 7,  height: 3.5 },
        { x:   8, z:-232, radius: 7,  height: 3.5 }
    ],

    // ---- Guardians (always spawned, both difficulties) ----
    guardians: [
        [-30, 120, -55, -5, 0.020],
        [ 30, 115,   5, 55, 0.020],
        [  0,  -5, -30, 30, 0.022],
        [-25,-100, -50,  0, 0.022],
        [ 25,-105,   0, 50, 0.022]
    ],

    // ---- Giants (hard mode only) ----
    giants: [
        [-20, 80, -45, 45],
        [ 20,-60, -40, 40]
    ],

    // ---- Birds / ravens (hard mode only) [x, z, y, speed] ----
    birds: [
        [-35, 110, 22, 0.018],
        [ 35,  10, 28, 0.015],
        [  0, -90, 20, 0.02 ]
    ],

    // ---- Hard mode extra goblins [x, z, patrolLeft, patrolRight, speed] ----
    hardModeGoblins: [
        [-25, 135, -45, -5, 0.022],
        [ 25, 125,   5, 45, 0.022],
        [-20,  55, -40,  0, 0.025],
        [ 20,  45,   0, 40, 0.025],
        [-15, -30, -35,  5, 0.025],
        [ 15, -40,  -5, 35, 0.025]
    ]
});
