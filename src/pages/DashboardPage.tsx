import { useAuth } from '../context/AuthContext'

const roleCapabilities: Record<string, string[]> = {
  SuperAdmin: ['Gestionar usuarios', 'Ver auditoria', 'Gestion total de productos'],
  Auditor: ['Consultar productos', 'Auditar cambios'],
  Registrador: ['Crear/editar productos', 'Gestion operativa de inventario'],
}

export const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-900">Bienvenido, {user?.username}</h2>
      <p className="mt-2 text-sm text-slate-600">
        Este es tu panel principal. Tu rol actual es <strong>{user?.role}</strong>.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(roleCapabilities[user?.role ?? ''] ?? []).map((capability) => (
          <article
            key={capability}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-800">{capability}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
