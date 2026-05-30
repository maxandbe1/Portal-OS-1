export function getIdentityState() {
  const mod = window.Portal?.modules?.identity;
  return mod
    ? mod.getState()
    : {
        name: "Unknown",
        status: "offline",
        ts: 0
      };
}
