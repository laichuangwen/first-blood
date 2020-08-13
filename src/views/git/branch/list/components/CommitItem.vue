<template>
    <div :class="s.commit">
        <p :class="s.message"
            :title="source.message">
            {{ source.message }}
        </p>
        <p>
            <span :class="s.author_name">{{ source.author_name }}</span>
            <span :class="s.date">{{ source.date|formatDate}}</span>
        </p>
        <el-button-group :class="s.btns">
            <el-tooltip content="复制hash"
                placement="top">
                <el-button size="mini"
                    type="cancel"
                    style="width: 65px;"
                    @click="copy(source.hash)">
                    {{ source.hash.substr(0, 6) }}
                </el-button>
            </el-tooltip>
            <el-tooltip content="修改commit信息"
                placement="top">
                <el-button size="mini"
                    type="cancel"
                    @click="changeCommit">
                    <i :class="['ewen-iconbianji',s.icon]"></i>
                </el-button>
            </el-tooltip>
            <el-tooltip content="撤回commit"
                placement="top">
                <el-button size="mini"
                    type="cancel"
                    @click="revokeCommit">
                    <i :class="['ewen-iconshanchu',s.icon]"></i>
                </el-button>
            </el-tooltip>
        </el-button-group>
    </div>
</template>

<script>
const {
    util: { moment, copy }
} = window.Vue.$ctx
export default {
    name: 'commit-item',
    props: {
        index: { // index of current item
            type: Number
        },
        source: { // here is: {uid: 'unique_1', text: 'abc'}
            type: Object,
            default: () => { }
        }
    },
    filters: {
        formatDate(val) {
            if (val) {
                return moment(val).format('YYYY-MM-DD HH:mm:ss')
            }
            return ''
        }
    },
    methods: {
        dispatch(componentName, eventName, ...rest) {
            let parent = this.$parent || this.$root
            let name = parent.$options.name
            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent
                if (parent) {
                    name = parent.$options.name
                }
            }
            if (parent) {
                parent.$emit.apply(parent, [eventName].concat(rest))
            }
        },
        changeCommit() {
            // 注意父组件name
            // todo例子 https://github.com/tangbc/vue-virtual-scroll-list/blob/master/example/src/views/keep-state/Main.vue
            this.dispatch('branch', 'changeCommit', this.source)
        },
        revokeCommit() {
            // 注意父组件name
            // todo例子 https://github.com/tangbc/vue-virtual-scroll-list/blob/master/example/src/views/keep-state/Main.vue
            this.dispatch('branch', 'revokeCommit', this.source)
        },
        copy(val) {
            copy(val)
            this.$message.success('复制成功')
        }
    }
}
</script>

<style lang="scss" module="s">
.commit {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 50px;
  line-height: 1.5;
  padding: 0 12px;
  position: relative;

  &:hover {
    background: #f8f8f9;
  }

  .message {
    font-weight: bold;
    font-size: 15px;
    max-width: 650px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .author_name {
    font-size: 14px;
    cursor: pointer;
    margin-right: 4px;
  }

  .btns {
    position: absolute;
    right: 16px;
    top: 50%;
    bottom: 0;
    margin: auto;
    transform: translateY(-50%);

    .icon {
      font-size: 12px;
      color: inherit;
    }
  }
}
</style>
