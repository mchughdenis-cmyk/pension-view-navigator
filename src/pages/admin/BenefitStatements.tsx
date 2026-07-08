import { useState } from "react";
import { FileText } from "lucide-react";
import { AdminDeskPage } from "@/components/admin/AdminDeskPage";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface Row {
  id: string;
  member: string;
  scheme: string;
  statementType: "Annual benefit statement" | "SMPI" | "Chargeable event" | "Statutory disclosure";
  periodEnd: string;
  status: "queued" | "drafted" | "issued";
  channel: "Post" | "Email" | "Portal";
}

const seed: Row[] = [
  { id: "BS-8801", member: "Alice Turner", scheme: "Airgead SIPP", statementType: "Annual benefit statement", periodEnd: "2026-04-05", status: "queued", channel: "Portal" },
  { id: "BS-8802", member: "Kwame Asante", scheme: "Airgead SIPP", statementType: "SMPI", periodEnd: "2026-04-05", status: "drafted", channel: "Post" },
  { id: "BS-8803", member: "Robert Mahli", scheme: "Airgead SIPP", statementType: "Chargeable event", periodEnd: "2026-06-30", status: "queued", channel: "Post" },
  { id: "BS-8804", member: "Priya Shah", scheme: "Acme Group SIPP", statementType: "Statutory disclosure", periodEnd: "2026-04-05", status: "issued", channel: "Email" },
];

export default function BenefitStatements() {
  const [rows, setRows] = useState<Row[]>(seed);

  const advance = (r: Row, next: Row["status"], label: string) => {
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, status: next } : x));
    toast({ title: label, description: `${r.member} — ${r.statementType}` });
  };

  return (
    <AdminDeskPage
      icon={FileText}
      title="Benefit statements"
      description="Draft, review and issue annual benefit statements, SMPIs, chargeable event certificates and statutory disclosures."
      regulatoryNote="Annual benefit statements must be issued within 12 months of the scheme year end (Disclosure Regulations 2013, Reg 6)."
      stats={[
        { label: "Queued", value: rows.filter((r) => r.status === "queued").length },
        { label: "Drafted", value: rows.filter((r) => r.status === "drafted").length, hint: "Awaiting sign-off" },
        { label: "Issued (30d)", value: rows.filter((r) => r.status === "issued").length },
        { label: "SMPIs due", value: rows.filter((r) => r.statementType === "SMPI").length },
      ]}
      columns={[
        { header: "Ref", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
        { header: "Member", cell: (r) => r.member },
        { header: "Scheme", cell: (r) => r.scheme },
        { header: "Type", cell: (r) => <Badge variant="outline">{r.statementType}</Badge> },
        { header: "Period end", cell: (r) => r.periodEnd },
        { header: "Channel", cell: (r) => r.channel },
      ]}
      tabs={[
        { value: "queued", label: "Queued", rows: rows.filter((r) => r.status === "queued"),
          actions: [{ label: "Draft", variant: "default", onClick: (r) => advance(r, "drafted", "Statement drafted") }] },
        { value: "drafted", label: "Drafted", rows: rows.filter((r) => r.status === "drafted"),
          actions: [{ label: "Issue", variant: "default", onClick: (r) => advance(r, "issued", "Statement issued") }] },
        { value: "issued", label: "Issued", rows: rows.filter((r) => r.status === "issued") },
      ]}
      searchKey={(r) => `${r.id} ${r.member} ${r.statementType}`}
    />
  );
}
