// File: src/engines/mesh/MeshPresence.js
// Phase 30 — Mesh Presence (Online/Offline + Status + Activity)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshCapabilities } from "./MeshCapabilities.js";

// --------------------------------------------------
// Presence Registry
// --------------------------------------------------

/*
Presence is lightweight:
  peerId -> {
    status: "online" | "away" | "busy" | "offline",
    activity: string | null,
    lastUpdate: timestamp
  }
*/

const presenceTable = new Map();

// Local presence state
let localPresence = {
  status: "online",
  activity: null
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function updateLocalPresence(next) {
  localPresence = {
    ...localPresence,
    ...next
  };
  broadcastPresence();
}

function recordPeerPresence(peerId, data) {
  presenceTable.set(peerId, {
    status: data.status,
    activity: data.activity,
    lastUpdate: Date.now()
  });
}

export function getPeerPresence(peerId) {
  return presenceTable.get(peerId) || null;
}

export function getAllPresence() {
  return Array.from(presenceTable.entries()).map(([peerId, data]) => ({
    peerId,
    ...data
  }));
}

// --------------------------------------------------
// Public API
// --------------------------------------------------

export function setStatus(status) {
  updateLocalPresence({ status });
}

export function setActivity(activity) {
  updateLocalPresence({ activity });
}

export function clearActivity() {
  updateLocalPresence({ activity: null });
}

// --------------------------------------------------
// Broadcast
// --------------------------------------------------

function buildPresenceMessage() {
  return {
    type: "mesh.presence.update",
    from: MeshEngineOrchestrator.id(),
    status: localPresence.status,
    activity: localPresence.activity,
    ts: Date.now()
  };
}

function broadcastPresence() {
  MeshEngineOrchestrator.broadcast(buildPresenceMessage());
}

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "mesh.presence.update") {
    recordPeerPresence(from, {
      status: msg.status,
      activity: msg.activity
    });
  }
});

// --------------------------------------------------
// Peer Discovery Integration
// --------------------------------------------------

MeshPeerDiscovery.onPeerJoined?.((peerId) => {
  // Send presence to new peer
  MeshEngineOrchestrator.send(peerId, buildPresenceMessage());
});

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  presenceTable.set(peerId, {
    status: "offline",
    activity: null,
    lastUpdate: Date.now()
  });
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.presence";

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

export const MeshPresence = {
  setStatus,
  setActivity,
  clearActivity,
  getPeerPresence,
  getAllPresence
};
