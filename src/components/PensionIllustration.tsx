import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  PiggyBank,
  BarChart3,
  ArrowRight,
  RefreshCw,
  FileText,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { downloadAirgeadHtml } from "@/lib/documentUtils";

interface IllustrationInputs {
  potValue: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  drawdownRate: number;
  annualGrowth: number;
  annuityRate: number;
  inflationRate: number;
}

const PensionIllustration = () => {
  const [inputs, setInputs] = useState<IllustrationInputs>({
    potValue: 250000,
    currentAge: 55,
    retirementAge: 65,
    lifeExpectancy: 85,
    drawdownRate: 4,
    annualGrowth: 5,
    annuityRate: 5.2,
    inflationRate: 2.5
  });

  const updateInput = (key: keyof IllustrationInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const SCENARIOS: { name: string; tag: string; description: string; inputs: IllustrationInputs }[] = [
    { name: "Cautious retiree", tag: "Low risk", description: "£250k pot, 4% drawdown, 3% growth — preserves capital.",
      inputs: { potValue: 250000, currentAge: 60, retirementAge: 65, lifeExpectancy: 90, drawdownRate: 4, annualGrowth: 3, annuityRate: 5.4, inflationRate: 2.5 } },
    { name: "Balanced 65", tag: "Typical", description: "£500k pot retiring at 65 with 5% growth and 4% income.",
      inputs: { potValue: 500000, currentAge: 60, retirementAge: 65, lifeExpectancy: 88, drawdownRate: 4, annualGrowth: 5, annuityRate: 5.6, inflationRate: 2.5 } },
    { name: "Early retiree FIRE", tag: "Aggressive", description: "Retire at 57 with £750k, 3.5% safe-withdrawal rate.",
      inputs: { potValue: 750000, currentAge: 55, retirementAge: 57, lifeExpectancy: 92, drawdownRate: 3.5, annualGrowth: 6, annuityRate: 4.8, inflationRate: 2.5 } },
    { name: "High net worth", tag: "Wealth", description: "£1.25m pot, 4.5% drawdown, growth-oriented portfolio.",
      inputs: { potValue: 1250000, currentAge: 58, retirementAge: 62, lifeExpectancy: 90, drawdownRate: 4.5, annualGrowth: 6, annuityRate: 5.0, inflationRate: 2.5 } },
    { name: "Modest pot top-up", tag: "Catch-up", description: "£90k pot at 62, conservative growth & sustainable income.",
      inputs: { potValue: 90000, currentAge: 62, retirementAge: 67, lifeExpectancy: 85, drawdownRate: 5, annualGrowth: 4, annuityRate: 6.0, inflationRate: 2.5 } },
    { name: "Annuity comparator", tag: "Secure income", description: "£400k pot, 6% annuity vs 4% drawdown.",
      inputs: { potValue: 400000, currentAge: 65, retirementAge: 65, lifeExpectancy: 88, drawdownRate: 4, annualGrowth: 4.5, annuityRate: 6.0, inflationRate: 2.5 } },
  ];

  const loadScenario = (s: IllustrationInputs) => setInputs(s);

  // Calculate projections
  const calculateProjections = () => {
    const { potValue, retirementAge, lifeExpectancy, drawdownRate, annualGrowth, annuityRate, inflationRate } = inputs;
    const years = lifeExpectancy - retirementAge;
    
    const projections = [];
    let drawdownPot = potValue;
    const annuityIncome = (potValue * annuityRate) / 100;
    
    for (let year = 0; year <= years; year++) {
      const age = retirementAge + year;
      const drawdownIncome = (drawdownPot * drawdownRate) / 100;
      
      projections.push({
        age,
        year,
        drawdownIncome: Math.round(drawdownIncome),
        drawdownPot: Math.round(drawdownPot),
        annuityIncome: Math.round(annuityIncome),
        realDrawdownIncome: Math.round(drawdownIncome / Math.pow(1 + inflationRate/100, year)),
        realAnnuityIncome: Math.round(annuityIncome / Math.pow(1 + inflationRate/100, year))
      });
      
      // Update pot for next year
      drawdownPot = drawdownPot * (1 + annualGrowth/100) - drawdownIncome;
      if (drawdownPot < 0) drawdownPot = 0;
    }
    
    return projections;
  };

  const projections = calculateProjections();
  const totalDrawdownIncome = projections.reduce((sum, p) => sum + p.drawdownIncome, 0);
  const totalAnnuityIncome = projections.reduce((sum, p) => sum + p.annuityIncome, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pension Illustration</h1>
          <p className="text-muted-foreground">Compare drawdown vs annuity options</p>
        </div>
        <Button variant="outline" onClick={() => {
          const rows = projections.map(p => `<tr><td>${p.age}</td><td>£${p.drawdownIncome.toLocaleString()}</td><td>£${p.annuityIncome.toLocaleString()}</td><td>£${p.drawdownPot.toLocaleString()}</td></tr>`).join('');
          const bodyContent = `
            <h2>Pension Illustration Summary</h2>
            <p><strong>Pot Value:</strong> £${inputs.potValue.toLocaleString()} | <strong>Retirement Age:</strong> ${inputs.retirementAge} | <strong>Growth Rate:</strong> ${inputs.annualGrowth}%</p>
            <p><strong>Total Drawdown Income:</strong> £${totalDrawdownIncome.toLocaleString()} | <strong>Total Annuity Income:</strong> £${totalAnnuityIncome.toLocaleString()}</p>
            <h2>Year-by-Year Projection</h2>
            <table><thead><tr><th>Age</th><th>Drawdown Income</th><th>Annuity Income</th><th>Remaining Pot</th></tr></thead><tbody>${rows}</tbody></table>`;
          downloadAirgeadHtml('Pension Illustration', 'Pension-Illustration.html', bodyContent);
        }}>
          <Download className="w-4 h-4 mr-2" />
          Export Illustration
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Illustration Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="potValue">Pot Value (£)</Label>
                <Input
                  id="potValue"
                  type="number"
                  value={inputs.potValue}
                  onChange={(e) => updateInput('potValue', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="currentAge">Current Age</Label>
                <Input
                  id="currentAge"
                  type="number"
                  value={inputs.currentAge}
                  onChange={(e) => updateInput('currentAge', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retirementAge">Retirement Age</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  value={inputs.retirementAge}
                  onChange={(e) => updateInput('retirementAge', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
                <Input
                  id="lifeExpectancy"
                  type="number"
                  value={inputs.lifeExpectancy}
                  onChange={(e) => updateInput('lifeExpectancy', Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label>Drawdown Rate: {inputs.drawdownRate}%</Label>
              <Slider
                value={[inputs.drawdownRate]}
                onValueChange={(value) => updateInput('drawdownRate', value[0])}
                max={8}
                min={2}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Annual Growth: {inputs.annualGrowth}%</Label>
              <Slider
                value={[inputs.annualGrowth]}
                onValueChange={(value) => updateInput('annualGrowth', value[0])}
                max={8}
                min={0}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Annuity Rate: {inputs.annuityRate}%</Label>
              <Slider
                value={[inputs.annuityRate]}
                onValueChange={(value) => updateInput('annuityRate', value[0])}
                max={8}
                min={3}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Inflation Rate: {inputs.inflationRate}%</Label>
              <Slider
                value={[inputs.inflationRate]}
                onValueChange={(value) => updateInput('inflationRate', value[0])}
                max={5}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>

            <Button className="w-full" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Drawdown Income</p>
                    <p className="text-2xl font-bold text-primary">£{totalDrawdownIncome.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Annuity Income</p>
                    <p className="text-2xl font-bold text-accent">£{totalAnnuityIncome.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Income Difference</p>
                    <p className={`text-2xl font-bold ${totalDrawdownIncome > totalAnnuityIncome ? 'text-success' : 'text-destructive'}`}>
                      £{Math.abs(totalDrawdownIncome - totalAnnuityIncome).toLocaleString()}
                    </p>
                    <Badge variant={totalDrawdownIncome > totalAnnuityIncome ? "default" : "destructive"} className="text-xs">
                      {totalDrawdownIncome > totalAnnuityIncome ? 'Drawdown Higher' : 'Annuity Higher'}
                    </Badge>
                  </div>
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Tabs */}
          <Tabs defaultValue="income" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">Annual Income</TabsTrigger>
              <TabsTrigger value="real">Real Terms</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Income Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={projections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `£${Number(value).toLocaleString()}`,
                          name === 'drawdownIncome' ? 'Drawdown Income' : 'Annuity Income'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="drawdownIncome" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="drawdownIncome"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="annuityIncome" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        name="annuityIncome"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="real" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Real Terms Income (Inflation Adjusted)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={projections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `£${Number(value).toLocaleString()}`,
                          name === 'realDrawdownIncome' ? 'Real Drawdown Income' : 'Real Annuity Income'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="realDrawdownIncome" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="realDrawdownIncome"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="realAnnuityIncome" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        name="realAnnuityIncome"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Flexible Drawdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Initial Annual Income</span>
                        <span className="font-medium">£{projections[0]?.drawdownIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Income</span>
                        <span className="font-medium">£{totalDrawdownIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Remaining Pot</span>
                        <span className="font-medium">£{projections[projections.length - 1]?.drawdownPot.toLocaleString()}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Advantages</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Flexibility to adjust income</li>
                        <li>• Potential for growth</li>
                        <li>• Inheritance for beneficiaries</li>
                        <li>• Access to capital if needed</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Risks</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Investment risk</li>
                        <li>• Longevity risk</li>
                        <li>• Income may reduce over time</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="w-5 h-5 text-accent" />
                      Annuity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Guaranteed Annual Income</span>
                        <span className="font-medium">£{projections[0]?.annuityIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Income</span>
                        <span className="font-medium">£{totalAnnuityIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Remaining Pot</span>
                        <span className="font-medium">£0</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Advantages</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Guaranteed income for life</li>
                        <li>• No investment risk</li>
                        <li>• Predictable budgeting</li>
                        <li>• Peace of mind</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Considerations</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• No inheritance (unless selected)</li>
                        <li>• No access to capital</li>
                        <li>• Inflation risk</li>
                        <li>• Irreversible decision</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PensionIllustration;