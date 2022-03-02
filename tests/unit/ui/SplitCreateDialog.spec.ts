import { newStore } from '@/store/index'
import { config, flushPromises, shallowMount } from '@vue/test-utils'
import SplitCreateDialog from '@/dialogs/SplitCreateDialog.vue'
import { selectorify, split_percentage, sum_amount, to_currency_display } from '@/utils/utils'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import bootstrap from 'bootstrap'
import { MatrixUserID } from '@/models/id.model'

jest.mock('bootstrap')
const mockedBootstrap = bootstrap as jest.Mocked<typeof bootstrap>
describe('Test for SplitCreateDialog', () => {
  let store = newStore()
  let popover_error = false
  beforeEach(() => {
    store = newStore()
    mockedBootstrap.Popover.mockImplementationOnce(function (element, options) {
      popover_error = true
      return new bootstrap.Popover(element, options)
    })
    popover_error = false
  })
  beforeAll(() => {
    config.global.mocks = {
      sum_amount: sum_amount,
      split_percentage: split_percentage,
      to_currency_display: to_currency_display,
      selectorify: selectorify
    }
  })
  it('Test if every user is displayed', async () => {
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_2,
            displayname: user_2.displayname,
            user_type: 'Member',
            is_self: false
          }
        ]
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    const tx2 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_2.user_id)
    expect(wrapper.findAll('.input-group')).toHaveLength(2)
    expect(tx1[0].element.innerHTML.includes('DSN Test Account No 1')).toEqual(true)
    expect(tx2[0].element.innerHTML.includes('DSN Test Account No 2')).toEqual(true)
  })
  it('Test input bar is disabled then the user is not selected', async () => {
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          }
        ]
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    expect((tx1[0].find(`#split-perc${selectorify(user_1.user_id)}`).element as HTMLInputElement).disabled).toEqual(true)
  })
  it('Test error popover for none number input', async () => {
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          }
        ]
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    await tx1[0].find(`#split-checkbox${selectorify(user_1.user_id)}`).trigger('click')
    await tx1[0].find(`#split-perc${selectorify(user_1.user_id)}`).setValue('asdasd')
    await wrapper.find('#split_create_save').trigger('click')
    expect(popover_error).toEqual(true)
  })
  it('Test error popover sum not 100', async () => {
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_2,
            displayname: user_2.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_3,
            displayname: user_3.displayname,
            user_type: 'Admin',
            is_self: true
          }
        ]
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    const tx2 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_2.user_id)
    const tx3 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_3.user_id)
    await tx1[0].find(`#split-checkbox${selectorify(user_1.user_id)}`).trigger('click')
    await tx2[0].find(`#split-checkbox${selectorify(user_2.user_id)}`).trigger('click')
    await tx3[0].find(`#split-checkbox${selectorify(user_3.user_id)}`).trigger('click')
    await tx1[0].find(`#split-perc${selectorify(user_1.user_id)}`).setValue('33')
    await tx2[0].find(`#split-perc${selectorify(user_2.user_id)}`).setValue('33')
    await tx3[0].find(`#split-perc${selectorify(user_3.user_id)}`).setValue('33')
    await wrapper.find('#split_create_save').trigger('click')
    expect(popover_error).toEqual(true)
  })
  it('Test error popover no user selected', async () => {
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_2,
            displayname: user_2.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_3,
            displayname: user_3.displayname,
            user_type: 'Admin',
            is_self: true
          }
        ]
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    const tx2 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_2.user_id)
    const tx3 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_3.user_id)
    await wrapper.find('#split_create_save').trigger('click')
    expect(popover_error).toEqual(true)
  })
  it('Test error with empty input from selected member', async () => {
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_2,
            displayname: user_2.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_3,
            displayname: user_3.displayname,
            user_type: 'Admin',
            is_self: true
          }
        ]
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    const tx2 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_2.user_id)
    const tx3 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_3.user_id)
    await tx1[0].find(`#split-checkbox${selectorify(user_1.user_id)}`).trigger('click')
    await tx2[0].find(`#split-checkbox${selectorify(user_2.user_id)}`).trigger('click')
    await tx3[0].find(`#split-checkbox${selectorify(user_3.user_id)}`).trigger('click')
    await tx1[0].find(`#split-perc${selectorify(user_1.user_id)}`).setValue('70')
    await tx2[0].find(`#split-perc${selectorify(user_2.user_id)}`).setValue('30')
    await tx3[0].find(`#split-perc${selectorify(user_3.user_id)}`).setValue('')
    await wrapper.find('#split_create_save').trigger('click')
    expect(popover_error).toEqual(true)
  })
  it('Test emit on-save-split', async () => {
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_2,
            displayname: user_2.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_3,
            displayname: user_3.displayname,
            user_type: 'Admin',
            is_self: true
          }
        ]
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    const tx2 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_2.user_id)
    const tx3 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_3.user_id)
    await tx1[0].find(`#split-checkbox${selectorify(user_1.user_id)}`).trigger('click')
    await tx2[0].find(`#split-checkbox${selectorify(user_2.user_id)}`).trigger('click')
    await tx3[0].find(`#split-checkbox${selectorify(user_3.user_id)}`).trigger('click')
    await tx1[0].find(`#split-perc${selectorify(user_1.user_id)}`).setValue('33')
    await tx2[0].find(`#split-perc${selectorify(user_2.user_id)}`).setValue('33')
    await tx3[0].find(`#split-perc${selectorify(user_3.user_id)}`).setValue('34')
    await wrapper.find('#split_create_save').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('on-save-split')
  })
  it('Test default split', async () => {
    /*
    const current_split : Record<MatrixUserID, number> = {}
    current_split[user_1.user_id] = 0
    current_split[user_2.user_id] = 0
    current_split[user_3.user_id] = 0
     */
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        // current_split: current_split,
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_2,
            displayname: user_2.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_3,
            displayname: user_3.displayname,
            user_type: 'Admin',
            is_self: true
          }
        ]
      }
    })
    console.log('Wrapper finished')
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    const tx2 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_2.user_id)
    const tx3 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_3.user_id)
    await wrapper.find(`#split-checkbox${selectorify(user_1.user_id)}`).setValue(true)
    await wrapper.find(`#split-checkbox${selectorify(user_2.user_id)}`).setValue(true)
    await wrapper.find(`#split-checkbox${selectorify(user_3.user_id)}`).setValue(true)
    await wrapper.find('#default-split').trigger('click')
    console.log('Button clicked')
    await flushPromises()
    expect(((tx1[0].find(`#split-perc${selectorify(user_1.user_id)}`).element as HTMLInputElement).value === '33') ||
      ((tx1[0].find(`#split-perc${selectorify(user_1.user_id)}`).element as HTMLInputElement).value === '34')).toBeTruthy()
    expect(((tx2[0].find(`#split-perc${selectorify(user_2.user_id)}`).element as HTMLInputElement).value === '33') ||
      ((tx2[0].find(`#split-perc${selectorify(user_2.user_id)}`).element as HTMLInputElement).value === '34')).toBeTruthy()
    expect(((tx3[0].find(`#split-perc${selectorify(user_3.user_id)}`).element as HTMLInputElement).value === '33') ||
      ((tx3[0].find(`#split-perc${selectorify(user_3.user_id)}`).element as HTMLInputElement).value === '34')).toBeTruthy()
  })
  it('Test current split', async () => {
    const current_split : Record<MatrixUserID, number> = {}
    current_split[user_1.user_id] = 0
    current_split[user_2.user_id] = 0
    current_split[user_3.user_id] = 0
    const wrapper = shallowMount(SplitCreateDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        current_split: current_split,
        users_info: [
          {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_2,
            displayname: user_2.displayname,
            user_type: 'Admin',
            is_self: true
          },
          {
            user: user_3,
            displayname: user_3.displayname,
            user_type: 'Admin',
            is_self: true
          }
        ]
      }
    })
    console.log('Wrapper finished')
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_1.user_id)
    const tx2 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_2.user_id)
    const tx3 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === user_3.user_id)
    await wrapper.find(`#split-checkbox${selectorify(user_1.user_id)}`).setValue(true)
    await wrapper.find(`#split-checkbox${selectorify(user_2.user_id)}`).setValue(true)
    await wrapper.find(`#split-checkbox${selectorify(user_3.user_id)}`).setValue(true)
    await flushPromises()
    expect((tx1[0].find(`#split-perc${selectorify(user_1.user_id)}`).element as HTMLInputElement).value === '0').toBeTruthy()
    expect((tx2[0].find(`#split-perc${selectorify(user_2.user_id)}`).element as HTMLInputElement).value === '0').toBeTruthy()
    expect((tx3[0].find(`#split-perc${selectorify(user_3.user_id)}`).element as HTMLInputElement).value === '0').toBeTruthy()
  })
})
