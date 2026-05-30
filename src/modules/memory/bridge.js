import * as Engine from "./engine.js";

export function loadMemoryModule() {
  const state = Engine.load();

  window.Portal.modules.memory = {
    id: "memory",
    name: "Memory",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
