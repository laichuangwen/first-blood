<template>
    <div :class="s.content">
        <iframe :class="s.iframe"
            width="100%"
            height="100%"
            :src="$store.state.setting.uiUrl"></iframe>
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
.content {
  width: 100%;
  height: 100%;
  .iframe {
    border-width: 0;
  }
}
</style>
