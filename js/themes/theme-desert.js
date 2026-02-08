// Desert Theme
// Used by Level 3 - Scorching Sands

THEME_REGISTRY.register('desert', {
    name: 'Scorching Sands',
    description: 'Hot desert with pyramids and ancient ruins',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors
    skyColor: 0xFFE4B5,        // Warm sandy sky
    fogColor: 0xFFE4B5,        // Sandy fog
    fogDensity: 0.006,         // Light haze
    groundColor: 0xD2B48C,     // Sandy tan ground
    
    // Terrain colors
    hillColor: 0xC19A6B,       // Sand dune color
    grassColor: 0xE6D5A8,      // Pale sand
    treeColor: 0x8B7355,       // Dead/dry vegetation
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: true,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0xC19A6B },      // Sand goblins
        guardian: { color: 0xDAA520 },    // Golden guardians
        giant: { color: 0x8B4513 },       // Sandstone giants
        wizard: { color: 0x8B4513 },      // Desert mages
        mummy: { color: 0xF5DEB3 },       // Desert mummies
        dragon: { color: 0xFFD700, breathColor: 0xFFA500 }  // Golden dragon
    },
    
    // Texture variations
    textures: {
        ground: 'sand',
        trees: 'palm',
        rocks: 'sandstone'
    },
    
    // Special features
    features: {
        hasPyramids: true,
        hasCanyonWalls: true,
        hasScarabs: true
    }
});
