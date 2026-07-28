import { Button } from "@/components/ui/button";
import { Rows2, Rows3 } from "lucide-react";
import { useDensity } from "@/hooks/useDensity";

export function DensityToggle() {
  const { density, toggle } = useDensity();
  const compact = density === "compact";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      title={compact ? "Comfortable rows" : "Compact rows"}
      aria-label="Toggle density"
      className="h-8 w-8"
    >
      {compact ? <Rows2 className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
    </Button>
  );
}
