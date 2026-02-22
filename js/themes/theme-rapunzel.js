// Rapunzel Theme
// Used by Level 14 - Rapunzel's Tower
// Magical fairytale forest with mystery towers

THEME_REGISTRY.register('rapunzel', {
    name: "Rapunzel's Tower",
    description: 'Magical fairytale forest with mysterious towers hiding secrets',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors - enchanted fairytale forest
    skyColor: 0x7eb5d6,        // Soft blue sky
    fogColor: 0x9ecfb7,        // Magical green fog
    fogDensity: 0.015,         // Light mystical fog
    groundColor: 0x4a7c4f,     // Lush green ground
    
    // Terrain colors
    hillColor: 0x5d8c5d,       // Green hills
    grassColor: 0x3d6b3d,      // Dark green grass
    treeColor: 0x2d5a2d,       // Deep forest green trees
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false,
        easterTheme: false,
        christmasTheme: false,
        crystalTheme: false,
        rapunzelTheme: true
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0xffb6c1 },      // Pink for little princess
        guardian: { color: 0x4a0080 },    // Purple for witch
        giant: { color: 0x808080 },       // Gray stone tower
        wizard: { color: 0xffd700 }       // Gold for crown wizard
    },
    
    // Texture variations
    textures: {
        ground: 'fairytale-grass',
        trees: 'fairytale-pine',
        rocks: 'mossy-rock'
    },
    
    // Special features
    features: {
        hasMysteryTowers: true,
        hasFireflies: true,
        hasFlowerPatches: true,
        hasMushrooms: true,
        hasVines: true,
        hasCottages: true
    }
});
