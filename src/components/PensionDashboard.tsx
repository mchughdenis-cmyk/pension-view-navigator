import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown,
  ArrowDownRight, 
  DollarSign, 
  FileText, 
  ExternalLink,
  ArrowRightLeft,
  Calculator,
  BookOpen,
  Info as InfoIcon,
  PieChart
} from "lucide-react";

// Mock data for pensions
const pensionData = {
  totalValue: 485750,
  pensions: [
    {
      id: 1,
      provider: "Aviva Personal Pension",
      type: "accumulation",
      value: 125000,
      contributionsThisYear: 8400,
      growth: 2.5
    },
    {
      id: 2,
      provider: "Legal & General SIPP",
      type: "accumulation", 
      value: 280000,
      contributionsThisYear: 32000,
      growth: 4.2
    },
    {
      id: 3,
      provider: "Prudential Drawdown",
      type: "drawdown",
      value: 80750,
      annualDrawdown: 3600,
      growth: -1.2
    }
  ],
  otherProducts: {
    gia: [
      {
        id: 1,
        provider: "Hargreaves Lansdown GIA",
        value: 75000,
        growth: 3.1,
        monthlyContribution: 500
      },
      {
        id: 2,
        provider: "AJ Bell GIA",
        value: 42000,
        growth: 2.8,
        monthlyContribution: 300
      }
    ],
    isa: [
      {
        id: 1,
        provider: "Vanguard S&S ISA",
        value: 85000,
        growth: 4.5,
        contributionsThisYear: 18000,
        remainingAllowance: 2000
      },
      {
        id: 2,
        provider: "Premium Bonds",
        value: 15000,
        growth: 1.4,
        contributionsThisYear: 2000,
        remainingAllowance: 0
      }
    ]
  },
  allowances: {
    annualAllowance: 60000,
    usedThisYear: 40400,
    carryForward: [
      { year: "2021/22", available: 22000 },
      { year: "2022/23", available: 18500 },
      { year: "2023/24", available: 15200 }
    ]
  },
  investments: [
    { name: "Global Equity Fund", allocation: 45, value: 218337 },
    { name: "UK Government Bonds", allocation: 25, value: 121437 },
    { name: "Corporate Bond Fund", allocation: 15, value: 72862 },
    { name: "Emerging Markets", allocation: 10, value: 48575 },
    { name: "Cash", allocation: 5, value: 24287 }
  ],
  transfers: [
    { from: "Old Company Scheme", amount: 45000, date: "2024-03-15", status: "completed" },
    { from: "Previous SIPP", amount: 32000, date: "2024-01-10", status: "completed" }
  ]
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function PensionDashboard() {
  const remainingAllowance = pensionData.allowances.annualAllowance - pensionData.allowances.usedThisYear;
  const allowanceUsedPercentage = (pensionData.allowances.usedThisYear / pensionData.allowances.annualAllowance) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Pension Portfolio</h1>
            <p className="text-muted-foreground mt-1">Complete overview of your retirement planning</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <ExternalLink className="w-4 h-4 mr-2" />
            Full Dashboard
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(pensionData.totalValue)}</div>
              <p className="text-xs text-muted-foreground">Across all pension schemes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Accumulation</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(pensionData.pensions.filter(p => p.type === 'accumulation').reduce((sum, p) => sum + p.value, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Still building</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Drawdown</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {formatCurrency(pensionData.pensions.filter(p => p.type === 'drawdown').reduce((sum, p) => sum + p.value, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Taking income</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Allowance</CardTitle>
              <Calculator className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(remainingAllowance)}</div>
              <p className="text-xs text-muted-foreground">For this tax year</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="allowances">Allowances</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="other-products">Other Products</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Individual Pensions */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Pension Schemes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pensionData.pensions.map((pension) => (
                    <div key={pension.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{pension.provider}</h3>
                          <Badge variant={pension.type === 'accumulation' ? 'default' : 'secondary'}>
                            {pension.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pension.type === 'accumulation' 
                            ? `Contributions this year: ${formatCurrency(pension.contributionsThisYear || 0)}`
                            : `Annual drawdown: ${formatCurrency(pension.annualDrawdown || 0)}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(pension.value)}</p>
                        <p className={`text-sm ${pension.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {pension.growth >= 0 ? '+' : ''}{pension.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Allowance Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Annual Allowance Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Used this year</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(pensionData.allowances.usedThisYear)} / {formatCurrency(pensionData.allowances.annualAllowance)}
                      </span>
                    </div>
                    <Progress value={allowanceUsedPercentage} className="w-full" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(remainingAllowance)} remaining
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Carry Forward Available</h4>
                    <div className="space-y-2">
                      {pensionData.allowances.carryForward.map((cf) => (
                        <div key={cf.year} className="flex justify-between text-sm">
                          <span>{cf.year}</span>
                          <span className="font-medium">{formatCurrency(cf.available)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <a href="/drawdown">
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Start Drawdown Journey
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/illustration">
                      <Calculator className="w-4 h-4 mr-2" />
                      Create Income Illustration
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/transfer">
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Transfer In
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/transfer-out">
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Transfer Out
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Statements
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/welcome-pack">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Digital Welcome Pack
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="investments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Investment Allocation</CardTitle>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Amend Investments
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pensionData.investments.map((investment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{investment.name}</p>
                        <p className="text-sm text-muted-foreground">{investment.allocation}% allocation</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(investment.value)}</p>
                        <div className="w-24 bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${investment.allocation}%` }}
                          ></div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-4">
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 mt-6">
                    <div className="bg-accent/30 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <InfoIcon className="w-4 h-4" />
                        Investment Amendment Options
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <Button variant="outline" className="justify-start">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Rebalance Portfolio
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <PieChart className="w-4 h-4 mr-2" />
                          Change Risk Level
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Calculator className="w-4 h-4 mr-2" />
                          Switch Funds
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          View Fund Performance
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Investment changes may take 3-5 working days to process. Switching charges may apply.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributions">
            <Card>
              <CardHeader>
                <CardTitle>Contribution History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pensionData.pensions.filter(p => p.type === 'accumulation').map((pension) => (
                    <div key={pension.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">{pension.provider}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Contributions this year</p>
                          <p className="font-semibold">{formatCurrency(pension.contributionsThisYear || 0)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Monthly average</p>
                          <p className="font-semibold">{formatCurrency((pension.contributionsThisYear || 0) / 12)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allowances">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Tax Year Allowances</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Annual Allowance</span>
                    <span className="font-semibold">{formatCurrency(pensionData.allowances.annualAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used</span>
                    <span className="font-semibold">{formatCurrency(pensionData.allowances.usedThisYear)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Remaining</span>
                    <span className="font-semibold text-primary">{formatCurrency(remainingAllowance)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Carry Forward Allowances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pensionData.allowances.carryForward.map((cf) => (
                      <div key={cf.year} className="flex justify-between p-3 bg-accent rounded-lg">
                        <span className="font-medium">{cf.year}</span>
                        <span className="font-semibold">{formatCurrency(cf.available)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Available</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(pensionData.allowances.carryForward.reduce((sum, cf) => sum + cf.available, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pensionData.transfers.map((transfer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{transfer.from}</p>
                          <p className="text-sm text-muted-foreground">{transfer.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(transfer.amount)}</p>
                        <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                          {transfer.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other-products">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GIA Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    General Investment Accounts (GIA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pensionData.otherProducts.gia.map((gia) => (
                    <div key={gia.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{gia.provider}</h3>
                        <p className="text-sm text-muted-foreground">
                          Monthly contribution: {formatCurrency(gia.monthlyContribution)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(gia.value)}</p>
                        <p className={`text-sm ${gia.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {gia.growth >= 0 ? '+' : ''}{gia.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total GIA Value</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(pensionData.otherProducts.gia.reduce((sum, gia) => sum + gia.value, 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ISA Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5" />
                    Individual Savings Accounts (ISA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pensionData.otherProducts.isa.map((isa) => (
                    <div key={isa.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{isa.provider}</h3>
                        <p className="text-sm text-muted-foreground">
                          This year: {formatCurrency(isa.contributionsThisYear)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Remaining allowance: {formatCurrency(isa.remainingAllowance)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(isa.value)}</p>
                        <p className={`text-sm ${isa.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {isa.growth >= 0 ? '+' : ''}{isa.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total ISA Value</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(pensionData.otherProducts.isa.reduce((sum, isa) => sum + isa.value, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Total ISA allowance remaining</span>
                      <span>
                        {formatCurrency(pensionData.otherProducts.isa.reduce((sum, isa) => sum + isa.remainingAllowance, 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Important Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Annual Benefit Statement 2024
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Pension Contribution Certificate
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Investment Fund Factsheets
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Tax Relief Documentation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Helpful Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Pension Planning Guide
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Understanding Drawdown
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Annual Allowance Calculator
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Retirement Planning Blog
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}