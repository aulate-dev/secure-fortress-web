import type { UserRole } from './auth'

export interface ManagedUser {
  id: number
  username: string
  email: string
  role: UserRole
  last_login: string | null
  last_ip: string | null
}

export interface AuditLog {
  id: number
  event_type: string
  user_id: number | null
  details: string
  ip_address: string
  route: string
  created_at: string
}
