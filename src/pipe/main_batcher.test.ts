import { describe, expect, test } from 'vitest';
import { ConsortiumListScraper } from '../store/consortium/list';
import MainBatcher from './main_batcher';

const mockHtmlPath = '/Users/yangwoolee/repo/captured-filter/admin/src/store/consortium/list.html';
const localUrl = `file://${mockHtmlPath}`;

class TestListScraper extends ConsortiumListScraper {
  getBrandData() {
    return [{
      store_name: 'testStore',
      brand_name: 'testBrand',
      brand_url: localUrl,
    }];
  }
}

describe(('List subscrper test'), async () => {
  const scraper = new TestListScraper();
  scraper.options.storeName = 'testStore';
  scraper.options.scrapType = 'list';

  test('should return the value of storeName as testStore', () => {
    expect(scraper.options.storeName).toBe('testStore');
  });

  test('should throw an error if not implemented', async () => {
    scraper.job = { brandName: 'testBrand' };
    expect(scraper.getUrl()).toBe(localUrl);
  });
});

describe(('Main Batcher'), async () => {
  const scraper = new TestListScraper();
  scraper.options.storeName = 'testStore';
  scraper.options.scrapType = 'list';
  scraper.options.maxPagination = 1;
  scraper.options.scrollCount = 1;
  await scraper.initBrowser(false);

  const mainBatcher = new MainBatcher(scraper, 'testBrand', './src/pipe/test');

  test('should scrap store data and save', async () => {
    await mainBatcher.scrap();
  });
});
