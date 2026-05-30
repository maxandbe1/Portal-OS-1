export function getBeeSimState() {
  const mod = window.Portal?.modules?.beesim;
  return mod
    ? mod.getState()
    : {
        intensity: 0,
        mode: "idle"
      };
}
