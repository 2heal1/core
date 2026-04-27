type RegisterProxyRuntimePlugins = (options?: {
  includeOverridePlugin?: boolean;
  includeSnapshotPlugin?: boolean;
}) => unknown;

const PLACEHOLDER_MESSAGE =
  '[Module Federation Devtools] Snapshot injection logic has moved to @vmok/proxy-sdk. Load the external proxy-sdk bundle before calling this entry.';

const resolveRegisterProxyRuntimePlugins = (
  register?: RegisterProxyRuntimePlugins,
): RegisterProxyRuntimePlugins | undefined => {
  if (typeof register === 'function') {
    return register;
  }

  return (
    globalThis as typeof globalThis & {
      VmokProxySdk?: {
        registerProxyRuntimePlugins?: RegisterProxyRuntimePlugins;
      };
    }
  ).VmokProxySdk?.registerProxyRuntimePlugins;
};

export const attachExternalSnapshotBundle = (
  register?: RegisterProxyRuntimePlugins,
) => {
  const registerProxyRuntimePlugins =
    resolveRegisterProxyRuntimePlugins(register);

  if (typeof registerProxyRuntimePlugins === 'function') {
    return registerProxyRuntimePlugins({
      includeOverridePlugin: false,
      includeSnapshotPlugin: true,
    });
  }

  console.info(PLACEHOLDER_MESSAGE);
  return PLACEHOLDER_MESSAGE;
};
