import { describe, expect, test } from 'vitest';
import { HarresoeListScraper } from '../list';

const url = 'https://www.harresoe.com/collections/adidas-originals';

describe(('Harresoe CookieTest'), async () => {
  const scraper = new HarresoeListScraper();
  const headless = false;
  await scraper.initBrowser(headless);
  await scraper.page.goto(url);
  await scraper.loadingWait();

  test('should handle cooikes', async () => {
    await scraper.handleCookies();
    const selector = '//*[@id="coi-banner-wrapper"]//button[@aria-label="Accept all"]';
    expect(await scraper.page.isVisible(selector)).toBe(false);
  });
});
