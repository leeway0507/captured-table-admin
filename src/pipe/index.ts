import minimist from 'minimist';
import MainBatcher from './main_batcher';
import NewConsortiumListScraper from '../store/consortium/list';
import NewEndclothingListScraper from '../store/end_clothing/list';
import NewHarresoeListScraper from '../store/harresoe/list';
import NewUrbanIndustryListScraper from '../store/urban_industry/list';
import NewQuintListScraper from '../store/quint/list';
import NewSheltaListScraper from '../store/shelta/list';
import 'dotenv/config';

const scraperArr = {
  consortium: NewConsortiumListScraper,
  harresoe: NewHarresoeListScraper,
  endclothing: NewEndclothingListScraper,
  urban_industry: NewUrbanIndustryListScraper,
  quint: NewQuintListScraper,
  shelta: NewSheltaListScraper,

};

// example :ts-node --project tsconfig.json
// /Users/yangwoolee/repo/captured-filter/admin/src/pipe/index.ts --brand adidas
async function execute() {
  const argv = minimist(process.argv.slice(2));
  const { store, brand, fileName } = argv;

  if (!process.env.PIPELINE_SCRAP) {
    console.error('No PIPELINE_SCRAP IN ENV');
    process.exit(1);
  }
  console.log('start');
  const scraper = await scraperArr[store as keyof typeof scraperArr]();
  const main = new MainBatcher(scraper, brand);
  await main.scrap(fileName);
}

(async () => {
  // Your asynchronous code here
  console.log('Async code running at the top level');
  await execute();
  console.log('Async code finished executing');
  process.exit(1);
})();
