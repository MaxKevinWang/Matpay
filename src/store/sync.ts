import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixSyncResponse } from '@/interface/sync.interface'
import axios from 'axios'
import { MatrixEventID } from '@/models/id.model'

interface State {
  next_batch: string,
  current_filter_id: string | undefined,
  current_response: MatrixSyncResponse | null,
  processed_events: Set<MatrixEventID>
}
export const sync_store = {
  namespaced: true,
  state () : State {
    return {
      next_batch: '',
      current_filter_id: undefined,
      current_response: null,
      processed_events: new Set()
    }
  },
  mutations: <MutationTree<State>> {
    mutation_set_next_batch (state: State, payload: {next_batch: string}) {
      state.next_batch = payload.next_batch
    },
    mutation_set_filter_id (state: State, payload: { filter_id: string }) {
      state.current_filter_id = payload.filter_id
    },
    mutation_set_current_response (state: State, payload: MatrixSyncResponse) {
      state.current_response = payload
    },
    mutation_add_processed_event (state: State, payload: MatrixEventID) {
      state.processed_events.add(payload)
    }
  },
  actions: <ActionTree<State, any>> {
    async action_sync_state ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      continue_batch?: boolean,
      full_state?: boolean,
      timeout?: number
    }) {
      const continue_batch = payload.continue_batch
      const full_state = payload.full_state || false
      const timeout = payload.timeout || 0
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.get<MatrixSyncResponse>(`${homeserver}/_matrix/client/r0/sync`, {
        params: {
          filter: state.current_filter_id,
          since: continue_batch ? state.next_batch : undefined,
          full_state: full_state,
          timeout: timeout
        }
      })
      commit('mutation_set_next_batch', { next_batch: response.data.next_batch })
      commit('mutation_set_current_response', response.data)
      // push changes to other stores here.
    }
  },
  getters: <GetterTree<State, any>>{
  }
}
