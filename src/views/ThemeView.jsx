import { useState, useEffect } from "react";

// Phase‑8 Theme Engine
import ThemeEngine from "../../public/modules/theme/engine.js";

// Phase‑12 Sound Engine
import SoundEngine from "../../public/modules/sound/engine.js";

// Phase‑16 Permissions Layer
import Permissions from "../../public/modules/permissions/engine.js";

// Phase‑4 Console (corrected import)
import Console from "../../public/modules/console/module-ui.js";

// Phase‑17 Event Bus (pre‑mesh hook)
import EventBus from "../../public/modules/eventbus/engine.js";

export default function ThemeView() {
  const [themeVars, setThemeVars] = useState({});
  const [permissions, setPermissions] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Phase‑17 Event
