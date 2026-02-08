# Fahrrad-Abenteuer - Agent Context Guide

## Overview

**Fahrrad-Abenteuer** (Bicycle Adventure) is a 3D bicycle adventure game built with Three.js where players navigate terrain, collect materials, repair bridges, defeat enemies, and reach treasure. The game features multiple difficulty levels, multiplayer support via WebRTC, and a modular architecture.

**Key Features:**
- 3D terrain navigation with bicycle physics
- Multiplayer (host-client architecture with splitscreen support)
- 5 thematic levels (Dragon Cave, Frozen Wastes, Desert, Lava Caves, Ocean)
- Enemy AI with different behaviors (goblins, guardians, wizards, mummies, dragon)
- Resource collection and bridge repair mechanics
- Procedurally generated textures and audio

**Recent Modularization**: The monolithic 44,144-line `main.js` file has been split into logical modules (`main-setup.js`, `main-entities.js`, `main-gameplay.js`, `main-loop.js`) totaling 15,742 lines, improving maintainability and code organization.

## Project Structure

### Root Directory
```
eat-the-rainbow/
├── index.html              # Main entry point with difficulty selection
├── splitscreen.html        # Two-player splitscreen interface
├── style.css               # Game styling and UI
├── README.md               # User-facing documentation
├── MULTIPLAYER_GUIDE.md    # Detailed multiplayer implementation guide
├── AGENT_CONTEXT.md        # Developer documentation (this file)
├── screenshot.png          # Game screenshot
├── progress.txt            # Development progress tracking
├── ralph.sh               # Utility script
└── js/                     # Modular game code (ACTIVE CODEBASE)
```

### Modular JavaScript (`js/` directory) - MODULAR ARCHITECTURE
```
js/
├── main.js                 # Game orchestration, initialization entry point (481 lines)
├── main-setup.js           # Player, environment objects, and input setup (2,437 lines)
├── main-entities.js        # Enemies, collectibles, and special objects (2,723 lines)
├── main-gameplay.js        # Combat, updates, and collision systems (3,931 lines)
├── main-loop.js            # Game reset, HUD, and main game loop (913 lines)
├── config.js               # Game constants only (~105 lines, LEVELS removed)
├── terrain.js              # Terrain generation and procedural textures (2,213 lines)
├── audio.js                # Audio system with sound effects and music (846 lines)
├── multiplayer.js          # PeerJS-based multiplayer synchronization (270 lines)
├── registries/             # Registry pattern for extensibility
│   ├── level-registry.js   # LEVEL_REGISTRY - manages level configurations
│   ├── theme-registry.js   # THEME_REGISTRY - manages visual themes
│   └── entity-registry.js  # ENTITY_REGISTRY - manages entity factories
├── levels/                 # Individual level configurations
│   ├── level-1-dragon.js   # Dragon's Lair (forest theme)
│   ├── level-2-frozen.js   # Frozen Wastes (ice theme)
│   ├── level-3-desert.js   # Scorching Sands (desert theme)
│   ├── level-4-lava.js     # Lava Caves (lava theme)
│   ├── level-5-water.js    # Deep Waters (water theme)
│   ├── level-6-candy.js    # Candy Kingdom (candy theme)
│   └── level-7-graveyard.js # Haunted Graveyard (graveyard theme)
├── themes/                 # Visual theme configurations
│   ├── theme-forest.js     # Base forest theme
│   ├── theme-ice.js        # Ice/snow theme
│   ├── theme-desert.js     # Desert/sand theme
│   ├── theme-lava.js       # Volcanic/lava theme
│   ├── theme-water.js      # Ocean/water theme
│   ├── theme-candy.js      # Fantasy candy theme
│   └── theme-graveyard.js  # Spooky graveyard theme
└── entities/               # (Reserved for entity factories)
```

**Total Codebase: ~15,742 lines** (down from 44,144 lines in monolithic version)

## Architecture Overview

### Modular Script Loading Architecture
The project uses **traditional script loading** (no ES6 modules) with a clean modular structure:

