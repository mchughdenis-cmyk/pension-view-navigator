import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  FileText,
  Download,
  Plus,
  Send,
  Eye,
  Edit,
  Copy,
  Printer,
  Mail,
  FileBarChart,
  Calendar,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  downloadWelcomeLetter,
  downloadBenefitStatement,
  downloadTransferConfirmation,
  downloadDrawdownConfirmation,
  downloadFeeSchedule,
  downloadAirgeadDocx,
} from '@/lib/documentUtils'

const templates = [
  { id: 1, name: 'Annual Benefit Statement', category: 'statutory', format: 'PDF', lastUsed: '2024-01-10', usageCount: 1247, status: 'active' },
  { id: 2, name: 'Welcome Letter', category: 'onboarding', format: 'PDF', lastUsed: '2024-01-14', usageCount: 456, status: 'active' },
  { id: 3, name: 'Transfer Confirmation', category: 'transfers', format: 'PDF', lastUsed: '2024-01-12', usageCount: 312, status: 'active' },
  { id: 4, name: 'Drawdown Confirmation', category: 'drawdown', format: 'PDF', lastUsed: '2024-01-15', usageCount: 187, status: 'active' },
  { id: 5, name: 'Fee Schedule Notification', category: 'fees', format: 'PDF', lastUsed: '2023-12-01', usageCount: 1247, status: 'active' },
  { id: 6, name: 'KYC Reminder', category: 'compliance', format: 'Email', lastUsed: '2024-01-08', usageCount: 89, status: 'active' },
  { id: 7, name: 'Risk Profile Review', category: 'compliance', format: 'PDF', lastUsed: '2023-11-15', usageCount: 534, status: 'active' },
  { id: 8, name: 'SMPI Statement', category: 'statutory', format: 'PDF', lastUsed: '2024-01-10', usageCount: 1060, status: 'active' },
  { id: 9, name: 'Death Benefit Nomination Confirmation', category: 'beneficiary', format: 'PDF', lastUsed: '2024-01-05', usageCount: 234, status: 'active' },
  { id: 10, name: 'GDPR Data Export Cover Letter', category: 'compliance', format: 'DOCX', lastUsed: '2023-10-20', usageCount: 12, status: 'active' },
]

const recentDocuments = [
  { id: 1, date: '2024-01-15', template: 'Drawdown Confirmation', client: 'David Thompson', format: 'PDF', sentVia: 'Email', status: 'sent' },
  { id: 2, date: '2024-01-14', template: 'Welcome Letter', client: 'New Client Batch', format: 'PDF', sentVia: 'Post', status: 'printed' },
  { id: 3, date: '2024-01-12', template: 'Transfer Confirmation', client: 'Emma Wilson', format: 'PDF', sentVia: 'Email', status: 'sent' },
  { id: 4, date: '2024-01-10', template: 'Annual Benefit Statement', client: 'Bulk - 1,247 clients', format: 'PDF', sentVia: 'Email + Post', status: 'in_progress' },
  { id: 5, date: '2024-01-08', template: 'KYC Reminder', client: '89 clients', format: 'Email', sentVia: 'Email', status: 'sent' },
]

const templateDownloadMap: Record<string, () => Promise<void>> = {
  'Annual Benefit Statement': () => downloadBenefitStatement(),
  'Welcome Letter': () => downloadWelcomeLetter(),
  'Transfer Confirmation': () => downloadTransferConfirmation(),
  'Drawdown Confirmation': () => downloadDrawdownConfirmation(),
  'Fee Schedule Notification': () => downloadFeeSchedule(),
}

export default function DocumentGeneration() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === 'all' || t.category === categoryFilter
    return matchesSearch && matchesCat
  })

  const handleDownloadTemplate = async (name: string) => {
    const downloadFn = templateDownloadMap[name]
    if (downloadFn) {
      toast.info(`Generating ${name}...`)
      await downloadFn()
      toast.success(`${name} downloaded successfully`)
    } else {
      toast.info(`${name} — template preview coming soon`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Document Templates</p><p className="text-2xl font-bold text-foreground">{templates.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Generated This Month</p><p className="text-2xl font-bold text-primary">1,847</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Sent via Email</p><p className="text-2xl font-bold text-success">1,592</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Printed / Posted</p><p className="text-2xl font-bold text-muted-foreground">255</p></CardContent></Card>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Document Templates</CardTitle><CardDescription>Manage letter, statement, and communication templates</CardDescription></div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search templates..." className="pl-10 w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="statutory">Statutory</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="transfers">Transfers</SelectItem>
                  <SelectItem value="drawdown">Drawdown</SelectItem>
                  <SelectItem value="fees">Fees</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="beneficiary">Beneficiary</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Template</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">{t.category}</Badge>
                      <Badge variant="secondary" className="text-xs">{t.format}</Badge>
                      <span className="text-xs text-muted-foreground">Used {t.usageCount}x</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate(t.name)}><Download className="w-3 h-3" /></Button>
                  <Button variant="outline" size="sm"><Eye className="w-3 h-3" /></Button>
                  <Button variant="outline" size="sm"><Edit className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader><CardTitle>Recently Generated</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Client / Batch</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Sent Via</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDocuments.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="text-sm">{doc.date}</TableCell>
                  <TableCell className="font-medium">{doc.template}</TableCell>
                  <TableCell>{doc.client}</TableCell>
                  <TableCell><Badge variant="outline">{doc.format}</Badge></TableCell>
                  <TableCell className="text-sm">{doc.sentVia}</TableCell>
                  <TableCell><Badge variant={doc.status === 'sent' || doc.status === 'printed' ? 'default' : 'secondary'}>{doc.status.replace('_', ' ')}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
