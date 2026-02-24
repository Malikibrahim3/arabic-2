import { test, expect } from '@playwright/test';

test.describe('App Integration tests', () => {

    test('Testing the Yasmine Gate', async ({ page }) => {
        await page.goto('http://localhost:5173/');

        // Assert that the Yasmine gate is visible on load
        await expect(page.locator('text="Hi Yasmine, do you love me?"')).toBeVisible();

        // The random jumps making it impossible to click NO on mobile/desktop
        const noButton = page.locator('button.yasmine-no');
        await expect(noButton).toBeVisible();

        // Clicking YES unlocks the app
        await page.click('button.yasmine-yes');

        // Asserts you've passed the gate
        await expect(page.locator('.learn-page')).toBeVisible();
    });

    test('Session state resets on page reload / new context', async ({ browser }) => {
        const context1 = await browser.newContext();
        const page1 = await context1.newPage();

        await page1.goto('http://localhost:5173/');
        await expect(page1.locator('text="Hi Yasmine, do you love me?"')).toBeVisible();
        await page1.click('button.yasmine-yes');
        await expect(page1.locator('.learn-page')).toBeVisible();
        await context1.close();

        // Simulating a new session opening
        const context2 = await browser.newContext();
        const page2 = await context2.newPage();
        await page2.goto('http://localhost:5173/');

        // Verify it requires unlocking again
        await expect(page2.locator('text="Hi Yasmine, do you love me?"')).toBeVisible();
        await context2.close();
    });

    test('Node Clicking Interactions', async ({ page }) => {
        // Unlock the app first
        await page.goto('http://localhost:5173/');
        await page.click('button.yasmine-yes');

        // Wait for the learn page to load fully
        await expect(page.locator('.learn-page')).toBeVisible();
        await page.waitForTimeout(500); // Give it a sec to stabilize scrolling

        const urlBefore = page.url();

        // Dynamically find the first actually locked node index
        const allNodes = page.locator('.node');
        const count = await allNodes.count();
        let lockedIndex = -1;

        for (let i = 0; i < count; i++) {
            const classStr = await allNodes.nth(i).getAttribute('class');
            if (classStr && classStr.includes('locked')) {
                lockedIndex = i;
                break;
            }
        }

        // We expect to have found a locked node
        expect(lockedIndex).toBeGreaterThan(-1);

        const targetNode = allNodes.nth(lockedIndex);
        const nodeBtn = targetNode.locator('button');

        // Explicitly check for disabled state
        await expect(nodeBtn).toBeDisabled();

        // Attempt to click it 
        await nodeBtn.click({ force: true });

        // Ensure we are STILL on the same page
        expect(page.url()).toBe(urlBefore);

        // Now turn on "God Mode" (Jump Ahead)
        const jumpAheadBtn = page.locator('.god-mode-toggle');
        await jumpAheadBtn.click();

        // The button shouldn't be disabled anymore
        await expect(nodeBtn).toBeEnabled();

        // Attempt to click the same button which should now be unguarded
        await nodeBtn.click();

        page.on('dialog', dialog => dialog.accept());

        // If navigating, we wait to test navigation occurred
        await page.waitForURL(/lesson/);
        expect(page.url()).not.toBe(urlBefore);
    });
});

test.describe('Mobile Responsiveness Tests', () => {

    test('Yasmine Gate Responsive on Mobile', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:5173/');

        // Assert gate is visible
        const title = page.locator('text="Hi Yasmine, do you love me?"');
        await expect(title).toBeVisible();

        // Ensure no horizontal scroll is happening (responsive bounds)
        const boundingBox = await title.boundingBox();
        const viewport = page.viewportSize();

        expect(boundingBox!.width).toBeLessThanOrEqual(viewport!.width);

        // Interact with 'no' button
        const noButton = page.locator('button.yasmine-no');
        await noButton.click();

        // Ensure its new position is within bounds
        const inlineStyle = await noButton.getAttribute('style');
        expect(inlineStyle).toContain('position: fixed');

        const noBounding = await noButton.boundingBox();
        expect(noBounding!.x).toBeGreaterThanOrEqual(0);
        expect(noBounding!.y).toBeGreaterThanOrEqual(0);
        expect(noBounding!.x + noBounding!.width).toBeLessThanOrEqual(viewport!.width);
        expect(noBounding!.y + noBounding!.height).toBeLessThanOrEqual(viewport!.height);
    });

    test('App Curriculum Responsive on Mobile', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('http://localhost:5173/');
        await page.click('button.yasmine-yes');

        await expect(page.locator('.learn-page')).toBeVisible();

        // The node container should not exceed the responsive viewport
        const nodeContainers = page.locator('.path-container');
        const count = await nodeContainers.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const boundingBox = await nodeContainers.nth(i).boundingBox();
            const viewport = page.viewportSize();
            // Allow slight overflow due to node visual offsets, but major horizontal scrolling usually means it broke mobile layout.
            // Our path offsets are max 70px.
            expect(boundingBox!.width).toBeLessThanOrEqual(viewport!.width + 150);
        }
    });
});
