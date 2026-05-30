
import React from "react";

const items = [
  { key: "identity", label: "Identity" },
  { key: "memory", label: "Memory" },
  { key: "beesim", label: "Bee‑SIM" },
  { key: "pattern", label: "Pattern" },
  { key: "dashboard", label: "Dashboard" },
  { key: "mesh", label: "Mesh" },
  { key: "cloud", label: "Cloud" },
  { key: "vfs", label: "VFS" },
  { key: "storage", label: "Storage" },
  { key: "inspector", label: "Inspector" }
];

export function NavRail({ active, onSelect }) {
  return (
    <div className="nav-rail">
      {items.map((item) => (
        <div
          key={item.key}
          className={`nav-item ${active === item.key ? "active" : ""}`}
          onClick={() => onSelect(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
