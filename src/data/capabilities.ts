export type Maturity = "live" | "partial" | "roadmap";

export interface CapabilityScreen {
  label: string;
  to: string;
  note?: string;
}

export interface Capability {
  slug: string;
  title: string;
  positioning: string;
  maturity: Maturity;
  what: string[];
  rules: string[];
  screens: CapabilityScreen[];
  roadmap: string[];
}

export const MATURITY_LABEL: Record<Maturity, string> = {
  live: "Live",
  partial: "Partial",
  roadmap: "Roadmap",
};

export const MATURITY_DESCRIPTION: Record<Maturity, string> = {
  live: "Working end to end in the product today.",
  partial: "Core workflow is present; some steps are simplified or manual.",
  roadmap: "Designed and specified, not yet built.",
};

export const capabilities: Capability[] = [
  {
    slug: "lifecycle",
    title: "Scheme & member lifecycle",
    positioning: "From first enquiry to member record, scheme registration and status changes.",
    maturity: "live",
    what: [
      "Digital client onboarding captures member, employer and scheme detail, with progress tracked to completion.",
      "KYC/AML journey handles identity and address verification, document capture and a reviewer queue for adviser or administrator sign-off.",
      "Member records hold personal detail, accounts, addresses, nominations and correspondence in one place.",
      "Scheme and employer registers hold HMRC scheme references, participating employers and trustee arrangements.",
      "Joiners and leavers processing applies status changes at book-of-business level.",
    ],
    rules: [
      "Money Laundering Regulations customer due diligence and ongoing monitoring",
      "HMRC registered pension scheme references held against each scheme",
      "Vulnerable customer flagging in line with Consumer Duty expectations",
      "Data quality scoring against member record completeness",
    ],
    screens: [
      { label: "Client onboarding journey", to: "/onboarding" },
      { label: "Onboarding progress tracker", to: "/onboarding-progress" },
      { label: "KYC / AML journey", to: "/kyc" },
      { label: "KYC review queue", to: "/kyc-review" },
      { label: "Member details", to: "/member-details" },
      { label: "Scheme register", to: "/schemes" },
      { label: "Employer register", to: "/employers" },
      { label: "Joiners & leavers", to: "/joiners-leavers" },
      { label: "Data quality dashboard", to: "/data-quality" },
      { label: "Vulnerable client register", to: "/vulnerable" },
    ],
    roadmap: [
      "Direct electronic filing of scheme registration with HMRC — references are recorded in the system today, submission is prepared outside it.",
    ],
  },
  {
    slug: "contributions",
    title: "Contributions",
    positioning: "Employer, employee and personal contributions with relief at source and allowance tracking.",
    maturity: "live",
    what: [
      "Contribution capture across employer, employee and personal single or regular payments.",
      "Payroll processing runs as a step-based workflow at book-of-business level, with validation, variance reporting and four-eyes approval before contributions are handed off.",
      "Expected receipts and a contribution chaser track money that has been promised but not received.",
      "Direct debit collections follow the Bacs three-day cycle.",
      "Relief-at-source reclaim lines are built from net-paid contributions ready for the HMRC return.",
      "Annual allowance tracking covers the standard allowance, tapering and the money purchase annual allowance, with carry forward from the three prior years.",
    ],
    rules: [
      "Standard annual allowance £60,000 for 2026/27",
      "Tapered annual allowance: reduced by £1 for every £2 of adjusted income above £260,000, floor £10,000, only where threshold income exceeds £200,000",
      "Money purchase annual allowance £10,000 once flexible access is triggered",
      "Carry forward from the three previous tax years, current-year allowance used first, then oldest year first",
      "Relief at source claimed at the basic rate on net contributions",
      "Bacs three working day collection cycle",
    ],
    screens: [
      { label: "Contribution manager", to: "/contributions" },
      { label: "Payroll processing workflow", to: "/payroll-processing" },
      { label: "Expected receipts", to: "/admin/expected-receipts" },
      { label: "Contribution chaser", to: "/contribution-chaser" },
      { label: "Direct debit collections", to: "/direct-debit-collections" },
      { label: "Employer bulk operations", to: "/employer/bulk" },
      { label: "Unallocated cash / suspense", to: "/unallocated-cash" },
    ],
    roadmap: [
      "Automated relief-at-source repayment reconciliation against HMRC remittances.",
    ],
  },
  {
    slug: "transfers",
    title: "Transfers in and out",
    positioning: "DB and DC transfers with Origo Options messaging, due diligence and in-specie handling.",
    maturity: "partial",
    what: [
      "Transfer-in requests capture ceding scheme detail, benefit type and cash or in-specie method.",
      "Transfer-out journey handles discharge, payment and confirmation back to the receiving scheme.",
      "An Origo Options state machine drives the message sequence between ceding and receiving schemes, with a message log per transfer.",
      "Due diligence prompts cover scam warning signs and ceding scheme checks before a transfer is released.",
      "CETV quotes support defined benefit cases, with guaranteed dates tracked.",
      "In-specie instrument transfers move holdings without disinvestment.",
    ],
    rules: [
      "FCA and Pensions Regulator scam due diligence expectations on the ceding and receiving side",
      "Statutory transfer conditions and red / amber flag checks",
      "CETV guarantee periods recorded against each quote",
      "Discharge documentation retained against the case",
    ],
    screens: [
      { label: "Transfer-in journey", to: "/transfer" },
      { label: "Transfer-out journey", to: "/transfer-out" },
      { label: "Origo transfers", to: "/origo-transfers" },
      { label: "Origo message log", to: "/origo" },
      { label: "In-specie instrument transfer", to: "/instrument-transfer" },
      { label: "CETV quotes", to: "/cetv" },
      { label: "Equisoft transfer feed", to: "/equisoft" },
    ],
    roadmap: [
      "Live Origo Options connection — the state machine and message formats are modelled in the system, but messages are not yet exchanged with the live Origo network.",
      "Automated ceding scheme data enrichment from the Pensions Dashboard find service.",
    ],
  },
  {
    slug: "dealing",
    title: "Investment dealing & custody",
    positioning: "Instruction capture, aggregated dealing, settlement and position reconciliation.",
    maturity: "partial",
    what: [
      "Instruction capture from advisers and administrators, including buy, sell and switch.",
      "Orders are aggregated into blocks on the dealing desk, then allocated back to member accounts.",
      "Model portfolios and a rebalancing engine generate the trades needed to bring accounts back to target.",
      "Settlement instructions and corporate actions are tracked through to completion.",
      "Custody reconciliation compares internal positions with custodian or platform statements and lists breaks for investigation.",
    ],
    rules: [
      "Best execution and aggregation and allocation record keeping",
      "CASS 6 custody asset reconciliation principles applied to position checks",
      "Corporate action elections recorded with deadlines",
    ],
    screens: [
      { label: "Dealing desk", to: "/dealing" },
      { label: "Model portfolios & rebalancing", to: "/models" },
      { label: "Corporate actions", to: "/admin/corporate-actions" },
      { label: "Custody reconciliation", to: "/cass-engine" },
      { label: "Payments hub (settlement money)", to: "/admin/payments" },
    ],
    roadmap: [
      "Live custodian and platform position feeds — reconciliation currently runs against uploaded or recorded positions rather than a real-time custodian file.",
      "FIX or equivalent straight-through order routing to executing brokers.",
    ],
  },
  {
    slug: "crystallisation",
    title: "Benefit crystallisation",
    positioning: "LSA and LSDBA tracking after the lifetime allowance, BCE recording and PCLS calculation.",
    maturity: "live",
    what: [
      "Every crystallisation event is recorded with the amount crystallised, the lump sum paid and the date.",
      "Lump sum allowance and lump sum and death benefit allowance usage is tracked cumulatively with remaining headroom shown per member.",
      "PCLS is calculated on the crystallised slice and checked against remaining allowance before payment.",
      "Crystallised and uncrystallised segments are held separately so future events use the correct basis.",
      "Members choose between drawdown designation and annuity purchase, with the comparison illustrated before the instruction is confirmed.",
    ],
    rules: [
      "Lump sum allowance £268,275",
      "Lump sum and death benefit allowance £1,073,100",
      "PCLS capped at 25% of the crystallised amount and at remaining LSA",
      "Normal minimum pension age 55",
      "UFPLS taxed 25% tax free and 75% at marginal rate, triggering the MPAA",
    ],
    screens: [
      { label: "LSA / LSDBA tracking", to: "/lsa" },
      { label: "Drawdown & crystallisation journey", to: "/drawdown" },
      { label: "Retirement quotes", to: "/retirement-quotes" },
      { label: "Pension operations", to: "/operations" },
    ],
    roadmap: [
      "Transitional tax-free amount certificates for members with pre-2024 crystallisations.",
    ],
  },
  {
    slug: "drawdown",
    title: "Drawdown administration",
    positioning: "Capped and flexi-access drawdown, income payments, scheduling and annual reviews.",
    maturity: "live",
    what: [
      "Flexi-access drawdown designation with income set at any level, and legacy capped drawdown segments with GAD-based maximum income.",
      "Income payment scheduling with PAYE calculated on each payment, including emergency code treatment on first payments.",
      "Drip-feed drawdown pays regular tax-free cash and income from phased crystallisations.",
      "Annual drawdown reviews are diarised, with statements produced for the member.",
      "Payment runs feed the payments hub and bank file generation.",
    ],
    rules: [
      "Capped drawdown maximum income reviewed on the scheme cycle using GAD-equivalent rates",
      "Flexi-access drawdown income taxed under PAYE at marginal rates",
      "Emergency month 1 code applied to first payments where no code is held",
      "MPAA triggered on first flexible income payment",
    ],
    screens: [
      { label: "Drawdown journey", to: "/drawdown" },
      { label: "Drip-feed drawdown", to: "/drip-feed" },
      { label: "PAYE dashboard", to: "/paye" },
      { label: "Annual review pack", to: "/annual-review" },
      { label: "Payments hub", to: "/admin/payments" },
      { label: "Payment file store", to: "/admin/payment-files" },
    ],
    roadmap: [
      "Automated tax code updates from HMRC P6 / P9 notices.",
    ],
  },
  {
    slug: "death-benefits",
    title: "Death benefits",
    positioning: "Nomination management and claims handling through to payment.",
    maturity: "live",
    what: [
      "Members record expression of wish nominations with percentage splits, reviewed and updated online.",
      "Death claims are opened as cases, with notification, evidence, beneficiary verification and trustee discretion steps tracked.",
      "Benefit options are calculated for each beneficiary, including lump sum and beneficiary drawdown.",
      "LSDBA usage is applied to lump sum death benefits.",
    ],
    rules: [
      "Lump sum and death benefit allowance applied to relevant lump sums",
      "Death before 75 versus after 75 tax treatment on benefits paid",
      "Two year payment window for tax-free lump sum death benefits",
      "Trustee discretion recorded to keep benefits outside the estate",
    ],
    screens: [
      { label: "Beneficiary nominations", to: "/beneficiaries" },
      { label: "Death claims", to: "/death-claims" },
      { label: "LSA / LSDBA tracking", to: "/lsa" },
      { label: "IHT planning view", to: "/iht" },
    ],
    roadmap: [
      "Beneficiary self-service claim portal with document upload.",
    ],
  },
  {
    slug: "tax-reporting",
    title: "Tax reporting",
    positioning: "HMRC event reporting, pension income tax documents and relief at source returns.",
    maturity: "partial",
    what: [
      "Reportable events are captured as they happen and assembled into an event report with line-level detail.",
      "Real time information submissions are prepared for pension income paid under PAYE.",
      "End of year documents equivalent to P60, and P45 equivalents on cessation, are produced for members taking pension income.",
      "Relief-at-source reclaim lines are gathered into a return with the member detail HMRC requires.",
      "Submission history is retained with status against each return.",
    ],
    rules: [
      "APSS event report for reportable events in the tax year",
      "RTI full payment submissions for pension payroll",
      "Relief at source annual return and interim claims",
      "P60 by 31 May and P45 equivalents on cessation of pension income",
    ],
    screens: [
      { label: "HMRC reporting", to: "/hmrc" },
      { label: "PAYE dashboard", to: "/paye" },
      { label: "Reporting suite", to: "/reporting" },
      { label: "Regulatory calendar", to: "/admin/reg-calendar" },
    ],
    roadmap: [
      "Direct submission to HMRC via the Managing Pension Schemes and RTI gateways — returns are produced and staged in the system, transmission is not yet automated.",
    ],
  },
  {
    slug: "illustrations",
    title: "Illustrations",
    positioning: "Key features illustrations, retirement figures, wake-up packs and statutory statements.",
    maturity: "live",
    what: [
      "Key features illustrations model the accumulation phase with existing pots, contributions and transfers in, then the decumulation phase with tax-free cash and income.",
      "Indicative retirement figures are produced for members approaching a decision, showing drawdown against annuity.",
      "Pre-retirement wake-up packs are diarised and generated with the required risk warnings.",
      "Statutory money purchase illustrations run for the whole book on the annual cycle.",
      "Illustrations can be emailed to a member and saved into the adviser's own library for later reference.",
    ],
    rules: [
      "COBS 13 key features illustrations with prescribed projection rates and charges",
      "COBS 19.4 indicative retirement figures",
      "COBS 19.9 wake-up packs and retirement risk warnings",
      "SMPI statutory money purchase illustrations to the FRC assumptions",
      "Costs and charges disclosure alongside the projection",
    ],
    screens: [
      { label: "Pension illustration", to: "/illustration" },
      { label: "Saved illustrations", to: "/saved-illustrations" },
      { label: "SMPI runner", to: "/smpi" },
      { label: "Benefit statements", to: "/benefit-statements" },
      { label: "Costs & charges", to: "/costs" },
      { label: "Monte Carlo projection", to: "/projection" },
    ],
    roadmap: [
      "Automated annual refresh of projection assumptions from the published FRC and FCA rates.",
    ],
  },
  {
    slug: "cass",
    title: "Reconciliation & CASS",
    positioning: "Client money and asset reconciliation, breach recording and daily checks.",
    maturity: "live",
    what: [
      "Bank statement files are uploaded at book-of-business level and matched, allocated and applied against expected receipts.",
      "Daily internal client money reconciliation compares the internal ledger with the bank balance and records the variance.",
      "Custody asset reconciliation compares internal positions with external records.",
      "Variances outside tolerance raise a breach with severity, owner and remediation notes.",
      "Reconciliations are signed off daily with an auditable record, and unallocated cash is queued for investigation.",
    ],
    rules: [
      "CASS 7 client money internal and external reconciliation performed each business day",
      "CASS 6 custody asset reconciliation",
      "Breach recording with prompt notification to the FCA where required",
      "Segregation of client money and prompt shortfall funding",
    ],
    screens: [
      { label: "Bank statement upload", to: "/bank-upload" },
      { label: "CASS 7 daily reconciliation", to: "/admin/cass7-daily-recon" },
      { label: "CASS reconciliation summary", to: "/cass" },
      { label: "Custody reconciliation engine", to: "/cass-engine" },
      { label: "Unallocated cash", to: "/unallocated-cash" },
      { label: "Breach register", to: "/breach-register" },
      { label: "General ledger", to: "/admin/ledger" },
      { label: "Cash forecast", to: "/admin/cash-forecast" },
    ],
    roadmap: [
      "Direct bank API statement retrieval to replace file upload for participating banks.",
    ],
  },
  {
    slug: "regulatory",
    title: "Regulatory reporting",
    positioning: "Regulatory returns, Consumer Duty management information and complaints.",
    maturity: "partial",
    what: [
      "A regulatory calendar tracks every return, its due date, owner and submission status across FCA, HMRC and Pensions Regulator obligations.",
      "Consumer Duty reviews record outcome testing across the four outcomes with supporting management information.",
      "Management information dashboards cover volumes, service levels, breaches and data quality.",
      "Pensions Regulator breach records are maintained alongside the CASS breach register.",
      "Service level tracking evidences turnaround times against published standards.",
    ],
    rules: [
      "RegData return schedule and submission deadlines",
      "Consumer Duty outcome monitoring and annual board report inputs",
      "DISP complaints handling time limits and reporting",
      "Code of Practice breach reporting to the Pensions Regulator",
    ],
    screens: [
      { label: "Regulatory calendar", to: "/admin/reg-calendar" },
      { label: "Management information", to: "/mi" },
      { label: "Breach register", to: "/breach-register" },
      { label: "SLA tracker", to: "/sla-tracker" },
      { label: "Audit log", to: "/audit-log" },
      { label: "Trustee meetings", to: "/trustee-meetings" },
    ],
    roadmap: [
      "RegData and GABRIEL return generation and submission — the calendar tracks the obligation today, the return itself is prepared outside the system.",
      "A dedicated DISP complaints register with root cause analysis and reportable complaint counts.",
    ],
  },
  {
    slug: "fees",
    title: "Fee & charging engine",
    positioning: "Platform, adviser and event fees calculated, collected and reconciled.",
    maturity: "live",
    what: [
      "Fee schedules define tiered platform fees, fixed annual fees and event charges such as drawdown set-up and payment fees.",
      "Adviser charging supports initial and ongoing fees, taken from the pension or paid separately, with consent recorded.",
      "The monthly fee run calculates charges across the book, posts them to the ledger and raises collections.",
      "Adviser fee reconciliation matches what was calculated with what was paid away, listing differences.",
      "Invoices and cost and charges disclosures are produced for members and advisers.",
    ],
    rules: [
      "Adviser charging rules with client consent and cancellation rights",
      "MiFID II and PRIIPs ex-ante and ex-post costs and charges disclosure",
      "VAT treatment recorded per fee type",
      "Fees taken from client money only where properly due",
    ],
    screens: [
      { label: "Fee engine", to: "/admin" },
      { label: "Adviser fee reconciliation", to: "/admin/adviser-fees" },
      { label: "Invoicing", to: "/invoicing" },
      { label: "Costs & charges", to: "/costs" },
      { label: "General ledger", to: "/admin/ledger" },
    ],
    roadmap: [
      "Automated fee rebates and negotiated adviser tariffs at firm level.",
    ],
  },
];

export const getCapability = (slug?: string) =>
  capabilities.find((c) => c.slug === slug);
