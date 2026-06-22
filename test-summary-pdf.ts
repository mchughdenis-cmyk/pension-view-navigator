import { generateSummaryPdf } from "./src/lib/compliantIllustration";

generateSummaryPdf({
  potValue: 250000,
  transferIn: 0,
  annualContribution: 6000,
  currentAge: 55,
  retirementAge: 65,
  lifeExpectancy: 85,
  drawdownRate: 4,
  annualGrowth: 5,
  annuityRate: 5.2,
  inflationRate: 2.5,
  clientName: "Test Client",
});
