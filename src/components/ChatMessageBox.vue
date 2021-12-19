<template>
  <div>
    <div class="d-flex flex-row justify-content-start mb-4">
      <p>{{this.chat_message.sender.displayname}}</p>
      <div class="p-3 ms-3" style="border-radius: 15px; background-color: rgba(57, 192, 237,.2);">
        <p class="small mb-0">{{this.chat_message.content}}</p>
      </div>
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
      user_id: '' as string,
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
