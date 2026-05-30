import * as Engine from "./engine.js";

export function loadInspectorModule() {
  const state = Engine.load();

  window.Portal.modules.inspector = {
    id: "inspector",
    name: "Inspector",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
