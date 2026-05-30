// File: src/engines/mesh/MeshPeerDiscovery.js
// Author: Max & Copilot
// Phase: 19 — Mesh Peer Discovery Layer

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";

const HEARTBEAT_INTERVAL = 4000;
const STALE_PEER_TIMEOUT = 12000;

let heartbeatTimer = null;
let cleanupTimer = null;

const peerTimestamps = new Map();

// --------------------------------------
// Internal Helpers
// --------------------------------------

function markPeerSeen(peerId) {
  peerTimestamps.set(peerId, Date.now());
}

function removeStalePeers() {
  const now = Date.now();

  for (const [peerId, ts] of peerTimestamps.entries()) {
    if (now - ts > STALE_PEER_TIMEOUT) {
      peerTimestamps.delete(peerId);
      console.warn("[MeshPeerDiscovery] Removing stale peer:", peerId);
    }
  }
}

// --------------------------------------
// Heartbeat Broadcast
// --------------------------------------

function sendHeartbeat() {
  MeshEngineOrchestrator.broadcast({
    type: "mesh.heartbeat",
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });
}

// --------------------------------------
// Incoming Message Routing
// --------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "mesh.heartbeat") {
    markPeerSeen(from);
  }

  if (msg.type === "mesh.announce") {
    markPeerSeen(from);
  }
});

// --------------------------------------
// Public API
// --------------------------------------

function startDiscovery() {
  // announce presence
  MeshEngineOrchestrator.broadcast({
    type: "mesh.announce",
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });

  // heartbeat loop
  heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

  // stale peer cleanup loop
  cleanupTimer = setInterval(removeStalePeers, HEARTBEAT_INTERVAL);
}

function stopDiscovery() {
  clearInterval(heartbeatTimer);
  clearInterval(cleanupTimer);
  heartbeatTimer = null;
  cleanupTimer = null;
}

function getKnownPeers() {
  return Array.from(peerTimestamps.keys());
}

export const MeshPeerDiscovery = {
  start: startDiscovery,
  stop: stopDiscovery,
  peers: getKnownPeers
};
