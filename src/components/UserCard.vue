<template>
  <SettlementDialog ref="settle_dialog" :room_id="room_id" :balance="open_balance" :user_clicked="user_prop" />
  <div :id="'usercard_' + user_id">
    <img :src="this.avatar" alt="avatar" class="avatar">
    <div class="about">
      <div :class="['name', {'self_name': this.is_self }, {'admin': this.user_type === 'Admin'}]">{{
          this.displayname
        }}
      </div>
      <div class="status">{{ this.is_self ? 'Yourself, ' + this.user_type : this.user_type }}</div>
      <div v-if="!this.is_self">
        <button class="btn btn-danger btn-sm me-1" v-if="can_i_kick_user" @click="on_permission_click('kick')">Kick</button>
        <button class="btn btn-danger btn-sm me-1" v-if="can_i_kick_user" @click="on_permission_click('ban')">Ban</button>
        <button class="btn btn-primary btn-sm" @click="on_settle_click()">Settle</button>
      </div>
      <div v-if="this.is_self">
        <button class="btn btn-danger btn-sm me-1" @click="on_leave_click">Leave Room</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { DEFAULT_AVATAR } from '@/utils/consts'
import { get_file_from_content_repository } from '@/utils/ContentRepository'
import { mapActions, mapGetters } from 'vuex'
import SettlementDialog from '@/dialogs/SettlementDialog.vue'
import { RoomUserInfo } from '@/models/user.model'
import { TxPlaceholder } from '@/models/chat.model'
import { MatrixUserID } from '@/models/id.model'

export default defineComponent({
  name: 'UserCard',
  props: {
    user_prop: {
      type: Object as PropType<RoomUserInfo>
    },
    can_i_kick_user: {
      type: Boolean as PropType<boolean>
    },
    room_id: {
      type: String as PropType<string>
    }
  },
  computed: {
    ...mapGetters('auth', [
      'homeserver'
    ]),
    ...mapGetters('auth', {
      self_user_id: 'user_id'
    }),
    ...mapGetters('tx', [
      'get_open_balance_against_user_for_room'
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
      show_right_click_menu: false as boolean,
      open_balance: 0 as number
    }
  },
  methods: {
    ...mapActions('tx', [
      'action_optimize_graph_and_prepare_balance_for_room'
    ]),
    update_user_card () {
      if (this.user_prop) {
        this.user_id = this.user_prop.user.user_id
        this.displayname = this.user_prop.displayname
        this.is_self = this.user_prop.is_self
        this.user_type = this.user_prop.user_type
        if (this.user_prop.avatar_url) {
          get_file_from_content_repository(this.homeserver, this.user_prop.avatar_url)
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
    on_permission_click (operation: 'kick' | 'ban') {
      this.show_right_click_menu = false
      if (operation === 'kick') {
        this.$emit('on-kick', this.user_id)
      } else if (operation === 'ban') {
        this.$emit('on-ban', this.user_id)
      }
    },
    async on_settle_click () {
      if (!this.is_self) {
        let open_balance = 0
        try {
          open_balance = this.get_open_balance_against_user_for_room(this.room_id, this.self_user_id, this.user_id)
        } catch (e) {
          await this.action_optimize_graph_and_prepare_balance_for_room({
            room_id: this.room_id
          })
          open_balance = this.get_open_balance_against_user_for_room(this.room_id, this.self_user_id, this.user_id)
        }
        this.open_balance = open_balance
        this.$refs.settle_dialog.show()
      }
    }
  },
  watch: {
    user_prop: {
      handler: 'update_user_card',
      immediate: true
    }
  },
  components: {
    SettlementDialog
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
