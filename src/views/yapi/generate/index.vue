<template>
    <div :class="s.view">
        <div :class="s.top">
            <div :class="s.back">
                <el-button>返回</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
        };
    },
};
</script>

<style lang="scss" module="s">
.view {
  position: relative;
}
.top {
  flex: 1 0 auto;
  display: flex;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  min-width: 1280px;
  height: 65px;
  max-height: 65px;
  box-shadow: 0 3px 8px 0 rgba(116, 129, 141, 0.1);
  border-bottom: 1px solid #d4dadf;
  background-color: #fff;
  z-index: 20;
  .back{
      position: absolute;
      left: 100px;
      top: 50%;
      margin-top: -16px;
  }
}
</style>
