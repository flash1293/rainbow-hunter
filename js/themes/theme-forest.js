// Forest Theme (base/default theme)
// Used by Level 1 - Dragon's Lair

THEME_REGISTRY.register('forest', {
    name: 'Forest',
    description: 'Lush green forest with traditional fantasy elements',
    
    // Environment colors
    skyColor: 0x87CEEB,        // Light sky blue
    fogColor: 0xccddee,        // Light blue-gray
    fogDensity: 0.008,         // Light fog
    groundColor: 0x228B22,     // Forest green
    
    // Terrain colors
    hillColor: 0x2d5a27,       // Dark green hills
    grassColor: 0x3d8c40,      // Grass green
    treeColor: 0x228B22,       // Standard tree green
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x228B22 },      // Green goblins
        guardian: { color: 0x4169E1 },     // Blue guardians
        giant: { color: 0x8B4513 },        // Brown giants
        wizard: { color: 0x4B0082 },       // Indigo wizards
        dragon: { color: 0x228B22, breathColor: 0xFF4500 }  // Green dragon, fire breath
    },
    
    // Texture variations (for future use)
    textures: {
        ground: 'grass',
        trees: 'oak',
        rocks: 'stone'
    }
});
