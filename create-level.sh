#!/bin/bash
# Level Creation Automation Script
# Usage: ./create-level.sh
# Prerequisites: 
#   - copilot CLI installed
#   - level-spec.json filled out in workspace root
#   - jq installed (brew install jq)

set -e

WORKSPACE="/Users/joereuter/Clones/eat-the-rainbow"
SPEC="$WORKSPACE/level-spec.json"
CONTEXT="LEVEL_AUTOMATION_CONTEXT.md"

# Validate spec exists
if [ ! -f "$SPEC" ]; then
    echo "Error: level-spec.json not found at $SPEC"
    exit 1
fi

# Extract key values
LEVEL_NUM=$(jq -r '.levelNumber' "$SPEC")
LEVEL_NAME=$(jq -r '.levelName' "$SPEC")
THEME=$(jq -r '.themeName' "$SPEC")

# Setup logging
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$WORKSPACE/level-creation-logs"
SESSION_LOG="$LOG_DIR/session_${LEVEL_NUM}_${THEME}_${TIMESTAMP}.log"
mkdir -p "$LOG_DIR"

# Function to run copilot with logging
run_copilot() {
    local step_name="$1"
    local prompt="$2"
    echo "" >> "$SESSION_LOG"
    echo "========== [$step_name] $(date) ==========" >> "$SESSION_LOG"
    echo "PROMPT: $prompt" >> "$SESSION_LOG"
    echo "---" >> "$SESSION_LOG"
    copilot -p "$prompt" --allow-all-tools 2>&1 | tee -a "$SESSION_LOG"
    echo "" >> "$SESSION_LOG"
}

echo "=========================================="
echo "Creating Level $LEVEL_NUM - $LEVEL_NAME"
echo "Theme: $THEME"
echo "Log: $SESSION_LOG"
echo "=========================================="

# Log header
echo "Level Creation Session Log" > "$SESSION_LOG"
echo "Level: $LEVEL_NUM - $LEVEL_NAME" >> "$SESSION_LOG"
echo "Theme: $THEME" >> "$SESSION_LOG"
echo "Started: $(date)" >> "$SESSION_LOG"
echo "Spec: $SPEC" >> "$SESSION_LOG"
echo "" >> "$SESSION_LOG"

cd "$WORKSPACE"

# ==========================================
# PHASE A: Wiki Entity Definitions
# ==========================================
echo ""
echo "=== PHASE A: Wiki Entity Definitions ==="

echo "[1/14] Adding entities to wiki/entities.json..."
run_copilot "1-wiki-entities-json" "Read $CONTEXT for project context, then read level-spec.json. 

Add entries to wiki/entities.json for:

1. Each entity in the 'newEntities' array - use their id, name, description, tags, levels, health, damage directly.

2. Each entity in 'existingEntities' that has reskin:true - create a themed variant entry:
   - id: '{original-id}-$THEME' (e.g., 'goblin-$THEME')
   - name: Use the 'note' field as inspiration for a German name
   - description: German description of the themed variant
   - tags: Same as original entity
   - levels: [$LEVEL_NUM]
   - health/damage: Same as original entity (look up in existing entries)

Match the existing JSON structure exactly. Preserve all existing entries."

# ==========================================
# PHASE B: Wiki Entity Renderers (loop per entity)
# ==========================================
echo ""
echo "=== PHASE B: Wiki Entity Renderers ==="

# Get list of new entity IDs
ENTITIES=$(jq -r '.newEntities[].id' "$SPEC")

for ENTITY_ID in $ENTITIES; do
    ENTITY_NAME=$(jq -r ".newEntities[] | select(.id==\"$ENTITY_ID\") | .name" "$SPEC")
    ENTITY_ROLE=$(jq -r ".newEntities[] | select(.id==\"$ENTITY_ID\") | .role" "$SPEC")
    
    echo ""
    echo "[Loop] Creating wiki renderer for: $ENTITY_ID ($ENTITY_NAME, role: $ENTITY_ROLE)"
    
    # Step: Create renderer
    run_copilot "wiki-renderer-$ENTITY_ID" "Read $CONTEXT for project context, then read level-spec.json. Create a wiki renderer for entity '$ENTITY_ID' in wiki/render-single.html. 

