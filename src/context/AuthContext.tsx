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
import { extractApiErrorMessage } from '../lib/http-error'
import type { AuthUser } from '../types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  isWarningVisible: boolean
  warningSecondsLeft: number
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'secure_fortress_user'
const SESSION_WARNING_MS = 4 * 60 * 1000
const SESSION_TIMEOUT_MS = 5 * 60 * 1000

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const readStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as AuthUser
    if (!parsed?.id || !parsed?.email || !parsed?.username || !parsed?.role) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [isBootstrapping, setIsBootstrapping] = useState(() => !!readStoredUser())
  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [warningSecondsLeft, setWarningSecondsLeft] = useState(0)
  const lastActivityRef = useRef<number>(0)

  const clearUser = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    setIsWarningVisible(false)
    setWarningSecondsLeft(0)
  }, [])

  const persistUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    lastActivityRef.current = Date.now()
    setIsWarningVisible(false)
    setWarningSecondsLeft(0)
  }, [])

  const validateSession = useCallback(async () => {
    try {
      await api.get('/products')
    } catch (error) {
      clearUser()
      throw new Error(extractApiErrorMessage(error))
    }
  }, [clearUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post<{ user: AuthUser }>('/auth/login', { email, password })
      persistUser(data.user)
    },
    [persistUser],
  )

  const logout = useCallback(() => {
    clearUser()
  }, [clearUser])

  useEffect(() => {
    setUnauthorizedHandler(clearUser)
    return () => setUnauthorizedHandler(null)
  }, [clearUser])

  useEffect(() => {
    if (!user) {
      return
    }

    const checkSession = async () => {
      await validateSession()
      setIsBootstrapping(false)
    }

    void checkSession()
  }, [user, validateSession])

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
      isAuthenticated: !!user,
      isBootstrapping,
      isWarningVisible,
      warningSecondsLeft,
      login,
      logout,
    }),
    [isBootstrapping, isWarningVisible, login, logout, user, warningSecondsLeft],
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
