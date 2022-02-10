<template>
  <div class="card text-center" v-if="!!tx">
    <div class="card-header" id="TXDetail-header">
      <h3>Details</h3>
    </div>
    <div class="card-body" id="TXDetail-body">
      <p>{{ tx.description }}: {{ sum_amount(tx) / 100 }}€ from {{ tx.from.displayname }} at {{ tx.timestamp.toLocaleDateString() }}</p>
    </div>
    <div class="card-body" v-for="simple_transaction in tx?.txs" :key="simple_transaction.tx_id" data-test="todo">
      <p>{{ simple_transaction.to.displayname }} owes {{ simple_transaction.amount / 100 }}€</p>
    </div>
    <div class="card-body" id="ModificationButton-body">
      <button class="btn btn-primary" type="button"
              :disabled="this.tx.state === 'settlement' || !modifiable"
              @click="modification_click()" id="modification-button">
        Modify
      </button>
    </div>
    <ModificationDialog ref="create_dialog" @on-error="on_error" :tx="tx" :room_id="room_id" :users_info="this.get_users_info_for_room(this.room_id)"/>
  </div>
</template>

<script lang="ts">
import { GroupedTransaction } from '@/models/transaction.model'
import { defineComponent, PropType } from 'vue'
import ModificationDialog from '@/dialogs/ModificationDialog.vue'
import { RoomUserInfo } from '@/models/user.model'
import { mapGetters } from 'vuex'
export default defineComponent({
  name: 'TxDetail',
  props: {
    tx: {
      type: Object as PropType<GroupedTransaction>
    },
    room_id: {
      type: String as PropType<string>
    }
  },
  emits: ['on-error'],
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters('user', [
      'get_users_info_for_room'
    ]),
    ...mapGetters('auth', [
      'user_id'
    ]),
    modifiable () : boolean {
      if (this.tx) {
        const all_participants = this.tx.txs.map(t => t.to.user_id).concat(this.tx.from.user_id)
        return all_participants.includes(this.user_id)
      } else {
        return false // not yet loaded
      }
    }
  },
  components: {
    ModificationDialog
  },
  methods: {
    modification_click () {
      this.$refs.create_dialog.show()
    },
    on_error (e: string) {
      this.$emit('on-error', e)
    }
  }
})
</script>
<style scoped>

</style>
