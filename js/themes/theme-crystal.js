// Crystal Theme
// Used by Level 13 - Crystal Cove

THEME_REGISTRY.register('crystal', {
    name: 'Crystal Cove',
    description: 'A mystical underground cave filled with glowing gemstones and crystal formations',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors - dark cave with crystal glow
    skyColor: 0x0a0a1a,        // Dark cave ceiling
    fogColor: 0x1a1a3a,        // Purple-tinted darkness
    fogDensity: 0.018,         // Dense cave atmosphere
    groundColor: 0x2a2a4a,     // Dark cave floor
    
    // Terrain colors
    hillColor: 0x3a3a5a,       // Dark purple-gray hills
    grassColor: 0x4a4a6a,      // Mossy cave floor
    treeColor: 0x6a4a8a,       // Crystal formation color
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false,
        easterTheme: false,
        crystalTheme: true
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x44ffaa },      // Cave crawlers with bioluminescent skin
        guardian: { color: 0x8844ff },    // Crystal sentinels - purple crystal guards
        wizard: { color: 0xff44aa }       // Gem mages - crystal magic sorcerers
    },
    
    // Texture variations
    textures: {
        ground: 'cave_rock',
        trees: 'crystal-formation',
        rocks: 'geode'
    },
    
    // Special features
    features: {
        hasRiver: false,
        hasMountains: true,
        hasTreasure: true,
        hasMaterials: false,
        hasCrystalCave: true
    }
});
