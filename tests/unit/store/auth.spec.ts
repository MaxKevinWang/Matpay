import store from '@/store/auth'
import { test_account1, test_homeserver } from '../../test_utils'
import axios from 'axios'

interface State {
  user_id: string
  homeserver: string
  access_token: string
  device_id: string | undefined
}

describe('Test Vuex Store auth', () => {
  describe('Test mutations', () => {
    let state: State = {
      access_token: '',
      homeserver: '',
      user_id: '',
      device_id: undefined
    }
    beforeEach(() => {
      state = {
        user_id: '',
        homeserver: '',
        access_token: '',
        device_id: ''
      }
    })
    it('Test mutation mutation_login', () => {
      store.mutations.mutation_login(state, {
        user_id: 'aaa',
        homeserver: 'bbb',
        access_token: 'ccc',
        device_id: 'ddd'
      })
      expect(state.user_id).toBe('aaa')
      expect(state.homeserver).toBe('bbb')
      expect(state.access_token).toBe('ccc')
      expect(state.device_id).toBe('ddd')
      expect(localStorage.getItem('user_id')).toBe('aaa')
      expect(localStorage.getItem('homeserver')).toBe('bbb')
      expect(localStorage.getItem('access_token')).toBe('ccc')
      expect(localStorage.getItem('device_id')).toBe('ddd')
    })
    it('Test mutation mutation_logout', () => {
      state.access_token = 'ccc'
      store.mutations.mutation_logout(state)
      expect(state.access_token).toBe('')
      expect(localStorage.getItem('access_token')).toBeFalsy()
    })
  })
  describe('Test actions', () => {
    it('Test action action_login success', async () => {
      const action_login = store.actions.action_login as (context: any, payload: any) => Promise<any>
      let result = false
      const commit = () => {
        result = true
      }
      await action_login({
        state: {
          device_id: ''
        },
        commit: commit
      }, {
        username: test_account1.username,
        password: test_account1.password,
        homeserver: test_homeserver
      })
      expect(result).toBeTruthy()
    })
    it('Test action action_login fail', async () => {
      const action_login = store.actions.action_login as (context: any, payload: any) => Promise<any>
      let result = false
      const commit = () => {
        result = true
      }
      await expect(
        action_login({
          state: {
            device_id: ''
          },
          commit: commit
        }, {
          username: test_account1.username,
          password: 'aaaa',
          homeserver: test_homeserver
        })).rejects.toThrowError()
      expect(result).toBeFalsy()
    })
    it('Test action logout', async () => {
      const action_login = store.actions.action_login as (context: any, payload: any) => Promise<any>
      const action_logout = store.actions.action_logout as (context: any, payload: any) => Promise<any>
      let test_access_token = ''
      // set up axios interceptor
      axios.interceptors.request.use(function (config) {
        if (test_access_token !== '') {
          if (!config.headers) {
            config.headers = {}
          }
          config.headers.Authorization = 'Bearer ' + test_access_token
        }
        return config
      }, function (error) {
        return Promise.reject(error)
      })
      const commit = (str: string, payload: {access_token: string}) => {
        test_access_token = payload.access_token
      }
      // login
      await action_login({
        state: {
          device_id: ''
        },
        commit: commit
      }, {
        username: test_account1.username,
        password: test_account1.password,
        homeserver: test_homeserver
      })
      expect(test_access_token).toBeTruthy()
      // logout
      await action_logout({
        state: {
          homeserver: test_homeserver,
          device_id: ''
        },
        commit: jest.fn()
      }, {})
      await expect(
        axios.get(`${test_homeserver}/_matrix/client/r0/sync`)
      ).rejects.toThrowError()
    })
  })
})
