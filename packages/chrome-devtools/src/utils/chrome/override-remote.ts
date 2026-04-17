import {
  MODULE_DEVTOOL_IDENTIFIER,
  type GlobalModuleInfo,
} from '@module-federation/sdk';
import runtimeHelpers from '@module-federation/runtime/helpers';

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

import { definePropertyGlobalVal } from '../sdk';
import { __FEDERATION_DEVTOOLS__ } from '@/template';

type BeforeRegisterRemoteArgs = Parameters<
  NonNullable<ModuleFederationRuntimePlugin['beforeRegisterRemote']>
>[0];

const safeJSONParse = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const getNameWithoutType = (name: string) =>
  name.includes(':') ? (name.split(':').pop() as string) : name;

const matchKey = (keys: Array<string>, target: string) =>
  keys.find((key) => key === target || key.endsWith(`:${target}`));

const getOverrideFromSnapshot = (
  args: BeforeRegisterRemoteArgs,
): string | null => {
  const snapshotStr =
    runtimeHelpers.global.nativeGlobal.localStorage.getItem(
      MODULE_DEVTOOL_IDENTIFIER,
    ) ?? null;
  const snapshot = safeJSONParse<GlobalModuleInfo>(snapshotStr);
  if (!snapshot) {
    return null;
  }

  const origin = args.origin as any;
  const originName: string | undefined = origin?.options?.name ?? origin?.name;
  const originVersion: string | undefined = origin?.options?.version;
  if (!originName) {
    return null;
  }

  const hostCandidates = originVersion
    ? [
        `${originName}:${originVersion}`,
        `${getNameWithoutType(originName)}:${originVersion}`,
      ]
    : [originName, getNameWithoutType(originName)];

  const snapshotKeys = Object.keys(snapshot);
  const hostKey = hostCandidates
    .map((candidate) => matchKey(snapshotKeys, candidate))
    .find(Boolean);
  if (!hostKey) {
    return null;
  }

  const hostSnapshot: any = (snapshot as any)[hostKey];
  const remotesInfo: Record<string, { matchedVersion?: string }> | undefined =
    hostSnapshot?.remotesInfo;
  if (!remotesInfo) {
    return null;
  }

  const remoteName = args.remote?.name;
  if (!remoteName) {
    return null;
  }
  const remoteCandidates = [remoteName, getNameWithoutType(remoteName)];
  const remoteKey = remoteCandidates
    .map((candidate) => matchKey(Object.keys(remotesInfo), candidate))
    .find(Boolean);

  const matchedVersion = remoteKey
    ? remotesInfo[remoteKey]?.matchedVersion
    : null;
  return typeof matchedVersion === 'string' && matchedVersion
    ? matchedVersion
    : null;
};

const getOverrideFromDevtoolsState = (remoteName: string): string | null => {
  const overrideStateStr =
    runtimeHelpers.global.nativeGlobal.localStorage.getItem(
      __FEDERATION_DEVTOOLS__,
    ) ?? null;
  const overrideState = safeJSONParse<any>(overrideStateStr);
  if (!overrideState) {
    return null;
  }

  const overrides = overrideState?.overrides ?? overrideState;
  const candidates = [remoteName, getNameWithoutType(remoteName)];
  for (const candidate of candidates) {
    const value = overrides?.[candidate];
    if (typeof value === 'string' && value) {
      return value;
    }
  }
  return null;
};

const chromeOverrideRemotesPlugin: () => ModuleFederationRuntimePlugin =
  function () {
    return {
      name: 'mf-chrome-devtools-override-remotes-plugin',
      beforeRegisterRemote(args: BeforeRegisterRemoteArgs) {
        try {
          const { remote } = args;
          const overrideEntryOrVersion =
            getOverrideFromSnapshot(args) ??
            getOverrideFromDevtoolsState(remote.name);

          if (overrideEntryOrVersion) {
            if ('entry' in remote) {
              delete (remote as { version?: string }).version;
              (remote as { entry?: string }).entry = overrideEntryOrVersion;
            } else {
              delete (remote as { entry?: string }).entry;
              (remote as { version?: string }).version = overrideEntryOrVersion;
            }
          }
        } catch (e) {
          console.error(e);
        }
        return args;
      },
    };
  };

if (!window?.__FEDERATION__) {
  definePropertyGlobalVal(window, '__FEDERATION__', {});
  definePropertyGlobalVal(window, '__VMOK__', window.__FEDERATION__);
}

if (!window?.__FEDERATION__.__GLOBAL_PLUGIN__) {
  window.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
}

window.__FEDERATION__.__GLOBAL_PLUGIN__?.push(chromeOverrideRemotesPlugin());
