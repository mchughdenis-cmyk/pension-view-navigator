import { useState } from "react";
import { UserCog } from "lucide-react";
import { AdminDeskPage } from "@/components/admin/AdminDeskPage";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface Row {
  id: string;
  member: string;
  field: "Address" | "Name" | "Marital status" | "Bank details" | "Email";
  from: string;
  to: string;
  source: "Member portal" | "Phone" | "Post" | "Adviser";
  status: "awaiting_verification" | "verified" | "applied";
}

const seed: Row[] = [
  { id: "MD-711", member: "Alice Turner", field: "Address", from: "12 Oak Rd, London", to: "44 Elm St, Bath", source: "Member portal", status: "awaiting_verification" },
  { id: "MD-712", member: "Kwame Asante", field: "Name", from: "Kwame Asante", to: "Kwame Asante-Smith", source: "Post", status: "awaiting_verification" },
  { id: "MD-713", member: "Priya Shah", field: "Marital status", from: "Single", to: "Married", source: "Adviser", status: "verified" },
  { id: "MD-714", member: "Robert Mahli", field: "Bank details", from: "•••• 4421", to: "•••• 9082", source: "Phone", status: "awaiting_verification" },
  { id: "MD-715", member: "Iris Chen", field: "Email", from: "iris@old.co", to: "iris.chen@new.co", source: "Member portal", status: "applied" },
];

export default function MemberDetails() {
  const [rows, setRows] = useState<Row[]>(seed);

  const advance = (r: Row, next: Row["status"], label: string) => {
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, status: next } : x));
    toast({ title: label, description: `${r.member} — ${r.field}` });
  };

  return (
    <AdminDeskPage
      icon={UserCog}
      title="Member details updates"
      description="Verify and apply changes to member records — address, name, marital status, bank details and contact details."
      regulatoryNote="Bank detail changes require call-back verification. Name changes require documentary evidence (deed poll, marriage certificate)."
      stats={[
        { label: "Awaiting verification", value: rows.filter((r) => r.status === "awaiting_verification").length },
        { label: "Verified — ready", value: rows.filter((r) => r.status === "verified").length },
        { label: "Applied (7d)", value: rows.filter((r) => r.status === "applied").length },
        { label: "Bank changes", value: rows.filter((r) => r.field === "Bank details").length, hint: "Call-back required" },
      ]}
      columns={[
        { header: "Ref", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
        { header: "Member", cell: (r) => r.member },
        { header: "Field", cell: (r) => <Badge variant="outline">{r.field}</Badge> },
        { header: "From", cell: (r) => <span className="text-muted-foreground">{r.from}</span> },
        { header: "To", cell: (r) => <strong>{r.to}</strong> },
        { header: "Source", cell: (r) => r.source },
      ]}
      tabs={[
        { value: "awaiting_verification", label: "Awaiting verification",
          rows: rows.filter((r) => r.status === "awaiting_verification"),
          actions: [{ label: "Verify", onClick: (r) => advance(r, "verified", "Marked verified") }] },
        { value: "verified", label: "Ready to apply",
          rows: rows.filter((r) => r.status === "verified"),
          actions: [{ label: "Apply", variant: "default", onClick: (r) => advance(r, "applied", "Change applied to member record") }] },
        { value: "applied", label: "Applied", rows: rows.filter((r) => r.status === "applied") },
      ]}
      searchKey={(r) => `${r.id} ${r.member} ${r.field}`}
    />
  );
}
