import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useRole } from '@/contexts/RoleContext'
import { formatGBP } from '@/lib/pensionCalculations'
import {
  Home, Wallet, ArrowDownToLine, ArrowUpFromLine, User, Bell, ChevronRight,
  TrendingUp, PiggyBank, Banknote, ScrollText, Settings, LogOut, Shield, Sparkles,
  CreditCard, CalendarClock, Plus, ArrowLeft,
} from 'lucide-react'

type Tab = 'home' | 'accounts' | 'money' | 'profile'

export default function MobileClientApp() {
  const navigate = useNavigate()
  const { user } = useRole()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('home')

  // Mock client snapshot
  const portfolio = {
    sipp: 287_450,
    isa: 87_650,
    gia: 145_200,
    monthlyDrawdown: 2_850,
    regularContribution: 500,
    nextPayment: '1 Feb 2026',
    ytdGrowth: 0.064,
  }
  const total = portfolio.sipp + portfolio.isa + portfolio.gia

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen relative pb-20">
        {/* Top bar */}
        <header className="sticky top-0 z-20 backdrop-blur bg-background/80 border-b">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold">Pension Navigator</div>
            <button onClick={() => navigate('/notifications')} className="p-2 -mr-2 rounded-full hover:bg-muted relative" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-4 space-y-4">
          {tab === 'home' && <HomeView user={user} portfolio={portfolio} total={total} onNav={setTab} />}
          {tab === 'accounts' && <AccountsView portfolio={portfolio} />}
          {tab === 'money' && <MoneyView toast={toast} />}
          {tab === 'profile' && <ProfileView user={user} navigate={navigate} />}
        </main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background border-t z-30">
          <div className="grid grid-cols-4">
            <TabButton active={tab === 'home'} onClick={() => setTab('home')} icon={Home} label="Home" />
            <TabButton active={tab === 'accounts'} onClick={() => setTab('accounts')} icon={Wallet} label="Accounts" />
            <TabButton active={tab === 'money'} onClick={() => setTab('money')} icon={ArrowDownToLine} label="Money" />
            <TabButton active={tab === 'profile'} onClick={() => setTab('profile')} icon={User} label="Profile" />
          </div>
        </nav>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
        active ? 'text-primary' : 'text-muted-foreground'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}

