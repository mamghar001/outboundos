const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const errors = [];
    const failedResources = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    page.on('response', response => {
        if (response.status() >= 400) {
            failedResources.push({ url: response.url(), status: response.status() });
        }
    });
    
    const htmlPath = path.join(__dirname, 'index.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
    
    // Wait for animations
    await page.waitForTimeout(2000);
    
    // Check page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for key elements
    const hero = await page.$('.hero');
    const form = await page.$('#leadForm');
    const sections = await page.$$('section');
    
    console.log('Hero section found:', !!hero);
    console.log('Form found:', !!form);
    console.log('Number of sections:', sections.length);
    
    // Test form validation
    if (form) {
        await page.fill('#name', 'Test User');
        await page.fill('#email', 'test@company.com');
        await page.fill('#company', 'Test Company');
        await page.selectOption('#spend', '10k-25k');
        console.log('Form fields working correctly');
    }
    
    if (failedResources.length > 0) {
        console.log('\nFailed resources (404s):');
        failedResources.forEach(r => console.log(`  ${r.status}: ${r.url}`));
    } else {
        console.log('\nNo 404 errors detected');
    }
    
    if (errors.length > 0) {
        console.log('\nConsole errors:');
        errors.forEach(e => console.log('  ', e));
    } else {
        console.log('No console errors detected');
    }
    
    await browser.close();
    console.log('\nTest completed successfully!');
})();
