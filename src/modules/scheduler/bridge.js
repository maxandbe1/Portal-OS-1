import * as Engine from "./engine.js";

export function loadSchedulerModule() {
  const state = Engine.load();

  window.Portal.modules.scheduler = {
    id: "scheduler",
    name: "Scheduler",
    state,
    update: Engine.update,
    reset: Engine.reset
  };

  return state;
}
