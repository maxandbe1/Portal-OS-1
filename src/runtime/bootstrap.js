import { loadCloudModule } from "../modules/cloud/index.js";

// Theme → Animation → Sound → Storage → Network → Inspector → VFS → Scheduler → Cloud → Everything else
loadThemeModule(window.Portal);
loadAnimationModule(window.Portal);
loadSoundModule(window.Portal);
loadStorageModule(window.Portal);
loadNetworkModule(window.Portal);
loadInspectorModule(window.Portal);
loadVFSModule(window.Portal);
loadSchedulerModule(window.Portal);
loadCloudModule(window.Portal);

loadMemoryModule(window.Portal);
loadPatternModule(window.Portal);
loadBeeSimModule(window.Portal);
loadSovereigntyModule(window.Portal);
loadConsoleModule(window.Portal);
loadDashboardModule(window.Portal);
