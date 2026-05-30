import * as Engine from "./engine.js";

export function loadCloudModule() {
  const state = Engine.load();

  window.Portal.modules.cloud = {
    id: "cloud",
    name: "Cloud",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
