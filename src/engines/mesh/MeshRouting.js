// File: src/engines/mesh/MeshRouting.js
// Author: Max & Copilot
// Phase: 25 — Mesh Routing Layer (Topics + Channels + Priority)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshCapabilities } from "./MeshCapabilities.js";

// --------------------------------------
// Routing Tables
// --------------------------------------

// topic -> Set(peerId)
const topicSubscribers = new Map();

// channel -> Set(peerId)
const channelSubscribers = new Map();

// peerId -> { topics: Set, channels: Set }
const peerRouting = new Map();

// --------------------------------------
// Helpers
// --------------------------------------

function ensurePeerRouting(peerId) {
  if (!peerRouting.has(peerId)) {
    peerRouting.set(peerId, {
      topics: new Set(),
      channels: new Set()
    });
  }
  return peerRouting.get(peerId);
}

function subscribeToMap(map, key, peerId) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(peerId);
}

function unsubscribeFromMap(map, key, peerId) {
  if (!map.has(key)) return;
  const set = map.get(key);
  set.delete(peerId);
  if (set.size === 0) map.delete(key);
}

// --------------------------------------
// Public API — Topics
// --------------------------------------

export function subscribeTopic(topic) {
  const msg = {
    type: "mesh.routing.topic.subscribe",
    topic,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  };
  MeshEngineOrchestrator.broadcast(msg);
}

export function unsubscribeTopic(topic) {
  const msg = {
    type: "mesh.routing.topic.unsubscribe",
    topic,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  };
  MeshEngineOrchestrator.broadcast(msg);
}

export function routeToTopic(topic, payload, { priority = "normal" } = {}) {
  const subs = topicSubscribers.get(topic);
  if (!subs || subs.size === 0) return;

  const envelope = {
    type: "mesh.routing.topic.message",
    topic,
    payload,
    priority,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  };

  subs.forEach((peerId) => {
    MeshEngineOrchestrator.send(peerId, envelope);
  });
}

// --------------------------------------
// Public API — Channels
// --------------------------------------

export function subscribeChannel(channel) {
  const msg = {
    type: "mesh.routing.channel.subscribe",
    channel,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  };
  MeshEngineOrchestrator.broadcast(msg);
}

export function unsubscribeChannel(channel) {
  const msg = {
    type: "mesh.routing.channel.unsubscribe",
    channel,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  };
  MeshEngineOrchestrator.broadcast(msg);
}

export function routeToChannel(channel, payload, { priority = "normal" } = {}) {
  const subs = channelSubscribers.get(channel);
  if (!subs || subs.size === 0) return;

  const envelope = {
    type: "mesh.routing.channel.message",
    channel,
    payload,
    priority,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  };

  subs.forEach((peerId) => {
    MeshEngineOrchestrator.send(peerId, envelope);
  });
}

// --------------------------------------
// Introspection
// --------------------------------------

export function getTopicSubscribers(topic) {
  return Array.from(topicSubscribers.get(topic) || []);
}

export function getChannelSubscribers(channel) {
  return Array.from(channelSubscribers.get(channel) || []);
}

export function getPeerRouting(peerId) {
  const entry = peerRouting.get(peerId);
  if (!entry) return { topics: [], channels: [] };
  return {
    topics: Array.from(entry.topics),
    channels: Array.from(entry.channels)
  };
}

// --------------------------------------
// Incoming Messages
// --------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  // Topic subscribe
  if (msg.type === "mesh.routing.topic.subscribe") {
    const { topic } = msg;
    if (!topic) return;

    subscribeToMap(topicSubscribers, topic, from);
    const pr = ensurePeerRouting(from);
    pr.topics.add(topic);
  }

  // Topic unsubscribe
  if (msg.type === "mesh.routing.topic.unsubscribe") {
    const { topic } = msg;
    if (!topic) return;

    unsubscribeFromMap(topicSubscribers, topic, from);
    const pr = ensurePeerRouting(from);
    pr.topics.delete(topic);
  }

  // Channel subscribe
  if (msg.type === "mesh.routing.channel.subscribe") {
    const { channel } = msg;
    if (!channel) return;

    subscribeToMap(channelSubscribers, channel, from);
    const pr = ensurePeerRouting(from);
    pr.channels.add(channel);
  }

  // Channel unsubscribe
  if (msg.type === "mesh.routing.channel.unsubscribe") {
    const { channel } = msg;
    if (!channel) return;

    unsubscribeFromMap(channelSubscribers, channel, from);
    const pr = ensurePeerRouting(from);
    pr.channels.delete(channel);
  }

  // Topic message
  if (msg.type === "mesh.routing.topic.message") {
    // routing layer is transparent; app-level handlers see this via orchestrator
  }

  // Channel message
  if (msg.type === "mesh.routing.channel.message") {
    // same as above
  }
});

// --------------------------------------
// Peer Discovery Integration
// --------------------------------------

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  const entry = peerRouting.get(peerId);
  if (!entry) return;

  entry.topics.forEach((topic) => {
    unsubscribeFromMap(topicSubscribers, topic, peerId);
  });

  entry.channels.forEach((channel) => {
    unsubscribeFromMap(channelSubscribers, channel, peerId);
  });

  peerRouting.delete(peerId);
});

// --------------------------------------
// Capability Registration
// --------------------------------------

const LOCAL_FEATURE = "mesh.routing";

const originalGetLocal = MeshCapabilities.getLocal;
MeshCapabilities.getLocal = function patchedGetLocal() {
  const caps = originalGetLocal();
  const features = new Set(caps.features || []);
  features.add(LOCAL_FEATURE);
  return { ...caps, features: Array.from(features) };
};

// --------------------------------------
// Export
// --------------------------------------

export const MeshRouting = {
  // topics
  subscribeTopic,
  unsubscribeTopic,
  routeToTopic,
  getTopicSubscribers,

  // channels
  subscribeChannel,
  unsubscribeChannel,
  routeToChannel,
  getChannelSubscribers,

  // introspection
  getPeerRouting
};
