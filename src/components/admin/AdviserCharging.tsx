import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Edit,
  Percent,
  DollarSign,
  Users,
  Calculator,
  Download,
  Settings,
  UserCheck,
} from 'lucide-react'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount)

const adviserFees = [
  { id: 1, adviser: 'Sarah Johnson', clientCount: 245, feeType: 'ongoing', rate: 0.50, frequency: 'quarterly', totalCharged: 42500, totalCollected: 41200, status: 'active' },
  { id: 2, adviser: 'Sarah Johnson', clientCount: 245, feeType: 'initial', rate: 1.00, frequency: 'one_off', totalCharged: 15000, totalCollected: 15000, status: 'active' },
  { id: 3, adviser: 'Michael Brown', clientCount: 312, feeType: 'ongoing', rate: 0.75, frequency: 'quarterly', totalCharged: 65400, totalCollected: 63100, status: 'active' },
  { id: 4, adviser: 'Michael Brown', clientCount: 312, feeType: 'ad_hoc', rate: 500, frequency: 'per_event', totalCharged: 4500, totalCollected: 4500, status: 'active' },
  { id: 5, adviser: 'Jane Williams', clientCount: 178, feeType: 'ongoing', rate: 0.40, frequency: 'monthly', totalCharged: 28900, totalCollected: 27500, status: 'active' },
]

const feeAgreements = [
  { id: 1, client: 'John Smith', adviser: 'Sarah Johnson', initialFee: 1.0, ongoingFee: 0.5, adHocFee: 250, facilitated: true, startDate: '2019-06-12', lastReview: '2023-06-12' },
  { id: 2, client: 'Emma Wilson', adviser: 'Michael Brown', initialFee: 0, ongoingFee: 0.75, adHocFee: 500, facilitated: true, startDate: '2020-03-01', lastReview: '2023-03-01' },
  { id: 3, client: 'David Thompson', adviser: 'Sarah Johnson', initialFee: 1.5, ongoingFee: 0.5, adHocFee: 250, facilitated: false, startDate: '2018-09-15', lastReview: '2023-09-15' },
  { id: 4, client: 'Lisa Anderson', adviser: 'Michael Brown', initialFee: 0.5, ongoingFee: 0.75, adHocFee: 0, facilitated: true, startDate: '2022-01-10', lastReview: '2024-01-10' },
]

export default function AdviserCharging() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agreements'>('overview')

  const totalCharged = adviserFees.reduce((s, f) => s + f.totalCharged, 0)
  const totalCollected = adviserFees.reduce((s, f) => s + f.totalCollected, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Adviser Fee Agreements</p><p className="text-2xl font-bold text-foreground">{feeAgreements.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Charged (Period)</p><p className="text-2xl font-bold text-primary">{formatCurrency(totalCharged)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Collected</p><p className="text-2xl font-bold text-success">{formatCurrency(totalCollected)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-2xl font-bold text-warning">{formatCurrency(totalCharged - totalCollected)}</p></CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === 'overview' ? 'default' : 'outline'} onClick={() => setActiveTab('overview')}><Settings className="w-4 h-4 mr-2" /> Fee Schedules</Button>
        <Button variant={activeTab === 'agreements' ? 'default' : 'outline'} onClick={() => setActiveTab('agreements')}><UserCheck className="w-4 h-4 mr-2" /> Client Agreements</Button>
      </div>

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div><CardTitle>Adviser Fee Schedules</CardTitle><CardDescription>Configure initial, ongoing, and ad-hoc adviser charges</CardDescription></div>
              <div className="flex gap-2">
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Schedule</Button>
                <Button variant="outline" size="sm"><Calculator className="w-4 h-4 mr-2" /> Run Collection</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Adviser</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead className="text-right">Charged</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adviserFees.map(fee => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.adviser}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{fee.feeType.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="font-semibold">{fee.feeType === 'ad_hoc' ? formatCurrency(fee.rate) : `${fee.rate}%`}</TableCell>
                    <TableCell className="text-sm capitalize">{fee.frequency.replace('_', ' ')}</TableCell>
                    <TableCell>{fee.clientCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(fee.totalCharged)}</TableCell>
                    <TableCell className="text-right text-success">{formatCurrency(fee.totalCollected)}</TableCell>
                    <TableCell><Badge variant="default">{fee.status}</Badge></TableCell>
                    <TableCell><Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'agreements' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div><CardTitle>Client Fee Agreements</CardTitle><CardDescription>Individual adviser charging agreements per client</CardDescription></div>
              <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Adviser</TableHead>
                  <TableHead className="text-right">Initial Fee</TableHead>
                  <TableHead className="text-right">Ongoing Fee</TableHead>
                  <TableHead className="text-right">Ad-Hoc Fee</TableHead>
                  <TableHead>Facilitated</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Last Review</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeAgreements.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.client}</TableCell>
                    <TableCell>{a.adviser}</TableCell>
                    <TableCell className="text-right">{a.initialFee}%</TableCell>
                    <TableCell className="text-right">{a.ongoingFee}%</TableCell>
                    <TableCell className="text-right">{a.adHocFee > 0 ? formatCurrency(a.adHocFee) : '—'}</TableCell>
                    <TableCell><Badge variant={a.facilitated ? 'default' : 'secondary'}>{a.facilitated ? 'Yes' : 'No'}</Badge></TableCell>
                    <TableCell className="text-sm">{a.startDate}</TableCell>
                    <TableCell className="text-sm">{a.lastReview}</TableCell>
                    <TableCell><Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
