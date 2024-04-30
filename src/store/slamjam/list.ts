import { Locator } from 'playwright';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class SlamJamListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 5,
      maxPagination: 10,
      storeName: 'slamjam',
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
    const selector = '//a[@class="load-more btn"]';
    const loc = this.page.locator(selector).last();
    return (await loc.isVisible()) ? loc : null;
  }

  async extractRawCards(): Promise<Locator[]> {
    const selector = '//*[@id="shop-products"]/div[@data-product-available="in stock"]';
    const loc = this.page.locator(selector);
    return loc.all();
  }
  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productImgUrl = await l.getByRole('img').first().getAttribute('src');
    // console.log(productImgUrl);

    const productNameRaw = await l.locator('a').first().getAttribute('href');
    // console.log(productNameRaw);

    const productName = productNameRaw!.replace('/products/', '').replaceAll('-', ' ');
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
      productImgUrl: `https:${productImgUrl}`,
      productUrl: new URL(productUrl!, 'https://slamjam.com/').href,
      currencyCode: 'KRW',
      retailPrice,
      salePrice,
      isSale,
      productId: productId?.toLocaleLowerCase()!,
    };
  }

  async extractPriceData(l: Locator) {
    let retailPrice = '';
    let salePrice = '';
    const isSale = await l.getAttribute('data-metric1');
    if (isSale && isSale !== '0') {
      const retailPriceRaw = await l.getAttribute('data-metric1');
      const salePriceRaw = await l.getAttribute('data-price');
      retailPrice = retailPriceRaw ?? '0';
      salePrice = salePriceRaw ?? '0';
    } else {
      const retailPriceRaw = await l.getAttribute('data-price');
      retailPrice = retailPriceRaw ?? '0';
      salePrice = retailPriceRaw ?? '0';
    }
    return { retailPrice, salePrice };
  }

  async extractProductId(l:Locator) {
    const r = l.getAttribute('data-supplier-code');
    const prodId = r ? await r.then((x) => x?.toLowerCase()) : '-';
    return prodId;
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

async function NewSlamJamListScraper(headless: boolean = false) {
  const instance = new SlamJamListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewSlamJamListScraper;
