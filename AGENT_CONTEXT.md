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

## Project Structure

### Root Directory
```
eat-the-rainbow/
├── index.html              # Main entry point with difficulty selection
├── splitscreen.html        # Two-player splitscreen interface
├── style.css               # Game styling and UI
├── README.md               # User-facing documentation
├── MULTIPLAYER_GUIDE.md    # Detailed multiplayer implementation guide
├── screenshot.png          # Game screenshot
└── js/                     # Modular game code (ACTIVE CODEBASE)
```

### Modular JavaScript (`js/` directory)
```
js/
├── main.js                 # Game orchestration, initialization, game loop (44,144 lines)
├── config.js               # Game constants, level configurations (8,527 lines)
├── terrain.js              # Terrain generation and procedural textures (7,847 lines)
├── audio.js                # Audio system with sound effects and music
└── multiplayer.js          # PeerJS-based multiplayer synchronization
```

## Architecture Overview

### Traditional Script Loading Architecture
The project uses **traditional script loading** (no ES6 modules):

- All JavaScript files are loaded via `<script>` tags in `index.html`:
  ```html
  <script src="js/config.js"></script>
  <script src="js/terrain.js"></script>
  <script src="js/audio.js"></script>
  <script src="js/multiplayer.js"></script>
  <script src="js/main.js"></script>
  ```
- Functions and variables are available globally after loading
- No ES6 imports/exports are used in the active codebase
This allows the game to run directly in browsers with `file:///` URLs

**Recent Cleanup**: Legacy files have been removed to simplify the codebase:
- `game.js` and `game-2d-backup.js` (monolithic legacy versions)
- `js/player.js` and `js/goblins.js` (unused ES6 module files)
- `js/main-old.js` and `js/audio-broken.js.bak` (old versions and backups)
- `water-level-guide.md` (implementation completed)

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
Levels are defined in `config.js` under `LEVELS` object (1-5). Each level has:
- `playerStart`: Initial position
- Terrain configuration (hills, mountains, trees)
- Theme flags (`iceTheme`, `desertTheme`, `lavaTheme`, `waterTheme`)
- Enemy configurations (goblins, guardians, wizards, etc.)
- Special features (river, bridge, treasure, portal)

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
1. **Regular Goblins** - Basic patrol and chase AI
2. **Guardian Goblins** - Elite enemies with bows (hard mode)
3. **Wizards** - Spellcasters with projectile attacks
4. **Mummies** - Desert-themed enemies
5. **Lava Monsters** - Lava-themed with trail effects
6. **Dragon Boss** - Final boss with fireballs and 50 HP

**AI Patterns:**
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

**Player Implementation**:
- Player logic is implemented directly in `main.js` (not as a separate class)
- Bike + rider mesh with customizable colors
- Terrain-following movement
- Multiplayer differentiation (host/client colors)

## Adding New Features

### 1. Adding a New Enemy Type
**Step 1 - Define in `config.js`:**
```javascript
// Add to level configuration
LEVELS[1].newEnemies = [
    { x: 10, z: 20, patrolLeft: 5, patrolRight: 15, speed: 0.01 }
];

// Add enemy-specific constants
GAME_CONFIG.NEW_ENEMY_RANGE = 25;
GAME_CONFIG.NEW_ENEMY_FIRE_INTERVAL = 3000;
```

**Step 2 - Create enemy in `main.js`:**
- Add creation function (model existing `createGoblin` or `createGuardianGoblin` functions in `main.js`)
- Add to enemy arrays: `enemies.push(newEnemy)`
- Implement AI in game loop (model existing `updateGoblins` function)

**Step 3 - Add update logic:**
- Add to enemy update loop in `animate()` function
- Handle collisions, attacks, and death

**Step 4 - Multiplayer sync:**
- Add to game state synchronization in `multiplayer.js`
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

**Step 2 - Implement in `main.js`:**
- Add to game state variables
- Implement in `animate()` game loop
- Add UI indicators to HUD rendering

**Step 3 - Add controls:**
- Add key event listener
- Implement activation logic

**Step 4 - Multiplayer sync:**
- Add to game state synchronization
- Handle host-authoritative validation

### 4. Modifying Player Appearance
**For theme-specific player models:**
1. Check current theme in player creation (lines ~500-720 in `main.js`)
2. Create conditional mesh generation based on theme
3. Example: Boat for water level (fully implemented - see water theme checks)

**For multiplayer differentiation:**
- Host (Girl): Pink bike (`0xFF69B4`), pink shirt, brown hair
- Client (Boy): Blue bike (`0x4169E1`), blue shirt, black hair
- Colors defined in player mesh creation

## Development Guidelines

