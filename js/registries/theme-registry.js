// Theme Registry - manages biome/theme configurations
// Themes define colors, textures, and entity factories for different level types

const THEME_REGISTRY = {
    _themes: {},
    
    /**
     * Register a theme configuration
     * @param {string} id - Theme ID (e.g., 'forest', 'ice', 'desert')
     * @param {object} config - Theme configuration object
     */
    register(id, config) {
        if (this._themes[id]) {
            console.warn(`Theme ${id} already registered, overwriting...`);
        }
        // Merge with base theme if specified
        if (config.extends && this._themes[config.extends]) {
            const baseTheme = this._themes[config.extends];
            config = this._deepMerge(baseTheme, config);
        }
        this._themes[id] = config;
    },
    
    /**
     * Get a theme configuration by ID
     * @param {string} id - Theme ID
     * @returns {object|null} Theme configuration or null if not found
     */
    get(id) {
        return this._themes[id] || this._themes['forest'] || null;
    },
    
    /**
     * Get all registered theme IDs
     * @returns {string[]} Array of theme IDs
     */
    getIds() {
        return Object.keys(this._themes);
    },
    
    /**
     * Check if a theme exists
     * @param {string} id - Theme ID
     * @returns {boolean} True if theme exists
     */
    exists(id) {
        return !!this._themes[id];
    },
    
    /**
     * Get theme flag name from theme ID (for backward compatibility)
     * @param {string} themeId - Theme ID
     * @returns {string} Theme flag name (e.g., 'iceTheme', 'desertTheme')
     */
    getThemeFlag(themeId) {
        const flagMap = {
            'forest': null,
            'ice': 'iceTheme',
            'desert': 'desertTheme',
            'lava': 'lavaTheme',
            'water': 'waterTheme',
            'candy': 'candyTheme',
            'graveyard': 'graveyardTheme',
            'ruins': 'ruinsTheme'
        };
        return flagMap[themeId] || null;
    },
    
    /**
     * Deep merge two objects
     * @private
     */
    _deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this._deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }
};

/**
 * Helper to get theme from level config
 * @param {object} levelConfig - Level configuration object
 * @returns {object} Theme configuration
 */
function getThemeForLevel(levelConfig) {
    // Determine theme from level flags (backward compatible)
    if (levelConfig.iceTheme) return THEME_REGISTRY.get('ice');
    if (levelConfig.desertTheme) return THEME_REGISTRY.get('desert');
    if (levelConfig.lavaTheme) return THEME_REGISTRY.get('lava');
    if (levelConfig.waterTheme) return THEME_REGISTRY.get('water');
    if (levelConfig.candyTheme) return THEME_REGISTRY.get('candy');
    if (levelConfig.graveyardTheme) return THEME_REGISTRY.get('graveyard');
    if (levelConfig.ruinsTheme) return THEME_REGISTRY.get('ruins');
    // Default to forest theme
    return THEME_REGISTRY.get('forest');
}
