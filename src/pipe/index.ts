import minimist from 'minimist';
import MainBatcher from './main_batcher';
import NewConsortiumListScraper from '../store/consortium/list';
import 'dotenv/config';

// example :ts-node --project tsconfig.json
// /Users/yangwoolee/repo/captured-filter/admin/src/pipe/index.ts --brand adidas
async function execute() {
  const argv = minimist(process.argv.slice(2));
  console.log('start');
  const scraper = await NewConsortiumListScraper();
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
