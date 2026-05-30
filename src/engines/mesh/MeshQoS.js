// File: src/engines/mesh/MeshQoS.js
// Phase 33 — Mesh QoS (Priority Lanes + Rate Limits + Fairness)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshCapabilities } from "./MeshCapabilities.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";

// --------------------------------------------------
// QoS Queues
// --------------------------------------------------

/*
We maintain 3 priority lanes:
  high    → system-critical, presence, RPC
  normal  → default traffic
  low     → bulk, file transfer, logs

Each lane has:
  queue: array of messages
  rate: messages per second
*/

const qosLanes = {
  high:   { queue: [], rate: 60 },
  normal: { queue: [], rate: 30 },
  low:    { queue: [], rate: 10 }
};

// --------------------------------------------------
// Public API — Enqueue
// --------------------------------------------------

export function sendWithQoS(peerId, payload, priority = "normal") {
  const lane = qosLanes[priority] || qosLanes.normal;

  lane.queue.push({
    peerId,
    payload,
    ts: Date.now()
  });
}

// --------------------------------------------------
// Scheduler
// --------------------------------------------------

function processLane(lane) {
  const { queue, rate } = lane;
  const max = rate / 10; // process every 100ms

  for (let i = 0; i < max && queue.length > 0; i++) {
    const msg = queue.shift();
    MeshEngineOrchestrator.send(msg.peerId, msg.payload);
  }
}

setInterval(() => {
  processLane(qosLanes.high);
  processLane(qosLanes.normal);
  processLane(qosLanes.low);
}, 100);

// --------------------------------------------------
// Broadcast with QoS
// --------------------------------------------------

export function broadcastWithQoS(payload, priority = "normal") {
  const peers = MeshPeerDiscovery.peers();
  peers.forEach((peerId) => sendWithQoS(peerId, payload, priority));
}

// --------------------------------------------------
// Dynamic Rate Adjustment
// --------------------------------------------------

export function setLaneRate(priority, rate) {
  if (!qosLanes[priority]) return;
  qosLanes[priority].rate = rate;
}

export function getLaneRate(priority) {
  return qosLanes[priority]?.rate ?? null;
}

// --------------------------------------------------
// Incoming Messages (QoS is local only)
// --------------------------------------------------

MeshEngineOrchestrator.onEvent(() => {
  // QoS does not intercept incoming messages
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.qos";

const originalGetLocal = MeshCapabilities.getLocal;
MeshCapabilities.getLocal = function patchedGetLocal() {
  const caps = originalGetLocal();
  const features = new Set(caps.features || []);
  features.add(LOCAL_FEATURE);
  return { ...caps, features: Array.from(features) };
};

// --------------------------------------------------
// Export
// --------------------------------------------------

export const MeshQoS = {
  send: sendWithQoS,
  broadcast: broadcastWithQoS,
  setLaneRate,
  getLaneRate
};
