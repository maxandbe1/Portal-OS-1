import { loadMemoryModule } from "../modules/memory/index.js";

if (!window.Portal) window.Portal = {};
if (!window.Portal.modules) window.Portal.modules = {};
if (!window.Portal.registry) window.Portal.registry = {};

window.Portal.registry.identity = {
  key: "identity",
  label: "Identity"
};

// Load Memory module
loadMemoryModule(window.Portal);
