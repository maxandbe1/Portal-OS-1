import * as Engine from "./engine.js";

export function loadSoundModule() {
  const state = Engine.load();

  window.Portal.modules.sound = {
    id: "sound",
    name: "Sound",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
