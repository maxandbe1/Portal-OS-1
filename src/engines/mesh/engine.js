// -------------------------------------------------------------
// Portal OS — Mesh Engine
// File: src/engines/mesh/engine.js
// Author: Max & Copilot
// Phase: 17 — Mesh Engine Core Runtime
// -------------------------------------------------------------

import { MeshEngineEventBus } from "./MeshEngineEventBus.js";
import { MeshEngineStateMachine } from "./MeshEngineStateMachine.js";
import { createMeshCore } from "./MeshEngineCore.js";

// -------------------------------------------------------------
// MeshEngine
// -------------------------------------------------------------
export class MeshEngine {
  constructor(config = {}) {
    this.config = {
      tickRate: config.tickRate ?? 60,
      debug: config.debug ?? false,
      ...config,
    };

    this.eventBus = new MeshEngineEventBus();
    this.state = new MeshEngineStateMachine();
    this.core = createMeshCore(this.eventBus, this.state, this.config);

    this._tickHandle = null;
    this._lastTick = performance.now();

    if (this.config.debug) {
      console.log("[MeshEngine] Initialized", this.config);
    }
  }

  // -------------------------------------------------------------
  // Start Engine
  // -------------------------------------------------------------
  start() {
    if (this.state.isRunning()) return;

    this.state.setRunning(true);
    this._lastTick = performance.now();
    this._tickHandle = requestAnimationFrame(this._tick.bind(this));

    this.eventBus.emit("engine:start");

    if (this.config.debug) {
      console.log("[MeshEngine] Started");
    }
  }

  // -------------------------------------------------------------
  // Stop Engine
  // -------------------------------------------------------------
  stop() {
    if (!this.state.isRunning()) return;

    this.state.setRunning(false);
    cancelAnimationFrame(this._tickHandle);
    this._tickHandle = null;

    this.eventBus.emit("engine:stop");

    if (this.config.debug) {
      console.log("[MeshEngine] Stopped");
    }
  }

  // -------------------------------------------------------------
  // Tick Loop
  // -------------------------------------------------------------
  _tick(now) {
    if (!this.state.isRunning()) return;

    const delta = now - this._lastTick;
    const step = 1000 / this.config.tickRate;

    if (delta >= step) {
      this._lastTick = now;
      this.core.update(delta);
      this.eventBus.emit("engine:tick", { delta });
    }

    this._tickHandle = requestAnimationFrame(this._tick.bind(this));
  }

  // -------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------
  on(event, handler) {
    return this.eventBus.on(event, handler);
  }

  off(event, handler) {
    return this.eventBus.off(event, handler);
  }

  emit(event, payload) {
    return this.eventBus.emit(event, payload);
  }

  getState() {
    return this.state.getSnapshot();
  }

  getCore() {
    return this.core;
  }
}

// -------------------------------------------------------------
// Factory
// -------------------------------------------------------------
export function createMeshEngine(config = {}) {
  return new MeshEngine(config);
}
