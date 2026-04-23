import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { extractApiErrorMessage } from '../lib/http-error'
import { type LoginFormData, loginSchema } from '../schemas/auth.schema'

export const LoginPage = () => {
  const [serverError, setServerError] = useState<string | null>(null)
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = location.state?.from?.pathname ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      await login(data.email, data.password)
      navigate(destination, { replace: true })
    } catch (error) {
      const rawMessage = extractApiErrorMessage(error)
      if (
        rawMessage.toLowerCase().includes('too many failed attempts') ||
        rawMessage.toLowerCase().includes('try again in 5 minutes')
      ) {
        setServerError('Has superado el limite de intentos. Intenta de nuevo en 5 minutos.')
        return
      }
      setServerError(rawMessage)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Secure Fortress
            </p>
            <h1 className="mb-1 text-2xl font-semibold text-slate-900 sm:text-3xl">Iniciar sesion</h1>
            <p className="text-sm text-slate-600">Accede al dashboard administrativo seguro.</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg text-white shadow-md">
            🔒
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/25 ${
                errors.email
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-500/25'
                  : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/25 ${
                errors.password
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-500/25'
                  : 'border-slate-300 focus:border-blue-500'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? 'Validando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
