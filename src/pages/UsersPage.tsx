import { useEffect, useState } from 'react'
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

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Ultimo login</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-slate-500">
                  Cargando usuarios...
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-slate-500">
                  No hay usuarios disponibles.
                </td>
              </tr>
            )}
            {!isLoading &&
              users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3">{formatLastLogin(user.last_login)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
