import { SubScraperInterface } from '../scraper/sub_scraper'
import SaveBatcher from './save_batcher'
import path from 'path'

class MainBatcher {
    scraper: SubScraperInterface
    saveBatcher: SaveBatcher
    targetBrand: string
    savePath: string

    constructor(
        scraper: SubScraperInterface,
        targetBrand: string,
        savePath: string = path.join(process.env.PIPELINE!, scraper.options.storeName, scraper.options.scrapType),
    ) {
        this.scraper = scraper
        this.targetBrand = targetBrand
        this.savePath = savePath
        this.saveBatcher = new SaveBatcher()
    }
    async scrap(fileName: string = this.saveBatcher.fileName()) {
        this.scraper.job = { brandName: this.targetBrand }
        const scrapResult = await this.scraper.execute()
        console.log('successfully scrap!!', scrapResult.data.length)

        if (scrapResult.status === 'success') {
            this.saveBatcher.save(JSON.stringify(scrapResult.data), this.savePath, fileName)
            console.log('successfully Save!!')
        } else {
            console.log("failed to scrap and doesn't save")
        }
    }
}
export default MainBatcher
