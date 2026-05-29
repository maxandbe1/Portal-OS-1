import React from "react";
import IdentityView from "../views/IdentityView.jsx";

export default function Viewport({ active }) {
  if (active === "identity") {
    return <IdentityView />;
  }

  return (
    <div className="module-root">
      <h1>Portal OS</h1>
      <p className="module-subtitle">Select a module from the left.</p>
    </div>
  );
}
