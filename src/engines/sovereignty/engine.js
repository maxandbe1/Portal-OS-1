// src/engines/sovereignty/engine.js

let sovereigntyState = {
  pressure: 0.2,
  coherence: 0.8,
  load: 0.1,
  ticks: 0
};

export function getSovereigntyState() {
  return sovereigntyState;
}

export function tick() {
  sovereigntyState = {
    ...sovereigntyState,
    ticks: sovereigntyState.ticks + 1,
    pressure: Math.min(1, sovereigntyState.pressure + 0.01),
    load: Math.min(1, sovereigntyState.load + 0.02),
    coherence: Math.max(0, sovereigntyState.coherence - 0.005)
  };

  return sovereigntyState;
}

export function adjustCoherence(delta) {
  sovereigntyState = {
    ...sovereigntyState,
    coherence: Math.min(1, Math.max(0, sovereigntyState.coherence + delta))
  };

  return sovereigntyState;
}

export function relievePressure(amount) {
  sovereigntyState = {
    ...sovereigntyState,
    pressure: Math.max(0, sovereigntyState.pressure - amount)
  };

  return sovereigntyState;
}
