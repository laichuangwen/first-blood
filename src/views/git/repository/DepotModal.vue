<template>
    <el-dialog :title="type==='add'?'新增git仓库':'编辑git仓库'"
        :visible.sync="isShow"
        width="500px">
        <el-form :model="form"
            :rules="rules"
            ref="form"
            label-width="130px">
            <el-form-item label="仓库名称"
                prop="id">
                <el-select v-model="form.id"
                    filterable
                    placeholder="请选择">
                    <el-option v-for="item in projects"
                        :key="item.value"
                        :label="item.name_with_namespace"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="本地仓库根路径"
                prop="path">
                <div :class="s.wrapP">
                    <el-tooltip class="item"
                        effect="dark"
                        :disabled="!form.path"
                        :content="form.path"
                        placement="top">
                        <p :class="s.path">{{form.path ||'请选择'}} </p>
                    </el-tooltip>
                    <i :class="['ewen-iconbianji',s.icon]"
                        @click="selectPath"></i>
                </div>
            </el-form-item>
        </el-form>
        <div slot="footer"
            class="dialog-footer">
            <el-button @click="isShow = false">取消</el-button>
            <el-button type="primary"
                @click="submit">确定</el-button>
        </div>
    </el-dialog>
</template>
<script>
import { remote } from 'electron'
export default {
    data() {
        return {
            isShow: false,
            projects: [],
            type: 'add',
            row: null,
            form: {
                id: '',
                path: ''
            },
            rules: {
                id: [
                    { required: true, message: '请选择仓库名称', trigger: 'blur' },
                ],
                path: [
                    { required: true, message: '请选择仓库根路径', trigger: 'change' }
                ],
            }
        };
    },
    mounted() {
        this.getProjects();
    },
    methods: {
        async getProjects() {
            try {
                this.projects = await this.$ctx.apiGitlab.get('/api/v4/projects', {
                    params: {
                        per_page: 100,
                        membership: true
                    }
                })
                console.log('projects', this.projects);
            } catch (e) {
                this.$message.error('获取项目列表失败')
            }
        },
        open(row) {
            this.isShow = true;
            this.row = row;
            if (this.row) {
                this.$nextTick(() => {
                    this.$refs.form.clearValidate()
                })
                this.type = 'edit'
                this.row = row;
                this.form = {
                    ...this.row
                }
            } else {
                this.reset();
                this.type = 'add'
            }
        },
        selectPath() {
            // 获取git根目录
            remote.dialog.showOpenDialog({
                title: '选择文件夹',
                properties: ['openDirectory']
            }).then(result => {
                const { filePaths } = result
                if (filePaths && filePaths.length) {
                    const rootPath = filePaths[0]
                    this.form.path = rootPath
                }
            }).catch(err => {
                console.log(err)
            })
        },
        reset() {
            this.form.name = ''
            this.form.path = ''
            this.form.remark = ''
            this.row = null
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },
        submit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.$emit('submit', {
                        type: this.type,
                        row: this.row,
                        form: this.form
                    })
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