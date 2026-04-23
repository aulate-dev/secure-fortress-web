import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children?: ReactNode
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Validando sesion...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />
  }

  return children ?? <Outlet />
}
