// Monte Carlo retirement projection — 1000 paths, 30y horizon
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function gaussian() {
  // Box-Muller
  const u = Math.random() || 1e-10
  const v = Math.random() || 1e-10
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { initial = 100000, annual_contribution = 0, annual_withdrawal = 0, years = 30, mean_return = 0.055, volatility = 0.12, simulations = 1000 } = await req.json()

    const finalValues: number[] = []
    const percentilePaths: { p10: number[]; p50: number[]; p90: number[] } = { p10: [], p50: [], p90: [] }
    const allPaths: number[][] = []

    for (let s = 0; s < simulations; s++) {
      const path: number[] = [initial]
      let v = initial
      for (let y = 1; y <= years; y++) {
        const r = mean_return + volatility * gaussian()
        v = v * (1 + r) + annual_contribution - annual_withdrawal
        if (v < 0) v = 0
        path.push(v)
      }
      allPaths.push(path)
      finalValues.push(v)
    }

    // Compute percentile paths
    for (let y = 0; y <= years; y++) {
      const yearVals = allPaths.map(p => p[y]).sort((a, b) => a - b)
      percentilePaths.p10.push(yearVals[Math.floor(simulations * 0.1)])
      percentilePaths.p50.push(yearVals[Math.floor(simulations * 0.5)])
      percentilePaths.p90.push(yearVals[Math.floor(simulations * 0.9)])
    }

    finalValues.sort((a, b) => a - b)
    const successRate = annual_withdrawal > 0
      ? finalValues.filter(v => v > 0).length / simulations
      : 1

    return new Response(JSON.stringify({
      simulations,
      years,
      success_rate: successRate,
      final_p10: finalValues[Math.floor(simulations * 0.1)],
      final_p50: finalValues[Math.floor(simulations * 0.5)],
      final_p90: finalValues[Math.floor(simulations * 0.9)],
      paths: percentilePaths,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
