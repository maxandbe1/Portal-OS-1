import React, { useState } from "react";

export default function StorageView() {
  const storage = window.Portal.modules.storage;

  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [output, setOutput] = useState("");

  function saveValue() {
    storage.save(key, value);
    setOutput("Saved.");
  }

  function loadValue() {
    const v = storage.load(key, "(none)");
    setOutput("Loaded: " + JSON.stringify(v));
  }

  function clearValue() {
    storage.clear(key);
    setOutput("Cleared.");
  }

  return (
    <div className="module-root">
      <h1>Storage Engine</h1>
      <p className="module-subtitle">Persistent data layer.</p>

      <input
        placeholder="Key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />

      <input
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button onClick={saveValue}>Save</button>
      <button onClick={loadValue}>Load</button>
      <button onClick={clearValue}>Clear</button>

      <pre style={{ marginTop: 20 }}>{output}</pre>
    </div>
  );
}
