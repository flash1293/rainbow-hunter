# Fahrrad-Abenteuer 🚲

A 3D bicycle adventure game built with Three.js where you navigate terrain, collect materials, repair bridges, and avoid goblins to reach the treasure.

## Project Structure

```
eat-the-rainbow/
├── index.html              # Main HTML entry point
├── style.css               # Styles and difficulty menu
├── game.js                 # Legacy monolithic game file (kept for backup)
├── js/                     # Modular game code (NEW!)
│   ├── main.js            # Main game orchestration and initialization
│   ├── config.js          # Game configuration and constants
│   ├── audio.js           # Audio system (music and sound effects)
│   ├── terrain.js         # Terrain generation and environment
│   ├── player.js          # Player controls and movement
│   └── goblins.js         # Goblin AI and behavior
└── README.md              # This file
```

## Module Overview

### `js/main.js`
Main game file that orchestrates all systems. Handles:
- Game initialization and difficulty selection
- Scene setup (Three.js, camera, lighting)
- Game loop and state management
- HUD rendering

### `js/config.js`
Central configuration file containing:
- Game constants (speeds, ranges, limits)
- Terrain data (hills, mountains)
- Goblin spawn positions
- Difficulty settings

### `js/audio.js`
Complete audio system with:
- Sound effects (shooting, explosions, collecting, death, etc.)
- Background music generation (42-note melody)
- Bike engine sounds
- Goblin proximity audio
- Audio context management

### `js/terrain.js`
Terrain and environment utilities:
- Height calculation for hills
- Mesh generation for terrain features
- Mountains (world boundaries)
- River and bridge creation

### `js/player.js`
Player class managing:
- Keyboard and mouse controls (WASD + Arrow keys + Mouse look)
- Player mesh creation (bike + rider)
- Movement and rotation
- Terrain height following

### `js/goblins.js`
Goblin entity system:
- Regular goblin creation with AI
- Guardian goblin creation (elite enemies)
- AI behavior (patrol, chase, attack)
- Collision and trap detection

## Game Features

### Difficulty Levels
- **Leicht (Easy)**: 20 regular goblins, normal speeds, no guardians
- **Schwierig (Hard)**: 53 regular goblins + 12 elite guardians, 50% faster, arrow attacks

### Controls
- **WASD / Arrow Keys**: Move and turn
- **Mouse**: Aim and look around (click to lock cursor)
- **Space**: Shoot
- **R**: Restart after death/victory

### Gameplay
1. Collect materials scattered across the world
2. Avoid or shoot goblins
3. Repair the bridge with collected materials
4. Cross the river
5. Defeat guardian goblins (hard mode only)
6. Reach the treasure to win

## Technical Details

- **Engine**: Three.js r128
- **Module System**: ES6 modules for better code organization
- **Rendering**: WebGL with shadow mapping
- **Audio**: Web Audio API with procedural sound generation
- **Input**: Pointer Lock API for FPS-style mouse control

## Development

The codebase has been restructured from a single 2500-line file into modular ES6 modules:
- Each module has a single, clear responsibility
- Configuration is centralized in `config.js`
- Audio system is completely isolated
- Easy to extend with new features
- Better maintainability and testing

**Note**: The original `game.js` is kept as a backup. The new modular version uses `js/main.js` as the entry point.

To run locally, serve the files with any HTTP server (ES6 modules require HTTP/HTTPS protocol):
```bash
python -m http.server 8000
# or
npx serve
```

## Browser Compatibility

Works in all modern browsers that support:
- ES6 modules
- WebGL
- Web Audio API
- Pointer Lock API
