import RoomDetail from '@/views/RoomDetail.vue'
import { createStore } from 'vuex'
import { MatrixRoomMemberStateEvent } from '@/interface/rooms_event.interface'
import { createMemoryHistory, createRouter } from 'vue-router'
import { flushPromises, mount } from '@vue/test-utils'

describe('Test Room Detail View', () => {
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
          get_room_name: () => () => 'Room1'
        }
      },
      user: {
        namespaced: true,
        getters: {
          get_users_info_for_room: () => () => [{
            user: {
              user_id: '@test-1:dsn.tm.kit.edu',
              displayname: 'DSN Test Account No 1'
            },
            displayname: 'DSN Test Account No 1',
            user_type: 'Admin',
            is_self: true
          }]
        }
      },
      sync: {
        namespaced: true,
        getters: {
          is_chat_sync_complete: () => () => true
        }
      },
      auth: {

      }
    }
  })
  store.dispatch = jest.fn()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{
      path: '/room/:room_id',
      name: 'room_detail',
      component: RoomDetail
    }]
  })
  it('', async () => {
    await router.push({
      name: 'room_detail',
      params: {
        room_id: 'aaa'
      }
    })
    await router.isReady()
    const wrapper = mount(RoomDetail, {
      global: {
        plugins: [store, router]
      }
    })
    await flushPromises()
    await expect(wrapper.find('h2')).toContain('Room: Room1')
  })
})
