const PLACEHOLDER_MESSAGE =
  '[Module Federation Devtools] Proxy override logic has moved to @vmok/proxy-sdk. This file is now a placeholder entry.';

export const registerExternalProxyBundle = (
  register?: () => unknown,
): string => {
  if (typeof register === 'function') {
    register();
  }

  return PLACEHOLDER_MESSAGE;
};

console.info(PLACEHOLDER_MESSAGE);
