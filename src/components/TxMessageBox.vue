<template>
  <div>
    <button class="btn btn-primary" >Details</button>
  </div>
  <div class="panel panel-primary">
    <div class="panel-heading">
      <h3 class="panel-title">transation</h3>
    </div>
    <div class="panel-body">
      To call the real transaction
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { DEFAULT_AVATAR } from '@/utils/consts'
import TxDetail from '@/components/TxDetail.vue'
import { User } from '@/models/user.model'
import { GroupID, MatrixEventID, MatrixUserID, TxID } from '@/models/id.model'
import { PendingApproval, SimpleTransaction } from '@/models/transaction.model'

export default defineComponent({
  name: 'TxMessageBox',
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
      'transaction'
    ])
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

</style>
