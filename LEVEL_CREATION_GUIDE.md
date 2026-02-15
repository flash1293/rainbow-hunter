# Level Creation Guide

This document describes the workflow for creating a new level in Fahrrad-Abenteuer with AI assistance.

## Prerequisites

Before starting, read [AGENT_CONTEXT.md](AGENT_CONTEXT.md) to understand:
- Project structure and architecture
- Registry pattern (LEVEL_REGISTRY, THEME_REGISTRY, ENTITY_REGISTRY)
- How existing levels and themes are organized
- Key files and their responsibilities

**Chrome DevTools MCP:** Use throughout for visual iteration:
- Game: `file:///Users/joereuter/Clones/eat-the-rainbow/index.html`
- Wiki: `file:///Users/joereuter/Clones/eat-the-rainbow/wiki/index.html`

## Phase 1: Theme Ideation

The user provides an idea for a new level theme. Examples of existing themes:
- Dragon's Lair (forest)
- Frozen Wastes (ice)
- Scorching Sands (desert)
- Lava Caves (volcanic)
- Deep Waters (ocean)
- Candy Kingdom (fantasy candy)
- Haunted Graveyard (spooky)
- Ancient Ruins (ancient temple)
- Computer World (digital/cyber)
- Enchanted Forest (magical)

## Phase 2: Collaborative Design

Iterate with the user to define the following elements:

### 2.1 Mob Selection

Define which enemies will appear in the level. Each level needs a balanced roster:

| Role | Description | Examples from Existing Levels |
|------|-------------|-------------------------------|
| **Small Critter** | Basic ground enemy, low HP, melee | Goblin, Shark, Devil, Zombie |
| **Tank** | Slow, high HP, heavy damage | Giant, Executioner |
| **Small Distance Fighter** | Ranged attacks, medium HP | Guardian, Skeleton, Octopus |
| **Strong Distance Fighter** | Powerful ranged/magic, higher HP | Wizard, Lava Monster, Mummy |
| **Small Boss** | Mini-boss enemy | Witch, Greater Devil |
| **Big Boss** | Level boss, unique mechanics | Dragon, Reaper, Sea Dragon |

**Check existing entities in:**
- `js/entities/` - Entity creation code
- `wiki/entities.json` - Entity definitions with stats

**Questions to resolve:**
- Should existing mobs be reskinned for the theme, or create new ones?
- What colors/textures should themed variants have?
- What are the HP/damage values?

### 2.2 Unique Game Mechanic

Each level should have a distinctive mechanic. Examples:

| Level | Unique Mechanic |
|-------|-----------------|
| Level 1 | Bridge repair with collected materials |
| Level 2 | Ice physics, sliding movement |
| Level 3 | Sand tornados, scarab collection |
| Level 4 | Lava pools, fire trails |
| Level 5 | Boat transformation, underwater areas |
| Level 6 | Candy platforms, sugar rush power-up |
| Level 7 | Mist pools, haunted well |
| Level 8 | Ancient traps, puzzle doors |
| Level 9 | Digital glitches, firewall barriers |
| Level 10 | Magic portals, enchanted creatures |

**Questions to resolve:**
- What makes this level mechanically unique?
- How does it affect gameplay (movement, combat, objectives)?
- What new objects/hazards need to be created?

### 2.3 Environment & Visuals

Define the visual identity of the level:

**Colors:**
- `skyColor` - Background sky color
- `fogColor` - Atmospheric fog color
- `fogDensity` - How thick the fog is (0.01 = thin, 0.03 = dense)
- `groundColor` - Base terrain color
- `hillColor` - Hill/mound colors
- `grassColor` - Grass decoration color
- `treeColor` - Tree/vegetation color

**Textures:**
- Ground texture style
- Tree/vegetation style
- Rock/mountain style
- Special decorations

**Environmental Objects:**
- What natural features? (trees, rocks, water, etc.)
- What themed decorations? (tombstones, crystals, machines, etc.)
- What hazards? (lava pools, spike traps, etc.)

**Questions to resolve:**
- What's the overall mood? (bright, dark, spooky, magical)
- What time of day? (dawn, day, dusk, night)
- What weather effects? (fog, rain, snow, particles)

## Phase 3: Wiki Renderings First

**Important:** Before implementing in the game, create and validate entity visuals in the wiki system.

### 3.1 Update entities.json

Add new entities to `wiki/entities.json`:

```json
{
  "id": "new-enemy",
  "name": "New Enemy Name",
  "description": "Description of the enemy and its behavior.",
  "tags": ["Ground", "Melee"],
  "levels": [N],
  "health": 5,
  "damage": 1
}
```

### 3.2 Create Entity Rendering Code

If the entity needs new rendering code, add it to `wiki/render-single.html`:

```javascript
case 'new-enemy':
    // Create Three.js mesh for the entity
    mesh = createNewEnemy();
    break;
```

### 3.3 Generate Images

Run the image generator:

```bash
cd wiki
npm install  # First time only
node generate-images.js
```

### 3.4 Review and Iterate

Use Chrome DevTools MCP to review generated images:

1. Navigate to `file:///Users/joereuter/Clones/eat-the-rainbow/wiki/index.html`
2. Take a screenshot to see all entity images
3. If they don't look right:
   - Adjust colors, proportions, or details in render code
   - Re-run `node generate-images.js`
   - Screenshot again to compare
   - Repeat until satisfied

### 3.5 Build Wiki

Once images look good, rebuild the wiki:

```bash
cd wiki
node build-wiki.js
```

## Phase 4: Game Implementation

After wiki visuals are finalized, implement in the actual game.

### 4.1 Create Theme File

Create `js/themes/theme-<name>.js`:

