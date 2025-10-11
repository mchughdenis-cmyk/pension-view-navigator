import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  User, 
  CreditCard, 
  ArrowRightLeft, 
  TrendingDown,
  Banknote,
  Calendar,
  Shield,
  Target,
  PiggyBank,
  FileText,
  Play,
  Pause,
  SkipForward,
  Home,
  Info
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const demoSteps = [
  {
    id: 1,
    title: "Client Onboarding",
    description: "Complete client registration and risk assessment",
    icon: User,
    color: "bg-primary text-primary-foreground",
    path: "/onboarding"
  },
  {
    id: 2,
    title: "Initial Contribution",
    description: "Set up first pension contribution",
    icon: CreditCard,
    color: "bg-success text-success-foreground",
    path: null
  },
  {
    id: 3,
    title: "Pension Transfer",
    description: "Transfer existing pension funds",
    icon: ArrowRightLeft,
    color: "bg-secondary text-secondary-foreground",
    path: "/transfer"
  },
  {
    id: 4,
    title: "Drawdown Options",
    description: "Explore withdrawal and income options",
    icon: TrendingDown,
    color: "bg-warning text-warning-foreground",
    path: "/drawdown"
  },
  {
    id: 5,
    title: "Regular Income Setup",
    description: "Configure drip-feed withdrawals",
    icon: Calendar,
    color: "bg-accent text-accent-foreground",
    path: "/drip-feed"
  },
  {
    id: 6,
    title: "Instant Withdrawal",
    description: "Process immediate withdrawal request",
    icon: Banknote,
    color: "bg-primary text-primary-foreground",
    path: "/instant-withdrawal"
  }
];

