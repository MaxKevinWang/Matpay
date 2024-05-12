import RoomDetail from '@/views/RoomDetail.vue'
import { createStore } from 'vuex'
import { MatrixRoomMemberStateEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { createMemoryHistory, createRouter } from 'vue-router'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { RoomUserInfo } from '@/models/user.model'
import { room_01_user_info } from '../mocks/mocked_user'

describe('Test Room Detail View', () => {
  let load_chat = false
  let sync_state = false
  let sync_tx = false
  const store = createStore({
    modules: {
      rooms: {
        namespaced: true,
        getters: {
          get_member_state_events_for_room: () => () : MatrixRoomMemberStateEvent[] => [{
            type: 'm.room.member',
            content: {
              avatar_url: '',
              displayname: 'DSN Test Account No 1',
              membership: 'join'
            },
            state_key: 'aaa',
            room_id: 'aaa',
            sender: '@test-1:dsn.tm.kit.edu',
            origin_server_ts: 0,
            event_id: ''
          }],
          get_room_name: () => () => 'Room1',
          get_permission_event_for_room: () => (): MatrixRoomStateEvent => {
            return {
              state_key: 'aaa',
              room_id: 'aaa',
              sender: '@test-1:dsn.tm.kit.edu',
              origin_server_ts: 0,
              event_id: '',
              content: {
                avatar_url: '',
                displayname: 'DSN Test Account No 1',
                membership: 'join'
              },
              type: 'm.room.power_level'
            }
          },
          get_joined_status_for_room: () => () => true
        }
      },
      user: {
        namespaced: true,
        getters: {
          get_all_users_info_for_room: () => (): Array<RoomUserInfo> => room_01_user_info
        }
      },
      sync: {
        namespaced: true,
        getters: {
          is_chat_sync_complete: () => () => false
        },
        actions: {
          action_sync_initial_state: () => { sync_state = true },
          action_sync_full_tx_events_for_room: () => { sync_tx = true },
          action_sync_batch_message_events_for_room: () => { load_chat = true }
        }
      }
    }
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{
      path: '/room/:room_id',
      name: 'room_detail',
      component: RoomDetail
    }]
  })
  beforeEach(() => {
    load_chat = false
    sync_state = false
    sync_tx = false
  })
  it('Redirected to correct room', async () => {
    await router.push({
      name: 'room_detail',
      params: {
        room_id: 'aaa'
      }
    })
    await router.isReady()
    const wrapper = shallowMount(RoomDetail, {
      global: {
        plugins: [store, router]
      }
    })
    await flushPromises()
    expect(wrapper.vm.room_id).toEqual('aaa')
    await expect(wrapper.find('h2').element.innerHTML.includes('Room: Room1')).toBe(true)
  })
  it('Test room gets initialized properly', async () => {
    const wrapper = shallowMount(RoomDetail, {
      global: {
        plugins: [store],
        mocks: {
          $route: {
            params: {
              room_id: 'aaa'
            }
          }
        }
      }
    })
    await flushPromises()
    expect(wrapper.vm.users_info).toBeArrayOfSize(3)
    expect(wrapper.vm.users_info[0]).toEqual(room_01_user_info[0])
    expect(wrapper.vm.users_info[1]).toEqual(room_01_user_info[1])
    expect(wrapper.vm.users_info[2]).toEqual(room_01_user_info[2])
    expect(wrapper.vm.room_name).toEqual('Room1')
    expect(wrapper.find('h2').element.innerHTML.includes('Room1')).toBe(true)
    expect(sync_state).toBeTruthy()
    expect(sync_tx).toBeTruthy()
  })
  it('Test pressing button load further chat messages', async () => {
    const wrapper = shallowMount(RoomDetail, {
      global: {
        plugins: [store],
        mocks: {
          $route: {
            params: {
              room_id: 'aaa'
            }
          }
        }
      }
    })
    wrapper.vm.$data.is_tx_fully_loaded = true
    await flushPromises()
    await wrapper.findAll('.btn').filter(i => i.element.innerHTML.includes('Load previous chat messages'))[0].trigger('click')
    await flushPromises()
    expect(load_chat).toBeTruthy()
  })
  it('Test emitted error', async () => {
    const wrapper = shallowMount(RoomDetail, {
      global: {
        plugins: [store],
        mocks: {
          $route: {
            params: {
              room_id: 'aaa'
            }
          }
        }
      }
    })
    wrapper.vm.on_error('Message Box could not be loaded.')
    await flushPromises()
    expect(wrapper.vm.error).toEqual('Message Box could not be loaded.')
    expect(wrapper.findAll('.alert').filter(i => i.element.innerHTML.includes('Message Box could not be loaded.')).length).toBe(1)
  })
  it('Test User is not a joined member of the room', async () => {
    const store_2 = createStore({
      modules: {
        rooms: {
          namespaced: true,
          getters: {
            get_member_state_events_for_room: () => () : MatrixRoomMemberStateEvent[] => [],
            get_room_name: () => () => 'Room1',
            get_permission_event_for_room: jest.fn(),
            get_joined_status_for_room: () => () => false
          }
        },
        user: {
          namespaced: true,
          getters: {
            get_all_users_info_for_room: () => (): Array<RoomUserInfo> => room_01_user_info
          }
        },
        sync: {
          namespaced: true,
          getters: {
            is_chat_sync_complete: () => () => false
          },
          actions: {
            action_sync_initial_state: jest.fn(),
            action_sync_full_tx_events_for_room: jest.fn(),
            action_sync_batch_message_events_for_room: jest.fn()
          }
        }
      }
    })
    let not_joined = 0
    const wrapper = shallowMount(RoomDetail, {
      global: {
        plugins: [store_2],
        mocks: {
          $route: {
            params: {
              room_id: 'aaa'
            }
          },
          $router: {
            push: () => {
              not_joined = 1
            }
          }
        }
      }
    })
    await wrapper.vm.$nextTick()
    await flushPromises()
    expect(not_joined).toBe(1)
  })
  it('Test initializing users_info and room_name fails', async () => {
    const store_3 = createStore({
      modules: {
        rooms: {
          namespaced: true,
          getters: {
            get_member_state_events_for_room: () => () : MatrixRoomMemberStateEvent[] => [{
              type: 'm.room.member',
              content: {
                avatar_url: '',
                displayname: 'DSN Test Account No 1',
                membership: 'join'
              },
              state_key: 'aaa',
              room_id: 'aaa',
              sender: '@test-1:dsn.tm.kit.edu',
              origin_server_ts: 0,
              event_id: ''
            }],
            get_room_name: () => () => { throw new Error('Returning room name failed!') },
            get_permission_event_for_room: () => (): MatrixRoomStateEvent => {
              return {
                state_key: 'aaa',
                room_id: 'aaa',
                sender: '@test-1:dsn.tm.kit.edu',
                origin_server_ts: 0,
                event_id: '',
                content: {
                  avatar_url: '',
                  displayname: 'DSN Test Account No 1',
                  membership: 'join'
                },
                type: 'm.room.power_level'
              }
            },
            get_joined_status_for_room: () => () => true
          }
        },
        user: {
          namespaced: true,
          getters: {
            get_all_users_info_for_room: () => (): Array<RoomUserInfo> => { throw new Error('Users info could not be returned!') }
          }
        },
        sync: {
          namespaced: true,
          getters: {
            is_chat_sync_complete: () => () => false
          },
          actions: {
            action_sync_initial_state: jest.fn(),
            action_sync_full_tx_events_for_room: jest.fn(),
            action_sync_batch_message_events_for_room: jest.fn()
          }
        }
      }
    })
    const wrapper = shallowMount(RoomDetail, {
      global: {
        plugins: [store_3],
        mocks: {
          $route: {
            params: {
              room_id: 'aaa'
            }
          }
        }
      }
    })
    expect(wrapper.vm.users_info).toEqual([])
    expect(wrapper.vm.room_name).toBe('Loading...')
  })
})
