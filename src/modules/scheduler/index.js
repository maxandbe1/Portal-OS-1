// src/modules/scheduler/index.js

import {
  schedule,
  cancel,
  clearAll,
  listTasks
} from "../../engines/scheduler/engine.js";

export function loadSchedulerModule(runtime) {
  const api = {
    schedule,
    cancel,
    clearAll,
    list: listTasks
  };

  runtime.modules.scheduler = api;

  runtime.registry.scheduler = {
    key: "scheduler",
    label: "Scheduler"
  };

  return { api };
}
