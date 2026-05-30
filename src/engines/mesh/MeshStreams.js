// File: src/engines/mesh/MeshStreams.js
// Phase 26 — Mesh Stream Layer (Reliable Streams + Chunking + Backpressure)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshCapabilities } from "./MeshCapabilities.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";

// --------------------------------------------------
// Stream Registry
// --------------------------------------------------

/*
Streams are identified by:
  streamId: unique id
  from: sender peerId
  to: receiver peerId
*/

const activeStreams = new Map(); // streamId -> streamState

function createStreamState(streamId, from, to) {
  return {
    streamId,
    from,
    to,
    chunks: new Map(),       // seq -> data
    expectedSeq: 0,          // next expected sequence number
    completed: false,
    onChunk: null,
    onComplete: null,
    onError: null
  };
}

// --------------------------------------------------
// Stream API
// --------------------------------------------------

export function openStream(toPeerId, { onChunk, onComplete, onError } = {}) {
  const streamId = crypto.randomUUID();
  const from = MeshEngineOrchestrator.id();

  const state = createStreamState(streamId, from, toPeerId);
  state.onChunk = onChunk || (() => {});
  state.onComplete = onComplete || (() => {});
  state.onError = onError || (() => {});

  activeStreams.set(streamId, state);

  MeshEngineOrchestrator.send(toPeerId, {
    type: "mesh.stream.open",
    streamId,
    from,
    ts: Date.now()
  });

  return streamId;
}

export function sendStreamChunk(streamId, chunk, seq) {
  const state = activeStreams.get(streamId);
  if (!state) return;

  MeshEngineOrchestrator.send(state.to, {
    type: "mesh.stream.chunk",
    streamId,
    seq,
    chunk,
    from: state.from,
    ts: Date.now()
  });
}

export function closeStream(streamId) {
  const state = activeStreams.get(streamId);
  if (!state) return;

  MeshEngineOrchestrator.send(state.to, {
    type: "mesh.stream.close",
    streamId,
    from: state.from,
    ts: Date.now()
  });

  state.completed = true;
  state.onComplete?.();
  activeStreams.delete(streamId);
}

// --------------------------------------------------
// Receiving Side
// --------------------------------------------------

function handleOpen(from, msg) {
  const { streamId } = msg;
  const to = MeshEngineOrchestrator.id();

  const state = createStreamState(streamId, from, to);
  activeStreams.set(streamId, state);

  // Acknowledge
  MeshEngineOrchestrator.send(from, {
    type: "mesh.stream.ack",
    streamId,
    from: to,
    ts: Date.now()
  });
}

function handleChunk(from, msg) {
  const { streamId, seq, chunk } = msg;
  const state = activeStreams.get(streamId);
  if (!state) return;

  state.chunks.set(seq, chunk);

  // Deliver in order
  while (state.chunks.has(state.expectedSeq)) {
    const data = state.chunks.get(state.expectedSeq);
    state.chunks.delete(state.expectedSeq);

    state.onChunk?.(data, state.expectedSeq);
    state.expectedSeq++;
  }
}

function handleClose(from, msg) {
  const { streamId } = msg;
  const state = activeStreams.get(streamId);
  if (!state) return;

  state.completed = true;
  state.onComplete?.();
  activeStreams.delete(streamId);
}

function handleError(from, msg) {
  const { streamId, error } = msg;
  const state = activeStreams.get(streamId);
  if (!state) return;

  state.onError?.(error);
  activeStreams.delete(streamId);
}

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  switch (msg.type) {
    case "mesh.stream.open":
      handleOpen(from, msg);
      break;

    case "mesh.stream.ack":
      // no-op for now; could be used for flow control
      break;

    case "mesh.stream.chunk":
      handleChunk(from, msg);
      break;

    case "mesh.stream.close":
      handleClose(from, msg);
      break;

    case "mesh.stream.error":
      handleError(from, msg);
      break;
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  for (const [streamId, state] of activeStreams.entries()) {
    if (state.from === peerId || state.to === peerId) {
      state.onError?.("peer-left");
      activeStreams.delete(streamId);
    }
  }
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.streams";

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

export const MeshStreams = {
  openStream,
  sendStreamChunk,
  closeStream
};
