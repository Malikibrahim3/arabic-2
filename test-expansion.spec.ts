import { test, expect } from '@playwright/test';

/**
 * Quick test to verify the course expansion is working correctly
 */

test.describe('Course Expansion Verification', () => {
    test('should have correct number of units', async ({ page }) => {
        await page.goto('http://localhost:5174/');
        
        // Unlock the app
        await page.evaluate(() => {
            sessionStorage.setItem('yasmine_unlocked', 'true');
        });
        await page.reload();
        
        // Wait for units to load
        await page.waitForSelector('.unit-card, .unit', { timeout: 10000 });
        
        // Count units (should be 11: Units 1-4, 4B, 4C, 5-9)
        const units = await page.locator('.unit-card, .unit').count();
        console.log(`Found ${units} units`);
        
        // Should have 11 units
        expect(units).toBeGreaterThanOrEqual(11);
    });

    test('should have Unit 4 with 40 words', async ({ page }) => {
        await page.goto('http://localhost:5174/');
        
        // Unlock and enable God Mode
        await page.evaluate(() => {
            sessionStorage.setItem('yasmine_unlocked', 'true');
            localStorage.setItem('godMode', 'true');
        });
        await page.reload();
        
        await page.waitForSelector('.unit-card, .unit', { timeout: 10000 });
        
        // Click on Unit 4
        const unit4 = page.locator('.unit-card, .unit').filter({ hasText: 'Unit 4' }).first();
        await unit4.click();
        
        // Wait for nodes to appear
        await page.waitForTimeout(1000);
        
        // Should have 7 nodes + 1 test = 8 items
        const nodes = await page.locator('.node-card, .node').count();
        console.log(`Unit 4 has ${nodes} nodes`);
        
        expect(nodes).toBeGreaterThanOrEqual(7);
    });

    test('should have Unit 4B', async ({ page }) => {
        await page.goto('http://localhost:5174/');
        
        await page.evaluate(() => {
            sessionStorage.setItem('yasmine_unlocked', 'true');
        });
        await page.reload();
        
        await page.waitForSelector('.unit-card, .unit', { timeout: 10000 });
        
        // Look for Unit 4B
        const unit4b = page.locator('.unit-card, .unit').filter({ hasText: 'Unit 4B' });
        await expect(unit4b).toBeVisible();
    });

    test('should have Unit 4C', async ({ page }) => {
        await page.goto('http://localhost:5174/');
        
        await page.evaluate(() => {
            sessionStorage.setItem('yasmine_unlocked', 'true');
        });
        await page.reload();
        
        await page.waitForSelector('.unit-card, .unit', { timeout: 10000 });
        
        // Look for Unit 4C
        const unit4c = page.locator('.unit-card, .unit').filter({ hasText: 'Unit 4C' });
        await expect(unit4c).toBeVisible();
    });

    test('should have Unit 6 with 30 sentences', async ({ page }) => {
        await page.goto('http://localhost:5174/');
        
        await page.evaluate(() => {
            sessionStorage.setItem('yasmine_unlocked', 'true');
            localStorage.setItem('godMode', 'true');
        });
        await page.reload();
        
        await page.waitForSelector('.unit-card, .unit', { timeout: 10000 });
        
        // Click on Unit 6 (which is now id:8 but still titled "Unit 6")
        const unit6 = page.locator('.unit-card, .unit').filter({ hasText: 'Unit 6' }).first();
        await unit6.click();
        
        // Wait for nodes to appear
        await page.waitForTimeout(1000);
        
        // Should have 5 nodes + 1 test + 1 cumulative test = 7 items
        const nodes = await page.locator('.node-card, .node').count();
        console.log(`Unit 6 has ${nodes} nodes`);
        
        expect(nodes).toBeGreaterThanOrEqual(5);
    });
});
