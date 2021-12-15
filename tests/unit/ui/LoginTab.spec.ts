import { shallowMount } from '@vue/test-utils'
import Login from '@/tabs/Login.vue'
import { test_account2, test_homeserver } from '../../test_utils'
import { createStore } from 'vuex'

describe('Test login interface', () => {
  it('Test login success', async () => {
    let login_performed = false
    let redirected = false
    const store = createStore({
      modules: {
        auth: {
          namespaced: true,
          actions: {
            action_login: () => {
              login_performed = true
            }
          },
          getters: {
            device_id: () => ''
          }
        },
        sync: {
          actions: {
            action_sync_state: jest.fn()
          }
        }
      }
    })
    const wrapper = shallowMount(Login, {
      global: {
        plugins: [store],
        mocks: {
          $router: {
            push: () => {
              redirected = true
            }
          }
        }
      }
    })
    await wrapper.find('#username').setValue(test_account2.username)
    await wrapper.find('#password').setValue(test_account2.password)
    await wrapper.find('#homeserver').setValue(test_homeserver)
    await wrapper.find('#login').trigger('click')
    expect(login_performed).toBe(true)
    expect(wrapper.vm.$data.error).toBe('')
    expect(redirected).toBe(true)
  })
  it('Test login incomplete form', async () => {
    let login_performed = false
    const store = createStore({
      modules: {
        auth: {
          namespaced: true,
          actions: {
            action_login: () => {
              login_performed = true
            }
          },
          getters: {
            device_id: () => ''
          }
        },
        sync: {
          actions: {
            action_sync_state: jest.fn()
          }
        }
      }
    })
    const wrapper = shallowMount(Login, {
      global: {
        plugins: [store]
      }
    })
    await wrapper.find('#username').setValue(test_account2.username)
    await wrapper.find('#homeserver').setValue(test_homeserver)
    await wrapper.find('#login').trigger('click')
    expect(login_performed).toBe(false)
    expect(wrapper.vm.$data.error).toBe('Field missing!')
  })
  it('Test login failure', async () => {
    let login_performed = false
    const store = createStore({
      modules: {
        auth: {
          namespaced: true,
          actions: {
            action_login: () => {
              login_performed = true
              throw new Error('Test error')
            }
          },
          getters: {
            device_id: () => ''
          }
        },
        sync: {
          actions: {
            action_sync_state: jest.fn()
          }
        }
      }
    })
    const wrapper = shallowMount(Login, {
      global: {
        plugins: [store]
      }
    })
    await wrapper.find('#username').setValue(test_account2.username)
    await wrapper.find('#password').setValue(test_account2.password)
    await wrapper.find('#homeserver').setValue(test_homeserver)
    await wrapper.find('#login').trigger('click')
    expect(login_performed).toBe(true)
    expect(wrapper.vm.$data.error).not.toBe('')
  })
})