### Code Organization
1. **Configuration First**: Add constants to `config.js` before implementation
2. **Theme Awareness**: Always check `iceTheme`, `desertTheme`, `lavaTheme`, `waterTheme` flags
3. **Difficulty Scaling**: Use `speedMultiplier` for enemy speeds
4. **Multiplayer Compatibility**: All game state changes must sync via host

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

### 1. Monolithic `main.js`
- **Problem**: 44,144 line file handles everything from rendering to game logic
- **Impact**: Hard to maintain, debug, and test
- **Workaround**: Code is organized into functions within the file (createGoblin, updateGoblins, etc.)
- **Note**: This was a deliberate choice to avoid ES6 module complexity and support direct browser execution

### 2. Math Exercise System
- **Status**: Partially implemented in `main.js`
- **Issue**: UI and integration not fully tested
- **Location**: Search for `mathExerciseActive` in `main.js`

### 3. Input Handling Conflicts
- **Issue**: Multiple input systems (keyboard, mouse, gamepad)
- **Conflict**: Gamepad support may interfere with keyboard controls
- **Debug**: Check `controllerIndex` and `bananaButtonWasPressed` variables

### 4. Performance with Many Enemies
- **Issue**: Hard mode can have ~70+ enemies which affects performance
- **Optimization**: Consider culling distant enemies or simplifying AI

## File-Specific Notes

### `config.js` (1500+ lines)
- **Structure**: `GAME_CONFIG` constants + `LEVELS` array + terrain data arrays
- **Key Arrays**: `HILLS`, `MOUNTAINS`, `TREES_LEVEL1`, `GOBLIN_POSITIONS`
- **Level Data**: Each level has specific enemy positions, terrain, and theme
- **Editing**: Be careful with array indices and object references

### `terrain.js` (2213 lines)
- **Pattern**: All functions are globally available
- **Texture Generation**: 20+ procedural texture functions
- **No Exports**: Functions called directly from `main.js`
- **Theme Support**: Most functions take `iceTheme`, `desertTheme`, etc. parameters

### `main.js` (44,144 lines)
- **Entry Point**: `initGame()` called after difficulty selection
- **Game Loop**: `animate()` function runs at 60fps with fixed timestep updates
- **Sections**:
  - Lines 1-400: Game state and initialization
  - Lines 400-800: Player creation and controls
  - Lines 800-1500: Terrain and environment setup
  - Lines 1500-3000: Enemy creation and items
  - Lines 3000-8000: Game logic functions (createGoblin, updateGoblins, etc.)
  - Lines 8000-10452: Game loop, multiplayer sync, and rendering
- **Global Access**: Modifies DOM, handles audio, manages all game objects

### `multiplayer.js`
- **Architecture**: Host-client with PeerJS
- **Sync Rate**: Host→Client: 10Hz, Client→Host: 60Hz
- **State Sync**: Full game state serialized/deserialized
- **Connection**: Auto-generates room codes, handles disconnects

## Quick Reference

### Common Tasks
1. **Change enemy count**: Modify `LEVELS[x].goblins` array in `config.js`
2. **Adjust player speed**: Modify `GAME_CONFIG.PLAYER_SPEED` in `config.js`
3. **Add new power-up**: Add to item creation in `main.js` (~lines 2700-2900)
4. **Debug collision**: Enable god mode (`G` key) and inspect collision spheres
5. **Test multiplayer**: Use two browser windows with same room code
6. **Test splitscreen**: Open `splitscreen.html` in browser

### Theme-Specific Code Locations
- **Ice Theme**: `iceTheme` flag, texture functions in `terrain.js`
- **Desert Theme**: `desertTheme` flag, pyramids and sandstone colors
- **Lava Theme**: `lavaTheme` flag, lava monsters and trails
- **Water Theme**: `waterTheme` flag, fully implemented with boats, sharks, and octopuses

### Key Global Functions (from `terrain.js`)
- `getTerrainHeight(x, z)` - Get height at position
- `createGround()` - Create terrain plane
- `createHills()` - Add hill meshes
- `getTerrainTextures()` - Get theme-appropriate textures
- `generateExplosionTexture()` - Create particle textures

### Game State Flow
1. User selects difficulty → `startGame()`
2. Level loads → `initGame()` with level config
3. Game loop starts → `animate()` at 60fps
4. Multiplayer sync → `multiplayer.js` handles state exchange
5. Level complete → Portal to next level or victory screen

## Contributing Guidelines

1. **Test Multiplayer**: All features must work in multiplayer mode
2. **Preserve Themes**: New features should support all level themes
3. **Config-Driven**: Make values configurable in `config.js` when possible
4. **Performance Aware**: Monitor frame rate with many enemies/effects
5. **Keep Simple**: Maintain traditional script loading architecture for browser compatibility

This project demonstrates sophisticated 3D game development with Three.js while maintaining approachable code structure for educational purposes. The modular architecture allows for continuous expansion while the configuration system makes balancing and level design accessible.