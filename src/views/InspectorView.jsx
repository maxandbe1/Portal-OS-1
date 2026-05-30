import React from "react";

export default function InspectorView() {
  return (
    <div className="module-root">
      <h1>Inspector</h1>
      <p className="module-subtitle">System introspection and state viewer.</p>

      <pre style={{ maxHeight: 300, overflow: "auto" }}>
        {JSON.stringify(window.Portal, null, 2)}
      </pre>
    </div>
  );
}
