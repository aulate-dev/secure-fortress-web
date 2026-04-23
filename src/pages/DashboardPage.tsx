import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type UserRole = 'SuperAdmin' | 'Auditor' | 'Registrador'

type DashboardCard = {
  title: string
  description: string
  to: string
  roles: UserRole[]
}

const dashboardCards: DashboardCard[] = [
  {
    title: 'Gestionar usuarios',
    description: 'Administra cuentas, roles y permisos del sistema.',
    to: '/users',
    roles: ['SuperAdmin'],
  },
  {
    title: 'Ver auditoria',
    description: 'Consulta eventos de seguridad y trazabilidad operativa.',
    to: '/audit-logs',
    roles: ['SuperAdmin'],
  },
  {
    title: 'Consultar productos',
    description: 'Visualiza el catalogo y el estado del inventario.',
    to: '/products',
    roles: ['SuperAdmin', 'Auditor', 'Registrador'],
  },
]

export const DashboardPage = () => {
  const { user } = useAuth()
  const effectiveRole = (user?.role ?? '') as string
  const visibleCards = dashboardCards.filter((card) =>
    card.roles.includes(effectiveRole as UserRole),
  )

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-900">Bienvenido, {user?.username}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Este es tu panel principal. Tu rol actual es <strong>{effectiveRole || user?.role}</strong>.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="group block transform rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:scale-[0.99]"
          >
            <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
              {card.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-blue-700">
              Abrir modulo
            </p>
          </Link>
        ))}
      </div>
      {visibleCards.length === 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          No tienes modulos disponibles para este rol.
        </div>
      )}
      {effectiveRole === 'Auditor' && (
        <p className="mt-4 text-xs text-slate-500">
          Tu perfil de Auditor no muestra el modulo de Gestionar usuarios por politica de seguridad.
        </p>
      )}
    </section>
  )
}
