import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Trash2 } from "lucide-react";
import { formatSavedAt } from "@/hooks/useDraft";

interface Props {
  show: boolean;
  savedAt: number | null;
  onResume?: () => void;
  onDiscard: () => void;
  label?: string;
}

/** Banner shown at the top of multi-step forms when a saved draft exists. */
export function ResumeBanner({ show, savedAt, onResume, onDiscard, label = "We saved your progress" }: Props) {
  if (!show) return null;
  return (
    <Card className="border-blue-500/30 bg-blue-500/5">
      <CardContent className="pt-4 pb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center">
            <Save className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs text-muted-foreground">
              {formatSavedAt(savedAt)} · pick up exactly where you left off
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onResume && (
            <Button size="sm" onClick={onResume}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />Resume
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDiscard}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />Discard draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface IndicatorProps { savedAt: number | null }
export function SavedIndicator({ savedAt }: IndicatorProps) {
  if (!savedAt) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Save className="w-3 h-3" /> {formatSavedAt(savedAt)}
    </span>
  );
}
