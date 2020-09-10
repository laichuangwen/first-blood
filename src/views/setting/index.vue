<template>
    <div>
        <setting-list :class="s.content"
            :list="list"
            @item-confirm="itemConfirm"
            @editEvent="editEvent">
            <template #goLabel
                v-if="$store.state.setting.gitlabUrl">
                <el-tooltip content="点我去申请"
                    placement="bottom">
                    <i @click="goGitlab"
                        :class="['ewen-iconyiwen', s.icon]"></i>
                </el-tooltip>
            </template>
            <template #debug>
                <i @click="debugOpen" :class="['ewen-iconyiwen', s.icon]"></i>
            </template>
        </setting-list>
        <el-popover placement="right"
            width="120"
            v-model="visible">
            <p>你确定要重置当前的设置吗？</p>
            <div style="text-align: right; margin: 0">
                <el-button size="mini"
                    type="text"
                    @click="visible = false">取消</el-button>
                <el-button type="primary"
                    size="mini"
                    @click="reset">确定</el-button>
            </div>
            <el-button type="primary"
                slot="reference">重置</el-button>
            <el-button type="primary"
                slot="reference" @click="refresh">刷新</el-button>
        </el-popover>
    </div>
</template>

<script>
import { remote, shell } from 'electron'
import SettingList from './SettingList.vue';
export default {
    components: {
        SettingList
    },
    data() {
        return {
            visible: false
        };
    },
    computed: {
        list() {
            const {
                gitlabUrl,
                gitlabToken,
                cantaoUrl,
                cantaoAccount,
                cantaoPassword,
            } = this.$store.state.setting
            return [
                {
                    id: 0,
                    label: 'gitlab地址',
                    type: 'input',
                    value: gitlabUrl,
                },
                {
                    id: 1,
                    label: 'gitlab-token',
                    slotItemName: 'goLabel',
                    type: 'input',
                    value: gitlabToken,
                },
                {
                    id: 2,
                    label: '蝉道地址',
                    type: 'input',
                    value: cantaoUrl,
                },
                {
                    id: 3,
                    label: '蝉道账号',
                    type: 'input',
                    value: cantaoAccount,
                },
                {
                    id: 4,
                    label: '蝉道密码',
                    type: 'input',
                    inputType: 'password',
                    value: cantaoPassword,
                },
                {
                    id: 5,
                    label: '打开调试',
                    type: 'custom',
                    slotItemName: 'debug',
                },
            ]
        }
    },
    methods: {
        goGitlab() {
            const {
                gitlabUrl,
            } = this.$store.state.setting
            shell.openExternal(`${gitlabUrl}/profile/personal_access_tokens`)
        },
        reset() {
            this.$store.commit('setting/reset')
            this.visible = false
        },
        refresh(){
            this.$store.dispatch('users/getGitlabUserInfo', this)
        },
        debugOpen(){
            remote.getCurrentWindow().webContents.openDevTools()
        },
        editEvent(row) {
            // 获取git根目录
            remote.dialog.showOpenDialog({
                title: '选择文件夹',
                properties: ['openDirectory']
            }).then(result => {
                const { filePaths } = result
                if (filePaths && filePaths.length) {
                    const rootPath = filePaths[0]
                    const { id } = row
                    switch (id) {
                        case 2:
                            this.$store.commit('setting/setGitRootPath', rootPath)
                            break;
                        default:
                            break;
                    }
                }
            }).catch(err => {
                console.log(err)
            })
        },
        async loginCandao() {
            const {
                cantaoUrl,
                cantaoAccount,
                cantaoPassword,
            } = this.$store.state.setting
            if (cantaoUrl && cantaoAccount && cantaoPassword) {
                // getSessionID
                try {
                    // 重新新建Axios 
                    this.$ctx.apiCantao = require('../../library/front-api/cantao').default(this)
                    await this.$ctx.apiCantao.get('/index.php?m=api&f=getSessionID&t=json')
                    // 退出登录
                    await this.$ctx.apiCantao.get('/index.php?m=user&f=logout&t=json')
                    // 登录
                    const { status } = await this.$ctx.apiCantao.post(`/index.php?m=user&f=login&t=json&account=${cantaoAccount}&password=${cantaoPassword}`)
                    if (status === 'success') {
                        this.$message.success('蝉道登录成功')
                    } else {
                        this.$message.error('蝉道登录失败')
                    }
                } catch (error) {
                    this.$message.error(error)
                }

            } else if (cantaoUrl) {
                await this.$ctx.apiCantao.get('/index.php?m=user&f=logout&t=json')
            }
        },
        itemConfirm({ val, item }) {
            const { id } = item
            switch (id) {
                case 0:
                    this.$store.commit('setting/setGitlabUrl', val)
                    // 再重创建aixos实例
                    this.$ctx.apiGitlab = require('../../library/front-api/gitlab').default(this)
                    this.$store.dispatch('users/getGitlabUserInfo', this)
                    break;
                case 1:
                    this.$store.commit('setting/setGitlabToken', val)
                    // 再重创建aixos实例
                    this.$ctx.apiGitlab = require('../../library/front-api/gitlab').default(this)
                    this.$store.dispatch('users/getGitlabUserInfo', this)
                    break;
                case 2:
                    this.$store.commit('setting/setCantaoUrl', val)
                    this.loginCandao()
                    break;
                case 3:
                    this.$store.commit('setting/setCantaoAccount', val)
                    this.loginCandao()
                    break;
                case 4:
                    this.$store.commit('setting/setCantaoPassword', val)
                    this.loginCandao()
                    break;
                default:
                    break;
            }
        },
    }
};
</script>

<style lang="scss" module="s">
.content {
  min-width: 800px;
  .icon {
    font-size: 18px;
    color: #999;
    margin-right: 4px;
    cursor: pointer;
    &:hover {
      color: #59c993;
    }
  }
}
</style>
