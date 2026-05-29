// src/engines/beesim/engine.js

let beeState = {
  ticks: 0,
  bees: [
    { id: 1, label: "Worker A", energy: 0.8, focus: 0.6 },
    { id: 2, label: "Worker B", energy: 0.5, focus: 0.7 },
    { id: 3, label: "Worker C", energy: 0.9, focus: 0.4 }
  ]
};

export function getBeeState() {
  return beeState;
}

export function tick() {
  beeState = {
    ...beeState,
    ticks: beeState.ticks + 1,
    bees: beeState.bees.map((b) => ({
      ...b,
      energy: Math.max(0, b.energy - 0.02),
      focus: Math.max(0, b.focus - 0.01)
    }))
  };

  return beeState;
}

export function nudge(id, dEnergy, dFocus) {
  beeState = {
    ...beeState,
    bees: beeState.bees.map((b) =>
      b.id === id
        ? {
            ...b,
            energy: Math.min(1, Math.max(0, b.energy + dEnergy)),
            focus: Math.min(1, Math.max(0, b.focus + dFocus))
          }
        : b
    )
  };

  return beeState;
}
