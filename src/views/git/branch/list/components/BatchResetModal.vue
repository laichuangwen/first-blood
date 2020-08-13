<template>
    <el-dialog title="批量撤回commit"
        :visible.sync="isShow"
        width="500px">
        <el-form :model="form"
            :rules="rules"
            ref="form"
            label-width="100px">
            <el-form-item label="commit信息"
                prop="commits">
                <el-input v-model="form.commits"
                    type="textarea"
                    placeholder="输入hash前几位即可，回车分隔"
                    :rows="5" />
            </el-form-item>
        </el-form>
        <el-table v-if="diff.commits.length"
            :data="diff.commits"
            :height="200">
            <el-table-column show-overflow-tooltip
                prop="author_name"
                label="作者"
                width="70" />
            <el-table-column show-overflow-tooltip
                prop="message"
                label="提交信息" />
            <el-table-column show-overflow-tooltip
                prop="date"
                label="提交日期"
                width="150" />
            <el-table-column show-overflow-tooltip
                prop="hash"
                label="hash"
                width="100" />
        </el-table>
        <div slot="footer"
            class="dialog-footer">
            <el-button @click="isShow = false">取消</el-button>
            <el-button type="primary"
                @click="submit">确定</el-button>
        </div>
    </el-dialog>
</template>
<script>
export default {
    data() {
        return {
            isShow: false,
            commits: [],
            form: {
                commits: ''
            },
            rules: {
                commits: [
                    {
                        required: true,
                        message: '请输入commit'
                    },
                    {
                        validator: (rule, value, callback) => {
                            if (this.diff.errors.length) {
                                callback(new Error(`以下hash不存在，请检查：${this.diff.errors.join('、')}`))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    }
                ]
            },
        };
    },
    computed: {
        diff() {
            const commits = []
            const errors = []
            this.form.commits.split('\n').forEach(hash => {
                hash = hash.trim()
                if (hash) {
                    const commit = this.commits.find(item => item.hash.startsWith(hash))
                    if (commit) {
                        commits.push(commit)
                    } else {
                        errors.push(hash)
                    }
                }
            })
            return { commits, errors }
        }
    },
    methods: {
        open(commits) {
            this.isShow = true
            this.form.commits = ''
            this.commits = commits
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },
        submit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.$emit('success', this.diff.commits)
                    this.isShow = false
                }
            })
        },
    },
};
</script>
<style lang="scss" module="s">
.wrapP {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.path {
  max-width: 300px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}
.icon {
  font-size: 18px;
  color: #0bb27a;
  cursor: pointer;
  margin-left: 4px;
}
</style>