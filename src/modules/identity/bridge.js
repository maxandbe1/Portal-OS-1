// File: src/modules/identity/bridge.js

import * as Engine from "./engine.js";

export function loadIdentityModule() {
  const state = Engine.load();

  window.Portal.modules.identity = {
    id: "identity",
    name: "Identity",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
