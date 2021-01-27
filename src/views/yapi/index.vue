<template>
    <div :class="s.view">
        <router-view></router-view>
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
  padding: 16px 32px 32px;
}
</style>
