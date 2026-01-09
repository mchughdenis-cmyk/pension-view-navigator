import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions: React.ReactNode;
  className?: string;
}

export function MobileHeader({ title, subtitle, badge, actions, className }: MobileHeaderProps) {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  if (isMobile) {
    return (
      <div className={cn("bg-card border-b border-border", className)}>
        <div className="px-4 py-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
              {badge && <div className="mt-1">{badge}</div>}
            </div>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="ml-2 flex-shrink-0">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="pb-4">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2" onClick={() => setSheetOpen(false)}>
                  {actions}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card border-b border-border", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            {badge && <div className="mt-1">{badge}</div>}
          </div>
          <div className="flex items-center gap-3">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}
