// Level 16 - Farbwelt (Color World)
// Everything starts in grayscale. Collect paint buckets to color the world!

LEVEL_REGISTRY.register(16, {
    name: "Level 16 - Farbwelt",
    theme: 'color',

    // Player start position
    playerStart: { x: 0, z: 180 },

    // Portal back to Level 1
    portal: { x: 0, z: -200, destinationLevel: 1 },

    // Color theme flag
    colorTheme: true,
    skyColor: 0xB0B0B0,
    groundColor: 0x808080,
    fogDensity: 0.008,
    fogColor: 0xA0A0A0,

    hasRiver: false,
    hasMaterials: false,
    hasMountains: true,
    hasTreasure: true,

    // Grayscale terrain
    hillColor: 0x707070,
    treeColor: 0x606060,
    grassColor: 0x909090,

    // Treasure
    treasurePosition: { x: 0, z: -180 },
    rainbow: { x: 0, z: -175 },

    // Boss dragon (grayscale) - removed for easier cloud hunting
    dragon: null,
    extraDragons: [],

    // World Kite
    worldKite: { x: 5, z: 170 },

    // Hills (rolling gray landscape)
    hills: [
        { x: -60, z: 150, radius: 12, height: 5 },
        { x: 50, z: 130, radius: 10, height: 4 },
        { x: -30, z: 80, radius: 14, height: 6 },
        { x: 70, z: 60, radius: 9, height: 4 },
        { x: -70, z: 20, radius: 11, height: 5 },
        { x: 40, z: 0, radius: 13, height: 5 },
        { x: -50, z: -40, radius: 10, height: 4 },
        { x: 60, z: -60, radius: 12, height: 6 },
        { x: -40, z: -100, radius: 9, height: 4 },
        { x: 50, z: -120, radius: 11, height: 5 },
        { x: -60, z: -160, radius: 10, height: 4 },
        { x: 30, z: -170, radius: 8, height: 3 }
    ],

    // Mountains (gray walls bordering the arena)
    mountains: [
        { x: -110, z: 0, radius: 15, height: 30 },
        { x: 110, z: 0, radius: 15, height: 30 },
        { x: -100, z: -100, radius: 12, height: 25 },
        { x: 100, z: -100, radius: 12, height: 25 },
        { x: -90, z: 100, radius: 14, height: 28 },
        { x: 90, z: 100, radius: 14, height: 28 },
        { x: -80, z: -170, radius: 18, height: 35 },
        { x: 80, z: -170, radius: 18, height: 35 }
    ],

    // Paint bucket positions (the core mechanic!)
    // Each has a color that the player absorbs
    paintBucketPositions: [
        // Row 1 - near spawn (z ~140-180)
        { x: -40, z: 175, color: 0xFF0000 },   { x: 40, z: 175, color: 0x0066FF },
        { x: -70, z: 160, color: 0xFFFF00 },   { x: 0, z: 170, color: 0x00CC00 },
        { x: 70, z: 160, color: 0xFF00FF },     { x: -20, z: 150, color: 0xFF8800 },
        { x: 20, z: 145, color: 0x00CCCC },     { x: -90, z: 155, color: 0x8800FF },
        { x: 90, z: 150, color: 0xFF69B4 },     { x: 50, z: 140, color: 0xFF4400 },
        // Row 2 - upper mid (z ~100-135)
        { x: -50, z: 130, color: 0xFF0000 },   { x: 50, z: 125, color: 0x0066FF },
        { x: -80, z: 115, color: 0xFFFF00 },   { x: 0, z: 120, color: 0x00CC00 },
        { x: 80, z: 110, color: 0xFF00FF },     { x: -30, z: 105, color: 0xFF8800 },
        { x: 30, z: 100, color: 0x00CCCC },     { x: -60, z: 135, color: 0x44FF44 },
        { x: 60, z: 108, color: 0x8800FF },     { x: -95, z: 120, color: 0xFFFFFF },
        // Row 3 - center (z ~60-95)
        { x: -60, z: 90, color: 0xFF0000 },    { x: 60, z: 85, color: 0xFFFF00 },
        { x: -30, z: 75, color: 0x0066FF },    { x: 30, z: 70, color: 0x00CC00 },
        { x: -90, z: 80, color: 0xFF8800 },    { x: 90, z: 75, color: 0x00CCCC },
        { x: 0, z: 65, color: 0xFF69B4 },      { x: -70, z: 60, color: 0x8800FF },
        { x: 70, z: 62, color: 0xFF00FF },      { x: 40, z: 95, color: 0x44FF44 },
        // Row 4 - lower center (z ~20-55)
        { x: -40, z: 50, color: 0xFF0000 },    { x: 40, z: 45, color: 0x0066FF },
        { x: -70, z: 35, color: 0xFFFF00 },    { x: 70, z: 30, color: 0x00CC00 },
        { x: 0, z: 40, color: 0xFF8800 },      { x: -20, z: 25, color: 0x00CCCC },
        { x: 20, z: 20, color: 0xFF00FF },      { x: -90, z: 45, color: 0xFF4400 },
        { x: 90, z: 40, color: 0x8800FF },      { x: -50, z: 55, color: 0xFFFFFF },
        // Row 5 - negative zone (z ~-20 to 15)
        { x: -60, z: 10, color: 0xFF0000 },    { x: 60, z: 5, color: 0xFFFF00 },
        { x: -30, z: -5, color: 0x0066FF },    { x: 30, z: -10, color: 0x00CC00 },
        { x: 0, z: 0, color: 0xFF69B4 },       { x: -80, z: -15, color: 0xFF8800 },
        { x: 80, z: -10, color: 0x00CCCC },     { x: -45, z: 15, color: 0x44FF44 },
        { x: 50, z: -20, color: 0xFF00FF },     { x: -95, z: 5, color: 0x8800FF },
        // Row 6 - lower area (z ~-55 to -25)
        { x: -40, z: -30, color: 0xFF0000 },   { x: 40, z: -35, color: 0x0066FF },
        { x: -70, z: -45, color: 0xFFFF00 },   { x: 70, z: -40, color: 0x00CC00 },
        { x: 0, z: -50, color: 0xFF8800 },     { x: -20, z: -55, color: 0xFF00FF },
        { x: 20, z: -25, color: 0x00CCCC },     { x: -90, z: -35, color: 0xFF4400 },
        { x: 90, z: -50, color: 0x8800FF },     { x: 50, z: -55, color: 0xFFFFFF },
        // Row 7 - near boss (z ~-90 to -60)
        { x: -50, z: -65, color: 0xFF0000 },   { x: 50, z: -70, color: 0xFFFF00 },
        { x: -30, z: -80, color: 0x0066FF },   { x: 30, z: -85, color: 0x00CC00 },
        { x: -70, z: -90, color: 0xFF8800 },   { x: 70, z: -75, color: 0x00CCCC },
        { x: 0, z: -75, color: 0xFF00FF },      { x: -80, z: -60, color: 0x44FF44 },
        // Row 8 - boss area (z ~-110 to -140)
        { x: -60, z: -110, color: 0xFF0000 },  { x: 60, z: -115, color: 0x0066FF },
        { x: -30, z: -125, color: 0xFFFF00 },  { x: 30, z: -130, color: 0x00CC00 },
        { x: 0, z: -120, color: 0xFF8800 },    { x: -80, z: -135, color: 0xFF00FF },
        { x: 80, z: -140, color: 0x8800FF },    { x: -50, z: -140, color: 0xFF69B4 },
        // Row 9 - deep boss / treasure (z ~-150 to -175)
        { x: -70, z: -150, color: 0xFF0000 },  { x: 70, z: -150, color: 0xFFFF00 },
        { x: -30, z: -160, color: 0x0066FF },  { x: 30, z: -155, color: 0x00CC00 },
        { x: 0, z: -170, color: 0xFFFFFF },    { x: -50, z: -165, color: 0xFF00FF },
        { x: 50, z: -170, color: 0x00CCCC },    { x: -90, z: -155, color: 0xFF4400 },
    ],

    // Happy cloud positions - clouds that need to be painted to unlock treasure
    happyCloudPositions: [
        { x: -60, z: 120 },
        { x: 40, z: 100 },
        { x: -30, z: 50 },
        { x: 50, z: 30 },
        { x: 0, z: -20 },
        { x: -70, z: -60 },
        { x: 60, z: -90 },
        { x: -20, z: -130 },
    ],

    // Happy cloud positions - clouds that need to be painted to unlock treasure
    happyCloudPositions: [
        { x: -60, z: 120 },
        { x: 40, z: 100 },
        { x: -30, z: 50 },
        { x: 50, z: 30 },
        { x: 0, z: -20 },
        { x: -70, z: -60 },
        { x: 60, z: -90 },
        { x: -20, z: -130 },
    ],

    // Goblins - standard patrols (all will appear grayscale)
    goblins: [
        // Near spawn area
        [-30, 160, -50, -10, 0.02],
        [30, 150, 10, 50, 0.02],
        [-20, 130, -40, 0, 0.025],
        [40, 120, 20, 60, 0.02],
        [-50, 100, -70, -30, 0.02],
        [60, 90, 40, 80, 0.025],
        // Mid area
        [-40, 50, -60, -20, 0.02],
        [30, 40, 10, 50, 0.025],
        [-60, 10, -80, -40, 0.02],
        [50, 0, 30, 70, 0.02],
        [-30, -20, -50, -10, 0.025],
        [40, -40, 20, 60, 0.02],
        // Near boss
        [-50, -70, -70, -30, 0.02],
        [50, -80, 30, 70, 0.025],
        [-30, -100, -50, -10, 0.02],
        [30, -110, 10, 50, 0.02],
        [-20, -130, -40, 0, 0.025],
        [20, -140, 0, 40, 0.02],
        // Flanking groups
        [-80, 70, -95, -65, 0.02],
        [80, 50, 65, 95, 0.02],
        [-75, -30, -90, -60, 0.025],
        [75, -50, 60, 90, 0.02],
        // Extra patrols
        [0, 70, -20, 20, 0.02],
        [0, -30, -20, 20, 0.025],
        [-45, -60, -65, -25, 0.02],
        [45, -70, 25, 65, 0.02],
    ],

    // Guardians (ranged attackers)
    guardians: [
        [-60, 80, -80, -40, 0.015],
        [60, 60, 40, 80, 0.015],
        [-50, -20, -70, -30, 0.015],
        [50, -40, 30, 70, 0.015],
        [-40, -100, -60, -20, 0.015],
        [40, -110, 20, 60, 0.015],
        [0, -60, -20, 20, 0.015],
        [-70, 140, -85, -55, 0.015],
    ],

    // Giants [x, z, patrolLeft, patrolRight]
    giants: [
        [-50, 30, -70, -30],
        [50, -30, 30, 70],
        [0, -90, -20, 20],
    ],

    // Wizards [x, z, patrolLeft, patrolRight, speed]
    wizards: [
        [-40, 70, -60, -20, 0.015],
        [40, -10, 20, 60, 0.015],
        [-30, -70, -50, -10, 0.015],
        [0, -120, -20, 20, 0.015],
    ],

    // Hard mode extra goblins [x, z, patrolLeft, patrolRight, speed]
    hardModeGoblins: [
        [-60, 140, -80, -40, 0.02],
        [60, 120, 40, 80, 0.02],
        [-40, 40, -60, -20, 0.025],
        [40, 20, 20, 60, 0.02],
        [-30, -40, -50, -10, 0.025],
        [30, -60, 10, 50, 0.02],
    ],

    // Birds [centerX, centerZ, radius, speed]
    birds: [
        [-40, 100, 25, 0.02],
        [40, 0, 30, 0.015],
        [0, -80, 20, 0.02],
    ],

    // Item positions
    ammoPositions: [
        { x: -20, z: 170 }, { x: 20, z: 160 },
        { x: -50, z: 90 }, { x: 60, z: 70 },
        { x: -40, z: -10 }, { x: 40, z: -30 },
        { x: -30, z: -80 }, { x: 30, z: -100 },
        { x: 0, z: -150 }, { x: -60, z: -120 },
    ],

    healthPositions: [
        // Spawn area
        { x: 0, z: 140 },
        { x: -60, z: 165 },
        { x: 60, z: 155 },
        // Upper mid area
        { x: -60, z: 40 },
        { x: 0, z: 90 },
        { x: 60, z: 95 },
        // Center area
        { x: -70, z: 65 },
        { x: 70, z: 55 },
        { x: 0, z: 70 },
        // Lower mid area
        { x: 60, z: -20 },
        { x: -50, z: 15 },
        { x: 0, z: -5 },
        // Lower area
        { x: 0, z: -100 },
        { x: -60, z: -75 },
        { x: 60, z: -85 },
        // Boss/treasure approach
        { x: -50, z: -150 },
        { x: 50, z: -145 },
        { x: 0, z: -165 },
    ],

    bombPositions: [
        { x: 30, z: 80 },
        { x: -30, z: -40 },
        { x: 0, z: -130 },
    ],

    bananaPositions: [
        { x: -40, z: 110 },
        { x: 40, z: 10 },
    ],

    herzmanPositions: [
        { x: 50, z: 100 },
        { x: -50, z: -60 },
    ],

    // Tree positions (will be grayscale)
    treePositions: [
        { x: -30, z: 170 }, { x: 40, z: 160 },
        { x: -70, z: 130 }, { x: 70, z: 110 },
        { x: -50, z: 70 }, { x: 55, z: 50 },
        { x: -65, z: -10 }, { x: 65, z: -20 },
        { x: -45, z: -60 }, { x: 55, z: -70 },
        { x: -35, z: -120 }, { x: 45, z: -130 },
        { x: -20, z: 40 }, { x: 25, z: -5 },
        { x: -55, z: 120 }, { x: 60, z: 140 },
        { x: -80, z: 50 }, { x: 80, z: 30 },
        { x: -70, z: -80 }, { x: 70, z: -90 },
    ],

    // Rock positions
    rockPositions: [
        { x: -25, z: 145 }, { x: 35, z: 135 },
        { x: -55, z: 55 }, { x: 50, z: 35 },
        { x: -35, z: -35 }, { x: 45, z: -55 },
        { x: -25, z: -115 }, { x: 35, z: -135 },
        { x: -80, z: 90 }, { x: 80, z: 70 },
        { x: -75, z: -50 }, { x: 75, z: -60 },
    ],
});
