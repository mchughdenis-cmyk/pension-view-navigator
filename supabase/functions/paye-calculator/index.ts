// UK PAYE calculator for pension UFPLS / FAD payments — 2024/25 emergency code (Month 1)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 2024/25 emergency Month 1 thresholds (annualised then ÷12)
const PA = 12570 / 12;
const BASIC_TOP = 37700 / 12;
const HIGHER_TOP = (125140 - 12570) / 12;

function emergencyM1(taxable: number) {
  let remaining = Math.max(0, taxable - PA);
  let tax = 0;
  const basic = Math.min(remaining, BASIC_TOP); tax += basic * 0.20; remaining -= basic;
  const higher = Math.min(remaining, HIGHER_TOP - BASIC_TOP); tax += higher * 0.40; remaining -= higher;
  tax += remaining * 0.45;
  return Math.round(tax * 100) / 100;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    // Staff-only auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const list = (roles ?? []).map(r => r.role as string);
    if (!list.includes("admin") && !list.includes("adviser")) {
      return new Response(JSON.stringify({ error: "Forbidden: admin or adviser role required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { client_id, payment_type = "UFPLS", gross_amount, tax_code = "1257L M1", emergency = true } = await req.json();
    if (!client_id || !gross_amount || gross_amount <= 0)
      return new Response(JSON.stringify({ error: "client_id and gross_amount required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const tax_free = payment_type === "UFPLS" ? gross_amount * 0.25 : 0;
    const taxable = gross_amount - tax_free;
    const tax = emergency ? emergencyM1(taxable) : 0;
    const net = gross_amount - tax;

    const { data, error } = await supabase.from("paye_calculations").insert({
      client_id, payment_type, gross_amount, tax_free_amount: tax_free,
      taxable_amount: taxable, tax_code, emergency_basis: emergency,
      income_tax: tax, net_amount: net,
    }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, calc: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
