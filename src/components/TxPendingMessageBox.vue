<template>
  <div class="card" style="background-color: rgba(255, 193, 193,.5)">
    <div class="card-body">
      <div class="row">
        <div class="col">
          <p>{{this.reference.timestamp.toLocaleDateString()}}</p>
        </div>
        <div class="col">
          <p>{{this.reference.approval.description}}</p>
        </div>
        <div class="col">
          <p>{{this.reference.approval.from.displayname + " paid " + to_currency_display(sum_amount(this.reference.approval))}}</p>
        </div>
        <div class="col">
          <button class="btn btn-primary m-1" data-cy="detail" @click="approval_click()">Details</button>
          <button data-cy="previous" v-if="this.reference.approval.type === 'modify'" class="btn btn-info m-1" @click="previous_click">Jump to Previous</button>
        </div>
      </div>
    </div>
    <ApprovalDialog ref="approve_dialog" :reference="reference" @on-approval="on_approval" @on-reject="on_reject"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { DEFAULT_AVATAR } from '@/utils/consts'
import TxDetail from '@/components/TxDetail.vue'
import { User } from '@/models/user.model'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID, TxID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { TxPendingPlaceholder, TxPlaceholder } from '@/models/chat.model'
import CreateRoomDialog from '@/dialogs/CreateRoomDialog.vue'
import ApprovalDialog from '@/dialogs/ApprovalDialog.vue'

export default defineComponent({
  name: 'TxPendingMessageBox',
  props: {
    reference: {
      type: Object as PropType<TxPendingPlaceholder>
    },
    room_id: {
      type: String as PropType<MatrixRoomID>
    }
  },
  data () {
    return {
      from: {} as User,
      amount: 0 as number,
      description: '' as string,
      timestamp: {} as Date
    }
  },
  emits: [
    'on-error',
    'on-previous'
  ],
  computed: {
    ...mapGetters('tx', [
      'get_grouped_transactions_for_room'
    ])
  },
  components: {
    ApprovalDialog
  },
  methods: {
    ...mapActions('tx', [
      'action_approve_tx_for_room',
      'action_reject_tx_for_room'
    ]),
    approval_click () {
      this.$refs.approve_dialog.show()
    },
    previous_click () {
      this.$emit('on-previous', this.reference?.approval)
    },
    async on_approval (approval: PendingApproval) {
      try {
        await this.action_approve_tx_for_room({
          room_id: this.room_id,
          approval: approval
        })
      } catch (e) {
        this.$emit('on-error', e)
      }
      this.$refs.approve_dialog.hide()
    },
    async on_reject (approval: PendingApproval) {
      try {
        await this.action_reject_tx_for_room({
          room_id: this.room_id,
          approval: approval
        })
      } catch (e) {
        this.$emit('on-error', e)
      }
      this.$refs.approve_dialog.hide()
    }
  }
})
</script>
<style scoped>

.card {
  position: relative;
  margin-bottom: 30px;
}

</style>
