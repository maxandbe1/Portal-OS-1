import * as Engine from "./engine.js";

export function loadConsoleModule() {
  const state = Engine.load();

  window.Portal.modules.console = {
    id: "console",
    name: "Console",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
