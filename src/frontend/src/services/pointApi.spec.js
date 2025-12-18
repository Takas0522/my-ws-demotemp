import { pointApi } from './pointApi'
import { apiClient } from './api'

jest.mock('./api')

describe('pointApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPoints', () => {
    it('should fetch point balance successfully', async () => {
      const mockResponse = {
        data: {
          userId: '05c66ceb-6ddc-4ada-b736-08702615ff48',
          balance: 1000
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await pointApi.getPoints()

      expect(apiClient.get).toHaveBeenCalledWith('/points')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle error when fetching points fails', async () => {
      const mockError = new Error('Network error')
      apiClient.get.mockRejectedValue(mockError)

      await expect(pointApi.getPoints()).rejects.toThrow('Network error')
      expect(apiClient.get).toHaveBeenCalledWith('/points')
    })
  })

  describe('getPointHistory', () => {
    it('should fetch point history with default parameters', async () => {
      const mockResponse = {
        data: {
          history: [
            {
              id: '1',
              type: 'EARN',
              amount: 100,
              description: 'Test point',
              createdAt: '2023-01-01T00:00:00Z',
              balanceAfter: 1000
            }
          ],
          pagination: {
            currentPage: 1,
            limit: 10,
            totalPages: 1,
            totalItems: 1
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await pointApi.getPointHistory()

      expect(apiClient.get).toHaveBeenCalledWith('/points/history?page=1&limit=10')
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch point history with custom parameters', async () => {
      const mockResponse = {
        data: {
          history: [],
          pagination: {
            currentPage: 2,
            limit: 20,
            totalPages: 5,
            totalItems: 100
          }
        }
      }
      apiClient.get.mockResolvedValue(mockResponse)

      const result = await pointApi.getPointHistory(2, 20)

      expect(apiClient.get).toHaveBeenCalledWith('/points/history?page=2&limit=20')
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle error when fetching history fails', async () => {
      const mockError = new Error('Service unavailable')
      apiClient.get.mockRejectedValue(mockError)

      await expect(pointApi.getPointHistory()).rejects.toThrow('Service unavailable')
      expect(apiClient.get).toHaveBeenCalledWith('/points/history?page=1&limit=10')
    })
  })
})
