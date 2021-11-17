import { shallowMount, VueWrapper } from '@vue/test-utils'
import App from '@/App.vue'
import router from '@/router'

describe('Test navbar', function () {
  let wrapper: VueWrapper<any>
  beforeEach(function () {
    wrapper = shallowMount(App, {
      global: {
        plugins: [router]
      }
    })
  })
  it('a Rooms tab exists', function () {
    expect(wrapper.text()).toContain('Rooms')
  })
  it('Login button shows correctly when logged in', function () {
    wrapper.vm.$store.commit('auth/mutation_login', {
      user_id: 'test_user_id',
      homeserver: 'fsdf',
      access_token: 'fsdf',
      device_id: 'fsdf'
    })
    expect(wrapper.getComponent('#logout_button').isVisible()).toEqual(true)
  })

  it('Login button shows correctly when not logged in', function () {
    wrapper.vm.$store.commit('auth/mutation_logout')
    expect(wrapper.getComponent('#login_button').isVisible()).toEqual(true)
  })
})
