// Horror Theme
// Used by Level 17 - Das Horrorlevel

THEME_REGISTRY.register('horror', {
    name: 'Das Horrorlevel',
    description: 'Eine finstere Welt aus Blut und Albträumen – Schwerter, Knochen und unsagbare Monster',
    extends: 'graveyard',

    // Atmosphere – deep crimson darkness
    skyColor:    0x070000,   // almost-black blood sky
    fogColor:    0x1a0000,   // dark blood fog
    fogDensity:  0.028,      // very thick, claustrophobic
    groundColor: 0x1a0000,   // dried-blood ground

    // Terrain colours
    hillColor:  0x2a0505,
    grassColor: 0x150000,
    treeColor:  0x1a0000,    // decorations rendered by theme branch

    // Theme flags
    themeFlags: {
        graveyardTheme: false,
        horrorTheme: true
    },

    // Entity colour hints (not actively used – builders hard-code their own colours)
    entities: {
        goblin:   { color: 0x3a0a0a },
        guardian: { color: 0x550000 },
        giant:    { color: 0x660000 },
        wizard:   { color: 0x4a0000 },
        dragon:   { color: 0x220000, breathColor: 0xcc0000 }
    },

    textures: {
        ground: 'dead_earth',
        trees:  'dead_tree',
        rocks:  'tombstone'
    },

    features: {
        hasMountains:    true,
        hasTreasure:     true,
        hasRiver:        false,
        hasMaterials:    false
    }
});
