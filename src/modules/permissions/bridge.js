import * as Engine from "./engine.js";

export function loadPermissionsModule() {
  const state = Engine.load();

  window.Portal.modules.permissions = {
    id: "permissions",
    name: "Permissions",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
