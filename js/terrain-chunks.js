/**
 * Infinite World Chunk Generation System
 * Generates new 200x200 chunks when player approaches world edges
 * Creates theme-appropriate terrain, environment, and enemies
 * Does NOT spawn game-critical items (portal, treasure, scarabs, presents, etc.)
 */

(function() {
    'use strict';

    const CHUNK_SIZE = 200;
    const GENERATION_DISTANCE = 150; // Distance from edge to trigger chunk generation
    const UNLOAD_DISTANCE = 500; // Chebyshev distance from player to chunk center beyond which chunk is unloaded
    const BATCH_SIZE = 20; // Number of items to process per frame

    // Track generated chunks with coordinate keys like "0,0", "200,0", etc.
    const generatedChunks = new Set();
    
    // Track chunks currently being generated (to avoid duplicate async generation)
    const generatingChunks = new Set();
    
    // Store references to chunk objects for potential cleanup
    const chunkObjects = new Map();
    
    // Track if chunks have been initialized for this level
    let chunksInitialized = false;
    
    // Queue for pending chunk generation (to limit concurrent generation)
    const chunkQueue = [];
    const queuedChunks = new Set(); // O(1) lookup to avoid per-frame chunkQueue.some() scans
    let isProcessingQueue = false;

    // Use the global getMaterial() from config.js to share material instances
    // with the main game. This avoids duplicate WebGL shader compilation when
    // chunks introduce materials identical to ones the level already uses.

    // Actual content bounds of the original level (computed in initChunks).
    // Used by isInOriginalLevel() to avoid spawning duplicate content.
    let _contentMinX = -100, _contentMaxX = 100;
    let _contentMinZ = -100, _contentMaxZ = 100;

    /**
     * Initialize chunks based on the current level's content bounds.
     * Marks chunks that are fully inside the content area as "existing"
     * so the chunk system won't regenerate them.
     * Chunks outside the content area (even if inside the 600x600 ground)
     * are left unmarked so they generate content to fill the "dead zone".
     */
    function initChunks() {
        if (chunksInitialized) return;
        chunksInitialized = true;
        
        // Calculate actual content bounds from mountains/hills.
        // Mountains define the level boundary walls. Content lives inside them.
        // Defaults are conservative (±100) — just the central spawn area.
        let minX = -100, maxX = 100, minZ = -100, maxZ = 100;
        
        if (G.levelConfig && G.levelConfig.mountains && G.levelConfig.mountains.length > 0) {
            G.levelConfig.mountains.forEach(mtn => {
                const halfWidth = (mtn.width || 50) / 2;
                minX = Math.min(minX, mtn.x - halfWidth);
                maxX = Math.max(maxX, mtn.x + halfWidth);
                minZ = Math.min(minZ, mtn.z - 50);
                maxZ = Math.max(maxZ, mtn.z + 50);
            });
        }
        
        // Also check hills for bounds
        if (G.levelConfig && G.levelConfig.hills) {
            G.levelConfig.hills.forEach(hill => {
                const radius = hill.radius || 10;
                minX = Math.min(minX, hill.x - radius);
                maxX = Math.max(maxX, hill.x + radius);
                minZ = Math.min(minZ, hill.z - radius);
                maxZ = Math.max(maxZ, hill.z + radius);
            });
        }
        
        // Store content bounds for isInOriginalLevel().
        // Inset by 15 units so chunk content can approach but not overlap original content.
        _contentMinX = minX + 15;
        _contentMaxX = maxX - 15;
        _contentMinZ = minZ + 15;
        _contentMaxZ = maxZ - 15;
        
        console.log(`[Chunks] initChunks() - content bounds: x=[${minX}, ${maxX}], z=[${minZ}, ${maxZ}]`);
        console.log(`[Chunks] initChunks() - exclusion zone: x=[${_contentMinX}, ${_contentMaxX}], z=[${_contentMinZ}, ${_contentMaxZ}]`);
        
        // Pre-mark chunks whose ENTIRE area is within the content bounds.
        // Border chunks (partially outside) generate normally to fill the dead zone.
        let preMarked = 0;
        for (let x = Math.floor(minX / CHUNK_SIZE) * CHUNK_SIZE; x <= maxX; x += CHUNK_SIZE) {
            for (let z = Math.floor(minZ / CHUNK_SIZE) * CHUNK_SIZE; z <= maxZ; z += CHUNK_SIZE) {
                if (x >= minX && x + CHUNK_SIZE <= maxX &&
                    z >= minZ && z + CHUNK_SIZE <= maxZ) {
                    generatedChunks.add(getChunkKey(x, z));
                    preMarked++;
                }
            }
        }
        console.log(`[Chunks] initChunks() - pre-marked ${preMarked} existing chunks: [${[...generatedChunks].join(', ')}]`);
    }

    /**
     * Get chunk coordinates from world position
     */
    function getChunkCoords(x, z) {
        const chunkX = Math.floor(x / CHUNK_SIZE) * CHUNK_SIZE;
        const chunkZ = Math.floor(z / CHUNK_SIZE) * CHUNK_SIZE;
        return { chunkX, chunkZ };
    }

    /**
     * Get chunk key from coordinates
     */
    function getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    /**
     * Check if chunk exists
     */
    function chunkExists(chunkX, chunkZ) {
        return generatedChunks.has(getChunkKey(chunkX, chunkZ));
    }

    /**
     * Seeded random number generator for deterministic chunk generation
     */
    function createSeededRandom(seed) {
        let s = seed;
        return function() {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    /**
     * Check if a position is within the original level's content area.
     * Uses actual content bounds (computed from mountains/hills in initChunks)
     * to avoid spawning duplicate content where the original level has content.
     */
    function isInOriginalLevel(x, z) {
        return x > _contentMinX && x < _contentMaxX && z > _contentMinZ && z < _contentMaxZ;
    }

    /**
     * Generate hills appropriate for the current theme
     */
    function generateChunkHills(chunkX, chunkZ, random) {
        const hills = [];
        const hillCount = 8 + Math.floor(random() * 8); // 8-15 hills per chunk

        for (let i = 0; i < hillCount; i++) {
            const x = chunkX + 20 + random() * (CHUNK_SIZE - 40);
            const z = chunkZ + 20 + random() * (CHUNK_SIZE - 40);
            if (isInOriginalLevel(x, z)) continue; // Don't overlap with original level
            const radius = 5 + random() * 7; // 5-12 radius
            const height = 2.5 + random() * 4; // 2.5-6.5 height

            hills.push({ x, z, radius, height });
        }

        return hills;
    }

    /**
     * Generate mountains/walls at chunk boundaries and interior features
     */
    function generateChunkMountains(chunkX, chunkZ, random, adjacentChunks) {
        const mountains = [];
        const wallHeight = 6 + random() * 4; // 6-10 units, matching typical level heights

        // Only create walls on edges that don't have adjacent chunks
        // Use large gaps between segments so player can navigate through
        
        // Helper: create wall segments along an edge with generous gaps
        function addEdgeWalls(startFixed, endFixed, fixedCoord, isHorizontal, reverse) {
            let pos = startFixed;
            while (pos < endFixed) {
                const segmentWidth = 30 + random() * 30; // 30-60 wide
                const gapWidth = 25 + random() * 30;     // 25-55 gap between segments
                
                // 60% chance to place a wall segment (skip some entirely)
                if (random() > 0.4) {
                    const offset = (random() - 0.5) * 6;
                    const h = wallHeight + (random() - 0.5) * 4;
                    const wallX = isHorizontal ? pos + segmentWidth / 2 + (random() - 0.5) * 10 : fixedCoord + offset;
                    const wallZ = isHorizontal ? fixedCoord + offset : pos + segmentWidth / 2 + (random() - 0.5) * 10;
                    if (!isInOriginalLevel(wallX, wallZ)) {
                        if (isHorizontal) {
                            mountains.push({
                                x: wallX,
                                z: wallZ,
                                width: segmentWidth + 5,
                                height: h
                            });
                        } else {
                            mountains.push({
                                x: wallX,
                                z: wallZ,
                                width: segmentWidth + 5,
                                height: h,
                                rotation: Math.PI / 2
                            });
                        }
                    }
                }
                pos += segmentWidth + gapWidth;
            }
        }

        // North edge (high Z)
        if (!adjacentChunks.north) {
            addEdgeWalls(chunkX, chunkX + CHUNK_SIZE, chunkZ + CHUNK_SIZE - 10, true);
        }
        // South edge (low Z)
        if (!adjacentChunks.south) {
            addEdgeWalls(chunkX, chunkX + CHUNK_SIZE, chunkZ + 10, true);
        }
        // East edge (high X)
        if (!adjacentChunks.east) {
            addEdgeWalls(chunkZ, chunkZ + CHUNK_SIZE, chunkX + CHUNK_SIZE - 10, false);
        }
        // West edge (low X)
        if (!adjacentChunks.west) {
            addEdgeWalls(chunkZ, chunkZ + CHUNK_SIZE, chunkX + 10, false);
        }
        
        // Occasionally add a single small interior ridge (50% chance, just 1)
        if (random() > 0.5) {
            const ridgeCenterX = chunkX + 50 + random() * (CHUNK_SIZE - 100);
            const ridgeCenterZ = chunkZ + 50 + random() * (CHUNK_SIZE - 100);
            const ridgeAngle = random() * Math.PI;
            const ridgeLength = 30 + random() * 40;
            const segmentCount = 2 + Math.floor(random() * 2); // 2-3 segments
            
            for (let s = 0; s < segmentCount; s++) {
                const t = (s / segmentCount - 0.5) * ridgeLength;
                const segX = ridgeCenterX + Math.cos(ridgeAngle) * t;
                const segZ = ridgeCenterZ + Math.sin(ridgeAngle) * t;
                const segWidth = 12 + random() * 18;
                const segHeight = (3 + random() * 3) * (1 - Math.abs(t) / ridgeLength);
                
                if (segX > chunkX + 20 && segX < chunkX + CHUNK_SIZE - 20 &&
                    segZ > chunkZ + 20 && segZ < chunkZ + CHUNK_SIZE - 20 &&
                    segHeight > 2 && !isInOriginalLevel(segX, segZ)) {
                    mountains.push({
                        x: segX,
                        z: segZ,
                        width: segWidth,
                        height: segHeight
                    });
                }
            }
        }

        return mountains;
    }

    /**
     * Generate tree positions for the chunk
     */
    function generateChunkTrees(chunkX, chunkZ, random) {
        const trees = [];
        const treeCount = 15 + Math.floor(random() * 20); // 15-35 trees

        for (let i = 0; i < treeCount; i++) {
            const x = chunkX + 15 + random() * (CHUNK_SIZE - 30);
            const z = chunkZ + 15 + random() * (CHUNK_SIZE - 30);
            if (isInOriginalLevel(x, z)) continue;
            trees.push({ x, z });
        }

        return trees;
    }

    /**
     * Generate rock positions for the chunk
     */
    function generateChunkRocks(chunkX, chunkZ, random) {
        const rocks = [];
        // Computer theme has no natural rocks
        if (G.computerTheme) return rocks;
        const rockCount = 20 + Math.floor(random() * 25); // 20-45 rocks

        for (let i = 0; i < rockCount; i++) {
            const x = chunkX + 10 + random() * (CHUNK_SIZE - 20);
            const z = chunkZ + 10 + random() * (CHUNK_SIZE - 20);
            if (isInOriginalLevel(x, z)) continue;
            rocks.push({ x, z });
        }

        return rocks;
    }

    /**
     * Generate goblin spawn positions
     */
    function generateChunkGoblins(chunkX, chunkZ, random, difficulty) {
        const goblins = [];
        const baseCount = difficulty === 'hard' ? 15 : 8;
        const goblinCount = baseCount + Math.floor(random() * 10);

        for (let i = 0; i < goblinCount; i++) {
            const x = chunkX + 25 + random() * (CHUNK_SIZE - 50);
            const z = chunkZ + 25 + random() * (CHUNK_SIZE - 50);
            const patrolRange = 3 + random() * 5;
            const speed = 0.011 + random() * 0.006;

            goblins.push([x, z, x - patrolRange, x + patrolRange, speed]);
        }

        return goblins;
    }

    /**
     * Generate guardian positions (hard mode)
     */
    function generateChunkGuardians(chunkX, chunkZ, random) {
        const guardians = [];
        const guardianCount = 3 + Math.floor(random() * 4); // 3-6 guardians

        for (let i = 0; i < guardianCount; i++) {
            const x = chunkX + 30 + random() * (CHUNK_SIZE - 60);
            const z = chunkZ + 30 + random() * (CHUNK_SIZE - 60);
            const patrolRange = 4 + random() * 4;
            const speed = 0.01 + random() * 0.004;

            guardians.push([x, z, x - patrolRange, x + patrolRange, speed]);
        }

        return guardians;
    }

    /**
     * Generate giant positions (hard mode)
     */
    function generateChunkGiants(chunkX, chunkZ, random) {
        const giants = [];
        const giantCount = 1 + Math.floor(random() * 2); // 1-2 giants

        for (let i = 0; i < giantCount; i++) {
            const x = chunkX + 40 + random() * (CHUNK_SIZE - 80);
            const z = chunkZ + 40 + random() * (CHUNK_SIZE - 80);
            const patrolRange = 8 + random() * 10;

            giants.push([x, z, x - patrolRange, x + patrolRange]);
        }

        return giants;
    }

    /**
     * Generate wizard positions (hard mode)
     */
    function generateChunkWizards(chunkX, chunkZ, random) {
        const wizards = [];
        const wizardCount = 1 + Math.floor(random() * 2); // 1-2 wizards

        for (let i = 0; i < wizardCount; i++) {
            const x = chunkX + 35 + random() * (CHUNK_SIZE - 70);
            const z = chunkZ + 35 + random() * (CHUNK_SIZE - 70);
            const patrolRange = 5 + random() * 8;
            const speed = 0.006 + random() * 0.003;

            wizards.push([x, z, x - patrolRange, x + patrolRange, speed]);
        }

        return wizards;
    }

    /**
     * Generate ammo pickup positions
     */
    function generateChunkAmmo(chunkX, chunkZ, random) {
        const ammo = [];
        const ammoCount = 8 + Math.floor(random() * 8); // 8-15 ammo drops

        for (let i = 0; i < ammoCount; i++) {
            const x = chunkX + 20 + random() * (CHUNK_SIZE - 40);
            const z = chunkZ + 20 + random() * (CHUNK_SIZE - 40);
            ammo.push({ x, z });
        }

        return ammo;
    }

    /**
     * Generate health pickup positions
     */
    function generateChunkHealth(chunkX, chunkZ, random) {
        const health = [];
        const healthCount = 3 + Math.floor(random() * 4); // 3-6 hearts

        for (let i = 0; i < healthCount; i++) {
            const x = chunkX + 25 + random() * (CHUNK_SIZE - 50);
            const z = chunkZ + 25 + random() * (CHUNK_SIZE - 50);
            health.push({ x, z });
        }

        return health;
    }

    /**
     * Generate bomb pickup positions
     */
    function generateChunkBombs(chunkX, chunkZ, random) {
        const bombs = [];
        const bombCount = 4 + Math.floor(random() * 5); // 4-8 bombs

        for (let i = 0; i < bombCount; i++) {
            const x = chunkX + 20 + random() * (CHUNK_SIZE - 40);
            const z = chunkZ + 20 + random() * (CHUNK_SIZE - 40);
            bombs.push({ x, z });
        }

        return bombs;
    }

    /**
     * Generate herzman pickup positions
     */
    function generateChunkHerzmans(chunkX, chunkZ, random) {
        const herzmans = [];
        const herzmanCount = 2 + Math.floor(random() * 3); // 2-4 herzmans per chunk

        for (let i = 0; i < herzmanCount; i++) {
            const x = chunkX + 30 + random() * (CHUNK_SIZE - 60);
            const z = chunkZ + 30 + random() * (CHUNK_SIZE - 60);
            herzmans.push({ x, z });
        }

        return herzmans;
    }

    /**
     * Generate trap positions
     */
    function generateChunkTraps(chunkX, chunkZ, random) {
        const traps = [];
        const trapCount = 6 + Math.floor(random() * 8); // 6-13 traps

        for (let i = 0; i < trapCount; i++) {
            const x = chunkX + 15 + random() * (CHUNK_SIZE - 30);
            const z = chunkZ + 15 + random() * (CHUNK_SIZE - 30);
            traps.push({ x, z });
        }

        return traps;
    }

    /**
     * Create a tree mesh based on current theme
     */
    function createChunkTree(x, z) {
        const terrainHeight = getTerrainHeight(x, z);
        const treeGroup = new THREE.Group();

        if (G.waterTheme) {
            // Palm tree for water theme
            const trunkGeometry = getGeometry('cylinder', 0.2, 0.3, 4, 8);
            const trunkMaterial = getMaterial('lambert', { color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2;
            treeGroup.add(trunk);

            // Palm fronds
            const frondMaterial = getMaterial('lambert', { color: 0x228B22 });
            for (let i = 0; i < 6; i++) {
                const frondGeometry = getGeometry('cone', 0.3, 2, 4);
                const frond = new THREE.Mesh(frondGeometry, frondMaterial);
                const angle = (i / 6) * Math.PI * 2;
                frond.position.set(Math.cos(angle) * 0.8, 4.5, Math.sin(angle) * 0.8);
                frond.rotation.z = Math.PI / 4;
                frond.rotation.y = angle;
                treeGroup.add(frond);
            }
        } else if (G.desertTheme) {
            // Cactus for desert
            const cactusGeometry = getGeometry('cylinder', 0.3, 0.4, 3, 8);
            const cactusMaterial = getMaterial('lambert', { color: 0x228B22 });
            const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
            cactus.position.y = 1.5;
            treeGroup.add(cactus);

            // Arms
            const armGeometry = getGeometry('cylinder', 0.15, 0.2, 1.5, 6);
            [-1, 1].forEach(side => {
                const arm = new THREE.Mesh(armGeometry, cactusMaterial);
                arm.position.set(side * 0.5, 2, 0);
                arm.rotation.z = side * Math.PI / 4;
                treeGroup.add(arm);
            });
        } else if (G.candyTheme) {
            // Lollipop tree
            const stickGeometry = getGeometry('cylinder', 0.15, 0.15, 4, 8);
            const stickMaterial = getMaterial('lambert', { color: 0xFFFFFF });
            const stick = new THREE.Mesh(stickGeometry, stickMaterial);
            stick.position.y = 2;
            treeGroup.add(stick);

            const candyGeometry = getGeometry('sphere', 1, 16, 16);
            const candyColors = [0xFF69B4, 0x00FF00, 0xFF4500, 0xFFD700, 0x9400D3];
            // Use position-based index for deterministic color selection (cacheable)
            const colorIndex = Math.abs(Math.floor(x + z)) % candyColors.length;
            const candyMaterial = getMaterial('lambert', { color: candyColors[colorIndex] });
            const candy = new THREE.Mesh(candyGeometry, candyMaterial);
            candy.position.y = 5;
            treeGroup.add(candy);
        } else if (G.graveyardTheme) {
            // Dead tree
            const trunkGeometry = getGeometry('cylinder', 0.2, 0.4, 4, 6);
            const trunkMaterial = getMaterial('lambert', { color: 0x3d2817 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2;
            treeGroup.add(trunk);

            // Bare branches
            const branchMaterial = getMaterial('lambert', { color: 0x2d1b0f });
            for (let i = 0; i < 4; i++) {
                const branchGeometry = getGeometry('cylinder', 0.05, 0.1, 2, 4);
                const branch = new THREE.Mesh(branchGeometry, branchMaterial);
                const angle = (i / 4) * Math.PI * 2;
                branch.position.set(Math.cos(angle) * 0.3, 3.5, Math.sin(angle) * 0.3);
                branch.rotation.z = 0.5 + Math.random() * 0.5;
                branch.rotation.y = angle;
                treeGroup.add(branch);
            }
        } else if (G.christmasTheme || G.iceTheme) {
            // Snow-covered pine
            const trunkGeometry = getGeometry('cylinder', 0.2, 0.3, 2, 8);
            const trunkMaterial = getMaterial('lambert', { color: 0x4a3728 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1;
            treeGroup.add(trunk);

            // Snow-tipped pine layers
            const pineMaterial = getMaterial('lambert', { color: 0x1a5f2a });
            const snowMaterial = getMaterial('lambert', { color: 0xFFFFFF });
            for (let i = 0; i < 3; i++) {
                const size = 1.5 - i * 0.4;
                const pineGeometry = new THREE.ConeGeometry(size, 1.5, 8);
                const pine = new THREE.Mesh(pineGeometry, pineMaterial);
                pine.position.y = 2.5 + i * 1.2;
                treeGroup.add(pine);

                // Snow cap
                const snowGeometry = new THREE.ConeGeometry(size * 0.7, 0.5, 8);
                const snow = new THREE.Mesh(snowGeometry, snowMaterial);
                snow.position.y = 3 + i * 1.2;
                treeGroup.add(snow);
            }
        } else if (G.crystalTheme) {
            // Crystal formation
            const crystalMaterial = getMaterial('lambert', { 
                color: 0xaa44ff, 
                transparent: true, 
                opacity: 0.8 
            });
            for (let i = 0; i < 4; i++) {
                const crystalGeometry = new THREE.ConeGeometry(0.3 + Math.random() * 0.3, 2 + Math.random() * 2, 5);
                const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
                crystal.position.set(
                    (Math.random() - 0.5) * 0.8,
                    1 + Math.random() * 1.5,
                    (Math.random() - 0.5) * 0.8
                );
                crystal.rotation.z = (Math.random() - 0.5) * 0.4;
                treeGroup.add(crystal);
            }
        } else if (G.computerTheme) {
            // Server tower
            const towerGeometry = getGeometry('box', 1, 4, 0.8);
            const towerMaterial = getMaterial('phong', { 
                color: 0x0A0A15, 
                emissive: 0x001133, 
                emissiveIntensity: 0.3 
            });
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.y = 2;
            treeGroup.add(tower);

            // LED lights
            const ledColors = [0x00FFFF, 0xFF00FF, 0x00FF00];
            for (let i = 0; i < 3; i++) {
                const ledGeometry = getGeometry('box', 0.1, 0.5, 0.1);
                const ledMaterial = getMaterial('basic', { color: ledColors[i] });
                const led = new THREE.Mesh(ledGeometry, ledMaterial);
                led.position.set(-0.3 + i * 0.3, 2 + i * 0.8, 0.45);
                treeGroup.add(led);
            }
        } else if (G.rapunzelTheme) {
            // Fairytale pine
            const trunkGeometry = getGeometry('cylinder', 0.25, 0.35, 3, 8);
            const trunkMaterial = getMaterial('lambert', { color: 0x6b4423 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1.5;
            treeGroup.add(trunk);

            const foliageMaterial = getMaterial('lambert', { color: 0x2d8a4e });
            for (let i = 0; i < 4; i++) {
                const size = 1.8 - i * 0.35;
                const foliageGeometry = new THREE.ConeGeometry(size, 1.8, 8);
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = 3.5 + i * 1.3;
                treeGroup.add(foliage);
            }
        } else {
            // Default forest tree
            const trunkGeometry = getGeometry('cylinder', 0.3, 0.4, 3, 8);
            const trunkMaterial = getMaterial('lambert', { color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 1.5;
            trunk.castShadow = true;
            treeGroup.add(trunk);

            const foliageGeometry = getGeometry('sphere', 1.5, 8, 8);
            const foliageMaterial = getMaterial('lambert', { color: G.treeColor || 0x228B22 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 4.5;
            foliage.castShadow = true;
            treeGroup.add(foliage);
        }

        treeGroup.position.set(x, terrainHeight, z);
        return treeGroup;
    }

    /**
     * Create a rock mesh based on current theme
     */
    function createChunkRock(x, z) {
        const terrainHeight = getTerrainHeight(x, z);
        const scale = 0.5 + Math.random() * 0.8;

        let rockMaterial;
        if (G.lavaTheme) {
            rockMaterial = getMaterial('lambert', { color: 0x2a2a2a });
        } else if (G.desertTheme) {
            rockMaterial = getMaterial('lambert', { color: 0xc4a35a });
        } else if (G.candyTheme) {
            const candyColors = [0xFF69B4, 0x87CEEB, 0xFFD700];
            // Use position-based index for deterministic color selection
            const colorIndex = Math.abs(Math.floor(x + z)) % candyColors.length;
            rockMaterial = getMaterial('lambert', { color: candyColors[colorIndex] });
        } else if (G.crystalTheme) {
            rockMaterial = getMaterial('lambert', { 
                color: 0x3a2a5a, 
                transparent: true, 
                opacity: 0.9 
            });
        } else {
            rockMaterial = getMaterial('lambert', { color: 0x808080 });
        }

        const rockGeometry = new THREE.DodecahedronGeometry(scale, 0);
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, terrainHeight + scale * 0.5, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;

        return rock;
    }

    /**
     * Create a trap mesh
     */
    function createChunkTrap(x, z) {
        const terrainHeight = getTerrainHeight(x, z);

        if (G.waterTheme) {
            // Whirlpool
            const whirlpoolGroup = new THREE.Group();
            const outerRingGeometry = getGeometry('ring', 1.5, 2.5, 24);
            const outerRingMaterial = getMaterial('basic', {
                color: 0x104080,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
            outerRing.rotation.x = -Math.PI / 2;
            outerRing.position.y = 0.1;
            whirlpoolGroup.add(outerRing);

            const innerGeometry = getGeometry('circle', 0.8, 24);
            const innerMaterial = getMaterial('basic', {
                color: 0x000020,
                transparent: true,
                opacity: 0.9
            });
            const inner = new THREE.Mesh(innerGeometry, innerMaterial);
            inner.rotation.x = -Math.PI / 2;
            inner.position.y = 0.02;
            whirlpoolGroup.add(inner);

            whirlpoolGroup.position.set(x, terrainHeight, z);
            return { mesh: whirlpoolGroup, outerRing, type: 'whirlpool', radius: 1.2, spinPhase: Math.random() * Math.PI * 2 };
        } else {
            const trapGeometry = getGeometry('plane', 2, 2);
            const trapMaterial = getMaterial('lambert', { color: 0x6a8a6a });
            const trap = new THREE.Mesh(trapGeometry, trapMaterial);
            trap.rotation.x = -Math.PI / 2;
            trap.position.set(x, terrainHeight + 0.02, z);
            trap.receiveShadow = true;
            return { mesh: trap, type: 'trap', radius: 1 };
        }
    }

    /**
     * Create ammo pickup
     */
    function createChunkAmmoPickup(x, z) {
        const terrainHeight = getTerrainHeight(x, z);
        const ammoGroup = new THREE.Group();

        // Box
        const boxGeometry = getGeometry('box', 0.8, 0.5, 0.6);
        const boxMaterial = getMaterial('lambert', { color: 0x4a3728 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 0.25;
        box.castShadow = true;
        ammoGroup.add(box);

        // Bullets
        const bulletGeometry = getGeometry('cylinder', 0.05, 0.05, 0.3, 6);
        const bulletMaterial = getMaterial('lambert', { color: 0xFFD700 });
        for (let i = 0; i < 5; i++) {
            const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
            bullet.position.set(-0.2 + i * 0.1, 0.55, 0);
            ammoGroup.add(bullet);
        }

        ammoGroup.position.set(x, terrainHeight, z);
        return { mesh: ammoGroup, collected: false, radius: 1.2, amount: 15 };
    }

    /**
     * Create health pickup
     */
    function createChunkHealthPickup(x, z) {
        const terrainHeight = getTerrainHeight(x, z);
        
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.2);
        heartShape.bezierCurveTo(0, 0.35, -0.2, 0.35, -0.2, 0.2);
        heartShape.bezierCurveTo(-0.2, 0.05, 0, -0.1, 0, -0.25);
        heartShape.bezierCurveTo(0, -0.1, 0.2, 0.05, 0.2, 0.2);
        heartShape.bezierCurveTo(0.2, 0.35, 0, 0.35, 0, 0.2);

        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.15, bevelEnabled: false });
        const heartMaterial = getMaterial('lambert', { color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 0.3 });
        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        heart.position.set(x, terrainHeight + 0.8, z);
        heart.scale.setScalar(2);
        heart.castShadow = true;

        return { mesh: heart, collected: false, radius: 1.2 };
    }

    /**
     * Create bomb pickup
     */
    function createChunkBombPickup(x, z) {
        const terrainHeight = getTerrainHeight(x, z);
        const bombGroup = new THREE.Group();

        const bodyGeometry = getGeometry('sphere', 0.4, 12, 12);
        const bodyMaterial = getMaterial('lambert', { color: 0x1a1a1a });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        body.castShadow = true;
        bombGroup.add(body);

        const fuseGeometry = getGeometry('cylinder', 0.03, 0.03, 0.3, 6);
        const fuseMaterial = getMaterial('lambert', { color: 0x8B4513 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.85;
        bombGroup.add(fuse);

        bombGroup.position.set(x, terrainHeight, z);
        return { mesh: bombGroup, collected: false, radius: 1.5 };
    }

    /**
     * Create herzman pickup (pink present box with heart decoration)
     */
    function createChunkHerzmanPickup(x, z) {
        const terrainHeight = getTerrainHeight(x, z);
        const presentGroup = new THREE.Group();
        
        // Present box base (more vertical/taller like a gift box)
        const boxGeometry = getGeometry('box', 0.7, 0.9, 0.7);
        const boxMaterial = getMaterial('lambert', { color: 0xFF69B4 }); // Hot pink
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 0.5;
        box.castShadow = true;
        presentGroup.add(box);
        
        // Fancy ribbon across
        const ribbonMaterial = getMaterial('lambert', { color: 0xFFFFFF });
        const ribbon1 = new THREE.Mesh(getGeometry('box', 0.75, 0.1, 0.15), ribbonMaterial);
        ribbon1.position.set(0, 0.5, 0);
        presentGroup.add(ribbon1);
        
        const ribbon2 = new THREE.Mesh(getGeometry('box', 0.15, 0.1, 0.75), ribbonMaterial);
        ribbon2.position.set(0, 0.5, 0);
        presentGroup.add(ribbon2);
        
        // Bow on top
        const bowGeometry = getGeometry('torus', 0.15, 0.05, 6, 12);
        const bow1 = new THREE.Mesh(bowGeometry, ribbonMaterial);
        bow1.position.set(0.12, 1.0, 0);
        bow1.rotation.y = Math.PI / 4;
        presentGroup.add(bow1);
        const bow2 = new THREE.Mesh(bowGeometry, ribbonMaterial);
        bow2.position.set(-0.12, 1.0, 0);
        bow2.rotation.y = -Math.PI / 4;
        presentGroup.add(bow2);
        
        // Heart decoration on front
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.1);
        heartShape.bezierCurveTo(0, 0.12, -0.02, 0.15, -0.08, 0.15);
        heartShape.bezierCurveTo(-0.12, 0.15, -0.12, 0.08, -0.12, 0.08);
        heartShape.bezierCurveTo(-0.12, 0.02, -0.08, -0.02, 0, -0.08);
        heartShape.bezierCurveTo(0.08, -0.02, 0.12, 0.02, 0.12, 0.08);
        heartShape.bezierCurveTo(0.12, 0.08, 0.12, 0.15, 0.08, 0.15);
        heartShape.bezierCurveTo(0.02, 0.15, 0, 0.12, 0, 0.1);
        
        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.02, bevelEnabled: false });
        const heartMaterial = getMaterial('basic', { color: 0xFF1493 });
        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        heart.position.set(0.25, 0.5, 0.36);
        heart.rotation.y = 0.2;
        heart.scale.set(1.3, 1.3, 1);
        presentGroup.add(heart);
        
        // Glow effect
        const glowGeometry = getGeometry('sphere', 0.6, 8, 8);
        const glowMaterial = getMaterial('basic', { 
            color: 0xFF69B4, 
            transparent: true, 
            opacity: 0.2 
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.5;
        presentGroup.add(glow);
        
        presentGroup.position.set(x, terrainHeight, z);
        return { mesh: presentGroup, collected: false, radius: 1.5 };
    }

    // Cached chunk ground textures (cloned once with chunk-appropriate repeat settings)
    const _chunkGroundTextures = {};

    /**
     * Get or create a chunk-sized ground texture for the given texture name.
     * Clones the base texture once and sets repeat/wrap for CHUNK_SIZE tiles.
     */
    function getChunkGroundTexture(textureName) {
        if (_chunkGroundTextures[textureName]) return _chunkGroundTextures[textureName];
        const textures = getTerrainTextures(THREE);
        const base = textures[textureName];
        if (!base) return null;
        const tex = base.clone();
        const repeats = CHUNK_SIZE / 20; // Match original tile density (600/30 = 20 units per repeat)
        tex.repeat.set(repeats, repeats);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.needsUpdate = true;
        _chunkGroundTextures[textureName] = tex;
        return tex;
    }

    /**
     * Create ground plane for a chunk
     */
    function createChunkGround(chunkX, chunkZ) {
        let color = (G.levelConfig && G.levelConfig.groundColor) || 0xffffff;

        // Select appropriate texture name based on theme
        let textureName;
        if (G.waterTheme) {
            // Water theme - create water surface
            const waterGeometry = getGeometry('plane', CHUNK_SIZE, CHUNK_SIZE, 30, 30);
            const waterTexture = generateWaterTexture ? generateWaterTexture(THREE) : getTerrainTextures(THREE).grass;
            const waterMaterial = getTexturedMaterial('lambert', {
                map: waterTexture,
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            }, 'chunkWater');
            const water = new THREE.Mesh(waterGeometry, waterMaterial);
            water.rotation.x = -Math.PI / 2;
            water.position.set(chunkX + CHUNK_SIZE / 2, -0.01, chunkZ + CHUNK_SIZE / 2);
            water.receiveShadow = true;
            return water;
        } else if (G.computerTheme) {
            // Computer theme - circuit board with glowing grid lines (matches main level)
            const group = new THREE.Group();

            // Base dark ground plane
            const geometry = getGeometry('plane', CHUNK_SIZE, CHUNK_SIZE);
            const material = getMaterial('lambert', {
                color: 0x000808,
                emissive: 0x001111,
                emissiveIntensity: 0.3
            });
            const groundPlane = new THREE.Mesh(geometry, material);
            groundPlane.rotation.x = -Math.PI / 2;
            groundPlane.position.set(chunkX + CHUNK_SIZE / 2, -0.01, chunkZ + CHUNK_SIZE / 2);
            groundPlane.receiveShadow = true;
            group.add(groundPlane);

            // Grid lines matching main level (spacing 8, 0.2 thick, cyan)
            const gridSpacing = 8;
            const gridMaterial = getMaterial('basic', {
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const majorGridMaterial = getMaterial('basic', {
                color: 0x00FFFF,
                transparent: true,
                opacity: 1.0,
                side: THREE.DoubleSide,
                depthWrite: false
            });

            // X-axis lines (running along X)
            for (let z = chunkZ; z <= chunkZ + CHUNK_SIZE; z += gridSpacing) {
                const lineGeometry = new THREE.PlaneGeometry(CHUNK_SIZE, 0.2);
                const isMajor = (Math.round(z) % 40 === 0);
                const line = new THREE.Mesh(lineGeometry, isMajor ? majorGridMaterial : gridMaterial);
                line.rotation.x = -Math.PI / 2;
                line.position.set(chunkX + CHUNK_SIZE / 2, 0.15, z);
                if (isMajor) line.scale.y = 3;
                group.add(line);
            }
            // Z-axis lines (running along Z)
            for (let x = chunkX; x <= chunkX + CHUNK_SIZE; x += gridSpacing) {
                const lineGeometry = new THREE.PlaneGeometry(0.2, CHUNK_SIZE);
                const isMajor = (Math.round(x) % 40 === 0);
                const line = new THREE.Mesh(lineGeometry, isMajor ? majorGridMaterial : gridMaterial);
                line.rotation.x = -Math.PI / 2;
                line.position.set(x, 0.15, chunkZ + CHUNK_SIZE / 2);
                if (isMajor) line.scale.x = 3;
                group.add(line);
            }

            group.renderOrder = 1;
            return group;
        } else if (G.lavaTheme || G.crystalTheme) {
            textureName = 'rock';
        } else if (G.desertTheme) {
            textureName = 'sand';
        } else if (G.candyTheme) {
            textureName = 'candy';
        } else if (G.graveyardTheme) {
            textureName = 'graveyard';
        } else if (G.iceTheme || G.christmasTheme) {
            textureName = 'grassIce';
        } else {
            textureName = 'grass';
        }

        // Get cached chunk ground texture and use getTexturedMaterial for proper caching
        const textureToUse = getChunkGroundTexture(textureName);
        const groundGeometry = getGeometry('plane', CHUNK_SIZE, CHUNK_SIZE);
        const groundMaterial = getTexturedMaterial('lambert', {
            map: textureToUse,
            color: color
        }, 'chunkGround_' + textureName);
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(chunkX + CHUNK_SIZE / 2, -0.01, chunkZ + CHUNK_SIZE / 2);
        ground.receiveShadow = true;

        return ground;
    }

    /**
     * Generate diverse enemy spawns based on theme and probability
     * Extended chunks are meant to be DANGEROUS backwaters with higher enemy density
     * and more powerful enemies including occasional bosses
     */
    function generateChunkEnemies(chunkX, chunkZ, random, difficulty) {
        const enemies = [];
        const isHard = difficulty === 'hard';
        
        // Extended chunks have moderate enemy counts (balanced for performance)
        const baseCount = isHard ? 15 : 10;
        const totalEnemies = baseCount + Math.floor(random() * 8);
        
        for (let i = 0; i < totalEnemies; i++) {
            const x = chunkX + 25 + random() * (CHUNK_SIZE - 50);
            const z = chunkZ + 25 + random() * (CHUNK_SIZE - 50);
            const patrolRange = 5 + random() * 12;
            const speed = 0.01 + random() * 0.01;
            const roll = random();
            if (isInOriginalLevel(x, z)) continue; // Don't overlap with original level
            
            // Extended chunks have MUCH higher dangerous enemy probability
            let enemyType = 'goblin';
            
            if (G.graveyardTheme) {
                // Graveyard backwater: lots of undead and reapers
                if (roll < 0.25) enemyType = 'skeleton';
                else if (roll < 0.45) enemyType = 'mummy';
                else if (roll < 0.60) enemyType = 'reaper';
                else if (roll < 0.75) enemyType = 'guardian';
                else if (roll < 0.88) enemyType = 'wizard';
                else if (roll < 0.96) enemyType = 'giant';
                else enemyType = 'goblin';
            } else if (G.desertTheme) {
                // Desert backwater: mummy swarms with wizards
                if (roll < 0.35) enemyType = 'mummy';
                else if (roll < 0.50) enemyType = 'goblin';
                else if (roll < 0.65) enemyType = 'guardian';
                else if (roll < 0.80) enemyType = 'wizard';
                else if (roll < 0.95) enemyType = 'giant';
                else enemyType = 'mummy';
            } else if (G.lavaTheme) {
                // Lava backwater: lava monster infestation
                if (roll < 0.40) enemyType = 'lavaMonster';
                else if (roll < 0.55) enemyType = 'goblin';
                else if (roll < 0.70) enemyType = 'guardian';
                else if (roll < 0.85) enemyType = 'wizard';
                else if (roll < 0.97) enemyType = 'giant';
                else enemyType = 'lavaMonster';
            } else if (G.christmasTheme) {
                // Christmas backwater: evil elf army with Santa's generals
                if (roll < 0.30) enemyType = 'evilElf';
                else if (roll < 0.45) enemyType = 'goblin';
                else if (roll < 0.60) enemyType = 'guardian';
                else if (roll < 0.78) enemyType = 'wizard';
                else if (roll < 0.93) enemyType = 'giant';
                else enemyType = 'evilSanta'; // Boss!
            } else if (G.easterTheme) {
                // Easter backwater: rabid bunny hordes
                if (roll < 0.35) enemyType = 'easterBunny';
                else if (roll < 0.50) enemyType = 'goblin';
                else if (roll < 0.65) enemyType = 'guardian';
                else if (roll < 0.80) enemyType = 'wizard';
                else if (roll < 0.95) enemyType = 'giant';
                else enemyType = 'easterBunny';
            } else if (G.crystalTheme) {
                // Crystal backwater: crystal monster lair
                if (roll < 0.30) enemyType = 'crystalGolem';
                else if (roll < 0.45) enemyType = 'goblin';
                else if (roll < 0.60) enemyType = 'guardian';
                else if (roll < 0.75) enemyType = 'wizard';
                else if (roll < 0.88) enemyType = 'crystalGiant';
                else if (roll < 0.96) enemyType = 'giant';
                else enemyType = 'gemSpecter'; // Not a boss but rare
            } else if (G.rapunzelTheme) {
                // Rapunzel backwater: dense forest with guardians and giants
                // Flying witches are special spawners, not regular enemies!
                if (roll < 0.30) enemyType = 'goblin';
                else if (roll < 0.50) enemyType = 'guardian';
                else if (roll < 0.70) enemyType = 'wizard';
                else if (roll < 0.88) enemyType = 'giant';
                else enemyType = 'goblin';
            } else if (G.enchantedTheme) {
                // Enchanted backwater: magical creature wilderness
                if (roll < 0.30) enemyType = 'goblin';
                else if (roll < 0.50) enemyType = 'guardian';
                else if (roll < 0.70) enemyType = 'wizard';
                else if (roll < 0.85) enemyType = 'giant';
                else if (roll < 0.95) enemyType = 'unicorn'; // Rare unicorn boss!
                else enemyType = 'wizard';
            } else {
                // Default/forest backwater: dangerous wilderness
                if (roll < 0.25) enemyType = 'goblin';
                else if (roll < 0.45) enemyType = 'guardian';
                else if (roll < 0.62) enemyType = 'wizard';
                else if (roll < 0.78) enemyType = 'giant';
                else if (roll < 0.88) enemyType = 'bird';
                else if (roll < 0.96) enemyType = 'dragon'; // Rare wild dragon!
                else enemyType = 'giant';
            }
            
            enemies.push({
                type: enemyType,
                x: x,
                z: z,
                patrolLeft: x - patrolRange,
                patrolRight: x + patrolRange,
                speed: speed
            });
        }
        
        // BOSS SPAWNS - ~30% chance of 1 boss per chunk (rare but dangerous)
        if (random() < 0.3) {
            const bossX = chunkX + 40 + random() * (CHUNK_SIZE - 80);
            const bossZ = chunkZ + 40 + random() * (CHUNK_SIZE - 80);
            const bossPatrol = 15 + random() * 20;
            const bossScale = 0.7 + random() * 0.3; // 0.7-1.0 scale
            const bossHealth = 40 + Math.floor(random() * 30); // 40-70 health
            
            // Select boss type based on theme - use NATIVE bosses only!
            let bossType = 'dragon'; // Default boss
            
            if (G.christmasTheme) {
                bossType = 'evilSanta'; // Native Christmas boss
            } else if (G.easterTheme) {
                bossType = 'easterBunny'; // Native Easter boss (giant bunny)
            } else if (G.enchantedTheme) {
                bossType = 'unicorn'; // Native Enchanted boss
            } else if (G.crystalTheme) {
                bossType = random() < 0.6 ? 'crystalDragon' : 'crystalGiant'; // Native Crystal bosses
            } else if (G.graveyardTheme) {
                bossType = 'reaper'; // Native Graveyard boss
            } else if (G.lavaTheme) {
                bossType = 'dragon'; // Lava uses dragons (lavaMonster is not a boss)
            } else if (G.rapunzelTheme) {
                bossType = 'dragon'; // Rapunzel uses regular dragons
            } else if (G.desertTheme) {
                bossType = 'dragon'; // Desert uses dragons
            } else {
                // Forest/water/frozen/candy/ruins/computer etc. - use dragons
                bossType = 'dragon';
            }
            
            enemies.push({
                type: bossType,
                x: bossX,
                z: bossZ,
                patrolLeft: bossX - bossPatrol,
                patrolRight: bossX + bossPatrol,
                speed: 0.008 + random() * 0.004,
                isBoss: true, // Flag to ensure boss goes to extraDragons array
                bossScale: bossScale,
                bossHealth: bossHealth
            });
        }
        
        return enemies;
    }

    /**
     * Helper to yield to the event loop using MessageChannel.
     * Unlike requestAnimationFrame (waits for next render frame, 16-1800ms with heavy scenes)
     * or setTimeout (clamped to 4ms minimum), MessageChannel fires immediately as a
     * macrotask after the current task completes, giving the browser a chance to process
     * input events without waiting for a full render cycle.
     */
    const _yieldChannel = new MessageChannel();
    let _lastYieldTime = performance.now();

    function yieldToMain() {
        return new Promise(resolve => {
            _yieldChannel.port1.onmessage = resolve;
            _yieldChannel.port2.postMessage(null);
        });
    }

    /**
     * Yield only if elapsed time since last yield exceeds budget.
     * Shared budget tracker across all phases to minimize total yields.
     * Each yield costs 50-300ms when scene has 10k+ objects, so fewer = faster.
     * @param {number} budgetMs - Max ms to work before yielding (default: 12ms)
     */
    async function yieldIfNeeded(budgetMs = 12) {
        if (performance.now() - _lastYieldTime > budgetMs) {
            await yieldToMain();
            _lastYieldTime = performance.now();
        }
    }

    /**
     * Process array items with a shared time budget, yielding when budget is exceeded.
     * Uses the shared _lastYieldTime tracker so back-to-back processBatched calls
     * don't yield unnecessarily at boundaries.
     * @param {Array} items - Items to process
     * @param {Function} processor - Function to call for each item
     * @param {number} budgetMs - Max ms to spend before yielding (default: 12ms)
     */
    async function processBatched(items, processor, budgetMs = 12) {
        for (let i = 0; i < items.length; i++) {
            processor(items[i]);
            if (performance.now() - _lastYieldTime > budgetMs && i < items.length - 1) {
                await yieldToMain();
                _lastYieldTime = performance.now();
            }
        }
    }

    /**
     * Generate and render a new chunk (async, non-blocking)
     */
    async function generateChunkAsync(chunkX, chunkZ) {
        const chunkKey = getChunkKey(chunkX, chunkZ);
        
        // Skip if already generated or currently generating
        if (generatedChunks.has(chunkKey)) {
            console.log(`[Chunks] generateChunkAsync(${chunkX}, ${chunkZ}) SKIPPED - already in generatedChunks`);
            return;
        }
        if (generatingChunks.has(chunkKey)) {
            console.log(`[Chunks] generateChunkAsync(${chunkX}, ${chunkZ}) SKIPPED - already in generatingChunks`);
            return;
        }
        
        // Mark as generating to prevent duplicate work
        generatingChunks.add(chunkKey);

        const startTime = performance.now();
        console.log(`[Chunks] generateChunkAsync(${chunkX}, ${chunkZ}) STARTED - queue remaining: ${chunkQueue.length}`);

        // Create seeded random for deterministic generation
        const seed = Math.abs(chunkX * 73856093 + chunkZ * 19349663) % 2147483647;
        const random = createSeededRandom(seed);

        // Track all objects in this chunk
        const chunkData = {
            ground: null,
            hills: [],
            mountains: [],
            mountainDataItems: [],  // mountain data objects added to G.levelConfig.mountains for collision
            trees: [],
            rocks: [],
            enemies: [],
            traps: [],
            ammo: [],
            health: [],
            bombs: [],
            herzmans: []
        };

        // Phase 1: Create ground plane for chunk
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 1: Creating ground plane`);
        const ground = createChunkGround(chunkX, chunkZ);
        G.scene.add(ground);
        chunkData.ground = ground;
        
        _lastYieldTime = performance.now(); // Reset budget at start of generation
        await yieldIfNeeded();

        // Check adjacent chunks
        const adjacentChunks = {
            north: chunkExists(chunkX, chunkZ + CHUNK_SIZE),
            south: chunkExists(chunkX, chunkZ - CHUNK_SIZE),
            east: chunkExists(chunkX + CHUNK_SIZE, chunkZ),
            west: chunkExists(chunkX - CHUNK_SIZE, chunkZ)
        };

        // Phase 2: Generate terrain data (fast, just math)
        const hillData = generateChunkHills(chunkX, chunkZ, random);
        const mountainData = generateChunkMountains(chunkX, chunkZ, random, adjacentChunks);
        const treeData = generateChunkTrees(chunkX, chunkZ, random);
        const rockData = generateChunkRocks(chunkX, chunkZ, random);

        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 2: Terrain data generated - ${hillData.length} hills, ${mountainData.length} mountains, ${treeData.length} trees, ${rockData.length} rocks. Adjacent: N=${adjacentChunks.north} S=${adjacentChunks.south} E=${adjacentChunks.east} W=${adjacentChunks.west}`);

        // NOTE: We do NOT add chunk hills to G.levelConfig.hills because:
        // 1. Chunk ground is flat (ground plane mesh)
        // 2. Adding hundreds of hills causes getTerrainHeight() to become O(n) slow
        // Hills are created visually but don't affect terrain height calculation

        await yieldIfNeeded();

        // Phase 3: Create hills and mountains
        const p3Start = performance.now();
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 3: Creating ${hillData.length} hills and ${mountainData.length} mountains`);
        
        // Capture scene children before/after to track objects added by createHills/createMountains
        // (they add directly to scene rather than returning objects)
        let beforeCount = G.scene.children.length;
        createHills(G.scene, THREE, hillData, G.hillColor, G.iceTheme, G.desertTheme, G.lavaTheme, G.waterTheme, G.candyTheme, G.graveyardTheme, G.ruinsTheme, G.computerTheme, G.christmasTheme, G.crystalTheme, G.rapunzelTheme);
        for (let i = beforeCount; i < G.scene.children.length; i++) {
            chunkData.hills.push(G.scene.children[i]);
        }

        await yieldIfNeeded();

        if (mountainData.length > 0) {
            beforeCount = G.scene.children.length;
            createMountains(G.scene, THREE, mountainData, G.candyTheme, G.graveyardTheme, G.ruinsTheme, G.computerTheme, G.enchantedTheme, G.easterTheme, G.christmasTheme, G.crystalTheme, G.rapunzelTheme);
            for (let i = beforeCount; i < G.scene.children.length; i++) {
                chunkData.mountains.push(G.scene.children[i]);
            }
            // Add mountain data to levelConfig for collision detection
            if (G.levelConfig && G.levelConfig.mountains) {
                mountainData.forEach(m => G.levelConfig.mountains.push(m));
                chunkData.mountainDataItems = mountainData.slice();
            }
        }
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 3 took ${(performance.now() - p3Start).toFixed(1)}ms`);

        await yieldIfNeeded();

        // Phase 4: Create trees in batches
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 4: Creating ${treeData.length} trees`);
        await processBatched(treeData, pos => {
            const tree = createChunkTree(pos.x, pos.z);
            G.scene.add(tree);
            chunkData.trees.push(tree);
        });

        // Phase 5: Create rocks in batches
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 5: Creating ${rockData.length} rocks`);
        await processBatched(rockData, pos => {
            const rock = createChunkRock(pos.x, pos.z);
            G.scene.add(rock);
            chunkData.rocks.push(rock);
        });

        // Phase 6: Create traps
        const trapData = generateChunkTraps(chunkX, chunkZ, random);
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 6: Creating ${trapData.length} traps`);
        await processBatched(trapData, pos => {
            const trap = createChunkTrap(pos.x, pos.z);
            G.scene.add(trap.mesh);
            G.traps.push(trap);
            chunkData.traps.push(trap);
        });

        // Phase 7: Create pickups
        const ammoData = generateChunkAmmo(chunkX, chunkZ, random);
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 7: Creating pickups - ${ammoData.length} ammo`);
        await processBatched(ammoData, pos => {
            const ammo = createChunkAmmoPickup(pos.x, pos.z);
            G.scene.add(ammo.mesh);
            if (!G.ammoPickups) G.ammoPickups = [];
            G.ammoPickups.push(ammo);
            chunkData.ammo.push(ammo);
        });

        const healthData = generateChunkHealth(chunkX, chunkZ, random);
        await processBatched(healthData, pos => {
            const health = createChunkHealthPickup(pos.x, pos.z);
            G.scene.add(health.mesh);
            if (!G.healthPickups) G.healthPickups = [];
            G.healthPickups.push(health);
            chunkData.health.push(health);
        });

        const bombData = generateChunkBombs(chunkX, chunkZ, random);
        await processBatched(bombData, pos => {
            const bomb = createChunkBombPickup(pos.x, pos.z);
            G.scene.add(bomb.mesh);
            if (!G.bombPickups) G.bombPickups = [];
            G.bombPickups.push(bomb);
            chunkData.bombs.push(bomb);
        });

        const herzmanData = generateChunkHerzmans(chunkX, chunkZ, random);
        await processBatched(herzmanData, pos => {
            const herzman = createChunkHerzmanPickup(pos.x, pos.z);
            G.scene.add(herzman.mesh);
            if (!G.herzmanPickups) G.herzmanPickups = [];
            G.herzmanPickups.push(herzman);
            chunkData.herzmans.push(herzman);
        });

        // Phase 8: Create enemies
        const difficulty = window.difficulty || 'normal';
        const enemyData = generateChunkEnemies(chunkX, chunkZ, random, difficulty);
        const p8Start = performance.now();
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 8: Creating ${enemyData.length} enemies (difficulty: ${difficulty})`);

        await processBatched(enemyData, enemy => {
            let mob = null;
            const { type, x, z, patrolLeft, patrolRight, speed, isBoss, bossScale, bossHealth } = enemy;
            
            try {
                switch (type) {
                    case 'goblin':
                        if (G.christmasTheme && typeof createGoblinChristmas === 'function') {
                            mob = createGoblinChristmas({ x, z, patrolLeft, patrolRight, speed });
                        } else if (G.crystalTheme && typeof createGoblinCrystal === 'function') {
                            mob = createGoblinCrystal({ x, z, patrolLeft, patrolRight, speed });
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'guardian':
                        if (G.christmasTheme && typeof createGuardianChristmas === 'function') {
                            mob = createGuardianChristmas({ x, z, patrolLeft, patrolRight, speed });
                        } else if (G.crystalTheme && typeof createGuardianCrystal === 'function') {
                            mob = createGuardianCrystal({ x, z, patrolLeft, patrolRight, speed });
                        } else {
                            mob = createGuardianGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'giant':
                        if (G.christmasTheme && typeof createGiantChristmas === 'function') {
                            mob = createGiantChristmas({ x, z, patrolLeft, patrolRight });
                        } else {
                            mob = createGiant(x, z, patrolLeft, patrolRight);
                        }
                        break;
                        
                    case 'crystalGiant':
                        if (typeof createCrystalGiant === 'function') {
                            const scale = isBoss && bossScale ? bossScale : 1;
                            mob = createCrystalGiant({ x, z, patrolLeft, patrolRight, scale });
                            if (isBoss && mob) {
                                if (!G.extraDragons) G.extraDragons = [];
                                G.extraDragons.push(mob);
                            }
                        } else {
                            mob = createGiant(x, z, patrolLeft, patrolRight);
                        }
                        break;
                        
                    case 'wizard':
                        if (G.christmasTheme && typeof createWizardChristmas === 'function') {
                            mob = createWizardChristmas({ x, z, patrolLeft, patrolRight, speed });
                        } else if (G.crystalTheme && typeof createWizardCrystal === 'function') {
                            mob = createWizardCrystal({ x, z, patrolLeft, patrolRight, speed });
                        } else {
                            mob = createWizard(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'skeleton':
                        if (typeof createSkeleton === 'function') {
                            mob = createSkeleton(x, z, patrolLeft, patrolRight, speed);
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'mummy':
                        if (typeof createMummy === 'function') {
                            mob = createMummy(x, z, patrolLeft, patrolRight, speed);
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'reaper':
                        if (typeof createReaper === 'function') {
                            const scale = isBoss && bossScale ? bossScale : 1;
                            const health = isBoss && bossHealth ? bossHealth : 60;
                            mob = createReaper({ x, z, patrolLeft, patrolRight, scale }, scale, health);
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'lavaMonster':
                        if (typeof createLavaMonster === 'function') {
                            mob = createLavaMonster({ x, z, patrolLeft, patrolRight, speed });
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'evilElf':
                        if (typeof createEvilElf === 'function') {
                            mob = createEvilElf({ x, z, patrolLeft, patrolRight, speed });
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'easterBunny':
                        if (typeof createEasterBunny === 'function') {
                            const scale = isBoss && bossScale ? bossScale : 1;
                            const health = isBoss && bossHealth ? bossHealth : 60;
                            mob = createEasterBunny({ x, z, patrolLeft, patrolRight, speed }, scale, health);
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'crystalGolem':
                        if (typeof createCrystalGolem === 'function') {
                            mob = createCrystalGolem({ x, z, patrolLeft, patrolRight, speed });
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'bird':
                        if (typeof createBird === 'function') {
                            mob = createBird({ x, z, patrolLeft, patrolRight });
                            if (mob && G.birds) G.birds.push(mob);
                        }
                        break;
                        
                    case 'flyingWitch':
                        if (typeof createFlyingWitch === 'function') {
                            mob = createFlyingWitch({ x, z, patrolLeft, patrolRight, speed });
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                    
                    case 'dragon':
                        if (typeof createDragon === 'function') {
                            const scale = isBoss && bossScale ? bossScale : (0.6 + Math.random() * 0.4);
                            const health = isBoss && bossHealth ? bossHealth : undefined;
                            mob = createDragon({ x, z, patrolLeft, patrolRight, patrolFront: z - 30, patrolBack: z + 30, scale, health });
                            if (mob) {
                                if (!G.extraDragons) G.extraDragons = [];
                                G.extraDragons.push(mob);
                            }
                        }
                        break;
                        
                    case 'unicorn':
                        if (typeof createUnicorn === 'function') {
                            const scale = isBoss && bossScale ? bossScale : (0.7 + Math.random() * 0.3);
                            const health = isBoss && bossHealth ? bossHealth : undefined;
                            mob = createUnicorn({ x, z, patrolLeft, patrolRight, patrolFront: z - 25, patrolBack: z + 25, scale, health });
                            if (mob) {
                                if (!G.extraDragons) G.extraDragons = [];
                                G.extraDragons.push(mob);
                            }
                        }
                        break;
                        
                    case 'evilSanta':
                        if (typeof createEvilSanta === 'function') {
                            const scale = isBoss && bossScale ? bossScale : 0.8;
                            const health = isBoss && bossHealth ? bossHealth : undefined;
                            mob = createEvilSanta({ x, z, patrolLeft, patrolRight, scale, health });
                            if (mob) {
                                if (!G.extraDragons) G.extraDragons = [];
                                G.extraDragons.push(mob);
                            }
                        } else {
                            mob = createGiant(x, z, patrolLeft, patrolRight);
                        }
                        break;
                        
                    case 'gemSpecter':
                        if (typeof createGemSpecter === 'function') {
                            mob = createGemSpecter({ x, z, patrolLeft, patrolRight, speed });
                        } else {
                            mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                        }
                        break;
                        
                    case 'crystalDragon':
                        if (typeof createCrystalDragon === 'function') {
                            const scale = isBoss && bossScale ? bossScale : (0.6 + Math.random() * 0.4);
                            const health = isBoss && bossHealth ? bossHealth : undefined;
                            mob = createCrystalDragon({ x, z, patrolLeft, patrolRight, patrolFront: z - 30, patrolBack: z + 30, scale, health });
                            if (mob) {
                                if (!G.extraDragons) G.extraDragons = [];
                                G.extraDragons.push(mob);
                            }
                        } else if (typeof createDragon === 'function') {
                            const scale = isBoss && bossScale ? bossScale : 0.7;
                            mob = createDragon({ x, z, patrolLeft, patrolRight, patrolFront: z - 30, patrolBack: z + 30, scale });
                            if (mob && !G.extraDragons) G.extraDragons = [];
                            if (mob) G.extraDragons.push(mob);
                        }
                        break;
                        
                    default:
                        mob = createGoblin(x, z, patrolLeft, patrolRight, speed);
                }
                
                if (mob) {
                    // Types that use the boss update loop (G.extraDragons) for their attacks
                    // These must ALWAYS go to extraDragons, even when not flagged as boss
                    const bossLoopTypes = ['dragon', 'unicorn', 'evilSanta', 'crystalDragon', 'reaper', 'easterBunny', 'crystalGiant'];
                    
                    if (bossLoopTypes.includes(type)) {
                        if (!G.extraDragons) G.extraDragons = [];
                        G.extraDragons.push(mob);
                    } else if (type === 'bird') {
                        // Birds handled separately
                    } else {
                        G.goblins.push(mob);
                    }
                    chunkData.enemies.push(mob);
                }
            } catch (e) {
                console.warn(`Failed to create ${type} enemy:`, e);
            }
        });
        console.log(`[Chunks] (${chunkX}, ${chunkZ}) Phase 8 took ${(performance.now() - p8Start).toFixed(1)}ms`);

        // Mark chunk as generated
        generatedChunks.add(chunkKey);
        generatingChunks.delete(chunkKey);
        chunkObjects.set(chunkKey, chunkData);
        
        const elapsed = (performance.now() - startTime).toFixed(1);
        console.log(`[Chunks] generateChunkAsync(${chunkX}, ${chunkZ}) COMPLETED in ${elapsed}ms - ${chunkData.enemies.length} enemies, ${chunkData.trees.length} trees, ${chunkData.rocks.length} rocks, ${chunkData.traps.length} traps. Total chunks: ${generatedChunks.size}, scene objects: ${G.scene.children.length}`);
    }

    /**
     * Process the chunk generation queue - only one chunk at a time
     */
    async function processChunkQueue() {
        if (isProcessingQueue) {
            console.log(`[Chunks] processChunkQueue() SKIPPED - already processing`);
            return;
        }
        isProcessingQueue = true;
        console.log(`[Chunks] processChunkQueue() STARTED - ${chunkQueue.length} chunks queued`);
        
        let processed = 0;
        while (chunkQueue.length > 0) {
            const { chunkX, chunkZ } = chunkQueue.shift();
            const chunkKey = getChunkKey(chunkX, chunkZ);
            queuedChunks.delete(chunkKey);
            
            // Skip if already generated while waiting in queue
            if (generatedChunks.has(chunkKey)) {
                console.log(`[Chunks] processChunkQueue() skipping ${chunkKey} - already generated while queued`);
                continue;
            }
            
            await generateChunkAsync(chunkX, chunkZ);
            processed++;
        }
        
        isProcessingQueue = false;
        console.log(`[Chunks] processChunkQueue() FINISHED - processed ${processed} chunks`);
    }
    
    /**
     * Synchronous wrapper that queues chunk generation
     */
    function generateChunk(chunkX, chunkZ) {
        const chunkKey = getChunkKey(chunkX, chunkZ);
        if (generatedChunks.has(chunkKey) || generatingChunks.has(chunkKey) || queuedChunks.has(chunkKey)) {
            return;
        }
        
        // Add to queue and start processing
        console.log(`[Chunks] generateChunk(${chunkX}, ${chunkZ}) QUEUED - queue length now: ${chunkQueue.length + 1}`);
        queuedChunks.add(chunkKey);
        chunkQueue.push({ chunkX, chunkZ });
        processChunkQueue();
    }

    /**
     * Check player position and generate chunks as needed
     */
    function updateChunks(playerX, playerZ) {
        // Initialize chunks based on level bounds on first call
        initChunks();
        
        const { chunkX, chunkZ } = getChunkCoords(playerX, playerZ);
        // Log once per ~60 frames to avoid spam
        if (!updateChunks._frameCount) updateChunks._frameCount = 0;
        if (updateChunks._frameCount++ % 60 === 0) {
            const localX = playerX - chunkX;
            const localZ = playerZ - chunkZ;
            console.log(`[Chunks] updateChunks() player=(${playerX.toFixed(1)}, ${playerZ.toFixed(1)}) chunk=(${chunkX}, ${chunkZ}) local=(${localX.toFixed(1)}, ${localZ.toFixed(1)}) generated=${generatedChunks.size} generating=${generatingChunks.size} queued=${chunkQueue.length}`);
        }

        // Check distance to chunk edges
        const localX = playerX - chunkX;
        const localZ = playerZ - chunkZ;

        // Generate adjacent chunks if player is near edge
        // North
        if (localZ > CHUNK_SIZE - GENERATION_DISTANCE) {
            generateChunk(chunkX, chunkZ + CHUNK_SIZE);
        }
        // South
        if (localZ < GENERATION_DISTANCE) {
            generateChunk(chunkX, chunkZ - CHUNK_SIZE);
        }
        // East
        if (localX > CHUNK_SIZE - GENERATION_DISTANCE) {
            generateChunk(chunkX + CHUNK_SIZE, chunkZ);
        }
        // West
        if (localX < GENERATION_DISTANCE) {
            generateChunk(chunkX - CHUNK_SIZE, chunkZ);
        }

        // Generate diagonal chunks if in corners
        if (localX > CHUNK_SIZE - GENERATION_DISTANCE && localZ > CHUNK_SIZE - GENERATION_DISTANCE) {
            generateChunk(chunkX + CHUNK_SIZE, chunkZ + CHUNK_SIZE);
        }
        if (localX < GENERATION_DISTANCE && localZ > CHUNK_SIZE - GENERATION_DISTANCE) {
            generateChunk(chunkX - CHUNK_SIZE, chunkZ + CHUNK_SIZE);
        }
        if (localX > CHUNK_SIZE - GENERATION_DISTANCE && localZ < GENERATION_DISTANCE) {
            generateChunk(chunkX + CHUNK_SIZE, chunkZ - CHUNK_SIZE);
        }
        if (localX < GENERATION_DISTANCE && localZ < GENERATION_DISTANCE) {
            generateChunk(chunkX - CHUNK_SIZE, chunkZ - CHUNK_SIZE);
        }

        // Periodically unload distant chunks to keep scene object count bounded
        // Check every ~120 frames (~2 seconds at 60fps)
        if (updateChunks._frameCount % 120 === 0) {
            unloadDistantChunks(playerX, playerZ);
        }
    }

    /**
     * Unload a single chunk: remove all its objects from the scene and global arrays.
     * Only chunks tracked in chunkObjects (i.e., chunks WE generated) can be unloaded.
     * Level-original chunks (marked in generatedChunks by initChunks but not in chunkObjects) are safe.
     */
    function unloadChunk(chunkKey) {
        const chunkData = chunkObjects.get(chunkKey);
        if (!chunkData) return; // Not a generated chunk (level-original), skip

        let removedCount = 0;

        // Helper: remove items from a global array by identity
        function removeFromArray(arr, items) {
            if (!arr || !items || items.length === 0) return;
            const itemSet = new Set(items);
            for (let i = arr.length - 1; i >= 0; i--) {
                if (itemSet.has(arr[i])) {
                    arr.splice(i, 1);
                }
            }
        }

        // Remove ground
        if (chunkData.ground) {
            G.scene.remove(chunkData.ground);
            removedCount++;
        }

        // Remove hills (THREE objects added directly to scene by createHills)
        chunkData.hills.forEach(obj => { G.scene.remove(obj); removedCount++; });

        // Remove mountains (scene objects)
        chunkData.mountains.forEach(obj => { G.scene.remove(obj); removedCount++; });

        // Remove mountain collision data from G.levelConfig.mountains
        if (chunkData.mountainDataItems && chunkData.mountainDataItems.length > 0 && G.levelConfig && G.levelConfig.mountains) {
            removeFromArray(G.levelConfig.mountains, chunkData.mountainDataItems);
        }

        // Remove trees (THREE.Group added to scene)
        chunkData.trees.forEach(obj => { G.scene.remove(obj); removedCount++; });

        // Remove rocks (THREE.Mesh)
        chunkData.rocks.forEach(obj => { G.scene.remove(obj); removedCount++; });

        // Remove enemies from scene and global arrays
        chunkData.enemies.forEach(enemy => {
            if (enemy && enemy.mesh) {
                G.scene.remove(enemy.mesh);
                removedCount++;
            }
        });
        removeFromArray(G.goblins, chunkData.enemies);
        if (G.extraDragons) removeFromArray(G.extraDragons, chunkData.enemies);
        if (G.birds) removeFromArray(G.birds, chunkData.enemies);

        // Remove traps
        chunkData.traps.forEach(trap => {
            if (trap && trap.mesh) {
                G.scene.remove(trap.mesh);
                removedCount++;
            }
        });
        removeFromArray(G.traps, chunkData.traps);

        // Remove pickups
        chunkData.ammo.forEach(p => { if (p && p.mesh) { G.scene.remove(p.mesh); removedCount++; } });
        if (G.ammoPickups) removeFromArray(G.ammoPickups, chunkData.ammo);

        chunkData.health.forEach(p => { if (p && p.mesh) { G.scene.remove(p.mesh); removedCount++; } });
        if (G.healthPickups) removeFromArray(G.healthPickups, chunkData.health);

        chunkData.bombs.forEach(p => { if (p && p.mesh) { G.scene.remove(p.mesh); removedCount++; } });
        if (G.bombPickups) removeFromArray(G.bombPickups, chunkData.bombs);

        chunkData.herzmans.forEach(p => { if (p && p.mesh) { G.scene.remove(p.mesh); removedCount++; } });
        if (G.herzmanPickups) removeFromArray(G.herzmanPickups, chunkData.herzmans);

        // Remove from tracking
        chunkObjects.delete(chunkKey);
        generatedChunks.delete(chunkKey);

        console.log(`[Chunks] Unloaded chunk ${chunkKey} - removed ${removedCount} objects. Scene objects: ${G.scene.children.length}`);
    }

    /**
     * Unload chunks that are far from the player to keep scene object count bounded.
     * Uses Chebyshev distance (max of dx, dz) to chunk center.
     */
    function unloadDistantChunks(playerX, playerZ) {
        const chunksToUnload = [];
        for (const chunkKey of generatedChunks) {
            // Only unload chunks we generated (those in chunkObjects)
            if (!chunkObjects.has(chunkKey)) continue;
            
            const [cx, cz] = chunkKey.split(',').map(Number);
            const chunkCenterX = cx + CHUNK_SIZE / 2;
            const chunkCenterZ = cz + CHUNK_SIZE / 2;
            const dist = Math.max(Math.abs(playerX - chunkCenterX), Math.abs(playerZ - chunkCenterZ));
            if (dist > UNLOAD_DISTANCE) {
                chunksToUnload.push(chunkKey);
            }
        }
        if (chunksToUnload.length > 0) {
            console.log(`[Chunks] Unloading ${chunksToUnload.length} distant chunks (player at ${playerX.toFixed(0)}, ${playerZ.toFixed(0)})`);
            chunksToUnload.forEach(unloadChunk);
        }
    }

    /**
     * Reset chunks when starting a new game/level
     */
    function resetChunks() {
        console.log(`[Chunks] resetChunks() - clearing ${generatedChunks.size} generated, ${generatingChunks.size} generating, ${chunkQueue.length} queued`);
        generatedChunks.clear();
        generatingChunks.clear();
        queuedChunks.clear();
        chunkObjects.clear();
        chunkQueue.length = 0;
        isProcessingQueue = false;
        chunksInitialized = false;
        chunkShadersWarmed = false;
        // Reset content bounds (will be recalculated on next initChunks)
        _contentMinX = -100; _contentMaxX = 100;
        _contentMinZ = -100; _contentMaxZ = 100;
        // Clear cached chunk ground textures (theme may change on next level)
        for (const key in _chunkGroundTextures) {
            if (_chunkGroundTextures[key] && _chunkGroundTextures[key].dispose) {
                _chunkGroundTextures[key].dispose();
            }
            delete _chunkGroundTextures[key];
        }
        // Level bounds will be recalculated on next updateChunks call
    }

    // Export functions
    window.updateChunks = updateChunks;
    window.resetChunks = resetChunks;
    window.getChunkCoords = getChunkCoords;
    window.CHUNK_SIZE = CHUNK_SIZE;

})();
