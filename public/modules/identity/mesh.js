import EventBus from "../eventbus/engine.js";
import IdentityEngine from "./engine.js";

const IdentityMesh = {
  init() {
    EventBus.register("identity:update", ({ payload }) => {
      IdentityEngine.set(payload.key, payload.value);
    });

    IdentityEngine.onChange((key, value) => {
      EventBus.emit("identity:changed", { key, value });
    });

    EventBus.emit("mesh:node:online", { node: "identity" });
  }
};

export default IdentityMesh;
