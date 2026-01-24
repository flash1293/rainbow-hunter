# Water Level Implementation Plan

The water level (Level 5) has been added to config.js with the following features:

## Completed:
1. ✅ Level 5 configuration added to config.js
2. ✅ Water theme flag added to main.js
3. ✅ Water ground rendering with wave geometry in terrain.js
4. ✅ Sandy islands for hills in water theme

## TODO - Requires Implementation:

### 1. Water Wave Animation
Add to game loop in main.js:
```javascript
// Animate water waves
if (waterTheme && scene.userData.water) {
    const water = scene.userData.water;
    const time = Date.now() * 0.001;
    const waveData = water.userData.waveData;
    const vertices = water.userData.vertices;
    
    for (let i = 0; i < vertices.count; i++) {
        const data = waveData[i];
        const waveHeight = Math.sin(data.x * 0.1 + time) * 0.3 + 
                          Math.sin(data.z * 0.15 + time * 1.5 + data.randomPhase) * 0.2;
        vertices.setY(i, waveHeight);
    }
    vertices.needsUpdate = true;
}
```

### 2. Boat for Player
Replace bike with boat when waterTheme is true:
- Hull: Boat-shaped mesh
- Sail: Triangle sail with mast
- Rudder at back
- No wheels

### 3. Shark Fins for Goblins
When waterTheme is true, modify goblin rendering:
- Triangle fin sticking out of water
- Dark gray/blue color
- Simple geometric shape
- Position slightly above water surface

### 4. Octopus for Guardians
When waterTheme is true, modify guardian rendering:
- Bulbous head/body
- 8 tentacles
- Purple/red coloring
- Tentacle animation

### 5. Other Player Boat
Modify other player rendering to show boat in multiplayer

## Current Status:
The level configuration is complete and the water surface will render with a blue water plane. However, the visual elements (boat, shark fins, octopus) still need to be implemented in the player and enemy creation functions.

The implementation would require modifying:
- Player creation (lines 500-720 in main.js)
- Goblin creation (createGoblin function)
- Guardian creation (createGuardianGoblin function)
- Other player creation (around line 728 in main.js)
