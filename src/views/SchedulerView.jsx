import React, { useState } from "react";

export default function SchedulerView() {
  const scheduler = window.Portal.modules.scheduler;

  const [delay, setDelay] = useState("1000");
  const [interval, setIntervalMs] = useState("");
  const [log, setLog] = useState([]);
  const [tasks, setTasks] = useState([]);

  function appendLog(msg) {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  function refreshTasks() {
    setTasks(scheduler.list());
  }

  function scheduleOnce() {
    const d = parseInt(delay || "0", 10);

    const id = scheduler.schedule(() => {
      appendLog(`One-shot task fired (id=${id})`);
      refreshTasks();
    }, d);

    appendLog(`Scheduled one-shot task id=${id} delay=${d}ms`);
    refreshTasks();
  }

  function scheduleRepeating() {
    const d = parseInt(delay || "0", 10);
    const i = parseInt(interval || "1000", 10);

    const id = scheduler.schedule(() => {
      appendLog(`Repeating task tick (id=${id})`);
      refreshTasks();
    }, d, i);

    appendLog(`Scheduled repeating task id=${id} delay=${d}ms interval=${i}ms`);
    refreshTasks();
  }

  function cancelTask(id) {
    scheduler.cancel(id);
    appendLog(`Cancelled task id=${id}`);
    refreshTasks();
  }

  function clearAll() {
    scheduler.clearAll();
    appendLog("Cleared all tasks");
    refreshTasks();
  }

  return (
    <div className="module-root">
      <h1>Scheduler</h1>
      <p className="module-subtitle">Process and task scheduling kernel.</p>

      <div style={{ marginBottom: 12 }}>
        <input
          value={delay}
          onChange={(e) => setDelay(e.target.value)}
          placeholder="Delay (ms)"
          style={{ width: 120, marginRight: 8 }}
        />
        <input
          value={interval}
          onChange={(e) => setIntervalMs(e.target.value)}
          placeholder="Interval (ms, optional)"
          style={{ width: 140, marginRight: 8 }}
        />
      </div>

      <button onClick={scheduleOnce}>Schedule one-shot</button>
      <button onClick={scheduleRepeating}>Schedule repeating</button>
      <button onClick={clearAll} style={{ marginLeft: 8 }}>
        Clear all
      </button>

      <h3 style={{ marginTop: 20 }}>Tasks</h3>
      <pre style={{ maxHeight: 160, overflow: "auto" }}>
        {JSON.stringify(tasks, null, 2)}
      </pre>

      <h3 style={{ marginTop: 20 }}>Log</h3>
      <pre style={{ maxHeight: 160, overflow: "auto" }}>
        {log.join("\n")}
      </pre>
    </div>
  );
}
