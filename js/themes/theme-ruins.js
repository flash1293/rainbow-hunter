// Ruins Theme
// Used by Level 8 - The Ancient Ruins

THEME_REGISTRY.register('ruins', {
    name: 'Ancient Ruins',
    description: 'Friendly sunlit castle ruins with trees, grass, knights and dragons',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors - bright daylight atmosphere
    skyColor: 0x6AAFE6,        // Light blue sky
    fogColor: 0xC8D8E8,        // Light blue-gray fog (sunny haze)
    fogDensity: 0.006,         // Very light fog for visibility
    groundColor: 0x9B8B6B,     // Warm sandy stone floor
    
    // Terrain colors - friendly and green
    hillColor: 0x7B6B5F,       // Warm rubble hills
    grassColor: 0x5A9B4A,      // Vibrant green grass
    treeColor: 0x3A6B2A,       // Lush green trees
    
    // Wall colors - light warm sandstone
    wallColor: 0xC8BEA8,       // Light cream sandstone
    wallDetailColor: 0xD5CAB8, // Lighter accent
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false,
        ruinsTheme: true
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x708090 },      // Knights (armor gray)
        guardian: { color: 0x6699CC },    // Spectral Knights (ethereal blue)
        giant: { color: 0x3A2A1A },       // Big Spiders (dark brown-black)
        wizard: { color: 0x2A1A3A },      // Dark Sorcerers (deep purple-black)
        skeleton: { color: 0xFFFFF0 },    // Skeleton archers
        dragon: { color: 0x4A5A4A, breathColor: 0xFF4500 }  // Stone dragon with fire breath
    },
    
    // Texture variations
    textures: {
        ground: 'stone_floor',
        trees: 'oak_tree',
        rocks: 'rubble'
    },
    
    // Special features
    features: {
        hasMistPools: false,
        hasTombstones: false,
        hasJackOLanterns: false,
        hasHauntedWell: false,
        hasMazeWalls: true,
        hasRuinDecorations: true,
        hasBrokenColumns: true,
        hasStatues: true,
        hasTrees: true,
        hasGrass: true,
        useReaper: false
    }
});
