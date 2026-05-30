import * as Engine from "./engine.js";

export function loadSovereigntyModule() {
  const state = Engine.load();

  window.Portal.modules.sovereignty = {
    id: "sovereignty",
    name: "Sovereignty",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
