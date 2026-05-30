// src/engines/storage/engine.js

const STORAGE_PREFIX = "portal_os_v1_";

export function save(key, value) {
  try {
    const payload = JSON.stringify({
      ts: Date.now(),
      value
    });
    localStorage.setItem(STORAGE_PREFIX + key, payload);
    return true;
  } catch (err) {
    console.error("Storage save error:", err);
    return false;
  }
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    return parsed.value;
  } catch (err) {
    console.error("Storage load error:", err);
    return fallback;
  }
}

export function clear(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function keys() {
  return Object.keys(localStorage)
    .filter(k => k.startsWith(STORAGE_PREFIX))
    .map(k => k.replace(STORAGE_PREFIX, ""));
}
