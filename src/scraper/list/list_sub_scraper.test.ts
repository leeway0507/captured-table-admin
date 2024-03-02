import { describe, expect, test } from 'vitest';
import ListSubScraper from './list_sub_scraper';

describe(('subscrper test'), async () => {
  const scraper = new ListSubScraper();
  scraper.options.storeName = 'testStore';

  test('should return the value of storeName as testStore', () => {
    expect(scraper.options.storeName).toBe('testStore');
  });

  test('should throw an error if not implemented', async () => {
    expect(() => scraper.getUrl()).toThrow();
  });
});
