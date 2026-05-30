// src/modules/eventbus/index.js

import {
  subscribe,
  unsubscribe,
  publish,
  getListeners
} from "../../engines/eventbus/engine.js";

export function loadEventBusModule(runtime) {
  const api = {
    subscribe,
    unsubscribe,
    publish,
    listeners: getListeners
  };

  runtime.modules.eventbus = api;

  runtime.registry.eventbus = {
    key: "eventbus",
    label: "Event Bus"
  };

  return { api };
}
