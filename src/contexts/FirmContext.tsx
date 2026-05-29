import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setActiveDocumentBrand } from "@/lib/documentUtils";

export type Firm = {
  id: string;
  name: string;
  fca_ref: string | null;
  status: string | null;
};

export type FirmBranding = {
  firm_id: string;
  logo_url: string | null;
  primary_color: string | null;   // hex e.g. #3B82F6
  accent_color: string | null;
  custom_domain: string | null;
};

type Ctx = {
  firms: Firm[];
  firmId: string | null;
  firm: Firm | null;
  branding: FirmBranding | null;
  setFirmId: (id: string) => void;
  refreshBranding: () => Promise<void>;
  loading: boolean;
};

const FirmCtx = createContext<Ctx>({
  firms: [], firmId: null, firm: null, branding: null,
  setFirmId: () => {}, refreshBranding: async () => {}, loading: true,
});

const STORAGE_KEY = "pn.activeFirmId";

// hex (#RRGGBB) → "h s% l%" string for Tailwind HSL tokens
function hexToHslString(hex: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  let r = parseInt(m[1], 16) / 255, g = parseInt(m[2], 16) / 255, b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyBranding(b: FirmBranding | null) {
  const root = document.documentElement;
  if (!b?.primary_color) root.style.removeProperty("--primary");
  else {
    const hsl = hexToHslString(b.primary_color);
    if (hsl) root.style.setProperty("--primary", hsl);
  }
  if (!b?.accent_color) root.style.removeProperty("--accent");
  else {
    const hsl = hexToHslString(b.accent_color);
    if (hsl) root.style.setProperty("--accent", hsl);
  }
}

export function FirmProvider({ children }: { children: ReactNode }) {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [firmId, setFirmIdState] = useState<string | null>(null);
  const [branding, setBranding] = useState<FirmBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("firms")
        .select("id, name, fca_ref, status")
        .order("name");
      const list = (data ?? []) as Firm[];
      setFirms(list);
      const saved = localStorage.getItem(STORAGE_KEY);
      const initial = saved && list.find(f => f.id === saved) ? saved : list[0]?.id ?? null;
      setFirmIdState(initial);
      setLoading(false);
    })();
  }, []);

  const fetchBranding = useCallback(async (id: string | null) => {
    if (!id) { setBranding(null); applyBranding(null); return; }
    const { data } = await supabase
      .from("firm_branding")
      .select("firm_id, logo_url, primary_color, accent_color, custom_domain")
      .eq("firm_id", id).maybeSingle();
    const b = (data ?? null) as FirmBranding | null;
    setBranding(b);
    applyBranding(b);
  }, []);

  useEffect(() => { fetchBranding(firmId); }, [firmId, fetchBranding]);

  const setFirmId = (id: string) => {
    setFirmIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const refreshBranding = useCallback(() => fetchBranding(firmId), [fetchBranding, firmId]);

  const firm = firms.find(f => f.id === firmId) ?? null;
  return (
    <FirmCtx.Provider value={{ firms, firmId, firm, branding, setFirmId, refreshBranding, loading }}>
      {children}
    </FirmCtx.Provider>
  );
}

export const useFirm = () => useContext(FirmCtx);
