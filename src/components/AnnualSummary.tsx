import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Building2
} from "lucide-react";
import { downloadAirgeadHtml, airgeadHtmlHeader, airgeadHtmlFooter } from "@/lib/documentUtils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Mock data for the annual summary
const annualSummaryData = {
  taxYear: "2026/27",
  generatedDate: new Date().toISOString(),
  client: {
    name: "John Smith",
    clientRef: "JS001234",
    dateOfBirth: "15th March 1970"
  },
  summary: {
    startValue: 420750,
    endValue: 485750,
    totalGrowth: 65000,
    growthPercentage: 15.4,
    totalContributions: 40400,
    totalWithdrawals: 3600
  },
  pensions: [
    {
      provider: "Aviva Personal Pension",
      type: "accumulation",
      startValue: 115000,
      endValue: 125000,
      contributions: 8400,
      withdrawals: 0,
      growth: 1600,
      growthPercentage: 1.4
    },
    {
      provider: "Legal & General SIPP",
      type: "accumulation",
      startValue: 248000,
      endValue: 280000,
      contributions: 32000,
      withdrawals: 0,
      growth: 0,
      growthPercentage: 0
    },
    {
      provider: "Prudential Drawdown",
      type: "drawdown",
      startValue: 57750,
      endValue: 80750,
      contributions: 0,
      withdrawals: 3600,
      growth: 26600,
      growthPercentage: 46.1
    }
  ],
  transactions: [
    { date: "2025-04-15", type: "Contribution", provider: "Aviva", amount: 2000 },
    { date: "2025-05-20", type: "Contribution", provider: "Legal & General", amount: 8000 },
    { date: "2025-06-10", type: "Drawdown", provider: "Prudential", amount: -300 },
    { date: "2025-07-15", type: "Contribution", provider: "Aviva", amount: 2000 },
    { date: "2025-08-20", type: "Contribution", provider: "Legal & General", amount: 8000 },
    { date: "2025-09-10", type: "Drawdown", provider: "Prudential", amount: -300 },
    { date: "2025-10-15", type: "Contribution", provider: "Aviva", amount: 2200 },
    { date: "2025-11-20", type: "Contribution", provider: "Legal & General", amount: 8000 },
    { date: "2025-12-10", type: "Drawdown", provider: "Prudential", amount: -300 },
    { date: "2026-01-15", type: "Contribution", provider: "Aviva", amount: 2200 },
    { date: "2026-02-20", type: "Contribution", provider: "Legal & General", amount: 8000 },
    { date: "2026-03-10", type: "Drawdown", provider: "Prudential", amount: -300 }
  ]
};

interface AnnualSummaryProps {
  onDownload?: () => void;
}

