<template>
  <link href="//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
  <div class="transaction">
    <div class="panel panel-primary">
      <div class="panel-heading">
        <h3 class="panel-title">transation</h3>
      </div>
      <div class="panel-body">
      </div>
      <i class="fa fa-file-text-o fa-4x"></i>
      <div>
        <button class="btn btn-primary" type="button">Details</button>
      </div>
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
      to: {} as User,
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