Find the entityRenderers object and add a new function for '$ENTITY_ID' that returns a THREE.Group with the entity's 3D mesh.

Entity details:
- ID: $ENTITY_ID
- Name: $ENTITY_NAME  
- Role: $ENTITY_ROLE (critter=small humanoid ~1.5 units tall, tank=large ~3 units, ranged=medium with weapon, boss=large unique ~4+ units)
- Use colors appropriate for the theme from level-spec.json

Look at similar existing renderers for the same role as reference. Make sure the mesh looks good and matches the entity's character."

    # Step: Generate image and verify
    echo "[Loop] Generating and verifying image for: $ENTITY_ID"
    run_copilot "wiki-verify-$ENTITY_ID" "Read $CONTEXT for project context.

1. Run this command to generate the wiki image: cd wiki && node generate-images.js

2. Use Chrome DevTools MCP to navigate to: file://$WORKSPACE/wiki/render-single.html?entity=$ENTITY_ID

3. Take a screenshot and examine it carefully.

4. If the entity looks wrong (missing body parts, bad proportions, wrong colors, floating pieces, etc.), fix the renderer code in wiki/render-single.html and regenerate. 

5. Iterate until the entity looks good - it should be recognizable as a '$ENTITY_ROLE' type enemy that fits the theme.

Report what the final entity looks like."

done

# ==========================================
# PHASE B2: Wiki Renderers for Themed Existing Entities
# ==========================================
echo ""
echo "=== PHASE B2: Wiki Renderers for Themed Existing Entities ==="

# Get list of existing entities that need reskinning
EXISTING_ENTITIES=$(jq -r '.existingEntities | keys[]' "$SPEC")

for ENTITY_ID in $EXISTING_ENTITIES; do
    RESKIN=$(jq -r ".existingEntities.\"$ENTITY_ID\".reskin" "$SPEC")
    
    if [ "$RESKIN" = "true" ]; then
        ENTITY_NOTE=$(jq -r ".existingEntities.\"$ENTITY_ID\".note" "$SPEC")
        ENTITY_COLOR=$(jq -r ".existingEntities.\"$ENTITY_ID\".color" "$SPEC")
        THEMED_ID="${ENTITY_ID}-${THEME}"
        
        echo ""
        echo "[Loop] Creating themed wiki renderer for: $THEMED_ID ($ENTITY_NOTE)"
        
        # Step: Create themed renderer based on existing entity
        run_copilot "wiki-renderer-$THEMED_ID" "Read $CONTEXT for project context, then read level-spec.json. Create a wiki renderer for themed entity '$THEMED_ID' in wiki/render-single.html.

This is a themed variant of the existing '$ENTITY_ID' entity for the $THEME theme.

1. Find the existing '$ENTITY_ID' renderer in wiki/render-single.html
2. Copy it and create a new function for '$THEMED_ID'
3. Modify it to match the theme:
   - Theme: $THEME (Christmas)
   - Note: $ENTITY_NOTE
   - Primary color: $ENTITY_COLOR
   - Add theme-appropriate details (e.g., for Christmas: santa hats, scarves, snowy textures)

Make sure it's clearly themed but still recognizable as a variant of $ENTITY_ID."

        # Step: Generate image and verify
        echo "[Loop] Generating and verifying image for: $THEMED_ID"
        run_copilot "wiki-verify-$THEMED_ID" "Read $CONTEXT for project context.

1. Run this command to generate the wiki image: cd wiki && node generate-images.js

2. Use Chrome DevTools MCP to navigate to: file://$WORKSPACE/wiki/render-single.html?entity=$THEMED_ID

3. Take a screenshot and examine it carefully.

4. If the entity looks wrong, fix the renderer code in wiki/render-single.html and regenerate.

5. It should look like a $THEME-themed version of $ENTITY_ID ($ENTITY_NOTE).

Report what the final entity looks like."
    fi
done

# ==========================================
# PHASE C: Wiki Level Card
# ==========================================
echo ""
echo "=== PHASE C: Wiki Level Card ==="

echo "[2/14] Adding level card to wiki/build-wiki.js..."
run_copilot "2-wiki-level-card" "Read $CONTEXT for project context, then read level-spec.json.

