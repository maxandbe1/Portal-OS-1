import { loadInspectorModule } from "../modules/inspector/index.js";

// … previous imports …

// Theme → Animation → Sound → Storage → Network → Inspector → Everything else
loadThemeModule(window.Portal);
loadAnimationModule(window.Portal);
loadSoundModule(window.Portal);
loadStorageModule(window.Portal);
loadNetworkModule(window.Portal);
loadInspectorModule(window.Portal);

loadMemoryModule(window.Portal);
loadPatternModule(window.Portal);
loadBeeSimModule(window.Portal);
loadSovereigntyModule(window.Portal);
loadConsoleModule(window.Portal);
loadDashboardModule(window.Portal);
