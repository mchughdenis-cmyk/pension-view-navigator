// Generates AI insights using Lovable AI Gateway (free during promo). Writes to ai_insights.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    // Staff-only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: { user } } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", user.id);
    const list = (roles ?? []).map((r: any) => r.role as string);
    if (!list.includes("admin") && !list.includes("adviser")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { scope = "platform" } = await req.json().catch(() => ({}));

    // Pull a tight context: open ops cases, breaches, drift, recent fees
    const [{ data: cases }, { data: breaches }, { data: rebals }] = await Promise.all([
      sb.from("ops_cases").select("case_ref,case_type,priority,status,title").eq("status", "open").limit(20),
      sb.from("cass_breaches").select("breach_type,severity,amount,description,status").eq("status", "open").limit(10),
      sb.from("rebalance_runs").select("status,total_buy_value,total_sell_value,drift_summary").eq("status", "pending").limit(10),
    ]);

    const context = { scope, cases, breaches, rebals };
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a UK pension platform operations analyst. Return JSON array of insights with keys: title, summary, severity (info|warning|critical), insight_type (operations|risk|compliance|opportunity), confidence (0-1). Be concise, British English, regulator-aware." },
          { role: "user", content: `Generate 4-6 actionable insights from this data:\n${JSON.stringify(context).slice(0, 8000)}` },
        ],
      }),
    });
    if (!aiRes.ok) throw new Error(`AI gateway ${aiRes.status}: ${await aiRes.text()}`);
    const ai = await aiRes.json();
    const content: string = ai.choices?.[0]?.message?.content ?? "[]";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const rows = insights.slice(0, 8).map((i: any) => ({
      insight_type: i.insight_type ?? "operations",
      title: String(i.title ?? "Insight").slice(0, 200),
      summary: String(i.summary ?? "").slice(0, 1000),
      severity: ["info", "warning", "critical"].includes(i.severity) ? i.severity : "info",
      confidence: Math.min(1, Math.max(0, Number(i.confidence ?? 0.7))),
      raw: i,
    }));
    if (rows.length) await sb.from("ai_insights").insert(rows);

    return new Response(JSON.stringify({ ok: true, generated: rows.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
