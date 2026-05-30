import React from "react";

const MODULES = [
  { id: "identity", label: "Identity" },
  { id: "memory", label: "Memory" },
  { id: "pattern", label: "Pattern" },
  { id: "beesim", label: "BeeSim" },
  { id: "sovereignty", label: "Sovereignty" },
  { id: "console", label: "Console" },
  { id: "dashboard", label: "Dashboard" },
  { id: "theme", label: "Theme" },
  { id: "animation", label: "Animation" },
  { id: "sound", label: "Sound" },
  { id: "storage", label: "Storage" },
  { id: "network", label: "Network" },
  { id: "inspector", label: "Inspector" },
  { id: "vfs", label: "VFS" },
  { id: "scheduler", label: "Scheduler" },
  { id: "cloud", label: "Cloud" },
  { id: "permissions", label: "Permissions" },
  { id: "eventbus", label: "EventBus" }
];

export function NavRail({ active, onSelect }) {
  return (
    <div className="nav-rail">
      {MODULES.map((m) => (
        <button
          key={m.id}
          className={m.id === active ? "active" : ""}
          onClick={() => onSelect(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

