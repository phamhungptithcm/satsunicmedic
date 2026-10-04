import { describe, expect, it } from "vitest";
import { createOptionalAssetLoadGate } from "../packages/anatomy-viewer/src/optional-asset-load";

describe("optional full-body download lifecycle", () => {
  it("never starts while hidden and coalesces repeated renders while loading", () => {
    const gate = createOptionalAssetLoadGate();
    expect(gate.request(false)).toBe(false);
    expect(gate.request(true)).toBe(true);
    expect(gate.request(true)).toBe(false);
    expect(gate.request(false)).toBe(false);
    expect(gate.request(true)).toBe(false);
  });
  it("latches network failure across status, camera and region rerenders", () => {
    const gate = createOptionalAssetLoadGate();
    expect(gate.request(true)).toBe(true);
    gate.fail();
    for (let render = 0; render < 20; render++) expect(gate.request(true)).toBe(false);
    expect(gate.request(false)).toBe(false);
    expect(gate.request(true)).toBe(true);
    expect(gate.request(true)).toBe(false);
    gate.fail();
    expect(gate.request(true)).toBe(false);
  });
  it("allows explicit reopen when failure finishes after the user hides the layer", () => {
    const gate = createOptionalAssetLoadGate();
    expect(gate.request(true)).toBe(true);
    expect(gate.request(false)).toBe(false);
    gate.fail();
    expect(gate.request(true)).toBe(true);
  });
  it("retains successful geometry across hide and reopen without downloading again", () => {
    const gate = createOptionalAssetLoadGate();
    expect(gate.request(true)).toBe(true);
    gate.complete();
    expect(gate.request(true)).toBe(false);
    expect(gate.request(false)).toBe(false);
    expect(gate.request(true)).toBe(false);
  });
});
