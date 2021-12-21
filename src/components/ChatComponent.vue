<template>
  <div>
    <div v-for="message in chat_log.messages" :key="message.timestamp">
      <component v-if="message.type" :is="TxMessageBox" :reference="message" :room_id="room_id"/>
      <component v-if="message.content" :is="ChatMessageBox" :chat_message="message" :room_id="room_id"/>
    </div>
  </div>
  <div>
    <div class="input-group mb-3">
      <input type="text" class="form-control" placeholder="Send a message" aria-describedby="button-addon2">
      <button class="btn btn-primary" type="button">TX</button>
      <button class="btn btn-primary" type="button">History</button>
      <button class="btn btn-primary" type="button">Send</button>
    </div>
  </div>
</template>

<script lang="ts">
import { User } from '@/models/user.model'
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { ChatLog } from '@/models/chat.model'
import TxMessageBox from '@/components/TxMessageBox.vue'
import ChatMessageBox from '@/components/ChatMessageBox.vue'
import { Popover } from 'bootstrap'

export default defineComponent({
  name: 'ChatComponent',
  data () {
    return {
      chat_log: {} as ChatLog,
      TxMessageBox: 'TxMessageBox' as string,
      ChatMessageBox: 'ChatMessageBox' as string
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
    }
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    TxMessageBox,
    // eslint-disable-next-line vue/no-unused-components
    ChatMessageBox
  },
  methods: {
  },
  created () {
    this.chat_log = {
      messages: (this.get_chat_log_for_room(this.room_id) as ChatLog).messages.sort((a, b) => {
        return a.timestamp.getTime() - b.timestamp.getTime()
      })
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
