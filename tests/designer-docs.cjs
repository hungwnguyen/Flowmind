const assert = require("node:assert/strict");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    "C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
(async () => {
  const browser = await chromium.launch();
  const base = process.env.DOCS_URL || "http://127.0.0.1:3000/";
  for (const language of ["", "vi/"]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 950 },
    });
    await page.addInitScript(
      (lang) => localStorage.setItem("vinagen-docs-lang", lang),
      language ? "vi" : "en",
    );
    await page.goto(base + "#/" + language);
    const homeDesigner = page.locator('.vg-quick-link--designer');
    await homeDesigner.waitFor();
    assert.equal(await homeDesigner.evaluate(node => node.href), base + '#/' + language + 'web-designer');
    assert.equal(await homeDesigner.getAttribute('target'), null);
    await homeDesigner.click();
    const section = page.locator(".markdown-section");
    await section
      .getByRole("heading", { level: 1 })
      .filter({ hasText: "Web Designer" })
      .waitFor();
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".markdown-section img").length > 0 &&
        [...document.querySelectorAll(".markdown-section img")].every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
    );
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.sidebar')).opacity === '1');
    assert.equal(await section.locator('.vg-icon-table').count(), 1);
    assert.equal(await page.locator('.sidebar-nav .vg-designer-group').count(), 1);
    assert.equal(await page.locator('.vg-designer-variants > li > a').count(), 2);
    assert.equal(await page.locator('.vg-designer-variants > li > a:not(:has(.vg-nav-icon))').count(), 0);
    assert.equal(await page.locator('.sidebar-nav > ul > li > ul > li > a:not(:has(.vg-nav-icon))').count(), 0);
    const drawer = page.locator('.sidebar');
    const toggle = page.locator('.sidebar-toggle');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await toggle.click();
    await page.waitForFunction(() => document.querySelector('.sidebar').inert);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.sidebar')).visibility === 'hidden');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await toggle.click();
    await page.waitForFunction(() => !document.querySelector('.sidebar').inert);
    const link = section.getByRole("link", {
      name: language ? "Mở Web Designer ↗" : "Open Web Designer ↗",
    });
    const url = await link.evaluate((node) => node.href);
    assert.equal(url, base + "designer/");
    await page.locator(".sidebar a").filter({ hasText: "Web Designer" }).first().waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => document.querySelector('.sidebar').inert);
    await toggle.click();
    await page.waitForFunction(() => !document.querySelector('.sidebar').inert);
    await page.waitForFunction(() => Math.abs(document.querySelector('.sidebar').getBoundingClientRect().left) < 1);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    assert.ok(await drawer.locator('.vg-sidebar-actions').isVisible());
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('.sidebar').inert);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 2,
      ),
      false,
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await drawer.evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    assert.equal(await section.evaluate(node => getComputedStyle(node).animationName), 'none');
    await page.setViewportSize({ width: 1440, height: 950 });
    await section.locator('.vg-designer-nav a[href$="designer-guide"]').click();
    await section.getByRole('heading', { level: 1, name: 'UI Designer', exact: true }).waitFor();
    assert.equal(await section.locator('.vg-icon-table').count(), 3);
    assert.ok(await section.locator('img.vg-editor-icon').count() >= 52);
    await page.waitForFunction(() => [...document.querySelectorAll('.markdown-section img')].every(img => img.complete && img.naturalWidth > 0));
    for (const glyph of ['rectangle', 'text', 'comment', 'eye', 'lock']) {
      assert.equal(await section.locator(`img[src$="/${glyph}-light.svg"]`).count(), 1);
      assert.equal(await section.locator(`img[src$="/${glyph}-dark.svg"]`).count(), 1);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
    await page.setViewportSize({ width: 1440, height: 950 });
    await section.locator('.vg-designer-nav a[href$="ui-designer"]').click();
    await section.getByRole('heading', { level: 1, name: 'UI Designer — Offline (Unity)', exact: true }).waitFor();
    assert.ok(await page.locator('.vg-designer-variants > li.active > a[href$="ui-designer"]').isVisible());
    assert.equal(await section.locator('.vg-icon-table').count(), 0);
    await page.waitForFunction(() => [...document.querySelectorAll('.markdown-section img')].every(img => img.complete && img.naturalWidth > 0));
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
    await page.setViewportSize({ width: 1440, height: 950 });
    await section.locator('.vg-designer-nav a[href$="web-designer"]').click();
    await section.locator('.vg-designer-open').waitFor();
    await page.close();
  }
  console.log(
    "Bilingual Overview/Online/Offline guides, shared icon assets, home-to-guide navigation, drawer, Escape, reduced motion and mobile layout passed.",
  );
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
