// Candy Theme
// Used by Level 6 - Candy Kingdom

THEME_REGISTRY.register('candy', {
    name: 'Candy Kingdom',
    description: 'Sweet fantasy land made of candy and treats',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors
    skyColor: 0xFFE4E1,        // Pink cotton candy sky
    fogColor: 0xFFD9D9,        // Sweet pink fog
    fogDensity: 0.006,         // Light sweet haze
    groundColor: 0xFFB6C1,     // Pink frosting ground
    
    // Terrain colors
    hillColor: 0xFFD700,       // Golden cookie dough hills
    grassColor: 0x90EE90,      // Mint green
    treeColor: 0xFF1493,       // Hot pink candy trees
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: true,
        graveyardTheme: false
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0xFF69B4 },      // Pink candy goblins
        guardian: { color: 0x00CED1 },    // Mint guardians
        giant: { color: 0x8B4513 },       // Chocolate giants
        wizard: { color: 0x9400D3 },      // Grape candy wizards
        dragon: { color: 0xFF1493, breathColor: 0xFFFF00 }  // Cotton candy dragon
    },
    
    // Texture variations
    textures: {
        ground: 'frosting',
        trees: 'lollipop',
        rocks: 'rock_candy'
    },
    
    // Special features
    features: {
        hasChocolateRiver: true,
        hasOvens: true,
        hasLollipops: true,
        hasCandyCanes: true,
        hasGummyBears: true
    }
});
