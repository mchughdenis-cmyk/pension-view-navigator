import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Receipt,
  Building2,
  Send,
  RefreshCw,
  Eye,
  FileBarChart,
} from 'lucide-react'

const reports = [
  // HMRC Returns
  { id: 1, category: 'hmrc', name: 'Event Report', description: 'Report pension scheme events to HMRC', frequency: 'Annual', deadline: '2024-01-31', status: 'submitted', lastRun: '2024-01-15', taxYear: '2023-24', recordCount: 342 },
  { id: 2, category: 'hmrc', name: 'Annual Return of Information', description: 'Member contributions and benefit crystallisation', frequency: 'Annual', deadline: '2024-01-31', status: 'in_progress', lastRun: null, taxYear: '2023-24', recordCount: 1247 },
  { id: 3, category: 'hmrc', name: 'Accounting for Tax (AFT)', description: 'Tax charges on unauthorised payments', frequency: 'Quarterly', deadline: '2024-02-14', status: 'not_started', lastRun: '2023-11-14', taxYear: '2023-24 Q3', recordCount: 0 },
  { id: 4, category: 'hmrc', name: 'Pension Scheme Return', description: 'Scheme registration and membership data', frequency: 'Annual', deadline: '2024-02-01', status: 'submitted', lastRun: '2024-01-20', taxYear: '2023-24', recordCount: 1 },
  // FCA Returns
  { id: 5, category: 'fca', name: 'RMAR Return', description: 'Retail Mediation Activities Return', frequency: 'Quarterly', deadline: '2024-03-31', status: 'not_started', lastRun: '2023-12-28', taxYear: 'Q1 2024', recordCount: null },
  { id: 6, category: 'fca', name: 'Client Asset Return (CASS)', description: 'Client money and custody assets', frequency: 'Annual', deadline: '2024-06-30', status: 'not_started', lastRun: '2023-06-28', taxYear: '2023-24', recordCount: null },
  { id: 7, category: 'fca', name: 'SUP 16 Annual Return', description: 'Annual controller/close links data', frequency: 'Annual', deadline: '2024-04-30', status: 'not_started', lastRun: '2023-04-28', taxYear: '2023-24', recordCount: null },
  // SMPI
  { id: 8, category: 'smpi', name: 'Statutory Money Purchase Illustration', description: 'Annual benefit statement for DC members', frequency: 'Annual', deadline: '2024-09-30', status: 'in_progress', lastRun: null, taxYear: '2024', recordCount: 1060 },
  // Pensions Dashboard
  { id: 9, category: 'dashboard', name: 'Pensions Dashboard Connection', description: 'Data feed to Pensions Dashboard Programme', frequency: 'Real-time', deadline: 'Ongoing', status: 'active', lastRun: '2024-01-15', taxYear: 'N/A', recordCount: 1247 },
]

const statusConfig: Record<string, { label: string; variant: string; icon: React.ElementType }> = {
  submitted: { label: 'Submitted', variant: 'default', icon: CheckCircle },
  in_progress: { label: 'In Progress', variant: 'secondary', icon: RefreshCw },
  not_started: { label: 'Not Started', variant: 'outline', icon: Clock },
  overdue: { label: 'Overdue', variant: 'destructive', icon: AlertTriangle },
  active: { label: 'Active', variant: 'default', icon: CheckCircle },
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType }> = {
  hmrc: { label: 'HMRC', icon: Receipt },
  fca: { label: 'FCA', icon: Shield },
  smpi: { label: 'SMPI', icon: FileBarChart },
  dashboard: { label: 'Pensions Dashboard', icon: Building2 },
}

export default function RegulatoryReporting() {
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filtered = reports.filter(r => categoryFilter === 'all' || r.category === categoryFilter)
  const submitted = reports.filter(r => r.status === 'submitted').length
  const inProgress = reports.filter(r => r.status === 'in_progress').length
  const upcoming = reports.filter(r => r.status === 'not_started').length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Reports</p>
            <p className="text-2xl font-bold text-foreground">{reports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Submitted</p>
            <p className="text-2xl font-bold text-success">{submitted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-warning">{inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Not Started</p>
            <p className="text-2xl font-bold text-muted-foreground">{upcoming}</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Calendar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Regulatory Calendar</CardTitle>
              <CardDescription>Upcoming deadlines and submission status</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="hmrc">HMRC</SelectItem>
                  <SelectItem value="fca">FCA</SelectItem>
                  <SelectItem value="smpi">SMPI</SelectItem>
                  <SelectItem value="dashboard">Pensions Dashboard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map(report => {
              const status = statusConfig[report.status]
              const cat = categoryConfig[report.category]
              const StatusIcon = status.icon
              const CatIcon = cat.icon
              return (
                <div key={report.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CatIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{report.name}</h4>
                          <Badge variant="outline" className="text-xs">{cat.label}</Badge>
                          <Badge variant="secondary" className="text-xs">{report.frequency}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Period: {report.taxYear}</span>
                          <span>Deadline: <strong>{report.deadline}</strong></span>
                          {report.recordCount !== null && <span>Records: {report.recordCount.toLocaleString()}</span>}
                          {report.lastRun && <span>Last run: {report.lastRun}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant as any}>
                        <StatusIcon className="w-3 h-3 mr-1" />{status.label}
                      </Badge>
                      <div className="flex gap-1">
                        {report.status === 'not_started' && (
                          <Button size="sm"><RefreshCw className="w-4 h-4 mr-1" /> Generate</Button>
                        )}
                        {report.status === 'in_progress' && (
                          <>
                            <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" /> Review</Button>
                            <Button size="sm"><Send className="w-4 h-4 mr-1" /> Submit</Button>
                          </>
                        )}
                        {report.status === 'submitted' && (
                          <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" /> Download</Button>
                        )}
                        {report.status === 'active' && (
                          <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" /> Monitor</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* SMPI Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" />
            SMPI Generation Progress
          </CardTitle>
          <CardDescription>Annual statutory illustrations for accumulation members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Generated: 634 / 1,060 members</span>
              <span className="font-semibold">59.8%</span>
            </div>
            <Progress value={59.8} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-3 bg-success/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-success">634</p>
                <p className="text-xs text-muted-foreground">Generated</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-warning">426</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">512</p>
                <p className="text-xs text-muted-foreground">Sent to Members</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-destructive">3</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button><Play className="w-4 h-4 mr-2" /> Continue Batch</Button>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export Results</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Play(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="6 3 20 12 6 21 6 3"/></svg>
  )
}
