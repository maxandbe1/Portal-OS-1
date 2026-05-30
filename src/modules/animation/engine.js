export function getAnimationState() {
  const mod = window.Portal?.modules?.animation;
  return mod
    ? mod.getState()
    : {
        presets: [],
        active: null
      };
}
