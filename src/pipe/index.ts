import minimist from 'minimist';
import MainBatcher from './main_batcher';
// import NewConsortiumListScraper from '../store/consortium/list';
// import NewEndclothingListScraper from '../store/end_clothing/list';
// import NewHarresoeListScraper from '../store/harresoe/list';
// import NewUrbanIndustryListScraper from '../store/urban_industry/list';
import NewQuintListScraper from '../store/quint/list';
import 'dotenv/config';

// example :ts-node --project tsconfig.json
// /Users/yangwoolee/repo/captured-filter/admin/src/pipe/index.ts --brand adidas
async function execute() {
  const argv = minimist(process.argv.slice(2));
  // const scraper = await NewConsortiumListScraper();
  // const scraper = await NewEndclothingListScraper();
  const scraper = await NewQuintListScraper();

  console.log('start');
  const main = new MainBatcher(scraper, argv.brand);
  await main.scrap();
}

(async () => {
  // Your asynchronous code here
  console.log('Async code running at the top level');
  await execute();
  console.log('Async code finished executing');
  process.exit(1);
})();
