import { MatrixUserID } from '@/models/id.model'

export interface User {
  user_id: MatrixUserID,
  displayname: string
}

export const KICKED_USER : User = {
  user_id: '',
  displayname: 'Left User'
}
export type RoomUserInfo = {
  user: User,
  displayname: string, // displayname after resolving conflicts. Different from user.displayname.
  user_type: 'Admin' | 'Moderator' | 'Member'
  is_self: boolean,
  avatar_url?: string
}