- All JavaScript files are loaded via `<script>` tags in `index.html` in dependency order:
  ```html
  <!-- Registries must load first -->
  <script src="js/registries/level-registry.js"></script>
  <script src="js/registries/theme-registry.js"></script>
  <script src="js/registries/entity-registry.js"></script>
  
  <!-- Game configuration (constants only) -->
  <script src="js/config.js"></script>
  
  <!-- Level definitions (self-register with LEVEL_REGISTRY) -->
  <script src="js/levels/level-1-dragon.js"></script>
  <script src="js/levels/level-2-frozen.js"></script>
  <!-- ... levels 3-7 ... -->
  
  <!-- Theme definitions -->
  <script src="js/themes/theme-forest.js"></script>
  <script src="js/themes/theme-ice.js"></script>
  <!-- ... themes ... -->
  
  <!-- Core game systems -->
  <script src="js/terrain.js"></script>
  <script src="js/audio.js"></script>
  <script src="js/multiplayer.js"></script>
  <script src="js/main-setup.js"></script>
  <script src="js/main-entities.js"></script>
  <script src="js/main-gameplay.js"></script>
  <script src="js/main-loop.js"></script>
  <script src="js/main.js"></script>
  ```
- Functions and variables are available globally after loading
- No ES6 imports/exports are used in the active codebase
This allows the game to run directly in browsers with `file:///` URLs

### Registry Pattern for Scalability
The game uses a **registry pattern** for managing levels, themes, and entities:

**LEVEL_REGISTRY** (`js/registries/level-registry.js`):
- `register(levelNum, config)` - Register a new level
- `get(levelNum)` - Get level configuration
- `exists(levelNum)` - Check if level exists
- `getAllLevels()` - Get all registered levels
- Creates `LEVELS` proxy for backward compatibility

**THEME_REGISTRY** (`js/registries/theme-registry.js`):
- `register(name, config)` - Register a theme
- `get(name)` - Get theme with inheritance via `extends`
- `getThemeForLevel(levelNum)` - Get theme for a specific level

**ENTITY_REGISTRY** (`js/registries/entity-registry.js`):
- `register(type, factory)` - Register entity factory
- `create(type, config, themeOverrides)` - Create entity instance
- `spawnEntities(type, positions, scene)` - Spawn multiple entities

**Adding a New Level:**
1. Create `js/levels/level-N-name.js`
2. Call `LEVEL_REGISTRY.register(N, { ...config })`
3. Optionally create a theme in `js/themes/`
4. Add `<script>` tag to `index.html`

**Recent Modularization**: The monolithic `main.js` (44,144 lines) has been successfully split into logical modules:

| Module | Responsibility | Lines |
|--------|----------------|-------|
| `main.js` | Game orchestration, initialization entry point | 481 |
| `main-setup.js` | Player creation, environment objects, input setup | 2,437 |
| `main-entities.js` | Enemy and special object creation (goblins, dragons, etc.) | 2,723 |
| `main-gameplay.js` | Combat, updates, collisions, explosions | 3,931 |
| `main-loop.js` | Game loop, HUD, reset functionality | 913 |

### Configuration-Driven Design
- **`config.js`** contains ALL game constants, level data, enemy positions, etc.
- Each level has its own configuration object with terrain, enemies, and theme settings
- Difficulty multipliers affect enemy speed, count, and behavior
- **IMPORTANT**: When adding new features, first check if they should be configurable in `config.js`

### Game State Management
Global variables in `main.js` control game state:
```javascript
let difficulty = null;           // 'easy' or 'hard'
let speedMultiplier = 1;         // Based on difficulty
let gameDead = false;            // Player death state
let gameWon = false;             // Victory state
let godMode = false;             // Debug mode (G key)
let persistentInventory = {      // Carries across levels
    ammo: null,
    bombs: null,
    health: null,
    hasKite: false
};
```

## Key Concepts

