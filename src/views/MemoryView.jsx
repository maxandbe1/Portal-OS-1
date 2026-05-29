import React, { useState, useEffect } from "react";

export default function MemoryView() {
  const memory = window.Portal.modules.memory;

  const [state, setState] = useState(memory.getState());
  const [text, setText] = useState("");

  function add() {
    memory.add(text);
    setState(memory.getState());
    setText("");
  }

  function clear() {
    memory.clear();
    setState(memory.getState());
  }

  return (
    <div className="module-root">
      <h1>Memory</h1>
      <p className="module-subtitle">Internal recall system of Portal‑OS.</p>

      <div className="memory-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add memory entry..."
        />
        <button onClick={add}>Add</button>
      </div>

      <div className="memory-list">
        {state.entries.map((e) => (
          <div key={e.id} className="memory-item">
            {e.text}
          </div>
        ))}
      </div>

      <button onClick={clear} className="danger">
        Clear Memory
      </button>
    </div>
  );
}
