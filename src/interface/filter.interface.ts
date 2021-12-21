export interface RoomEventFilter {
  limit? : number,
  not_senders? : string[],
  not_types?: string[],
  senders?: string[],
  types?: string[],
  lazy_load_members?: boolean
  include_redundant_members?: boolean
  not_rooms?: string[],
  rooms?: string[],
  contains_url?: boolean
}
