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
import { generateCompliantIllustrationPdf, generateSummaryPdf } from "@/lib/compliantIllustration";
import { toast } from "sonner";

interface IllustrationInputs {
  potValue: number;
  transferIn: number;
  annualContribution: number;
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
    transferIn: 0,
    annualContribution: 6000,
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
      inputs: { potValue: 250000, transferIn: 0, annualContribution: 4000, currentAge: 60, retirementAge: 65, lifeExpectancy: 90, drawdownRate: 4, annualGrowth: 3, annuityRate: 5.4, inflationRate: 2.5 } },
    { name: "Balanced 65", tag: "Typical", description: "£500k pot retiring at 65 with 5% growth and 4% income.",
      inputs: { potValue: 500000, transferIn: 0, annualContribution: 12000, currentAge: 60, retirementAge: 65, lifeExpectancy: 88, drawdownRate: 4, annualGrowth: 5, annuityRate: 5.6, inflationRate: 2.5 } },
    { name: "Transfer-in + contributions", tag: "Consolidation", description: "£200k pot + £150k transfer-in, £15k p.a. contributions to age 67.",
      inputs: { potValue: 200000, transferIn: 150000, annualContribution: 15000, currentAge: 52, retirementAge: 67, lifeExpectancy: 90, drawdownRate: 4, annualGrowth: 5, annuityRate: 5.6, inflationRate: 2.5 } },
    { name: "Early retiree FIRE", tag: "Aggressive", description: "Retire at 57 with £750k, 3.5% safe-withdrawal rate.",
      inputs: { potValue: 750000, transferIn: 0, annualContribution: 20000, currentAge: 55, retirementAge: 57, lifeExpectancy: 92, drawdownRate: 3.5, annualGrowth: 6, annuityRate: 4.8, inflationRate: 2.5 } },
    { name: "Modest pot top-up", tag: "Catch-up", description: "£90k pot at 62, conservative growth & sustainable income.",
      inputs: { potValue: 90000, transferIn: 0, annualContribution: 8000, currentAge: 62, retirementAge: 67, lifeExpectancy: 85, drawdownRate: 5, annualGrowth: 4, annuityRate: 6.0, inflationRate: 2.5 } },
    { name: "Annuity comparator", tag: "Secure income", description: "£400k pot, 6% annuity vs 4% drawdown.",
      inputs: { potValue: 400000, transferIn: 0, annualContribution: 0, currentAge: 65, retirementAge: 65, lifeExpectancy: 88, drawdownRate: 4, annualGrowth: 4.5, annuityRate: 6.0, inflationRate: 2.5 } },
  ];


  const loadScenario = (s: IllustrationInputs) => setInputs(s);

  // Calculate projections — full lifecycle: accumulation (with contributions + transfer-in) then drawdown.
  const calculateProjections = () => {
    const { potValue, transferIn, annualContribution, currentAge, retirementAge, lifeExpectancy, drawdownRate, annualGrowth, annuityRate, inflationRate } = inputs;
    const accYears = Math.max(0, retirementAge - currentAge);
    const ddYears = Math.max(0, lifeExpectancy - retirementAge);
    const g = annualGrowth / 100;
    const inf = inflationRate / 100;

    const projections: Array<{
      age: number; year: number; phase: 'accumulation' | 'drawdown';
      drawdownIncome: number; drawdownPot: number; annuityIncome: number;
      realDrawdownIncome: number; realAnnuityIncome: number; contributions: number;
    }> = [];

    // Accumulation phase — pot includes one-off transfer-in at outset plus annual contributions.
    let pot = potValue + (transferIn || 0);
    for (let y = 0; y < accYears; y++) {
      projections.push({
        age: currentAge + y,
        year: y - accYears, // negative years = pre-retirement
        phase: 'accumulation',
        drawdownIncome: 0,
        drawdownPot: Math.round(pot),
        annuityIncome: 0,
        realDrawdownIncome: 0,
        realAnnuityIncome: 0,
        contributions: y === 0 ? (transferIn || 0) + annualContribution : annualContribution,
      });
      pot = pot * (1 + g) + annualContribution;
    }

    // Crystallise — 25% PCLS taken, 75% enters drawdown. Annuity based on full vesting fund.
    const vestingFund = pot;
    let drawdownPot = vestingFund * 0.75;
    const annuityIncome = (vestingFund * annuityRate) / 100;

    for (let year = 0; year <= ddYears; year++) {
      const age = retirementAge + year;
      const drawdownIncome = (drawdownPot * drawdownRate) / 100;
      const totalYearsFromToday = accYears + year;
      projections.push({
        age,
        year,
        phase: 'drawdown',
        drawdownIncome: Math.round(drawdownIncome),
        drawdownPot: Math.round(drawdownPot),
        annuityIncome: Math.round(annuityIncome),
        realDrawdownIncome: Math.round(drawdownIncome / Math.pow(1 + inf, totalYearsFromToday)),
        realAnnuityIncome: Math.round(annuityIncome / Math.pow(1 + inf, totalYearsFromToday)),
        contributions: 0,
      });
      drawdownPot = drawdownPot * (1 + g) - drawdownIncome;
      if (drawdownPot < 0) drawdownPot = 0;
    }

    return projections;
  };

  const projections = calculateProjections();
  const drawdownRows = projections.filter(p => p.phase === 'drawdown');
  const accumulationRows = projections.filter(p => p.phase === 'accumulation');
  const totalDrawdownIncome = drawdownRows.reduce((sum, p) => sum + p.drawdownIncome, 0);
  const totalAnnuityIncome = drawdownRows.reduce((sum, p) => sum + p.annuityIncome, 0);
  const totalContributions = accumulationRows.reduce((sum, p) => sum + p.contributions, 0);
  const vestingFund = drawdownRows[0]?.drawdownPot ? drawdownRows[0].drawdownPot / 0.75 : inputs.potValue + inputs.transferIn;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pension Illustration</h1>
          <p className="text-muted-foreground">Compare drawdown vs annuity options</p>
          <Badge variant="outline" className="mt-2 text-xs">
            FCA COBS 13 Annex 2 compliant · 2% / 5% / 8% standardised growth · real terms
          </Badge>
        </div>
        <div className="flex gap-2">
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
            Quick HTML
          </Button>
          <Button onClick={() => {
            try {
              generateCompliantIllustrationPdf({
                potValue: inputs.potValue,
                transferIn: inputs.transferIn,
                contribution: inputs.annualContribution,
                currentAge: inputs.currentAge,
                retirementAge: inputs.retirementAge,
                lifeExpectancy: inputs.lifeExpectancy,
                drawdownRate: inputs.drawdownRate,
                annuityRate: inputs.annuityRate,
              });
              toast.success("Compliant KFI generated", { description: "COBS 13 Annex 2 illustration downloaded" });

            } catch (e) {
              toast.error("Failed to generate illustration", { description: String((e as Error).message) });
            }
          }}>
            <FileText className="w-4 h-4 mr-2" />
            Download Compliant KFI (PDF)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PiggyBank className="w-5 h-5" /> Demo scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Click any preset to populate the illustration with realistic 2024/25 UK figures.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SCENARIOS.map(s => (
              <button key={s.name} onClick={() => loadScenario(s.inputs)} className="text-left rounded-lg border p-3 hover:bg-muted transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{s.name}</span>
                  <Badge variant="secondary" className="text-xs">{s.tag}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.description}</p>
                <p className="text-xs mt-2 font-mono text-primary">£{s.inputs.potValue.toLocaleString()} · {s.inputs.drawdownRate}% drawdown · {s.inputs.annualGrowth}% growth</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transferIn">Transfer-in (£)</Label>
                <Input
                  id="transferIn"
                  type="number"
                  value={inputs.transferIn}
                  onChange={(e) => updateInput('transferIn', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="annualContribution">Annual Contribution (£)</Label>
                <Input
                  id="annualContribution"
                  type="number"
                  value={inputs.annualContribution}
                  onChange={(e) => updateInput('annualContribution', Number(e.target.value))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Accumulation phase: {Math.max(0, inputs.retirementAge - inputs.currentAge)} yrs · projected vesting fund £{Math.round(vestingFund).toLocaleString()} · total contributions £{totalContributions.toLocaleString()}
            </p>

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
                        <span className="font-medium">£{drawdownRows[0]?.drawdownIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Income</span>
                        <span className="font-medium">£{totalDrawdownIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Remaining Pot</span>
                        <span className="font-medium">£{drawdownRows[drawdownRows.length - 1]?.drawdownPot.toLocaleString()}</span>
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
                        <span className="font-medium">£{drawdownRows[0]?.annuityIncome.toLocaleString()}</span>
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