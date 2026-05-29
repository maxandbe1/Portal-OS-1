import React, { useEffect, useState } from "react";

export default function BeeSimView() {
  const beesim = window.Portal.modules.beesim;

  const [state, setState] = useState(beesim.getState());

  useEffect(() => {
    const id = setInterval(() => {
      beesim.tick();
      setState(beesim.getState());
    }, 1200);

    return () => clearInterval(id);
  }, []);

  function bump(id, e, f) {
    beesim.nudge(id, e, f);
    setState(beesim.getState());
  }

  return (
    <div className="module-root">
      <h1>Bee‑SIM</h1>
      <p className="module-subtitle">Agent‑based micro‑simulation.</p>

      <div className="beesim-meta">Ticks: {state.ticks}</div>

      <div className="beesim-list">
        {state.bees.map((b) => (
          <div key={b.id} className="beesim-item">
            <div className="beesim-label">{b.label}</div>

            <div className="beesim-bars">
              <div>Energy: {(b.energy * 100).toFixed(0)}%</div>
              <div>Focus: {(b.focus * 100).toFixed(0)}%</div>
            </div>

            <div className="beesim-controls">
              <button onClick={() => bump(b.id, +0.1, 0)}>+E</button>
              <button onClick={() => bump(b.id, 0, +0.1)}>+F</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
