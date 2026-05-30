import * as Engine from "./engine.js";

export function loadPatternModule() {
  const state = Engine.load();

  window.Portal.modules.pattern = {
    id: "pattern",
    name: "Pattern",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
