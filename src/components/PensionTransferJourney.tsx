import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Clock, Upload, FileText, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface PensionProvider {
  id: string;
  name: string;
  type: 'drawdown' | 'annuity' | 'defined-benefit';
  currentValue?: number;
  monthlyPayment?: number;
  status: 'active' | 'in-payment' | 'deferred';
}

interface TransferRequest {
  id: string;
  providerId: string;
  status: 'draft' | 'submitted' | 'in-progress' | 'completed' | 'rejected';
  submittedDate?: Date;
  expectedCompletion?: Date;
  currentStep: number;
  totalSteps: number;
  documents: { name: string; status: 'pending' | 'received' | 'approved' }[];
}

const PensionTransferJourney = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('identify');
  const [selectedPensions, setSelectedPensions] = useState<string[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  
  // Mock data for existing pensions
  const [existingPensions] = useState<PensionProvider[]>([
    {
      id: '1',
      name: 'Aviva Personal Pension',
      type: 'drawdown',
      currentValue: 125000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Scottish Widows Annuity',
      type: 'annuity',
      monthlyPayment: 850,
      status: 'in-payment'
    },
    {
      id: '3',
      name: 'Legal & General SIPP',
      type: 'drawdown',
      currentValue: 67000,
      status: 'deferred'
    }
  ]);

  const [newPension, setNewPension] = useState({
    providerName: '',
    policyNumber: '',
    type: 'drawdown' as 'drawdown' | 'annuity' | 'defined-benefit',
    currentValue: '',
    monthlyPayment: '',
    contactDetails: ''
  });

  const handlePensionSelection = (pensionId: string) => {
    setSelectedPensions(prev => 
      prev.includes(pensionId) 
        ? prev.filter(id => id !== pensionId)
        : [...prev, pensionId]
    );
  };

  const handleSubmitTransfer = () => {
    const newRequests = selectedPensions.map(pensionId => ({
      id: Math.random().toString(36).substr(2, 9),
      providerId: pensionId,
      status: 'submitted' as const,
      submittedDate: new Date(),
      expectedCompletion: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000), // 12 weeks
      currentStep: 1,
      totalSteps: 5,
      documents: [
        { name: 'Transfer Authority Form', status: 'approved' as const },
        { name: 'Provider Response', status: 'pending' as const },
        { name: 'Valuation Statement', status: 'pending' as const },
        { name: 'Transfer Completion', status: 'pending' as const }
      ]
    }));

    setTransferRequests(prev => [...prev, ...newRequests]);
    setActiveTab('track');
    toast({
      title: "Transfer Requests Submitted",
      description: `${selectedPensions.length} transfer request(s) have been submitted successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'submitted': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDocumentIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'received': return <FileText className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pension Transfer Centre</h1>
          <p className="text-gray-600">Transfer your existing pensions and track progress in real-time</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="identify">Identify Pensions</TabsTrigger>
            <TabsTrigger value="submit">Submit Transfers</TabsTrigger>
            <TabsTrigger value="track">Track Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="identify" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Existing Pensions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Found Pensions
                  </CardTitle>
                  <CardDescription>
                    We've identified these pensions linked to your details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {existingPensions.map(pension => (
                    <div key={pension.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{pension.name}</h4>
                          <Badge variant="outline" className="mb-2">
                            {pension.type === 'drawdown' ? 'Drawdown' : 
                             pension.type === 'annuity' ? 'Annuity' : 'Defined Benefit'}
                          </Badge>
                          {pension.currentValue && (
                            <p className="text-lg font-bold text-green-600">
                              £{pension.currentValue.toLocaleString()}
                            </p>
                          )}
                          {pension.monthlyPayment && (
                            <p className="text-lg font-bold text-blue-600">
                              £{pension.monthlyPayment}/month
                            </p>
                          )}
                          <Badge 
                            variant={pension.status === 'active' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {pension.status}
                          </Badge>
                        </div>
                        <Button
                          variant={selectedPensions.includes(pension.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePensionSelection(pension.id)}
                        >
                          {selectedPensions.includes(pension.id) ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Add New Pension */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    Add Another Pension
                  </CardTitle>
                  <CardDescription>
                    Can't find a pension? Add it manually
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="providerName">Provider Name</Label>
                    <Input 
                      id="providerName"
                      value={newPension.providerName}
                      onChange={(e) => setNewPension(prev => ({...prev, providerName: e.target.value}))}
                      placeholder="e.g. Aviva, Scottish Widows"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input 
                      id="policyNumber"
                      value={newPension.policyNumber}
                      onChange={(e) => setNewPension(prev => ({...prev, policyNumber: e.target.value}))}
                      placeholder="Your policy reference"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pensionType">Pension Type</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newPension.type}
                      onChange={(e) => setNewPension(prev => ({...prev, type: e.target.value as any}))}
                    >
                      <option value="drawdown">Drawdown</option>
                      <option value="annuity">Annuity</option>
                      <option value="defined-benefit">Defined Benefit</option>
                    </select>
                  </div>

                  {newPension.type !== 'annuity' && (
                    <div className="space-y-2">
                      <Label htmlFor="currentValue">Current Value (£)</Label>
                      <Input 
                        id="currentValue"
                        type="number"
                        value={newPension.currentValue}
                        onChange={(e) => setNewPension(prev => ({...prev, currentValue: e.target.value}))}
                        placeholder="0"
                      />
                    </div>
                  )}

                  {newPension.type === 'annuity' && (
                    <div className="space-y-2">
                      <Label htmlFor="monthlyPayment">Monthly Payment (£)</Label>
                      <Input 
                        id="monthlyPayment"
                        type="number"
                        value={newPension.monthlyPayment}
                        onChange={(e) => setNewPension(prev => ({...prev, monthlyPayment: e.target.value}))}
                        placeholder="0"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="contactDetails">Provider Contact Details</Label>
                    <Textarea 
                      id="contactDetails"
                      value={newPension.contactDetails}
                      onChange={(e) => setNewPension(prev => ({...prev, contactDetails: e.target.value}))}
                      placeholder="Phone, email, or address"
                      rows={3}
                    />
                  </div>

                  <Button className="w-full">Add Pension</Button>
                </CardContent>
              </Card>
            </div>

            {selectedPensions.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Ready to Proceed</h3>
                      <p className="text-sm text-gray-600">
                        {selectedPensions.length} pension(s) selected for transfer
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab('submit')}>
                      Continue to Transfer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  Transfer Summary
                </CardTitle>
                <CardDescription>
                  Review and submit your transfer requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedPensions.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No pensions selected. Please go back to identify pensions first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-4">
                      {selectedPensions.map(pensionId => {
                        const pension = existingPensions.find(p => p.id === pensionId);
                        if (!pension) return null;
                        
                        return (
                          <div key={pensionId} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{pension.name}</h4>
                                <Badge variant="outline" className="mb-2">
                                  {pension.type === 'drawdown' ? 'Drawdown' : 
                                   pension.type === 'annuity' ? 'Annuity' : 'Defined Benefit'}
                                </Badge>
                                {pension.currentValue && (
                                  <p className="text-green-600 font-semibold">
                                    Value: £{pension.currentValue.toLocaleString()}
                                  </p>
                                )}
                                {pension.monthlyPayment && (
                                  <p className="text-blue-600 font-semibold">
                                    Monthly: £{pension.monthlyPayment}
                                  </p>
                                )}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePensionSelection(pensionId)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Important Information</h4>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Transfer timescales typically range from 6-12 weeks</li>
                        <li>• We'll keep you updated throughout the process</li>
                        <li>• You can cancel within the cooling-off period</li>
                        <li>• Your existing benefits may be affected</li>
                      </ul>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('identify')}
                        className="flex-1"
                      >
                        Back to Review
                      </Button>
                      <Button 
                        onClick={handleSubmitTransfer}
                        className="flex-1"
                      >
                        Submit Transfer Requests
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="track" className="space-y-6">
            <div className="grid gap-6">
              {transferRequests.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">No Active Transfers</h3>
                    <p className="text-gray-600 mb-4">
                      You don't have any transfer requests in progress yet.
                    </p>
                    <Button onClick={() => setActiveTab('identify')}>
                      Start New Transfer
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                transferRequests.map(request => {
                  const pension = existingPensions.find(p => p.id === request.providerId);
                  const progressPercentage = (request.currentStep / request.totalSteps) * 100;
                  
                  return (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{pension?.name}</CardTitle>
                            <CardDescription>
                              Submitted {request.submittedDate?.toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{request.currentStep} of {request.totalSteps} steps</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                          <p className="text-xs text-gray-600 mt-1">
                            Expected completion: {request.expectedCompletion?.toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Document Status</h4>
                          <div className="space-y-2">
                            {request.documents.map((doc, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 border rounded">
                                {getDocumentIcon(doc.status)}
                                <span className="flex-1">{doc.name}</span>
                                <Badge 
                                  variant={doc.status === 'approved' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {doc.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Contact Support
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PensionTransferJourney;
