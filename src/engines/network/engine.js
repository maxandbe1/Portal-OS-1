import React from "react";

import IdentityView from "../views/IdentityView.jsx";
import MemoryView from "../views/MemoryView.jsx";
import PatternView from "../views/PatternView.jsx";
import BeeSimView from "../views/BeeSimView.jsx";
import SovereigntyView from "../views/SovereigntyView.jsx";
import ConsoleView from "../views/ConsoleView.jsx";
import DashboardView from "../views/DashboardView.jsx";
import ThemeView from "../views/ThemeView.jsx";
import AnimationView from "../views/AnimationView.jsx";
import SoundView from "../views/SoundView.jsx";
import StorageView from "../views/StorageView.jsx";

export default function Viewport({ active }) {
  if (active === "identity") return <IdentityView />;
  if (active === "memory") return <MemoryView />;
  if (active === "pattern") return <PatternView />;
  if (active === "beesim") return <BeeSimView />;
  if (active === "sovereignty") return <SovereigntyView />;
  if (active === "console") return <ConsoleView />;
  if (active === "dashboard") return <DashboardView />;
  if (active === "theme") return <ThemeView />;
  if (active === "animation") return <AnimationView />;
  if (active === "sound") return <SoundView />;
  if (active === "storage") return <StorageView />;

  return (
    <div className="module-root">
      <h1>Portal OS</h1>
      <p className="module-subtitle">Select a module from the left.</p>
    </div>
  );
}
