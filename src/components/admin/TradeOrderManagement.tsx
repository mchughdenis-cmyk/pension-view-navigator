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
} from 'lucide-react'
import { toast } from 'sonner'
import { OrderDialog, type OrderFormData } from './AdminDialogs'
import { downloadCSV } from '@/lib/adminExportUtils'
import { useTradeOrders } from '@/hooks/useClientData'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

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
  const { orders, loading, fetchOrders, addOrder } = useTradeOrders()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = orders.filter(o => {
    const matchesSearch = (o.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (o.instrument || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalBuyValue = orders.filter(o => o.side === 'buy' && o.status !== 'cancelled').reduce((s: number, o: any) => s + Number(o.value), 0)
  const totalSellValue = orders.filter(o => o.side === 'sell' && o.status !== 'cancelled').reduce((s: number, o: any) => s + Number(o.value), 0)
  const pendingCount = orders.filter(o => ['pending', 'routed', 'settling'].includes(o.status)).length

  const handleNewOrder = async (data: OrderFormData) => {
    const value = data.quantity * data.price
    await addOrder({
      client_name: data.client,
      account_type: data.account,
      side: data.side,
      instrument: data.instrument,
      quantity: data.quantity,
      price: data.price,
      value,
      status: 'pending',
    })
    toast.success(`${data.side.toUpperCase()} order placed for ${data.instrument}`, { description: `${data.quantity} units @ ${formatCurrency(data.price)}` })
  }

  const handleExport = () => {
    downloadCSV('trade-orders',
      ['Date', 'Client', 'Account', 'Side', 'Instrument', 'Qty', 'Price', 'Value', 'Status'],
      filtered.map(o => [o.created_at, o.client_name, o.account_type, o.side, o.instrument, o.quantity, o.price, o.value, o.status])
    )
    toast.success('Trade orders exported')
  }

  if (loading) return <p className="text-center text-muted-foreground py-8">Loading trade orders...</p>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-bold text-foreground">{orders.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Buy Orders Value</p><p className="text-2xl font-bold text-success">{formatCurrency(totalBuyValue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Sell Orders Value</p><p className="text-2xl font-bold text-warning">{formatCurrency(totalSellValue)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending / In Flight</p><p className="text-2xl font-bold text-primary">{pendingCount}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Trade Order Book</CardTitle>
              <CardDescription>Orders are persisted to the database</CardDescription>
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
              <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Order</Button>
              <Button variant="outline" size="sm" onClick={fetchOrders}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No trade orders yet. Place an order to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Instrument</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(order => {
                    const config = statusConfig[order.status] || statusConfig.pending
                    const StatusIcon = config.icon
                    return (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell className="text-xs whitespace-nowrap">{new Date(order.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{order.client_name || '-'}</TableCell>
                        <TableCell><Badge variant="outline">{order.account_type || '-'}</Badge></TableCell>
                        <TableCell>
                          <Badge className={order.side === 'buy' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'} variant="outline">
                            {order.side === 'buy' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {order.side.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{order.instrument}</TableCell>
                        <TableCell className="text-right">{Number(order.quantity).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(order.price))}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(Number(order.value))}</TableCell>
                        <TableCell>
                          <Badge variant={config.color as any}><StatusIcon className="w-3 h-3 mr-1" />{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleNewOrder} />
    </div>
  )
}
