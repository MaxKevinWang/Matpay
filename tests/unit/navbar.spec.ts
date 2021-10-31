import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'
import { expect } from 'chai'

describe('Test navbar', () => {
  it('a Rooms tab exists', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.text()).to.include('Rooms')
  })
  it('a Login tab exists', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.text()).to.include('Rooms')
  })
})
