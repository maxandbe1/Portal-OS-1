// File: src/engines/mesh/MeshCRDT.js
// Author: Max & Copilot
// Phase: 21 — Mesh CRDT Layer (Conflict-Free Replicated Data Types)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshSyncLayer } from "./MeshSyncLayer.js";

// --------------------------------------
// Version Vector Utilities
// --------------------------------------

function now() {
  return Date.now();
}

function compareVersions(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

// --------------------------------------
// CRDT: LWW Register
// --------------------------------------

const lwwRegisters = {}; 
// shape: { key: { value, timestamp } }

export function lwwSet(key, value) {
  const ts = now();

  lwwRegisters[key] = { value, timestamp: ts };

  MeshEngineOrchestrator.broadcast({
    type: "mesh.crdt.lww",
    key,
    value,
    timestamp: ts
  });
}

export function lwwGet(key) {
  return lwwRegisters[key]?.value;
}

// --------------------------------------
// CRDT: Grow-Only Set (G-Set)
// --------------------------------------

const gsets = {}; 
// shape: { key: Set([...]) }

export function gsetAdd(key, value) {
  if (!gsets[key]) gsets[key] = new Set();
  gsets[key].add(value);

  MeshEngineOrchestrator.broadcast({
    type: "mesh.crdt.gset.add",
    key,
    value
  });
}

export function gsetValues(key) {
  return Array.from(gsets[key] || []);
}

// --------------------------------------
// CRDT: Observed-Remove Set (OR-Set)
// --------------------------------------

const orsets = {}; 
// shape: { key: { adds: Set(), removes: Set() } }

function ensureORSet(key) {
  if (!orsets[key]) {
    orsets[key] = {
      adds: new Set(),
      removes: new Set()
    };
  }
}

export function orsetAdd(key, value) {
  ensureORSet(key);

  const tag = `${value}:${now()}`;
  orsets[key].adds.add(tag);

  MeshEngineOrchestrator.broadcast({
    type: "mesh.crdt.orset.add",
    key,
    tag
  });
}

export function orsetRemove(key, value) {
  ensureORSet(key);

  // remove all tags for this value
  const tags = [...orsets[key].adds].filter((t) => t.startsWith(value + ":"));
  tags.forEach((tag) => orsets[key].removes.add(tag));

  MeshEngineOrchestrator.broadcast({
    type: "mesh.crdt.orset.remove",
    key,
    tags
  });
}

export function orsetValues(key) {
  ensureORSet(key);

  const { adds, removes } = orsets[key];
  return [...adds]
    .filter((tag) => !removes.has(tag))
    .map((tag) => tag.split(":")[0]);
}

// --------------------------------------
// CRDT: Distributed Log
// --------------------------------------

const distributedLog = []; 
// shape: [{ entry, timestamp, origin }]

export function logAppend(entry) {
  const record = {
    entry,
    timestamp: now(),
    origin: MeshEngineOrchestrator.id()
  };

  distributedLog.push(record);

  MeshEngineOrchestrator.broadcast({
    type: "mesh.crdt.log.append",
    record
  });
}

export function logEntries() {
  return [...distributedLog].sort((a, b) => a.timestamp - b.timestamp);
}

// --------------------------------------
// Incoming CRDT Messages
// --------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  // LWW Register
  if (msg.type === "mesh.crdt.lww") {
    const { key, value, timestamp } = msg;

    const existing = lwwRegisters[key];
    if (!existing || compareVersions(timestamp, existing.timestamp) > 0) {
      lwwRegisters[key] = { value, timestamp };
    }
  }

  // G-Set
  if (msg.type === "mesh.crdt.gset.add") {
    const { key, value } = msg;
    if (!gsets[key]) gsets[key] = new Set();
    gsets[key].add(value);
  }

  // OR-Set Add
  if (msg.type === "mesh.crdt.orset.add") {
    const { key, tag } = msg;
    ensureORSet(key);
    orsets[key].adds.add(tag);
  }

  // OR-Set Remove
  if (msg.type === "mesh.crdt.orset.remove") {
    const { key, tags } = msg;
    ensureORSet(key);
    tags.forEach((t) => orsets[key].removes.add(t));
  }

  // Distributed Log
  if (msg.type === "mesh.crdt.log.append") {
    distributedLog.push(msg.record);
  }
});

// --------------------------------------
// Export
// --------------------------------------

export const MeshCRDT = {
  // LWW
  lwwSet,
  lwwGet,

  // G-Set
  gsetAdd,
  gsetValues,

  // OR-Set
  orsetAdd,
  orsetRemove,
  orsetValues,

  // Log
  logAppend,
  logEntries
};
