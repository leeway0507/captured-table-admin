import { describe, expect, test } from 'vitest';
import path from 'path';
import fs from 'fs';
import { SheltaListScraper } from './list';

const mockHtmlPath = path.resolve(__dirname, './list.html');
const localUrl = `file://${mockHtmlPath}`;

describe(('Shelta List SubScraper '), async () => {
  const scraper = new SheltaListScraper();
  const headless = true;
  await scraper.initBrowser(headless);
  await scraper.page.goto(localUrl);
  scraper.job = { brandName: 'adidas' };
  //   await scraper.loadingWait();

  test('should get store brand data ', () => {
    expect(scraper.getBrandData()[0]).toHaveProperty('brand_name');
    expect(scraper.getBrandData()[0]).toHaveProperty('brand_url');
    expect(scraper.getBrandData()[0]).toHaveProperty('store_name');
  });

  test('should get url', () => {
    scraper.job = { brandName: 'adidas' };
    const wantUrl = 'https://shelta.eu/brand/adidas-originals';
    const gotUrl = scraper.getUrl();
    expect(gotUrl).toBe(wantUrl);
  });

  test('should have next page', async () => {
    const nextPage = await scraper.hasNextPage();
    expect(nextPage).toBe(null);
  });

  test('should extract Raw Cards', async () => {
    const locators = await scraper.extractRawCards();
    expect(locators.length).toBe(138);
  });
  test('should extract Price Data', async () => {
    const locators = await scraper.extractRawCards();
    const { retailPrice, salePrice } = await scraper.extractPriceData(
      locators[locators.length - 1],
    );
    expect(retailPrice).toBe('109');
    expect(salePrice).toBe('55');
  });

  test('should extractDataFromHtml', async () => {
    const locators = await scraper.extractRawCards();
    const arr = await scraper.extractDataFromHtml(locators[0]);
    console.log(arr);

    expect(arr).toHaveProperty('productName');
    expect(arr).toHaveProperty('retailPrice');
  });

  test('should extract Cards', async () => {
    const dataList = await scraper.extractCards();
    expect(dataList.length).toBe(138);
  });
  test('should save result', async () => {
    const dataList = await scraper.extractCards();
    fs.writeFileSync(path.join(__dirname, 'mock.json'), JSON.stringify(dataList));
  });
});
