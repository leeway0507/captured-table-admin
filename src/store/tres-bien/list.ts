import { Locator } from 'playwright';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class TresBienListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 10,
      maxPagination: 10,
      storeName: 'tres-bien',
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

  async hasNextPage(): Promise<Locator | null> {
    const selector = '//div[@class="action  next"]';
    const loc = this.page.locator(selector);
    return (await loc.isVisible()) ? loc : null;
  }

  async extractRawCards(): Promise<Locator[]> {
    const selector = '//li[@class="item product product-item plp__grid-item"]';
    const loc = this.page.locator(selector);
    return loc.all();
  }
  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productImgUrl = await l.getByRole('img').first().getAttribute('src');
    // console.log(productImgUrl);

    const productNameRaw = await l.locator('a').first().getAttribute('href');
    // console.log(productNameRaw);

    const productName = productNameRaw!.replace('https://tres-bien.com/', '').replaceAll('-', ' ');
    // console.log(productName);

    const productUrl = await l.locator('a').first().getAttribute('href');
    // console.log(productUrl);

    const { retailPrice, salePrice } = await this.extractPriceData(l);
    // console.log(retailPrice, salePrice);

    const productId = await this.extractProductId();
    // console.log(productId);

    const isSale = retailPrice !== salePrice;
    // console.log(isSale);

    return {
      brand: this.job!.brandName,
      productName: `${productName}`,
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
    let retailPrice = '';
    let salePrice = '';
    const isSale = l.locator('//span[@data-price-type="oldPrice"]');
    if (await isSale.isVisible()) {
      const retailPriceRaw = l.locator('//span[@data-price-type="oldPrice"]');
      const salePriceRaw = l.locator('//span[@data-price-type="finalPrice"]');
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await salePriceRaw.textContent()) ?? '0';
    } else {
      const retailPriceRaw = l.locator('//span[@data-price-type="finalPrice"]');
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await retailPriceRaw.textContent()) ?? '0';
    }
    retailPrice = retailPrice.replace(/\s/g, '');
    salePrice = salePrice.replace(/\s/g, '');
    return { retailPrice, salePrice };
  }

  async extractProductId() {
    return '-';
  }

  /* v8 ignore start */
  // hot test에서 수동으로 수행하므로 coverage에서 제외
  async afterNextClick() {
    // no action needed
  }
  async handleCookies(): Promise<void> {
    // no action needed
  }
  /* v8 ignore stop */
}

async function NewTresBienListScraper(headless: boolean = false) {
  const instance = new TresBienListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewTresBienListScraper;
