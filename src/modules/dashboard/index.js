// src/modules/dashboard/index.js

export function loadDashboardModule(runtime) {
  const api = {
    getState() {
      return {
        memory: runtime.modules.memory.getState(),
        pattern: runtime.modules.pattern.getState(),
        beesim: runtime.modules.beesim.getState(),
        sovereignty: runtime.modules.sovereignty.getState()
      };
    }
  };

  runtime.modules.dashboard = api;

  runtime.registry.dashboard = {
    key: "dashboard",
    label: "Dashboard"
  };

  return { api };
}
