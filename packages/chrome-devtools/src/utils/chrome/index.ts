export * from './storage';

const globalWindow = window as Window & { targetTab?: chrome.tabs.Tab };

export const PLACEHOLDER_MESSAGE =
  'Proxy/security implementation has moved to @vmok/proxy-sdk. This chrome-devtools package now exposes placeholder helpers only.';

export type PlaceholderModuleInfo = Record<string, never>;

export const setTargetTab = (tab?: chrome.tabs.Tab | null) => {
  if (tab) {
    globalWindow.targetTab = tab as chrome.tabs.Tab;
  }
};

export const syncActiveTab = async (tabId?: number) => {
  try {
    if (typeof tabId === 'number') {
      const tab = await chrome.tabs.get(tabId);
      setTargetTab(tab);
      return tab;
    }

    const [activeTab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    setTargetTab(activeTab);
    return activeTab;
  } catch {
    return globalWindow.targetTab;
  }
};

export const refreshModuleInfo = async (..._args: any[]) => undefined;

export const getModuleInfo = async (..._args: any[]) => ({
  message: PLACEHOLDER_MESSAGE,
  moduleInfo: {},
});

export const getGlobalModuleInfo = async (
  callback: (moduleInfo: PlaceholderModuleInfo) => void,
  ..._args: any[]
) => {
  callback({});
  return () => undefined;
};

export const getTabs = (queryOptions = {}) => {
  try {
    return chrome.tabs.query(queryOptions);
  } catch {
    return Promise.resolve([] as chrome.tabs.Tab[]);
  }
};

export const getScope = async (..._args: any[]) => {
  const tabId = globalWindow.targetTab?.id;
  return typeof tabId === 'number' ? String(tabId) : 'placeholder';
};

export const injectScript = async (..._args: any[]) => undefined;

export const getUrl = (file: string) => {
  try {
    return chrome.runtime.getURL(file);
  } catch {
    return file;
  }
};

export const injectToast = (..._args: any[]) => undefined;

export const setChromeStorage = (..._args: any[]) => undefined;
