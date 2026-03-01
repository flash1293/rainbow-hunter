// Labyrinth Theme
// Used by Level 15 - The Labyrinth
// Overgrown ancient stone labyrinth bursting with vegetation

THEME_REGISTRY.register('labyrinth', {
    name: 'The Labyrinth',
    description: 'Ein überwuchertes Steinlabyrinth voller Moos, Efeu und wilder Blumen',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors - lush, green, overgrown
    skyColor: 0x6b8f71,        // Soft green overcast sky
    fogColor: 0x6b8f71,        // Green-tinted fog
    fogDensity: 0.025,         // Dense atmospheric fog
    groundColor: 0x4a7a4f,     // Lush green ground
    
    // Terrain colors - everything green
    hillColor: 0x5a8b4e,       // Mossy green mounds
    grassColor: 0x3d7b3d,      // Bright green grass
    treeColor: 0x2d5a2d,       // Deep forest green
    
    // Theme flags
    themeFlags: {
        labyrinthTheme: true
    },
    
    // Entity appearances - mossy/stone guardians
    entities: {
        goblin: { color: 0x556B2F },      // Moss goblins
        guardian: { color: 0x708090 }      // Stone guardians
    },
    
    // Texture variations
    textures: {
        ground: 'grass',
        trees: 'hedge',
        rocks: 'mossy_stone'
    },
    
    // Special features
    features: {
        hasRiver: false,
        hasMountains: true,
        hasTreasure: true,
        hasMaterials: false,
        hasLabyrinth: true
    }
});
