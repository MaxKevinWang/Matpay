import { MatrixRoomEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'

export interface GETLoginResponse {
  flows: [{
    type: string
  }]
}

export interface POSTLoginResponse {
  user_id: string,
  access_token: string,
  device_id: string
}

export interface GETJoinedRoomsResponse {
  joined_rooms: [string]
}

export interface GETRoomEventsResponse {
  start: string,
  end: string,
  chunk: MatrixRoomEvent[],
  state: MatrixRoomStateEvent[]
}

export interface POSTRoomCreateResponse {
  room_id: MatrixRoomID
}

export interface PUTRoomEventSendResponse {
  event_id: MatrixEventID
}

export interface POSTFilterCreateResponse {
  filter_id: string
}
