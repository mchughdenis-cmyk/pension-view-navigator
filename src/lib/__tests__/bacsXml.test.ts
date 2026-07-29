import { describe, it, expect } from "vitest";
import { generateBacsPain001Xml } from "../bacsXml";

const opts = {
  debtorName: "Airgead SIPP Trustees",
  debtorSortCode: "20-00-00",
  debtorAccount: "12345678",
  msgId: "MSG-TEST-1",
  executionDate: "2026-07-29",
};

describe("generateBacsPain001Xml", () => {
  it("produces a pain.001.001.03 envelope with correct totals", () => {
    const xml = generateBacsPain001Xml(
      [
        { id: "p1", amount: 1234.5, beneficiary_name: "Alice", beneficiary_sort_code: "11-22-33", beneficiary_account: "87654321", beneficiary_reference: "PCLS" },
        { id: "p2", amount: 100, beneficiary_name: "Bob", beneficiary_sort_code: "44-55-66", beneficiary_account: "11112222", beneficiary_reference: "UFPLS" },
      ],
      opts,
    );
    expect(xml).toContain("pain.001.001.03");
    expect(xml).toContain("<NbOfTxs>2</NbOfTxs>");
    expect(xml).toContain("<CtrlSum>1334.50</CtrlSum>");
    expect(xml).toContain("<InstdAmt Ccy=\"GBP\">1234.50</InstdAmt>");
    expect(xml).toContain("112233" + "87654321"); // sort+account concat
    expect(xml).toContain("MSG-TEST-1");
  });

  it("escapes XML-special characters in beneficiary names", () => {
    const xml = generateBacsPain001Xml(
      [{ id: "p1", amount: 10, beneficiary_name: "A & B <Ltd>", beneficiary_sort_code: "01-02-03", beneficiary_account: "99998888" }],
      opts,
    );
    expect(xml).toContain("A &amp; B &lt;Ltd&gt;");
  });

  it("rounds monetary values to 2dp", () => {
    const xml = generateBacsPain001Xml(
      [{ id: "p1", amount: 10.005, beneficiary_sort_code: "01-02-03", beneficiary_account: "99998888" }],
      opts,
    );
    expect(xml).toContain("<CtrlSum>10.01</CtrlSum>");
  });
});
