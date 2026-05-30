export function getPatternState() {
  const mod = window.Portal?.modules?.pattern;
  if (!mod || typeof mod.getState !== "function") {
    return {
      signals: [],
      activation: {
        resonance: 0,
        mode: "idle",
        lastSource: null,
        lastIntensity: 0
      }
    };
  }
  return mod.getState();
}
