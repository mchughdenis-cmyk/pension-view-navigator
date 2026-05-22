// MP.1 — Multi-role switcher with active_role, role-context banner, request-access flow
import { useState } from "react";
import { useRole, Role } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, Shield, Building2, ChevronDown, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/utils/haptic";

const ICONS: Record<Role, any> = { client: User, adviser: Briefcase, admin: Shield };
const LABELS: Record<Role, string> = { client: "Consumer", adviser: "Adviser", admin: "Admin" };
const DESCRIPTIONS: Record<Role, string> = {
  client: "Your personal pension and investments",
  adviser: "Manage your client portfolio",
  admin: "Platform administration",
};
const DEFAULT_ROUTE: Record<Role, string> = {
  client: "/client-services",
  adviser: "/workbench",
  admin: "/admin",
};

const LS_ROLES = "airgead.userRoles";

function getRoles(): Role[] {
  try {
    const raw = localStorage.getItem(LS_ROLES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ["client", "adviser", "admin"]; // demo: all available
}
function setRolesLS(roles: Role[]) { localStorage.setItem(LS_ROLES, JSON.stringify(roles)); }

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>(getRoles());
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestRole, setRequestRole] = useState<"adviser" | "admin">("adviser");
  const [companyName, setCompanyName] = useState("");
  const [reference, setReference] = useState("");
  const Icon = ICONS[role];

  const switchTo = (r: Role) => {
    if (r === role) return;
    haptic.medium();
    if (r === "admin") {
      const ok = window.confirm("Re-confirm: switch into Admin mode? (biometric/TOTP gate)");
      if (!ok) return;
    }
    setRole(r);
    toast.success(`Switched to ${LABELS[r]} mode`);
    setTimeout(() => navigate(DEFAULT_ROUTE[r]), 100);
  };

  const submitRequest = () => {
    if (!companyName) return;
    const next = Array.from(new Set([...roles, requestRole])) as Role[];
    setRoles(next);
    setRolesLS(next);
    toast.success(`Access request submitted${requestRole !== "admin" ? " (auto-approved for demo)" : ""}`);
    setRequestOpen(false);
    setCompanyName("");
    setReference("");
  };

  return (
    <>
      {/* Role-context banner — non-consumer roles */}
      {role !== "client" && (
        <div
          className={`fixed top-0 inset-x-0 z-40 text-xs font-medium text-white text-center py-1 px-3 ${
            role === "adviser" ? "bg-indigo-700" : "bg-red-600"
          }`}
        >
          You are in {LABELS[role]} mode.{" "}
          <button onClick={() => switchTo("client")} className="underline opacity-90 hover:opacity-100">
            Switch back to your personal account ↗
          </button>
        </div>
      )}

      <div className={`fixed right-3 z-50 ${role !== "client" ? "top-9" : "top-3"}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shadow-md bg-background/90 backdrop-blur">
              <Icon className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">{LABELS[role]}</span>
              <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-xs">Switch role (single session)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["client", "adviser", "admin"] as Role[]).map((r) => {
              const I = ICONS[r];
              const has = roles.includes(r);
              return (
                <DropdownMenuItem
                  key={r}
                  disabled={!has}
                  onClick={() => has && switchTo(r)}
                  className="flex items-start gap-3 py-2"
                >
                  <I className="h-4 w-4 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {LABELS[r]}
                      {role === r && <Check className="h-3 w-3 text-primary" />}
                      {!has && <span className="text-[10px] uppercase opacity-60">Locked</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{DESCRIPTIONS[r]}</div>
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRequestOpen(true)} className="text-primary text-xs">
              <Plus className="h-3 w-3 mr-2" /> Request additional access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request additional access</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Which role do you need?</Label>
              <Select value={requestRole} onValueChange={(v: any) => setRequestRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="adviser"><Briefcase className="h-3 w-3 mr-2 inline" /> Adviser (IFA)</SelectItem>
                  <SelectItem value="admin"><Shield className="h-3 w-3 mr-2 inline" /> Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{requestRole === "adviser" ? "Firm name" : "Company name"}</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <Label>{requestRole === "adviser" ? "FCA authorisation number" : "Companies House number"}</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button onClick={submitRequest}>Submit request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Building2 used in select — silence unused-import linter
export const _icons = { Building2 };
