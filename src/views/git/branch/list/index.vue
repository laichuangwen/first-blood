<template>
    <div :class="s.git">
        <div ref="filter"
            :class="s.filter">
            <div>
                <label style="margin-right: 12px;">当前分支</label>
                <el-select v-model="branch.current"
                    filterable
                    @change="getCommits">
                    <el-option v-for="item in branch.local"
                        :key="item"
                        :label="item"
                        :value="item" />
                </el-select>
                <el-button type="primary"
                    style="margin-left: 12px;"
                    @click="$router.push({name:'git.branch.cherry-pick',query:{maintainer,path:$route.query.path,branch: branch.current}})">
                    cherry-pick
                </el-button>
                <!-- mac 有问题 -->
                <!-- <el-button v-if="!modal.cherryPick"
                    style="margin-left: 12px;"
                    @click="$refs.batchResetModal.open(commits)">
                    批量撤回
                </el-button> -->
                <el-tooltip v-if="['dev', 'test', 'master', 'beta'].includes(branch.current) && gitlabUserInfo && maintainer"
                    content="一键取消保护分支、强制push、恢复保护分支"
                    placement="bottom">
                    <el-button style="margin-left: 12px;"
                        @click="$refs.forcePushModal.open(branch.current)">
                        强制push
                    </el-button>
                </el-tooltip>
            </div>
            <el-input
                v-model="form.keyword"
                placeholder="commit信息 / hash / 提交人"
                style="width: 200px;" />
        </div>
        <virtual-list :class="s.commits"
            ref="commits"
            :data-key="'hash'"
            :data-sources="filterCommits"
            :data-component="commitItemComponent"
            :keeps="50"
            :estimate-size="50" />
        <commit-modal ref="commitModal"
            @change="changeCommit"></commit-modal>
        <batch-reset-modal @success="revokeCommit"
            ref="batchResetModal"></batch-reset-modal>
        <force-push-modal ref="forcePushModal"></force-push-modal>
    </div>
</template>

