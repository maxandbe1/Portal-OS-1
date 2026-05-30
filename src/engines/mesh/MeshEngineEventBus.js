// -------------------------------------------------------------
// Portal OS — Mesh Engine Event Bus
// File: src/engines/mesh/MeshEngineEventBus.js
// Author: Max & Copilot
// Phase: 17 — Mesh Engine Core Runtime
// -------------------------------------------------------------

export class MeshEngineEventBus {
  constructor(config = {}) {
    this.handlers = new Map();          // event -> Set<fn>
    this.wildcardHandlers = new Map();  // namespace -> Set<fn>
    this.replayBuffer = [];
    this.replayLimit = config.replayLimit ?? 100;
    this.debug = config.debug ?? false;

    if (this.debug) {
      console.log("[MeshEventBus] Initialized");
    }
  }

  // -------------------------------------------------------------
  // Subscribe
  // -------------------------------------------------------------
  on(event, handler) {
    if (!event || typeof handler !== "function") return;

    // Wildcard subscription: "mesh:*"
    if (event.endsWith("*")) {
      const ns = event.replace("*", "");
      if (!this.wildcardHandlers.has(ns)) {
        this.wildcardHandlers.set(ns, new Set());
      }
      this.wildcardHandlers.get(ns).add(handler);

      return () => this.off(event, handler);
    }

    // Direct subscription
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);

    return () => this.off(event, handler);
  }

  // -------------------------------------------------------------
  // Unsubscribe
  // -------------------------------------------------------------
  off(event, handler) {
    if (!event || typeof handler !== "function") return;

    if (event.endsWith("*")) {
      const ns = event.replace("*", "");
      if (this.wildcardHandlers.has(ns)) {
        this.wildcardHandlers.get(ns).delete(handler);
      }
      return;
    }

    if (this.handlers.has(event)) {
      this.handlers.get(event).delete(handler);
    }
  }

  // -------------------------------------------------------------
  // Emit
  // -------------------------------------------------------------
  emit(event, payload = {}) {
    if (!event) return;

    const packet = {
      event,
      payload,
      timestamp: performance.now(),
    };

    // Store in replay buffer
    this.replayBuffer.push(packet);
    if (this.replayBuffer.length > this.replayLimit) {
      this.replayBuffer.shift();
    }

    // Direct handlers
    if (this.handlers.has(event)) {
      for (const handler of this.handlers.get(event)) {
        try {
          handler(payload, packet);
        } catch (err) {
          console.error(`[MeshEventBus] Handler error for ${event}`, err);
        }
      }
    }

    // Wildcard handlers
    for (const [ns, set] of this.wildcardHandlers.entries()) {
      if (event.startsWith(ns)) {
        for (const handler of set) {
          try {
            handler(payload, packet);
          } catch (err) {
            console.error(`[MeshEventBus] Wildcard handler error for ${event}`, err);
          }
        }
      }
    }

    if (this.debug) {
      console.log(`[MeshEventBus] ${event}`, payload);
    }
  }

  // -------------------------------------------------------------
  // Replay last N events
  // -------------------------------------------------------------
  getReplay() {
    return [...this.replayBuffer];
  }

  // -------------------------------------------------------------
  // Introspection
  // -------------------------------------------------------------
  getSubscriptions() {
    return {
      direct: [...this.handlers.entries()].map(([event, set]) => ({
        event,
        count: set.size,
      })),
      wildcard: [...this.wildcardHandlers.entries()].map(([ns, set]) => ({
        namespace: ns,
        count: set.size,
      })),
    };
  }
}
