import { mount, flushPromises } from '@vue/test-utils'
import PointView from './PointView.vue'
import { authService } from '../services/api'
import { pointApi } from '../services/pointApi'

// Mock the services
jest.mock('../services/api', () => ({
  authService: {
    logout: jest.fn()
  }
}))

jest.mock('../services/pointApi', () => ({
  pointApi: {
    getPoints: jest.fn()
  }
}))

// Mock vue-router
const mockPush = jest.fn()
jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('PointView.vue', () => {
  let wrapper

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    jest.restoreAllMocks()
  })

  const mockPointData = {
    balance: 1500
  }

  const mountComponent = async () => {
    const wrapper = mount(PointView, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
    await flushPromises()
    return wrapper
  }

  describe('Component rendering', () => {
    it('should render header and title', async () => {
      pointApi.getPoints.mockResolvedValue(mockPointData)
      
      wrapper = await mountComponent()
      
      expect(wrapper.find('h1').text()).toBe('ポイント残高')
      expect(wrapper.find('h2').text()).toContain('現在のポイント残高')
    })

    it('should display point balance when loaded successfully', async () => {
      pointApi.getPoints.mockResolvedValue(mockPointData)
      
      wrapper = await mountComponent()
      
      const text = wrapper.text()
      expect(text).toContain('1,500') // Balance should be formatted with comma
      expect(text).toContain('ポイント')
    })

    it('should display zero balance when balance is undefined', async () => {
      pointApi.getPoints.mockResolvedValue({})
      
      wrapper = await mountComponent()
      
      const text = wrapper.text()
      expect(text).toContain('0')
    })

    it('should display loading spinner while fetching data', () => {
      pointApi.getPoints.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      wrapper = mount(PointView, {
        global: {
          stubs: {
            'router-link': true
          }
        }
      })
      
      // Check for loading spinner
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('should display error message when fetch fails', async () => {
      const errorMessage = 'Failed to fetch points'
      pointApi.getPoints.mockRejectedValue({
        response: {
          data: {
            error: errorMessage
          }
        }
      })
      
      wrapper = await mountComponent()
      
      expect(wrapper.text()).toContain(errorMessage)
    })

    it('should display service unavailable message for 503 error', async () => {
      pointApi.getPoints.mockRejectedValue({
        response: {
          status: 503
        }
      })
      
      wrapper = await mountComponent()
      
      expect(wrapper.text()).toContain('ポイントサービスが一時的に利用できません')
    })

    it('should display fallback error message for other errors', async () => {
      pointApi.getPoints.mockRejectedValue(new Error('Network error'))
      
      wrapper = await mountComponent()
      
      expect(wrapper.text()).toContain('ポイント情報の取得に失敗しました')
    })
  })

  describe('Navigation', () => {
    it('should have link to point history page', async () => {
      pointApi.getPoints.mockResolvedValue(mockPointData)
      
      wrapper = await mountComponent()
      
      // Check if the link exists in the rendered HTML
      const html = wrapper.html()
      expect(html).toContain('/points/history')
    })

    it('should have link to account page', async () => {
      pointApi.getPoints.mockResolvedValue(mockPointData)
      
      wrapper = await mountComponent()
      
      // Check if the link exists in the rendered HTML
      const html = wrapper.html()
      expect(html).toContain('/account')
    })

    it('should have logout button', async () => {
      pointApi.getPoints.mockResolvedValue(mockPointData)
      
      wrapper = await mountComponent()
      
      const logoutButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('ログアウト')
      )
      expect(logoutButton).toBeTruthy()
    })
  })

  describe('Logout functionality', () => {
    it('should call logout service and navigate to login on logout', async () => {
      pointApi.getPoints.mockResolvedValue(mockPointData)
      authService.logout.mockResolvedValue()
      
      wrapper = await mountComponent()
      
      const logoutButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('ログアウト')
      )
      
      await logoutButton.trigger('click')
      await flushPromises()
      
      expect(authService.logout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('should navigate to login even if logout service fails', async () => {
      pointApi.getPoints.mockResolvedValue(mockPointData)
      authService.logout.mockRejectedValue(new Error('Logout failed'))
      
      wrapper = await mountComponent()
      
      const logoutButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('ログアウト')
      )
      
      await logoutButton.trigger('click')
      await flushPromises()
      
      expect(authService.logout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('Number formatting', () => {
    it('should format large numbers with commas', async () => {
      pointApi.getPoints.mockResolvedValue({ balance: 1234567 })
      
      wrapper = await mountComponent()
      
      const text = wrapper.text()
      expect(text).toContain('1,234,567')
    })

    it('should format small numbers correctly', async () => {
      pointApi.getPoints.mockResolvedValue({ balance: 50 })
      
      wrapper = await mountComponent()
      
      const text = wrapper.text()
      expect(text).toContain('50')
    })
  })

  describe('Component lifecycle', () => {
    it('should load point data on mount', async () => {
      pointApi.getPoints.mockResolvedValue(mockPointData)
      
      wrapper = await mountComponent()
      
      expect(pointApi.getPoints).toHaveBeenCalledTimes(1)
    })
  })
})
