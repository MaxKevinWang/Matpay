import {
  MatrixEvent,
  MatrixRoomEvent,
  MatrixRoomStateEvent,
  MatrixRoomStrippedEvent
} from '@/interface/RoomsEvent.interface'

export interface MatrixSyncRequestParam {
  filter?: string,
  since?: string,
  full_state?: boolean,
  set_presence?: 'offline' | 'online' | 'unavailable',
  timeout?: number
}
export interface MatrixSyncRoomSummary {
  'm.heroes': string[],
  'm.joined_member_count': number,
  'm.invited_member_count': number
}
export interface MatrixSyncEphemeral {
  events: MatrixEvent[]
}
export interface MatrixSyncTimeline {
  events: MatrixRoomEvent[],
  limited: boolean,
  prev_batch: string
}
export interface MatrixSyncAccountData {
  events: MatrixEvent[]
}
export interface MatrixSyncInvitedRooms {
  invite_state: {
    events: MatrixRoomStrippedEvent[]
  }
}
export interface MatrixSyncJoinedRooms {
  [roomId: string]: {
    summary: MatrixSyncRoomSummary,
    state: {
      events: MatrixRoomStateEvent[]
    },
    timeline: MatrixSyncTimeline,
    ephemeral: MatrixSyncEphemeral,
    account_data: MatrixSyncAccountData
  }
}
export interface MatrixSyncLeftRooms {
  state: {
    events: MatrixRoomStateEvent[]
  },
  timeline: MatrixSyncTimeline,
  account_data: MatrixSyncAccountData
}
export interface MatrixSyncPresence {
  events: MatrixEvent[]
}

export interface MatrixSyncResponse {
  next_batch: string,
  rooms?: {
    join?: MatrixSyncJoinedRooms,
    invite?: MatrixSyncInvitedRooms,
    leave?: MatrixSyncLeftRooms
  },
  presence?: MatrixSyncPresence,
  account_data?: MatrixSyncAccountData
}
