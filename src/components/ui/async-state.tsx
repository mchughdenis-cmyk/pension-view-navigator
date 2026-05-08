import { ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/* ---------------- useAsync hook ---------------- */

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Run an async fetcher with consistent loading/error handling.
 * Toasts on error and exposes a reload() for retry buttons.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: any[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    run()
      .then((res) => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch((e: any) => {
        if (cancelled) return;
        const msg = e?.message ?? "Something went wrong";
        setError(msg);
        setLoading(false);
        toast.error(msg);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}

/* ---------------- AsyncState wrapper ---------------- */

interface AsyncStateProps {
  loading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  rows?: number;
  children: ReactNode;
}

export function AsyncState({
  loading, error, isEmpty, onRetry,
  loadingLabel = "Loading…",
  emptyTitle = "Nothing here yet",
  emptyDescription = "Once data is added it will appear here.",
  emptyAction,
  rows = 3,
  children,
}: AsyncStateProps) {
  if (loading) {
    return (
      <div className="space-y-3 py-4" role="status" aria-live="polite">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingLabel}</span>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
        <AlertCircle className="h-6 w-6 text-destructive mx-auto" />
        <div>
          <p className="font-medium text-sm">Couldn't load this</p>
          <p className="text-xs text-muted-foreground mt-1 break-words">{error}</p>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-2" /> Retry
          </Button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center space-y-3">
        <Inbox className="h-8 w-8 text-muted-foreground mx-auto" />
        <div>
          <p className="font-medium text-sm">{emptyTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">{emptyDescription}</p>
        </div>
        {emptyAction}
      </div>
    );
  }

  return <>{children}</>;
}

/* ---------------- Submit helper ---------------- */

/** Wraps a write/mutation call with toast + try/catch. Returns success boolean. */
export async function runWithToast<T>(
  action: () => Promise<T>,
  opts: { success: string; error?: string } = { success: "Done" },
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const data = await action();
    toast.success(opts.success);
    return { ok: true, data };
  } catch (e: any) {
    const msg = e?.message ?? opts.error ?? "Something went wrong";
    toast.error(msg);
    return { ok: false, error: msg };
  }
}
