import { config, flushPromises, mount, shallowMount } from '@vue/test-utils'
import Rooms from '@/tabs/Rooms.vue'
import { split_percentage, sum_amount, to_currency_display } from '@/utils/utils'
import { createStore } from 'vuex'
import { user_1 } from '../mocks/mocked_user'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
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
          getters: {
            user_id: () => user_1.user_id
          }
        },
        rooms: {
          namespaced: true,
          state () {
            return {
              joined_rooms: [
                {
                  room_id: 'aaa',
                  name: 'Room1',
                  state_events: [
                    {
                      type: 'm.room.power_levels',
                      state_key: '',
                      content: {
                        '@test-1:dsn.tm.kit.edu': {
                          users: 100
                        }
                      },
                      room_id: 'aaa',
                      sender: user_1.user_id,
                      origin_server_ts: 0,
                      event_id: 'id'
                    }
                  ]
                }
              ],
              invited_rooms: []
            }
          },
          getters: {
            get_all_joined_rooms: (state) => () => state.joined_rooms,
            get_invited_rooms: () => []
          },
          actions: {
            action_create_room: () => 'No',
            action_accept_invitation_for_room: () => 'No',
            action_reject_invitation_for_room: () => 'No'
          }
        },
        sync: {
          namespaced: true,
          getters: {
            is_initial_sync_complete: () => 'No'
          },
          actions: {
            action_sync_initial_state: () => 'No'
          }
        }
      }
    })
    it('Test one room', async () => {
      let redirected = false
      const wrapper = shallowMount(Rooms, {
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
      await flushPromises()
      await expect(wrapper.findAll('td').filter(i => i.element.innerHTML.includes('Room1')).length).toBe(1)
    })
  })
})
