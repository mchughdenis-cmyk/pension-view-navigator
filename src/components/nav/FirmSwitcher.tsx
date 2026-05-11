import { Building2 } from "lucide-react";
import { useFirm } from "@/contexts/FirmContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/** Header firm selector — drives simulated multi-tenancy. */
export function FirmSwitcher() {
  const { firms, firmId, setFirmId, loading } = useFirm();
  if (loading || firms.length === 0) return null;
  return (
    <Select value={firmId ?? undefined} onValueChange={setFirmId}>
      <SelectTrigger className="h-8 w-[180px] text-xs gap-2">
        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue placeholder="Select firm" />
      </SelectTrigger>
      <SelectContent>
        {firms.map(f => (
          <SelectItem key={f.id} value={f.id} className="text-xs">
            <span className="font-medium">{f.name}</span>
            {f.fca_ref && <span className="ml-2 text-muted-foreground">· FRN {f.fca_ref}</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
