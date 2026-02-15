# Level Creation Automation Context

## Project Overview
Fahrrad-Abenteuer is a 3D bicycle adventure game built with Three.js. Players navigate terrain, defeat enemies, and reach treasure across themed levels.

## Architecture
- **Traditional script loading** (no ES6 modules) - order matters in index.html
- **Registry pattern**: LEVEL_REGISTRY, THEME_REGISTRY, ENTITY_REGISTRY
- **Global state**: `G` object holds game state, theme flags like `G.easterTheme`

## Key Files

| Purpose | Location | Example |
|---------|----------|---------|
| Theme config | js/themes/theme-{name}.js | theme-easter.js |
| Level config | js/levels/level-{N}-{name}.js | level-11-easter.js |
| Game entities | js/entities/entity-{name}.js | entity-easter-bunny.js |
| Wiki entities JSON | wiki/entities.json | German descriptions |
| Wiki renderers | wiki/render-single.html | entityRenderers object |
| Wiki level cards | wiki/build-wiki.js | Hardcoded HTML ~line 430 |
| Environment objects | js/main-setup.js | Tree/decoration creation ~line 2500 |
| Collision detection | js/main-gameplay.js | Theme collision check ~line 646 |
| Procedural textures | js/terrain.js | Per-theme texture generation |
| Main HTML | index.html | Script tags + #start-level dropdown |

## level-spec.json Schema

The spec file defines everything for the new level. **Always read it first.**

- `levelNumber`, `levelName`, `themeName` - Basic identifiers
- `wikiDescription` - German description for wiki (required)
- `colors` - Sky, fog, ground, hill, grass, tree colors (hex strings)
- `environment` - treeType, rockType, decorations, hazards
- `collision` - mountainShape (circular/box), useWallCollision flag
- `newEntities[]` - Entities to create (id, name, role, description, hp, damage, tags)
- `existingEntities` - Reskin config for existing mobs
- `features` - hasRiver, hasMountains, hasTreasure, etc.
- `positions` - playerStart, portal, boss, treasure, rainbow, worldKite

## Important Patterns

### 1. Wiki vs Game Rendering are SEPARATE
- **Wiki**: `wiki/render-single.html` - `entityRenderers` object, self-contained
- **Game**: `js/entities/entity-{id}.js` - Uses shared textures, has shadows
- **You must update BOTH** - code is NOT shared between them

### 2. Collision Shape Varies by Theme
```javascript
// In main-gameplay.js ~line 646
if (G.graveyardTheme || G.ruinsTheme || G.computerTheme || G.enchantedTheme || G.easterTheme) {
    // Box collision for walls
} else {
    // Circular collision for cone mountains
}
```

### 3. Theme Flags Control Textures
Set `G.{theme}Theme = true` in level file. Terrain.js and main-setup.js use these flags.

### 4. CRITICAL: Theme Integration in Core Files (Often Forgotten!)

A new theme requires updates in MULTIPLE core files beyond just the theme/level files:

#### A. main.js - Initialize the theme flag (~line 345)
```javascript
// After "G.easterTheme = G.levelConfig.easterTheme || false;"
G.{theme}Theme = G.levelConfig.{theme}Theme || false;
```

#### B. main.js - Pass flag to terrain functions (~line 524)
```javascript
// Add G.{theme}Theme as the LAST parameter to these calls:
createGround(G.scene, THREE, ..., G.christmasTheme);
createHills(G.scene, THREE, ..., G.christmasTheme);
createMountains(G.scene, THREE, ..., G.christmasTheme);
```

#### C. terrain.js - Accept and handle the new theme parameter
```javascript
// Update function signatures:
function createGround(scene, THREE, groundColor, iceTheme, ..., christmasTheme) {
// Add theme-specific texture selection:
} else if (iceTheme || christmasTheme) {
    textureToUse = textures.grassIce;  // Snowy ground
```

#### D. terrain.js - Add theme-specific wall/mountain rendering
If the theme uses walls instead of cone mountains, add a rendering block:
```javascript
} else if (christmasTheme) {
    // Snow walls with icicles, sparkles, etc.
    const wallHeight = mtn.height;
    const wallWidth = mtn.width;
    // ... create themed wall geometry
}
```

#### E. Collision detection - Add theme to box collision check
If using wall collision, update BOTH files:
- `js/main-gameplay.js` (~line 647)
- `js/gameplay/gameplay-player.js` (~line 613)
```javascript
if (G.graveyardTheme || G.ruinsTheme || ... || G.{theme}Theme) {
    // Box collision for walls
}
```

**Without these integrations, the theme will NOT work** - ground stays green, mountains render broken, mobs use default appearances.

### 5. German Language for Wiki
All wiki descriptions must be in German.

## Wiki Image Generation

### Generate Single Image (Fast)
```bash
cd wiki && node generate-images.js <entity-id>
# Example: node generate-images.js evil-elf
# Example: node generate-images.js goblin-christmas
```

### Generate All Images (Slow)
```bash
cd wiki && node generate-images.js
```

### Visual Verification Harness
Use `wiki/verify-entity.html?entity=<id>` to verify rendered entities:
- Shows entity in 512x512 frame with checkered background
- Displays entity ID prominently
- Status indicator: green = rendered OK, red = missing renderer
- Built-in checklist of what to look for

