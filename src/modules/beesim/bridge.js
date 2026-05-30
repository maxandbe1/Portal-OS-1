import * as Engine from "./engine.js";

export function loadBeeSimModule() {
  const state = Engine.load();

  window.Portal.modules.beesim = {
    id: "beesim",
    name: "Bee Simulation",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