### 1. Level System
Levels are defined in individual files under `js/levels/` and self-register with `LEVEL_REGISTRY`. Each level has:
- `playerStart`: Initial position
- `theme`: Theme identifier (forest, ice, desert, lava, water, candy, graveyard)
- Terrain configuration (hills, mountains, trees)
- Theme flags for backward compatibility (`iceTheme`, `desertTheme`, `lavaTheme`, `waterTheme`, `candyTheme`, `graveyardTheme`)
- Enemy configurations (goblins, guardians, wizards, mummies, skeletons, etc.)
- Special features (river, bridge, treasure, portal)

**Current Levels (7):**
| Level | Name | Theme | Boss |
|-------|------|-------|------|
| 1 | Dragon's Lair | Forest | Dragon |
| 2 | Frozen Wastes | Ice | 3 Ice Dragons |
| 3 | Scorching Sands | Desert | Mummies |
| 4 | Lava Caves | Lava | Lava Monsters |
| 5 | Deep Waters | Water | Sea Dragon |
| 6 | Candy Kingdom | Candy | Candy Dragon |
| 7 | Haunted Graveyard | Graveyard | The Reaper |

**Level Progression:**
1. Complete objectives (collect materials, repair bridge)
2. Reach the treasure/portal
3. Persistent inventory carries to next level
4. Math exercises may appear between levels

### 2. Multiplayer Architecture
**Host-Client Model:**
- **Host (Mädchen/Girl)**: Pink bike, controls ALL game logic, creates room
- **Client (Junge/Boy)**: Blue bike, joins with 3-digit code, sends position updates
- **Synchronization**: Host sends full game state at 10Hz, client at 60Hz
- **AI Behavior**: Enemies chase the closest player (dynamic aggro switching)

**Key Files:**
- `multiplayer.js` - PeerJS connection management
- `splitscreen.html` - Uses iframes for local multiplayer
- Room codes: 3-digit numbers (100-999) generated on page load

### 3. Terrain and Environment
**`terrain.js`** handles:
- Procedural texture generation (grass, rock, water, goblin skin, etc.)
- Height calculation with hills and mountains
- Environmental objects (trees, rocks, grass, pyramids for desert)
- Bridge and river creation

**Height Calculation:**
- `getTerrainHeight(x, z)` - Main function used throughout game
- Uses `currentLevelHills` or falls back to global `HILLS`
- Special handling for theme variations (water level = flat)

### 4. Enemy System
**Enemy Types:**
1. **Regular Goblins** - Basic patrol and chase AI (`createGoblin` in `main-entities.js`)
2. **Guardian Goblins** - Elite enemies with bows (hard mode) (`createGuardianGoblin`)
3. **Wizards** - Spellcasters with projectile attacks (`createWizard`)
4. **Mummies** - Desert-themed enemies (`createMummy`)
5. **Lava Monsters** - Lava-themed with trail effects (`createLavaMonster`)
6. **Dragon Boss** - Final boss with fireballs and 50 HP (`createDragon`)

**AI Patterns:** (implemented in `main-gameplay.js`)
- Patrol between `patrolLeft` and `patrolRight` positions
- Chase player when within detection range
- Attack with projectiles (guardians, wizards) or contact damage
- Special behaviors: dragon fireballs, lava trails, mummy curses

### 5. Player Mechanics
**Controls:**
- WASD/Arrow Keys: Movement
- Mouse: Aim/look (click to lock pointer)
- Space: Shoot
- F: Freeze power (10s cooldown)
- R: Restart after death/victory
- G: God mode (debug - flight, invincibility, unlimited ammo)

**Player Implementation**: (`main-setup.js`)
- Player logic is implemented in `initSetup()` function
- Bike + rider mesh with customizable colors
- Terrain-following movement
- Multiplayer differentiation (host/client colors)

## Adding New Features

### 1. Adding a New Enemy Type
**Step 1 - Define in level configuration (`js/levels/level-N-name.js`):**
```javascript
LEVEL_REGISTRY.register(N, {
    // ... other config ...
    newEnemies: [
        { x: 10, z: 20, patrolLeft: 5, patrolRight: 15, speed: 0.01 }
    ]
});
```

