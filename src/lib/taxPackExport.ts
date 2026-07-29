import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { Disposal } from './cgt'
import { estimateCgt, CGT_ALLOWANCE_2026_27 } from './cgt'
import { estimateDividendTax, DIVIDEND_ALLOWANCE_2026_27, type TaxBand } from './dividendTax'

const border = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }
const cellBorders = { top: border, bottom: border, left: border, right: border }

function cell(text: string, opts: { bold?: boolean; shade?: string; align?: 'left' | 'right' } = {}) {
  return new TableCell({
    borders: cellBorders,
    width: { size: 2340, type: WidthType.DXA },
    shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: opts.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
      children: [new TextRun({ text, bold: opts.bold })],
    })],
  })
}

export async function exportAnnualTaxPack(opts: {
  clientName: string
  taxYear: string
  band: TaxBand
  giaDisposals: Disposal[]
  giaDividends: number
  isaDividends: number
  isaSubscription: number
  isaAllowance: number
}) {
  const cgt = estimateCgt(opts.giaDisposals, opts.band === 'basic' ? 'basic' : 'higher')
  const divTax = estimateDividendTax(opts.giaDividends, opts.band)
  const today = new Date().toLocaleDateString('en-GB')

  const disposalRows = [
    new TableRow({
      tableHeader: true,
      children: [
        cell('Date', { bold: true, shade: 'E8EEF5' }),
        cell('Holding', { bold: true, shade: 'E8EEF5' }),
        cell('Units', { bold: true, shade: 'E8EEF5', align: 'right' }),
        cell('Proceeds (£)', { bold: true, shade: 'E8EEF5', align: 'right' }),
        cell('Cost (£)', { bold: true, shade: 'E8EEF5', align: 'right' }),
        cell('Gain/Loss (£)', { bold: true, shade: 'E8EEF5', align: 'right' }),
      ],
    }),
    ...opts.giaDisposals.map(d => new TableRow({
      children: [
        cell(d.date),
        cell(d.holdingName),
        cell(d.units.toFixed(2), { align: 'right' }),
        cell(d.proceeds.toFixed(2), { align: 'right' }),
        cell(d.costAllocated.toFixed(2), { align: 'right' }),
        cell(d.gain.toFixed(2), { align: 'right', bold: true }),
      ],
    })),
  ]

  const doc = new Document({
    creator: 'Pension Navigator by Airgead',
    title: `Annual Tax Pack ${opts.taxYear}`,
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial', color: '1A365D' },
          paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Arial', color: '2C5282' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Annual Tax Pack')] }),
        new Paragraph({ children: [
          new TextRun({ text: `Client: `, bold: true }), new TextRun(opts.clientName), new TextRun({ text: '   ·   ' }),
          new TextRun({ text: `Tax year: `, bold: true }), new TextRun(opts.taxYear), new TextRun({ text: '   ·   ' }),
          new TextRun({ text: `Generated: `, bold: true }), new TextRun(today),
        ]}),
        new Paragraph({ children: [new TextRun({
          text: 'Prepared by Pension Navigator by Airgead. Estimates only — please consult your adviser before filing.',
          italics: true, color: '6B7280', size: 18,
        })]}),

        // CGT
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1. Capital Gains — General Investment Account')] }),
        new Paragraph({ children: [new TextRun(
          `Disposals are matched under HMRC share-identification rules: same-day, then 30-day (bed & breakfast), then s104 pooled holding.`,
        )]}),
        new Table({
          width: { size: 14040, type: WidthType.DXA },
          columnWidths: [2340, 2340, 2340, 2340, 2340, 2340],
          rows: disposalRows.length > 1 ? disposalRows : [
            ...disposalRows,
            new TableRow({ children: [cell('No disposals in this tax year', { align: 'left' }), cell(''), cell(''), cell(''), cell(''), cell('')] }),
          ],
        }),
        new Paragraph({ children: [new TextRun('')] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [5860, 3500],
          rows: [
            ['Gross gains', `£${cgt.gross.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
            ['Losses', `£${cgt.losses.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
            ['Net gain', `£${cgt.netGain.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
            [`Annual exempt amount (£${CGT_ALLOWANCE_2026_27.toLocaleString()})`, `£${cgt.allowanceUsed.toLocaleString(undefined, { maximumFractionDigits: 2 })} used`],
            ['Taxable gain', `£${cgt.taxable.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
            [`CGT liability @ ${(cgt.rate * 100).toFixed(0)}%`, `£${cgt.liability.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
          ].map(([k, v], i) => new TableRow({
            children: [cell(k, { bold: i === 5 }), cell(v, { align: 'right', bold: i === 5, shade: i === 5 ? 'FEF3C7' : undefined })],
          })),
        }),

        // Dividend tax
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2. Dividend Tax — General Investment Account')] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [5860, 3500],
          rows: [
            ['Gross dividends received (GIA)', `£${divTax.gross.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
            [`Dividend allowance (£${DIVIDEND_ALLOWANCE_2026_27})`, `£${divTax.allowance.toLocaleString(undefined, { maximumFractionDigits: 2 })} used`],
            ['Taxable dividends', `£${divTax.taxable.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
            [`Dividend tax @ ${(divTax.rate * 100).toFixed(2)}% (${divTax.band} rate)`, `£${divTax.liability.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
          ].map(([k, v], i) => new TableRow({
            children: [cell(k, { bold: i === 3 }), cell(v, { align: 'right', bold: i === 3, shade: i === 3 ? 'FEF3C7' : undefined })],
          })),
        }),

        // ISA summary
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('3. ISA Summary (Tax-Free)')] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [5860, 3500],
          rows: [
            ['ISA subscription this year', `£${opts.isaSubscription.toLocaleString()}`],
            ['ISA allowance', `£${opts.isaAllowance.toLocaleString()}`],
            ['Allowance remaining', `£${(opts.isaAllowance - opts.isaSubscription).toLocaleString()}`],
            ['Tax-free dividends received', `£${opts.isaDividends.toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
          ].map(([k, v]) => new TableRow({ children: [cell(k), cell(v, { align: 'right' })] })),
        }),

        // Total
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('Total estimated tax liability')] }),
        new Paragraph({ children: [new TextRun({
          text: `£${(cgt.liability + divTax.liability).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
          bold: true, size: 36, color: '991B1B',
        })]}),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `tax-pack-${opts.taxYear.replace('/', '-')}-${opts.clientName.replace(/\s+/g, '-')}.docx`)
}
