import { useEffect, useState } from 'react'
import {
  StandardTable,
  StandardTableBody,
  StandardTableCell,
  StandardTableHead,
  StandardTableHeaderCell,
} from '../components/ui/StandardTable'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { extractApiErrorMessage } from '../lib/http-error'
import type { ManagedUser } from '../types/admin'

const formatLastLogin = (value: string | null): string => {
  if (!value) {
    return 'Sin registro'
  }
  return new Date(value).toLocaleString('es-MX')
}

export const UsersPage = () => {
  const { showToast } = useToast()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get<{ users: ManagedUser[] }>('/admin/users')
        setUsers(data.users)
      } catch (error) {
        showToast(extractApiErrorMessage(error), 'error')
      } finally {
        setIsLoading(false)
      }
    }
    void fetchUsers()
  }, [showToast])

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Gestion de usuarios</h2>
        <p className="text-sm text-slate-600">Usuarios registrados con su rol y ultimo acceso.</p>
      </div>

      <StandardTable caption="Usuarios y roles del sistema">
        <StandardTableHead>
          <tr>
            <StandardTableHeaderCell>Usuario</StandardTableHeaderCell>
            <StandardTableHeaderCell>Correo</StandardTableHeaderCell>
            <StandardTableHeaderCell>Rol</StandardTableHeaderCell>
            <StandardTableHeaderCell>Ultimo login</StandardTableHeaderCell>
          </tr>
        </StandardTableHead>
        <StandardTableBody>
            {isLoading && (
              <tr>
                <StandardTableCell muted colSpan={4}>
                  Cargando usuarios...
                </StandardTableCell>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <StandardTableCell muted colSpan={4}>
                  No hay usuarios disponibles.
                </StandardTableCell>
              </tr>
            )}
            {!isLoading &&
              users.map((user) => (
                <tr key={user.id} className="transition-all hover:bg-slate-50">
                  <StandardTableCell>{user.username}</StandardTableCell>
                  <StandardTableCell>{user.email}</StandardTableCell>
                  <StandardTableCell>{user.role}</StandardTableCell>
                  <StandardTableCell>{formatLastLogin(user.last_login)}</StandardTableCell>
                </tr>
              ))}
        </StandardTableBody>
      </StandardTable>
    </section>
  )
}
