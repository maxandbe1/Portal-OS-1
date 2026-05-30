import React, { useState } from "react";

export default function ConsoleView() {
  const consoleAPI = window.Portal.modules.console;

  const [state, setState] = useState(consoleAPI.getState());
  const [input, setInput] = useState("");import { useEffect, useState } from "react";
import EventBus from "../../public/modules/eventbus/engine.js";

export default function ConsoleView() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    // Subscribe to ALL mesh events
    const handler = ({ channel, payload, meta, ts }) => {
      setLogs((prev) => [
        {
          ts,
          channel,
          payload,
          meta
        },
        ...prev.slice(0, 199) // keep last 200
      ]);
    };

    // Register wildcard listener
    EventBus.register("*", handler);

    // Update channel list
    const updateChannels = () => {
      setChannels(EventBus.inspect());
    };

    updateChannels();

    return () => {
      EventBus.unregister("*", handler);
    };
  }, []);

  const filteredLogs = logs.filter((log) =>
    filter.trim() === "" ? true : log.channel.includes(filter)
  );

  return (
    <div className="console-view">
      <h1>Console — Mesh Monitor</h1>

      {/* FILTER */}
      <div className="console-filter">
        <input
          type="text"
          placeholder="Filter by channel…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* CHANNEL LIST */}
      <div className="console-channels">
        <h2>Active Channels</h2>
        <ul>
          {channels.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      {/* LOGS */}
      <div className="console-logs">
        <h2>Mesh Events</h2>
        <div className="log-container">
          {filteredLogs.map((log, i) => (
            <div key={i} className="log-entry">
              <div className="log-header">
                <span className="log-channel">{log.channel}</span>
                <span className="log-time">
                  {new Date(log.ts).toLocaleTimeString()}
                </span>
              </div>
              <pre className="log-body">
                {JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


  function run() {
    consoleAPI.run(input);
    setState(consoleAPI.getState());
    setInput("");
  }

  return (
    <div className="module-root">
      <h1>Console</h1>
      <p className="module-subtitle">Internal command interface.</p>

      <div className="console-history">
        {state.history.map((h, i) => (
          <div key={i} className="console-entry">
            <div className="console-input">&gt; {h.input}</div>
            <pre className="console-output">{h.output}</pre>
          </div>
        ))}
      </div>

      <div className="console-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command..."
        />
        <button onClick={run}>Run</button>
      </div>
    </div>
  );
}
