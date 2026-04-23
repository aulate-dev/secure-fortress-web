/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { api, setUnauthorizedHandler } from '../lib/api'
import type { AuthUser } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  sourceIp: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  isWarningVisible: boolean
  warningSecondsLeft: number
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

interface LoginResponse {
  user: AuthUser
  ipAddress?: string
}

interface SessionContextResponse {
  id: number
  email: string
  username: string
  role: AuthUser['role']
  sourceIp: string
}

const SESSION_WARNING_MS = 4 * 60 * 1000
const SESSION_TIMEOUT_MS = 5 * 60 * 1000

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sourceIp, setSourceIp] = useState<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(0)
  const lastActivityRef = useRef<number>(0)

  const clearUser = useCallback(() => {
    setUser(null)
    setSourceIp(null)
    setIsWarningVisible(false)
    setWarningSecondsLeft(0)
  }, [])

  const persistUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
    lastActivityRef.current = Date.now()
    setIsWarningVisible(false)
    setWarningSecondsLeft(0)
  }, [])

  const loadSessionContext = useCallback(async () => {
    try {
      const { data } = await api.get<SessionContextResponse>('/auth/session-context', {
        withCredentials: true,
      })
      setSourceIp(data.sourceIp ?? null)
      setUser((previousUser) => ({
        id: data.id,
        email: data.email || previousUser?.email || '',
        username: data.username || previousUser?.username || 'Usuario',
        role: data.role || previousUser?.role || 'Registrador',
        ipAddress: data.sourceIp ?? previousUser?.ipAddress ?? null,
        last_ip: data.sourceIp ?? previousUser?.last_ip ?? null,
      }))
    } catch (error) {
      const status = Number((error as { response?: { status?: number } })?.response?.status ?? 0)
      if (status === 401) {
        clearUser()
        return
      }
      setSourceIp(null)
    }
  }, [clearUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
      persistUser({
        ...data.user,
        ipAddress: data.ipAddress ?? data.user.ipAddress ?? data.user.last_ip ?? null,
      })
      await loadSessionContext()
    },
    [loadSessionContext, persistUser],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Backend logout endpoint may not be available yet.
    }
    clearUser()
  }, [clearUser])

  useEffect(() => {
    setUnauthorizedHandler(clearUser)
    return () => setUnauthorizedHandler(null)
  }, [clearUser])

  useEffect(() => {
    const checkSession = async () => {
      try {
        await loadSessionContext()
      } catch (error) {
        const status = Number((error as { response?: { status?: number } })?.response?.status ?? 0)
        if (status === 401) {
          clearUser()
        }
      } finally {
        setIsBootstrapping(false)
      }
    }

    void checkSession()
  }, [clearUser, loadSessionContext])

  useEffect(() => {
    if (!user) {
      return
    }

    lastActivityRef.current = Date.now()

    const updateActivity = () => {
      lastActivityRef.current = Date.now()
      setIsWarningVisible(false)
      setWarningSecondsLeft(0)
    }

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ]
    events.forEach((eventName) => window.addEventListener(eventName, updateActivity))

    const timer = window.setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current
      if (idleTime >= SESSION_WARNING_MS && idleTime < SESSION_TIMEOUT_MS) {
        setIsWarningVisible(true)
        setWarningSecondsLeft(Math.ceil((SESSION_TIMEOUT_MS - idleTime) / 1000))
        return
      }

      if (idleTime >= SESSION_TIMEOUT_MS) {
        setIsWarningVisible(true)
        setWarningSecondsLeft(0)
      }
    }, 1000)

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, updateActivity))
      window.clearInterval(timer)
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      sourceIp,
      isAuthenticated: !!user,
      isBootstrapping,
      isWarningVisible,
      warningSecondsLeft,
      login,
      logout,
    }),
    [isBootstrapping, isWarningVisible, login, logout, sourceIp, user, warningSecondsLeft],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
