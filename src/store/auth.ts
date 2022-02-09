import { ActionTree, createStore, GetterTree, MutationTree, StoreOptions } from 'vuex'
import axios from 'axios'
import { GETLoginResponse, POSTLoginResponse } from '@/interface/api.interface'
import { MatrixError } from '@/interface/error.interface'

interface State {
  user_id: string
  homeserver: string
  access_token: string
  device_id: string | undefined
}

export const auth_store = {
  namespaced: true,
  state (): State {
    return {
      user_id: localStorage.getItem('user_id') || '',
      homeserver: localStorage.getItem('homeserver') || '',
      access_token: localStorage.getItem('access_token') || '',
      device_id: localStorage.getItem('device_id') || undefined
    }
  },
  mutations: <MutationTree<State>>{
    mutation_login (state, payload: State): void {
      state.user_id = payload.user_id
      state.homeserver = payload.homeserver
      state.access_token = payload.access_token
      state.device_id = payload.device_id
      localStorage.setItem('user_id', state.user_id)
      localStorage.setItem('access_token', state.access_token)
      localStorage.setItem('device_id', state.device_id!)
      localStorage.setItem('homeserver', state.homeserver)
    },
    mutation_logout (state: State): void {
      state.access_token = ''
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_id')
    }
  },
  actions: <ActionTree<State, any>>{
    async action_login ({
      state,
      commit
    }, payload: {
      username: string,
      password: string,
      homeserver: string
    }) {
      const response_get = await axios.get<GETLoginResponse>(`${payload.homeserver}/_matrix/client/r0/login`)
      if (!response_get.data.flows.map(i => i.type).includes('m.login.password')) {
        throw new Error('Homeserver does not support password authentication')
      } else {
        const response_post = await axios.post<POSTLoginResponse>(`${payload.homeserver}/_matrix/client/r0/login`, {
          type: 'm.login.password',
          identifier: {
            type: 'm.id.user',
            user: payload.username
          },
          password: payload.password,
          device_id: state.device_id
        }, {
          validateStatus: () => true // Always resolve unless we throw an error manually
        })
        if (response_post.status === 200) {
          commit('mutation_login', {
            user_id: response_post.data.user_id,
            access_token: response_post.data.access_token,
            device_id: response_post.data.device_id,
            homeserver: payload.homeserver
          })
        } else {
          const error = response_post.data as unknown as MatrixError
          throw new Error(error.error)
        }
      }
    },
    async action_logout ({
      state,
      commit
    }) {
      await axios.post(`${state.homeserver}/_matrix/client/r0/logout`)
      commit('mutation_logout')
    }
  },
  getters: <GetterTree<State, any>>{
    device_id (state: State): string | undefined {
      return state.device_id
    },
    is_logged_in (state: State): boolean {
      return state.access_token !== '' && state.access_token !== undefined
    },
    user_id (state: State): string {
      return state.user_id
    },
    homeserver (state: State): string {
      return state.homeserver
    }
  }
}

// Testing
export default {
  state: auth_store.state,
  mutations: auth_store.mutations,
  actions: auth_store.actions,
  getters: auth_store.getters
}
