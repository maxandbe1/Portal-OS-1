import React, { useEffect, useState } from "react";

export default function SovereigntyView() {
  const sov = window.Portal.modules.sovereignty;

  const [state, setState] = useState(sov.getState());

  useEffect(() => {
    const id = setInterval(() => {
      sov.tick();
      setState(sov.getState());
    }, 1500);

    return () => clearInterval(id);
  }, []);

  function boost() {
    sov.adjustCoherence(+0.1);
    setState(sov.getState());
  }

  function vent() {
    sov.relievePressure(0.1);
    setState(sov.getState());
  }

  return (
    <div className="module-root">
      <h1>Sovereignty</h1>
      <p className="module-subtitle">Internal governance and system coherence.</p>

      <div className="sov-stats">
        <div>Ticks: {state.ticks}</div>
        <div>Pressure: {(state.pressure * 100).toFixed(0)}%</div>
        <div>Load: {(state.load * 100).toFixed(0)}%</div>
        <div>Coherence: {(state.coherence * 100).toFixed(0)}%</div>
      </div>

      <div className="sov-controls">
        <button onClick={boost}>Boost Coherence</button>
        <button onClick={vent}>Relieve Pressure</button>
      </div>
    </div>
  );
}
