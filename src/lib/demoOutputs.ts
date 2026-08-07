// Sample outputs used in the public capability showcase.
// Each output is generated in the browser so a prospect can open a real file
// without needing an account or live connection.

export interface DemoOutput {
  label: string;
  filename: string;
  mime: string;
  description: string;
  build: () => string;
}

const csv = (rows: (string | number)[][]) => rows.map((r) => r.join(",")).join("\n");

const xml = (body: string) => `<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`;

export const demoOutputs: Record<string, DemoOutput[]> = {
  lifecycle: [
    {
      label: "Member record extract",
      filename: "member-record-extract.csv",
      mime: "text/csv",
      description: "Member, scheme and status data as exported to a trustee or employer.",
      build: () =>
        csv([
          ["PolicyReference", "MemberName", "NINO", "Scheme", "Status", "JoinDate", "KYCStatus", "DataQuality"],
          ["AIR-100241", "J Ellery", "QQ123456C", "Airgead SIPP", "Active", "12/03/2026", "Verified", "98%"],
          ["AIR-100242", "P Nowak", "QQ654321B", "Airgead SIPP", "Deferred", "04/01/2026", "Verified", "94%"],
          ["AIR-100243", "S Ahmed", "QQ998877A", "Airgead SIPP", "Crystallised", "22/11/2025", "Verified", "100%"],
        ]),
    },
    {
      label: "AML verification certificate",
      filename: "aml-verification.txt",
      mime: "text/plain",
      description: "Result pack returned by the simulated electronic ID provider.",
      build: () =>
        [
          "AIRGEAD PENSION NAVIGATOR — ELECTRONIC ID VERIFICATION",
          "Member: J Ellery (AIR-100241)",
          "Provider: [SIMULATED] Experian / GBG hybrid check",
          "Reference: EID-2026-0084417",
          "Identity match: PASS (2 sources)",
          "Address match: PASS (2 sources)",
          "PEP / sanctions: NO MATCH",
          "Risk rating: Standard — periodic review due 07/08/2027",
        ].join("\n"),
    },
  ],
  contributions: [
    {
      label: "Payroll contribution schedule",
      filename: "contribution-schedule.csv",
      mime: "text/csv",
      description: "Validated payroll run output handed to contribution processing.",
      build: () =>
        csv([
          ["PolicyReference", "MemberName", "PayPeriod", "EmployerAmount", "EmployeeAmount", "Method", "DueDate"],
          ["AIR-100241", "J Ellery", "2026-07", "480.00", "320.00", "Net pay", "22/08/2026"],
          ["AIR-100242", "P Nowak", "2026-07", "300.00", "200.00", "Relief at source", "22/08/2026"],
          ["AIR-100243", "S Ahmed", "2026-07", "750.00", "0.00", "Salary exchange", "22/08/2026"],
        ]),
    },
    {
      label: "Relief at source claim",
      filename: "ras-interim-claim.xml",
      mime: "application/xml",
      description: "Interim RAS claim staged for the HMRC gateway.",
      build: () =>
        xml(
          `<ReliefAtSourceClaim>
  <SchemeReference>00123456RX</SchemeReference>
  <ClaimPeriod>2026-07</ClaimPeriod>
  <Claim>
    <PolicyReference>AIR-100242</PolicyReference>
    <MemberName>P Nowak</MemberName>
    <NetContribution>200.00</NetContribution>
    <TaxReclaimed>50.00</TaxReclaimed>
  </Claim>
  <TotalNet>200.00</TotalNet>
  <TotalReclaim>50.00</TotalReclaim>
  <Status>STAGED [SIMULATED SUBMISSION]</Status>
</ReliefAtSourceClaim>`,
        ),
    },
  ],
  transfers: [
    {
      label: "Origo Options message log",
      filename: "origo-message-log.xml",
      mime: "application/xml",
      description: "Full simulated message exchange between ceding and receiving scheme.",
      build: () =>
        xml(
          `<OrigoOptionsCase reference="OPT-2026-77341" mode="SIMULATED">
  <Message seq="1" direction="OUT" type="TransferRequest" at="03/08/2026 09:14">Receiving scheme requests transfer of AIR-100241</Message>
  <Message seq="2" direction="IN" type="Acknowledgement" at="03/08/2026 09:15">Ceding scheme acknowledged</Message>
  <Message seq="3" direction="IN" type="TransferValue" at="04/08/2026 11:02">Value 148,220.55 GBP, guaranteed to 01/09/2026</Message>
  <Message seq="4" direction="OUT" type="DueDiligenceComplete" at="05/08/2026 14:40">No red or amber flags identified</Message>
  <Message seq="5" direction="OUT" type="TransferAccept" at="05/08/2026 14:41">Acceptance issued, discharge attached</Message>
  <Message seq="6" direction="IN" type="SettlementAdvice" at="07/08/2026 08:03">Faster payment sent, ref TRF-2026-0091</Message>
</OrigoOptionsCase>`,
        ),
    },
    {
      label: "Discharge & due diligence pack",
      filename: "transfer-discharge-pack.txt",
      mime: "text/plain",
      description: "Discharge form plus the scam due diligence checklist retained on file.",
      build: () =>
        [
          "TRANSFER DISCHARGE AND DUE DILIGENCE PACK",
          "Case: TRF-2026-0091  Member: J Ellery (AIR-100241)",
          "Ceding scheme: Northbank Retirement Plan (DC)   Value: GBP 148,220.55",
          "",
          "Due diligence checklist",
          " [x] Receiving scheme registered with HMRC",
          " [x] No unsolicited contact reported by member",
          " [x] No overseas investment or unregulated introducer",
          " [x] No guaranteed or unrealistic returns promised",
          " [x] Red flags: none   Amber flags: none",
          " [x] MoneyHelper safeguarding guidance not required",
          "",
          "Discharge signed 05/08/2026 — administrator K Boyle, checked by D McHugh (four eyes).",
        ].join("\n"),
    },
  ],
  dealing: [
    {
      label: "Aggregated dealing file",
      filename: "dealing-block-file.csv",
      mime: "text/csv",
      description: "Block order file as sent to the executing broker or platform.",
      build: () =>
        csv([
          ["BlockRef", "ISIN", "Instrument", "Side", "Units", "EstimatedValue", "SettlementDate"],
          ["BLK-2026-0442", "GB00B3X7QG63", "Vanguard FTSE Global All Cap", "BUY", "1240.882", "88,410.00", "11/08/2026"],
          ["BLK-2026-0443", "GB00BPN5P782", "Royal London Short Duration Gilt", "SELL", "9200.000", "42,180.00", "11/08/2026"],
        ]),
    },
    {
      label: "Custodian reconciliation",
      filename: "custody-reconciliation.csv",
      mime: "text/csv",
      description: "Internal positions compared with the simulated custodian statement.",
      build: () =>
        csv([
          ["ISIN", "InternalUnits", "CustodianUnits", "Difference", "Status"],
          ["GB00B3X7QG63", "18240.112", "18240.112", "0.000", "Matched"],
          ["GB00BPN5P782", "40100.000", "40100.000", "0.000", "Matched"],
          ["IE00B4L5Y983", "2210.500", "2205.500", "5.000", "Break — pending trade date mismatch"],
        ]),
    },
  ],
  crystallisation: [
    {
      label: "Crystallisation certificate",
      filename: "crystallisation-certificate.txt",
      mime: "text/plain",
      description: "BCE record with LSA and LSDBA usage after the event.",
      build: () =>
        [
          "BENEFIT CRYSTALLISATION CERTIFICATE",
          "Member: S Ahmed (AIR-100243)   Event date: 03/08/2026",
          "Amount crystallised: GBP 400,000.00",
          "Pension commencement lump sum: GBP 100,000.00 (25%)",
          "Designated to flexi-access drawdown: GBP 300,000.00",
          "",
          "Lump sum allowance (LSA)         268,275.00   used 100,000.00   remaining 168,275.00",
          "Lump sum & death benefit (LSDBA) 1,073,100.00 used 100,000.00   remaining 973,100.00",
          "No protections held. Certificate issued to member and adviser.",
        ].join("\n"),
    },
  ],
  drawdown: [
    {
      label: "Income payment schedule",
      filename: "drawdown-payment-schedule.csv",
      mime: "text/csv",
      description: "Scheduled net income payments with PAYE deductions.",
      build: () =>
        csv([
          ["PolicyReference", "MemberName", "PayDate", "Gross", "Tax", "Net", "TaxCode", "Frequency"],
          ["AIR-100243", "S Ahmed", "25/08/2026", "1500.00", "300.00", "1200.00", "1257L", "Monthly"],
          ["AIR-100243", "S Ahmed", "25/09/2026", "1500.00", "300.00", "1200.00", "1257L", "Monthly"],
          ["AIR-100241", "J Ellery", "25/08/2026", "2000.00", "400.00", "1600.00", "1257L", "Monthly"],
        ]),
    },
    {
      label: "Annual drawdown review",
      filename: "drawdown-annual-review.txt",
      mime: "text/plain",
      description: "Sustainability review issued on the drawdown anniversary.",
      build: () =>
        [
          "FLEXI-ACCESS DRAWDOWN ANNUAL REVIEW",
          "Member: S Ahmed   Review date: 03/08/2026",
          "Fund at review: GBP 292,410   Income taken last 12 months: GBP 18,000 (6.2%)",
          "Projected depletion age at current rate: 89 (mid growth 4.5% nominal)",
          "Sustainability rating: Amber — income above 5% of fund",
          "Action: adviser review booked, wake-up and risk warnings reissued.",
        ].join("\n"),
    },
  ],
  "death-benefits": [
    {
      label: "Death benefit case pack",
      filename: "death-benefit-case.txt",
      mime: "text/plain",
      description: "Nomination, discretion decision and settlement record.",
      build: () =>
        [
          "DEATH BENEFIT CASE — DB-2026-0014",
          "Member: R Fitzgerald (AIR-100118)   Date of death: 14/06/2026   Age at death: 71",
          "Notification received 18/06/2026, death certificate verified 20/06/2026.",
          "Expression of wish: spouse 70%, daughter 30% (dated 09/02/2025).",
          "Trustee discretion applied 02/07/2026 — nomination followed.",
          "Benefits: beneficiary drawdown, taxable at recipient marginal rate (member aged over 75).",
          "LSDBA tested: no lump sum paid, no allowance used.",
          "Settlement: 2 beneficiary accounts opened 05/07/2026.",
        ].join("\n"),
    },
  ],
  "tax-reporting": [
    {
      label: "APSS event report",
      filename: "apss-event-report.xml",
      mime: "application/xml",
      description: "Event report assembled for the tax year, staged for the HMRC gateway.",
      build: () =>
        xml(
          `<EventReport mode="SIMULATED">
  <SchemeReference>00123456RX</SchemeReference>
  <TaxYear>2026-27</TaxYear>
  <Event code="24" description="Relevant benefit crystallisation">
    <PolicyReference>AIR-100243</PolicyReference>
    <MemberName>S Ahmed</MemberName>
    <EventDate>03/08/2026</EventDate>
    <AmountCrystallised>400000.00</AmountCrystallised>
    <LumpSum>100000.00</LumpSum>
  </Event>
  <Event code="22" description="Annual allowance excess">
    <PolicyReference>AIR-100241</PolicyReference>
    <MemberName>J Ellery</MemberName>
    <PensionInput>72000.00</PensionInput>
    <Excess>12000.00</Excess>
  </Event>
  <Status>READY TO SUBMIT</Status>
</EventReport>`,
        ),
    },
    {
      label: "P60 (pension income)",
      filename: "p60-pension-income.txt",
      mime: "text/plain",
      description: "End of year certificate for a member taking drawdown income.",
      build: () =>
        [
          "P60 END OF YEAR CERTIFICATE — PENSION INCOME",
          "Tax year 6 April 2026 to 5 April 2027 (interim)",
          "Member: S Ahmed   NINO: QQ998877A   Payroll ref: AIR-100243",
          "Pension paid to date: GBP 6,000.00",
          "Tax deducted to date: GBP 1,200.00",
          "Tax code: 1257L cumulative",
          "Payer: Airgead Pension Trustees Ltd, PAYE ref 475/AB12345",
        ].join("\n"),
    },
  ],
  illustrations: [
    {
      label: "Key features illustration (KFI)",
      filename: "kfi-illustration.txt",
      mime: "text/plain",
      description: "COBS 13 projection summary — the app also produces this as a branded PDF.",
      build: () =>
        [
          "KEY FEATURES ILLUSTRATION — COBS 13",
          "Member: J Ellery   Age 57   Retirement age 65   Prepared 07/08/2026",
          "Current fund: GBP 240,000   Regular contribution: GBP 800 gross monthly",
          "",
          "Projected fund at 65 (after charges, in today's money)",
          "  Lower  (2.0% nominal): GBP 316,400",
          "  Mid    (5.0% nominal): GBP 372,900",
          "  Higher (8.0% nominal): GBP 440,700",
          "",
          "Effect of charges: reduction in yield 0.62% pa.",
          "Assumptions follow FCA standardised rates; inflation 2.0%.",
        ].join("\n"),
    },
    {
      label: "SMPI statutory statement",
      filename: "smpi-statement.txt",
      mime: "text/plain",
      description: "Statutory money purchase illustration issued annually.",
      build: () =>
        [
          "STATUTORY MONEY PURCHASE ILLUSTRATION",
          "Member: P Nowak   Statement date: 07/08/2026   Retirement age: 67",
          "Fund value: GBP 88,140",
          "Estimated fund at 67 in today's money: GBP 141,600",
          "Estimated yearly pension, single life, increasing with inflation: GBP 5,320",
          "Prepared under AS TM1 v5.0 accumulation and annuitisation assumptions.",
        ].join("\n"),
    },
  ],
  cass: [
    {
      label: "CASS 7 internal reconciliation",
      filename: "cass7-daily-reconciliation.csv",
      mime: "text/csv",
      description: "Daily internal client money reconciliation with sign-off.",
      build: () =>
        csv([
          ["Date", "ClientMoneyRequirement", "ClientMoneyResource", "Difference", "Action", "SignedOffBy"],
          ["05/08/2026", "4,812,440.19", "4,812,440.19", "0.00", "None", "D McHugh"],
          ["06/08/2026", "4,829,118.02", "4,829,118.02", "0.00", "None", "D McHugh"],
          ["07/08/2026", "4,836,905.77", "4,835,905.77", "-1,000.00", "Shortfall funded same day", "D McHugh"],
        ]),
    },
    {
      label: "Breach register extract",
      filename: "cass-breach-register.csv",
      mime: "text/csv",
      description: "Breach records with root cause and remediation status.",
      build: () =>
        csv([
          ["Ref", "Date", "Type", "Description", "RootCause", "Status", "Reportable"],
          ["BR-2026-011", "07/08/2026", "CASS 7", "Shortfall of GBP 1,000 on internal recon", "Late bank credit", "Closed", "No"],
          ["BR-2026-010", "21/07/2026", "CASS 8", "Custody position break unresolved 3 days", "Trade date mismatch", "Closed", "No"],
          ["BR-2026-009", "02/07/2026", "Operational", "Contribution allocated to wrong wrapper", "Manual keying", "Closed", "No"],
        ]),
    },
  ],
  regulatory: [
    {
      label: "RegData return (draft)",
      filename: "regdata-return.xml",
      mime: "application/xml",
      description: "Draft return generated from live system data, staged for the FCA portal.",
      build: () =>
        xml(
          `<RegDataReturn mode="SIMULATED">
  <Firm frn="123456">Airgead Pension Administration Ltd</Firm>
  <ReturnType>CMAR (Client Money and Assets Return)</ReturnType>
  <Period>2026-07</Period>
  <HighestClientMoneyBalance>4912800.44</HighestClientMoneyBalance>
  <ClientMoneyBanks count="2">Barclays, Lloyds</ClientMoneyBanks>
  <ReconciliationBreaches>1</ReconciliationBreaches>
  <UnresolvedBreachesOver10Days>0</UnresolvedBreachesOver10Days>
  <Status>READY FOR SUBMISSION</Status>
</RegDataReturn>`,
        ),
    },
    {
      label: "Consumer Duty MI pack",
      filename: "consumer-duty-mi.csv",
      mime: "text/csv",
      description: "Outcome monitoring metrics for the board report.",
      build: () =>
        csv([
          ["Outcome", "Metric", "Value", "Target", "Status"],
          ["Products & services", "Cases outside target market", "0", "0", "Green"],
          ["Price & value", "Members paying above 0.75% all-in", "1.2%", "<2%", "Green"],
          ["Consumer understanding", "Wake-up packs issued on time", "99.1%", ">98%", "Green"],
          ["Consumer support", "Complaints upheld (DISP)", "2 of 9", "<40%", "Amber"],
        ]),
    },
  ],
  fees: [
    {
      label: "Monthly fee run",
      filename: "fee-run.csv",
      mime: "text/csv",
      description: "Calculated charges posted to the ledger and raised for collection.",
      build: () =>
        csv([
          ["PolicyReference", "MemberName", "FeeType", "Basis", "Amount", "VAT", "Collection"],
          ["AIR-100241", "J Ellery", "Platform fee", "0.25% tiered on 248,110", "51.69", "0.00", "Cash account"],
          ["AIR-100241", "J Ellery", "Ongoing adviser charge", "0.50% pa", "103.38", "0.00", "Paid away 15/08/2026"],
          ["AIR-100243", "S Ahmed", "Drawdown payment fee", "Fixed per payment", "12.50", "0.00", "Cash account"],
        ]),
    },
    {
      label: "Costs & charges disclosure",
      filename: "costs-and-charges.txt",
      mime: "text/plain",
      description: "Ex-post MiFID II disclosure for a member.",
      build: () =>
        [
          "COSTS AND CHARGES DISCLOSURE (EX-POST)",
          "Member: J Ellery   Period: 12 months to 31/07/2026   Average fund: GBP 244,000",
          "Platform / administration charges:  GBP 610.00   0.25%",
          "Investment fund charges (OCF):      GBP 415.00   0.17%",
          "Transaction costs:                  GBP  36.60   0.02%",
          "Ongoing adviser charge:             GBP 1,220.00 0.50%",
          "Total cost of investing:            GBP 2,281.60 0.94%",
          "Effect on return: a 5.0% gross return became 4.06% net.",
        ].join("\n"),
    },
  ],
};

export function downloadDemoOutput(output: DemoOutput) {
  const blob = new Blob([output.build()], { type: `${output.mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = output.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
