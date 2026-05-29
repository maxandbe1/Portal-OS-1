// src/modules/beesim/index.js

import {
  getBeeState,
  tick,
  nudge
} from "../../engines/beesim/engine.js";

export function loadBeeSimModule(runtime) {
  const api = {
    getState: getBeeState,
    tick,
    nudge
  };

  runtime.modules.beesim = api;

  runtime.registry.beesim = {
    key: "beesim",
    label: "Bee‑SIM"
  };

  return { api };
}
