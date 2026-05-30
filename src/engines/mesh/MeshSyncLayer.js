// File: src/engines/mesh/MeshSyncLayer.js
// Author: Max & Copilot
// Phase: 20 — Mesh Sync Layer (State Sync + Delta Propagation)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";

// --------------------------------------
// Version Vector
// --------------------------------------

const versionVector = {}; 
// shape: { peerId: number }

function bumpLocalVersion() {
  const id = MeshEngineOrchestrator.id();
  versionVector[id] = (versionVector[id] || 0) + 1;
  return versionVector[id];
}

function updateVersion(peerId, version) {
  const current = versionVector[peerId] || 0;
  if (version > current) {
    versionVector[peerId] = version;
  }
}

// --------------------------------------
// Shared State Store
// --------------------------------------

let sharedState = {}; 
// shape: { key: value }

const stateListeners = new Set();

function notifyState() {
  const snapshot = getStateSnapshot();
  stateListeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch (err) {
      console.error("[MeshSyncLayer] listener error:", err);
    }
  });
}

function getStateSnapshot() {
  return {
    state: { ...sharedState },
    versions: { ...versionVector }
  };
}

// --------------------------------------
// Public API: Set + Sync
// --------------------------------------

export function setSharedState(key, value) {
  sharedState[key] = value;

  const newVersion = bumpLocalVersion();

  MeshEngineOrchestrator.broadcast({
    type: "mesh.sync.delta",
    from: MeshEngineOrchestrator.id(),
    key,
    value,
    version: newVersion
  });

  notifyState();
}

export function onSharedStateChange(handler) {
  stateListeners.add(handler);
  handler(getStateSnapshot());
  return () => stateListeners.delete(handler);
}

// --------------------------------------
// Incoming Sync Messages
// --------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  // delta update
  if (msg.type === "mesh.sync.delta") {
    const { key, value, version } = msg;

    updateVersion(from, version);

    sharedState[key] = value;
    notifyState();
  }

  // full sync request
  if (msg.type === "mesh.sync.request") {
    MeshEngineOrchestrator.send(from, {
      type: "mesh.sync.full",
      from: MeshEngineOrchestrator.id(),
      state: sharedState,
      versions: versionVector
    });
  }

  // full sync response
  if (msg.type === "mesh.sync.full") {
    const incomingState = msg.state || {};
    const incomingVersions = msg.versions || {};

    // merge state
    for (const key in incomingState) {
      sharedState[key] = incomingState[key];
    }

    // merge version vectors
    for (const peerId in incomingVersions) {
      updateVersion(peerId, incomingVersions[peerId]);
    }

    notifyState();
  }
});

// --------------------------------------
// Sync on Join
// --------------------------------------

export function requestFullSync() {
  const peers = MeshPeerDiscovery.peers();
  peers.forEach((peerId) => {
    MeshEngineOrchestrator.send(peerId, {
      type: "mesh.sync.request",
      from: MeshEngineOrchestrator.id()
    });
  });
}

// --------------------------------------
// Export
// --------------------------------------

export const MeshSyncLayer = {
  set: setSharedState,
  onChange: onSharedStateChange,
  snapshot: getStateSnapshot,
  requestFullSync
};
