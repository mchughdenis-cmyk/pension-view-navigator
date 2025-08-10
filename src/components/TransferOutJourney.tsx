import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Building2,
  FileText,
  Calculator,
  Shield,
  Info
} from "lucide-react";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const currentPensions = [
  {
    id: 1,
    provider: "Aviva Personal Pension",
    value: 125000,
    type: "Personal Pension"
  },
  {
    id: 2,
    provider: "Legal & General SIPP",
    value: 280000,
    type: "SIPP"
  },
  {
    id: 3,
    provider: "Old Company Scheme",
    value: 45000,
    type: "Workplace Pension"
  }
];

const transferReasons = [
  { id: "costs", label: "Reduce costs and charges" },
  { id: "investment", label: "Better investment options" },
  { id: "consolidation", label: "Consolidate multiple pensions" },
  { id: "service", label: "Improved customer service" },
  { id: "advice", label: "Access to financial advice" },
  { id: "other", label: "Other reasons" }
];

export default function TransferOutJourney() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPension, setSelectedPension] = useState("");
  const [transferValue, setTransferValue] = useState("");
  const [receivingProvider, setReceivingProvider] = useState("");
  const [receivingScheme, setReceivingScheme] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [confirmations, setConfirmations] = useState({
    understood: false,
    charges: false,
    noReturn: false,
    advice: false
  });

  const steps = [
    { number: 1, title: "Select Pension", description: "Choose which pension to transfer" },
    { number: 2, title: "Transfer Details", description: "Enter receiving provider details" },
    { number: 3, title: "Reason & Value", description: "Specify reason and amount" },
    { number: 4, title: "Important Information", description: "Key warnings and confirmations" },
    { number: 5, title: "Review & Submit", description: "Final review before submission" }
  ];

  const progressPercentage = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedPensionData = currentPensions.find(p => p.id.toString() === selectedPension);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto p-6">
          <BackButton label="Back to Products" />
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transfer Out Request</h1>
            <p className="text-muted-foreground mt-1">Transfer your pension to another provider</p>
          </div>
          
          {/* Progress */}
          <div className="mt-6">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
                  </div>
                  <p className="text-xs mt-1 max-w-[100px]">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Tabs value={currentStep.toString()} className="w-full">
          {/* Step 1: Select Pension */}
          <TabsContent value="1">
            <Card>
              <CardHeader>
                <CardTitle>Select Pension to Transfer</CardTitle>
                <p className="text-muted-foreground">Choose which pension you'd like to transfer out</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedPension} onValueChange={setSelectedPension}>
                  {currentPensions.map((pension) => (
                    <div key={pension.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value={pension.id.toString()} id={pension.id.toString()} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={pension.id.toString()} className="font-medium cursor-pointer">
                            {pension.provider}
                          </Label>
                          <Badge variant="outline">{pension.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Current value: {formatCurrency(pension.value)}
                        </p>
                      </div>
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </RadioGroup>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You can only transfer out from accumulation phase pensions. Pensions already in drawdown cannot be transferred.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                  <Button onClick={nextStep} disabled={!selectedPension}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Transfer Details */}
          <TabsContent value="2">
            <Card>
              <CardHeader>
                <CardTitle>Receiving Provider Details</CardTitle>
                <p className="text-muted-foreground">Enter details of where you want to transfer your pension</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receiving-provider">Receiving Provider Name</Label>
                  <Input
                    id="receiving-provider"
                    placeholder="e.g. Hargreaves Lansdown, AJ Bell"
                    value={receivingProvider}
                    onChange={(e) => setReceivingProvider(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiving-scheme">Receiving Scheme Name</Label>
                  <Input
                    id="receiving-scheme"
                    placeholder="e.g. HL SIPP, AJ Bell Youinvest SIPP"
                    value={receivingScheme}
                    onChange={(e) => setReceivingScheme(e.target.value)}
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please ensure you have opened an account with the receiving provider before submitting this transfer request.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep} disabled={!receivingProvider || !receivingScheme}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Reason & Value */}
          <TabsContent value="3">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Reason & Amount</CardTitle>
                <p className="text-muted-foreground">Help us understand your transfer requirements</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Reason for Transfer (select one)</Label>
                  <RadioGroup value={reason} onValueChange={setReason}>
                    {transferReasons.map((r) => (
                      <div key={r.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={r.id} id={r.id} />
                        <Label htmlFor={r.id} className="cursor-pointer">{r.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  {reason === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="other-reason">Please specify</Label>
                      <Textarea
                        id="other-reason"
                        placeholder="Describe your reason for transferring"
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="transfer-value">Transfer Amount (Optional)</Label>
                  <Input
                    id="transfer-value"
                    type="number"
                    placeholder="Leave blank for full transfer"
                    value={transferValue}
                    onChange={(e) => setTransferValue(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    If left blank, we'll transfer the full pension value. 
                    {selectedPensionData && ` Current value: ${formatCurrency(selectedPensionData.value)}`}
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep} disabled={!reason || (reason === "other" && !otherReason)}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Important Information */}
          <TabsContent value="4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Important Information
                </CardTitle>
                <p className="text-muted-foreground">Please read and confirm your understanding</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> Transferring your pension is a significant decision that could affect your retirement income. 
                    Please consider taking financial advice before proceeding.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="understood"
                      checked={confirmations.understood}
                      onCheckedChange={(checked) => 
                        setConfirmations(prev => ({ ...prev, understood: checked as boolean }))
                      }
                    />
                    <Label htmlFor="understood" className="text-sm">
                      I understand that transferring my pension may affect my retirement benefits and that I should consider taking financial advice.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="charges"
                      checked={confirmations.charges}
                      onCheckedChange={(checked) => 
                        setConfirmations(prev => ({ ...prev, charges: checked as boolean }))
                      }
                    />
                    <Label htmlFor="charges" className="text-sm">
                      I understand that exit charges may apply to my current pension and that the receiving provider may also have charges.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="noReturn"
                      checked={confirmations.noReturn}
                      onCheckedChange={(checked) => 
                        setConfirmations(prev => ({ ...prev, noReturn: checked as boolean }))
                      }
                    />
                    <Label htmlFor="noReturn" className="text-sm">
                      I understand that once the transfer is complete, I cannot return my pension to this provider.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="advice"
                      checked={confirmations.advice}
                      onCheckedChange={(checked) => 
                        setConfirmations(prev => ({ ...prev, advice: checked as boolean }))
                      }
                    />
                    <Label htmlFor="advice" className="text-sm">
                      I confirm that I have considered taking financial advice or have decided to proceed without advice.
                    </Label>
                  </div>
                </div>

                <div className="bg-accent/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Transfer Timeline
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Transfer request processed: 1-2 working days</li>
                    <li>• Provider notification: 3-5 working days</li>
                    <li>• Transfer completion: 6-8 weeks typically</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={!Object.values(confirmations).every(Boolean)}
                  >
                    Continue to Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Review & Submit */}
          <TabsContent value="5">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Transfer Request</CardTitle>
                <p className="text-muted-foreground">Please review all details before submitting</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Transfer From</h3>
                    {selectedPensionData && (
                      <div className="p-4 border rounded-lg bg-accent/30">
                        <p className="font-medium">{selectedPensionData.provider}</p>
                        <p className="text-sm text-muted-foreground">{selectedPensionData.type}</p>
                        <p className="text-sm">Value: {formatCurrency(selectedPensionData.value)}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Transfer To</h3>
                    <div className="p-4 border rounded-lg bg-accent/30">
                      <p className="font-medium">{receivingProvider}</p>
                      <p className="text-sm text-muted-foreground">{receivingScheme}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-semibold">Transfer Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <p className="font-medium">
                        {transferValue ? formatCurrency(parseInt(transferValue)) : "Full Transfer"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reason:</span>
                      <p className="font-medium">
                        {reason === "other" ? otherReason : transferReasons.find(r => r.id === reason)?.label}
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    By submitting this request, you confirm that all information is accurate and that you understand the implications of transferring your pension.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Transfer Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}