import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from './views/LoginView.vue'
import AccountView from './views/AccountView.vue'
import PointView from './views/PointView.vue'
import PointHistoryView from './views/PointHistoryView.vue'

describe('Router', () => {
  let router

  beforeEach(() => {
    // Spy on localStorage methods
    jest.spyOn(Storage.prototype, 'getItem')
    jest.spyOn(Storage.prototype, 'setItem')
    jest.spyOn(Storage.prototype, 'removeItem')

    // Create a fresh router instance for each test
    const routes = [
      {
        path: '/',
        redirect: '/login'
      },
      {
        path: '/login',
        name: 'Login',
        component: LoginView
      },
      {
        path: '/account',
        name: 'Account',
        component: AccountView,
        meta: { requiresAuth: true }
      },
      {
        path: '/points',
        name: 'Points',
        component: PointView,
        meta: { requiresAuth: true }
      },
      {
        path: '/points/history',
        name: 'PointHistory',
        component: PointHistoryView,
        meta: { requiresAuth: true }
      }
    ]

    router = createRouter({
      history: createMemoryHistory(),
      routes
    })

    // Add navigation guard
    router.beforeEach((to, from, next) => {
      const token = localStorage.getItem('authToken')
      
      if (to.meta.requiresAuth && !token) {
        next('/login')
      } else {
        next()
      }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Route definitions', () => {
    it('should have login route', () => {
      const route = router.resolve('/login')
      expect(route.name).toBe('Login')
      expect(route.matched[0].components.default).toBe(LoginView)
    })

    it('should have account route with auth requirement', () => {
      const route = router.resolve('/account')
      expect(route.name).toBe('Account')
      expect(route.matched[0].components.default).toBe(AccountView)
      expect(route.meta.requiresAuth).toBe(true)
    })

    it('should have points route with auth requirement', () => {
      const route = router.resolve('/points')
      expect(route.name).toBe('Points')
      expect(route.matched[0].components.default).toBe(PointView)
      expect(route.meta.requiresAuth).toBe(true)
    })

    it('should have point history route with auth requirement', () => {
      const route = router.resolve('/points/history')
      expect(route.name).toBe('PointHistory')
      expect(route.matched[0].components.default).toBe(PointHistoryView)
      expect(route.meta.requiresAuth).toBe(true)
    })

    it('should redirect root path to login', async () => {
      await router.push('/')
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Navigation guard', () => {
    it('should allow navigation to login without token', async () => {
      localStorage.getItem.mockReturnValue(null)
      
      await router.push('/login')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should redirect to login when accessing protected route without token', async () => {
      localStorage.getItem.mockReturnValue(null)
      
      await router.push('/account')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should allow navigation to protected route with token', async () => {
      localStorage.getItem.mockReturnValue('test-token')
      
      await router.push('/account')
      expect(router.currentRoute.value.path).toBe('/account')
    })

    it('should allow navigation to points page with token', async () => {
      localStorage.getItem.mockReturnValue('test-token')
      
      await router.push('/points')
      expect(router.currentRoute.value.path).toBe('/points')
    })

    it('should allow navigation to point history page with token', async () => {
      localStorage.getItem.mockReturnValue('test-token')
      
      await router.push('/points/history')
      expect(router.currentRoute.value.path).toBe('/points/history')
    })

    it('should redirect to login when accessing points without token', async () => {
      localStorage.getItem.mockReturnValue(null)
      
      await router.push('/points')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should redirect to login when accessing point history without token', async () => {
      localStorage.getItem.mockReturnValue(null)
      
      await router.push('/points/history')
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })
})
