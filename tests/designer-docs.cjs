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
    await page.goto(base + "#/" + language + "web-designer");
    const section = page.locator(".markdown-section");
    await section
      .getByRole("heading", { level: 1 })
      .filter({ hasText: "Web Designer" })
      .waitFor();
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll(".markdown-section img")].length === 5 &&
        [...document.querySelectorAll(".markdown-section img")].every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
    );
    const link = section.getByRole("link", {
      name: language ? "Mở Web Designer ↗" : "Open Web Designer ↗",
    });
    const url = await link.evaluate((node) => node.href);
    assert.equal(url, base + "designer/");
    await page.locator(".sidebar a").filter({ hasText: "Web Designer" }).first().waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 2,
      ),
      false,
    );
    await page.setViewportSize({ width: 1440, height: 950 });
    await page.close();
  }
  console.log(
    "English/Vietnamese guide navigation, five images, launch link and mobile layout passed.",
  );
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
