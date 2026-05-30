// src/modules/sound/index.js

import {
  playTone,
  playClick,
  playSuccess,
  playError
} from "../../engines/sound/engine.js";

export function loadSoundModule(runtime) {
  const api = {
    tone: playTone,
    click: playClick,
    success: playSuccess,
    error: playError
  };

  runtime.modules.sound = api;

  runtime.registry.sound = {
    key: "sound",
    label: "Sound"
  };

  return { api };
}