**Step 2 - Add constants to `config.js`:**
```javascript
// Add enemy-specific constants
GAME_CONFIG.NEW_ENEMY_RANGE = 25;
GAME_CONFIG.NEW_ENEMY_FIRE_INTERVAL = 3000;
```

**Step 3 - Create enemy in `main-entities.js`:**
- Add creation function (model existing `createGoblin` or `createGuardianGoblin`)
- Add to enemy arrays: `enemies.push(newEnemy)`
- Implement AI in `main-gameplay.js` (model existing `updateGoblins` function)

**Step 3 - Add update logic:**
- Add to enemy update loop in `updateGoblins()` function in `main-gameplay.js`
- Handle collisions, attacks, and death

**Step 4 - Multiplayer sync:**
- Add to game state synchronization in `main-setup.js` (`getFullGameSyncData()`)
- Ensure host sends new enemy state to clients

### 2. Adding a New Level
**Step 1 - Define level in `config.js`:**
```javascript
LEVELS[6] = {
    name: "Level 6 - New Theme",
    playerStart: { x: 0, z: 200 },
    theme: "newTheme",           // Add theme flag
    hills: [...],                // Terrain features
    enemies: [...],              // Enemy positions
    hasRiver: true,              // Game mechanics
    hasMaterials: true,
    treasurePosition: { x: 0, z: -200 }
};
```

**Step 2 - Add theme support in `terrain.js`:**
- Extend texture generation functions to handle new theme
- Add terrain creation logic if needed

**Step 3 - Update level loading in `main.js`:**
- The level loading system in `initGame()` already supports arbitrary levels
- Ensure theme-specific rendering is added

### 3. Adding a New Game Mechanic
**Step 1 - Define mechanics in `config.js`:**
```javascript
GAME_CONFIG.NEW_MECHANIC_COOLDOWN = 5000;
GAME_CONFIG.NEW_MECHANIC_RADIUS = 10;
```

**Step 2 - Implement in appropriate module:**
- Game logic: `main-gameplay.js`
- UI/HUD: `main-loop.js`
- Player controls: `main-setup.js`
- Special objects: `main-entities.js`

**Step 3 - Add controls:**
- Add key event listener in `main-setup.js`
- Implement activation logic

**Step 4 - Multiplayer sync:**
- Add to game state synchronization in `main-setup.js`
- Handle host-authoritative validation

### 4. Modifying Player Appearance
**For theme-specific player models:**
1. Check current theme in player creation (`main-setup.js`, lines ~500-720)
2. Create conditional mesh generation based on theme
3. Example: Boat for water level (fully implemented - see water theme checks)

**For multiplayer differentiation:**
- Host (Girl): Pink bike (`0xFF69B4`), pink shirt, brown hair
- Client (Boy): Blue bike (`0x4169E1`), blue shirt, black hair
- Colors defined in player mesh creation in `main-setup.js`

## Module Reference Guide

### `main.js` (481 lines)
- **Entry Point**: `initGame()` called after difficulty selection
- **Level Switching**: `switchLevel()` handles level transitions
- **Core Orchestration**: Coordinates module initialization
- **Global State**: Difficulty, multiplayer, game state variables

### `main-setup.js` (2,437 lines)
- **Player Creation**: `initSetup()` creates player, bike, kite
- **Multiplayer Sync**: `getFullGameSyncData()`, `applyFullGameSync()`
- **Input Handling**: Keyboard, mouse, gamepad controls
- **Environment Objects**: Trees, rocks, collectibles, bridges
- **Cloud System**: 3D cloud generation and animation

### `main-entities.js` (2,723 lines)
- **Enemy Creation**: `createGoblin()`, `createGuardianGoblin()`, `createWizard()`, etc.
- **Special Objects**: Dragons, pirate ships, portals, treasure
- **Collectibles**: Ammo, health, materials, scarabs
- **Environmental Hazards**: Lava pools, ice bergs, traps

### `main-gameplay.js` (3,931 lines)
- **Combat System**: Bullets, fireballs, explosions
- **AI Updates**: `updateGoblins()`, `updateDragon()`, etc.
- **Collision Detection**: `checkCollisions()` comprehensive collision system
- **Special Effects**: Freeze, tornadoes, lava trails
- **Projectile Systems**: Arrows, fireballs, cannonballs

