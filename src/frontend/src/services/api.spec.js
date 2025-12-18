// Mock axios before any imports
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    }
  }))
}))

import axios from 'axios'
import { authService, userService, apiClient } from './api'

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Spy on localStorage methods
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
    jest.spyOn(Storage.prototype, 'setItem')
    jest.spyOn(Storage.prototype, 'removeItem')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('login', () => {
    it('should login with UUID successfully', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-123',
          userId: '05c66ceb-6ddc-4ada-b736-08702615ff48'
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await authService.login('05c66ceb-6ddc-4ada-b736-08702615ff48', 'password123')

      expect(apiClient.post).toHaveBeenCalledWith('/login', {
        userId: '05c66ceb-6ddc-4ada-b736-08702615ff48',
        password: 'password123'
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should login with username successfully', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-456',
          userId: '05c66ceb-6ddc-4ada-b736-08702615ff48'
        }
      }
      apiClient.post.mockResolvedValue(mockResponse)

      const result = await authService.login('tanaka_taro', 'password123')

      expect(apiClient.post).toHaveBeenCalledWith('/login', {
        username: 'tanaka_taro',
        password: 'password123'
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle login failure', async () => {
      const mockError = new Error('Invalid credentials')
      apiClient.post.mockRejectedValue(mockError)

      await expect(authService.login('invalid_user', 'wrong_password')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should logout successfully and clear localStorage', async () => {
      apiClient.post.mockResolvedValue({ data: {} })

      await authService.logout()

      expect(apiClient.post).toHaveBeenCalledWith('/logout')
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken')
      expect(localStorage.removeItem).toHaveBeenCalledWith('userId')
    })

    it('should clear localStorage even if logout API fails', async () => {
      apiClient.post.mockRejectedValue(new Error('Network error'))

      // Logout should throw the error but still clean up localStorage in finally block
      await expect(authService.logout()).rejects.toThrow('Network error')

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken')
      expect(localStorage.removeItem).toHaveBeenCalledWith('userId')
    })
  })

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const mockResponse = {
        data: {
          valid: true,
          userId: '05c66ceb-6ddc-4ada-b736-08702615ff48'
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await authService.verifyToken()

      expect(apiClient.get).toHaveBeenCalledWith('/verify')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle verification failure', async () => {
      const mockError = new Error('Token expired')
      apiClient.get.mockRejectedValue(mockError)

      await expect(authService.verifyToken()).rejects.toThrow('Token expired')
    })
  })
})

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAccount', () => {
    it('should fetch account data successfully', async () => {
      const mockResponse = {
        data: {
          user: {
            id: '05c66ceb-6ddc-4ada-b736-08702615ff48',
            username: 'tanaka_taro',
            fullName: '田中太郎',
            email: 'tanaka@example.com',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: '2023-01-02T00:00:00Z'
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await userService.getAccount()

      expect(apiClient.get).toHaveBeenCalledWith('/account')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle error when fetching account fails', async () => {
      const mockError = new Error('Unauthorized')
      apiClient.get.mockRejectedValue(mockError)

      await expect(userService.getAccount()).rejects.toThrow('Unauthorized')
    })
  })

  describe('getUser', () => {
    it('should fetch user data with valid UUID successfully', async () => {
      const userId = '05c66ceb-6ddc-4ada-b736-08702615ff48'
      const mockResponse = {
        data: {
          id: userId,
          username: 'tanaka_taro',
          fullName: '田中太郎',
          email: 'tanaka@example.com'
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await userService.getUser(userId)

      expect(apiClient.get).toHaveBeenCalledWith(`/users/${userId}`)
      expect(result).toEqual(mockResponse.data)
    })

    it('should reject invalid UUID format', async () => {
      await expect(userService.getUser('invalid-uuid')).rejects.toThrow('Invalid UUID format')
      expect(apiClient.get).not.toHaveBeenCalled()
    })

    it('should handle error when fetching user fails', async () => {
      const userId = '05c66ceb-6ddc-4ada-b736-08702615ff48'
      const mockError = new Error('User not found')
      apiClient.get.mockRejectedValue(mockError)

      await expect(userService.getUser(userId)).rejects.toThrow('User not found')
    })
  })
})
