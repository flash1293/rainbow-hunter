// Level 9 - System Core
// Computer/cyberspace theme - inside a computer with firewall gates, lag events, and buffer overflow zones

LEVEL_REGISTRY.register(9, {
    name: "Level 9 - System Core",
    theme: 'computer',
    
    // Player start position - Login Terminal (safe spawn)
    playerStart: { x: 0, z: 180 },
    
    // Portal loops back to Level 1 (game complete!)
    portal: { x: 0, z: -220, destinationLevel: 1 },
    
    // Unique elements for computer level
    computerTheme: true,
    skyColor: 0x000000,          // Pure black void
    groundColor: 0x000808,       // Very dark teal-black
    fogDensity: 0.006,           // Light fog to see grid lines far
    fogColor: 0x000808,          // Near-black fog
    
    // No traditional river - has data streams instead
    hasRiver: false,
    hasDataStreams: true,
    hasMaterials: false,
    
    // Has mountains (server towers/firewall barriers)
    hasMountains: true,
    
    // Theme colors for computer level
    hillColor: 0x1A1A2E,         // Dark chrome data nodes
    treeColor: 0x00AAFF,         // Electric blue server towers
    grassColor: 0x004400,        // Dark circuit green
    
    // Level 9 has treasure (the Core Data)
    hasTreasure: true,
    
    // Treasure position - in the Virus Core
    treasurePosition: { x: 0, z: -200 },
    
    // Rainbow position - above the core
    rainbow: { x: 0, z: -195 },
    
    // TROJAN DRAGON boss - corrupted data beast
    dragon: { x: 0, z: -180, scale: 0.9 },
    useReaper: false,
    extraDragons: [
        // Mini trojan dragons guarding network nodes
        { x: -60, z: -100, scale: 0.45, health: 25 },
        { x: 60, z: -100, scale: 0.45, health: 25 }
    ],
    
    // World Kite position - Login Terminal beacon
    worldKite: { x: 5, z: 175 },

    // No iceberg in digital world
    iceBerg: null,
    
    // =========================================
    // FIREWALL GATES - energy barriers that cycle on/off
    // Synced with lag events - gates go OFF during lag
    // Format: { x, z, width, rotation, cycleOffset }
    // =========================================
    firewallGates: [
        // Entry network gates
        { x: 0, z: 140, width: 30, rotation: 0, cycleOffset: 0 },
        { x: -40, z: 100, width: 25, rotation: 0.3, cycleOffset: 2000 },
        { x: 40, z: 100, width: 25, rotation: -0.3, cycleOffset: 4000 },
        // Mid-network maze gates
        { x: -60, z: 50, width: 20, rotation: 0.5, cycleOffset: 1000 },
        { x: 60, z: 50, width: 20, rotation: -0.5, cycleOffset: 3000 },
        { x: 0, z: 30, width: 35, rotation: 0, cycleOffset: 5000 },
        { x: -30, z: -20, width: 22, rotation: 0.2, cycleOffset: 2500 },
        { x: 30, z: -20, width: 22, rotation: -0.2, cycleOffset: 4500 },
        // Deep network gates
        { x: 0, z: -60, width: 30, rotation: 0, cycleOffset: 1500 },
        { x: -50, z: -90, width: 25, rotation: 0.4, cycleOffset: 3500 },
        { x: 50, z: -90, width: 25, rotation: -0.4, cycleOffset: 500 },
        // Boss arena entrance
        { x: 0, z: -130, width: 40, rotation: 0, cycleOffset: 0 }
    ],
    
    // =========================================
    // BUFFER OVERFLOW ZONES - expanding damage areas
    // Start small, grow over time, then reset
    // Format: { x, z, minRadius, maxRadius, growthRate, damage }
    // =========================================
    bufferOverflowZones: [
        // Near spawn - warning zones
        { x: -60, z: 160, minRadius: 2, maxRadius: 12, growthRate: 0.01, damage: 1 },
        { x: 70, z: 150, minRadius: 2, maxRadius: 10, growthRate: 0.012, damage: 1 },
        // Mid area - moderate threats
        { x: -45, z: 70, minRadius: 3, maxRadius: 15, growthRate: 0.015, damage: 2 },
        { x: 50, z: 40, minRadius: 3, maxRadius: 14, growthRate: 0.013, damage: 2 },
        { x: 0, z: 0, minRadius: 4, maxRadius: 18, growthRate: 0.008, damage: 2 },
        // Deep network - dangerous
        { x: -55, z: -50, minRadius: 3, maxRadius: 16, growthRate: 0.018, damage: 3 },
        { x: 60, z: -70, minRadius: 4, maxRadius: 17, growthRate: 0.016, damage: 3 },
        // Near boss - critical buffers
        { x: -40, z: -140, minRadius: 5, maxRadius: 20, growthRate: 0.02, damage: 4 },
        { x: 45, z: -150, minRadius: 5, maxRadius: 20, growthRate: 0.02, damage: 4 }
    ],
    
    // =========================================
    // DATA STREAMS - flowing rivers of light that push players
    // Format: { x, z, width, length, rotation, flowDirection, flowStrength }
    // =========================================
    dataStreams: [
        // Horizontal data highways
        { x: 0, z: 120, width: 8, length: 80, rotation: Math.PI/2, flowDirection: 1, flowStrength: 0.08 },
        { x: 0, z: 60, width: 6, length: 60, rotation: Math.PI/2, flowDirection: -1, flowStrength: 0.06 },
        { x: 0, z: -40, width: 8, length: 70, rotation: Math.PI/2, flowDirection: 1, flowStrength: 0.07 },
        // Vertical data channels
        { x: -70, z: 80, width: 5, length: 60, rotation: 0, flowDirection: -1, flowStrength: 0.05 },
        { x: 75, z: 50, width: 5, length: 50, rotation: 0, flowDirection: 1, flowStrength: 0.05 },
        // Diagonal streams near boss
        { x: -40, z: -110, width: 6, length: 40, rotation: 0.5, flowDirection: -1, flowStrength: 0.09 },
        { x: 45, z: -120, width: 6, length: 40, rotation: -0.5, flowDirection: 1, flowStrength: 0.09 }
    ],

    // =========================================
    // SQUEEZING WALL ZONES - walls that compress passageways
    // Format: { x, z, maxWidth, minGap, wallHeight, wallDepth }
    // =========================================
    squeezingWallZones: [
        // Early warning zones - easier
        { x: 0, z: 140, maxWidth: 35, minGap: 8, wallHeight: 12, wallDepth: 15 },
        { x: 25, z: 90, maxWidth: 30, minGap: 7, wallHeight: 14, wallDepth: 12 },
        // Mid level - tighter gaps
        { x: -30, z: 45, maxWidth: 32, minGap: 6, wallHeight: 15, wallDepth: 14 },
        { x: 35, z: 0, maxWidth: 34, minGap: 5, wallHeight: 16, wallDepth: 16 },
        // Deep network - dangerous
        { x: -25, z: -60, maxWidth: 36, minGap: 4, wallHeight: 18, wallDepth: 15 },
        { x: 20, z: -100, maxWidth: 38, minGap: 4, wallHeight: 20, wallDepth: 18 }
    ],

    // Data node hills (processor chips)
    hills: [
        // Near spawn - low processing nodes
        { x: -50, z: 170, radius: 7, height: 3 },
        { x: 55, z: 165, radius: 8, height: 3.5 },
        { x: -35, z: 130, radius: 6, height: 2.5 },
        { x: 40, z: 125, radius: 7, height: 3 },
        // Mid network
        { x: -65, z: 85, radius: 8, height: 4 },
        { x: 70, z: 75, radius: 7, height: 3.5 },
        { x: -55, z: 35, radius: 6, height: 3 },
        { x: 60, z: 25, radius: 8, height: 4 },
        // Deep network
        { x: -60, z: -30, radius: 7, height: 3.5 },
        { x: 65, z: -45, radius: 6, height: 3 },
        { x: -50, z: -80, radius: 8, height: 4 },
        { x: 55, z: -95, radius: 7, height: 3.5 }
    ],
    
    // Server tower walls - network boundaries
    mountains: [
        // Outer perimeter - server racks creating the boundary
        { x: 0, z: 220, width: 250, height: 15 },
        { x: 0, z: -250, width: 250, height: 15 },
        { x: -125, z: 0, width: 10, height: 15 },
        { x: 125, z: 0, width: 10, height: 15 },
        // Corner server clusters
        { x: -115, z: 200, width: 30, height: 20 },
        { x: 115, z: 200, width: 30, height: 20 },
        { x: -115, z: -220, width: 30, height: 20 },
        { x: 115, z: -220, width: 30, height: 20 },
        // Mid-level server nodes
        { x: -115, z: 100, width: 20, height: 18 },
        { x: 115, z: 100, width: 20, height: 18 },
        { x: -115, z: -50, width: 20, height: 18 },
        { x: 115, z: -50, width: 20, height: 18 }
    ],
    
    // Background processor towers (decorative mountains)
    naturalMountains: [
        // North - server farm backdrop
        { x: -100, z: 270, radius: 28, height: 40 },
        { x: -40, z: 280, radius: 32, height: 50 },
        { x: 30, z: 275, radius: 30, height: 45 },
        { x: 95, z: 268, radius: 28, height: 42 },
        // South - mainframe complex
        { x: -90, z: -290, radius: 30, height: 48 },
        { x: -30, z: -295, radius: 35, height: 55 },
        { x: 40, z: -288, radius: 32, height: 50 },
        { x: 100, z: -285, radius: 28, height: 44 },
        // West - data center range
        { x: -170, z: 180, radius: 26, height: 38 },
        { x: -175, z: 100, radius: 30, height: 46 },
        { x: -168, z: 20, radius: 28, height: 42 },
        { x: -172, z: -60, radius: 32, height: 50 },
        { x: -165, z: -140, radius: 26, height: 38 },
        // East - processing cluster
        { x: 172, z: 160, radius: 28, height: 42 },
        { x: 168, z: 80, radius: 32, height: 48 },
        { x: 175, z: 0, radius: 30, height: 46 },
        { x: 170, z: -80, radius: 28, height: 44 },
        { x: 165, z: -160, radius: 26, height: 40 }
    ],
    
    // Bugs/Glitches (goblin variant) [x, z, patrolLeft, patrolRight, speed]
    goblins: [
        // Login terminal guards
        [25, 175, 20, 30, 0.011],
        [-30, 160, -35, -25, 0.012],
        [35, 145, 30, 40, 0.011],
        [-25, 130, -30, -20, 0.012],
        // Network maze bugs
        [30, 95, 25, 35, 0.013],
        [-35, 75, -40, -30, 0.012],
        [25, 55, 20, 30, 0.013],
        [-30, 35, -35, -25, 0.012],
        [35, 10, 30, 40, 0.013],
        [-25, -15, -30, -20, 0.012],
        // Deep network glitches
        [30, -45, 25, 35, 0.014],
        [-35, -70, -40, -30, 0.014],
        [25, -95, 20, 30, 0.015],
        [-30, -115, -35, -25, 0.014],
        // Boss area sentry bugs
        [20, -150, 15, 25, 0.015],
        [-25, -160, -30, -20, 0.015]
    ],
    
    // Firewall guardians [x, z, patrolLeft, patrolRight, speed]
    guardians: [
        [55, 150, 50, 60, 0.008],
        [-60, 110, -65, -55, 0.009],
        [60, 60, 55, 65, 0.008],
        [-55, 20, -60, -50, 0.009],
        [55, -30, 50, 60, 0.008],
        [-60, -80, -65, -55, 0.009],
        [50, -130, 45, 55, 0.010]
    ],
    
    // Mainframe giants (giant variant)
    giants: [
        [0, 110, -15, 15],
        [-60, 50, -70, -50],
        [65, 0, 55, 75],
        [0, -60, -15, 15],
        [-55, -110, -65, -45],
        [60, -140, 50, 70]
    ],
    
    // Hackers (wizard variant) [x, z, patrolLeft, patrolRight, speed]
    wizards: [
        [40, 140, 35, 45, 0.006],
        [-45, 90, -50, -40, 0.007],
        [50, 40, 45, 55, 0.006],
        [-40, -10, -45, -35, 0.007],
        [45, -65, 40, 50, 0.006],
        [-50, -110, -55, -45, 0.007],
        [0, -145, -5, 5, 0.008]
    ],
    
    // No mummies or lava monsters in digital world
    mummies: [],
    lavaMonsters: [],
    skeletons: [],
    
    // Hard mode extra bugs
    hardModeGoblins: [
        [45, 185, 40, 50, 0.016],
        [-50, 155, -55, -45, 0.015],
        [40, 120, 35, 45, 0.016],
        [-45, 85, -50, -40, 0.015],
        [50, 50, 45, 55, 0.016],
        [-40, 15, -45, -35, 0.015],
        [45, -25, 40, 50, 0.016],
        [-50, -60, -55, -45, 0.015],
        [40, -100, 35, 45, 0.017],
        [-45, -135, -50, -40, 0.016]
    ],
    
    // Drone birds (data packets/virus payloads)
    birds: [
        [0, 155, 38, 0.010],
        [-40, 100, 35, 0.011],
        [45, 50, 36, 0.009],
        [-35, 0, 32, 0.010],
        [40, -55, 34, 0.011],
        [0, -120, 38, 0.012]
    ],
    
    // Ammo as data packets
    ammoPositions: [
        { x: 20, z: 185 }, { x: -25, z: 165 }, { x: 30, z: 140 },
        { x: -35, z: 115 }, { x: 25, z: 90 }, { x: -30, z: 65 },
        { x: 35, z: 40 }, { x: -25, z: 15 }, { x: 30, z: -15 },
        { x: -35, z: -45 }, { x: 25, z: -75 }, { x: -30, z: -105 },
        { x: 0, z: 170 }, { x: 0, z: 105 }, { x: 0, z: 45 },
        { x: 0, z: -25 }, { x: 0, z: -90 },
        { x: 50, z: 160 }, { x: -55, z: 120 }, { x: 60, z: 70 },
        { x: -50, z: 25 }, { x: 55, z: -35 }, { x: -60, z: -85 },
        // Extra for combat
        { x: 40, z: 175 }, { x: -40, z: 135 }, { x: 45, z: 95 },
        { x: -45, z: 55 }, { x: 50, z: 10 }, { x: -50, z: -45 }
    ],
    
    // Banana items as "debug tools"
    bananaPositions: [
        { x: 15, z: 180 }, { x: -20, z: 150 }, { x: 25, z: 110 },
        { x: -30, z: 70 }, { x: 20, z: 30 }, { x: -25, z: -20 },
        { x: 30, z: -70 }, { x: -20, z: -120 }, { x: 0, z: -160 }
    ],
    
    // Bomb items as "logic bombs"
    bombPositions: [
        { x: 55, z: 170 }, { x: -65, z: 130 }, { x: 70, z: 80 },
        { x: -60, z: 30 }, { x: 65, z: -25 }, { x: -70, z: -75 }
    ],
    
    // Health pickups as "restore points"
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
    
    // Herzman pickups as "antivirus turrets"
    herzmanPositions: [
        { x: 0, z: 160 },
        { x: -50, z: 50 },
        { x: 55, z: -40 },
        { x: 0, z: -100 }
    ],
    
    // =========================================
    // LAG EVENT CONFIGURATION
    // =========================================
    lagConfig: {
        interval: 25000,           // Time between lag events (25 seconds)
        duration: 4000,            // How long the lag lasts (4 seconds)
        warningTime: 3000,         // Warning before lag starts
        slowdownFactor: 0.4,       // Movement speed during lag (40%)
        affectsEnemies: true,      // Enemies also slow down
        opensFirewalls: true       // Firewall gates open during lag
    }
});
