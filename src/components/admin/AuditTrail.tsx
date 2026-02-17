import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useState } from 'react'
import {
  Search,
  Download,
  Clock,
  Shield,
  FileText,
  LogIn,
  Edit,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/adminExportUtils'

const auditEntries = [
  { id: 1, timestamp: '2024-01-15 14:32:15', user: 'John Smith', userType: 'client', action: 'View Portfolio', category: 'access', detail: 'Viewed SIPP portfolio SIPP-001247', ip: '192.168.1.45', sessionId: 'sess_abc123' },
  { id: 2, timestamp: '2024-01-15 14:30:02', user: 'John Smith', userType: 'client', action: 'Login', category: 'auth', detail: 'Successful login via web', ip: '192.168.1.45', sessionId: 'sess_abc123' },
  { id: 3, timestamp: '2024-01-15 11:00:00', user: 'System', userType: 'system', action: 'Contribution Processed', category: 'transaction', detail: 'Monthly contribution £1,000 for John Smith SIPP-001247', ip: 'N/A', sessionId: 'sys_batch_001' },
  { id: 4, timestamp: '2024-01-15 10:45:30', user: 'Sarah Johnson', userType: 'adviser', action: 'Update Risk Profile', category: 'data_change', detail: 'Changed risk profile notes for David Thompson', ip: '10.0.0.12', sessionId: 'sess_def456' },
  { id: 5, timestamp: '2024-01-15 09:45:00', user: 'System', userType: 'system', action: 'Drawdown Payment', category: 'transaction', detail: 'Monthly drawdown £2,850 paid to bank for David Thompson', ip: 'N/A', sessionId: 'sys_batch_002' },
  { id: 6, timestamp: '2024-01-14 16:20:00', user: 'Admin User', userType: 'admin', action: 'Account Lock', category: 'security', detail: 'Temporarily locked account for Lisa Anderson pending review', ip: '10.0.0.5', sessionId: 'sess_ghi789' },
  { id: 7, timestamp: '2024-01-14 15:10:00', user: 'Sarah Johnson', userType: 'adviser', action: 'Fee Agreement Updated', category: 'data_change', detail: 'Updated ongoing fee from 0.5% to 0.4% for Emma Wilson', ip: '10.0.0.12', sessionId: 'sess_jkl012' },
  { id: 8, timestamp: '2024-01-14 12:00:00', user: 'System', userType: 'system', action: 'KYC Auto-Check', category: 'compliance', detail: 'Automated KYC reverification completed for 15 clients', ip: 'N/A', sessionId: 'sys_kyc_batch' },
  { id: 9, timestamp: '2024-01-14 09:15:00', user: 'Admin User', userType: 'admin', action: 'Bulk Fee Calculation', category: 'transaction', detail: 'Quarterly platform fees calculated for 1,247 clients', ip: '10.0.0.5', sessionId: 'sess_mno345' },
  { id: 10, timestamp: '2024-01-13 17:30:00', user: 'Emma Wilson', userType: 'client', action: 'Failed Login', category: 'security', detail: 'Failed login attempt - incorrect password (3rd attempt)', ip: '172.16.0.88', sessionId: 'N/A' },
]

const categoryConfig: Record<string, { color: string; icon: React.ElementType }> = {
  auth: { color: 'bg-primary/10 text-primary', icon: LogIn },
  access: { color: 'bg-muted text-muted-foreground', icon: Eye },
  transaction: { color: 'bg-success/10 text-success', icon: FileText },
  data_change: { color: 'bg-warning/10 text-warning', icon: Edit },
  security: { color: 'bg-destructive/10 text-destructive', icon: Shield },
  compliance: { color: 'bg-primary/10 text-primary', icon: Shield },
}

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [userTypeFilter, setUserTypeFilter] = useState('all')

  const filtered = auditEntries.filter(e => {
    const matchSearch = e.user.toLowerCase().includes(searchTerm.toLowerCase()) || e.detail.toLowerCase().includes(searchTerm.toLowerCase()) || e.action.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = categoryFilter === 'all' || e.category === categoryFilter
    const matchUser = userTypeFilter === 'all' || e.userType === userTypeFilter
    return matchSearch && matchCat && matchUser
  })

  const handleExport = () => {
    downloadCSV('audit-trail',
      ['Timestamp', 'User', 'User Type', 'Action', 'Category', 'Detail', 'IP Address', 'Session ID'],
      filtered.map(e => [e.timestamp, e.user, e.userType, e.action, e.category, e.detail, e.ip, e.sessionId])
    )
    toast.success('Audit trail exported as CSV')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Events (24h)</p><p className="text-2xl font-bold text-foreground">2,847</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Security Events</p><p className="text-2xl font-bold text-destructive">12</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Data Changes</p><p className="text-2xl font-bold text-warning">156</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Unique Users</p><p className="text-2xl font-bold text-primary">342</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> System Audit Trail</CardTitle><CardDescription>Complete record of all system events, actions, and data changes</CardDescription></div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="transaction">Transaction</SelectItem>
                  <SelectItem value="data_change">Data Change</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="User Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="adviser">Adviser</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(entry => {
                const cat = categoryConfig[entry.category] || categoryConfig.access
                const CatIcon = cat.icon
                return (
                  <TableRow key={entry.id} className={entry.category === 'security' ? 'bg-destructive/5' : ''}>
                    <TableCell className="text-xs font-mono whitespace-nowrap">{entry.timestamp}</TableCell>
                    <TableCell className="font-medium text-sm">{entry.user}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{entry.userType}</Badge></TableCell>
                    <TableCell className="text-sm">{entry.action}</TableCell>
                    <TableCell><Badge className={`${cat.color} text-xs`} variant="outline"><CatIcon className="w-3 h-3 mr-1" />{entry.category.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-xs max-w-[250px] truncate">{entry.detail}</TableCell>
                    <TableCell className="text-xs font-mono">{entry.ip}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
