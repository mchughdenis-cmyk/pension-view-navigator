import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole, Role } from "@/contexts/RoleContext";
import { useFirm } from "@/contexts/FirmContext";
import { NAV_BY_ROLE, findNavLabel } from "./navConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Star, StarOff, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFavourites, useRecents } from "@/hooks/useFavourites";
import { useNavBadges, badgeForUrl } from "@/hooks/useNavBadges";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { role, setRole, user } = useRole();
  const { firm, branding } = useFirm();
  const groups = NAV_BY_ROLE[role];
  const { favs, toggle, isFav } = useFavourites();
  const { recents, push } = useRecents();
  const badges = useNavBadges();

  useEffect(() => { if (pathname && pathname !== "/") push(pathname); }, [pathname, push]);

  const isActive = (url: string) => pathname === url;
  const brandName = firm?.name ?? "Pension Navigator";
  const brandSub = "by Airgead";

  // Build flat lookup from all role groups so favourites/recents can render any item
  const allItems = groups.flatMap((g) => g.items);
  const findItem = (url: string) => allItems.find((i) => i.url === url);

  const favItems = favs.map(findItem).filter(Boolean) as typeof allItems;
  const recentItems = recents
    .filter((u) => !favs.includes(u))
    .map(findItem).filter(Boolean).slice(0, 5) as typeof allItems;

  const renderItem = (item: typeof allItems[number], withPin = true) => {
    const b = badgeForUrl(item.url, badges);
    const fav = isFav(item.url);
    return (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
          <NavLink to={item.url} className="flex items-center gap-2">
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate flex-1">{item.title}</span>}
            {!collapsed && b !== undefined && (
              <Badge variant="secondary" className="h-4 min-w-[1.25rem] px-1 text-[10px] tabular-nums">
                {b > 99 ? "99+" : b}
              </Badge>
            )}
            {!collapsed && withPin && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(item.url); }}
                className="opacity-0 group-hover/menu-item:opacity-100 hover:text-foreground text-muted-foreground"
                title={fav ? "Unpin" : "Pin to favourites"}
                aria-label={fav ? "Unpin" : "Pin"}
              >
                {fav ? <Star className="h-3 w-3 fill-current" /> : <StarOff className="h-3 w-3" />}
              </button>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

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
        {favItems.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-current text-warning" /> Pinned
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="group/menu-item">{favItems.map((i) => renderItem(i))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {recentItems.length > 0 && !collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Recent
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="group/menu-item">{recentItems.map((i) => renderItem(i, false))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="group/menu-item">{g.items.map((i) => renderItem(i))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        {!collapsed ? (
          <div className="px-2 py-1.5 space-y-1.5">
            <p className="text-xs text-muted-foreground truncate">{user.name}</p>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Viewing as</p>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client view</SelectItem>
                  <SelectItem value="adviser">Adviser view</SelectItem>
                  <SelectItem value="admin">Admin view</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="px-2 py-1.5 text-[10px] text-muted-foreground text-center uppercase">{role[0]}</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
