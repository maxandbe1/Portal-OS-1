export function getEcosystemState() {
  const mod = window.Portal?.modules?.ecosystem;
  return mod
    ? mod.getState()
    : {
        services: [],
        links: []
      };
}
