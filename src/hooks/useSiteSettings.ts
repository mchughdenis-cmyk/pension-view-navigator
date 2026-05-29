import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSetting<T = unknown>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (data && data.value !== null && data.value !== undefined) {
      setValue(data.value as T);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`site_settings:${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: `key=eq.${key}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { value, loading, reload: load };
}

export async function setSiteSetting(key: string, value: unknown, userId?: string) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: value as any, updated_at: new Date().toISOString(), updated_by: userId ?? null });
  if (error) throw error;
}

export function useMarketingSiteEnabled() {
  const { value, loading } = useSiteSetting<boolean>("marketing_site_enabled", true);
  return { enabled: value !== false, loading };
}
