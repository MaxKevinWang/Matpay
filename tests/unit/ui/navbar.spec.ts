import { shallowMount, VueWrapper } from '@vue/test-utils'
import App from '@/App.vue'
import router from '@/router'
import { createStore } from 'vuex'

describe('Test navbar', function () {
  it('a Rooms router-link exists', function () {
    const store = createStore({
      modules: {
        auth: {
          namespaced: true,
          getters: {
            is_logged_in: () => true,
            user_id: jest.fn(),
            homeserver: jest.fn()
          }
        }
      }
    })
    const wrapper = shallowMount(App, {
      global: {
        plugins: [router, store]
      }
    })
    expect(wrapper.find('#room-link').html()).toContain('rooms')
  })
  it('Login button shows correctly when logged in', function () {
    const store = createStore({
      modules: {
        auth: {
          namespaced: true,
          getters: {
            is_logged_in: () => true,
            user_id: jest.fn(),
            homeserver: jest.fn()
          }
        }
      }
    })
    const wrapper = shallowMount(App, {
      global: {
        plugins: [router, store]
      }
    })
    expect(wrapper.find('#logout_button').isVisible()).toEqual(true)
  })

  it('Login button shows correctly when not logged in', function () {
    const store = createStore({
      modules: {
        auth: {
          namespaced: true,
          getters: {
            is_logged_in: () => false,
            user_id: jest.fn(),
            homeserver: jest.fn()
          }
        }
      }
    })
    const wrapper = shallowMount(App, {
      global: {
        plugins: [router, store]
      }
    })
    expect(wrapper.find('#login_button').isVisible()).toEqual(true)
  })
})