Edit wiki/build-wiki.js to add a level card for Level $LEVEL_NUM. 

Find the section with existing level cards (search for 'level-card' or 'Drachenhorst' around line 430-550). Add a new level card following the same HTML structure:

- Level number: $LEVEL_NUM
- Level name: $LEVEL_NAME  
- Description: Use the 'wikiDescription' from level-spec.json (it's in German)

Make sure it appears after the existing level cards in numerical order."

echo "[3/14] Building wiki..."
run_copilot "3-build-wiki" "Run this command to rebuild the wiki: cd $WORKSPACE/wiki && node build-wiki.js

Report if it succeeds or fails."

# ==========================================
# PHASE D: Theme File
# ==========================================
echo ""
echo "=== PHASE D: Theme File ==="

echo "[4/14] Creating theme file..."
run_copilot "4-theme-file" "Read $CONTEXT for project context, then read level-spec.json.

Create the file js/themes/theme-$THEME.js following the pattern in existing theme files (especially theme-easter.js as reference).

Include:
1. THEME_REGISTRY.register('$THEME', { ... })
2. name, description
3. extends: 'forest' (inherit base)
4. All colors from spec.colors (skyColor, fogColor, fogDensity, groundColor, hillColor, grassColor, treeColor)
5. themeFlags object with ${THEME}Theme: true, all others false
6. entities object with color overrides for any reskinned entities from spec.existingEntities
7. textures object matching the environment types from spec
8. features object based on spec features

Make sure hex colors are written as numbers (0x...) not strings."

# ==========================================
# PHASE E: Level File
# ==========================================
echo ""
echo "=== PHASE E: Level File ==="

echo "[5/14] Creating level file..."
run_copilot "5-level-file" "Read $CONTEXT for project context, then read level-spec.json.

Create the file js/levels/level-$LEVEL_NUM-$THEME.js following the pattern in existing level files (especially level-11-easter.js as reference).

Include:
1. LEVEL_REGISTRY.register($LEVEL_NUM, { ... })
2. name: 'Level $LEVEL_NUM - $LEVEL_NAME'
3. theme: '$THEME'
4. All positions from spec.positions (playerStart, portal, boss as 'dragon', treasure, rainbow, worldKite)
5. Theme flag: ${THEME}Theme: true
6. All colors from spec.colors
7. Feature flags from spec.features (hasRiver, hasMountains, hasTreasure, hasMaterials)
8. Enemy spawn arrays - create balanced positions across the map:
   - goblins: spec.enemies.critterCount positions spread from z:150 to z:-150
   - guardians: spec.enemies.rangedCount positions 
   - giants: spec.enemies.tankCount positions
   - extraDragons: spec.enemies.miniBossCount mini-bosses with scale:0.5, health:25

Generate reasonable x,z coordinates spread across the playable area (-60 to 60 for x, 150 to -150 for z)."

# ==========================================
# PHASE F: Game Entity Files
# ==========================================
echo ""
echo "=== PHASE F: Game Entity Files ==="

echo "[6/14] Creating game entity files for NEW entities..."
run_copilot "6-game-entities-new" "Read $CONTEXT for project context, then read level-spec.json.

For EACH entity in the 'newEntities' array, create a game entity file at js/entities/entity-{id}.js.

IMPORTANT: 
1. First read the wiki renderer code for this entity from wiki/render-single.html
2. Copy the Three.js mesh creation code
3. Adapt it for game use:
   - Wrap in function create{EntityName}(config = {}) that returns THREE.Group
   - Add castShadow = true to all meshes
   - Add receiveShadow = true to body meshes
   - Register with ENTITY_REGISTRY.register('{id}', create{EntityName})

The game entity MUST visually match the wiki renderer.

Create one file per entity in newEntities."

echo "[6b/14] Creating game entity files for THEMED existing entities..."
run_copilot "6-game-entities-themed" "Read $CONTEXT for project context, then read level-spec.json.

For EACH entity in 'existingEntities' that has reskin:true, create a game entity file at js/entities/entity-{id}-$THEME.js.

For example, if goblin has reskin:true, create js/entities/entity-goblin-$THEME.js.

IMPORTANT: 
1. First read the wiki renderer code for the themed variant (e.g., 'goblin-$THEME') from wiki/render-single.html
2. Copy the Three.js mesh creation code
3. Adapt it for game use:
   - Wrap in function create{EntityName}{Theme}(config = {}) that returns THREE.Group
   - Add castShadow = true to all meshes
   - Add receiveShadow = true to body meshes
   - Register with ENTITY_REGISTRY.register('{id}-$THEME', create{EntityName}{Theme})

The game entity MUST visually match the wiki renderer.

Create one file per themed existing entity."

echo "[6c/14] Hooking themed entities into EXISTING entity files..."
run_copilot "6-hook-themed-entities" "Read \$CONTEXT for project context, then read level-spec.json.

CRITICAL: The existing entity files (js/entities/entity-goblin.js, entity-guardian.js, entity-giant.js, entity-wizard.js) 
use CONDITIONALS inside the create functions to render different variants based on theme flags like G.easterTheme.

For EACH entity in 'existingEntities' that has reskin:true, you MUST modify the EXISTING entity file:

1. Read the existing file (e.g., js/entities/entity-goblin.js)
2. Find the chain of theme conditionals (e.g., 'if (G.waterTheme) ... else if (G.easterTheme) ...')
3. ADD a new condition: 'else if (G.\${THEME}Theme) { build{ThemedName}(goblinGrp); }'
4. ADD the builder function (e.g., buildElf) BELOW the other builder functions in the same file

The builder function code should come from the wiki renderer you created in Phase B2.

Example for entity-goblin.js with Christmas theme:
- Add: else if (G.christmasTheme) { buildElf(goblinGrp); }
- Add: function buildElf(group) { ... Three.js code from wiki ... }

Do this for ALL entities in existingEntities with reskin:true:
- goblin: add buildElf function
- guardian: add buildNutcracker function  
- giant: add buildSnowman function (or similar themed variant)
- wizard: add build{ThemeWizard} function

This step is REQUIRED - without it, the themed entities will NOT render!"

# ==========================================
# PHASE G: Environment Objects
# ==========================================
echo ""
echo "=== PHASE G: Environment Objects ==="

echo "[7/14] Adding themed environment objects..."
run_copilot "7-environment" "Read $CONTEXT for project context, then read level-spec.json.

Edit js/main-setup.js to support the new theme's environment objects.

1. Search for where tree types are handled (look for 'cactus', 'tombstone', 'lollipop' around line 2500)
2. Add a case for treeType '${THEME}' or the specific type from spec.environment.treeType
3. Search for decoration creation and add cases for items in spec.environment.decorations
4. Add conditionals checking G.${THEME}Theme where appropriate

Follow the pattern of how existing themes (candy, graveyard, easter) customize their trees and decorations.

If the theme uses standard trees/rocks, this step may just need adding the theme flag checks."

# ==========================================
# PHASE H: Collision Configuration
# ==========================================
echo ""
echo "=== PHASE H: Collision Configuration ==="

echo "[8/14] Configuring collision detection..."
USE_WALL=$(jq -r '.collision.useWallCollision' "$SPEC")

if [ "$USE_WALL" = "true" ]; then
    run_copilot "8-collision" "Read $CONTEXT for project context, then read level-spec.json.

Edit js/main-gameplay.js collision detection code.

Find the theme-based collision shape conditional (search for 'G.graveyardTheme || G.ruinsTheme' around line 646).

Add 'G.${THEME}Theme' to the condition so this theme uses box/wall collision instead of circular mountain collision.

The line should become something like:
if (G.graveyardTheme || G.ruinsTheme || G.computerTheme || G.enchantedTheme || G.easterTheme || G.${THEME}Theme) {"
else
    echo "Theme uses circular collision (default) - no changes needed"
fi

# ==========================================
# PHASE I: Update index.html - Script Tags
# ==========================================
echo ""
echo "=== PHASE I: Update index.html ==="

echo "[9/14] Adding script tags to index.html..."
run_copilot "9-script-tags" "Read $CONTEXT for project context, then read level-spec.json.

Edit index.html to add script tags for the new files:

1. Find the themes section (search for 'theme-easter.js' or '<!-- Themes -->') and add:
   <script src=\"js/themes/theme-$THEME.js\"></script>

2. Find the levels section (search for 'level-11-easter.js' or '<!-- Levels -->') and add:
   <script src=\"js/levels/level-$LEVEL_NUM-$THEME.js\"></script>

3. Find the entities section (search for 'entity-easter-bunny.js' or '<!-- Entities -->') and add script tags for:
   a) Each new entity file from spec.newEntities:
      <script src=\"js/entities/entity-{id}.js\"></script>
   b) Each themed existing entity (where reskin:true in existingEntities):
      <script src=\"js/entities/entity-{id}-$THEME.js\"></script>
      For example: entity-goblin-$THEME.js, entity-guardian-$THEME.js, entity-giant-$THEME.js

