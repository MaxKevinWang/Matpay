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
    ...mapGetters('tx', [
      'transaction'
    ])
  },
  components: {

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
