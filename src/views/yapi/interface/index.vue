<template>
    <div :class="s.content">
        <el-form :inline="true"
            :model="form">
            <el-form-item label="关键字">
                <el-input v-model="form.search"
                    clearable
                    placeholder="请输入关键字"></el-input>
            </el-form-item>
        </el-form>
        <el-table :data="filterList"
            v-loading="loading"
            :class="s.table"
            border>
            <el-table-column prop="_id"
                width="100"
                label="id">
            </el-table-column>
            <el-table-column prop="title"
                label="接口名称"
                width="250">
                <!-- <template slot-scope="scope">
                    <el-button type="text"
                        @click="$router.push({
                        name:'yapi.generate',
                        query: {
                            ...scope.row
                        }})">{{scope.row.title}}</el-button>
                </template> -->
            </el-table-column>
            <el-table-column prop="path"
                label="path">
            </el-table-column>
            <el-table-column prop="method"
                label="method">
            </el-table-column>
            <el-table-column fixed="right"
                label="操作"
                width="80">
                <template slot-scope="scope">
                    <el-button type="text"
                        @click="generate(scope)"
                        size="small">生成</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                search: '',
            },
            loading: false,
            list: [],
        };
    },
    computed: {
        filterList() {
            if (!this.list.length) return [];
            return this.list.filter(item =>
                item.title.includes(this.form.search) || item.path.includes(this.form.search) ||
                `${item._id}`.includes(this.form.search))
        },
    },
    mounted() {
        this.getList();
    },
    methods: {
        async getList() {
            try {
                this.loading = true;
                const { _id, token } = this.$route.query
                const res = await this.$ctx.apiYapi.get('/api/interface/list', {
                    params: {
                        token,
                        project_id: _id,
                        page: 1,
                        limit: 1000,
                    }
                })
                this.loading = false;
                console.log(res);
                this.list = res.list;
            } catch (e) {
                this.$message.error('获取项目失败')
            }
        },
        reset() {
            this.form.search = ''
        },
        async generate({ row }) {
            const { token } = this.$route.query
            const res = await this.$ctx.apiYapi.get('/api/interface/get', {
                params: {
                    token,
                    id: row._id
                }
            })
            console.log(res);
            const body = JSON.parse(res.req_body_other)
            console.log(body.properties);

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
