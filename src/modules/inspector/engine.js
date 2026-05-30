export function getInspectorState() {
  const mods = window.Portal?.modules || {};
  const names = Object.keys(mods);
  return {
    modules: names
  };
}
