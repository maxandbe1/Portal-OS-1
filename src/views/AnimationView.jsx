import React, { useEffect, useState } from "react";

export default function AnimationView() {
  const anim = window.Portal.modules.animation;

  const [state, setState] = useState(anim.getState());

  useEffect(() => {
    const id = setInterval(() => {
      setState({ ...anim.getState() });
    }, 100);

    return () => clearInterval(id);
  }, []);

  function trigger() {
    anim.animate("demo", Math.random(), 0.08);
  }

  return (
    <div className="module-root">
      <h1>Animation Engine</h1>
      <p className="module-subtitle">Runtime motion system.</p>

      <button onClick={trigger}>Animate Demo Channel</button>

      <div style={{ marginTop: 20 }}>
        <strong>Tick:</strong> {state.tick}
      </div>

      <div style={{ marginTop: 10 }}>
        <strong>Demo Value:</strong>{" "}
        {state.channels.demo ? state.channels.demo.value.toFixed(3) : "N/A"}
      </div>
    </div>
  );
}
