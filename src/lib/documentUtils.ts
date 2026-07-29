import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import airgeadLogoUrl from '@/assets/airgead-logo.png';

// ---- Active firm branding (set by FirmProvider) -----------------------------
// Lets every document exporter automatically pick up the current firm's logo,
// name and primary colour without changing any call sites.
type ActiveBrand = { logoUrl: string; firmName: string; primaryColor: string };
const DEFAULT_BRAND: ActiveBrand = {
  logoUrl: airgeadLogoUrl,
  firmName: 'Pension Navigator',
  primaryColor: '#0066cc',
};
let activeBrand: ActiveBrand = { ...DEFAULT_BRAND };

export function setActiveDocumentBrand(brand: Partial<ActiveBrand> | null) {
  if (!brand) { activeBrand = { ...DEFAULT_BRAND }; cachedLogo = null; return; }
  const next = {
    logoUrl: brand.logoUrl || DEFAULT_BRAND.logoUrl,
    firmName: brand.firmName || DEFAULT_BRAND.firmName,
    primaryColor: brand.primaryColor || DEFAULT_BRAND.primaryColor,
  };
  if (next.logoUrl !== activeBrand.logoUrl) cachedLogo = null;
  activeBrand = next;
}

let cachedLogo: { url: string; bytes: ArrayBuffer } | null = null;
async function getLogoBytes(): Promise<ArrayBuffer> {
  const url = activeBrand.logoUrl;
  if (cachedLogo && cachedLogo.url === url) return cachedLogo.bytes;
  const response = await fetch(url);
  const bytes = await response.arrayBuffer();
  cachedLogo = { url, bytes };
  return bytes;
}

function hexNoHash(c: string) { return (c || '').replace('#', '').slice(0, 6) || '0066CC'; }

export function airgeadHtmlHeader(): string {
  const { logoUrl, firmName, primaryColor } = activeBrand;
  return `
    <div style="display:flex;align-items:center;gap:16px;border-bottom:2px solid ${primaryColor};padding-bottom:20px;margin-bottom:30px;">
      <img src="${logoUrl}" alt="${firmName}" style="width:48px;height:48px;border-radius:8px;object-fit:contain;background:#fff;" />
      <div>
        <h1 style="margin:0;font-size:28px;">${firmName}</h1>
        <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;">Pension Navigator · powered by Airgead</p>
      </div>
    </div>`;
}

export function airgeadHtmlFooter(): string {
  const { firmName } = activeBrand;
  return `
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #ddd;text-align:center;color:#888;font-size:11px;">
      <p>© ${new Date().getFullYear()} ${firmName} · Pension Navigator platform by Airgead.</p>
      <p>This document is for informational purposes only and should not be considered as financial advice.</p>
    </div>`;
}

function logoImageType(url: string): 'png' | 'jpg' | 'gif' | 'bmp' {
  const u = url.toLowerCase();
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'jpg';
  if (u.endsWith('.gif')) return 'gif';
  if (u.endsWith('.bmp')) return 'bmp';
  return 'png';
}

export async function createAirgeadDocxHeader(): Promise<Paragraph[]> {
  const logoBytes = await getLogoBytes();
  const { firmName, primaryColor } = activeBrand;
  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: logoBytes,
          transformation: { width: 60, height: 60 },
          type: logoImageType(activeBrand.logoUrl),
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: firmName, bold: true, size: 36, color: hexNoHash(primaryColor) }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Pension Navigator · powered by Airgead', size: 18, color: '888888', allCaps: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
  ];
}

