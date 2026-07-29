import { describe, it, expect } from "vitest";
import {
  sortCodeSchema,
  ukAccountSchema,
  paymentInstructionSchema,
  formatSortCode,
} from "../validation";

describe("sortCodeSchema", () => {
  it("accepts 6 digits", () => {
    expect(sortCodeSchema.parse("200000")).toBe("200000");
  });
  it("accepts dashed sort code", () => {
    expect(sortCodeSchema.parse("20-00-00")).toBe("200000");
  });
  it("rejects too few digits", () => {
    expect(() => sortCodeSchema.parse("20-00")).toThrow();
  });
  it("rejects non-digits", () => {
    expect(() => sortCodeSchema.parse("XX-00-00")).toThrow();
  });
});

describe("ukAccountSchema", () => {
  it("accepts 8 digits", () => {
    expect(ukAccountSchema.parse("12345678")).toBe("12345678");
  });
  it("rejects 7 digits", () => {
    expect(() => ukAccountSchema.parse("1234567")).toThrow();
  });
});

describe("formatSortCode", () => {
  it("formats bare digits", () => {
    expect(formatSortCode("200000")).toBe("20-00-00");
  });
  it("re-formats already dashed input", () => {
    expect(formatSortCode("20-00-00")).toBe("20-00-00");
  });
});

describe("paymentInstructionSchema", () => {
  const base = {
    purpose: "benefit_payment",
    amount: 1000,
    beneficiary_name: "Jane Doe",
    beneficiary_sort_code: "20-00-00",
    beneficiary_account: "12345678",
    payment_method: "faster_payments" as const,
    requested_date: "2026-01-15",
  };
  it("accepts a valid instruction", () => {
    expect(() => paymentInstructionSchema.parse(base)).not.toThrow();
  });
  it("rejects negative amount", () => {
    expect(() => paymentInstructionSchema.parse({ ...base, amount: -1 })).toThrow();
  });
  it("rejects zero amount", () => {
    expect(() => paymentInstructionSchema.parse({ ...base, amount: 0 })).toThrow();
  });
  it("rejects short beneficiary name", () => {
    expect(() => paymentInstructionSchema.parse({ ...base, beneficiary_name: "A" })).toThrow();
  });
});
