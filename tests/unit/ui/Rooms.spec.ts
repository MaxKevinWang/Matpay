import { config, flushPromises, shallowMount, mount } from '@vue/test-utils'
import Rooms from '@/tabs/Rooms.vue'
import { split_percentage, sum_amount, to_currency_display } from '@/utils/utils'
import { createStore } from 'vuex'
import { user_1 } from '../mocks/mocked_user'
import CreateRoomDialog from '@/dialogs/CreateRoomDialog.vue'
import bootstrap from 'bootstrap'

jest.mock('bootstrap')
const mockedBootstrap = bootstrap as jest.Mocked<typeof bootstrap>

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
      await expect(wrapper.findAll('th').filter(i => i.element.innerHTML.includes('Room1')).length).toBe(1)
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
    it('Test accept invitation error', async () => {
      const store_5 = createStore({
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
              action_accept_invitation_for_room: () => { throw new Error('Accepting the invitation failed!') },
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
      const wrapper = shallowMount(Rooms, {
        global: {
          plugins: [store_5],
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
      await wrapper.findAll('button').filter(i => i.element.innerHTML.includes('Accept'))[0].trigger('click')
      await flushPromises()
      expect(wrapper.vm.error).toEqual(Error('Accepting the invitation failed!'))
      expect(wrapper.findAll('.alert').filter(i => i.element.innerHTML.includes('Accepting the invitation failed!')).length).toBe(1)
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
    it('Test reject invitation error', async () => {
      const store_6 = createStore({
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
              action_reject_invitation_for_room: () => { throw new Error('You could not reject the invitation!') }
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
          plugins: [store_6],
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
      expect(wrapper.vm.error).toEqual(Error('You could not reject the invitation!'))
      expect(wrapper.findAll('.alert').filter(i => i.element.innerHTML.includes('You could not reject the invitation!')).length).toBe(1)
    })
  })
  describe('Test creating new room (including CreateRoomDialog)', function () {
    let action_called = false
    const store_3 = createStore({
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
            get_invited_rooms: (state) => () => state.invited_rooms
          },
          actions: {
            action_create_room: () => { action_called = true },
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
    let popover_called = false
    beforeEach(() => {
      mockedBootstrap.Popover.mockImplementationOnce(function (element, options) {
        if (element === '#room-name-input') {
          popover_called = true
        }
        return new bootstrap.Popover(element, options)
      })
      popover_called = false
      action_called = false
    })
    it('Test Room Name cannot be empty', async () => {
      const wrapper = shallowMount(CreateRoomDialog, {
        attachTo: document.querySelector('html') as HTMLElement
      })
      await wrapper.find('#room-name-input').setValue('')
      await wrapper.find('#create-room-button').trigger('click')
      expect(popover_called).toBeTruthy()
    })
    it('Test CreateRoomDialog emits correctly', async () => {
      const wrapper = shallowMount(CreateRoomDialog, {
        attachTo: document.querySelector('html') as HTMLElement
      })
      await wrapper.find('#room-name-input').setValue('New_Room')
      await wrapper.find('#create-room-button').trigger('click')
      expect(wrapper.emitted()).toHaveProperty('on-create')
      expect((wrapper.emitted()['on-create'][0] as Array<string>)[0]).toEqual('New_Room')
    })
    it('Test new room gets created', async () => {
      let redirected = false
      const wrapper = mount(Rooms, {
        global: {
          plugins: [store_3],
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
      await wrapper.find('#room-name-input').setValue('New_Room')
      await wrapper.find('#create-room-button').trigger('click')
      expect(action_called).toBeTruthy()
      expect(redirected).toBe(true)
    })
    it('Test creating room throws an error', async () => {
      const store_4 = createStore({
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
              get_invited_rooms: (state) => () => state.invited_rooms
            },
            actions: {
              action_create_room: () => { throw new Error('Oops something went wrong!') },
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
      const wrapper = mount(Rooms, {
        global: {
          plugins: [store_4],
          mocks: {
            $route: {
              query: {
                not_joined: false
              }
            }
          }
        }
      })
      await wrapper.find('#room-name-input').setValue('New_Room')
      await wrapper.find('#create-room-button').trigger('click')
      await flushPromises()
      expect(wrapper.vm.error).toEqual(Error('Oops something went wrong!'))
      expect(wrapper.findAll('.alert').filter(i => i.element.innerHTML.includes('Oops something went wrong!')).length).toBe(1)
    })
  })
})
