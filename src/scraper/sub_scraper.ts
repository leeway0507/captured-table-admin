import { chromium, Page, Locator } from 'playwright'

export type ProductProps = {
    brand: string
    productName: string
    productImgUrl: string
    productUrl: string
    priceCurrency: string
    retailPrice: string
    salePrice: string
    korBrand?: string
    korProductName?: string
    productId: string
    gender?: string
    color?: string
    category?: string
    categorySpec?: string
}

export type ScrapResultProps = {
    status: string
    data: unknown[]
}

export type StoreBrandDataProps = {
    store_name: string
    brand_name: string
    brand_url: string
}

export type PageJobProps = {
    brandName: string
}
export type ListJobProps = {
    brandName: string
}

export interface OptionsProps {
    scrollCount: number
    maxPagination: number
    storeName: string
    scrapType: string
}

export const defaultOptions: OptionsProps = {
    scrollCount: 10,
    maxPagination: 10000,
    storeName: '',
    scrapType: '',
}

export interface SubScraperInterface {
    job: PageJobProps | ListJobProps | void
    options: OptionsProps
    execute: () => Promise<ScrapResultProps>
    executePageScrap: (scrapData: ProductProps[], pageNation: number) => Promise<ProductProps[]>
}

class SubScraper<T extends object> {
    page!: Page
    jobImp: T
    options: OptionsProps

    constructor(options: OptionsProps = defaultOptions) {
        this.jobImp = Object()
        this.options = options
    }
    public set job(job: T) {
        this.jobImp = job
    }

    public get job(): T | void {
        const jobExist = Object.keys(this.jobImp).length
        return jobExist ? this.jobImp : this.jobNotImplementedError()
    }

    jobNotImplementedError() {
        throw new Error('jobNotImplementedError')
    }

    async initBrowser(headless: boolean = false) {
        const bravePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
        const browser = await chromium.launch({
            executablePath: bravePath,
            headless,
        })
        this.page = await browser.newPage() // Assign the new page to this.page
    }

    /* v8 ignore start */
    async execute(): Promise<ScrapResultProps> {
        const url = this.getUrl()
        await this.browserWait()
        await this.page.goto(url)
        await this.handleCookies()
        await this.browserWait()
        const scrapResult = await this.scrap()
        return scrapResult
    }
    /* v8 ignore stop */

    getUrl(): string {
        throw new Error('Method "handleCookies" must be implemented')
    }

    getBrandData(): StoreBrandDataProps[] {
        throw new Error('Method "handleCookies" must be implemented')
    }

    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    async handleCookies() {
        throw new Error('Method "handleCookies" must be implemented')
    }

    async isItemExist(): Promise<boolean> {
        throw new Error('Method "isItemExist" must be implemented')
    }

    /* v8 ignore start */
    async scrap(): Promise<ScrapResultProps> {
        const duplicatedData = await this.executePageScrap()
        const scrapData = this.dropDuplicate(duplicatedData)
        return { status: 'success', data: scrapData }
    }

    async executePageScrap(scrapData: ProductProps[] = [], pageNation: number = 0): Promise<ProductProps[]> {
        await this.page.waitForLoadState('domcontentloaded')
        await this.scrollYPage()
        const result = await this.extractCards()
        scrapData.push(...result)

        const pagepageNationCount = pageNation + 1
        const nextPage = await this.hasNextPage()

        if (nextPage && pagepageNationCount < this.options.maxPagination) {
            await nextPage.click()
            const nextPageResult = await this.executePageScrap(scrapData)
            return nextPageResult
        }
        return scrapData
    }
    /* v8 ignore stop */

    async scrollYPage(count: number = 0) {
        if (this.options.scrollCount === 0) return

        const randomNumber = this.getRandomInt(200, 1000)
        await this.page.evaluate((num: number) => {
            /* v8 ignore next */
            window.scrollBy(200, num)
        }, randomNumber)

        await this.browserWait()
        const scrollCount = count + 1

        if (scrollCount < this.options.scrollCount) {
            await this.scrollYPage(scrollCount)
        }
    }

    async extractCards(): Promise<ProductProps[]> {
        throw new Error('Method "extractCards" must be implemented')
    }

    async hasNextPage(): Promise<Locator | null> {
        throw new Error('Method "hasNextPage" must be implemented')
    }

    dropDuplicate(scrapData: ProductProps[]): ProductProps[] {
        const jsonObject = scrapData.map((r) => JSON.stringify(r))
        const uniqueSet = new Set(jsonObject)
        return Array.from(uniqueSet).map((r) => JSON.parse(r))
    }

    /* v8 ignore start */
    failedResponse(): ScrapResultProps {
        return { status: 'fail', data: [] }
    }

    async browserWait() {
        await this.page.waitForTimeout(this.getRandomInt(500, 2000))
    }

    async loadingWait() {
        await this.page.waitForLoadState('networkidle')
    }
    /* v8 ignore stop */
}

export default SubScraper
