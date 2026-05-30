// File: src/engines/mesh/MeshRPC.js
// Phase 28 — Mesh RPC (Request/Response over Mesh Streams)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshStreams } from "./MeshStreams.js";
import { MeshCapabilities } from "./MeshCapabilities.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";

// --------------------------------------
// Registry
// --------------------------------------

const rpcHandlers = new Map();      // method -> handler(payload, ctx)
const pendingCalls = new Map();     // callId -> { resolve, reject, timeout }

// --------------------------------------
// Utils
// --------------------------------------

function genId() {
  return crypto.randomUUID();
}

function buildContext(fromPeerId) {
  return {
    from: fromPeerId,
    send: (payload) => {
      MeshEngineOrchestrator.send(fromPeerId, payload);
    }
  };
}

// --------------------------------------
// Public API — Server Side
// --------------------------------------

export function registerRPC(method, handler) {
  rpcHandlers.set(method, handler);
}

export function unregisterRPC(method) {
  rpcHandlers.delete(method);
}

// --------------------------------------
// Public API — Client Side
// --------------------------------------

export function callRPC(peerId, method, params, { timeoutMs = 10000 } = {}) {
  const callId = genId();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingCalls.delete(callId);
      reject(new Error("rpc-timeout"));
    }, timeoutMs);

    pendingCalls.set(callId, { resolve, reject, timeout });

    MeshEngineOrchestrator.send(peerId, {
      type: "mesh.rpc.request",
      callId,
      method,
      params,
      from: MeshEngineOrchestrator.id(),
      ts: Date.now()
    });
  });
}

// --------------------------------------
// Internal — Handling Requests
// --------------------------------------

async function handleRPCRequest(from, msg) {
  const { callId, method, params } = msg;
  const handler = rpcHandlers.get(method);

  if (!handler) {
    MeshEngineOrchestrator.send(from, {
      type: "mesh.rpc.response",
      callId,
      error: `method-not-found:${method}`,
      from: MeshEngineOrchestrator.id(),
      ts: Date.now()
    });
    return;
  }

  try {
    const ctx = buildContext(from);
    const result = await handler(params, ctx);

    MeshEngineOrchestrator.send(from, {
      type: "mesh.rpc.response",
      callId,
      result,
      from: MeshEngineOrchestrator.id(),
      ts: Date.now()
    });
  } catch (err) {
    MeshEngineOrchestrator.send(from, {
      type: "mesh.rpc.response",
      callId,
      error: err?.message || "rpc-error",
      from: MeshEngineOrchestrator.id(),
      ts: Date.now()
    });
  }
}

// --------------------------------------
// Internal — Handling Responses
// --------------------------------------

function handleRPCResponse(from, msg) {
  const { callId, result, error } = msg;
  const entry = pendingCalls.get(callId);
  if (!entry) return;

  clearTimeout(entry.timeout);
  pendingCalls.delete(callId);

  if (error) {
    entry.reject(new Error(error));
  } else {
    entry.resolve(result);
  }
}

// --------------------------------------
// Incoming Messages
// --------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  switch (msg.type) {
    case "mesh.rpc.request":
      handleRPCRequest(from, msg);
      break;

    case "mesh.rpc.response":
      handleRPCResponse(from, msg);
      break;
  }
});

// --------------------------------------
// Peer Cleanup
// --------------------------------------

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  for (const [callId, entry] of pendingCalls.entries()) {
    // We don't track peer per call, so just timeout everything on peer leave
    clearTimeout(entry.timeout);
    entry.reject(new Error("peer-left"));
    pendingCalls.delete(callId);
  }
});

// --------------------------------------
// Capability Registration
// --------------------------------------

const LOCAL_FEATURE = "mesh.rpc";

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

export const MeshRPC = {
  register: registerRPC,
  unregister: unregisterRPC,
  call: callRPC
};
