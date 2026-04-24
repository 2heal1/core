const PLACEHOLDER_MESSAGE =
  '[Module Federation Devtools] Snapshot injection logic has moved to @vmok/proxy-sdk. This file is now a placeholder entry.';

export const attachExternalSnapshotBundle = (
  register?: () => unknown,
): string => {
  if (typeof register === 'function') {
    register();
  }

  return PLACEHOLDER_MESSAGE;
};

console.info(PLACEHOLDER_MESSAGE);
