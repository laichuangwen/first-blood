<template>
    <div id="app">
        <menu-list :list="navs">
            <template #bottom>
                <div :class="s.bottom">
                    <router-link :class="[s.nav,$route.path.includes('setting')?s.active:'']"
                        :to="{name: 'setting'}">
                        <i :class="['ewen-iconhuaban',s.icon]"></i>
                    </router-link>
                    <img v-popover:popover
                        :src="avatar"
                        :class="s.avatar"
                        @click="avatarClick">
                    <el-popover ref="popover"
                        placement="right"
                        trigger="hover"
                        :disabled="!gitlabUserInfo">
                        <el-button type="text"
                            @click="logout">
                            退出登录
                        </el-button>
                    </el-popover>
                </div>
            </template>
            <router-view />
        </menu-list>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import { shell } from 'electron';
import MenuList from './MenuList.vue';

export default {
    components: {
        MenuList,
    },
    data() {
        return {
        };
    },
    computed: {
        ...mapState('users', ['gitlabUserInfo']),
        navs() {
            if (!this.gitlabUserInfo) return []
            return [
                {
                    title: '仓库管理',
                    icon: 'ewen-icongit',
                    to: {
                        name: 'git',
                        path: 'git',
                    }
                }
            ]
        },
        avatar() {
            return this.gitlabUserInfo ? this.gitlabUserInfo.avatar_url : require('../assets/avatar.png')
        },
    },
    created() {
        this.$store.dispatch('users/getGitlabUserInfo', this)
    },
    methods: {
        avatarClick() {
            if (this.gitlabUserInfo) {
                shell.openExternal(`https://gitlab-test.dianmi365.com/profile`)
            } else {
                this.$router.push('/setting')
                this.$message.error('请设置gitlabToken和gitlabUrl')
            }
        },
        logout() {
            // 清除用户信息，token
            this.$store.commit('users/setGitlabUserInfo', null)
            this.$store.commit('setting/setGitlabToken', '')
            // 再重创建aixos实例,清除token
            this.$ctx.apiGitlab = require('../library/front-api/gitlab').default(this)
        }
    }
};
</script>
<style lang="scss"  module="s">
.bottom {
  width: 66px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.nav {
  width: 66px;
  height: 45px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  &.active {
    &::before {
      content: '';
      background: white;
      width: 2px;
      height: 80%;
      position: absolute;
      left: 0;
      top: 10%;
    }
  }
  .icon {
    font-size: 28px;
    color: #fff;
  }
  &:hover {
    opacity: 0.7;
  }
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
}
</style>