export function createAirgeadDocxFooter(): Paragraph[] {
  const { firmName } = activeBrand;
  return [
    new Paragraph({
      children: [
        new TextRun({ text: `© ${new Date().getFullYear()} ${firmName} · Pension Navigator platform by Airgead.`, size: 16, color: '888888' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD', space: 10 } },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'This document is for informational purposes only and should not be considered as financial advice.', size: 16, color: '888888', italics: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  ];
}

export async function downloadAirgeadDocx(title: string, filename: string, contentParagraphs: Paragraph[]) {
  const header = await createAirgeadDocxHeader();
  const footer = createAirgeadDocxFooter();

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
        },
      },
      children: [
        ...header,
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        ...contentParagraphs,
        ...footer,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

export function downloadAirgeadHtml(title: string, filename: string, bodyContent: string) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} — Pension Navigator by Airgead</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #333; max-width: 900px; margin: 40px auto; }
    .summary-card { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .detail-card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f1f1f1; font-weight: 600; }
    .positive { color: #16a34a; }
    .negative { color: #dc2626; }
    .currency { font-weight: bold; }
    h2 { color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  ${airgeadHtmlHeader()}
  ${bodyContent}
  ${airgeadHtmlFooter()}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

// Pre-built document generators for demo templates
export async function downloadWelcomeLetter(clientName: string = 'New Client') {
  const content = [
    new Paragraph({ text: `Dear ${clientName},`, spacing: { after: 200 } }),
    new Paragraph({ text: 'Welcome to Pension Navigator by Airgead. We are delighted to confirm your registration on our platform.', spacing: { after: 200 } }),
    new Paragraph({ text: 'Your Account Details', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Platform: ', bold: true }), new TextRun('Pension Navigator by Airgead')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Account Type: ', bold: true }), new TextRun('Self-Invested Personal Pension (SIPP)')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Adviser: ', bold: true }), new TextRun('Assigned upon onboarding completion')], spacing: { after: 200 } }),
    new Paragraph({ text: 'What Happens Next', heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 200 } }),
    new Paragraph({ text: '1. Complete your KYC/AML verification', bullet: { level: 0 }, spacing: { after: 100 } }),
    new Paragraph({ text: '2. Set up your investment preferences and risk profile', bullet: { level: 0 }, spacing: { after: 100 } }),
    new Paragraph({ text: '3. Make your initial contribution or transfer existing pensions', bullet: { level: 0 }, spacing: { after: 100 } }),
    new Paragraph({ text: '4. Access your personalised dashboard', bullet: { level: 0 }, spacing: { after: 200 } }),
    new Paragraph({ text: 'If you have any questions, please contact our support team.', spacing: { after: 200 } }),
    new Paragraph({ text: 'Kind regards,', spacing: { before: 300, after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'The Airgead Team', bold: true })], spacing: { after: 100 } }),
  ];
  await downloadAirgeadDocx('Welcome Letter', `Welcome-Letter-${clientName.replace(/\s/g, '-')}.docx`, content);
}

export async function downloadBenefitStatement(clientName: string = 'John Smith') {
  const content = [
    new Paragraph({ children: [new TextRun({ text: `Client: ${clientName}`, bold: true })], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: `Statement Date: ${new Date().toLocaleDateString('en-GB')}` })], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Tax Year: 2023/24' })], spacing: { after: 300 } }),
    new Paragraph({ text: 'Portfolio Summary', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Total Fund Value: ', bold: true }), new TextRun('£485,750')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Total Contributions: ', bold: true }), new TextRun('£40,400')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Investment Growth: ', bold: true }), new TextRun('£65,000 (+15.4%)')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Total Withdrawals: ', bold: true }), new TextRun('£3,600')], spacing: { after: 300 } }),
    new Paragraph({ text: 'Scheme Breakdown', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Aviva Personal Pension: ', bold: true }), new TextRun('£125,000 (Accumulation)')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Legal & General SIPP: ', bold: true }), new TextRun('£280,000 (Accumulation)')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Prudential Drawdown: ', bold: true }), new TextRun('£80,750 (Drawdown)')], spacing: { after: 300 } }),
    new Paragraph({ text: 'Annual Allowance', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Annual Allowance: ', bold: true }), new TextRun('£60,000')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Used This Year: ', bold: true }), new TextRun('£40,400')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Remaining: ', bold: true }), new TextRun('£19,600')], spacing: { after: 200 } }),
    new Paragraph({ text: 'Projected Retirement Income', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ text: 'Based on current fund value and assumed growth of 5% per annum:', spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Projected Fund at 65: ', bold: true }), new TextRun('£791,200')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Estimated Annual Income (4% drawdown): ', bold: true }), new TextRun('£31,648')], spacing: { after: 200 } }),
  ];
  await downloadAirgeadDocx('Annual Benefit Statement', `Benefit-Statement-${clientName.replace(/\s/g, '-')}-2023-24.docx`, content);
}

