export function getEventsState() {
  const mod = window.Portal?.modules?.events;
  return mod
    ? mod.getState()
    : {
        recent: []
      };
}
