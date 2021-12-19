<template>
  <div class="card">
    <div class="card-header">
      Transaction
    </div>
    <div class="card-body">
      <h5 class="card-title"></h5>
      <p class="card-text"></p>
      <a href="#" class="btn btn-primary">details</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { DEFAULT_AVATAR } from '@/utils/consts'
import TxDetail from '@/components/TxDetail.vue'
import { User } from '@/models/user.model'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID, TxID } from '@/models/id.model'
import { PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { TxPlaceholder } from '@/models/chat.model'

export default defineComponent({
  name: 'TxMessageBox',
  props: {
    reference: {
      type: Object as PropType<TxPlaceholder>
    },
    room_id: {
      type: String as PropType<MatrixRoomID>
    }
  },
  data () {
    return {
      from: {} as User,
      amount: {} as number,
      description: '' as string,
      timestamp: {} as Date
    }
  },
  computed: {
    ...mapGetters('tx', [
      'get_grouped_transactions_for_room'
    ])
    //  ...mapGetters('tx', [
    //    'transaction'
    //  ])
  },
  components: {
    // eslint-disable-next-line vue/no-unused-components
    TxDetail
  },
  methods: {
  }
})
</script>
<style scoped>

.card {
  position: relative;
}

</style>
