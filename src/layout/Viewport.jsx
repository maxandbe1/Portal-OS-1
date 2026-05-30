import React from "react";
import IdentityView from "../views/IdentityView.jsx";
import MemoryView from "../views/MemoryView.jsx";
import PatternView from "../views/PatternView.jsx";
import BeeSimView from "../views/BeeSimView.jsx";
import SovereigntyView from "../views/SovereigntyView.jsx";

export default function Viewport({ active }) {
  if (active === "identity") return <IdentityView />;
  if (active === "memory") return <MemoryView />;
  if (active === "pattern") return <PatternView />;
  if (active === "beesim") return <BeeSimView />;
  if (active === "sovereignty") return <SovereigntyView />;

  return (
    <div className="module-root">
      <h1>Portal OS</h1>
      <p className="module-subtitle">Select a module from the left.</p>
    </div>
  );
}
