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
    </div>
  );
}
