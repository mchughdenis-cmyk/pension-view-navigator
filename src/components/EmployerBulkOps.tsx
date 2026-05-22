// MP.5 — Employer bulk operations panel
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Layers, Percent, UserPlus, FileText, Mail } from "lucide-react";
import { toast } from "sonner";

export default function EmployerBulkOps() {
  const [genProgress, setGenProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const runGen = async () => {
    setRunning(true);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 120));
      setGenProgress(i);
    }
    setRunning(false);
    toast.success("47 statements generated — ready to download as ZIP");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Layers className="h-7 w-7 text-primary" /> Bulk actions
        </h1>
        <p className="text-sm text-muted-foreground">Manage 50+ employees efficiently — one operation, many records.</p>
      </header>

      <Tabs defaultValue="rates" className="space-y-4">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="rates"><Percent className="h-3 w-3 mr-1" /> Rates</TabsTrigger>
          <TabsTrigger value="enrol"><UserPlus className="h-3 w-3 mr-1" /> Enrol</TabsTrigger>
          <TabsTrigger value="statements"><FileText className="h-3 w-3 mr-1" /> Statements</TabsTrigger>
          <TabsTrigger value="comms"><Mail className="h-3 w-3 mr-1" /> Comms</TabsTrigger>
        </TabsList>

        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle>Bulk contribution rate update</CardTitle>
              <CardDescription>Update contribution rates for multiple employees at once.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Filter: department, status…" />
              <div className="rounded-md border p-3 text-sm text-muted-foreground">47 of 47 employees selected</div>
              <div className="flex gap-2 items-end">
                <div className="flex-1"><label className="text-xs">New employee rate</label><Input type="number" defaultValue={5} /></div>
                <Button onClick={() => toast.success("Rates updated for 47 employees · notifications sent")}>Preview & apply</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrol">
          <Card>
            <CardHeader>
              <CardTitle>Batch new starter enrolment</CardTitle>
              <CardDescription>Enrol multiple new employees into the pension scheme via CSV.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm">Download CSV template</Button>
              <Input type="file" accept=".csv" onChange={() => toast.success("12 new starters validated · 0 errors")} />
              <Button onClick={() => toast.success("12 accounts created · welcome emails sent")}>Enrol 12 employees</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle>Bulk statement generation</CardTitle>
              <CardDescription>Generate annual benefit statements for all employees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm">Tax year</label>
                <Input className="w-32" defaultValue="2024/25" />
              </div>
              <Button onClick={runGen} disabled={running}>Generate 47 statements</Button>
              {running && <Progress value={genProgress} />}
              {!running && genProgress === 100 && <Button variant="outline">Download all as ZIP</Button>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comms">
          <Card>
            <CardHeader>
              <CardTitle>Mass employee communication</CardTitle>
              <CardDescription>Send a message to all enrolled employees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Subject" />
              <Textarea rows={5} maxLength={500} placeholder="Body (500 char limit)" />
              <Button onClick={() => toast.success("Message sent to 47 employees · logged to audit trail")}>Send to all</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
