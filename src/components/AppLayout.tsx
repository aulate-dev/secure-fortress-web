import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SessionTimeoutBanner } from './SessionTimeoutBanner'

export const AppLayout = () => {
  const { user, sourceIp, logout } = useAuth()
  const isSuperAdmin = user?.role === 'SuperAdmin'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const displayedIp = sourceIp ?? user?.last_ip ?? user?.ipAddress
  const rolePresentation = useMemo(() => {
    if (user?.role === 'SuperAdmin') {
      return {
        title: 'Secure Fortress | Panel de Administración',
        badgeLabel: 'SuperAdmin',
        badgeClassName: 'bg-red-100 text-red-700 border border-red-200',
      }
    }
    if (user?.role === 'Auditor') {
      return {
        title: 'Secure Fortress | Módulo de Auditoría',
        badgeLabel: 'Auditor',
        badgeClassName: 'bg-blue-100 text-blue-700 border border-blue-200',
      }
    }
    return {
      title: 'Secure Fortress | Gestión de Inventario',
      badgeLabel: 'Registrador',
      badgeClassName: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    }
  }, [user?.role])

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', to: '/dashboard', visible: true },
      { label: 'Productos', to: '/products', visible: true },
      { label: 'Usuarios', to: '/users', visible: isSuperAdmin },
      { label: 'Auditoria', to: '/audit-logs', visible: isSuperAdmin },
    ],
    [isSuperAdmin],
  )

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-900 text-white lg:flex lg:flex-col">
          <div className="border-b border-slate-700/80 px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Secure Fortress</p>
            <h1 className="mt-2 text-xl font-semibold text-white">Admin Console</h1>
          </div>
          <nav className="flex-1 px-4 py-6" aria-label="Navegacion principal">
            <ul className="space-y-2">
              {navItems
                .filter((item) => item.visible)
                .map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `block rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </nav>
        </aside>

        {isMobileMenuOpen && (
          <button
            type="button"
            aria-label="Cerrar menu"
            className="fixed inset-0 z-20 bg-slate-950/50 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-800 bg-slate-900 text-white transition-all lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="flex items-center justify-between border-b border-slate-700/80 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Secure Fortress</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Navegacion</h2>
            </div>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-100 transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Cerrar
            </button>
          </div>
          <nav className="px-4 py-6" aria-label="Navegacion movil">
            <ul className="space-y-2">
              {navItems
                .filter((item) => item.visible)
                .map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `block rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Abrir menu principal"
                  aria-expanded={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen((current) => !current)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
                >
                  <span aria-hidden>☰</span>
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Secure Fortress</p>
                  <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{rolePresentation.title}</h2>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Usuario: <span className="font-semibold text-slate-900">{user?.username ?? 'Usuario'}</span> | IP
                    origen: <span className="font-semibold text-slate-900">{displayedIp ?? 'No disponible'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${rolePresentation.badgeClassName}`}
                >
                  {rolePresentation.badgeLabel}
                </span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Cerrar sesion
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-6xl space-y-6">
              <SessionTimeoutBanner />
              <div className="transition-all">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
