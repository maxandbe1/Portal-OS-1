// File: src/engines/mesh/MeshLoadBalancer.js
// Phase 32 — Mesh Load Balancer (Peer Scoring + Adaptive Routing)

import { MeshTopology } from "./MeshTopology.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshCapabilities } from "./MeshCapabilities.js";
import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";

// --------------------------------------------------
// Peer Score Table
// --------------------------------------------------

/*
Score model:
  score = f(quality, rtt, load)
We track:
  peerId -> { score, load, lastUpdate }
*/

const peerScores = new Map();

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function ensurePeer(peerId) {
  if (!peerScores.has(peerId)) {
    peerScores.set(peerId, {
      score: 0,
      load: 0,
      lastUpdate: Date.now()
    });
  }
  return peerScores.get(peerId);
}

function computeScore({ rtt, quality, load }) {
  // Normalize
  const q = quality ?? 0;
  const latencyPenalty = Math.min(1, rtt / 500); // 0–1
  const loadPenalty = Math.min(1, load / 10);    // 0–1

  return q * 1.0 - latencyPenalty * 0.5 - loadPenalty * 0.3;
}

function updatePeerScore(peerId) {
  const links = MeshTopology.getPeerLinks(peerId);
  if (!links || links.length === 0) return;

  // Use best link
  const best = links.reduce((a, b) => (a.quality > b.quality ? a : b));

  const entry = ensurePeer(peerId);
  entry.score = computeScore({
    rtt: best.rtt,
    quality: best.quality,
    load: entry.load
  });
  entry.lastUpdate = Date.now();
}

export function getPeerScore(peerId) {
  const entry = peerScores.get(peerId);
  return entry ? entry.score : null;
}

export function getAllPeerScores() {
  return Array.from(peerScores.entries()).map(([peerId, data]) => ({
    peerId,
    ...data
  }));
}

// --------------------------------------------------
// Load Reporting
// --------------------------------------------------

export function reportLocalLoad(load) {
  const msg = {
    type: "mesh.load.report",
    load,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  };
  MeshEngineOrchestrator.broadcast(msg);
}

function handleLoadReport(from, msg) {
  const entry = ensurePeer(from);
  entry.load = msg.load;
  updatePeerScore(from);
}

// --------------------------------------------------
// Choosing a Peer
// --------------------------------------------------

export function chooseBestPeer() {
  const peers = MeshPeerDiscovery.peers();
  if (peers.length === 0) return null;

  peers.forEach(updatePeerScore);

  let bestPeer = null;
  let bestScore = -Infinity;

  for (const peerId of peers) {
    const score = getPeerScore(peerId);
    if (score !== null && score > bestScore) {
      bestScore = score;
      bestPeer = peerId;
    }
  }

  return bestPeer;
}

export function choosePeerWeighted() {
  const peers = MeshPeerDiscovery.peers();
  if (peers.length === 0) return null;

  const scored = peers
    .map((peerId) => ({
      peerId,
      score: Math.max(0.001, getPeerScore(peerId) ?? 0.001)
    }));

  const total = scored.reduce((sum, p) => sum + p.score, 0);
  let r = Math.random() * total;

  for (const p of scored) {
    if (r < p.score) return p.peerId;
    r -= p.score;
  }

  return scored[0].peerId;
}

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "mesh.load.report") {
    handleLoadReport(from, msg);
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  peerScores.delete(peerId);
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.loadBalancer";

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

export const MeshLoadBalancer = {
  reportLocalLoad,
  chooseBestPeer,
  choosePeerWeighted,
  getPeerScore,
  getAllPeerScores
};
