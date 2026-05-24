import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // ← send JWT cookie
    timeout: 10000
})

// Response interceptor — handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')

            const requestUrl = error.config?.url || ''
            const isAuthProbe = requestUrl.includes('/auth/me')

            // Let the app clear session state without forcing a full page reload.
            if (!isAuthProbe) {
                window.dispatchEvent(new CustomEvent('auth:unauthorized'))
            }
        }
        return Promise.reject(error)
    }
)

export default api
