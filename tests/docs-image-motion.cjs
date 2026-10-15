const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ||
  'C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.addInitScript(() => localStorage.setItem('vinagen-docs-lang', 'vi'));
      let releaseImage;
      const gate = new Promise(resolve => { releaseImage = resolve; });
      await page.route('**/images/ui-designer.png', async route => {
        await gate;
        await route.continue();
      });
      await page.goto((process.env.DOCS_URL || 'http://127.0.0.1:3000/') + '#/vi/', { waitUntil: 'domcontentloaded' });
      const hero = page.locator('.vg-hero-shot img');
      await hero.waitFor();
      assert.equal(await hero.evaluate(img => img.naturalWidth), 0);
      assert.equal(await hero.evaluate(img => img.classList.contains('vg-image-pending')), true);
      assert.equal(await page.locator('.vg-hero-robot').evaluate(img => img.classList.contains('vg-image-pending')), false);
      releaseImage();
      await hero.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('.vg-hero-shot img').getAnimations().length > 0);
      const frames = await hero.evaluate(img => {
        const animation = img.getAnimations()[0];
        animation.pause();
        const { delay, duration } = animation.effect.getTiming();
        const samples = [0, .45, 1].map(progress => {
          animation.currentTime = delay + duration * progress;
          const style = getComputedStyle(img);
          return { opacity: Number(style.opacity), clip: style.clipPath };
        });
        animation.finish();
        return samples;
      });
      assert.match(frames[0].clip, /100%/);
      assert.ok(frames[1].opacity > frames[0].opacity && frames[1].opacity < 1);
      assert.equal(frames[2].opacity, 1);
      await page.waitForFunction(() => !document.querySelector('.vg-hero-shot img').classList.contains('vg-image-reveal'));
      await page.evaluate(() => scrollTo(0, 0));
      await hero.scrollIntoViewIfNeeded();
      assert.equal(await hero.evaluate(img => img.getAnimations().length), 0);
      // A decoded image below the fold must wait for scrolling, then reveal only once.
      await page.evaluate(() => {
        const section = document.querySelector('.markdown-section');
        const spacer = document.createElement('div');
        spacer.style.height = '2000px';
        const img = document.createElement('img');
        img.id = 'motion-scroll-image';
        img.src = 'images/web-designer/folder.png';
        section.append(spacer, img);
        window.vinagenRevealImages(section);
      });
      const below = page.locator('#motion-scroll-image');
      await page.waitForFunction(() => document.querySelector('#motion-scroll-image').naturalWidth > 0);
      assert.equal(await below.evaluate(img => img.classList.contains('vg-image-pending')), true);
      await below.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('#motion-scroll-image').classList.contains('vg-image-reveal'));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await below.evaluate(img => getComputedStyle(img).opacity), '1');
      assert.equal(await below.evaluate(img => getComputedStyle(img).animationName), 'none');
      assert.equal(await page.locator('.vg-image-pending').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false);
      await page.close();
    }
    console.log('Desktop/mobile delayed image load, gradual wipe, viewport reveal, icon exclusion and reduced motion passed.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
