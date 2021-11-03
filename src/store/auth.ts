interface State {
  user_id: string
  homeserver: string
  access_token: string
  device_id: string
}

export const auth_store = {
  namespaced: true,
  state () : State {
    return {
      user_id: localStorage.getItem('user_id') || '',
      homeserver: localStorage.getItem('homeserver') || '',
      access_token: localStorage.getItem('access_token') || '',
      device_id: localStorage.getItem('device_id') || ''
    }
  },
  mutations: {
    mutation_login (state: State, payload: State) : void {
      state.user_id = payload.user_id
      state.homeserver = payload.homeserver
      state.access_token = payload.access_token
      state.device_id = payload.device_id
      localStorage.setItem('user_id', state.user_id)
      localStorage.setItem('access_token', state.access_token)
      localStorage.setItem('device_id', state.device_id)
      localStorage.setItem('homeserver', state.homeserver)
    },
    mutation_logout (state: State) : void {
      state.access_token = ''
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_id')
    }
  },
  actions: {
  },
  getters: {
    device_id (state : State) : string | undefined {
      return state.device_id === '' ? undefined : state.device_id
    },
    is_logged_in (state : State) : boolean {
      return state.access_token !== ''
    },
    user_id (state : State) : string {
      return state.user_id
    },
    homeserver (state : State) : string {
      return state.homeserver
    }
  }
}
