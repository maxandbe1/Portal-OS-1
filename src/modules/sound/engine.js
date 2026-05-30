export function getSoundState() {
  const mod = window.Portal?.modules?.sound;
  return mod
    ? mod.getState()
    : {
        theme: "none",
        volume: 0
      };
}
