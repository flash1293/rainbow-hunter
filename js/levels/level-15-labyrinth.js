// Level 15 - The Labyrinth
// Ancient overgrown labyrinth that is procedurally generated each playthrough
// Unique mechanic: Algorithmic maze generation using recursive backtracking
// The maze uses an expanded grid approach for gap-free walls
// No boss - just low-level enemies placed within the maze corridors

(function() {
    // Maze configuration
    const MAZE_COLS = 13;        // Number of cells horizontally
    const MAZE_ROWS = 19;        // Number of cells vertically (long maze)
    const CELL_SIZE = 22;        // World units per cell
    const WALL_HEIGHT = 8;       // Wall height
    const HALF_CELL = CELL_SIZE / 2;  // Each expanded grid cell is half a maze cell

    // Expanded grid dimensions
    const EXP_COLS = 2 * MAZE_COLS + 1;
    const EXP_ROWS = 2 * MAZE_ROWS + 1;

    // World dimensions (from expanded grid)
    const TOTAL_W = EXP_COLS * HALF_CELL;
    const TOTAL_H = EXP_ROWS * HALF_CELL;
    const HALF_W = TOTAL_W / 2;
    const HALF_H = TOTAL_H / 2;

    // Shuffle helper
    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // =========================================
    // Recursive Backtracking Maze Generator
    // Creates a perfect maze (exactly one path between any two cells)
    // =========================================
    function generateMaze(cols, rows) {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            grid[r] = [];
            for (let c = 0; c < cols; c++) {
                grid[r][c] = {
                    visited: false,
                    walls: { top: true, right: true, bottom: true, left: true }
                };
            }
        }

        const directions = [
            { dr: -1, dc: 0, wall: 'top', opposite: 'bottom' },
            { dr: 0, dc: 1, wall: 'right', opposite: 'left' },
            { dr: 1, dc: 0, wall: 'bottom', opposite: 'top' },
            { dr: 0, dc: -1, wall: 'left', opposite: 'right' }
        ];

        // Iterative DFS with explicit stack
        const stack = [];
        const startRow = rows - 1;
        const startCol = Math.floor(cols / 2);

        grid[startRow][startCol].visited = true;
        stack.push({ r: startRow, c: startCol });

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const { r, c } = current;

            const neighbors = [];
            for (const dir of directions) {
                const nr = r + dir.dr;
                const nc = c + dir.dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].visited) {
                    neighbors.push({ nr, nc, wall: dir.wall, opposite: dir.opposite });
                }
            }

            if (neighbors.length === 0) {
                stack.pop();
            } else {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                grid[r][c].walls[next.wall] = false;
                grid[next.nr][next.nc].walls[next.opposite] = false;
                grid[next.nr][next.nc].visited = true;
                stack.push({ r: next.nr, c: next.nc });
            }
        }

        return grid;
    }

    // =========================================
    // Build expanded boolean grid from maze
    // Maps each maze cell to a 2x2 block in the expanded grid,
    // plus wall/pillar cells between them.
    // This guarantees gap-free walls.
    // =========================================
    function buildExpandedGrid(grid, cols, rows) {
        const expanded = [];
        const expRows = 2 * rows + 1;
        const expCols = 2 * cols + 1;

        for (let er = 0; er < expRows; er++) {
            expanded[er] = [];
            for (let ec = 0; ec < expCols; ec++) {
                const isWallRow = er % 2 === 0;
                const isWallCol = ec % 2 === 0;

                if (!isWallRow && !isWallCol) {
                    // Cell interior - always open passage
                    expanded[er][ec] = false;
                } else if (isWallRow && isWallCol) {
                    // Intersection pillar - always solid
                    expanded[er][ec] = true;
                } else if (isWallRow && !isWallCol) {
                    // Horizontal wall segment
                    const c = (ec - 1) / 2;
                    const r = er / 2;
                    if (r === 0) {
                        expanded[er][ec] = true; // Top boundary
                    } else if (r === rows) {
                        expanded[er][ec] = true; // Bottom boundary
                    } else {
                        expanded[er][ec] = grid[r][c].walls.top;
                    }
                } else {
                    // Vertical wall segment
                    const r = (er - 1) / 2;
                    const c = ec / 2;
                    if (c === 0) {
                        expanded[er][ec] = true; // Left boundary
                    } else if (c === cols) {
                        expanded[er][ec] = true; // Right boundary
                    } else {
                        expanded[er][ec] = grid[r][c].walls.left;
                    }
                }
            }
        }

        // Open entrance (bottom center) and exit (top center)
        const entranceCol = Math.floor(cols / 2);
        const exitCol = Math.floor(cols / 2);
        expanded[expRows - 1][2 * entranceCol + 1] = false;
        expanded[0][2 * exitCol + 1] = false;

        return expanded;
    }

    // =========================================
    // Convert expanded grid to wall segments
    // Scans each row and merges consecutive wall cells
    // into single wide wall segments for efficiency.
    // Each wall has an explicit depth matching one expanded cell.
    // =========================================
    function expandedGridToWalls(expanded) {
        const walls = [];
        const expRows = expanded.length;
        const expCols = expanded[0].length;

        for (let er = 0; er < expRows; er++) {
            let runStart = -1;
            for (let ec = 0; ec <= expCols; ec++) {
                const isWall = ec < expCols && expanded[er][ec];
                if (isWall && runStart === -1) {
                    runStart = ec;
                } else if (!isWall && runStart !== -1) {
                    // Merge run from runStart to ec-1
                    const leftEdge = runStart * HALF_CELL - HALF_W;
                    const rightEdge = ec * HALF_CELL - HALF_W;
                    const centerX = (leftEdge + rightEdge) / 2;
                    const width = rightEdge - leftEdge;
                    const topEdge = er * HALF_CELL - HALF_H;
                    const bottomEdge = (er + 1) * HALF_CELL - HALF_H;
                    const centerZ = (topEdge + bottomEdge) / 2;

                    walls.push({
                        x: centerX,
                        z: centerZ,
                        width: width,
                        height: WALL_HEIGHT,
                        depth: HALF_CELL  // Explicit depth = one expanded cell height
                    });
                    runStart = -1;
                }
            }
        }

        return walls;
    }

    // =========================================
    // Get world position of a maze cell center
    // =========================================
    function cellToWorld(col, row) {
        const ec = 2 * col + 1;
        const er = 2 * row + 1;
        return {
            x: ec * HALF_CELL + HALF_CELL / 2 - HALF_W,
            z: er * HALF_CELL + HALF_CELL / 2 - HALF_H
        };
    }

    // =========================================
    // Place enemies in maze corridors
    // Only goblins and guardians (low-level)
    // =========================================
    function placeEnemiesInMaze(cols, rows) {
        const openCells = [];

        // Skip entrance (last 2 rows) and exit (first 2 rows)
        for (let r = 2; r < rows - 2; r++) {
            for (let c = 0; c < cols; c++) {
                openCells.push(cellToWorld(c, r));
            }
        }

        shuffleArray(openCells);

        const goblins = [];
        const goblinCount = Math.min(20, openCells.length);
        for (let i = 0; i < goblinCount; i++) {
            const pos = openCells[i];
            const patrolRange = HALF_CELL * 0.35;
            goblins.push([pos.x, pos.z, pos.x - patrolRange, pos.x + patrolRange, 0.012 + Math.random() * 0.006]);
        }

        const guardians = [];
        const guardianCount = Math.min(12, openCells.length - goblinCount);
        for (let i = 0; i < guardianCount; i++) {
            const pos = openCells[goblinCount + i];
            const patrolRange = HALF_CELL * 0.25;
            guardians.push([pos.x, pos.z, pos.x - patrolRange, pos.x + patrolRange, 0.007 + Math.random() * 0.004]);
        }

        return { goblins: goblins, guardians: guardians };
    }

    // =========================================
    // Place items in maze corridors
    // =========================================
    function placeItemsInMaze(cols, rows) {
        const openCells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                openCells.push(cellToWorld(c, r));
            }
        }
        shuffleArray(openCells);

        let idx = 0;
        function take(count) {
            const result = [];
            for (let i = 0; i < count && idx < openCells.length; i++, idx++) {
                result.push(openCells[idx]);
            }
            return result;
        }

        return {
            ammoPositions: take(22),
            healthPositions: take(14),
            bananaPositions: take(6),
            bombPositions: take(5),
            herzmanPositions: take(4)
        };
    }

    // =========================================
    // Place decorative trees/bushes in corridors
    // =========================================
    function placeTreesInMaze(cols, rows) {
        const openCells = [];
        // Skip entrance/exit rows and some buffer
        for (let r = 1; r < rows - 1; r++) {
            for (let c = 0; c < cols; c++) {
                openCells.push(cellToWorld(c, r));
            }
        }
        shuffleArray(openCells);
        // Take a subset for trees (don't want them blocking paths too much visually)
        const treeCount = Math.min(25, Math.floor(openCells.length * 0.1));
        const trees = [];
        for (let i = 0; i < treeCount; i++) {
            trees.push({ x: openCells[i].x, z: openCells[i].z });
        }
        return trees;
    }

    // =========================================
    // Place discoverable artifacts in maze corridors
    // Interesting visual-only objects for players to find
    // =========================================
    function placeArtifactsInMaze(cols, rows) {
        const openCells = [];
        // Use interior cells only (skip entrance/exit area)
        for (let r = 3; r < rows - 3; r++) {
            for (let c = 0; c < cols; c++) {
                openCells.push(cellToWorld(c, r));
            }
        }
        shuffleArray(openCells);

        const artifactTypes = [
            'statue',       // Moss-covered stone guardian
            'runestone',    // Tall obelisk with glowing runes
            'fountain',     // Broken stone fountain with glowing water
            'skeleton',     // Ancient explorer remains with sword
            'chest',        // Old weathered treasure chest (empty)
            'sundial',      // Ancient stone sundial
            'orb',          // Mysterious floating glowing orb
            'archway'       // Crumbling stone archway
        ];

        const artifacts = [];
        const count = Math.min(12, openCells.length);
        for (let i = 0; i < count; i++) {
            artifacts.push({
                x: openCells[i].x,
                z: openCells[i].z,
                type: artifactTypes[i % artifactTypes.length]
            });
        }
        return artifacts;
    }

    // =========================================
    // Generate everything
    // =========================================
    const maze = generateMaze(MAZE_COLS, MAZE_ROWS);
    const expanded = buildExpandedGrid(maze, MAZE_COLS, MAZE_ROWS);
    const mountains = expandedGridToWalls(expanded);
    const enemies = placeEnemiesInMaze(MAZE_COLS, MAZE_ROWS);
    const items = placeItemsInMaze(MAZE_COLS, MAZE_ROWS);
    const trees = placeTreesInMaze(MAZE_COLS, MAZE_ROWS);
    const artifacts = placeArtifactsInMaze(MAZE_COLS, MAZE_ROWS);

    const playerStart = cellToWorld(Math.floor(MAZE_COLS / 2), MAZE_ROWS - 1);
    const exitPos = cellToWorld(Math.floor(MAZE_COLS / 2), 0);

    // =========================================
    // REGISTER THE LEVEL
    // =========================================
    LEVEL_REGISTRY.register(15, {
        name: "Level 15 - The Labyrinth",
        theme: 'labyrinth',

        // Player start - maze entrance (bottom center)
        playerStart: { x: playerStart.x, z: playerStart.z },

        // Portal at maze exit (top center)
        portal: { x: exitPos.x, z: exitPos.z - HALF_CELL, destinationLevel: 1 },

        // Labyrinth theme
        labyrinthTheme: true,
        skyColor: 0x6b8f71,          // Soft green overcast sky
        groundColor: 0x4a5a44,       // Earthy grey-green stone floor
        fogDensity: 0.025,           // Dense atmospheric fog
        fogColor: 0x6b8f71,          // Green-tinted fog

        hasRiver: false,
        hasMaterials: false,
        hasMountains: true,

        // Overgrown colors
        hillColor: 0x5a8b4e,
        treeColor: 0x2d5a2d,
        grassColor: 0x3d7b3d,

        // Treasure at the exit
        hasTreasure: true,
        treasurePosition: { x: exitPos.x, z: exitPos.z },
        rainbow: { x: exitPos.x, z: exitPos.z + 5 },

        // No boss
        noBoss: true,
        dragon: null,
        useReaper: false,
        useEvilSanta: false,
        extraDragons: [],

        // Kite near entrance
        worldKite: { x: playerStart.x + 5, z: playerStart.z },
        iceBerg: null,

        // No hills
        hills: [],

        // Algorithmically generated gap-free maze walls
        mountains: mountains,

        // Enemies - only low-level
        goblins: enemies.goblins,
        guardians: enemies.guardians,
        wizards: [],
        giants: [],
        mummies: [],
        lavaMonsters: [],
        skeletons: [],

        // Hard mode extra goblins
        hardModeGoblins: enemies.goblins.slice(0, 10).map(function(g) {
            return [g[0] + 2, g[1] + 2, g[2], g[3], g[4] * 1.2];
        }),

        // Birds overhead
        birds: [
            [0, 0, 40, 0.01],
            [-40, -60, 35, 0.012],
            [40, 60, 38, 0.011]
        ],

        // Items
        ammoPositions: items.ammoPositions,
        healthPositions: items.healthPositions,
        bananaPositions: items.bananaPositions,
        bombPositions: items.bombPositions,
        herzmanPositions: items.herzmanPositions,

        treePositions: trees,
        rockPositions: [],
        
        // Discoverable artifacts scattered in maze corridors
        labyrinthArtifacts: artifacts
    });
})();
