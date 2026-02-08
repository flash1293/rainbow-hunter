// Ice Theme
// Used by Level 2 - Frozen Wastes

THEME_REGISTRY.register('ice', {
    name: 'Frozen Wastes',
    description: 'Frigid ice kingdom with snow and frost',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors
    skyColor: 0xAABBCC,        // Cold gray-blue sky
    fogColor: 0xAABBCC,        // Matching fog
    fogDensity: 0.01,          // Moderate fog
    groundColor: 0x99CCFF,     // Icy blue ground
    
    // Terrain colors
    hillColor: 0x88BBDD,       // Snowy blue hills
    grassColor: 0xCCEEFF,      // Snow/frost
    treeColor: 0x004488,       // Dark blue frozen trees
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: true,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x4488BB },      // Ice goblins
        guardian: { color: 0x00BFFF },    // Frost guardians
        giant: { color: 0x6699BB },       // Frost giants
        wizard: { color: 0x1a3a5a },      // Ice wizards
        dragon: { color: 0x00BFFF, breathColor: 0x00FFFF }  // Ice dragon, frost breath
    },
    
    // Texture variations
    textures: {
        ground: 'snow',
        trees: 'frozen_pine',
        rocks: 'ice'
    }
});
