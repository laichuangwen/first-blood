<template>
    <div v-show="show"
        ref="logs"
        :class="s.logs">
        <pre :key="index"
            v-for="(item,index) in logs"
            v-html="getLogText(item)" />
        </div>
</template>

<script>
import AU from 'ansi_up'
const ansi_up = new AU()
const {
    util: { lodash: { cloneDeep, difference } }
} = window.Vue.$ctx
export default {
    props: {
        logs: {
            type: Array,
            default() {
                return []
            }
        },
        value: Boolean
    },
    data() {
        return {
            showLogs: cloneDeep(this.logs)
        }
    },
    computed: {
        show: {
            get() {
                return this.value
            },
            set(val) {
                this.$emit('input', val)
            }
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.scrollToBottom()
            }
        },
        logs(newVal, oldVal) {
            const diff = difference(newVal, oldVal)

            if (newVal.length - diff.length !== oldVal.length) {
                this.showLogs = cloneDeep(newVal)
            } else {
                const el = this.$refs.logs
                const needScrollBottom = el.scrollTop + el.offsetHeight >= el.scrollHeight

                this.showLogs.push(...diff)

                if (needScrollBottom) {
                    this.scrollToBottom()
                }
            }
        }
    },
    methods: {
        getLogText(log) {
            return ansi_up.ansi_to_html(log)
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const el = this.$refs.logs
                el.scrollTop = el.scrollHeight
            })
        }
    }
}
</script>

<style lang="scss" module="s">
.logs {
  position: fixed;
  top: 68px;
  height: calc(100% - 68px);
  left: 64px;
  width: calc(100% - 64px);
  background: rgba(0, 0, 0, 0.8);
  z-index: 100;
  color: white;
  overflow: auto;
  padding: 16px;

  pre {
    line-height: 1.5;
  }

  .scrollToBottom {
    position: absolute;
    right: 24px;
    top: 24px;
    cursor: pointer;

    font-size: 25px;

    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
    }

    &:hover {
      background: white;

      svg {
        color: black;
      }
    }
  }
}
</style>
