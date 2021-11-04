<template>
  <div class="container">
    <h2>Rooms</h2>
    <div class="alert alert-danger" role="alert" v-if="!room_exists">
      No rooms joined.
    </div>
    <table class="table" v-if="room_exists">
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
      <tr v-for="room in rooms" :key="room.id">
        <th scope="row">{{ room.id }}</th>
        <td>{{ room.name }}</td>
        <td>{{ room.member_count }}</td>
        <td>{{ room.user_type }}</td>
        <td>
          <button class="btn btn-primary" @click="joinRoom(room.id)">Details</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

interface RoomTableRow {
  id: string
  name: string
  member_count: number
  user_type: string
}

export default defineComponent({
  name: 'Rooms',
  data () {
    return {
      rooms: [
        {
          id: '1234',
          name: 'xxxx',
          member_count: 0,
          user_type: 'admin'
        }
      ] as RoomTableRow[]
    }
  },
  computed: {
    room_exists (): boolean {
      return !!this.rooms && this.rooms.length > 0
    }
  },
  methods: {
    updateRoomTable () {
      this.$store.dispatch('rooms/action_get_joined_rooms')
        .then((response: { joined_rooms: [string] }) => {
          // first only list id
          this.rooms = response.joined_rooms.map(room => {
            return {
              id: room.split(':')[0].substring(1),
              name: '',
              member_count: 0,
              user_type: ''
            }
          })
        })
    }
  },
  created () {
    this.updateRoomTable()
  }
})

</script>
<style scoped>

</style>
