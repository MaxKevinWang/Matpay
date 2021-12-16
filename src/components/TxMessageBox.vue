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

export default defineComponent({
  name: 'TxMessageBox',
  data () {
    return {
      amount: 0 as number,
      user_From: '' as string,
      user_To: '' as string,
      timestamp: Date,
      description: '' as string
    }
  },
  computed: {
  },
  components: {
  },
  methods: {
  }
})
</script>
<style scoped>

</style>
