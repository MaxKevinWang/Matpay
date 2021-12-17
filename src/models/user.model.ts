import { MatrixUserID } from '@/models/id.model'

export interface User {
  user_id: MatrixUserID,
  displayname: string
}
export type RoomUserInfo = {
  user: User,
  displayname: string, // displayname after resolving conflicts. Different from user.displayname.
  user_type: 'Admin' | 'Moderator' | 'Member'
  is_self: boolean,
  avatar_url?: string,
  balance: number
}
