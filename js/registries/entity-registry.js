// Entity Registry - manages entity factory functions
// Entities are created using factories that can be overridden by themes

const ENTITY_REGISTRY = {
    _factories: {},
    _themeOverrides: {},
    
    /**
     * Register a base entity factory
     * @param {string} type - Entity type (e.g., 'goblin', 'guardian', 'dragon')
     * @param {function} factory - Factory function(position, config) => THREE.Group
     */
    registerFactory(type, factory) {
        this._factories[type] = factory;
    },
    
    /**
     * Register a theme-specific entity factory override
     * @param {string} themeId - Theme ID (e.g., 'ice', 'lava')
     * @param {string} type - Entity type being overridden
     * @param {function} factory - Override factory function
     */
    registerThemeOverride(themeId, type, factory) {
        if (!this._themeOverrides[themeId]) {
            this._themeOverrides[themeId] = {};
        }
        this._themeOverrides[themeId][type] = factory;
    },
    
    /**
     * Get the factory for an entity type, considering theme overrides
     * @param {string} type - Entity type
     * @param {string} themeId - Current theme ID (optional)
     * @returns {function|null} Factory function or null
     */
    getFactory(type, themeId = null) {
        // Check for theme-specific override first
        if (themeId && this._themeOverrides[themeId] && this._themeOverrides[themeId][type]) {
            return this._themeOverrides[themeId][type];
        }
        // Fall back to base factory
        return this._factories[type] || null;
    },
    
    /**
     * Create an entity using the appropriate factory
     * @param {string} type - Entity type
     * @param {object} position - Position {x, z} or full config
     * @param {object} config - Additional configuration
     * @param {string} themeId - Current theme ID
     * @returns {object|null} Created entity or null
     */
    create(type, position, config = {}, themeId = null) {
        const factory = this.getFactory(type, themeId);
        if (!factory) {
            console.warn(`No factory registered for entity type: ${type}`);
            return null;
        }
        return factory(position, config);
    },
    
    /**
     * Get all registered entity types
     * @returns {string[]} Array of entity type names
     */
    getTypes() {
        return Object.keys(this._factories);
    },
    
    /**
     * Get theme overrides for a specific theme
     * @param {string} themeId - Theme ID
     * @returns {object} Map of type -> factory for the theme
     */
    getThemeOverrides(themeId) {
        return this._themeOverrides[themeId] || {};
    }
};

/**
 * Helper function to spawn entities from level config
 * Uses the entity registry to create theme-appropriate entities
 * @param {string} type - Entity type
 * @param {array} positions - Array of position configs
 * @param {string} themeId - Current theme ID
 * @returns {array} Array of created entities
 */
function spawnEntities(type, positions, themeId = 'forest') {
    const entities = [];
    positions.forEach(pos => {
        const entity = ENTITY_REGISTRY.create(type, pos, {}, themeId);
        if (entity) {
            entities.push(entity);
        }
    });
    return entities;
}
