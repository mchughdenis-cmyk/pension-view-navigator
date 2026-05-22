// MP.5 — Admin product analytics dashboard
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, PieChart, Pie, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

const FUNNEL = Array.from({ length: 14 }, (_, i) => ({ step: i + 1, pct: Math.max(40, 100 - i * 4 - (i > 9 ? 8 : 0)) }));
const FEATURES = [
  { f: "Projections viewed", d7: 1842, d30: 6920 },
  { f: "Scenarios saved", d7: 412, d30: 1850 },
  { f: "AI assistant opened", d7: 1234, d30: 5230 },
  { f: "Passport downloaded", d7: 287, d30: 1102 },
  { f: "Transfer wizard started", d7: 198, d30: 740 },
  { f: "Life event recorded", d7: 156, d30: 612 },
  { f: "Tax module opened", d7: 489, d30: 1956 },
  { f: "Employer match claimed", d7: 102, d30: 387 },
].sort((a, b) => b.d30 - a.d30);
const PERSONAS = [
  { name: "Sarah (early career)", v: 412 },
  { name: "James (mid career)", v: 387 },
  { name: "Maria (pre-retiree)", v: 521 },
  { name: "David (retired)", v: 298 },
  { name: "Priya (HNW)", v: 176 },
  { name: "Tom (self-employed)", v: 245 },
];
const PORTAL = [
  { name: "Consumer", value: 6240, color: "hsl(var(--primary))" },
  { name: "Adviser", value: 1820, color: "#4338CA" },
  { name: "Employer", value: 720, color: "#D97706" },
  { name: "Admin", value: 142, color: "#DC2626" },
];
const WAU = Array.from({ length: 12 }, (_, i) => ({
  wk: `W${i + 1}`,
  client: 1200 + i * 80 + Math.round(Math.sin(i) * 60),
  adviser: 220 + i * 12,
  employer: 80 + i * 5,
}));

const colour = (pct: number) => pct >= 80 ? "hsl(var(--primary))" : pct >= 60 ? "#D97706" : "#DC2626";

export default function AdminProductAnalytics() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" /> Product analytics
        </h1>
        <p className="text-sm text-muted-foreground">Onboarding funnel, feature engagement, and portal usage.</p>
      </header>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
        {[
          { l: "Registered users", v: "12,481" },
          { l: "Active this week", v: "3,920" },
          { l: "Onboarding completion", v: "72%" },
          { l: "AI sessions / wk", v: "1,234" },
          { l: "Average health score", v: "74" },
          { l: "Median monthly contrib", v: "£345" },
        ].map((k) => (
          <Card key={k.l}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{k.l}</div><div className="text-xl font-bold">{k.v}</div></CardContent></Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Onboarding funnel (14 steps)</CardTitle></CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer><BarChart data={FUNNEL}>
              <XAxis dataKey="step" fontSize={11} /><YAxis unit="%" fontSize={11} /><Tooltip />
              <Bar dataKey="pct">
                {FUNNEL.map((d, i) => <Cell key={i} fill={colour(d.pct)} />)}
              </Bar>
            </BarChart></ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Portal engagement</CardTitle></CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer><PieChart>
              <Pie data={PORTAL} dataKey="value" nameKey="name" outerRadius={90} label>
                {PORTAL.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Pie>
              <Tooltip />
            </PieChart></ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Weekly active users (last 12 weeks)</CardTitle></CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer><LineChart data={WAU}>
              <XAxis dataKey="wk" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
              <Line dataKey="client" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line dataKey="adviser" stroke="#4338CA" strokeWidth={2} />
              <Line dataKey="employer" stroke="#D97706" strokeWidth={2} />
            </LineChart></ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Feature engagement</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted-foreground text-left"><th>Feature</th><th>7d</th><th>30d</th></tr></thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.f} className="border-t"><td className="py-2">{f.f}</td><td>{f.d7.toLocaleString()}</td><td className="font-semibold">{f.d30.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Demo persona usage</CardTitle></CardHeader>
          <CardContent style={{ height: 260 }}>
            <ResponsiveContainer><BarChart data={PERSONAS} layout="vertical">
              <XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" fontSize={10} width={120} /><Tooltip />
              <Bar dataKey="v" fill="hsl(var(--primary))" />
            </BarChart></ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
