import * as Engine from "./engine.js";

export function loadVFSModule() {
  const state = Engine.load();

  window.Portal.modules.vfs = {
    id: "vfs",
    name: "Virtual File System",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
