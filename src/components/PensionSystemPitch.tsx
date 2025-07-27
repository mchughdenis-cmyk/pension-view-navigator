import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PiggyBank, 
  TrendingUp, 
  ArrowDownRight, 
  DollarSign, 
  FileText, 
  ExternalLink,
  ArrowRightLeft,
  Calculator,
  BookOpen,
  Users,
  Shield,
  Zap,
  BarChart3,
  CheckCircle,
  Clock,
  Upload,
  CreditCard,
  Banknote,
  Target,
  Calendar,
  Receipt,
  Bell,
  Download,
  Eye,
  Settings,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react';

const PensionSystemPitch = () => {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [contributionStep, setContributionStep] = useState(1);
  const [contributionAmount, setContributionAmount] = useState('500');
  const [contributionFrequency, setContributionFrequency] = useState('monthly');

  const systemFeatures = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Complete Client Management",
      description: "Full lifecycle client portal with real-time portfolio tracking, contribution management, and transfer capabilities."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Administrative Excellence", 
      description: "Comprehensive back-office tools for pension operators with compliance monitoring, alerts, and reporting."
    },
    {
      icon: <Calculator className="h-8 w-8 text-purple-500" />,
      title: "Advanced Illustrations",
      description: "Side-by-side comparison tools for drawdown vs annuity options with interactive scenario modeling."
    },
    {
      icon: <ArrowRightLeft className="h-8 w-8 text-orange-500" />,
      title: "Seamless Transfers",
      description: "Digital transfer journey supporting all pension types with real-time progress tracking and document management."
    },
    {
      icon: <FileText className="h-8 w-8 text-red-500" />,
      title: "Digital Documentation",
      description: "Comprehensive welcome packs, terms & conditions, and all regulatory documentation in digital format."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Automated Workflows",
      description: "Streamlined contribution processing, compliance checks, and automated reporting capabilities."
    }
  ];

  const processCapabilities = [
    "New Client Onboarding",
    "Contribution Management", 
    "Transfer Processing",
    "Income Illustrations",
    "Portfolio Monitoring",
    "Compliance Reporting",
    "Document Management",
    "Client Communications"
  ];

  const handleContributionSubmit = () => {
    if (contributionStep < 4) {
      setContributionStep(contributionStep + 1);
    } else {
      setContributionStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Next-Generation Pension Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete digital pension management solution designed for modern pension operators. 
            Streamline operations, enhance client experience, and ensure regulatory compliance.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Badge className="px-4 py-2 text-lg bg-blue-500">Digital First</Badge>
            <Badge className="px-4 py-2 text-lg bg-green-500">Fully Compliant</Badge>
            <Badge className="px-4 py-2 text-lg bg-purple-500">API Ready</Badge>
          </div>
        </div>

        {/* System Overview */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Platform Capabilities</CardTitle>
            <CardDescription>
              Comprehensive solution covering every aspect of pension management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemFeatures.map((feature, index) => (
                <div key={index} className="p-6 border rounded-lg bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    {feature.icon}
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Process Coverage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                Process Coverage
              </CardTitle>
              <CardDescription>
                End-to-end automation of pension operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {processCapabilities.map((process, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{process}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-green-500" />
                Key Benefits
              </CardTitle>
              <CardDescription>
                Measurable improvements for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="font-medium">Processing Time Reduction</span>
                <span className="text-2xl font-bold text-green-600">75%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="font-medium">Client Satisfaction</span>
                <span className="text-2xl font-bold text-blue-600">95%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="font-medium">Compliance Accuracy</span>
                <span className="text-2xl font-bold text-purple-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                <span className="font-medium">Cost Reduction</span>
                <span className="text-2xl font-bold text-orange-600">60%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Interactive System Demo</CardTitle>
            <CardDescription className="text-center">
              Explore the platform capabilities through our interactive demonstration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeDemo} onValueChange={setActiveDemo}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Client Portal</TabsTrigger>
                <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
                <TabsTrigger value="illustrations">Illustrations</TabsTrigger>
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-blue-500" />
                        Portfolio Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-2">£485,750</div>
                      <p className="text-sm text-gray-600">Across 3 pension schemes</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Accumulation</span>
                          <span className="text-sm font-medium">£405,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Drawdown</span>
                          <span className="text-sm font-medium">£80,750</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-2">+8.2%</div>
                      <p className="text-sm text-gray-600">Year to date growth</p>
                      <div className="mt-4">
                        <Progress value={82} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">Benchmark: +7.5%</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-purple-500" />
                        Tax Efficiency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600 mb-2">£19,600</div>
                      <p className="text-sm text-gray-600">Remaining allowance</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Used</span>
                          <span className="text-sm font-medium">£40,400</span>
                        </div>
                        <Progress value={67} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Client Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">Active Clients</p>
                          <p className="text-2xl font-bold text-blue-600">2,847</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">New This Month</p>
                          <p className="text-2xl font-bold text-green-600">127</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">AUM Total</p>
                          <p className="text-2xl font-bold text-purple-600">£1.2B</p>
                        </div>
                        <PiggyBank className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-500" />
                        Recent Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          15 transfer requests pending review
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Compliance report ready for download
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          Market volatility alert for 3 portfolios
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contributions" className="mt-6">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-green-500" />
                      Contribution Workflow Demo
                    </CardTitle>
                    <CardDescription>
                      Experience the streamlined contribution process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step <= contributionStep ? 'bg-green-500 text-white' : 'bg-gray-200'
                          }`}>
                            {step < contributionStep ? <CheckCircle className="h-4 w-4" /> : step}
                          </div>
                          {step < 4 && (
                            <div className={`w-16 h-1 ${
                              step < contributionStep ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>

                    {contributionStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Contribution Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount (£)</Label>
                            <Input 
                              id="amount"
                              type="number"
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                              placeholder="500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency</Label>
                            <select 
                              className="w-full p-2 border rounded-md"
                              value={contributionFrequency}
                              onChange={(e) => setContributionFrequency(e.target.value)}
                            >
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="annually">Annually</option>
                              <option value="one-off">One-off</option>
                            </select>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded">
                          <p className="text-sm">
                            <strong>Tax Relief:</strong> £{(parseInt(contributionAmount) * 0.25).toFixed(2)} will be added automatically
                          </p>
                        </div>
                      </div>
                    )}

                    {contributionStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Payment Method</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4 border-2 border-blue-500 bg-blue-50">
                            <div className="flex items-center gap-3">
                              <Banknote className="h-6 w-6 text-blue-500" />
                              <div>
                                <p className="font-medium">Direct Debit</p>
                                <p className="text-sm text-gray-600">Ending in 4567</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 border-2 hover:border-blue-300 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-6 w-6 text-gray-500" />
                              <div>
                                <p className="font-medium">Debit Card</p>
                                <p className="text-sm text-gray-600">Add new card</p>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}

                    {contributionStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Confirmation</h3>
                        <div className="p-4 border rounded space-y-3">
                          <div className="flex justify-between">
                            <span>Contribution Amount:</span>
                            <span className="font-medium">£{contributionAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax Relief:</span>
                            <span className="font-medium text-green-600">+£{(parseInt(contributionAmount) * 0.25).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Frequency:</span>
                            <span className="font-medium">{contributionFrequency}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total to Pension:</span>
                            <span>£{(parseInt(contributionAmount) * 1.25).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {contributionStep === 4 && (
                      <div className="text-center space-y-4">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="font-semibold text-lg">Contribution Successful!</h3>
                        <p className="text-gray-600">
                          Your {contributionFrequency} contribution of £{contributionAmount} has been set up successfully.
                        </p>
                        <div className="flex gap-3 justify-center">
                          <Button variant="outline">
                            <Receipt className="h-4 w-4 mr-2" />
                            Download Receipt
                          </Button>
                          <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            View Schedule
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleContributionSubmit}
                      className="w-full"
                      disabled={contributionStep === 4}
                    >
                      {contributionStep === 1 && "Continue to Payment"}
                      {contributionStep === 2 && "Review Contribution"}
                      {contributionStep === 3 && "Confirm Contribution"}
                      {contributionStep === 4 && "Process Complete"}
                    </Button>

                    {contributionStep === 4 && (
                      <Button 
                        variant="outline"
                        onClick={() => setContributionStep(1)}
                        className="w-full"
                      >
                        Start New Contribution
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="illustrations" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ArrowDownRight className="h-5 w-5 text-blue-500" />
                        Flexible Drawdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">£2,400</div>
                        <p className="text-sm text-gray-600">Monthly income</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Annual Drawdown:</span>
                          <span className="font-medium">£28,800</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Remaining Fund:</span>
                          <span className="font-medium">£485,750</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Projected at 65:</span>
                          <span className="font-medium text-green-600">£512,000</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">Flexibility Score</div>
                        <Progress value={90} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-500" />
                        Annuity Option
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">£2,180</div>
                        <p className="text-sm text-gray-600">Guaranteed monthly</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Annual Income:</span>
                          <span className="font-medium">£26,160</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Guarantee Period:</span>
                          <span className="font-medium">10 years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Inflation Protection:</span>
                          <span className="font-medium text-blue-600">RPI Linked</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">Security Score</div>
                        <Progress value={95} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transfers" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Active Transfers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600 mb-2">23</div>
                        <p className="text-sm text-gray-600">In progress</p>
                        <div className="mt-4">
                          <Progress value={74} className="h-2" />
                          <p className="text-xs text-gray-600 mt-1">Average: 74% complete</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Total Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600 mb-2">£2.4M</div>
                        <p className="text-sm text-gray-600">Being transferred</p>
                        <div className="mt-4 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Drawdown</span>
                            <span>£1.6M</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Annuity</span>
                            <span>£800K</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Avg. Timeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-600 mb-2">8.2</div>
                        <p className="text-sm text-gray-600">Weeks to complete</p>
                        <div className="mt-4">
                          <Badge className="bg-green-500">Industry: 12 weeks</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transfer Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: "Aviva Personal Pension", value: "£125,000", status: "Completed", date: "2 days ago" },
                          { name: "Scottish Widows SIPP", value: "£67,000", status: "In Progress", date: "1 week ago" },
                          { name: "L&G Workplace Pension", value: "£43,000", status: "Pending", date: "2 weeks ago" }
                        ].map((transfer, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="font-medium">{transfer.name}</p>
                                <p className="text-sm text-gray-600">{transfer.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{transfer.value}</p>
                              <Badge 
                                variant={transfer.status === 'Completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {transfer.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-gray-500" />
                Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><strong>Architecture:</strong> Cloud-native microservices</p>
                  <p><strong>Security:</strong> SOC 2 Type II compliant</p>
                  <p><strong>API:</strong> RESTful with webhooks</p>
                  <p><strong>Database:</strong> Encrypted at rest & transit</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Uptime:</strong> 99.9% SLA guaranteed</p>
                  <p><strong>Support:</strong> 24/7 monitoring</p>
                  <p><strong>Backup:</strong> Real-time replication</p>
                  <p><strong>Compliance:</strong> FCA regulatory ready</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-500" />
                Integration Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Existing pension providers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Banking & payment systems</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">CRM and back-office systems</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Regulatory reporting platforms</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Third-party data providers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Pension Operations?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join leading pension providers who have already modernized their client experience
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Demo
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Download className="h-5 w-5 mr-2" />
                Download Brochure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PensionSystemPitch;