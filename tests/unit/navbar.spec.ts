import { shallowMount, VueWrapper } from '@vue/test-utils'
import App from '@/App.vue'
import { expect } from 'chai'
import { createStore } from 'vuex'

interface State {
  user_id: string
  homeserver: string
  access_token: string
  device_id: string
}

const auth_store_mock = createStore({
  modules: {
    auth: {
      namespaced: true,
      state (): State {
        return {
          user_id: '',
          homeserver: '',
          access_token: '',
          device_id: ''
        }
      },
      mutations: {
        mutation_login (state: State, payload: State): void {
          state.user_id = payload.user_id
          state.homeserver = payload.homeserver
          state.access_token = payload.access_token
          state.device_id = payload.device_id
        },
        mutation_logout (state: State): void {
          state.access_token = ''
        }
      },
      actions: {},
      getters: {
        device_id (state: State): string | undefined {
          return state.device_id === '' ? undefined : state.device_id
        },
        is_logged_in (state: State): boolean {
          return state.access_token !== ''
        },
        user_id (state: State): string {
          return state.user_id
        },
        homeserver (state: State): string {
          return state.homeserver
        }
      }
    }

  },
  strict: process.env.NODE_ENV !== 'production' // Strict Mode
})

describe('Test navbar', function () {
  let wrapper: VueWrapper<any>
  beforeEach(function () {
    wrapper = shallowMount(App, {
      global: {
        plugins: [auth_store_mock]
      }
    })
  })
  it('a Rooms tab exists', function () {
    expect(wrapper.text()).to.include('Rooms')
  })
  it('a Login tab exists', function () {
    expect(wrapper.text()).to.include('Rooms')
  })
  it('Login button shows correctly when logged in', function () {
    wrapper.vm.$store.commit('auth/mutation_login', {
      user_id: 'test_user_id',
      homeserver: 'fsdf',
      access_token: 'fsdf',
      device_id: 'fsdf'
    })
    expect(wrapper.getComponent('#logout_button').isVisible()).to.equal(true)
  })

  it('Login button shows correctly when not logged in', function () {
    wrapper.vm.$store.commit('auth/mutation_logout')
    expect(wrapper.getComponent('#login_button').isVisible()).to.equal(true)
  })
})
