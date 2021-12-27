<template>
  <div>
    <div v-for="message in chat_log.messages" :key="message.timestamp">
      <component v-if="message.grouped_tx" :is="TxApprovedMessageBox" :reference="message" :room_id="room_id"/>
      <component v-if="message.approval" :is="TxPendingMessageBox" :reference="message" :room_id="room_id"/>
      <component v-if="message.content" :is="ChatMessageBox" :chat_message="message" :room_id="room_id"/>
    </div>
  </div>
  <div>
    <div class="fixed-bottom input-group mb-3">
      <input type="text" class="form-control" placeholder="Send a message" aria-describedby="button-addon2">
      <button class="btn btn-light" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="Create Transaction" @click="on_tx_clicked()">
        <i class="bi bi-receipt"></i>
      </button>
      <button class="btn btn-light" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="History">
        <i class="bi bi-clock-history"></i>
      </button>
      <button class="btn btn-primary" type="button">Send</button>
    </div>
  </div>
  <CreateTxDialog ref="create_tx_dialog" :room_id="room_id" :room_name="room_name" :users_info="users_info"/>
</template>

<script lang="ts">
import { User, RoomUserInfo } from '@/models/user.model'
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { ChatLog } from '@/models/chat.model'
import ChatMessageBox from '@/components/ChatMessageBox.vue'
import { Popover } from 'bootstrap'
import { deepcopy } from '@/utils/utils'
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
      room_name: '' as string
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
    chat_log () : ChatLog {
      const messages = (this.get_chat_log_for_room(this.room_id) as ChatLog).messages
      return {
        messages: [...messages].sort((a, b) => {
          return a.timestamp.getTime() - b.timestamp.getTime()
        })
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
    on_tx_clicked () {
      this.room_name = this.get_room_name(this.room_id)
      this.$refs.create_tx_dialog.show()
    }
  }
})
</script>
<style scoped>
  .flex {
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position:relative;
  }
</style>
