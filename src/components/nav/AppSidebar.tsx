import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole, Role } from "@/contexts/RoleContext";
import { useFirm } from "@/contexts/FirmContext";
import { NAV_BY_ROLE } from "./navConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins } from "lucide-react";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { role, setRole, user } = useRole();
  const { firm, branding } = useFirm();
  const groups = NAV_BY_ROLE[role];

  const isActive = (url: string) => pathname === url;

  const brandName = firm?.name ?? "Pension Navigator";
  const brandSub = firm ? "by Airgead" : "by Airgead";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1.5">
          {branding?.logo_url ? (
            <img src={branding.logo_url} alt={brandName} className="h-7 w-7 rounded-md object-contain shrink-0 bg-background" />
          ) : (
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center shrink-0">
              <Coins className="h-4 w-4" />
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{brandName}</p>
              <p className="text-xs text-muted-foreground truncate">{brandSub}</p>
              <span className="mt-1 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                Administration Platform
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => {
          return (
            <SidebarGroup key={g.label}>
              {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {g.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                        <NavLink to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t">
        {!collapsed ? (
          <div className="px-2 py-1.5 space-y-1.5">
            <p className="text-xs text-muted-foreground truncate">{user.name}</p>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client view</SelectItem>
                <SelectItem value="adviser">Adviser view</SelectItem>
                <SelectItem value="admin">Admin view</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="px-2 py-1.5 text-[10px] text-muted-foreground text-center uppercase">{role[0]}</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