```javascript
THEME_REGISTRY.register('<name>', {
    name: 'Theme Name',
    description: 'Theme description',
    extends: 'forest',  // Inherit base properties
    
    skyColor: 0x...,
    fogColor: 0x...,
    fogDensity: 0.02,
    groundColor: 0x...,
    
    // ... other colors and settings
    
    themeFlags: {
        iceTheme: false,
        desertTheme: false,
        // ...set appropriate flag to true
    },
    
    entities: {
        goblin: { color: 0x... },
        // ... entity color overrides
    },
    
    features: {
        // Level-specific features
    }
});
```

### 4.2 Create Level File

Create `js/levels/level-N-<name>.js`:

```javascript
LEVEL_REGISTRY.register(N, {
    name: "Level N - Level Name",
    theme: '<theme-name>',
    
    playerStart: { x: 0, z: 200 },
    portal: { x: 0, z: -220, destinationLevel: N+1 },
    
    // Theme flags
    <theme>Theme: true,
    skyColor: 0x...,
    groundColor: 0x...,
    fogDensity: 0.02,
    fogColor: 0x...,
    
    // Level features
    hasRiver: false,
    hasMaterials: false,
    hasMountains: true,
    hasTreasure: true,
    
    // Positions
    treasurePosition: { x: 0, z: -200 },
    rainbow: { x: 0, z: -195 },
    worldKite: { x: 5, z: 180 },
    
    // Boss
    dragon: { x: 0, z: -195, scale: 0.7 },
    
    // Terrain
    hills: [...],
    mountains: [...],
    
    // Enemies
    goblins: [...],
    guardians: [...],
    wizards: [...],
    // ... other enemies
});
```

### 4.3 Create Entity Files (if needed)

For new entity types, create `js/entities/entity-<name>.js`:

```javascript
// Entity Name
// Used by Level N

function create<EntityName>(config = {}) {
    const group = new THREE.Group();
    
    // Build the entity mesh
    // ...
    
    return group;
}

// Register with entity registry
ENTITY_REGISTRY.register('<entity-name>', create<EntityName>);
```

### 4.4 Update index.html

Add script tags for new files in the correct order:

```html
<!-- In the themes section -->
<script src="js/themes/theme-<name>.js"></script>

<!-- In the levels section -->
<script src="js/levels/level-N-<name>.js"></script>

<!-- In the entities section (if new entities) -->
<script src="js/entities/entity-<name>.js"></script>
```

**IMPORTANT:** Also add the level to the level selector dropdown:

```html
<!-- In the #start-level select element -->
<option value="N">🎨 Level N - Level Name</option>
```

### 4.5 Update Terrain (if needed)

If the theme needs special terrain textures or generation, update `js/terrain.js`:

```javascript
// Add new texture generation function
function create<Theme>Texture() {
    // ...
}

// Update existing functions to handle new theme
```

### 4.6 Update Gameplay (if needed)

For new game mechanics, update the appropriate gameplay file:
- `js/gameplay/gameplay-effects.js` - Visual effects
- `js/gameplay/gameplay-enemies.js` - Enemy AI
- `js/gameplay/gameplay-projectiles.js` - Projectile systems
- `js/gameplay/gameplay-spawns.js` - Spawning systems
- `js/gameplay/gameplay-player.js` - Player abilities

## Phase 5: Testing & Iteration

### Using Chrome DevTools MCP

Use the Chrome DevTools MCP server to verify visuals:

**URLs:**
- Game: `file:///Users/joereuter/Clones/eat-the-rainbow/index.html`
- Wiki: `file:///Users/joereuter/Clones/eat-the-rainbow/wiki/index.html`

**Workflow:**
1. Navigate to the game URL
2. Take a screenshot to verify the level renders correctly
3. Check that enemies, environment, and colors appear as expected
4. If something looks wrong, make code changes and screenshot again

**Note:** Testing gameplay mechanics (combat, AI, mechanics) isn't practical via screenshots. Visual verification is the goal - confirm the level loads and renders properly.

### 5.1 Local Testing

Open `file:///Users/joereuter/Clones/eat-the-rainbow/index.html` and:
1. Navigate to the new level
2. Verify it renders without errors (check console)
3. Confirm visual appearance matches the design

### 5.2 Checklist

- [ ] Level loads without console errors
- [ ] Environment renders (terrain, colors, objects)
- [ ] Enemies appear in correct positions
- [ ] Boss entity is visible
- [ ] Portal/treasure is placed correctly

## Checklist Summary

- [ ] Read AGENT_CONTEXT.md
- [ ] Define theme concept with user
- [ ] Choose/design mob roster
- [ ] Define unique game mechanic
- [ ] Specify environment colors and style
- [ ] Add entities to wiki/entities.json
- [ ] Create rendering code in render-single.html
- [ ] Generate and review wiki images (screenshot to verify)
- [ ] Iterate on visuals until satisfied
- [ ] Create theme file (js/themes/)
- [ ] Create level file (js/levels/)
- [ ] Create entity files if needed (js/entities/)
- [ ] Update index.html with new scripts
- [ ] Add level to index.html dropdown (#start-level)
- [ ] Update terrain.js if needed
- [ ] Update gameplay files if needed
- [ ] Verify level renders correctly (screenshot)

## Quick Reference: Existing Entity Stats

| Entity | HP | Damage | Type |
|--------|-----|--------|------|
| Goblin | 3 | 1 | Critter |
| Guardian | 5 | 1 | Ranged |
| Giant | 20 | 2 | Tank |
| Wizard | 7 | 1 | Magic |
| Mummy | 6 | 1 | Ranged |
| Skeleton | 2 | 1 | Ranged |
| Lava Monster | 8 | 1 | Ranged |
| Dragon | 50 | varies | Boss |
| Reaper | 100 | 2 | Boss |
