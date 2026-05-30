import React, { useState } from "react";

export default function NetworkView() {
  const net = window.Portal.modules.network;

  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [output, setOutput] = useState("");

  async function runGet() {
    const res = await net.get(url);
    setOutput(JSON.stringify(res, null, 2));
  }

  async function runPost() {
    const res = await net.post(url, { hello: "world" });
    setOutput(JSON.stringify(res, null, 2));
  }

  return (
    <div className="module-root">
      <h1>Network Engine</h1>
      <p className="module-subtitle">Communication layer for Portal‑OS.</p>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <button onClick={runGet}>GET</button>
      <button onClick={runPost}>POST</button>

      <pre style={{ marginTop: 20 }}>{output}</pre>
    </div>
  );
}
