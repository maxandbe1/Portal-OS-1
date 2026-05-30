// src/modules/cloud/index.js

import { pull, push, mountCloud } from "../../engines/cloud/engine.js";

export function loadCloudModule(runtime) {
  const api = {
    pull,
    push,
    mount: mountCloud
  };

  runtime.modules.cloud = api;

  runtime.registry.cloud = {
    key: "cloud",
    label: "Cloud Sync"
  };

  // Auto‑mount cloud directory
  mountCloud();

  return { api };
}
