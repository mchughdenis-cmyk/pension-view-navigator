import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
  PieChart,
  Calendar,
  Edit3,
  Check,
  X,
  AlertTriangle,
  Printer
} from "lucide-react";
import PrintablePortfolioReport from "./PrintablePortfolioReport";

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
  const { toast } = useToast();
  const [editingDrawdown, setEditingDrawdown] = useState<number | null>(null);
  const [newDrawdownAmount, setNewDrawdownAmount] = useState("");
  
  // State for IHT calculations
  const [otherAssets, setOtherAssets] = useState<number>(150000);
  const [propertyValue, setPropertyValue] = useState<number>(400000);
  const [editingIHT, setEditingIHT] = useState<boolean>(false);
  
  const remainingAllowance = pensionData.allowances.annualAllowance - pensionData.allowances.usedThisYear;
  const allowanceUsedPercentage = (pensionData.allowances.usedThisYear / pensionData.allowances.annualAllowance) * 100;

  const drawdownPensions = pensionData.pensions.filter(p => p.type === 'drawdown');
  
  const handleDrawdownEdit = (pensionId: number) => {
    const pension = pensionData.pensions.find(p => p.id === pensionId);
    if (pension && pension.annualDrawdown) {
      setNewDrawdownAmount(pension.annualDrawdown.toString());
      setEditingDrawdown(pensionId);
    }
  };

  const handleDrawdownSave = (pensionId: number) => {
    const amount = parseFloat(newDrawdownAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid drawdown amount.",
        variant: "destructive",
      });
      return;
    }

    // Update the pension data (in a real app, this would be an API call)
    const pension = pensionData.pensions.find(p => p.id === pensionId);
    if (pension) {
      pension.annualDrawdown = amount;
    }

    setEditingDrawdown(null);
    setNewDrawdownAmount("");
    
    toast({
      title: "Drawdown Updated",
      description: `Annual drawdown amount updated to ${formatCurrency(amount)}.`,
    });
  };

  const handleDrawdownCancel = () => {
    setEditingDrawdown(null);
    setNewDrawdownAmount("");
  };

  // IHT calculation functions
  const totalEstateValue = pensionData.totalValue + otherAssets + propertyValue;
  const ihtThreshold = 500000; // Combined nil rate band + residence nil rate band
  const ihtLiability = totalEstateValue > ihtThreshold ? (totalEstateValue - ihtThreshold) * 0.4 : 0;

  const handleIHTSave = () => {
    setEditingIHT(false);
    toast({
      title: "Estate Values Updated",
      description: `Total estate value is now ${formatCurrency(totalEstateValue)}.`,
    });
  };

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
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
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
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/annual-summary">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Statements
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/welcome-pack">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Digital Welcome Pack
                    </a>
                  </Button>
                  <PrintablePortfolioReport 
                    pensionData={pensionData}
                    otherAssets={otherAssets}
                    propertyValue={propertyValue}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="drawdown">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-warning" />
                    Drawdown Income Management
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Manage your pension income withdrawals and inheritance tax implications
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="income" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="income">Income Management</TabsTrigger>
                      <TabsTrigger value="iht">IHT Impact</TabsTrigger>
                    </TabsList>

                    <TabsContent value="income" className="mt-6">
                      {drawdownPensions.length > 0 ? (
                        <div className="space-y-4">
                          {drawdownPensions.map((pension) => (
                            <div key={pension.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold">{pension.provider}</h3>
                                  <Badge variant="secondary">Drawdown Pension</Badge>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Current fund value: {formatCurrency(pension.value)}
                                  </p>
                                </div>
                                <div className={`text-right ${pension.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  <p className="text-sm">Growth this year</p>
                                  <p className="font-medium">
                                    {pension.growth >= 0 ? '+' : ''}{pension.growth}%
                                  </p>
                                </div>
                              </div>

                              <Separator className="my-4" />

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Annual Drawdown</Label>
                                  {editingDrawdown === pension.id ? (
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        value={newDrawdownAmount}
                                        onChange={(e) => setNewDrawdownAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="flex-1"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleDrawdownSave(pension.id)}
                                        className="bg-success hover:bg-success/90"
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDrawdownCancel}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                                      <span className="text-lg font-bold text-warning">
                                        {formatCurrency(pension.annualDrawdown || 0)}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDrawdownEdit(pension.id)}
                                      >
                                        <Edit3 className="w-4 h-4 mr-1" />
                                        Amend
                                      </Button>
                                    </div>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Monthly: {formatCurrency((pension.annualDrawdown || 0) / 12)}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Withdrawal Rate</Label>
                                  <div className="p-3 bg-accent/30 rounded-lg">
                                    <span className="text-lg font-bold">
                                      {((pension.annualDrawdown || 0) / pension.value * 100).toFixed(1)}%
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Of fund value
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Next Payment</Label>
                                  <div className="p-3 bg-accent/30 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">15th Dec 2024</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatCurrency((pension.annualDrawdown || 0) / 12)} due
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Alert className="mt-4">
                                <InfoIcon className="h-4 w-4" />
                                <AlertDescription>
                                  Changes to your drawdown amount may take 5-10 working days to process. 
                                  Consider the sustainability of your withdrawal rate for long-term income.
                                </AlertDescription>
                              </Alert>
                            </div>
                          ))}

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Drawdown Options</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="justify-start h-auto p-4">
                                  <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="w-4 h-4" />
                                      <span className="font-medium">Change Payment Frequency</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Switch between monthly, quarterly, or annual payments
                                    </p>
                                  </div>
                                </Button>

                                <Button variant="outline" className="justify-start h-auto p-4">
                                  <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                      <TrendingUp className="w-4 h-4" />
                                      <span className="font-medium">Review Sustainability</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Check if your withdrawal rate is sustainable
                                    </p>
                                  </div>
                                </Button>

                                <Button variant="outline" className="justify-start h-auto p-4">
                                  <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                      <DollarSign className="w-4 h-4" />
                                      <span className="font-medium">Tax Implications</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Understand the tax on your drawdown income
                                    </p>
                                  </div>
                                </Button>

                                <Button variant="outline" className="justify-start h-auto p-4">
                                  <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                      <FileText className="w-4 h-4" />
                                      <span className="font-medium">Income History</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      View past drawdown payments and statements
                                    </p>
                                  </div>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ArrowDownRight className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Drawdown Pensions</h3>
                          <p className="text-muted-foreground mb-4">
                            You don't currently have any pensions in drawdown phase.
                          </p>
                          <Button asChild>
                            <a href="/drawdown">
                              <TrendingDown className="w-4 h-4 mr-2" />
                              Start Drawdown Journey
                            </a>
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="iht" className="mt-6">
                      <div className="space-y-6">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            This information is for guidance only. Please consult with a financial adviser for personalised inheritance tax planning.
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center justify-between">
                                Estate Value Calculator
                                <Button
                                  size="sm"
                                  variant={editingIHT ? "default" : "outline"}
                                  onClick={() => editingIHT ? handleIHTSave() : setEditingIHT(true)}
                                >
                                  {editingIHT ? (
                                    <>
                                      <Check className="w-4 h-4 mr-1" />
                                      Save
                                    </>
                                  ) : (
                                    <>
                                      <Edit3 className="w-4 h-4 mr-1" />
                                      Edit
                                    </>
                                  )}
                                </Button>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                                  <span className="font-medium">Total Pension Value</span>
                                  <span className="font-bold text-lg">{formatCurrency(pensionData.totalValue)}</span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                                  <span className="font-medium">Property Value</span>
                                  {editingIHT ? (
                                    <Input
                                      type="number"
                                      value={propertyValue}
                                      onChange={(e) => setPropertyValue(Number(e.target.value) || 0)}
                                      className="w-32 text-right font-bold"
                                    />
                                  ) : (
                                    <span className="font-bold text-lg">{formatCurrency(propertyValue)}</span>
                                  )}
                                </div>

                                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                                  <span className="font-medium">Other Assets (ISAs, Savings, etc.)</span>
                                  {editingIHT ? (
                                    <Input
                                      type="number"
                                      value={otherAssets}
                                      onChange={(e) => setOtherAssets(Number(e.target.value) || 0)}
                                      className="w-32 text-right font-bold"
                                    />
                                  ) : (
                                    <span className="font-bold text-lg">{formatCurrency(otherAssets)}</span>
                                  )}
                                </div>

                                <Separator />
                                
                                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                                  <span className="font-bold">Total Estate Value</span>
                                  <span className="font-bold text-xl text-primary">{formatCurrency(totalEstateValue)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">IHT Calculation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm">IHT-free threshold (nil rate band)</span>
                                  <span className="font-medium">{formatCurrency(325000)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Residence nil rate band</span>
                                  <span className="font-medium">{formatCurrency(175000)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                  <span className="font-medium">Total IHT allowance</span>
                                  <span className="font-bold">{formatCurrency(ihtThreshold)}</span>
                                </div>
                              </div>

                              <div className="mt-4 p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">Taxable Estate</span>
                                  <span className="font-bold">
                                    {formatCurrency(Math.max(0, totalEstateValue - ihtThreshold))}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-medium">IHT Rate</span>
                                  <span className="font-bold">40%</span>
                                </div>
                                <Separator className="my-3" />
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-lg">Total IHT Liability</span>
                                  <span className={`font-bold text-xl ${ihtLiability > 0 ? 'text-destructive' : 'text-success'}`}>
                                    {formatCurrency(ihtLiability)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {ihtLiability > 0 ? 
                                    `Your estate exceeds the IHT threshold by ${formatCurrency(totalEstateValue - ihtThreshold)}` :
                                    "Your estate is currently below the IHT threshold"
                                  }
                                </p>
                              </div>

                              {ihtLiability > 0 && (
                                <Alert className="border-warning">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                    Consider IHT planning strategies to reduce your estate's tax liability.
                                  </AlertDescription>
                                </Alert>
                              )}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Drawdown vs Death Benefits</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {drawdownPensions.map((pension) => (
                                <div key={pension.id} className="p-3 border rounded-lg">
                                  <h4 className="font-medium mb-3">{pension.provider}</h4>
                                  
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Current fund value</span>
                                      <span className="font-medium">{formatCurrency(pension.value)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Annual drawdown</span>
                                      <span className="font-medium text-warning">{formatCurrency(pension.annualDrawdown || 0)}</span>
                                    </div>
                                  </div>

                                  <Separator className="my-3" />

                                  <div className="space-y-2">
                                    <h5 className="font-medium text-sm">Death before age 75:</h5>
                                    <p className="text-xs text-muted-foreground">
                                      Beneficiaries can draw tax-free. Remaining fund passes outside estate for IHT.
                                    </p>
                                    
                                    <h5 className="font-medium text-sm mt-3">Death after age 75:</h5>
                                    <p className="text-xs text-muted-foreground">
                                      Beneficiaries pay income tax on withdrawals. Fund still outside estate for IHT.
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">IHT Planning Strategies</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <TrendingDown className="w-4 h-4 text-primary" />
                                  Minimize Drawdowns
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Consider drawing from other assets first to preserve pension funds, which pass outside your estate.
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-primary" />
                                  Spend Other Assets
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Use ISAs, GIAs, and other investments for income, keeping pension funds for beneficiaries.
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  Nomination Forms
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Ensure beneficiary nominations are up to date to maintain pension fund flexibility.
                                </p>
                              </div>

                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Calculator className="w-4 h-4 text-primary" />
                                  Professional Advice
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Consider holistic estate planning with qualified advisers for complex situations.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-warning">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-warning" />
                              Important Considerations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3 text-sm">
                              <p>
                                <strong>Age 75 threshold:</strong> Death benefits change significantly at age 75. Consider timing of withdrawals around this age.
                              </p>
                              <p>
                                <strong>Benefit crystallisation:</strong> Uncrystallised pension funds have more IHT advantages than those already in drawdown.
                              </p>
                              <p>
                                <strong>Spouse considerations:</strong> Spousal bypass can preserve pension benefits for next generation while providing flexibility.
                              </p>
                              <p>
                                <strong>Regular review:</strong> IHT rules and pension legislation can change. Review your strategy annually.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
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