function HomeView({ user, portfolio, total, onNav }: any) {
  return (
    <>
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted-foreground">Hello,</p>
        <h1 className="text-xl font-bold">{user?.name ?? 'there'} 👋</h1>
      </div>

      {/* Hero balance */}
      <Card className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground border-none shadow-lg">
        <CardContent className="p-5">
          <p className="text-xs opacity-80">Total wealth</p>
          <div className="text-3xl font-bold mt-1">{formatGBP(total)}</div>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{(portfolio.ytdGrowth * 100).toFixed(1)}% YTD</span>
          </div>
          <Separator className="my-4 bg-primary-foreground/20" />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <MiniStat label="SIPP" value={portfolio.sipp} />
            <MiniStat label="ISA" value={portfolio.isa} />
            <MiniStat label="GIA" value={portfolio.gia} />
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2">
        <ContributeSheet />
        <DrawdownSheet />
        <PaymentsSheet />
        <QuickAction icon={Sparkles} label="Ask AI" onClick={() => onNav('profile')} href="/assistant" />
      </div>

      {/* Activity preview */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Recent activity</h3>
            <button className="text-xs text-primary">See all</button>
          </div>
          <ActivityRow icon={ArrowDownToLine} title="Contribution received" sub="Today · SIPP" amount="+£500.00" positive />
          <ActivityRow icon={ArrowUpFromLine} title="Drawdown payment" sub={`Next: ${portfolio.nextPayment}`} amount={`-£${portfolio.monthlyDrawdown.toLocaleString()}`} />
          <ActivityRow icon={TrendingUp} title="Portfolio rebalanced" sub="3 days ago" amount="—" />
        </CardContent>
      </Card>

      {/* Status card */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-success/10">
            <Shield className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">KYC verified</p>
            <p className="text-xs text-muted-foreground">All checks complete</p>
          </div>
          <Badge variant="secondary">Active</Badge>
        </CardContent>
      </Card>
    </>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="opacity-70">{label}</p>
      <p className="font-semibold text-sm">{formatGBP(value)}</p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void; href?: string }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={onClick ?? (() => navigate('/assistant'))}
      className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border hover:bg-muted active:scale-95 transition-all"
    >
      <div className="p-2 rounded-full bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  )
}

function ActivityRow({ icon: Icon, title, sub, amount, positive }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-muted">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <span className={`text-sm font-semibold ${positive ? 'text-success' : ''}`}>{amount}</span>
    </div>
  )
}

function AccountsView({ portfolio }: any) {
  const accounts = [
    { id: 'sipp', name: 'SIPP', value: portfolio.sipp, icon: PiggyBank, sub: 'Self-Invested Personal Pension' },
    { id: 'isa', name: 'Stocks & Shares ISA', value: portfolio.isa, icon: Shield, sub: '£12,650 of £20k allowance used' },
    { id: 'gia', name: 'General Investment', value: portfolio.gia, icon: Wallet, sub: 'Taxable account' },
  ]
  return (
    <>
      <h2 className="text-lg font-bold">Your accounts</h2>
      <div className="space-y-3">
        {accounts.map((a) => {
          const Icon = a.icon
          return (
            <Card key={a.id} className="hover:bg-muted/50 cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.sub}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatGBP(a.value)}</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}

function MoneyView({ toast }: any) {
  return (
    <>
      <h2 className="text-lg font-bold">Money</h2>
      <div className="space-y-2">
        <ContributeSheet large />
        <DrawdownSheet large />
        <PaymentsSheet large />
      </div>
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2">Scheduled</h3>
          <div className="flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1 text-sm">
              <p>Monthly drawdown</p>
              <p className="text-xs text-muted-foreground">Next: 1 Feb 2026 · £2,850</p>
            </div>
            <Badge>Active</Badge>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function ProfileView({ user, navigate }: any) {
  const items = [
    { icon: User, label: 'Personal details', route: '/onboarding' },
    { icon: ScrollText, label: 'Documents', route: '/documents' },
    { icon: Bell, label: 'Notifications', route: '/notifications' },
    { icon: Sparkles, label: 'Ask Navigator (AI)', route: '/assistant' },
    { icon: Settings, label: 'Settings', route: '/settings' },
  ]
  return (
    <>
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {(user?.name ?? 'U').charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <button
              key={it.label}
              onClick={() => navigate(it.route)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted active:scale-[0.99] transition"
            >
              <div className="p-2 rounded-lg bg-muted"><Icon className="w-4 h-4" /></div>
              <span className="text-sm font-medium flex-1 text-left">{it.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )
        })}
        <button
          onClick={() => (window.location.href = '/')}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-destructive"
        >
          <div className="p-2 rounded-lg bg-destructive/10"><LogOut className="w-4 h-4" /></div>
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </>
  )
}

/* ---------- Action sheets ---------- */

function ContributeSheet({ large }: { large?: boolean }) {
  const { toast } = useToast()
  const [amount, setAmount] = useState(500)
  const [account, setAccount] = useState<'sipp' | 'isa'>('sipp')
  return (
    <Sheet>
      <SheetTrigger asChild>
        {large ? <ActionRow icon={Plus} label="Add a contribution" sub="One-off into SIPP or ISA" /> : <QuickAction icon={Plus} label="Contribute" />}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add a contribution</SheetTitle>
          <SheetDescription>Choose your account and amount</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['sipp', 'isa'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setAccount(k)}
                className={`p-3 rounded-xl border text-sm font-medium ${account === k ? 'border-primary bg-primary/10 text-primary' : 'bg-card'}`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
          <div>
            <Label className="text-xs">Amount</Label>
            <div className="text-3xl font-bold text-center my-3">{formatGBP(amount)}</div>
            <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={50} max={10000} step={50} />
            <div className="flex gap-2 mt-3">
              {[100, 500, 1000, 5000].map((v) => (
                <button key={v} onClick={() => setAmount(v)} className="flex-1 py-1.5 rounded-lg border text-xs hover:bg-muted">£{v}</button>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter>
          <Button
            className="w-full"
            onClick={() =>
              toast({ title: 'Contribution scheduled', description: `${formatGBP(amount)} into your ${account.toUpperCase()}` })
            }
          >
            Confirm {formatGBP(amount)}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function DrawdownSheet({ large }: { large?: boolean }) {
  const { toast } = useToast()
  const [monthly, setMonthly] = useState(2850)
  return (
    <Sheet>
      <SheetTrigger asChild>
        {large ? <ActionRow icon={Banknote} label="Start or adjust drawdown" sub="Take regular income from your SIPP" /> : <QuickAction icon={Banknote} label="Drawdown" />}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Drawdown income</SheetTitle>
          <SheetDescription>Set your monthly income from your SIPP</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground text-center">Monthly income</p>
            <div className="text-3xl font-bold text-center my-2">{formatGBP(monthly)}</div>
            <Slider value={[monthly]} onValueChange={([v]) => setMonthly(v)} min={0} max={6000} step={50} />
          </div>
          <Card className="bg-muted border-none">
            <CardContent className="p-3 text-xs space-y-1">
              <div className="flex justify-between"><span>Annualised</span><strong>{formatGBP(monthly * 12)}</strong></div>
              <div className="flex justify-between"><span>Est. tax (basic rate)</span><strong>{formatGBP(monthly * 12 * 0.2 * 0.75)}</strong></div>
              <div className="flex justify-between"><span>Tax-free portion</span><strong>25%</strong></div>
            </CardContent>
          </Card>
        </div>
        <SheetFooter>
          <Button className="w-full" onClick={() => toast({ title: 'Drawdown updated', description: `New monthly income: ${formatGBP(monthly)}` })}>
            Confirm changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function PaymentsSheet({ large }: { large?: boolean }) {
  const { toast } = useToast()
  const [regular, setRegular] = useState(500)
  const [day, setDay] = useState(1)
  return (
    <Sheet>
      <SheetTrigger asChild>
        {large ? <ActionRow icon={CreditCard} label="Adjust regular payments" sub="Direct Debit & standing orders" /> : <QuickAction icon={CreditCard} label="Payments" />}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Regular payments</SheetTitle>
          <SheetDescription>Adjust your monthly contribution</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label className="text-xs">Monthly amount</Label>
            <Input type="number" value={regular} onChange={(e) => setRegular(Number(e.target.value) || 0)} className="text-lg h-12 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Collection day</Label>
            <Input type="number" min={1} max={28} value={day} onChange={(e) => setDay(Math.min(28, Math.max(1, Number(e.target.value) || 1)))} className="h-12 mt-1" />
          </div>
        </div>
        <SheetFooter>
          <Button className="w-full" onClick={() => toast({ title: 'Payments updated', description: `${formatGBP(regular)} on day ${day} each month` })}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

const ActionRow = ({ icon: Icon, label, sub, ...rest }: any) => (
  <button
    {...rest}
    className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border hover:bg-muted active:scale-[0.99] transition text-left"
  >
    <div className="p-2.5 rounded-xl bg-primary/10">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs text-muted-foreground truncate">{sub}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
)
