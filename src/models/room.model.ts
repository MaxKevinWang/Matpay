import { MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { MatrixRoomID } from '@/models/id.model'

export interface Room {
  room_id: MatrixRoomID,
  name: string,
  state_events: MatrixRoomStateEvent[]
}

export interface RoomTableRow {
  room_id: string,
  room_id_display: string,
  name: string
  member_count: number
  user_type: string
}
