import React, { useState } from "react";
import { NavRail } from "./NavRail.jsx";
import Viewport from "./Viewport.jsx";

export function PortalShell() {
  const [active, setActive] = useState("identity");

  return (
    <div className="portal-shell">
      <NavRail active={active} onSelect={setActive} />
      <Viewport active={active} />
    </div>
  );
}
