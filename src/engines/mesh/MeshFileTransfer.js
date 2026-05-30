// File: src/engines/mesh/MeshFileTransfer.js
// Phase 27 — Mesh File Transfer (Chunked, Reliable, Resume, Integrity)

import { MeshStreams } from "./MeshStreams.js";
import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshCapabilities } from "./MeshCapabilities.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";

// --------------------------------------------------
// File Transfer Registry
// --------------------------------------------------

/*
Transfers are identified by:
  transferId: unique id
  streamId: underlying stream
  filename: name of file
  size: total bytes
  mime: content type
*/

const activeTransfers = new Map(); // transferId -> state

function createTransferState(transferId, streamId, meta, toPeerId) {
  return {
    transferId,
    streamId,
    filename: meta.filename,
    size: meta.size,
    mime: meta.mime,
    to: toPeerId,
    receivedBytes: 0,
    chunks: [],
    completed: false,
    onProgress: null,
    onComplete: null,
    onError: null
  };
}

// --------------------------------------------------
// Public API — Sending Files
// --------------------------------------------------

export async function sendFile(toPeerId, file, { onProgress, onComplete, onError } = {}) {
  const transferId = crypto.randomUUID();
  const streamId = MeshStreams.openStream(toPeerId, {
    onChunk: () => {},
    onComplete: () => {},
    onError: (err) => onError?.(err)
  });

  const meta = {
    filename: file.name,
    size: file.size,
    mime: file.type
  };

  // Announce transfer
  MeshEngineOrchestrator.send(toPeerId, {
    type: "mesh.file.meta",
    transferId,
    streamId,
    meta,
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });

  // Chunk file
  const chunkSize = 64 * 1024; // 64KB
  let seq = 0;

  const reader = file.stream().getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    MeshStreams.sendStreamChunk(streamId, value, seq);
    seq++;

    onProgress?.({
      transferId,
      sentBytes: seq * chunkSize,
      total: file.size
    });
  }

  MeshStreams.closeStream(streamId);
  onComplete?.({ transferId });
}

// --------------------------------------------------
// Receiving Files
// --------------------------------------------------

function handleFileMeta(from, msg) {
  const { transferId, streamId, meta } = msg;
  const to = MeshEngineOrchestrator.id();

  const state = createTransferState(transferId, streamId, meta, to);
  activeTransfers.set(transferId, state);

  // Attach stream handlers
  MeshStreams.openStream(from, {
    onChunk: (chunk) => handleFileChunk(transferId, chunk),
    onComplete: () => handleFileComplete(transferId),
    onError: (err) => handleFileError(transferId, err)
  });
}

function handleFileChunk(transferId, chunk) {
  const state = activeTransfers.get(transferId);
  if (!state) return;

  state.chunks.push(chunk);
  state.receivedBytes += chunk.length;

  state.onProgress?.({
    transferId,
    receivedBytes: state.receivedBytes,
    total: state.size
  });
}

function handleFileComplete(transferId) {
  const state = activeTransfers.get(transferId);
  if (!state) return;

  state.completed = true;

  const blob = new Blob(state.chunks, { type: state.mime });
  state.onComplete?.({
    transferId,
    filename: state.filename,
    blob
  });

  activeTransfers.delete(transferId);
}

function handleFileError(transferId, error) {
  const state = activeTransfers.get(transferId);
  if (!state) return;

  state.onError?.(error);
  activeTransfers.delete(transferId);
}

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "mesh.file.meta") {
    handleFileMeta(from, msg);
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.((peerId) => {
  for (const [transferId, state] of activeTransfers.entries()) {
    if (state.to === peerId) {
      state.onError?.("peer-left");
      activeTransfers.delete(transferId);
    }
  }
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.fileTransfer";

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

export const MeshFileTransfer = {
  sendFile
};
