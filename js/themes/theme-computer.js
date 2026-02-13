// Computer Theme
// Used by Level 9 - System Core
// Inside a computer/cyberspace - TRON-style digital world

THEME_REGISTRY.register('computer', {
    name: 'System Core',
    description: 'Digital cyberspace inside a computer with circuit board landscapes and neon data streams',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors - dark digital void
    skyColor: 0x0A0A1A,        // Deep navy black (digital void)
    fogColor: 0x003344,        // Dark cyan fog (digital haze)
    fogDensity: 0.012,         // Medium fog for mysterious depth
    groundColor: 0x003300,     // PCB green (circuit board)
    
    // Terrain colors - neon digital aesthetic
    hillColor: 0x1A1A2E,       // Dark chrome (data nodes/processors)
    grassColor: 0x004400,      // Dark circuit green
    treeColor: 0x00AAFF,       // Electric blue (server towers/firewalls)
    
    // Accent colors for level features
    accentColor: 0x00FFFF,     // Cyan (energy, data streams)
    warningColor: 0xFF6600,    // LED orange (warnings, damage)
    corruptColor: 0xFF0066,    // Magenta (corruption, malware)
    dataColor: 0x00FF00,       // Matrix green (data flow)
    
    // Theme flags
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false,
        ruinsTheme: false,
        computerTheme: true
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0xFF0066 },      // Magenta bugs/glitches
        guardian: { color: 0x00FFFF },    // Cyan firewall sentries
        giant: { color: 0x333355 },       // Dark chrome mainframes
        wizard: { color: 0x00FF00 },      // Matrix green hackers
        dragon: { color: 0xFF0066, breathColor: 0x00FFFF }  // Trojan dragon, data breath
    },
    
    // Texture variations
    textures: {
        ground: 'circuit_board',
        trees: 'server_tower',
        rocks: 'processor_chip'
    },
    
    // Special features
    features: {
        hasFirewallGates: true,      // Energy barrier gates
        hasLagEvents: true,          // System lag slowdown events
        hasBufferOverflow: true,     // Expanding damage zones
        hasDataStreams: true,        // Flowing rivers of light
        hasGlitchEffects: true,      // Visual glitch overlays
        hasCircuitPatterns: true     // Ground circuit traces
    }
});
