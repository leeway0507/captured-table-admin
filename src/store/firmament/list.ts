import { Locator } from 'playwright';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class FirmamentListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 30,
      maxPagination: 1,
      storeName: 'firmament',
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
    return null;
  }
  async extractRawCards(): Promise<Locator[]> {
    const selector = '//div[@class="product--box box--image"]';
    const loc = this.page.locator(selector);
    return loc.all();
  }
  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productImgUrl = await l.getByRole('img').first().getAttribute('srcset');
    // console.log(productImgUrl);

    const productNameRaw = await l.getByRole('img').first().getAttribute('alt');
    // console.log(productNameRaw);

    const productName = productNameRaw!.toLowerCase().trim();
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
      productName: `${productName}`,
      productImgUrl: productImgUrl?.split(',')[0]!,
      productUrl: new URL(productUrl!, 'https://www.firmamentberlin.com').href,
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
    const salePriceRaw = l.locator('//span[@class="price--default is--nowrap is--discount"]');
    if (await salePriceRaw.isVisible()) {
      const retailPriceRaw = l.locator('//span[@class="price--discount is--nowrap"]');
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await salePriceRaw.textContent()) ?? '0';
    } else {
      const retailPriceRaw = l.locator('//span[@class="price--default is--nowrap"]');
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await retailPriceRaw.textContent()) ?? '0';
    }
    retailPrice = retailPrice.replace(/\s/g, '').replace('*', '');
    salePrice = salePrice.replace(/\s/g, '').replace('*', '');
    return { retailPrice, salePrice };
  }

  async extractProductId(l: Locator) {
    const productIdRaw = await l.getByRole('img').first().getAttribute('alt');
    const productIdRaw2 = productIdRaw?.split(' ');
    const productId = productIdRaw2![productIdRaw2!.length - 1];
    return productId ? productId.toLowerCase() : '-';
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

async function NewFirmamentListScraper(headless: boolean = false) {
  const instance = new FirmamentListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewFirmamentListScraper;
