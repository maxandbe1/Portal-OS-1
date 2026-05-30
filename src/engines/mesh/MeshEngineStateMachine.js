// File: src/engines/mesh/MeshEngineStateMachine.js
// Author: Max & Copilot
// Phase: 17 — Mesh Engine Core Runtime

import {
  getId,
  joinMesh,
  leaveMesh,
  getPeers,
  onMessage,
  broadcast,
  send
} from "./engine.js";

// -------------------------
// State Machine Definition
// -------------------------

export const MESH_STATES = {
  IDLE: "IDLE",
  JOINING: "JOINING",
  JOINED: "JOINED",
  LEAVING: "LEAVING",
  ERROR: "ERROR"
};

let currentState = MESH_STATES.IDLE;
let lastError = null;

// listeners get a snapshot whenever state changes
const stateListeners = new Set();

function snapshot() {
  return {
    state: currentState,
    id: getId(),
    peers: getPeers(),
    lastError
  };
}

function notifyState() {
  const snap = snapshot();
  stateListeners.forEach((fn) => {
    try {
      fn(snap);
    } catch (err) {
      console.error("[MeshEngineStateMachine] listener error:", err);
    }
  });
}

// -------------------------
// Public State API
// -------------------------

export function getMeshState() {
  return currentState;
}

export function getMeshLastError() {
  return lastError;
}

export function getMeshSnapshot() {
  return snapshot();
}

export function onMeshStateChange(handler) {
  stateListeners.add(handler);
  // push current state immediately
  try {
    handler(snapshot());
  } catch (err) {
    console.error("[MeshEngineStateMachine] initial listener error:", err);
  }
  return () => stateListeners.delete(handler);
}

// -------------------------
// Safe Operations
// -------------------------

export function meshJoin(peerList = []) {
  if (currentState === MESH_STATES.JOINED || currentState === MESH_STATES.JOINING) {
    return;
  }

  currentState = MESH_STATES.JOINING;
  notifyState();

  try {
    joinMesh(peerList);
    currentState = MESH_STATES.JOINED;
    lastError = null;
  } catch (err) {
    console.error("[MeshEngineStateMachine] join error:", err);
    currentState = MESH_STATES.ERROR;
    lastError = err;
  }

  notifyState();
}

export function meshLeave() {
  if (currentState === MESH_STATES.IDLE || currentState === MESH_STATES.LEAVING) {
    return;
  }

  currentState = MESH_STATES.LEAVING;
  notifyState();

  try {
    leaveMesh();
    currentState = MESH_STATES.IDLE;
    lastError = null;
  } catch (err) {
    console.error("[MeshEngineStateMachine] leave error:", err);
    currentState = MESH_STATES.ERROR;
    lastError = err;
  }

  notifyState();
}

export function meshBroadcast(msg) {
  if (currentState !== MESH_STATES.JOINED) {
    console.warn("[MeshEngineStateMachine] cannot broadcast, mesh not joined.");
    return;
  }

  try {
    broadcast(msg);
  } catch (err) {
    console.error("[MeshEngineStateMachine] broadcast error:", err);
    currentState = MESH_STATES.ERROR;
    lastError = err;
    notifyState();
  }
}

export function meshSend(peerId, msg) {
  if (currentState !== MESH_STATES.JOINED) {
    console.warn("[MeshEngineStateMachine] cannot send, mesh not joined.");
    return;
  }

  try {
    send(peerId, msg);
  } catch (err) {
    console.error("[MeshEngineStateMachine] send error:", err);
    currentState = MESH_STATES.ERROR;
    lastError = err;
    notifyState();
  }
}

// -------------------------
// Message Hook (State-Aware)
// -------------------------

export function onMeshMessage(handler) {
  onMessage((from, message) => {
    try {
      handler(
        {
          state: currentState,
          id: getId(),
          peers: getPeers()
        },
        from,
        message
      );
    } catch (err) {
      console.error("[MeshEngineStateMachine] message handler error:", err);
      currentState = MESH_STATES.ERROR;
      lastError = err;
      notifyState();
    }
  });
}

// -------------------------
// Aggregated Export
// -------------------------

export const MeshEngineStateMachine = {
  STATES: MESH_STATES,
  getState: getMeshState,
  getLastError: getMeshLastError,
  getSnapshot: getMeshSnapshot,
  onStateChange: onMeshStateChange,
  join: meshJoin,
  leave: meshLeave,
  broadcast: meshBroadcast,
  send: meshSend,
  onMessage: onMeshMessage
};
