import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useClients, useClientDetail, processDrawdown } from "@/hooks/useClientData";
import { calculateUFPLS, formatGBP } from "@/lib/pensionCalculations";
import { 
  Banknote, 
  Building2, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";

interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bankName: string;
  isDefault: boolean;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  accountId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestDate: string;
  expectedDate: string;
  reference: string;
}

export default function InstantWithdrawal() {
  const { toast } = useToast();
  const [availableBalance] = useState(364313);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  
  const [newAccount, setNewAccount] = useState({
    accountName: "",
    accountNumber: "",
    sortCode: "",
    bankName: ""
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      accountName: 'Main Current Account',
      accountNumber: '12345678',
      sortCode: '12-34-56',
      bankName: 'Lloyds Bank',
      isDefault: true
    },
    {
      id: '2',
      accountName: 'Savings Account',
      accountNumber: '87654321',
      sortCode: '65-43-21',
      bankName: 'HSBC',
      isDefault: false
    }
  ]);

  const [withdrawalHistory] = useState<WithdrawalRequest[]>([
    {
      id: 'WD001',
      amount: 5000,
      accountId: '1',
      status: 'completed',
      requestDate: '2024-08-10',
      expectedDate: '2024-08-11',
      reference: 'Pension withdrawal'
    },
    {
      id: 'WD002',
      amount: 2500,
      accountId: '1',
      status: 'processing',
      requestDate: '2024-08-25',
      expectedDate: '2024-08-26',
      reference: 'Emergency fund'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAccountNumber = (accountNumber: string) => {
    if (!showAccountNumbers) {
      return '****' + accountNumber.slice(-4);
    }
    return accountNumber;
  };

  const formatSortCode = (sortCode: string) => {
    if (!showAccountNumbers) {
      return '**-**-' + sortCode.slice(-2);
    }
    return sortCode;
  };

  const handleAddAccount = () => {
    if (!newAccount.accountName || !newAccount.accountNumber || !newAccount.sortCode || !newAccount.bankName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all account details",
        variant: "destructive"
      });
      return;
    }

    const account: BankAccount = {
      id: Date.now().toString(),
      ...newAccount,
      isDefault: bankAccounts.length === 0
    };

    setBankAccounts([...bankAccounts, account]);
    setNewAccount({ accountName: "", accountNumber: "", sortCode: "", bankName: "" });
    setShowAddAccount(false);
    
    toast({
      title: "Bank Account Added",
      description: "Your new bank account has been added successfully",
    });
  };

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Funds",
        description: "The withdrawal amount exceeds your available balance",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select a bank account for the withdrawal",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setWithdrawalAmount("");
      setSelectedAccount("");
      
      toast({
        title: "Withdrawal Requested",
        description: `${formatCurrency(amount)} will be transferred to your selected account within 1-2 business days`,
      });
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-warning text-warning-foreground',
      'processing': 'bg-primary text-primary-foreground',
      'completed': 'bg-success text-success-foreground',
      'failed': 'bg-destructive text-destructive-foreground'
    };
    
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <BackButton />
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Instant Withdrawal</h1>
          <p className="text-muted-foreground">Withdraw funds from your drawdown account</p>
        </div>

        {/* Available Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-2">
              {formatCurrency(availableBalance)}
            </div>
            <p className="text-muted-foreground">Ready for immediate withdrawal</p>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (£)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                min="1"
                max={availableBalance}
              />
              <p className="text-sm text-muted-foreground">
                Maximum: {formatCurrency(availableBalance)}
              </p>
            </div>

            {/* Bank Account Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Bank Account</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAccountNumbers(!showAccountNumbers)}
                  >
                    {showAccountNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showAccountNumbers ? 'Hide' : 'Show'} Details
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddAccount(true)}
                  >
                    Add Account
                  </Button>
                </div>
              </div>
              
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">{account.accountName}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.bankName} • {formatSortCode(account.sortCode)} • {formatAccountNumber(account.accountNumber)}
                          </div>
                        </div>
                        {account.isDefault && <Badge variant="outline">Default</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Account Form */}
            {showAddAccount && (
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Bank Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input
                        id="accountName"
                        placeholder="e.g., Main Current Account"
                        value={newAccount.accountName}
                        onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., Lloyds Bank"
                        value={newAccount.bankName}
                        onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="12345678"
                        value={newAccount.accountNumber}
                        onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sortCode">Sort Code</Label>
                      <Input
                        id="sortCode"
                        placeholder="12-34-56"
                        value={newAccount.sortCode}
                        onChange={(e) => setNewAccount({...newAccount, sortCode: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddAccount}>Add Account</Button>
                    <Button variant="outline" onClick={() => setShowAddAccount(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Notice */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Secure Transfer</h4>
                  <p className="text-sm text-muted-foreground">
                    Funds will be transferred via secure bank transfer. Processing time is typically 1-2 business days.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleWithdrawal} 
              disabled={isProcessing || !withdrawalAmount || !selectedAccount}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Withdrawals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawalHistory.map((withdrawal) => {
                const account = bankAccounts.find(acc => acc.id === withdrawal.accountId);
                return (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(withdrawal.amount)}</div>
                      <div className="text-sm text-muted-foreground">
                        To: {account?.accountName} ({account?.bankName})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Requested: {new Date(withdrawal.requestDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {getStatusBadge(withdrawal.status)}
                      <div className="text-sm text-muted-foreground">
                        {withdrawal.status === 'completed' ? 'Completed' : `Expected: ${new Date(withdrawal.expectedDate).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}