import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'

export interface MatrixEvent {
  content: Record<string, unknown>,
  type: string
}

export interface MatrixRoomEvent extends MatrixEvent {
  room_id: MatrixRoomID,
  sender: MatrixUserID,
  origin_server_ts: number,
  event_id: MatrixEventID,
}

export interface MatrixRoomStateEvent extends MatrixRoomEvent {
  state_key: string,
  prev_content?: Record<string, unknown>
}
export interface MatrixRoomStrippedEvent extends MatrixRoomStateEvent {
  prev_content: never,
  event_id: never,
  origin_server_ts: never,
  room_id: never
}
export interface MatrixRoomMemberStateEvent extends MatrixRoomStateEvent {
  type: 'm.room.member',
  content: {
    avatar_url: string,
    displayname: string | null,
    membership: 'join' | 'invite' | 'leave' | 'ban' | 'knock'
    third_party_invite?: {
      display_name: string
    }
  }
}

export interface MatrixRoomPermissionConfiguration extends Record<string, unknown> {
  ban: number,
  events: Record<MatrixEventID, number>,
  events_default: number,
  invite: number,
  kick: number,
  redact: number,
  state_default: number,
  users_default: number,
  users: Record<MatrixUserID, number>
}
