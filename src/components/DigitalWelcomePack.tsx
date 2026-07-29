import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Check, 
  TrendingUp, 
  Calculator,
  ArrowRightLeft,
  DollarSign,
  Calendar,
  AlertCircle,
  BookOpen
} from "lucide-react";

// Mock data for welcome pack
const welcomePackData = {
  clientName: "John Smith",
  advisorName: "Sarah Johnson",
  welcomeDate: "2026-07-25",
  pensionValue: 485750,
  contributions: [
    { provider: "Aviva Personal Pension", amount: 8400, date: "2026-07-01", type: "Regular" },
    { provider: "Legal & General SIPP", amount: 32000, date: "2026-06-15", type: "Annual" }
  ],
  transfers: [
    { from: "Old Company Scheme", amount: 45000, date: "2026-03-15", status: "Completed" },
    { from: "Previous SIPP", amount: 32000, date: "2026-01-10", status: "Completed" }
  ],
  futureProjections: {
    age55: { conservative: 520000, balanced: 585000, growth: 665000 },
    age60: { conservative: 610000, balanced: 720000, growth: 850000 },
    age65: { conservative: 715000, balanced: 890000, growth: 1100000 },
    age67: { conservative: 785000, balanced: 1020000, growth: 1285000 }
  },
  retirementOptions: [
    { type: "Flexible Drawdown", description: "Take income as needed while investments remain invested" },
    { type: "Annuity", description: "Guaranteed income for life with various options available" },
    { type: "Lump Sum", description: "Take up to 25% tax-free, remainder subject to income tax" }
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function DigitalWelcomePack() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <BackButton label="Back to Products" />
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-between items-start">
            <div></div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Pack
            </Button>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Digital Welcome Pack</h1>
            <p className="text-xl text-muted-foreground">Welcome to your pension journey, {welcomePackData.clientName}</p>
            <p className="text-sm text-muted-foreground">Prepared by {welcomePackData.advisorName} • {formatDate(welcomePackData.welcomeDate)}</p>
          </div>
        </div>

        {/* Welcome Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Check className="h-5 w-5" />
              Your Pension Setup Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatCurrency(welcomePackData.pensionValue)}</p>
                <p className="text-sm text-muted-foreground">Total Pension Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{welcomePackData.contributions.length}</p>
                <p className="text-sm text-muted-foreground">Active Contributions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{welcomePackData.transfers.length}</p>
                <p className="text-sm text-muted-foreground">Completed Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="terms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
            <TabsTrigger value="confirmations">Confirmations</TabsTrigger>
            <TabsTrigger value="projections">Future Values</TabsTrigger>
            <TabsTrigger value="options">Retirement Options</TabsTrigger>
            <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          </TabsList>

          {/* Terms & Conditions */}
          <TabsContent value="terms">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">1. Pension Scheme Rules</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your pension is governed by the scheme rules and relevant legislation. The minimum retirement age is currently 55 (rising to 57 in 2028). 
                        You can normally take up to 25% of your pension as a tax-free lump sum.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">2. Investment Risk</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The value of your pension can go down as well as up and you may get back less than you invested. 
                        Past performance is not a guide to future performance. Investment returns are not guaranteed.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">3. Annual Allowance</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The annual allowance for pension contributions is £60,000 (2026/27). Contributions above this limit may result in tax charges. 
                        Unused allowance from the previous 3 years can be carried forward.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold mb-2">4. Lifetime Allowance</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        The Lifetime Allowance has been abolished from April 2024, but new allowances for lump sum payments apply. 
                        The Lump Sum Allowance is £268,275 and the Lump Sum and Death Benefit Allowance is £1,073,100.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-accent p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm">Important Notice</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          These terms are subject to change based on government legislation. We will notify you of any significant changes that affect your pension.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Confirmations */}
          <TabsContent value="confirmations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Contribution Confirmations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {welcomePackData.contributions.map((contribution, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{contribution.provider}</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(contribution.date)}</p>
                            <Badge variant="outline" className="mt-1">
                              {contribution.type}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-success">{formatCurrency(contribution.amount)}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Check className="h-4 w-4 text-success" />
                              <span className="text-xs text-success">Confirmed</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-accent p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Contributions</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(welcomePackData.contributions.reduce((sum, c) => sum + c.amount, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transfers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    Transfer Confirmations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {welcomePackData.transfers.map((transfer, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{transfer.from}</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(transfer.date)}</p>
                            <Badge variant="default" className="mt-1">
                              {transfer.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatCurrency(transfer.amount)}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Check className="h-4 w-4 text-success" />
                              <span className="text-xs text-success">Received</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-accent p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Transfers</span>
                        <span className="font-bold text-primary">
                          {formatCurrency(welcomePackData.transfers.reduce((sum, t) => sum + t.amount, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Future Projections */}
          <TabsContent value="projections">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Future Value Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {Object.entries(welcomePackData.futureProjections).map(([age, values]) => (
                        <div key={age} className="text-center p-4 border rounded-lg">
                          <h3 className="font-bold text-lg mb-2">Age {age.replace('age', '')}</h3>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Conservative (3%)</p>
                              <p className="font-semibold">{formatCurrency(values.conservative)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Balanced (5%)</p>
                              <p className="font-semibold text-primary">{formatCurrency(values.balanced)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Growth (7%)</p>
                              <p className="font-semibold text-success">{formatCurrency(values.growth)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-accent p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm">Projection Assumptions</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            These projections are for illustration only and are not guaranteed. They assume annual growth rates as shown and do not account for inflation or charges. 
                            Actual returns may be higher or lower than projected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Retirement Options */}
          <TabsContent value="options">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Your Retirement Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {welcomePackData.retirementOptions.map((option, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <h3 className="font-bold">{option.type}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Learn More
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Tax-Free Cash</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-accent rounded-lg">
                        <h4 className="font-medium mb-2">Current Entitlement</h4>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(welcomePackData.pensionValue * 0.25)}
                        </p>
                        <p className="text-xs text-muted-foreground">25% of pension value</p>
                      </div>
                      <div className="p-4 bg-accent rounded-lg">
                        <h4 className="font-medium mb-2">Remaining After Tax-Free Cash</h4>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(welcomePackData.pensionValue * 0.75)}
                        </p>
                        <p className="text-xs text-muted-foreground">Available for income options</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Next Steps */}
          <TabsContent value="next-steps">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Your Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Immediate Actions</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</div>
                            <div>
                              <p className="font-medium">Review Your Investment Strategy</p>
                              <p className="text-sm text-muted-foreground">Annual review scheduled for next month</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</div>
                            <div>
                              <p className="font-medium">Set Up Online Access</p>
                              <p className="text-sm text-muted-foreground">Access your pension dashboard 24/7</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</div>
                            <div>
                              <p className="font-medium">Update Beneficiaries</p>
                              <p className="text-sm text-muted-foreground">Ensure your nomination forms are current</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold">Ongoing Planning</h3>
                        <div className="space-y-3">
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium">Annual Reviews</p>
                            <p className="text-sm text-muted-foreground">We'll meet annually to review your pension and adjust if needed</p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium">Market Updates</p>
                            <p className="text-sm text-muted-foreground">Quarterly market reports and pension insights</p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <p className="font-medium">Retirement Planning</p>
                            <p className="text-sm text-muted-foreground">We'll help you plan your retirement income strategy</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-center space-y-4">
                      <h3 className="font-semibold">Need Help?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Knowledge Base
                        </Button>
                        <Button>
                          Contact Your Advisor
                        </Button>
                        <Button variant="outline">
                          Book a Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}