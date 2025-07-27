import PensionDashboard from "@/components/PensionDashboard";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const Index = () => {
  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button variant="outline" asChild>
          <a href="/pitch">
            <ExternalLink className="w-4 h-4 mr-2" />
            System Pitch
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/admin">
            <ExternalLink className="w-4 h-4 mr-2" />
            Admin Portal
          </a>
        </Button>
      </div>
      <PensionDashboard />
    </div>
  );
};

export default Index;
