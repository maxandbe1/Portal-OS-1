export function getPhysicsState() {
  const mod = window.Portal?.modules?.physics;
  return mod
    ? mod.getState()
    : {
        fields: [],
        tension: 0
      };
}
