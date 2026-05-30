// src/modules/network/index.js

import { get, post, put, del, request } from "../../engines/network/engine.js";

export function loadNetworkModule(runtime) {
  const api = {
    get,
    post,
    put,
    del,
    request
  };

  runtime.modules.network = api;

  runtime.registry.network = {
    key: "network",
    label: "Network"
  };

  return { api };
}
