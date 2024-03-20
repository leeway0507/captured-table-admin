import { describe, expect, test } from 'vitest';
import path from 'path';

import { EndclothingListScraper } from './list';

const mockHtmlPath = path.resolve(__dirname, './list.html');
const localUrl = `file://${mockHtmlPath}`;

describe(('Consortium List SubScraper '), async () => {
  const scraper = new EndclothingListScraper();
  const headless = true;
  await scraper.initBrowser(headless);
  await scraper.page.goto(localUrl);
  //   await scraper.loadingWait();

  test('should get store brand data ', () => {
    expect(scraper.getBrandData()[0]).toHaveProperty('brand_name');
    expect(scraper.getBrandData()[0]).toHaveProperty('brand_url');
    expect(scraper.getBrandData()[0]).toHaveProperty('store_name');
  });

  test('should get url', () => {
    scraper.job = { brandName: 'a.p.c.' };
    const wantUrl = 'https://www.endclothing.com/kr/brands/a-p-c';
    const gotUrl = scraper.getUrl();
    expect(gotUrl).toBe(wantUrl);
  });

  test('should have next page', async () => {
    const nextPage = await scraper.hasNextPage();
    expect(nextPage).not.toBe(null);
  });

  test('should extract Raw Cards', async () => {
    const locators = await scraper.extractRawCards();
    expect(locators.length).toBe(480);
  });

  test('should extract Price Data', async () => {
    const locators = await scraper.extractRawCards();
    const { retailPrice, salePrice } = await scraper.extractPriceData(locators[479]);
    expect(retailPrice).toBe('₩180,285');
    expect(salePrice).toBe('₩108,171');
  });

  test('should extract ProductId', async () => {
    const locators = await scraper.extractRawCards();
    const productId = await scraper.extractProductId(locators[479]);
    expect(productId).toBe('IF1111');
  });

  test('should extractDataFromHtml', async () => {
    const locators = await scraper.extractRawCards();
    const arr = await scraper.extractDataFromHtml(locators[0]);

    expect(arr).toHaveProperty('productName');
    expect(arr).toHaveProperty('retailPrice');
    expect(arr).toHaveProperty('color');
  });

  test('should extract Cards', async () => {
    const dataList = await scraper.extractCards();
    expect(dataList.length).toBe(480);
  });
});
