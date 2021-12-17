<template>
  <div class="flex">
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
import { GroupedTransaction } from '@/models/transaction.model'
import TxMessageBox from '@/components/TxMessageBox.vue'
import ChatMessageBox from '@/components/ChatMessageBox.vue'

export default defineComponent({
  name: 'ChatComponent',
  data () {
    return {
      chat_log: {} as ChatLog,
      grouped_txs: {} as GroupedTransaction,
      users: {} as User
    }
  },
  computed: {
    ...mapGetters('rooms', [
      'get_member_state_events_for_room',
      'get_room_name'
    ]),
    ...mapGetters('tx', [
      'get_grouped_transactions_for_room',
      'YVcDePcjikPMmUjRtZ:dsn.tm.kit.edu'
    ]),
    ...mapGetters('tx', [
      'get_pending_approvals_for_room',
      'YVcDePcjikPMmUjRtZ:dsn.tm.kit.edu'
    ]),
    ...mapGetters('chat_log', [
      'get_chat_log_for_room',
      'YVcDePcjikPMmUjRtZ:dsn.tm.kit.edu'
    ])
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    TxMessageBox,
    // eslint-disable-next-line vue/no-unused-components
    ChatMessageBox
  },
  methods: {
  }
})
</script>
<style scoped>
  .flex {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
