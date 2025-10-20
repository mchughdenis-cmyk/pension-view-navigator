import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Shield, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  MapPin, 
  Landmark,
  Clock,
  XCircle
} from 'lucide-react'

type VerificationStatus = 'pending' | 'in-review' | 'approved' | 'rejected' | 'incomplete'

interface KYCData {
  identityVerification: {
    documentType: string
    documentNumber: string
    issueDate: string
    expiryDate: string
    nationality: string
    uploadedDoc?: File | null
    status: VerificationStatus
  }
  proofOfAddress: {
    documentType: string
    uploadedDoc?: File | null
    status: VerificationStatus
  }
  sourceOfFunds: {
    primarySource: string
    employmentStatus: string
    employerName: string
    annualIncome: string
    sourceOfWealth: string
    additionalDetails: string
    status: VerificationStatus
  }
  pepScreening: {
    isPEP: boolean
    pepDetails: string
    familyMemberPEP: boolean
    familyDetails: string
    status: VerificationStatus
  }
  riskAssessment: {
    occupation: string
    industryExperience: string
    investmentExperience: string
    riskTolerance: string
    status: VerificationStatus
  }
}

const KYCVerification = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('identity')
  const [overallStatus, setOverallStatus] = useState<VerificationStatus>('incomplete')
  const [completionPercentage, setCompletionPercentage] = useState(0)
  
  const [kycData, setKycData] = useState<KYCData>({
    identityVerification: {
      documentType: '',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      nationality: '',
      uploadedDoc: null,
      status: 'incomplete'
    },
    proofOfAddress: {
      documentType: '',
      uploadedDoc: null,
      status: 'incomplete'
    },
    sourceOfFunds: {
      primarySource: '',
      employmentStatus: '',
      employerName: '',
      annualIncome: '',
      sourceOfWealth: '',
      additionalDetails: '',
      status: 'incomplete'
    },
    pepScreening: {
      isPEP: false,
      pepDetails: '',
      familyMemberPEP: false,
      familyDetails: '',
      status: 'incomplete'
    },
    riskAssessment: {
      occupation: '',
      industryExperience: '',
      investmentExperience: '',
      riskTolerance: '',
      status: 'incomplete'
    }
  })

  const updateKYCData = (section: keyof KYCData, field: string, value: any) => {
    setKycData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (section: 'identityVerification' | 'proofOfAddress', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updateKYCData(section, 'uploadedDoc', file)
      toast({
        title: 'Document uploaded',
        description: `${file.name} has been uploaded successfully.`
      })
    }
  }

  const getStatusBadge = (status: VerificationStatus) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending', className: '' },
      'in-review': { variant: 'default' as const, icon: AlertCircle, label: 'In Review', className: '' },
      approved: { variant: 'default' as const, icon: CheckCircle2, label: 'Approved', className: 'bg-green-500' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected', className: '' },
      incomplete: { variant: 'outline' as const, icon: AlertCircle, label: 'Incomplete', className: '' }
    }
    
    const config = statusConfig[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className={config.className || undefined}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const submitForReview = () => {
    setOverallStatus('in-review')
    setCompletionPercentage(100)
    toast({
      title: 'KYC Submitted',
      description: 'Your verification documents have been submitted for compliance review.'
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8" />
              KYC & AML Verification
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete your identity verification and compliance checks
            </p>
          </div>
          {getStatusBadge(overallStatus)}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Verification Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{completionPercentage}% Complete</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="identity" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Identity
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </TabsTrigger>
          <TabsTrigger value="funds" className="flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            Funds
          </TabsTrigger>
          <TabsTrigger value="screening" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Screening
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Risk
          </TabsTrigger>
        </TabsList>

        {/* Identity Verification */}
        <TabsContent value="identity">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Identity Verification</CardTitle>
                  <CardDescription>Upload a valid government-issued ID document</CardDescription>
                </div>
                {getStatusBadge(kycData.identityVerification.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select 
                    value={kycData.identityVerification.documentType}
                    onValueChange={(value) => updateKYCData('identityVerification', 'documentType', value)}
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers-license">Driver's License</SelectItem>
                      <SelectItem value="national-id">National ID Card</SelectItem>
                      <SelectItem value="residence-permit">Residence Permit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Document Number *</Label>
                  <Input
                    id="documentNumber"
                    value={kycData.identityVerification.documentNumber}
                    onChange={(e) => updateKYCData('identityVerification', 'documentNumber', e.target.value)}
                    placeholder="Enter document number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={kycData.identityVerification.issueDate}
                    onChange={(e) => updateKYCData('identityVerification', 'issueDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={kycData.identityVerification.expiryDate}
                    onChange={(e) => updateKYCData('identityVerification', 'expiryDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={kycData.identityVerification.nationality}
                    onChange={(e) => updateKYCData('identityVerification', 'nationality', e.target.value)}
                    placeholder="Enter nationality"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Upload Document *</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {kycData.identityVerification.uploadedDoc 
                      ? kycData.identityVerification.uploadedDoc.name
                      : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">PDF, PNG, JPG up to 10MB</p>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload('identityVerification', e)}
                    className="hidden"
                    id="identity-upload"
                  />
                  <Label htmlFor="identity-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Select File</span>
                    </Button>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proof of Address */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Proof of Address</CardTitle>
                  <CardDescription>Provide a recent utility bill or bank statement (dated within last 3 months)</CardDescription>
                </div>
                {getStatusBadge(kycData.proofOfAddress.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="addressDocType">Document Type *</Label>
                <Select 
                  value={kycData.proofOfAddress.documentType}
                  onValueChange={(value) => updateKYCData('proofOfAddress', 'documentType', value)}
                >
                  <SelectTrigger id="addressDocType">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility-bill">Utility Bill (Gas, Electric, Water)</SelectItem>
                    <SelectItem value="bank-statement">Bank Statement</SelectItem>
                    <SelectItem value="council-tax">Council Tax Bill</SelectItem>
                    <SelectItem value="mortgage-statement">Mortgage Statement</SelectItem>
                    <SelectItem value="tenancy-agreement">Tenancy Agreement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Upload Document *</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {kycData.proofOfAddress.uploadedDoc 
                      ? kycData.proofOfAddress.uploadedDoc.name
                      : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">PDF, PNG, JPG up to 10MB</p>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload('proofOfAddress', e)}
                    className="hidden"
                    id="address-upload"
                  />
                  <Label htmlFor="address-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Select File</span>
                    </Button>
                  </Label>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Requirements:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Document must be dated within the last 3 months</li>
                  <li>Your full name and address must be clearly visible</li>
                  <li>Document must be from a recognized institution</li>
                  <li>Scans or photographs must be clear and legible</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Source of Funds */}
        <TabsContent value="funds">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Source of Funds & Wealth</CardTitle>
                  <CardDescription>Provide information about your financial background</CardDescription>
                </div>
                {getStatusBadge(kycData.sourceOfFunds.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primarySource">Primary Source of Funds *</Label>
                  <Select 
                    value={kycData.sourceOfFunds.primarySource}
                    onValueChange={(value) => updateKYCData('sourceOfFunds', 'primarySource', value)}
                  >
                    <SelectTrigger id="primarySource">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employment">Employment Income</SelectItem>
                      <SelectItem value="business">Business Income</SelectItem>
                      <SelectItem value="investments">Investment Returns</SelectItem>
                      <SelectItem value="inheritance">Inheritance</SelectItem>
                      <SelectItem value="savings">Personal Savings</SelectItem>
                      <SelectItem value="property">Property Sale</SelectItem>
                      <SelectItem value="pension">Pension</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
                  <Select 
                    value={kycData.sourceOfFunds.employmentStatus}
                    onValueChange={(value) => updateKYCData('sourceOfFunds', 'employmentStatus', value)}
                  >
                    <SelectTrigger id="employmentStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer/Business Name</Label>
                  <Input
                    id="employerName"
                    value={kycData.sourceOfFunds.employerName}
                    onChange={(e) => updateKYCData('sourceOfFunds', 'employerName', e.target.value)}
                    placeholder="Enter employer or business name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income Range *</Label>
                  <Select 
                    value={kycData.sourceOfFunds.annualIncome}
                    onValueChange={(value) => updateKYCData('sourceOfFunds', 'annualIncome', value)}
                  >
                    <SelectTrigger id="annualIncome">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-25k">£0 - £25,000</SelectItem>
                      <SelectItem value="25-50k">£25,000 - £50,000</SelectItem>
                      <SelectItem value="50-100k">£50,000 - £100,000</SelectItem>
                      <SelectItem value="100-250k">£100,000 - £250,000</SelectItem>
                      <SelectItem value="250k+">£250,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceOfWealth">Source of Wealth *</Label>
                <Textarea
                  id="sourceOfWealth"
                  value={kycData.sourceOfFunds.sourceOfWealth}
                  onChange={(e) => updateKYCData('sourceOfFunds', 'sourceOfWealth', e.target.value)}
                  placeholder="Please describe how you accumulated your wealth (e.g., career earnings, business sale, inheritance, property appreciation)"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalDetails">Additional Information</Label>
                <Textarea
                  id="additionalDetails"
                  value={kycData.sourceOfFunds.additionalDetails}
                  onChange={(e) => updateKYCData('sourceOfFunds', 'additionalDetails', e.target.value)}
                  placeholder="Any additional information about your financial background"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PEP Screening */}
        <TabsContent value="screening">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>PEP & Sanctions Screening</CardTitle>
                  <CardDescription>Politically Exposed Person declaration and sanctions check</CardDescription>
                </div>
                {getStatusBadge(kycData.pepScreening.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">What is a Politically Exposed Person (PEP)?</p>
                  <p className="text-sm text-muted-foreground">
                    A PEP is someone who holds or has held a prominent public position, such as a head of state, 
                    government minister, senior politician, senior government official, judicial or military official, 
                    or executive of a state-owned corporation.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="isPEP"
                      checked={kycData.pepScreening.isPEP}
                      onCheckedChange={(checked) => updateKYCData('pepScreening', 'isPEP', checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="isPEP" className="font-medium cursor-pointer">
                        I am a Politically Exposed Person (PEP)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Check this box if you currently hold or have held a prominent public position
                      </p>
                    </div>
                  </div>

                  {kycData.pepScreening.isPEP && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="pepDetails">PEP Details *</Label>
                      <Textarea
                        id="pepDetails"
                        value={kycData.pepScreening.pepDetails}
                        onChange={(e) => updateKYCData('pepScreening', 'pepDetails', e.target.value)}
                        placeholder="Please provide details about your position, country, and dates of service"
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="familyMemberPEP"
                      checked={kycData.pepScreening.familyMemberPEP}
                      onCheckedChange={(checked) => updateKYCData('pepScreening', 'familyMemberPEP', checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="familyMemberPEP" className="font-medium cursor-pointer">
                        A family member or close associate is a PEP
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        This includes spouses, partners, children, parents, siblings, or close business associates
                      </p>
                    </div>
                  </div>

                  {kycData.pepScreening.familyMemberPEP && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="familyDetails">Relationship Details *</Label>
                      <Textarea
                        id="familyDetails"
                        value={kycData.pepScreening.familyDetails}
                        onChange={(e) => updateKYCData('pepScreening', 'familyDetails', e.target.value)}
                        placeholder="Please provide details about the relationship and their position"
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Sanctions Screening</p>
                <p className="text-sm text-muted-foreground">
                  Your information will be automatically screened against international sanctions lists including 
                  UN, EU, OFAC, and UK HM Treasury sanctions lists.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Help us understand your investment profile</CardDescription>
                </div>
                {getStatusBadge(kycData.riskAssessment.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation *</Label>
                <Input
                  id="occupation"
                  value={kycData.riskAssessment.occupation}
                  onChange={(e) => updateKYCData('riskAssessment', 'occupation', e.target.value)}
                  placeholder="Enter your occupation"
                />
              </div>

              <div className="space-y-3">
                <Label>Industry Experience *</Label>
                <RadioGroup 
                  value={kycData.riskAssessment.industryExperience}
                  onValueChange={(value) => updateKYCData('riskAssessment', 'industryExperience', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="exp-none" />
                    <Label htmlFor="exp-none" className="font-normal cursor-pointer">No experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="basic" id="exp-basic" />
                    <Label htmlFor="exp-basic" className="font-normal cursor-pointer">Basic (1-3 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="exp-intermediate" />
                    <Label htmlFor="exp-intermediate" className="font-normal cursor-pointer">Intermediate (3-10 years)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="experienced" id="exp-experienced" />
                    <Label htmlFor="exp-experienced" className="font-normal cursor-pointer">Experienced (10+ years)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Investment Experience *</Label>
                <RadioGroup 
                  value={kycData.riskAssessment.investmentExperience}
                  onValueChange={(value) => updateKYCData('riskAssessment', 'investmentExperience', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="inv-none" />
                    <Label htmlFor="inv-none" className="font-normal cursor-pointer">No investment experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="limited" id="inv-limited" />
                    <Label htmlFor="inv-limited" className="font-normal cursor-pointer">Limited (basic savings/deposits only)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="inv-moderate" />
                    <Label htmlFor="inv-moderate" className="font-normal cursor-pointer">Moderate (stocks, bonds, mutual funds)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extensive" id="inv-extensive" />
                    <Label htmlFor="inv-extensive" className="font-normal cursor-pointer">Extensive (complex instruments, derivatives)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Risk Tolerance *</Label>
                <RadioGroup 
                  value={kycData.riskAssessment.riskTolerance}
                  onValueChange={(value) => updateKYCData('riskAssessment', 'riskTolerance', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="conservative" id="risk-conservative" />
                    <Label htmlFor="risk-conservative" className="font-normal cursor-pointer">
                      Conservative - Prefer capital preservation over growth
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="risk-moderate" />
                    <Label htmlFor="risk-moderate" className="font-normal cursor-pointer">
                      Moderate - Balance between growth and security
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="aggressive" id="risk-aggressive" />
                    <Label htmlFor="risk-aggressive" className="font-normal cursor-pointer">
                      Aggressive - Willing to accept higher risk for potential growth
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline" size="lg">
          Save Progress
        </Button>
        <Button size="lg" onClick={submitForReview}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Submit for Review
        </Button>
      </div>
    </div>
  )
}

export default KYCVerification
