import { loadThemeModule } from "../modules/theme/index.js";
import { loadAnimationModule } from "../modules/animation/index.js";
import { loadSoundModule } from "../modules/sound/index.js";

import { loadMemoryModule } from "../modules/memory/index.js";
import { loadPatternModule } from "../modules/pattern/index.js";
import { loadBeeSimModule } from "../modules/beesim/index.js";
import { loadSovereigntyModule } from "../modules/sovereignty/index.js";
import { loadConsoleModule } from "../modules/console/index.js";
import { loadDashboardModule } from "../modules/dashboard/index.js";

if (!window.Portal) window.Portal = {};
if (!window.Portal.modules) window.Portal.modules = {};
if (!window.Portal.registry) window.Portal.registry = {};

window.Portal.registry.identity = {
  key: "identity",
  label: "Identity"
};

// Theme → Animation → Sound → Everything else
loadThemeModule(window.Portal);
loadAnimationModule(window.Portal);
loadSoundModule(window.Portal);

loadMemoryModule(window.Portal);
loadPatternModule(window.Portal);
loadBeeSimModule(window.Portal);
loadSovereigntyModule(window.Portal);
loadConsoleModule(window.Portal);
loadDashboardModule(window.Portal);
