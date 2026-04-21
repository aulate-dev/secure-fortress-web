export type UserRole = 'SuperAdmin' | 'Auditor' | 'Registrador'

export interface AuthUser {
  id: number
  username: string
  email: string
  role: UserRole
}
