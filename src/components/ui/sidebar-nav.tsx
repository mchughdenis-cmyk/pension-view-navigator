import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface NavItem {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

interface SidebarNavListProps {
  groups: NavGroup[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function SidebarNavList({ groups, activeTab, onTabChange, className }: SidebarNavListProps) {
  const activeGroup = groups.find(g => g.items.some(i => i.value === activeTab));

  return (
    <ScrollArea className={cn("h-full", className)}>
      <nav className="space-y-1 p-3">
        {groups.map((group) => {
          const isActive = activeGroup?.label === group.label;
          const GroupIcon = group.icon;
          return (
            <Collapsible key={group.label} defaultOpen={isActive}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors group">
                <div className="flex items-center gap-2">
                  <GroupIcon className="w-4 h-4" />
                  <span>{group.label}</span>
                </div>
                <ChevronDown className="w-4 h-4 transition-transform group-data-[state=closed]:rotate-[-90deg]" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-2 mt-1 space-y-0.5 border-l border-border pl-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isItemActive = activeTab === item.value;
                    return (
                      <button
                        key={item.value}
                        onClick={() => onTabChange(item.value)}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors text-left",
                          isItemActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>
    </ScrollArea>
  );
}

interface SidebarNavLayoutProps {
  groups: NavGroup[];
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
  sidebarWidth?: string;
}

export function SidebarNavLayout({ groups, activeTab, onTabChange, children, sidebarWidth = "w-64" }: SidebarNavLayoutProps) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const allItems = groups.flatMap(g => g.items);
  const activeItem = allItems.find(i => i.value === activeTab);
  const activeLabel = activeItem?.label || "Navigate";
  const ActiveIcon = activeItem?.icon || ChevronDown;

  const handleChange = (value: string) => {
    onTabChange(value);
    setSheetOpen(false);
  };

  return (
    <div className="flex gap-6">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className={cn("shrink-0 self-start sticky top-6 border rounded-lg bg-card", sidebarWidth)}>
          <SidebarNavList groups={groups} activeTab={activeTab} onTabChange={handleChange} className="max-h-[calc(100vh-14rem)]" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isMobile && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-12 text-base font-medium mb-4">
                <div className="flex items-center gap-2">
                  <ActiveIcon className="w-5 h-5" />
                  <span>{activeLabel}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]">
              <SheetHeader className="pb-2">
                <SheetTitle>Navigate to</SheetTitle>
              </SheetHeader>
              <SidebarNavList groups={groups} activeTab={activeTab} onTabChange={handleChange} />
            </SheetContent>
          </Sheet>
        )}

        {!isMobile && (
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <ActiveIcon className="w-4 h-4" />
            <span className="font-medium text-foreground">{activeLabel}</span>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
