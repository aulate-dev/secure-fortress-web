import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SessionTimeoutBanner } from './SessionTimeoutBanner'

export const AppLayout = () => {
  const { user, logout } = useAuth()
  const isSuperAdmin = user?.role === 'SuperAdmin'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Secure Fortress</p>
            <h1 className="text-lg font-semibold">Panel administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <nav className="mb-6 flex flex-wrap gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`
            }
          >
            Productos
          </NavLink>
          {isSuperAdmin && (
            <>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`
                }
              >
                Usuarios
              </NavLink>
              <NavLink
                to="/audit-logs"
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm ${isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`
                }
              >
                Auditoria
              </NavLink>
            </>
          )}
        </nav>
        <SessionTimeoutBanner />
        <Outlet />
      </main>
    </div>
  )
}
