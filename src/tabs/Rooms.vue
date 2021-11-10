<template>
  <div class="container">
    <h2>Rooms</h2>
    <div class="alert alert-danger" role="alert" v-if="!room_exists && !is_loading">
      No rooms joined.
    </div>
    <div class="alert alert-primary" role="alert" v-if="is_loading">
      Loading...
    </div>
    <table class="table" v-if="!is_loading && room_exists">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Name</th>
        <th scope="col">Member Count</th>
        <th scope="col">User Type</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="room in rooms" :key="room.room_id">
        <th scope="row">{{ room.room_id_display }}</th>
        <td>{{ room.name }}</td>
        <td>{{ room.member_count }}</td>
        <td>{{ room.user_type }}</td>
        <td>
          <button class="btn btn-primary" @click="enter_room_detail(room.room_id)">Details</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MatrixRoomMemberStateEvent, MatrixRoomStateEvent } from '@/interface/event.interface'
import { mapActions, mapGetters } from 'vuex'

interface RoomTableRow {
  room_id: string,
  room_id_display: string,
  name: string
  member_count: number
  user_type: string
}

type RoomState = {
  room_id: string,
  state_event: MatrixRoomStateEvent[]
}

export default defineComponent({
  name: 'Rooms',
  data () {
    return {
      rooms: [] as RoomTableRow[],
      is_loading: true
    }
  },
  computed: {
    room_exists (): boolean {
      return !!this.rooms && this.rooms.length > 0
    },
    ...mapGetters('auth', [
      'user_id'
    ])
  },
  methods: {
    ...mapActions('rooms', [
      'action_get_all_joined_room_state_events',
      'action_get_joined_rooms'
    ]),
    update_room_table () {
      this.action_get_joined_rooms()
        .then((response: { joined_rooms: [string] }) => {
          // first only list id
          this.rooms = response.joined_rooms.map(room => {
            return {
              room_id: room,
              room_id_display: room.split(':')[0].substring(1),
              name: '',
              member_count: 0,
              user_type: ''
            }
          })
          // then get room details
          return this.action_get_all_joined_room_state_events()
        })
        .then((response: RoomState[]) => {
          for (const room of response) {
            const current_room = this.rooms.filter(i => i.room_id === room.room_id)[0]
            // get room name: state event 'm.room.name'
            const name_event: MatrixRoomStateEvent = room.state_event.filter(
              event => event.type === 'm.room.name'
            )[0]
            current_room.name = name_event ? name_event.content.name as string : '<NO NAME>'
            // count room members: state event 'm.room.member' AND content.membership === join
            const member_join_event: MatrixRoomMemberStateEvent[] = room.state_event.filter(
              event => event.type === 'm.room.member' && event.content.membership as string === 'join'
            ) as MatrixRoomMemberStateEvent[]
            current_room.member_count = member_join_event.length
            // determine user type: if the user can send state events then treat him as admin.
            const power_level_event: MatrixRoomStateEvent = room.state_event.filter(
              event => event.type === 'm.room.power_levels'
            )[0]
            const power_level = (power_level_event.content.users as Record<string, number>)[this.user_id]
            if (power_level >= 100) {
              current_room.user_type = 'Admin'
            } else if (power_level >= 50) {
              current_room.user_type = 'Moderator'
            } else {
              current_room.user_type = 'User'
            }
            // display the table
            this.is_loading = false
          }
        })
    },
    enter_room_detail (room_id: string) {
      this.$router.push({
        name: 'room_detail',
        params: {
          room_id: room_id
        }
      })
    }
  },
  created () {
    this.update_room_table()
  }
})

</script>
<style scoped>

</style>
