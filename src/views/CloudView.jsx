import React, { useState } from "react";

export default function CloudView() {
  const cloud = window.Portal.modules.cloud;
  const scheduler = window.Portal.modules.scheduler;

  const [log, setLog] = useState([]);

  function append(msg) {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  async function doPull() {
    append("Pulling...");
    const res = await cloud.pull();
    append("Pull result: " + JSON.stringify(res));
  }

  async function doPush() {
    append("Pushing...");
    const res = await cloud.push();
    append("Push result: " + JSON.stringify(res));
  }

  function autoSync() {
    scheduler.schedule(async () => {
      append("Auto‑sync tick");
      await cloud.push();
      await cloud.pull();
    }, 0, 5000);

    append("Auto‑sync enabled (5s interval)");
  }

  return (
    <div className="module-root">
      <h1>Cloud Sync</h1>
      <p className="module-subtitle">Distributed state + VFS sync layer.</p>

      <button onClick={doPull}>Pull</button>
      <button onClick={doPush}>Push</button>
      <button onClick={autoSync}>Enable Auto‑Sync</button>

      <h3 style={{ marginTop: 20 }}>Log</h3>
      <pre style={{ maxHeight: 200, overflow: "auto" }}>
        {log.join("\n")}
      </pre>
    </div>
  );
}
