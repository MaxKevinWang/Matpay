<template>
  <div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'

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
    ...mapGetters('chat', [
      'chatmessage'
    ])
  }
})
</script>
<style scoped>

</style>
