import EventBus from "../eventbus/engine.js";
import ConsoleEngine from "./engine.js";

const ConsoleMesh = {
  init() {
    // Listen to ALL mesh events
    EventBus.register("*", ({ channel, payload, meta, ts }) => {
      ConsoleEngine.log({
        channel,
        payload,
        meta,
        ts
      });
    });

    // Announce presence
    EventBus.emit("mesh:node:online", { node: "console" });
  }
};

export default ConsoleMesh;
