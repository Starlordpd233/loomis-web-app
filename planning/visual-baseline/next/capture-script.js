
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const viewports = [
    { width: 375, height: 812, name: '375x812' },
    { width: 768, height: 1024, name: '768x1024' },
    { width: 1440, height: 900, name: '1440x900' }
];

const routes = [
    '/',
    '/login',
    '/onboarding',
    '/browser',
    '/planner',
    '/sandbox'
];

async function capture() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const baseDir = path.resolve(__dirname, 'clean');
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

    console.log('Starting capture for CLEAN state...');

    for (const route of routes) {
        for (const viewport of viewports) {
            await page.setViewport({ width: viewport.width, height: viewport.height });

            // Onboarding redirect handling: clear cookies appropriately if we want "clean"
            // But for "clean" state, we just launched a new browser so it IS clean.

            try {
                await page.goto(`http://localhost:3001${route}`, { waitUntil: 'networkidle0' });

                // Wait a bit for animations
                await new Promise(r => setTimeout(r, 1000));

                const fileName = `${route.replace(/\//g, '') || 'index'}-${viewport.name}.png`;
                const filePath = path.join(baseDir, fileName);

                await page.screenshot({ path: filePath, fullPage: true });
                console.log(`Captured: ${fileName}`);
            } catch (e) {
                console.error(`Failed to capture ${route} at ${viewport.name}:`, e.message);
            }
        }
    }

    await browser.close();
}

capture();
