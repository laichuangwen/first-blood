<template>
    <div :class="s.content">
        <!-- <el-button type="primary"
            @click="add">添加git仓库</el-button> -->
        <el-form :inline="true"
            @submit.native.prevent="getProjects"
            :model="form">
            <el-form-item label="关键字">
                <el-input v-model="form.search"
                    clearable
                    placeholder="请输入关键字"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary"
                    @click="getProjects">查询</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="projects"
            v-loading="loading"
            :class="s.table"
            border>
            <el-table-column prop="name"
                label="名称"
                width="180">
                <template slot-scope="scope">
                    <el-button :disabled="!!!scope.row.rootPath"
                        type="text"
                        @click="$router.push({
                        name:'git.branch.list',
                        query: {
                            id: scope.row.id,
                            name: scope.row.name,
                            path: scope.row.rootPath
                        }})">{{scope.row.name}}</el-button>
                </template>
            </el-table-column>
            <el-table-column prop="path_with_namespace"
                label="仓库空间&名称"
                width="280">
            </el-table-column>
            <el-table-column prop="rootPath"
                label="本地git根目录"
                width="280">
            </el-table-column>
            <el-table-column prop="http_url_to_repo"
                min-width="280"
                show-overflow-tooltip
                label="仓库地址">
            </el-table-column>
            <el-table-column prop="description"
                min-width="280"
                show-overflow-tooltip
                label="备注">
            </el-table-column>
            <el-table-column fixed="right"
                label="操作"
                width="160">
                <template slot-scope="scope">
                    <el-button type="text"
                        @click="delPath(scope)"
                        size="small">清除根目录</el-button>
                    <el-button type="text"
                        size="small"
                        @click="settingPath(scope)">设置根目录</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { remote } from 'electron'
import { mapState } from 'vuex';
export default {
    data() {
        return {
            form: {
                search: '',
            },
            loading: false,
            projects: [],
        };
    },
    computed: {
        ...mapState('git', ['rootPathList'])
    },
    mounted() {
        this.getProjects()
    },
    methods: {
        async getProjects() {
            this.loading = true
            try {
                const res = await this.$ctx.apiGitlab.get('/api/v4/projects', {
                    params: {
                        search: this.form.search,
                        per_page: 100,
                        membership: true
                    }
                })
                // 列表转换添加本地路径
                this.projects = res.map(item => {
                    const rootPath = this.rootPathList.find(list => list.id === item.id)
                    if (rootPath) {
                        return {
                            ...item,
                            ...rootPath
                        }
                    }
                    return item
                }).sort((x, y) => {
                    // 排序，有地址的在前面
                    let x1 = `${x.rootPath}`.toUpperCase();
                    let x2 = `${y.rootPath}`.toUpperCase();
                    if (x1 < x2) {
                        return -1;
                    }
                    if (x1 > x2) {
                        return 1;
                    }
                    return 0;
                })
                this.loading = false
            } catch (e) {
                this.loading = false
                this.$message.error('获取项目列表失败')
                console.log(e);
            }
        },
        reset() {
            this.form.search = ''
            this.getProjects()
        },
        settingPath({ row }) {
            remote.dialog.showOpenDialog({
                title: '选择文件夹',
                properties: ['openDirectory']
            }).then(result => {
                const { filePaths } = result
                if (filePaths && filePaths.length) {
                    const rootPath = filePaths[0]
                    const { id, name } = row
                    // 新增或者更新
                    this.$store.commit('git/updateRootPathListOne', {
                        id,
                        name,
                        rootPath,
                    })
                    this.getProjects()
                }
            }).catch(err => {
                console.log(err)
            })
        },
        delPath({ row }) {
            this.$store.commit('git/deleteRootPathListOne', row.id)
            this.getProjects()
        },
    }
};
</script>

<style lang="scss" module="s">
.content {
  .table {
    width: 100%;
    margin-top: 8px;
  }
  .op {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
