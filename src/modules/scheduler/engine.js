// File: src/modules/scheduler/engine.js
// Phase‑17 Scheduler Engine — minimal, stable, Portal‑OS compatible

export const id = "scheduler";
export const name = "Scheduler";

let state = {
  tasks: [],
  running: false
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
    tasks: [],
    running: false
  };
  return state;
}
