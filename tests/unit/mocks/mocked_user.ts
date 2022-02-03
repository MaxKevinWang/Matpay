import { RoomUserInfo } from '@/models/user.model'
import { MatrixRoomPermissionConfiguration } from '@/interface/rooms_event.interface'

export const user_1 = {
  user_id: '@test-1:dsn.tm.kit.edu',
  displayname: 'DSN Test Account No 1'
}
export const user_3 = {
  user_id: '@test-3:dsn.tm.kit.edu',
  displayname: 'DSN Test Account No 3'
}
export const user_2 = {
  user_id: '@test-2:dsn.tm.kit.edu',
  displayname: 'DSN Test Account No 2'
}
export const user_aaa = {
  user_id: 'aaa',
  displayname: 'DSN Test Account No aaa'
}
export const user_bbb = {
  user_id: 'bbb',
  displayname: 'DSN Test Account No bbb'
}
export const user_ccc = {
  user_id: 'ccc',
  displayname: 'DSN Test Account No ccc'
}
export const user_a = {
  user_id: 'a',
  displayname: 'DSN Test Account No a'
}
export const user_b = {
  user_id: 'b',
  displayname: 'DSN Test Account No b'
}
export const user_c = {
  user_id: 'c',
  displayname: 'DSN Test Account No c'
}
export const user_d = {
  user_id: 'd',
  displayname: 'DSN Test Account No d'
}
export const user_e = {
  user_id: 'e',
  displayname: 'DSN Test Account No e'
}
export const user_f = {
  user_id: 'f',
  displayname: 'DSN Test Account No f'
}
export const room_01_room_id = '!EvvZcelEXcSOJBxJov:dsn.tm.kit.edu'
export const room_01_user_info: Array<RoomUserInfo> = [{
  user: user_1,
  displayname: 'DSN Test Account No 1',
  avatar_url: '',
  is_self: true,
  user_type: 'Member'
}, {
  user: user_3,
  displayname: 'DSN Test Account No 3',
  is_self: false,
  user_type: 'Admin'
}, {
  user: user_2,
  avatar_url: '',
  displayname: 'DSN Test Account No 2',
  is_self: false,
  user_type: 'Member'
}]
export const room_01_left_user_info: Array<RoomUserInfo> = [{
  user: user_aaa,
  displayname: 'DSN Test Account No aaa',
  is_self: false,
  user_type: 'Member'
}]
export const room_01_permission: MatrixRoomPermissionConfiguration = {
  ban: 50,
  events: {},
  events_default: 50,
  invite: 100,
  kick: 100,
  redact: 50,
  state_default: 50,
  users_default: 50,
  users: {}
}