Add them in the appropriate sections, after the existing entries of the same type."

# ==========================================
# PHASE J: Update index.html - Dropdown
# ==========================================
echo ""
echo "=== PHASE J: Level Dropdown ==="

echo "[10/14] Adding level to dropdown menu..."
run_copilot "10-dropdown" "Read $CONTEXT for project context, then read level-spec.json.

THIS IS CRITICAL - DO NOT SKIP.

Edit index.html to add the new level to the level selector dropdown.

1. Find the <select id=\"start-level\"> element
2. Find the last <option> element (should be Level 11 - Easter Meadow or similar)
3. Add a new option AFTER it:
   <option value=\"$LEVEL_NUM\">🎨 Level $LEVEL_NUM - $LEVEL_NAME</option>

Verify the option is inside the <select> element and properly formatted."

# ==========================================
# PHASE K: Wiki Verification
# ==========================================
echo ""
echo "=== PHASE K: Wiki Verification ==="

echo "[11/14] Verifying wiki..."
run_copilot "11-verify-wiki" "Use Chrome DevTools MCP to:

1. Navigate to: file://$WORKSPACE/wiki/index.html
2. Take a screenshot
3. Verify:
   - The new level card for Level $LEVEL_NUM appears
   - Images for new entities appear in the wiki

Report what you see and any issues."

