// File: src/runtime/moduleLoader.js
// Portal OS — Module Loader (Vite-safe, src/modules-based)

// Static import map so Vite can see all module paths at build time.
// Adjust keys to match your module names in the UI/router.

const moduleMap = {
  theme: () => import("../modules/theme/engine.js"),
  sound: () => import("../modules/sound/engine.js"),
  pattern: () => import("../modules/pattern/engine.js"),
  memory: () => import("../modules/memory/engine.js"),
  console: () => import("../modules/console/engine.js"),
  // Add more modules here as you create them:
  // beesim: () => import("../modules/beesim/engine.js"),
};

// Public API: load a module by name
export async function loadModule(name) {
  const loader = moduleMap[name];
  if (!loader) {
    throw new Error(`Unknown module: ${name}`);
  }
  return loader();
}
