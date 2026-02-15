// Christmas Theme
// Used by Level 12 - Christmas Village

THEME_REGISTRY.register('christmas', {
    name: 'Christmas Village',
    description: 'Magical snowy Christmas village with festive decorations and presents',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors - snowy winter night
    skyColor: 0x1a1a2e,        // Dark blue night sky
    fogColor: 0xc4d4e0,        // Light blue-gray fog
    fogDensity: 0.012,         // Moderate fog
    groundColor: 0xfffafa,     // Snow white ground
    
    // Terrain colors
    hillColor: 0xe8e8e8,       // Light gray snow hills
    grassColor: 0xffffff,      // Pure white snow
    treeColor: 0x1e5631,       // Deep green pine trees
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false,
        easterTheme: false,
        christmasTheme: true
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x228b22 },      // Green evil elves
        guardian: { color: 0xb22222 },    // Red nutcracker soldiers
        giant: { color: 0xffffff },       // White evil snowman
        wizard: { color: 0xcc0000 }       // Red evil Santa
    },
    
    // Texture variations
    textures: {
        ground: 'snow',
        trees: 'snow-pine',
        rocks: 'snowrock'
    },
    
    // Special features
    features: {
        hasPresents: true,
        hasSnowman: true,
        hasCandyCanes: true,
        hasChristmasTrees: true,
        hasLampposts: true,
        hasWreaths: true,
        hasGingerbreadHouse: true,
        hasSnowfall: true
    }
});
