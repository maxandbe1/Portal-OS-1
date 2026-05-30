// public/modules/cloud/index.js

if (!window.Portal) window.Portal = {};
if (!window.Portal.modules) window.Portal.modules = {};

const state = {
  connected: false,
  provider: null,
  latencyMs: null,
  lastSync: null
};

function connect(provider = "unknown") {
  state.connected = true;
  state.provider = provider;
  state.latencyMs = Math.round(40 + Math.random() * 60);
  state.lastSync = Date.now();
}

function disconnect() {
  state.connected = false;
}

function ping() {
  if (!state.connected) return null;
  state.latencyMs = Math.round(40 + Math.random() * 60);
  state.lastSync = Date.now();
  return state.latencyMs;
}

window.Portal.modules.cloud = {
  connect,
  disconnect,
  ping,
  getState() {
    return { ...state };
  }
};
