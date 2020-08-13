<template>
    <bottom-popup-wrap :value="true"
        :padding-left="64"
        :height="60">
        <div :class="s.footer">
            <el-button type="primary"
                @click="$emit('copy', true)">
                复制cherry-pick指令
            </el-button>
            <el-tooltip
                content="本地cherry-pick需要自己push"
                placement="top">
                <el-button type="primary"
                    :loading="loading"
                    @click="$emit('submit', false)">
                    本地cherry-pick
                </el-button>
            </el-tooltip>
            <el-tooltip v-if="maintainer"
                content="cherry-pick并push并run pipeline"
                placement="top">
                <el-button type="primary"
                    :disabled="loading"
                    @click="$emit('submit', true)">
                    一键发布
                </el-button>
            </el-tooltip>
            <el-button type="cancel"
                @click="$emit('cancel')">
                返回
            </el-button>
        </div>
    </bottom-popup-wrap>
</template>

<script>
import bottomPopupWrap from './BottomPopupWrap.vue';
export default {
    components: {
        bottomPopupWrap
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        maintainer: {
            type: Boolean,
            default: false,
        }
    },
    methods: {}
}
</script>

<style lang="scss" module="s">
.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
