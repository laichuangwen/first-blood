<template>
    <div :class="s.item">
        <span>{{ valueString(value)}}</span>
        <el-popover v-model="visible"
            placement="bottom"
            width="200"
            trigger="click"
            @show="show">
            <el-input v-model="inputValue" :type="type"/>
            <div style="text-align: right; margin-top: 12px;">
                <el-button size="mini"
                    type="text"
                    @click="visible = false">
                    取消
                </el-button>
                <el-button type="primary"
                    size="mini"
                    @click="confirm">
                    确定
                </el-button>
            </div>
            <i slot="reference"
                :class="['ewen-iconbianji',s.icon]"></i>
        </el-popover>
    </div>
</template>

<script>
export default {
    name: 'item',
    props: {
        type: {
            type: String,
            default: 'text'
        },
        value: {
            type: [Number, String],
            default: ''
        }
    },
    data() {
        return {
            visible: false,
            inputValue: ''
        };
    },
    methods: {
        valueString(value) {
            if (value === null || value === '' || value === undefined) {
                return '未设置'
            } else if (this.type === 'password') {
                return new Array(`${value}`.length).join('*')
            }
            return value
        },
        show() {
            this.inputValue = this.value
        },
        confirm() {
            this.visible = false
            this.$emit('confirm', this.inputValue)
        },
    }
};
</script>

<style lang="scss" module="s">
.item {
  color: #495060;
  font-size: 14px;
  .icon {
    font-size: 18px;
    color: #999;
    margin-left: 8px;
    cursor: pointer;
    &:hover {
      color: #59c993;
    }
  }
}
</style>
