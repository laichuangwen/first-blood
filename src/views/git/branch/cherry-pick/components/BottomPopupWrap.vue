<template>
    <transition name="bottom-popup">
        <div
            v-show="value"
            :class="s.popupWrap"
            :style="_style">
            <div :class="s.popupContent">
                <slot />
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'BottomPopupWrap',
    props: {
        // 显示隐藏
        value: {
            type: Boolean,
            default: false
        },
        // 弹层高度，规范是固定70px
        height: {
            type: [
                String,
                Number
            ],
            default: 70
        },
        // 左边剧
        paddingLeft: {
            type: [
                String,
                Number
            ],
            default: 0
        }
    },
    computed: {
        _style() {
            return {
                height: `${this.height}px`,
                paddingLeft: `${this.paddingLeft}px`
            }
        }
    }
}
</script>

<style lang="scss" module="s">
.popupWrap {
    bottom: 0;
    position: fixed;
    width: 100%;
    left: 0;
    z-index: 20;

    .popupContent {
        height: 100%;
        width: 100%;
        background-color: #ecf5ff;
        // box-shadow: 0 -6px 12px -3px rgba(225, 230, 235, 0.5);
    }
}
</style>

<style lang="scss">
.bottom-popup-enter-active {
    animation: BottomEnter 0.5s 0s 1 both;
}

.bottom-popup-leave-active {
    animation: BottomLeave 0.5s 0s 1 both;
}

@keyframes BottomEnter {
    from {
        transform: translate3d(0, 100%, 0);
    }

    to {
        transform: none;
    }
}

@keyframes BottomLeave {
    from {
        transform: none;
    }

    99% {
        display: block;
    }

    to {
        transform: translate3d(0, 100%, 0);
        display: none;
    }
}
</style>
