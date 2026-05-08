import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ui/page-primitives"
import { ArrowDown, ArrowUp } from "lucide-react"

export default function OrigoMessages() {
  const [msgs, setMsgs] = useState<any[]>([])
  useEffect(() => { supabase.from('origo_messages').select('*').order('created_at', { ascending: false }).then(({ data }) => setMsgs(data || [])) }, [])
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader title="Origo Options" description="Real-time pension transfer messaging — discovery, quote, option, settlement." />
      <Card>
        <CardHeader><CardTitle>Message thread</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead></TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Ack ref</TableHead><TableHead>Sent</TableHead><TableHead>Acked</TableHead><TableHead>Payload</TableHead></TableRow></TableHeader>
            <TableBody>{msgs.map(m => (
              <TableRow key={m.id}>
                <TableCell>{m.direction === 'outbound' ? <ArrowUp className="h-4 w-4 text-blue-600" /> : <ArrowDown className="h-4 w-4 text-green-600" />}</TableCell>
                <TableCell className="capitalize">{m.message_type}</TableCell>
                <TableCell><Badge variant={m.status === 'acked' ? 'default' : 'secondary'}>{m.status}</Badge></TableCell>
                <TableCell className="font-mono text-xs">{m.ack_ref || '—'}</TableCell>
                <TableCell className="text-sm">{m.sent_at ? new Date(m.sent_at).toLocaleString('en-GB') : '—'}</TableCell>
                <TableCell className="text-sm">{m.acked_at ? new Date(m.acked_at).toLocaleString('en-GB') : '—'}</TableCell>
                <TableCell className="font-mono text-xs max-w-xs truncate">{m.payload ? JSON.stringify(m.payload) : '—'}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
