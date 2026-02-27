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
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/adminExportUtils'
import { useAuditTrail } from '@/hooks/useClientData'

const categoryConfig: Record<string, { color: string; icon: React.ElementType }> = {
  created: { color: 'bg-success/10 text-success', icon: FileText },
  updated: { color: 'bg-warning/10 text-warning', icon: Edit },
  deleted: { color: 'bg-destructive/10 text-destructive', icon: Trash2 },
  status_changed: { color: 'bg-primary/10 text-primary', icon: RefreshCw },
}

export default function AuditTrail() {
  const { entries, loading, fetchEntries } = useAuditTrail()
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')

  const entityTypes = [...new Set(entries.map(e => e.entity_type))]

  const filtered = entries.filter(e => {
    const matchSearch = (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.performed_by || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.entity_type || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchAction = actionFilter === 'all' || e.action === actionFilter
    const matchEntity = entityFilter === 'all' || e.entity_type === entityFilter
    return matchSearch && matchAction && matchEntity
  })

  const handleExport = () => {
    downloadCSV('audit-trail',
      ['Timestamp', 'Performed By', 'Entity Type', 'Action', 'Description', 'Entity ID'],
      filtered.map(e => [e.created_at, e.performed_by, e.entity_type, e.action, e.description, e.entity_id || ''])
    )
    toast.success('Audit trail exported as CSV')
  }

  const securityCount = entries.filter(e => e.action === 'deleted').length
  const changeCount = entries.filter(e => e.action === 'updated' || e.action === 'status_changed').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Events</p><p className="text-2xl font-bold text-foreground">{entries.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Deletions</p><p className="text-2xl font-bold text-destructive">{securityCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Data Changes</p><p className="text-2xl font-bold text-warning">{changeCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Entity Types</p><p className="text-2xl font-bold text-primary">{entityTypes.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> System Audit Trail</CardTitle><CardDescription>Live records from the activity log database</CardDescription></div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10 w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="status_changed">Status Changed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Entity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchEntries}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading audit trail...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No audit entries found. Actions taken in the admin portal will appear here.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(entry => {
                  const cat = categoryConfig[entry.action] || categoryConfig.updated
                  const CatIcon = cat.icon
                  return (
                    <TableRow key={entry.id} className={entry.action === 'deleted' ? 'bg-destructive/5' : ''}>
                      <TableCell className="text-xs font-mono whitespace-nowrap">{new Date(entry.created_at).toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-sm">{entry.performed_by || 'System'}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{entry.entity_type}</Badge></TableCell>
                      <TableCell><Badge className={`${cat.color} text-xs`} variant="outline"><CatIcon className="w-3 h-3 mr-1" />{entry.action}</Badge></TableCell>
                      <TableCell className="text-xs max-w-[350px] truncate">{entry.description}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
