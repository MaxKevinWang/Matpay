<template>
  <div class="container">
    <div class="alert alert-danger" role="alert" v-if="error !== ''">
      {{ error }}
    </div>
    <div class="row">
      <h2>Room: {{ room_name }}</h2>
    </div>
    <div class="row clearfix">
      <div class="col-lg-3 chat-frame">
        <MemberList :room_id="room_id" :users_info="users_info" @on-error="on_error"/>
      </div>
      <div class="col-lg-9 chat-frame">
        <h4>Chat</h4>
        <div class="row">
        <button v-if="!is_tx_fully_loaded" class="btn btn-primary spinner" type="button" disabled>
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Loading further messages...
          <br>
          Transaction data won't be available before all messages are downloaded.
        </button>
        <button v-if="!is_chat_sync_complete(room_id) && is_tx_fully_loaded" class="btn btn-primary mb-3" type="button" @click="on_load_chat">
          Load previous chat messages
        </button>
        </div>
        <ChatComponent :users_info="users_info" @on-error="on_error"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MemberList from '@/components/MemberList.vue'
import { mapActions, mapGetters } from 'vuex'
import { MatrixRoomMemberStateEvent } from '@/interface/rooms_event.interface'
import ChatComponent from '@/components/ChatComponent.vue'
import { RoomUserInfo } from '@/models/user.model'

export default defineComponent({
  name: 'RoomDetail',
  data () {
    return {
      error: '' as string,
      is_tx_fully_loaded: false
    }
  },
  computed: {
    ...mapGetters('rooms', [
      'get_member_state_events_for_room',
      'get_permission_event_for_room',
      'get_room_name',
      'get_joined_status_for_room'
    ]),
    ...mapGetters('user', [
      'get_all_users_info_for_room'
    ]),
    ...mapGetters('sync', [
      'is_chat_sync_complete'
    ]),
    room_id (): string {
      return this.$route.params.room_id as string
    },
    users_info (): Array<RoomUserInfo> {
      try {
        return this.get_all_users_info_for_room(this.room_id)
      } catch (e) {
        return []
      }
    },
    room_name (): string {
      try {
        return this.get_room_name(this.room_id)
      } catch (e) {
        return 'Loading...'
      }
    }
  },
  components: {
    ChatComponent,
    MemberList
  },
  methods: {
    ...mapActions('sync', [
      'action_sync_initial_state',
      'action_sync_full_tx_events_for_room',
      'action_sync_batch_message_events_for_room'
    ]),
    on_error (error: string) {
      this.error = error
    },
    on_load_chat () {
      this.action_sync_batch_message_events_for_room({
        room_id: this.room_id
      })
    }
  },
  async mounted () {
    await this.action_sync_initial_state()
    if (!this.get_joined_status_for_room(this.room_id)) {
      this.$router.push({
        name: 'rooms',
        query: {
          not_joined: 1
        }
      })
    }
    this.action_sync_batch_message_events_for_room({
      room_id: this.room_id
    })
    this.action_sync_full_tx_events_for_room({
      room_id: this.room_id
    }).then(() => {
      this.is_tx_fully_loaded = true
    })
  }
})
</script>
<style scoped>
.chat-frame {
  left: 0;
  top: 0;
  padding: 20px;
}

.chat-frame {
  -moz-transition: .5s;
  -o-transition: .5s;
  -webkit-transition: .5s;
  transition: .5s
}
.spinner {
  margin: 5px;
}
</style>
