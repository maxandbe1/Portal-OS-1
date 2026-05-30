
// File: src/views/ThemeView.jsx
// Phase‑16 — Theme View (Editor + Live Preview + Theme Engine Integration)

import React, { useState, useEffect } from "react";
import { ThemeEngine } from "../modules/theme/engine.js";

// --------------------------------------------------
// ThemeView Component
// --------------------------------------------------

export default function ThemeView() {
  const [theme, setTheme] = useState(ThemeEngine.load());

  useEffect(() => {
    ThemeEngine.apply(theme);
  }, []);

  function updateVar(key, value) {
    const next = ThemeEngine.updateVar(theme, key, value);
    setTheme(next);
  }

  function reset() {
    const next = ThemeEngine.reset();
    setTheme(next);
  }

  return (
    <div className="theme-view" style={styles.container}>
      <h1 style={styles.header}>Theme Editor</h1>

      <div style={styles.section}>
        <label style={styles.label}>Background</label>
        <input
          type="color"
          value={theme["--bg"]}
          onChange={(e) => updateVar("--bg", e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Foreground</label>
        <input
          type="color"
          value={theme["--fg"]}
          onChange={(e) => updateVar("--fg", e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Panel</label>
        <input
          type="color"
          value={theme["--panel"]}
          onChange={(e) => updateVar("--panel", e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Accent</label>
        <input
          type="color"
          value={theme["--accent"]}
          onChange={(e) => updateVar("--accent", e.target.value)}
          style={styles.input}
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Font</label>
        <input
          type="text"
          value={theme["--font"]}
          onChange={(e) => updateVar("--font", e.target.value)}
          style={styles.textInput}
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Padding</label>
        <input
          type="text"
          value={theme["--pad"]}
          onChange={(e) => updateVar("--pad", e.target.value)}
          style={styles.textInput}
        />
      </div>

      <button onClick={reset} style={styles.resetButton}>
        Reset Theme
      </button>
    </div>
  );
}

// --------------------------------------------------
// Inline Styles
// --------------------------------------------------

const styles = {
  container: {
    padding: "20px",
    color: "var(--fg)",
    background: "var(--bg)",
    minHeight: "100vh",
    fontFamily: "var(--font)"
  },
  header: {
    fontSize: "28px",
    marginBottom: "20px"
  },
  section: {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    maxWidth: "240px"
  },
  label: {
    marginBottom: "6px",
    fontSize: "14px",
    opacity: 0.8
  },
  input: {
    width: "100%",
    height: "40px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#222"
  },
  textInput: {
    width: "100%",
    height: "40px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#222",
    color: "var(--fg)",
    paddingLeft: "10px"
  },
  resetButton: {
    marginTop: "20px",
    padding: "10px 16px",
    background: "var(--accent)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#000",
    fontWeight: "bold"
  }
};
