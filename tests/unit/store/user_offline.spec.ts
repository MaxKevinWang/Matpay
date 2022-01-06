import store from '@/store/user'
import { RoomUserInfo, User } from '@/models/user.model'
import { MatrixRoomID } from '@/models/id.model'
import { MatrixRoomPermissionConfiguration } from '@/interface/rooms_event.interface'
interface State {
  users_info: Record<MatrixRoomID, Array<RoomUserInfo>>,
  permissions: Record<MatrixRoomID, MatrixRoomPermissionConfiguration>
}
