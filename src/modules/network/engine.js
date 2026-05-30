// File: src/modules/network/engine.js
// Phase‑17 Network Engine — minimal, stable, Portal‑OS compatible

export const id = "network";
export const name = "Network";

let state = {
  online: true,
  latency: 0,
  endpoints: []
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
    online: true,
    latency: 0,
    endpoints: []
  };
  return state;
}
