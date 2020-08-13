<template>
    <el-dialog title="强制push"
        :visible.sync="isShow"
        width="500px">
        <template>
            <p :class="s.tip">
                1. 以下是差异commit列表，请十分确定每一个commit都是本次操作的目标
            </p>
            <p :class="s.tip">
                2. 仅修改了commit信息的提交不会被检索出来
            </p>
            <p :class="s.tip">
                3. 会自动创建一个备份分支，最后的保障
            </p>
            <el-table :data="commits"
                :height="300"
                empty-text="没有差异">
                <el-table-column show-overflow-tooltip
                    prop="author_name"
                    label="作者"
                    width="70" />
                <el-table-column show-overflow-tooltip
                    prop="message"
                    label="提交信息"
                    show-tooltip />
                <el-table-column show-overflow-tooltip
                    prop="date"
                    label="提交日期"
                    width="150"
                    show-tooltip />
                <el-table-column show-overflow-tooltip
                    prop="hash"
                    label="hash"
                    show-tooltip />
            </el-table>
        </template>
        <div slot="footer"
            :class="s.footer">
            <el-checkbox v-model="saveBk">
                保留备份分支
            </el-checkbox>
            <div :class="s.operator">
                <el-button @click="cancel">
                    取消
                </el-button>
                <el-button type="primary"
                    :loading="loading.submit"
                    @click="submit">
                    强制push
                </el-button>
            </div>
        </div>
    </el-dialog>
</template>
<script>
import Git from '../../git.js';
let git
export default {
    data() {
        return {
            isShow: false,
            commits: [],
            branch: null,
            loading: {
                getDiffCommits: false,
                submit: false
            },
            saveBk: true
        };
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            if (this.$route.query.path) {
                console.log(this.$route.query.path);
                git = Git(this, this.$route.query.path)
            }
        },
        open(branch) {
            this.isShow = true;
            this.loading.getDiffCommits = false
            this.loading.submit = false
            this.saveBk = true
            this.branch = branch
            this.getDiffCommits()
        },
        async getDiffCommits() {
            this.loading.getDiffCommits = true
            try {
                // 先获取远程最新代码
                await git.fetch([
                    'origin',
                    this.branch
                ])
                // 对比当前分支和远程分支的差异commit
                const { all: commits } = await git.log([
                    '--cherry-pick',
                    '--no-merges',
                    `${this.branch}...origin/${this.branch}`
                ])
                console.log(commits, this.branch)
                this.commits = commits
            } catch (e) {
                console.warn(e)
            }
            this.loading.getDiffCommits = false
        },
        cancel() {
            this.isShow = false
        },
        async unprotectBranch(id, branch) {
            // docs: https://docs.gitlab.com/ee/api/protected_branches.html#unprotect-repository-branches
            try {
                await this.$ctx.apiGitlab.delete(`/api/v4/projects/${id}/protected_branches/${branch}`)
            } catch (error) {
                // 404 表示没有保护
                if (error.response.status === 404) return
                throw error
            }
        },
        async submit() {
            this.loading.submit = true
            try {
                // 先检出一个备份分支
                const bkBranch = `${this.branch}-${this.$ctx.util.moment().format('YYYY-MM-DD-HH-mm-ss')}`
                const commandOption = [
                    '-b',
                    bkBranch,
                    `origin/${this.branch}`
                ]
                await git.checkout(commandOption)
                // 再切回到目标分支
                await git.checkout(this.branch)
                // 先取消保护
                // docs: https://docs.gitlab.com/ee/api/protected_branches.html#unprotect-repository-branches
                await this.unprotectBranch(this.$route.query.id, this.branch)
                // 然后强制push
                await git.push([
                    'origin',
                    this.branch,
                    '--force'
                ])
                // 再恢复保护
                // docs: https://docs.gitlab.com/ee/api/protected_branches.html#protect-repository-branches
                await this.$ctx.apiGitlab.post(`/api/v4/projects/${this.$route.query.id}/protected_branches`, {
                    name: this.branch,
                    push_access_level: 40,
                    merge_access_level: this.branch === 'dev' ? 30 : 40
                })
                if (!this.saveBk) {
                    // 删除备份分支
                    await git.branch([
                        '-D',
                        bkBranch
                    ])
                }
                this.$message.success('操作成功')
                this.isShow = false
            } catch (e) {
                console.log(e)
            }
            this.loading.submit = false
        }
    },
};
</script>
<style lang="scss" module="s">
.tip {
  color: #80848f;
  margin-bottom: 12px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operator {
  font-size: 0;

  button {
    & + button {
      margin-left: 8px;
    }
  }
}
</style>