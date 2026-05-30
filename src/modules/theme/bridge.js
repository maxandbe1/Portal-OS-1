import * as Engine from "./engine.js";

export function loadThemeModule() {
  const state = Engine.load();

  window.Portal.modules.theme = {
    id: "theme",
    name: "Theme",
    state,
    update: Engine.updateVar,
    reset: Engine.reset
  };

  return state;
}