<script>
import virtualList from 'vue-virtual-scroll-list'
import CommitModal from './components/CommitModal.vue'
import BatchResetModal from './components/BatchResetModal.vue'
import ForcePushModal from './components/ForcePushModal.vue'
import CommitItem from './components/CommitItem.vue'
import { mapState } from 'vuex'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'
import Git from '../git'
let git;
export default {
    name: 'branch',
    components: {
        virtualList,
        CommitModal,
        BatchResetModal,
        ForcePushModal
    },
    data() {
        return {
            loading: false,
            commits: [],
            branch: {
                all: [],
                branches: {},
                current: '',
                local: []
            },
            form: {
                keyword: ''
            },
            modal: {
                modifyCommit: false,
                cherryPick: false,
                forcePush: false,
                batchReset: false,
                logs: false
            },
            maintainer: false,
            commitItemComponent: CommitItem,
        };
    },
    computed: {
        ...mapState('users', ['gitlabUserInfo']),
        filterCommits() {
            return this.commits.filter(item => item.message.includes(this.form.keyword) || item.hash.includes(this.form.keyword) || item.author_name.includes(this.form.keyword))
        }
    },
    created() {
        this.init()
        // CommitItem事件
        this.$on('changeCommit', (commit) => {
            this.$refs.commitModal.open(commit)
        })
        this.$on('revokeCommit', (commit) => {
            console.log('revokeCommit', commit);
            this.revokeCommit(commit)
        })
        console.log('created');
    },
    methods: {
        init() {
            if (this.$route.query.path) {
                console.log(this.$route.query.path);
                git = Git(this, this.$route.query.path)
                this.getBranches()
                this.getCommits()
                this.getProject(this.$route.query.id)
            }
        },
        // 获取项目信息，看是否是维护者
        async getProject(id) {
            try {
                const data = await this.$ctx.apiGitlab.get(`/api/v4/projects/${id}`)
                this.maintainer = !data.permissions.project_access || data.permissions.project_access.access_level >= 40
                this.$store.commit('git/setMaintainer', this.maintainer)
            } catch (e) {
                this.$message.error('获取项目详情失败')
            }
        },
        // 获取当前分支
        async getBranches() {
            this.branch = await git.branch()
            this.branch.local = this.branch.all.filter(item => !item.startsWith('remotes'))
            console.log('分支信息', this.branch)
        },
        // 获取Commit
        async getCommits() {
            this.loading = true
            const option = [
                `--after=${this.$ctx.util.moment().subtract(6, 'month')
                    .format('YYYY-MM-DD')}`
            ]
            if (this.branch.current) {
                option.push(this.branch.current)
            }
            const commits = await git.log(option)
            this.commits = commits.all
            this.loading = false
            console.log('分支信息commits', this.commits)
        },
        // 更改commit
        async changeCommit({ commit, message }) {
            console.log('changeCommitindexOf', this.commits.indexOf(commit));
            console.log('changeCommitmessage', message);
            // 暂存区要干净
            if (!await git.cleanConfirm()) return
            // 切换当前分支
            await git.checkout(this.branch.current)
            try {
                // 先记录reset掉的commit
                const index = this.commits.indexOf(commit)
                console.log(index);
                const revokeCommits = []
                if (index === 1) {
                    // 第二条时存第一条
                    revokeCommits.push(this.commits[0].hash)
                } else if (index > 1) {
                    // 超过第二条存 第一条和当前选中的上一条，得到一个范围
                    revokeCommits.push(this.commits[index - 1].hash)
                    revokeCommits.push(this.commits[0].hash)
                }
                // reset 到当前分支
                await git.reset([
                    '--hard',
                    commit.hash
                ])
                // 改提交信息
                await git.raw([
                    'commit',
                    '--amend',
                    '-m',
                    message
                ])
                // 再批量cherry-pick回来
                if (revokeCommits.length) {
                    await git.raw([
                        'cherry-pick',
                        revokeCommits.length > 1 ? `${revokeCommits[0]}^..${revokeCommits[1]}` : revokeCommits[0]
                    ])
                }
                this.getCommits()
                this.$message.success('修改成功')
            } catch (e) {
                console.error(e)
            }

        },
        // 撤回commit
        async revokeCommit(commits) {
            if (!Array.isArray(commits)) {
                commits = [commits]
            }
            this.$confirm('此操作会修改你的本地commit记录').then(async () => {
                if (!await git.cleanConfirm()) return
                await git.checkout(this.branch.current)
                const latestCommit = (await git.log([
                    '-n',
                    '1'
                ])).latest

                try {
                    // 先将commits 按合并到分支的顺序排序
                    const sortedCommit = commits.map(commit => ({
                        index: this.commits.indexOf(commit),
                        commit
                    })).sort((a, b) => b.index - a.index)
                    // git reset --hard到最久远commit的上一个commit
                    await git.reset([
                        '--hard',
                        this.commits[sortedCommit[0].index + 1].hash
                    ])
                    // 然后执行git cherry-pick
                    if (sortedCommit[0].index > 0) {
                        await new Promise((resolve, reject) => {
                            // 找到所有commit
                            const allCommitHash = []
                            for (const { hash } of this.commits) {
                                if (hash === sortedCommit[0].commit.hash) {
                                    break
                                } else if (!sortedCommit.find(item => item.commit.hash === hash)) {
                                    allCommitHash.push(hash)
                                }
                            }
                            // 将commit写入文件 解决windows下命令行长度限制
                            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pentakill-revert-cherry-pick-list'))
                            const file = path.join(dir, 'commits')
                            fs.writeFileSync(file, allCommitHash.reverse().join('\n'))
                            const cat = process.platform === 'win32' ? 'type' : 'cat'
                            const command = `${cat} ${file} | git cherry-pick --stdin`
                            const p = exec(command, {
                                cwd: this.$route.query.path,
                                maxBuffer: Infinity
                            })
                            p.stdout.on('data', log => {
                                console.log(log);
                            })
                            p.stderr.on('data', log => {
                                if (log.includes('error')) {
                                    reject(log)
                                } else {
                                    console.warn(log)
                                }
                            })
                            p.on('close', code => {
                                console.log('close', code)
                                resolve()
                            })
                        })
                    }
                    this.getCommits()
                    this.$message.success('撤回成功')
                } catch (e) {
                    await git.raw([
                        'cherry-pick',
                        '--abort'
                    ])
                    await git.reset([
                        '--hard',
                        latestCommit.hash
                    ])
                    this.$notify.error({
                        title: 'git报错，已回滚，请自行解决',
                        message: e.toString(),
                        duration: 0
                    })
                }

            })
        },
    }
};
</script>

<style lang="scss" module="s">
.git {
  overflow: hidden;
  min-width: 880px;
  .rootPath {
    color: #80848f;
    margin-bottom: 12px;
  }

  .filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .commits {
    height: calc(100vh - 120px);
    overflow-y: scroll;
    border: 1px solid #e1e6eb;
    margin-top: 32px;
  }

  .logs {
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
  }
}
</style>