export async function downloadTransferConfirmation(clientName: string = 'Emma Wilson') {
  const content = [
    new Paragraph({ children: [new TextRun({ text: `Client: ${clientName}`, bold: true })], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: `Date: ${new Date().toLocaleDateString('en-GB')}` })], spacing: { after: 300 } }),
    new Paragraph({ text: 'Transfer Details', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Transfer Reference: ', bold: true }), new TextRun('TRF-2026-0115')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Previous Provider: ', bold: true }), new TextRun('Aviva plc')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Previous Scheme: ', bold: true }), new TextRun('Aviva Personal Pension')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Transfer Value: ', bold: true }), new TextRun('£25,000.00')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Transfer Type: ', bold: true }), new TextRun('Cash Transfer')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Receiving Scheme: ', bold: true }), new TextRun('Pension Navigator SIPP')], spacing: { after: 300 } }),
    new Paragraph({ text: 'This confirms that the above transfer has been received and allocated to your SIPP account.', spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'The Airgead Team', bold: true })], spacing: { before: 200 } }),
  ];
  await downloadAirgeadDocx('Transfer Confirmation', `Transfer-Confirmation-${clientName.replace(/\s/g, '-')}.docx`, content);
}

export async function downloadDrawdownConfirmation(clientName: string = 'David Thompson') {
  const content = [
    new Paragraph({ children: [new TextRun({ text: `Client: ${clientName}`, bold: true })], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: `Date: ${new Date().toLocaleDateString('en-GB')}` })], spacing: { after: 300 } }),
    new Paragraph({ text: 'Drawdown Payment Confirmation', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Reference: ', bold: true }), new TextRun('DWN-2026-0115')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Payment Amount: ', bold: true }), new TextRun('£3,000.00')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Payment Type: ', bold: true }), new TextRun('Monthly Drawdown')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Tax Deducted (20%): ', bold: true }), new TextRun('£600.00')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Net Payment: ', bold: true }), new TextRun('£2,400.00')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Paid To: ', bold: true }), new TextRun('****1234 (Barclays)')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Remaining Fund Value: ', bold: true }), new TextRun('£747,000.00')], spacing: { after: 300 } }),
    new Paragraph({ text: 'Your next scheduled drawdown payment is due on 15th February 2024.', spacing: { after: 200 } }),
  ];
  await downloadAirgeadDocx('Drawdown Confirmation', `Drawdown-Confirmation-${clientName.replace(/\s/g, '-')}.docx`, content);
}

export async function downloadFeeSchedule() {
  const content = [
    new Paragraph({ children: [new TextRun({ text: `Effective Date: ${new Date().toLocaleDateString('en-GB')}` })], spacing: { after: 300 } }),
    new Paragraph({ text: 'Platform Fees', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Annual Platform Fee: ', bold: true }), new TextRun('0.25% of fund value')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Dealing Fee: ', bold: true }), new TextRun('£0 for funds, £9.99 per equity trade')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Drawdown Fee: ', bold: true }), new TextRun('£0 per payment')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Transfer Out Fee: ', bold: true }), new TextRun('£0')], spacing: { after: 300 } }),
    new Paragraph({ text: 'Adviser Charges', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: 'Initial Advice Fee: ', bold: true }), new TextRun('As agreed with your adviser (typically 1-3%)')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Ongoing Advice Fee: ', bold: true }), new TextRun('As agreed with your adviser (typically 0.5-1%)')], spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: 'Ad-hoc Fee: ', bold: true }), new TextRun('As agreed per engagement')], spacing: { after: 300 } }),
    new Paragraph({ text: 'Fund Charges', heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 200 } }),
    new Paragraph({ text: 'Fund charges (OCF/TER) vary by fund and are deducted from the fund price. Please refer to your individual fund factsheets for details.', spacing: { after: 200 } }),
  ];
  await downloadAirgeadDocx('Fee Schedule', 'Airgead-Fee-Schedule.docx', content);
}
