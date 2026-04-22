# Module Federation Chrome Devtools

## Ability

- Proxy online Module Federation remote module to local
- Let proxied remote module get hmr

## FAQ

### In a multi-hop chain (e.g. A → B → C), why can't I see some remotes when I open the panel?

Some remotes are registered/loaded dynamically (e.g. route-based lazy loading), so they may not exist yet when Devtools collects the initial module info. Trigger the remote to load in the page first, then click **Refresh** in the Devtools panel to re-fetch module info.

Docs: https://module-federation.io/guide/debug/chrome-devtool
