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
          <button class="btn btn-info" @click="enter_room_history(room.room_id)">History</button>
        </td>
      </tr>
      </tbody>
    </table>
    <button class="btn btn-primary" @click="on_create_room_click()">Create New Room...</button>
    <CreateRoomDialog ref="create_dialog" @on-create="on_create" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MatrixRoomMemberStateEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { mapActions, mapGetters } from 'vuex'
import { GETJoinedRoomsResponse } from '@/interface/api.interface'
import { Room } from '@/models/room.model'
import { MatrixRoomID } from '@/models/id.model'
import CreateRoomDialog from '@/dialogs/CreateRoomDialog.vue'
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
  components: {
    CreateRoomDialog
  },
  computed: {
    room_exists (): boolean {
      return !!this.rooms && this.rooms.length > 0
    },
    ...mapGetters('auth', [
      'user_id'
    ]),
    ...mapGetters('rooms', [
      'get_all_joined_rooms'
    ]),
    ...mapGetters('sync', [
      'is_initial_sync_complete'
    ])
  },
  methods: {
    ...mapActions('rooms', [
      'action_create_room'
    ]),
    ...mapActions('sync', [
      'action_sync_initial_state'
    ]),
    async update_room_table () {
      // get room details
      const rooms : Room[] = this.get_all_joined_rooms()
      for (const room of rooms) {
        this.rooms.push({
          room_id: room.room_id,
          room_id_display: room.room_id.split(':')[0].substring(1),
          name: '',
          member_count: 0,
          user_type: ''
        })
        // TODO: identify unsuitable rooms here. THey cannot be used for MatPay.
        const current_room = this.rooms.filter(i => i.room_id === room.room_id)[0]
        // get room name: state event 'm.room.name'
        const name_event: MatrixRoomStateEvent = room.state_events.filter(
          event => event.type === 'm.room.name'
        )[0]
        current_room.name = name_event ? name_event.content.name as string : '<NO NAME>'
        // count room members: state event 'm.room.member' AND content.membership === join
        const member_join_event: MatrixRoomMemberStateEvent[] = room.state_events.filter(
          event => event.type === 'm.room.member' && event.content.membership as string === 'join'
        ) as MatrixRoomMemberStateEvent[]
        current_room.member_count = member_join_event.length
        // determine user type: if the user can send state events then treat him as admin.
        const power_level_event: MatrixRoomStateEvent = room.state_events.filter(
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
    },
    enter_room_detail (room_id: string) {
      this.$router.push({
        name: 'room_detail',
        params: {
          room_id: room_id
        }
      })
    },
    enter_room_history (room_id: string) {
      this.$router.push({
        name: 'room_history',
        params: {
          room_id: room_id
        }
      })
    },
    on_create_room_click () {
      this.$refs.create_dialog.show()
    },
    async on_create (room_name: string) {
      try {
        const room_id = await this.action_create_room({
          room_name: room_name
        })
        this.$router.push({
          name: 'room_detail',
          params: {
            room_id: room_id
          }
        })
      } catch (e) {
        console.log(e)
      }
    }
  },
  created () {
    this.action_sync_initial_state().then(() => {
      this.update_room_table()
    })
  }
})

</script>
<style scoped>
.btn {
  margin-right: 5px
}
</style>
