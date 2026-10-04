/** A failed optional download stays stopped until the user hides and reopens it. */
export function createOptionalAssetLoadGate() {
  let state: "idle" | "loading" | "ready" | "failed" = "idle";
  let previouslyVisible = false;
  return {
    request(visible: boolean): boolean {
      if (visible && !previouslyVisible && state === "failed") state = "idle";
      previouslyVisible = visible;
      if (!visible || state !== "idle") return false;
      state = "loading";
      return true;
    },
    complete() { state = "ready"; },
    fail() { state = "failed"; },
  };
}
