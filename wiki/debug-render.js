const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: 'new', 
        args: ['--no-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    
    // Capture ALL console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error' || type === 'warning' || text.includes('rror') || text.includes('rror')) {
            console.log('PAGE[' + type + ']:', text);
        }
    });
    page.on('pageerror', err => {
        console.log('PAGE ERROR:', err.message);
        console.log('Stack:', err.stack);
    });
    page.on('requestfailed', request => {
        console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
    });
    
    const rendererPath = `file://${path.join(__dirname, 'render-single.html')}`;
    console.log('Loading:', rendererPath + '?entity=horror-dragon');
    
    await page.goto(rendererPath + '?entity=horror-dragon', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(2000);
    
    // Check for any error messages in the page
    const errors = await page.evaluate(() => {
        const errors = [];
        // Check if there's any error element
        const complete = document.querySelector('#render-complete');
        return {
            hasComplete: !!complete,
            canvasExists: !!document.querySelector('canvas')
        };
    });
    console.log('Final state:', errors);
    
    const canvas = await page.$('canvas');
    if (canvas) {
        const buffer = await canvas.screenshot();
        console.log('Final image buffer size:', buffer.length);
        
        // Save to file
        const fs = require('fs');
        fs.writeFileSync('debug-output.png', buffer);
        console.log('Saved debug-output.png');
    }
    
    await browser.close();
})().catch(console.error);
