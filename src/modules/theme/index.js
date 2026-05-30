// src/modules/theme/index.js

import {
  getThemeState,
  setMode,
  setAccent,
  setDensity,
  setFont,
  applyTheme
} from "../../engines/theme/engine.js";

export function loadThemeModule(runtime) {
  const api = {
    getState: getThemeState,
    setMode,
    setAccent,
    setDensity,
    setFont,
    apply: applyTheme
  };

  runtime.modules.theme = api;

  runtime.registry.theme = {
    key: "theme",
    label: "Theme"
  };

  // Apply theme on load
  applyTheme();

  return { api };
}
