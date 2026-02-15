// Easter Theme
// Used by Level 11 - Easter Meadow

THEME_REGISTRY.register('easter', {
    name: 'Easter Meadow',
    description: 'Bright spring meadow with Easter decorations and hidden eggs',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors - bright spring pastels
    skyColor: 0xFFB6C1,        // Light pink sky
    fogColor: 0xFFF0F5,        // Lavender blush fog
    fogDensity: 0.004,         // Light spring haze
    groundColor: 0x90EE90,     // Light green meadow
    
    // Terrain colors
    hillColor: 0x98FB98,       // Pale green hills
    grassColor: 0x7CFC00,      // Lawn green grass
    treeColor: 0xFFB6C1,       // Pink blossom trees
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false,
        easterTheme: true
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0xFFFFFF },      // White bunnies
        guardian: { color: 0xFFE4E1 },    // Pastel egg warriors
        giant: { color: 0xFFD700 },       // Yellow chicks
        wizard: { color: 0xE6E6FA },      // Lavender Easter wizards
        dragon: { color: 0xFFF0F5, breathColor: 0xFF69B4 }  // Giant Easter Bunny
    },
    
    // Texture variations
    textures: {
        ground: 'meadow',
        trees: 'blossom',
        rocks: 'flower_patch'
    },
    
    // Special features
    features: {
        hasEasterEggs: true,
        hasFlowers: true,
        hasBaskets: true,
        hasBunnies: true,
        hasChicks: true
    }
});
