// src/modules/vfs/index.js

import { list, read, write, remove, resolve, getFS } from "../../engines/vfs/engine.js";

export function loadVFSModule(runtime) {
  const api = {
    list,
    read,
    write,
    remove,
    resolve,
    root: getFS
  };

  runtime.modules.vfs = api;

  runtime.registry.vfs = {
    key: "vfs",
    label: "VFS"
  };

  return { api };
}
