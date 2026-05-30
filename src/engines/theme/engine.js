// src/engines/theme/engine.js

let themeState = {
  mode: "dark",
  accent: "#4da3ff",
  density: "comfortable",
  font: "Inter"
};

export function getThemeState() {
  return themeState;
}

export function setMode(mode) {
  themeState = { ...themeState, mode };
  applyTheme();
  return themeState;
}

export function setAccent(color) {
  themeState = { ...themeState, accent: color };
  applyTheme();
  return themeState;
}

export function setDensity(density) {
  themeState = { ...themeState, density };
  applyTheme();
  return themeState;
}

export function setFont(font) {
  themeState = { ...themeState, font };
  applyTheme();
  return themeState;
}

export function applyTheme() {
  const root = document.documentElement;

  root.style.setProperty("--accent", themeState.accent);
  root.style.setProperty("--font", themeState.font);

  if (themeState.mode === "dark") {
    root.style.setProperty("--bg", "#111");
    root.style.setProperty("--fg", "#fff");
    root.style.setProperty("--panel", "#1a1a1a");
  } else {
    root.style.setProperty("--bg", "#f7f7f7");
    root.style.setProperty("--fg", "#111");
    root.style.setProperty("--panel", "#ffffff");
  }

  if (themeState.density === "compact") {
    root.style.setProperty("--pad", "8px");
  } else {
    root.style.setProperty("--pad", "16px");
  }
}
