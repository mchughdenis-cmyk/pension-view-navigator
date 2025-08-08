import PensionDashboard from "@/components/PensionDashboard";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExternalLink, Menu, TrendingDown } from "lucide-react";

const Index = () => {
  return (
    <div>
      {/* Desktop Navigation */}
      <div className="hidden md:flex fixed top-4 right-4 z-50 gap-2">
        <Button variant="outline" asChild>
          <a href="/drip-feed">
            <TrendingDown className="w-4 h-4 mr-2" />
            Drip Feed Drawdown
          </a>
        </Button>
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

      {/* Mobile Navigation Dropdown */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-background border shadow-lg z-50"
          >
            <DropdownMenuItem asChild>
              <a href="/drip-feed" className="flex items-center w-full">
                <TrendingDown className="w-4 h-4 mr-2" />
                Drip Feed Drawdown
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/pitch" className="flex items-center w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                System Pitch
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/admin" className="flex items-center w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Admin Portal
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PensionDashboard />
    </div>
  );
};

export default Index;
