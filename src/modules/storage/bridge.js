import * as Engine from "./engine.js";

export function loadStorageModule() {
  const state = Engine.load();

  window.Portal.modules.storage = {
    id: "storage",
    name: "Storage",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
