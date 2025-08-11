import { useRole } from '@/contexts/RoleContext'
import ClientView from './ClientView'
import AdviserView from './AdviserView'
import AdminView from './AdminView'

export default function ClientProductsDashboard() {
  const { user } = useRole()

  if (!user) {
    return <div>Loading...</div>
  }

  switch (user.role) {
    case 'client':
      return <ClientView />
    case 'adviser':
      return <AdviserView />
    case 'admin':
      return <AdminView />
    default:
      return <ClientView />
  }
}