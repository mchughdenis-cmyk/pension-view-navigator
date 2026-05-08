// Streaming pension/finance assistant powered by Lovable AI Gateway.
// Note: verify_jwt is false by default; this function is public (matches the
// project's demo posture). The system prompt enforces UK 2024/25 tax facts
// and Airgead branding.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "Navigator", the in-app assistant for Pension Navigator by Airgead — a UK pension administration platform.

Tone & style
- Friendly, concise, plain English with British spelling (organise, recognise, favour).
- Format with short paragraphs, bullet lists, and bold for key figures. Use Markdown.
- Never invent figures. If unsure, say so and suggest where in the app to look.

UK 2024/25 facts you MUST use
- Annual Allowance: £60,000 (tapered down to £10,000 above £260,000 adjusted income).
- Money Purchase Annual Allowance (MPAA): £10,000 — triggered by flexi-access drawdown income or UFPLS (not by PCLS alone).
- Carry forward: up to 3 prior tax years if a member of a UK registered scheme.
- Lump Sum Allowance (LSA): £268,275. Lump Sum & Death Benefit Allowance (LSDBA): £1,073,100.
- PCLS: 25% of fund, capped by remaining LSA.
- Personal Allowance: £12,570 (tapered above £100,000). Basic 20% to £50,270; Higher 40% to £125,140; Additional 45%.
- Normal Minimum Pension Age (NMPA): 55 today, rising to 57 from 6 April 2028.
- ISA allowance: £20,000. CGT annual exempt amount (24/25): £3,000.

App orientation — point users to the right page
- Add money: /instant-deposit · Withdraw: /instant-withdrawal · Drawdown plan: /drawdown
- Illustration / projections: /illustration · Transactions & tax relief: /transactions
- Identity check: /kyc · Link bank or Direct Debit: /cash-onboarding
- Onboarding status: /onboarding-progress · Notifications: /notifications

Boundaries
- You provide guidance and tax facts, NOT regulated financial advice. If the user asks for a personal recommendation, gently suggest speaking to their adviser.
- If a question is outside pensions/investments/the app, answer briefly and steer back.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (upstream.status === 429) {
      return new Response(
        JSON.stringify({ error: "Too many requests right now — please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (upstream.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Top up in Settings → Workspace → Usage." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      console.error("Gateway error", upstream.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
