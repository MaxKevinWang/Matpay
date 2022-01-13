import { newStore } from '@/store/index'
import { Room } from '@/models/room.model'
import { mount, shallowMount } from '@vue/test-utils'
import Rooms from '@/tabs/Rooms.vue'
import { nextTick } from 'vue'
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
