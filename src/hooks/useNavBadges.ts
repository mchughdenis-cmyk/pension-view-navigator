import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NavBadges {
  approvals: number;
  cashBreaks: number;
  slaBreaching: number;
  memberQueries: number;
  contribOverdue: number;
  cases: number;
  unallocated: number;
}

const ZERO: NavBadges = {
  approvals: 0, cashBreaks: 0, slaBreaching: 0, memberQueries: 0,
  contribOverdue: 0, cases: 0, unallocated: 0,
};

/**
 * Live counts for badges shown next to nav items.
 * Fails silently — a missing table just returns 0 for that badge.
 */
export function useNavBadges(refreshMs = 60_000): NavBadges {
  const [badges, setBadges] = useState<NavBadges>(ZERO);

  useEffect(() => {
    let cancelled = false;
    const count = async (table: string, filter?: (q: any) => any) => {
      try {
        let q = (supabase as any).from(table).select("*", { count: "exact", head: true });
        if (filter) q = filter(q);
        const { count: c } = await q;
        return c ?? 0;
      } catch { return 0; }
    };
    const load = async () => {
      const [cases, contribOverdue, unallocated, queries, cashBreaks] = await Promise.all([
        count("ops_cases", (q) => q.in("status", ["open", "in_progress", "awaiting"])),
        count("contributions", (q) => q.eq("status", "overdue")),
        count("bank_file_entries", (q) => q.in("status", ["unallocated", "suspense"])),
        count("member_queries", (q) => q.in("status", ["open", "in_progress"])),
        count("cass_breaks", (q) => q.eq("status", "open")),
      ]);
      if (cancelled) return;
      setBadges({
        approvals: 0,
        cashBreaks,
        slaBreaching: 0,
        memberQueries: queries,
        contribOverdue,
        cases,
        unallocated,
      });
    };
    load();
    const t = setInterval(load, refreshMs);
    return () => { cancelled = true; clearInterval(t); };
  }, [refreshMs]);

  return badges;
}

/** Map a nav URL to its badge value, or undefined if none. */
export function badgeForUrl(url: string, b: NavBadges): number | undefined {
  switch (url) {
    case "/admin?tab=approvals": return b.approvals || undefined;
    case "/admin/console": return (b.cases + b.cashBreaks + b.contribOverdue) || undefined;
    case "/cases": return b.cases || undefined;
    case "/cass":
    case "/cass-engine": return b.cashBreaks || undefined;
    case "/unallocated-cash": return b.unallocated || undefined;
    case "/member-queries": return b.memberQueries || undefined;
    case "/contribution-chaser": return b.contribOverdue || undefined;
    case "/sla-tracker": return b.slaBreaching || undefined;
    default: return undefined;
  }
}
