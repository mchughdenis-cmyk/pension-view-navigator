import { useRole, Role } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Briefcase, Shield, ChevronDown, LayoutDashboard, Smartphone } from "lucide-react";

const ICONS: Record<Role, any> = { client: User, adviser: Briefcase, admin: Shield };
const LABELS: Record<Role, string> = { client: "Client", adviser: "Adviser", admin: "Admin" };
const HOME: Record<Role, string> = {
  client: "/client-services",
  adviser: "/workbench",
  admin: "/admin",
};

/**
 * Header-mounted quick view switcher. Lets users jump between Client / Adviser / Admin
 * landing pages in one click and offers shortcuts to common destinations.
 */
export function ViewSwitcher() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const Icon = ICONS[role];

  const switchTo = (r: Role) => {
    setRole(r);
    navigate(HOME[r]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs font-medium">{LABELS[role]} view</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Switch view</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["client", "adviser", "admin"] as Role[]).map((r) => {
          const I = ICONS[r];
          return (
            <DropdownMenuItem key={r} onClick={() => switchTo(r)} className={role === r ? "bg-accent" : ""}>
              <I className="h-4 w-4 mr-2" />
              {LABELS[r]} view
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Jump to</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/m")}>
          <Smartphone className="h-4 w-4 mr-2" /> Mobile app view
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
