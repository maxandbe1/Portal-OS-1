// src/engines/memory/engine.js

let memoryState = {
  entries: [],
  count: 0
};

export function getMemoryState() {
  return memoryState;
}

export function addMemoryEntry(text) {
  const entry = {
    id: Date.now(),
    text,
    createdAt: Date.now()
  };

  memoryState = {
    ...memoryState,
    entries: [...memoryState.entries, entry],
    count: memoryState.count + 1
  };

  return memoryState;
}

export function clearMemory() {
  memoryState = {
    entries: [],
    count: 0
  };

  return memoryState;
}
