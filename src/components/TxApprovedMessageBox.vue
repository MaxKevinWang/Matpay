<template>
  <div>
    <div class="card" style="background-color: rgba(105, 105, 105,.5)">
      <div class="card-body">
        <div class="row">
          <div class="col">
            <p>{{ this.reference.timestamp.toLocaleDateString() }}</p>
          </div>
          <div class="col text-wrap text-break">
            <p>{{ this.reference.grouped_tx.description }}</p>
          </div>
          <div class="col text-wrap text-break">
            <p>
              {{
                this.reference.grouped_tx.from.displayname + ' paid ' + to_currency_display(sum_amount(this.reference.grouped_tx))
              }}</p>
          </div>
          <div class="col">
            <button @click="on_detail_click" class="btn btn-primary m-1">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
    <DetailDialog ref="detail_dialog" :room_id="room_id" :reference="reference"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapGetters } from 'vuex'
import { User } from '@/models/user.model'
import { MatrixRoomID } from '@/models/id.model'
import { TxApprovedPlaceholder } from '@/models/chat.model'
import DetailDialog from '@/dialogs/DetailDialog.vue'

export default defineComponent({
  name: 'TxApprovedMessageBox',
  props: {
    reference: {
      type: Object as PropType<TxApprovedPlaceholder>
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
  computed: {
    ...mapGetters('tx', [
      'get_grouped_transactions_for_room'
    ])
  },
  components: { DetailDialog },
  methods: {
    on_detail_click () {
      this.$refs.detail_dialog.show()
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
