<template>
  <div class="card" style="background-color: rgba(105, 105, 105,.5)">
    <div class="card-body">
      <div class="row">
        <div class="col">
          <p>{{ this.reference.timestamp.toLocaleDateString() }}</p>
        </div>
        <div class="col">
          <p>{{ this.reference.grouped_tx.description }}</p>
        </div>
        <div class="col">
          <p>
            {{ this.reference.grouped_tx.from.displayname + ' paid ' + to_currency_display(sum_amount(this.reference.grouped_tx)) }}</p>
        </div>
        <div class="col">
          <button @click="on_detail_click" class="btn btn-primary">
            Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapGetters } from 'vuex'
import { User } from '@/models/user.model'
import { MatrixRoomID } from '@/models/id.model'
import { TxApprovedPlaceholder } from '@/models/chat.model'

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
  components: {},
  methods: {
    on_detail_click () {
      this.$router.push({
        name: 'room_history',
        params: {
          room_id: this.room_id,
          current_group_id: this.reference?.grouped_tx.group_id
        }
      })
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
