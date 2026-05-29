// src/modules/pattern/index.js

import {
  getPatternState,
  addPattern,
  adjustPatternStrength
} from "../../engines/pattern/engine.js";

export function loadPatternModule(runtime) {
  const api = {
    getState: getPatternState,
    addPattern,
    adjustPatternStrength
  };

  runtime.modules.pattern = api;

  runtime.registry.pattern = {
    key: "pattern",
    label: "Pattern"
  };

  return { api };
}
