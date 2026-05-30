
import { useState, useEffect } from "react";
import { ThemeEngine } from "../modules/theme/engine.js";

// Phase‑8 Theme Engine
import ThemeEngine from "../../public/modules/theme/engine.js";

// Phase‑12 Sound Engine
import SoundEngine from "../../public/modules/sound/engine.js";

// Phase‑16 Permissions Layer
import Permissions from "../../public/modules/permissions/engine.js";

// Phase‑4 Console (corrected import)
import Console from "../../public/modules/console/module-ui.js";

// Phase‑17 Mesh EventBus
import EventBus from "../../public/modules/eventbus/engine.js";

export default function ThemeView() {
  const [themeVars, setThemeVars] = useState({});
  const [permissions, setPermissions] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [meshStatus, setMeshStatus] = useState("idle");

  // Load Theme Engine
  useEffect(() => {
    const vars = ThemeEngine.getAll();
    setThemeVars(vars);
  }, []);

  // Load Permissions
  useEffect(() => {
    const p = Permissions.getAll();
    setPermissions(p);
  }, []);

  // Load Sound Engine
  useEffect(() => {
    SoundEngine.init();
  }, []);

  // Phase‑17 Mesh Registration
  useEffect(() => {
    // Theme updates from mesh
    const onThemeUpdate = ({ payload }) => {
      const { key, value } = payload;
      ThemeEngine.set(key, value);
      setThemeVars((prev) => ({ ...prev, [key]: value }));
    };

    // Permission updates from mesh
    const onPermissionsUpdate = ({ payload }) => {
      const { key, value } = payload;
      Permissions.set(key, value);
      setPermissions((prev) => ({ ...prev, [key]: value }));
    };

    // Sound toggle from mesh
    const onSoundToggle = () => {
      setSoundEnabled((prev) => !prev);
      SoundEngine.toggle();
    };

    // Mesh heartbeat listener
    const onMeshPing = ({ payload }) => {
      setMeshStatus(`Ping from ${payload.source}`);
    };

    EventBus.register("theme:update", onThemeUpdate);
    EventBus.register("permissions:update", onPermissionsUpdate);
    EventBus.register("sound:toggle", onSoundToggle);
    EventBus.register("mesh:ping", onMeshPing);

    // Emit heartbeat on mount
    EventBus.emit("mesh:ping", { source: "ThemeView" });

    return () => {
      EventBus.unregister("theme:update", onThemeUpdate);
      EventBus.unregister("permissions:update", onPermissionsUpdate);
      EventBus.unregister("sound:toggle", onSoundToggle);
      EventBus.unregister("mesh:ping", onMeshPing);
    };
  }, []);

  // Emit theme update
  const updateTheme = (key, value) => {
    ThemeEngine.set(key, value);
    setThemeVars((prev) => ({ ...prev, [key]: value }));
    EventBus.emit("theme:changed", { key, value });
  };

  // Emit permission update
  const updatePermission = (key, value) => {
    Permissions.set(key, value);
    setPermissions((prev) => ({ ...prev, [key]: value }));
    EventBus.emit("permissions:changed", { key, value });
  };

  return (
    <div className="theme-view">
      <h1>Theme Engine — Phase 17 Mesh</h1>

      <div className="mesh-status">
        <strong>Mesh Status:</strong> {meshStatus}
      </div>

      {/* THEME VARIABLES */}
      <section>
        <h2>Theme Variables</h2>
        {Object.keys(themeVars).map((key) => (
          <div key={key} className="theme-row">
            <label>{key}</label>
            <input
              type="text"
              value={themeVars[key]}
              onChange={(e) => updateTheme(key, e.target.value)}
            />
          </div>
        ))}
      </section>

      {/* PERMISSIONS */}
      <section>
        <h2>Permissions</h2>
        {Object.keys(permissions).map((key) => (
          <div key={key} className="permission-row">
            <label>{key}</label>
            <input
              type="checkbox"
              checked={permissions[key]}
              onChange={(e) => updatePermission(key, e.target.checked)}
            />
          </div>
        ))}
      </section>

      {/* SOUND ENGINE */}
      <section>
        <h2>Sound Engine</h2>
        <button onClick={() => EventBus.emit("sound:toggle")}>
          {soundEnabled ? "Disable Sound" : "Enable Sound"}
        </button>
      </section>

      {/* CONSOLE */}
      <section>
        <h2>Console</h2>
        <Console />
      </section>
    </div>
  );
}
