<template>
    <div :class="s.content">
        <div :class="s.leftMenu">
            <router-link v-for="(item,index) in list"
                :class="[s.nav,$route.path.includes(item.to.path)?s.active:'']"
                :key="index"
                :to="item.to">
                <i :class="[item.icon,s.icon]"></i>
                <p>{{item.title}}</p>
            </router-link>
            <div :class="s.bottom">
                <slot name="bottom"></slot>
            </div>
        </div>
        <div :class="s.page">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        list: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
        };
    }
}
</script>

<style lang="scss" module="s">
.content {
  height: 100%;
  display: flex;
}

.leftMenu {
  position: relative;
  width: 64px;
  padding: 36px 0;
  background: #0bb27a;
  position: relative;
  z-index: 100;
  .nav {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;
    &.active {
      &::before {
        content: '';
        background: white;
        width: 2px;
        height: 80%;
        position: absolute;
        left: 0;
        top: 10%;
      }
    }
    .icon {
      font-size: 18px;
      color: #fff;
    }
    p {
      color: #fff;
      margin-top: 8px;
      font-size: 12px;
    }
    &:hover {
      opacity: 0.7;
    }
  }
  .bottom {
    position: absolute;
    left: 0;
    bottom: 0;
  }
}
.page {
  flex: 1;
  overflow: auto;
  .breadcrumb {
    margin-bottom: 32px;
  }
}
</style>
