<template>
  <div>
    <div v-for="message in chat_log.messages" :key="message.timestamp" >
      <component v-if="message.grouped_tx" :is="TxApprovedMessageBox" :reference="message" :room_id="room_id"/>
      <component v-if="message.approval" :is="TxPendingMessageBox" :reference="message" :room_id="room_id"/>
      <component v-if="message.content" :is="ChatMessageBox" :chat_message="message" :room_id="room_id" />
    </div>
  </div>
  <div>
    <div class="input-group mb-3 position-fixed bottom-0" >
      <div class="d-flex">
        <div class="col-12" id="sendInput">
          <input type="text" v-model="chat_message" class="form-control" placeholder="Send a message"
                 aria-describedby="button-addon2" id="sendInputText">
        </div>
        <div class="d-flex" id="createButton">
          <button class="btn btn-light" type="button" data-bs-toggle="tooltip" data-bs-placement="top"
                  title="Create Transaction" @click="on_tx_clicked()">
            <i class="bi bi-receipt"></i>
          </button>
          <router-link :to="{name: 'room_history', params: {room_id: room_id}}" class="btn btn-light" id="historyButton" type="button"
                       data-bs-toggle="tooltip" data-bs-placement="top" title="History">
            <i class="bi bi-clock-history"></i>
          </router-link>
          <button class="btn btn-primary" id="sendButton" type="button" :disabled="!(this.chat_message)" @click="on_send_click">Send
          </button>
        </div>
      </div>
    </div>
  </div>
  <CreateTxDialog ref="create_tx_dialog" :room_id="room_id" :users_info="users_info"/>
</template>

<script lang="ts">
import { RoomUserInfo } from '@/models/user.model'
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { ChatLog } from '@/models/chat.model'
import ChatMessageBox from '@/components/ChatMessageBox.vue'
import TxApprovedMessageBox from '@/components/TxApprovedMessageBox.vue'
import TxPendingMessageBox from '@/components/TxPendingMessageBox.vue'
import CreateTxDialog from '@/dialogs/CreateTxDialog.vue'

export default defineComponent({
  name: 'ChatComponent',
  props: {
    users_info: {
      type: Object as PropType<Array<RoomUserInfo>>
    }
  },
  data () {
    return {
      TxApprovedMessageBox: 'TxApprovedMessageBox' as string,
      TxPendingMessageBox: 'TxPendingMessageBox' as string,
      ChatMessageBox: 'ChatMessageBox' as string,
      room_name: '' as string,
      chat_message: null as string | null
    }
  },
  computed: {
    ...mapGetters('rooms', [
      'get_member_state_events_for_room',
      'get_room_name'
    ]),
    ...mapGetters('chat', [
      'get_chat_log_for_room'
    ]),
    room_id (): string {
      return this.$route.params.room_id as string
    },
    chat_log (): ChatLog {
      const messages = (this.get_chat_log_for_room(this.room_id) as ChatLog).messages
      return {
        messages: [...messages].reverse()
      }
    }
  },
  components: {
    TxApprovedMessageBox,
    TxPendingMessageBox,
    ChatMessageBox,
    CreateTxDialog
  },
  methods: {
    ...mapActions('chat', [
      'action_send_chat_message_for_room'
    ]),
    on_tx_clicked () {
      this.room_name = this.get_room_name(this.room_id)
      this.$refs.create_tx_dialog.show()
    },
    async on_send_click () {
      if (this.chat_message) {
        try {
          await this.action_send_chat_message_for_room({
            room_id: this.room_id,
            message: this.chat_message
          })
          this.chat_message = null
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
})
</script>
<style scoped>
</style>
