import { Locator } from 'playwright';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class UrbanIndustryListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 1,
      maxPagination: 1,
      storeName: 'urban_industry',
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
    const selector = '//*[@id="product-grid"]//li[@class="grid__item"]';
    const loc = this.page.locator(selector);
    return loc.all();
  }

  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productImgUrl = await l.getByRole('img').getAttribute('src');
    const productUrlPath = await l.locator('//h3[contains(@class,"h5")]/a').getAttribute('href');
    const productUrl = new URL(productUrlPath!, 'https://www.urbanindustry.co.uk/');
    const productName = productUrlPath?.split('?')[0].replace('/products/', '').replaceAll('-', ' ');
    const color = await l.locator('//h3[contains(@class,"h5")]/a/span').textContent();

    const { retailPrice, salePrice } = await this.extractPriceData(l);

    const isSale = retailPrice !== salePrice;
    // product id를 추출할 패턴이 없음
    const productId = '-';

    return {
      brand: this.job!.brandName,
      productName: productName!,
      productImgUrl: `https:${productImgUrl!}`,
      productUrl: productUrl.href,
      currencyCode: 'KRW',
      retailPrice,
      salePrice,
      isSale,
      productId,
      color: color?.replace('\n', ''),
    };
  }

  async extractPriceData(l: Locator) {
    let retailPrice = '';
    let salePrice = '';
    const retailPriceRaw = l.locator('//s[contains(@class,"price-item--regular")]');
    const salePriceRaw = l.locator('//span[contains(@class,"price-item--last")]').first();

    retailPrice = (await retailPriceRaw.textContent().then((r) => r?.trim())) ?? '0';
    if (retailPrice !== '₩0 KRW') {
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await salePriceRaw.textContent()) ?? '0';
    } else {
      retailPrice = (await salePriceRaw.textContent()) ?? '0';
      salePrice = (await salePriceRaw.textContent()) ?? '0';
    }
    retailPrice = retailPrice!.replace('KRW', '').trim();
    salePrice = salePrice!.replace('KRW', '').split('(')[0].trim();

    return { retailPrice, salePrice };
  }

  async hasNextPage(): Promise<Locator | null> {
    const selector = '//a[@aria-label="Next page"]';
    const loc = this.page.locator(selector);
    return (await loc.isVisible()) ? loc : null;
  }

  /* v8 ignore start */
  // hot test에서 수동으로 수행하므로 coverage에서 제외
  async handleCookies(): Promise<void> {
    const emptyFunction = () => {};
    emptyFunction();
  }
  /* v8 ignore stop */
}

async function NewUrbanIndustryListScraper(headless: boolean = false) {
  const instance = new UrbanIndustryListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewUrbanIndustryListScraper;
