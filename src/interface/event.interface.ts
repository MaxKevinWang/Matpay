export interface MatrixEvent {
  content: Record<string, unknown>,
  type: string
}

export interface MatrixRoomEvent extends MatrixEvent {
  room_id: string,
  sender: string,
  origin_server_ts: number,
  state_key: string,
  event_id: string,
  type: string,
}

export interface MatrixRoomStateEvent extends MatrixEvent {
  state_key: string,
  prev_content: Record<string, unknown>
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
  events: Record<string, number>,
  events_default: number,
  invite: number,
  kick: number,
  redact: number,
  state_default: number,
  users_default: number,
  users: Record<string, number>
}
