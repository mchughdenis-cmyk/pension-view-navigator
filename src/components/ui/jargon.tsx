import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { JARGON } from "@/data/jargon";

/**
 * Inline tooltip for pension jargon. Renders a teal dotted underline.
 * Usage: <Jargon term="MPAA" /> or <Jargon term="PCLS">tax-free cash</Jargon>
 */
export function Jargon({ term, children }: { term: string; children?: React.ReactNode }) {
  const def = JARGON[term];
  if (!def) return <>{children ?? term}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="cursor-help underline decoration-dotted decoration-primary underline-offset-4"
          data-jargon={term}
        >
          {children ?? term}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm leading-snug">
        <p className="font-semibold mb-1">{term}</p>
        <p className="text-muted-foreground">{def}</p>
      </TooltipContent>
    </Tooltip>
  );
}
