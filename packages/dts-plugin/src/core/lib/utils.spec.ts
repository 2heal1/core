import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest';
import { Agent } from 'undici';
import { axiosGet, cloneDeepOptions } from './utils';
import type { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

vi.mock('undici', () => {
  return {
    Agent: vi.fn().mockImplementation(() => ({
      close: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.useRealTimers();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  (globalThis as any).fetch = originalFetch;
});

it('axiosGet（fetch）成功：默认 family=4', async () => {
  const mockFetch = vi.mocked(globalThis.fetch as any);
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: vi.fn().mockResolvedValueOnce({ ok: true }),
    text: vi.fn(),
    arrayBuffer: vi.fn(),
  });

  const res = await axiosGet('http://localhost');
  expect(res.data).toEqual({ ok: true });

  expect(vi.mocked(Agent)).toHaveBeenCalledWith({ connect: { family: 4 } });
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

it('axiosGet（fetch）成功：支持 family=6', async () => {
  const mockFetch = vi.mocked(globalThis.fetch as any);
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'text/plain' }),
    json: vi.fn(),
    text: vi.fn().mockResolvedValueOnce('ok'),
    arrayBuffer: vi.fn(),
  });

  const res = await axiosGet('http://localhost', { family: 6 });
  expect(res.data).toBe('ok');

  expect(vi.mocked(Agent)).toHaveBeenCalledWith({ connect: { family: 6 } });
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

it('axiosGet（fetch）失败：非 2xx 会抛错', async () => {
  const mockFetch = vi.mocked(globalThis.fetch as any);
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
    statusText: 'Not Found',
    headers: new Headers(),
    json: vi.fn(),
    text: vi.fn(),
    arrayBuffer: vi.fn(),
  });

  await expect(axiosGet('http://localhost')).rejects.toThrow(
    'Request failed: 404 Not Found',
  );
});

describe('cloneDeepOptions', () => {
  it('deep clones plain values', () => {
    const options: DTSManagerOptions = {
      remote: {
        moduleFederationConfig: {
          name: 'app',
          filename: 'mf.js',
          exposes: {},
          remotes: {},
        },
      },
    };

    const result = cloneDeepOptions(options);

    expect(result).toEqual(options);
    expect(result).not.toBe(options);
    expect(result.remote).not.toBe(options.remote);
  });

  it('replaces "manifest" key with false at any nesting level', () => {
    const options: DTSManagerOptions = {
      remote: {
        moduleFederationConfig: {
          name: 'app',
          filename: 'mf.js',
          exposes: {},
          remotes: {},
          manifest: true,
        },
      },
    };
    const result = cloneDeepOptions(options);

    expect(result.remote?.moduleFederationConfig.manifest).toBe(false);
  });

  it('replaces "async" key with false', () => {
    const options: DTSManagerOptions = {
      remote: {
        moduleFederationConfig: {
          name: 'app',
          filename: 'mf.js',
          exposes: {},
          remotes: {},
          async: true,
        },
      },
    };
    const result = cloneDeepOptions(options);

    expect(result.remote?.moduleFederationConfig.async).toBe(false);
  });

  it('replaces function values with false', () => {
    const fn = () => 'hello';
    const options: DTSManagerOptions = { extraOptions: { compute: fn } };

    const result = cloneDeepOptions(options);

    expect(result.extraOptions?.['compute']).toBe(false);
  });

  it('converts extractThirdParty array items to strings', () => {
    const regex = /^react$/;
    const options: DTSManagerOptions = {
      extraOptions: { extractThirdParty: [regex, 'lodash'] },
    };

    const result = cloneDeepOptions(options);

    expect(result.extraOptions?.['extractThirdParty']).toEqual([
      regex.toString(),
      'lodash',
    ]);
  });

  it('does not share object references with the original', () => {
    const nested = { value: 42 };
    const options: DTSManagerOptions = { extraOptions: { nested } };

    const result = cloneDeepOptions(options);

    expect(result.extraOptions?.['nested']).toEqual(nested);
    expect(result.extraOptions?.['nested']).not.toBe(nested);
  });

  it('does not throw on a self-referencing object', () => {
    const circular: { [key: string]: unknown } = { value: 1 };
    circular['self'] = circular;
    const options: DTSManagerOptions = { extraOptions: circular };

    expect(() => cloneDeepOptions(options)).not.toThrow();
  });

  it('preserves the cycle in the cloned result', () => {
    const circular: { [key: string]: unknown } = { value: 1 };
    circular['self'] = circular;
    const options: DTSManagerOptions = { extraOptions: circular };

    const result = cloneDeepOptions(options);

    expect(result.extraOptions?.['value']).toBe(1);
    expect(result.extraOptions?.['self']).toBe(result.extraOptions);
  });

  it('does not throw on a circular array', () => {
    const arr: unknown[] = [1, 2];
    arr.push(arr);
    const options: DTSManagerOptions = { extraOptions: { arr } };

    expect(() => cloneDeepOptions(options)).not.toThrow();
  });
});
