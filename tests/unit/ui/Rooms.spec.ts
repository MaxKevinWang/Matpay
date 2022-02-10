import { config, flushPromises, shallowMount } from '@vue/test-utils'
import Rooms from '@/tabs/Rooms.vue'
import { split_percentage, sum_amount, to_currency_display } from '@/utils/utils'
import { createStore } from 'vuex'
import { user_1 } from '../mocks/mocked_user'

describe('Test Rooms Tab', () => {
  beforeAll(() => {
    config.global.mocks = {
      sum_amount: sum_amount,
      split_percentage: split_percentage,
      to_currency_display: to_currency_display
    }
  })
  describe('Test Joined Rooms Tab display correctness (Load User State 1)', () => {
    const store = createStore({
      modules: {
        auth: {
          namespaced: true,
          state () {
            return {
              user_id: user_1.user_id
            }
          },
          getters: {
            user_id: (state): string => state.user_id
          }
        },
        rooms: {
          namespaced: true,
          state () {
            return {
              joined_rooms: [],
              invited_rooms: []
            }
          },
          getters: {
            get_room_table_rows: () => [{
              room_id: 'aaa',
              room_id_display: 'aaa',
              name: 'Room1',
              member_count: 1,
              user_type: 'admin'
            }],
            get_invited_rooms: (state) => () => state.invited_rooms
          },
          actions: {
            action_create_room: jest.fn(),
            action_accept_invitation_for_room: jest.fn(),
            action_reject_invitation_for_room: jest.fn()
          }
        },
        sync: {
          namespaced: true,
          state () {
            return {
              init_state_complete: true
            }
          },
          getters: {
            is_initial_sync_complete: (state): boolean => state.init_state_complete
          },
          actions: {
            action_sync_initial_state: jest.fn()
          }
        }
      }
    })
    it('Test one room', async () => {
      const wrapper = shallowMount(Rooms, {
        global: {
          plugins: [store],
          mocks: {
            $route: {
              query: {
                not_joined: false
              }
            }
          }
        }
      })
      await flushPromises()
      await expect(wrapper.findAll('td').filter(i => i.element.innerHTML.includes('Room1')).length).toBe(1)
    })
    it('Test clicking Detail redirects', async () => {
      let redirected = false
      const wrapper = shallowMount(Rooms, {
        global: {
          plugins: [store],
          mocks: {
            $router: {
              push: () => {
                redirected = true
              }
            },
            $route: {
              query: {
                not_joined: false
              }
            }
          }
        }
      })
      await flushPromises()
      await wrapper.find('#RoomDetailButton').trigger('click')
      await flushPromises()
      expect(redirected).toBe(true)
      expect(wrapper.vm.error).toEqual(null)
    })
    it('Test clicking History redirects', async () => {
      let redirected = false
      const wrapper = shallowMount(Rooms, {
        global: {
          plugins: [store],
          mocks: {
            $router: {
              push: () => {
                redirected = true
              }
            },
            $route: {
              query: {
                not_joined: false
              }
            }
          }
        }
      })
      await flushPromises()
      await wrapper.find('#RoomHistoryButton').trigger('click')
      await flushPromises()
      expect(redirected).toBe(true)
      expect(wrapper.vm.error).toEqual(null)
    })
    it('Test no longer in the room error', async () => {
      const wrapper = shallowMount(Rooms, {
        global: {
          plugins: [store],
          mocks: {
            $route: {
              query: {
                not_joined: true
              }
            }
          }
        }
      })
      await flushPromises()
      expect(wrapper.findAll('.alert').filter(i => i.element.innerHTML.includes('Error: You are no longer member of the room!')).length).toBe(1)
      expect(wrapper.vm.error).toEqual('Error: You are no longer member of the room!')
    })
  })
  describe('Test Invitation', function () {
    it('Test accept invitation', async () => {
      let action_called = false
      const store_2 = createStore({
        modules: {
          auth: {
            namespaced: true,
            state () {
              return {
                user_id: user_1.user_id
              }
            },
            getters: {
              user_id: (state): string => state.user_id
            }
          },
          rooms: {
            namespaced: true,
            state () {
              return {
                joined_rooms: [],
                invited_rooms: []
              }
            },
            getters: {
              get_room_table_rows: (state) => state.joined_rooms,
              get_invited_rooms: () => () => [{
                room_id: 'aaa',
                room_id_display: 'aaa',
                name: 'Room1',
                member_count: 1,
                user_type: 'admin'
              }]
            },
            actions: {
              action_create_room: jest.fn(),
              action_accept_invitation_for_room: () => { action_called = true },
              action_reject_invitation_for_room: jest.fn()
            }
          },
          sync: {
            namespaced: true,
            state () {
              return {
                init_state_complete: true
              }
            },
            getters: {
              is_initial_sync_complete: (state): boolean => state.init_state_complete
            },
            actions: {
              action_sync_initial_state: jest.fn()
            }
          }
        }
      })
      let redirected = false
      const wrapper = shallowMount(Rooms, {
        global: {
          plugins: [store_2],
          mocks: {
            $router: {
              push: () => {
                redirected = true
              }
            },
            $route: {
              query: {
                not_joined: false
              }
            }
          }
        }
      })
      await flushPromises()
      await wrapper.findAll('button').filter(i => i.element.innerHTML.includes('Accept'))[0].trigger('click')
      await flushPromises()
      expect(action_called).toBe(true)
      expect(redirected).toBe(true)
    })
    it('Test reject invitation', async () => {
      let action_called = false
      const store_2 = createStore({
        modules: {
          auth: {
            namespaced: true,
            state () {
              return {
                user_id: user_1.user_id
              }
            },
            getters: {
              user_id: (state): string => state.user_id
            }
          },
          rooms: {
            namespaced: true,
            state () {
              return {
                joined_rooms: [],
                invited_rooms: []
              }
            },
            getters: {
              get_room_table_rows: (state) => state.joined_rooms,
              get_invited_rooms: () => () => [{
                room_id: 'aaa',
                room_id_display: 'aaa',
                name: 'Room1',
                member_count: 1,
                user_type: 'admin'
              }]
            },
            actions: {
              action_create_room: jest.fn(),
              action_accept_invitation_for_room: jest.fn(),
              action_reject_invitation_for_room: () => { action_called = true }
            }
          },
          sync: {
            namespaced: true,
            state () {
              return {
                init_state_complete: true
              }
            },
            getters: {
              is_initial_sync_complete: (state): boolean => state.init_state_complete
            },
            actions: {
              action_sync_initial_state: jest.fn()
            }
          }
        }
      })
      const wrapper = shallowMount(Rooms, {
        global: {
          plugins: [store_2],
          mocks: {
            $route: {
              query: {
                not_joined: false
              }
            }
          }
        }
      })
      await flushPromises()
      await wrapper.findAll('button').filter(i => i.element.innerHTML.includes('Reject'))[0].trigger('click')
      await flushPromises()
      expect(action_called).toBe(true)
    })
  })
  describe('Test creating new room (including CreateRoomDialog)', function () {
    // added later
  })
})
