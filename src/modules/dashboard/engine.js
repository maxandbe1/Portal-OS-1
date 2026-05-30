export function getDashboardState() {
  const mod = window.Portal?.modules?.dashboard;
  return mod
    ? mod.getState()
    : {
        widgets: []
      };
}
