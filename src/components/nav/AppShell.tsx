import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsBell } from "@/components/NotificationsBell";
import { ChatLauncher } from "@/components/chat/ChatLauncher";
import { ViewSwitcher } from "./ViewSwitcher";
import { FirmSwitcher } from "./FirmSwitcher";
import { Button } from "@/components/ui/button";
import { Search, Keyboard } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { DensityToggle } from "@/components/DensityToggle";
import { KeyboardHelpDialog } from "@/components/KeyboardHelpDialog";
import { useJumpShortcuts } from "@/hooks/useJumpShortcuts";

/**
 * Application shell: persistent sidebar (role-aware) + sticky header with
 * breadcrumbs, theme toggle, and ⌘K hint. Wraps every authenticated/demo page.
 */
export function AppShell({ children }: { children: ReactNode }) {
  useJumpShortcuts();
  const triggerSearch = () => {
    const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
    document.dispatchEvent(ev);
  };
  const triggerHelp = () => {
    const ev = new KeyboardEvent("keydown", { key: "?", bubbles: true });
    document.dispatchEvent(ev);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-12 flex items-center gap-3 border-b bg-background/80 backdrop-blur px-3">
            <SidebarTrigger />
            <div className="flex-1 min-w-0">
              <Breadcrumbs />
            </div>
            <span
              className="hidden md:inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning-foreground"
              title="Environment"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Demo
            </span>
            <Button
              variant="outline" size="sm"
              onClick={triggerSearch}
              className="hidden md:inline-flex h-8 gap-2 text-xs text-muted-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              Search
              <kbd className="ml-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
            </Button>
            <FirmSwitcher />
            <ViewSwitcher />
            <NotificationsBell />
            <DensityToggle />
            <Button variant="ghost" size="icon" onClick={triggerHelp} className="h-8 w-8" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">
              <Keyboard className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <LogoutButton />
          </header>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
        <ChatLauncher />
        <KeyboardHelpDialog />
      </div>
    </SidebarProvider>
  );
}

