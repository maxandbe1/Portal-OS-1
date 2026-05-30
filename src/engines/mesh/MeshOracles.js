// File: src/engines/mesh/MeshOracles.js
// Phase 37 — Mesh Oracles (External Data Ingestion + Mesh Verification)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshCapabilities } from "./MeshCapabilities.js";

// --------------------------------------------------
// Oracle Registry
// --------------------------------------------------

/*
Oracle model:
  {
    id: uuid,
    key: string (e.g. "weather.nyc", "sports.nba", "system.cpu"),
    fetcher: async () => data,
    interval: ms,
    nextRun: timestamp,
    lastValue: any,
    lastHash: string,
    subscribers: Set(peerId)
  }
*/

const localOracles = new Map();   // oracles we own
const oracleCache = new Map();    // key -> { value, hash, ts }

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

async function computeHash(value) {
  return sha256(JSON.stringify(value));
}

// --------------------------------------------------
// Public API — Register Oracle
// --------------------------------------------------

export function registerOracle(key, interval, fetcher) {
  const id = crypto.randomUUID();

  const oracle = {
    id,
    key,
    fetcher,
    interval,
    nextRun: Date.now() + interval,
    lastValue: null,
    lastHash: null,
    subscribers: new Set()
  };

  localOracles.set(id, oracle);

  // Announce oracle availability
  MeshEngineOrchestrator.broadcast({
    type: "mesh.oracle.announce",
    key,
    id,
    interval,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });

  return id;
}

// --------------------------------------------------
// Public API — Subscribe to Oracle
// --------------------------------------------------

export function subscribeOracle(key) {
  MeshEngineOrchestrator.broadcast({
    type: "mesh.oracle.subscribe",
    key,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });
}

export function getOracleValue(key) {
  return oracleCache.get(key)?.value ?? null;
}

// --------------------------------------------------
// Execution Loop
// --------------------------------------------------

async function executeOracle(oracle) {
  try {
    const value = await oracle.fetcher();
    const hash = await computeHash(value);

    oracle.lastValue = value;
    oracle.lastHash = hash;
    oracle.nextRun = Date.now() + oracle.interval;

    // Update local cache
    oracleCache.set(oracle.key, {
      value,
      hash,
      ts: Date.now()
    });

    // Broadcast update
    MeshEngineOrchestrator.broadcast({
      type: "mesh.oracle.update",
      key: oracle.key,
      value,
      hash,
      from: MeshEngineOrchestrator.id(),
      ts: Date.now()
    });
  } catch (err) {
    // Future: error reporting
  }
}

setInterval(() => {
  const t = Date.now();

  for (const oracle of localOracles.values()) {
    if (t >= oracle.nextRun) {
      executeOracle(oracle);
    }
  }
}, 200);

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

async function handleOracleAnnounce(from, msg) {
  // Future: track remote oracle providers
}

async function handleOracleSubscribe(from, msg) {
  const { key } = msg;

  // If we own an oracle with this key, add subscriber
  for (const oracle of localOracles.values()) {
    if (oracle.key === key) {
      oracle.subscribers.add(from);

      // Send immediate value if available
      if (oracle.lastValue) {
        MeshEngineOrchestrator.send(from, {
          type: "mesh.oracle.update",
          key,
          value: oracle.lastValue,
          hash: oracle.lastHash,
          from: MeshEngineOrchestrator.id(),
          ts: Date.now()
        });
      }
    }
  }
}

async function handleOracleUpdate(from, msg) {
  const { key, value, hash } = msg;

  // Verify hash
  const computed = await computeHash(value);
  if (computed !== hash) {
    // Tampered or corrupted
    return;
  }

  oracleCache.set(key, {
    value,
    hash,
    ts: Date.now()
  });
}

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  switch (msg.type) {
    case "mesh.oracle.announce":
      handleOracleAnnounce(from, msg);
      break;

    case "mesh.oracle.subscribe":
      handleOracleSubscribe(from, msg);
      break;

    case "mesh.oracle.update":
      handleOracleUpdate(from, msg);
      break;
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  for (const oracle of localOracles.values()) {
    oracle.subscribers.delete(peerId);
  }
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.oracles";

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

export const MeshOracles = {
  register: registerOracle,
  subscribe: subscribeOracle,
  get: getOracleValue
};
