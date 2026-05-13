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
            // Unauthorized — clear auth and redirect to login
            localStorage.removeItem('auth_token')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default api
