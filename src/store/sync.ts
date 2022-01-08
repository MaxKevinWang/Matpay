import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixSyncResponse } from '@/interface/sync.interface'
import axios from 'axios'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { MatrixRoomEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { RoomEventFilter } from '@/interface/filter.interface'
import { GETRoomEventsResponse } from '@/interface/api.interface'
import { MatrixError } from '@/interface/error.interface'

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
    },
    mutation_room_sync_state_incomplete (state: State, payload: MatrixRoomID) {
      state.room_sync_complete[payload] = false
    },
    mutation_reset_state (state: State) {
      Object.assign(state, {
        next_batch: '',
        current_response: null,
        processed_events_id: new Set(),
        room_events: {},
        room_state_events: {},
        init_state_complete: false,
        room_prev_batch_id: {},
        room_sync_complete: {}
      })
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
        // Parse invited rooms
        // Note: **NONE** state events are parsed in this stage.
        if (response.data.rooms && response.data.rooms.invite) {
          dispatch('rooms/action_parse_invited_rooms', response.data.rooms.invite, { root: true })
        }
        if (response.data.rooms && response.data.rooms.join) {
          // 1. create room structure for every existing room
          for (const room_id of Object.keys(response.data.rooms.join)) {
            commit('mutation_create_new_room', room_id)
          }
          // 2. Parse existing events
          for (const room_id of Object.keys(response.data.rooms.join)) {
            // state events first
            // this ensures that when init is marked true, basic room information can be displayed.
            const state_response = await axios.get<MatrixRoomStateEvent[]>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/state`)
            for (const event of state_response.data) {
              if (!state.processed_events_id.has(event.event_id)) {
                commit('mutation_process_event', {
                  room_id: room_id,
                  event: event
                })
              }
            }
          }
          commit('mutation_init_state_complete')
          // Then pass single events
          for (const [room_id, room_data] of Object.entries(response.data.rooms.join)) {
            const timeline = room_data.timeline
            commit('mutation_set_room_prev_batch', {
              room_id: room_id,
              prev_batch: timeline.prev_batch
            })
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
      }
    },
    /**
     * This function attempts to pull full events for a room.
     * It starts from the prev batch ID of the initial sync and repeatedly calls message APIs until nothing returns.
     * Since tx events must be parsed in a forward direction, this function cannot start event processing until all events are fetched.
     * Therefore, this action consumes heavy resources and should NOT be frequently called, normally once per room.
     * A boolean toggle is used to switch off getting chat messages, so save resource in chatty rooms.
     */
    async action_sync_full_events_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      tx_only: boolean
    }) {
      const room_id = payload.room_id
      if (state.init_state_complete && !state.room_sync_complete[room_id]) {
        const homeserver = rootGetters['auth/homeserver']
        let filter_tx_only: RoomEventFilter | undefined
        if (payload.tx_only) {
          filter_tx_only = {
            types: [
              'com.matpay.*'
            ]
          }
        }
        let prev_batch = state.room_prev_batch_id[room_id]
        const events: MatrixRoomEvent[] = []
        let current_length = 0
        // repeatedly polling message API for earlier events
        do {
          const response = await axios.get<GETRoomEventsResponse>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/messages`, {
            params: {
              from: prev_batch,
              dir: 'b',
              filter: filter_tx_only ? JSON.stringify(filter_tx_only) : undefined
            },
            validateStatus: () => true
          })
          if (response.status !== 200) {
            throw new Error((response.data as unknown as MatrixError).error)
          }
          if (response.data.chunk.length > 0) {
            current_length = response.data.chunk.length
            prev_batch = response.data.end
            for (const event of response.data.chunk) {
              events.push(event)
            }
          } else {
            current_length = 0
          }
        } while (current_length !== 0)
        // reverse, event processing
        events.reverse()
        for (const event of events) {
          if (!state.processed_events_id.has(event.event_id)) {
            commit('mutation_process_event', {
              room_id: room_id,
              event: event
            })
          }
        }
        // mark as complete
        commit('mutation_room_sync_state_complete', room_id)
      }
    },
    /**
     * This action polls the Sync API once to get batch update.
     * It accepts a timeout parameter.
     * If the timeout is not given, it requests Sync API to give an immediate response.
     * This mode should be used for other stores to notify update after an action.
     * If the timeout is givem, it requests Sync API to wait for a certain time for updates.
     * This mode should be used for the application itself to periodically listen for updates.
     * WARNING:
     * This action polls new events only for fully synced rooms.
     * Transaction events should only be processed after a full sync, which may not be done when this function is called.
     * WARNING:
     * This action currently continues events directly from the last sync point.
     * If a gap is created, this action DOES NOT currently call Messages API.
     */
    async action_update_state ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      timeout?: number
    }) {
      if (state.init_state_complete) {
        const homeserver = rootGetters['auth/homeserver']
        const response = await axios.get<MatrixSyncResponse>(`${homeserver}/_matrix/client/r0/sync`, {
          params: {
            full_state: true,
            timeout: payload ? payload.timeout : undefined,
            since: state.next_batch
          }
        })
        commit('mutation_set_next_batch', { next_batch: response.data.next_batch })
        commit('mutation_set_current_response', response.data)
        if (response.data.rooms && response.data.rooms.join) {
          // 1. create room structure for every new room
          for (const room_id of Object.keys(response.data.rooms.join)) {
            if (!Object.keys(state.room_events).includes(room_id)) {
              commit('mutation_create_new_room', room_id)
            }
          }
          // TODO: process invited rooms
          // Then pass single events
          for (const [room_id, room_data] of Object.entries(response.data.rooms.join)) {
            const timeline = room_data.timeline
            /*
            commit('mutation_set_room_prev_batch', {
              room_id: room_id,
              prev_batch: timeline.prev_batch
            })
             */
            // then all events
            for (const event of timeline.events) {
              console.log(event)
              if (state.room_sync_complete[room_id]) { // only update full synced rooms
                if (!state.processed_events_id.has(event.event_id)) {
                  commit('mutation_process_event', {
                    room_id: room_id,
                    event: event
                  })
                }
              }
            }
          }
        }
      }
    },
    async action_resync_initial_state ({
      state,
      commit,
      dispatch,
      rootGetters
    }) {
      // A brute force implementation for resyncing after room creation and invitation accepting.
      commit('mutation_room_sync_state_incomplete')
      dispatch('action_sync_initial_state')
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
