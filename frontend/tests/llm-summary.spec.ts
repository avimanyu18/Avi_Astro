import { test, expect } from '@playwright/test';

const SAMPLE = JSON.stringify({
    dob: '1990-01-01',
    tob: '12:00',
    pob: 'Someplace',
    ayanamsa: 'Lahiri',
    house_system: 'Whole',
    lagna: { sign: 'Aries' },
    planets: { Sun: { sign: 'Aries', degree: 10 }, Moon: { sign: 'Taurus', degree: 3 } }
}, null, 2);

test('LLM summary present and rendered in response JSON', async ({ page }) => {
    await page.goto('http://127.0.0.1:8080');
    await page.fill('textarea', SAMPLE);
    await page.click('text=Analyze');

    const pre = page.locator('pre');
    await expect(pre).toBeVisible({ timeout: 10000 });
    const raw = await pre.innerText();

    let parsed = {} as any;
    try { parsed = JSON.parse(raw); } catch (e) { const s = raw.indexOf('{') >= 0 ? raw.slice(raw.indexOf('{')) : raw; parsed = JSON.parse(s); }

    expect(parsed.llm_response).toBeDefined();
    expect(typeof parsed.llm_response).toBe('object');

    // find at least one string-valued property in llm_response
    const keys = Object.keys(parsed.llm_response || {});
    const hasString = keys.some(k => typeof parsed.llm_response[k] === 'string');
    expect(hasString).toBeTruthy();

    // ensure UI shows llm_response text inside the pre block
    expect(raw).toContain('llm_response');
});
