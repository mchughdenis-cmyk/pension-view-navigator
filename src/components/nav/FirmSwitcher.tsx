import { Building2, Globe2 } from "lucide-react";
import { useFirm } from "@/contexts/FirmContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

/** Header firm selector — drives simulated multi-tenancy.
 *  "All firms" puts the platform into cross-firm admin mode. */
export function FirmSwitcher() {
  const { firms, firmId, setFirmId, loading } = useFirm();
  if (loading || firms.length === 0) return null;
  return (
    <Select
      value={firmId ?? ALL}
      onValueChange={(v) => setFirmId(v === ALL ? null : v)}
    >
      <SelectTrigger className="h-8 w-[200px] text-xs gap-2">
        {firmId ? (
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <Globe2 className="h-3.5 w-3.5 text-primary" />
        )}
        <SelectValue placeholder="Select firm" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL} className="text-xs">
          <span className="font-semibold">All firms (Platform)</span>
        </SelectItem>
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
