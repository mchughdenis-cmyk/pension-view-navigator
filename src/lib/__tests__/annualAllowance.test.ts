import { describe, it, expect } from "vitest";
import {
  taperedAnnualAllowance,
  applyCarryForward,
  STANDARD_AA,
  TAPER_MIN_AA,
} from "../annualAllowance";

describe("taperedAnnualAllowance", () => {
  it("returns full £60k when threshold income below £200k", () => {
    expect(taperedAnnualAllowance(150_000, 300_000)).toBe(STANDARD_AA);
  });
  it("returns full £60k when adjusted income at £260k", () => {
    expect(taperedAnnualAllowance(210_000, 260_000)).toBe(STANDARD_AA);
  });
  it("tapers £1 per £2 above £260k adjusted income", () => {
    // adjusted 280k -> 20k over -> £10k reduction -> £50k AA
    expect(taperedAnnualAllowance(210_000, 280_000)).toBe(50_000);
  });
  it("floors at £10k tapered AA", () => {
    expect(taperedAnnualAllowance(500_000, 500_000)).toBe(TAPER_MIN_AA);
  });
});

describe("applyCarryForward", () => {
  it("uses current-year AA first", () => {
    const r = applyCarryForward(40_000, 60_000, [10_000, 20_000, 30_000]);
    expect(r.used).toBe(40_000);
    expect(r.excess).toBe(0);
    expect(r.breakdown).toEqual([{ source: "current", amount: 40_000 }]);
  });
  it("dips into oldest carry-forward first when current used up", () => {
    const r = applyCarryForward(75_000, 60_000, [5_000, 20_000, 30_000]);
    expect(r.used).toBe(75_000);
    expect(r.excess).toBe(0);
    // 60k current + 5k oldest + 10k of middle
    expect(r.breakdown.find((b) => b.source === "current")?.amount).toBe(60_000);
    expect(r.breakdown.length).toBe(3);
  });
  it("reports excess when total is exhausted", () => {
    const r = applyCarryForward(200_000, 60_000, [10_000, 10_000, 10_000]);
    expect(r.used).toBe(90_000);
    expect(r.excess).toBe(110_000);
  });
});
