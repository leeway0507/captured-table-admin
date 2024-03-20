import { describe, expect, test } from 'vitest';
import path from 'path';

import { UrbanIndustryListScraper } from './list';

const mockHtmlPath = path.resolve(__dirname, './list.html');
const localUrl = `file://${mockHtmlPath}`;

describe(('Consortium List SubScraper '), async () => {
  const scraper = new UrbanIndustryListScraper();
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
    scraper.job = { brandName: 'adidas' };
    const wantUrl = 'https://www.urbanindustry.co.uk/collections/adidas-originals';
    const gotUrl = scraper.getUrl();
    expect(gotUrl).toBe(wantUrl);
  });

  test('should have next page', async () => {
    const nextPage = await scraper.hasNextPage();
    expect(nextPage).not.toBe(null);
  });

  test('should extract Raw Cards', async () => {
    const locators = await scraper.extractRawCards();
    expect(locators.length).toBe(24);
  });

  test('should extract Price Data', async () => {
    const locators = await scraper.extractRawCards();
    const { retailPrice, salePrice } = await scraper.extractPriceData(locators[0]);
    expect(retailPrice).toBe('₩130,507');
    expect(salePrice).toBe('₩78,274');

    const {
      retailPrice: retailPrice2,
      salePrice: salePrice2,
    } = await scraper.extractPriceData(locators[9]);
    expect(retailPrice2).toBe('₩99,782');
    expect(salePrice2).toBe('₩99,782');
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
    expect(dataList.length).toBe(24);
  });
});
