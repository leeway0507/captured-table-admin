import _ from 'lodash';
import fs from 'fs';

export default function onvertKeysToCamelCase(obj: any) {
  return _.mapKeys(obj, (_v: any, key: any) => _.camelCase(key));
}

export function checkFileExist(filepath:string) {
  let flag = true;
  try {
    fs.accessSync(filepath, fs.constants.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}
export function deleteFile(filePath:string) {
  return fs.unlink(filePath, (err) => {
    if (err) {
      return false;
    }
    return true;
  });
}
