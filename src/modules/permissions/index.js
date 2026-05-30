// src/modules/permissions/index.js

import {
  setPermission,
  getRules,
  clearPermissions,
  check
} from "../../engines/permissions/engine.js";

export function loadPermissionsModule(runtime) {
  const api = {
    set: setPermission,
    getRules,
    clear: clearPermissions,
    check
  };

  runtime.modules.permissions = api;

  runtime.registry.permissions = {
    key: "permissions",
    label: "Permissions"
  };

  return { api };
}
