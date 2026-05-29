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
    </div>
  );
}
