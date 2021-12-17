<template>
  <link href="//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
  <div class="flex">
      <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="Send a message" aria-describedby="button-addon2">
          <button class="btn btn-primary" type="button">TX</button>
          <button class="btn btn-primary" type="button">History</button>
          <button class="btn btn-primary" type="button">Send</button>
      </div>
  </div>
  // test here
  <div class="transaction">
    <div class="panel panel-primary">
      <div class="panel-heading">
        <h3 class="panel-title">transation</h3>
      </div>
      <div class="panel-body">
        To call the real transaction
      </div>
      <i class="fa fa-file-text-o fa-4x"></i>
      <div>
        <button class="btn btn-primary" type="button">Details</button>
      </div>
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
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    top: 500px;
    position:relative;
  }
  .transaction {
    background: #ccc;
    height: 105px;
    width: 625px;
    right: 25px;
    top: 200px;
    position:relative;
  }
  .transaction button{
    position:relative;
    left: 500px;
    height: 80px;
    width: 100px;
    top: -115px;
  }
  .transaction i{
    position:relative;;
    left: 250px;
    top: -30px;
  }
</style>
