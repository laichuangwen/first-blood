<template>
    <el-dialog title="新增项目"
        :visible.sync="isShow"
        width="500px">
        <el-form :model="form"
            :rules="rules"
            ref="form"
            label-width="100px">
            <el-form-item label="项目token"
                prop="token">
                <el-input v-model="form.token">
                    <el-button slot="append"
                        @click="search"
                        icon="el-icon-search"></el-button>
                </el-input>
            </el-form-item>
            <el-form-item label="项目id"
                prop="_id">
                <p>{{form._id||'--'}}</p>
            </el-form-item>
            <el-form-item label="项目名称"
                prop="name">
                <p>{{form.name||'--'}}</p>
            </el-form-item>
        </el-form>
        <div slot="footer"
            class="dialog-footer">
            <el-button @click="isShow = false">取消</el-button>
            <el-button type="primary"
                :disabled="!(form._id && form.token && form.name)"
                @click="submit">确定</el-button>
        </div>
    </el-dialog>
</template>
<script>
export default {
    data() {
        return {
            isShow: false,
            form: {
                token: '',
                _id: '',
                name: '',
            },
            project: {},
            rules: {}
        };
    },
    methods: {
        open() {
            this.isShow = true;
            this.$nextTick(() => {
                this.$refs.form.resetFields();
            })
        },
        search() {
            if (!this.form.token) return;
            this.getProjects(this.form.token)
        },
        async getProjects(token) {
            try {
                const { _id, name } = await this.$ctx.apiYapi.get('/api/project/get', {
                    params: {
                        token,
                    }
                })
                this.form._id = _id;
                this.form.name = name;
                console.log('form', this.form);
            } catch (e) {
                this.$message.error('获取项目失败')
            }
        },
        submit() {
            if (this.form._id && this.form.token && this.form.name) {
                this.$emit('success', this.form)
                this.isShow = false;
            } else {
                this.$message.error('请获取项目')
            }
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