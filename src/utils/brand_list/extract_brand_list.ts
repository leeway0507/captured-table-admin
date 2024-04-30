import fs from 'fs';
import { parse, HTMLElement } from 'node-html-parser';
import path from 'path';

export type BrandObj = {
  store_name:string
  brand_name:string
  brand_url:string
};

export default class BrandListExtractor {
  public defaultUrl;
  public localPath;
  public storeName;
  public pattern;
  constructor(defaultUrl:string, storeName:string, localPath:string, pattern:string) {
    this.defaultUrl = defaultUrl;
    this.storeName = storeName;
    this.localPath = localPath;
    this.pattern = pattern;
  }
  execute() {
    const data = this.extractInfo();
    this.save(data);
  }
  extractInfo(): BrandObj[] {
    const doc = this.loadHTML();
    const brands = doc.querySelectorAll(this.pattern);

    return brands.map((e) => {
      const brandUrl = e.querySelector('a') && new URL(e.querySelector('a')!.getAttribute('href')!, this.defaultUrl).href;
      return {
        store_name: this.storeName,
        brand_name: e.text.toLowerCase().trim(),
        brand_url: brandUrl ?? '',
      };
    });
  }
  save(brandArr:BrandObj[]) {
    const brandList = this.extractBrandList(brandArr);
    const data = {
      brand_list: brandList,
      data: brandArr,
    };
    const filePath = path.join(this.localPath, `${this.storeName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  loadHTML():HTMLElement {
    const htmlText = this.loadHTMLText();
    return this.parseLocalHTML(htmlText);
  }

  loadHTMLText():string {
    const filePath = path.join(this.localPath, 'html', `${this.storeName}.html`);
    return fs.readFileSync(filePath, 'utf-8');
  }

  parseLocalHTML(textHTML:string):HTMLElement {
    const c = parse(textHTML);
    return c;
  }

  extractBrandList(brandArr:BrandObj[]): string[] {
    return brandArr.reduce<string[]>((arr, d) => [...arr, d.brand_name], []);
  }
}
