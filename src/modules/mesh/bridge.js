import * as Engine from "./engine.js";

export function loadMeshModule() {
  const state = Engine.load();

  window.Portal.modules.mesh = {
    id: "mesh",
    name: "Mesh Network",
    state,
    join: Engine.joinMesh,
    leave: Engine.leaveMesh,
    broadcast: Engine.broadcast,
    send: Engine.send,
    onMessage: Engine.onMessage,
    peers: Engine.getPeers,
    getId: Engine.getId
  };

  return state;
}
