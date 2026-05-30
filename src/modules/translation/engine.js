export function getTranslationState() {
  const mod = window.Portal?.modules?.translation;
  return mod
    ? mod.getState()
    : {
        pattern: null,
        memory: null,
        beesim: null
      };
}
