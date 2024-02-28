import { Locator } from 'playwright';
import SubScraper, { ProductProps, StoreBrandDataProps } from '../../scraper/list/sub_scraper';
import brandData from './brand_list.json';

class ConsortiumListScraper extends SubScraper {
  public brandList = brandData.brand_list;

  getBrandData(): StoreBrandDataProps[] {
    return brandData.data;
  }

  async extractCards() : Promise<ProductProps[]> {
    const locators = await this.extractRawCards();
    const promList = locators.map((l) => this.extractDataFromHtml(l));
    const dataList = await Promise.all(promList);
    return dataList;
  }

  async extractRawCards(): Promise<Locator[]> {
    const selector = '//li[@class="item text-center"]';
    const loc = this.page.locator((selector));
    return loc.all();
  }

  async extractDataFromHtml(l:Locator): Promise<ProductProps> {
    const productImgUrl = await l.getByRole('img').getAttribute('src');
    const productName = await l.locator('//h2').textContent();
    const productUrl = await l.locator('//h2/a').getAttribute('href');
    const { retailPrice, salePrice } = await this.extractPriceData(l);
    const color = await l.locator('//h4[@class="product-colour"]').textContent();
    const productId = await this.extractProductId(l);

    return {
      brand: this.job!.brandName,
      productName: productName!.toLowerCase(),
      productImgUrl: productImgUrl!,
      productUrl: productUrl!,
      priceCurrency: 'GBP',
      retailPrice,
      salePrice,
      productId,
      color: color!.replace(/^\(|\)$/g, ''),
    };
  }

  async extractPriceData(l:Locator) {
    let initPrice = '';
    let lastPrice = '';
    const regularPrice = l.locator('//span[@class="regular-price"]');
    if (await regularPrice.isVisible()) {
      initPrice = await regularPrice.textContent() ?? '0';
      lastPrice = await regularPrice.textContent() ?? '0';
    } else {
      initPrice = await l.locator('//span[@class="old-price"]').textContent() ?? '0';
      lastPrice = await l.locator('//span[@class="special-price"]').textContent() ?? '0';
    }
    const retailPrice = parseFloat(initPrice.replace('£', ''));
    const salePrice = parseFloat(lastPrice.replace('£', ''));
    return { retailPrice, salePrice };
  }

  async extractProductId(l:Locator) {
    const color = await l.locator('//h4[@class="product-colour"]').textContent();
    const productUrl = await l.locator('//h2/a').getAttribute('href');

    let prodIdBefore: string | null = null;
    if (color) {
      prodIdBefore = color.replace(/^\(|\)$/g, '').toLowerCase()
        .split('/').pop()
        ?.split(' ')
        .pop()
        ?.split('-')
        .pop()
        ?.toLowerCase() || null;
    }

    const rindex = (lst: string[], value: string) => {
      const idx = lst.slice().reverse().indexOf(value);
      return idx >= 0 ? lst.length - idx - 1 : -1;
    };

    let productId = '-';
    const baseUrl = 'https://www.consortium.co.uk/';
    const productIdRaw = productUrl
      ?.replace(baseUrl, '')
      .replace('-', ' ')
      .replace('.html', '');

    if (prodIdBefore && productIdRaw!.includes(prodIdBefore)) {
      const splitName = productIdRaw!.split('-');
      const idx = rindex(splitName, prodIdBefore) + 1;
      productId = splitName.slice(idx).join('-');
    }
    return productId;
  }

  async hasNextPage(): Promise<Locator | null> {
    const selector = '//a[contains(@class,"next i-next")]';
    const loc = this.page.locator(selector);
    return await loc.isVisible() ? loc : null;
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

export default ConsortiumListScraper;
