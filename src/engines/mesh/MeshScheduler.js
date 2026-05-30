// File: src/engines/mesh/MeshScheduler.js
// Phase 36 — Mesh Scheduler (Distributed Timers + Coordinated Execution)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshCapabilities } from "./MeshCapabilities.js";

// --------------------------------------------------
// Job Registry
// --------------------------------------------------

/*
Job model:
  {
    id: uuid,
    type: "timeout" | "interval",
    delay: ms,
    interval: ms,
    nextRun: timestamp,
    payload: any,
    owner: peerId,
    active: boolean
  }
*/

const localJobs = new Map();     // jobs we own
const remoteJobs = new Map();    // jobs owned by others

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function now() {
  return Date.now();
}

function scheduleLocalJob(job) {
  localJobs.set(job.id, job);
}

function broadcastJob(job) {
  MeshEngineOrchestrator.broadcast({
    type: "mesh.scheduler.job",
    job,
    from: MeshEngineOrchestrator.id(),
    ts: now()
  });
}

function broadcastCancel(jobId) {
  MeshEngineOrchestrator.broadcast({
    type: "mesh.scheduler.cancel",
    jobId,
    from: MeshEngineOrchestrator.id(),
    ts: now()
  });
}

// --------------------------------------------------
// Public API — Create Jobs
// --------------------------------------------------

export function scheduleTimeout(delay, payload) {
  const id = crypto.randomUUID();
  const job = {
    id,
    type: "timeout",
    delay,
    interval: null,
    nextRun: now() + delay,
    payload,
    owner: MeshEngineOrchestrator.id(),
    active: true
  };

  scheduleLocalJob(job);
  broadcastJob(job);

  return id;
}

export function scheduleInterval(interval, payload) {
  const id = crypto.randomUUID();
  const job = {
    id,
    type: "interval",
    delay: null,
    interval,
    nextRun: now() + interval,
    payload,
    owner: MeshEngineOrchestrator.id(),
    active: true
  };

  scheduleLocalJob(job);
  broadcastJob(job);

  return id;
}

export function cancelJob(jobId) {
  if (localJobs.has(jobId)) {
    localJobs.delete(jobId);
  }
  broadcastCancel(jobId);
}

// --------------------------------------------------
// Execution Loop
// --------------------------------------------------

function executeJob(job) {
  MeshEngineOrchestrator.broadcast({
    type: "mesh.scheduler.execute",
    jobId: job.id,
    payload: job.payload,
    from: MeshEngineOrchestrator.id(),
    ts: now()
  });

  if (job.type === "timeout") {
    localJobs.delete(job.id);
  } else if (job.type === "interval") {
    job.nextRun = now() + job.interval;
  }
}

setInterval(() => {
  const t = now();

  for (const job of localJobs.values()) {
    if (job.active && t >= job.nextRun) {
      executeJob(job);
    }
  }
}, 100);

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

function handleIncomingJob(from, msg) {
  const job = msg.job;
  if (!job) return;

  // Store remote job
  remoteJobs.set(job.id, job);
}

function handleIncomingCancel(from, msg) {
  const { jobId } = msg;
  remoteJobs.delete(jobId);
  localJobs.delete(jobId);
}

function handleIncomingExecute(from, msg) {
  // Execution events are fire-and-forget
  // Future: allow listeners to subscribe
}

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  switch (msg.type) {
    case "mesh.scheduler.job":
      handleIncomingJob(from, msg);
      break;

    case "mesh.scheduler.cancel":
      handleIncomingCancel(from, msg);
      break;

    case "mesh.scheduler.execute":
      handleIncomingExecute(from, msg);
      break;
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  // Remove remote jobs owned by that peer
  for (const [id, job] of remoteJobs.entries()) {
    if (job.owner === peerId) {
      remoteJobs.delete(id);
    }
  }
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.scheduler";

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

export const MeshScheduler = {
  scheduleTimeout,
  scheduleInterval,
  cancelJob
};
