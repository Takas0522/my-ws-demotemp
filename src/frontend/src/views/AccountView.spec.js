import { mount, flushPromises } from '@vue/test-utils'
import AccountView from './AccountView.vue'
import { authService, userService } from '../services/api'

// Mock the services
jest.mock('../services/api', () => ({
  authService: {
    logout: jest.fn()
  },
  userService: {
    getAccount: jest.fn()
  }
}))

// Mock vue-router
const mockPush = jest.fn()
jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('AccountView.vue', () => {
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

  const mockAccountData = {
    user: {
      id: '05c66ceb-6ddc-4ada-b736-08702615ff48',
      username: 'tanaka_taro',
      fullName: '田中太郎',
      email: 'tanaka@example.com',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    }
  }

  const mountComponent = async () => {
    const wrapper = mount(AccountView, {
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
      userService.getAccount.mockResolvedValue(mockAccountData)
      
      wrapper = await mountComponent()
      
      expect(wrapper.find('h1').text()).toBe('会員マイページ')
      expect(wrapper.find('h2').text()).toContain('アカウント情報')
    })

    it('should render account data when loaded successfully', async () => {
      userService.getAccount.mockResolvedValue(mockAccountData)
      
      wrapper = await mountComponent()
      
      const text = wrapper.text()
      expect(text).toContain('05c66ceb-6ddc-4ada-b736-08702615ff48')
      expect(text).toContain('田中太郎')
      expect(text).toContain('tanaka_taro')
      expect(text).toContain('tanaka@example.com')
    })

    it('should display loading spinner while fetching data', () => {
      userService.getAccount.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      wrapper = mount(AccountView, {
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
      const errorMessage = 'Failed to fetch account data'
      userService.getAccount.mockRejectedValue({
        response: {
          data: {
            error: errorMessage
          }
        }
      })
      
      wrapper = await mountComponent()
      
      expect(wrapper.text()).toContain(errorMessage)
    })

    it('should display fallback error message when response has no error field', async () => {
      userService.getAccount.mockRejectedValue(new Error('Network error'))
      
      wrapper = await mountComponent()
      
      expect(wrapper.text()).toContain('アカウント情報の取得に失敗しました')
    })
  })

  describe('Navigation', () => {
    it('should have link to points page', async () => {
      userService.getAccount.mockResolvedValue(mockAccountData)
      
      wrapper = await mountComponent()
      
      // Check if the link exists in the rendered HTML
      const html = wrapper.html()
      expect(html).toContain('/points')
    })

    it('should have logout button', async () => {
      userService.getAccount.mockResolvedValue(mockAccountData)
      
      wrapper = await mountComponent()
      
      const logoutButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('ログアウト')
      )
      expect(logoutButton).toBeTruthy()
    })
  })

  describe('Logout functionality', () => {
    it('should call logout service and navigate to login on logout', async () => {
      userService.getAccount.mockResolvedValue(mockAccountData)
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
      userService.getAccount.mockResolvedValue(mockAccountData)
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

  describe('Date formatting', () => {
    it('should format dates correctly', async () => {
      userService.getAccount.mockResolvedValue(mockAccountData)
      
      wrapper = await mountComponent()
      
      // The dates should be formatted in Japanese locale
      const text = wrapper.text()
      expect(text).toMatch(/2023/)
    })

    it('should handle missing date gracefully', async () => {
      const dataWithoutDate = {
        user: {
          ...mockAccountData.user,
          createdAt: null,
          updatedAt: null
        }
      }
      userService.getAccount.mockResolvedValue(dataWithoutDate)
      
      wrapper = await mountComponent()
      
      // Should display '-' for missing dates
      const text = wrapper.text()
      expect(text).toContain('-')
    })
  })

  describe('Component lifecycle', () => {
    it('should load account data on mount', async () => {
      userService.getAccount.mockResolvedValue(mockAccountData)
      
      wrapper = await mountComponent()
      
      expect(userService.getAccount).toHaveBeenCalledTimes(1)
    })
  })
})
