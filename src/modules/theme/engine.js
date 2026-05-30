// File: src/modules/theme/engine.js
// Phase 16 — Theme Engine (Variables + Persistence + Live Apply)

const DEFAULT_THEME = {
  "--bg": "#111",
  "--fg": "#fff",
  "--panel": "#1a1a1a",
  "--accent": "#4da3ff",
  "--font": "Inter",
  "--pad": "16px"
};

// --------------------------------------------------
// Load Theme From Storage
// --------------------------------------------------

export function loadTheme() {
  try {
    const raw = localStorage.getItem("portal.theme");
    if (!raw) return { ...DEFAULT_THEME };

    const parsed = JSON.parse(raw);
    return { ...DEFAULT_THEME, ...parsed };
  } catch (err) {
    return { ...DEFAULT_THEME };
  }
}

// --------------------------------------------------
// Save Theme To Storage
// --------------------------------------------------

export function saveTheme(theme) {
  try {
    localStorage.setItem("portal.theme", JSON.stringify(theme));
  } catch (err) {
    // ignore
  }
}

// --------------------------------------------------
// Apply Theme To Document
// --------------------------------------------------

export function applyTheme(theme) {
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// --------------------------------------------------
// Update Single Variable
// --------------------------------------------------

export function updateThemeVar(theme, key, value) {
  const next = { ...theme, [key]: value };
  applyTheme(next);
  saveTheme(next);
  return next;
}

// --------------------------------------------------
// Reset Theme
// --------------------------------------------------

export function resetTheme() {
  applyTheme(DEFAULT_THEME);
  saveTheme(DEFAULT_THEME);
  return { ...DEFAULT_THEME };
}

// --------------------------------------------------
// Export
// --------------------------------------------------

export const ThemeEngine = {
  load: loadTheme,
  save: saveTheme,
  apply: applyTheme,
  updateVar: updateThemeVar,
  reset: resetTheme,
  defaults: DEFAULT_THEME
};
