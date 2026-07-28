import { useCallback, useEffect, useState } from "react";

export type SavedView<F = Record<string, unknown>> = {
  id: string;
  name: string;
  filters: F;
  createdAt: string;
};

/**
 * Per-scope saved views (filters/sorts) persisted in localStorage.
 * Usage: const { views, save, remove } = useSavedViews("cases");
 */
export function useSavedViews<F = Record<string, unknown>>(scope: string) {
  const key = `airgead:savedViews:${scope}`;
  const [views, setViews] = useState<SavedView<F>[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setViews(raw ? JSON.parse(raw) : []);
    } catch {
      setViews([]);
    }
  }, [key]);

  const persist = useCallback(
    (next: SavedView<F>[]) => {
      localStorage.setItem(key, JSON.stringify(next));
      setViews(next);
    },
    [key],
  );

  const save = useCallback(
    (name: string, filters: F) => {
      const view: SavedView<F> = {
        id: crypto.randomUUID(),
        name,
        filters,
        createdAt: new Date().toISOString(),
      };
      persist([view, ...views].slice(0, 20));
      return view;
    },
    [persist, views],
  );

  const remove = useCallback(
    (id: string) => persist(views.filter((v) => v.id !== id)),
    [persist, views],
  );

  return { views, save, remove };
}
