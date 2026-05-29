// src/modules/memory/index.js

import {
  getMemoryState,
  addMemoryEntry,
  clearMemory
} from "../../engines/memory/engine.js";

export function loadMemoryModule(runtime) {
  const api = {
    getState: getMemoryState,
    add: addMemoryEntry,
    clear: clearMemory
  };

  runtime.modules.memory = api;

  runtime.registry.memory = {
    key: "memory",
    label: "Memory"
  };

  return { api };
}
