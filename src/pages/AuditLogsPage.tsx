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
      <StandardTable caption="Bitacora de auditoria">
        <StandardTableHead>
          <tr>
            <StandardTableHeaderCell>Fecha/Hora</StandardTableHeaderCell>
            <StandardTableHeaderCell>Evento</StandardTableHeaderCell>
            <StandardTableHeaderCell>Usuario</StandardTableHeaderCell>
            <StandardTableHeaderCell>IP de origen</StandardTableHeaderCell>
            <StandardTableHeaderCell>Detalles</StandardTableHeaderCell>
          </tr>
        </StandardTableHead>
        <StandardTableBody>
            {isLoading && (
              <tr>
                <StandardTableCell muted colSpan={5}>
                  Cargando logs...
                </StandardTableCell>
              </tr>
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <StandardTableCell muted colSpan={5}>
                  No hay registros de auditoria.
                </StandardTableCell>
              </tr>
            )}
            {!isLoading &&
              logs.map((log) => (
                <tr key={log.id} className="transition-all hover:bg-slate-50">
                  <StandardTableCell>{formatDate(log.created_at)}</StandardTableCell>
                  <StandardTableCell>{log.event_type}</StandardTableCell>
                  <StandardTableCell>{log.user_id ?? 'Sistema'}</StandardTableCell>
                  <StandardTableCell>{log.ip_address}</StandardTableCell>
                  <StandardTableCell>{`${log.details} (${log.route})`}</StandardTableCell>
                </tr>
              ))}
        </StandardTableBody>
      </StandardTable>
    </section>
  )
}