### `main-loop.js` (913 lines)
- **Game Loop**: `animate()` main 60fps game loop
- **HUD Rendering**: `drawHUD()` displays health, ammo, minimap
- **Reset System**: `resetGame()` resets game state
- **Visual Effects**: Rainbow, water waves, camera shake

### `config.js` (1,927 lines)
- **Game Constants**: `GAME_CONFIG` with all game parameters
- **Level Data**: `LEVELS[1-5]` complete level configurations
- **Terrain Arrays**: `HILLS`, `MOUNTAINS`, `GOBLIN_POSITIONS`
- **Balance Settings**: Enemy counts, speeds, ranges

### `terrain.js` (2,213 lines)
- **Procedural Textures**: 20+ texture generation functions
- **Height System**: `getTerrainHeight()` used throughout game
- **Theme Support**: Ice, desert, lava, water theme textures
- **Environment**: Tree, rock, hill mesh generation

### `audio.js` (846 lines)
- **Sound Effects**: Explosions, shooting, collectibles
- **Background Music**: Thematic music for each level
- **Spatial Audio**: 3D positional sound effects
- **Volume Control**: Master and effect volume settings

### `multiplayer.js` (270 lines)
- **Connection Management**: PeerJS setup and teardown
- **Room System**: 3-digit room codes (100-999)
- **State Sync**: 10Hz host→client, 60Hz client→host
- **Network Events**: Connection, disconnection, data transfer

## Development Guidelines

### Code Organization
1. **Module Boundaries**: Follow existing modular structure when adding features
2. **Configuration First**: Add constants to `config.js` before implementation
3. **Theme Awareness**: Always check `iceTheme`, `desertTheme`, `lavaTheme`, `waterTheme` flags
4. **Difficulty Scaling**: Use `speedMultiplier` for enemy speeds
5. **Multiplayer Compatibility**: All game state changes must sync via host

### Debugging Tools
- **God Mode**: Press `G` to toggle
  - Unlimited ammo
  - Invincibility
  - Flight (Q/E for up/down)
  - Useful for testing level boundaries and enemy AI
- **Console Logging**: Game state variables are global, inspect in browser console
- **Visual Debug**: Enemy detection ranges, collision spheres can be visualized

### Testing Multiplayer
**Local Testing:**
1. Open `index.html` in two browser windows
2. Note room code in first window (host)
3. Enter code in second window (client)
4. **Host must select difficulty** to start game for both

**Splitscreen Testing:**
1. Open `splitscreen.html?room=123&controller=0` (host)
2. Open `splitscreen.html?room=123&controller=1&splitscreen=client` (client)
3. Uses iframes with URL parameters for synchronization

### Performance Considerations
1. **Enemy Limit**: Too many enemies affects performance (current: ~70 max in hard mode)
2. **Particle Effects**: Explosions and trails are performance intensive
3. **Texture Generation**: Procedural textures are created once at startup
4. **Multiplayer Sync**: 10Hz state sync is optimized for real-time gameplay

## Known Issues & Technical Debt

### 1. ~~Monolithic `main.js`~~ **RESOLVED**
- ~~**Problem**: 44,144 line file handles everything from rendering to game logic~~
- ~~**Impact**: Hard to maintain, debug, and test~~
- **Status**: Successfully split into logical modules (15,742 total lines)
- **Current Structure**: Clean separation of concerns with dedicated modules

### 2. Math Exercise System
- **Status**: Partially implemented in `main.js`
- **Issue**: UI and integration not fully tested
- **Location**: Search for `mathExerciseActive` in `main.js`

### 3. Input Handling Conflicts
- **Issue**: Multiple input systems (keyboard, mouse, gamepad)
- **Conflict**: Gamepad support may interfere with keyboard controls
- **Debug**: Check `controllerIndex` and `bananaButtonWasPressed` variables in `main-setup.js`

