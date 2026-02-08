// Lava Theme
// Used by Level 4 - Lava Caves

THEME_REGISTRY.register('lava', {
    name: 'Lava Caves',
    description: 'Volcanic underground caves with molten lava',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors
    skyColor: 0x1a0505,        // Dark red-black sky (cave ceiling)
    fogColor: 0x331111,        // Dark red fog
    fogDensity: 0.015,         // Smoky atmosphere
    groundColor: 0x2a1a1a,     // Dark volcanic rock
    
    // Terrain colors
    hillColor: 0x4a2a2a,       // Volcanic rock formations
    grassColor: 0x1a0a0a,      // Blackite dark rock
    treeColor: 0x3a2020,       // Stalagmites/stalactites
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: true,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x8B0000 },      // Fire goblins
        guardian: { color: 0xFF4500 },    // Lava guardians
        giant: { color: 0x4a2020 },       // Obsidian giants
        wizard: { color: 0x8B0000 },      // Fire mages
        lavaMonster: { color: 0xFF4500 }, // Lava elementals
        dragon: { color: 0xFF4500, breathColor: 0xFFFF00 }  // Fire dragon
    },
    
    // Texture variations
    textures: {
        ground: 'volcanic_rock',
        trees: 'stalagmite',
        rocks: 'obsidian'
    },
    
    // Special features
    features: {
        hasLavaPools: true,
        hasLavaFlows: true,
        hasCrevices: true,
        hasCeiling: true,
        hasLavaMonsters: true
    }
});
