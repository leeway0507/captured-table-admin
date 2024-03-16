import { describe, expect, test } from 'vitest';
import path from 'path';

import { ConsortiumListScraper } from './list';

const mockHtmlPath = path.resolve(__dirname, './list.html');
const localUrl = `file://${mockHtmlPath}`;

describe(('Consortium List SubScraper '), async () => {
  const scraper = new ConsortiumListScraper();
  const headless = false;
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
    const wantUrl = 'https://www.consortium.co.uk/brands/a-p-c.html';
    const gotUrl = scraper.getUrl();
    expect(gotUrl).toBe(wantUrl);
  });

  test('should have next page', async () => {
    const nextPage = await scraper.hasNextPage();
    expect(nextPage).not.toBe(null);
  });

  test('should extract Raw Cards', async () => {
    const locators = await scraper.extractRawCards();
    expect(locators.length).toBe(50);
  });

  test('should extract Price Data', async () => {
    const locators = await scraper.extractRawCards();
    const { retailPrice, salePrice } = await scraper.extractPriceData(locators[2]);
    expect(retailPrice).toBe('£88.99');
    expect(salePrice).toBe('£74.99');
  });

  test('should extract ProductId', async () => {
    const locators = await scraper.extractRawCards();
    const productId = await scraper.extractProductId(locators[2]);
    expect(productId).toBe('b75806');
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
    expect(dataList.length).toBe(50);
  });
  test('should check isSale', async () => {
    const dataList = await scraper.extractCards();
    expect(dataList[0].isSale).toBeTypeOf('boolean');
  });

  // test('should download image to local', async () => {
  //   const scrapData = await scraper.executePageScrap();
  //   // eslint-disable-next-line no-restricted-syntax
  //   for (const r of scrapData) {
  //     await scraper.downloadImage(r.productImgUrl, r.productName.replaceAll('/', ' '));
  //   }
  // });
});
