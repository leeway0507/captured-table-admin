import { describe, expect, test } from 'vitest';
import onvertKeysToCamelCase from './test_utils';

describe(('test_util'), async () => {
  test('should onvertKeysToCamelCase', async () => {
    const got = {
      snake_case: '1',
    };
    const want = {
      snakeCase: '1',
    };
    expect(onvertKeysToCamelCase(got)).toStrictEqual(want);
  });
});
