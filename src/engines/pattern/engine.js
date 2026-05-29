// src/engines/pattern/engine.js

let patternState = {
  cycles: [
    { id: 1, label: "Morning focus", strength: 0.7 },
    { id: 2, label: "Afternoon drift", strength: 0.4 },
    { id: 3, label: "Night clarity", strength: 0.8 }
  ]
};

export function getPatternState() {
  return patternState;
}

export function addPattern(label) {
  const next = {
    id: Date.now(),
    label,
    strength: 0.5
  };

  patternState = {
    ...patternState,
    cycles: [...patternState.cycles, next]
  };

  return patternState;
}

export function adjustPatternStrength(id, delta) {
  patternState = {
    ...patternState,
    cycles: patternState.cycles.map((c) =>
      c.id === id
        ? {
            ...c,
            strength: Math.max(0, Math.min(1, c.strength + delta))
          }
        : c
    )
  };

  return patternState;
}
