import axios from 'axios'

let unauthorizedHandler: (() => void) | null = null

const normalizeApiBaseUrl = (rawBaseUrl?: string): string => {
  const fallbackBaseUrl = 'http://localhost:3000/api'
  const candidate = (rawBaseUrl ?? fallbackBaseUrl).replace(/\/+$/, '')
  return candidate.endsWith('/api') ? candidate : `${candidate}/api`
}

export const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error?.config?.url ?? '')
    const shouldSkipUnauthorizedHandler = requestUrl.includes('/auth/session-context')
    if (error?.response?.status === 401 && unauthorizedHandler && !shouldSkipUnauthorizedHandler) {
      unauthorizedHandler()
    }

    return Promise.reject(error)
  },
)
