import axios from 'axios'

const API_BASE_URL = '/api'

// Axios インスタンス作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、ログイン画面へリダイレクト
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  /**
   * ログイン
   */
  async login(userId, password) {
    const response = await apiClient.post('/login', {
      userId: parseInt(userId),
      password
    })
    return response.data
  },

  /**
   * ログアウト
   */
  async logout() {
    try {
      await apiClient.post('/logout')
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
    }
  },

  /**
   * トークン検証
   */
  async verifyToken() {
    const response = await apiClient.get('/verify')
    return response.data
  }
}

export const userService = {
  /**
   * アカウント情報取得
   */
  async getAccount() {
    const response = await apiClient.get('/account')
    return response.data
  },

  /**
   * ユーザー情報取得
   */
  async getUser(userId) {
    const response = await apiClient.get(`/users/${userId}`)
    return response.data
  }
}
