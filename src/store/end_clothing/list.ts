import { Locator } from 'playwright';
import path from 'path';
import { ProductProps, StoreBrandDataProps } from '../../scraper/sub_scraper';
import ListSubScraper from '../../scraper/list/list_sub_scraper';
import brandData from './brand_list.json';

export class EndclothingListScraper extends ListSubScraper {
  constructor() {
    super({
      scrollCount: 15,
      maxPagination: 30,
      storeName: 'end_clothing',
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
    await this.scrollUp();

    return dataList;
  }

  async extractRawCards(): Promise<Locator[]> {
    const selector = '//*[@data-test-id="ProductCard__ProductCardSC"]';
    const loc = this.page.locator(selector);
    return loc.all();
  }

  async extractDataFromHtml(l: Locator): Promise<ProductProps> {
    const productImgUrl = await l.getByRole('img').first().getAttribute('src');
    const productNameRaw = await l.getByRole('img').first().getAttribute('alt');
    const productName = productNameRaw!.replaceAll('&', ' ').replaceAll(/  +/g, ' ').toLowerCase().trim();
    const productUrl = await l.getAttribute('href');
    const { retailPrice, salePrice } = await this.extractPriceData(l);
    const productId = await this.extractProductId(l);
    const isSale = retailPrice !== salePrice;

    const color = await l.locator('//span[@data-test-id="ProductCard__ProductColor"]').textContent(); return {
      brand: this.job!.brandName,
      productName: `${productName} ${productId}`,
      productImgUrl: productImgUrl!,
      productUrl: path.join('https://www.endclothing_.com', productUrl!),
      currencyCode: 'KRW',
      retailPrice,
      salePrice,
      isSale,
      productId: productId!,
      color: color!.replaceAll('&', '/'),
    };
  }

  async extractPriceData(l: Locator) {
    let retailPrice = '';
    let salePrice = '';
    const retailPriceRaw = l.locator('//*/span[@data-test-id="ProductCard__ProductFullPrice"]');
    const salePriceRaw = l.locator('//*/span[@data-test-id="ProductCard__ProductFinalPrice"]');
    if (await retailPriceRaw.isVisible()) {
      retailPrice = (await retailPriceRaw.textContent()) ?? '0';
      salePrice = (await salePriceRaw.textContent()) ?? '0';
    } else {
      retailPrice = (await salePriceRaw.textContent()) ?? '0';
      salePrice = (await salePriceRaw.textContent()) ?? '0';
    }
    retailPrice = retailPrice.replace(/\s/g, '');
    salePrice = salePrice.replace(/\s/g, '');
    return { retailPrice, salePrice };
  }

  async extractProductId(l: Locator) {
    const productId = await l.getAttribute('id');
    return productId;
  }

  async hasNextPage(): Promise<Locator | null> {
    const selector = '//div[contains(@class,"LoadMoreButton__LoadMoreButtonWrapperSC")]';
    const loc = this.page.locator(selector);
    return (await loc.isVisible()) ? loc : null;
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
  async afterNextClick() {
    await this.scrollUp();
  }
  async scrollUp() {
    const randomNumber = -2000;
    await this.page.evaluate((num: number) => {
      /* v8 ignore next */
      window.scrollBy(0, num);
    }, randomNumber);
    await this.loadingWait();
  }
  /* v8 ignore stop */
}

async function NewEndclothingListScraper(headless: boolean = false) {
  const instance = new EndclothingListScraper();
  await instance.initBrowser(headless);
  return instance;
}

export default NewEndclothingListScraper;
