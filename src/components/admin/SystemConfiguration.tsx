import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Shield,
  Mail,
  Lock,
  Bell,
  Globe,
  Database,
  Server,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

export default function SystemConfiguration() {
  const [config, setConfig] = useState({
    // Platform
    platformName: 'Pension Navigator by Airgead',
    supportEmail: 'support@airgead.com',
    timezone: 'Europe/London',
    currency: 'GBP',
    maintenanceMode: false,
    // Security
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 12,
    requireMFA: true,
    ipWhitelist: '',
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    slackIntegration: false,
    webhookUrl: '',
    // Processing
    autoReconciliation: true,
    autoFeeCollection: true,
    autoRebalanceAlerts: true,
    batchProcessingTime: '02:00',
  })

  const update = (key: string, value: any) => setConfig(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    toast.success('System configuration saved', { description: 'Changes will take effect immediately' })
  }

  const handleTestEmail = () => {
    toast.success('Test email sent to ' + config.supportEmail)
  }

  const systemStatus = [
    { name: 'Database', status: 'healthy', uptime: '99.99%' },
    { name: 'Authentication', status: 'healthy', uptime: '100%' },
    { name: 'Payment Gateway', status: 'healthy', uptime: '99.95%' },
    { name: 'Email Service', status: 'healthy', uptime: '99.9%' },
    { name: 'Origo Connection', status: 'degraded', uptime: '98.5%' },
    { name: 'Morningstar API', status: 'healthy', uptime: '99.8%' },
  ]

  return (
    <div className="space-y-6">
      {/* System Health */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {systemStatus.map(s => (
          <Card key={s.name}>
            <CardContent className="p-3 text-center">
              {s.status === 'healthy' ? <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" /> : <AlertTriangle className="w-5 h-5 text-warning mx-auto mb-1" />}
              <p className="text-xs font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.uptime}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Platform Name</Label><Input value={config.platformName} onChange={e => update('platformName', e.target.value)} /></div>
            <div className="space-y-1"><Label>Support Email</Label>
              <div className="flex gap-2">
                <Input value={config.supportEmail} onChange={e => update('supportEmail', e.target.value)} className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleTestEmail}><Mail className="w-4 h-4 mr-1" /> Test</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Timezone</Label>
                <Select value={config.timezone} onValueChange={v => update('timezone', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                    <SelectItem value="Europe/Dublin">Europe/Dublin (GMT/IST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Currency</Label>
                <Select value={config.currency} onValueChange={v => update('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-destructive/5">
              <div><p className="font-medium text-sm">Maintenance Mode</p><p className="text-xs text-muted-foreground">Prevents client access</p></div>
              <Switch checked={config.maintenanceMode} onCheckedChange={v => { update('maintenanceMode', v); toast[v ? 'warning' : 'success'](v ? 'Maintenance mode enabled' : 'Maintenance mode disabled') }} />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Security Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Session Timeout (mins)</Label><Input type="number" value={config.sessionTimeout} onChange={e => update('sessionTimeout', parseInt(e.target.value) || 30)} /></div>
              <div className="space-y-1"><Label>Max Login Attempts</Label><Input type="number" value={config.maxLoginAttempts} onChange={e => update('maxLoginAttempts', parseInt(e.target.value) || 5)} /></div>
            </div>
            <div className="space-y-1"><Label>Min Password Length</Label><Input type="number" value={config.passwordMinLength} onChange={e => update('passwordMinLength', parseInt(e.target.value) || 8)} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Require MFA for all users</p><p className="text-xs text-muted-foreground">Enforce two-factor authentication</p></div><Switch checked={config.requireMFA} onCheckedChange={v => update('requireMFA', v)} /></div>
            <div className="space-y-1"><Label>IP Whitelist (comma-separated)</Label><Input value={config.ipWhitelist} onChange={e => update('ipWhitelist', e.target.value)} placeholder="Leave blank for no restriction" /></div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">System alerts via email</p></div><Switch checked={config.emailNotifications} onCheckedChange={v => update('emailNotifications', v)} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">SMS Notifications</p><p className="text-xs text-muted-foreground">Critical alerts via SMS</p></div><Switch checked={config.smsNotifications} onCheckedChange={v => update('smsNotifications', v)} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Slack Integration</p><p className="text-xs text-muted-foreground">Post alerts to Slack channel</p></div><Switch checked={config.slackIntegration} onCheckedChange={v => update('slackIntegration', v)} /></div>
            <div className="space-y-1"><Label>Webhook URL</Label><Input value={config.webhookUrl} onChange={e => update('webhookUrl', e.target.value)} placeholder="https://..." /></div>
          </CardContent>
        </Card>

        {/* Processing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server className="w-5 h-5" /> Automated Processing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Auto Reconciliation</p><p className="text-xs text-muted-foreground">Daily cash & stock reconciliation</p></div><Switch checked={config.autoReconciliation} onCheckedChange={v => update('autoReconciliation', v)} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Auto Fee Collection</p><p className="text-xs text-muted-foreground">Collect fees on schedule</p></div><Switch checked={config.autoFeeCollection} onCheckedChange={v => update('autoFeeCollection', v)} /></div>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Rebalance Drift Alerts</p><p className="text-xs text-muted-foreground">Alert when portfolios drift</p></div><Switch checked={config.autoRebalanceAlerts} onCheckedChange={v => update('autoRebalanceAlerts', v)} /></div>
            <div className="space-y-1"><Label>Batch Processing Time</Label><Input type="time" value={config.batchProcessingTime} onChange={e => update('batchProcessingTime', e.target.value)} /></div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setConfig(prev => ({ ...prev })); toast.info('Settings reloaded') }}><RefreshCw className="w-4 h-4 mr-2" /> Reset</Button>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Configuration</Button>
      </div>
    </div>
  )
}
