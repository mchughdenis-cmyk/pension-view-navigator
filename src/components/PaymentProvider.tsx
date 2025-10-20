import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  Landmark, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowDownToLine,
  ArrowUpFromLine,
  Calendar,
  Shield,
  AlertCircle,
  Receipt,
  Wallet
} from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  last4: string
  name: string
  expiryDate?: string
  bankName?: string
  isDefault: boolean
  status: 'verified' | 'pending' | 'failed'
}

interface Transaction {
  id: string
  type: 'contribution' | 'withdrawal'
  amount: number
  date: string
  status: 'completed' | 'pending' | 'processing' | 'failed'
  method: string
  reference: string
}

const PaymentProvider = () => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('methods')
  const [isAddingMethod, setIsAddingMethod] = useState(false)
  const [newMethodType, setNewMethodType] = useState<'card' | 'bank'>('card')

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      name: 'Visa ending in 4242',
      expiryDate: '12/25',
      isDefault: true,
      status: 'verified'
    },
    {
      id: '2',
      type: 'bank',
      last4: '1234',
      name: 'Barclays Current Account',
      bankName: 'Barclays',
      isDefault: false,
      status: 'verified'
    }
  ])

  // Mock transactions
  const transactions: Transaction[] = [
    {
      id: 'TXN001',
      type: 'contribution',
      amount: 5000,
      date: '2024-01-15',
      status: 'completed',
      method: 'Visa ****4242',
      reference: 'CONT-2024-001'
    },
    {
      id: 'TXN002',
      type: 'withdrawal',
      amount: 1500,
      date: '2024-01-10',
      status: 'completed',
      method: 'Barclays ****1234',
      reference: 'WTH-2024-001'
    },
    {
      id: 'TXN003',
      type: 'contribution',
      amount: 500,
      date: '2024-01-05',
      status: 'processing',
      method: 'Visa ****4242',
      reference: 'CONT-2024-002'
    }
  ]

  const [contributionForm, setContributionForm] = useState({
    amount: '',
    paymentMethod: '',
    frequency: 'one-time',
    startDate: '',
    product: ''
  })

  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    paymentMethod: '',
    product: '',
    reason: ''
  })

  const handleAddPaymentMethod = () => {
    toast({
      title: 'Payment method added',
      description: 'Your payment method has been added successfully and is being verified.'
    })
    setIsAddingMethod(false)
  }

  const handleRemoveMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id))
    toast({
      title: 'Payment method removed',
      description: 'The payment method has been removed from your account.'
    })
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })))
    toast({
      title: 'Default payment method updated',
      description: 'Your default payment method has been updated.'
    })
  }

  const handleContribution = () => {
    toast({
      title: 'Contribution processed',
      description: `£${parseFloat(contributionForm.amount).toLocaleString()} contribution has been initiated.`,
      variant: 'default'
    })
    setContributionForm({
      amount: '',
      paymentMethod: '',
      frequency: 'one-time',
      startDate: '',
      product: ''
    })
  }

  const handleWithdrawal = () => {
    toast({
      title: 'Withdrawal requested',
      description: `£${parseFloat(withdrawalForm.amount).toLocaleString()} withdrawal request submitted for processing.`,
      variant: 'default'
    })
    setWithdrawalForm({
      amount: '',
      paymentMethod: '',
      product: '',
      reason: ''
    })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { variant: 'default' as const, icon: CheckCircle2, label: 'Completed', className: 'bg-green-500' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending', className: '' },
      processing: { variant: 'default' as const, icon: Clock, label: 'Processing', className: '' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, label: 'Failed', className: '' },
      verified: { variant: 'default' as const, icon: CheckCircle2, label: 'Verified', className: 'bg-green-500' }
    }
    
    const statusConfig = config[status as keyof typeof config]
    if (!statusConfig) return null
    
    const Icon = statusConfig.icon
    
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className || undefined}>
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Wallet className="w-8 h-8" />
          Payment Provider
        </h1>
        <p className="text-muted-foreground">
          Manage your payment methods, contributions, and withdrawals
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="methods" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="contribute" className="flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4" />
            Contributions
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center gap-2">
            <ArrowUpFromLine className="w-4 h-4" />
            Withdrawals
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Payment Methods */}
        <TabsContent value="methods" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Your Payment Methods</h2>
              <p className="text-muted-foreground">Manage cards and bank accounts</p>
            </div>
            <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new card or bank account for contributions and withdrawals
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label>Method Type</Label>
                    <RadioGroup value={newMethodType} onValueChange={(value: 'card' | 'bank') => setNewMethodType(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="font-normal cursor-pointer">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="font-normal cursor-pointer">Bank Account</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {newMethodType === 'card' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" type="password" maxLength={4} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" placeholder="John Smith" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" placeholder="12345678" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sortCode">Sort Code</Label>
                        <Input id="sortCode" placeholder="12-34-56" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input id="accountName" placeholder="John Smith" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" placeholder="Barclays" />
                      </div>
                    </>
                  )}

                  <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Secure & Encrypted</p>
                      <p className="text-xs text-muted-foreground">
                        Your payment information is encrypted and stored securely in compliance with PCI DSS standards.
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingMethod(false)}>Cancel</Button>
                  <Button onClick={handleAddPaymentMethod}>Add Payment Method</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id} className={method.isDefault ? 'border-primary' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        {method.type === 'card' ? (
                          <CreditCard className="w-6 h-6" />
                        ) : (
                          <Landmark className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{method.name}</h3>
                          {method.isDefault && <Badge variant="secondary">Default</Badge>}
                          {getStatusBadge(method.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'card' 
                            ? `Expires ${method.expiryDate}`
                            : `${method.bankName} Account`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveMethod(method.id)}
                        disabled={method.isDefault}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contributions */}
        <TabsContent value="contribute" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Make a Contribution</CardTitle>
              <CardDescription>Add funds to your pension products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product">Select Product *</Label>
                  <Select 
                    value={contributionForm.product}
                    onValueChange={(value) => setContributionForm(prev => ({ ...prev, product: value }))}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Choose product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sipp">Self-Invested Personal Pension</SelectItem>
                      <SelectItem value="stakeholder">Stakeholder Pension</SelectItem>
                      <SelectItem value="drawdown">Drawdown Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={contributionForm.amount}
                      onChange={(e) => setContributionForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethodContrib">Payment Method *</Label>
                  <Select 
                    value={contributionForm.paymentMethod}
                    onValueChange={(value) => setContributionForm(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger id="paymentMethodContrib">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.filter(m => m.status === 'verified').map(method => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select 
                    value={contributionForm.frequency}
                    onValueChange={(value) => setContributionForm(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time Payment</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {contributionForm.frequency !== 'one-time' && (
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={contributionForm.startDate}
                    onChange={(e) => setContributionForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
              )}

              <Separator />

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Contribution Limits & Tax Relief</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Annual allowance: £60,000 (including tax relief)</li>
                  <li>• Basic rate tax relief (20%) applied automatically</li>
                  <li>• Higher/additional rate relief claimed via self-assessment</li>
                  <li>• Minimum contribution: £100</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Save for Later</Button>
                <Button onClick={handleContribution} disabled={!contributionForm.amount || !contributionForm.paymentMethod || !contributionForm.product}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Process Contribution
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals */}
        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>Withdraw funds from your pension products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Important Information</p>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Pension withdrawals may have tax implications. 25% of your pension is usually tax-free. 
                    Please consult with your financial adviser before making large withdrawals.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="withdrawProduct">Select Product *</Label>
                  <Select 
                    value={withdrawalForm.product}
                    onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, product: value }))}
                  >
                    <SelectTrigger id="withdrawProduct">
                      <SelectValue placeholder="Choose product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drawdown">Drawdown Account (£287,450 available)</SelectItem>
                      <SelectItem value="sipp">SIPP (£125,000 available)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawAmount">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethodWithdraw">Destination Account *</Label>
                  <Select 
                    value={withdrawalForm.paymentMethod}
                    onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger id="paymentMethodWithdraw">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.filter(m => m.type === 'bank' && m.status === 'verified').map(method => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Withdrawal *</Label>
                  <Select 
                    value={withdrawalForm.reason}
                    onValueChange={(value) => setWithdrawalForm(prev => ({ ...prev, reason: value }))}
                  >
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retirement-income">Retirement Income</SelectItem>
                      <SelectItem value="lump-sum">Tax-Free Lump Sum</SelectItem>
                      <SelectItem value="emergency">Emergency Funds</SelectItem>
                      <SelectItem value="rebalancing">Portfolio Rebalancing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Withdrawal Processing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Standard processing: 3-5 business days</li>
                  <li>• Funds will be transferred to your nominated bank account</li>
                  <li>• Minimum withdrawal: £500</li>
                  <li>• Tax will be calculated and deducted automatically</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleWithdrawal} disabled={!withdrawalForm.amount || !withdrawalForm.paymentMethod || !withdrawalForm.product || !withdrawalForm.reason}>
                  <ArrowUpFromLine className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your contributions and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === 'contribution' ? (
                            <ArrowDownToLine className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpFromLine className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {transaction.type === 'contribution' ? '+' : '-'}£{transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{new Date(transaction.date).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{transaction.method}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PaymentProvider
