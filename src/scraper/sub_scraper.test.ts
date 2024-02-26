import { describe, expect, test } from 'vitest';
import SubScraper from './sub_scraper';

describe(('subscrper test'), () => {
  test('test subSbraper Working', async () => {
    const scraper = new SubScraper();
    await scraper.initBrowser();
    expect(typeof scraper.page.goto).toBe('function');
  });
});

describe(('subscrper test'), async () => {
  const scraper = new SubScraper();
  await scraper.initBrowser();

  test('test subSbraper Working', async () => {
    expect(typeof scraper.page.goto).toBe('function');
  });
});
