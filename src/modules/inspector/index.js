// src/modules/inspector/index.js

export function loadInspectorModule(runtime) {
  const api = {
    getRuntime() {
      return window.Portal;
    },
    getModules() {
      return window.Portal.modules;
    },
    getRegistry() {
      return window.Portal.registry;
    },
    getEngines() {
      return {
        animation: window.Portal.modules.animation?.getState?.(),
        storageKeys: window.Portal.modules.storage?.keys?.(),
      };
    }
  };

  runtime.modules.inspector = api;

  runtime.registry.inspector = {
    key: "inspector",
    label: "Inspector"
  };

  return { api };
}
