import React, { useState } from "react";

export default function ConsoleView() {
  const consoleAPI = window.Portal.modules.console;

  const [state, setState] = useState(consoleAPI.getState());
  const [input, setInput] = useState("");

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
