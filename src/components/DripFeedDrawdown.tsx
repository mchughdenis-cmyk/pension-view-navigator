import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Calendar, 
  DollarSign, 
  TrendingDown, 
  Clock,
  Calculator,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Settings,
  PauseCircle,
  PlayCircle,
  Edit,
  Trash,
  Plus
} from "lucide-react";

interface DripFeedSchedule {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'scheduled' | 'completed';
  nextPayment: string;
  totalPaid: number;
  remainingPayments?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default function DripFeedDrawdown() {
  const [availableBalance] = useState(364313); // Remaining after tax-free cash
  const [newSchedule, setNewSchedule] = useState<{
    name: string;
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'annually';
    startDate: string;
    endDate: string;
  }>({
    name: '',
    amount: 1000,
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [showNewScheduleForm, setShowNewScheduleForm] = useState(false);
  
  const [schedules, setSchedules] = useState<DripFeedSchedule[]>([
    {
      id: '1',
      name: 'Regular Income',
      amount: 2000,
      frequency: 'monthly',
      startDate: '2024-01-01',
      status: 'active',
      nextPayment: '2024-09-01',
      totalPaid: 16000,
      remainingPayments: 180
    },
    {
      id: '2',
      name: 'Holiday Fund',
      amount: 5000,
      frequency: 'annually',
      startDate: '2024-06-01',
      endDate: '2029-06-01',
      status: 'scheduled',
      nextPayment: '2025-06-01',
      totalPaid: 5000,
      remainingPayments: 4
    },
    {
      id: '3',
      name: 'Emergency Fund Top-up',
      amount: 1500,
      frequency: 'quarterly',
      startDate: '2024-03-01',
      endDate: '2026-03-01',
      status: 'paused',
      nextPayment: '2024-12-01',
      totalPaid: 4500,
      remainingPayments: 5
    }
  ]);

  const totalMonthlyIncome = schedules
    .filter(s => s.status === 'active')
    .reduce((total, schedule) => {
      if (schedule.frequency === 'monthly') return total + schedule.amount;
      if (schedule.frequency === 'quarterly') return total + (schedule.amount / 3);
      if (schedule.frequency === 'annually') return total + (schedule.amount / 12);
      return total;
    }, 0);

  const totalAnnualIncome = totalMonthlyIncome * 12;
  const withdrawalRate = (totalAnnualIncome / availableBalance) * 100;

  const addNewSchedule = () => {
    if (!newSchedule.name || !newSchedule.amount) return;
    
    const schedule: DripFeedSchedule = {
      id: Date.now().toString(),
      name: newSchedule.name,
      amount: newSchedule.amount,
      frequency: newSchedule.frequency,
      startDate: newSchedule.startDate,
      endDate: newSchedule.endDate || undefined,
      status: new Date(newSchedule.startDate) > new Date() ? 'scheduled' : 'active',
      nextPayment: newSchedule.startDate,
      totalPaid: 0,
      remainingPayments: newSchedule.endDate 
        ? Math.ceil((new Date(newSchedule.endDate).getTime() - new Date(newSchedule.startDate).getTime()) / 
            (newSchedule.frequency === 'monthly' ? 30 : newSchedule.frequency === 'quarterly' ? 90 : 365) / 86400000)
        : undefined
    };

    setSchedules([...schedules, schedule]);
    setNewSchedule({
      name: '',
      amount: 1000,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setShowNewScheduleForm(false);
  };

  const toggleScheduleStatus = (id: string) => {
    setSchedules(schedules.map(schedule => {
      if (schedule.id === id) {
        const newStatus: DripFeedSchedule['status'] = schedule.status === 'active' ? 'paused' : 'active';
        return { ...schedule, status: newStatus };
      }
      return schedule;
    }));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const getStatusBadge = (status: DripFeedSchedule['status']) => {
    const configs = {
      active: { variant: 'default' as const, label: 'Active', icon: PlayCircle },
      paused: { variant: 'secondary' as const, label: 'Paused', icon: PauseCircle },
      scheduled: { variant: 'outline' as const, label: 'Scheduled', icon: Clock },
      completed: { variant: 'outline' as const, label: 'Completed', icon: CheckCircle }
    };
    
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getFrequencyLabel = (frequency: DripFeedSchedule['frequency']) => {
    return {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually'
    }[frequency];
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Drip Feed Drawdown</h1>
          <p className="text-muted-foreground">Set up and manage your regular pension withdrawals</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(availableBalance)}</div>
              <p className="text-xs text-muted-foreground">Pension drawdown pot</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <Calendar className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(totalMonthlyIncome)}</div>
              <p className="text-xs text-muted-foreground">From active schedules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Withdrawal</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{formatCurrency(totalAnnualIncome)}</div>
              <p className="text-xs text-muted-foreground">{withdrawalRate.toFixed(1)}% withdrawal rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.filter(s => s.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">Out of {schedules.length} total</p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Rate Warning */}
        {withdrawalRate > 4 && (
          <Card className="border-warning">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-semibold text-warning">High Withdrawal Rate Warning</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your current withdrawal rate of {withdrawalRate.toFixed(1)}% exceeds the commonly recommended 4% rule. 
                    This may increase the risk of depleting your pension pot earlier than expected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Existing Schedules */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Drawdown Schedules</h2>
              <Button onClick={() => setShowNewScheduleForm(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </div>

            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{schedule.name}</CardTitle>
                      {getStatusBadge(schedule.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Amount</Label>
                        <p className="font-semibold">{formatCurrency(schedule.amount)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Frequency</Label>
                        <p className="font-semibold">{getFrequencyLabel(schedule.frequency)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Next Payment</Label>
                        <p className="font-semibold">{formatDate(schedule.nextPayment)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Total Paid</Label>
                        <p className="font-semibold">{formatCurrency(schedule.totalPaid)}</p>
                      </div>
                    </div>

                    {schedule.remainingPayments && (
                      <div className="mb-4">
                        <Label className="text-xs text-muted-foreground">Remaining Payments</Label>
                        <p className="font-semibold">{schedule.remainingPayments}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleScheduleStatus(schedule.id)}
                        disabled={schedule.status === 'completed'}
                      >
                        {schedule.status === 'active' ? (
                          <>
                            <PauseCircle className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteSchedule(schedule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* New Schedule Form or Quick Stats */}
          <div>
            {showNewScheduleForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="schedule-name">Schedule Name</Label>
                    <Input
                      id="schedule-name"
                      placeholder="e.g., Monthly Income"
                      value={newSchedule.name}
                      onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="1000"
                      value={newSchedule.amount}
                      onChange={(e) => setNewSchedule({...newSchedule, amount: Number(e.target.value)})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select 
                      value={newSchedule.frequency} 
                      onValueChange={(value) => 
                        setNewSchedule({...newSchedule, frequency: value as 'monthly' | 'quarterly' | 'annually'})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newSchedule.startDate}
                      onChange={(e) => setNewSchedule({...newSchedule, startDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end-date">End Date (Optional)</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newSchedule.endDate}
                      onChange={(e) => setNewSchedule({...newSchedule, endDate: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={addNewSchedule} className="flex-1">
                      Create Schedule
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewScheduleForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Quick Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Desired Monthly Income</Label>
                      <Input 
                        type="number" 
                        placeholder="2000" 
                        className="text-right"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Annual withdrawal: £24,000</p>
                      <p>Withdrawal rate: 6.6%</p>
                    </div>
                    <Button size="sm" className="w-full">
                      Create Schedule
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sustainability Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Years at current rate:</span>
                      <span className="font-semibold">~15 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recommended max:</span>
                      <span className="font-semibold text-success">{formatCurrency(availableBalance * 0.04 / 12)}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Growth needed:</span>
                      <span className="font-semibold">5.2% annually</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
