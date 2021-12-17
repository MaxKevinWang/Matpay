<template>
  <div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { chat_store } from '@/store/chat'

export default defineComponent({
  name: 'ChatMessageBox',
  data () {
    return {
      user_id: '' as string,
      displayname: '' as string
    }
  },
  computed: {
  },
  components: {
  },
  methods: {
    ...mapGetters('chat', ['chat_store.getters', 'YVcDePcjikPMmUjRtZ:dsn.tm.kit.edu']),
    ...mapGetters('chatlog', ['get_chat_log_for_room', 'YVcDePcjikPMmUjRtZ:dsn.tm.kit.edu'])
    // ...mapGetters('chat', [
    //   'chatmessage'
    // ])
  }

})
</script>
<style scoped>

</style>
