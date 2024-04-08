import { Locator } from 'playwright';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class SheltaListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 30,
      maxPagination: 1,
      storeName: 'shelta',
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
    const selector = '//li[@class="product-item" and not(.//div[@class="sold-out"])]';
    const loc = this.page.locator(selector);
    return loc.all();
  }
  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productImgUrl = await l.getByRole('img').first().getAttribute('src');
    // console.log(productImgUrl);

    const productNameRaw = await l.getByRole('img').first().getAttribute('alt');
    // console.log(productNameRaw);

    const productName = productNameRaw!.replaceAll('&', ' ').replaceAll(/  +/g, ' ').toLowerCase().trim();
    // console.log(productName);

    const productUrl = await l.locator('a').first().getAttribute('href');
    // console.log(productUrl);

    const { retailPrice, salePrice } = await this.extractPriceData(l);
    // console.log(retailPrice, salePrice);

    const productId = await this.extractProductId(l);
    // console.log(productId);

    const isSale = retailPrice !== salePrice;
    // console.log(isSale);

    return {
      brand: this.job!.brandName,
      productName: `${productName} ${productId}`,
      productImgUrl: new URL(productImgUrl!, 'https://shelta.eu').href,
      productUrl: new URL(productUrl!, 'https://shelta.eu').href,
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
    const standardPriceRaw = l.locator('//*/div[@class="price-standard"]');
    if (await standardPriceRaw.isVisible()) {
      retailPrice = (await standardPriceRaw.textContent()) ?? '0';
      salePrice = (await standardPriceRaw.textContent()) ?? '0';
    } else {
      const retailPriceRaw = l.locator('//*/div[@class="price-previous"]');
      const salePriceRaw = l.locator('//*/div[@class="price-promotion"]');
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await salePriceRaw.textContent()) ?? '0';
    }
    retailPrice = retailPrice.replace(/\s/g, '').replace('EUR', '');
    salePrice = salePrice.replace(/\s/g, '').replace('EUR', '');
    return { retailPrice, salePrice };
  }

  async extractProductId(l: Locator) {
    const productIdRaw = await l.getByRole('img').first().getAttribute('data-original');
    const productId = productIdRaw?.split('?')[0].split('/')[3].split('_')[0].replace('.jpg', '');
    return productId ? productId.toLowerCase() : '-';
  }

  async hasNextPage(): Promise<Locator | null> {
    return null;
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

async function NewSheltaListScraper(headless: boolean = false) {
  const instance = new SheltaListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewSheltaListScraper;
