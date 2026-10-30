import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, slugify } from "../utils";

describe("utils", () => {
  it("formatCurrency BRL", () => {
    expect(formatCurrency(1234.5)).toMatch(/1\.234,50/);
  });
  it("formatDate", () => {
    const d = new Date("2026-10-29T00:00:00");
    expect(formatDate(d)).toContain("2026");
  });
  it("slugify", () => {
    expect(slugify("Geladeira Brastemp")).toBe("geladeira-brastemp");
  });
});