/**
 * Wiki Image Generator
 * 
 * Renders all game entities using Three.js and saves them as PNG files.
 * Run with: node generate-images.js
 * 
 * Requirements: npm install puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const WIKI_DIR = __dirname;
const IMAGES_DIR = path.join(WIKI_DIR, 'images');
const ENTITIES_FILE = path.join(WIKI_DIR, 'entities.json');

async function generateImages() {
    // Ensure images directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    // Load entity definitions
    const entities = JSON.parse(fs.readFileSync(ENTITIES_FILE, 'utf8'));
    
    // Collect all entity IDs to render
    const toRender = [
        ...entities.mobs.map(e => ({ ...e, category: 'mobs' })),
        ...entities.items.map(e => ({ ...e, category: 'items' })),
        ...entities.hazards.map(e => ({ ...e, category: 'hazards' })),
        ...entities.environment.map(e => ({ ...e, category: 'environment' }))
    ];

    console.log(`🎨 Generating ${toRender.length} entity images...\n`);

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
