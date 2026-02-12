import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  ShoppingCart,
  BarChart3,
} from 'lucide-react'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

const orders = [
  { id: 'ORD-2024-001', date: '2024-01-15 14:30', client: 'John Smith', account: 'ISA', side: 'buy', instrument: 'Vanguard FTSE All-World ETF (VWRL)', quantity: 45, price: 111.11, value: 5000, status: 'executed', settlement: '2024-01-17' },
  { id: 'ORD-2024-002', date: '2024-01-15 11:00', client: 'Emma Wilson', account: 'SIPP', side: 'buy', instrument: 'iShares Core MSCI World (SWDA)', quantity: 60, price: 83.33, value: 5000, status: 'pending', settlement: null },
  { id: 'ORD-2024-003', date: '2024-01-14 16:45', client: 'David Thompson', account: 'SIPP', side: 'sell', instrument: 'Fundsmith Equity Fund (T)', quantity: 1500, price: 5.67, value: 8500, status: 'executed', settlement: '2024-01-16' },
  { id: 'ORD-2024-004', date: '2024-01-14 10:15', client: 'John Smith', account: 'GIA', side: 'buy', instrument: 'Legal & General UK Index (I)', quantity: 2800, price: 3.57, value: 10000, status: 'routed', settlement: null },
  { id: 'ORD-2024-005', date: '2024-01-13 15:30', client: 'Lisa Anderson', account: 'SIPP', side: 'buy', instrument: 'Vanguard LifeStrategy 60 (A)', quantity: 30, price: 233.33, value: 7000, status: 'executed', settlement: '2024-01-15' },
  { id: 'ORD-2024-006', date: '2024-01-13 09:00', client: 'Emma Wilson', account: 'ISA', side: 'sell', instrument: 'HSBC FTSE 250 Index (C)', quantity: 800, price: 6.25, value: 5000, status: 'cancelled', settlement: null },
  { id: 'ORD-2024-007', date: '2024-01-12 14:00', client: 'David Thompson', account: 'GIA', side: 'buy', instrument: 'iShares UK Equity Index (D)', quantity: 4200, price: 2.38, value: 10000, status: 'settling', settlement: '2024-01-14' },
]

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: 'secondary', icon: Clock },
  routed: { color: 'outline', icon: RefreshCw },
  executed: { color: 'default', icon: CheckCircle },
  settling: { color: 'secondary', icon: Clock },
  settled: { color: 'default', icon: CheckCircle },
  cancelled: { color: 'destructive', icon: XCircle },
  failed: { color: 'destructive', icon: AlertTriangle },
}

export default function TradeOrderManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = orders.filter(o => {
    const matchesSearch = o.client.toLowerCase().includes(searchTerm.toLowerCase()) || o.instrument.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalBuyValue = orders.filter(o => o.side === 'buy' && o.status !== 'cancelled').reduce((s, o) => s + o.value, 0)
  const totalSellValue = orders.filter(o => o.side === 'sell' && o.status !== 'cancelled').reduce((s, o) => s + o.value, 0)
  const pendingCount = orders.filter(o => ['pending', 'routed', 'settling'].includes(o.status)).length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Buy Orders Value</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalBuyValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sell Orders Value</p>
            <p className="text-2xl font-bold text-warning">{formatCurrency(totalSellValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending / In Flight</p>
            <p className="text-2xl font-bold text-primary">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Trade Order Book
              </CardTitle>
              <CardDescription>Manage the full trade lifecycle from creation to settlement</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-10 w-56" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="routed">Routed</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                  <SelectItem value="settling">Settling</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Order</Button>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Instrument</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Settlement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(order => {
                  const config = statusConfig[order.status] || statusConfig.pending
                  const StatusIcon = config.icon
                  return (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-accent/50">
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{order.date}</TableCell>
                      <TableCell className="font-medium">{order.client}</TableCell>
                      <TableCell><Badge variant="outline">{order.account}</Badge></TableCell>
                      <TableCell>
                        <Badge className={order.side === 'buy' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'} variant="outline">
                          {order.side === 'buy' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {order.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{order.instrument}</TableCell>
                      <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.price)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(order.value)}</TableCell>
                      <TableCell>
                        <Badge variant={config.color as any}>
                          <StatusIcon className="w-3 h-3 mr-1" />{order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{order.settlement || '-'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
