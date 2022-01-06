import store from '@/store/user'
import { RoomUserInfo, User } from '@/models/user.model'
import { MatrixRoomID } from '@/models/id.model'
import { MatrixRoomPermissionConfiguration } from '@/interface/rooms_event.interface'
interface State {
  users_info: Record<MatrixRoomID, Array<RoomUserInfo>>,
  permissions: Record<MatrixRoomID, MatrixRoomPermissionConfiguration>
}

describe('Test user store', function () {
  describe('Test store mutation', function () {
    const room_id : MatrixRoomID = '!ABC:@dsn.kit.edu'
    let state : State = {
      users_info: {
        
      },
      permissions: {

      }
    }
  })
})
