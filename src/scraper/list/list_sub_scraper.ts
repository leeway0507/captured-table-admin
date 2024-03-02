import SubScraper, { ListJobProps } from '../sub_scraper';

const urlNotFoundError = () => { throw new Error('urlNotFoundError'); };

class ListSubScraper extends SubScraper<ListJobProps> {
  getUrl(): string {
    const storebrandData = this.getBrandData();
    const url = storebrandData.find((v) => v.brand_name === this.job!.brandName)?.brand_url;
    return url ?? urlNotFoundError();
  }
}

export default ListSubScraper;
