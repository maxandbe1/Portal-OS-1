// File: src/engines/mesh/MeshEngineOrchestrator.js
// Author: Max & Copilot
// Phase: 18 — Mesh Engine Orchestration Layer

import {
  MeshEngineStateMachine,
  MESH_STATES
} from "./MeshEngineStateMachine.js";

import {
  getId,
  getPeers,
  onMessage as rawOnMessage
} from "./engine.js";

// --------------------------------------
// Internal State
// --------------------------------------

let autoReconnect = true;
let reconnectInterval = 3000;
let reconnectTimer = null;

// --------------------------------------
// Lifecycle
// --------------------------------------

function start() {
  if (MeshEngineStateMachine.getState() !== MESH_STATES.IDLE) return;

  MeshEngineStateMachine.join([]);

  if (autoReconnect) {
    scheduleReconnect();
  }
}

function stop() {
  autoReconnect = false;
  clearTimeout(reconnectTimer);
  MeshEngineStateMachine.leave();
}

function scheduleReconnect() {
  clearTimeout(reconnectTimer);

  reconnectTimer = setTimeout(() => {
    if (MeshEngineStateMachine.getState() === MESH_STATES.ERROR) {
      console.warn("[MeshOrchestrator] Auto-reconnect triggered.");
      MeshEngineStateMachine.join([]);
    }
    scheduleReconnect();
  }, reconnectInterval);
}

// --------------------------------------
// Message Routing
// --------------------------------------

const messageHandlers = new Set();

export function onMeshEvent(handler) {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

rawOnMessage((from, msg) => {
  const snapshot = MeshEngineStateMachine.getSnapshot();

  messageHandlers.forEach((fn) => {
    try {
      fn(snapshot, from, msg);
    } catch (err) {
      console.error("[MeshOrchestrator] handler error:", err);
    }
  });
});

// --------------------------------------
// Public API
// --------------------------------------

export const MeshEngineOrchestrator = {
  start,
  stop,

  // state
  state: () => MeshEngineStateMachine.getState(),
  snapshot: () => MeshEngineStateMachine.getSnapshot(),
  id: () => getId(),
  peers: () => getPeers(),

  // messaging
  broadcast: (msg) => MeshEngineStateMachine.broadcast(msg),
  send: (peerId, msg) => MeshEngineStateMachine.send(peerId, msg),

  // events
  onStateChange: MeshEngineStateMachine.onStateChange,
  onEvent: onMeshEvent,

  // config
  enableAutoReconnect() {
    autoReconnect = true;
    scheduleReconnect();
  },

  disableAutoReconnect() {
    autoReconnect = false;
    clearTimeout(reconnectTimer);
  },

  setReconnectInterval(ms) {
    reconnectInterval = ms;
  }
};
