import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const api = axios.create({
  baseURL:         BASE,
  withCredentials: true,
  timeout:         15_000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token and UTC offset on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    config.headers['x-utc-offset'] = String(-new Date().getTimezoneOffset())
  }
  return config
})

// Serialise token refreshes so concurrent 401s don't trigger multiple refreshes
let refreshPromise: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise
  refreshPromise = axios
    .post<{ accessToken: string }>(`${BASE}/api/auth/refresh`, {}, { withCredentials: true })
    .then(({ data }) => {
      localStorage.setItem('accessToken', data.accessToken)
      return data.accessToken
    })
    .catch(() => {
      localStorage.removeItem('accessToken')
      return null
    })
    .finally(() => { refreshPromise = null })
  return refreshPromise
}

// On 401, attempt a single token refresh then retry the original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const newToken = await refreshToken()
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
    }
    return Promise.reject(error)
  }
)

export default api
