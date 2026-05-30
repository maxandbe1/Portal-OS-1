export function getMeshState() {
  const mod = window.Portal?.modules?.mesh;
  return mod
    ? mod.getState()
    : {
        coherence: 0,
        dominant: null,
        lastUpdate: 0
      };
}
