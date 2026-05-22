// PWA.1 — iOS install guidance bottom sheet
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Share, Plus, Smartphone } from "lucide-react";
import {
  isEU,
  isIOS,
  isInStandaloneMode,
  recordIOSInstallShown,
  dismissIOSInstallSheet,
  shouldShowIOSInstallSheet,
} from "@/utils/pwaCompat";

export default function IOSInstallSheet() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isIOS() || isInStandaloneMode()) return;
    const t = setTimeout(() => {
      if (shouldShowIOSInstallSheet()) {
        setOpen(true);
        recordIOSInstallShown();
      }
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    dismissIOSInstallSheet(7);
    setOpen(false);
  };

  const euCopy = isEU();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            {euCopy ? "Bookmark Pension Navigator for fast access" : "Install Pension Navigator"}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4 text-sm">
          {euCopy ? (
            <p className="text-muted-foreground">
              Apple restricts home-screen install on iOS in the EU. Add this page to your Safari
              bookmarks for one-tap access — it will still work fully as a web app.
            </p>
          ) : (
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Share className="h-4 w-4" />
                </span>
                <span>Tap the <strong>Share</strong> button in Safari's toolbar.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" />
                </span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Smartphone className="h-4 w-4" />
                </span>
                <span>Tap <strong>Add</strong> — Pension Navigator will work like a native app.</span>
              </li>
            </ol>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={dismiss}>Not now</Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>Got it</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
