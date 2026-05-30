// src/engines/mesh/engine.js

import { publish } from "../eventbus/engine.js";

let peers = {};
let myId = "peer-" + Math.random().toString(36).slice(2);
let messageHandlers = [];

export function getId() {
  return myId;
}

export function joinMesh(peerList = []) {
  peerList.forEach(p => {
    peers[p.id] = p;
  });

  publish("mesh.join", { id: myId, peers });
}

export function leaveMesh() {
  publish("mesh.leave", { id: myId });
  peers = {};
}

export function getPeers() {
  return peers;
}

export function onMessage(handler) {
  messageHandlers.push(handler);
}

export function receiveMessage(from, msg) {
  messageHandlers.forEach(h => {
    try {
      h(from, msg);
    } catch (err) {
      console.error("Mesh handler error:", err);
    }
  });

  publish("mesh.message", { from, msg });
}

export function broadcast(msg) {
  Object.keys(peers).forEach(peerId => {
    peers[peerId].receive(myId, msg);
  });

  publish("mesh.broadcast", { from: myId, msg });
}

export function send(peerId, msg) {
  if (!peers[peerId]) return;

  peers[peerId].receive(myId, msg);
  publish("mesh.send", { from: myId, to: peerId, msg });
}
