<template>
  <div class="container">
    <div class="alert alert-danger" role="alert" v-if="error !== ''">
      {{ error }}
    </div>
    <div class="row">
      <h2>Room: {{ this.room_name }}</h2>
    </div>
    <div class="row clearfix">
      <div class="col-lg-3 chat-frame">
        <MemberList :room_id="room_id" :member_list="member_list" @on-error="on_error"
                    @on-user-change="on_user_change"/>
      </div>
      <div class="col-lg-9 chat-frame">
        <h4>Chat</h4>
        <p>To be done.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MemberList from '@/components/MemberList.vue'
import { mapActions, mapGetters } from 'vuex'
import { MatrixRoomMemberStateEvent } from '@/interface/RoomsEvent.interface'

export default defineComponent({
  name: 'RoomDetail',
  data () {
    return {
      member_list: [] as Array<{
        user_id: string,
        displayname: string | null,
        avatar_url: string | undefined,
      }>,
      error: '' as string
    }
  },
  computed: {
    ...mapGetters('rooms', [
      'get_member_state_events_for_room',
      'get_room_name'
    ]),
    room_id (): string {
      return this.$route.params.room_id as string
    },
    room_name (): string {
      return this.get_room_name(this.room_id)
    }
  },
  components: {
    MemberList
  },
  methods: {
    ...mapActions('rooms', [
      'action_get_room_state_events'
    ]),
    async update_member_list () {
      await this.action_get_room_state_events({
        room_id: this.room_id
      })
      try {
        const member_join_events: MatrixRoomMemberStateEvent[] = this.get_member_state_events_for_room(this.room_id)
        if (member_join_events && member_join_events.length > 0) {
          this.member_list = member_join_events
            .filter(event => event.content.membership === 'join')
            .map(event => {
              return {
                user_id: event.state_key,
                displayname: event.content.displayname,
                avatar_url: event.content.avatar_url
              }
            })
        }
      } catch (e) {
        alert('Room does not exist or you are not part of the room!')
        this.$router.push({
          name: 'rooms'
        })
      }
    },
    on_error (error: string) {
      this.error = error
    },
    on_user_change () {
      this.update_member_list()
    }
  },
  mounted () {
    this.update_member_list()
  }
})
</script>
<style scoped>
.chat-frame {
  left: 0;
  top: 0;
  padding: 20px;
  z-index: 7
}

.chat-frame {
  -moz-transition: .5s;
  -o-transition: .5s;
  -webkit-transition: .5s;
  transition: .5s
}
</style>
