import { describe, expect, test } from 'vitest';
import { EndclothingListScraper } from '../list';

const url = 'https://www.consortium.co.uk/brands/adidas.html';

describe(('Consortium List SubScraper '), async () => {
  const scraper = new EndclothingListScraper();
  const headless = false;
  await scraper.initBrowser(headless);
  await scraper.page.goto(url);
  await scraper.loadingWait();

  test('should handle cooikes', async () => {
    await scraper.handleNewsLetterModal();
    const selector = '//*[@id="newsletter-modal"]/a';
    expect(await scraper.page.isVisible(selector)).toBe(false);
  });
});
