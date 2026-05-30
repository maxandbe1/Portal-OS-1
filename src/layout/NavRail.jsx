import React from "react";

export function NavRail({ active, onSelect }) {
  return (
    <div className="nav-rail">
      <button
        className={active === "identity" ? "active" : ""}
        onClick={() => onSelect("identity")}
      >
        Identity
      </button>

      <button
        className={active === "memory" ? "active" : ""}
        onClick={() => onSelect("memory")}
      >
        Memory
      </button>

      <button
        className={active === "pattern" ? "active" : ""}
        onClick={() => onSelect("pattern")}
      >
        Pattern
      </button>

      <button
        className={active === "beesim" ? "active" : ""}
        onClick={() => onSelect("beesim")}
      >
        Bee‑SIM
      </button>

      <button
        className={active === "sovereignty" ? "active" : ""}
        onClick={() => onSelect("sovereignty")}
      >
        Sovereignty
      </button>

      <button
        className={active === "console" ? "active" : ""}
        onClick={() => onSelect("console")}
      >
        Console
      </button>

      <button
        className={active === "dashboard" ? "active" : ""}
        onClick={() => onSelect("dashboard")}
      >
        Dashboard
      </button>

      <button
        className={active === "theme" ? "active" : ""}
        onClick={() => onSelect("theme")}
      >
        Theme
      </button>

      <button
        className={active === "animation" ? "active" : ""}
        onClick={() => onSelect("animation")}
      >
        Animation
      </button>

      <button
        className={active === "sound" ? "active" : ""}
        onClick={() => onSelect("sound")}
      >
        Sound
      </button>

      <button
        className={active === "storage" ? "active" : ""}
        onClick={() => onSelect("storage")}
      >
        Storage
      </button>

      <button
        className={active === "network" ? "active" : ""}
        onClick={() => onSelect("network")}
      >
        Network
      </button>
    </div>
  );
}
