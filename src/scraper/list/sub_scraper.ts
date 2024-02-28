import { chromium, Page, Locator } from 'playwright';

export type ProductProps = {
  brand: string;
  productName: string;
  productImgUrl: string;
  productUrl: string;
  priceCurrency: string;
  retailPrice: number;
  salePrice: number;
  korBrand?: string;
  korProductName?: string;
  productId:string;
  gender?:string;
  color?:string;
  category?:string;
  categorySpec?:string;
};

export type ScrapResultProps = {
  status:string;
  data: unknown[];
};

export type StoreBrandDataProps = {
  store_name:string
  brand_name:string
  brand_url:string
};
export type JobProps = {
  brandName:string
};

interface OptionsProps {
  scrollCount:number
  maxPagination:number
}

export const defaultOptions:OptionsProps = {
  scrollCount: 10,
  maxPagination: 10000,
};

class SubScraper {
  page!: Page;
  jobImp:JobProps;
  scrollCount: number;
  maxPagination: number;

  constructor(options:OptionsProps = defaultOptions) {
    this.jobImp = Object();
    this.scrollCount = options.scrollCount;
    this.maxPagination = options.maxPagination;
  }

  public get job() : JobProps | void {
    const jobExist = Object.keys(this.jobImp).length;
    return jobExist ? this.jobImp : (this.jobNotImplementedError)();
  }

  public set job(job : JobProps) {
    this.jobImp = job;
  }

  jobNotImplementedError() {
    throw new Error('jobNotImplementedError');
  }

  async initBrowser(headless:boolean = false) {
    const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
    const browser = await chromium.launch(
      {
        executablePath: bravePath,
        headless,
      },
    );
    this.page = await browser.newPage(); // Assign the new page to this.page
  }

  /* v8 ignore start */
  async execute():Promise<ScrapResultProps> {
    const url = this.getUrl();
    await this.browserWait();
    await this.page.goto(url);
    await this.handleCookies();
    await this.browserWait();
    const scrapResult = await this.isItemExist() ? await this.scrap() : this.failedResponse();
    return scrapResult;
  }

  getUrl(): string {
    const storebrandData = this.getBrandData();
    const url = storebrandData.find((v) => v.brand_name === this.job!.brandName)?.brand_url;
    const urlNotFoundError = () => { throw new Error('urlNotFoundError'); };
    return url ?? urlNotFoundError();
  }
  /* v8 ignore stop */

  getBrandData(): StoreBrandDataProps[] {
    throw new Error('Method "handleCookies" must be implemented');
  }

  getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async handleCookies() {
    throw new Error('Method "handleCookies" must be implemented');
  }

  async isItemExist(): Promise<boolean> {
    throw new Error('Method "isItemExist" must be implemented');
  }

  /* v8 ignore start */
  async scrap(): Promise<ScrapResultProps> {
    const duplicatedData = await this.executePageScrap();
    const scrapData = this.dropDuplicate(duplicatedData);
    return { status: 'success', data: scrapData };
  }

  async executePageScrap(scrapData: ProductProps[] = [], page:number = 0): Promise<ProductProps[]> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.scrollYPage();
    const result = await this.extractCards();
    scrapData.push(...result);

    const pageCount = page + 1;
    const nextPage = await this.hasNextPage();

    if (nextPage && pageCount < this.maxPagination) {
      await nextPage.click();
      const nextPageResult = await this.executePageScrap(scrapData);
      return nextPageResult;
    }
    return scrapData;
  }
  /* v8 ignore stop */

  async scrollYPage(count:number = 0) {
    if (this.scrollCount === 0) return;

    const randomNumber = this.getRandomInt(200, 1000);
    await this.page.evaluate((num:number) => {
      /* v8 ignore next */
      window.scrollBy(200, num);
    }, randomNumber);

    await this.browserWait();
    const scrollCount = count + 1;

    if (scrollCount < this.scrollCount) {
      await this.scrollYPage(scrollCount);
    }
  }

  async extractCards():Promise<ProductProps[]> {
    throw new Error('Method "extractCards" must be implemented');
  }

  async hasNextPage(): Promise<Locator | null> {
    throw new Error('Method "hasNextPage" must be implemented');
  }

  dropDuplicate(scrapData:ProductProps[]):ProductProps[] {
    const jsonObject = scrapData.map((r) => JSON.stringify(r));
    const uniqueSet = new Set(jsonObject);
    return Array.from(uniqueSet).map((r) => JSON.parse(r));
  }

  /* v8 ignore start */
  failedResponse():ScrapResultProps {
    return { status: 'fail', data: [] };
  }

  async browserWait() {
    await this.page.waitForTimeout(this.getRandomInt(500, 2000));
  }

  async loadingWait() {
    await this.page.waitForLoadState('networkidle');
  }
  /* v8 ignore stop */
}

export default SubScraper;
