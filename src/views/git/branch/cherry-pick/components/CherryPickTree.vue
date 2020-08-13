<template>
    <el-tree ref="tree"
        show-checkbox
        :data="data"
        :class="s.tree"
        :props="props"
        node-key="hash">
        <div slot-scope="{ node, data }"
            :class="s.treeNode">
            <template v-if="data.isExp">
                <el-row  style="width:100%">
                    <el-col :span="8">
                        <p :class="s.text">{{data.message}}</p>
                    </el-col>
                    <el-col :span="4">
                        <p :class="s.text">{{data.author_name}}</p>
                    </el-col>
                    <el-col :span="4">
                        <el-tooltip :content="data.author_email"
                            placement="top">
                            <p :class="s.text">{{data.author_email}}</p>
                        </el-tooltip>
                        <p :class="s.text"
                            :title="data.author_email">{{data.author_email}}</p>
                    </el-col>
                    <el-col :span="4">
                        <p :class="s.text"> {{ dateFormat(data.date) }}</p>
                    </el-col>
                    <el-col :span="4">
                        <el-tooltip content="复制commit hash"
                            placement="top">
                            <div :class="s.hash"
                                @click="copyHash(data.hash)">
                                {{ data.hash.substring(0, 8) }}
                            </div>
                        </el-tooltip>
                    </el-col>
                </el-row>
            </template>
            <template v-else>
                <el-row  style="width:100%">
                    <el-col :span="4">
                        <p :class="s.text">{{data.name}}</p>
                    </el-col>
                    <el-col :span="2">
                        <p :class="s.text">{{data.num}}</p>
                    </el-col>
                    <el-col :span="4">
                        <p :class="s.text">{{data.begin}}</p>
                    </el-col>
                    <el-col :span="4">
                        <p :class="s.text">{{data.end}}</p>
                    </el-col>
                    <el-col :span="10">
                        <p :class="s.text">{{data.desc}}</p>
                    </el-col>
                </el-row>
            </template>
        </div>
    </el-tree>
</template>

<script>
export default {
    props: {
        data: Array
    },
    data() {
        return {
            props: {
                children: 'children'
            }
        }
    },
    methods: {
        getCheckedNodes(...args) {
            return this.$refs.tree.getCheckedNodes(...args)
        },
        setChecked(...args) {
            return this.$refs.tree.setChecked(...args)
        },
        dateFormat(val) {
            return this.$ctx.util.moment(val).format('YYYY-MM-DD HH:mm:ss')
        },
        copyHash(hash) {
            this.$ctx.util.copy(hash)
            this.$message.success('复制成功')
        }
    }
}
</script>

<style lang="scss" module="s">
.tree {
  :global {
    .el-tree-node__content {
      height: auto;
    }
  }
  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .treeNode {
    display: flex;
    width: 100%;
    height: 40px;
    line-height: 40px;

    & > * {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .hash {
      cursor: pointer;

      &:hover {
        color: #59c993;
      }
    }
  }
}
</style>
