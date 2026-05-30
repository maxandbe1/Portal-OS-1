import React from "react";

export default function SoundView() {
  const sound = window.Portal.modules.sound;

  return (
    <div className="module-root">
      <h1>Sound Engine</h1>
      <p className="module-subtitle">Audio runtime for Portal‑OS.</p>

      <button onClick={() => sound.click()}>Click</button>
      <button onClick={() => sound.success()}>Success</button>
      <button onClick={() => sound.error()}>Error</button>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => sound.tone(440, 0.2, "sine")}>A4 Sine</button>
        <button onClick={() => sound.tone(660, 0.2, "square")}>E5 Square</button>
        <button onClick={() => sound.tone(330, 0.2, "sawtooth")}>E4 Saw</button>
      </div>
    </div>
  );
}
