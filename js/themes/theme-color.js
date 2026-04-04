// Color Theme
// Used by Level 16 - Farbwelt
// Everything starts in grayscale - player collects paint buckets to colorize the world

THEME_REGISTRY.register('color', {
    name: 'Farbwelt',
    description: 'A grayscale world waiting to be painted with color',
    extends: 'forest',

    // Grayscale environment colors
    skyColor: 0xB0B0B0,        // Gray sky
    fogColor: 0xA0A0A0,        // Gray fog
    fogDensity: 0.008,
    groundColor: 0x808080,     // Medium gray ground

    // Grayscale terrain
    hillColor: 0x707070,       // Dark gray hills
    grassColor: 0x909090,      // Gray grass
    treeColor: 0x606060,       // Dark gray trees

    // Theme flags
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: false,
        colorTheme: true
    },

    // Grayscale entities
    entities: {
        goblin: { color: 0x808080 },
        guardian: { color: 0x606060 },
        giant: { color: 0x505050 },
        wizard: { color: 0x707070 },
        dragon: { color: 0x404040, breathColor: 0x999999 }
    },

    // Features
    features: {
        hasPaintBuckets: true
    }
});
