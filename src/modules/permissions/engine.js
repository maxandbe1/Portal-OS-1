// File: src/modules/permissions/engine.js
// Phase‑17 Permissions Engine — minimal, stable, Portal‑OS compatible

export const id = "permissions";
export const name = "Permissions";

let state = {
  granted: [],
  denied: [],
  requested: []
};

export function load() {
  return state;
}

export function update(next) {
  state = { ...state, ...next };
  return state;
}

export function reset() {
  state = {
    granted: [],
    denied: [],
    requested: []
  };
  return state;
}
