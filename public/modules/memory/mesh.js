import EventBus from "../eventbus/engine.js";
import MemoryEngine from "./engine.js";

const MemoryMesh = {
  init() {
    // Listen for memory writes
    EventBus.register("memory:write", ({ payload }) => {
      MemoryEngine.set(payload.key, payload.value);
    });

    // Emit memory changes
    MemoryEngine.onWrite((key, value) => {
      EventBus.emit("memory:changed", { key, value });
    });

    EventBus.emit("mesh:node:online", { node: "memory" });
  }
};

export default MemoryMesh;
