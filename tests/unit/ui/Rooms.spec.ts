import { newStore } from '@/store/index'
import { Room } from '@/models/room.model'
import { config, mount, shallowMount } from '@vue/test-utils'
import Rooms from '@/tabs/Rooms.vue'
import { nextTick } from 'vue'
import { split_percentage, sum_amount, to_currency_display } from '@/main'
beforeAll(() => {
  config.global.mocks = {
    sum_amount: sum_amount,
    split_percentage: split_percentage,
    to_currency_display: to_currency_display
  }
})
describe('Test Rooms Tab', () => {
  describe('Test Joined Rooms Tab display correctness (Load User State 1)', () => {
    let store = newStore()
    beforeEach(() => {
      store = newStore()
    })
    it('Test one room', async () => {
      store.state.rooms.joined_rooms = [
        {
          room_id: 'aaa',
          name: 'Room1',
          state_events: []
        }
      ]
      // store.dispatch = jest.fn()
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
      wrapper.vm.$data.is_loading = false
      await expect(wrapper.findAll('td').filter(i => i.element.innerHTML.includes('Room1')).length).toBe(1)
    })
  })
})
