import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, TrendingUp } from 'lucide-react'

/**
 * Independent market grading by Claude (Anthropic), May 2026.
 * Categories and scores reproduced verbatim from the Airgead Market Assessment.
 */
const CATEGORIES: { label: string; score: number; grade: string }[] = [
  { label: 'Onboarding & user journey', score: 9.5, grade: 'A+' },
  { label: 'Dashboard & portfolio UX', score: 9.5, grade: 'A+' },
  { label: 'Projections & planning tools', score: 9.5, grade: 'A+' },
  { label: 'AI & intelligence layer', score: 9.5, grade: 'A+' },
  { label: 'Design quality & polish', score: 9.5, grade: 'A+' },
  { label: 'Tax & compliance features', score: 7.5, grade: 'B+' },
  { label: 'Multi-portal architecture', score: 9.5, grade: 'A+' },
  { label: 'Mobile / PWA experience', score: 9.0, grade: 'A' },
]

const gradeStyle = (g: string) =>
  g.startsWith('A')
    ? 'bg-secondary/15 text-secondary border-secondary/30'
    : 'bg-primary/10 text-primary border-primary/30'

export function MarketScoreboard() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          <Award className="h-3 w-3" /> Independent market assessment
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Graded against every live UK pension platform.
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Independently scored by Claude (Anthropic), May 2026, against PensionBee, Hargreaves Lansdown,
          AJ Bell, Moneyhub, Interactive Investor, Fidelity, Smart Pension, NEST and MoneyHelper.
          Eight categories. Overall grade: <strong className="text-foreground">A+ (market-defining)</strong>.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((c) => (
          <Card key={c.label} className="border-border hover:border-primary/40 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-medium leading-snug">{c.label}</span>
                <Badge variant="outline" className={gradeStyle(c.grade)}>{c.grade}</Badge>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{c.score.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 10</span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${(c.score / 10) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground italic flex items-center gap-2">
        <TrendingUp className="h-3 w-3" /> Assessor: Claude (Anthropic) · May 2026 · Confidential market evaluation.
      </p>
    </section>
  )
}
