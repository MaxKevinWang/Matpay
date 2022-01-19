<template>
  <div
    :class="[this.user_id !== this.chat_message.sender.user_id ? 'd-flex flex-row justify-content-start mb-4': 'd-flex flex-row justify-content-end mb-4']">
    <p>{{ this.chat_message.sender.displayname }}</p>
    <div :class="[this.user_id !== this.chat_message.sender.user_id ? 'p-3 ms-3' : 'p-3 me-3 border']"
         :style="[this.user_id !== this.chat_message.sender.user_id ? 'border-radius: 15px; background-color: rgba(57, 192, 237,.2);' : 'border-radius: 15px; background-color: #fbfbfb;']">
      <p class="small mb-0 chat-message">{{ this.chat_message.content }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { chat_store } from '@/store/chat'
import { ChatMessage, TxPlaceholder } from '@/models/chat.model'
import { MatrixRoomID } from '@/models/id.model'

export default defineComponent({
  name: 'ChatMessageBox',
  data () {
    return {
      displayname: '' as string
    }
  },
  props: {
    chat_message: {
      type: Object as PropType<ChatMessage>
    },
    room_id: {
      type: String as PropType<MatrixRoomID>
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ])
  },
  components: {
  },
  methods: {
    // ...mapGetters('chat', [
    //   'chatmessage'
    // ])
  }
})
</script>
<style scoped>

</style>
