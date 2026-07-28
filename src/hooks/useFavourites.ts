import { useCallback, useEffect, useState } from "react";

const FAV_KEY = "nav:favourites:v1";
const RECENT_KEY = "nav:recents:v1";
const MAX_RECENTS = 8;

function read(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

export function useFavourites() {
  const [favs, setFavs] = useState<string[]>(() => read(FAV_KEY));

  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === FAV_KEY) setFavs(read(FAV_KEY)); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((url: string) => {
    setFavs((prev) => {
      const next = prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFav = useCallback((url: string) => favs.includes(url), [favs]);

  return { favs, toggle, isFav };
}

export function useRecents() {
  const [recents, setRecents] = useState<string[]>(() => read(RECENT_KEY));

  const push = useCallback((url: string) => {
    setRecents((prev) => {
      const next = [url, ...prev.filter((u) => u !== url)].slice(0, MAX_RECENTS);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recents, push };
}
