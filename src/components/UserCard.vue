<template>
  <img :src="this.avatar" alt="avatar" class="avatar">
  <div class="about">
    <div :class="['name', {'self_name': this.is_self }, {'admin': this.user_type === 'Admin'}]">{{ this.displayname }}</div>
    <div class="status">{{ this.is_self ? 'Yourself, ' + this.user_type : this.user_type }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { DEFAULT_AVATAR } from '@/utils/consts'
import { get_file_from_content_repository } from '@/utils/ContentRepository'
import { mapGetters } from 'vuex'

export default defineComponent({
  name: 'UserCard',
  props: {
    member_prop: Object as PropType<{
      user_id: string,
      displayname: string,
      avatar_url: string | undefined,
      is_self: boolean,
      user_type: 'Member' | 'Moderator' | 'Admin'
    }>
  },
  computed: {
    ...mapGetters('auth', [
      'homeserver'
    ])
  },
  data () {
    return {
      user_id: '' as string,
      displayname: '' as string,
      avatar: DEFAULT_AVATAR as string,
      is_self: false as boolean,
      user_type: 'Member'
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
    }
  },
  watch: {
    member_prop: {
      handler: 'update_user_card',
      immediate: true
    }
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