export default function AnnualSummary({ onDownload }: AnnualSummaryProps) {
  const handleDownload = () => {
    const bodyContent = `
      <h2>Annual Pension Summary</h2>
      <p><strong>Tax Year:</strong> ${annualSummaryData.taxYear}</p>
      <p><strong>Client:</strong> ${annualSummaryData.client.name} (${annualSummaryData.client.clientRef})</p>
      <p><strong>Generated:</strong> ${formatDate(annualSummaryData.generatedDate)}</p>

      <div class="summary-card">
        <h2>Portfolio Summary</h2>
        <p><strong>Start of Year Value:</strong> <span class="currency">${formatCurrency(annualSummaryData.summary.startValue)}</span></p>
        <p><strong>End of Year Value:</strong> <span class="currency">${formatCurrency(annualSummaryData.summary.endValue)}</span></p>
        <p><strong>Total Growth:</strong> <span class="currency positive">${formatCurrency(annualSummaryData.summary.totalGrowth)}</span> (${annualSummaryData.summary.growthPercentage}%)</p>
        <p><strong>Total Contributions:</strong> <span class="currency">${formatCurrency(annualSummaryData.summary.totalContributions)}</span></p>
        <p><strong>Total Withdrawals:</strong> <span class="currency">${formatCurrency(annualSummaryData.summary.totalWithdrawals)}</span></p>
      </div>

      <h2>Individual Pension Performance</h2>
      ${annualSummaryData.pensions.map(pension => `
        <div class="detail-card">
          <h3>${pension.provider}</h3>
          <p><strong>Type:</strong> ${pension.type}</p>
          <p><strong>Start Value:</strong> ${formatCurrency(pension.startValue)} → <strong>End Value:</strong> ${formatCurrency(pension.endValue)}</p>
          <p><strong>Growth:</strong> ${formatCurrency(pension.growth)} (${pension.growthPercentage}%)</p>
        </div>
      `).join('')}

      <h2>Transaction History</h2>
      <table>
        <thead><tr><th>Date</th><th>Type</th><th>Provider</th><th>Amount</th></tr></thead>
        <tbody>
          ${annualSummaryData.transactions.map(t => `
            <tr>
              <td>${formatDate(t.date)}</td>
              <td>${t.type}</td>
              <td>${t.provider}</td>
              <td class="${t.amount >= 0 ? 'positive' : 'negative'}">${formatCurrency(Math.abs(t.amount))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    downloadAirgeadHtml(
      `Annual Summary ${annualSummaryData.taxYear}`,
      `Annual-Summary-${annualSummaryData.taxYear.replace('/', '-')}.html`,
      bodyContent
    );
    
    if (onDownload) onDownload();
  };



  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <BackButton label="Back to Products" />
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Annual Summary</h1>
          <p className="text-muted-foreground mt-1">
            Tax Year {annualSummaryData.taxYear} • Generated {formatDate(annualSummaryData.generatedDate)}
          </p>
        </div>
        <Button onClick={handleDownload} className="bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Client Name</p>
              <p className="font-medium">{annualSummaryData.client.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client Reference</p>
              <p className="font-medium">{annualSummaryData.client.clientRef}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{annualSummaryData.client.dateOfBirth}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Portfolio Summary - {annualSummaryData.taxYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Start of Year</p>
              <p className="text-2xl font-bold">{formatCurrency(annualSummaryData.summary.startValue)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">End of Year</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(annualSummaryData.summary.endValue)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Growth</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(annualSummaryData.summary.totalGrowth)}
              </p>
              <p className="text-sm text-success">+{annualSummaryData.summary.growthPercentage}%</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium">Total Contributions</p>
                  <p className="text-sm text-muted-foreground">Money added</p>
                </div>
              </div>
              <p className="text-lg font-bold text-success">
                {formatCurrency(annualSummaryData.summary.totalContributions)}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg">
              <div className="flex items-center gap-3">
                <ArrowDownRight className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium">Total Withdrawals</p>
                  <p className="text-sm text-muted-foreground">Money taken</p>
                </div>
              </div>
              <p className="text-lg font-bold text-warning">
                {formatCurrency(annualSummaryData.summary.totalWithdrawals)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Pension Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Pension Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {annualSummaryData.pensions.map((pension, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{pension.provider}</h3>
                  <Badge variant={pension.type === 'accumulation' ? 'default' : 'secondary'}>
                    {pension.type}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Growth</p>
                  <p className={`font-bold ${pension.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pension.growth >= 0 ? '+' : ''}{formatCurrency(pension.growth)}
                  </p>
                  <p className={`text-xs ${pension.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {pension.growthPercentage >= 0 ? '+' : ''}{pension.growthPercentage}%
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Value</p>
                  <p className="font-medium">{formatCurrency(pension.startValue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Value</p>
                  <p className="font-medium">{formatCurrency(pension.endValue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contributions</p>
                  <p className="font-medium text-success">{formatCurrency(pension.contributions)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Withdrawals</p>
                  <p className="font-medium text-warning">{formatCurrency(pension.withdrawals)}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {annualSummaryData.transactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  {transaction.type === 'Contribution' ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-warning" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">{transaction.provider}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.amount >= 0 ? 'text-success' : 'text-warning'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}