### 4. Performance with Many Enemies
- **Issue**: Hard mode can have ~70+ enemies which affects performance
- **Optimization**: Consider culling distant enemies or simplifying AI
- **Module**: Enemy updates in `main-gameplay.js`

## File-Specific Notes

### `config.js` (1,927 lines)
- **Structure**: `GAME_CONFIG` constants + `LEVELS` array + terrain data arrays
- **Key Arrays**: `HILLS`, `MOUNTAINS`, `TREES_LEVEL1`, `GOBLIN_POSITIONS`
- **Level Data**: Each level has specific enemy positions, terrain, and theme
- **Editing**: Be careful with array indices and object references

### `terrain.js` (2,213 lines)
- **Pattern**: All functions are globally available
- **Texture Generation**: 20+ procedural texture functions
- **No Exports**: Functions called directly from other modules
- **Theme Support**: Most functions take `iceTheme`, `desertTheme`, etc. parameters

### `audio.js` (846 lines)
- **Audio Class**: `Audio` singleton with static methods
- **Background Music**: Loopable tracks with theme variations
- **3D Audio**: Positional sound effects using Web Audio API
- **Volume Control**: Separate controls for music and sound effects

### `multiplayer.js` (270 lines)
- **Architecture**: Host-client with PeerJS
- **Sync Rate**: Host→Client: 10Hz, Client→Host: 60Hz
- **State Sync**: Full game state serialized/deserialized in `main-setup.js`
- **Connection**: Auto-generates room codes, handles disconnects

## Quick Reference

### Common Tasks
1. **Change enemy count**: Modify `LEVELS[x].goblins` array in `config.js`
2. **Adjust player speed**: Modify `GAME_CONFIG.PLAYER_SPEED` in `config.js`
3. **Add new power-up**: Add to item creation in `main-entities.js`
4. **Debug collision**: Enable god mode (`G` key) and inspect collision spheres
5. **Test multiplayer**: Use two browser windows with same room code
6. **Test splitscreen**: Open `splitscreen.html` in browser

### Module-Specific Code Locations
- **Player Controls**: `main-setup.js` lines ~1400-1600
- **Enemy AI**: `main-gameplay.js` functions like `updateGoblins()`
- **Collision Detection**: `main-gameplay.js` `checkCollisions()` function
- **HUD/UI**: `main-loop.js` `drawHUD()` function
- **Multiplayer Sync**: `main-setup.js` `getFullGameSyncData()` and `applyFullGameSync()`

### Theme-Specific Code Locations
- **Ice Theme**: `iceTheme` flag, texture functions in `terrain.js`
- **Desert Theme**: `desertTheme` flag, pyramids and sandstone colors
- **Lava Theme**: `lavaTheme` flag, lava monsters and trails in `main-entities.js`
- **Water Theme**: `waterTheme` flag, fully implemented with boats, sharks, and octopuses

### Key Global Functions
- `getTerrainHeight(x, z)` - From `terrain.js`, get height at position
- `initGame()` - From `main.js`, main initialization
- `animate()` - From `main-loop.js`, main game loop
- `checkCollisions()` - From `main-gameplay.js`, collision detection
- `getFullGameSyncData()` - From `main-setup.js`, multiplayer state serialization

### Game State Flow
1. User selects difficulty → `startGame()` in `main.js`
2. Level loads → `initGame()` calls module initialization functions
3. Game loop starts → `animate()` at 60fps in `main-loop.js`
4. Multiplayer sync → `multiplayer.js` handles state exchange
5. Level complete → Portal to next level or victory screen

## Contributing Guidelines

1. **Respect Module Boundaries**: Add code to the appropriate module
2. **Test Multiplayer**: All features must work in multiplayer mode
3. **Preserve Themes**: New features should support all level themes
4. **Config-Driven**: Make values configurable in `config.js` when possible
5. **Performance Aware**: Monitor frame rate with many enemies/effects
6. **Keep Simple**: Maintain traditional script loading architecture for browser compatibility

This project demonstrates sophisticated 3D game development with Three.js while maintaining a clean, modular code structure for educational purposes. The modular architecture allows for continuous expansion while the configuration system makes balancing and level design accessible.