import { Locator } from 'playwright';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class QuintListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 7,
      maxPagination: 10,
      storeName: 'quint',
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
    const selector = '//*[@class="filter-products__item ng-star-inserted"]';
    const loc = this.page.locator(selector);
    return loc.all();
  }

  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productUrl = await l.locator('a').first().getAttribute('href');
    // console.log(productUrl);

    const price = (await l.locator('.product-card__price').innerText()).replace('EUR ', '');
    // console.log(price);

    const catAndColor = await l.locator('.product-card__detail').innerText().then((r) => r.split(' | '));
    const color = catAndColor.length === 2 ? catAndColor[1] : catAndColor[2];
    // console.log(color);

    const img = l.locator('//*[contains(@class,"lazy-load")]').first();
    const imgString = await img.innerHTML();
    const srcMatch = imgString.match(/src="([^"]*)"/);
    const productImgUrl = srcMatch ? srcMatch[1] : null;
    // console.log(productImgUrl);

    const altMatch = imgString.match(/alt="([^"]*)"/);
    const productName = altMatch![1].toLowerCase().trim();
    // console.log(productName);
    return {
      brand: this.job!.brandName,
      productName,
      productImgUrl: productImgUrl!,
      productUrl: new URL(productUrl!, 'https://www.quint-shop.com/').href,
      currencyCode: 'EUR',
      productId: '-',
      retailPrice: price,
      salePrice: price,
      isSale: false,
      color: color.toLowerCase().trim(),

    };
  }

  async extractProductId(l: Locator) {
    const productId = await l.getAttribute('id');
    return productId;
  }

  async hasNextPage(): Promise<Locator | null> {
    const selector = '//div[contains(@class,"more-products")]';
    const loc = this.page.locator(selector);
    return (await loc.isVisible()) ? loc : null;
  }

  /* v8 ignore start */
  // hot test에서 수동으로 수행하므로 coverage에서 제외
  async afterNextClick() {
    // no action needed
  }
  async handleCookies(): Promise<void> {
    const selector = '//*[@id="coi-banner-wrapper"]//button[@aria-label="Accept all"]';
    const loc = this.page.locator(selector);
    if (await loc.isVisible()) {
      await loc.click();
      await this.page.waitForSelector(selector, { state: 'hidden' });
    }
  }
  /* v8 ignore stop */
}

async function NewQuintListScraper(headless: boolean = false) {
  const instance = new QuintListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewQuintListScraper;
