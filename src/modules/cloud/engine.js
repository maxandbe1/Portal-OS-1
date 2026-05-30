// src/modules/cloud/engine.js

export function cloudConnect(provider) {
  window.Portal?.modules?.cloud?.connect(provider);
}

export function cloudDisconnect() {
  window.Portal?.modules?.cloud?.disconnect();
}

export function cloudPing() {
  return window.Portal?.modules?.cloud?.ping() ?? null;
}

export function getCloudState() {
  const mod = window.Portal?.modules?.cloud;
  return (
    mod?.getState() || {
      connected: false,
      provider: null,
      latencyMs: null,
      lastSync: null
    }
  );
}
