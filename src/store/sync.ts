import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixSyncResponse } from '@/interface/sync.interface'
import axios from 'axios'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { MatrixRoomEvent, MatrixRoomJoinRulesStateEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { RoomEventFilter } from '@/interface/filter.interface'
import { GETRoomEventsResponse, POSTFilterCreateResponse } from '@/interface/api.interface'
import { MatrixError } from '@/interface/error.interface'
import { TX_EVENT_TYPES, TxEvent } from '@/interface/tx_event.interface'

interface State {
  next_batch: string,
  processed_events_id: Set<MatrixEventID>,
  room_events: Record<MatrixRoomID, Array<MatrixRoomEvent>>,
  room_state_events: Record<MatrixRoomID, Array<MatrixRoomStateEvent>>,
  init_state_complete: boolean,
  room_tx_prev_batch_id: Record<MatrixRoomID, string>,
  room_message_prev_batch_id: Record<MatrixRoomID, string | null>
  room_tx_sync_complete: Record<MatrixRoomID, boolean>,
  cached_tx_events: Record<MatrixRoomID, Array<TxEvent>>,
  sync_filter: string,
  long_poll_controller: AbortController,
  ignored_rooms: Set<MatrixRoomID>
}

export const sync_store = {
  namespaced: true,
  state (): State {
    return {
      next_batch: '',
      processed_events_id: new Set(),
      room_events: {},
      room_state_events: {},
      init_state_complete: false,
      room_tx_prev_batch_id: {},
      room_message_prev_batch_id: {},
      room_tx_sync_complete: {},
      cached_tx_events: {},
      sync_filter: '',
      long_poll_controller: new AbortController(),
      ignored_rooms: new Set()
    }
  },
  mutations: <MutationTree<State>>{
    mutation_set_next_batch (state: State, payload: { next_batch: string }) {
      state.next_batch = payload.next_batch
    },
    mutation_create_new_room (state: State, payload: MatrixRoomID) {
      state.room_events[payload] = []
      state.room_state_events[payload] = []
      state.room_tx_prev_batch_id[payload] = ''
      state.room_tx_sync_complete[payload] = false
      state.cached_tx_events[payload] = []
    },
    mutation_remove_room (state: State, payload: MatrixRoomID) {
      if (state.room_events[payload]) {
        console.log('Destroying room structure for room:', payload)
        // Important: remove parsed events
        const parsed_message_event_id = state.room_events[payload].filter(i => i.room_id === payload).map(i => i.event_id)
        const parsed_state_event_id = state.room_state_events[payload].filter(i => i.room_id === payload).map(i => i.event_id)
        const cached_event_id = state.cached_tx_events[payload].filter(i => i.room_id === payload).map(i => i.event_id)
        for (const event_id of parsed_message_event_id) {
          state.processed_events_id.delete(event_id)
        }
        for (const event_id of parsed_state_event_id) {
          state.processed_events_id.delete(event_id)
        }
        for (const event_id of cached_event_id) {
          state.processed_events_id.delete(event_id)
        }
        delete state.room_events[payload]
        delete state.room_state_events[payload]
        delete state.room_tx_prev_batch_id[payload]
        delete state.room_tx_sync_complete[payload]
        delete state.cached_tx_events[payload]
        delete state.room_message_prev_batch_id[payload]
      } else {
        console.log('Room already destroyed.')
      }
    },
    mutation_add_cached_tx_event (state: State, payload: {
      room_id: MatrixRoomID,
      event: TxEvent
    }) {
      const index = state.cached_tx_events[payload.room_id].findIndex(i => i.event_id === payload.event.event_id)
      if (index === -1) {
        // cache only when not found
        state.cached_tx_events[payload.room_id].push(payload.event)
      }
    },
    mutation_remove_cached_tx_event (state: State, payload: {
      room_id: MatrixRoomID,
      event_id: MatrixEventID
    }) {
      const index = state.cached_tx_events[payload.room_id].findIndex(i => i.event_id === payload.event_id)
      if (index !== -1) {
        state.cached_tx_events[payload.room_id].splice(index, 1)
      }
    },
    mutation_process_event (state: State, payload: {
      room_id: MatrixRoomID,
      event: MatrixRoomEvent
    }) {
      const event = payload.event
      if (!event.room_id) {
        event.room_id = payload.room_id
      }
      if ('state_key' in payload.event) {
        state.room_state_events[payload.room_id].push(event as MatrixRoomStateEvent)
      } else {
        state.room_events[payload.room_id].push(event)
      }
      if (payload.event.event_id) {
        state.processed_events_id.add(event.event_id)
      }
    },
    mutation_init_state_complete (state: State) {
      console.log('Init state completed.')
      state.init_state_complete = true
      state.long_poll_controller = new AbortController()
    },
    mutation_init_state_incomplete (state: State) {
      console.log('Init state reset to incomplete. Aborting current long poll.')
      state.init_state_complete = false
      // Abort current long poll
      state.long_poll_controller.abort()
      state.long_poll_controller = new AbortController()
    },
    mutation_set_room_tx_prev_batch (state: State, payload: {
      room_id: MatrixRoomID,
      prev_batch: string
    }) {
      state.room_tx_prev_batch_id[payload.room_id] = payload.prev_batch
    },
    mutation_set_room_msg_prev_batch (state: State, payload: {
      room_id: MatrixRoomID,
      prev_batch: string | null
    }) {
      state.room_message_prev_batch_id[payload.room_id] = payload.prev_batch
    },
    mutation_room_tx_sync_state_complete (state: State, payload: MatrixRoomID) {
      state.room_tx_sync_complete[payload] = true
    },
    mutation_set_sync_filter (state: State, payload: string) {
      state.sync_filter = payload
    },
    mutation_add_ignored_room (state: State, payload: MatrixRoomID) {
      state.ignored_rooms.add(payload)
    },
    mutation_reset_state (state: State) {
      Object.assign(state, {
        next_batch: '',
        processed_events_id: new Set(),
        room_events: {},
        room_state_events: {},
        init_state_complete: false,
        room_tx_prev_batch_id: {},
        room_message_prev_batch_id: {},
        room_tx_sync_complete: {},
        cached_tx_events: {},
        sync_filter: '',
        long_poll_controller: new AbortController(),
        ignored_rooms: new Set()
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
        const user_id = rootGetters['auth/user_id']
        // create a filter
        const response_filter = await axios.post<POSTFilterCreateResponse>(`${homeserver}/_matrix/client/r0/user/${user_id}/filter`, {
          room: {
            timeline: {
              limit: 20,
              lazy_load_members: true,
              types: [
                'm.room.*',
                'com.matpay.*'
              ],
              not_types: [
                'm.room.encrypted'
              ]
            },
            state: {
              lazy_load_members: true,
              not_types: ['*']
            },
            ephemeral: {
              not_types: ['*']
            }
          },
          presence: {
            not_types: ['*']
          },
          account_data: {
            not_types: ['*']
          }
        })
        commit('mutation_set_sync_filter', response_filter.data.filter_id)
        const response = await axios.get<MatrixSyncResponse>(`${homeserver}/_matrix/client/r0/sync`, {
          params: {
            filter: state.sync_filter,
            timeout: 0
          }
        })
        commit('mutation_set_next_batch', { next_batch: response.data.next_batch })
        if (response.data.rooms) {
          // Parse invited rooms
          // Note: **NONE** state events are parsed in this stage.
          if (response.data.rooms.invite) {
            dispatch('rooms/action_parse_invited_rooms', response.data.rooms.invite, { root: true })
          }
          if (response.data.rooms.join) {
            // ignore public rooms
            const promises_room_type_async: Promise<any>[] = []
            for (const room_id of Object.keys(response.data.rooms.join)) {
              promises_room_type_async.push(axios.get<MatrixRoomJoinRulesStateEvent['content']>(`${homeserver}/_matrix/client/v3/rooms/${room_id}/state/m.room.join_rules/`)
                .then((state_response) => {
                  if (state_response.status !== 200 || state_response.data.join_rule === 'public') {
                    commit('mutation_add_ignored_room', room_id)
                  }
                })
              )
            }
            await Promise.all(promises_room_type_async)
            commit('mutation_init_state_complete')
            const promises_room_async: Promise<any>[] = []
            for (const room_id of Object.keys(response.data.rooms.join).filter(i => !state.ignored_rooms.has(i))) {
              promises_room_async.push(axios.get<MatrixRoomStateEvent[]>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/state`)
                .then((state_response) => {
                  // 1. create room structure for every existing room
                  commit('mutation_create_new_room', room_id)
                  // state events first
                  // this ensures that when init is marked true, basic room information can be displayed.
                  for (const event of state_response.data) {
                    if (!state.processed_events_id.has(event.event_id)) {
                      commit('mutation_process_event', {
                        room_id: room_id,
                        event: event
                      })
                    }
                  }
                })
              )
            }
            await Promise.all(promises_room_async)
            // Wait for user info be ready
            await dispatch('rooms/action_parse_state_events_for_all_rooms', null, { root: true })
            // Start long polling
            dispatch('action_update_state', {
              timeout: 10000
            })
            // Then pass single events
            const promises_event_async: Promise<any>[] = []
            for (const [room_id, room_data] of Object.entries(response.data.rooms.join).filter(i => !state.ignored_rooms.has(i[0]))) {
              promises_room_async.push(new Promise(() => {
                // parse account data
                const account_data = room_data.account_data
                const timeline = room_data.timeline
                commit('mutation_set_room_tx_prev_batch', {
                  room_id: room_id,
                  prev_batch: timeline.prev_batch
                })
                commit('mutation_set_room_msg_prev_batch', {
                  room_id: room_id,
                  prev_batch: timeline.prev_batch
                })
                // then account data for rejection
                for (const event of account_data.events) {
                  commit('mutation_process_event', {
                    room_id: room_id,
                    event: event
                  })
                }
                // then all events
                for (const event of timeline.events) {
                  if (TX_EVENT_TYPES.includes(event.type)) { // Don't parse tx events at this stage, cache them
                    commit('mutation_add_cached_tx_event', {
                      room_id: room_id,
                      event: event as TxEvent
                    })
                    continue
                  }
                  if (!state.processed_events_id.has(event.event_id)) {
                    commit('mutation_process_event', {
                      room_id: room_id,
                      event: event
                    })
                  }
                }
              }))
            }
          } else {
            commit('mutation_init_state_complete')
          }
        } else {
          commit('mutation_init_state_complete')
        }
      }
    },
    /**
     * This function attempts to pull full tx events for a room.
     * It starts from the prev batch ID of the initial sync and repeatedly calls message APIs until nothing returns.
     * Since tx events must be parsed in a forward direction, this function cannot start event processing until all events are fetched.
     * Therefore, this action consumes heavy resources and should NOT be frequently called, normally once per room.
     */
    async action_sync_full_tx_events_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      const room_id = payload.room_id
      if (state.init_state_complete && !state.room_tx_sync_complete[room_id]) {
        const homeserver = rootGetters['auth/homeserver']
        const filter_tx_only: RoomEventFilter = {
          types: TX_EVENT_TYPES
        }
        let prev_batch = state.room_tx_prev_batch_id[room_id]
        let events: MatrixRoomEvent[] = []
        let current_length = 0
        // repeatedly polling message API for earlier events
        do {
          const response = await axios.get<GETRoomEventsResponse>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/messages`, {
            params: {
              from: prev_batch,
              dir: 'b',
              filter: JSON.stringify(filter_tx_only)
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
        // merge the cached events
        const current_cached = [...state.cached_tx_events[room_id]]
        events = events.concat(current_cached)
        for (const cached_tx_event of current_cached) {
          commit('mutation_remove_cached_tx_event', {
            room_id: room_id,
            event_id: cached_tx_event.event_id
          })
        }
        // reverse, event processing
        events.sort((a, b) => a.origin_server_ts - b.origin_server_ts)
        console.log('Start processing events')
        for (const event of events) {
          console.log('Events: ', events)
          if (!state.processed_events_id.has(event.event_id)) {
            console.log('Processing event: ')
            console.log(event)
            commit('mutation_process_event', {
              room_id: room_id,
              event: event
            })
          }
        }
        // mark as complete
        commit('mutation_room_tx_sync_state_complete', room_id)
      }
    },
    /**
     * This function syncs chat message events for room.
     * If there is less than 30 chat messages, this function syncs all the way to the end.
     * Otherwise, this action ends after receiving 30 chat messages.
     * Calling this action again pushes another 30 messages forward.
     */
    async action_sync_batch_message_events_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      const room_id = payload.room_id
      if (state.init_state_complete) {
        if (!state.room_message_prev_batch_id[room_id]) {
          // prev batch empty, sync is completed, do nothing
          return
        }
        const homeserver = rootGetters['auth/homeserver']
        const filter_message_only: RoomEventFilter = {
          types: [
            'm.room.message'
          ]
        }
        const prev_batch = state.room_message_prev_batch_id[room_id] as string
        // repeatedly polling message API for earlier events
        const response = await axios.get<GETRoomEventsResponse>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/messages`, {
          params: {
            from: prev_batch,
            dir: 'b',
            filter: JSON.stringify(filter_message_only),
            limit: 30
          },
          validateStatus: () => true
        })
        if (response.status !== 200) {
          throw new Error((response.data as unknown as MatrixError).error)
        }
        if (response.data.chunk.length > 0) {
          commit('mutation_set_room_msg_prev_batch', {
            room_id: room_id,
            prev_batch: response.data.end
          })
          for (const event of response.data.chunk) {
            if (!state.processed_events_id.has(event.event_id)) {
              commit('mutation_process_event', {
                room_id: room_id,
                event: event
              })
            }
          }
        } else {
          // Reached end of messsages
          commit('mutation_set_room_msg_prev_batch', {
            room_id: room_id,
            prev_batch: null
          })
        }
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
      console.log('Long poll action entered.')
      if (state.init_state_complete) {
        console.log('Init state completed. Long poll will now start.')
        const homeserver = rootGetters['auth/homeserver']
        try {
          const response = await axios.get<MatrixSyncResponse>(`${homeserver}/_matrix/client/r0/sync`, {
            params: {
              // full_state: true,
              timeout: payload ? payload.timeout : undefined,
              since: state.next_batch,
              filter: state.sync_filter
            },
            signal: state.long_poll_controller.signal
          })
          commit('mutation_set_next_batch', { next_batch: response.data.next_batch })
          if (response.data.rooms && response.data.rooms.join) {
            // 1. create room structure for every new room
            for (const room_id of Object.keys(response.data.rooms.join).filter(i => !state.ignored_rooms.has(i))) {
              if (!Object.keys(state.room_events).includes(room_id)) {
                // discard public room
                const join_rules_response = await axios.get<MatrixRoomJoinRulesStateEvent['content']>(`${homeserver}/_matrix/client/v3/rooms/${room_id}/state/m.room.join_rules/`)
                if (join_rules_response.status !== 200 || join_rules_response.data.join_rule === 'public') {
                  commit('mutation_add_ignored_room', room_id)
                  continue
                }
                // wait for initial state of this new root
                await dispatch('action_resync_initial_state_for_room', {
                  room_id: room_id
                })
              }
            }
            // Then pass single events
            for (const [room_id, room_data] of Object.entries(response.data.rooms.join).filter(i => !state.ignored_rooms.has(i[0]))) {
              const tx_sync_complete = state.room_tx_sync_complete[room_id]
              const timeline = room_data.timeline
              const account_data = room_data.account_data
              for (const event of account_data.events) {
                commit('mutation_process_event', {
                  room_id: room_id,
                  event: event
                })
              }
              // parse cached events
              const current_cached = [...state.cached_tx_events[room_id]]
              if (tx_sync_complete && current_cached.length > 0) {
                for (const cached_tx_event of current_cached) {
                  if (!state.processed_events_id.has(cached_tx_event.event_id)) {
                    commit('mutation_process_event', {
                      room_id: room_id,
                      event: cached_tx_event
                    })
                    commit('mutation_remove_cached_tx_event', {
                      room_id: room_id,
                      event_id: cached_tx_event.event_id
                    })
                  }
                }
              }
              // then all events
              for (const event of timeline.events) {
                console.log(event)
                if (TX_EVENT_TYPES.includes(event.type)) { // transaction events
                  // For transaction events, we are only able to process them after full sync
                  // So we differentiate 2 cases
                  if (tx_sync_complete) {
                    // For full synced rooms: parse immediately
                    if (!state.processed_events_id.has(event.event_id)) {
                      commit('mutation_process_event', {
                        room_id: room_id,
                        event: event
                      })
                    }
                  } else {
                    // For not fully synced events: cache them
                    // They will be processed after full sync
                    commit('mutation_add_cached_tx_event', {
                      room_id: room_id,
                      event: event as TxEvent
                    })
                  }
                } else { // chat messages plus new state events
                  if (!state.processed_events_id.has(event.event_id)) {
                    // New chat messages are processed regardless of tx full sync status
                    commit('mutation_process_event', {
                      room_id: room_id,
                      event: event
                    })
                  }
                }
              }
            }
          }
          // Parse invited rooms
          // Note: **NONE** state events are parsed in this stage.
          if (response.data.rooms && response.data.rooms.invite) {
            dispatch('rooms/action_parse_invited_rooms', response.data.rooms.invite, { root: true })
          }
          // Parse left rooms
          // Kick myself out if self leaving is detected
          if (response.data.rooms && response.data.rooms.leave) {
            for (const left_room_id of Object.keys(response.data.rooms.leave)) {
              // don't kick myself if I'm not joined
              if (Object.keys(state.room_events).includes(left_room_id)) {
                dispatch('rooms/action_i_am_kicked_from_room', {
                  room_id: left_room_id
                }, { root: true })
              }
            }
          }
        } catch (e) {
          if ((e as Error).message === 'canceled') {
            console.log('Long poll cancelled.')
          } else {
            console.log('An error occured while performing long poll. Retrying.')
          }
        }
      }
      setTimeout(() => {
        console.log('Long poll ended. Starting next poll.')
        dispatch('action_update_state', {
          timeout: 10000
        })
      }, 1000)
      console.log('Long poll stopped.')
    },
    async action_resync_initial_state_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      /*
      This action is used to resync the state information for a specific room, typically after room creation & invitation.
       */
      if (state.init_state_complete) {
        // Turn off long polling
        commit('mutation_init_state_incomplete')
      }
      const homeserver = rootGetters['auth/homeserver']
      commit('mutation_create_new_room', payload.room_id)
      // perform one additional full sync to retrieve previous batch ids
      const response = await axios.get<MatrixSyncResponse>(`${homeserver}/_matrix/client/r0/sync`, {
        params: {
          since: state.next_batch,
          filter: {
            room: {
              rooms: [payload.room_id],
              timeline: {
                lazy_load_members: true,
                types: [
                  'm.room.*',
                  'com.matpay.*'
                ],
                not_types: [
                  'm.room.encrypted'
                ]
              },
              state: {
                not_types: ['*']
              },
              ephemeral: {
                not_types: ['*']
              }
            },
            presence: {
              not_types: ['*']
            },
            account_data: {
              not_types: ['*']
            }
          }
        }
      })
      // commit('mutation_set_next_batch', { next_batch: response.data.next_batch })
      // only state events
      const state_response = await axios.get<MatrixRoomStateEvent[]>(`${homeserver}/_matrix/client/r0/rooms/${payload.room_id}/state`)
      for (const event of state_response.data) {
        if (!state.processed_events_id.has(event.event_id)) {
          commit('mutation_process_event', {
            room_id: payload.room_id,
            event: event
          })
        }
      }
      await dispatch('rooms/action_parse_state_events_for_room', { room_id: payload.room_id }, { root: true })
      commit('mutation_init_state_complete')
      if (response.data.rooms && response.data.rooms.join) {
        const timeline = response.data.rooms.join[payload.room_id].timeline
        commit('mutation_set_room_tx_prev_batch', {
          room_id: payload.room_id,
          prev_batch: timeline.prev_batch
        })
        commit('mutation_set_room_msg_prev_batch', {
          room_id: payload.room_id,
          prev_batch: timeline.prev_batch
        })
        const account_data = response.data.rooms.join[payload.room_id].account_data
        for (const event of account_data.events) {
          commit('mutation_process_event', {
            room_id: payload.room_id,
            event: event
          })
        }
        for (const event of timeline.events) {
          console.log(event)
          if (TX_EVENT_TYPES.includes(event.type)) { // transaction events
            // For transaction events, we are only able to process them after full sync
            // Here the room cannot be in a fully synced state -> cache them
            commit('mutation_add_cached_tx_event', {
              room_id: payload.room_id,
              event: event as TxEvent
            })
          } else { // chat messages
            if (!state.processed_events_id.has(event.event_id)) {
              // New chat messages are processed regardless of tx full sync status
              commit('mutation_process_event', {
                room_id: payload.room_id,
                event: event
              })
            }
          }
        }
      }
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
      return state.room_tx_sync_complete[room_id]
    },
    is_chat_sync_complete:
      (state: State) => (room_id: MatrixRoomID): boolean => {
        return !state.room_message_prev_batch_id[room_id]
      }
  }
}

export default {
  state: sync_store.state,
  mutations: sync_store.mutations,
  actions: sync_store.actions,
  getters: sync_store.getters
}
