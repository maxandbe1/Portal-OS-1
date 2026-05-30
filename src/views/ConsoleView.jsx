
import { useEffect, useState } from "react";
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
