// -------------------------------------------------------------
// Portal OS — Mesh Engine State Machine
// File: src/engines/mesh/MeshEngineStateMachine.js
// Author: Max & Copilot
// Phase: 17 — Mesh Engine Core Runtime
// -------------------------------------------------------------

export class MeshEngineStateMachine {
  constructor() {
    this.state = {
      running: false,
      paused: false,
      frame: 0,
      lastDelta: 0,
      lastUpdate: performance.now(),
    };
  }

  // -------------------------------------------------------------
  // State Mutations
  // -------------------------------------------------------------
  setRunning(flag) {
    this.state.running = !!flag;
    if (flag) {
      this.state.paused = false;
      this.state.lastUpdate = performance.now();
    }
  }

  setPaused(flag) {
    if (!this.state.running) return;
    this.state.paused = !!flag;
  }

  setDelta(delta) {
    this.state.lastDelta = delta;
  }

  incrementFrame() {
    this.state.frame++;
  }

  // -------------------------------------------------------------
  // State Queries
  // -------------------------------------------------------------
  isRunning() {
    return this.state.running === true;
  }

  isPaused() {
    return this.state.paused === true;
  }

  getFrame() {
    return this.state.frame;
  }

  getDelta() {
    return this.state.lastDelta;
  }

  // -------------------------------------------------------------
  // Snapshot (immutable copy)
  // -------------------------------------------------------------
  getSnapshot() {
    return {
      running: this.state.running,
      paused: this.state.paused,
      frame: this.state.frame,
      lastDelta: this.state.lastDelta,
      lastUpdate: this.state.lastUpdate,
    };
  }
}
