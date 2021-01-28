<template>
    <el-dialog title="生成表头"
        :visible.sync="isShow"
        width="500px">
        <p :class="s.tip">粘贴原型表头字符串->生成表头信息->生成代码并自动复制到粘贴板</p>
        <el-form :model="form"
            ref="form"
            label-width="100px">
            <el-form-item label="原型表头"
                prop="str">
                <el-input v-model="form.str"
                    type="textarea"
                    :rows="2">
                </el-input>
            </el-form-item>
            <el-form-item v-if="uiList.length"
                label="表头信息">
                <p>{{uiList}}</p>
            </el-form-item>
        </el-form>
        <div slot="footer"
            class="dialog-footer">
            <el-button @click="isShow = false">取消</el-button>
            <el-button type="primary"
                :disabled="!uiList.length"
                @click="submit">生成columns</el-button>
        </div>
    </el-dialog>
</template>
<script>
export default {
    data() {
        return {
            isShow: false,
            form: {
                str: '',
            },
            list: [],
        };
    },
    computed: {
        uiList() {
            if (!this.form.str) return [];
            return Array.from(new Set(this.form.str.split('\n'))).filter(item => item)
        }
    },
    methods: {
        open(row) {
            this.isShow = true;
            this.form.str = '';
            const { children } = row;
            const list = children.map(item => ({ key: item.name, label: item.remark }))
            this.list = list;
        },
        submit() {
            // 原型表表头
            let UILabelList = Array.from(new Set(this.form.str.split('\n'))).filter(item => item);
            const list = UILabelList.map(item => {
                const row = this.list.find(ls => ls.label === item);
                if (row) {
                    return {
                        label: item,
                        property: row.key,
                    }
                }
                return {
                    label: item,
                    property: 'unknown',
                }
            })
            const tableHeader = list.map(item => `{\nlabel:"${item.label}",\nproperty:"${item.property}"\n}`).join(',\n')
            this.$ctx.util.copy(`[\n${tableHeader}]\n`)
            this.$message.success('成功复制到粘贴板');
            this.isShow = false;
        },
    },
};
</script>
<style lang="scss" module="s">
.tip {
  margin-bottom: 24px;
  text-align: center;
  color: #0bb27a;
}
</style>