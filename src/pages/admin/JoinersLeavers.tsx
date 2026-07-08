import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AdminDeskPage } from "@/components/admin/AdminDeskPage";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface Row {
  id: string;
  member: string;
  employer: string;
  event: "Joiner" | "Leaver" | "Retiree" | "Opt-out";
  effectiveDate: string;
  status: "pending" | "processed";
}

const seed: Row[] = [
  { id: "JL-901", member: "Sam Okafor", employer: "Acme Ltd", event: "Joiner", effectiveDate: "2026-07-01", status: "pending" },
  { id: "JL-902", member: "Naomi Patel", employer: "Acme Ltd", event: "Leaver", effectiveDate: "2026-06-30", status: "pending" },
  { id: "JL-903", member: "Doug Henry", employer: "Brightside Cafés", event: "Retiree", effectiveDate: "2026-07-15", status: "pending" },
  { id: "JL-904", member: "Iris Chen", employer: "Norwood Health", event: "Opt-out", effectiveDate: "2026-06-25", status: "processed" },
];

export default function JoinersLeavers() {
  const [rows, setRows] = useState<Row[]>(seed);

  const process = (r: Row) => {
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, status: "processed" } : x));
    toast({ title: `${r.event} processed`, description: `${r.member} — ${r.employer}` });
  };

  return (
    <AdminDeskPage
      icon={UserPlus}
      title="Joiners & leavers"
      description="Enrol new employees, process leavers and retirees, and handle opt-outs from workplace pension schemes."
      regulatoryNote="Auto-enrolment postponement notices and opt-outs must be actioned within statutory windows (Pensions Act 2008)."
      stats={[
        { label: "Joiners (pending)", value: rows.filter((r) => r.event === "Joiner" && r.status === "pending").length },
        { label: "Leavers (pending)", value: rows.filter((r) => r.event === "Leaver" && r.status === "pending").length },
        { label: "Retirees (pending)", value: rows.filter((r) => r.event === "Retiree" && r.status === "pending").length },
        { label: "Opt-outs (30d)", value: rows.filter((r) => r.event === "Opt-out").length },
      ]}
      columns={[
        { header: "Ref", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
        { header: "Member", cell: (r) => r.member },
        { header: "Employer", cell: (r) => r.employer },
        { header: "Event", cell: (r) => <Badge variant="outline">{r.event}</Badge> },
        { header: "Effective", cell: (r) => r.effectiveDate },
      ]}
      tabs={[
        { value: "pending", label: "Pending", rows: rows.filter((r) => r.status === "pending"),
          actions: [{ label: "Process", onClick: process, variant: "default" }] },
        { value: "processed", label: "Processed", rows: rows.filter((r) => r.status === "processed") },
      ]}
      searchKey={(r) => `${r.id} ${r.member} ${r.employer}`}
    />
  );
}
