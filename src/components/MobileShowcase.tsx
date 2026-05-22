// Showcase route gathering PWA.3 + PWA.5 mobile components in one place
import MobileGlanceHero from "./mobile/MobileGlanceHero";
import MobileQuickActions from "./mobile/MobileQuickActions";
import MobileFanChart from "./charts/MobileFanChart";
import PullToRefresh from "./pwa/PullToRefresh";
import { toast } from "sonner";

export default function MobileShowcase() {
  return (
    <PullToRefresh onRefresh={async () => { await new Promise((r) => setTimeout(r, 600)); toast.success("Dashboard refreshed"); }}>
      <div className="container mx-auto p-4 space-y-4 max-w-md md:max-w-none">
        <h1 className="text-xl font-bold md:hidden">Glance mode</h1>
        <h1 className="hidden md:block text-2xl font-bold">Mobile components preview</h1>
        <p className="text-xs text-muted-foreground md:hidden">Pull down to refresh · Swipe quick-action chips</p>
        <MobileGlanceHero />
        <MobileQuickActions />
        <MobileFanChart />
      </div>
    </PullToRefresh>
  );
}
