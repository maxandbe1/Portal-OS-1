// src/modules/storage/index.js

import { save, load, clear, keys } from "../../engines/storage/engine.js";

export function loadStorageModule(runtime) {
  const api = {
    save,
    load,
    clear,
    keys
  };

  runtime.modules.storage = api;

  runtime.registry.storage = {
    key: "storage",
    label: "Storage"
  };

  return { api };
}
