import BrandListExtractor from './extract_brand_list';

function execute() {
  const storeName = 'quint';
  const defaultUrl = 'https://www.quint-shop.com/en/';
  const pattern = '.brandlist__name';
  const scraper = new BrandListExtractor(defaultUrl, storeName, __dirname, pattern);
  return scraper.execute();
}

execute();
