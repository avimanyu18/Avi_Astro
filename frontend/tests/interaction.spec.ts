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

test('full interaction: parse response, show llm_response and handle errors', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080');

    // submit valid chart
    await page.fill('textarea', SAMPLE_JSON);
    await page.click('text=Analyze');
    const pre = page.locator('pre');
    await expect(pre).toBeVisible({ timeout: 10000 });

    const raw = await pre.innerText();
    let parsed = {} as any;
    try { parsed = JSON.parse(raw); } catch (e) { const s = raw.indexOf('{') >= 0 ? raw.slice(raw.indexOf('{')) : raw; parsed = JSON.parse(s); }

    // verify computed_facts and llm_response
    expect(parsed.computed_facts).toBeDefined();
    expect(parsed.computed_facts.raja_yogas).toBeDefined();
    expect(parsed.llm_response).toBeDefined();

    // click Sun and ensure candidate yogas or raja_yogas references show in UI when relevant
    await page.locator('text=Sun').first().click();
    await expect(page.locator('text=House')).toBeVisible();

    // Now submit an invalid chart (missing planets) and assert error handling
    const INVALID = JSON.stringify({ dob: '1990-01-01' });
    await page.fill('textarea', INVALID);
    await page.click('text=Analyze');

    // Expect an error block rendered in the response area
    await expect(page.locator('pre')).toBeVisible({ timeout: 5000 });
    const raw2 = await page.locator('pre').innerText();
    expect(raw2).toContain('missing_required_fields');
});
