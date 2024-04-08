import BrandListExtractor from './extract_brand_list';

function execute() {
  const storeName = 'shelta';
  const defaultUrl = 'https://shelta.eu/';
  const pattern = '#category-navigation li.lv2';
  const scraper = new BrandListExtractor(defaultUrl, storeName, __dirname, pattern);
  return scraper.execute();
}

execute();
