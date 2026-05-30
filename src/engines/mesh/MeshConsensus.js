// File: src/engines/mesh/MeshConsensus.js
// Phase 35 — Mesh Consensus (Quorum + Commit Protocol)

import { MeshEngineOrchestrator } from "./MeshEngineOrchestrator.js";
import { MeshPeerDiscovery } from "./MeshPeerDiscovery.js";
import { MeshCapabilities } from "./MeshCapabilities.js";

// --------------------------------------------------
// Consensus Registry
// --------------------------------------------------

/*
Consensus instance:
  {
    id: uuid,
    proposal: any,
    votes: Map(peerId -> "yes" | "no"),
    required: quorum count,
    committed: boolean,
    onCommit: fn,
    onReject: fn
  }
*/

const consensusTable = new Map();

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function quorumSize() {
  const peers = MeshPeerDiscovery.peers();
  return Math.floor(peers.length / 2) + 1;
}

function ensureConsensus(id) {
  if (!consensusTable.has(id)) {
    consensusTable.set(id, {
      id,
      proposal: null,
      votes: new Map(),
      required: quorumSize(),
      committed: false,
      onCommit: null,
      onReject: null
    });
  }
  return consensusTable.get(id);
}

function tally(consensus) {
  let yes = 0;
  let no = 0;

  for (const vote of consensus.votes.values()) {
    if (vote === "yes") yes++;
    else if (vote === "no") no++;
  }

  if (yes >= consensus.required && !consensus.committed) {
    consensus.committed = true;
    consensus.onCommit?.(consensus.proposal);
  }

  if (no >= consensus.required && !consensus.committed) {
    consensus.committed = true;
    consensus.onReject?.(consensus.proposal);
  }
}

// --------------------------------------------------
// Public API — Propose
// --------------------------------------------------

export function proposeConsensus(proposal, { onCommit, onReject } = {}) {
  const id = crypto.randomUUID();
  const from = MeshEngineOrchestrator.id();

  const consensus = ensureConsensus(id);
  consensus.proposal = proposal;
  consensus.onCommit = onCommit || (() => {});
  consensus.onReject = onReject || (() => {});

  // Vote yes locally
  consensus.votes.set(from, "yes");
  tally(consensus);

  // Broadcast proposal
  MeshEngineOrchestrator.broadcast({
    type: "mesh.consensus.propose",
    id,
    proposal,
    from,
    ts: Date.now()
  });

  return id;
}

// --------------------------------------------------
// Public API — Vote
// --------------------------------------------------

export function voteConsensus(id, vote) {
  const from = MeshEngineOrchestrator.id();

  MeshEngineOrchestrator.broadcast({
    type: "mesh.consensus.vote",
    id,
    vote,
    from,
    ts: Date.now()
  });

  const consensus = ensureConsensus(id);
  consensus.votes.set(from, vote);
  tally(consensus);
}

// --------------------------------------------------
// Incoming Messages
// --------------------------------------------------

function handleProposal(from, msg) {
  const { id, proposal } = msg;
  const consensus = ensureConsensus(id);

  // If we haven't seen it, adopt proposal
  if (!consensus.proposal) {
    consensus.proposal = proposal;
  }

  // Auto-vote yes (simple protocol)
  consensus.votes.set(MeshEngineOrchestrator.id(), "yes");
  tally(consensus);

  // Broadcast our vote
  MeshEngineOrchestrator.broadcast({
    type: "mesh.consensus.vote",
    id,
    vote: "yes",
    from: MeshEngineOrchestrator.id(),
    ts: Date.now()
  });
}

function handleVote(from, msg) {
  const { id, vote } = msg;
  const consensus = ensureConsensus(id);

  consensus.votes.set(from, vote);
  tally(consensus);
}

MeshEngineOrchestrator.onEvent((snapshot, from, msg) => {
  if (!msg || typeof msg !== "object") return;

  switch (msg.type) {
    case "mesh.consensus.propose":
      handleProposal(from, msg);
      break;

    case "mesh.consensus.vote":
      handleVote(from, msg);
      break;
  }
});

// --------------------------------------------------
// Peer Cleanup
// --------------------------------------------------

MeshPeerDiscovery.onPeerLeft?.(() => {
  // Consensus instances remain; quorum adjusts dynamically
});

// --------------------------------------------------
// Capability Registration
// --------------------------------------------------

const LOCAL_FEATURE = "mesh.consensus";

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

export const MeshConsensus = {
  propose: proposeConsensus,
  vote: voteConsensus
};
