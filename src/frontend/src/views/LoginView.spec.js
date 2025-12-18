import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import LoginView from './LoginView.vue'
import { authService } from '../services/api'

// Mock the authService
jest.mock('../services/api', () => ({
  authService: {
    login: jest.fn()
  }
}))

// Mock vue-router
const mockPush = jest.fn()
jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('LoginView.vue', () => {
  let wrapper

  beforeEach(() => {
    jest.clearAllMocks()
    // Spy on localStorage
    jest.spyOn(Storage.prototype, 'setItem')
    jest.spyOn(Storage.prototype, 'getItem')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    jest.restoreAllMocks()
  })

  const mountComponent = () => {
    return mount(LoginView, {
      global: {
        stubs: {
          'router-link': true
        }
      }
    })
  }

  describe('Component rendering', () => {
    it('should render login form', () => {
      wrapper = mountComponent()
      
      expect(wrapper.find('h1').text()).toBe('ログイン')
      expect(wrapper.find('#userId').exists()).toBe(true)
      expect(wrapper.find('#password').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('should display test user information', () => {
      wrapper = mountComponent()
      
      const testUserInfo = wrapper.text()
      expect(testUserInfo).toContain('tanaka_taro')
      expect(testUserInfo).toContain('田中太郎')
      expect(testUserInfo).toContain('password123')
    })

    it('should have input placeholders', () => {
      wrapper = mountComponent()
      
      const userIdInput = wrapper.find('#userId')
      const passwordInput = wrapper.find('#password')
      
      expect(userIdInput.attributes('placeholder')).toContain('tanaka_taro')
      expect(passwordInput.attributes('placeholder')).toBe('password123')
    })
  })

  describe('Form submission', () => {
    it('should call login service with UUID and navigate to account on success', async () => {
      const mockToken = 'test-token-123'
      const mockUserId = '05c66ceb-6ddc-4ada-b736-08702615ff48'
      
      authService.login.mockResolvedValue({
        token: mockToken,
        userId: mockUserId
      })

      wrapper = mountComponent()
      
      // Fill in the form
      await wrapper.find('#userId').setValue(mockUserId)
      await wrapper.find('#password').setValue('password123')
      
      // Submit the form
      await wrapper.find('form').trigger('submit.prevent')
      
      // Wait for async operations
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(authService.login).toHaveBeenCalledWith(mockUserId, 'password123')
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockToken)
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', mockUserId)
      expect(mockPush).toHaveBeenCalledWith('/account')
    })

    it('should call login service with username and navigate to account on success', async () => {
      const mockToken = 'test-token-456'
      const mockUserId = '05c66ceb-6ddc-4ada-b736-08702615ff48'
      
      authService.login.mockResolvedValue({
        token: mockToken,
        userId: mockUserId
      })

      wrapper = mountComponent()
      
      // Fill in the form with username
      await wrapper.find('#userId').setValue('tanaka_taro')
      await wrapper.find('#password').setValue('password123')
      
      // Submit the form
      await wrapper.find('form').trigger('submit.prevent')
      
      // Wait for async operations
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(authService.login).toHaveBeenCalledWith('tanaka_taro', 'password123')
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockToken)
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', mockUserId)
      expect(mockPush).toHaveBeenCalledWith('/account')
    })

    it('should display error message on login failure', async () => {
      const errorMessage = 'Invalid credentials'
      authService.login.mockRejectedValue({
        response: {
          status: 401,
          data: {
            error: errorMessage
          }
        }
      })

      wrapper = mountComponent()
      
      // Fill in the form
      await wrapper.find('#userId').setValue('wrong_user')
      await wrapper.find('#password').setValue('wrong_password')
      
      // Submit the form
      await wrapper.find('form').trigger('submit.prevent')
      
      // Wait for async operations
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(authService.login).toHaveBeenCalled()
      expect(wrapper.text()).toContain(errorMessage)
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should display loading state while submitting', async () => {
      authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      wrapper = mountComponent()
      
      // Fill in the form
      await wrapper.find('#userId').setValue('tanaka_taro')
      await wrapper.find('#password').setValue('password123')
      
      // Submit the form
      const submitPromise = wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()
      
      // Check loading state
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.text()).toBe('ログイン中...')
      expect(submitButton.attributes('disabled')).toBeDefined()
      
      // Wait for completion
      await submitPromise
      await new Promise(resolve => setTimeout(resolve, 150))
    })

    it('should handle network error gracefully', async () => {
      authService.login.mockRejectedValue(new Error('Network error'))

      wrapper = mountComponent()
      
      // Fill in the form
      await wrapper.find('#userId').setValue('tanaka_taro')
      await wrapper.find('#password').setValue('password123')
      
      // Submit the form
      await wrapper.find('form').trigger('submit.prevent')
      
      // Wait for async operations
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(wrapper.text()).toContain('Network error')
    })

    it('should handle error response with string data', async () => {
      const errorMessage = 'Unauthorized access'
      authService.login.mockRejectedValue({
        response: {
          status: 401,
          data: errorMessage
        }
      })

      wrapper = mountComponent()
      
      await wrapper.find('#userId').setValue('test')
      await wrapper.find('#password').setValue('test')
      await wrapper.find('form').trigger('submit.prevent')
      
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(wrapper.text()).toContain(errorMessage)
    })
  })

  describe('Form validation', () => {
    it('should have required fields', () => {
      wrapper = mountComponent()
      
      const userIdInput = wrapper.find('#userId')
      const passwordInput = wrapper.find('#password')
      
      expect(userIdInput.attributes('required')).toBeDefined()
      expect(passwordInput.attributes('required')).toBeDefined()
    })

    it('should have correct input types', () => {
      wrapper = mountComponent()
      
      const userIdInput = wrapper.find('#userId')
      const passwordInput = wrapper.find('#password')
      
      expect(userIdInput.attributes('type')).toBe('text')
      expect(passwordInput.attributes('type')).toBe('password')
    })
  })
})
