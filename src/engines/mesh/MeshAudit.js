// File: src/engines/mesh/MeshAudit.js
// Phase 34 — Mesh Audit (Distributed Event Trails + Integrity Markers)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshCapabilities } from "./MeshCapabilities.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";

// --------------------------------------------------
// Audit Log
// --------------------------------------------------

/*
Audit entries:
  {
    id: uuid,
    type: string,
    payload: any,
    from: peerId,
    ts: timestamp,
    hash: SHA-256 of (type + payload + ts + from),
    prev: previous hash (chain)
  }
*/

const auditLog = [];
let lastHash = null;

// --------------------------------------------------
// Hashing
// --------------------------------------------------

async function sha256(str) {
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function computeEntryHash(entry) {
  const base = JSON.stringify({
    type: entry.type,
    payload: entry.payload,
    ts: entry.ts,
    from: entry.from,
    prev: entry.prev
  });
  return sha256(base);
}

// --------------------------------------------------
// Append Entry
// --------------------------------------------------

async function appendAuditEntry(entry) {
  entry.prev = lastHash;
  entry.hash = await computeEntryHash(entry);

  auditLog.push(entry);
  lastHash = entry.hash;
}

// --------------------------------------------------
// Public API
// --------------------------------------------------

export async function recordAudit(type, payload) {
  const entry = {
    id: crypto.randomUUID(),
    type,
    payload,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now(),
    prev: null,
    hash: null
  };

  await appendAuditEntry(entry);

  // Broadcast to peers
  MeshEngineOrchestrator.broadcast({
    type: "mesh.audit.entry",
    entry,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });

  return entry;
}

export function getAuditLog() {
  return [...auditLog];
}

export function getLastAuditHash() {
  return lastHash;
}

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

async function handleIncomingAudit(from, msg) {
  const entry = msg.entry;
  if (!entry) return;

  // Verify chain
  const expectedPrev = lastHash;
  if (entry.prev !== expectedPrev) {
    // Out-of-order or tampered
    // Future: request reconciliation
  }

  // Verify hash
  const computed = await computeEntryHash(entry);
  if (computed !== entry.hash) {
    // Tampered entry
    return;
  }

  auditLog.push(entry);
  lastHash = entry.hash;
}

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "mesh.audit.entry") {
    handleIncomingAudit(from, msg);
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.(() => {
  // Audit log is append-only; nothing to clean
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.audit";

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

export const MeshAudit = {
  record: recordAudit,
  getLog: getAuditLog,
  getLastHash: getLastAuditHash
};
