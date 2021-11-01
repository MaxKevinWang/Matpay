import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'
import { expect } from 'chai'

describe('Test navbar', function () {
  it('a Rooms tab exists', function () {
    const wrapper = shallowMount(App).get('nav')
    expect(wrapper.text()).to.include('Rooms')
  })
  it('a Login tab exists', function () {
    const wrapper = shallowMount(App).get('nav')
    expect(wrapper.text()).to.include('Rooms')
  })
  /*
  it('Login button shows correctly when logged in', function () {

  })
   */
  it('Login button shows correctly when not logged in', function () {
    const wrapper = shallowMount(App).get('nav')
    expect(wrapper.text()).to.include('Login')
  })
})
