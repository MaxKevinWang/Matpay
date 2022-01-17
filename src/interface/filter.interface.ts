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

export interface EventFilter {
  limit? : number,
  not_senders? : string[],
  not_types?: string[],
  senders?: string[],
  types?: string[]
}

export interface RoomFilter {
  not_rooms?: string[],
  rooms?: string[],
  ephemeral?: RoomEventFilter,
  include_leave?: boolean,
  state?: RoomEventFilter,
  timeline?: RoomEventFilter,
  account_data?: RoomEventFilter
}
