import { Link } from 'react-router-dom'

export const AccessDeniedPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-slate-600">
          No cuentas con permisos para acceder a este recurso.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  )
}
