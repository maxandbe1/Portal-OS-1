// File: src/engines/mesh/MeshIntelligence.js
// Phase 38 — Mesh Intelligence (Distributed Inference + Collaborative Compute)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshLoadBalancer } from "./MeshLoadBalancer.js";
import { MeshCapabilities } from "./MeshCapabilities.js";

// --------------------------------------------------
// Intelligence Tasks
// --------------------------------------------------

/*
Task model:
  {
    id: uuid,
    type: string,
    payload: any,
    partials: Map(peerId -> partialResult),
    reducer: (partials) => finalResult,
    assigned: Set(peerId),
    required: number,
    onComplete: fn
  }
*/

const intelligenceTasks = new Map();

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function ensureTask(id) {
  if (!intelligenceTasks.has(id)) {
    intelligenceTasks.set(id, {
      id,
      type: null,
      payload: null,
      partials: new Map(),
      reducer: null,
      assigned: new Set(),
      required: 0,
      onComplete: null
    });
  }
  return intelligenceTasks.get(id);
}

function chooseWorkers(count) {
  const peers = MeshPeerDiscovery.peers();
  if (peers.length === 0) return [];

  const chosen = [];
  for (let i = 0; i < count; i++) {
    const peer = MeshLoadBalancer.choosePeerWeighted();
    if (peer) chosen.push(peer);
  }
  return chosen;
}

// --------------------------------------------------
// Public API — Distributed Inference
// --------------------------------------------------

export function runDistributedTask(type, payload, reducer, { workers = 3, onComplete } = {}) {
  const id = crypto.randomUUID();

  const task = ensureTask(id);
  task.type = type;
  task.payload = payload;
  task.reducer = reducer;
  task.required = workers;
  task.onComplete = onComplete || (() => {});

  const selected = chooseWorkers(workers);
  selected.forEach((peerId) => task.assigned.add(peerId));

  // Send work to selected peers
  selected.forEach((peerId) => {
    MeshEngineOrchestrator.send(peerId, {
      type: "mesh.intel.work",
      id,
      taskType: type,
      payload,
      from: MeshEngineOrchestrator.id(),
      ts: Date.now()
    });
  });

  return id;
}

// --------------------------------------------------
// Worker Side — Execute Partial
// --------------------------------------------------

async function executePartial(type, payload) {
  // Future: plug in local ML, heuristics, or compute modules
  // For now: echo payload or transform lightly
  return {
    ok: true,
    type,
    payload
  };
}

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

async function handleWork(from, msg) {
  const { id, taskType, payload } = msg;

  const partial = await executePartial(taskType, payload);

  MeshEngineOrchestrator.send(from, {
    type: "mesh.intel.partial",
    id,
    partial,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });
}

function handlePartial(from, msg) {
  const { id, partial } = msg;
  const task = intelligenceTasks.get(id);
  if (!task) return;

  task.partials.set(from, partial);

  if (task.partials.size >= task.required) {
    const final = task.reducer(task.partials);
    task.onComplete(final);
    intelligenceTasks.delete(id);
  }
}

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  switch (msg.type) {
    case "mesh.intel.work":
      handleWork(from, msg);
      break;

    case "mesh.intel.partial":
      handlePartial(from, msg);
      break;
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  for (const [id, task] of intelligenceTasks.entries()) {
    if (task.assigned.has(peerId)) {
      // Reduce required count
      task.required--;

      // If enough partials already exist, finalize
      if (task.partials.size >= task.required) {
        const final = task.reducer(task.partials);
        task.onComplete(final);
        intelligenceTasks.delete(id);
      }
    }
  }
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.intelligence";

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

export const MeshIntelligence = {
  run: runDistributedTask
};
