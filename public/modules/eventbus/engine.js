// public/modules/eventbus/engine.js

const listeners = {};

const EventBus = {
  register(channel, handler) {
    if (!listeners[channel]) listeners[channel] = new Set();
    listeners[channel].add(handler);
  },

  unregister(channel, handler) {
    if (!listeners[channel]) return;
    listeners[channel].delete(handler);
    if (listeners[channel].size === 0) delete listeners[channel];
  },

  emit(channel, payload = {}, meta = {}) {
    if (!listeners[channel]) return;
    for (const handler of listeners[channel]) {
      try {
        handler({ channel, payload, meta, ts: Date.now() });
      } catch (err) {
        console.error("[Mesh/EventBus] handler error", channel, err);
      }
    }
  },

  inspect() {
    return Object.keys(listeners);
  }
};

export default EventBus;
