import EventBus from "../eventbus/engine.js";
import SovereigntyEngine from "./engine.js";

const SovereigntyMesh = {
  init() {
    EventBus.register("sovereignty:assert", ({ payload }) => {
      SovereigntyEngine.assert(payload.domain);
    });

    SovereigntyEngine.onAssert((domain) => {
      EventBus.emit("sovereignty:asserted", { domain });
    });

    EventBus.emit("mesh:node:online", { node: "sovereignty" });
  }
};

export default SovereigntyMesh;
