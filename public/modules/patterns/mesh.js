import EventBus from "../eventbus/engine.js";
import PatternsEngine from "./engine.js";

const PatternsMesh = {
  init() {
    EventBus.register("patterns:detect", ({ payload }) => {
      const result = PatternsEngine.detect(payload.data);
      EventBus.emit("patterns:result", { result });
    });

    EventBus.emit("mesh:node:online", { node: "patterns" });
  }
};

export default PatternsMesh;