# ==========================================
# PHASE L: Game Verification
# ==========================================
echo ""
echo "=== PHASE L: Game Verification ==="

echo "[12/14] Verifying game loads..."
run_copilot "12-verify-game-start" "Use Chrome DevTools MCP to:

1. Navigate to: file://$WORKSPACE/index.html
2. Take a screenshot of the start screen
3. VERIFY that 'Level $LEVEL_NUM - $LEVEL_NAME' appears in the level dropdown
4. If the dropdown doesn't show the new level, fix index.html and screenshot again

Report what you see."

echo "[13/14] Testing level rendering..."
run_copilot "13-verify-level-render" "Use Chrome DevTools MCP to:

1. Navigate to: file://$WORKSPACE/index.html
2. Select Level $LEVEL_NUM from the dropdown
3. Click start/play to begin the level
4. Take a screenshot of the rendered level
5. Check browser console for errors

Verify:
- Terrain loads with correct colors
- Trees/decorations are visible and themed
- Enemies spawn (you may see them in the distance)
- Boss area is visible
- No console errors

Report what renders and any issues found."

# ==========================================
# COMPLETE
# ==========================================
# Log completion
echo "" >> "$SESSION_LOG"
echo "=========================================" >> "$SESSION_LOG"
echo "Session completed: $(date)" >> "$SESSION_LOG"
echo "=========================================" >> "$SESSION_LOG"

echo ""
echo "=========================================="
echo "Level $LEVEL_NUM - $LEVEL_NAME COMPLETE"
echo "=========================================="
echo ""
echo "Session log saved to: $SESSION_LOG"
echo ""
echo "Manual verification checklist:"
echo "[ ] Open index.html in browser"
echo "[ ] Select Level $LEVEL_NUM from dropdown"
echo "[ ] Verify level loads without console errors"
echo "[ ] Check terrain colors match spec"
echo "[ ] Check trees/decorations are themed"
echo "[ ] Check enemies spawn correctly"
echo "[ ] Check boss is visible"
echo "[ ] Play through to verify collision works"
echo "[ ] Check wiki at wiki/index.html"
echo ""
