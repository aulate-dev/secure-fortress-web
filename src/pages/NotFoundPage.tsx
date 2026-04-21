import { Link } from 'react-router-dom'

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Pagina no encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">La ruta solicitada no existe.</p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
