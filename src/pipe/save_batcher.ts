import path from 'path';
import fs from 'fs';

class SaveBatcher {
  save(data:string, targetPath:string, fileName:string) {
    this.createDir(targetPath);
    fs.writeFileSync(path.join(targetPath, `${fileName}.json`), data);
  }

  createDir(targetPath:string) {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }
  fileName() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = this.padZero(now.getMonth() + 1);
    const day = this.padZero(now.getDate());
    const hours = this.padZero(now.getHours());
    const minutes = this.padZero(now.getMinutes());
    const seconds = this.padZero(now.getSeconds());

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }
  padZero(num:number) {
    return num.toString().padStart(2, '0'); // Ensure two digits, padding with zero if necessary
  }
}

export default SaveBatcher;
