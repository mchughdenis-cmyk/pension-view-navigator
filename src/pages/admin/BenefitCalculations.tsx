import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import { AdminDeskPage } from "@/components/admin/AdminDeskPage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Row {
  id: string;
  member: string;
  type: "Retirement" | "PCLS" | "Death benefit" | "UFPLS" | "Transfer value";
  requestedAt: string;
  status: "pending" | "in_progress" | "complete";
  fundValue: number;
}

const seed: Row[] = [
  { id: "BC-2041", member: "Alice Turner (SIPP)", type: "Retirement", requestedAt: "2026-07-05", status: "pending", fundValue: 412500 },
  { id: "BC-2042", member: "Robert Mahli (SIPP)", type: "PCLS", requestedAt: "2026-07-06", status: "in_progress", fundValue: 268000 },
  { id: "BC-2043", member: "Estate of D. Roche", type: "Death benefit", requestedAt: "2026-07-02", status: "pending", fundValue: 89400 },
  { id: "BC-2044", member: "Priya Shah", type: "UFPLS", requestedAt: "2026-07-07", status: "complete", fundValue: 15000 },
];

const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);

export default function BenefitCalculations() {
  const [rows, setRows] = useState<Row[]>(seed);

  const advance = (r: Row) => {
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, status: x.status === "pending" ? "in_progress" : "complete" } : x));
    toast({ title: "Calculation updated", description: `${r.id} → ${r.status === "pending" ? "in progress" : "complete"}` });
  };

  const columns = [
    { header: "Ref", cell: (r: Row) => <span className="font-mono text-xs">{r.id}</span> },
    { header: "Member", cell: (r: Row) => r.member },
    { header: "Type", cell: (r: Row) => <Badge variant="outline">{r.type}</Badge> },
    { header: "Fund value", cell: (r: Row) => gbp(r.fundValue) },
    { header: "Requested", cell: (r: Row) => r.requestedAt },
  ];

  const tabs = [
    { value: "pending", label: "Pending", rows: rows.filter((r) => r.status === "pending"),
      actions: [{ label: "Start", onClick: advance }] },
    { value: "in_progress", label: "In progress", rows: rows.filter((r) => r.status === "in_progress"),
      actions: [{ label: "Complete", onClick: advance, variant: "default" as const }] },
    { value: "complete", label: "Complete", rows: rows.filter((r) => r.status === "complete") },
  ];

  return (
    <AdminDeskPage
      icon={Calculator}
      title="Benefit calculations"
      description="Retirement quotes, PCLS, UFPLS, transfer values and death benefit calculations against scheme rules and service."
      regulatoryNote="All calculations must apply the 2024/25 LSA/LSDBA framework; four-eyes checker required before member issue."
      stats={[
        { label: "Pending", value: rows.filter((r) => r.status === "pending").length },
        { label: "In progress", value: rows.filter((r) => r.status === "in_progress").length, hint: "48-hour SLA" },
        { label: "Complete (7d)", value: rows.filter((r) => r.status === "complete").length },
        { label: "Total fund under calc", value: gbp(rows.reduce((s, r) => s + r.fundValue, 0)) },
      ]}
      columns={columns}
      tabs={tabs}
      searchKey={(r) => `${r.id} ${r.member} ${r.type}`}
    />
  );
}
