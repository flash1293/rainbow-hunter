// Enchanted Theme
// Used by Level 10 - The Enchanted Grove

THEME_REGISTRY.register('enchanted', {
    name: 'Enchanted Grove',
    description: 'Mystical fairy forest with lush giant trees and magical fog',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors - foggy enchanted forest with pastel tones
    skyColor: 0x9FD5D1,        // Soft teal sky
    fogColor: 0xB8D4CE,        // Misty green-white fog
    fogDensity: 0.025,         // Dense fog for mystical atmosphere
    groundColor: 0x3D7A47,     // Lush forest green
    
    // Terrain colors - rich greens with magical touches
    hillColor: 0x2D6B37,       // Dark moss green hills
    grassColor: 0x4A9E54,      // Vibrant grass green
    treeColor: 0x2A5D34,       // Deep forest green for trees
    
    // Accent colors for magical elements
    accentColors: {
        fairy: 0xFFB6C1,       // Light pink
        magic: 0xE6E6FA,       // Lavender  
        glow: 0x98FB98,        // Pale green glow
        rainbow: [0xFF6B6B, 0xFFA94D, 0xFFEC4D, 0x6BFF6B, 0x4DA6FF, 0x9B6BFF, 0xFF6BFF]
    },
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false,
        enchantedTheme: true
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x90EE90 },       // Pixies - light green
        guardian: { color: 0x8B008B },     // Dark fairies - dark magenta
        giant: { color: 0x8B4513 },        // Treants - bark brown
        wizard: { color: 0x9932CC },       // Enchantress - dark orchid
        bird: { color: 0xFF69B4 },         // Giant butterfly - hot pink
        dragon: { color: 0x1a0a1a, breathColor: 0xFF00FF }  // Corrupted Unicorn - dark purple, rainbow breath
    },
    
    // Texture variations
    textures: {
        ground: 'enchanted_grass',
        trees: 'giant_oak',
        rocks: 'mossy_stone',
        flowers: 'crystal'
    },
    
    // Special features
    features: {
        hasGiantTrees: true,
        hasFairyRings: true,
        hasEnchantedMushrooms: true,
        hasCrystalFlowers: true,
        hasRainbowArcs: true,
        hasSleepSpores: true,
        hasThornPatches: true,
        hasSizePotion: true,
        useUnicorn: true,
        denseTreeCount: 35,       // Many more trees than normal
        treeScaleMultiplier: 2.5  // Trees are big
    }
});
