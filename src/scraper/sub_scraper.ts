import { chromium, Page } from 'playwright';

type ProductProps = {
  storeId: number;
  brand: string;
  productName: string;
  productImgUrl: string;
  productUrl: string;
  priceCurrency: string;
  initPrice: number;
  lastPrice: number;
  korBrand?: string;
  korProductName?: string;
  productId:string;
  gender?:['w', 'm', 'b'];
  color?:string;
  category?:string;
  categorySpec?:string;

};
type ScrapResult = {
  'status':string;
  'data': any[];
};

class SubScraper {
  public page!: Page;

  async initBrowser() {
    const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
    const browser = await chromium.launch(
      {
        executablePath: bravePath,
        headless: false,
      },
    );
    this.page = await browser.newPage(); // Assign the new page to this.page
  }

  async execute():Promise<ScrapResult> {
    const url = this.getUrl();
    await this.browserWait();
    await this.page.goto(url);
    await this.handleCookies();
    await this.browserWait();
    const scrapResult = await this.isItemExist() ? await this.scrap() : this.failedResponse();
    return scrapResult;
  }

  getUrl():string {
    throw new Error('Method "getUrl" must be implemented');
  }

  getRandomInt(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async handleCookies() {
    throw new Error('Method "handleCookies" must be implemented');
  }

  async isItemExist(): Promise<boolean> {
    throw new Error('Method "isItemExist" must be implemented');
  }

  async scrap():Promise<ScrapResult> {
    const scrapData = await this.processPages.call(this);
    const pureData = this.dropDuplicate(scrapData);
    return { status: 'success', data: pureData };
  }

  async processPages(scrapData: ProductProps[] = []): Promise<ProductProps[]> {
    await this.scrollPage();
    await this.browserWait();
    const result = await this.extractDataFromHtml();
    scrapData.push(...result);

    if (await this.hasNextPage()) {
      return this.processPages.call(this, scrapData);
    }

    return scrapData;
  }

  async scrollPage() {
    this.page.evaluate(() => {
      window.scrollBy(0, this.getRandomInt(100, 500));
    });
  }

  async extractDataFromHtml():Promise<ProductProps[]> {
    throw new Error('Method "extractDataFromHtml" must be implemented');
  }

  async hasNextPage():Promise<boolean> {
    throw new Error('Method "hasNextPage" must be implemented');
  }

  dropDuplicate(scrapData:ProductProps[]):ProductProps[] {
    const jsonObject = scrapData.map((r) => JSON.stringify(r));
    const uniqueSet = new Set(jsonObject);
    return Array.from(uniqueSet).map((r) => JSON.parse(r));
  }

  failedResponse():ScrapResult {
    return { status: 'fail', data: [] };
  }

  async browserWait() {
    this.page.waitForTimeout(this.getRandomInt(500, 2500));
  }
}

export default SubScraper;
