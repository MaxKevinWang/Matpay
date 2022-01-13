import store, { rooms_store } from '@/store/rooms'
import { Room } from '@/models/room.model'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { uuidgen } from '@/utils/utils'
import { room_01_room_id, user_1, user_aaa } from '../mocks/mocked_user'
import { MatrixSyncInvitedRooms } from '@/interface/sync.interface'
import { MatrixRoomStrippedEvent } from '@/interface/rooms_event.interface'
import axios, { Axios, AxiosInstance, AxiosPromise, AxiosResponse, AxiosStatic } from 'axios'
import { MatrixError } from '@/interface/error.interface'
import { RoomUserInfo } from '@/models/user.model'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

interface State {
  joined_rooms: Room[],
  invited_rooms: Room[]
}

describe('Test rooms store', function () {
  describe('Test store mutation', function () {
    let state: State = {
      joined_rooms: [],
      invited_rooms: []
    }
    const action_parse_member = store.actions.action_parse_member_events_for_room as (context: any, payload: any) => Promise<Array<RoomUserInfo>>
    beforeEach(function () {
      state = {
        joined_rooms: [],
        invited_rooms: []
      }
    })
    it('Test mutation mutation_init_joined_room', function () {
      const mutation = store.mutations.mutation_init_joined_room
      mutation(state, 'ABC')
      expect(state.joined_rooms[0].room_id).toEqual('ABC')
    })
    it('Test mutation mutation_reset_state', function () {
      const mutation = store.mutations.mutation_reset_state
      mutation(state)
      expect(state.joined_rooms).toEqual([])
    })
    it('Test mutation mutation_add_invited_room', function () {
      const mutation = store.mutations.mutation_add_invited_room
      mutation(state, {
        room_id: 'ABC',
        name: 'testName'
      })
      expect(state.invited_rooms[0].room_id).toEqual('ABC')
      expect(state.invited_rooms[0].name).toEqual('testName')
    })
    it('Test mutation mutation_set_name_for_joined_room', function () {
      const mutation = store.mutations.mutation_set_name_for_joined_room
      state.joined_rooms.push({
        room_id: 'ABC',
        name: '',
        state_events: [{
          room_id: 'ABC',
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: uuidgen(),
          content: {},
          type: '',
          state_key: ''
        }]
      })
      mutation(state, {
        room_id: 'ABC',
        name: 'testName'
      })
      const rooms = state.joined_rooms.filter(r => r.room_id === 'ABC')
      expect(rooms[0].name).toEqual('testName')
    })
    it('Test mutation mutation_remove_invite_room', function () {
      const mutation = store.mutations.mutation_remove_invite_room
      state.invited_rooms.push({
        room_id: 'ABC',
        name: '',
        state_events: []
      })
      mutation(state, {
        room_id: 'ABC'
      })
      const rooms = state.invited_rooms.filter(r => r.room_id === 'ABC')
      expect(rooms[0]).toEqual(undefined)
    })
    it('Test mutation mutation_add_state_event_for_joined_room', function () {
      const mutation = store.mutations.mutation_add_state_event_for_joined_room
      state.joined_rooms.push({
        room_id: 'ABC',
        name: '',
        state_events: [{
          room_id: 'ABC',
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: 'test_event',
          content: {},
          type: 'test_type',
          state_key: 'test_key'
        }]
      })
      const rooms_original = state.joined_rooms.filter(r => r.room_id === 'ABC')
      expect(rooms_original[0].state_events.filter(i => i.event_id === 'test_event').length).toEqual(1)
      mutation(state, {
        room_id: 'ABC',
        state_event: {
          room_id: 'ABC',
          sender: user_1.user_id,
          origin_server_ts: 1,
          event_id: 'test_change_event',
          content: {},
          type: 'test_type',
          state_key: 'test_key'
        }
      })
      const rooms = state.joined_rooms.filter(r => r.room_id === 'ABC')
      expect(rooms[0].state_events.filter(i => i.event_id === 'test_event')).toEqual([])
      expect(rooms[0].state_events.filter(i => i.event_id === 'test_change_event').length).toEqual(1)
    })
  })
  describe('Test Actions', function () {
    let state: State = {
      joined_rooms: [],
      invited_rooms: []
    }
    const rootGetters = {
      'auth/homeserver': '!ghjfghkdk:dsn.scc.kit.edu',
      'auth/user_id': '@test-1:dsn.tm.kit.edu'
    }
    beforeEach(function () {
      state = {
        joined_rooms: [],
        invited_rooms: []
      }
    })
    it('Test action_parse_state_events_for_all_rooms(All without name event)', async function () {
      const action = store.actions.action_parse_state_events_for_all_rooms as (context: any, payload: any) => Promise<any>
      state.joined_rooms.push({
        room_id: 'aaa',
        name: '',
        state_events: []
      }, {
        room_id: 'bbb',
        name: '',
        state_events: []
      },
      {
        room_id: 'ccc',
        name: '',
        state_events: []
      })
      const commit_called: Record<MatrixRoomID, boolean> = {
        aaa: false,
        bbb: false,
        ccc: false
      }
      const dispatch_called: Record<MatrixRoomID, boolean> = {
        aaa: false,
        bbb: false,
        ccc: false
      }
      const commit = (commit_name: string, payload: { room_id: MatrixRoomID, name: string }) => {
        if (commit_name === 'mutation_set_name_for_joined_room') {
          commit_called[payload.room_id] = true
        }
      }
      const dispatch = (dispatch_name: string, payload: { room_id: MatrixRoomID, name: string }) => {
        if (dispatch_name === 'user/action_parse_member_events_for_room') {
          dispatch_called[payload.room_id] = true
        }
      }
      await action({
        state,
        commit,
        dispatch,
        getters: {
          get_name_event_for_room: store.getters.get_name_event_for_room(state, null, null, null),
          get_member_state_events_for_room: jest.fn(),
          get_permission_event_for_room: jest.fn()
        }
      }, null)
      expect(commit_called.aaa).toEqual(false)
      expect(commit_called.bbb).toEqual(false)
      expect(commit_called.ccc).toEqual(false)
      expect(dispatch_called.aaa).toEqual(true)
      expect(dispatch_called.bbb).toEqual(true)
      expect(dispatch_called.ccc).toEqual(true)
    })
    it('Test action_parse_state_events_for_all_rooms(With name event)', async function () {
      const action = store.actions.action_parse_state_events_for_all_rooms as (context: any, payload: any) => Promise<any>
      state.joined_rooms.push({
        room_id: 'aaa',
        name: '',
        state_events: [
          {
            room_id: 'abc',
            sender: user_1.user_id,
            origin_server_ts: 0,
            event_id: 'test_event',
            content: {},
            type: 'm.room.name',
            state_key: 'test_key'
          }
        ]
      }, {
        room_id: 'bbb',
        name: '',
        state_events: []
      },
      {
        room_id: 'ccc',
        name: '',
        state_events: []
      })
      const commit_called: Record<MatrixRoomID, boolean> = {
        aaa: false,
        bbb: false,
        ccc: false
      }
      const dispatch_called: Record<MatrixRoomID, boolean> = {
        aaa: false,
        bbb: false,
        ccc: false
      }
      const commit = (commit_name: string, payload: { room_id: MatrixRoomID, name: string }) => {
        if (commit_name === 'mutation_set_name_for_joined_room') {
          commit_called[payload.room_id] = true
        }
      }
      const dispatch = (dispatch_name: string, payload: { room_id: MatrixRoomID, name: string }) => {
        if (dispatch_name === 'user/action_parse_member_events_for_room') {
          dispatch_called[payload.room_id] = true
        }
      }
      await action({
        state,
        commit,
        dispatch,
        getters: {
          get_name_event_for_room: store.getters.get_name_event_for_room(state, null, null, null),
          get_member_state_events_for_room: jest.fn(),
          get_permission_event_for_room: jest.fn()
        }
      }, null)
      expect(commit_called.aaa).toEqual(true)
      expect(commit_called.bbb).toEqual(false)
      expect(commit_called.ccc).toEqual(false)
      expect(dispatch_called.aaa).toEqual(true)
      expect(dispatch_called.bbb).toEqual(true)
      expect(dispatch_called.ccc).toEqual(true)
    })
    it('Test action_parse_invited_rooms', async function () {
      const action = store.actions.action_parse_invited_rooms as (context: any, payload: any) => Promise<any>
      const commit_called: Record<MatrixRoomID, boolean> = {
        aaa: false,
        bbb: false,
        ccc: false
      }
      const commit = (commit_name: string, payload: { room_id: MatrixRoomID, name: string }) => {
        if (commit_name === 'mutation_add_invited_room') {
          commit_called[payload.room_id] = true
        }
      }
      const matrix_sync_invited_rooms: MatrixSyncInvitedRooms = {
        [room_01_room_id]: {
          invite_state: {
            events: [{
              prev_content: {},
              room_id: 'abc',
              sender: user_1.user_id,
              origin_server_ts: 0,
              event_id: 'test_event',
              content: { name: 'fake_room' },
              type: 'm.room.name',
              state_key: 'test_key'
            }]
          }
        }
      }
      await action({
        state,
        commit,
        dispatch: jest.fn(),
        getters: {}
      }, {
        MatrixSyncInvitedRooms: matrix_sync_invited_rooms
      })
      expect(commit_called.aaa).toEqual(true)
      expect(commit_called.bbb).toEqual(true)
      expect(commit_called.ccc).toEqual(true)
      expect(state.invited_rooms.filter(i => i.room_id === room_01_room_id)[0].name).toEqual('fake_room')
    })
    it('Test action_create_room_1', async function () {
      const resp = {
        status: 200,
        data: 'mocked_id'
      }
      const action = store.actions.action_create_room as (context: any, payload: any) => Promise<any>
      mockedAxios.post.mockImplementation(() => Promise.resolve(resp))
      await action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        rootGetters: rootGetters
      }, { room_name: 'test_name' })
      expect(state.joined_rooms.filter(i => i.room_id === room_01_room_id)[0].name).toEqual('test_name')
    })
    it('Test Test action_create_room_2', async () => {
      const resp = {
        status: 400,
        data: 'mocked_id'
      }
      mockedAxios.post.mockImplementation(() => Promise.resolve(resp))
      const action = store.actions.action_create_room as (context: any, payload: any) => Promise<any>
      await expect(() => action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        rootGetters: rootGetters
      }, {
        room_name: 'test_name'
      })).rejects.toThrow()
    })
    it('Test action_accept_invitation_for_room_1', async function () {
      state.joined_rooms.push({
        room_id: 'aaa',
        name: '',
        state_events: []
      }, {
        room_id: 'bbb',
        name: '',
        state_events: []
      },
      {
        room_id: 'ccc',
        name: '',
        state_events: []
      })
      const resp = {
        status: 200,
        data: ''
      }
      const dispatch_called: Record<MatrixRoomID, boolean> = {
        aaa: false,
        bbb: false,
        ccc: false
      }
      const dispatch = (dispatch_name: string, payload: { room_id: MatrixRoomID }) => {
        if (dispatch_name === 'sync/action_resync_initial_state_for_room') {
          dispatch_called[payload.room_id] = true
        }
      }
      const action = store.actions.action_accept_invitation_for_room as (context: any, payload: any) => Promise<any>
      mockedAxios.post.mockImplementation(() => Promise.resolve(resp))
      await action({
        state,
        commit: jest.fn(),
        dispatch,
        rootGetters: rootGetters
      }, { room_id: 'aaa' })
      expect(dispatch_called.aaa).toEqual(true)
      expect(dispatch_called.bbb).toEqual(false)
      expect(dispatch_called.ccc).toEqual(false)
    })
    it('Test action_accept_invitation_for_room_2', async () => {
      const resp = {
        status: 400,
        data: 'mocked_id'
      }
      mockedAxios.post.mockImplementation(() => Promise.resolve(resp))
      const action = store.actions.action_accept_invitation_for_room as (context: any, payload: any) => Promise<any>
      await expect(() => action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        rootGetters: rootGetters
      }, {
        room_name: 'test_name'
      })).rejects.toThrow()
    })
    it('Test action_reject_invitation_for_room_1)', async function () {
      const action = store.actions.action_reject_invitation_for_room as (context: any, payload: any) => Promise<any>
      state.joined_rooms.push({
        room_id: 'aaa',
        name: '',
        state_events: []
      }, {
        room_id: 'bbb',
        name: '',
        state_events: []
      },
      {
        room_id: 'ccc',
        name: '',
        state_events: []
      })
      const resp = {
        status: 200,
        data: ''
      }
      const commit_called: Record<MatrixRoomID, boolean> = {
        aaa: false,
        bbb: false,
        ccc: false
      }
      const commit = (commit_name: string, payload: { room_id: MatrixRoomID }) => {
        if (commit_name === 'mutation_remove_invite_room') {
          commit_called[payload.room_id] = true
        }
      }
      mockedAxios.post.mockImplementation(() => Promise.resolve(resp))
      await action({
        state,
        commit,
        dispatch: jest.fn(),
        rootGetters: rootGetters
      }, { room_id: 'aaa' })
      expect(commit_called.aaa).toEqual(true)
      expect(commit_called.bbb).toEqual(false)
      expect(commit_called.ccc).toEqual(false)
    })
    it('Test action_reject_invitation_for_room_2', async () => {
      const resp = {
        status: 400,
        data: 'mocked_id'
      }
      mockedAxios.post.mockImplementation(() => Promise.resolve(resp))
      const action = store.actions.action_reject_invitation_for_room as (context: any, payload: any) => Promise<any>
      await expect(() => action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        rootGetters: rootGetters
      }, {
        room_name: 'test_name'
      })).rejects.toThrow()
    })
  })
  describe('Test store getters', function () {
    let state: State = {
      joined_rooms: [],
      invited_rooms: []
    }
    beforeEach(function () {
      state = {
        joined_rooms: [],
        invited_rooms: []
      }
    })
    it('Test getter get_room_name', function () {
      const getter = store.getters.get_room_name(state, null, null, null)
      state.joined_rooms.push({
        room_id: 'abc',
        name: 'ABCD',
        state_events: []
      })
      expect(getter('abc')).toEqual('ABCD')
    })
    it('Test get_all_joined_rooms', function () {
      const getter = store.getters.get_all_joined_rooms(state, null, null, null)
      state.joined_rooms.push({
        room_id: 'abc',
        name: 'ABCD',
        state_events: []
      })
      expect(getter()).toEqual([{
        room_id: 'abc',
        name: 'ABCD',
        state_events: []
      }])
    })
    it('Test get_invited_rooms', function () {
      const getter = store.getters.get_invited_rooms(state, null, null, null)
      state.invited_rooms.push({
        room_id: 'abc',
        name: 'ABCD',
        state_events: []
      })
      expect(getter()).toEqual([{
        room_id: 'abc',
        name: 'ABCD',
        state_events: []
      }])
    })
    it('Test get_member_state_events_for_room', function () {
      const getter = store.getters.get_member_state_events_for_room(state, null, null, null)
      state.joined_rooms.push({
        room_id: 'abc',
        name: 'ABCD',
        state_events: [{
          room_id: 'abc',
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: 'test_event',
          content: {},
          type: 'm.room.member',
          state_key: 'test_key'
        }]
      })
      expect(getter('abc')).toEqual([{
        room_id: 'abc',
        sender: user_1.user_id,
        origin_server_ts: 0,
        event_id: 'test_event',
        content: {},
        type: 'm.room.member',
        state_key: 'test_key'
      }])
    })
    it('Test get_permission_event_for_room', function () {
      const getter = store.getters.get_permission_event_for_room(state, null, null, null)
      state.joined_rooms.push({
        room_id: 'abc',
        name: 'ABCD',
        state_events: [{
          room_id: 'abc',
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: 'test_event',
          content: {},
          type: 'm.room.power_levels',
          state_key: 'test_key'
        }]
      })
      expect(getter('abc')).toEqual({
        room_id: 'abc',
        sender: user_1.user_id,
        origin_server_ts: 0,
        event_id: 'test_event',
        content: {},
        type: 'm.room.power_levels',
        state_key: 'test_key'
      })
    })
    it('Test get_name_event_for_room', function () {
      const getter = store.getters.get_name_event_for_room(state, null, null, null)
      state.joined_rooms.push({
        room_id: 'abc',
        name: 'ABCD',
        state_events: [{
          room_id: 'abc',
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: 'test_event',
          content: {},
          type: 'm.room.name',
          state_key: 'test_key'
        }]
      })
      expect(getter('abc')).toEqual({
        room_id: 'abc',
        sender: user_1.user_id,
        origin_server_ts: 0,
        event_id: 'test_event',
        content: {},
        type: 'm.room.name',
        state_key: 'test_key'
      })
    })
    it('Test get_rejected_events_for_room', function () {
      const getter = store.getters.get_rejected_events_for_room(state, null, null, null)
      state.joined_rooms.push({
        room_id: 'abc',
        name: 'ABCD',
        state_events: [{
          room_id: 'abc',
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: 'test_event',
          content: {},
          type: 'com.matpay.rejected',
          state_key: 'test_key'
        }]
      })
      expect(getter('abc')).toEqual({
        room_id: 'abc',
        sender: user_1.user_id,
        origin_server_ts: 0,
        event_id: 'test_event',
        content: {},
        type: 'com.matpay.rejected',
        state_key: 'test_key'
      })
    })
  })
})
