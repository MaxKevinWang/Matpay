<template>
  <div class="context-menu" v-show="show" :style="style" ref="context" tabindex="0" @blur="close">
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick } from 'vue'

export default defineComponent({
  name: 'RightClickMenu',
  props: {
    display: Boolean
  },
  data () {
    return {
      left: 0,
      top: 0,
      show: false
    }
  },
  computed: {
    style () {
      return {
        top: this.top + 'px',
        left: this.left + 'px'
      }
    }
  },
  methods: {
    close () {
      this.show = false
      this.left = 0
      this.top = 0
    },
    open (evt: MouseEvent) {
      this.left = evt.pageX || evt.clientX
      this.top = evt.pageY || evt.clientY
      nextTick(() => this.$el.focus())
      this.show = true
    }
  }
})
</script>
<style scoped>
.context-menu {
  position: fixed;
  background: white;
  z-index: 999;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  cursor: pointer;
}
</style>
