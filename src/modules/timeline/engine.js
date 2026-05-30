export function getTimelineState() {
  const mod = window.Portal?.modules?.timeline;
  return mod
    ? mod.getState()
    : {
        events: []
      };
}
