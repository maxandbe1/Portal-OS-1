// src/engines/vfs/engine.js

import { save, load } from "../storage/engine.js";

const VFS_KEY = "vfs_root";

let fs = load(VFS_KEY, {
  type: "dir",
  name: "/",
  children: {}
});

function persist() {
  save(VFS_KEY, fs);
}

export function list(path = "/") {
  const node = resolve(path);
  if (!node || node.type !== "dir") return null;
  return Object.values(node.children);
}

export function read(path) {
  const node = resolve(path);
  if (!node || node.type !== "file") return null;
  return node.content;
}

export function write(path, content) {
  const parts = path.split("/").filter(Boolean);
  const fileName = parts.pop();
  let dir = fs;

  for (const p of parts) {
    if (!dir.children[p]) {
      dir.children[p] = { type: "dir", name: p, children: {} };
    }
    dir = dir.children[p];
  }

  dir.children[fileName] = {
    type: "file",
    name: fileName,
    content,
    ts: Date.now()
  };

  persist();
}

export function remove(path) {
  const parts = path.split("/").filter(Boolean);
  const fileName = parts.pop();
  let dir = fs;

  for (const p of parts) {
    if (!dir.children[p]) return;
    dir = dir.children[p];
  }

  delete dir.children[fileName];
  persist();
}

export function resolve(path) {
  if (path === "/") return fs;

  const parts = path.split("/").filter(Boolean);
  let node = fs;

  for (const p of parts) {
    if (!node.children[p]) return null;
    node = node.children[p];
  }

  return node;
}

export function getFS() {
  return fs;
}
