import EventBus from "../eventbus/engine.js";
import ThemeEngine from "./engine.js";

const ThemeMesh = {
  init() {
    // Listen for theme updates
    EventBus.register("theme:update", ({ payload }) => {
      ThemeEngine.set(payload.key, payload.value);
    });

    // Broadcast theme changes
    ThemeEngine.onChange((key, value) => {
      EventBus.emit("theme:changed", { key, value });
    });

    EventBus.emit("mesh:node:online", { node: "theme" });
  }
};

export default ThemeMesh;
