import { Locator } from 'playwright';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class OneBlockDownListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 7,
      maxPagination: 10,
      storeName: 'oneblockdown',
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
    const selector = '//span[@class="next"]';
    const loc = this.page.locator(selector);
    return (await loc.isVisible()) ? loc : null;
  }

  async extractRawCards(): Promise<Locator[]> {
    const selector = `//div[contains(@class,"product-card ${this.job!.brandName.replaceAll(' ', '-')}")]`;
    const loc = this.page.locator(selector);
    return loc.all();
  }
  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productImgUrl = await l.getByRole('img').first().getAttribute('srcset');
    // console.log(productImgUrl);

    const productNameRaw = await l.locator('a').first().getAttribute('href');
    // console.log(productNameRaw);

    const productName = productNameRaw!.split('/')[4].replaceAll('-', ' ');
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
      productName: `${this.job!.brandName} ${productName}`,
      productImgUrl: `https:${productImgUrl?.split('720w, ')[1].split(' 900w')[0]}`,
      productUrl: new URL(productUrl!, 'https://row.oneblockdown.it/').href,
      currencyCode: 'EUR',
      retailPrice,
      salePrice,
      isSale,
      productId: productId?.toLocaleLowerCase()!,
    };
  }

  async extractPriceData(l: Locator) {
    let retailPrice = '';
    let salePrice = '';
    const isSale = l.locator('//span[@class="was_price"]');
    if (await isSale.isVisible()) {
      const retailPriceRaw = l.locator('//span[@class="was_price"]');
      const salePriceRaw = l.locator('//span[@class="money"]');
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await salePriceRaw.last().textContent()) ?? '0';
    } else {
      const retailPriceRaw = l.locator('//span[@class="money"]');
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await retailPriceRaw.textContent()) ?? '0';
    }
    retailPrice = retailPrice.replace(/\s/g, '');
    salePrice = salePrice.replace(/\s/g, '');
    return { retailPrice, salePrice };
  }

  async extractProductId(l:Locator) {
    const r = l.locator('//hgroup/h4');
    const prodId = r ? await r.textContent() : '-';
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

async function NewOneBlockDownListScraper(headless: boolean = false) {
  const instance = new OneBlockDownListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewOneBlockDownListScraper;
