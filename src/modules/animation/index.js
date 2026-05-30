// src/modules/animation/index.js

import {
  getAnimationState,
  registerChannel,
  animateTo
} from "../../engines/animation/engine.js";

export function loadAnimationModule(runtime) {
  const api = {
    getState: getAnimationState,
    register: registerChannel,
    animate: animateTo
  };

  runtime.modules.animation = api;

  runtime.registry.animation = {
    key: "animation",
    label: "Animation"
  };

  return { api };
}
