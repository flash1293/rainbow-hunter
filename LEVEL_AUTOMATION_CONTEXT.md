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

### 4. German Language for Wiki
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

- ❌ **Forgetting to add level to #start-level dropdown in index.html**
- ❌ Only updating wiki renderer, not creating game entity file
- ❌ Wrong collision shape for theme type
- ❌ Missing script tags in index.html
- ❌ Missing level card in wiki/build-wiki.js
- ❌ Not adding themed environment objects (trees, decorations)

## When Creating Files

1. **Copy patterns from existing files** - use Easter level (level-11) as reference
2. **Register with appropriate registry** at end of file
3. **Add script tags to index.html** in correct section order:
   - Themes section: `<!-- Themes -->`
   - Levels section: `<!-- Levels -->`  
   - Entities section: `<!-- Entities -->`
4. **Add to dropdown**: Find `<select id="start-level">` and add `<option>`

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
