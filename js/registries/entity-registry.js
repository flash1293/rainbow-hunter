// Entity Registry - manages entity factory functions and update behaviors
// Entities are created using factories that can be overridden by themes
// Each entity type can register: create, update, cleanup functions

const ENTITY_REGISTRY = {
    _definitions: {},      // type -> { create, update, cleanup }
    _themeOverrides: {},   // themeId -> type -> { create, update, cleanup }
    
    // Legacy compatibility
    _factories: {},
    
    /**
     * Register a complete entity type with all behaviors
     * @param {string} type - Entity type (e.g., 'goblin', 'guardian', 'dragon')
     * @param {object} definition - { create, update, cleanup } functions
     */
    register(type, definition) {
        this._definitions[type] = {
            create: definition.create || null,
            update: definition.update || null,
            cleanup: definition.cleanup || null
        };
        // Legacy compatibility
        if (definition.create) {
            this._factories[type] = definition.create;
        }
    },
    
    /**
     * Register a base entity factory (legacy method)
     * @param {string} type - Entity type
     * @param {function} factory - Factory function
     */
    registerFactory(type, factory) {
        if (!this._definitions[type]) {
            this._definitions[type] = { create: null, update: null, cleanup: null };
        }
        this._definitions[type].create = factory;
        this._factories[type] = factory;
    },
    
    /**
     * Register a theme-specific entity override
     * @param {string} themeId - Theme ID (e.g., 'ice', 'lava')
     * @param {string} type - Entity type being overridden
     * @param {object|function} override - Override definition or factory function
     */
    registerThemeOverride(themeId, type, override) {
        if (!this._themeOverrides[themeId]) {
            this._themeOverrides[themeId] = {};
        }
        // Support both legacy (function) and new (object) formats
        if (typeof override === 'function') {
            this._themeOverrides[themeId][type] = { create: override };
        } else {
            this._themeOverrides[themeId][type] = override;
        }
    },
    
    /**
     * Get the definition for an entity type, considering theme overrides
     * @param {string} type - Entity type
     * @param {string} themeId - Current theme ID (optional)
     * @returns {object|null} Definition object or null
     */
    getDefinition(type, themeId = null) {
        const baseDef = this._definitions[type] || null;
        
        // Check for theme-specific override
        if (themeId && this._themeOverrides[themeId] && this._themeOverrides[themeId][type]) {
            const themeDef = this._themeOverrides[themeId][type];
            // Merge theme override with base (theme takes precedence)
            return {
                create: themeDef.create || (baseDef && baseDef.create),
                update: themeDef.update || (baseDef && baseDef.update),
                cleanup: themeDef.cleanup || (baseDef && baseDef.cleanup)
            };
        }
        return baseDef;
    },
    
    /**
     * Get the factory for an entity type (legacy compatibility)
     * @param {string} type - Entity type
     * @param {string} themeId - Current theme ID (optional)
     * @returns {function|null} Factory function or null
     */
    getFactory(type, themeId = null) {
        const def = this.getDefinition(type, themeId);
        return def ? def.create : null;
    },
    
    /**
     * Get the update function for an entity type
     * @param {string} type - Entity type
     * @param {string} themeId - Current theme ID (optional)
     * @returns {function|null} Update function or null
     */
    getUpdate(type, themeId = null) {
        const def = this.getDefinition(type, themeId);
        return def ? def.update : null;
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
     * Update all entities of a type using the registered update function
     * @param {string} type - Entity type
     * @param {array} entities - Array of entities to update
     * @param {string} themeId - Current theme ID
     * @returns {boolean} True if update function exists and was called
     */
    updateAll(type, entities, themeId = null) {
        const updateFn = this.getUpdate(type, themeId);
        if (updateFn && entities && entities.length > 0) {
            updateFn(entities);
            return true;
        }
        return false;
    },
    
    /**
     * Check if an entity type has a registered update function
     * @param {string} type - Entity type
     * @param {string} themeId - Current theme ID (optional)
     * @returns {boolean} True if update function exists
     */
    hasUpdate(type, themeId = null) {
        return this.getUpdate(type, themeId) !== null;
    },
    
    /**
     * Get all registered entity types
     * @returns {string[]} Array of entity type names
     */
    getTypes() {
        return Object.keys(this._definitions);
    },
    
    /**
     * Get theme overrides for a specific theme
     * @param {string} themeId - Theme ID
     * @returns {object} Map of type -> definition for the theme
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
