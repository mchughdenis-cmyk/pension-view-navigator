import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, Calculator, Target, FileText, CreditCard, Shield, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RealisticKYC from "@/components/RealisticKYC";

const steps = [
  { id: 1, title: "Welcome", icon: User, description: "Personal information" },
  { id: 2, title: "Financial Details", icon: Calculator, description: "Income and circumstances" },
  { id: 3, title: "Goals & Objectives", icon: Target, description: "Retirement planning" },
  { id: 4, title: "Risk Assessment", icon: Shield, description: "Investment preferences" },
  { id: 5, title: "Product Selection", icon: FileText, description: "Choose your pension" },
  { id: 6, title: "Identity Verification", icon: ShieldCheck, description: "KYC & AML checks" },
  { id: 7, title: "Initial Contribution", icon: CreditCard, description: "Set up payments" },
];

const ClientOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Details
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    
    // Financial Details
    annualIncome: '',
    employmentStatus: '',
    existingPensions: '',
    
    // Goals
    retirementAge: '',
    monthlyContribution: '',
    riskTolerance: '',
    
    // Product Selection
    selectedProduct: '',
    
    // KYC
    kycCompleted: false,

    // Terms
    termsAccepted: false,
    marketingConsent: false,
  });

  const { toast } = useToast();

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Application Submitted",
      description: "Your pension application has been submitted successfully. We'll be in touch within 2 business days.",
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Welcome to Your Pension Journey</h2>
              <p className="text-muted-foreground">Let's get started by collecting some basic information about you.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select value={formData.title} onValueChange={(value) => updateFormData('title', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Mr</SelectItem>
                    <SelectItem value="mrs">Mrs</SelectItem>
                    <SelectItem value="miss">Miss</SelectItem>
                    <SelectItem value="ms">Ms</SelectItem>
                    <SelectItem value="dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Enter your full address"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Financial Circumstances</h2>
              <p className="text-muted-foreground">Help us understand your current financial situation.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="annualIncome">Annual Income (before tax)</Label>
                <Select value={formData.annualIncome} onValueChange={(value) => updateFormData('annualIncome', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-20k">Under £20,000</SelectItem>
                    <SelectItem value="20k-40k">£20,000 - £40,000</SelectItem>
                    <SelectItem value="40k-60k">£40,000 - £60,000</SelectItem>
                    <SelectItem value="60k-80k">£60,000 - £80,000</SelectItem>
                    <SelectItem value="80k-100k">£80,000 - £100,000</SelectItem>
                    <SelectItem value="over-100k">Over £100,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Employment Status</Label>
                <RadioGroup value={formData.employmentStatus} onValueChange={(value) => updateFormData('employmentStatus', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="employed" id="employed" />
                    <Label htmlFor="employed">Employed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self-employed" id="self-employed" />
                    <Label htmlFor="self-employed">Self-employed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unemployed" id="unemployed" />
                    <Label htmlFor="unemployed">Unemployed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="retired" id="retired" />
                    <Label htmlFor="retired">Retired</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Do you have any existing pensions?</Label>
                <RadioGroup value={formData.existingPensions} onValueChange={(value) => updateFormData('existingPensions', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none">No existing pensions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="workplace" id="workplace" />
                    <Label htmlFor="workplace">Workplace pension only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal">Personal pension only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both workplace and personal pensions</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Your Retirement Goals</h2>
              <p className="text-muted-foreground">Let's plan for your future retirement needs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="retirementAge">Target Retirement Age</Label>
                <Select value={formData.retirementAge} onValueChange={(value) => updateFormData('retirementAge', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select retirement age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="55">55</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="65">65</SelectItem>
                    <SelectItem value="67">67 (State Pension Age)</SelectItem>
                    <SelectItem value="70">70</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                <Select value={formData.monthlyContribution} onValueChange={(value) => updateFormData('monthlyContribution', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contribution amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">£50</SelectItem>
                    <SelectItem value="100">£100</SelectItem>
                    <SelectItem value="200">£200</SelectItem>
                    <SelectItem value="300">£300</SelectItem>
                    <SelectItem value="500">£500</SelectItem>
                    <SelectItem value="1000">£1,000</SelectItem>
                    <SelectItem value="custom">Custom amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Retirement Planning Calculator</CardTitle>
                <CardDescription>Based on your inputs, here's a projection of your pension value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">£{formData.monthlyContribution ? (parseInt(formData.monthlyContribution) * 12 * 30).toLocaleString() : '0'}</div>
                    <div className="text-sm text-muted-foreground">Total Contributions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">£{formData.monthlyContribution ? (parseInt(formData.monthlyContribution) * 12 * 30 * 1.4).toLocaleString() : '0'}</div>
                    <div className="text-sm text-muted-foreground">Projected Value (4% growth)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">£{formData.monthlyContribution ? Math.round(parseInt(formData.monthlyContribution) * 12 * 30 * 1.4 * 0.04 / 12).toLocaleString() : '0'}</div>
                    <div className="text-sm text-muted-foreground">Monthly Income in Retirement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Risk Assessment</h2>
              <p className="text-muted-foreground">Help us understand your investment preferences and risk tolerance.</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">How would you describe your investment knowledge?</Label>
                <RadioGroup value={formData.riskTolerance} onValueChange={(value) => updateFormData('riskTolerance', value)}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="conservative" id="conservative" className="mt-1" />
                      <div>
                        <Label htmlFor="conservative" className="font-medium">Conservative</Label>
                        <p className="text-sm text-muted-foreground">I prefer lower risk investments even if returns may be lower</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="moderate" id="moderate" className="mt-1" />
                      <div>
                        <Label htmlFor="moderate" className="font-medium">Moderate</Label>
                        <p className="text-sm text-muted-foreground">I'm comfortable with some risk for potentially better returns</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="aggressive" id="aggressive" className="mt-1" />
                      <div>
                        <Label htmlFor="aggressive" className="font-medium">Aggressive</Label>
                        <p className="text-sm text-muted-foreground">I'm willing to accept higher risk for potentially higher returns</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Investment Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.riskTolerance === 'conservative' && (
                  <div>
                    <Badge className="mb-2">Conservative Portfolio</Badge>
                    <p className="text-sm text-muted-foreground">
                      70% Bonds & Fixed Income, 30% Equities. Focus on capital preservation with steady, lower-risk growth.
                    </p>
                  </div>
                )}
                {formData.riskTolerance === 'moderate' && (
                  <div>
                    <Badge className="mb-2">Balanced Portfolio</Badge>
                    <p className="text-sm text-muted-foreground">
                      50% Equities, 40% Bonds, 10% Alternatives. Balanced approach between growth potential and risk management.
                    </p>
                  </div>
                )}
                {formData.riskTolerance === 'aggressive' && (
                  <div>
                    <Badge className="mb-2">Growth Portfolio</Badge>
                    <p className="text-sm text-muted-foreground">
                      80% Equities, 15% Bonds, 5% Alternatives. Maximum growth potential with higher volatility.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Select Your Pension Product</h2>
              <p className="text-muted-foreground">Choose the pension product that best suits your needs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={`cursor-pointer transition-all ${formData.selectedProduct === 'sipp' ? 'ring-2 ring-primary' : ''}`} 
                    onClick={() => updateFormData('selectedProduct', 'sipp')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${formData.selectedProduct === 'sipp' ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                    Self-Invested Personal Pension (SIPP)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Full investment control</li>
                    <li>• Wide range of investment options</li>
                    <li>• Annual management charge: 0.45%</li>
                    <li>• Perfect for experienced investors</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${formData.selectedProduct === 'stakeholder' ? 'ring-2 ring-primary' : ''}`} 
                    onClick={() => updateFormData('selectedProduct', 'stakeholder')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${formData.selectedProduct === 'stakeholder' ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                    Stakeholder Pension
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Simple and straightforward</li>
                    <li>• Professionally managed funds</li>
                    <li>• Annual management charge: 1.5%</li>
                    <li>• Great for beginners</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {formData.selectedProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Monthly Contribution</Label>
                        <div className="font-medium">£{formData.monthlyContribution}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Product Type</Label>
                        <div className="font-medium">{formData.selectedProduct === 'sipp' ? 'SIPP' : 'Stakeholder Pension'}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Risk Level</Label>
                        <div className="font-medium capitalize">{formData.riskTolerance}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Target Retirement</Label>
                        <div className="font-medium">Age {formData.retirementAge}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Identity Verification (KYC)</h2>
              <p className="text-muted-foreground">
                Before we can open your pension and accept contributions, we need to verify your identity in line with FCA & AML regulations.
              </p>
            </div>

            <RealisticKYC />

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="kycCompleted"
                    checked={formData.kycCompleted}
                    onCheckedChange={(checked) => updateFormData('kycCompleted', checked)}
                  />
                  <Label htmlFor="kycCompleted" className="text-sm leading-relaxed">
                    I confirm I have completed all five verification stages above (ID document, selfie, PEP, sanctions and address checks) and the results show as <span className="font-semibold">Verified</span>.
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Setup Initial Contribution</h2>
              <p className="text-muted-foreground">Setup your payment method and confirm your application.</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Client Name</Label>
                    <div className="font-medium">{formData.firstName} {formData.lastName}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Monthly Contribution</Label>
                    <div className="font-medium">£{formData.monthlyContribution}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Product</Label>
                    <div className="font-medium">{formData.selectedProduct === 'sipp' ? 'SIPP' : 'Stakeholder Pension'}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Risk Profile</Label>
                    <div className="font-medium capitalize">{formData.riskTolerance}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => updateFormData('termsAccepted', checked)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I have read and agree to the Terms and Conditions, Key Features Document, and Privacy Policy
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => updateFormData('marketingConsent', checked)}
                />
                <Label htmlFor="marketing" className="text-sm">
                  I consent to receiving marketing communications (optional)
                </Label>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">Ready to Submit</h3>
                  <p className="text-sm text-muted-foreground">
                    Your application is complete and ready to be submitted. We'll review it within 2 business days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepComplete = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.dateOfBirth;
      case 2:
        return formData.annualIncome && formData.employmentStatus && formData.existingPensions;
      case 3:
        return formData.retirementAge && formData.monthlyContribution;
      case 4:
        return formData.riskTolerance;
      case 5:
        return formData.selectedProduct;
      case 6:
        return formData.kycCompleted;
      case 7:
        return formData.termsAccepted;
      default:
        return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Client Onboarding</h1>
              <Badge variant="outline">Step {currentStep} of 7</Badge>
            </div>
            <Progress value={(currentStep / 7) * 100} className="mb-4" />
            
            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id || isStepComplete(step.id);
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                      isActive ? 'border-primary text-primary' : 'border-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <div className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                    {index < steps.length - 1 && (
                      <Separator className="w-8 mx-4 hidden lg:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 7 ? (
              <Button 
                onClick={nextStep} 
                disabled={!canProceed}
              >
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.termsAccepted}
                className="bg-primary hover:bg-primary/90"
              >
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientOnboarding;