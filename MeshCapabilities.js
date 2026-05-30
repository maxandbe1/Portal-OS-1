// File: src/engines/mesh/MeshCapabilities.js
// Phase 24 — Mesh Capability Layer (Negotiation + Feature Maps)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshSecurity } from "./MeshSecurity.js";

// --------------------------------------
// Local Capability Descriptor
// --------------------------------------

const LOCAL_CAPABILITIES = {
  version: "1.0.0",
  features: [
    "mesh.stateMachine",
    "mesh.orchestrator",
    "mesh.discovery",
    "mesh.sync",
    "mesh.crdt",
    "mesh.persistence",
    "mesh.security"
  ]
};

let localCapabilities = { ...LOCAL_CAPABILITIES };

// peerId -> { version, features[] }
const peerCapabilities = new Map();

// --------------------------------------
// Helpers
// --------------------------------------

function getLocalCapabilities() {
  return { ...localCapabilities };
}

function setLocalCapabilities(next) {
  localCapabilities = {
    ...localCapabilities,
    ...next,
    features: next.features || localCapabilities.features
  };
  broadcastCapabilities();
}

function recordPeerCapabilities(peerId, caps) {
  peerCapabilities.set(peerId, caps);
}

export function getPeerCapabilities(peerId) {
  return peerCapabilities.get(peerId) || null;
}

export function getAllPeerCapabilities() {
  return Array.from(peerCapabilities.entries()).map(([peerId, caps]) => ({
    peerId,
    ...caps
  }));
}

// --------------------------------------
// Compatibility Check
// --------------------------------------

export function isCompatible(peerId) {
  const caps = peerCapabilities.get(peerId);
  if (!caps) return false;

  const localMajor = (localCapabilities.version || "1").split(".")[0];
  const remoteMajor = (caps.version || "1").split(".")[0];

  return localMajor === remoteMajor;
}

export function hasFeature(peerId, feature) {
  const caps = peerCapabilities.get(peerId);
  if (!caps) return false;
  return (caps.features || []).includes(feature);
}

// --------------------------------------
// Capability Broadcast
// --------------------------------------

function buildCapabilityMessage() {
  return {
    type: "mesh.capabilities.announce",
    from: MeshEngineOrchestrator.id(),
    caps: getLocalCapabilities(),
    ts: Date.now()
  };
}

function broadcastCapabilities() {
  MeshEngineOrchestrator.broadcast(buildCapabilityMessage());
}

async function secureBroadcastCapabilities() {
  await MeshSecurity.secureBroadcast(buildCapabilityMessage());
}

// --------------------------------------
// Discovery Integration
// --------------------------------------

function announceOnDiscoveryStart() {
  broadcastCapabilities();
}

const originalDiscoveryStart = MeshPeerDiscovery.start;
MeshPeerDiscovery.start = function patchedDiscoveryStart() {
  originalDiscoveryStart();
  announceOnDiscoveryStart();
};

// --------------------------------------
// Incoming Messages
// --------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "mesh.capabilities.announce") {
    if (!msg.caps) return;
    recordPeerCapabilities(from, msg.caps);
  }

  if (msg.type === "mesh.capabilities.request") {
    MeshEngineOrchestrator.send(from, buildCapabilityMessage());
  }
});

// secure path
MeshSecurity.onSecureMessage((snapshot, from, payload) => {
  if (!payload || typeof payload !== "object") return;

  if (payload.type === "mesh.capabilities.announce") {
    if (!payload.caps) return;
    recordPeerCapabilities(from, payload.caps);
  }

  if (payload.type === "mesh.capabilities.request") {
    secureBroadcastCapabilities();
  }
});

// --------------------------------------
// Public API
// --------------------------------------

export function requestPeerCapabilities() {
  const peers = MeshPeerDiscovery.peers();
  peers.forEach((peerId) => {
    MeshEngineOrchestrator.send(peerId, {
      type: "mesh.capabilities.request",
      from: MeshEngineOrchestrator.id(),
      ts: Date.now()
    });
  });
}

export const MeshCapabilities = {
  getLocal: getLocalCapabilities,
  setLocal: setLocalCapabilities,
  getPeer: getPeerCapabilities,
  getAll: getAllPeerCapabilities,
  isCompatible,
  hasFeature,
  request: requestPeerCapabilities,
  broadcast: broadcastCapabilities,
  secureBroadcast: secureBroadcastCapabilities
};
