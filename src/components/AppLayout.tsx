import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SessionTimeoutBanner } from './SessionTimeoutBanner'

export const AppLayout = () => {
  const { user, logout } = useAuth()

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
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <SessionTimeoutBanner />
        <Outlet />
      </main>
    </div>
  )
}
