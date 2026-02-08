// Water Theme
// Used by Level 5 - Deep Waters

THEME_REGISTRY.register('water', {
    name: 'Deep Waters',
    description: 'Tropical ocean with islands and pirate ships',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors
    skyColor: 0x87CEEB,        // Bright tropical sky
    fogColor: 0x88BBDD,        // Misty blue
    fogDensity: 0.008,         // Light sea mist
    groundColor: 0x1E90FF,     // Ocean blue (water)
    
    // Terrain colors
    hillColor: 0xF5DEB3,       // Sandy islands
    grassColor: 0x228B22,      // Tropical vegetation
    treeColor: 0x228B22,       // Palm trees
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: true,
        candyTheme: false,
        graveyardTheme: false
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x228B22 },      // Island goblins
        guardian: { color: 0x4169E1 },    // Sea guardians
        giant: { color: 0x8B4513 },       // Beach giants
        wizard: { color: 0x000080 },      // Sea mages
        dragon: { color: 0x1E90FF, breathColor: 0x00CED1 }  // Sea dragon
    },
    
    // Texture variations
    textures: {
        ground: 'water',
        trees: 'palm',
        rocks: 'coral'
    },
    
    // Special features
    features: {
        hasIslands: true,
        hasImpassableCliffs: true,
        hasMovingTraps: true,
        hasPirateShips: true,
        hasWhirlpools: true
    }
});
