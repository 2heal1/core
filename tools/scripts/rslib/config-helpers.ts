import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function readPackageJson(packageDir) {
  return JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
}

export function packageDirFromMetaUrl(metaUrl) {
  return dirname(fileURLToPath(metaUrl));
}

export function readPackageVersion(packageDir) {
  return readPackageJson(packageDir).version;
}

export function findRepoRoot(startDir) {
  let currentDir = startDir;

  for (let i = 0; i < 20; i += 1) {
    if (existsSync(join(currentDir, 'LICENSE'))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return startDir;
}

export function getLicenseCopyPatterns(packageDir) {
  const repoRoot = findRepoRoot(packageDir);
  const licensePath = join(repoRoot, 'LICENSE');

  if (!existsSync(licensePath)) {
    return undefined;
  }

  return [{ from: resolve(packageDir, licensePath) }];
}
