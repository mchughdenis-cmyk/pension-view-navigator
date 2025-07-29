import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  PiggyBank, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Clock,
  PieChart,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Banknote,
  Calendar,
  Shield,
  Target,
  Info
} from "lucide-react";

const pensionData = {
  totalValue: 485750,
  taxFreeCashAvailable: 121437, // 25% of total
  currentAge: 58,
  statePensionAge: 67,
  lifeExpectancy: 85
};

const drawdownOptions = {
  flexible: {
    name: "Flexible Drawdown",
    description: "Take income as and when you need it",
    minAge: 55,
    pros: ["Complete flexibility", "Funds remain invested", "No purchase requirement", "Inheritance benefits"],
    cons: ["Investment risk", "Income not guaranteed", "Requires active management", "Potential to run out"]
  },
  annuity: {
    name: "Annuity",
    description: "Guaranteed income for life",
    minAge: 55,
    pros: ["Guaranteed income", "No investment risk", "Predictable payments", "Peace of mind"],
    cons: ["No flexibility", "Poor inheritance", "Inflation risk", "No access to capital"]
  },
  mixed: {
    name: "Mixed Approach",
    description: "Combine annuity security with drawdown flexibility",
    minAge: 55,
    pros: ["Balanced approach", "Some guaranteed income", "Some flexibility", "Risk spread"],
    cons: ["Complex to manage", "Compromise solution", "Multiple providers", "Higher charges"]
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DrawdownJourney() {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [taxFreeCash, setTaxFreeCash] = useState(pensionData.taxFreeCashAvailable);
  const [annualIncome, setAnnualIncome] = useState(20000);
  const [mixSplit, setMixSplit] = useState([50]); // Percentage to annuity
  const [currentStep, setCurrentStep] = useState(1);

  // Calculations
  const remainingAfterTFC = pensionData.totalValue - taxFreeCash;
  const drawdownPot = selectedOption === "mixed" ? remainingAfterTFC * (100 - mixSplit[0]) / 100 : remainingAfterTFC;
  const annuityPot = selectedOption === "mixed" ? remainingAfterTFC * mixSplit[0] / 100 : selectedOption === "annuity" ? remainingAfterTFC : 0;
  
  // Simplified projections
  const annualGrowthRate = 0.04;
  const inflationRate = 0.025;
  const annuityRate = 0.055; // 5.5% per annum for life
  
  const yearsToProject = pensionData.lifeExpectancy - pensionData.currentAge;
  const projectedDrawdownValue = drawdownPot * Math.pow(1 + annualGrowthRate - (annualIncome / drawdownPot), yearsToProject);
  const guaranteedAnnuityIncome = annuityPot * annuityRate;
  
  const [riskAnswers, setRiskAnswers] = useState({
    investmentExperience: "",
    riskTolerance: "",
    incomeNeeds: "",
    marketVolatility: "",
    longevityRisk: ""
  });

  const steps = [
    { id: 1, title: "Risk Assessment", description: "Complete risk warning questions" },
    { id: 2, title: "Tax-Free Cash", description: "Choose your tax-free lump sum" },
    { id: 3, title: "Income Options", description: "Select your preferred approach" },
    { id: 4, title: "Customization", description: "Fine-tune your choices" },
    { id: 5, title: "Projections", description: "Review long-term outlook" },
    { id: 6, title: "Application", description: "Complete your application" }
  ];

  const riskQuestions = [
    {
      id: "investmentExperience",
      question: "How would you describe your investment experience?",
      options: [
        { value: "beginner", label: "Beginner - Little to no investment experience" },
        { value: "some", label: "Some experience - Have made investments before" },
        { value: "experienced", label: "Experienced - Regular investor with good knowledge" },
        { value: "expert", label: "Expert - Extensive investment knowledge and experience" }
      ]
    },
    {
      id: "riskTolerance",
      question: "How do you feel about investment risk and potential losses?",
      options: [
        { value: "low", label: "I prefer security and cannot afford any losses" },
        { value: "moderate", label: "I can accept some risk for potentially higher returns" },
        { value: "high", label: "I'm comfortable with significant risk for higher growth potential" },
        { value: "very-high", label: "I'm willing to accept high risk including potential major losses" }
      ]
    },
    {
      id: "incomeNeeds",
      question: "How important is guaranteed income to you?",
      options: [
        { value: "essential", label: "Essential - I need certainty of income" },
        { value: "important", label: "Important - I prefer some guaranteed income" },
        { value: "flexible", label: "Flexible - I can manage variable income" },
        { value: "not-important", label: "Not important - I can manage without guarantees" }
      ]
    },
    {
      id: "marketVolatility",
      question: "How would you react to a 20% drop in your pension value?",
      options: [
        { value: "panic", label: "Very concerned - I would want to switch to safer options" },
        { value: "worried", label: "Worried - But would probably stay invested" },
        { value: "concerned", label: "Concerned - But understand markets can recover" },
        { value: "calm", label: "Calm - I understand this is normal market behavior" }
      ]
    },
    {
      id: "longevityRisk",
      question: "Are you concerned about outliving your pension savings?",
      options: [
        { value: "very-concerned", label: "Very concerned - This is my main worry" },
        { value: "somewhat", label: "Somewhat concerned - It's one of several worries" },
        { value: "not-very", label: "Not very concerned - I have other income sources" },
        { value: "not-concerned", label: "Not concerned - I'm confident in my planning" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Pension Drawdown Journey</h1>
          <p className="text-muted-foreground">Design your retirement income strategy</p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.id 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-20 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-semibold">{steps[currentStep - 1].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Pension Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pension Value</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(pensionData.totalValue)}</div>
              <p className="text-xs text-muted-foreground">Available for drawdown</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Tax-Free Cash</CardTitle>
              <Banknote className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(pensionData.taxFreeCashAvailable)}</div>
              <p className="text-xs text-muted-foreground">25% of pension value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Age</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pensionData.currentAge}</div>
              <p className="text-xs text-muted-foreground">Eligible for drawdown</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Years to State Pension</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pensionData.statePensionAge - pensionData.currentAge}</div>
              <p className="text-xs text-muted-foreground">Age {pensionData.statePensionAge}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="step1" value={`step${currentStep}`} onValueChange={(value) => setCurrentStep(parseInt(value.replace('step', '')))}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="step1" disabled={currentStep < 1}>Risk Assessment</TabsTrigger>
            <TabsTrigger value="step2" disabled={currentStep < 2}>Tax-Free Cash</TabsTrigger>
            <TabsTrigger value="step3" disabled={currentStep < 3}>Income Options</TabsTrigger>
            <TabsTrigger value="step4" disabled={currentStep < 4}>Customize</TabsTrigger>
            <TabsTrigger value="step5" disabled={currentStep < 5}>Projections</TabsTrigger>
            <TabsTrigger value="step6" disabled={currentStep < 6}>Application</TabsTrigger>
          </TabsList>

          {/* Step 1: Risk Assessment */}
          <TabsContent value="step1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-warning" />
                    Risk Warning Assessment
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Before proceeding with drawdown, we need to understand your risk profile and ensure this is suitable for you.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-warning">Important Risk Warnings</h4>
                        <ul className="text-sm mt-2 space-y-1">
                          <li>• Pension drawdown involves investment risk - your fund value can go down as well as up</li>
                          <li>• You could run out of money in retirement if withdrawals are too high</li>
                          <li>• Income is not guaranteed and will fluctuate with investment performance</li>
                          <li>• Early withdrawals may impact long-term retirement security</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {riskQuestions.map((q, index) => (
                      <div key={q.id} className="space-y-3">
                        <h4 className="font-medium">{index + 1}. {q.question}</h4>
                        <div className="space-y-2">
                          {q.options.map((option) => (
                            <label key={option.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                              <input
                                type="radio"
                                name={q.id}
                                value={option.value}
                                checked={riskAnswers[q.id] === option.value}
                                onChange={(e) => setRiskAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                className="mt-1"
                              />
                              <span className="text-sm">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Button 
                      onClick={() => setCurrentStep(2)} 
                      disabled={Object.values(riskAnswers).some(answer => !answer)}
                      className="px-8"
                    >
                      Continue to Tax-Free Cash
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Step 2: Tax-Free Cash */}
          <TabsContent value="step2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-5 w-5" />
                    Tax-Free Cash Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-free-cash">Amount to take as tax-free cash</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[taxFreeCash]}
                        onValueChange={(value) => setTaxFreeCash(value[0])}
                        max={pensionData.taxFreeCashAvailable}
                        min={0}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>£0</span>
                        <span>{formatCurrency(pensionData.taxFreeCashAvailable)}</span>
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={taxFreeCash}
                      onChange={(e) => setTaxFreeCash(Math.min(Number(e.target.value), pensionData.taxFreeCashAvailable))}
                      max={pensionData.taxFreeCashAvailable}
                    />
                  </div>

                  <div className="p-4 bg-accent/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Tax-Free Cash Benefits</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• No income tax payable</li>
                      <li>• Available from age 55</li>
                      <li>• Up to 25% of pension value</li>
                      <li>• Can be taken in stages</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Tax-free cash:</span>
                      <span className="font-semibold text-success">{formatCurrency(taxFreeCash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining pension:</span>
                      <span className="font-semibold">{formatCurrency(remainingAfterTFC)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Total value:</span>
                      <span className="font-semibold text-primary">{formatCurrency(pensionData.totalValue)}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button onClick={() => setCurrentStep(3)} className="w-full">
                      Next: Choose Income Options
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Step 3: Income Options */}
          <TabsContent value="step3">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(drawdownOptions).map(([key, option]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedOption === key ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedOption(key)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{option.name}</CardTitle>
                        {selectedOption === key && <CheckCircle className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-success mb-2">Advantages</h4>
                        <ul className="text-sm space-y-1">
                          {option.pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-success mt-1 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-warning mb-2">Considerations</h4>
                        <ul className="text-sm space-y-1">
                          {option.cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 text-warning mt-1 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={() => setCurrentStep(4)} 
                  disabled={!selectedOption}
                  className="px-8"
                >
                  Next: Customize Your Choice
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Step 4: Customization */}
          <TabsContent value="step4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Income Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedOption === "mixed" && (
                    <div className="space-y-4">
                      <div>
                        <Label>Annuity vs Drawdown Split</Label>
                        <div className="mt-2 space-y-2">
                          <Slider
                            value={mixSplit}
                            onValueChange={setMixSplit}
                            max={100}
                            min={0}
                            step={5}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm">
                            <span>Annuity: {mixSplit[0]}% ({formatCurrency(annuityPot)})</span>
                            <span>Drawdown: {100 - mixSplit[0]}% ({formatCurrency(drawdownPot)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="annual-income">Annual Income Required</Label>
                    <Input
                      id="annual-income"
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(Number(e.target.value))}
                      placeholder="Enter annual income"
                    />
                    <p className="text-xs text-muted-foreground">
                      Monthly: {formatCurrency(annualIncome / 12)}
                    </p>
                  </div>

                  <div className="p-4 bg-accent/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Income Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      {selectedOption === "annuity" && (
                        <div className="flex justify-between">
                          <span>Guaranteed annuity income:</span>
                          <span className="font-semibold">{formatCurrency(guaranteedAnnuityIncome)}</span>
                        </div>
                      )}
                      {selectedOption === "flexible" && (
                        <div className="flex justify-between">
                          <span>Flexible drawdown:</span>
                          <span className="font-semibold">{formatCurrency(annualIncome)}</span>
                        </div>
                      )}
                      {selectedOption === "mixed" && (
                        <>
                          <div className="flex justify-between">
                            <span>Guaranteed (annuity):</span>
                            <span className="font-semibold">{formatCurrency(guaranteedAnnuityIncome)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Flexible (drawdown):</span>
                            <span className="font-semibold">{formatCurrency(Math.max(0, annualIncome - guaranteedAnnuityIncome))}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Longevity Risk</span>
                      <Badge variant={selectedOption === "annuity" ? "default" : "secondary"}>
                        {selectedOption === "annuity" ? "Protected" : "Exposed"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Investment Risk</span>
                      <Badge variant={selectedOption === "annuity" ? "default" : "destructive"}>
                        {selectedOption === "annuity" ? "None" : "High"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Inflation Risk</span>
                      <Badge variant={selectedOption === "flexible" ? "default" : "secondary"}>
                        {selectedOption === "flexible" ? "Protected" : "Exposed"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Flexibility</span>
                      <Badge variant={selectedOption === "flexible" ? "default" : selectedOption === "mixed" ? "secondary" : "outline"}>
                        {selectedOption === "flexible" ? "High" : selectedOption === "mixed" ? "Medium" : "None"}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button onClick={() => setCurrentStep(5)} className="w-full">
                      Next: View Projections
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Step 5: Projections */}
          <TabsContent value="step5">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Long-Term Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">At Age 70</h3>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(annualIncome)}</p>
                      <p className="text-sm text-muted-foreground">Annual income</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">At Age 80</h3>
                      <p className="text-2xl font-bold text-warning">{formatCurrency(annualIncome * 0.85)}</p>
                      <p className="text-sm text-muted-foreground">Adjusted for inflation</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Pot Longevity</h3>
                      <p className="text-2xl font-bold text-success">{pensionData.lifeExpectancy}+</p>
                      <p className="text-sm text-muted-foreground">Years covered</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Projection Assumptions</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Annual growth rate: 4%</li>
                          <li>• Inflation rate: 2.5%</li>
                          <li>• Annuity rate: 5.5% per annum</li>
                          <li>• Life expectancy: {pensionData.lifeExpectancy} years</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Inheritance Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {selectedOption === "annuity" ? "£0" : formatCurrency(Math.max(0, projectedDrawdownValue))}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Estimated remaining pot at age {pensionData.lifeExpectancy}
                      </p>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {selectedOption === "annuity" && "Annuities typically have no inheritance value"}
                      {selectedOption === "flexible" && "Drawdown pots can be inherited with favorable tax treatment"}
                      {selectedOption === "mixed" && "Only the drawdown portion provides inheritance value"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Income Certainty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Guaranteed Income</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedOption === "annuity" ? guaranteedAnnuityIncome : 
                                        selectedOption === "mixed" ? guaranteedAnnuityIncome : 0)}
                        </span>
                      </div>
                      <Progress 
                        value={selectedOption === "annuity" ? 100 : 
                               selectedOption === "mixed" ? (guaranteedAnnuityIncome / annualIncome) * 100 : 0} 
                        className="w-full" 
                      />
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {selectedOption === "annuity" && "100% of income is guaranteed for life"}
                      {selectedOption === "flexible" && "No guaranteed income - dependent on investment performance"}
                      {selectedOption === "mixed" && `${Math.round((guaranteedAnnuityIncome / annualIncome) * 100)}% guaranteed, rest flexible`}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button onClick={() => setCurrentStep(6)} className="px-8">
                  Next: Complete Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Step 6: Application */}
          <TabsContent value="step6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Application Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Your Choices</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tax-free cash:</span>
                        <span className="font-semibold">{formatCurrency(taxFreeCash)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining pension:</span>
                        <span className="font-semibold">{formatCurrency(remainingAfterTFC)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Income option:</span>
                        <span className="font-semibold">{drawdownOptions[selectedOption as keyof typeof drawdownOptions]?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target annual income:</span>
                        <span className="font-semibold">{formatCurrency(annualIncome)}</span>
                      </div>
                      {selectedOption === "mixed" && (
                        <>
                          <div className="flex justify-between">
                            <span>Annuity portion:</span>
                            <span className="font-semibold">{formatCurrency(annuityPot)} ({mixSplit[0]}%)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Drawdown portion:</span>
                            <span className="font-semibold">{formatCurrency(drawdownPot)} ({100 - mixSplit[0]}%)</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Next Steps</h3>
                    <ol className="text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5">1</span>
                        Complete application form
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5">2</span>
                        Provide identification documents
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5">3</span>
                        Sign declaration forms
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5">4</span>
                        Await processing (5-10 days)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center mt-0.5">5</span>
                        Receive first payment
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" className="flex-1">
                      <Calculator className="w-4 h-4 mr-2" />
                      Save & Return Later
                    </Button>
                    <Button className="flex-1">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start Application
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}