// src/engines/sound/engine.js

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playTone(freq = 440, duration = 0.2, type = "sine") {
  const ctx = getCtx();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playClick() {
  playTone(880, 0.05, "square");
}

export function playSuccess() {
  playTone(660, 0.15, "sine");
  setTimeout(() => playTone(880, 0.15, "sine"), 120);
}

export function playError() {
  playTone(220, 0.25, "sawtooth");
}
