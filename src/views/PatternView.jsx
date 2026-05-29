import React, { useState } from "react";

export default function PatternView() {
  const pattern = window.Portal.modules.pattern;

  const [state, setState] = useState(pattern.getState());
  const [label, setLabel] = useState("");

  function add() {
    pattern.addPattern(label);
    setState(pattern.getState());
    setLabel("");
  }

  function adjust(id, delta) {
    pattern.adjustPatternStrength(id, delta);
    setState(pattern.getState());
  }

  return (
    <div className="module-root">
      <h1>Pattern</h1>
      <p className="module-subtitle">Behavioral cycles and strength mapping.</p>

      <div className="pattern-input">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add pattern cycle..."
        />
        <button onClick={add}>Add</button>
      </div>

      <div className="pattern-list">
        {state.cycles.map((c) => (
          <div key={c.id} className="pattern-item">
            <div className="pattern-label">{c.label}</div>
            <div className="pattern-strength">
              Strength: {(c.strength * 100).toFixed(0)}%
            </div>
            <div className="pattern-controls">
              <button onClick={() => adjust(c.id, +0.1)}>+10%</button>
              <button onClick={() => adjust(c.id, -0.1)}>-10%</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
