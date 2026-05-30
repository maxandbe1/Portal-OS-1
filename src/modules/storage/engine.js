export function storageSet(key, value, ttl = null) {
  window.Portal?.modules?.storage?.set(key, value, ttl);
}

export function storageGet(key) {
  return window.Portal?.modules?.storage?.get(key) || null;
}

export function storageRemove(key) {
  window.Portal?.modules?.storage?.remove(key);
}

export function getStorageState() {
  return window.Portal?.modules?.storage?.getState() || {};
}
