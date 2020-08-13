<template>
    <el-dialog title="修改commit信息"
        :visible.sync="isShow"
        width="500px">
        <el-form :model="form"
            :rules="rules"
            ref="form"
            label-width="100px">
            <el-form-item label="commit信息"
                prop="message">
                <el-input v-model.trim="form.message"
                    style="width: 300px;"
                    placeholder="须遵循commit要求"
                    type="textarea"
                    :rows="3" />
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
export default {
    data() {
        return {
            isShow: false,
            commit: null,
            form: {
                message: ''
            },
            rules: {
                message: [
                    { required: true, message: '请输入新的commit信息', trigger: 'blur' },
                ],
            }
        };
    },
    methods: {
        open(commit) {
            this.isShow = true;
            this.commit = commit
            const { message } = this.commit
            console.log('message', message);
            this.form.message = message
            this.$nextTick(() => {
                this.$refs.form.clearValidate()
            })
        },
        submit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.$emit('change', {
                        commit: this.commit,
                        message: this.form.message
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