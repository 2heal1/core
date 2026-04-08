import { it, describe, expect, vi } from 'vitest';
import http from 'http';
import { EventEmitter } from 'node:events';
import { axiosGet, cloneDeepOptions } from './utils';
import type { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

const mockHttpRequestOk = () => {
  return vi.spyOn(http, 'request').mockImplementation((...args: any[]) => {
    const cb = args[2] as (res: any) => void;
    const res = new EventEmitter() as any;
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.headers = { 'content-type': 'application/json' };

    queueMicrotask(() => {
      cb(res);
      res.emit('data', Buffer.from('{}'));
      res.emit('end');
    });

    const req = new EventEmitter() as any;
    req.setTimeout = vi.fn();
    req.end = vi.fn();
    req.destroy = vi.fn();
    return req;
  });
};

it('axiosGet should use agents with family set to 4', async () => {
  const httpSpy = vi.spyOn(http, 'Agent');
  const requestSpy = mockHttpRequestOk();

  await axiosGet('http://localhost');

  expect(httpSpy).toHaveBeenCalledWith({ family: 4 });

  requestSpy.mockRestore();

  httpSpy.mockRestore();
});

it('axiosGet should allow to use agents with family set to 6', async () => {
  const httpSpy = vi.spyOn(http, 'Agent');
  const requestSpy = mockHttpRequestOk();

  await axiosGet('http://localhost', { family: 6 });

  expect(httpSpy).toHaveBeenCalledWith({ family: 6 });

  requestSpy.mockRestore();

  httpSpy.mockRestore();
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
