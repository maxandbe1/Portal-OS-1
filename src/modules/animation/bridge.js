import * as Engine from "./engine.js";

export function loadAnimationModule() {
  const state = Engine.load();

  window.Portal.modules.animation = {
    id: "animation",
    name: "Animation",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
