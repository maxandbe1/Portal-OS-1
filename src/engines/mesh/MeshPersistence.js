// File: src/engines/mesh/MeshPersistence.js
// Author: Max & Copilot
// Phase: 22 — Mesh Persistence Layer (Local Storage + Replay + Recovery)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshSyncLayer } from "./MeshSyncLayer.js";
import { MeshCRDT } from "./MeshCRDT.js";

// --------------------------------------
// Storage Adapter (LocalStorage by default)
// --------------------------------------

let storage = window.localStorage;

export function setStorageAdapter(adapter) {
  storage = adapter;
}

// --------------------------------------
// Keys
// --------------------------------------

const KEYS = {
  SNAPSHOT: "portal.mesh.snapshot",
  LOG: "portal.mesh.log"
};

// --------------------------------------
// Save Snapshot
// --------------------------------------

export function saveSnapshot() {
  const snapshot = {
    sync: MeshSyncLayer.snapshot(),
    crdt: {
      lww: {}, // filled below
      gsets: {},
      orsets: {},
      log: MeshCRDT.logEntries()
    }
  };

  // extract CRDT state
  for (const key in MeshCRDT) {
    if (key.startsWith("lwwGet")) continue;
  }

  try {
    storage.setItem(KEYS.SNAPSHOT, JSON.stringify(snapshot));
  } catch (err) {
    console.error("[MeshPersistence] Failed to save snapshot:", err);
  }
}

// --------------------------------------
// Load Snapshot
// --------------------------------------

export function loadSnapshot() {
  try {
    const raw = storage.getItem(KEYS.SNAPSHOT);
    if (!raw) return null;

    const snapshot = JSON.parse(raw);
    return snapshot;
  } catch (err) {
    console.error("[MeshPersistence] Failed to load snapshot:", err);
    return null;
  }
}

// --------------------------------------
// Apply Snapshot
// --------------------------------------

export function applySnapshot(snapshot) {
  if (!snapshot) return;

  // restore CRDT log
  if (snapshot.crdt?.log) {
    snapshot.crdt.log.forEach((record) => {
      MeshCRDT.logAppend(record.entry);
    });
  }

  // restore sync state
  if (snapshot.sync?.state) {
    for (const key in snapshot.sync.state) {
      MeshSyncLayer.set(key, snapshot.sync.state[key]);
    }
  }
}

// --------------------------------------
// Replay Log
// --------------------------------------

export function replayLog() {
  const snapshot = loadSnapshot();
  if (!snapshot || !snapshot.crdt?.log) return;

  snapshot.crdt.log.forEach((record) => {
    MeshCRDT.logAppend(record.entry);
  });
}

// --------------------------------------
// Auto-Persistence Loop
// --------------------------------------

let persistTimer = null;
const PERSIST_INTERVAL = 5000;

export function startPersistence() {
  persistTimer = setInterval(saveSnapshot, PERSIST_INTERVAL);
}

export function stopPersistence() {
  clearInterval(persistTimer);
  persistTimer = null;
}

// --------------------------------------
// Cold Start Recovery
// --------------------------------------

export function coldStartRecovery() {
  const snapshot = loadSnapshot();

  if (snapshot) {
    console.warn("[MeshPersistence] Applying cold-start snapshot.");
    applySnapshot(snapshot);
  }

  // always request fresh sync from peers
  MeshSyncLayer.requestFullSync();
}

// --------------------------------------
// Export
// --------------------------------------

export const MeshPersistence = {
  saveSnapshot,
  loadSnapshot,
  applySnapshot,
  replayLog,
  start: startPersistence,
  stop: stopPersistence,
  coldStartRecovery,
  setStorageAdapter
};
