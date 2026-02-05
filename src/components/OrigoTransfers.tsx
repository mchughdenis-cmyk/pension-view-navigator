import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowRightLeft, 
  Plus, 
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Download,
  Eye,
  RefreshCw,
  FileText,
  Building2,
  User,
  Calendar,
  Loader2
} from 'lucide-react'

interface Transfer {
  id: string
  origoId: string
  clientName: string
  clientRef: string
  cedingProvider: string
  receivingProvider: string
  transferValue: number
  status: 'pending' | 'in_progress' | 'awaiting_info' | 'completed' | 'rejected'
  type: 'inbound' | 'outbound'
  initiatedDate: string
  lastUpdate: string
  progress: number
  stages: TransferStage[]
}

interface TransferStage {
  name: string
  status: 'completed' | 'current' | 'pending'
  date?: string
}

export default function OrigoTransfers() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)

  const transfers: Transfer[] = [
    {
      id: '1',
      origoId: 'ORG-2024-001234',
      clientName: 'John Smith',
      clientRef: 'JS-2024-001',
      cedingProvider: 'Aviva Pension',
      receivingProvider: 'Our SIPP',
      transferValue: 125000,
      status: 'in_progress',
      type: 'inbound',
      initiatedDate: '2024-01-10',
      lastUpdate: '2024-01-18',
      progress: 60,
      stages: [
        { name: 'Request Submitted', status: 'completed', date: '2024-01-10' },
        { name: 'Ceding Scheme Acknowledged', status: 'completed', date: '2024-01-12' },
        { name: 'Member Details Verified', status: 'completed', date: '2024-01-15' },
        { name: 'Discharge Forms Received', status: 'current' },
        { name: 'Funds Transfer', status: 'pending' },
        { name: 'Completed', status: 'pending' }
      ]
    },
    {
      id: '2',
      origoId: 'ORG-2024-001189',
      clientName: 'Emma Wilson',
      clientRef: 'EW-2023-042',
      cedingProvider: 'Standard Life',
      receivingProvider: 'Our SIPP',
      transferValue: 87500,
      status: 'awaiting_info',
      type: 'inbound',
      initiatedDate: '2024-01-08',
      lastUpdate: '2024-01-16',
      progress: 40,
      stages: [
        { name: 'Request Submitted', status: 'completed', date: '2024-01-08' },
        { name: 'Ceding Scheme Acknowledged', status: 'completed', date: '2024-01-10' },
        { name: 'Member Details Verified', status: 'current' },
        { name: 'Discharge Forms Received', status: 'pending' },
        { name: 'Funds Transfer', status: 'pending' },
        { name: 'Completed', status: 'pending' }
      ]
    },
    {
      id: '3',
      origoId: 'ORG-2024-001098',
      clientName: 'David Thompson',
      clientRef: 'DT-2023-089',
      cedingProvider: 'Our SIPP',
      receivingProvider: 'Prudential',
      transferValue: 250000,
      status: 'pending',
      type: 'outbound',
      initiatedDate: '2024-01-15',
      lastUpdate: '2024-01-15',
      progress: 20,
      stages: [
        { name: 'Request Received', status: 'completed', date: '2024-01-15' },
        { name: 'Internal Verification', status: 'current' },
        { name: 'Discharge Quote Sent', status: 'pending' },
        { name: 'Member Confirmation', status: 'pending' },
        { name: 'Funds Transfer', status: 'pending' },
        { name: 'Completed', status: 'pending' }
      ]
    },
    {
      id: '4',
      origoId: 'ORG-2024-000987',
      clientName: 'Sarah Johnson',
      clientRef: 'SJ-2023-156',
      cedingProvider: 'Scottish Widows',
      receivingProvider: 'Our SIPP',
      transferValue: 45000,
      status: 'completed',
      type: 'inbound',
      initiatedDate: '2024-01-02',
      lastUpdate: '2024-01-12',
      progress: 100,
      stages: [
        { name: 'Request Submitted', status: 'completed', date: '2024-01-02' },
        { name: 'Ceding Scheme Acknowledged', status: 'completed', date: '2024-01-04' },
        { name: 'Member Details Verified', status: 'completed', date: '2024-01-06' },
        { name: 'Discharge Forms Received', status: 'completed', date: '2024-01-08' },
        { name: 'Funds Transfer', status: 'completed', date: '2024-01-10' },
        { name: 'Completed', status: 'completed', date: '2024-01-12' }
      ]
    },
    {
      id: '5',
      origoId: 'ORG-2024-000876',
      clientName: 'Michael Brown',
      clientRef: 'MB-2023-201',
      cedingProvider: 'Legal & General',
      receivingProvider: 'Our SIPP',
      transferValue: 175000,
      status: 'rejected',
      type: 'inbound',
      initiatedDate: '2024-01-05',
      lastUpdate: '2024-01-14',
      progress: 30,
      stages: [
        { name: 'Request Submitted', status: 'completed', date: '2024-01-05' },
        { name: 'Ceding Scheme Acknowledged', status: 'completed', date: '2024-01-07' },
        { name: 'Member Details Verified', status: 'completed', date: '2024-01-10' },
        { name: 'Rejected - GMP Unreconciled', status: 'completed', date: '2024-01-14' }
      ]
    }
  ]

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.origoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.clientRef.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesType = typeFilter === 'all' || t.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'awaiting_info': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'pending': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'in_progress': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'awaiting_info': return <AlertTriangle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const stats = {
    total: transfers.length,
    inProgress: transfers.filter(t => t.status === 'in_progress').length,
    awaitingInfo: transfers.filter(t => t.status === 'awaiting_info').length,
    completed: transfers.filter(t => t.status === 'completed').length,
    totalValue: transfers.filter(t => t.type === 'inbound' && t.status !== 'rejected')
      .reduce((sum, t) => sum + t.transferValue, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Origo Transfer Service</h2>
          <p className="text-muted-foreground">Manage pension transfers via the Origo messaging platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Status
          </Button>
          <Dialog open={isNewTransferOpen} onOpenChange={setIsNewTransferOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Initiate New Transfer</DialogTitle>
                <DialogDescription>
                  Start a new pension transfer request via Origo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Transfer Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound (Receiving)</SelectItem>
                      <SelectItem value="outbound">Outbound (Ceding)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Client Reference</Label>
                  <Input placeholder="Enter client reference" />
                </div>
                <div className="space-y-2">
                  <Label>Ceding/Receiving Provider</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aviva">Aviva</SelectItem>
                      <SelectItem value="standardlife">Standard Life</SelectItem>
                      <SelectItem value="scottishwidows">Scottish Widows</SelectItem>
                      <SelectItem value="lg">Legal & General</SelectItem>
                      <SelectItem value="prudential">Prudential</SelectItem>
                      <SelectItem value="aegon">Aegon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Policy Number</Label>
                  <Input placeholder="Enter policy/plan number" />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Value (£)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewTransferOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Transfer Initiated",
                    description: "Origo request has been submitted"
                  })
                  setIsNewTransferOpen(false)
                }}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Transfers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.awaitingInfo}</p>
                <p className="text-sm text-muted-foreground">Awaiting Info</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                <p className="text-sm text-muted-foreground">Inbound Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, Origo ID, or reference..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="awaiting_info">Awaiting Info</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origo ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Provider</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="hidden md:table-cell">Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <p className="font-mono text-sm">{transfer.origoId}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transfer.clientName}</p>
                        <p className="text-xs text-muted-foreground">{transfer.clientRef}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          {transfer.type === 'inbound' ? (
                            <>
                              <span className="text-muted-foreground">From:</span>
                              {transfer.cedingProvider}
                            </>
                          ) : (
                            <>
                              <span className="text-muted-foreground">To:</span>
                              {transfer.receivingProvider}
                            </>
                          )}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={transfer.type === 'inbound' ? 'default' : 'secondary'}>
                        {transfer.type === 'inbound' ? '↓ Inbound' : '↑ Outbound'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transfer.transferValue)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="w-24">
                        <Progress value={transfer.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{transfer.progress}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transfer.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(transfer.status)}
                          {transfer.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setSelectedTransfer(transfer)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Transfer Details</DialogTitle>
                              <DialogDescription>
                                {transfer.origoId}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Client</Label>
                                  <p className="font-medium">{transfer.clientName}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Reference</Label>
                                  <p className="font-medium">{transfer.clientRef}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Ceding Provider</Label>
                                  <p className="font-medium">{transfer.cedingProvider}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Receiving Provider</Label>
                                  <p className="font-medium">{transfer.receivingProvider}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Transfer Value</Label>
                                  <p className="font-medium text-lg">{formatCurrency(transfer.transferValue)}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Initiated</Label>
                                  <p className="font-medium">{transfer.initiatedDate}</p>
                                </div>
                              </div>

                              <div>
                                <Label className="text-muted-foreground mb-3 block">Transfer Progress</Label>
                                <div className="space-y-3">
                                  {transfer.stages.map((stage, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        stage.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                        stage.status === 'current' ? 'bg-blue-500/20 text-blue-500' :
                                        'bg-muted text-muted-foreground'
                                      }`}>
                                        {stage.status === 'completed' ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : stage.status === 'current' ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Clock className="w-4 h-4" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className={`text-sm font-medium ${
                                          stage.status === 'pending' ? 'text-muted-foreground' : ''
                                        }`}>
                                          {stage.name}
                                        </p>
                                        {stage.date && (
                                          <p className="text-xs text-muted-foreground">{stage.date}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download Documents
                              </Button>
                              <Button variant="outline">
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
