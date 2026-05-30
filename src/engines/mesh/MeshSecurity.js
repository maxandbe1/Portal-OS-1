// File: src/engines/mesh/MeshSecurity.js
// Author: Max & Copilot
// Phase: 23 — Mesh Security Layer (Identity, Signing, Verification)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";

// --------------------------------------
// Keypair Generation (per device)
// --------------------------------------

let keypair = null;

async function generateKeypair() {
  keypair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    true,
    ["sign", "verify"]
  );
}

export async function getPublicKey() {
  if (!keypair) await generateKeypair();
  return window.crypto.subtle.exportKey("jwk", keypair.publicKey);
}

// --------------------------------------
// Signing
// --------------------------------------

async function signPayload(payload) {
  if (!keypair) await generateKeypair();

  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));

  const signature = await window.crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" }
    },
    keypair.privateKey,
    data
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// --------------------------------------
// Verification
// --------------------------------------

async function verifySignature(publicKeyJwk, payload, signatureB64) {
  const publicKey = await window.crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    {
      name: "ECDSA",
      namedCurve: "P-256"
    },
    true,
    ["verify"]
  );

  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));

  const signatureBytes = Uint8Array.from(atob(signatureB64), (c) =>
    c.charCodeAt(0)
  );

  return window.crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" }
    },
    publicKey,
    signatureBytes,
    data
  );
}

// --------------------------------------
// Secure Envelope
// --------------------------------------

export async function secureSend(peerId, msg) {
  const envelope = {
    type: "mesh.secure.envelope",
    from: MeshEngineOrchestrator.id(),
    pub: await getPublicKey(),
    payload: msg,
    ts: Date.now()
  };

  envelope.sig = await signPayload({
    from: envelope.from,
    payload: envelope.payload,
    ts: envelope.ts
  });

  MeshEngineOrchestrator.send(peerId, envelope);
}

export async function secureBroadcast(msg) {
  const envelope = {
    type: "mesh.secure.envelope",
    from: MeshEngineOrchestrator.id(),
    pub: await getPublicKey(),
    payload: msg,
    ts: Date.now()
  };

  envelope.sig = await signPayload({
    from: envelope.from,
    payload: envelope.payload,
    ts: envelope.ts
  });

  MeshEngineOrchestrator.broadcast(envelope);
}

// --------------------------------------
// Incoming Secure Messages
// --------------------------------------

const secureHandlers = new Set();

export function onSecureMessage(handler) {
  secureHandlers.add(handler);
  return () => secureHandlers.delete(handler);
}

MeshEngineOrchestrator.onEvent(async (snapshot, from, msg) => {
  if (!msg || msg.type !== "mesh.secure.envelope") return;

  const { pub, payload, sig, ts } = msg;

  // anti-replay
  if (Date.now() - ts > 15000) {
    console.warn("[MeshSecurity] Dropped stale message.");
    return;
  }

  // verify signature
  const valid = await verifySignature(pub, { from, payload, ts }, sig);

  if (!valid) {
    console.error("[MeshSecurity] Invalid signature from peer:", from);
    return;
  }

  // deliver to handlers
  secureHandlers.forEach((fn) => {
    try {
      fn(snapshot, from, payload);
    } catch (err) {
      console.error("[MeshSecurity] handler error:", err);
    }
  });
});

// --------------------------------------
// Export
// --------------------------------------

export const MeshSecurity = {
  secureSend,
  secureBroadcast,
  onSecureMessage,
  getPublicKey
};
