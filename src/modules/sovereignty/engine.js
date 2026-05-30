export function getSovereigntyState() {
  const mod = window.Portal?.modules?.sovereignty;
  return mod
    ? mod.getState()
    : {
        autonomy: 0,
        guardrails: []
      };
}
