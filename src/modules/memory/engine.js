export function getMemoryState() {
  const mod = window.Portal?.modules?.memory;
  return mod
    ? mod.getState()
    : {
        items: [],
        weightIndex: 0
      };
}
