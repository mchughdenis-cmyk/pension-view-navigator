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
  Edit,
  Users,
  Shield,
  UserCheck,
  Lock,
  Unlock,
  Trash2,
  Download,
  Mail,
  Key,
} from 'lucide-react'
import { toast } from 'sonner'
import { UserDialog, ConfirmDialog, type UserFormData } from './AdminDialogs'
import { downloadCSV } from '@/lib/adminExportUtils'

const initialUsers = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@airgead.com', role: 'adviser', department: 'Advisory', status: 'active', lastLogin: '2026-01-15 14:30', clients: 245, mfaEnabled: true },
  { id: 2, name: 'Michael Brown', email: 'michael.brown@airgead.com', role: 'adviser', department: 'Advisory', status: 'active', lastLogin: '2026-01-15 11:00', clients: 312, mfaEnabled: true },
  { id: 3, name: 'Jennifer Davis', email: 'jennifer.davis@airgead.com', role: 'adviser', department: 'Advisory', status: 'active', lastLogin: '2026-01-14 16:45', clients: 178, mfaEnabled: true },
  { id: 4, name: 'Alex Turner', email: 'alex.turner@airgead.com', role: 'adviser', department: 'Advisory', status: 'active', lastLogin: '2026-01-13 09:00', clients: 190, mfaEnabled: false },
  { id: 5, name: 'Admin User', email: 'admin@airgead.com', role: 'admin', department: 'Management', status: 'active', lastLogin: '2026-01-15 08:00', clients: 0, mfaEnabled: true },
  { id: 6, name: 'Jane Williams', email: 'jane.williams@airgead.com', role: 'compliance', department: 'Compliance', status: 'active', lastLogin: '2026-01-15 10:30', clients: 0, mfaEnabled: true },
  { id: 7, name: 'Tom Harris', email: 'tom.harris@airgead.com', role: 'operations', department: 'Operations', status: 'suspended', lastLogin: '2026-01-05 16:00', clients: 0, mfaEnabled: false },
  { id: 8, name: 'Claire Morgan', email: 'claire.morgan@airgead.com', role: 'adviser', department: 'Advisory', status: 'pending', lastLogin: 'Never', clients: 0, mfaEnabled: false },
]

const roleColors: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  adviser: 'bg-primary/10 text-primary border-primary/20',
  compliance: 'bg-warning/10 text-warning border-warning/20',
  operations: 'bg-muted text-muted-foreground border-muted',
}

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<(typeof initialUsers[0]) | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleAdd = (data: UserFormData) => {
    const newId = Math.max(...users.map(u => u.id)) + 1
    setUsers(prev => [...prev, { id: newId, ...data, lastLogin: 'Never', clients: 0, mfaEnabled: false }])
    toast.success(`User "${data.name}" created — welcome email sent`)
  }

  const handleEdit = (data: UserFormData) => {
    if (!editingUser) return
    setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } : u))
    toast.success(`User "${data.name}" updated`)
    setEditingUser(null)
  }

  const handleDelete = (id: number) => {
    const user = users.find(u => u.id === id)
    setUsers(prev => prev.filter(u => u.id !== id))
    toast.success(`User "${user?.name}" removed`)
  }

  const handleToggleLock = (id: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u
      const newStatus = u.status === 'suspended' ? 'active' : 'suspended'
      toast.success(`${u.name} ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}`)
      return { ...u, status: newStatus }
    }))
  }

  const handleResetPassword = (name: string) => {
    toast.success(`Password reset email sent to ${name}`)
  }

  const handleExport = () => {
    downloadCSV('user-management',
      ['Name', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'Clients', 'MFA'],
      users.map(u => [u.name, u.email, u.role, u.department, u.status, u.lastLogin, u.clients, u.mfaEnabled ? 'Yes' : 'No'])
    )
    toast.success('User list exported')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Users</p><p className="text-2xl font-bold text-foreground">{users.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Active Users</p><p className="text-2xl font-bold text-success">{users.filter(u => u.status === 'active').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Advisers</p><p className="text-2xl font-bold text-primary">{users.filter(u => u.role === 'adviser').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">MFA Enabled</p><p className="text-2xl font-bold text-success">{users.filter(u => u.mfaEnabled).length}/{users.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> User & Adviser Management</CardTitle>
              <CardDescription>Manage system users, advisers, roles and permissions</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10 w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="adviser">Adviser</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add User</Button>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Clients</TableHead>
                <TableHead>MFA</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={`${roleColors[user.role] || ''} text-xs capitalize`} variant="outline">
                      {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role === 'adviser' && <UserCheck className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : user.status === 'suspended' ? 'destructive' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{user.lastLogin}</TableCell>
                  <TableCell className="text-right">{user.clients > 0 ? user.clients : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.mfaEnabled ? 'default' : 'outline'}>{user.mfaEnabled ? '✓ On' : 'Off'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setEditingUser(user)} title="Edit"><Edit className="w-3 h-3" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleToggleLock(user.id)} title={user.status === 'suspended' ? 'Unlock' : 'Lock'}>
                        {user.status === 'suspended' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.name)} title="Reset Password"><Key className="w-3 h-3" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(user.id)} title="Delete"><Trash2 className="w-3 h-3 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleAdd} mode="add" />
      <UserDialog open={!!editingUser} onClose={() => setEditingUser(null)} onSave={handleEdit} mode="edit" initial={editingUser ? { name: editingUser.name, email: editingUser.email, role: editingUser.role, status: editingUser.status, department: editingUser.department } : undefined} />
      <ConfirmDialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} onConfirm={() => deleteConfirm !== null && handleDelete(deleteConfirm)} title="Delete User" description="This will permanently remove this user and revoke their access." variant="destructive" />
    </div>
  )
}
