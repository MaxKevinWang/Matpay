import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixSyncResponse } from '@/interface/sync.interface'
import axios from 'axios'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { MatrixRoomEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'

interface State {
  next_batch: string,
  current_response: MatrixSyncResponse | null,
  processed_events_id: Set<MatrixEventID>,
  room_events: Record<MatrixRoomID, Array<MatrixRoomEvent>>,
  room_state_events: Record<MatrixRoomID, Array<MatrixRoomStateEvent>>,
  init_state_complete: boolean,
  room_prev_batch_id: Record<MatrixRoomID, string>,
  room_sync_complete: Record<MatrixRoomID, boolean>
}

export const sync_store = {
  namespaced: true,
  state (): State {
    return {
      next_batch: '',
      current_response: null,
      processed_events_id: new Set(),
      room_events: {},
      room_state_events: {},
      init_state_complete: false,
      room_prev_batch_id: {},
      room_sync_complete: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_set_next_batch (state: State, payload: { next_batch: string }) {
      state.next_batch = payload.next_batch
    },
    mutation_set_current_response (state: State, payload: MatrixSyncResponse) {
      state.current_response = payload
    },
    mutation_create_new_room (state: State, payload: MatrixRoomID) {
      state.room_events[payload] = []
      state.room_state_events[payload] = []
      state.room_prev_batch_id[payload] = ''
      state.room_sync_complete[payload] = false
    },
    mutation_process_event (state: State, payload: {
      room_id: MatrixRoomID,
      event: MatrixRoomEvent
    }) {
      state.room_events[payload.room_id].push(payload.event)
      if ('state_key' in payload.event) {
        state.room_state_events[payload.room_id].push(payload.event as MatrixRoomStateEvent)
      }
      state.processed_events_id.add(payload.event.event_id)
    },
    mutation_init_state_complete (state: State) {
      state.init_state_complete = true
    },
    mutation_set_room_prev_batch (state: State, payload: {
      room_id: MatrixRoomID,
      prev_batch: string
    }) {
      state.room_prev_batch_id[payload.room_id] = payload.prev_batch
    },
    mutation_room_sync_state_complete (state: State, payload: MatrixRoomID) {
      state.room_sync_complete[payload] = true
    }
  },
  actions: <ActionTree<State, any>>{
    /**
     * Pulls initial state.
     * This function parses the current Sync result without any further polling.
     * It also does not fully download all events of any room.
     * This action should be called **exactly once** in the lifetime of this application.
     * Make sure that this action is called after a refresh.
     */
    async action_sync_initial_state ({
      state,
      commit,
      dispatch,
      rootGetters
    }) {
      if (!state.init_state_complete) {
        const homeserver = rootGetters['auth/homeserver']
        const response = await axios.get<MatrixSyncResponse>(`${homeserver}/_matrix/client/r0/sync`, {
          params: {
            full_state: true
          }
        })
        commit('mutation_set_next_batch', { next_batch: response.data.next_batch })
        commit('mutation_set_current_response', response.data)
        if (response.data.rooms && response.data.rooms.join) {
          // 1. create room structure for every existing room
          for (const room_id of Object.keys(response.data.rooms.join)) {
            commit('mutation_create_new_room', room_id)
          }
          // 2. Parse existing events
          for (const [room_id, room_data] of Object.entries(response.data.rooms.join)) {
            const timeline = room_data.timeline
            commit('mutation_set_room_prev_batch', {
              room_id: room_id,
              prev_batch: timeline.prev_batch
            })
            // state events first
            // this ensures that when init is marked true, basic room information can be displayed.
            for (const event of room_data.state.events) {
              if (!state.processed_events_id.has(event.event_id)) {
                commit('mutation_process_event', {
                  room_id: room_id,
                  event: event
                })
              }
            }
            // then all events
            for (const event of timeline.events) {
              if (!state.processed_events_id.has(event.event_id)) {
                commit('mutation_process_event', {
                  room_id: room_id,
                  event: event
                })
              }
            }
          }
        }
        // TODO: process invited rooms
        commit('mutation_init_state_complete')
      }
    },
    async action_sync_full_state_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      console.log()
    },
    async action_update_state ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      timeout?: number
    }) {
      console.log()
    }
  },
  getters: <GetterTree<State, any>>{
    get_next_batch_id (state: State): string {
      return state.next_batch
    },
    is_initial_sync_complete (state: State): boolean {
      return state.init_state_complete
    },
    is_room_synced: (state: State) => (room_id: MatrixRoomID): boolean => {
      return state.room_sync_complete[room_id]
    }
  }
}
