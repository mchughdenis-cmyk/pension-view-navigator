import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Firm = {
  id: string;
  name: string;
  fca_ref: string | null;
  status: string | null;
};

type Ctx = {
  firms: Firm[];
  firmId: string | null;
  firm: Firm | null;
  setFirmId: (id: string) => void;
  loading: boolean;
};

const FirmCtx = createContext<Ctx>({
  firms: [], firmId: null, firm: null, setFirmId: () => {}, loading: true,
});

const STORAGE_KEY = "pn.activeFirmId";

export function FirmProvider({ children }: { children: ReactNode }) {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [firmId, setFirmIdState] = useState<string | null>(null);
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

  const setFirmId = (id: string) => {
    setFirmIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const firm = firms.find(f => f.id === firmId) ?? null;
  return <FirmCtx.Provider value={{ firms, firmId, firm, setFirmId, loading }}>{children}</FirmCtx.Provider>;
}

export const useFirm = () => useContext(FirmCtx);
