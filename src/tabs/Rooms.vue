<template>
  <div class="container">
    <h2>Rooms</h2>
    <div class="alert alert-danger" role="alert" v-if="error">
      {{ error }}
    </div>
    <div class="alert alert-danger" role="alert" v-if="this.rooms.length === 0 && !is_loading && is_everything_ready">
      No rooms joined.
    </div>
    <div class="alert alert-primary" role="alert" v-if="!is_everything_ready">
      Loading...
    </div>
    <h3>Joined Rooms</h3>
    <div class="table-responsive">
      <table class="table" v-if="!is_loading && this.rooms.length >= 0">
        <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Member Count</th>
          <th scope="col">User Type</th>
          <th scope="col">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="room in rooms" :key="room.room_id">
          <th scope="row">{{ room.name }}</th>
          <td>{{ room.member_count }}</td>
          <td>{{ room.user_type }}</td>
          <td>
            <button id="RoomDetailButton" class="btn btn-primary" @click="enter_room_detail(room.room_id)">Details</button>
            <button id="RoomHistoryButton" class="btn btn-info" @click="enter_room_history(room.room_id)">History</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <h3>Received Invitations</h3>
    <table class="table" v-if="!is_loading && this.get_invited_rooms">
      <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="room in this.get_invited_rooms()" :key="room.room_id">
        <th scope="row">{{ room.name ? room.name : 'NO NAME' }}</th>
        <td>
          <button class="btn btn-success" @click="accept_invitation(room.room_id)">Accept</button>
          <button class="btn btn-warning" @click="reject_invitation(room.room_id)">Reject</button>
        </td>
      </tr>
      </tbody>
    </table>
    <button id="create-dialog-button" class="btn btn-primary" @click="on_create_room_click()">Create New Room...</button>
    <CreateRoomDialog ref="create_dialog" @on-create="on_create"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MatrixRoomMemberStateEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { mapActions, mapGetters } from 'vuex'
import { Room, RoomTableRow } from '@/models/room.model'
import CreateRoomDialog from '@/dialogs/CreateRoomDialog.vue'

export default defineComponent({
  name: 'Rooms',
  data () {
    return {
      error: null as string | null,
      is_loading: true as boolean,
      is_everything_ready: false as boolean
    }
  },
  components: {
    CreateRoomDialog
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ]),
    ...mapGetters('rooms', [
      'get_room_table_rows',
      'get_invited_rooms'
    ]),
    ...mapGetters('sync', [
      'is_initial_sync_complete'
    ]),
    is_initial_sync_complete () : boolean {
      return this.is_initial_sync_complete
    },
    rooms () : RoomTableRow[] {
      if (this.is_loading) {
        return []
      } else {
        return this.get_room_table_rows
      }
    }
  },
  methods: {
    ...mapActions('rooms', [
      'action_create_room',
      'action_accept_invitation_for_room',
      'action_reject_invitation_for_room'
    ]),
    ...mapActions('sync', [
      'action_sync_initial_state'
    ]),
    enter_room_detail (room_id: string) {
      this.$router.push({
        name: 'room_detail',
        params: {
          room_id: room_id
        }
      })
      this.error = null
    },
    enter_room_history (room_id: string) {
      this.$router.push({
        name: 'room_history',
        params: {
          room_id: room_id
        }
      })
      this.error = null
    },
    on_create_room_click () {
      this.$refs.create_dialog.show()
    },
    async on_create (room_name: string) {
      try {
        this.is_loading = true // prevent computed race condition
        const room_id = await this.action_create_room({
          room_name: room_name
        })
        await this.$router.push({
          name: 'room_detail',
          params: {
            room_id: room_id
          }
        })
      } catch (e: unknown) {
        this.error = (e as Error).toString()
      }
    },
    async accept_invitation (room_id: string) {
      try {
        this.is_loading = true // prevent racing with room structure creation
        await this.action_accept_invitation_for_room({
          room_id: room_id
        })
        await this.$router.push({
          name: 'room_detail',
          params: {
            room_id: room_id
          }
        })
        this.is_loading = false
        this.error = null
      } catch (e) {
        this.error = (e as Error).toString()
      }
    },
    async reject_invitation (room_id: string) {
      try {
        await this.action_reject_invitation_for_room({
          room_id: room_id
        })
        this.error = null
      } catch (e) {
        this.error = (e as Error).toString()
      }
    }
  },
  async created () {
    await this.action_sync_initial_state()
    this.is_everything_ready = true
  },
  mounted () {
    if (this.$route.query.not_joined) {
      this.error = 'Error: You are no longer member of the room!'
    }
  },
  watch: {
    is_initial_sync_complete: {
      handler () {
        if (!this.is_initial_sync_complete) {
          this.is_loading = false
        }
      },
      immediate: true
    }
  }
})

</script>
<style scoped>
.btn {
  margin-right: 5px
}

#create-dialog-button {
  margin-bottom: 20px
}
</style>
