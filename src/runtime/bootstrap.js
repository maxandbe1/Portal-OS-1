import { loadMemoryModule } from "../modules/memory/index.js";
import { loadPatternModule } from "../modules/pattern/index.js";
import { loadBeeSimModule } from "../modules/beesim/index.js";
import { loadSovereigntyModule } from "../modules/sovereignty/index.js";

if (!window.Portal) window.Portal = {};
if (!window.Portal.modules) window.Portal.modules = {};
if (!window.Portal.registry) window.Portal.registry = {};

window.Portal.registry.identity = {
  key: "identity",
  label: "Identity"
};

// Load modules
loadMemoryModule(window.Portal);
loadPatternModule(window.Portal);
loadBeeSimModule(window.Portal);
loadSovereigntyModule(window.Portal);
