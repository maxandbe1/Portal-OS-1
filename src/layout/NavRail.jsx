
import React from "react";

export function NavRail({ active, onSelect }) {
  const items = [
    { key: "identity", label: "Identity" },
    { key: "memory", label: "Memory" },
    { key: "pattern", label: "Pattern" },
    { key: "beesim", label: "Bee‑SIM" },
    { key: "sovereignty", label: "Sovereignty" },
    { key: "console", label: "Console" },
    { key: "dashboard", label: "Dashboard" },
    { key: "theme", label: "Theme" },
    { key: "animation", label: "Animation" },
    { key: "sound", label: "Sound" },
    { key: "storage", label: "Storage" },
    { key: "network", label: "Network" },
    { key: "inspector", label: "Inspector" },
    { key: "vfs", label: "VFS" },
    { key: "scheduler", label: "Scheduler" },
    { key: "cloud", label: "Cloud" },
    { key: "permissions", label: "Permissions" },
    { key: "eventbus", label: "Event Bus" }
  ];

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
