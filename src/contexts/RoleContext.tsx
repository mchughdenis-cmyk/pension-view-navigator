import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'client' | 'adviser' | 'admin'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  adviserId?: string // For clients, links to their adviser
}

interface RoleContextType {
  user: User | null
  setUser: (user: User | null) => void
  switchRole: (role: UserRole, userData?: Partial<User>) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Load saved user from localStorage
    const savedUser = localStorage.getItem('current-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      // Default to client role for demo
      const defaultUser: User = {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: 'client',
        adviserId: 'adv-1'
      }
      setUser(defaultUser)
      localStorage.setItem('current-user', JSON.stringify(defaultUser))
    }
  }, [])

  const switchRole = (role: UserRole, userData: Partial<User> = {}) => {
    let newUser: User

    switch (role) {
      case 'client':
        newUser = {
          id: userData.id || '1',
          name: userData.name || 'John Smith',
          email: userData.email || 'john.smith@example.com',
          role: 'client',
          adviserId: userData.adviserId || 'adv-1'
        }
        break
      case 'adviser':
        newUser = {
          id: userData.id || 'adv-1',
          name: userData.name || 'Sarah Johnson',
          email: userData.email || 'sarah.johnson@example.com',
          role: 'adviser'
        }
        break
      case 'admin':
        newUser = {
          id: userData.id || 'admin-1',
          name: userData.name || 'Admin User',
          email: userData.email || 'admin@example.com',
          role: 'admin'
        }
        break
    }

    setUser(newUser)
    localStorage.setItem('current-user', JSON.stringify(newUser))
  }

  return (
    <RoleContext.Provider value={{ user, setUser, switchRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}