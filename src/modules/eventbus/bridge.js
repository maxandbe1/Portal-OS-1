import * as Engine from "./engine.js";

export function loadEventBusModule() {
  const state = Engine.load();

  window.Portal.modules.eventbus = {
    id: "eventbus",
    name: "Event Bus",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
