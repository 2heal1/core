import { createRequire } from 'module';
import nodePath from 'path';
export default (
  path: string,
  options: { path?: string; mode?: 'cjs' | 'esm' } = {},
) => {
  const p = options.path || undefined;
  const mode = options.mode || 'esm';
  if (mode === 'cjs') {
    const require = createRequire(import.meta.url);
    if (!p) return require.resolve(path);
    return require.resolve(path, { paths: [p] });
  } else {
    try {
      return (import.meta as any)
        .resolve((path as any).join(p, path))
        .replace(/^file:\/\//, '');
    } catch (e) {
      const require = createRequire(import.meta.url);
      if (!p) return require.resolve(path);
      return require.resolve(path, { paths: [p] });
    }
  }
};
