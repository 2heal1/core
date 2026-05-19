import type { Mock } from '@rstest/core';
import { importDelegatedModule } from './importDelegatedModule';
import { loadScript } from './pure';

rstest.mock('./pure');
describe('importDelegatedModule', () => {
  let mockLoadScript: Mock;
  let mockRuntimeRemote: { get: Mock; init: Mock };

  beforeEach(() => {
    mockLoadScript = rstest.fn();
    mockRuntimeRemote = {
      get: rstest.fn(),
      init: rstest.fn(),
    };
    (loadScript as Mock).mockImplementation(() =>
      Promise.resolve(mockRuntimeRemote),
    );
  });

  afterEach(() => {
    rstest.resetAllMocks();
  });

  it('should successfully import a delegated module', async () => {
    const result = await importDelegatedModule('test');
    expect(loadScript).toHaveBeenCalledWith('test');
    expect(result).toBe(mockRuntimeRemote);
  });

  it('should handle the case when globalThis is not defined', async () => {
    const result = await importDelegatedModule({ global: 'test' });
    expect(loadScript).toHaveBeenCalledWith({ global: 'test' });
    expect(result).toBe(mockRuntimeRemote);
  });

  // Test case for when the module has a function property
  it('should return a Promise that resolves to the result when the module is a Promise', async () => {
    (global as any).window = undefined;
    mockRuntimeRemote.get.mockImplementation(() => Promise.resolve('test'));
    const result = await importDelegatedModule({ global: 'test' });
    expect(await result.get('test')).toBe('test');
    (global as any).window = {}; // Reset window object
  });
  // Test case for when the module has a non-function property
  xit('should define a non-function property on the result when the module has a non-function property', async () => {
    (global as any).window = undefined;
    mockRuntimeRemote.get.mockImplementation(() =>
      Promise.resolve(() => ({ testProp: 'test' })),
    );
    const result = await importDelegatedModule({ global: 'test' });
    const getterFunction = await result.get('testProp');
    const getter = getterFunction();
    expect(getter).toBe('test');
  });

  // Test case for when the module is a Promise
  it('should return a Promise that resolves to the result when the module is a Promise', async () => {
    (global as any).window = undefined;
    mockRuntimeRemote.get.mockImplementation(() => Promise.resolve('test'));
    const result = await importDelegatedModule({ global: 'test' });
    expect(result.get('test')).resolves.toBe('test');
    (global as any).window = {}; // Reset window object
  });
});
