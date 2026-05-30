import * as Engine from "./engine.js";

export function loadDashboardModule() {
  const state = Engine.load();

  window.Portal.modules.dashboard = {
    id: "dashboard",
    name: "Dashboard",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
