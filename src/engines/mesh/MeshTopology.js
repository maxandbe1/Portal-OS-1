// File: src/engines/mesh/MeshTopology.js
// Phase 31 — Mesh Topology (Graph, Links, Quality, Routing Hints)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshCapabilities } from "./MeshCapabilities.js";

// --------------------------------------------------
// Topology Graph
// --------------------------------------------------

/*
Graph model:
  peerId -> {
    links: Map(peerId -> { rtt, quality, lastSeen }),
    lastUpdate: timestamp
  }
*/

const topology = new Map();

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function ensurePeer(peerId) {
  if (!topology.has(peerId)) {
    topology.set(peerId, {
      links: new Map(),
      lastUpdate: Date.now()
    });
  }
  return topology.get(peerId);
}

function updateLink(a, b, data) {
  const node = ensurePeer(a);
  node.links.set(b, {
    rtt: data.rtt,
    quality: data.quality,
    lastSeen: Date.now()
  });
  node.lastUpdate = Date.now();
}

export function getPeerLinks(peerId) {
  const node = topology.get(peerId);
  if (!node) return [];
  return Array.from(node.links.entries()).map(([to, info]) => ({
    to,
    ...info
  }));
}

export function getFullTopology() {
  return Array.from(topology.entries()).map(([peerId, node]) => ({
    peerId,
    links: Array.from(node.links.entries()).map(([to, info]) => ({
      to,
      ...info
    })),
    lastUpdate: node.lastUpdate
  }));
}

// --------------------------------------------------
// Link Quality Probing
// --------------------------------------------------

function probeLink(peerId) {
  const start = performance.now();

  MeshEngineOrchestrator.send(peerId, {
    type: "mesh.topology.ping",
    ts: start,
    from: MeshEngineOrchestrator.id()
  });
}

function handlePong(from, msg) {
  const rtt = performance.now() - msg.ts;
  const quality = Math.max(0, 1 - rtt / 500); // simple heuristic

  updateLink(MeshEngineOrchestrator.id(), from, { rtt, quality });
}

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  switch (msg.type) {
    case "mesh.topology.ping":
      MeshEngineOrchestrator.send(from, {
        type: "mesh.topology.pong",
        ts: msg.ts,
        from: MeshEngineOrchestrator.id()
      });
      break;

    case "mesh.topology.pong":
      handlePong(from, msg);
      break;

    case "mesh.topology.announce":
      // future: peers can share partial topology
      break;
  }
});

// --------------------------------------------------
// Peer Discovery Integration
// --------------------------------------------------

MeshPeerDiscovery.onPeerJoined?.((peerId) => {
  probeLink(peerId);
});

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  const node = topology.get(peerId);
  if (node) {
    topology.delete(peerId);
  }

  // Remove links pointing to this peer
  for (const [, node] of topology.entries()) {
    node.links.delete(peerId);
  }
});

// --------------------------------------------------
// Periodic Probing
// --------------------------------------------------

setInterval(() => {
  const peers = MeshPeerDiscovery.peers();
  peers.forEach((peerId) => probeLink(peerId));
}, 5000);

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.topology";

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

export const MeshTopology = {
  getPeerLinks,
  getFullTopology
};
