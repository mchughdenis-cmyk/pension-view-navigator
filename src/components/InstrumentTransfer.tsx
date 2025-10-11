import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BackButton } from '@/components/ui/back-button';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Calendar,
  ArrowRight,
  FileText
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InstrumentTransfer {
  id: string;
  instrumentName: string;
  isin: string;
  quantity: number;
  currentValue: number;
  fromProvider: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  dateInitiated: string;
  estimatedCompletion: string;
  progressPercentage: number;
  notes?: string;
}

export default function InstrumentTransfer() {
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);

  // Mock data for instrument transfers
  const transfers: InstrumentTransfer[] = [
    {
      id: '1',
      instrumentName: 'Vanguard FTSE Global All Cap Index Fund',
      isin: 'GB00BD3RZ582',
      quantity: 2500,
      currentValue: 85420,
      fromProvider: 'Hargreaves Lansdown',
      status: 'completed',
      dateInitiated: '2024-01-15',
      estimatedCompletion: '2024-02-15',
      progressPercentage: 100,
      notes: 'Transfer completed successfully'
    },
    {
      id: '2',
      instrumentName: 'iShares Core FTSE 100 UCITS ETF',
      isin: 'IE00B53HP851',
      quantity: 1200,
      currentValue: 42350,
      fromProvider: 'AJ Bell',
      status: 'in-progress',
      dateInitiated: '2024-02-01',
      estimatedCompletion: '2024-03-01',
      progressPercentage: 65,
      notes: 'Awaiting provider confirmation'
    },
    {
      id: '3',
      instrumentName: 'Legal & General UK 100 Index Trust',
      isin: 'GB00BPN5P782',
      quantity: 5000,
      currentValue: 125600,
      fromProvider: 'Fidelity',
      status: 'in-progress',
      dateInitiated: '2024-02-10',
      estimatedCompletion: '2024-03-10',
      progressPercentage: 40,
      notes: 'Documentation received, processing transfer'
    },
    {
      id: '4',
      instrumentName: 'BlackRock Corporate Bond Index Fund',
      isin: 'GB00B84DXF46',
      quantity: 3500,
      currentValue: 67890,
      fromProvider: 'Standard Life',
      status: 'pending',
      dateInitiated: '2024-02-20',
      estimatedCompletion: '2024-03-20',
      progressPercentage: 15,
      notes: 'Awaiting initial documentation'
    },
    {
      id: '5',
      instrumentName: 'HSBC American Index Fund',
      isin: 'GB00B80QG615',
      quantity: 1800,
      currentValue: 98750,
      fromProvider: 'Hargreaves Lansdown',
      status: 'delayed',
      dateInitiated: '2024-01-20',
      estimatedCompletion: '2024-02-20',
      progressPercentage: 55,
      notes: 'Delayed due to missing certificates from provider'
    }
  ];

  const getStatusColor = (status: InstrumentTransfer['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in-progress':
        return 'bg-primary text-primary-foreground';
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'delayed':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: InstrumentTransfer['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <TrendingUp className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const totalValue = transfers.reduce((sum, t) => sum + t.currentValue, 0);
  const completedTransfers = transfers.filter(t => t.status === 'completed').length;
  const inProgressTransfers = transfers.filter(t => t.status === 'in-progress').length;
  const overallProgress = transfers.reduce((sum, t) => sum + t.progressPercentage, 0) / transfers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-muted via-background to-secondary-muted p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Instrument Transfer Tracking</h1>
          <p className="text-muted-foreground">Monitor the progress of your individual stock and fund transfers</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transfer Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">£{totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{transfers.length} instruments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{Math.round(overallProgress)}%</div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{completedTransfers}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully transferred</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{inProgressTransfers}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>Track each line of stock through the transfer process</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument</TableHead>
                  <TableHead>From Provider</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Completion</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow 
                    key={transfer.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedTransfer(selectedTransfer === transfer.id ? null : transfer.id)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{transfer.instrumentName}</div>
                        <div className="text-xs text-muted-foreground">{transfer.isin}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{transfer.fromProvider}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{transfer.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">£{transfer.currentValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={transfer.progressPercentage} className="w-20" />
                        <span className="text-sm text-muted-foreground">{transfer.progressPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transfer.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(transfer.status)}
                          {transfer.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(transfer.estimatedCompletion).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className={`w-4 h-4 transition-transform ${selectedTransfer === transfer.id ? 'rotate-90' : ''}`} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Expanded Details */}
            {selectedTransfer && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                {transfers.filter(t => t.id === selectedTransfer).map(transfer => (
                  <div key={transfer.id}>
                    <h4 className="font-semibold mb-3">Transfer Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="font-medium">Initiated</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transfer.dateInitiated).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      {transfer.notes && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">Latest Update</div>
                            <div className="text-sm text-muted-foreground">{transfer.notes}</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="font-medium">Estimated Completion</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transfer.estimatedCompletion).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
            <CardDescription>
              Questions about your instrument transfers?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Transfer times can vary depending on the provider and instrument type. If you have concerns about a delayed transfer, please contact your adviser.
            </p>
            <Button variant="outline">
              Contact Your Adviser
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
