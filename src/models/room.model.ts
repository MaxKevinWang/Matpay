import { User } from '@/models/user.model'
import { MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { MatrixRoomID } from '@/models/id.model'

export interface Room {
  room_id: MatrixRoomID,
  name: string,
  state_events: MatrixRoomStateEvent[]
}
