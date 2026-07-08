import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { AdminDeskPage } from "@/components/admin/AdminDeskPage";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface Row {
  id: string;
  member: string;
  channel: "Phone" | "Email" | "Letter" | "Portal";
  topic: string;
  received: string;
  slaHours: number;
  priority: "Low" | "Normal" | "High" | "Vulnerable";
  status: "open" | "in_progress" | "resolved";
}

const seed: Row[] = [
  { id: "MQ-3301", member: "Alice Turner", channel: "Phone", topic: "PCLS timing question", received: "2026-07-08 09:14", slaHours: 24, priority: "Normal", status: "open" },
  { id: "MQ-3302", member: "Estate of D. Roche", channel: "Letter", topic: "Death benefit paperwork", received: "2026-07-07", slaHours: 48, priority: "Vulnerable", status: "in_progress" },
  { id: "MQ-3303", member: "Priya Shah", channel: "Email", topic: "Explain UFPLS tax", received: "2026-07-08 07:02", slaHours: 24, priority: "Normal", status: "open" },
  { id: "MQ-3304", member: "Robert Mahli", channel: "Portal", topic: "Transfer status", received: "2026-07-06", slaHours: 24, priority: "High", status: "in_progress" },
  { id: "MQ-3305", member: "Iris Chen", channel: "Email", topic: "Change address", received: "2026-07-05", slaHours: 48, priority: "Low", status: "resolved" },
];

export default function MemberQueries() {
  const [rows, setRows] = useState<Row[]>(seed);

  const advance = (r: Row, next: Row["status"], label: string) => {
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, status: next } : x));
    toast({ title: label, description: `${r.member} — ${r.topic}` });
  };

  const badge = (p: Row["priority"]) => {
    const v = p === "Vulnerable" ? "destructive" : p === "High" ? "default" : "outline";
    return <Badge variant={v as any}>{p}</Badge>;
  };

  return (
    <AdminDeskPage
      icon={MessageSquare}
      title="Member queries"
      description="First point of contact for member phone, email, letter and portal queries — logged, triaged and resolved within SLA."
      regulatoryNote="Complaints must be acknowledged within 5 business days and resolved within 8 weeks (FCA DISP)."
      stats={[
        { label: "Open", value: rows.filter((r) => r.status === "open").length },
        { label: "In progress", value: rows.filter((r) => r.status === "in_progress").length },
        { label: "Resolved (7d)", value: rows.filter((r) => r.status === "resolved").length },
        { label: "Vulnerable flags", value: rows.filter((r) => r.priority === "Vulnerable").length, hint: "Priority handling" },
      ]}
      columns={[
        { header: "Ref", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
        { header: "Member", cell: (r) => r.member },
        { header: "Channel", cell: (r) => <Badge variant="outline">{r.channel}</Badge> },
        { header: "Topic", cell: (r) => r.topic },
        { header: "Priority", cell: (r) => badge(r.priority) },
        { header: "SLA", cell: (r) => `${r.slaHours}h` },
        { header: "Received", cell: (r) => r.received },
      ]}
      tabs={[
        { value: "open", label: "Open", rows: rows.filter((r) => r.status === "open"),
          actions: [{ label: "Pick up", variant: "default", onClick: (r) => advance(r, "in_progress", "Assigned to you") }] },
        { value: "in_progress", label: "In progress", rows: rows.filter((r) => r.status === "in_progress"),
          actions: [{ label: "Resolve", variant: "default", onClick: (r) => advance(r, "resolved", "Query resolved") }] },
        { value: "resolved", label: "Resolved", rows: rows.filter((r) => r.status === "resolved") },
      ]}
      searchKey={(r) => `${r.id} ${r.member} ${r.topic}`}
    />
  );
}
