import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useRole, Role } from '@/contexts/RoleContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface RoleGateProps {
  allow: Role[]
  children: ReactNode
  /** Where to send a blocked user. Defaults to a friendly denied screen. */
  redirectTo?: string
}

export function RoleGate({ allow, children, redirectTo }: RoleGateProps) {
  const { role } = useRole()
  const navigate = useNavigate()

  if (allow.includes(role)) return <>{children}</>
  if (redirectTo) return <Navigate to={redirectTo} replace />

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access restricted</CardTitle>
          <CardDescription>
            This area is for {allow.join(' / ')} users. You are signed in as <strong>{role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={() => navigate(role === 'client' ? '/client-services' : '/dashboard')}>
            Go to my home
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Switch roles via the role badge in the top-right (demo mode).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
