import React, { useEffect, useState } from "react";

export default function DashboardView() {
  const memory = window.Portal.modules.memory;
  const pattern = window.Portal.modules.pattern;
  const beesim = window.Portal.modules.beesim;
  const sov = window.Portal.modules.sovereignty;

  const [mem, setMem] = useState(memory.getState());
  const [pat, setPat] = useState(pattern.getState());
  const [bee, setBee] = useState(beesim.getState());
  const [gov, setGov] = useState(sov.getState());

  useEffect(() => {
    const id = setInterval(() => {
      setMem(memory.getState());
      setPat(pattern.getState());
      setBee(beesim.getState());
      setGov(sov.getState());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="module-root">
      <h1>Dashboard</h1>
      <p className="module-subtitle">Unified system overview.</p>

      <div className="dash-section">
        <h2>Memory</h2>
        <div>Total entries: {mem.count}</div>
      </div>

      <div className="dash-section">
        <h2>Pattern</h2>
        <div>Cycles: {pat.cycles.length}</div>
      </div>

      <div className="dash-section">
        <h2>Bee‑SIM</h2>
        <div>Bees: {bee.bees.length}</div>
        <div>Ticks: {bee.ticks}</div>
      </div>

      <div className="dash-section">
        <h2>Sovereignty</h2>
        <div>Pressure: {(gov.pressure * 100).toFixed(0)}%</div>
        <div>Coherence: {(gov.coherence * 100).toFixed(0)}%</div>
        <div>Load: {(gov.load * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
}
