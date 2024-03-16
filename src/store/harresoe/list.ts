import { Locator } from 'playwright';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class HarresoeListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 1,
      maxPagination: 1,
      storeName: 'harresoe',
      scrapType: 'list',
    });
  }

  public brandList = brandData.brand_list;

  getBrandData(): StoreBrandDataProps[] {
    return brandData.data;
  }

  async extractCards(): Promise<ProductProps[]> {
    const locators = await this.extractRawCards();
    const promList = locators.map((l) => this.extractDataFromHtml(l));
    const dataList = await Promise.all(promList);
    return dataList;
  }

  async extractRawCards(): Promise<Locator[]> {
    const selector = '//div[contains(@class,"col-sm-4 col-xs-12")]';
    const loc = this.page.locator(selector);
    return loc.all();
  }

  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productName = await l.locator('//span[@id="product-title"]').textContent();
    const productImgUrl = await l.getByRole('img').getAttribute('src');

    const productUrl = await l.locator('//a').getAttribute('href');
    const { retailPrice, salePrice } = await this.extractPriceData(l);
    const brandNameRaw = await l.locator('//span[@class="vendor-type"]').textContent();
    const brandName = brandNameRaw?.split(',')[0].toLowerCase();

    const isSale = retailPrice !== salePrice;
    const productId = productName?.split(' ').slice(-3).toString();

    return {
      brand: brandName!,
      productName: `${brandName} ${productName!.toLowerCase().trim()}`,
      productImgUrl: productImgUrl!,
      productUrl: productUrl!,
      currencyCode: 'EUR',
      retailPrice,
      salePrice,
      isSale,
      productId: productId!,
    };
  }

  async extractPriceData(l: Locator) {
    const retailPriceRaw = await l.locator('//span[@id="compare-price"]').getAttribute('data-currency-eur');
    const salePriceRaw = await l.locator('//span[@id="price-item"]').getAttribute('data-currency-eur');

    const retailPriceNum = retailPriceRaw!.replace('EUR', '');
    const salePriceNum = salePriceRaw!.replace('EUR', '');

    const retailPrice = `€ ${retailPriceNum}`;
    const salePrice = `€ ${salePriceNum}`;

    return { retailPrice, salePrice };
  }

  async hasNextPage(): Promise<Locator | null> {
    return null;
  }

  /* v8 ignore start */
  // hot test에서 수동으로 수행하므로 coverage에서 제외
  async handleCookies(): Promise<void> {
    await this.handleNewsLetterModal();
  }

  async handleNewsLetterModal() {
    const selector = '//*[@id="newsletter-modal"]/a';
    const loc = this.page.locator(selector);
    if (await loc.isVisible()) {
      await loc.click();
      await this.page.waitForSelector(selector, { state: 'hidden' });
    }
  }
  /* v8 ignore stop */
}

async function NewHarresoeListScraper(headless: boolean = false) {
  const instance = new HarresoeListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewHarresoeListScraper;
