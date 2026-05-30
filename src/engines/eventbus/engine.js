// src/engines/eventbus/engine.js

let nextId = 1;
const listeners = {}; // { topic: [ { id, handler } ] }

export function subscribe(topic, handler) {
  if (!listeners[topic]) listeners[topic] = [];

  const id = nextId++;
  listeners[topic].push({ id, handler });

  return id;
}

export function unsubscribe(id) {
  for (const topic in listeners) {
    listeners[topic] = listeners[topic].filter(l => l.id !== id);
  }
}

export function publish(topic, payload) {
  // Exact topic listeners
  if (listeners[topic]) {
    listeners[topic].forEach(l => {
      try {
        l.handler(payload, topic);
      } catch (err) {
        console.error("EventBus handler error:", err);
      }
    });
  }

  // Wildcard listeners: e.g. topic = "vfs.write", wildcard = "vfs.*"
  const parts = topic.split(".");
  for (let i = parts.length; i >= 1; i--) {
    const wildcard = parts.slice(0, i).join(".") + ".*";
    if (listeners[wildcard]) {
      listeners[wildcard].forEach(l => {
        try {
          l.handler(payload, topic);
        } catch (err) {
          console.error("EventBus wildcard handler error:", err);
        }
      });
    }
  }
}

export function getListeners() {
  return listeners;
}
