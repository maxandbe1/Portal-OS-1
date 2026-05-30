// src/engines/cloud/engine.js

import { get, post } from "../network/engine.js";
import { write, resolve } from "../vfs/engine.js";

const CLOUD_ENDPOINT = "https://example.com/portal-sync"; 
// Replace with your real endpoint

export async function pull() {
  const res = await get(CLOUD_ENDPOINT + "/pull");

  if (!res.ok) {
    return { ok: false, error: res.error || "Pull failed" };
  }

  const files = res.data?.files || {};

  // Write remote files into /cloud
  Object.entries(files).forEach(([path, content]) => {
    write("/cloud/" + path, content);
  });

  return { ok: true, files };
}

export async function push() {
  const cloudRoot = resolve("/cloud");
  if (!cloudRoot || cloudRoot.type !== "dir") {
    return { ok: false, error: "No /cloud mount" };
  }

  const payload = {};

  function walk(node, prefix = "") {
    if (node.type === "file") {
      payload[prefix] = node.content;
    } else if (node.type === "dir") {
      Object.values(node.children).forEach(child => {
        walk(child, prefix + "/" + child.name);
      });
    }
  }

  walk(cloudRoot, "");

  const res = await post(CLOUD_ENDPOINT + "/push", { files: payload });

  if (!res.ok) {
    return { ok: false, error: res.error || "Push failed" };
  }

  return { ok: true };
}

export function mountCloud() {
  // Ensure /cloud exists
  const root = resolve("/");
  if (!root.children["cloud"]) {
    root.children["cloud"] = {
      type: "dir",
      name: "cloud",
      children: {}
    };
  }
}
