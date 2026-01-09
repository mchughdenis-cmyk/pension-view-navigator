import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MobileTabsProps {
  tabs: TabItem[];
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileTabs({ tabs, defaultValue, children, className }: MobileTabsProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const activeTabLabel = tabs.find(t => t.value === activeTab)?.label || "Select";
  const ActiveIcon = tabs.find(t => t.value === activeTab)?.icon;

  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("space-y-4", className)}>
        {/* Mobile: Sheet-based navigation */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between h-12 text-base font-medium"
            >
              <div className="flex items-center gap-2">
                {ActiveIcon && <ActiveIcon className="w-5 h-5" />}
                <span>{activeTabLabel}</span>
              </div>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh]">
            <SheetHeader className="pb-4">
              <SheetTitle>Navigate to</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 pb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.value}
                    variant={activeTab === tab.value ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start h-12 text-base",
                      activeTab === tab.value && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setSheetOpen(false);
                    }}
                  >
                    {Icon && <Icon className="w-5 h-5 mr-3" />}
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>

        {children}
      </Tabs>
    );
  }

  // Desktop: Standard horizontal tabs
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("space-y-4", className)}>
      <TabsList className={cn(
        "grid w-full",
        tabs.length <= 4 ? `grid-cols-${tabs.length}` : "grid-cols-4 lg:grid-cols-" + tabs.length
      )} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {Icon && <Icon className="w-4 h-4 mr-1 hidden lg:inline" />}
              <span className="truncate">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}

// Re-export TabsContent for convenience
export { TabsContent } from "@/components/ui/tabs";
