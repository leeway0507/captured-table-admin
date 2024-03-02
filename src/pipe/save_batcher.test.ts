import { describe, expect, test } from 'vitest';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import SaveBatcher from './save_batcher';

describe('Test Scrap -> Save data to backend Pipe folder', () => {
  const batcher = new SaveBatcher();
  const storeName = 'test';
  const scrapType = 'list';
  const targetPath = path.join('src', 'pipe', storeName, scrapType);
  test('should create scrap folder', () => {
    batcher.createDir(targetPath);
    expect(fs.existsSync(targetPath)).toBe(true);
  });

  test('should follow file name format, "240101T123456', () => {
    const fileName = batcher.fileName();
    expect(fileName.includes('T')).toBe(true);
  });

  test('should save scrap result to targetPAth', () => {
    const fileName = batcher.fileName();
    batcher.save('{"hello":"world"}', targetPath, fileName);

    const filePath = path.join(targetPath, `${fileName}.json`);
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
