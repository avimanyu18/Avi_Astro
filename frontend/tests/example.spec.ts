import { test, expect } from '@playwright/test';

const SAMPLE_JSON = JSON.stringify({
    dob: '1990-01-01',
    tob: '12:00',
    pob: 'Someplace',
    ayanamsa: 'Lahiri',
    house_system: 'Whole',
    lagna: { sign: 'Aries' },
    planets: {
        Sun: { sign: 'Aries', degree: 10 },
        Moon: { sign: 'Taurus', degree: 3 },
        Mars: { sign: 'Capricorn', degree: 28 },
        Saturn: { longitude: 180 }
    },
    d_charts: {}
}, null, 2);

test('homepage analysis flow shows bhava/house in facts panel', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080');
    await expect(page).toHaveTitle(/Vedic Astrology Chatbot|Vedic/);

    // paste chart JSON into textarea
    await page.fill('textarea', SAMPLE_JSON);
    await page.click('text=Analyze');

    // wait for response JSON block to appear
    const pre = page.locator('pre');
    await expect(pre).toBeVisible({ timeout: 10000 });
    // Parse the response JSON printed in the pre block and validate computed_facts
    const raw = await pre.innerText();
    let parsed = {} as any;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        // sometimes the response may include other text; attempt to extract JSON
        const s = raw.indexOf('{') >= 0 ? raw.slice(raw.indexOf('{')) : raw
        parsed = JSON.parse(s)
    }

    // verify computed_facts contains houses and bhava_lords
    expect(parsed.computed_facts).toBeDefined();
    expect(parsed.computed_facts.houses).toBeDefined();
    expect(parsed.computed_facts.bhava_lords).toBeDefined();

    // click planet label (Sun) in rendered chart area and verify FactsPanel
    const sun = page.locator('text=Sun').first();
    await sun.click();
    await expect(page.locator('text=House')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Lord')).toBeVisible();

    // click planet label (Mars) and confirm house strength text appears
    const mars = page.locator('text=Mars').first();
    await mars.click();
    await expect(page.locator('text=House Strength')).toBeVisible();
});
