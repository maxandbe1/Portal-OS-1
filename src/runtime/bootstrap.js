// File: src/runtime/bootstrap.js
// Portal‑OS Phase‑17 Runtime Bootstrap

import { loadIdentityModule } from "../modules/identity/bridge.js";
import { loadMemoryModule } from "../modules/memory/bridge.js";
import { loadPatternModule } from "../modules/pattern/bridge.js";
import { loadBeeSimModule } from "../modules/beesim/bridge.js";
import { loadSovereigntyModule } from "../modules/sovereignty/bridge.js";
import { loadConsoleModule } from "../modules/console/bridge.js";
import { loadDashboardModule } from "../modules/dashboard/bridge.js";
import { loadThemeModule } from "../modules/theme/bridge.js";
import { loadAnimationModule } from "../modules/animation/bridge.js";
import { loadSoundModule } from "../modules/sound/bridge.js";
import { loadStorageModule } from "../modules/storage/bridge.js";
import { loadNetworkModule } from "../modules/network/bridge.js";
import { loadInspectorModule } from "../modules/inspector/bridge.js";
import { loadVFSModule } from "../modules/vfs/bridge.js";
import { loadSchedulerModule } from "../modules/scheduler/bridge.js";
import { loadCloudModule } from "../modules/cloud/bridge.js";
import { loadPermissionsModule } from "../modules/permissions/bridge.js";
import { loadEventBusModule } from "../modules/eventbus/bridge.js";
import { loadMeshModule } from "../modules/mesh/bridge.js";

if (!window.Portal) window.Portal = {};
if (!window.Portal.modules) window.Portal.modules = {};
if (!window.Portal.registry) window.Portal.registry = {};

export function bootstrapPortal() {
  console.log("%cPortal Runtime Booting…", "color:#0ff;font-weight:bold;");

  loadIdentityModule();
  loadMemoryModule();
  loadPatternModule();
  loadBeeSimModule();
  loadSovereigntyModule();
  loadConsoleModule();
  loadDashboardModule();
  loadThemeModule();
  loadAnimationModule();
  loadSoundModule();
  loadStorageModule();
  loadNetworkModule();
  loadInspectorModule();
  loadVFSModule();
  loadSchedulerModule();
  loadCloudModule();
  loadPermissionsModule();
  loadEventBusModule();
  loadMeshModule();

  console.log("%cPortal Runtime Ready", "color:#0f0;font-weight:bold;");
}

