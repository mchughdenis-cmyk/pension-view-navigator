import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, Eye, Download } from "lucide-react";
import { downloadAirgeadHtml } from "@/lib/documentUtils";

interface PrintSection {
  id: string;
  label: string;
  included: boolean;
}

interface PrintablePortfolioReportProps {
  pensionData: any;
  otherAssets: number;
  propertyValue: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function PrintablePortfolioReport({ 
  pensionData, 
  otherAssets, 
  propertyValue 
}: PrintablePortfolioReportProps) {
  const [sections, setSections] = useState<PrintSection[]>([
    { id: 'overview', label: 'Portfolio Overview', included: true },
    { id: 'pensions', label: 'Individual Pension Schemes', included: true },
    { id: 'drawdown', label: 'Drawdown Details', included: true },
    { id: 'investments', label: 'Investment Allocation', included: true },
    { id: 'allowances', label: 'Annual Allowances', included: true },
    { id: 'otherProducts', label: 'Other Products (ISA/GIA)', included: false },
    { id: 'iht', label: 'Inheritance Tax Analysis', included: true },
    { id: 'transfers', label: 'Transfer History', included: false },
  ]);

  const [showPreview, setShowPreview] = useState(false);

  const handleSectionToggle = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, included: !section.included }
        : section
    ));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const bodyContent = `
      <h2>Portfolio Overview</h2>
      <p><strong>Total Portfolio Value:</strong> ${formatCurrency(pensionData.totalValue)}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
      <h2>Pension Schemes</h2>
      ${pensionData.pensions.map((p: any) => `
        <div class="detail-card">
          <h3>${p.provider} (${p.type})</h3>
          <p><strong>Value:</strong> ${formatCurrency(p.value)} | <strong>Growth:</strong> ${p.growth >= 0 ? '+' : ''}${p.growth}%</p>
        </div>
      `).join('')}
      <h2>Investment Allocation</h2>
      <table>
        <thead><tr><th>Fund</th><th>Allocation</th><th>Value</th></tr></thead>
        <tbody>${pensionData.investments.map((inv: any) => `<tr><td>${inv.name}</td><td>${inv.allocation}%</td><td>${formatCurrency(inv.value)}</td></tr>`).join('')}</tbody>
      </table>
      <h2>IHT Analysis</h2>
      <p><strong>Total Estate:</strong> ${formatCurrency(totalEstateValue)}</p>
      <p><strong>IHT Liability:</strong> ${formatCurrency(ihtLiability)}</p>
    `;
    downloadAirgeadHtml('Portfolio Report', 'Portfolio-Report.html', bodyContent);
  };

  // Calculate IHT data
  const totalEstateValue = pensionData.totalValue + otherAssets + propertyValue;
  const ihtThreshold = 500000;
  const ihtLiability = totalEstateValue > ihtThreshold ? (totalEstateValue - ihtThreshold) * 0.4 : 0;
  const drawdownPensions = pensionData.pensions.filter((p: any) => p.type === 'drawdown');

  const PrintContent = () => (
    <div className="print:text-black print:bg-white space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4 print:border-black">
        <h1 className="text-2xl font-bold">Pension Navigator by Airgead</h1>
        <p className="text-lg font-semibold mt-1">Portfolio Report</p>
        <p className="text-muted-foreground print:text-gray-600">
          Generated on {new Date().toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* Portfolio Overview */}
      {sections.find(s => s.id === 'overview')?.included && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Portfolio Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded print:border-black">
              <p className="text-sm text-muted-foreground print:text-gray-600">Total Portfolio Value</p>
              <p className="text-lg font-bold">{formatCurrency(pensionData.totalValue)}</p>
            </div>
            <div className="p-3 border rounded print:border-black">
              <p className="text-sm text-muted-foreground print:text-gray-600">In Accumulation</p>
              <p className="text-lg font-bold">
                {formatCurrency(pensionData.pensions.filter((p: any) => p.type === 'accumulation').reduce((sum: number, p: any) => sum + p.value, 0))}
              </p>
            </div>
            <div className="p-3 border rounded print:border-black">
              <p className="text-sm text-muted-foreground print:text-gray-600">In Drawdown</p>
              <p className="text-lg font-bold">
                {formatCurrency(pensionData.pensions.filter((p: any) => p.type === 'drawdown').reduce((sum: number, p: any) => sum + p.value, 0))}
              </p>
            </div>
            <div className="p-3 border rounded print:border-black">
              <p className="text-sm text-muted-foreground print:text-gray-600">Remaining Allowance</p>
              <p className="text-lg font-bold">
                {formatCurrency(pensionData.allowances.annualAllowance - pensionData.allowances.usedThisYear)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Individual Pension Schemes */}
      {sections.find(s => s.id === 'pensions')?.included && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Individual Pension Schemes</h2>
          <div className="space-y-3">
            {pensionData.pensions.map((pension: any) => (
              <div key={pension.id} className="p-3 border rounded print:border-black">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{pension.provider}</h3>
                    <Badge variant={pension.type === 'accumulation' ? 'default' : 'secondary'} className="print:border print:border-black">
                      {pension.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground print:text-gray-600 mt-1">
                      {pension.type === 'accumulation' 
                        ? `Contributions this year: ${formatCurrency(pension.contributionsThisYear || 0)}`
                        : `Annual drawdown: ${formatCurrency(pension.annualDrawdown || 0)}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(pension.value)}</p>
                    <p className={`text-sm ${pension.growth >= 0 ? 'text-success print:text-green-600' : 'text-destructive print:text-red-600'}`}>
                      {pension.growth >= 0 ? '+' : ''}{pension.growth}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawdown Details */}
      {sections.find(s => s.id === 'drawdown')?.included && drawdownPensions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Drawdown Details</h2>
          <div className="space-y-4">
            {drawdownPensions.map((pension: any) => (
              <div key={pension.id} className="p-4 border rounded print:border-black">
                <h3 className="font-medium mb-2">{pension.provider}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground print:text-gray-600">Fund Value</p>
                    <p className="font-medium">{formatCurrency(pension.value)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground print:text-gray-600">Annual Drawdown</p>
                    <p className="font-medium">{formatCurrency(pension.annualDrawdown || 0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground print:text-gray-600">Monthly Income</p>
                    <p className="font-medium">{formatCurrency((pension.annualDrawdown || 0) / 12)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground print:text-gray-600">Withdrawal Rate</p>
                    <p className="font-medium">{((pension.annualDrawdown || 0) / pension.value * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investment Allocation */}
      {sections.find(s => s.id === 'investments')?.included && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Investment Allocation</h2>
          <div className="space-y-2">
            {pensionData.investments.map((investment: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 border-b print:border-gray-300">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{investment.name}</span>
                  <span className="text-sm text-muted-foreground print:text-gray-600">{investment.allocation}%</span>
                </div>
                <span className="font-medium">{formatCurrency(investment.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annual Allowances */}
      {sections.find(s => s.id === 'allowances')?.included && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Annual Allowances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded print:border-black">
              <h3 className="font-medium mb-2">Current Year Usage</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Annual Allowance:</span>
                  <span>{formatCurrency(pensionData.allowances.annualAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used This Year:</span>
                  <span>{formatCurrency(pensionData.allowances.usedThisYear)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Remaining:</span>
                  <span>{formatCurrency(pensionData.allowances.annualAllowance - pensionData.allowances.usedThisYear)}</span>
                </div>
              </div>
            </div>
            <div className="p-3 border rounded print:border-black">
              <h3 className="font-medium mb-2">Carry Forward Available</h3>
              <div className="space-y-1 text-sm">
                {pensionData.allowances.carryForward.map((cf: any) => (
                  <div key={cf.year} className="flex justify-between">
                    <span>{cf.year}:</span>
                    <span>{formatCurrency(cf.available)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Products */}
      {sections.find(s => s.id === 'otherProducts')?.included && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Other Investment Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">ISA Accounts</h3>
              <div className="space-y-2">
                {pensionData.otherProducts.isa.map((isa: any) => (
                  <div key={isa.id} className="p-2 border rounded print:border-gray-300 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{isa.provider}</span>
                      <span>{formatCurrency(isa.value)}</span>
                    </div>
                    <div className="text-muted-foreground print:text-gray-600">
                      Growth: {isa.growth >= 0 ? '+' : ''}{isa.growth}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">General Investment Accounts</h3>
              <div className="space-y-2">
                {pensionData.otherProducts.gia.map((gia: any) => (
                  <div key={gia.id} className="p-2 border rounded print:border-gray-300 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{gia.provider}</span>
                      <span>{formatCurrency(gia.value)}</span>
                    </div>
                    <div className="text-muted-foreground print:text-gray-600">
                      Growth: {gia.growth >= 0 ? '+' : ''}{gia.growth}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IHT Analysis */}
      {sections.find(s => s.id === 'iht')?.included && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Inheritance Tax Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded print:border-black">
              <h3 className="font-medium mb-3">Estate Composition</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pension Value:</span>
                  <span className="font-medium">{formatCurrency(pensionData.totalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property Value:</span>
                  <span className="font-medium">{formatCurrency(propertyValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Assets:</span>
                  <span className="font-medium">{formatCurrency(otherAssets)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Estate Value:</span>
                  <span>{formatCurrency(totalEstateValue)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded print:border-black">
              <h3 className="font-medium mb-3">IHT Calculation</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Estate:</span>
                  <span>{formatCurrency(totalEstateValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IHT Threshold:</span>
                  <span>{formatCurrency(ihtThreshold)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Amount:</span>
                  <span>{formatCurrency(Math.max(0, totalEstateValue - ihtThreshold))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>IHT Liability (40%):</span>
                  <span className={ihtLiability > 0 ? 'text-destructive print:text-red-600' : 'text-success print:text-green-600'}>
                    {formatCurrency(ihtLiability)}
                  </span>
                </div>
              </div>
              {ihtLiability > 0 && (
                <div className="mt-3 p-2 bg-destructive/10 print:bg-gray-100 rounded text-xs">
                  <p className="font-medium">IHT Planning Considerations:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Consider pension flexibility on death</li>
                    <li>Review beneficiary nominations</li>
                    <li>Explore gift planning options</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer History */}
      {sections.find(s => s.id === 'transfers')?.included && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Transfer History</h2>
          <div className="space-y-2">
            {pensionData.transfers.map((transfer: any, index: number) => (
              <div key={index} className="p-3 border rounded print:border-black">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transfer.from}</p>
                    <p className="text-sm text-muted-foreground print:text-gray-600">
                      Completed: {new Date(transfer.date).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(transfer.amount)}</p>
                    <Badge variant="secondary" className="print:border print:border-black">
                      {transfer.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground print:text-gray-500 border-t pt-4 print:border-black">
        <p>© {new Date().getFullYear()} Airgead. Pension Navigator — Enterprise Pension Administration Platform.</p>
        <p>This report is for informational purposes only and should not be considered as financial advice.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Printer className="w-4 h-4 mr-2" />
            Generate Printable Report
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Portfolio Report Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Section Selection */}
            <div>
              <h3 className="font-medium mb-3">Select sections to include:</h3>
              <div className="grid grid-cols-2 gap-3">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={section.included}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                    />
                    <label htmlFor={section.id} className="text-sm font-medium">
                      {section.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <Separator />

            {/* Preview */}
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4" />
                <span className="font-medium">Preview</span>
              </div>
              <div className="scale-75 origin-top-left transform">
                <PrintContent />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content,
          .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>

      {/* Hidden print content */}
      <div className="print-content hidden print:block">
        <PrintContent />
      </div>
    </div>
  );
}
