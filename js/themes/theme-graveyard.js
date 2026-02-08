// Graveyard Theme
// Used by Level 7 - The Haunted Graveyard

THEME_REGISTRY.register('graveyard', {
    name: 'Haunted Graveyard',
    description: 'Spooky graveyard with undead creatures',
    extends: 'forest',  // Inherit base properties
    
    // Environment colors
    skyColor: 0x443355,        // Purple-black sky
    fogColor: 0x443355,        // Matching eerie fog
    fogDensity: 0.02,          // Dense fog for atmosphere
    groundColor: 0x8a7a65,     // Dead earth brown
    
    // Terrain colors
    hillColor: 0x3a3520,       // Dead grass mounds
    grassColor: 0x2a2a1a,      // Dying grass
    treeColor: 0x1a1510,       // Dead/bare trees
    
    // Theme flags for backward compatibility
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        lavaTheme: false,
        waterTheme: false,
        candyTheme: false,
        graveyardTheme: true
    },
    
    // Entity appearances
    entities: {
        goblin: { color: 0x556B2F },      // Zombie goblins
        guardian: { color: 0x9370DB },    // Ghost/spectre guardians
        giant: { color: 0x2F4F4F },       // Executioner giants
        wizard: { color: 0x4B0082 },      // Witch wizards
        skeleton: { color: 0xFFFFF0 },    // Skeleton archers
        reaper: { color: 0x1a1a1a },      // The Reaper boss
        dragon: { color: 0x1a1a1a, breathColor: 0x9400D3 }  // Death dragon (unused)
    },
    
    // Texture variations
    textures: {
        ground: 'dead_earth',
        trees: 'dead_tree',
        rocks: 'tombstone'
    },
    
    // Special features
    features: {
        hasMistPools: true,
        hasTombstones: true,
        hasJackOLanterns: true,
        hasHauntedWell: true,
        hasMazeWalls: true,
        useReaper: true
    }
});
