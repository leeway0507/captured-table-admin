import { describe, expect, test } from 'vitest';
import fs from 'fs';
import sampleData from '../utils/mock_data/product.json';
import SubScraper, { ProductProps, defaultOptions } from './sub_scraper';

describe(('subscrper test'), async () => {
  const scraper = new SubScraper({ ...defaultOptions });
  const headless = false;
  await scraper.initBrowser(headless);
  await scraper.page.goto('https://naver.com/');

  test('should subScraper Init', async () => {
    expect(typeof scraper.page.goto).toBe('function');
  });

  test('should get jobNotImplementedError', () => {
    expect(() => scraper.jobNotImplementedError()).toThrow('jobNotImplementedError');
  });
  test('should get job error', () => {
    expect(() => scraper.job).toThrow('jobNotImplementedError');
  });

  test('should set job', () => {
    const got = { brandName: 'adidas' };
    scraper.job = got;
    expect(scraper.job).toStrictEqual(got);
  });

  test('should set job', () => {
    const got = { brandName: 'adidas' };
    scraper.job = got;
    expect(scraper.job).toStrictEqual(got);
  });

  test('should throw an error if not implemented', async () => {
    expect(() => scraper.getBrandData()).toThrow();
    expect(() => scraper.getUrl()).toThrow();
    await expect(scraper.handleCookies()).rejects.toThrow();
    await expect(scraper.afterNextClick()).rejects.toThrow();
    await expect(scraper.extractCards()).rejects.toThrow();
    await expect(scraper.hasNextPage()).rejects.toThrow();
  });

  test('should throw an error "execute"', async () => {
    await expect(scraper.execute()).rejects.toThrow();
  });

  test('should throw an error "scrap"', async () => {
    scraper.options.scrollCount = 0;
    await expect(scraper.scrap()).rejects.toThrow();
  });

  test('should throw an error "executePageScrap"', async () => {
    scraper.options.scrollCount = 0;
    await expect(scraper.executePageScrap()).rejects.toThrow();
  });

  test('test getRandom Int', () => {
    for (let i = 0; i < 10; i += 1) {
      expect(scraper.getRandomInt(1, 10) < 11).toBe(true);
      expect(scraper.getRandomInt(1, 10) > 0).toBe(true);
    }
  });

  test('should be scrolled srollCount time', async () => {
    scraper.options.scrollCount = 2;
    await scraper.scrollYPage();

    const scrollY = await scraper.page.evaluate(() => window.scrollY);

    expect(scrollY).toBeGreaterThanOrEqual(200);
  });

  test('should drop duplicate array', () => {
    const scrapData: ProductProps[] = sampleData;
    expect(scraper.dropDuplicate(scrapData).length).toBe(1);
  });

  test('should download Imagefile', async () => {
    const scrapData: ProductProps[] = sampleData;
    const filePath = '/Users/yangwoolee/repo/captured-filter/admin/src/scraper/list/test/img/test.jpg';
    await scraper.downloadImage(scrapData[0].productImgUrl, filePath);
    await scraper.browserWait();
    expect(fs.existsSync(filePath)).toBe(true);
    fs.unlinkSync(filePath);
  });
});
