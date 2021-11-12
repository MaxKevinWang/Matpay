<template>
  <div>
    <img :src="this.avatar" alt="avatar" class="avatar">
    <div class="about" @contextmenu="open_right_click_menu">
      <div :class="['name', {'self_name': this.is_self }, {'admin': this.user_type === 'Admin'}]">{{
          this.displayname
        }}
      </div>
      <div class="status">{{ this.is_self ? 'Yourself, ' + this.user_type : this.user_type }}</div>
    </div>
    <!-- Right Click Menu -->
    <RightClickMenu :display="show_right_click_menu" ref="menu" v-if="can_i_kick_user && !is_self">
      <ul class="list-group list-group-flush">
        <li class="list-group-item" @click="on_context_click('kick')">Kick User</li>
        <li class="list-group-item" @click="on_context_click('ban')">Ban User</li>
      </ul>
    </RightClickMenu>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { DEFAULT_AVATAR } from '@/utils/consts'
import { get_file_from_content_repository } from '@/utils/ContentRepository'
import { mapGetters } from 'vuex'
import RightClickMenu from '@/components/RightClickMenu.vue'

export default defineComponent({
  name: 'UserCard',
  props: {
    member_prop: Object as PropType<{
      user_id: string,
      displayname: string,
      avatar_url: string | undefined,
      is_self: boolean,
      user_type: 'Member' | 'Moderator' | 'Admin'
    }>,
    can_i_kick_user: Boolean as PropType<boolean>
  },
  computed: {
    ...mapGetters('auth', [
      'homeserver'
    ])
  },
  emits: [
    'on-kick',
    'on-ban'
  ],
  data () {
    return {
      user_id: '' as string,
      displayname: '' as string,
      avatar: DEFAULT_AVATAR as string,
      is_self: false as boolean,
      user_type: 'Member',
      show_right_click_menu: false as boolean
    }
  },
  methods: {
    update_user_card () {
      if (this.member_prop) {
        this.user_id = this.member_prop.user_id
        this.displayname = this.member_prop.displayname
        this.is_self = this.member_prop.is_self
        this.user_type = this.member_prop.user_type
        if (this.member_prop.avatar_url) {
          get_file_from_content_repository(this.homeserver, this.member_prop.avatar_url)
            .then(response => {
              const fr = new FileReader()
              fr.onloadend = () => {
                this.avatar = fr.result as string
              }
              fr.readAsDataURL(response)
            })
        } else {
          this.avatar = DEFAULT_AVATAR
        }
      }
    },
    open_right_click_menu (e: MouseEvent) {
      e.preventDefault()
      const menu_ref = this.$refs.menu as { open: (e: MouseEvent) => void } | null
      menu_ref?.open(e)
    },
    on_context_click (operation: 'kick' | 'ban') {
      this.show_right_click_menu = false
      if (operation === 'kick') {
        this.$emit('on-kick', this.user_id)
      } else if (operation === 'ban') {
        this.$emit('on-ban', this.user_id)
      }
    }
  },
  watch: {
    member_prop: {
      handler: 'update_user_card',
      immediate: true
    }
  },
  components: {
    RightClickMenu
  }
})

</script>
<style scoped>

img {
  width: 45px;
  border-radius: 50%;
  float: left;
}

.name {
  font-size: 15px;
}

.about {
  float: left;
  padding-left: 8px
}

.status {
  color: #999;
  font-size: 13px
}

.avatar {
  vertical-align: middle;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.self_name {
  text-decoration: underline;
}

.admin {
  color: red
}
</style>