**IMPORTANT**: The 512x512 size in the harness IS the correct wiki size. Do NOT scale entities just because they appear "small" - focus on:
- All body parts present and connected
- Colors match theme/description
- Entity not cut off at edges

## Common Mistakes to Avoid

- ❌ **Forgetting G.{theme}Theme initialization in main.js** - Theme flag never gets set!
- ❌ **Not passing theme flag to terrain functions** - Ground/hills stay green, mountains break
- ❌ **No theme-specific rendering in terrain.js** - Walls render as broken cones
- ❌ **Forgetting to add level to #start-level dropdown in index.html**
- ❌ **Not implementing special game mechanic** - Unique level features missing!
- ❌ Only updating wiki renderer, not creating game entity file
- ❌ Wrong collision shape for theme type (walls need box collision)
- ❌ Missing script tags in index.html
- ❌ Missing level card in wiki/build-wiki.js
- ❌ Not adding themed environment objects (trees, decorations)
- ❌ Forgetting to update gameplay-player.js collision (player 2 clipping through walls)
- ❌ Boss using default fireballs instead of themed projectiles

## When Creating Files

1. **Copy patterns from existing files** - use Easter level (level-11) as reference
2. **Register with appropriate registry** at end of file
3. **Add script tags to index.html** in correct section order:
   - Themes section: `<!-- Themes -->`
   - Levels section: `<!-- Levels -->`  
   - Entities section: `<!-- Entities -->`
4. **Add to dropdown**: Find `<select id="start-level">` and add `<option>`

## Special Game Mechanics (Phase J2)

Many levels have unique mechanics beyond just visual themes. Define in `level-spec.json`:

```json
"specialMechanic": {
  "name": "Present Collection",
  "description": "Collect presents for rewards, avoid decoy presents",
  "collectibles": {
    "type": "christmasPresents",
    "count": 12,
    "rewards": ["ammo", "health", "bomb", "banana", "herzman"]
  },
  "hazards": {
    "type": "decoyPresents",
    "count": 8,
    "damage": 2
  },
  "bossProjectile": {
    "type": "explosivePresent",
    "function": "createPresentProjectile"
  }
}
```

### Implementation Pattern

#### 1. Collectibles (main-setup.js after theme decorations)
```javascript
G.christmasPresents = [];
for (let i = 0; i < 12; i++) {
    const presentGroup = new THREE.Group();
    // Create mesh...
    G.christmasPresents.push({ 
        mesh: presentGroup, 
        collected: false, 
        radius: 1.5,
        x: presentX, z: presentZ,
        rewardType: rewards[Math.floor(Math.random() * rewards.length)]
    });
}
```

#### 2. Collision Detection (main-gameplay.js after candy pickups)
```javascript
if (G.christmasTheme && G.christmasPresents) {
    G.christmasPresents.forEach((pickup, idx) => {
        if (!pickup.collected) {
            const dist = /* distance check */;
            if (dist < pickup.radius) {
                pickup.collected = true;
                G.scene.remove(pickup.mesh);
                Audio.playCollectSound();
                // Grant reward based on rewardType
                switch(pickup.rewardType) {
                    case 'ammo': G.ammo = Math.min(G.ammo + 10, G.maxAmmo); break;
                    case 'health': G.playerHealth = Math.min(G.playerHealth + 1, G.maxPlayerHealth); break;
                    // ...
                }
            }
        }
    });
}
```

#### 3. Hazards (exploding items)
```javascript
G.decoyPresents = [];
// Similar pattern, but on collection:
createFireballExplosion(pickup.mesh.position.x, pickup.mesh.position.y, pickup.mesh.position.z);
Audio.playExplosionSound();
G.playerHealth -= pickup.explosionDamage;
G.damageFlashTime = Date.now();
```

#### 4. Custom Boss Projectiles (gameplay-projectiles.js)
```javascript
function createPresentProjectile(boss, targetPlayer) {
    const presentGroup = new THREE.Group();
    // Create projectile mesh...
    G.fireballs.push({
        mesh: presentGroup,
        velocity: new THREE.Vector3(...),
        radius: 2.0,
        damage: 1,
        isPresent: true,
        rotationSpeed: 0.05
    });
}
window.createPresentProjectile = createPresentProjectile;
```

#### 5. Boss Attack Integration (gameplay-boss.js)
```javascript
} else if (d.isEvilSanta) {
    createPresentProjectile(d, fireTargetPlayer);
} else {
    createDragonFireball(d, fireTargetPlayer);
}
```

## Reference: Existing Themes

| Theme | Flag | Special Features |
|-------|------|------------------|
| forest | (default) | Standard trees, mountains |
| ice | iceTheme | Sliding physics, icebergs |
| desert | desertTheme | Scarabs, tornados, pyramid |
| lava | lavaTheme | Lava pools, fire trails |
| water | waterTheme | Boats, sharks, underwater |
| candy | candyTheme | Candy trees, lollipops |
| graveyard | graveyardTheme | Tombstones, mist, walls |
| ruins | ruinsTheme | Traps, puzzle doors, walls |
| computer | computerTheme | Digital glitches, firewalls |
| enchanted | enchantedTheme | Magic portals, fairy lights |
| easter | easterTheme | Eggs, bunnies, flowers |
| christmas | christmasTheme | Snow walls, icicles, presents, decoy presents |
