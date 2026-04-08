import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { moduleFederationPlugin, getProcessEnv } from '@module-federation/sdk';
import ansiColors from 'ansi-colors';
import { retrieveRemoteConfig } from '../configurations/remotePlugin';
import { HostOptions } from '../interfaces/HostOptions';
import { RemoteOptions } from '../interfaces/RemoteOptions';
import { DTSManager } from './DTSManager';
import { retrieveTypesZipPath } from './archiveHandler';
import {
  retrieveMfAPITypesPath,
  retrieveMfTypesPath,
} from './typeScriptCompiler';
import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

export function getDTSManagerConstructor(
  implementation?: string,
): typeof DTSManager {
  if (implementation) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NewConstructor = require(implementation);
    return NewConstructor.default ? NewConstructor.default : NewConstructor;
  }
  return DTSManager;
}
export const validateOptions = (options: HostOptions) => {
  if (!options.moduleFederationConfig) {
    throw new Error('moduleFederationConfig is required');
  }
};

export function retrieveTypesAssetsInfo(options: RemoteOptions) {
  let apiTypesPath = '';
  let zipTypesPath = '';

  try {
    const { tsConfig, remoteOptions, mapComponentsToExpose } =
      retrieveRemoteConfig(options);
    if (!Object.keys(mapComponentsToExpose).length || !tsConfig.files.length) {
      return {
        apiTypesPath,
        zipTypesPath,
        zipName: '',
        apiFileName: '',
      };
    }

    const mfTypesPath = retrieveMfTypesPath(tsConfig, remoteOptions);
    zipTypesPath = retrieveTypesZipPath(mfTypesPath, remoteOptions);
    if (remoteOptions.generateAPITypes) {
      apiTypesPath = retrieveMfAPITypesPath(tsConfig, remoteOptions);
    }

    return {
      apiTypesPath,
      zipTypesPath,
      zipName: path.basename(zipTypesPath),
      apiFileName: path.basename(apiTypesPath),
    };
  } catch (err) {
    console.error(ansiColors.red(`Unable to compile federated types, ${err}`));
    return {
      apiTypesPath: '',
      zipTypesPath: '',
      zipName: '',
      apiFileName: '',
    };
  }
}

export function isDebugMode() {
  return (
    Boolean(process.env['FEDERATION_DEBUG']) ||
    process.env['NODE_ENV'] === 'test'
  );
}

export const isTSProject = (
  dtsOptions: moduleFederationPlugin.ModuleFederationPluginOptions['dts'],
  context = process.cwd(),
) => {
  if (dtsOptions === false) {
    return false;
  }

  try {
    let filepath = '';
    if (typeof dtsOptions === 'object' && dtsOptions.tsConfigPath) {
      filepath = dtsOptions.tsConfigPath;
    } else {
      filepath = path.resolve(context, './tsconfig.json');
    }

    if (!path.isAbsolute(filepath)) {
      filepath = path.resolve(context, filepath);
    }
    return fs.existsSync(filepath);
  } catch (err) {
    return false;
  }
};

export function cloneDeepOptions<T extends DTSManagerOptions>(options: T): T {
  const excludeKeys = new Set(['manifest', 'async']);
  // Maps original plain objects/arrays to their sanitized counterparts so
  // that back-edges in circular structures return the already-allocated
  // output node rather than recurring infinitely.
  const cache = new WeakMap<object, unknown[] | Record<string, unknown>>();

  // Sanitize removes non-serializable values before structuredClone.
  // Only recurses into plain objects so that RegExp/Date/etc. are left
  // for structuredClone to handle correctly.
  function sanitize(val: unknown, key?: string): unknown {
    if (
      (key !== undefined && excludeKeys.has(key)) ||
      typeof val === 'function'
    )
      return false;

    if (key === 'extractThirdParty' && Array.isArray(val))
      return val.map(String);

    if (Array.isArray(val)) {
      if (cache.has(val)) return cache.get(val);
      const out: unknown[] = [];
      cache.set(val, out);
      val.forEach((v, i) => out.push(sanitize(v, String(i))));
      return out;
    }

    if (
      val !== null &&
      typeof val === 'object' &&
      Object.getPrototypeOf(val) === Object.prototype
    ) {
      const obj = val as Record<string, unknown>;
      if (cache.has(obj)) return cache.get(obj);
      const out: Record<string, unknown> = {};
      cache.set(obj, out);
      for (const [k, v] of Object.entries(obj)) out[k] = sanitize(v, k);
      return out;
    }

    return val;
  }

  return structuredClone(sanitize(options)) as T;
}

const getEnvHeaders = (): Record<string, string> => {
  const headersStr = getProcessEnv()['MF_ENV_HEADERS'] || '{}';

  return {
    ...JSON.parse(headersStr),
  };
};

export type AxiosGetConfig = {
  headers?: Record<string, string>;
  timeout?: number;
  family?: 4 | 6;
  responseType?: 'arraybuffer';
};

export async function axiosGet(url: string, config?: AxiosGetConfig) {
  const httpAgent = new http.Agent({ family: config?.family ?? 4 });
  const httpsAgent = new https.Agent({ family: config?.family ?? 4 });

  const urlObj = new URL(url);
  const transport = urlObj.protocol === 'https:' ? https : http;
  const agent = urlObj.protocol === 'https:' ? httpsAgent : httpAgent;
  const timeout = config?.timeout ?? 60_000;
  const headers = {
    ...getEnvHeaders(),
    ...(config?.headers ?? {}),
  };

  return await new Promise<{
    data: unknown;
    headers: http.IncomingHttpHeaders;
    status: number;
  }>((resolve, reject) => {
    const req = transport.request(
      urlObj,
      {
        method: 'GET',
        headers,
        agent,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const status = res.statusCode ?? 0;
          const buffer = Buffer.concat(chunks);

          if (status < 200 || status >= 300) {
            reject(
              new Error(
                `Request failed: ${status} ${res.statusMessage ?? ''}`.trim(),
              ),
            );
            return;
          }

          if (config?.responseType === 'arraybuffer') {
            resolve({ data: buffer, headers: res.headers, status });
            return;
          }

          const text = buffer.toString('utf8');
          const contentType = String(res.headers['content-type'] ?? '');
          if (contentType.includes('application/json')) {
            try {
              resolve({ data: JSON.parse(text), headers: res.headers, status });
              return;
            } catch (e) {
              reject(e);
              return;
            }
          }

          resolve({ data: text, headers: res.headers, status });
        });
      },
    );

    req.on('error', reject);
    req.setTimeout(timeout, () =>
      req.destroy(new Error(`Request timed out after ${timeout}ms`)),
    );
    req.end();
  });
}
