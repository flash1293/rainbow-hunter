// Level Registry - manages level configurations
// Levels are registered from separate files and retrieved by ID

const LEVEL_REGISTRY = {
    _levels: {},
    
    /**
     * Register a level configuration
     * @param {number} id - Level ID (1, 2, 3, etc.)
     * @param {object} config - Level configuration object
     */
    register(id, config) {
        if (this._levels[id]) {
            console.warn(`Level ${id} already registered, overwriting...`);
        }
        this._levels[id] = config;
    },
    
    /**
     * Get a level configuration by ID
     * @param {number} id - Level ID
     * @returns {object|null} Level configuration or null if not found
     */
    get(id) {
        return this._levels[id] || null;
    },
    
    /**
     * Get all registered level IDs
     * @returns {number[]} Array of level IDs
     */
    getIds() {
        return Object.keys(this._levels).map(Number).sort((a, b) => a - b);
    },
    
    /**
     * Get total number of registered levels
     * @returns {number} Level count
     */
    count() {
        return Object.keys(this._levels).length;
    },
    
    /**
     * Check if a level exists
     * @param {number} id - Level ID
     * @returns {boolean} True if level exists
     */
    exists(id) {
        return !!this._levels[id];
    }
};

// For backward compatibility, create LEVELS as a proxy to the registry
const LEVELS = new Proxy({}, {
    get(target, prop) {
        const id = parseInt(prop);
        if (!isNaN(id)) {
            return LEVEL_REGISTRY.get(id);
        }
        return undefined;
    },
    set(target, prop, value) {
        const id = parseInt(prop);
        if (!isNaN(id)) {
            LEVEL_REGISTRY.register(id, value);
            return true;
        }
        return false;
    },
    ownKeys() {
        return LEVEL_REGISTRY.getIds().map(String);
    },
    getOwnPropertyDescriptor(target, prop) {
        const id = parseInt(prop);
        if (!isNaN(id) && LEVEL_REGISTRY.exists(id)) {
            return { configurable: true, enumerable: true, value: LEVEL_REGISTRY.get(id) };
        }
        return undefined;
    }
});
