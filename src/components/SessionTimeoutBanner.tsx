import { useAuth } from '../context/AuthContext'

export const SessionTimeoutBanner = () => {
  const { isWarningVisible, warningSecondsLeft } = useAuth()

  if (!isWarningVisible) {
    return null
  }

  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {warningSecondsLeft > 0
        ? `Tu sesion expirara pronto por inactividad (${warningSecondsLeft}s).`
        : 'Tu sesion podria haber expirado por inactividad. Actualiza tu actividad o inicia sesion nuevamente.'}
    </div>
  )
}
