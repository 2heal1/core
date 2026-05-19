// We need to mock the modules before importing anything else
rstest.mock('@module-federation/runtime', () => ({
  init: rstest.fn(),
}));

rstest.mock('../src/remotes', () => ({
  remotes: rstest.fn(),
}));

rstest.mock('../src/consumes', () => ({
  consumes: rstest.fn(),
}));

rstest.mock('../src/initializeSharing', () => ({
  initializeSharing: rstest.fn(),
}));

rstest.mock('../src/installInitialConsumes', () => ({
  installInitialConsumes: rstest.fn(),
}));

rstest.mock('../src/attachShareScopeMap', () => ({
  attachShareScopeMap: rstest.fn(),
}));

rstest.mock('../src/initContainerEntry', () => ({
  initContainerEntry: rstest.fn(),
}));

// Now we can import our module
import federation from '../src/index';

describe('Federation object', () => {
  test('should export a federation object', () => {
    expect(federation).toBeDefined();
  });

  test('should have bundlerRuntime property', () => {
    expect(federation.bundlerRuntime).toBeDefined();
  });

  test('should have bundlerRuntimeOptions property', () => {
    expect(federation.bundlerRuntimeOptions).toBeDefined();
  });
});