export default function SystemDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const progressPercentage = ((completedSteps.length) / demoSteps.length) * 100;

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId - 1);
    const step = demoSteps[stepId - 1];
    
    if (step.path) {
      toast({
        title: `Navigating to ${step.title}`,
        description: "Opening the component with demo data pre-filled",
      });
      
      // Navigate to the component
      navigate(step.path);
    } else {
      // For contribution step, show inline demo
      setCurrentStep(stepId - 1);
    }
  };

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
      toast({
        title: "Step Completed!",
        description: `${demoSteps[stepId - 1].title} has been completed.`,
      });
    }
  };

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      completeStep(demoSteps[currentStep].id);
      setCurrentStep(currentStep + 1);
    }
  };

  const skipToStep = (index: number) => {
    setCurrentStep(index);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsPlaying(false);
    toast({
      title: "Demo Reset",
      description: "Starting from the beginning",
    });
  };

  const renderStepContent = () => {
    const step = demoSteps[currentStep];

    switch (step.id) {
      case 1:
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is the client onboarding process where we collect personal details, financial information, risk assessment, and goal setting.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Demo Client Profile</CardTitle>
                <CardDescription>Sample data for demonstration purposes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg font-semibold">John Smith</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p className="text-lg font-semibold">45 years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Annual Income</p>
                    <p className="text-lg font-semibold">£65,000</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Retirement</p>
                    <p className="text-lg font-semibold">Age 65</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Risk Profile</p>
                    <p className="text-lg font-semibold">Moderate</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Employment</p>
                    <p className="text-lg font-semibold">Employed</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-success" />
                  <p className="text-sm text-muted-foreground">Risk assessment completed with balanced portfolio recommendation</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/onboarding')}>
                <User className="w-4 h-4 mr-2" />
                View Full Onboarding
              </Button>
              <Button onClick={nextStep}>
                Complete & Continue
                <SkipForward className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Setting up the initial contribution to fund the pension. This can be a one-time lump sum or recurring monthly payments.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Initial Contribution Setup</CardTitle>
                <CardDescription>Demo contribution details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">One-Time Contribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">£25,000</div>
                      <p className="text-sm text-muted-foreground mt-2">Initial lump sum transfer</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Monthly Contribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-success">£500</div>
                      <p className="text-sm text-muted-foreground mt-2">Regular monthly payment</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment Method</span>
                    <Badge>Bank Transfer</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Processing Time</span>
                    <Badge variant="secondary">3-5 Business Days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tax Relief</span>
                    <Badge variant="outline">Automatic (20%)</Badge>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    With tax relief, your £500 monthly contribution becomes £625 in your pension pot.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => skipToStep(0)}>
                Back
              </Button>
              <Button onClick={nextStep}>
                Complete & Continue
                <SkipForward className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Transfer existing pension funds from previous providers. Track progress and manage documentation throughout the transfer process.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Pension Transfers In Progress</CardTitle>
                <CardDescription>Demo transfer from previous employer pension</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">ABC Workplace Pension</p>
                      <p className="text-sm text-muted-foreground">Policy: WP-123456</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">£87,500</p>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transfer request submitted</span>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Provider acknowledged</span>
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Funds released</span>
                      <div className="w-5 h-5 rounded-full border-2 border-primary animate-pulse" />
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="text-sm">Transfer complete</span>
                      <div className="w-5 h-5 rounded-full border-2 border-muted" />
                    </div>
                  </div>

                  <Progress value={60} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">Estimated completion: 2-3 weeks</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => skipToStep(1)}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => navigate('/transfer')}>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  View Full Transfer Journey
                </Button>
                <Button onClick={nextStep}>
                  Complete & Continue
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Plan your retirement income with flexible drawdown options. Choose lump sums, regular income, or a combination of both.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Current Pension Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">£287,450</div>
                  <p className="text-sm text-muted-foreground mt-2">Available for drawdown</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">25% Tax-Free Cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">£71,862</div>
                  <p className="text-sm text-muted-foreground mt-2">Lump sum available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sustainable Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">£14,372</div>
                  <p className="text-sm text-muted-foreground mt-2">Annual (5% rule)</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Drawdown Strategy</CardTitle>
                <CardDescription>Recommended approach for John Smith</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">Take 25% Tax-Free Lump Sum</p>
                        <p className="text-sm text-muted-foreground">One-time withdrawal of £71,862</p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <PiggyBank className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Regular Monthly Income</p>
                        <p className="text-sm text-muted-foreground">£1,200/month from remaining funds</p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Banknote className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-medium">Ad-hoc Withdrawals</p>
                        <p className="text-sm text-muted-foreground">Available when needed</p>
                      </div>
                    </div>
                    <Badge variant="outline">Optional</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => skipToStep(2)}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => navigate('/drawdown')}>
                  <TrendingDown className="w-4 h-4 mr-2" />
                  View Drawdown Planning
                </Button>
                <Button onClick={nextStep}>
                  Complete & Continue
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Set up regular automated income payments (drip-feed) to receive consistent monthly income from your pension.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Regular Income Configuration</CardTitle>
                <CardDescription>Automated monthly payments to your bank account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Payment Amount</p>
                    <div className="text-4xl font-bold text-primary">£1,200</div>
                    <p className="text-sm text-muted-foreground mt-1">Per month</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Payment Date</p>
                    <div className="text-4xl font-bold text-foreground">1st</div>
                    <p className="text-sm text-muted-foreground mt-1">Of each month</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Bank Account</span>
                    <span className="font-mono text-sm">****1234</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Next Payment</span>
                    <Badge>1st February 2024</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Annual Total</span>
                    <span className="font-semibold">£14,400</span>
                  </div>
                </div>

                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Payments are automatically processed on the 1st of each month. You can adjust or pause payments at any time.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => skipToStep(3)}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => navigate('/drip-feed')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Drip Feed Setup
                </Button>
                <Button onClick={nextStep}>
                  Complete & Continue
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Request instant ad-hoc withdrawals when you need additional funds beyond your regular income.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Instant Withdrawal Request</CardTitle>
                <CardDescription>Fast access to your pension funds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Withdrawal Amount</p>
                  <div className="text-5xl font-bold text-primary">£5,000</div>
                  <p className="text-sm text-muted-foreground mt-4">Processed within 2-3 business days</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tax-free allowance used</span>
                    <Badge variant="outline">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tax on withdrawal</span>
                    <span className="font-semibold text-destructive">£1,000 (20%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Net amount received</span>
                    <span className="text-xl font-bold text-success">£4,000</span>
                  </div>
                </div>

                <Alert>
                  <Banknote className="h-4 w-4" />
                  <AlertDescription>
                    Funds will be transferred to your registered bank account ending in 1234.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Identity verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Bank details confirmed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Withdrawal limits checked</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => skipToStep(4)}>
                Back
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => navigate('/instant-withdrawal')}>
                  <Banknote className="w-4 h-4 mr-2" />
                  View Instant Withdrawal
                </Button>
                <Button onClick={() => {
                  completeStep(6);
                  toast({
                    title: "Demo Complete!",
                    description: "You've completed the full system demonstration.",
                  });
                }}>
                  Complete Demo
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Play className="w-8 h-8 text-primary" />
                Pension System Demo
              </h1>
              <p className="text-muted-foreground mt-1">
                Experience the complete client journey from onboarding to drawdown
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={resetDemo}>
                Reset Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Demo Progress</CardTitle>
                <CardDescription>
                  {completedSteps.length} of {demoSteps.length} steps completed
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {demoSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === index;
            
            return (
              <Card
                key={step.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isCurrent ? 'ring-2 ring-primary' : ''
                } ${isCompleted ? 'bg-success/10' : ''}`}
                onClick={() => skipToStep(index)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${step.color}`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs font-medium">{step.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2">
                  Step {currentStep + 1} of {demoSteps.length}
                </Badge>
                <CardTitle className="text-2xl">{demoSteps[currentStep].title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {demoSteps[currentStep].description}
                </CardDescription>
              </div>
              <div className={`p-3 rounded-full ${demoSteps[currentStep].color}`}>
                {React.createElement(demoSteps[currentStep].icon, { className: "w-6 h-6" })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Completion Message */}
        {completedSteps.length === demoSteps.length && (
          <Card className="mt-6 border-success">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Demo Complete!</h3>
              <p className="text-muted-foreground mb-4">
                You've experienced the full pension management system from client onboarding through to retirement income.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={resetDemo} variant="outline">
                  Restart Demo
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
