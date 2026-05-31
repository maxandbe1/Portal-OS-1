// src/modules/events/bridge.js
import * as Engine from "./engine.js";

export function loadEventsModule() {
  const state = Engine.load();

  window.Portal.modules.events = {
    id: "events",
    name: "Events",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
