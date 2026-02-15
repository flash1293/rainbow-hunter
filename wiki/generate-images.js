/**
 * Wiki Image Generator
 * 
 * Renders game entities using Three.js and saves them as PNG files.
 * 
 * Usage:
 *   node generate-images.js              # Render ALL entities
 *   node generate-images.js evil-elf     # Render ONLY 'evil-elf' entity
 *   node generate-images.js goblin-christmas  # Render ONLY 'goblin-christmas' entity
 * 
 * Requirements: npm install puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const WIKI_DIR = __dirname;
const IMAGES_DIR = path.join(WIKI_DIR, 'images');
const ENTITIES_FILE = path.join(WIKI_DIR, 'entities.json');

// Get optional single entity ID from command line argument
const SINGLE_ENTITY_ID = process.argv[2] || null;

async function generateImages() {
    // Ensure images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    // Load entity definitions
    const entities = JSON.parse(fs.readFileSync(ENTITIES_FILE, 'utf8'));
    
    // Collect all entity IDs to render
    let toRender = [
        ...entities.mobs.map(e => ({ ...e, category: 'mobs' })),
        ...entities.items.map(e => ({ ...e, category: 'items' })),
        ...entities.hazards.map(e => ({ ...e, category: 'hazards' })),
        ...entities.environment.map(e => ({ ...e, category: 'environment' }))
    ];

    // Filter to single entity if specified
    if (SINGLE_ENTITY_ID) {
        toRender = toRender.filter(e => e.id === SINGLE_ENTITY_ID);
        if (toRender.length === 0) {
            console.error(`❌ Entity '${SINGLE_ENTITY_ID}' not found in entities.json`);
            console.log(`   Make sure to add it to entities.json first!`);
            process.exit(1);
        }
        console.log(`🎨 Generating image for: ${SINGLE_ENTITY_ID}\n`);
    } else {
        console.log(`🎨 Generating ${toRender.length} entity images...\n`);
    }

    // Launch browser
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 512, height: 512 });

    // Load the renderer page
    const rendererPath = `file://${path.join(WIKI_DIR, 'render-single.html')}`;
    
    for (const entity of toRender) {
        const filename = `${entity.category}-${entity.id}.png`;
        const filepath = path.join(IMAGES_DIR, filename);
        
        process.stdout.write(`  Rendering ${entity.name}...`);
        
        try {
            // Navigate to renderer with entity parameter
            await page.goto(`${rendererPath}?entity=${entity.id}`, {
                waitUntil: 'networkidle0',
                timeout: 10000
            });
            
            // Wait for render to complete
            await page.waitForSelector('#render-complete', { timeout: 5000 });
            
            // Get the canvas element and save as PNG
            const canvas = await page.$('canvas');
            if (canvas) {
                await canvas.screenshot({ path: filepath, omitBackground: true });
                console.log(` ✓ ${filename}`);
            } else {
                console.log(` ⚠ No canvas found`);
            }
        } catch (err) {
            console.log(` ✗ Error: ${err.message}`);
        }
    }

    await browser.close();
    
    console.log(`\n✅ Done! Images saved to ${IMAGES_DIR}`);
    console.log(`📝 Run this script again after modifying entities.json to update images.`);
}

// Check for puppeteer
try {
    require.resolve('puppeteer');
    generateImages().catch(console.error);
} catch (e) {
    console.log('📦 Installing puppeteer...');
    const { execSync } = require('child_process');
    execSync('npm install puppeteer', { cwd: WIKI_DIR, stdio: 'inherit' });
    generateImages().catch(console.error);
}
