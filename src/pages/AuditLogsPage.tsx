import { useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { extractApiErrorMessage } from '../lib/http-error'
import type { AuditLog } from '../types/admin'

const formatDate = (value: string) => new Date(value).toLocaleString('es-MX')

export const AuditLogsPage = () => {
  const { showToast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get<{ logs: AuditLog[] }>('/admin/audit-logs')
        setLogs(data.logs)
      } catch (error) {
        showToast(extractApiErrorMessage(error), 'error')
      } finally {
        setIsLoading(false)
      }
    }
    void fetchLogs()
  }, [showToast])

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Panel de auditoria</h2>
        <p className="text-sm text-slate-600">Registro de eventos de seguridad y actividad.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha/Hora</th>
              <th className="px-4 py-3 font-semibold">Evento</th>
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">IP de origen</th>
              <th className="px-4 py-3 font-semibold">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-slate-500">
                  Cargando logs...
                </td>
              </tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-slate-500">
                  No hay registros de auditoria.
                </td>
              </tr>
            )}
            {!isLoading &&
              logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3">{log.event_type}</td>
                  <td className="px-4 py-3">{log.user_id ?? 'Sistema'}</td>
                  <td className="px-4 py-3">{log.ip_address}</td>
                  <td className="px-4 py-3">{`${log.details} (${log.route})`}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
