import * as Engine from "./engine.js";

export function loadNetworkModule() {
  const state = Engine.load();

  window.Portal.modules.network = {
    id: "network",
    name: "Network",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
