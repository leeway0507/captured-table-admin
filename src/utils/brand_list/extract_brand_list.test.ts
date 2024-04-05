import { describe, expect, test } from 'vitest';
import { HTMLElement } from 'node-html-parser';
import path from 'path';
import BrandListExtractor from './extract_brand_list';
import { checkFileExist, deleteFile } from '../test_utils';

const storeName = 'mock';
const defaultUrl = 'https://www.quint-shop.com/en/';
const pattern = '.brandlist__name';
const p = path.join(__dirname, `${storeName}.json`);

describe(('Extract Brand List'), async () => {
  const scraper = new BrandListExtractor(defaultUrl, storeName, __dirname, pattern);

  test('should get load local html as text ', () => {
    const got = scraper.loadHTMLText();
    expect(got).toBeTypeOf('string');
  });
  test('should get HTMLElement ', () => {
    const got = scraper.loadHTML();
    expect(got).toBeInstanceOf(HTMLElement);
  });
  test('should get BrandObj[]', () => {
    const got = scraper.extractInfo();
    expect(got.length).toBe(54);
  });
  test('should get BrandList', () => {
    const data = scraper.extractInfo();
    const got = scraper.extractBrandList(data);
    expect(got.length).toBe(54);
  });
  test('should save file', () => {
    const data = scraper.extractInfo();
    scraper.save(data);
    const result = checkFileExist(p);
    expect(result).toBe(true);
    deleteFile(p);
  });
  test('execute files', () => {
    scraper.execute();
    const result = checkFileExist(p);
    expect(result).toBe(true);
  });
});
