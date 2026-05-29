import React from "react";
import IdentityView from "../views/IdentityView.jsx";
import MemoryView from "../views/MemoryView.jsx";

export default function Viewport({ active }) {
  if (active === "identity") return <IdentityView />;
  if (active === "memory") return <MemoryView />;

  return (
    <div className="module-root">
      <h1>Portal OS</h1>
      <p className="module-subtitle">Select a module from the left.</p>
    </div>
  );
}
