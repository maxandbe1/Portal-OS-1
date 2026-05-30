// File: src/engines/mesh/MeshAutonomy.js
// Phase 39 — Mesh Autonomy (Self-Healing + Self-Optimization + Behavior Loops)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshLoadBalancer } from "./MeshLoadBalancer.js";
import { MeshTopology } from "./MeshTopology.js";
import { MeshQoS } from "./MeshQoS.js";
import { MeshCapabilities } from "./MeshCapabilities.js";

// --------------------------------------------------
// Autonomy Behaviors
// --------------------------------------------------

/*
Behavior model:
  {
    id: uuid,
    name: string,
    interval: ms,
    nextRun: timestamp,
    action: async () => void
  }
*/

const behaviors = new Map();

// --------------------------------------------------
// Register Behavior
// --------------------------------------------------

export function registerBehavior(name, interval, action) {
  const id = crypto.randomUUID();

  behaviors.set(id, {
    id,
    name,
    interval,
    nextRun: Date.now() + interval,
    action
  });

  return id;
}

export function unregisterBehavior(id) {
  behaviors.delete(id);
}

// --------------------------------------------------
// Built-in Autonomous Behaviors
// --------------------------------------------------

// 1. Self-Heal Missing Links
registerBehavior("self-heal-links", 5000, async () => {
  const peers = MeshPeerDiscovery.peers();

  peers.forEach((peerId) => {
    const links = MeshTopology.getPeerLinks(peerId);
    if (!links || links.length === 0) {
      // Trigger a probe to rebuild link quality
      MeshEngineOrchestrator.send(peerId, {
        type: "mesh.topology.ping",
        ts: performance.now(),
        from: MeshEngineOrchestrator.id()
      });
    }
  });
});

// 2. Auto-Adjust QoS Rates Based on Load
registerBehavior("auto-qos-adjust", 4000, async () => {
  const peers = MeshPeerDiscovery.peers();
  if (peers.length === 0) return;

  const scores = peers.map((p) => MeshLoadBalancer.getPeerScore(p) || 0);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  // If network is congested, slow low-priority lane
  if (avg < 0.2) {
    MeshQoS.setLaneRate("low", 5);
  } else {
    MeshQoS.setLaneRate("low", 10);
  }
});

// 3. Auto-Rebalance Workload
registerBehavior("auto-rebalance", 6000, async () => {
  const best = MeshLoadBalancer.chooseBestPeer();
  if (!best) return;

  // Notify peers of optimal routing target
  MeshEngineOrchestrator.broadcast({
    type: "mesh.autonomy.rebalance",
    best,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });
});

// --------------------------------------------------
// Execution Loop
// --------------------------------------------------

setInterval(async () => {
  const t = Date.now();

  for (const behavior of behaviors.values()) {
    if (t >= behavior.nextRun) {
      try {
        await behavior.action();
      } catch (err) {
        // Future: error reporting
      }
      behavior.nextRun = t + behavior.interval;
    }
  }
}, 200);

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "mesh.autonomy.rebalance") {
    // Future: peers may adjust routing tables
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.(() => {
  // Autonomy behaviors are local; nothing to clean
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.autonomy";

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

export const MeshAutonomy = {
  registerBehavior,
  unregisterBehavior
};
