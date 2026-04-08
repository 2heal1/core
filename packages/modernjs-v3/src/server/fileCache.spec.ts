import { it, expect, describe, vi } from 'vitest';
import { FileCache } from './fileCache';

vi.mock('node:fs/promises', () => ({
  access: vi.fn(() => Promise.resolve()),
  lstat: vi.fn(() => Promise.resolve({ mtimeMs: Date.now(), size: 4 })),
  readFile: vi.fn(() => Promise.resolve('test')),
}));

describe('modern serve static file cache', async () => {
  it('should cache file', async () => {
    const cache = new FileCache();
    const result = await cache.getFile('test.txt');
    expect(result?.content).toBe('test');
  });
});
